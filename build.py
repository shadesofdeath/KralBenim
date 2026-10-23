#!/usr/bin/env python3
"""Video pipeline: videos/<date>/<file>.json -> out/video.mp4 (Studio engine, parchment + Kaşif style)

  python build.py <file>.json                 # full video
  python build.py <file>.json --scenes 3      # only the first 3 scenes (test)
  python build.py <file>.json --still 12.5    # save a single frame as PNG
  python build.py <file>.json --cover         # only the thumbnail (out/video.jpg)

Sharded (one video across several machines/CI jobs; always pass the same -o):
  python build.py <file>.json -o out/x.mp4 --prepare     # TTS, timeline, media -> out/x.prepared.json
  python build.py <file>.json -o out/x.mp4 --shard 2/5   # render frame range 2 of 5 -> out/x.parts/
  python build.py <file>.json -o out/x.mp4 --finish      # concat + audio mux + cover -> out/x.mp4

Env: RENDER_WORKERS (parallel browsers per machine), RENDER_CAPTURE=screenshot (old page.screenshot
capture), RENDER_COMPOSITOR=gpu (old SwiftShader compositor), SHARD_SECONDS (video seconds per shard),
RENDER_PROGRESS_DIR (live per-worker frame counts for the Telegram status, see tools/live.py).
"""
import argparse
import asyncio
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STUDIO = ROOT / "scenes" / "studio" / "index.html"   # "engine": "studio", "theme": "parchment" (the only engine)
FPS = 30
SIZES = {"short": (1080, 1920), "long": (1920, 1080)}
STUDIO_TAIL = 1.2  # videos end on a complete sentence and let the last shot breathe
PUNCT = ".,;:!?…\"'"


# ---------------------------------------------------------------- TTS

def tts_edge(text, cfg, mp3):
    import edge_tts

    async def run():
        comm = edge_tts.Communicate(
            text, cfg.get("voice", "tr-TR-AhmetNeural"), rate=cfg.get("rate", "+0%"),
            boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
        words = []
        with open(mp3, "wb") as f:
            async for ch in comm.stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    s = ch["offset"] / 1e7
                    words.append({"text": ch["text"], "start": s, "end": s + ch["duration"] / 1e7})
        return words

    return asyncio.run(run())


def _eleven_chunk(text, cfg, key, voice):
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": cfg.get("model", "eleven_multilingual_v2"),
                         **({"voice_settings": cfg["settings"]} if cfg.get("settings") else {})}).encode(),
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


def split_text(text, limit):
    """Split at sentence ends into chunks of at most `limit` chars."""
    sentences = re.findall(r"[^.!?]+[.!?]*\s*", text)
    chunks, cur = [], ""
    for snt in sentences:
        if cur and len(cur) + len(snt) > limit:
            chunks.append(cur)
            cur = ""
        cur += snt
    if cur:
        chunks.append(cur)
    return chunks


def tts_elevenlabs(text, cfg, mp3):
    key = os.environ.get("ELEVENLABS_API_KEY")
    voice = cfg.get("voice_id") or os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not voice:
        sys.exit("ELEVENLABS_API_KEY and tts.voice_id (or ELEVENLABS_VOICE_ID) are required")
    # long scripts are synthesized in pieces (per-request character limits) and concatenated
    parts, words, offset = [], [], 0.0
    for n, chunk in enumerate(split_text(text, cfg.get("chunk_chars", 2500))):
        res = _eleven_chunk(chunk.strip(), cfg, key, voice)
        part = Path(mp3).with_name(f"part{n:02d}.mp3")
        part.write_bytes(base64.b64decode(res["audio_base64"]))
        al = res["alignment"]
        chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
        i = 0
        while i < len(chars):
            if chars[i].isspace():
                i += 1
                continue
            j = i
            while j < len(chars) and not chars[j].isspace():
                j += 1
            words.append({"text": "".join(chars[i:j]).strip(PUNCT), "start": offset + st[i], "end": offset + en[j - 1]})
            i = j
        offset += audio_duration(part)
        parts.append(part)
    if len(parts) == 1:
        parts[0].replace(mp3)
    else:
        lst = Path(mp3).with_name("parts.txt")
        lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                        "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)], check=True)
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
    """Owner: no audible breathing. eleven_v3 breathes in the pauses between words, so every gap
    longer than min_gap (from the word timings) is ducked to `floor` with short ramps; the words
    themselves are untouched."""
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
    script = Path(mp3).with_name("debreath.txt")
    script.write_text(filt)
    out = Path(mp3).with_name("debreath.mp3")
    # the filter goes inline (any ffmpeg); only a huge one goes through a file: "-/af" (ffmpeg >= 7)
    # or the old "-filter_script" (removed in ffmpeg 8)
    tries = [["-af", filt]] if len(filt) < 120_000 else [["-/af", str(script)], ["-filter_script:a", str(script)]]
    for i, opt in enumerate(tries):
        r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), *opt,
                            "-c:a", "libmp3lame", "-b:a", "192k", str(out)])
        if r.returncode == 0:
            break
        if i == len(tries) - 1:
            raise subprocess.CalledProcessError(r.returncode, "ffmpeg debreath")
    out.replace(mp3)


