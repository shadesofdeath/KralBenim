#!/usr/bin/env python3
"""Rule check for scripts before preview/push: the CLAUDE.md rules that a program can verify.

  python tools/lint.py videos/2026-10-18/*.json
Prints ERROR (must fix) and WARN (look at it) lines; exits 1 if any ERROR.
"""
import json
import re
import sys
import unicodedata
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from plan import LIMITS  # noqa: E402
from channels import CHANNELS, of_file  # noqa: E402

VOICES = {"short": "j4vJUfke1j8j9OYq8V3b", "long": "j4vJUfke1j8j9OYq8V3b"}   # channel owner's choice (2026-10-19), all formats
MODEL = "eleven_v3"
SCENES = {"short": (8, 11), "long": (60, 80)}
THEME = "parchment"   # the channel's only visual style: sepia parchment + Kaşif (brand/kit/BRAND.md)


def shot_types():
    """Every shot type lives in its own scenes/studio/shots/<type>.js (removed Studio types are unknown)."""
    kinds = {}
    for js in sorted((ROOT / "scenes/studio/shots").glob("*.js")):
        # SHOTS.x = {kind: ...}, SH.x = {\n kind: ...}, (window.SHOTS || ...).x = {...}
        for name, kind in re.findall(r"\.(\w+)\s*=\s*\{\s*kind:\s*'(\w+)'", js.read_text()):
            kinds[name] = kind
    kinds["photo"] = "real"
    return kinds


def low(s):
    return s.replace("I", "ı").replace("İ", "i").lower()


def sentences(text):
    # "6.400" and "3,8" are not sentence ends
    return [s for s in re.split(r"(?<=[.?!…])\s+", text.strip()) if s]


