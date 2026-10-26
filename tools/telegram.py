#!/usr/bin/env python3
"""Telegram: finished Shorts (Instagram-ready) + ONE live status message per channel and day.

  python tools/telegram.py setup                      # find the chat that messaged the bot -> config/telegram_chat_id
  python tools/telegram.py send <file>.json out/x.mp4  # video + Instagram caption
  python tools/telegram.py text "message"

The live message is written only by GitHub Actions (tools/live.py: voice, render %, YouTube link), never by
the cloud session, so it is never stale. Stage records live as commit statuses on an anchor commit (Store)
when GITHUB_TOKEN is set, else in out/telegram/<key>.json.

Env: TELEGRAM_BOT_TOKEN. Chat id: TELEGRAM_CHAT_ID or config/telegram_chat_id.
GITHUB_TOKEN + GITHUB_REPOSITORY (Actions). TELEGRAM_API (tests): API base, default https://api.telegram.org.
"""
import html
import json
import os
import re
import sys
import time
import uuid
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from channels import CHANNELS, DEFAULT, of_file  # noqa: E402

CHAT_FILE = ROOT / "config" / "telegram_chat_id"
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
API = f"{os.environ.get('TELEGRAM_API', 'https://api.telegram.org').rstrip('/')}/bot{TOKEN}"


def call(method, fields=None, files=None):
    if files:
        boundary = uuid.uuid4().hex
        body = b""
        for k, v in (fields or {}).items():
            body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
        for k, path in files.items():
            body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"; filename=\"{Path(path).name}\"\r\n"
                     f"Content-Type: video/mp4\r\n\r\n").encode() + Path(path).read_bytes() + b"\r\n"
        body += f"--{boundary}--\r\n".encode()
        req = urllib.request.Request(f"{API}/{method}", data=body,
                                     headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    else:
        req = urllib.request.Request(f"{API}/{method}", data=json.dumps(fields or {}).encode(),
                                     headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)


def chat_id(required=True):
    cid = os.environ.get("TELEGRAM_CHAT_ID", "").strip() or (CHAT_FILE.read_text().strip() if CHAT_FILE.exists() else "")
    if not cid and required:
        sys.exit("no chat id: message the bot once, then run `telegram.py setup`")
    return cid


def instagram_caption(script, channel=DEFAULT):
    """YouTube description -> Instagram caption: "follow" instead of "subscribe", at most 5 hashtags
    (3 topic tags + the channel's own + explore)."""
    yt, c = script.get("youtube", {}), CHANNELS[channel]
    desc = yt.get("description", "")
    body = desc.split("\n\n#")[0].replace("#shorts", "").replace("YouTube", "").strip()
    if c["lang"] == "en":
        body = re.sub(r"\b([Ss])ubscribe( to)?\b", lambda m: "Ff"[m[1] == "s"] + "ollow", body)
        explore = "#explore"
    else:
        body = body.replace("Bakalım'a abone ol", "Bakalım'ı takip et").replace("abone ol", "takip et")
        explore = "#keşfet"
    topic = [t for t in desc.rsplit("\n\n", 1)[-1].split() if t.startswith("#") and t not in ("#shorts", c["hashtag"])]
    tags = list(dict.fromkeys(topic[:3] + [c["hashtag"], explore]))[:5]
    return f"{yt.get('title', '')}\n\n{body}\n\n{' '.join(tags)}"[:2200]


# ---------------------------------------------------------------- live status message
# Where the state lives: every stage of every video is one GitHub commit status on a fixed "anchor"
# commit (the repo's first commit, nobody looks at it), context  tg/<key>/<section>/<stage>,
# description  state|t0|t1|progress|text.  Why: GITHUB_TOKEN can write and read them from any job
# (statuses: write), at any time, without commits, caches or artifacts; one context per stage means
# parallel writers never lose each other's updates (latest write per stage wins, which is what we want).
#   tg/<key>/ch-<id>/_msg.<w>   chat_id|message_id|created     a writer's candidate for the day's message of a
#                                                               channel; the smallest (first sent) message wins
#   tg/<key>/<slug>/_meta       kind|title                      video heading
#   tg/<key>/<slug>/shard<i>    run|percent                     live render progress of shard i
# Without GITHUB_TOKEN (local use) the same records go to a JSON file (out/telegram/<key>.json).
# Whoever writes then re-renders the channel's message from all records and edits it, so it is always
# complete. The message is HTML (bold headings, details in <code>); every value is escaped.

STAGES = {   # id: (emoji, short label); the steps GitHub Actions reports (tools/live.py)
    "tts": ("🎙️", "Ses"),
    "render": ("🎬", "Render"),
    "mux": ("🧩", "Birleştirme"),
    "youtube": ("📤", "YouTube"),
    "telegram": ("📲", "Telegram"),
}
ORDER = list(STAGES)
STATES = ("wait", "run", "done", "fail", "skip", "info")
MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
REUSE_HOURS = 20   # an older message of the same key is left alone and a new one is started
WRITER = uuid.uuid4().hex[:6]   # this process's candidate record for a new message (publish_one)
ANCHOR = os.environ.get("TG_ANCHOR_SHA", "2811b79a51d4e0a5d1382f67311b7d361c4373c2")
GH_API = os.environ.get("GITHUB_API_URL", "https://api.github.com").rstrip("/")
GH_STATE = {"remaining": 5000}
_warned = set()


def warn(msg):
    if msg not in _warned:
        _warned.add(msg)
        print(f"telegram: {msg}", file=sys.stderr)


def gh(path, body=None):
    """GitHub REST call on this repo -> parsed JSON, or None on any error."""
    token, repo = os.environ.get("GITHUB_TOKEN", ""), os.environ.get("GITHUB_REPOSITORY", "")
    if not (token and repo):
        return None
    req = urllib.request.Request(f"{GH_API}/repos/{repo}/{path}", data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json",
                                          "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json"})
    for i in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                GH_STATE["remaining"] = int(r.headers.get("X-RateLimit-Remaining") or GH_STATE["remaining"])
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (403, 429) and i < 2 and e.headers.get("Retry-After"):
                time.sleep(min(30, int(e.headers["Retry-After"])))
                continue
            try:
                detail = e.read().decode(errors="replace")[:300]
            except Exception:
                detail = ""
            warn(f"{path.split('?')[0]}: HTTP {e.code} {detail}")
            return None
        except Exception as e:
            if i < 2:
                time.sleep(2)
                continue
            warn(f"{path.split('?')[0]}: {e}")
            return None


