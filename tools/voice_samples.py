#!/usr/bin/env python3
"""Generate the same Turkish narration sample with several ElevenLabs voices/models
so a voice can be picked by ear. Output: samples/NN_<voice>_<model>.mp3 + samples/index.json"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

KEY = os.environ["ELEVENLABS_API_KEY"]
API = "https://api.elevenlabs.io"
OUT = Path("samples")
TEXT = ("Ocak 1954. Elba adası açıklarında, on bin metre yükseklikte, dünyanın en modern yolcu uçağı "
        "bir anda gökyüzünde parçalandı. Üç ay sonra aynı şey, Napoli üzerinde tekrar yaşandı. "
        "Peki suçlu kimdi? Cevap, hepimizin her uçuşta baktığı küçük bir pencerenin köşesinde saklıydı.")
MODELS = ["eleven_multilingual_v2", "eleven_v3"]
SETTINGS = {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True}


def call(method, path, body=None, raw=False):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return r.read() if raw else json.load(r)


def candidates(limit):
    q = urllib.parse.urlencode({"language": "tr", "page_size": 40, "sort": "usage_character_count_1y"})
    voices = call("GET", f"/v1/shared-voices?{q}")["voices"]
    # prefer narration-style voices
    pref = [v for v in voices if v.get("use_case") in ("narrative_story", "informative_educational", "narration")]
    seen, out = set(), []
    for v in pref + voices:
        if v["voice_id"] not in seen:
            seen.add(v["voice_id"])
            out.append(v)
    return out[:limit]


def main():
    OUT.mkdir(exist_ok=True)
    index = []
    for n, v in enumerate(candidates(int(sys.argv[1]) if len(sys.argv) > 1 else 8), 1):
        name = re.sub(r"[^A-Za-z0-9]+", "-", v["name"]).strip("-")[:30]
        info = {k: v.get(k) for k in ("voice_id", "public_owner_id", "name", "gender", "age", "accent",
                                       "use_case", "descriptive", "description")}
        for model in MODELS:
            body = {"text": TEXT, "model_id": model, "voice_settings": SETTINGS}
            path = f"/v1/text-to-speech/{v['voice_id']}?output_format=mp3_44100_128"
            try:
                audio = call("POST", path, body, raw=True)
            except urllib.error.HTTPError as e:
                if e.code in (400, 404) and n and "added" not in info:
                    # shared voices may need to be in the library first
                    try:
                        call("POST", f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", {"new_name": v["name"]})
                        info["added"] = True
                        audio = call("POST", path, body, raw=True)
                    except urllib.error.HTTPError as e2:
                        print(f"skip {name} {model}: {e2.code} {e2.read()[:200]}")
                        continue
                else:
                    print(f"skip {name} {model}: {e.code} {e.read()[:200]}")
                    continue
            f = OUT / f"{n:02d}_{name}_{model.replace('eleven_', '')}.mp3"
            f.write_bytes(audio)
            print("ok", f)
        index.append(info)
    # does eleven_v3 support the timestamps endpoint? (needed for sync)
    try:
        call("POST", f"/v1/text-to-speech/{index[0]['voice_id']}/with-timestamps",
             {"text": "Deneme bir iki.", "model_id": "eleven_v3"})
        print("eleven_v3 with-timestamps: OK")
    except urllib.error.HTTPError as e:
        print(f"eleven_v3 with-timestamps: FAIL {e.code} {e.read()[:200]}")
    (OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
