#!/usr/bin/env python3
"""Shorts pipeline: script.json -> out/video.mp4

  python build.py script.json                 # full video
  python build.py script.json --scenes 3      # only the first 3 scenes (test)
  python build.py script.json --still 12.5    # save a single frame as PNG
  python build.py script.json --cover          # only the thumbnail (out/video.jpg)
"""
import argparse
import asyncio
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "scenes" / "index.html"
STUDIO = ROOT / "scenes" / "studio" / "index.html"   # "engine": "studio" (full-bleed 2D/3D shots)
FPS = 30
SIZES = {"short": (1080, 1920), "long": (1920, 1080)}
TAIL = 0.8  # hold after the last word (s)
STUDIO_TAIL = 1.2  # studio videos end on a complete sentence and let the last shot breathe
PUNCT = ".,;:!?…\"'"


# ---------------------------------------------------------------- TTS

def tts_edge(text, cfg, mp3):
    import edge_tts

    async def run():
        comm = edge_tts.Communicate(
            text, cfg.get("voice", "tr-TR-AhmetNeural"), rate=cfg.get("rate", "+0%"),
            boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
        words = []
        with open(mp3, "wb") as f:
            async for ch in comm.stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    s = ch["offset"] / 1e7
                    words.append({"text": ch["text"], "start": s, "end": s + ch["duration"] / 1e7})
        return words

    return asyncio.run(run())


def _eleven_chunk(text, cfg, key, voice):
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": cfg.get("model", "eleven_multilingual_v2"),
                         **({"voice_settings": cfg["settings"]} if cfg.get("settings") else {})}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < 2:
                time.sleep(10 * (attempt + 1))
                continue
            sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:500]}")


def split_text(text, limit):
    """Split at sentence ends into chunks of at most `limit` chars."""
    sentences = re.findall(r"[^.!?]+[.!?]*\s*", text)
    chunks, cur = [], ""
    for snt in sentences:
        if cur and len(cur) + len(snt) > limit:
            chunks.append(cur)
            cur = ""
        cur += snt
    if cur:
        chunks.append(cur)
    return chunks


def tts_elevenlabs(text, cfg, mp3):
    key = os.environ.get("ELEVENLABS_API_KEY")
    voice = cfg.get("voice_id") or os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not voice:
        sys.exit("ELEVENLABS_API_KEY and tts.voice_id (or ELEVENLABS_VOICE_ID) are required")
    # long scripts are synthesized in pieces (per-request character limits) and concatenated
    parts, words, offset = [], [], 0.0
    for n, chunk in enumerate(split_text(text, cfg.get("chunk_chars", 2500))):
        res = _eleven_chunk(chunk.strip(), cfg, key, voice)
        part = Path(mp3).with_name(f"part{n:02d}.mp3")
        part.write_bytes(base64.b64decode(res["audio_base64"]))
        al = res["alignment"]
        chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
        i = 0
        while i < len(chars):
            if chars[i].isspace():
                i += 1
                continue
            j = i
            while j < len(chars) and not chars[j].isspace():
                j += 1
            words.append({"text": "".join(chars[i:j]).strip(PUNCT), "start": offset + st[i], "end": offset + en[j - 1]})
            i = j
        offset += audio_duration(part)
        parts.append(part)
    if len(parts) == 1:
        parts[0].replace(mp3)
    else:
        lst = Path(mp3).with_name("parts.txt")
        lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                        "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)], check=True)
    return words


def locate(text, words):
    """Attach the char offset of each spoken word in the source text."""
    cur = 0
    for w in words:
        i = text.find(w["text"], cur)
        if i < 0:
            i = text.casefold().find(w["text"].casefold(), cur)
        w["pos"] = i if i >= 0 else cur
        cur = max(cur, w["pos"] + len(w["text"]))
    return [w for w in words if w["text"]]