def synthesize(text, cfg, work, plain=None):
    """Returns (mp3 path, words). Cached by text+tts config. `plain` is the text without audio tags
    (captions and scene ranges refer to it)."""
    key = hashlib.sha1(json.dumps([text, cfg], sort_keys=True).encode()).hexdigest()
    mp3, wj = work / "audio.mp3", work / "words.json"
    if mp3.exists() and wj.exists():
        cached = json.loads(wj.read_text())
        if cached.get("key") == key:
            if not cached.get("debreath") and cfg.get("provider") == "elevenlabs":   # audio cached before debreath
                debreath(mp3, cached["words"])
                wj.write_text(json.dumps({**cached, "debreath": True}, ensure_ascii=False, indent=1))
            return mp3, cached["words"]
    provider = cfg.get("provider", "edge")
    words = locate(plain or text, drop_tags({"edge": tts_edge, "elevenlabs": tts_elevenlabs}[provider](text, cfg, mp3)))
    if provider == "elevenlabs":
        debreath(mp3, words)
    wj.write_text(json.dumps({"key": key, "words": words, "debreath": provider == "elevenlabs"},
                             ensure_ascii=False, indent=1))
    return mp3, words


def estimate_words(text):
    """Rough word timings (~Turkish narration pace) for drafts and previews without TTS."""
    words, t = [], 0.2
    for m in re.finditer(r"\S+", text):
        tok = m.group(0)
        d = 0.10 + 0.05 * len(tok.strip(PUNCT))
        words.append({"text": tok.strip(PUNCT), "start": t, "end": t + d, "pos": m.start()})
        t += d + 0.04 + (0.35 if tok[-1] in ".?!" else 0.15 if tok[-1] in ",:;" else 0)
    return words, t


def pace(mp3, words, text, pacing, work):
    """Narration pacing: after a sentence end (. ? ! …) the silence is at least pacing["sentence"]
    seconds, after a comma (, ; :) at least pacing["comma"]; no silence is longer than pacing["max"].
    Inserts/cuts silence in the narration audio and shifts the word timings to match."""
    import numpy as np
    sr = 44100
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(mp3), "-f", "s16le", "-ac", "1", "-ar", str(sr), "-"],
                         check=True, capture_output=True).stdout
    a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32)
    ops = []                            # (time in the original audio, +insert / -cut seconds)
    for prev, w in zip(words, words[1:]):
        gap = w["start"] - prev["end"]
        after = text[prev["pos"] + len(prev["text"]):w["pos"]]
        want = pacing.get("sentence", 0) if any(c in after for c in ".?!…") else \
            pacing.get("comma", 0) if any(c in after for c in ",;:") else 0
        mid = prev["end"] + max(gap, 0) / 2
        if gap < want:
            ops.append((mid, want - max(gap, 0)))
        elif pacing.get("max") and gap > pacing["max"]:
            ops.append((mid, pacing["max"] - gap))
    fade, out, pos = int(0.008 * sr), [], 0
    for t0, d in ops:
        i = int(t0 * sr)
        if d < 0:                       # cut |d| seconds centred on the gap
            c0, c1 = int((t0 + d / 2) * sr), int((t0 - d / 2) * sr)
            out.append(a[pos:c0].copy())
            pos = c1
        else:
            out.append(a[pos:i].copy())
            out.append(np.zeros(int(d * sr), np.float32))
            pos = i
    out.append(a[pos:].copy())
    for seg in out:                     # tiny fades at every join: no clicks
        if len(seg) > 2 * fade and seg.any():
            seg[:fade] *= np.linspace(0, 1, fade)
            seg[-fade:] *= np.linspace(1, 0, fade)
    wav = work / "voice_paced.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ac", "1", "-ar", str(sr), "-i", "-", str(wav)],
                   input=np.concatenate(out).astype(np.int16).tobytes(), check=True)
    shifted = []
    for w in words:
        sh = sum(d for t0, d in ops if t0 <= w["start"])
        shifted.append({**w, "start": w["start"] + sh, "end": w["end"] + sh})
    print(f"pacing: {sum(d > 0 for _, d in ops)} pauses lengthened, {sum(d < 0 for _, d in ops)} shortened, "
          f"{sum(d for _, d in ops):+.1f}s", file=sys.stderr)
    return wav, shifted


