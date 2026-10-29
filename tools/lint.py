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
from plan import LIMITS_BELGESEL, LIMITS, SCENES  # noqa: E402
from channels import CHANNELS, DEFAULT, of_file  # noqa: E402

MODEL = "eleven_v3"     # voice per channel: tools/channels.py voice_id
SETS = ["field", "hills", "desert", "sea", "ocean", "coast", "city", "interior", "night", "snow", "storm"]   # scenes/studio/sets.js
CAM_MOVES = ["push", "pull", "left", "right", "up", "down", "still"]                                  # engine.js camera
THEME = "parchment"   # sepia parchment + Kaşif (brand/kit/BRAND.md): Stickstory
BELGESEL = "belgesel"  # documentary style (docs/BELGESEL.md, owner 2026-10-29): every Düşün Bakalım video
# channel analytics (owner, 2026-10-26): ~46% of Shorts viewers swipe away in the first 1-2 s, long videos are left
# halfway (39% average view), long-video CTR 0.96%, Shorts viewers rarely subscribe. The rules below target that.
GREETING = re.compile(r"\b(merhaba|selam(lar)?|hoş ?geldiniz|kanal(ım)?a hoş|bu videoda|bugün sizlere|bugün size|"
                      r"başlamadan önce|hello|hi (everyone|guys|there)|welcome|in this video|today (we|i)('ll| will| are)|"
                      r"before we (start|begin)|let'?s talk about)\b", re.I)
CTA = re.compile(r"\b(subscribe|follow|abone|takip)", re.I)
HOOK = re.compile(r"[?!…]|\b(but|until|nobody|no one|never|here'?s the|wait|the (strange|crazy|wild|worst) part|"
                  r"ama|fakat|peki|kimse|hiç kimse|asla|işte tam|meğer|tahmin edin|bekleyin)\b", re.I)
FLAT_TITLE = re.compile(r"\b(history of|explained|documentary|the story of|a short history|tarihi?\s*$|belgesel|"
                        r"hikayesi\s*$|hikâyesi\s*$|nedir\s*$|kimdir\s*$)", re.I)
TITLE_HOOK = re.compile(r"[?!]|\b(why|how|what|who|secret|nobody|no one|never|almost|only|nearly|wrong|truth|"
                        r"really|impossible|mistake|stopped|vanished|survived|neden|nasıl|niye|kim|kimse|hiç|asla|"
                        r"sır|neredeyse|sadece|yanlış|gerçek|aslında|imkânsız|imkansız|hata)\b", re.I)


