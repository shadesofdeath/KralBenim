#!/usr/bin/env python3
"""Video pipeline: videos/<date>/<file>.json -> out/video.mp4 (studio engine, parchment + Kaşif style)

  python build.py <file>.json                 # full video
  python build.py <file>.json --scenes 3      # only the first 3 scenes (test)
  python build.py <file>.json --still 12.5    # save a single frame as PNG
  python build.py <file>.json --cover         # only the thumbnail (out/video.jpg)
  python build.py <file>.json --no-tts        # silent draft with estimated word timings

Sharded (one video across several CI jobs; always pass the same -o):
  python build.py <file>.json -o out/x.mp4 --prepare     # TTS, timeline, media -> out/x.prepared.json
  python build.py <file>.json -o out/x.mp4 --shard 2/5   # render frame range 2 of 5 -> out/x.parts/
  python build.py <file>.json -o out/x.mp4 --finish      # concat + audio mux + cover -> out/x.mp4

Env: RENDER_WORKERS (parallel browsers per machine), SHARD_SECONDS (video seconds per shard, default 40),
RENDER_PROGRESS_DIR (live per-worker frame counts for the Telegram status, see tools/live.py),
CHROMIUM_PATH (browser binary).
"""
import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STUDIO = ROOT / "scenes" / "studio" / "index.html"
SIZES = {"short": (1080, 1920), "long": (1920, 1080)}
TAIL = 1.2          # videos end on a complete sentence and let the last shot breathe
PUNCT = ".,;:!?…\"'"
UPSCALE = 4 / 3     # drawn at 1080p, encoded at 1440p: YouTube serves >1080p uploads its high-bitrate VP9/AV1


def ffmpeg(*args, **kw):
    return subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *map(str, args)], check=True, **kw)


def audio_duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", str(path)]))


# ---------------------------------------------------------------- narration + TTS

def narration(script):
    """The whole narration as one text (one TTS call, natural prosody) + each scene's char range in it."""
    text, ranges = "", []
    for sc in script["scenes"]:
        if text:
            text += " "
        ranges.append((len(text), len(text) + len(sc["text"])))
        text += sc["text"]
    return text, ranges


def split_text(text, limit):
    """Split at sentence ends into chunks of at most `limit` chars (ElevenLabs per-request limit)."""
    chunks, cur = [], ""
    for snt in re.findall(r"[^.!?]+[.!?]*\s*", text):
        if cur and len(cur) + len(snt) > limit:
            chunks.append(cur)
            cur = ""
        cur += snt
    return chunks + [cur] if cur else chunks


def eleven_chunk(text, cfg, key):
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voice_id']}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": cfg.get("model", "eleven_v3")}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < 2:
                time.sleep(10 * (attempt + 1))
                continue
            sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:500]}")


def tts(text, cfg, mp3):
    """ElevenLabs with character timestamps -> mp3 + word timings. Long scripts go in sentence chunks."""
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key or not cfg.get("voice_id"):
        sys.exit("ELEVENLABS_API_KEY and tts.voice_id are required")
    parts, words, offset = [], [], 0.0
    for n, chunk in enumerate(split_text(text, 2500)):
        res = eleven_chunk(chunk.strip(), cfg, key)
        part = mp3.with_name(f"part{n:02d}.mp3")
        part.write_bytes(base64.b64decode(res["audio_base64"]))
        al = res["alignment"]
        chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
        for m in re.finditer(r"\S+", "".join(chars)):
            words.append({"text": m.group(0).strip(PUNCT), "start": offset + st[m.start()], "end": offset + en[m.end() - 1]})
        offset += audio_duration(part)
        parts.append(part)
    if len(parts) == 1:
        parts[0].replace(mp3)
    else:
        lst = mp3.with_name("parts.txt")
        lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
        ffmpeg("-f", "concat", "-safe", "0", "-i", lst, "-c:a", "libmp3lame", "-b:a", "192k", mp3)
    return words