def synthesize(text, cfg, work):
    """Returns (mp3 path, words). Cached by text+tts config."""
    key = hashlib.sha1(json.dumps([text, cfg], sort_keys=True).encode()).hexdigest()
    mp3, wj = work / "audio.mp3", work / "words.json"
    if mp3.exists() and wj.exists():
        cached = json.loads(wj.read_text())
        if cached.get("key") == key:
            return mp3, cached["words"]
    provider = cfg.get("provider", "edge")
    words = locate(text, {"edge": tts_edge, "elevenlabs": tts_elevenlabs}[provider](text, cfg, mp3))
    wj.write_text(json.dumps({"key": key, "words": words}, ensure_ascii=False, indent=1))
    return mp3, words


def estimate_words(text):
    """Rough word timings (~Turkish narration pace) for drafts and previews without TTS."""
    words, t = [], 0.2
    for m in re.finditer(r"\S+", text):
        tok = m.group(0)
        d = 0.10 + 0.05 * len(tok.strip(PUNCT))
        words.append({"text": tok.strip(PUNCT), "start": t, "end": t + d, "pos": m.start()})
        t += d + 0.04 + (0.35 if tok[-1] in ".?!" else 0.15 if tok[-1] in ",:;" else 0)
    return words, t


def audio_duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", str(path)])
    return float(out)


# ---------------------------------------------------------------- timeline

def build_timeline(script, text, ranges, words, duration):
    scenes = script["scenes"]
    # display text of a word = source text up to the next word (keeps punctuation)
    for k, w in enumerate(words):
        nxt = words[k + 1]["pos"] if k + 1 < len(words) else len(text)
        w["scene"] = next(i for i, (a, b) in enumerate(ranges) if w["pos"] < b or i == len(ranges) - 1)
        w["disp"] = text[w["pos"]:min(nxt, ranges[w["scene"]][1])].strip()

    per = [[w for w in words if w["scene"] == i] for i in range(len(scenes))]
    for i, ws in enumerate(per):
        if not ws:
            sys.exit(f"scene {i} has no word timings")

    # scene cut = middle of the pause between scenes
    starts = [0.0] + [(per[i - 1][-1]["end"] + per[i][0]["start"]) / 2 for i in range(1, len(per))]
    ends = starts[1:] + [duration]

    out_scenes, captions = [], []
    for i, sc in enumerate(scenes):
        ws = per[i]
        cues = {}
        for name, needle in sc.get("cues", {}).items():
            hit = next((w for w in ws if needle.casefold() in w["disp"].casefold()), None)
            if hit:
                cues[name] = hit["start"]
            else:
                print(f"warning: cue '{needle}' not found in scene {i}", file=sys.stderr)
        out_scenes.append({"start": starts[i], "end": ends[i], "type": sc["type"], "chapter": sc.get("chapter"),
                           "title": sc.get("title", {}), "tags": sc.get("tags", []),
                           "params": sc.get("params", {}), "cues": cues,
                           **{k: sc[k] for k in ("mascot", "art", "transition") if k in sc}})

        # captions: short phrases, broken at punctuation or ~5 words / 30 chars
        # (studio: punchier 1-3 word groups)
        studio = script.get("engine") == "studio"
        max_words, max_chars = (3, 16) if studio else (4, 24)
        chunk, chunks = [], []
        for w in ws:
            chunk.append(w)
            txt = " ".join(c["disp"] for c in chunk)
            if (w["disp"][-1] in ".?!:;" or (w["disp"][-1] == "," and len(chunk) > 1)
                    or len(chunk) >= max_words or len(txt) > max_chars):
                chunks.append(chunk)
                chunk = []
        if chunk:
            chunks.append(chunk)
        for k, ch in enumerate(chunks):
            end = chunks[k + 1][0]["start"] if k + 1 < len(chunks) else min(ch[-1]["end"] + 0.5, ends[i])
            captions.append({"start": ch[0]["start"], "end": end,
                             "words": [{"t": c["start"], "text": c["disp"]} for c in ch]})


    fmt = script.get("format", "short")
    hook = None
    if fmt == "short" and script.get("cover"):
        # the hook frame stays up until the first sentence is spoken
        first = next((w for w in per[0] if w["disp"][-1] in ".?!"), per[0][-1])
        hook = {**script["cover"], "end": min(3.2, max(1.2, first["end"] + 0.1))}
    studio = script.get("engine") == "studio"
    # studio: draw at 1080p (software WebGL cost scales with pixels), upscale to 1440p at encode time
    return {"hook": hook, "scale": script.get("scale", 1.0 if studio else 4 / 3), "motion_blur": script.get("motion_blur", True),"duration": duration, "fps": script.get("fps", FPS), "format": fmt, "size": SIZES[fmt], "channel": script.get("channel", ""),
            "engine": script.get("engine", "classic"), "art": script.get("art"),
            "scenes": out_scenes, "captions": captions if script.get("subtitles", True) else []}