def b36(n):
    n, out = int(n), ""
    while True:
        n, r = divmod(n, 36)
        out = "0123456789abcdefghijklmnopqrstuvwxyz"[r] + out
        if not n:
            return out


def from36(s):
    try:
        return int(s, 36) if s else None
    except ValueError:
        return None


def ts(s):
    if not s:
        return None
    try:
        from datetime import datetime
        return datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return None


class Store:
    """All records of one key: context suffix -> {"id", "d" (description), "url"}."""

    def __init__(self, key):
        self.key = key
        self.prefix = f"tg/{key}/"
        self.seen = {}
        self.remote = bool(os.environ.get("GITHUB_TOKEN") and os.environ.get("GITHUB_REPOSITORY"))
        self.file = Path(os.environ.get("TELEGRAM_STATE") or
                         ROOT / "out" / "telegram" / f"{re.sub(r'[^A-Za-z0-9_.-]', '_', key)}.json")

    # commit status descriptions reject 4-byte UTF-8 (emoji): stored as \U0001f9e0, decoded on read
    @staticmethod
    def enc(d):
        return "".join(f"\\U{ord(ch):08x}" if ord(ch) > 0xFFFF else ch for ch in d)

    @staticmethod
    def dec(d):
        return re.sub(r"\\U([0-9a-f]{8})", lambda m: chr(int(m.group(1), 16)), d or "")

    def _merge(self, c, rid, d, url):
        d = self.dec(d)
        if c.startswith(self.prefix):
            k = c[len(self.prefix):]
            if k not in self.seen or rid > self.seen[k]["id"]:
                self.seen[k] = {"id": rid, "d": d or "", "url": url}

    def refresh(self, pages=8, max_age_h=36):
        """Read the records (newest first). The monitor reads the full history once and then only page 1."""
        if not self.remote:
            try:
                self.seen = json.loads(self.file.read_text())
            except (OSError, ValueError):
                self.seen = {}
            return
        old = time.time() - max_age_h * 3600
        for page in range(1, pages + 1):
            r = gh(f"commits/{ANCHOR}/statuses?per_page=100&page={page}")
            if not r:
                break
            for s in r:
                self._merge(s.get("context", ""), s.get("id", 0), s.get("description"), s.get("target_url"))
            if len(r) < 100 or (ts(r[-1].get("created_at")) or 0) < old:
                break

    def put(self, k, d, url=None, state="success"):
        while len(self.enc(d)) > 140:
            d = d[:-1]
        cur = self.seen.get(k)
        if cur and cur["d"] == d and cur.get("url") == url:
            return True
        rid = max([x["id"] for x in self.seen.values()] + [0]) + 1
        if self.remote:
            body = {"state": state, "context": self.prefix + k, "description": self.enc(d)}
            if url:
                body["target_url"] = url
            r = gh(f"statuses/{ANCHOR}", body)
            if r is None:
                return False
            rid = r.get("id", rid)
        self.seen[k] = {"id": rid, "d": d, "url": url}
        if not self.remote:
            try:
                self.file.parent.mkdir(parents=True, exist_ok=True)
                self.file.write_text(json.dumps(self.seen, ensure_ascii=False, indent=1))
            except OSError:
                pass
        return True

    def put_stage(self, sid, g):
        p = "" if g.get("progress") is None else str(int(round(g["progress"] * 100)))
        d = "|".join([g["state"], b36(g["t0"]) if g.get("t0") else "", b36(g["t1"]) if g.get("t1") else "",
                      p, (g.get("text") or "").replace("\n", " ")])
        gs = {"wait": "pending", "run": "pending", "fail": "failure"}.get(g["state"], "success")
        return self.put(f"{sid}/{g['id']}", d, state=gs)

    def put_meta(self, sid, kind=None, title=None):
        cur = self.seen.get(f"{sid}/_meta", {}).get("d", "|").split("|", 1)
        kind, title = kind or cur[0], title or (cur[1] if len(cur) > 1 else "")
        if kind or title:
            self.put(f"{sid}/_meta", f"{kind or ''}|{title or ''}")

    def state(self):
        st = {"key": self.key, "sections": [], "shards": {}, "msgs": {}}
        # oldest record first: a video's first slug creates its section, the newest record of a stage wins
        for k, v in sorted(self.seen.items(), key=lambda kv: (kv[1].get("id") or 0)):
            parts, d = k.split("/"), v["d"]
            if len(parts) != 2:
                continue
            sid, stage = parts
            if stage.split(".")[0] == "_msg":
                c, m, cr = (d.split("|") + ["", "", ""])[:3]
                cur = st["msgs"].get(sid)
                if m.isdigit() and (not cur or int(m) < cur["message_id"]):   # the first message sent wins
                    st["msgs"][sid] = {"chat_id": c, "message_id": int(m), "created": from36(cr) or 0}
                continue
            if stage == "_meta":
                kind, _, title = d.partition("|")
                section(st, sid, kind or None, title or None)
            elif stage.startswith("shard"):
                run, _, pct = d.partition("|")
                st["shards"].setdefault(sid, {})[stage[5:]] = (run, float(pct or 0) / 100)
            elif stage == "youtube_url":
                st.setdefault("urls", {})[sid] = v.get("url") or d
            else:
                f = (d.split("|", 4) + [""] * 5)[:5]
                if f[0] not in STATES:
                    continue
                g = {"id": stage, "state": f[0], "t0": from36(f[1]), "t1": from36(f[2]),
                     "progress": float(f[3]) / 100 if f[3] else None, "text": f[4] or None}
                sec = section(st, sid)
                sec["stages"] = [x for x in sec["stages"] if x["id"] != stage] + [g]
                sec["stages"].sort(key=lambda x: ORDER.index(x["id"]) if x["id"] in ORDER else len(ORDER))
        return st