def drop_tags(words):
    """Remove ElevenLabs v3 audio tags ("[curious]", "[dramatic tone]") from the aligned words."""
    out, inside = [], False
    for w in words:
        t = w["text"]
        if t.startswith("[") or inside:
            inside = not t.rstrip(PUNCT).endswith("]")
            continue
        out.append(w)
    return out


def audio_duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", str(path)])
    return float(out)


# ---------------------------------------------------------------- timeline

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
        ws = per[i]
        cues = {}
        for name, needle in sc.get("cues", {}).items():
            hit = next((w for w in ws if needle.casefold() in w["disp"].casefold()), None)
            if hit:
                cues[name] = hit["start"]
            else:
                print(f"warning: cue '{needle}' not found in scene {i}", file=sys.stderr)
        out_scenes.append({"start": starts[i], "end": ends[i], "type": sc["type"], "chapter": sc.get("chapter"),
                           "title": sc.get("title", {}), "tags": sc.get("tags", []),
                           "params": sc.get("params", {}), "cues": cues,
                           **{k: sc[k] for k in ("art", "transition") if k in sc}})

        # captions: punchy 1-3 word groups, broken at punctuation or ~16 chars
        max_words, max_chars = 3, 16
        chunk, chunks = [], []
        for w in ws:
            chunk.append(w)
            txt = " ".join(c["disp"] for c in chunk)
            if (w["disp"][-1] in ".?!:;" or (w["disp"][-1] == "," and len(chunk) > 1)
                    or len(chunk) >= max_words or len(txt) > max_chars):
                chunks.append(chunk)
                chunk = []
        if chunk:
            chunks.append(chunk)
        for k, ch in enumerate(chunks):
            end = chunks[k + 1][0]["start"] if k + 1 < len(chunks) else min(ch[-1]["end"] + 0.5, ends[i])
            captions.append({"start": ch[0]["start"], "end": end,
                             "words": [{"t": c["start"], "text": c["disp"]} for c in ch]})


    fmt = script.get("format", "short")
    hook = None
    if fmt == "short" and script.get("cover"):
        # the hook frame stays up until the first sentence is spoken
        first = next((w for w in per[0] if w["disp"][-1] in ".?!"), per[0][-1])
        hook = {**script["cover"], "end": min(3.2, max(1.2, first["end"] + 0.1))}
    # draw at 1080p, upscale to 1440p at encode time
    return {"hook": hook, "scale": script.get("scale", 1.0), "motion_blur": script.get("motion_blur", True),"duration": duration, "fps": script.get("fps", FPS), "format": fmt, "size": SIZES[fmt], "channel": script.get("channel", ""), "narrator": script.get("narrator", "kasif"), "lang": script.get("lang", "tr"),
            "engine": "studio", "art": script.get("art"), "theme": script.get("theme", "parchment"),
            "scenes": out_scenes, "captions": captions if script.get("subtitles", True) else []}


# ---------------------------------------------------------------- media (studio "photo" shots)

