#!/usr/bin/env python3
"""Upload a rendered video to YouTube using the script's "youtube" block.

  python tools/upload.py videos/<date>/<file>.json out/video.mp4
  python tools/upload.py --thumbnail videos/<date>/<file>.youtube.json cover.jpg
  python tools/upload.py --delete ag <video id>...      # delete videos from a channel
  python tools/upload.py --fix-meta ag                  # recorded uploads: channel category + AI disclosure

The channel comes from the file name prefix (tools/channels.py) and uploads only with its own token
("youtube_env" secret; Düşün Bakalım may also use YOUTUBE_CLIENT_ID / _SECRET / _REFRESH_TOKEN). No token:
prints a note and exits 0 without a .youtube.json. Expired login, or a token whose YouTube channel is not
the script's channel: tells Telegram, uploads nothing, exits 1.

<file>.json:  "youtube": {"title", "description", "tags", "category_id", "publish_at"}  (no publish_at: private)
Category and the "altered or synthetic content" (AI) box come from the channel (tools/channels.py), not the script.
A video is always uploaded private + scheduled, never public at once: a publish_at that already passed moves
to the same time on the next day.
Sets <video>.jpg as the thumbnail, appends chapters (long videos, from <video>.timeline.json) and photo
credits to the description. Writes <video>.youtube.json and prints the URL.
"""
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from channels import CHANNELS, DEFAULT, by_id, of_file  # noqa: E402

TOKEN_URI = "https://oauth2.googleapis.com/token"
HEAD = {"tr": {"chapters": "⏱️ Bölümler", "credits": "📷 Görseller"},
        "en": {"chapters": "⏱️ Chapters", "credits": "📷 Image credits"}}


def token_info(channel):
    """The channel's own OAuth token dict, or None (never another channel's)."""
    env = os.environ.get(CHANNELS[channel]["youtube_env"], "").strip()
    if env:
        return json.loads(env)
    if channel == DEFAULT and os.environ.get("YOUTUBE_REFRESH_TOKEN"):
        return {"client_id": os.environ["YOUTUBE_CLIENT_ID"], "client_secret": os.environ["YOUTUBE_CLIENT_SECRET"],
                "refresh_token": os.environ["YOUTUBE_REFRESH_TOKEN"], "token_uri": TOKEN_URI}
    return None


def credentials(channel):
    """Refreshed credentials of the channel, or None without a token. Raises google.auth RefreshError
    (invalid_grant) when the login expired or was revoked."""
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    info = token_info(channel)
    if info is None:
        return None
    info.pop("scopes", None)   # refresh with whatever scopes were granted
    creds = Credentials.from_authorized_user_info(info)
    creds.refresh(Request())
    return creds


def channel_title(yt):
    items = yt.channels().list(part="snippet", mine=True).execute().get("items") or [{}]
    return (items[0].get("snippet") or {}).get("title")


def notify(msg):
    print(msg)
    try:
        import telegram
        telegram.call("sendMessage", {"chat_id": telegram.chat_id(), "text": msg})
    except Exception:
        pass


def open_channel(channel):
    """YouTube client for the channel, or exit: no token -> None; expired login or a token that belongs to
    another channel -> Telegram notice + exit 1 (a video never goes to the wrong channel)."""
    try:
        creds = credentials(channel)
    except Exception as e:   # RefreshError invalid_grant: the login expired or was revoked
        notify(relogin_hint(channel, e.__class__.__name__))
        sys.exit(1)
    if creds is None:
        return None
    yt = youtube(creds)
    title = channel_title(yt)
    if title != channel:
        c = CHANNELS[channel]
        notify(f"⛔ {channel}: {c['youtube_env']} token'ı '{title}' kanalına bağlı, yükleme YAPILMADI. "
               f"'YouTube login (phone)' > channel {c['id']} ile girişte {channel} kanalını seçin.")
        sys.exit(1)
    return yt