def locate(text, words):
    """Attach the char offset of each spoken word in the source text."""
    cur = 0
    for w in words:
        i = text.find(w["text"], cur)
        if i < 0:
            i = text.casefold().find(w["text"].casefold(), cur)
        w["pos"] = i if i >= 0 else cur
        cur = max(cur, w["pos"] + len(w["text"]))
    return [w for w in words if w["text"]]


def debreath(mp3, words, floor=0.06, min_gap=0.22, pad_out=0.06, pad_in=0.03, ramp=0.04):
    """Owner: no audible breathing. eleven_v3 breathes in the pauses between words, so every gap longer
    than min_gap (from the word timings) is ducked to `floor` with short ramps; words stay untouched."""
    gaps, prev = [], 0.0
    for w in words:
        a, b = prev + pad_out if prev else 0.0, w["start"] - pad_in
        if b - a >= min_gap:
            gaps.append((a, b))
        prev = max(prev, w["end"])
    if not gaps:
        return
    tri = "+".join(f"clip(min(t-{a:.3f},{b:.3f}-t)/{ramp},0,1)" for a, b in gaps)
    filt = f"volume='1-{1 - floor:.3f}*min(1,{tri})':eval=frame"
    out = mp3.with_name("debreath.mp3")
    if len(filt) < 120_000:
        opt = ["-af", filt]
    else:   # a huge filter goes through a file ("-/af" needs ffmpeg >= 7)
        script = mp3.with_name("debreath.txt")
        script.write_text(filt)
        opt = ["-/af", script]
    ffmpeg("-i", mp3, *opt, "-c:a", "libmp3lame", "-b:a", "192k", out)
    out.replace(mp3)


def synthesize(text, cfg, work, breath=True):
    """(mp3, words), cached in the work dir by text + tts config (re-renders spend no credits).
    breath=False (belgesel style, owner 2026-10-29): the narration stays exactly as ElevenLabs reads it, no ducking."""
    key = hashlib.sha1(json.dumps([text, cfg], sort_keys=True).encode()).hexdigest()
    mp3, wj = work / "audio.mp3", work / "words.json"
    if mp3.exists() and wj.exists():
        cached = json.loads(wj.read_text())
        if cached.get("key") == key and bool(cached.get("debreath")) == breath:
            return mp3, cached["words"]
    words = locate(text, tts(text, cfg, mp3))
    if breath:
        debreath(mp3, words)
    wj.write_text(json.dumps({"key": key, "words": words, "debreath": breath}, ensure_ascii=False, indent=1))
    return mp3, words


def estimate_words(text):
    """Rough word timings (~narration pace) for drafts and previews without TTS -> (words, seconds)."""
    words, t = [], 0.2
    for m in re.finditer(r"\S+", text):
        tok = m.group(0)
        d = 0.10 + 0.05 * len(tok.strip(PUNCT))
        words.append({"text": tok.strip(PUNCT), "start": t, "end": t + d, "pos": m.start()})
        t += d + 0.04 + (0.35 if tok[-1] in ".?!" else 0.15 if tok[-1] in ",:;" else 0)
    return locate(text, words), t


# ---------------------------------------------------------------- timeline

def captions_of(ws, end, calm=False):
    """Punchy 1-3 word caption groups, broken at punctuation or ~16 chars. calm (belgesel style): one quiet subtitle
    line per phrase, up to ~7 words / 38 chars."""
    chunks, chunk = [], []
    most, chars = (7, 38) if calm else (3, 16)
    for k, w in enumerate(ws):
        chunk.append(w)
        txt = " ".join(c["disp"] for c in chunk)
        nxt = len(txt) + 1 + len(ws[k + 1]["disp"]) if k + 1 < len(ws) else 0
        if w["disp"][-1] in ".?!:;…" or (w["disp"][-1] == "," and len(chunk) > (2 if calm else 1)) or len(chunk) >= most \
                or len(txt) > chars or (calm and nxt > chars + 4):
            chunks.append(chunk)
            chunk = []
    if chunk:
        chunks.append(chunk)
    return [{"start": ch[0]["start"],
             "end": chunks[k + 1][0]["start"] if k + 1 < len(chunks) else min(ch[-1]["end"] + 0.5, end),
             "words": [{"t": c["start"], "text": c["disp"]} for c in ch]} for k, ch in enumerate(chunks)]