# ---------------------------------------------------------------- media (studio "photo" shots)

def load_script(path):
    """Read a script and resolve media paths (params.src / params.video) relative to the script file."""
    path = Path(path).resolve()
    script = json.loads(path.read_text())
    for sc in script["scenes"]:
        p = sc.get("params") or {}
        for k in ("src", "video"):
            if p.get(k) and "://" not in p[k]:
                f = (path.parent / p[k]).resolve()
                if not f.exists() and p.get("url"):
                    f = fetch_media(p["url"], f)
                if not f.exists():
                    sys.exit(f"media not found: {f}")
                p[k] = str(f)
    return script


def fetch_media(url, dest):
    """Clips referenced by URL (Higgsfield results: params.url) are downloaded on first use.
    The Claude cloud sandbox cannot reach the CDN, GitHub Actions can: if the download fails,
    previews get a neutral placeholder clip (never written into the repo) and a warning."""
    sys.path.insert(0, str(ROOT / "tools"))
    import hf
    try:
        hf.fetch(url, dest)
        return dest
    except Exception as e:
        ph = ROOT / "out" / "placeholders" / dest.name
        print(f"warning: cannot download {url} ({e}); using a placeholder for {dest.name}", file=sys.stderr)
        if not ph.exists():
            ph.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
                            "-i", "gradients=s=1920x1080:d=5:speed=0.02:c0=0x10162e:c1=0x3a2f5b:n=2",
                            "-c:v", "libx264", "-pix_fmt", "yuv420p", str(ph)], check=True)
        return ph


def prepare_media(timeline, work):
    """Studio photo shots: turn image paths into file URIs and pre-extract video clips into
    numbered JPEG frames at the render fps (frame-exact, deterministic seeking)."""
    fps = timeline["fps"]
    for i, sc in enumerate(timeline["scenes"]):
        p = sc.get("params") or {}
        if p.get("src") and not p["src"].startswith(("file:", "http")):
            p["src"] = Path(p["src"]).as_uri()
        if p.get("video") and not p.get("frames"):
            d = work / "media" / f"scene{i:02d}"
            d.mkdir(parents=True, exist_ok=True)
            dur = sc["end"] - sc["start"] + 0.5
            rate = p.get("rate", 1)
            w, h = timeline["size"]
            scale = timeline.get("scale", 4 / 3)
            if not any(d.glob("*.jpg")):
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(p.get("from", 0)), "-t", f"{dur * rate:.2f}",
                                "-i", p["video"], "-vf", f"fps={fps / rate},scale=-2:{round(max(w, h) * scale)}",
                                "-q:v", "3", str(d / "%05d.jpg")], check=True)
            p["frames"] = {"pattern": (d / "%05d.jpg").as_uri().replace("%2505d", "%05d"),
                           "count": len(list(d.glob("*.jpg"))), "fps": fps / rate}


# ---------------------------------------------------------------- render

