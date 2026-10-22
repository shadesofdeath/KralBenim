#!/usr/bin/env python3
"""Today's production plan: which videos to make, file names, publish times, ElevenLabs budget.

  python tools/plan.py               # today (Europe/Istanbul)
  python tools/plan.py --date 2026-10-21
  python tools/plan.py --extra long  # one extra video started by hand: file number + earliest publish_at
  python tools/plan.py --channel ag  # the same for another channel (tools/channels.py; default Düşün Bakalım)

Plan per channel (tools/channels.py): Düşün Bakalım 4 Shorts + 1 long video every day; Anlatayım Gel
2 Shorts a day + a long video on Tue/Thu/Sat. A channel's files carry its prefix (ag-01-x.json). Videos already in the day's folder (e.g. a long video
made the evening before) are marked done; the daily task makes only the "todo" ones.
Extra videos started by hand carry "extra": true in their script and never count against the plan.
The daily task follows this output instead of doing date arithmetic by hand.
"""
import argparse
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from channels import CHANNELS, DEFAULT, by_id, of_file  # noqa: E402

TZ = ZoneInfo("Europe/Istanbul")
MONTHLY_CHARS = 231442                 # ElevenLabs Creator plan credits (panel, 2026-10-20)
BILLING_DAY = 20                       # credits renew on this day of the month
LIMITS = {"short": (400, 500, 550), "long": (6500, 7800, 8300)}   # target min, target max, hard max (long: 8-10 min, owner 2026-10-21)


def is_long_day(d, ch=DEFAULT):
    return d.weekday() in CHANNELS[ch]["long_slots"]


def next_long(d, ch=DEFAULT):
    while not is_long_day(d, ch):
        d += timedelta(days=1)
    return d


def chars(path):
    s = json.loads(path.read_text())
    return sum(len(sc["text"]) for sc in s["scenes"]) + max(0, len(s["scenes"]) - 1), s.get("format", "short")


def billing_start(d):
    if d.day >= BILLING_DAY:
        return d.replace(day=BILLING_DAY)
    prev = d.replace(day=1) - timedelta(days=1)
    return prev.replace(day=BILLING_DAY)


def month_usage(d):
    """Characters of the scripts in the current billing period (repo estimate, not the live account)."""
    start, used = billing_start(d), 0
    for f in sorted(ROOT.glob("videos/*/*.json")):
        try:
            day = date.fromisoformat(f.parent.name)
        except ValueError:
            continue
        if start <= day <= d and not f.name.endswith(".youtube.json"):
            used += chars(f)[0]
    return used


def slot(d, hhmm, now):
    h, m = map(int, hhmm.split(":"))
    t = datetime(d.year, d.month, d.day, h, m, tzinfo=TZ)
    while t < now + timedelta(hours=1):     # render takes ~15 min; never schedule in the past
        t += timedelta(days=1)
    return t.isoformat()


def category(ch, d, k):
    """Content category suggestion for the k-th video of the day: the channel's pool in rotation
    (tools/channels.py "categories"); a different category for every video of the day."""
    pool = CHANNELS[ch]["categories"]
    return pool[(d.toordinal() * 2 + k) % len(pool)]


def extra(fmt, d, folder, taken, now, ch):
    """An extra video outside the plan: the next free number and the earliest publish time lint accepts
    (now + 1 h, rounded up to 5 minutes); if the render finishes later, upload.py publishes at once."""
    pre = CHANNELS[ch]["prefix"]
    n = 1
    while f"{n:02d}" in taken:
        n += 1
    t = now + timedelta(hours=1)
    t = (t + timedelta(minutes=(5 - t.minute % 5) % 5)).replace(second=0, microsecond=0)
    lo, hi, hard = LIMITS[fmt]
    used = month_usage(d)
    return {"channel": ch, "lang": CHANNELS[ch]["lang"], "category": category(ch, d, n - 1), "date": d.isoformat(), "folder": str(folder.relative_to(ROOT)), "extra": True,
            "video": {"file": f"{pre}{n:02d}-<slug>.json", "format": fmt, "publish_at": t.isoformat(),
                      "chars": f"{lo}-{hi} (hard max {hard})"},
            "note": 'write "extra": true at the top level of the script; publish_at is the earliest allowed',
            "elevenlabs_chars": {"used_this_month": used, "today_max": hi, "monthly_budget": MONTHLY_CHARS,
                                 "warning": used + hi > MONTHLY_CHARS}}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD (default: today in Europe/Istanbul)")
    ap.add_argument("--extra", choices=["short", "long"], help="plan one extra video started by hand")
    ap.add_argument("--channel", default=DEFAULT, help="channel name or id (tools/channels.py), e.g. ag")
    a = ap.parse_args()
    ch = by_id(a.channel)
    if not ch:
        sys.exit(f"unknown channel {a.channel!r}: {', '.join(CHANNELS)}")
    cfg, pre = CHANNELS[ch], CHANNELS[ch]["prefix"]
    now = datetime.now(TZ)
    d = date.fromisoformat(a.date) if a.date else now.date()
    folder = ROOT / "videos" / d.isoformat()
    videos = [{"file": "", "format": "short", "publish_at": slot(d, t, now)} for t in cfg["short_slots"]]
    if is_long_day(d, ch):
        videos.append({"file": "", "format": "long", "publish_at": slot(d, cfg["long_slots"][d.weekday()], now)})
    existing = {"short": [], "long": []}
    taken = set()                          # numbers already used by this channel's files of the day
    for f in sorted(folder.glob("*.json")):
        if f.name.endswith(".youtube.json") or of_file(f.name) != ch:
            continue
        taken.add(f.name[len(pre):len(pre) + 2])
        if not json.loads(f.read_text()).get("extra"):
            existing[chars(f)[1]].append(f.name)
    if a.extra:
        print(json.dumps(extra(a.extra, d, folder, taken, now, ch), ensure_ascii=False, indent=1))
        return
    for v in videos:
        lo, hi, hard = LIMITS[v["format"]]
        v["chars"] = f"{lo}-{hi} (hard max {hard})"
        v["done"] = existing[v["format"]].pop(0) if existing[v["format"]] else None
    n = 1
    for v in videos:                       # todo files get the next free number
        if not v["done"]:
            while f"{n:02d}" in taken:
                n += 1
            v["file"] = f"{pre}{n:02d}-<slug>.json"
            taken.add(f"{n:02d}")
        else:
            v["file"] = v["done"]
    todo = [v for v in videos if not v["done"]]
    for k, v in enumerate(videos):
        v["category"] = category(ch, d, k)

    used = month_usage(d)                  # one ElevenLabs account for every channel
    planned = sum(LIMITS[v["format"]][1] for v in todo)
    print(json.dumps({
        "channel": ch, "narrator": cfg["narrator"], "lang": cfg["lang"], "voice_id": cfg["voice_id"],
        "date": d.isoformat(), "weekday": d.strftime("%A"), "folder": str(folder.relative_to(ROOT)),
        "folder_exists": folder.exists(), "long_video_today": is_long_day(d, ch),
        "next_long_video": next_long(d + timedelta(days=1), ch).isoformat(),
        "videos": videos,
        "todo": [v["file"] for v in todo],
        "elevenlabs_chars": {"used_this_month": used, "today_max": planned, "monthly_budget": MONTHLY_CHARS,
                             "warning": used + planned > MONTHLY_CHARS},
    }, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