def build_timeline(script, text, ranges, words, duration):
    scenes = script["scenes"]
    # display text of a word = source text up to the next word (keeps punctuation)
    for k, w in enumerate(words):
        nxt = words[k + 1]["pos"] if k + 1 < len(words) else len(text)
        w["scene"] = next(i for i, (a, b) in enumerate(ranges) if w["pos"] < b or i == len(ranges) - 1)
        w["disp"] = text[w["pos"]:min(nxt, ranges[w["scene"]][1])].strip()
    per = [[w for w in words if w["scene"] == i] for i in range(len(scenes))]
    for i, ws in enumerate(per):
        if not ws:
            sys.exit(f"scene {i} has no word timings")
    # scene cut = middle of the pause between scenes
    starts = [0.0] + [(per[i - 1][-1]["end"] + per[i][0]["start"]) / 2 for i in range(1, len(per))]
    ends = starts[1:] + [duration]

    out_scenes, captions = [], []
    for i, sc in enumerate(scenes):
        cues = {}
        for name, needle in sc.get("cues", {}).items():
            hit = next((w for w in per[i] if needle.casefold() in w["disp"].casefold()), None)
            if hit:
                cues[name] = hit["start"]
            else:
                print(f"warning: cue '{needle}' not found in scene {i}", file=sys.stderr)
        out_scenes.append({"start": starts[i], "end": ends[i], "type": sc["type"], "chapter": sc.get("chapter"),
                           "title": sc.get("title", {}), "source": sc.get("source"), "params": sc.get("params", {}), "cues": cues,
                           **{k: sc[k] for k in ("transition", "camera", "set") if k in sc}})
        captions += captions_of(per[i], ends[i], calm=belgesel(script))

    fmt = script.get("format", "short")
    hook = None
    if fmt == "short" and script.get("cover"):
        # the cover frame stays up as the hook until the first sentence is spoken
        first = next((w for w in per[0] if w["disp"][-1] in ".?!"), per[0][-1])
        hook = {**script["cover"], "end": min(3.2, max(1.2, first["end"] + 0.1))}
    return {"hook": hook, "duration": duration, "fps": script.get("fps", 30), "format": fmt, "size": SIZES[fmt],
            "channel": script.get("channel", ""), "narrator": script.get("narrator", "kasif"),
            "lang": script.get("lang", "tr"), "theme": "belgesel" if belgesel(script) else "parchment", **palette(script),
            "scenes": out_scenes, "captions": captions if script.get("subtitles", True) else []}


PALETTES = {k: v for k, v in json.loads((Path(__file__).resolve().parent / "scenes/studio/palettes.json").read_text()).items()
            if not k.startswith("_")}
# belgesel (documentary) style, "theme": "belgesel" (docs/BELGESEL.md): its own colour themes, dark and light
THEMES = {k: v for k, v in json.loads((Path(__file__).resolve().parent / "scenes/studio/belgesel-themes.json").read_text()).items()
          if not k.startswith("_")}


def belgesel(script):
    return script.get("theme") == "belgesel"


def channel_palettes(script):
    """Stickstory has its own cool "ag-" sets, Düşün Bakalım the warm ones: the two channels never look alike."""
    ag = script.get("narrator") == "fes" or script.get("channel") == "Stickstory"
    return sorted(k for k in PALETTES if k.startswith("ag-") == ag)


def palette(script):
    """The video's paper/ink colours (scenes/studio/palettes.json): the script's "palette", else a stable pick from
    the file name, so every video gets a different but repeatable set (preview = render = every shard)."""
    sets = THEMES if belgesel(script) else PALETTES
    name = script.get("palette")
    if name not in sets:
        key = script.get("_name") or script.get("youtube", {}).get("title", "")
        own = sorted(THEMES) if belgesel(script) else channel_palettes(script)
        name = own[int(hashlib.sha1(key.encode()).hexdigest(), 16) % len(own)]
    return {"palette": name, "colors": sets[name]}