def open_page(pw, timeline):
    # software WebGL (SwiftShader) for the studio 3D shots: runners have no GPU
    args = ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"]
    try:
        browser = pw.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH"), args=args)
    except Exception:
        browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=args)
    w, h = timeline["size"]
    # render at 4/3 scale (1440x2560 / 2560x1440): YouTube gives >1080p uploads the VP9/AV1 high-bitrate
    # encodes, so the final stream stays sharp; layout stays in 1080p CSS pixels
    page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=timeline.get("scale", 4 / 3))
    page.on("pageerror", lambda e: print(f"page error: {e}", file=sys.stderr))
    page.goto((STUDIO if timeline.get("engine") == "studio" else TEMPLATE).as_uri())
    if timeline.get("engine") == "studio":
        # one file per topic-specific shot type (scenes/studio/shots/<type>.js), so parallel agents never edit the same file
        for js in sorted((STUDIO.parent / "shots").glob("*.js")):
            page.add_script_tag(path=str(js))
    page.evaluate("d => window.init(d)", timeline)
    page.evaluate("document.fonts.ready.then(() => true)")
    return browser, page


def _encode_args(timeline):
    fps = timeline["fps"]
    blur = timeline.get("motion_blur", False) and fps >= 60
    vf = ["tmix=frames=2,fps=30"] if blur else []   # motion blur: 60 fps pairs -> 30 fps
    if timeline.get("engine") == "studio":
        w, h = timeline["size"]
        # upscale to 1440p so YouTube serves the high-bitrate VP9/AV1 encode
        # (film grain was dropped: it tripled the file size and encode time and YouTube smears it anyway)
        vf += [f"scale={round(w * 4 / 3)}:{round(h * 4 / 3)}:flags=lanczos"]
    return [*(["-vf", ",".join(vf)] if vf else []),
            "-c:v", "libx264", "-preset", "medium" if timeline.get("engine") == "studio" else "slow",
            "-crf", "18" if timeline.get("engine") == "studio" else "15",   # studio Shorts stay < 50 MB (Telegram bot limit) "-tune", "animation", "-profile:v", "high",
            "-pix_fmt", "yuv420p", "-g", str(60 if blur else fps * 2), "-bf", "2",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]


def _render_segment(args):
    """Worker: frames [a, b) -> silent H.264 segment. Every frame is a pure function of t, so
    segments can be rendered by independent browsers in parallel and concatenated."""
    timeline, a, b, seg = args
    from playwright.sync_api import sync_playwright
    fps = timeline["fps"]
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                           *_encode_args(timeline), str(seg)], stdin=subprocess.PIPE)
    shot = {"type": "jpeg", "quality": 95} if timeline.get("engine") == "studio" else {"type": "png"}
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        for i in range(a, b):
            page.evaluate("t => window.seek(t)", i / fps)
            ff.stdin.write(page.screenshot(**shot))
            if a == 0 and i % (fps * 5) == 0:
                print(f"\rframe {i}/{b} (worker 1)", end="", flush=True)
        browser.close()
    ff.stdin.close()
    if ff.wait() != 0:
        raise RuntimeError(f"ffmpeg failed on segment {seg}")
    return seg


def render(timeline, mp3, out, until, sfx=None, workers=None):
    import multiprocessing as mp
    fps = timeline["fps"]
    n = round(until * fps)
    workers = max(1, min(workers or int(os.environ.get("RENDER_WORKERS", os.cpu_count() or 1)), 8, n // (fps * 2) or 1))
    # split at even frame indices so motion-blur pairs never straddle a segment boundary
    step = -(-n // workers)
    step += step % 2
    tmp = Path(out).with_suffix(".parts")
    tmp.mkdir(parents=True, exist_ok=True)
    jobs = [(timeline, a, min(n, a + step), tmp / f"seg{k:02d}.mp4") for k, a in enumerate(range(0, n, step))]
    t0 = time.time()
    if len(jobs) == 1:
        segs = [_render_segment(jobs[0])]
    else:
        with mp.get_context("spawn").Pool(len(jobs)) as pool:
            segs = pool.map(_render_segment, jobs)
    (tmp / "list.txt").write_text("".join(f"file '{s.name}'\n" for s in segs))
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt"),
        "-i", str(mp3),
        *(["-i", str(sfx), "-filter_complex",
           "[1:a]apad[v];[2:a]apad[s];[v][s]amix=inputs=2:duration=first:normalize=0[a]",
           "-map", "0:v", "-map", "[a]"] if sfx else ["-map", "0:v", "-map", "1:a", "-af", "apad"]),
        "-t", f"{n / fps:.3f}", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)],
        check=True)
    for s in segs:
        s.unlink()
    (tmp / "list.txt").unlink()
    tmp.rmdir()
    print(f"\r{out}  ({n} frames, {n / fps:.1f}s, {len(jobs)} workers, {time.time() - t0:.0f}s)")


