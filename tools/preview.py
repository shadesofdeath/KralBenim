#!/usr/bin/env python3
"""Visual QA without TTS: estimates word timings and renders a contact sheet of frames.

  python tools/preview.py videos/2026-10-16/01-konu.json            # 2 frames per scene
  python tools/preview.py videos/2026-10-16/01-konu.json --times 3,12.5,40   # specific times
Output: out/preview/<slug>/sheet.png (+ frame_NN.png), cover.jpg.
Default mode also measures motion per scene (pixel change between its two frames) and flags
scenes that look frozen: every scene must keep moving.
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
    tl, dur = build.draft_timeline(script)
    chars = len(build.narration(script)[0])
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
    print(f"{out / 'sheet.png'}  (~{dur:.0f}s estimated, {len(tl['scenes'])} scenes, {chars} chars)")
    motion = None if a.times else [frame_change(out / f"frame_{2 * i:02d}.png", out / f"frame_{2 * i + 1:02d}.png")
                                   for i in range(len(tl["scenes"]))]
    for i, s in enumerate(tl["scenes"]):
        still = STATIC_BELGESEL if tl.get("theme") == "belgesel" else STATIC   # belgesel: calm by design
        m = "" if motion is None else f" motion={motion[i]:4.1f}" + ("  <- STATIC? add drift/flow" if motion[i] < still else "")
        print(f"  {i:2d} {s['start']:6.1f}-{s['end']:6.1f}  {s['type']:15s}{m} cues={list(s['cues'])}")


STATIC = 1.5   # mean abs pixel change (0-255) below which a scene reads as a still image
STATIC_BELGESEL = 0.3   # belgesel style: slow push and quiet motion are the point; only a frozen frame is flagged


def frame_change(a, b):
    """Mean absolute grey-level difference between two frames, captions band masked out."""
    import numpy as np
    from PIL import Image
    x, y = (np.asarray(Image.open(f).convert("L").reduce(4), dtype=np.float32) for f in (a, b))
    if x.shape[0] > x.shape[1]:          # portrait: ignore the subtitle band (y 1170-1320 of 1920)
        h = x.shape[0] / 1920
        x[int(1170 * h):int(1320 * h)], y[int(1170 * h):int(1320 * h)] = 0, 0
    return float(np.abs(x - y).mean())


if __name__ == "__main__":
    main()
