#!/usr/bin/env python3
"""YouTube login from a phone (Google's device flow), run by .github/workflows/youtube-auth.yml.

  YOUTUBE_DEVICE_CLIENT_ID=... YOUTUBE_DEVICE_CLIENT_SECRET=... TELEGRAM_BOT_TOKEN=... python tools/youtube_device_auth.py ag
A channel may have its own OAuth client (its own Google Cloud project, where its account is a test user):
YOUTUBE_DEVICE_CLIENT_ID_<ID> / YOUTUBE_DEVICE_CLIENT_SECRET_<ID> (e.g. _DB) win over the shared pair.

1. asks Google for a short code and sends "open google.com/device, enter CODE" to the Telegram chat;
2. waits (up to the code's lifetime, ~30 min) until the owner signs in on the phone and picks the channel;
3. checks which YouTube channel was authorized and sends that name plus the token JSON to the Telegram chat,
   to be pasted into the channel's GitHub secret (tools/channels.py "youtube_env"); the token is never logged.
The OAuth client must be of type "TVs and Limited Input devices" (the only type the device flow accepts).
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import telegram  # noqa: E402
from channels import CHANNELS, DEFAULT, by_id  # noqa: E402

SCOPE = "https://www.googleapis.com/auth/youtube"   # the device flow's YouTube scope; covers uploads and thumbnails


def post(url, fields):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(fields).encode())
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return json.load(e)


def say(text):
    print(text.split("\n")[0])
    telegram.call("sendMessage", {"chat_id": telegram.chat_id(), "text": text, "disable_web_page_preview": True})


def main():
    ch = by_id(sys.argv[1] if len(sys.argv) > 1 else DEFAULT) or DEFAULT
    own = CHANNELS[ch]["id"].upper()
    cid = os.environ.get(f"YOUTUBE_DEVICE_CLIENT_ID_{own}") or os.environ["YOUTUBE_DEVICE_CLIENT_ID"]
    secret = os.environ.get(f"YOUTUBE_DEVICE_CLIENT_SECRET_{own}") or os.environ["YOUTUBE_DEVICE_CLIENT_SECRET"]
    code = post("https://oauth2.googleapis.com/device/code", {"client_id": cid, "scope": SCOPE})
    if "device_code" not in code:
        say(f"❌ YouTube girişi başlamadı: {code.get('error_description') or code.get('error') or code}")
        return 1
    say(f"🔑 {ch} için YouTube girişi\n\n1) Telefonda aç: {code['verification_url']}\n2) Kodu gir: {code['user_code']}\n"
        f"3) {ch} kanalının Gmail hesabıyla giriş yap; hesap seçerken kişisel hesabı değil {ch} kanalını seç.\n\n"
        f"Kod {code['expires_in'] // 60} dakika geçerli.")
    deadline, wait = time.time() + code["expires_in"], code.get("interval", 5)
    while time.time() < deadline:
        time.sleep(wait)
        tok = post("https://oauth2.googleapis.com/token", {"client_id": cid, "client_secret": secret,
                                                           "device_code": code["device_code"],
                                                           "grant_type": "urn:ietf:params:oauth:grant-type:device_code"})
        err = tok.get("error")
        if err == "authorization_pending":
            continue
        if err == "slow_down":
            wait += 5
            continue
        if err in ("expired_token", "access_denied") or "xpired" in str(tok.get("error_description")):
            print(f"login not completed: {err}")   # an unused code: no Telegram noise
            return 0
        if err:
            say(f"❌ YouTube girişi olmadı: {tok.get('error_description') or err}")
            return 1
        break
    else:
        print("code expired unused")
        return 0
    req = urllib.request.Request("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
                                 headers={"Authorization": f"Bearer {tok['access_token']}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        items = json.load(r).get("items", [])
    name = items[0]["snippet"]["title"] if items else "(kanal bulunamadı)"
    info = {"token": tok["access_token"], "refresh_token": tok["refresh_token"], "token_uri": "https://oauth2.googleapis.com/token",
            "client_id": cid, "client_secret": secret, "scopes": [SCOPE]}
    say(f"✅ Bağlanan YouTube kanalı: {name}\n\n"
        + ("" if name == ch else f"⚠️ Bu {ch} değil! Bu token'ı kullanmayın; işi tekrar başlatıp doğru kanalı seçin.\n\n")
        + f"Aşağıdaki mesajın tamamını kopyalayıp GitHub'da şu secret'a yapıştırın: {CHANNELS[ch]['youtube_env']}\n"
        "Yapıştırdıktan sonra token mesajını bu sohbetten silin.")
    telegram.call("sendMessage", {"chat_id": telegram.chat_id(), "text": json.dumps(info)})
    print(f"authorized channel: {name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
