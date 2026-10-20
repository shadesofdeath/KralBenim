#!/usr/bin/env python3
"""Live Telegram status for the Daily batch workflow (the GitHub Actions side of `telegram.py status`).

  python tools/live.py monitor                 # monitor job: follow this run, keep the one message current
  python tools/live.py monitor --once --footer "⛔ İptal edildi"   # one last pass (cancelled run)
  python tools/live.py shard --name <date>-<slug> --shard I -- python build.py ... --shard I/K
  python tools/live.py note --name <date>-<slug> --url https://youtu.be/...   # finish job: video link

Design: parallel jobs never edit the Telegram message themselves (they would overwrite each other) and
a running job's log cannot be read from the API, so
  - each render shard runs build.py under `shard`: build.py's browsers keep their frame counts in
    RENDER_PROGRESS_DIR, `shard` publishes the shard's percentage (every 5 %) as a record
    tg/<date>/<slug>/shard<i> (telegram.Store: a commit status on the anchor commit, statuses: write);
  - the monitor job reads this run's job/step states (GET /actions/runs/{run}/jobs, actions: read) and
    the records every ~12 s, writes its stages as records too, and edits the message (only when the
    text changed: Telegram allows ~1 edit/s per chat, ~20/min in groups).
The records are the same ones telegram-status.yml writes for the cloud session's stages (plan,
script, review, push...), so the message continues where the writing stages left it.
Nothing here ever fails a job: errors are printed and ignored.

Env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, FILES (JSON list of scripts, monitor),
TELEGRAM_BOT_TOKEN (+ TELEGRAM_CHAT_ID or config/telegram_chat_id), LIVE_INTERVAL (s, default 12).
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import telegram as tgm  # noqa: E402

REPO = os.environ.get("GITHUB_REPOSITORY", "")
RUN = os.environ.get("GITHUB_RUN_ID", "0")
OWNED = ("tts", "render", "mux", "youtube", "telegram")   # stages the monitor writes


def split_name(name):
    """'2026-10-20-01-emu' -> ('2026-10-20', '01-emu')."""
    return name[:10], name[11:]


# ---------------------------------------------------------------- render shard wrapper

def read_progress(d):
    done = total = 0
    for p in Path(d).glob("*.json"):
        try:
            x = json.loads(p.read_text())
            done, total = done + int(x["done"]), total + int(x["total"])
        except (OSError, ValueError, KeyError):
            pass
    return done / total if total else 0.0


def cmd_shard(a, cmd):
    pdir = tempfile.mkdtemp(prefix="render-progress-")
    env = dict(os.environ, RENDER_PROGRESS_DIR=pdir)
    store = None
    if os.environ.get("LIVE_STATUS"):
        try:
            key, slug = split_name(a.name)
            store = tgm.Store(key)
            store.put(f"{slug}/shard{a.shard}", f"{RUN}|0", state="pending")
        except Exception as e:
            print(f"live: {e}", file=sys.stderr)
            store = None
    p = subprocess.Popen(cmd, env=env)   # the render itself: its exit code is ours
    last, last_t = 0, time.time()
    while p.poll() is None:
        time.sleep(3)
        if not store:
            continue
        try:
            pct = int(read_progress(pdir) * 100) // 5 * 5
            if pct > last and time.time() - last_t >= 8 and pct < 100:
                if store.put(f"{slug}/shard{a.shard}", f"{RUN}|{pct}", state="pending"):
                    last, last_t = pct, time.time()
        except Exception as e:
            print(f"live: {e}", file=sys.stderr)
    rc = p.returncode
    if store:
        try:
            store.put(f"{slug}/shard{a.shard}", f"{RUN}|{100 if rc == 0 else last}",
                      state="success" if rc == 0 else "failure")
        except Exception as e:
            print(f"live: {e}", file=sys.stderr)
    return rc


def cmd_note(a):
    if os.environ.get("LIVE_STATUS") and a.url:
        key, slug = split_name(a.name)
        tgm.Store(key).put(f"{slug}/youtube_url", "youtube", url=a.url)
    return 0


# ---------------------------------------------------------------- monitor

def job_state(j):
    """GitHub job/step -> (state, t0, t1)."""
    if not j:
        return "wait", None, None
    st, c = j.get("status"), j.get("conclusion")
    t0, t1 = tgm.ts(j.get("started_at")), tgm.ts(j.get("completed_at"))
    if st != "completed":
        return ("run" if st == "in_progress" else "wait"), t0, None
    return {"success": "done", "skipped": "skip"}.get(c, "fail"), t0, t1


def failed_step(j):
    s = next((x for x in (j or {}).get("steps", []) if x.get("conclusion") == "failure"), None)
    return f"adım: {s['name']}" if s else ("iptal edildi" if (j or {}).get("conclusion") == "cancelled" else "")


def publish_label(script):
    p = (script.get("youtube") or {}).get("publish_at", "")
    try:
        d = datetime.fromisoformat(p)
        return f"yayın {d.day} {tgm.MONTHS[d.month - 1]} {d:%H:%M}"
    except ValueError:
        return ""


class Video:
    def __init__(self, f):
        self.file = f
        self.date, self.slug = Path(f).parent.name, Path(f).stem
        self.name = f"{self.date}-{self.slug}"
        try:
            self.script = json.loads((tgm.ROOT / f).read_text())
        except (OSError, ValueError):
            self.script = {}
        self.kind = "long" if self.script.get("format") == "long" else "short"
        self.title = (self.script.get("youtube") or {}).get("title") or self.slug
        self.chars = sum(len(s.get("text", "")) for s in self.script.get("scenes", []))


def update(st, videos, jobs, now):
    """Fold this run's jobs + shard records into the state (in place). True when every video is final."""
    by_name = {j["name"]: j for j in jobs}
    final = True
    for v in videos:
        sec = tgm.section(st, v.slug, v.kind, v.title)
        prep = by_name.get(f"prepare {v.file}")
        s, t0, t1 = job_state(prep)
        text = {"run": "ElevenLabs + zaman çizelgesi", "wait": "sırada"}.get(s, "")
        if s == "done" and v.chars:
            text = f"{v.chars} karakter"
        if s == "fail":
            text = failed_step(prep)
        tgm.set_stage(sec, "tts", s, text, None, t0, t1, now)
        prep_state = s

        shards = [j for j in jobs if j["name"].startswith(f"render {v.name} ")]
        live = {i: pct for i, (run, pct) in st["shards"].get(v.slug, {}).items() if run == RUN}
        if shards:
            parts, states, t0s, t1s, fails = [], [], [], [], []
            for j in shards:
                i = j["name"].rsplit(" ", 1)[-1].split("/")[0]
                s, a0, a1 = job_state(j)
                states.append(s)
                t0s += [a0] if a0 else []
                t1s += [a1] if a1 else []
                if s == "fail":
                    fails.append(f"parça {i} {failed_step(j)}".strip())
                parts.append(1.0 if s in ("done", "skip") else (live.get(i, 0.0) if s == "run" else 0.0))
            n, n_done = len(shards), sum(x in ("done", "skip") for x in states)
            r0, r1 = (min(t0s) if t0s else None), (max(t1s) if t1s else None)
            if all(x in ("done", "skip") for x in states):
                tgm.set_stage(sec, "render", "done", f"{n} parça paralel" if n > 1 else "", None, r0, r1, now)
            elif "fail" in states and not any(x in ("run", "wait") for x in states):
                tgm.set_stage(sec, "render", "fail", "; ".join(fails), None, r0, r1, now)
            else:
                p = round(sum(parts) / n, 2)
                text = f"{n_done}/{n} parça" if n > 1 else ""
                if all(x == "wait" for x in states):
                    text = "makine bekleniyor"
                g = tgm.set_stage(sec, "render", "run", text, p, r0, None, now)
                g["eta"] = None
                if r0 and p >= 0.03:
                    left = (now - r0) * (1 - p) / p
                    g["eta"] = f"kalan ~{max(1, round(left / 60))} dk"
        elif prep_state in ("fail", "skip"):
            tgm.set_stage(sec, "render", "skip", "", None, None, None, now)
        else:
            tgm.set_stage(sec, "render", "wait", "", None, None, None, now)

        fin = by_name.get(f"finish {v.file}")
        steps = (fin or {}).get("steps", [])
        for stage, prefix in (("mux", "Build"), ("youtube", "Upload to YouTube"), ("telegram", "Send to Telegram")):
            step = next((x for x in steps if x["name"].startswith(prefix)), None)
            s, a0, a1 = job_state(step)
            if fin and fin.get("status") == "completed" and s in ("wait", "run"):
                s = "skip" if fin.get("conclusion") in ("success", "skipped") else "fail"
            text = ""
            if stage == "youtube":
                url = st.get("urls", {}).get(v.slug)
                if s == "done" and url:
                    text = " · ".join(x for x in (publish_label(v.script), url) if x)
                elif s == "done":
                    s, text = "skip", "YouTube anahtarı yok"
            if stage == "telegram" and s == "done":
                text = "video + Instagram açıklaması" if v.kind == "short" else "haber verildi"
            tgm.set_stage(sec, stage, s, text, None, a0, a1, now)
        final = final and bool(fin) and fin.get("status") == "completed"
    return final


