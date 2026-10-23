#!/usr/bin/env python3
"""API check for both channels, run before production (.github/workflows/api-check.yml, every morning and
as the first job of Daily batch):

  ElevenLabs  key valid, plan credits left this period, every channel's voice reachable
  YouTube     each channel's token refreshes (a fresh access token) and belongs to the right channel
  Telegram    bot token valid, chat id known

  python tools/check.py              # print the report (and write it to $GITHUB_STEP_SUMMARY)
  python tools/check.py --notify always     # also send it to Telegram (problems: only when something is wrong)
  python tools/check.py --relogin    # an expired YouTube login starts 'YouTube login (phone)' for that channel

Exit 1 when something is broken. Secrets are never printed.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import telegram  # noqa: E402
import upload  # noqa: E402
from channels import CHANNELS  # noqa: E402


def http(url, headers=None, body=None):
    req = urllib.request.Request(url, headers=headers or {}, data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            code, raw = r.status, r.read()
    except urllib.error.HTTPError as e:
        code, raw = e.code, e.read()
    except OSError as e:    # network down, DNS, timeout
        return 0, {"error": str(e)}
    try:
        return code, json.loads(raw) if raw.strip() else {}   # 204 No Content has no body
    except ValueError:
        return code, {}


def check_elevenlabs():
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        return [("❌", "ElevenLabs", "ELEVENLABS_API_KEY secret yok")]
    code, sub = http("https://api.elevenlabs.io/v1/user/subscription", {"xi-api-key": key})
    if code != 200:
        return [("❌", "ElevenLabs", f"anahtar geçersiz (HTTP {code})")]
    used, limit = sub.get("character_count", 0), sub.get("character_limit", 0)
    left = limit - used
    reset = sub.get("next_character_count_reset_unix")
    when = f", yenilenme {datetime.fromtimestamp(reset, timezone.utc):%d.%m}" if reset else ""
    out = [("⚠️" if left < 15000 else "✅", "ElevenLabs", f"{sub.get('tier', '?')} · kalan {left:,}/{limit:,} karakter{when}")]
    for name, c in CHANNELS.items():
        code, v = http(f"https://api.elevenlabs.io/v1/voices/{c['voice_id']}", {"xi-api-key": key})
        out.append(("✅" if code == 200 else "❌", f"Ses · {name}", v.get("name", "") if code == 200 else f"ses bulunamadı (HTTP {code})"))
    return out


def dispatch_relogin(channel):
    """Start 'YouTube login (phone)' for the channel (it sends the sign-in code to Telegram), unless one is
    already running for it."""
    token, repo = os.environ.get("GITHUB_TOKEN"), os.environ.get("GITHUB_REPOSITORY")
    if not (token and repo):
        return False
    api = f"https://api.github.com/repos/{repo}/actions/workflows/youtube-auth.yml"
    auth = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
    cid = CHANNELS[channel]["id"]
    for st in ("queued", "in_progress"):   # a login of this channel is already waiting for its code
        _, runs = http(f"{api}/runs?status={st}&per_page=20", auth)
        if any(r.get("display_title", "").endswith(f": {cid}") for r in runs.get("workflow_runs", [])):
            return True
    code, _ = http(f"{api}/dispatches", auth,
                   {"ref": os.environ.get("GITHUB_REF_NAME", "claude/shorts-pipeline"),
                    "inputs": {"channel": CHANNELS[channel]["id"]}})
    return code == 204


def check_youtube(relogin):
    out = []
    for name, c in CHANNELS.items():
        try:
            creds = upload.credentials(name)
        except Exception as e:
            msg = "giriş süresi dolmuş/iptal (invalid_grant)" if "invalid_grant" in str(e) else e.__class__.__name__
            if relogin and dispatch_relogin(name):
                msg += " → telefonla giriş başlatıldı, kod Telegram'a geliyor"
            else:
                msg += f" → 'YouTube login (phone)' çalıştır (channel {c['id']}), JSON'u {c['youtube_env']} secret'ına yapıştır"
            out.append(("❌", f"YouTube · {name}", msg))
            continue
        if creds is None:
            out.append(("❌", f"YouTube · {name}", f"{c['youtube_env']} secret yok (yükleme atlanır)"))
            continue
        code, r = http("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
                       {"Authorization": f"Bearer {creds.token}"})
        title = ((r.get("items") or [{}])[0].get("snippet") or {}).get("title")
        if code != 200 or not title:
            out.append(("❌", f"YouTube · {name}", f"token tazelendi ama kanal okunamadı (HTTP {code})"))
        elif title != name:   # uploads refuse this token (upload.py): log in again with the right channel
            msg = f"token yanlış kanala bağlı ('{title}'), yükleme yapılmaz"
            if relogin and dispatch_relogin(name):
                msg += " → telefonla giriş başlatıldı, girişte {name} kanalını seçin".replace("{name}", name)
            out.append(("❌", f"YouTube · {name}", msg))
        else:
            out.append(("✅", f"YouTube · {name}", "token tazelendi, kanal doğru"))
    return out


def check_telegram():
    if not telegram.TOKEN:
        return [("⚠️", "Telegram", "TELEGRAM_BOT_TOKEN yok (bildirim gönderilmez)")]
    ok, me = telegram.tg("getMe", {}, tries=2)
    if not ok:
        return [("❌", "Telegram", f"bot token geçersiz ({me})")]
    if not telegram.chat_id(required=False):
        return [("⚠️", "Telegram", f"@{me.get('username')} çalışıyor ama sohbet kimliği yok ('Telegram setup' çalıştır)")]
    return [("✅", "Telegram", f"@{me.get('username')}")]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--notify", choices=["always", "problems"])
    ap.add_argument("--relogin", action="store_true")
    a = ap.parse_args()
    rows = check_elevenlabs() + check_youtube(a.relogin) + check_telegram()
    bad = any(r[0] == "❌" for r in rows)
    lines = [f"{icon} {what}: {detail}" for icon, what, detail in rows]
    report = ("🩺 API kontrolü: sorun var" if bad else "🩺 API kontrolü: hepsi çalışıyor") + "\n" + "\n".join(lines)
    print(report)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as f:
            f.write(report.replace("\n", "\n\n") + "\n")
    if a.notify and telegram.TOKEN and telegram.chat_id(required=False):
        problems = [ln for ln in lines if not ln.startswith("✅")]
        if problems or a.notify == "always":
            telegram.tg("sendMessage", {"chat_id": telegram.chat_id(), "text": report, "disable_web_page_preview": True})
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
