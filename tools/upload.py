#!/usr/bin/env python3
"""Upload a rendered video to YouTube using the script's "youtube" block.

  YOUTUBE_TOKEN_JSON='<contents of youtube_token.json>' python tools/upload.py script.json out/video.mp4
  # or: YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN

script.json:
  "youtube": {"title": "...", "description": "...", "tags": [...], "category_id": "27",
              "publish_at": "2026-10-16T10:00:00+03:00"}   # omit publish_at to keep it private
Also sets <video>.jpg as the thumbnail if present, and for long videos appends chapters
built from scenes that have a "chapter" title (timings from <video>.timeline.json).
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



def credentials():
    if os.environ.get("YOUTUBE_TOKEN_JSON"):
        info = json.loads(os.environ["YOUTUBE_TOKEN_JSON"])
    else:
        info = {"client_id": os.environ["YOUTUBE_CLIENT_ID"], "client_secret": os.environ["YOUTUBE_CLIENT_SECRET"],
                "refresh_token": os.environ["YOUTUBE_REFRESH_TOKEN"], "token_uri": "https://oauth2.googleapis.com/token"}
    info.pop("scopes", None)   # refresh with whatever scopes were granted
    return Credentials.from_authorized_user_info(info)


def insert_chapters(desc, chap):
    """Chapters go before the hashtag block so hashtags stay at the very end."""
    if not chap:
        return desc
    head, sep, tags = desc.rpartition("\n\n#")
    return (head + chap + sep + tags) if sep else desc + chap


def chapters(video):
    tl_path = video.with_suffix(".timeline.json")
    if not tl_path.exists():
        return ""
    tl = json.loads(tl_path.read_text())
    marks = [(s["start"], s["chapter"]) for s in tl["scenes"] if s.get("chapter")]
    if tl.get("format") != "long" or len(marks) < 3:
        return ""
    marks[0] = (0.0, marks[0][1])
    kept = [marks[0]]
    for t, name in marks[1:]:
        if t - kept[-1][0] >= 10:          # YouTube needs >= 10 s per chapter
            kept.append((t, name))
    if len(kept) < 3:
        return ""
    fmt = lambda t: f"{int(t) // 60}:{int(t) % 60:02d}"
    return "\n\n⏱️ Bölümler\n" + "\n".join(f"{fmt(t)} {name}" for t, name in kept)


def credits(script):
    """Attribution for photos / clips used by studio "photo" shots (CC BY / CC BY-SA require it)."""
    seen = []
    for sc in script.get("scenes", []):
        c = (sc.get("params") or {}).get("credit")
        if c and c not in seen:
            seen.append(c)
    return ("\n\n📷 Görseller\n" + "\n".join(seen)) if seen else ""


def set_thumbnail(video_id, jpg):
    yt = gbuild("youtube", "v3", credentials=credentials(), cache_discovery=False)
    yt.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(str(jpg), mimetype="image/jpeg")).execute()
    print("thumbnail set", video_id)


def main():
    if sys.argv[1] == "--thumbnail":           # upload.py --thumbnail <video.youtube.json> <cover.jpg>
        return set_thumbnail(json.loads(Path(sys.argv[2]).read_text())["id"], sys.argv[3])
    script_path, video = Path(sys.argv[1]), Path(sys.argv[2])
    script = json.loads(script_path.read_text())
    meta = script["youtube"]
    creds = credentials()
    if not creds.valid:
        creds.refresh(Request())
    yt = gbuild("youtube", "v3", credentials=creds, cache_discovery=False)

    status = {"privacyStatus": "private", "selfDeclaredMadeForKids": False}
    # realistic AI-generated footage (Higgsfield clips, "ai": true) must be disclosed to YouTube
    if any((sc.get("params") or {}).get("ai") for sc in script.get("scenes", [])):
        status["containsSyntheticMedia"] = True
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
            "description": insert_chapters(meta.get("description", ""), chapters(video) + credits(script))[:5000],
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
    thumb = video.with_suffix(".jpg")
    thumb_ok = False
    if thumb.exists():
        try:
            yt.thumbnails().set(videoId=res["id"], media_body=MediaFileUpload(str(thumb), mimetype="image/jpeg")).execute()
            thumb_ok = True
        except Exception as e:   # Shorts / unverified channels may refuse custom thumbnails
            print(f"thumbnail not set: {e}")
    result = {"id": res["id"], "thumbnail": thumb_ok, "url": f"https://youtu.be/{res['id']}", "status": res.get("status", {}),
              "title": meta["title"], "script": str(script_path)}
    video.with_suffix(".youtube.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
    print(result["url"], result["status"])


if __name__ == "__main__":
    main()
