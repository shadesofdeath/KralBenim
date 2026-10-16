#!/usr/bin/env python3
"""Find and download freely licensed photos / video clips for studio "photo" shots.

Sources (no API key needed): Wikimedia Commons (public domain, CC0, CC BY, CC BY-SA).
Optional: Pexels photos + videos when PEXELS_API_KEY is set (Pexels licence, no attribution required).

  python tools/media.py search "flamingo flock" --dir videos/2026-10-17/media      # candidates + contact sheet
  python tools/media.py get commons:File:Flamingos_Laguna_Colorada.jpg --dir videos/2026-10-17/media --name flamingo
  python tools/media.py get pexels-video:123456 --dir ... --name surf

`search` writes <dir>/candidates.jpg (numbered thumbnails) and candidates.json: look at the sheet,
pick the image that shows EXACTLY the scene's "visual", then `get` it. `get` saves <name>.jpg/.mp4
plus <name>.json with the credit line; put that credit into the scene's params.credit.
The YouTube description gets every credit automatically (tools/upload.py).
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

UA = "DusunBakalimBot/1.0 (YouTube education channel; contact via repository)"
FREE = re.compile(r"^(public domain|pd|cc0|cc[- ]by(-sa)?[- ]?\d(\.\d)?.*)$", re.I)


def fetch(url, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def commons_search(query, limit=12):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": f"{query} filetype:bitmap", "gsrlimit": limit * 2, "prop": "imageinfo",
        "iiprop": "url|extmetadata|size", "iiurlwidth": 2400})
    data = json.loads(fetch("https://commons.wikimedia.org/w/api.php?" + q))
    out = []
    for p in sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        ii = (p.get("imageinfo") or [{}])[0]
        md = ii.get("extmetadata", {})
        lic = strip_html(md.get("LicenseShortName", {}).get("value", ""))
        if not FREE.match(lic) or ii.get("width", 0) < 1200:
            continue
        artist = strip_html(md.get("Artist", {}).get("value", "")) or "Bilinmeyen"
        out.append({"id": "commons:" + p["title"].replace(" ", "_"), "thumb": ii.get("thumburl"), "url": ii.get("thumburl") or ii.get("url"),
                    "kind": "image", "w": ii.get("width"), "h": ii.get("height"),
                    "credit": f"Foto: {artist[:60]} / Wikimedia Commons ({lic})"})
        if len(out) >= limit:
            break
    return out


def pexels_search(query, limit=8):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    h = {"Authorization": key}
    out = []
    q = urllib.parse.urlencode({"query": query, "per_page": limit, "orientation": "portrait"})
    for ph in json.loads(fetch("https://api.pexels.com/v1/search?" + q, h)).get("photos", []):
        out.append({"id": f"pexels:{ph['id']}", "thumb": ph["src"]["medium"], "url": ph["src"]["original"], "kind": "image",
                    "credit": f"Foto: {ph['photographer']} / Pexels"})
    for v in json.loads(fetch("https://api.pexels.com/videos/search?" + q, h)).get("videos", []):
        files = sorted((f for f in v["video_files"] if f.get("height")), key=lambda f: -f["height"])
        best = next((f for f in files if f["height"] <= 2160), files[0] if files else None)
        if best:
            out.append({"id": f"pexels-video:{v['id']}", "thumb": v["image"], "url": best["link"], "kind": "video",
                        "credit": f"Video: {v['user']['name']} / Pexels"})
    return out


def search(query, d):
    d.mkdir(parents=True, exist_ok=True)
    cands = commons_search(query) + pexels_search(query)
    if not cands:
        sys.exit("no freely licensed results; try another (English) query")
    tdir = d / ".thumbs"
    tdir.mkdir(exist_ok=True)
    for i, c in enumerate(cands):
        (tdir / f"{i:02d}.jpg").write_bytes(fetch(c["thumb"]))
    # numbered contact sheet
    args = []
    for i in range(len(cands)):
        args += ["-i", str(tdir / f"{i:02d}.jpg")]
    flt = ";".join(f"[{i}:v]scale=360:360:force_original_aspect_ratio=increase,crop=360:360,"
                   f"drawtext=text='{i}':x=12:y=8:fontsize=44:fontcolor=white:box=1:boxcolor=black@0.6[v{i}]" for i in range(len(cands)))
    cols = 4
    rows = -(-len(cands) // cols)
    layout = "|".join(f"{(i % cols) * 360}_{(i // cols) * 360}" for i in range(len(cands)))
    flt += ";" + "".join(f"[v{i}]" for i in range(len(cands))) + f"xstack=inputs={len(cands)}:layout={layout}:fill=black[o]"
    sheet = d / "candidates.jpg"
    if len(cands) == 1:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args, "-vf", flt.split(";")[0].replace("[0:v]", "").replace("[v0]", ""), str(sheet)], check=True)
    else:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args, "-filter_complex", flt, "-map", "[o]", "-frames:v", "1", str(sheet)], check=True)
    (d / "candidates.json").write_text(json.dumps(cands, ensure_ascii=False, indent=1))
    for i, c in enumerate(cands):
        print(f"{i:2d}  {c['kind']:5s} {c['id']}\n     {c['credit']}")
    print(f"\ncontact sheet: {sheet}")


def get(ident, d, name):
    d.mkdir(parents=True, exist_ok=True)
    cands = json.loads((d / "candidates.json").read_text()) if (d / "candidates.json").exists() else []
    c = next((c for c in cands if c["id"] == ident), None)
    if c is None and ident.isdigit() and cands:
        c = cands[int(ident)]
    if c is None and ident.startswith("commons:"):
        title = ident.split(":", 1)[1]
        c = next((x for x in commons_search(title.replace("File:", "").rsplit(".", 1)[0], 20) if x["id"] == ident), None)
    if c is None:
        sys.exit(f"unknown media id {ident}: run `search` first")
    ext = ".mp4" if c["kind"] == "video" else ".jpg"
    raw = d / f"{name}.download"
    raw.write_bytes(fetch(c["url"]))
    out = d / f"{name}{ext}"
    if c["kind"] == "video":   # normalise: H.264, max 2160 px tall, no audio, max 20 s
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-t", "20", "-an", "-vf", "scale=-2:'min(2160,ih)'",
                        "-c:v", "libx264", "-crf", "18", "-preset", "medium", str(out)], check=True)
    else:                      # normalise: JPEG, long side <= 2400 px (keeps the repo small)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-vf",
                        "scale='if(gt(iw,ih),min(2400,iw),-2)':'if(gt(iw,ih),-2,min(2400,ih))'", "-q:v", "3", str(out)], check=True)
    raw.unlink()
    (d / f"{name}.json").write_text(json.dumps({"id": c["id"], "credit": c["credit"]}, ensure_ascii=False, indent=1))
    print(f"{out}\ncredit: {c['credit']}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search"); s.add_argument("query"); s.add_argument("--dir", required=True)
    g = sub.add_parser("get"); g.add_argument("id"); g.add_argument("--dir", required=True); g.add_argument("--name", required=True)
    a = ap.parse_args()
    if a.cmd == "search":
        search(a.query, Path(a.dir))
    else:
        get(a.id, Path(a.dir), a.name)


if __name__ == "__main__":
    main()
