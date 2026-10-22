"""The YouTube channels this pipeline produces for (owner, 2026-10-21). Same parchment style and voice;
each channel has its own on-screen name ("channel" in the script), narrator, file prefix, schedule and
YouTube upload secret. Scripts of every channel live in videos/<date>/; a channel's files start with its prefix.

  short_slots   publish times of the day's Shorts (Europe/Istanbul)
  long_slots    weekday (0 = Monday) -> publish time of the long video; missing weekday = no long video
  youtube_env   env var / GitHub secret with that channel's youtube_token.json (never another channel's)
  lang          narration / on-screen / YouTube metadata language ("lang" in the script must match)
  voice_id      ElevenLabs voice of the channel (model eleven_v3)
  hashtag       the channel's own hashtag; brand_tag the channel tag every video carries
  categories    content pool the daily task rotates through (plan.py suggests one per video)
"""
CHANNELS = {
    "Düşün Bakalım": {
        "id": "db", "prefix": "", "narrator": "kasif",
        "short_slots": ["12:00", "15:00", "19:00", "22:00"],          # 4 Shorts a day (owner, 2026-10-20)
        "long_slots": {d: "20:30" for d in range(7)},                  # a long video every day
        "youtube_env": "YOUTUBE_TOKEN_JSON",
        "lang": "tr", "voice_id": "j4vJUfke1j8j9OYq8V3b",
        "hashtag": "#düşünbakalım", "brand_tag": "düşün bakalım",
        "categories": ["felaketler ve kazalar", "kayıp şehirler ve gizemler", "büyük kararlar ve savaşlar",
                       "keşifler ve icatlar", "imparatorlukların yükselişi ve çöküşü", "Türkiye ve Osmanlı tarihi"],
    },
    # second channel (2026-10-21), global since 2026-10-22: everything in English (voice, screen, cover,
    # YouTube metadata) for a worldwide audience; the most-watched Shorts categories that fit the parchment +
    # stick-figure style, not only history. Slow start: 2 Shorts a day + 3 long videos a week, at least
    # 30 min away from Düşün Bakalım's slots (Europe/Istanbul times; 13:00 = 06:00 New York, 11:00 London)
    "Anlatayım Gel": {
        "id": "ag", "prefix": "ag-", "narrator": "fes",
        "short_slots": ["13:00", "17:30"],
        "long_slots": {1: "19:30", 3: "19:30", 5: "14:00"},           # Tue, Thu, Sat
        "youtube_env": "YOUTUBE_TOKEN_JSON_AG",
        "lang": "en", "voice_id": "nPczCjzI2devNBz1zQrb",              # ElevenLabs "Brian": deep US narrator
        "hashtag": "#anlatayimgel", "brand_tag": "anlatayim gel",
        "categories": [
            "history's strangest moments",          # real events nobody believes happened
            "unsolved mysteries",                   # lost ships, vanished people, unexplained places
            "how it was built",                     # engineering feats, ancient tech, megaprojects
            "origins of everyday things",           # why things are the way they are
            "the human body",                       # bizarre body and brain facts
            "animal superpowers",                   # extreme abilities, nature's weirdest
            "space and planet earth",               # cosmic scale, extreme places on Earth
            "survival stories",                     # against-all-odds true stories
            "empires and battles",                  # turning points, incl. Ottoman and Turkish history
        ],
    },
}
DEFAULT = "Düşün Bakalım"


def by_id(cid):
    return next((n for n, c in CHANNELS.items() if c["id"] == cid or n == cid), None)


def lang(channel):
    return CHANNELS.get(channel, CHANNELS[DEFAULT])["lang"]


def of_file(name):
    """Channel name a script file belongs to, from its file name prefix."""
    for n, c in CHANNELS.items():
        if c["prefix"] and name.startswith(c["prefix"]):
            return n
    return DEFAULT
