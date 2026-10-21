#!/usr/bin/env python3
"""Telegram: finished Shorts (Instagram-ready) + ONE live status message per production day.

  python tools/telegram.py setup                      # find the chat that messaged the bot -> config/telegram_chat_id
  python tools/telegram.py send <file>.json out/x.mp4  # video + Instagram caption
  python tools/telegram.py text "message"
  python tools/telegram.py status <key> <stage> <state> [text] [--video SLUG] [--title T] [--kind short|long] [--progress 60%]
  python tools/telegram.py status <key> --batch '[{"stage": "script", "state": "done", "video": "01-x"}, ...]'

`status` keeps one message per <key> (the production date, e.g. 2026-10-20) and edits it in place:
the first call sends it, every later call (from any job or run) re-renders all stages and edits it.
<state>: wait | run | done | fail | skip | info (info = "label: text" line, e.g. topic, chars, publish).
Known stages: plan topic script chars visual preview review publish push tts render mux youtube telegram.
With --video the line goes under that video's heading (📱 SHORTS / 📺 UZUN VİDEO + title).
The cloud session does not call this directly (no token there): it dispatches telegram-status.yml.
Stage records live as commit statuses on an anchor commit (see Store) when GITHUB_TOKEN is set,
else in out/telegram/<key>.json. `status` never fails: no token/chat id/network -> silent exit 0.

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


def instagram_caption(script):
    yt = script.get("youtube", {})
    desc = yt.get("description", "")
    body = desc.split("\n\n#")[0].replace("#shorts", "").strip()
    body = body.replace("Bakalım'a abone ol", "Bakalım'ı takip et").replace("abone ol", "takip et").replace("YouTube", "")
    # Instagram allows at most 5 hashtags: up to 3 topic tags + brand + #keşfet
    topic = [t for t in desc.rsplit("\n\n", 1)[-1].split() if t.startswith("#") and t not in ("#shorts", "#düşünbakalım")]
    tags = list(dict.fromkeys(topic[:3] + ["#düşünbakalım", "#keşfet"]))[:5]
    return f"{yt.get('title', '')}\n\n{body}\n\n{' '.join(tags)}"[:2200]


# ---------------------------------------------------------------- live status message
# Where the state lives: every stage of every video is one GitHub commit status on a fixed "anchor"
# commit (the repo's first commit, nobody looks at it), context  tg/<key>/<section>/<stage>,
# description  state|t0|t1|progress|text.  Why: GITHUB_TOKEN can write and read them from any job
# (statuses: write), at any time, without commits, caches or artifacts; one context per stage means
# parallel writers never lose each other's updates (latest write per stage wins, which is what we want).
#   tg/<key>/_msg               chat_id|message_id|created     the one Telegram message of this key
#   tg/<key>/<slug>/_meta       kind|title                      video heading
#   tg/<key>/<slug>/shard<i>    run|percent                     live render progress of shard i
# Without GITHUB_TOKEN (local use) the same records go to a JSON file (out/telegram/<key>.json).
# Whoever writes then re-renders the whole message from all records and edits it, so the message is
# always complete. The message is HTML (bold headings, details in <code>); every value is escaped.

STAGES = {   # id: (emoji, short label)
    "plan": ("🗓️", "Plan"),
    "topic": ("💡", "Konu"),
    "script": ("✍️", "Senaryo"),
    "chars": ("🔤", "Karakter"),
    "visual": ("🎨", "Sahneler"),
    "preview": ("👀", "Önizleme"),
    "review": ("🧐", "Eleştiri"),
    "publish": ("🕒", "Yayın"),
    "push": ("🚀", "Gönderim"),
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
        st = {"key": self.key, "sections": [], "shards": {}}
        for k, v in self.seen.items():
            parts, d = k.split("/"), v["d"]
            if parts == ["_msg"]:
                c, m, cr = (d.split("|") + ["", "", ""])[:3]
                if m.isdigit():
                    st.update(chat_id=c, message_id=int(m), created=from36(cr) or 0, msg_id=v["id"])
                continue
            if len(parts) != 2:
                continue
            sid, stage = parts
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
    for s in st["sections"]:
        if s["id"] == sid:
            break
    else:
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


def parse_progress(v):
    """'60%' | '0.6' | '60' | '3/7' -> 0..1, or None."""
    if v is None or str(v).strip() == "":
        return None
    v = str(v).strip().rstrip("%").replace(",", ".")
    try:
        if "/" in v:
            a, b = v.split("/", 1)
            p = float(a) / float(b)
        else:
            p = float(v)
            p = p / 100 if p > 1 else p
    except (ValueError, ZeroDivisionError):
        return None
    return max(0.0, min(1.0, p))


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


def render(st, now=None):
    """Short: a heading, the general step on one line, then two lines per video (title, where it is)."""
    now = now or time.time()
    key = st.get("key", "")
    if DATE_RE.match(key):
        y, mo, d = (int(x) for x in key.split("-"))
        head = f"<b>🎥 Düşün Bakalım</b> · {d} {MONTHS[mo - 1]}"
    else:
        head = f"<b>🎥 Düşün Bakalım</b> · {esc(key)}"
    out = [head]
    for s in st["sections"]:
        g = current(s)
        if not g:
            continue
        if s["id"] == "_":
            out.append(stage_line(g, now))
            continue
        kind = {"short": "📱", "long": "📺"}.get(s.get("kind"), "🎞️")
        pub = stage_of(s, "publish")
        when = f" · {esc(pub['text'])}" if pub and pub.get("text") else ""
        out += ["", f"{kind} <b>{esc(s.get('title') or s['id'])}</b>{when}", stage_line(g, now)]
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


def publish(store, st, now=None, last=None):
    """Send (first time) or edit the key's one message with the full rendered state.
    `last` (dict, optional): remembers the last text sent, so unchanged text is not re-sent."""
    if not TOKEN:
        return False
    cid = chat_id(required=False)
    if not cid:
        return False
    text = render(st, now)
    if last is not None and last.get("text") == text and last.get("mid") == st.get("message_id"):
        return True
    mid = st.get("message_id")
    fresh = time.time() - (st.get("created") or 0) < REUSE_HOURS * 3600
    if mid and str(st.get("chat_id")) == str(cid) and fresh:
        ok, res = tg("editMessageText", {"chat_id": cid, "message_id": mid, "text": text,
                                         "disable_web_page_preview": True, "parse_mode": "HTML"})
        if ok or "not modified" in str(res):
            if last is not None:
                last.update(text=text, mid=mid)
            return True
        if not any(s in str(res) for s in ("not found", "can't be edited", "MESSAGE_ID_INVALID")):
            warn(f"edit failed: {res}")
            return False   # transient: the next call edits again
    ok, res = tg("sendMessage", {"chat_id": cid, "text": text, "disable_web_page_preview": True, "parse_mode": "HTML"})
    if not (ok and isinstance(res, dict)):
        warn(f"send failed: {res}")
        return False
    mine = res["message_id"]
    store.put("_msg", f"{cid}|{mine}|{b36(time.time())}")
    # two writers may have started a message at the same moment: the latest _msg record wins, the other
    # writer deletes its own message
    if store.remote:
        time.sleep(1)
        store.refresh(pages=1)
        won = store.state()
        if won.get("message_id") and won["message_id"] != mine:
            tg("deleteMessage", {"chat_id": cid, "message_id": mine})
            tg("editMessageText", {"chat_id": cid, "message_id": won["message_id"], "text": text,
                                   "disable_web_page_preview": True, "parse_mode": "HTML"})
            mine = won["message_id"]
    st.update(chat_id=cid, message_id=mine, created=time.time())
    if last is not None:
        last.update(text=text, mid=mine)
    return True


def apply_update(store, st, u, now=None):
    """One status update {stage, state, text, video, title, kind, progress} -> records."""
    sid = u.get("video") or "_"
    kind, title = u.get("kind"), u.get("title")
    if sid != "_":
        k2, t2 = script_info(store.key, sid)
        kind, title = kind or k2, title or t2
        if kind or title:
            store.put_meta(sid, kind, title)
    sec = section(st, sid, kind, title)
    g = set_stage(sec, u["stage"], u.get("state") or "info", u.get("text"), parse_progress(u.get("progress")),
                  now=now)
    store.put_stage(sid, g)


def script_info(key, slug):
    """(kind, title) of videos/<key>/<slug>.json, if it exists."""
    if not DATE_RE.match(key or ""):
        return None, None
    try:
        s = json.loads((ROOT / "videos" / key / f"{slug}.json").read_text())
    except (OSError, ValueError):
        return None, None
    return ("long" if s.get("format") == "long" else "short"), s.get("youtube", {}).get("title")


def status(argv):
    import argparse
    ap = argparse.ArgumentParser(prog="telegram.py status")
    ap.add_argument("key", help="production date (2026-10-20) or any name")
    ap.add_argument("stage", nargs="?", help="plan, topic, script, chars, review, publish, push, ... (or --batch)")
    ap.add_argument("state", nargs="?", choices=STATES)
    ap.add_argument("text", nargs="?")
    ap.add_argument("--video", help="video slug, e.g. 01-emu-savasi (gets its own heading)")
    ap.add_argument("--title")
    ap.add_argument("--kind", choices=("short", "long"))
    ap.add_argument("--progress", help="60%%, 0.6 or 3/7 (a bar while running)")
    ap.add_argument("--batch", help='JSON list of updates: [{"stage":..,"state":..,"text":..,"video":..}, ...]')
    a = ap.parse_args(argv)
    if not TOKEN or not chat_id(required=False):
        return 0   # Telegram not set up: silently do nothing
    try:
        updates = []
        if a.batch and a.batch.strip():
            b = json.loads(a.batch)
            updates += b if isinstance(b, list) else [b]
        if a.stage:
            updates.append({"stage": a.stage, "state": a.state or "info", "text": a.text, "video": a.video,
                            "title": a.title, "kind": a.kind, "progress": a.progress})
        store = Store(a.key)
        store.refresh()
        st = store.state()
        for u in updates:
            if u.get("stage"):
                apply_update(store, st, u)
        publish(store, st)
    except Exception as e:   # never break the caller
        print(f"telegram status: {e}", file=sys.stderr)
    return 0


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "status":
        sys.exit(status(sys.argv[2:]))
    if cmd == "setup":
        ups = call("getUpdates").get("result", [])
        chats = [u["message"]["chat"]["id"] for u in ups if "message" in u]
        if not chats:
            sys.exit("no messages yet: send any message to the bot first")
        CHAT_FILE.parent.mkdir(exist_ok=True)
        CHAT_FILE.write_text(str(chats[-1]) + "\n")
        call("sendMessage", {"chat_id": chats[-1], "text": "✅ Düşün Bakalım botu bağlandı. Yeni Shorts'lar buraya Instagram'a hazır olarak gelecek."})
        print("chat id saved")
    elif cmd == "send":
        script = json.loads(Path(sys.argv[2]).read_text())
        cap = instagram_caption(script)
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
        res = call("sendDocument", {"chat_id": chat_id(), "disable_content_type_detection": "true",
                                    "caption": "🎬 Instagram Reels için hazır (orijinal kalite). Açıklama aşağıda 👇"},
                   {"document": video})
        print("video sent", res.get("ok"))
        call("sendMessage", {"chat_id": chat_id(), "text": cap})
    elif cmd == "text":
        call("sendMessage", {"chat_id": chat_id(), "text": sys.argv[2]})
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