def schedule_time(publish_at, now=None):
    """publish_at, or the same time of day on the first later day that is at least 20 minutes away."""
    when, now = datetime.fromisoformat(publish_at), now or datetime.now(timezone.utc)
    while when < now + timedelta(minutes=20):
        when += timedelta(days=1)
    return when


def find_upload(yt, title):
    """Id of a video with this exact title among the channel's last 50 uploads, or None."""
    ch = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0]
    pl = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    items = yt.playlistItems().list(part="snippet", playlistId=pl, maxResults=50).execute().get("items", [])
    return next((i["snippet"]["resourceId"]["videoId"] for i in items if i["snippet"]["title"] == title), None)


def relogin_hint(channel, err):
    c = CHANNELS[channel]
    return (f"🔑 {channel}: YouTube girişi geçersiz ({err}). GitHub > Actions > 'YouTube login (phone)' > "
            f"channel {c['id']} çalıştır, gelen JSON'u {c['youtube_env']} secret'ına yapıştır; sonra videoyu yeniden başlat.")


def youtube(creds):
    from googleapiclient.discovery import build
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def media(path, **kw):
    from googleapiclient.http import MediaFileUpload
    return MediaFileUpload(str(path), **kw)


def chapters(video, lg):
    tl_path = video.with_suffix(".timeline.json")
    if not tl_path.exists():
        return ""
    tl = json.loads(tl_path.read_text())
    marks = [(s["start"], s["chapter"]) for s in tl["scenes"] if s.get("chapter")]
    if tl.get("format") != "long" or len(marks) < 3:
        return ""
    kept = [(0.0, marks[0][1])]
    for t, name in marks[1:]:
        if t - kept[-1][0] >= 10:          # YouTube needs >= 10 s per chapter
            kept.append((t, name))
    if len(kept) < 3:
        return ""
    return f"\n\n{HEAD[lg]['chapters']}\n" + "\n".join(f"{int(t) // 60}:{int(t) % 60:02d} {n}" for t, n in kept)


def credits(script, lg):
    """Attribution for photos/clips used by "photo" shots (CC BY / CC BY-SA require it)."""
    seen = list(dict.fromkeys(c for sc in script["scenes"] if (c := (sc.get("params") or {}).get("credit"))))
    return (f"\n\n{HEAD[lg]['credits']}\n" + "\n".join(seen)) if seen else ""


def description(desc, extra):
    """Chapters and credits go before the hashtag line so the hashtags stay at the very end."""
    head, sep, tags = desc.rpartition("\n\n#")
    return ((head + extra + sep + tags) if sep else desc + extra)[:5000]


def set_thumbnail(yt, video_id, jpg):
    try:
        yt.thumbnails().set(videoId=video_id, media_body=media(jpg, mimetype="image/jpeg")).execute()
        return True
    except Exception as e:   # Shorts / unverified channels may refuse custom thumbnails
        print(f"thumbnail not set: {e}")
        return False


def fix_meta(channel):
    """Give every recorded upload of the channel (videos/*/<prefix>*.youtube.json) the channel's category and
    AI disclosure; videos that already have them are left alone. Stops quietly when the daily quota runs out."""
    cfg = CHANNELS[channel]
    yt = open_channel(channel)
    if yt is None:
        sys.exit(f"no YouTube token for {channel}")
    ids = []
    for rec in sorted((Path(__file__).resolve().parent.parent / "videos").glob("*/*.youtube.json")):
        if of_file(rec.name) == channel and json.loads(rec.read_text()).get("id"):
            ids.append(json.loads(rec.read_text())["id"])
    ai, fixed = bool(cfg.get("ai_disclosure")), 0
    for i in range(0, len(ids), 50):
        for v in yt.videos().list(part="snippet,status", id=",".join(ids[i:i + 50])).execute().get("items", []):
            sn, st = v["snippet"], v["status"]
            if sn.get("categoryId") == cfg["category_id"] and st.get("containsSyntheticMedia", False) == ai:
                continue
            sn = {k: sn[k] for k in ("title", "description", "tags", "defaultLanguage", "defaultAudioLanguage") if k in sn}
            st = {k: st[k] for k in ("privacyStatus", "publishAt", "embeddable", "license", "publicStatsViewable",
                                     "selfDeclaredMadeForKids") if k in st}
            sn["categoryId"], st["containsSyntheticMedia"] = cfg["category_id"], ai
            try:
                yt.videos().update(part="snippet,status", body={"id": v["id"], "snippet": sn, "status": st}).execute()
            except Exception as e:
                if "quota" in str(e).lower():
                    print(f"quota exhausted after {fixed} videos; run again tomorrow")
                    return
                raise
            fixed += 1
            print(f"fixed {v['id']} {sn['title']}")
    print(f"{channel}: {fixed} of {len(ids)} videos updated (category {cfg['category_id']}, AI disclosure {ai})")


