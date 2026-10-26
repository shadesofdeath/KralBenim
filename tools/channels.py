"""The YouTube channels this pipeline produces for. Same parchment style; each channel has its own on-screen
name ("channel" in the script), narrator, language, voice, file prefix, schedule and YouTube upload secret.
Scripts of every channel live in videos/<date>/; a channel's files start with its prefix.

  tz            time zone of the slots (Stickstory: New York, its biggest audience; DST is automatic)
  short_slots   publish times of the day's Shorts (in tz)
  long_every    a long video every N days (1 = every day), on days where (date - long_anchor) % N == 0
  long_slot     publish time of the long video
  youtube_env   env var / GitHub secret holding that channel's YouTube token JSON (never another channel's)
  lang          narration / on-screen / YouTube metadata language ("lang" in the script must match)
  voice_id      ElevenLabs voice of the channel (model eleven_v3; owner's choice, never change)
  hashtag       the channel's own hashtag; brand_tag the channel tag every video carries
  categories    content pool the daily task rotates through (plan.py suggests one per video)
  category_id   YouTube category every upload of the channel gets (27 Education, 28 Science & Technology)
  ai_disclosure YouTube "altered or synthetic content" box (status.containsSyntheticMedia) on every upload
  news          Google News front pages a topic is picked from first (tools/news.py), if the channel has them
"""
CHANNELS = {
    "Düşün Bakalım": {
        "id": "db", "prefix": "", "narrator": "kasif", "tz": "Europe/Istanbul",
        "short_slots": ["19:00"],                                   # 1 Short a day (owner, 2026-10-24)
        # fewer but better (owner, 2026-10-26: YouTube's "mass-produced content" review): a long video every 2nd day
        "long_every": 2, "long_anchor": "2026-10-23", "long_slot": "20:30",
        "youtube_env": "YOUTUBE_TOKEN_JSON",
        "lang": "tr", "voice_id": "j4vJUfke1j8j9OYq8V3b",
        "hashtag": "#düşünbakalım", "brand_tag": "düşün bakalım",
        "category_id": "27", "ai_disclosure": False,
        # topics start from Turkey's front page too (tools/news.py --channel db; owner, 2026-10-26)
        "news": [("TR", "tr")],
        "categories": ["felaketler ve kazalar", "kayıp şehirler ve gizemler", "büyük kararlar ve savaşlar",
                       "keşifler ve icatlar", "imparatorlukların yükselişi ve çöküşü", "Türkiye ve Osmanlı tarihi"],
    },
    # global, all English (voice, screen, cover, metadata); was "Anlatayım Gel" until 2026-10-22.
    # Slots in New York time: the US is the largest English audience, and these hours also hit the UK/Europe.
    #   09:00 NY = London 14:00 (lunch/afternoon in Europe, US morning commute)   Istanbul 16:00/17:00
    #   13:00 NY = London 18:00, Los Angeles 10:00 (US lunch, UK evening)           Istanbul 20:00/21:00
    #   19:00 NY = Los Angeles 16:00 (US evening prime time, both coasts awake)     Istanbul 02:00/03:00
    #   long 14:00 NY = London 19:00 (US afternoon, UK evening: time for a 5-6 minute video)
    # A night-time slot in Turkey is fine: YouTube publishes the scheduled video itself.
    "Stickstory": {
        "id": "ag", "prefix": "ag-", "narrator": "fes", "tz": "America/New_York",
        # fewer but better (owner, 2026-10-26): 2 Shorts a day (was 3) and a long video every 2nd day (was daily)
        "short_slots": ["13:00", "19:00"],
        "long_every": 2, "long_anchor": "2026-10-22", "long_slot": "14:00",
        "youtube_env": "YOUTUBE_TOKEN_JSON_AG",
        "lang": "en", "voice_id": "ppLqTilh7rH7fbUVlXsf",
        "hashtag": "#stickstory", "brand_tag": "stickstory",
        "category_id": "28", "ai_disclosure": True,                 # Science & Technology, AI use: yes (owner, 2026-10-26)
        "categories": ["history's strangest moments", "unsolved mysteries", "how it was built",
                       "origins of everyday things", "the human body", "animal superpowers",
                       "space and planet earth", "survival stories", "empires and battles"],
        # topics start from these front pages (tools/news.py; owner, 2026-10-26): (country, Google News edition)
        "news": [("US", "en-US"), ("AU", "en-AU"), ("CH", "de-CH"), ("NO", "no"), ("NZ", "en-NZ"),
                 ("CA", "en-CA"), ("DE", "de")],
    },
}
DEFAULT = "Düşün Bakalım"


def by_id(cid):
    """Channel name for an id ("ag") or a name; None if unknown."""
    return next((n for n, c in CHANNELS.items() if cid in (c["id"], n)), None)


def of_file(name):
    """Channel name a script file belongs to, from its file name prefix."""
    return next((n for n, c in CHANNELS.items() if c["prefix"] and name.startswith(c["prefix"])), DEFAULT)