def section(st, sid, kind=None, title=None):
    """The section (block) of a video in its channel's message."""
    s = next((x for x in st["sections"] if x["id"] == sid), None)
    if s is None:
        s = {"id": sid, "kind": None, "title": None, "stages": []}
        st["sections"].append(s)
        st["sections"].sort(key=lambda x: (x["id"] != "_", x["id"]))
    if kind:
        s["kind"] = kind
    if title:
        s["title"] = title
    return s


def stage_of(sec, stage):
    return next((g for g in sec["stages"] if g["id"] == stage), None)


def set_stage(sec, stage, state, text=None, progress=None, t0=None, t1=None, now=None):
    """Upsert a stage. text None keeps the old text while the state stays the same."""
    now = int(now or time.time())
    g = stage_of(sec, stage)
    if not g:
        g = {"id": stage, "state": "wait", "text": None, "progress": None, "t0": None, "t1": None}
        sec["stages"].append(g)
        sec["stages"].sort(key=lambda x: ORDER.index(x["id"]) if x["id"] in ORDER else len(ORDER))
    if state == "run":
        g["t0"] = int(t0 or (g["t0"] if g["state"] == "run" else None) or now)
        g["t1"] = None
    elif state in ("done", "fail", "skip"):
        g["t0"] = int(t0) if t0 else g["t0"]
        g["t1"] = int(t1 or (g["t1"] if g["state"] == state else None) or now)
    else:
        g["t0"] = g["t1"] = None
    if text is not None:
        g["text"] = text or None
    elif state != g["state"]:
        g["text"] = None
    g["state"] = state
    g["progress"] = progress if state == "run" else None
    return g


