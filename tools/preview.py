#!/usr/bin/env python3
"""Visual QA without TTS: estimates word timings and renders a contact sheet of frames.

  python tools/preview.py videos/2026-10-16/01-konu.json            # 2 frames per scene
  python tools/preview.py script.json --times 3,12.5,40              # specific times
Output: out/preview/<slug>/sheet.png (+ frame_NN.png)
"""
import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import build  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--times", help="comma separated seconds")
    a = ap.parse_args()
    script = build.load_script(a.script)
    text, ranges = "", []
    for sc in script["scenes"]:
        if text:
            text += " "
        ranges.append((len(text), len(text) + len(sc["text"])))
        text += sc["text"]
    words, dur = build.estimate_words(text)
    tail = build.STUDIO_TAIL if script.get("engine") == "studio" else build.TAIL
    tl = build.build_timeline(script, text, ranges, build.locate(text, words), dur + tail)
    out = ROOT / "out" / "preview" / script.get("slug", Path(a.script).stem)
    out.mkdir(parents=True, exist_ok=True)
    for f in out.glob("frame_*.png"):
        f.unlink()
    build.prepare_media(tl, out)
    if a.times:
        times = [float(x) for x in a.times.split(",")]
    else:   # mid + late frame of every scene
        times = [t for s in tl["scenes"] for t in (s["start"] + (s["end"] - s["start"]) * 0.45, s["end"] - 0.45)]
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser, page = build.open_page(pw, tl)
        for i, t in enumerate(times):
            page.evaluate("t => window.seek(t)", t)
            page.screenshot(path=str(out / f"frame_{i:02d}.png"))
        browser.close()
    cols = 6 if tl["format"] == "short" else 3
    scale = "360:-1" if tl["format"] == "short" else "640:-1"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(out / "frame_%02d.png"),
                    "-vf", f"scale={scale},tile={cols}x{-(-len(times) // cols)}", "-frames:v", "1",
                    str(out / "sheet.png")], check=True)
    if script.get("cover"):
        build.cover(tl, script, out / "cover.jpg")
    chars = len(text)
    print(f"{out / 'sheet.png'}  (~{dur:.0f}s estimated, {len(tl['scenes'])} scenes, {chars} chars)")
    for s in tl["scenes"]:
        print(f"  {s['start']:6.1f}-{s['end']:6.1f}  {s['type']:15s} cues={list(s['cues'])}")


if __name__ == "__main__":
    main()