def cover(timeline, script, out_jpg):
    """Thumbnail from the script's "cover" block. Long videos: 1280x720 JPEG; Shorts: 1080x1920."""
    from playwright.sync_api import sync_playwright
    c = script.get("cover")
    if not c:
        return None
    png = out_jpg.with_suffix(".cover.png")
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        page.evaluate("c => window.cover(c)", c)
        page.screenshot(path=str(png), type="png")
        browser.close()
    scale = "1280:720" if timeline["format"] == "long" else "1080:1920"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(png), "-vf", f"scale={scale}:flags=lanczos",
                    "-q:v", "2", str(out_jpg)], check=True)
    png.unlink()
    print(out_jpg)
    return out_jpg


def still(timeline, t, out):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        page.evaluate("t => window.seek(t)", t)
        page.screenshot(path=str(out), type="png")
        browser.close()
    print(out)


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("-o", "--out", default="out/video.mp4")
    ap.add_argument("--scenes", type=int, help="render only the first N scenes")
    ap.add_argument("--still", type=float, help="save one frame at this time (s) instead of a video")
    ap.add_argument("--cover", action="store_true", help="only render the thumbnail")
    ap.add_argument("--no-tts", action="store_true", help="silent draft: estimated word timings, no TTS call")
    a = ap.parse_args()

    script = load_script(a.script)
    out = Path(a.out)
    work = out.parent / script.get("slug", Path(a.script).stem)
    work.mkdir(parents=True, exist_ok=True)

    # whole narration in one TTS call for natural prosody; scenes are char ranges in it
    text, ranges = "", []
    for sc in script["scenes"]:
        if text:
            text += " "
        ranges.append((len(text), len(text) + len(sc["text"])))
        text += sc["text"]

    if a.no_tts:
        words, speech = estimate_words(text)
        mp3 = work / "silence.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                        "-t", f"{speech:.2f}", str(mp3)], check=True)
        words = locate(text, words)
    else:
        mp3, words = synthesize(text, script.get("tts", {}), work)
    studio = script.get("engine") == "studio"
    # classic Shorts end tight (they used to loop back to the hook); studio videos end on a full sentence
    duration = audio_duration(mp3) + (STUDIO_TAIL if studio else 0.3 if script.get("format", "short") == "short" else TAIL)
    timeline = build_timeline(script, text, ranges, words, duration)
    prepare_media(timeline, work)
    (work / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.with_suffix(".timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))

    if a.cover:
        cover(timeline, script, out.with_suffix(".jpg"))
        return

    if a.still is not None:
        still(timeline, a.still, out.with_suffix(".png") if out.suffix == ".mp4" else out)
        return
    until = timeline["scenes"][a.scenes - 1]["end"] if a.scenes else duration
    sfx = None
    if script.get("sfx", True):
        sys.path.insert(0, str(ROOT / "tools"))
        import sfx as sfxmod
        sfx = sfxmod.render(timeline, work / "sfx.wav", until)
    render(timeline, mp3, out, until, sfx)
    if not a.scenes:
        cover(timeline, script, out.with_suffix(".jpg"))


if __name__ == "__main__":
    main()