def fmt_dur(sec):
    sec = int(max(0, sec))
    if sec < 60:
        return f"{sec} sn"
    m, s = divmod(sec, 60)
    if m < 60:
        return f"{m} dk {s} sn" if m < 10 and s else f"{m} dk"
    h, m = divmod(m, 60)
    return f"{h} sa {m} dk"


def bar(p, width=10):
    full = int(round(p * width))
    return "▓" * full + "░" * (width - full) + f" %{int(p * 100)}"


def esc(x):
    return html.escape(str(x), quote=False)


def detail(text, limit=48):
    """Short detail in monospace; a URL becomes a link."""
    text = (text or "").strip()
    if not text:
        return ""
    url = re.search(r"https?://\S+", text)
    link = f' <a href="{html.escape(url.group(0))}">izle ↗</a>' if url else ""
    if url:
        text = re.sub(r"[\s·—-]*https?://\S+[\s·—-]*", " ", text).strip()
        if not text:
            return link
    if len(text) > limit:
        text = text[:limit - 1].rstrip() + "…"
    return f" <code>{esc(text)}</code>" + (link if url else "")


def stage_line(g, now):
    emo, label = STAGES.get(g["id"], ("•", g["id"]))
    st, text = g["state"], g.get("text")
    if st == "info":
        return f"{emo} {label}{detail(text)}"
    icon = {"done": "✅", "fail": "❌", "skip": "⏭️", "run": "⏳"}.get(st, "▫️")
    line = f"{icon} {label}"
    if st == "run" and g.get("progress") is not None:
        bits = [bar(g["progress"])] + ([g["eta"]] if g.get("eta") else [])
        return line + detail(" · ".join(bits), 60)
    if st == "fail":
        return line + detail(text or "hata")
    return line + detail(text)


def current(sec):
    """The one stage worth showing for a section: a failure, else the latest running stage, else the
    furthest finished one (info lines such as topic/chars only when nothing else happened yet)."""
    gs = [g for g in sec["stages"] if g["state"] != "wait"]
    yt = stage_of(sec, "youtube")
    if yt and yt["state"] == "done" and not any(g["state"] in ("fail", "run") for g in gs):
        return yt                          # keep the YouTube link once the video is up
    for pick in (lambda g: g["state"] == "fail", lambda g: g["state"] == "run",
                 lambda g: g["state"] in ("done", "skip"), lambda g: True):
        hit = [g for g in gs if pick(g)]
        if hit:
            return hit[-1]
    return None


