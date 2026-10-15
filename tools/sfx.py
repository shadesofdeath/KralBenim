#!/usr/bin/env python3
"""Procedural, royalty-free sound design for a timeline: soft ambient bed,
whooshes on scene changes, pops on cue words, a low hit when the hook cuts.
All synthesized with numpy (deterministic), written as a mono 44.1 kHz WAV."""
import wave
import numpy as np

SR = 44100


def _env(n, attack, release):
    a, r = max(1, int(attack * SR)), max(1, int(release * SR))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def whoosh(dur=0.55, seed=1):
    n = int(dur * SR)
    rng = np.random.default_rng(seed)
    noise = rng.standard_normal(n)
    # one-pole lowpass whose cutoff sweeps up then down -> airy swoosh
    cut = np.concatenate([np.linspace(0.02, 0.35, n // 2), np.linspace(0.35, 0.05, n - n // 2)])
    out, y = np.empty(n), 0.0
    for i in range(n):
        y += cut[i] * (noise[i] - y)
        out[i] = y
    return out / (np.abs(out).max() + 1e-9) * _env(n, dur * 0.55, dur * 0.4)


def pop(freq=880, dur=0.09):
    t = np.arange(int(dur * SR)) / SR
    f = freq * np.exp(-t * 18) + freq * 0.5
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)


def hit(dur=0.7):
    t = np.arange(int(dur * SR)) / SR
    body = np.sin(2 * np.pi * (55 + 60 * np.exp(-t * 20)) * t) * np.exp(-t * 6)
    return body / np.abs(body).max()


def bed(total):
    """Very quiet evolving pad (A minor add9) with slow swells."""
    t = np.arange(int(total * SR)) / SR
    notes = [110.0, 164.81, 220.0, 246.94, 261.63]
    pad = sum(np.sin(2 * np.pi * f * t + i) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.05 + i * 0.013) * t + i))
              for i, f in enumerate(notes)) / len(notes)
    shimmer = np.sin(2 * np.pi * 523.25 * t) * 0.15 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t))
    return (pad + shimmer) * _env(len(t), 1.5, 1.2)


def db(x):
    return 10 ** (x / 20)


def render(timeline, path, total=None):
    total = total or timeline["duration"]
    n = int(total * SR) + SR
    mix = np.zeros(n)

    def place(sig, at, gain):
        i = int(max(0.0, at) * SR)
        j = min(n, i + len(sig))
        if i < n:
            mix[i:j] += sig[:j - i] * gain

    mix[:int(total * SR)] += bed(total) * db(-34)
    hook = timeline.get("hook")
    if hook:
        place(hit(), hook["end"] - 0.05, db(-20))
    for k, sc in enumerate(timeline["scenes"][1:], 1):
        if sc["start"] < total:
            place(whoosh(seed=k), sc["start"] - 0.3, db(-26))
    for sc in timeline["scenes"]:
        for at in sc.get("cues", {}).values():
            if at < total:
                place(pop(freq=660 + 220 * (int(at * 10) % 3)), at, db(-28))
    mix = mix[:int(total * SR)]
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return path