def load_script(path):
    """Read a script and resolve media paths (params.src / params.video) relative to the script file."""
    path = Path(path).resolve()
    script = json.loads(path.read_text())
    if script.get("engine") != "studio":
        sys.exit(f'{path.name}: "engine" must be "studio" (the classic card engine was removed)')
    for sc in script["scenes"]:
        p = sc.get("params") or {}
        for k in ("src", "video"):
            if p.get(k) and "://" not in p[k]:
                f = (path.parent / p[k]).resolve()
                if not f.exists() and p.get("url"):
                    f = fetch_media(p["url"], f)
                if not f.exists():
                    sys.exit(f"media not found: {f}")
                p[k] = str(f)
    return script


def fetch_media(url, dest):
    """Clips referenced by URL (Higgsfield results: params.url) are downloaded on first use.
    The Claude cloud sandbox cannot reach the CDN, GitHub Actions can: if the download fails,
    previews get a neutral placeholder clip (never written into the repo) and a warning."""
    sys.path.insert(0, str(ROOT / "tools"))
    import hf
    try:
        hf.fetch(url, dest)
        return dest
    except Exception as e:
        ph = ROOT / "out" / "placeholders" / dest.name
        print(f"warning: cannot download {url} ({e}); using a placeholder for {dest.name}", file=sys.stderr)
        if not ph.exists():
            ph.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
                            "-i", "gradients=s=1920x1080:d=5:speed=0.02:c0=0x10162e:c1=0x3a2f5b:n=2",
                            "-c:v", "libx264", "-pix_fmt", "yuv420p", str(ph)], check=True)
        return ph


def prepare_media(timeline, work):
    """Studio photo shots: turn image paths into file URIs and pre-extract video clips into
    numbered JPEG frames at the render fps (frame-exact, deterministic seeking)."""
    fps = timeline["fps"]
    for i, sc in enumerate(timeline["scenes"]):
        p = sc.get("params") or {}
        if p.get("src") and not p["src"].startswith(("file:", "http")):
            p["src"] = Path(p["src"]).as_uri()
        if p.get("video") and not p.get("frames"):
            d = (work / "media" / f"scene{i:02d}").resolve()   # as_uri() needs an absolute path
            d.mkdir(parents=True, exist_ok=True)
            dur = sc["end"] - sc["start"] + 0.5
            rate = p.get("rate", 1)
            w, h = timeline["size"]
            scale = timeline.get("scale", 4 / 3)
            if not any(d.glob("*.jpg")):
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(p.get("from", 0)), "-t", f"{dur * rate:.2f}",
                                "-i", p["video"], "-vf", f"fps={fps / rate},scale=-2:{round(max(w, h) * scale)}",
                                "-q:v", "3", str(d / "%05d.jpg")], check=True)
            p["frames"] = {"pattern": (d / "%05d.jpg").as_uri().replace("%2505d", "%05d"),
                           "count": len(list(d.glob("*.jpg"))), "fps": fps / rate}


# ---------------------------------------------------------------- render

# Video frames (not the cover or stills, which keep the original setup) use Chromium's software
# compositor and software raster. With SwiftShader posing as a GPU, every compositor pass and tile
# raster ran through emulated GL: ~1 CPU-second per 1080x1920 frame even for flat 2D scenes. The
# software path draws the same picture (differences are antialiasing-level, below the JPEG q95
# noise) for 3x (3D) to 8x (2D) less CPU. WebGL canvases still render with SwiftShader.
# RENDER_COMPOSITOR=gpu restores the old setup.
FAST_ARGS = ["--disable-gpu-compositing", "--disable-gpu-rasterization"]


def open_page(pw, timeline, fast=False):
    # software WebGL (SwiftShader) for the studio 3D shots: runners have no GPU
    args = ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist", "--enable-webgl",
            "--disable-partial-raster"]   # stale tiles repainted at an offset ("ghost strips") in software raster
    if fast and os.environ.get("RENDER_COMPOSITOR", "software") != "gpu":
        args += FAST_ARGS
    try:
        browser = pw.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH"), args=args)
    except Exception:
        browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=args)
    w, h = timeline["size"]
    # render at 4/3 scale (1440x2560 / 2560x1440): YouTube gives >1080p uploads the VP9/AV1 high-bitrate
    # encodes, so the final stream stays sharp; layout stays in 1080p CSS pixels
    page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=timeline.get("scale", 4 / 3))
    page.on("pageerror", lambda e: print(f"page error: {e}", file=sys.stderr))
    page.goto(STUDIO.as_uri())
    # one file per shot type (scenes/studio/shots/<type>.js), so parallel agents never edit the same file
    for js in sorted((STUDIO.parent / "shots").glob("*.js")):
        page.add_script_tag(path=str(js))
    page.evaluate("d => window.init(d)", timeline)
    page.evaluate("document.fonts.ready.then(() => true)")
    return browser, page


