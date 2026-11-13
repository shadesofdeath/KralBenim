# ag-01-bombardier-beetle — Stickstory Short (animal superpowers)

- **File:** `videos/2026-11-13/ag-01-bombardier-beetle.json` · format short · publish_at `2026-11-13T13:00:00-05:00` (Istanbul 13.11 21:00)
- **Category:** animal superpowers (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries); a quick web search gave no usable front-page story for this
  category → **topic from the category pool** (reported).
- **Topic:** the bombardier beetle (Brachinini). It mixes hydroquinones + hydrogen peroxide with enzymes in a hardened reaction
  chamber and fires a boiling (~100 °C) toxic spray in rapid pulses (Eisner & Aneshansley, Science 1999: ~500 pulses/s in
  *Brachinus*). Kicker fact: Sugiura & Sato, Biology Letters 2018 — Japanese bombardier beetles (*Pheropsophus jessoensis*)
  swallowed by toads were vomited back out ALIVE (43 % of them), up to 107 minutes later, by spraying inside the toad.
  Optional: young Darwin popped a beetle into his mouth and it squirted acrid fluid (Autobiography) — only if a reliable source
  says it was a bombardier-type beetle; otherwise leave Darwin out. VERIFY every number on ≥ 2 sources.
- **Viewer should feel:** "A bug that boils its own blood-hot chemicals and escapes from a stomach? Nature is wild."
- **Hook (3–8 words, same idea as cover):** e.g. "This beetle escapes from inside a toad." ↔ cover "SWALLOWED. / THEN IT / ESCAPED"
  / "IT CAME BACK OUT" / "BOILING BUTT". ≥ 3 cover candidates.
- **Structure:** hook (escape from the toad) → what it is + the trick (two chemicals, a chamber, boiling, pulses like a machine
  gun) → the 2018 experiment (swallowed, toad throws it up alive, up to almost 2 hours later) → punchline (complete standalone
  line) + one short subscribe line with reason.
- **Related long video:** none.
- **Budget:** `elevenlabs_chars.warning: true` (232,228 / budget 231,442) → narration **400–425 chars**.
- **Look:** sets `field` / `night` (grass at ground level, giant blades of grass so the beetle reads big), a cutaway "inside the
  beetle" (two tanks → chamber → nozzle, steam), a toad close-up (camera push, zoom ≥ 1.6), the toad gagging and the beetle
  walking out. Kaşif host 15–25 % (e.g. as a tiny figure with a magnifying glass, ducking the spray; holding a stopwatch at
  "107 minutes"). On-screen `source` ≥ 1 (e.g. "Biology Letters, 2018"). Pattern must differ from recent shorts
  (2026-11-12 mosquito, 2026-11-08 godwit, 2026-11-04 wood frog).

## Narration, shot list, cover candidates, critique log — writer/director fill below

### Narration (written first, one piece; 422 chars)

This beetle escaped from inside a toad. Meet the bombardier beetle. Its butt is a weapon. Two chemicals mix in a tiny
chamber, and blast out boiling hot, hundreds of times a second. But can it survive being eaten? Scientists in Japan fed
them to toads. They kept firing inside. Forty-three percent got thrown up alive, one after 107 minutes. The toad ate it.
The beetle won. Subscribe for a true story like this every day.

Fact check (≥ 2 sources each):
- 43 % of *Pheropsophus jessoensis* vomited alive; 12 to 107 minutes in the stomach; toads *Bufo japonicus* and *B. torrenticola*;
  beetles with spent spray were digested (Science News 2018 + National Geographic 2018; data: Dryad, Sugiura & Sato 2018).
- Spray ≈ 100 °C ("boiling hot"): Science News 2018 + National Geographic (Arndt et al. 2015).
- Reservoir + hard reaction chamber, chemicals (hydroquinones + hydrogen peroxide, enzymes): National Geographic (Arndt 2015) +
  Eisner & Aneshansley (PNAS 1999, "biological pulse jet"). Pulse rate: ~500 /s (Eisner 1999), 368–735 /s (Arndt 2015) →
  written as "hundreds of times a second".
