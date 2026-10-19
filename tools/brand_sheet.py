#!/usr/bin/env python3
"""Kaşif reference sheets, drawn by the same code the videos use (scenes/studio/shots/_ink.js + kasif.js).

  python tools/brand_sheet.py            # -> brand/kit/kasif-reference.png (12 poses), brand/kit/kasif-walk.png (8-frame walk cycle)
  python tools/brand_sheet.py --cast out/cast.png   # extra: other characters (accessories) side by side
Re-run whenever the character design changes.
"""
import argparse
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STUDIO = ROOT / "scenes" / "studio"
KIT = ROOT / "brand" / "kit"

# pose, time (s), extra opts, caption
POSES = [
    ("idle", 1.0, {}, "idle"), ("walk", 0.0, {"ph": 0.12}, "walk"), ("run", 0.0, {"ph": 0.15}, "run"),
    ("point", 1.3, {"dir": 25, "since": 1.0}, "point"), ("think", 2.0, {}, "think"), ("shock", 1.25, {"since": 0.9}, "shock"),
    ("shrug", 1.2, {}, "shrug"), ("talk", 1.0, {"mouth": 0.8}, "talk"), ("wave", 1.15, {}, "wave"),
    ("sit", 1.0, {}, "sit"), ("hold", 1.0, {"text": "MS 79"}, "hold"), ("look", 1.0, {}, "look"),
]

PAGE = """<!doctype html><html><head><meta charset="utf-8"><base href="%(base)s">
<style>html,body{margin:0;background:#E9DCC0}svg{display:block}</style>
<script src="core.js"></script><script src="shots/_ink.js"></script><script src="shots/kasif.js"></script>
</head><body><svg id="s" xmlns="http://www.w3.org/2000/svg"></svg></body></html>"""

JS = """async ([W, H, cells, cols, title]) => {
  await document.fonts.load("48px 'Patrick Hand'", 'ĞŞİ');
  const svg = document.getElementById('s');
  svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  // parchment: base, soft stains, vignette (reference only; videos get theirs from the engine theme)
  el(svg, 'rect', {x: 0, y: 0, width: W, height: H, fill: INK.paper});
  const r = rng(5);
  for (let i = 0; i < 5; i++) el(svg, 'ellipse', {cx: r() * W, cy: r() * H, rx: 80 + r() * 160, ry: 60 + r() * 120, fill: INK.stain, opacity: 0.12});
  const rows = Math.ceil(cells.length / cols), top = title ? 110 : 0, cw = W / cols, ch = (H - top) / rows;
  if (title) {
    const t = el(svg, 'text', {x: 60, y: 78, 'font-family': INK_FONT, 'font-size': 64, fill: INK.ink}); t.textContent = title;
  }
  cells.forEach((c, i) => {
    const cx = (i % cols + 0.5) * cw, gy = top + (Math.floor(i / cols) + 1) * ch - 70;
    if (c.ground !== false) el(svg, 'path', {d: inkPath([[cx - cw * 0.42, gy + 4], [cx, gy + 7], [cx + cw * 0.42, gy + 3]], {w: 5, seed: 40 + i, t: c.t}), fill: INK.ink});
    if (c.marks) for (const m of c.marks) el(svg, 'path', {d: inkPath([[cx + m * c.scale, gy + 14], [cx + m * c.scale, gy + 30]], {w: 3, seed: 90 + i, t: 0}), fill: INK.inkSoft});
    const g = el(svg, 'g');
    const rig = KASIF.create(g, {scale: c.scale, hat: c.hat !== false, accessory: c.accessory || null, seed: 3 + (c.seed || 0)});
    rig.update(c.t, c.pose, Object.assign({x: cx + (c.dx || 0) * c.scale, y: gy, face: c.face || 1}, c.opts || {}));
    if (c.label) {
      const t = el(svg, 'text', {x: cx, y: gy + 52, 'font-family': INK_FONT, 'font-size': 44, 'text-anchor': 'middle', fill: INK.inkSoft});
      t.textContent = c.label;
    }
  });
  return true;
}"""


def render(page, out, W, H, cells, cols, title=""):
    page.set_viewport_size({"width": W, "height": H})
    page.evaluate(JS, [W, H, cells, cols, title])
    page.screenshot(path=str(out))
    print(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cast", help="also render the other characters (accessories) to this PNG")
    ap.add_argument("--strip", nargs=2, metavar=("POSE", "PNG"), help="debug: 8 frames of one pose (walk/run: one cycle)")
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    html = ROOT / "out" / "brand" / "sheet.html"
    html.parent.mkdir(parents=True, exist_ok=True)
    html.write_text(PAGE % {"base": STUDIO.as_uri() + "/"})
    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH"))
        except Exception:
            browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        page = browser.new_page(viewport={"width": 2400, "height": 1600})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        def fresh():
            page.goto(html.as_uri())

        fresh()
        cells = [{"pose": p, "t": t, "opts": o, "label": lab, "scale": 0.82} for p, t, o, lab in POSES]
        render(page, KIT / "kasif-reference.png", 2400, 1600, cells, 4, "Kaşif — hareket kütüphanesi")
        # walk cycle: 8 phases, the body stays put so the planted foot visibly slides back at body speed
        fresh()
        walk = [{"pose": "walk", "t": k / 8 * 0.9, "opts": {"ph": k / 8}, "label": f"{k + 1}/8", "scale": 0.62,
                 "marks": [-54, 54]} for k in range(8)]
        render(page, KIT / "kasif-walk.png", 2400, 560, walk, 8)
        if a.strip:
            fresh()
            pose, png = a.strip
            frames = [{"pose": pose, "t": k / 8 * 1.6, "opts": {"ph": k / 8, "since": k / 8 * 1.2}, "label": f"{k + 1}/8",
                       "scale": 0.62} for k in range(8)]
            render(page, Path(png), 2400, 560, frames, 8)
        if a.cast:
            fresh()
            cast = [{"pose": "talk", "t": 1.0, "label": "Kaşif", "scale": 0.8},
                    {"pose": "talk", "t": 1.4, "hat": False, "accessory": "laurel", "label": "laurel", "scale": 0.8, "seed": 11},
                    {"pose": "idle", "t": 1.0, "hat": False, "accessory": "beret", "label": "beret", "scale": 0.8, "seed": 12},
                    {"pose": "point", "t": 1.0, "hat": False, "accessory": "turban", "label": "turban", "scale": 0.8, "seed": 13, "opts": {"dir": 10}},
                    {"pose": "shock", "t": 1.0, "hat": False, "accessory": "helmet", "label": "helmet", "scale": 0.8, "seed": 14, "opts": {"since": 1}},
                    {"pose": "wave", "t": 1.0, "hat": False, "accessory": "crown", "label": "crown", "scale": 0.8, "seed": 15},
                    {"pose": "idle", "t": 1.0, "hat": False, "label": "(yok)", "scale": 0.8, "seed": 16, "face": -1}]
            render(page, Path(a.cast), 2800, 800, cast, 7)
        browser.close()
    if errors:
        raise SystemExit("page errors:\n" + "\n".join(errors))


if __name__ == "__main__":
    main()
