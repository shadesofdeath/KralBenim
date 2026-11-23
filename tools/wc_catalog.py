#!/usr/bin/env python3
"""Catalogue of the watercolor kit (docs/SULUBOYA.md): every painted object (WC.G.<name>) and every wc_* shot type,
with the documentation written for it in its file. Read this before writing a script or a new shot type.

  python tools/wc_catalog.py            # everything
  python tools/wc_catalog.py ship       # only entries whose name or documentation mentions "ship"
  python tools/wc_catalog.py --names    # just the names
"""
import re
import sys
from pathlib import Path

SHOTS = Path(__file__).resolve().parent.parent / "scenes" / "studio" / "shots"
DEF = re.compile(r"(?:\bWC\.G|(?<![\w.])G)\.(\w+)\s*=(?!=)|\bdef\(\s*['\"](\w+)['\"]|\bSHOTS\.(wc_\w+)\s*=(?!=)")


def doc_for(lines, i, name):
    """Comment lines right above the definition; else the first comment line that documents the name."""
    doc, k = [], i - 1
    while k >= 0 and lines[k].strip().startswith("//") and "----" not in lines[k] and "====" not in lines[k]:
        doc.insert(0, lines[k].strip()[2:].strip())
        k -= 1
    if doc and name in " ".join(doc):
        return " ".join(doc)
    pat = re.compile(r"^\s*//\s*[-*•]?\s*\*{0,2}" + re.escape(name) + r"\b\*{0,2}(?:\s{2,}|\s*[:—(\-–])")
    for j, ln in enumerate(lines):
        if pat.match(ln):
            out = [ln.strip()[2:].strip()]
            ind = len(ln) - len(ln.lstrip(" /"))
            for nxt in lines[j + 1:j + 6]:
                s = nxt.strip()
                if not s.startswith("//") or len(nxt) - len(nxt.lstrip(" /")) <= ind or not s[2:].strip():
                    break
                out.append(s[2:].strip())
            return " ".join(out)
    return ""


def entries():
    seen = set()
    for js in sorted(SHOTS.glob("wc*.js")):
        if js.name == "wc_world.js":
            continue
        lines = js.read_text(encoding="utf-8").splitlines()
        for i, ln in enumerate(lines):
            if ln.strip().startswith("//"):
                continue
            for m in DEF.finditer(ln):
                name = m.group(1) or m.group(2) or m.group(3)
                kind = "shot" if m.group(3) else "object"
                if (kind, name) in seen or name in ("prototype",):
                    continue
                seen.add((kind, name))
                yield kind, name, js.name, doc_for(lines, i, name)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    q = (args[0] if args else "").lower()
    rows = list(entries())
    for kind in ("shot", "object"):
        sel = [e for e in rows if e[0] == kind and (not q or q in (e[1] + " " + e[3]).lower())]
        if not sel:
            continue
        print(f"\n== {kind}s ({len(sel)})")
        for _, name, f, doc in sel:
            print(name if "--names" in sys.argv else f"{name:16s} [{f}] {doc[:500]}")


if __name__ == "__main__":
    main()
