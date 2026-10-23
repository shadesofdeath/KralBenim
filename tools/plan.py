#!/usr/bin/env python3
"""Today's production plan: which videos to make, file names, publish times, ElevenLabs budget.

  python tools/plan.py               # Düşün Bakalım, today (Europe/Istanbul)
  python tools/plan.py --channel ag  # Stickstory (tools/channels.py)
  python tools/plan.py --date 2026-10-26
  python tools/plan.py --extra long  # one extra video started by hand: file number + earliest publish_at

Schedules live in tools/channels.py (Düşün Bakalım: 1 Short + 1 long video a day; Stickstory: 3 Shorts +
1 long video a day, in New York time). Videos already in the day's folder are "done"; the daily task
makes only the "todo" ones. Extra videos carry "extra": true and never count against the plan.
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
# narration chars: target min, target max, hard max (~14 chars/s: Shorts 28-35 s, long videos 5-6 min)
LIMITS = {"short": (400, 500, 550), "long": (4300, 5000, 5400)}
SCENES = {"short": (8, 11), "long": (40, 50)}


def is_long_day(d, ch=DEFAULT):
    c = CHANNELS[ch]
    return (d - date.fromisoformat(c["long_anchor"])).days % c["long_every"] == 0


def next_long(d, ch=DEFAULT):
    while not is_long_day(d, ch):
        d += timedelta(days=1)
    return d


def script_info(path):
    """(narration chars, format, extra) of a script file."""
    s = json.loads(path.read_text())
    return (sum(len(sc["text"]) for sc in s["scenes"]) + max(0, len(s["scenes"]) - 1),
            s.get("format", "short"), bool(s.get("extra")))


def month_usage(d):
    """Characters of every channel's scripts in the current billing period (repo estimate; the live
    account figure is in the API check, tools/check.py)."""
    start = d.replace(day=BILLING_DAY) if d.day >= BILLING_DAY else \
        (d.replace(day=1) - timedelta(days=1)).replace(day=BILLING_DAY)
    used = 0
    for f in ROOT.glob("videos/*/*.json"):
        try:
            day = date.fromisoformat(f.parent.name)
        except ValueError:
            continue
        if start <= day <= d and not f.name.endswith(".youtube.json"):
            used += script_info(f)[0]
    return used


def slot(d, hhmm, now, tz=TZ):
    """Publish time hh:mm of day d in the channel's time zone (ISO, with that zone's offset)."""
    h, m = map(int, hhmm.split(":"))
    t = datetime(d.year, d.month, d.day, h, m, tzinfo=tz)
    while t < now + timedelta(hours=1):     # render takes ~15 min; never schedule in the past
        t += timedelta(days=1)
    return t.isoformat()


def category(ch, d, k):
    """Content category for the k-th video of the day: the channel's pool in rotation, all different."""
    pool = CHANNELS[ch]["categories"]
    return pool[(d.toordinal() * 2 + k) % len(pool)]


def budget(d, planned):
    """Repo estimate of this billing period + what both channels' plans would still use until it renews."""
    used = month_usage(d)
    renew = d.replace(day=BILLING_DAY) if d.day < BILLING_DAY else \
        (d.replace(day=1) + timedelta(days=32)).replace(day=BILLING_DAY)
    per_day = sum(LIMITS["short"][1] * len(c["short_slots"]) + LIMITS["long"][1] / c["long_every"]
                  for c in CHANNELS.values())
    projected = round(used + planned + per_day * ((renew - d).days - 1))
    return {"used_this_month": used, "today_max": planned, "monthly_budget": MONTHLY_CHARS,
            "projected_at_renewal": projected, "renews": renew.isoformat(),
            "warning": used + planned > MONTHLY_CHARS or projected > MONTHLY_CHARS}


def limits(fmt):
    lo, hi, hard = LIMITS[fmt]
    return f"{lo}-{hi} (hard max {hard})"


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

    existing, taken = {"short": [], "long": []}, set()     # this channel's files of the day
    for f in sorted(folder.glob("*.json")):
        if f.name.endswith(".youtube.json") or of_file(f.name) != ch:
            continue
        taken.add(f.name[len(pre):len(pre) + 2])
        _, fmt, extra = script_info(f)
        if not extra:
            existing[fmt].append(f.name)

    def free_number():
        n = 1
        while f"{n:02d}" in taken:
            n += 1
        taken.add(f"{n:02d}")
        return f"{pre}{n:02d}-<slug>.json"

    head = {"channel": ch, "narrator": cfg["narrator"], "lang": cfg["lang"], "voice_id": cfg["voice_id"],
            "date": d.isoformat(), "folder": str(folder.relative_to(ROOT))}
    if a.extra:    # earliest publish time lint accepts: now + 1 h, rounded up to 5 minutes
        t = now + timedelta(hours=1)
        t = (t + timedelta(minutes=(5 - t.minute % 5) % 5)).replace(second=0, microsecond=0)
        print(json.dumps({**head, "extra": True, "category": category(ch, d, len(taken)),
                          "video": {"file": free_number(), "format": a.extra, "publish_at": t.isoformat(),
                                    "chars": limits(a.extra), "scenes": SCENES[a.extra]},
                          "note": 'write "extra": true at the top level of the script; publish_at is the earliest allowed',
                          "elevenlabs_chars": budget(d, LIMITS[a.extra][1])}, ensure_ascii=False, indent=1))
        return

    tz = ZoneInfo(cfg["tz"])
    videos = [{"format": "short", "publish_at": slot(d, t, now, tz)} for t in cfg["short_slots"]]
    if is_long_day(d, ch):
        videos.append({"format": "long", "publish_at": slot(d, cfg["long_slot"], now, tz)})
    for v in videos:     # the owner's clock too
        v["istanbul"] = datetime.fromisoformat(v["publish_at"]).astimezone(TZ).strftime("%d.%m %H:%M")
    for k, v in enumerate(videos):
        done = existing[v["format"]].pop(0) if existing[v["format"]] else None
        v.update(file=done or free_number(), done=done, chars=limits(v["format"]),
                 scenes=SCENES[v["format"]], category=category(ch, d, k))
    todo = [v for v in videos if not v["done"]]
    print(json.dumps({**head, "long_video_today": is_long_day(d, ch),
                      "next_long_video": next_long(d + timedelta(days=1), ch).isoformat(),
                      "videos": videos, "todo": [v["file"] for v in todo],
                      "elevenlabs_chars": budget(d, sum(LIMITS[v["format"]][1] for v in todo))},
                     ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