def fetch_jobs():
    r = tgm.gh(f"actions/runs/{RUN}/jobs?per_page=100&filter=latest")
    if r is None:
        return None
    jobs, page = r.get("jobs", []), 2
    while len(jobs) < r.get("total_count", 0) and page < 5:
        more = tgm.gh(f"actions/runs/{RUN}/jobs?per_page=100&filter=latest&page={page}")
        if not more or not more.get("jobs"):
            break
        jobs += more["jobs"]
        page += 1
    return jobs


def sync(store, st, videos, posted):
    """Write the monitor's stages as records: on a state/text change, render progress in 5 % steps."""
    for v in videos:
        sec = tgm.section(st, v.slug)
        store.put_meta(v.slug, v.kind, v.title)
        for g in sec["stages"]:
            if g["id"] not in OWNED:
                continue
            k = (g["state"], g.get("text"), int((g.get("progress") or 0) * 20))
            if posted.get((v.slug, g["id"])) != k and store.put_stage(v.slug, g):
                posted[(v.slug, g["id"])] = k


def cmd_monitor(a):
    if not tgm.TOKEN or not tgm.chat_id(required=False):
        print("Telegram not set up: no live status")
        return 0
    try:
        files = json.loads(os.environ.get("FILES") or "[]")
    except ValueError:
        files = []
    videos = [Video(f) for f in files]
    if not videos:
        return 0
    store = tgm.Store(videos[0].date)
    store.refresh(pages=10)
    interval = float(os.environ.get("LIVE_INTERVAL", "12"))
    deadline = time.time() + float(os.environ.get("LIVE_MAX_MINUTES", "330")) * 60
    jobs, idle, tick, posted, last = [], 0, 0, {}, {}
    while True:
        if tick:
            store.refresh(pages=1)
        if tick % 3 == 0 or a.once:   # jobs every 3rd tick: the whole loop stays < ~450 API calls/hour
            jobs = fetch_jobs() or jobs
        st = store.state()
        gen = tgm.section(st, "_")
        push = tgm.stage_of(gen, "push")
        if push and push["state"] in ("run", "wait"):
            store.put_stage("_", tgm.set_stage(gen, "push", "done"))
        now = time.time()
        final = update(st, videos, jobs, now)
        others = [j for j in jobs if not j["name"].startswith(("monitor", "record"))]
        idle = idle + 1 if others and all(j["status"] == "completed" for j in others) else 0
        done = final or idle >= 4 or now > deadline or a.once
        sync(store, st, videos, posted)
        if done:
            states = [g["state"] for s in st["sections"] for g in s["stages"]]
            if a.footer:
                st["footer"] = a.footer
            elif "fail" in states:
                st["footer"] = f"⚠️ Bitti ama hata var (❌ satırına bak): https://github.com/{REPO}/actions/runs/{RUN}"
            else:
                t0s = [g["t0"] for s in st["sections"] for g in s["stages"] if g.get("t0")]
                st["footer"] = "🎉 Hepsi tamam" + (f" · toplam {tgm.fmt_dur(now - min(t0s))}" if t0s else "")
        tgm.publish(store, st, now, last)
        if done:
            if a.once:   # cancelled: leave no shard record pending
                for k, rec in list(store.seen.items()):
                    if "/shard" in k and rec["d"].startswith(f"{RUN}|"):
                        store.put(k, rec["d"], state="error")
            return 0
        tick += 1
        time.sleep(interval if tgm.GH_STATE["remaining"] > 150 else 60)


def main():
    argv = sys.argv[1:]
    cmd = argv[:argv.index("--")] if "--" in argv else argv
    rest = argv[argv.index("--") + 1:] if "--" in argv else []
    ap = argparse.ArgumentParser(prog="live.py")
    sub = ap.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("monitor")
    m.add_argument("--once", action="store_true")
    m.add_argument("--footer")
    s = sub.add_parser("shard")
    s.add_argument("--name", required=True)
    s.add_argument("--shard", required=True)
    s.add_argument("--of")
    n = sub.add_parser("note")
    n.add_argument("--name", required=True)
    n.add_argument("--url")
    a = ap.parse_args(cmd)
    if a.cmd == "shard":
        if not rest:
            sys.exit("shard: give the command after --")
        sys.exit(cmd_shard(a, rest))
    try:
        sys.exit(cmd_note(a) if a.cmd == "note" else cmd_monitor(a))
    except Exception as e:   # never fail the workflow over a status message
        print(f"live: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
