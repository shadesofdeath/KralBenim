#!/usr/bin/env python3
"""Today's production plan: which videos to make, file names, publish times, ElevenLabs budget.

  python tools/plan.py               # today (Europe/Istanbul)
  python tools/plan.py --date 2026-10-21

Plan: 2 Shorts + 1 long video every day. Videos already in the day's folder (e.g. a long video
made the evening before) are marked done; the daily task makes only the "todo" ones.
The daily task follows this output instead of doing date arithmetic by hand.
"""
import argparse
import json
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
TZ = ZoneInfo("Europe/Istanbul")
SHORT_SLOTS = ["12:00", "19:00"]
LONG_SLOT = "20:30"
LONG_EVERY = 1                         # every day (was every 5 days until 2026-10-19)
LONG_ANCHOR = date(2026, 10, 17)
MONTHLY_CHARS = 60000
LIMITS = {"short": (400, 500, 550), "long": (3400, 4000, 4300)}   # target min, target max, hard max


def is_long_day(d):
    return (d - LONG_ANCHOR).days % LONG_EVERY == 0


def next_long(d):
    while not is_long_day(d):
        d += timedelta(days=1)
    return d


def chars(path):
    s = json.loads(path.read_text())
    return sum(len(sc["text"]) for sc in s["scenes"]) + max(0, len(s["scenes"]) - 1), s.get("format", "short")


def month_usage(d):
    used = 0
    for f in sorted(ROOT.glob(f"videos/{d:%Y-%m}-*/*.json")):
        if not f.name.endswith(".youtube.json"):
            used += chars(f)[0]
    return used


def slot(d, hhmm, now):
    h, m = map(int, hhmm.split(":"))
    t = datetime(d.year, d.month, d.day, h, m, tzinfo=TZ)
    while t < now + timedelta(hours=1):     # render takes ~15 min; never schedule in the past
        t += timedelta(days=1)
    return t.isoformat()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD (default: today in Europe/Istanbul)")
    a = ap.parse_args()
    now = datetime.now(TZ)
    d = date.fromisoformat(a.date) if a.date else now.date()
    folder = ROOT / "videos" / d.isoformat()
    videos = [{"file": f"0{i + 1}-<slug>.json", "format": "short", "publish_at": slot(d, t, now)}
              for i, t in enumerate(SHORT_SLOTS)]
    if is_long_day(d):
        videos.append({"file": f"0{len(videos) + 1}-<slug>.json", "format": "long",
                       "publish_at": slot(d, LONG_SLOT, now)})
    existing = {"short": [], "long": []}
    for f in sorted(folder.glob("*.json")):
        if not f.name.endswith(".youtube.json"):
            existing[chars(f)[1]].append(f.name)
    taken = {f[:2] for fs in existing.values() for f in fs}
    for v in videos:
        lo, hi, hard = LIMITS[v["format"]]
        v["chars"] = f"{lo}-{hi} (hard max {hard})"
        v["done"] = existing[v["format"]].pop(0) if existing[v["format"]] else None
    n = 1
    for v in videos:                       # todo files get the next free number
        if not v["done"]:
            while f"{n:02d}" in taken:
                n += 1
            v["file"] = f"{n:02d}-<slug>.json"
            taken.add(f"{n:02d}")
    todo = [v for v in videos if not v["done"]]

    used = month_usage(d)
    planned = sum(LIMITS[v["format"]][1] for v in todo)
    print(json.dumps({
        "date": d.isoformat(), "weekday": d.strftime("%A"), "folder": str(folder.relative_to(ROOT)),
        "folder_exists": folder.exists(), "long_video_today": is_long_day(d),
        "next_long_video": next_long(d + timedelta(days=1)).isoformat(),
        "videos": videos,
        "todo": [v["file"] for v in todo],
        "elevenlabs_chars": {"used_this_month": used, "today_max": planned, "monthly_budget": MONTHLY_CHARS,
                             "warning": used + planned > MONTHLY_CHARS},
    }, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
