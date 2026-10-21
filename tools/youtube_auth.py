#!/usr/bin/env python3
"""One-time YouTube login for a channel: prints the token JSON to store as that channel's GitHub secret.

Run on your own computer (it opens a browser), not in the cloud:
  pip install google-auth-oauthlib
  python tools/youtube_auth.py client_secret.json
  # or without the file: YOUTUBE_CLIENT_ID=... YOUTUBE_CLIENT_SECRET=... python tools/youtube_auth.py

In the browser, sign in with the Google account that owns the channel and pick the channel itself
(Anlatayım Gel, not the personal account). Copy the printed JSON into the GitHub secret named in
tools/channels.py ("youtube_env", e.g. YOUTUBE_TOKEN_JSON_AG).
"""
import json
import os
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.upload",   # upload videos
          "https://www.googleapis.com/auth/youtube"]          # set thumbnails, read the channel


def main():
    if len(sys.argv) > 1:
        flow = InstalledAppFlow.from_client_secrets_file(sys.argv[1], SCOPES)
    else:
        cfg = {"installed": {"client_id": os.environ["YOUTUBE_CLIENT_ID"], "client_secret": os.environ["YOUTUBE_CLIENT_SECRET"],
                             "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                             "token_uri": "https://oauth2.googleapis.com/token", "redirect_uris": ["http://localhost"]}}
        flow = InstalledAppFlow.from_client_config(cfg, SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent")   # consent: always returns a refresh token
    print("\n--- token JSON (copy everything between the lines into the GitHub secret) ---")
    print(json.dumps(json.loads(creds.to_json())))
    print("---")


if __name__ == "__main__":
    main()