- "Escaped" = thrown back up alive (the study's own framing: "escape from predator digestive systems").
- Darwin anecdote left out (no reliable source that his beetle was a bombardier). "2018" moved to the kicker/description (budget).

### Shot list (new file `scenes/studio/shots/bmb_beetle.js`: bmb_toad, bmb_beetle, bmb_cut, bmb_clock; uses LH from lh__lib.js)

| # | Sentence | Visual | Type | Cue | Set / camera | Host |
|---|---|---|---|---|---|---|
| 0 | This beetle escaped from inside a toad. | (cover hook on top) toad's mouth opens, steam wisp, beetle crawls out over its lip | bmb_toad hook | escaped | field / push | — (cover host) |
| 1 | Meet the bombardier beetle. Its butt is a weapon. | beetle walks in; host points, magnifying glass on the beetle; red ring on the abdomen tip; "BOMBARDIER BEETLE", "WEAPON" | bmb_beetle meet | bombardier, weapon | field / right | points → shock |
| 2 | Two chemicals mix in a tiny chamber, | giant cut-away beetle: gold + blue tanks, drops race to a red armored chamber that throbs; "TWO CHEMICALS", "CHAMBER" | bmb_cut beetle | mix, chamber | field / push | — |
| 3 | and blast out boiling hot, hundreds of times a second. | ant creeps up, beetle tips its rear and fires a flickering jet + steam, ant flips away; "BOILING HOT" | bmb_beetle fire | blast, boiling | field / focus zoom 1.25; source Science, 2015 | — |
| 4 | But can it survive being eaten? Scientists in Japan fed them to toads. | lab terrarium on a desk, tweezers lower the beetle, tongue flicks on "toads", gulp | bmb_toad feed | toads | interior / push; kicker "The test · Japan, 2018"; source Biology Letters, 2018 | — |
| 5 | They kept firing inside. | toad close-up with an x-ray belly window: the beetle keeps firing, toad jerks and squints; "STILL FIRING" | bmb_cut belly | firing | interior / **close-up zoom 1.6** | — |
| 6 | Forty-three percent got thrown up alive, | toad heaves, beetle flies out in an arc, lands, walks; "43%", "ALIVE" | bmb_toad gag | Forty, thrown, alive | interior / left | — |
| 7 | one after 107 minutes. | night field: stopwatch on a post counts 0 → 107 MIN, bloated toad hiccups, spits the beetle out on "minutes" | bmb_clock | minutes | night / push | — |
| 8 | The toad ate it. The beetle won. | sunset: dizzy toad with spiral eyes and stars, beetle marches off; "BEETLE WINS" | bmb_toad end | won | hills / right | — |
| 9 | Subscribe for a true story like this every day. | night meadow, beetle walks up to the host who waves, a puff on "story" makes him jump, then he points at the viewer | bmb_beetle end | story, every | night / pull | wave → shock → point |

Host 2/10 = 20 %. Types: 4 (toad 4, beetle 3, cut 2, clock 1), never 3 in a row. Palette `ag-newsprint` (last two ag- shorts with a palette: sage, slate/dusk).
Pattern vs recent shorts: no meadow-swarm/lab-bench/bracket (mosquito), no flight map (godwit), no frozen close-up (wood frog); new: cut-aways, terrarium, stopwatch.

### Cover candidates (rendered with `build.py --cover --no-tts`, compared side by side)
- A: scene 0 t 1.6 "SWALLOWED, / THEN IT / ESCAPED" — toad + beetle at the mouth; beetle small, the open mouth reads as a brown bib. Weak.
- B: scene 5 x-ray belly, "IT ESCAPED / A TOAD'S / STOMACH" — strongest image, but 5 words (lint max 4).
- C: scene 6 terrarium gag, same text as A — glass + desk clutter, toad small. Weakest.
- **Chosen:** B's image (scene 5, t 0.35, before the label) + A's text "SWALLOWED, / THEN IT / ESCAPED" (highlight ESCAPED; shares "escaped"
  with the first sentence) + big shocked host (scale 1.35) facing the toad. One symbol: the beetle inside the toad.

### Critique log — ag-01 — round 1
Lint: OK. Preview: 10 scenes, ~33 s, 422 chars; motion 3.5 / 21.2 / 19.3 / 13.4 / 11.8 / 16.1 / 8.1 / 12.5 / 11.6 / 12.4 (no STATIC?).
Source checked (Science News 2018): 43 % of swallowed *P. jessoensis* came back up alive, 12–107 min, spray ~100 °C; beetles drained of spray were almost all kept down; 15 of 16 vomited beetles lived ≥ 17 days.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 6 | 6 | 8 | 7 | 8 | 8 | 7 | 6 | 8 |

1. **Scenes 6–8 (narration + closing): the story skips its own proof, and the punchline overclaims.** "The toad ate it. The beetle won." is false for the 57 % that were digested. It also never says *why* we know the spray did it. The study's strongest detail is missing: beetles drained of spray were almost never thrown up. Scene 6/7 are also two fragments ("Forty-three percent got thrown up alive, / one after 107 minutes."), and "They kept firing inside" points grammatically at the scientists/toads. → After the 107-minute line, add one sentence with the control: "But beetles with an empty tank? The toads kept almost every one down." Then end on a true, self-contained punchline, e.g. "Its boiling spray is a ticket out of a stomach." Say "The beetles kept firing inside the toad." (~+110 chars, still ≤ 550). Optional: "and most of them lived for weeks after." The "BEETLE WINS" label then becomes something like "SPRAY = ESCAPE".
2. **Scene 5 (x-ray belly, close-up zoom 1.6): the red "STILL FIRING" label is cut off at the right edge ("STILL FIRIN").** This is the frame the cover and the hook are built from. Scene 1 has a similar overlap: "WEAPON" sits over the host's pointing arm. → Under the 1.6 zoom with focus [440, 900], move the label to x ≈ 0.40 and/or cut it to size ~70 so it fits inside the zoomed frame. In scene 1, move "WEAPON" right/down next to the red ring on the abdomen (x ≈ 0.62, y ≈ 0.50), clear of the arm.
3. **Scene 3 ("blast out boiling hot, hundreds of times a second"): the key visual moment does not read.** The jet is a thin dotted line low in the grass at the left edge. The ant is cut off at x≈0. The camera (zoom 1.25) frames the beetle's back, not the blast. It does not count as a close-up (rule: zoom ≥ 1.6). → Set camera focus on the tail/jet (≈ [380, 1000]) with zoom ≥ 1.7. Lift the jet above the grass line and make it a thick pulsing gold/red jet with a white steam cloud (several visible pulses). Put the ant fully in frame (x ≥ 0.25) so it is clearly blown over. Secondary (not counted in the 3): scene 7 jumps from the lab terrarium to a night field, which contradicts the lab experiment, so keep it in the terrarium/lab (night window is fine). Scene 0's escape animation is fully hidden under the cover block (fine for the hook, but its 2.9 s show no new image).

**Round 1 fixes (writer):** narration now 459 chars, 11 scenes (Kaşif 2/11 = 18 %):
"This beetle escaped from inside a toad. The bombardier beetle's butt is a weapon. Two chemicals mix in a chamber, and blast
out boiling hot, hundreds of times a second. Can it survive being eaten? Scientists fed them to toads. The beetles kept firing
inside. Forty-three percent came back up alive, one after 107 minutes. Beetles with empty tanks? Almost all stayed down. Its
spray is a ticket out of a stomach. Subscribe for a true story like this every day."
- New scene 8 (`bmb_cut` belly, new `empty: true` option): a calm, full toad with the spent beetle inside, nothing fires;
  "EMPTY TANK" + red "STAYED DOWN"; on-screen source Biology Letters, 2018. The overclaiming punchline is gone. The new
  punchline (scene 9) is labelled "SPRAY = ESCAPE". Subject fixed: "The beetles kept firing inside." ("Japan" stays in the
  scene-4 kicker; the line was cut for budget.)
- Scene 5: "STILL FIRING" moved to x 0.40, size 72, so it fits the 1.6 crop. Scene 1: "WEAPON" moved next to the red abdomen
  ring (x 0.55, y 0.50), clear of the host's arm.
- Scene 3: close-up focus [360, 1040], zoom 1.7. Foreground grass lowered (front 0.665) so the jet runs above it. The jet is
  2.4× thicker with 1.5× steam puffs, and the ant is drawn over the jet, fully in frame, blown up and onto its back.
- Scene 7: moved into the lab (interior set, desk front), stopwatch on a stand beside the toad.
- Cover unchanged (scene 5, t 0.35 is before the label appears); re-checked cover.jpg. Lint OK, SEO 100/100; motion ≥ 2.5 in every scene.

### Critique log — ag-01 — round 2
Lint: OK. Preview: 11 scenes, ~35 s, 459 chars; motion 2.5 / 25.2 / 19.6 / 12.7 / 12.1 / 15.5 / 8.5 / 12.0 / 10.3 / 13.3 / 12.4 (no STATIC?).
Round 1 fixes checked: scene 5 label now fits ✔; scene 7 moved into the lab ✔; empty-tank proof + honest punchline added ✔; scene 3 is now a real close-up (1.7) ✔ but see 1.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 8 | 7 | 8 | 8 | 8 | 7 | 8 |

1. **Scene 3 (close-up blast): the beetle is now cropped and the ant is not blown over.** At focus [360, 1040] zoom 1.7, the beetle's front half and head are off the right edge; only a black shell is visible. The jet reads as 3–4 separate small puffs that start a gap away from the abdomen tip. The ant stands upright in both sampled frames ("boiling hot", "a second"), so the "blast" is not shown landing. → Move the focus right (≈ [470, 1030]) or set beetle x ≈ 0.55 so the whole beetle including its head is in frame. Start the jet exactly at the abdomen tip as one continuous gold-red stream with steam. Flip the ant onto its back on the `fire` ("blast") cue so it is already on its back by "boiling".
2. **Scenes 8–9 (narration): "Beetles with empty tanks?" uses a word the audio never set up, and "Its spray" follows a plural subject.** The narration only said "two chemicals mix in a chamber", never "tanks", so a listener has to guess what an empty tank is. → "Beetles that had used up their spray? Almost all stayed down. Their spray is a ticket out of a stomach." (about the same length). The scene 8 label can stay "EMPTY TANK" or become "NO SPRAY LEFT".
3. **Labels sit on top of the subject (scenes 1, 8, 9).** Scene 1: "WEAPON" now lies across the beetle's body, the red ring and the magnifier rim. → Place it above-left of the abdomen tip in clear sky (x ≈ 0.42, y ≈ 0.40) with the arrow pointing down to the ring. Scene 8: "EMPTY TANK" overlaps the toad's back. → Raise it to y ≈ 0.50 or move it left. Scene 9: the "=" in "SPRAY = ESCAPE" is so thin it vanishes at 360 px ("SPRAY ESCAPE"). → Draw the "=" heavier, or use a plain 2–3-word label such as "SPRAY WINS".
Verdict: passes (all ≥ 7, cover 8). The fixes above are polish for round 3 if time allows.

**Round 2 fixes (writer):** narration 458 chars, 11 scenes.
- Narration: "The beetles kept firing inside. Forty-three percent came up alive, one after 107 minutes. Beetles that had used up
  their spray? Almost all stayed down. Their spray is a ticket out of a stomach." ("used up their spray" sets up the control;
  "Their" matches the plural). Final line trimmed to "Subscribe for a true story every day." to hold the budget.
- Scene 3: beetle at x 0.58 (whole body in the 1.7 crop, focus [480, 1030]); the jet is now one continuous tapered gold-red
  stream (new `stream` option) straight from the abdomen tip with a steam cloud; the ant rides the stream and flips onto its
  back on the blast cue.
- Scene 1: "WEAPON" moved to clear space above-left of the abdomen tip (x 0.40, y 0.505) with the arrow pointing to the red ring;
  host nudged to x 0.19 so the label clears his arm.
- Scene 8: labels off the toad's back — "NO SPRAY LEFT" (x 0.42, y 0.22) and "STAYED DOWN" (x 0.60, y 0.30).
- Scene 9: punchline label "SPRAY = ESCAPE" → "SPRAY WINS".
- Lint OK, SEO 100/100; cover unchanged (scene 5, t 0.35), re-checked. Motion ≥ 2.9 in every scene.