def _encode_args(timeline):
    fps = timeline["fps"]
    blur = timeline.get("motion_blur", False) and fps >= 60
    vf = ["tmix=frames=2,fps=30"] if blur else []   # motion blur: 60 fps pairs -> 30 fps
    w, h = timeline["size"]
    # upscale to 1440p so YouTube serves the high-bitrate VP9/AV1 encode
    # (film grain was dropped: it tripled the file size and encode time and YouTube smears it anyway)
    vf += [f"scale={round(w * 4 / 3)}:{round(h * 4 / 3)}:flags=lanczos"]
    return [*(["-vf", ",".join(vf)] if vf else []),
            "-c:v", "libx264", "-preset", "medium",
            "-crf", "18",   # Shorts stay < 50 MB (Telegram bot limit) "-tune", "animation", "-profile:v", "high",
            "-pix_fmt", "yuv420p", "-g", str(60 if blur else fps * 2), "-bf", "2",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]


def _capturer(page, timeline):
    """Returns capture() -> encoded frame bytes. Default: raw CDP Page.captureScreenshot with
    optimizeForSpeed (the same JPEG bytes as page.screenshot without Playwright's per-call overhead).
    RENDER_CAPTURE=screenshot falls back to page.screenshot. (HeadlessExperimental.beginFrame was
    measured too: no faster here, and it only works in chrome-headless-shell.)"""
    if os.environ.get("RENDER_CAPTURE", "cdp") == "screenshot":
        return lambda: page.screenshot(type="jpeg", quality=95)
    cdp = page.context.new_cdp_session(page)
    req = {"format": "jpeg", "quality": 95, "optimizeForSpeed": True}
    return lambda: base64.b64decode(cdp.send("Page.captureScreenshot", req)["data"])


def _progress_writer(seg, total):
    """RENDER_PROGRESS_DIR set (CI, tools/live.py shard): each worker keeps <dir>/<segment>.json =
    {"done": frames, "total": frames} up to date (about once per video second), so a watcher can sum
    the live progress of all parallel browsers. Unset: a no-op."""
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


def _render_segment(args):
    """Worker: frames [a, b) -> silent H.264 segment. Every frame is a pure function of t, so
    segments can be rendered by independent browsers in parallel and concatenated."""
    timeline, a, b, seg, log = args
    from playwright.sync_api import sync_playwright
    fps = timeline["fps"]
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                           *_encode_args(timeline), str(seg)], stdin=subprocess.PIPE)
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline, fast=True)
        capture = _capturer(page, timeline)
        # a fresh page is not quite stateless: some shots (e.g. the drill depth label) only show up after
        # a previous seek, so the first frame of every segment came out different from the same frame
        # rendered mid-sequence. Seeking the preceding frames first (no capture) makes it identical.
        for i in range(max(0, a - 3), a):
            page.evaluate("t => window.seek(t)", i / fps)
        progress = _progress_writer(seg, b - a)
        for i in range(a, b):
            page.evaluate("t => window.seek(t)", i / fps)
            ff.stdin.write(capture())
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


