"""The YouTube channels this pipeline produces for (owner, 2026-10-21). Same parchment style and voice;
each channel has its own on-screen name ("channel" in the script), narrator, file prefix, schedule and
YouTube upload secret. Scripts of every channel live in videos/<date>/; a channel's files start with its prefix.

  short_slots   publish times of the day's Shorts (Europe/Istanbul)
  long_slots    weekday (0 = Monday) -> publish time of the long video; missing weekday = no long video
  youtube_env   env var / GitHub secret with that channel's youtube_token.json (never another channel's)
"""
CHANNELS = {
    "Düşün Bakalım": {
        "id": "db", "prefix": "", "narrator": "kasif",
        "short_slots": ["12:00", "15:00", "19:00", "22:00"],          # 4 Shorts a day (owner, 2026-10-20)
        "long_slots": {d: "20:30" for d in range(7)},                  # a long video every day
        "youtube_env": "YOUTUBE_TOKEN_JSON",
    },
    # new channel (2026-10-21): Ottoman and Turkish history only; slow start, then scale with Studio data:
    # weeks 1-4: 2 Shorts a day + 3 long videos a week, at least 30 min away from Düşün Bakalım's slots
    "Anlatayım Gel": {
        "id": "ag", "prefix": "ag-", "narrator": "fes",
        "short_slots": ["13:00", "17:30"],
        "long_slots": {1: "19:30", 3: "19:30", 5: "14:00"},           # Tue, Thu, Sat
        "youtube_env": "YOUTUBE_TOKEN_JSON_AG",
    },
}
DEFAULT = "Düşün Bakalım"


def by_id(cid):
    return next((n for n, c in CHANNELS.items() if c["id"] == cid or n == cid), None)


def of_file(name):
    """Channel name a script file belongs to, from its file name prefix."""
    for n, c in CHANNELS.items():
        if c["prefix"] and name.startswith(c["prefix"]):
            return n
    return DEFAULT
