# ag-02-mosquito-magnet — Stickstory Short (the human body)

- **File:** `videos/2026-11-12/ag-02-mosquito-magnet.json` · format short · publish_at `2026-11-12T19:00:00-05:00` (Istanbul 13.11 03:00)
- **Category:** the human body (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403) → web search. Chosen (US): ScienceDaily / Florida International University,
  10 Nov 2026: "Scientists discover why some mosquitoes love you and others don't" (iScience 2026, 119 volunteers, three species,
  no single person attracted all three; skin chemistry / microbiome). Use as a one-clause hook only.
- **Topic (the lasting story):** the Rockefeller University "mosquito magnet" study (Leslie Vosshall lab, Maria Elena De Obaldia,
  Cell, Oct 2022). Volunteers wore nylon stockings on their forearms for six hours; mosquitoes (Aedes aegypti) chose between pairs
  of stockings in a round-robin "tournament"; main study ran three years. "Subject 33" was about 4× more attractive than the next
  and ~100× more than the least attractive (Subject 19); the magnets had far more carboxylic acids on their skin (made from sebum
  by skin bacteria) and stayed magnets over time. Even mosquitoes with odor receptors knocked out could still find the magnets.
  VERIFY on ≥ 2 sources (rockefeller.edu news 33019, Cell paper, Scientific American "Some people really are mosquito magnets",
  ScienceDaily 2022 + 2026). Mention the new 2026 finding only if budget allows ("and each kind of mosquito has its own favorites").
- **Viewer should feel:** "So it really IS my skin, and I can't wash it off."
- **Hook:** e.g. "Mosquitoes loved one woman 100 times more." (check the sex of Subject 33 is public; if not, "one volunteer")
  ↔ cover "SUBJECT 33" / "100× TASTIER" / "BITTEN FIRST". ≥ 3 cover candidates.
- **Structure:** hook (Subject 33, 100×) → headline clause → stockings tournament, three years → the reason: skin acids made by bacteria →
  they stay magnets, soap doesn't change it / even "nose-less" mosquitoes find them → punchline + one short natural subscribe line.
- **Related long video:** none.
- **Budget:** same as ag-01: **400–430 chars**.
- **Look:** sets `interior` (lab), `night` (bedroom, buzzing), `field`/`hills` summer evening; close-up on a forearm with a stocking or
  a mosquito on skin (zoom ≥ 1.6); a "tournament bracket" of stockings as a full-frame board inside a lab bench. Kaşif host 15–25 %
  (e.g. wearing a stocking on his arm, swatting). On-screen `source` ≥ 1. Must look different from ag-01 (no clock) and recent shorts.

## Narration, shot list, cover candidates, critique log — writer/director fill below

### Narration (written first, one piece; 430 chars)

Mosquitoes loved one person 100 times more. This week, scientists found every mosquito species has its favorites.
The first clue? Nylon stockings. Volunteers wore them for six hours, then mosquitoes judged them in pairs. For three
years, one arm kept winning: Subject 33. The secret? Acids in the oil on their skin. And magnets stayed magnets. So
it's not your soap. It's your skin. Subscribe for a true story like this every day.

Fact check (≥ 2 sources each): stockings on forearms 6 h, round-robin pairs, 3-year study, Subject 33 (100× vs least
attractive Subject 19; 4× the next) — Rockefeller news 33019 + ScienceDaily 2022 (+ SciAm "over 100 times"); carboxylic
acids in sebum — Rockefeller + ScienceDaily 2022; magnets stayed magnets — ScienceDaily 2022 + SciAm; soap type made no
difference — SciAm (only source; worded as "not your soap"); 2026 headline (FIU, iScience, 119 volunteers, 3 species,
each has its own favorites) — ScienceDaily 10 Nov 2026. Subject 33's sex is not public → "one person", "their".
The study measured attraction, not bite counts → cover says "LOVED", not "BITTEN".

### Shot list (new types: mq_swarm, mq_lab, mq_arm, mq_board, mq_skin; helper mq__lib.js; reuses LH from lh__lib.js)