def _split(a, b, parts):
    """[a, b) -> up to `parts` contiguous ranges, cut at even frame indices so motion-blur pairs
    never straddle a segment boundary."""
    step = -(-(b - a) // parts)
    step += step % 2
    return [(s, min(b, s + step)) for s in range(a, b, step)]


def render_frames(timeline, a, b, tmp, prefix="seg", workers=None):
    """Frames [a, b) -> silent H.264 segments in `tmp`, one per local worker (parallel browsers).
    Segment names sort in frame order: <prefix><first frame>-<end frame>.mp4."""
    import multiprocessing as mp
    fps = timeline["fps"]
    workers = max(1, min(workers or int(os.environ.get("RENDER_WORKERS", os.cpu_count() or 1)), 8,
                         (b - a) // (fps * 2) or 1))
    tmp.mkdir(parents=True, exist_ok=True)
    jobs = [(timeline, s, e, tmp / f"{prefix}{s:06d}-{e:06d}.mp4", k == 0)
            for k, (s, e) in enumerate(_split(a, b, workers))]
    if len(jobs) == 1:
        return [_render_segment(jobs[0])], 1
    with mp.get_context("spawn").Pool(len(jobs)) as pool:
        return pool.map(_render_segment, jobs), len(jobs)


def mux(segs, mp3, sfx, out, n, fps):
    """Lossless concat of the video segments + narration (+ music bed) -> final mp4."""
    lst = Path(out).with_suffix(".concat.txt")
    lst.write_text("".join(f"file '{Path(s).resolve()}'\n" for s in segs))
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
        "-i", str(mp3),
        *(["-i", str(sfx), "-filter_complex",
           "[1:a]apad[v];[2:a]apad[s];[v][s]amix=inputs=2:duration=first:normalize=0[a]",
           "-map", "0:v", "-map", "[a]"] if sfx else ["-map", "0:v", "-map", "1:a", "-af", "apad"]),
        "-t", f"{n / fps:.3f}", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)],
        check=True)
    lst.unlink()


def render(timeline, mp3, out, until, sfx=None, workers=None):
    fps = timeline["fps"]
    n = round(until * fps)
    tmp = Path(out).with_suffix(".parts")
    t0 = time.time()
    segs, used = render_frames(timeline, 0, n, tmp, workers=workers)
    mux(segs, mp3, sfx, out, n, fps)
    for s in segs:
        s.unlink()
    tmp.rmdir()
    print(f"\r{out}  ({n} frames, {n / fps:.1f}s, {used} workers, {time.time() - t0:.0f}s)")


def cover(timeline, script, out_jpg):
    """Thumbnail from the script's "cover" block. Long videos: 1280x720 JPEG; Shorts: 1080x1920."""
    from playwright.sync_api import sync_playwright
    c = script.get("cover")
    if not c:
        return None
    png = out_jpg.with_suffix(".cover.png")
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        page.evaluate("c => window.cover(c)", c)
        page.screenshot(path=str(png), type="png")
        browser.close()
    scale = "1280:720" if timeline["format"] == "long" else "1080:1920"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(png), "-vf", f"scale={scale}:flags=lanczos",
                    "-q:v", "2", str(out_jpg)], check=True)
    png.unlink()
    print(out_jpg)
    return out_jpg


def still(timeline, t, out):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser, page = open_page(pw, timeline)
        page.evaluate("t => window.seek(t)", t)
        page.screenshot(path=str(out), type="png")
        browser.close()
    print(out)


# ---------------------------------------------------------------- sharded build (one video, several machines)
# --prepare     TTS (cached) + timeline + media frames + music -> <out>.prepared.json + the work dir
# --shard I/N   frames of shard I -> <out>.parts/seg<first>-<end>.mp4 (same encoder settings)
# --finish      lossless concat of all segments + audio mux (as the single-process path) + cover
# Every phase is called with the same -o; the work dir (out/<slug>/) and <out>.prepared.json are
# what the next phase needs (CI passes them between jobs as an artifact).

def shard_count(seconds):
    """About one shard per SHARD_SECONDS (default 40) of video, at most 16."""
    return max(1, min(16, round(seconds / float(os.environ.get("SHARD_SECONDS", 40)))))


def write_prepared(timeline, work, out, mp3, sfx, until, cover=True):
    import shutil
    work = work.resolve()
    # self-contained work dir: photos referenced from elsewhere (downloaded, not in the repo) are copied in
    for i, sc in enumerate(timeline["scenes"]):
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
         "frames": round(until * fps), "fps": fps, "shards": shard_count(until), "cover": cover,
         "timeline": timeline}
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
    tl = json.dumps(m["timeline"], ensure_ascii=False)
    tl = tl.replace(m["work_uri"], work.as_uri()).replace(m["repo_uri"], ROOT.as_uri())
    m["timeline"] = json.loads(tl)
    m["audio"] = work / m["audio"]
    m["sfx"] = work / m["sfx"] if m["sfx"] else None
    return m