def draft_timeline(script):
    """Timeline with estimated word timings (previews, --no-tts) -> (timeline, speech seconds)."""
    text, ranges = narration(script)
    words, speech = estimate_words(text)
    return build_timeline(script, text, ranges, words, speech + TAIL), speech


# ---------------------------------------------------------------- media (studio "photo" shots)

def load_script(path):
    """Read a script and resolve media paths (params.src / params.video) relative to the script file."""
    path = Path(path).resolve()
    script = json.loads(path.read_text())
    script["_name"] = path.stem
    if script.get("engine") != "studio":
        sys.exit(f'{path.name}: "engine" must be "studio"')
    for sc in script["scenes"]:
        p = sc.get("params") or {}
        for k in ("src", "video"):
            if p.get(k) and "://" not in p[k]:
                f = (path.parent / p[k]).resolve()
                if not f.exists():
                    sys.exit(f"media not found: {f}")
                p[k] = str(f)
    return script


def prepare_media(timeline, work):
    """Photo shots: image paths -> file URIs; video clips -> numbered JPEG frames at the render fps
    (frame-exact, deterministic seeking)."""
    fps = timeline["fps"]
    for i, sc in enumerate(timeline["scenes"]):
        p = sc.get("params") or {}
        if p.get("src") and not p["src"].startswith(("file:", "http")):
            p["src"] = Path(p["src"]).as_uri()
        if p.get("video") and not p.get("frames"):
            d = (work / "media" / f"scene{i:02d}").resolve()
            d.mkdir(parents=True, exist_ok=True)
            rate = p.get("rate", 1)
            if not any(d.glob("*.jpg")):
                ffmpeg("-ss", p.get("from", 0), "-t", f"{(sc['end'] - sc['start'] + 0.5) * rate:.2f}", "-i", p["video"],
                       "-vf", f"fps={fps / rate},scale=-2:{max(timeline['size'])}", "-q:v", "3", d / "%05d.jpg")
            p["frames"] = {"pattern": (d / "%05d.jpg").as_uri().replace("%2505d", "%05d"),
                           "count": len(list(d.glob("*.jpg"))), "fps": fps / rate}


# ---------------------------------------------------------------- render

# Software compositor + raster: the shots are flat 2D SVG, and SwiftShader posing as a GPU cost ~1 CPU-second
# per frame for the same picture. --disable-partial-raster: stale tiles were repainted at an offset.
BROWSER_ARGS = ["--disable-gpu-compositing", "--disable-gpu-rasterization", "--disable-partial-raster"]
SHOT_FILES = sorted((STUDIO.parent / "shots").glob("*.js"))   # one file per shot type, all loaded


def open_page(pw, timeline):
    exe = os.environ.get("CHROMIUM_PATH")
    try:
        browser = pw.chromium.launch(executable_path=exe, args=BROWSER_ARGS)
    except Exception:
        browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=BROWSER_ARGS)
    w, h = timeline["size"]
    page = browser.new_page(viewport={"width": w, "height": h})
    page.on("pageerror", lambda e: print(f"page error: {e}", file=sys.stderr))
    if timeline.get("colors"):      # before core.js runs: every shot file captures these colours (palettes.json)
        page.add_init_script(f"window.PALETTE = {json.dumps(timeline['colors'])};")
    page.goto(STUDIO.as_uri())
    for js in SHOT_FILES:
        page.add_script_tag(path=str(js))
    page.evaluate("d => window.init(d)", timeline)
    page.evaluate("document.fonts.ready.then(() => true)")
    return browser, page


def encode_args(timeline):
    w, h = timeline["size"]
    return ["-vf", f"scale={round(w * UPSCALE)}:{round(h * UPSCALE)}:flags=lanczos",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
            "-g", str(timeline["fps"] * 2), "-bf", "2",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]