def main():
    if sys.argv[1] == "--thumbnail":
        rec = json.loads(Path(sys.argv[2]).read_text())
        yt = open_channel(of_file(Path(rec["script"]).name))
        if yt and set_thumbnail(yt, rec["id"], sys.argv[3]):
            print("thumbnail set", rec["id"])
        return
    if sys.argv[1] == "--delete":              # upload.py --delete <channel id> <video id>...
        channel = by_id(sys.argv[2])
        yt = open_channel(channel)
        for vid in sys.argv[3:]:
            yt.videos().delete(id=vid).execute()
            print(f"deleted {vid} from {channel}")
        return
    if sys.argv[1] == "--fix-meta":            # upload.py --fix-meta <channel id>
        fix_meta(by_id(sys.argv[2]))
        return
    script_path, video = Path(sys.argv[1]), Path(sys.argv[2])
    script = json.loads(script_path.read_text())
    meta, channel = script["youtube"], of_file(script_path.name)
    lg = CHANNELS[channel]["lang"]
    done = script_path.with_suffix(".youtube.json")
    if done.exists():   # already on YouTube (a re-run of the folder): never upload twice
        print(f"already uploaded: {json.loads(done.read_text()).get('url')}; skipped")
        video.with_suffix(".already").touch()
        return
    yt = open_channel(channel)
    if yt is None:
        print(f"no YouTube token for {channel} ({CHANNELS[channel]['youtube_env']}): upload skipped")
        return
    same = find_upload(yt, meta["title"])
    if same:            # on the channel already, but its record was lost: record it instead
        result = {"id": same, "thumbnail": False, "url": f"https://youtu.be/{same}", "status": {},
                  "title": meta["title"], "script": str(script_path)}
        video.with_suffix(".youtube.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
        video.with_suffix(".already").touch()
        print(f"already on the channel: {result['url']}; skipped")
        return

    cfg = CHANNELS[channel]
    status = {"privacyStatus": "private", "selfDeclaredMadeForKids": False,
              "containsSyntheticMedia": bool(cfg.get("ai_disclosure"))}
    if meta.get("publish_at"):   # always scheduled, never public at once: a passed time moves to the next day
        when = schedule_time(meta["publish_at"])
        status["publishAt"] = when.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        print(f"scheduled for {when.isoformat()}")
    body = {"snippet": {"title": meta["title"][:100],
                        "description": description(meta.get("description", ""), chapters(video, lg) + credits(script, lg)),
                        "tags": meta.get("tags", []), "categoryId": cfg["category_id"],
                        "defaultLanguage": lg, "defaultAudioLanguage": lg},
            "status": status}
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=media(video, chunksize=8 * 1024 * 1024, resumable=True))
    res = None
    while res is None:
        st, res = req.next_chunk()
        if st:
            print(f"upload {int(st.progress() * 100)}%")
    thumb = video.with_suffix(".jpg")
    result = {"id": res["id"], "thumbnail": thumb.exists() and set_thumbnail(yt, res["id"], thumb),
              "url": f"https://youtu.be/{res['id']}", "status": res.get("status", {}),
              "title": meta["title"], "script": str(script_path)}
    video.with_suffix(".youtube.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
    print(result["url"], result["status"])


if __name__ == "__main__":
    main()