def render_shard(out, i, n):
    m = load_prepared(out)
    ranges = _split(0, m["frames"], n)
    if not 1 <= i <= n:
        sys.exit(f"--shard {i}/{n}: I must be in 1..{n}")
    if i > len(ranges):
        print(f"shard {i}/{n}: no frames left")
        return
    a, b = ranges[i - 1]
    t0 = time.time()
    segs, used = render_frames(m["timeline"], a, b, out.with_suffix(".parts"))
    print(f"\rshard {i}/{n}: frames {a}-{b} -> {len(segs)} segments ({used} workers, {time.time() - t0:.0f}s)")


def finish(script_path, out):
    m = load_prepared(out)
    tmp = out.with_suffix(".parts")
    # only <seg><first>-<end>.mp4 files are segments; anything else that landed here is listed and skipped
    found = sorted(tmp.rglob("*.mp4"))
    segs, spans = [], {}
    for s in found:
        mt = re.fullmatch(r"seg(\d+)-(\d+)", s.stem)
        if mt:
            spans[s] = (int(mt[1]), int(mt[2]))
            segs.append(s)
        else:
            print(f"finish: ignoring {s.relative_to(tmp)}", file=sys.stderr)
    segs.sort(key=lambda s: spans[s])
    # the segments must tile [0, frames) exactly: a missing shard must fail, not ship a short video
    pos = 0
    for s in segs:
        a, b = spans[s]
        if a != pos:
            sys.exit(f"missing frames {pos}-{a} (segments: {[x.name for x in segs]})")
        pos = b
    if pos != m["frames"]:
        sys.exit(f"missing frames {pos}-{m['frames']} (segments: {[x.name for x in segs]})")
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
    ap.add_argument("--prepare", action="store_true",
                    help="sharded build, phase 1: TTS + timeline + media + music -> <out>.prepared.json")
    ap.add_argument("--shard", metavar="I/N",
                    help="sharded build, phase 2: render frame range I of N (1-based) of a prepared build")
    ap.add_argument("--finish", action="store_true",
                    help="sharded build, phase 3: concat the shard segments, mux audio, render the cover")
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

    # whole narration in one TTS call for natural prosody; scenes are char ranges in it
    # eleven_v3 audio tags per scene ("tone": "curious" -> "[curious] ..."), spoken only, never captioned
    text, ranges, spoken = "", [], []
    for sc in script["scenes"]:
        if text:
            text += " "
        ranges.append((len(text), len(text) + len(sc["text"])))
        text += sc["text"]
        spoken.append((f"[{sc['tone']}] " if sc.get("tone") else "") + sc["text"])
    spoken = " ".join(spoken)

    if a.no_tts:
        words, speech = estimate_words(text)
        mp3 = work / "silence.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                        "-t", f"{speech:.2f}", str(mp3)], check=True)
        words = locate(text, words)
    else:
        mp3, words = synthesize(spoken, script.get("tts", {}), work, plain=text)
        pacing = script.get("pacing") or ({"max": script["max_pause"]} if script.get("max_pause") else None)
        if pacing:
            mp3, words = pace(mp3, words, text, pacing, work)
    # videos end on a full sentence and let the last shot breathe
    duration = audio_duration(mp3) + STUDIO_TAIL
    timeline = build_timeline(script, text, ranges, words, duration)
    prepare_media(timeline, work)
    (work / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.with_suffix(".timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))

    if a.cover:
        cover(timeline, script, out.with_suffix(".jpg"))
        return

    if a.still is not None:
        still(timeline, a.still, out.with_suffix(".png") if out.suffix == ".mp4" else out)
        return
    until = timeline["scenes"][a.scenes - 1]["end"] if a.scenes else duration
    sfx = None
    if script.get("sfx", True):
        sys.path.insert(0, str(ROOT / "tools"))
        import sfx as sfxmod
        sfx = sfxmod.render(timeline, work / "sfx.wav", until)
    if a.prepare:
        return write_prepared(timeline, work, out, mp3, sfx, until, cover=not a.scenes)
    render(timeline, mp3, out, until, sfx)
    if not a.scenes:
        cover(timeline, script, out.with_suffix(".jpg"))


if __name__ == "__main__":
    main()
