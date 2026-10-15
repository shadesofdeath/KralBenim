#!/usr/bin/env python3
"""Send finished Shorts to the owner's Telegram, ready to repost as Instagram Reels.

  python tools/telegram.py setup                      # find the chat that messaged the bot -> config/telegram_chat_id
  python tools/telegram.py send script.json out/x.mp4 # video + Instagram caption
  python tools/telegram.py text "message"
Env: TELEGRAM_BOT_TOKEN. Chat id: TELEGRAM_CHAT_ID or config/telegram_chat_id.
"""
import json
import os
import sys
import uuid
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHAT_FILE = ROOT / "config" / "telegram_chat_id"
API = f"https://api.telegram.org/bot{os.environ.get('TELEGRAM_BOT_TOKEN', '')}"


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


def chat_id():
    cid = os.environ.get("TELEGRAM_CHAT_ID") or (CHAT_FILE.read_text().strip() if CHAT_FILE.exists() else "")
    if not cid:
        sys.exit("no chat id: message the bot once, then run `telegram.py setup`")
    return cid


def instagram_caption(script):
    yt = script.get("youtube", {})
    desc = yt.get("description", "")
    body = desc.split("\n\n#")[0].replace("#shorts", "").strip()
    body = body.replace("abone ol", "takip et").replace("YouTube", "")
    tags = [t for t in desc.rsplit("\n\n", 1)[-1].split() if t.startswith("#") and t != "#shorts"]
    tags = list(dict.fromkeys(tags + ["#reels", "#bilgi", "#ilginçbilgiler", "#öğrenmek", "#keşfet"]))
    return f"{yt.get('title', '')}\n\n{body}\n\n{' '.join(tags)}"[:2200]


def main():
    cmd = sys.argv[1]
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
        w, h, dur = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                             "stream=width,height:format=duration", "-of", "csv=p=0:s=,", sys.argv[3]],
                                            text=True).replace("\n", ",").strip(",").split(",")[:3]
        # Telegram needs the real size, otherwise vertical videos show up squashed
        res = call("sendVideo", {"chat_id": chat_id(), "supports_streaming": "true", "width": w, "height": h,
                                 "duration": int(float(dur)),
                                 "caption": "🎬 Instagram Reels için hazır. Açıklama aşağıda 👇"}, {"video": sys.argv[3]})
        print("video sent", res.get("ok"))
        call("sendMessage", {"chat_id": chat_id(), "text": cap})
    elif cmd == "text":
        call("sendMessage", {"chat_id": chat_id(), "text": sys.argv[2]})


if __name__ == "__main__":
    main()