def day_label(key):
    if DATE_RE.match(key or ""):
        y, mo, d = (int(x) for x in key.split("-"))
        return f"{d} {MONTHS[mo - 1]}"
    return esc(key)


CH_ICON = {"tr": "🇹🇷", "en": "🌍"}


def channel_of(sid):
    return DEFAULT if sid == "_" else of_file(sid)


def msg_key(sid):
    """One Telegram message per channel and day: every video of the channel (and the general "_" steps,
    which are Düşün Bakalım's) lives in it."""
    return "ch-" + CHANNELS[channel_of(sid)]["id"]


AUTO = ("tts", "render", "mux", "youtube", "telegram")   # stages GitHub Actions writes (tools/live.py)


def publish_time(key, sid):
    """'24.10 19:00' (Istanbul) from videos/<key>/<sid>.json, or ''."""
    from datetime import datetime
    from zoneinfo import ZoneInfo
    try:
        p = json.loads((ROOT / "videos" / key / f"{sid}.json").read_text())["youtube"]["publish_at"]
        if p == "now":
            return "hemen"
        return datetime.fromisoformat(p).astimezone(ZoneInfo("Europe/Istanbul")).strftime("%d.%m %H:%M")
    except (OSError, ValueError, KeyError):
        return ""


def render(st, ch, secs, now=None):
    """The channel's message: per video its kind, publish time, title and the one automatic step it is at
    (voice, render %, YouTube link; written by GitHub Actions only, so it is never stale) + the run's footer."""
    now = now or time.time()
    out = [f"<b>{CH_ICON[CHANNELS[ch]['lang']]} {esc(ch)}</b> · {day_label(st.get('key', ''))}"]
    for sec in secs:
        g = current({**sec, "stages": [x for x in sec["stages"] if x["id"] in AUTO]})
        if sec["id"] == "_" or not g:
            continue
        kind = {"short": "📱 Short", "long": "📺 Uzun video"}.get(sec.get("kind"), "🎞️ Video")
        when = publish_time(st.get("key", ""), sec["id"])
        out += ["", f"{kind}{' · ' + esc(when) if when else ''}", f"<b>{esc(sec.get('title') or sec['id'])}</b>",
                stage_line(g, now)]
    if len(out) == 1:
        return None
    if st.get("footer"):
        out += ["", esc(st["footer"])]
    return "\n".join(out)[:4000]


def tg(method, fields, tries=4):
    """Telegram call that never raises: (ok, result | error description). Honors 429 retry_after."""
    for i in range(tries):
        try:
            r = call(method, fields)
            return r.get("ok", False), r.get("result", r.get("description"))
        except urllib.error.HTTPError as e:
            try:
                body = json.load(e)
            except ValueError:
                body = {}
            desc = body.get("description", str(e))
            if e.code == 429:   # flood control: wait as told, then retry
                time.sleep(min(60, float(body.get("parameters", {}).get("retry_after", 2 ** i))) + 0.5)
                continue
            return False, desc
        except Exception as e:  # network down, DNS, timeout: retry briefly, then give up
            if i + 1 < tries:
                time.sleep(1.5 * (i + 1))
                continue
            return False, str(e)
    return False, "rate limited"


def publish(store, st, now=None, last=None, only=None):
    """Send (first time) or edit each channel's message of the day.
    `last` (dict, optional): remembers the last text sent per message, so unchanged text is not re-sent.
    `only` (set of section ids, optional): touch just the messages of these sections' channels."""
    if not TOKEN:
        return False
    cid = chat_id(required=False)
    if not cid:
        return False
    groups = {}
    for sec in st["sections"]:
        groups.setdefault(msg_key(sec["id"]), []).append(sec)
    keys = None if only is None else {msg_key(sid) for sid in only}
    ok = True
    for key, secs in groups.items():
        if keys is not None and key not in keys:
            continue
        vids = [x for x in secs if x["id"] != "_"]
        if key not in st["msgs"] and vids and all((stage_of(x, "youtube") or {}).get("state") == "done" for x in vids):
            continue   # videos that are already up get no new message (e.g. after `clear`)
        text = render(st, channel_of(secs[0]["id"]), secs, now)
        if text is not None:
            ok = publish_one(store, st, key, text, cid, last) and ok
    return ok