def shot_types():
    """Every shot type lives in its own scenes/studio/shots/<type>.js."""
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
    bt = s.get("theme") == BELGESEL
    want = CHANNELS.get(s.get("channel"), {}).get("theme")
    if want and s.get("theme") != want:
        err.append(f'"theme" must be "{want}" for {s.get("channel")} (tools/channels.py; '
                   + ("docs/BELGESEL.md" if want == BELGESEL else "brand/kit/BRAND.md") + ")")
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
        if s.get("lang", "tr") != CHANNELS[ch]["lang"]:
            err.append(f'"lang" must be "{CHANNELS[ch]["lang"]}" for {ch} (voice, screen text, cover and YouTube metadata)')
    cfg = CHANNELS.get(ch, CHANNELS[DEFAULT])
    en = cfg["lang"] == "en"
    voice = cfg["voice_id"]
    tts = s.get("tts", {})
    if tts.get("voice_id") != voice or tts.get("model") != MODEL or tts.get("provider") != "elevenlabs":
        err.append(f"tts must be elevenlabs / {voice} / {MODEL} for {ch}")

    lo, hi = SCENES[fmt]
    if not lo <= len(sc) <= hi:
        err.append(f"{len(sc)} scenes, need {lo}-{hi}")
    text = " ".join(x.get("text", "") for x in sc)
    tlo, thi, hard = (LIMITS_BELGESEL if bt else LIMITS)[fmt]
    if len(text) > hard:
        err.append(f"{len(text)} chars > hard limit {hard}")
    elif not tlo <= len(text) <= thi:
        warn.append(f"{len(text)} chars, target {tlo}-{thi}")
    # owner: narration must not sound like "yapıyor ediyor" — at most a third of sentences end in -yor
    ends = [re.sub(r"[^\wçğıöşü]+$", "", low(x)) for x in sentences(text)]
    yor = [] if en else [e for e in ends if re.search(r"yor(um|sun|uz|sunuz|lar)?$", e)]
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
    if re.search(r"\b(km/sa|km/s|km/h|mph|vb\.|vs\.|yy\.|örn\.|etc\.|e\.g\.|i\.e\.|approx\.)", text):
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
        if bt and (t.get("white") or t.get("gray")):
            warn.append(f"{tag}: belgesel style shows no kicker title (top-left stays empty)")
        elif len(t.get("white", "").split()) > 2 or len(t.get("gray", "").split()) > 3:
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
                    err.append(f"{tag}: media not found {p[k]}")
                if not p.get("credit"):
                    err.append(f"{tag}: photo/video without params.credit")
        if p.get("ai") or "higgsfield" in str(p.get("credit", "")).lower() or "/hf-" in str(p.get("video", "")):
            err.append(f"{tag}: AI-generated clip; the owner banned Higgsfield/AI footage (2026-10-22), draw it in code")
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

    # Kaşif is the host (owner, 2026-10-26): on screen in 15-25% of the scenes (opening, chapter turns, key moments),
    # the rest belongs to the story itself. He is in a scene through params.kasif or a params.cast entry ("who" kasif or none).
    def has_kasif(x):
        p = x.get("params") or {}
        return bool(p.get("kasif")) or any(
            isinstance(c, dict) and (c.get("who") or "kasif") == "kasif" for c in (p.get("cast") or []))
    nk = sum(1 for x in sc if has_kasif(x))
    if bt and nk:
        err.append("belgesel style has no on-screen host: remove params.kasif / Kaşif cast (docs/BELGESEL.md)")
    if types and not bt:
        share = nk / len(types)
        if nk == 0:
            err.append("Kaşif in no scene: the host opens or turns the story at least once (BRAND.md §2)")
        elif share > 0.35:
            err.append(f"Kaşif in {nk}/{len(types)} scenes ({share:.0%}): he is the host now, 15-25% of the scenes, max 35% (BRAND.md §2)")
        elif not 0.15 <= share <= 0.25:
            warn.append(f"Kaşif in {nk}/{len(types)} scenes ({share:.0%}), aim for 15-25% (BRAND.md §2)")
    # sets + camera (BRAND.md §5.1): the frame is a world, and the shot sizes change
    named = {(x["set"] if isinstance(x.get("set"), str) else (x.get("set") or {}).get("name")) for x in sc if x.get("set")}
    close = sum(1 for x in sc if isinstance(x.get("camera"), dict) and x["camera"].get("focus"))
    for i, x in enumerate(sc):
        v = x.get("set")
        nm = v if isinstance(v, str) else (v.get("name") if isinstance(v, dict) else None)
        if v not in (None, False) and nm not in SETS:
            err.append(f'scene {i}: "set" must be one of {", ".join(SETS)} (or false)')
        c = x.get("camera")
        if c not in (None, False) and not (isinstance(c, dict) and (not c.get("focus") or (isinstance(c["focus"], list) and len(c["focus"]) == 2))
                                           and c.get("move", "push") in CAM_MOVES):
            err.append(f'scene {i}: "camera" is false or {{"focus": [x, y], "zoom", "move": {"|".join(CAM_MOVES)}}}')
    if bt and named - {False, None}:
        warn.append('belgesel shots draw their own sparse world; "set" is ignored')
    if bt and not s.get("palette"):
        warn.append('no "palette": pick the belgesel theme that fits the topic and differs from the last video (docs/BELGESEL.md)')
    if bt and any(not str(x.get("type", "")).startswith("bt_") and x.get("type") != "photo" for x in sc):
        err.append("belgesel videos use only bt_* shots (and photo); parchment shots (stage, map, board...) are another style")
    if not bt and not named - {False, None}:
        warn.append('no scene has a "set": give the story its world (hills, sea, city, interior, night...; BRAND.md §5.1)')
    if not bt and close < (1 if short else 4):
        warn.append(f'{close} close-up(s) ("camera": {{"focus": [x, y], "zoom"}}): use >= {1 if short else 4} to vary the shot sizes (BRAND.md §5.1)')
    # first ~30 s (~420 chars): straight into the event, no greeting / channel intro / "in this video"
    if GREETING.search(text[:420]):
        err.append(f"opening has a greeting/intro ({GREETING.search(text[:420]).group(0)!r}): start inside the event (BRAND.md §6.1)")
    if short:
        first = sentences(sc[0]["text"])[0] if sc else ""
        if not 3 <= len(first.split()) <= 8:
            err.append(f"first sentence has {len(first.split())} words, the 2-second hook needs 3-8")
        if re.match(r"(in |on |back in )?(\d{3,4}|\w+ \d{3,4})\b|\d{3,4}('|’)?(de|da|te|ta|yılında)\b", low(first)):
            warn.append("first sentence opens with a date: open with the most striking moment, date later")
        last = sentences(sc[-1]["text"]) if sc else []
        if not last or not CTA.search(last[-1]):
            err.append("Shorts end: punchline, then ONE natural subscribe line with a reason (e.g. 'Subscribe for a true "
                       "story like this every day.' / 'Her gün böyle gerçek bir hikâye için abone olun.')")
        if sc and (sc[-1]["text"].rstrip().endswith("?") or re.search(r"yorum|comment", low(sc[-1]["text"]))):
            err.append("last scene: punchline + subscribe line, not a question / comment call")
        if last and len(last[-1].split()) > 12:
            warn.append("subscribe line is long; keep it to one short natural sentence")
    else:
        if not sc or not sc[0].get("chapter"):
            err.append("long video: first scene needs \"chapter\"")
        if sc and sc[0].get("type") == "chapter":
            err.append("long video: open on the event itself (cold open), not on a chapter card")
        idx = [i for i, x in enumerate(sc) if x.get("chapter")] + [len(sc)]
        for a, b in zip(idx, idx[1:]):
            if b - a > 12:
                warn.append(f"chapter at scene {a} runs {b - a} scenes (aim 8-12)")
            end = sc[b - 1]["text"] if b < len(sc) else ""
            if end and not HOOK.search(end):
                warn.append(f"chapter ending at scene {b - 1} has no hook into the next one (question, 'but…', cliffhanger)")
        # a story hook at least every ~45-60 s (~14 chars/s): question, 'but nobody…', cliffhanger
        pos = 0
        while pos + 840 < len(text):
            if not HOOK.search(text[pos:pos + 840]):
                warn.append(f"~1 minute without a hook around chars {pos}-{pos + 840}: add a question or tension line")
                break
            pos += 420

    # sources (owner, 2026-10-26: research must be visible): "sources" list for the description + on-screen notes
    srcs = s.get("sources") or []
    need = 2 if short else 3
    if len(srcs) < need or not all(isinstance(x, dict) and x.get("title") for x in srcs):
        err.append(f'"sources": need >= {need} entries {{"title": "...", "url": "https://..."}} (shown in the description)')
    elif not any(str(x.get("url", "")).startswith("http") for x in srcs):
        warn.append("sources: no entry has a url; add the page you verified the facts on")
    notes = [x for x in sc if x.get("source")]
    if not bt and len(notes) < (1 if short else 3):
        err.append(f'scene "source" (short on-screen note, e.g. "NASA"): need >= {1 if short else 3} scenes with one, on the key facts')
    for i, x in enumerate(notes):
        if len(str(x["source"]).split()) > 5:
            warn.append(f"scene {sc.index(x)}: on-screen source note too long (<= 5 words)")
    pals = json.loads((ROOT / "scenes/studio" / ("belgesel-themes.json" if bt else "palettes.json")).read_text())
    own = [k for k in pals if not k.startswith("_") and (bt or k.startswith("ag-") == (ch == "Stickstory"))]
    if s.get("palette") and s["palette"] not in own:
        err.append(f'"palette" must be one of this channel\'s sets: {", ".join(own)} (or leave it out: random per video)')

    # cover
    c = s.get("cover")
    if not c:
        err.append("missing cover")
    else:
        words = " ".join(c.get("lines", [])).split()
        if not 1 <= len(c.get("lines", [])) <= 3 or not 2 <= len(words) <= 4:
            err.append(f"cover: {len(c.get('lines', []))} lines / {len(words)} words (need 1-3 lines, 2-4 words: one curiosity claim)")
        if not short and not (isinstance(c.get("focus"), list) and len(c["focus"]) == 2):
            err.append("long cover needs \"focus\": [x, y] (stage px) of the ONE object it shows; the rest fades out (BRAND.md §9)")
        hl = c.get("highlight", [])
        if len(hl) != 1 or low(hl[0]) not in low(" ".join(c.get("lines", []))):
            err.append("cover.highlight must be exactly one word that appears in cover.lines")
        if not 0 <= c.get("scene", -1) < len(sc):
            err.append("cover.scene out of range")
        if short and sc:
            hook = set(re.findall(r"\w+", low(sentences(sc[0]["text"])[0])))
            if not hook & set(re.findall(r"\w+", low(" ".join(c.get("lines", []))))):
                warn.append("cover text and first sentence share no word; they must say the same idea")

    # youtube: SEO score out of 100 (CLAUDE.md step 8); anything below 100 is an error, for every channel
    y = s.get("youtube")
    if not y:
        err.append("missing youtube block")
        return err, warn
    seo = seo_score(s, y, short, en, cfg)
    if seo:
        err.append(f"SEO {100 - sum(p for p, _ in seo)}/100: " + "; ".join(m for _, m in seo))
    if y.get("publish_at") == "now":     # immediate public upload, only for videos the owner asked for
        if not s.get("extra"):
            err.append('publish_at "now" is only for extra videos ("extra": true)')
        return err, warn
    try:
        at = datetime.fromisoformat(y["publish_at"])
        if at < datetime.now(timezone.utc) + timedelta(minutes=45):
            err.append(f"publish_at {y['publish_at']} is less than 1 hour away")
    except (KeyError, ValueError):
        err.append("publish_at missing or not ISO 8601")
    return err, warn