def progress_writer(seg, total):
    """RENDER_PROGRESS_DIR set (CI, tools/live.py shard): <dir>/<segment>.json = {"done", "total"} frames,
    updated about once per video second, so a watcher can sum all parallel browsers. Unset: a no-op."""
    d = os.environ.get("RENDER_PROGRESS_DIR")
    if not d:
        return lambda done: None
    path = Path(d) / f"{Path(seg).stem}.json"

    def write(done):
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            tmp = path.with_suffix(".tmp")
            tmp.write_text(json.dumps({"done": done, "total": total}))
            tmp.replace(path)
        except OSError:
            pass
    write(0)
    return write


def render_segment(args):
    """Worker: frames [a, b) -> silent H.264 segment. Every frame is a pure function of t, so segments
    render in independent browsers and concatenate losslessly."""
    timeline, a, b, seg, log = args
    from playwright.sync_api import sync_playwright
    fps = timeline["fps"]
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                           *encode_args(timeline), str(seg)], stdin=subprocess.PIPE)
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        cdp = page.context.new_cdp_session(page)   # raw CDP capture: no per-call Playwright overhead
        shot = {"format": "jpeg", "quality": 95, "optimizeForSpeed": True}
        # some shots only settle after a previous seek: seek the preceding frames first so a segment's first
        # frame is identical to the same frame rendered mid-sequence
        for i in range(max(0, a - 3), a):
            page.evaluate("t => window.seek(t)", i / fps)
        progress = progress_writer(seg, b - a)
        for i in range(a, b):
            page.evaluate("t => window.seek(t)", i / fps)
            ff.stdin.write(base64.b64decode(cdp.send("Page.captureScreenshot", shot)["data"]))
            if log and (i - a) % (fps * 5) == 0:
                print(f"\rframe {i}/{b} (worker 1)", end="", flush=True)
            if (i - a + 1) % fps == 0:
                progress(i - a + 1)
        progress(b - a)
        browser.close()
    ff.stdin.close()
    if ff.wait() != 0:
        raise RuntimeError(f"ffmpeg failed on segment {seg}")
    return seg


