#!/usr/bin/env python3
"""Procedural, royalty-free background for a timeline: a very quiet ambient music bed.
(Transition whooshes, cue pops and the hook hit were removed: they sounded cheap.)
Synthesized with numpy (deterministic), written as a mono 44.1 kHz WAV."""
import wave
import numpy as np

SR = 44100


def _env(n, attack, release):
    a, r = max(1, int(attack * SR)), max(1, int(release * SR))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def bed(total):
    """Very quiet evolving pad (A minor add9) with slow swells."""
    t = np.arange(int(total * SR)) / SR
    notes = [110.0, 164.81, 220.0, 246.94, 261.63]
    pad = sum(np.sin(2 * np.pi * f * t + i) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.05 + i * 0.013) * t + i))
              for i, f in enumerate(notes)) / len(notes)
    shimmer = np.sin(2 * np.pi * 523.25 * t) * 0.15 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t))
    return (pad + shimmer) * _env(len(t), 1.5, 1.2)


def drone(total):
    """Belgesel style: a dark, slow drone (D, low fifth) with breathing swells and a faint high air tone, like a
    space documentary bed. Deterministic, no percussion, no effects."""
    t = np.arange(int(total * SR)) / SR
    low = sum(np.sin(2 * np.pi * f * t + i) * (0.55 + 0.45 * np.sin(2 * np.pi * r * t + i * 1.7))
              for i, (f, r) in enumerate([(73.42, 0.021), (110.0, 0.017), (146.83, 0.029), (73.6, 0.013)])) / 4
    air = (np.sin(2 * np.pi * 587.33 * t) + 0.6 * np.sin(2 * np.pi * 880.0 * t + 1.1)) * 0.06 \
        * (0.5 + 0.5 * np.sin(2 * np.pi * 0.037 * t)) ** 2
    return (low + air) * _env(len(t), 3.0, 2.0)


def paper_bed(total, seed=0):
    """Watercolor style (docs/SULUBOYA.md): a warm, unhurried bed: a soft pad that moves between two chords every
    ~9 s and sparse felt-piano notes (soft attack, long decay) from a pentatonic scale. Deterministic per video."""
    t = np.arange(int(total * SR)) / SR
    rs = np.random.RandomState(seed % (2 ** 31))
    chords = [[146.83, 220.0, 293.66, 329.63], [130.81, 196.0, 261.63, 329.63], [110.0, 164.81, 220.0, 277.18],
              [123.47, 185.0, 246.94, 293.66]]
    order = [chords[i % len(chords)] for i in rs.permutation(len(chords))]
    span = 9.0
    pad = np.zeros_like(t)
    for k in range(int(total / span) + 2):
        notes = order[k % len(order)]
        a, b = k * span - 2.0, (k + 1) * span + 2.0
        n0, n1 = max(0, int(a * SR)), min(len(t), int(b * SR))
        if n0 >= n1:
            continue
        tt = t[n0:n1]
        win = np.clip(np.minimum((tt - a) / 3.0, (b - tt) / 3.0), 0, 1) ** 2
        pad[n0:n1] += win * sum(np.sin(2 * np.pi * f * tt + i) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * tt + i)) for i, f in enumerate(notes)) / 4
    keys = np.zeros_like(t)
    scale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25]
    at = 1.5 + rs.uniform(0, 2)
    while at < total - 2:
        f = scale[rs.randint(len(scale))]
        n0, n1 = int(at * SR), min(len(t), int((at + 4.5) * SR))
        tt = t[n0:n1] - at
        env = (1 - np.exp(-tt / 0.012)) * np.exp(-tt / 1.3)
        keys[n0:n1] += env * (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)) * 0.5
        at += rs.uniform(1.6, 4.2)
    return (pad * 0.8 + keys * 0.55) * _env(len(t), 2.0, 2.0)


def db(x):
    return 10 ** (x / 20)


def render(timeline, path, total=None):
    total = total or timeline["duration"]
    th = timeline.get("theme")
    seed = int(round(timeline.get("duration", total) * 1000))
    mix = paper_bed(total, seed) * db(-30) if th == "watercolor" else drone(total) * db(-31) if th == "belgesel" else bed(total) * db(-34)
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return path