def lint(path, kinds):
    err, warn = [], []
    s = json.loads(Path(path).read_text())
    fmt = s.get("format", "short")
    short = fmt == "short"
    sc = s.get("scenes", [])

    if s.get("engine") != "studio":
        err.append('"engine" must be "studio"')
    if s.get("theme") != THEME:
        err.append(f'"theme" must be "{THEME}": the channel has one style, sepia parchment + Kaşif (brand/kit/BRAND.md)')
    if s.get("fps") != 30:
        err.append('"fps" must be 30')
    # channel: on-screen name, file prefix and narrator must agree (tools/channels.py)
    ch = s.get("channel")
    if ch not in CHANNELS:
        err.append(f'"channel" must be one of: {", ".join(CHANNELS)}')
    else:
        if of_file(Path(path).name) != ch:
            err.append(f'file name prefix does not match channel {ch!r} (expected "{CHANNELS[ch]["prefix"]}NN-slug.json")')
        if s.get("narrator", "kasif") != CHANNELS[ch]["narrator"]:
            err.append(f'"narrator" must be "{CHANNELS[ch]["narrator"]}" for {ch}')
    tts = s.get("tts", {})
    if tts.get("voice_id") != VOICES[fmt] or tts.get("model") != MODEL or tts.get("provider") != "elevenlabs":
        err.append(f"tts must be elevenlabs / {VOICES[fmt]} / {MODEL} for {fmt} videos")

    lo, hi = SCENES[fmt]
    if not lo <= len(sc) <= hi:
        err.append(f"{len(sc)} scenes, need {lo}-{hi}")
    text = " ".join(x.get("text", "") for x in sc)
    tlo, thi, hard = LIMITS[fmt]
    if len(text) > hard:
        err.append(f"{len(text)} chars > hard limit {hard}")
    elif not tlo <= len(text) <= thi:
        warn.append(f"{len(text)} chars, target {tlo}-{thi}")
    # owner: narration must not sound like "yapıyor ediyor" — at most a third of sentences end in -yor
    ends = [re.sub(r"[^\wçğıöşü]+$", "", low(x)) for x in sentences(text)]
    yor = [e for e in ends if re.search(r"yor(um|sun|uz|sunuz|lar)?$", e)]
    if ends and len(yor) > len(ends) / 3:
        err.append(f"{len(yor)}/{len(ends)} sentences end in '-yor' (max a third): tell it like a YouTube narrator, mostly past tense (BRAND.md §6.3)")
    # owner: the voice reads naturally: no voice settings, no pause editing, no audio tags
    if s.get("pacing") or s.get("max_pause") or tts.get("settings") or any(x.get("tone") for x in sc):
        err.append('remove "pacing"/"max_pause", tts.settings and scene "tone": the voice reads naturally (BRAND.md §6.2)')
    for i, x in enumerate(sc):
        t = x.get("text", "").strip()
        if t and t[-1] not in ".?!…\"”'’:;,—-":
            warn.append(f"scene {i}: text ends without punctuation; the voice reads punctuation, end the phrase properly")
        if "  " in t or " ," in t or " ." in t or t.count("“") != t.count("”"):
            err.append(f"scene {i}: punctuation/spacing problem in {t!r}")
    if re.search(r"\b(km/sa|km/s|vb\.|vs\.|yy\.|örn\.)", text):
        warn.append("abbreviation in narration; write it out (TTS reads it literally)")

    # storyboard + per-scene rules
    for i, x in enumerate(sc):
        tag = f"scene {i}"
        if x.get("type") not in kinds:
            err.append(f"{tag}: unknown type {x.get('type')!r}")
        if not x.get("visual"):
            err.append(f"{tag}: missing \"visual\"")
        n = len(sentences(x.get("text", "")))
        if short and n > 2:
            err.append(f"{tag}: {n} sentences, Shorts scenes hold at most 2 (a scene may also be part of a sentence)")
        elif n > 3:
            warn.append(f"{tag}: {n} sentences (max 3)")
        if short and len(x.get("text", "").split()) > 14:
            warn.append(f"{tag}: {len(x['text'].split())} words, likely > 4 s on screen; split it")
        t = x.get("title", {})
        if len(t.get("white", "").split()) > 2 or len(t.get("gray", "").split()) > 3:
            warn.append(f"{tag}: kicker title too long (white <= 2, gray <= 3 words)")
        for name, needle in (x.get("cues") or {}).items():
            words = [low(w) for w in x.get("text", "").split()]
            hits = [k for k, w in enumerate(words) if low(needle) in w]
            if not hits:
                err.append(f"{tag}: cue {name}={needle!r} not in text")
            elif len(words[hits[0]]) > len(needle) + 6:
                warn.append(f"{tag}: cue {name}={needle!r} first matches {words[hits[0]]!r}; is that the word you meant?")
        p = x.get("params") or {}
        for k in ("src", "video"):
            if p.get(k) and "://" not in p[k]:
                if not (Path(path).parent / p[k]).exists():
                    if p.get("url"):
                        warn.append(f"{tag}: {p[k]} not downloaded here; build fetches params.url (preview shows a placeholder)")
                    else:
                        err.append(f"{tag}: media not found {p[k]}")
                if not p.get("credit"):
                    err.append(f"{tag}: photo/video without params.credit")
        if p.get("ai") and fmt == "short":
            warn.append(f"{tag}: AI-generated clip in a Short (keep Higgsfield clips to long videos)")
        if x.get("mascot"):
            err.append(f"{tag}: \"mascot\" (the old bulb) was removed; Kaşif appears through 'stage' or params.cast/kasif")
        if x.get("type") == "photo" and p.get("grade") not in (None, "sepia", "mono"):
            warn.append(f"{tag}: photo grade {p.get('grade')!r} is ignored; photos are printed sepia on the parchment")

    # variety
    types = [x.get("type") for x in sc]
    if short and len(set(types)) < 4:
        err.append(f"only {len(set(types))} scene types, Shorts need >= 4")
    if types:
        top = max(set(types), key=types.count)
        if types.count(top) > 0.6 * len(types):
            err.append(f"'{top}' is {types.count(top)}/{len(types)} scenes (> 60%)")
    run = 1
    for i in range(1, len(types)):
        run = run + 1 if types[i] == types[i - 1] else 1
        cap = 3 if types[i] == "stage" else 2   # Kaşif's journey may run 3 stage scenes
        if run > cap:
            err.append(f"scenes {i - run + 1}-{i}: {run}x '{types[i]}' in a row (max {cap})")

    # Kaşif is on screen in every 'stage' scene and in any shot that puts him in params.kasif or params.cast
    def has_kasif(x):
        p = x.get("params") or {}
        return x.get("type") == "stage" or bool(p.get("kasif")) or any(
            isinstance(c, dict) and (c.get("who") or "kasif") == "kasif" for c in (p.get("cast") or []))
    nk = sum(1 for x in sc if has_kasif(x))
    if types and nk < len(types) / 2:
        err.append(f"Kaşif in {nk}/{len(types)} scenes ('stage' or params.kasif/cast), brand needs at least half")
    if short:
        first = sentences(sc[0]["text"])[0] if sc else ""
        if not 3 <= len(first.split()) <= 10:
            err.append(f"first sentence has {len(first.split())} words, hook needs 3-10")
        if sc and (sc[-1]["text"].rstrip().endswith("?") or "yorum" in low(sc[-1]["text"])):
            err.append("last scene must be a complete punchline, not a question / comment call")
    else:
        if not sc or not sc[0].get("chapter"):
            err.append("long video: first scene needs \"chapter\"")
        idx = [i for i, x in enumerate(sc) if x.get("chapter")] + [len(sc)]
        for a, b in zip(idx, idx[1:]):
            if b - a > 12:
                warn.append(f"chapter at scene {a} runs {b - a} scenes (aim 8-12)")

    # cover
    c = s.get("cover")
    if not c:
        err.append("missing cover")
    else:
        words = " ".join(c.get("lines", [])).split()
        if not 2 <= len(c.get("lines", [])) <= 4 or not 3 <= len(words) <= 5:
            err.append(f"cover: {len(c.get('lines', []))} lines / {len(words)} words (need 2-4 lines, 3-5 words)")
        hl = c.get("highlight", [])
        if len(hl) != 1 or low(hl[0]) not in low(" ".join(c.get("lines", []))):
            err.append("cover.highlight must be exactly one word that appears in cover.lines")
        if not 0 <= c.get("scene", -1) < len(sc):
            err.append("cover.scene out of range")
        if short and sc:
            hook = set(re.findall(r"\w+", low(sentences(sc[0]["text"])[0])))
            if not hook & set(re.findall(r"\w+", low(" ".join(c.get("lines", []))))):
                warn.append("cover text and first sentence share no word; they must say the same idea")

    # youtube
    y = s.get("youtube")
    if not y:
        err.append("missing youtube block")
        return err, warn
    title = y.get("title", "")
    if len(title) > (60 if short else 70):
        err.append(f"title {len(title)} chars (max {60 if short else 70})")
    emoji = sum(1 for ch in title if unicodedata.category(ch) == "So")
    if emoji > 1:
        err.append(f"title has {emoji} emoji (max 1)")
    if sum(1 for w in title.split() if len(w) > 3 and w.isupper()) > 1:
        warn.append("title has ALL-CAPS words")
    desc = y.get("description", "")
    tags_h = re.findall(r"#\w+", desc)
    if short and (not tags_h or tags_h[0].lower() != "#shorts"):
        err.append("description: first hashtag must be #shorts")
    tag = "#" + low(s.get("channel") or "Düşün Bakalım").replace(" ", "")   # #düşünbakalım, #anlatayımgel
    if tag not in [low(h) for h in tags_h]:
        warn.append(f"description: add {tag}")
    if not 3 <= len(tags_h) <= 5:
        warn.append(f"description has {len(tags_h)} hashtags (3-5)")
    if not short and "Bu videoda:" not in desc:
        warn.append('long description: add "Bu videoda:" bullet list')
    tags = y.get("tags", [])
    if not 12 <= len(tags) <= 18 or sum(len(t) for t in tags) > 450:
        err.append(f"{len(tags)} tags / {sum(len(t) for t in tags)} chars (need 12-18, <= 450)")
    brand = low(s.get("channel") or "Düşün Bakalım")
    if brand not in [low(t) for t in tags]:
        warn.append(f'tags: add "{brand}"')
    if y.get("category_id") != "27":
        warn.append('category_id should be "27"')
    try:
        at = datetime.fromisoformat(y["publish_at"])
        if at < datetime.now(timezone.utc) + timedelta(minutes=45):
            err.append(f"publish_at {y['publish_at']} is less than 1 hour away")
    except (KeyError, ValueError):
        err.append("publish_at missing or not ISO 8601")
    return err, warn


def main():
    files = [f for f in sys.argv[1:] if not f.endswith(".youtube.json")]
    if not files:
        sys.exit(__doc__)
    kinds, bad = shot_types(), False
    for f in files:
        err, warn = lint(f, kinds)
        print(f"{f}: {'OK' if not err else f'{len(err)} error(s)'}" + (f", {len(warn)} warning(s)" if warn else ""))
        for e in err:
            print(f"  ERROR {e}")
        for w in warn:
            print(f"  WARN  {w}")
        bad |= bool(err)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
