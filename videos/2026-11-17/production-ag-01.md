# ag-01-glymphatic-brain-wash — Stickstory Short (the human body)

- **File:** `videos/2026-11-17/ag-01-brain-wash.json` · format short · publish_at `2026-11-17T13:00:00-05:00` (Istanbul 17.11 21:00)
- **Category:** the human body (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → ScienceDaily top science (US), 15 Nov 2026:
  "MIT Scientists Discover a Surprising Way to Boost the Brain's Nighttime Cleaning System". Not one of the 7 Google News
  front pages (unreachable) — reported.
- **Topic:** the glymphatic system. Your brain has no lymph vessels inside it like the rest of the body, so how does it take
  out its trash? Maiken Nedergaard's lab (University of Rochester) described the glymphatic system in 2012 and showed in
  2013 (Science, Xie et al.) that in sleeping (and anaesthetised) mice the space between brain cells grows (~60 %) and
  cerebrospinal fluid flushes through it, clearing waste such as beta-amyloid far faster than when awake. 2019 (Fultz et al.,
  Science, Boston Univ.) imaged waves of CSF washing the human brain during deep sleep. VERIFY every number on ≥ 2 sources;
  be careful not to overclaim for humans (most evidence in mice) and don't make medical promises.
- **Viewer should feel:** "My brain literally gets washed every night — sleep isn't rest, it's cleaning."
- **Hook idea:** first sentence 3–8 words, e.g. "Every night, your brain takes a bath." ↔ cover "YOUR BRAIN / GETS WASHED" (highlight WASHED).
- **Budget:** `elevenlabs_chars.warning: true` (254,132 / 231,442) → narration **400–425 chars** (hard max 550), 8–11 scenes.
- **Look:** a new type in its own file `scenes/studio/shots/bw_*.js` (e.g. a brain cross-section with fluid waves flowing
  through widening gaps between cells, a sleeping head on a pillow with tide-like waves). Sets `night` / `interior`
  (bedroom, lab). ≥ 1 close-up. Kaşif host 15–25 %. On-screen `source` ≥ 1. Ends with punchline + one natural subscribe line.

## Writer

**Verified facts (≥ 2 sources each):** 2013, Xie et al. (Science 342), Nedergaard lab, University of Rochester: space
between brain cells about 60 % larger in sleeping/anaesthetised mice (ScienceDaily 2013, Live Science 2013, Frontiers in
Neurology 2013); beta-amyloid cleared about twice as fast asleep (Live Science, Frontiers). 2019, Fultz et al. (Science
366), Boston University: waves of cerebrospinal fluid in non-REM sleep, 13 volunteers (NIBIB/NIH, ScienceDaily 2019).
MIT 2026 (Levitt, Lewis; Sci. Transl. Med.): pink-noise bursts strengthen the waves (MIT News 9 Sep 2026); in the
description only, no room in the 425-character budget. Mouse numbers are framed as mice; the human claim is only
"scans caught waves", with no medical promise.

**Narration (425 chars, ElevenLabs warning → low end):**
Every night, your brain takes a bath. Your body has lymph vessels to haul out trash. Inside your brain? None. So how
does it clean up? In 2013, scientists watched mice sleep. The gaps between their brain cells grew 60 percent, and fluid
flushed through, clearing waste twice as fast. In 2019, scans caught waves of that fluid in sleeping people. Sleep isn't
just rest. It's cleaning night. Subscribe for one true story a day.

**Shot list** (types in `scenes/studio/shots/bw_brain.js`; palette `ag-dusk`):
| # | Text | Type | Visual / cue | Camera | Fez host |
|---|---|---|---|---|---|
| 0 | Every night, your brain takes a bath. | bw_bed | sleeper on the back, X-ray brain, blue tides, bubbles, rubber duck; night window | wide push | shock → points on "bath" |
| 1 | Your body has lymph vessels to haul out trash. | bw_body | giant body, green vessels, gold specks to the neck; "lymph vessels" label, TRASH OUT stamp | down | – |
| 2 | Inside your brain? None. | bw_body | brain has no vessels; red ring + "?", neck flashes, NONE stamp | **close-up** head | – |
| 3 | So how does it clean up? In 2013, scientists watched mice sleep. | bw_lab | scientist over a glass box with a sleeping mouse, monitor trace; red "?" on "clean", 2013 stamp | left | – |
| 4 | The gaps between their brain cells grew 60 percent, | bw_cells grow | tissue, gaps widen on "grew", counter +0 → +60%; source "Science, 2013" | pull | – |
| 5 | and fluid flushed through, clearing waste twice as fast. | bw_cells flow | blue fluid streams, gold waste washes out; 2× FASTER | **close-up** | – |
| 6 | In 2019, scans caught waves of that fluid in sleeping people. | bw_scan | MRI ring, blue pulses round the head, monitor wave; 2019; source "Science, 2019" | push | – |
| 7 | Sleep isn't just rest. It's cleaning night. | bw_bed | brain sparkles gold on "cleaning", CLEANING NIGHT stamp | **close-up** head | – |
| 8 | Subscribe for one true story a day. | bw_bed | calm sleeper, duck bobbing | pull | waves → points |

Kaşif 2/9 (22 %). Sets: bedroom / clinic / lab / scanner = interior; microscope = no set.

**Cover (3+ candidates compared):** "YOUR BRAIN / GETS **WASHED**".
- A: scene 0, t 1.2, focus on the head (zoom 1.2) + big shocked fez host bottom right → **chosen**: one clear subject (the
  head with the brain in a bath), readable face of the host, matches the first sentence.
- B: scene 7 (gold sparkles + CLEANING NIGHT stamp): the stamp competes with the cover text, so it has two focal points.
- C: scene 5 (cells with fluid): abstract, unreadable as a "brain" at phone size.
- A without the host overlay: the zoom pushed the scene's own host out of frame, so there was no host.

**Title:** Glymphatic System: Your Brain Takes a Bath Every Night · tags[0] `glymphatic system`.

## Eleştiri günlüğü

### ag-01-brain-wash — round 1 (critic)
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 9 | 8 | 8 | 7 | 7 | 8 | 8 | 6 | 6 | 7 |
1. Accuracy: "None." is false (meningeal lymphatics, Louveau 2015); the sleep-clearance claim is debated (Miao 2024) → "Deep inside your brain? None.", red ring only round the brain tissue, ending hedged ("may"); both papers added to sources, the description mentions the debate and the outer lymph vessels.
2. Closing: "Sleep isn't just rest. It's cleaning night." → "Skip sleep, and your brain may skip the wash." (eye opens, tide drains, waste stays, stamp NO WASH); subscribe → "Subscribe for a true story like this every day."; "So how does it clean up?" → "So how?"; "that fluid" → "that flush". The 418-character budget left no room for an extra "but nobody knew…" line.
3. Cover: the sleeper in bw_bed is redrawn (nose up, brow, closed eye with lashes, C-shaped ear, brain fully inside the skull, blue tide bands with foam lines, no duck). Cover focus [400, 880], zoom 1.55, shocked host up beside the head. 4 candidates compared (zoom 1.35 / 1.55 / 1.75 / 1.55 with a higher focus) → the last one was chosen: the head fills the frame under the text and the tide and the host's face read at phone size. The pale band under the text is the engine's cover shade (shared engine.js, not touched).
Minor: the scene 3 "?" now sits between the window and the monitor (P.qx/qy), with the 2013 stamp above it; bw_cells cells breathe and drift ±14 px, the gap specks drift in "grow" and stream faster in "flow".
Narration 418 chars; lint OK (SEO 100).

### ag-01-brain-wash — round 2 (critic)
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 7 | 8 | 7 | 7 | 8 | 8 | 8 | 8 | 8 (cover 7.5) |
1. Cover: the ear mark is removed (the face is brow, closed eye, cheek and upward nose only); focus [400, 820], zoom 1.7, so the head and nose now reach just under the text; the host now stands at x 860, y 1500 (feet on the bed edge line, not on the quilt slope).
2. Scene 7: the NO WASH stamp moved to y 0.53 (sits on the pillow, clear above the subtitle band).
3. Scenes 4–5: bw_cells leaves the top-left kicker corner free of cells (centres x < 590, y < 410 skipped); scene 5's close-up became a light push (zoom 1.05) so the clear corner stays where the kicker is. Close-ups left: scenes 2 and 7.
Lint OK (SEO 100), 418 chars.