def publish_one(store, st, sid, text, cid, last=None):
    m = st["msgs"].get(sid, {})
    mid = m.get("message_id")
    seen = (last or {}).get(sid, {})
    if last is not None and seen.get("text") == text and seen.get("mid") == mid:
        return True
    fresh = time.time() - (m.get("created") or 0) < REUSE_HOURS * 3600
    if mid and str(m.get("chat_id")) == str(cid) and fresh:
        ok, res = tg("editMessageText", {"chat_id": cid, "message_id": mid, "text": text,
                                         "disable_web_page_preview": True, "parse_mode": "HTML"})
        if ok or "not modified" in str(res):
            if last is not None:
                last[sid] = {"text": text, "mid": mid}
            return True
        if not any(x in str(res) for x in ("not found", "can't be edited", "MESSAGE_ID_INVALID")):
            warn(f"edit failed: {res}")
            return False   # transient: the next call edits again
    if store.remote and not mid:     # another job may have just started it
        store.refresh(pages=1)
        if store.state()["msgs"].get(sid):
            st["msgs"][sid] = store.state()["msgs"][sid]
            return publish_one(store, st, sid, text, cid, last)
    ok, res = tg("sendMessage", {"chat_id": cid, "text": text, "disable_web_page_preview": True, "parse_mode": "HTML"})
    if not (ok and isinstance(res, dict)):
        warn(f"send failed: {res}")
        return False
    mine = res["message_id"]
    # every writer keeps its own candidate record, so none is overwritten; the first message sent (smallest
    # id) wins and every later writer deletes its own copy
    store.put(f"{sid}/_msg.{WRITER}", f"{cid}|{mine}|{b36(time.time())}")
    if store.remote:
        time.sleep(3)
        store.refresh(pages=2)
        won = store.state()["msgs"].get(sid, {}).get("message_id")
        if won and won != mine:
            tg("deleteMessage", {"chat_id": cid, "message_id": mine})
            tg("editMessageText", {"chat_id": cid, "message_id": won, "text": text,
                                   "disable_web_page_preview": True, "parse_mode": "HTML"})
            mine = won
    st["msgs"][sid] = {"chat_id": cid, "message_id": mine, "created": time.time()}
    if last is not None:
        last[sid] = {"text": text, "mid": mine}
    return True


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "setup":
        ups = call("getUpdates").get("result", [])
        chats = [u["message"]["chat"]["id"] for u in ups if "message" in u]
        if not chats:
            sys.exit("no messages yet: send any message to the bot first")
        CHAT_FILE.parent.mkdir(exist_ok=True)
        CHAT_FILE.write_text(str(chats[-1]) + "\n")
        call("sendMessage", {"chat_id": chats[-1], "text": "✅ Bot bağlandı. Yeni Shorts'lar buraya Instagram'a hazır olarak gelecek."})
        print("chat id saved")
    elif cmd == "send":
        script = json.loads(Path(sys.argv[2]).read_text())
        cap = instagram_caption(script, of_file(Path(sys.argv[2]).name))
        import subprocess
        video = sys.argv[3]
        # sent as a file (sendDocument), so Telegram does not re-compress it; bot uploads are capped at 50 MB,
        # bigger masters go as a high-quality 1080p copy
        if Path(video).stat().st_size > 49 * 1024 * 1024:
            small = str(Path(video).with_suffix(".telegram.mp4"))
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-vf", "scale=1080:-2:flags=lanczos",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "9M", "-bufsize", "18M",
                            "-c:a", "copy", "-movflags", "+faststart", small], check=True)
            video = small
        fits = len(cap) <= 1024
        res = call("sendDocument", {"chat_id": chat_id(), "disable_content_type_detection": "true",
                                    "caption": cap if fits else "🎬 Instagram Reels için hazır. Açıklama aşağıda 👇"},
                   {"document": video})
        print("video sent", res.get("ok"))
        if not fits:
            call("sendMessage", {"chat_id": chat_id(), "text": cap})
    elif cmd == "text":
        call("sendMessage", {"chat_id": chat_id(), "text": sys.argv[2]})
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