| # | Sentence | Visual | Type | Cue | Set / camera | Host |
|---|---|---|---|---|---|---|
| 0 | Mosquitoes loved one person 100 times more. | Meadow at dusk: host under a buzzing swarm, calm man beside him with none; red "100×" | mq_swarm | 100 | hills / push | shocked, hands on head |
| 1 | This week, scientists found every mosquito species has its favorites. | 3 people, 3 species (Aedes / tiger / Culex) each flying to a different person; tags | mq_swarm | scientists, mosquito, favorites | field / pan right; source ScienceDaily | — |
| 2 | The first clue? Nylon stockings. | Scientist in lab coat lifts a worn nylon stocking; mosquito cage on the bench; "THE CLUE" | mq_lab hold | Nylon | interior / push | — |
| 3 | Volunteers wore them for six hours, | Forearm close-up, stocking slides on, scent wisps rise; "6 HOURS" | mq_arm stocking | six | interior / **close-up zoom 1.6** | — |
| 4 | then mosquitoes judged them in pairs. | Two-choice olfactometer, chambers A/B with stockings; gates lift, most fly to A | mq_lab test | judged | interior / push | — |
| 5 | For three years, one arm kept winning: Subject 33. | Cork-board tournament bracket draws itself, red winner path, champion card "33" with crown | mq_board bracket | winning | interior / pull; source Rockefeller University | — |
| 6 | The secret? Acids in the oil on their skin. | Magnifying glass: skin ridges, pores, oil beads, bacteria; gold acid molecules rise to a giant mosquito head; "ACIDS", "SKIN OIL" | mq_skin | Acids, oil | own world / push; source Cell, 2022 | — |
| 7 | And magnets stayed magnets. | Line chart on the board: grey lines low, red line stays on top; tag "33"; "YEAR AFTER YEAR" | mq_board chart | stayed | interior / push | — |
| 8 | So it's not your soap. It's your skin. | Forearm scrubbed with soap, foam, 4 mosquitoes still circling; "NOT SOAP", "YOUR SKIN" | mq_arm soap | soap, skin | interior / push; source Scientific American | — |
| 9 | Subscribe for a true story like this every day. | Night meadow, host waves, one mosquito circles him, he points at it | mq_swarm | story | night / pull | waves → points |

Host on screen 2/10 = 20 %. Types: 5 different, no type > 30 %, no 3 in a row.

### Cover candidates (all scene 0, t 1.4, host already big in the scene → `kasif: false`)
- A: LOVED / 100 TIMES / MORE (highlight LOVED), no focus — host + calm man small, swarm thin. Weaker.
- B: BITTEN / 100 TIMES / MORE, focus [360, 600] zoom 1.3 — strong framing, but "bitten" overclaims (study measured attraction).
- C: 100 TIMES / TASTIER, focus — strong framing, "tastier" is a stretch.
- **Chosen:** A's text with B/C's framing: LOVED / 100 TIMES / MORE + focus [360, 600] zoom 1.3 — big shocked host face, single symbol (the swarm), matches the first sentence.

## Critique log

### ag-02-mosquito-magnet — round 1
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Pacing | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 | 7 | 7 | 7 | 7 | 6 | 7 | 8 | 7 | 8 | 7 |
1. Story logic and accuracy: "This week" / "every species" / "first clue" sounded like the 2026 study; "magnet" was never said.
2. Cover and scene 0: calm man cut off, swarm sat on the fez like a hat, "LOVED" ambiguous.
3. Monotony and host: 6/10 scenes in the same grey lab; the host is missing from the middle; arm close-up looked like a plaster cast; mosquito head unclear; scene 7 and scene 3 too static; scene 9 kicker duplicates the brand.

