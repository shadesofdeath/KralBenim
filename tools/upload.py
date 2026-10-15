#!/usr/bin/env python3
"""Upload a rendered video to YouTube using the script's "youtube" block.

  YOUTUBE_TOKEN_JSON='<contents of youtube_token.json>' python tools/upload.py script.json out/video.mp4

script.json:
  "youtube": {"title": "...", "description": "...", "tags": [...], "category_id": "27",
              "publish_at": "2026-10-16T10:00:00+03:00"}   # omit publish_at to keep it private
Prints the video URL. Writes result JSON next to the video (<video>.youtube.json).
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build as gbuild
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]


def main():
    script_path, video = Path(sys.argv[1]), Path(sys.argv[2])
    meta = json.loads(script_path.read_text())["youtube"]
    creds = Credentials.from_authorized_user_info(json.loads(os.environ["YOUTUBE_TOKEN_JSON"]), SCOPES)
    if not creds.valid:
        creds.refresh(Request())
    yt = gbuild("youtube", "v3", credentials=creds, cache_discovery=False)

    status = {"privacyStatus": "private", "selfDeclaredMadeForKids": False}
    pub = meta.get("publish_at")
    if pub:
        when = datetime.fromisoformat(pub)
        if when > datetime.now(timezone.utc):
            status["publishAt"] = when.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        else:   # time already passed -> publish now
            status["privacyStatus"] = "public"
    body = {
        "snippet": {
            "title": meta["title"][:100],
            "description": meta.get("description", "")[:5000],
            "tags": meta.get("tags", []),
            "categoryId": str(meta.get("category_id", "27")),
            "defaultLanguage": "tr",
            "defaultAudioLanguage": "tr",
        },
        "status": status,
    }
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(str(video), chunksize=8 * 1024 * 1024, resumable=True))
    res = None
    while res is None:
        st, res = req.next_chunk()
        if st:
            print(f"upload {int(st.progress() * 100)}%")
    result = {"id": res["id"], "url": f"https://youtu.be/{res['id']}", "status": res.get("status", {}),
              "title": meta["title"], "script": str(script_path)}
    video.with_suffix(".youtube.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
    print(result["url"], result["status"])


if __name__ == "__main__":
    main()