def split_range(a, b, parts):
    """[a, b) -> up to `parts` contiguous ranges (even frame indices)."""
    step = -(-(b - a) // parts)
    step += step % 2
    return [(s, min(b, s + step)) for s in range(a, b, step)]


def render_frames(timeline, a, b, tmp):
    """Frames [a, b) -> silent segments <tmp>/seg<first>-<end>.mp4, one per local worker (parallel browsers)."""
    import multiprocessing as mp
    fps = timeline["fps"]
    workers = max(1, min(int(os.environ.get("RENDER_WORKERS", os.cpu_count() or 1)), 8, (b - a) // (fps * 2) or 1))
    tmp.mkdir(parents=True, exist_ok=True)
    jobs = [(timeline, s, e, tmp / f"seg{s:06d}-{e:06d}.mp4", k == 0)
            for k, (s, e) in enumerate(split_range(a, b, workers))]
    if len(jobs) == 1:
        return [render_segment(jobs[0])]
    with mp.get_context("spawn").Pool(len(jobs)) as pool:
        return pool.map(render_segment, jobs)


def mux(segs, mp3, sfx, out, n, fps):
    """Lossless concat of the video segments + narration (+ music bed) -> final mp4."""
    lst = Path(out).with_suffix(".concat.txt")
    lst.write_text("".join(f"file '{Path(s).resolve()}'\n" for s in segs))
    audio = (["-i", sfx, "-filter_complex", "[1:a]apad[v];[2:a]apad[s];[v][s]amix=inputs=2:duration=first:normalize=0[a]",
              "-map", "0:v", "-map", "[a]"] if sfx else ["-map", "0:v", "-map", "1:a", "-af", "apad"])
    ffmpeg("-f", "concat", "-safe", "0", "-i", lst, "-i", mp3, *audio,
           "-t", f"{n / fps:.3f}", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out)
    lst.unlink()


def snapshot(timeline, out_png, js, arg):
    """One page screenshot after window.<js>(arg) (cover / still)."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        page.evaluate(f"a => window.{js}(a)", arg)
        page.screenshot(path=str(out_png), type="png")
        browser.close()


def cover(timeline, script, out_jpg):
    """Thumbnail from the script's "cover" block. Long videos: 1280x720 JPEG; Shorts: 1080x1920."""
    if not script.get("cover"):
        return None
    png = out_jpg.with_suffix(".cover.png")
    snapshot(timeline, png, "cover", script["cover"])
    scale = "1280:720" if timeline["format"] == "long" else "1080:1920"
    ffmpeg("-i", png, "-vf", f"scale={scale}:flags=lanczos", "-q:v", "2", out_jpg)
    png.unlink()
    print(out_jpg)
    return out_jpg


# ---------------------------------------------------------------- sharded build
# --prepare     TTS (cached) + timeline + media frames + music -> <out>.prepared.json + the work dir
# --shard I/N   frames of shard I -> <out>.parts/seg<first>-<end>.mp4
# --finish      lossless concat of all segments + audio mux + cover
# Every phase gets the same -o; CI passes the work dir (out/<slug>/) and the manifest between jobs.

def write_prepared(timeline, work, out, mp3, sfx, until, with_cover=True):
    work = work.resolve()
    for i, sc in enumerate(timeline["scenes"]):   # self-contained work dir: copy photos from elsewhere in
        p = sc.get("params") or {}
        if p.get("src", "").startswith("file:"):
            src = Path(urllib.request.url2pathname(urllib.parse.urlparse(p["src"]).path))
            if not src.is_relative_to(work):
                dst = work / "media" / "src" / f"{i:02d}-{src.name}"
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, dst)
                p["src"] = dst.as_uri()
    fps = timeline["fps"]
    m = {"work": work.name, "work_uri": work.as_uri(), "repo_uri": ROOT.as_uri(),
         "audio": str(Path(mp3).resolve().relative_to(work)),
         "sfx": str(Path(sfx).resolve().relative_to(work)) if sfx else None,
         "frames": round(until * fps), "fps": fps, "cover": with_cover, "timeline": timeline,
         "shards": max(1, min(16, round(until / float(os.environ.get("SHARD_SECONDS", 40)))))}
    path = out.with_suffix(".prepared.json")
    path.write_text(json.dumps(m, ensure_ascii=False))
    print(f"{path}  ({m['frames']} frames, {until:.1f}s, {m['shards']} shards)")


def load_prepared(out):
    """The prepared manifest, with file URIs moved to wherever the repo and work dir are now."""
    path = out.with_suffix(".prepared.json")
    if not path.exists():
        sys.exit(f"{path} not found: run --prepare first (same -o)")
    m = json.loads(path.read_text())
    work = (out.parent / m["work"]).resolve()
    tl = json.dumps(m["timeline"], ensure_ascii=False).replace(m["work_uri"], work.as_uri()).replace(m["repo_uri"], ROOT.as_uri())
    m["timeline"] = json.loads(tl)
    m["audio"] = work / m["audio"]
    m["sfx"] = work / m["sfx"] if m["sfx"] else None
    return m


def render_shard(out, i, n):
    m = load_prepared(out)
    ranges = split_range(0, m["frames"], n)
    if not 1 <= i <= n:
        sys.exit(f"--shard {i}/{n}: I must be in 1..{n}")
    if i > len(ranges):
        print(f"shard {i}/{n}: no frames left")
        return
    a, b = ranges[i - 1]
    t0 = time.time()
    segs = render_frames(m["timeline"], a, b, out.with_suffix(".parts"))
    print(f"\rshard {i}/{n}: frames {a}-{b} -> {len(segs)} segments ({time.time() - t0:.0f}s)")


def collect_segments(tmp, frames):
    """The seg<first>-<end>.mp4 files under tmp, in order; they must tile [0, frames) exactly (a missing
    shard fails the build instead of shipping a short video)."""
    spans = {}
    for s in tmp.rglob("*.mp4"):
        mt = re.fullmatch(r"seg(\d+)-(\d+)", s.stem)
        if mt:
            spans[s] = (int(mt[1]), int(mt[2]))
        else:
            print(f"finish: ignoring {s.relative_to(tmp)}", file=sys.stderr)
    segs, pos = sorted(spans, key=spans.get), 0
    for s in segs:
        if spans[s][0] != pos:
            break
        pos = spans[s][1]
    if pos != frames:
        sys.exit(f"missing frames {pos}-{frames} (segments: {[x.name for x in segs]})")
    return segs


def finish(script_path, out):
    m = load_prepared(out)
    segs = collect_segments(out.with_suffix(".parts"), m["frames"])
    t0 = time.time()
    mux(segs, m["audio"], m["sfx"], out, m["frames"], m["fps"])
    print(f"{out}  ({m['frames']} frames, {m['frames'] / m['fps']:.1f}s, {len(segs)} segments, {time.time() - t0:.0f}s)")
    for s in segs:
        s.unlink()
    if m["cover"]:
        cover(m["timeline"], json.loads(Path(script_path).read_text()), out.with_suffix(".jpg"))


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("-o", "--out", default="out/video.mp4")
    ap.add_argument("--scenes", type=int, help="render only the first N scenes")
    ap.add_argument("--still", type=float, help="save one frame at this time (s) instead of a video")
    ap.add_argument("--cover", action="store_true", help="only render the thumbnail")
    ap.add_argument("--no-tts", action="store_true", help="silent draft: estimated word timings, no TTS call")
    ap.add_argument("--prepare", action="store_true", help="sharded build 1/3: TTS + timeline + media + music")
    ap.add_argument("--shard", metavar="I/N", help="sharded build 2/3: render frame range I of N (1-based)")
    ap.add_argument("--finish", action="store_true", help="sharded build 3/3: concat segments, mux audio, cover")
    a = ap.parse_args()
    out = Path(a.out)
    if a.shard:
        i, n = (int(x) for x in a.shard.split("/"))
        return render_shard(out, i, n)
    if a.finish:
        return finish(a.script, out)

    script = load_script(a.script)
    work = out.parent / script.get("slug", Path(a.script).stem)
    work.mkdir(parents=True, exist_ok=True)
    out.parent.mkdir(parents=True, exist_ok=True)
    text, ranges = narration(script)
    if a.no_tts:
        words, speech = estimate_words(text)
        mp3 = work / "silence.wav"
        ffmpeg("-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{speech:.2f}", mp3)
    else:
        mp3, words = synthesize(text, script.get("tts", {}), work, breath=not belgesel(script))
    duration = audio_duration(mp3) + TAIL
    timeline = build_timeline(script, text, ranges, words, duration)
    prepare_media(timeline, work)
    for p in (work / "timeline.json", out.with_suffix(".timeline.json")):
        p.write_text(json.dumps(timeline, ensure_ascii=False, indent=1))

    if a.cover:
        return cover(timeline, script, out.with_suffix(".jpg"))
    if a.still is not None:
        png = out.with_suffix(".png") if out.suffix == ".mp4" else out
        snapshot(timeline, png, "seek", a.still)
        return print(png)
    until = timeline["scenes"][a.scenes - 1]["end"] if a.scenes else duration
    sfx = None
    if script.get("sfx", True):
        sys.path.insert(0, str(ROOT / "tools"))
        import sfx as sfxmod
        sfx = sfxmod.render(timeline, work / "sfx.wav", until)
    if a.prepare:
        return write_prepared(timeline, work, out, mp3, sfx, until, with_cover=not a.scenes)
    n, t0 = round(until * timeline["fps"]), time.time()
    tmp = out.with_suffix(".parts")
    segs = render_frames(timeline, 0, n, tmp)
    mux(segs, mp3, sfx, out, n, timeline["fps"])
    shutil.rmtree(tmp)
    print(f"\r{out}  ({n} frames, {n / timeline['fps']:.1f}s, {time.time() - t0:.0f}s)")
    if not a.scenes:
        cover(timeline, script, out.with_suffix(".jpg"))


if __name__ == "__main__":
    main()