**Fixes (writer):**
- New narration (425 chars; superseded by the shot list below where they differ): "Mosquitoes loved one person 100 times more. Scientists call people like that mosquito magnets. The proof started with nylon stockings. Volunteers wore them for six hours, then mosquitoes judged them in pairs. For three years, one arm kept winning: Subject 33. The secret? Acids in the oil on their skin. And magnets stayed magnets. So it's mostly not your soap. It's your skin. Subscribe for a true story like this every day." The 2026 FIU twist did not fit the 440 budget; it stays in the description, worded "a 2026 study of three mosquito species found that each kind prefers different people". "Mostly" keeps the soap line honest (FIU: Aedes aegypti preferred people without added fragrance).
- Scene 0 / cover: the swarm now orbits the host's head in a ring (new `ring` option), face clear; host at x 0.42, calm man at 0.82, both fully in frame; "100×" sits between them. Cover candidates (all scene 0, focus [560, 700], zoom 1.08): A "LOVED / 100 TIMES / MORE", B "MOSQUITO / MAGNET / 100×", C "MOSQUITOES' / FAVORITE / HUMAN". **Chosen C**: clearest at thumbnail size, same idea as the first sentence, does not repeat the title "Mosquito Magnets: …" (B does).
- Scene 1 (new): three people in a field, the mosquitoes all crowd the middle one, a red horseshoe magnet appears above him on "magnets" with pulsing pull arcs, plus the label "MOSQUITO MAGNET" (no kicker, so they don't collide).
- Scene 3 (new type `mq_wear`): the host himself wears the stocking as a sleeve at the lab table, in a 1.6 close-up with his face visible; an hourglass runs and a card counts "1 HOUR" up to a red "6 HOURS" on "six". Host now 3/10 scenes (30 %; lint warns 15–25 %, accepted by the coordinator).
- Scene 6: lens moved up (bottom above the caption band); the forearm lies on a wooden table that fills the lower third; the vague head became a big, clearly striped mosquito hovering nose-down at the top right with gold sniff arcs; interior set.
- Scene 7: 1.6 close-up on the chart; a red marker pen draws the red line, the "33" tag pops at its end (motion 11 → 20).
- Scene 8: new bathroom (blue tile wall, mirror, dripping tap, tiled counter) breaks the run of grey lab cabinets; labels "MOSTLY NOT SOAP" / "YOUR SKIN".
- Scene 9: kicker removed; the mosquito orbits beside his head (not on the kicker); the host tracks it with binoculars, then points at the viewer with a grin on "story".
- Kicker/label collisions fixed in scenes 1, 2 ("New York"), 7, 8; scene 3 card and hourglass pulled inside the close-up crop.
- New/changed files: mq_wear.js (new); mq__lib.js (ring orbit), mq_swarm.js (magnet, head-relative swarm), mq_skin.js, mq_arm.js (room "bath"), mq_board.js (marker pen).

### ag-02-mosquito-magnet — round 2
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Pacing | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 7 | 7 | 8 | 8 | 8 | 8 |
Passed. Polish requested: (1) scene 7 board frame line through the brand mark / kicker; (2) scene 3 stocking read as a small bundle on the hand, "3 HOURS" card touching the fez; (3) scene 1 first-frame subtitle check, cover mosquitoes clipped at the left.

**Fixes (writer):**
- Scene 7: chart close-up focus moved down to [690, 760]; the board's top frame line now sits below the brand mark and the "OVER TIME" kicker.
- Scene 3 (mq_wear): the stocking now runs along the whole forearm from near the elbow to a rounded toe past the fingers, with cross-hatched mesh, a heel line and a dark elastic hem; the counter card moved to [0.63, 0.405] (off the fez, fully inside the 1.6 crop), font 68 px.
- Scene 1: checked with `build.py --no-tts --still 3.6`: the subtitle strip is solid above the grass (the preview's faint look was the dissolve). No change.
- Cover / scene 0: the swarm ring is shifted 60 px right (`dx`); all mosquitoes are now inside the frame.
- Lint OK, SEO 100/100 (only the accepted host-30 % warning); preview motion in every scene ≥ 4.0.

### Director — final gate (round 2 scores + round 3 polish)
Script 8 · Hook 8 · Readability 7 · Visual 8 · Motion 8 · Composition+Kaşif 7 · Depth 7 · Pacing 8 · Accuracy 8 · Closing 8 · Cover 8. Narration 425 chars. lint OK (1 warning: Kaşif 3/10 = 30%, under the 35% cap, accepted for the scene-3 close-up). cover.jpg + sheet.png checked by the director.