def norm(t):
    """Accent- and case-free text for keyword matching (Türkçe ı/İ included)."""
    t = unicodedata.normalize("NFKD", low(t).replace("ı", "i"))
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", "".join(c for c in t if not unicodedata.combining(c)))).strip()


def seo_score(s, y, short, en, cfg):
    """Every check costs points; returns [(points, problem)] (empty = 100/100). The rules are CLAUDE.md step 8."""
    miss = []
    title, desc, tags = y.get("title", ""), y.get("description", ""), y.get("tags", [])
    kw = norm(tags[0]) if tags else ""                       # tags[0] is the main keyword people search for
    # title (25)
    tmax = 60 if short else 70
    if not 30 <= len(title) <= tmax:
        miss.append((8, f"title {len(title)} chars (need 30-{tmax})"))
    if not kw or not norm(title).startswith(kw.split()[0]) or kw not in norm(title):
        miss.append((8, f"title must start with the main keyword (tags[0] {tags[:1]})"))
    if not re.search(r"[?!:]", title):
        miss.append((3, "title needs a curiosity gap (question, claim or 'Keyword: hook')"))
    if FLAT_TITLE.search(title) or (not short and not TITLE_HOOK.search(title.split(":", 1)[-1]) and len(title.split(":", 1)[-1].split()) < 4):
        miss.append((5, "title reads like information, not a hook: after the keyword, an open question or surprising "
                        "claim the video answers ('…: How a Tiny Island Stopped an Empire')"))
    if sum(1 for ch in title if unicodedata.category(ch) == "So") > 1 or sum(
            1 for w in title.split() if len(w) > 3 and w.isupper()) > 1:
        miss.append((6, "title: at most 1 emoji and no ALL-CAPS words"))
    # description (35)
    if kw not in norm(desc[:150]):
        miss.append((8, "description: main keyword must be in the first 150 characters"))
    if len(desc) < (250 if short else 600):
        miss.append((6, f"description {len(desc)} chars (need >= {250 if short else 600}: hook, summary, CTA)"))
    if not short and ("In this video:" if en else "Bu videoda:") not in desc:
        miss.append((5, f'long description needs the "{"In this video:" if en else "Bu videoda:"}" bullet list'))
    sub = r"subscribe" if en else r"abone"
    if not re.search(sub, desc, re.I) or "?" not in desc:
        miss.append((6, "description needs a subscribe call and a comment question"))
    hs = re.findall(r"#[\w]+", desc)
    if not 3 <= len(hs) <= 5 or (short and (not hs or hs[0].lower() != "#shorts")) or \
            cfg["hashtag"] not in [low(h) for h in hs] or not desc.rstrip().split("\n")[-1].startswith("#"):
        miss.append((6, f"description: 3-5 hashtags on the last line{', #shorts first' if short else ''}, incl. {cfg['hashtag']}"))
    other = [c for n, c in CHANNELS.items() if c is not cfg]
    for c in other:
        if norm(c["brand_tag"]) in norm(desc + " " + " ".join(tags)) or c["hashtag"] in low(desc):
            miss.append((4, f"another channel's brand ({c['brand_tag']}) in the metadata"))
    # tags (25)
    if not 12 <= len(tags) <= 18 or sum(len(t) for t in tags) > 450:
        miss.append((8, f"{len(tags)} tags / {sum(len(t) for t in tags)} chars (need 12-18, <= 450)"))
    if len({norm(t) for t in tags}) != len(tags):
        miss.append((4, "duplicate tags"))
    if cfg["brand_tag"] not in [low(t) for t in tags]:
        miss.append((5, f'tags: add "{cfg["brand_tag"]}"'))
    kws = set(kw.split())
    if sum(1 for t in tags if kws and len(kws & set(norm(t).split())) >= max(1, len(kws) - 1)) < 3:
        miss.append((5, "tags: at least 3 variations of the main keyword (tags[0])"))
    if any(len(t) > 30 or "#" in t for t in tags):
        miss.append((3, "tags: no hashtags, each <= 30 chars"))
    # category + language (5)
    if str(y.get("category_id")) != cfg["category_id"]:
        miss.append((5, f'category_id should be "{cfg["category_id"]}" for this channel (tools/channels.py)'))
    if en and re.search(r"[çğışöüÇĞİŞÖÜ]", title + desc + " ".join(tags)):
        miss.append((5, "English channel: Turkish characters in the YouTube metadata"))
    # cover text (10): checked again visually by the critic
    c = s.get("cover") or {}
    if not 2 <= len(" ".join(c.get("lines", [])).split()) <= 4 or len(c.get("highlight", [])) != 1:
        miss.append((10, "cover: 2-4 words with exactly one highlighted word"))
    return miss


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
