#!/usr/bin/env python3
"""Shorts pipeline: script.json -> out/video.mp4

  python build.py script.json                 # full video
  python build.py script.json --scenes 3      # only the first 3 scenes (test)
  python build.py script.json --still 12.5    # save a single frame as PNG
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
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "scenes" / "index.html"
FPS = 30
W, H = 1080, 1920
TAIL = 0.8  # hold after the last word (s)
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


def tts_elevenlabs(text, cfg, mp3):
    key = os.environ.get("ELEVENLABS_API_KEY")
    voice = cfg.get("voice_id") or os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not voice:
        sys.exit("ELEVENLABS_API_KEY and tts.voice_id (or ELEVENLABS_VOICE_ID) are required")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": cfg.get("model", "eleven_multilingual_v2"),
                         **({"voice_settings": cfg["settings"]} if cfg.get("settings") else {})}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:500]}")
    Path(mp3).write_bytes(base64.b64decode(res["audio_base64"]))
    al = res["alignment"]
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, i = [], 0
    while i < len(chars):
        if chars[i].isspace():
            i += 1
            continue
        j = i
        while j < len(chars) and not chars[j].isspace():
            j += 1
        words.append({"text": "".join(chars[i:j]).strip(PUNCT), "start": st[i], "end": en[j - 1]})
        i = j
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
        out_scenes.append({"start": starts[i], "end": ends[i], "type": sc["type"],
                           "title": sc.get("title", {}), "tags": sc.get("tags", []),
                           "params": sc.get("params", {}), "cues": cues})

        # captions: short phrases, broken at punctuation or ~5 words / 30 chars
        chunk, chunks = [], []
        for w in ws:
            chunk.append(w)
            txt = " ".join(c["disp"] for c in chunk)
            if (w["disp"][-1] in ".?!:;" or (w["disp"][-1] == "," and len(chunk) > 1)
                    or len(chunk) >= 5 or len(txt) > 30):
                chunks.append(chunk)
                chunk = []
        if chunk:
            chunks.append(chunk)
        for k, ch in enumerate(chunks):
            end = chunks[k + 1][0]["start"] if k + 1 < len(chunks) else min(ch[-1]["end"] + 0.5, ends[i])
            captions.append({"start": ch[0]["start"], "end": end,
                             "words": [{"t": c["start"], "text": c["disp"]} for c in ch]})


    return {"duration": duration, "fps": script.get("fps", FPS), "channel": script.get("channel", ""),
            "scenes": out_scenes, "captions": captions if script.get("subtitles", True) else []}


# ---------------------------------------------------------------- render

def open_page(pw, timeline):
    try:
        browser = pw.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH"))
    except Exception:
        browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.goto(TEMPLATE.as_uri())
    page.evaluate("d => window.init(d)", timeline)
    page.evaluate("document.fonts.ready.then(() => true)")
    return browser, page


def render(timeline, mp3, out, until):
    from playwright.sync_api import sync_playwright
    fps = timeline["fps"]
    n = round(until * fps)
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
        "-i", str(mp3),
        "-map", "0:v", "-map", "1:a", "-af", "apad", "-t", f"{n / fps:.3f}",
        "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)],
        stdin=subprocess.PIPE)
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        for i in range(n):
            page.evaluate("t => window.seek(t)", i / fps)
            ff.stdin.write(page.screenshot(type="png"))
            if i % (fps * 5) == 0:
                print(f"\rframe {i}/{n}", end="", flush=True)
        browser.close()
    ff.stdin.close()
    if ff.wait() != 0:
        sys.exit("ffmpeg failed")
    print(f"\r{out}  ({n} frames, {n / fps:.1f}s)")


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
    a = ap.parse_args()

    script = json.loads(Path(a.script).read_text())
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

    mp3, words = synthesize(text, script.get("tts", {}), work)
    duration = audio_duration(mp3) + TAIL
    timeline = build_timeline(script, text, ranges, words, duration)
    (work / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))

    if a.still is not None:
        still(timeline, a.still, out.with_suffix(".png") if out.suffix == ".mp4" else out)
        return
    until = timeline["scenes"][a.scenes - 1]["end"] if a.scenes else duration
    render(timeline, mp3, out, until)


if __name__ == "__main__":
    main()
