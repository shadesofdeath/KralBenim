#!/usr/bin/env python3
"""Today's headlines for picking a topic: Google News top stories of the channel's countries.

  python tools/news.py                  # Stickstory: US, AU, CH, NO, NZ, CA, DE (tools/channels.py "news")
  python tools/news.py --channel db     # Düşün Bakalım: Türkiye
  python tools/news.py --max 25 --links # more headlines per country, with article links
  python tools/news.py --json           # machine-readable

Every video of both channels starts here (CLAUDE.md): read the headlines, pick one that fits a channel category
(channels.py "categories") and leads to a real, verifiable story, the "story behind the news" (Japan launches a
probe to Phobos -> "Mars's moon is falling"; a dig in Anatolia -> the history of that place). Skip politics, elections, crime, live
disasters with victims, deaths, celebrities, sports results and product news. If nothing fits, the topic comes
from the category pool as before. Stories that make the front page in several countries are listed first.
"""
import argparse
import json
import re
import signal
import sys
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from email.utils import parsedate_to_datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from channels import CHANNELS, by_id  # noqa: E402

UA = "Mozilla/5.0 (StickstoryBot/1.0; topic research)"
STOP = set("the a an of to in on for and is are as at by with from after over its his her their new says say "
           "der die das und mit von den im für ein eine nach auf zu ist og i på av en et til som med er".split())


def fetch(country, hl):
    lang = hl.split("-")[0]
    url = f"https://news.google.com/rss?hl={hl}&gl={country}&ceid={country}:{lang}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        root = ET.fromstring(r.read())
    out = []
    for it in root.iter("item"):
        title = it.findtext("title") or ""
        src = it.findtext("source") or ""
        if src and title.endswith(" - " + src):
            title = title[: -len(src) - 3]
        try:
            when = parsedate_to_datetime(it.findtext("pubDate")).strftime("%Y-%m-%d")
        except Exception:
            when = ""
        out.append({"title": title, "source": src, "date": when, "link": it.findtext("link") or ""})
    return out


def words(title):
    return {w for w in re.findall(r"[\wÀ-ÿ]{4,}", title.lower()) if w not in STOP}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--channel", default="ag")
    ap.add_argument("--max", type=int, default=40, help="headlines per country")
    ap.add_argument("--links", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)  # quiet when piped into head
    editions = CHANNELS[by_id(a.channel)].get("news") or []
    if not editions:
        sys.exit(f"no news editions configured for {a.channel} in tools/channels.py")

    with ThreadPoolExecutor(len(editions)) as ex:
        futs = {c: ex.submit(fetch, c, hl) for c, hl in editions}
    feeds, failed = {}, []
    for c, f in futs.items():
        try:
            feeds[c] = f.result()[: a.max]
        except Exception as e:  # one country down is fine; all down -> fall back to the category pool
            failed.append(f"{c}: {e}")

    # stories on the front page of several countries: headlines sharing 2+ distinctive words
    seen = [(c, it, words(it["title"])) for c, items in feeds.items() for it in items]
    for c, it, w in seen:
        it["countries"] = sorted({c} | {c2 for c2, _, w2 in seen if c2 != c and len(w & w2) >= 2})

    if a.json:
        print(json.dumps({"feeds": feeds, "failed": failed}, ensure_ascii=False, indent=1))
        return
    if not feeds:
        sys.exit("news unavailable (" + "; ".join(failed) + ") -> pick the topic from the category pool")
    multi, shown = [], []
    for c, it, w in sorted(seen, key=lambda x: -len(x[1]["countries"])):
        if len(it["countries"]) > 1 and not any(len(w & w2) >= 2 for w2 in shown):
            multi.append(it)
            shown.append(w)
    if multi:
        print("== on several front pages")
        for it in multi:
            print(f"  [{','.join(it['countries'])}] {it['title']} ({it['source']})")
    for c, items in feeds.items():
        print(f"== {c}")
        for it in items:
            print(f"  {it['date']}  {it['title']} ({it['source']})" + (f"\n      {it['link']}" if a.links else ""))
    for f in failed:
        print(f"!! {f}")
    print("\ncategories:", "; ".join(CHANNELS[by_id(a.channel)]["categories"]))


if __name__ == "__main__":
    main()
