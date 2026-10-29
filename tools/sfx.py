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


def db(x):
    return 10 ** (x / 20)


def render(timeline, path, total=None):
    total = total or timeline["duration"]
    mix = drone(total) * db(-31) if timeline.get("theme") == "belgesel" else bed(total) * db(-34)
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return path
