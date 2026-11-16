# ag-02-first-pottery — Stickstory Short (origins of everyday things)

- **File:** `videos/2026-11-16/ag-02-first-pottery.json` · format short · publish_at `2026-11-16T19:00:00-05:00` (Istanbul 17.11 03:00)
- **Category:** origins of everyday things (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403) → web search. Chosen headline: Archaeology Magazine (US), 12 Nov 2026,
  "Fired Clay Fragments Offer Hints to Development of Near Eastern Pottery" (Çemka Höyük, Turkey). Not from the 7 front
  pages (unreachable) — reported. Different headline from ag-01.
- **Topic:** The cooking pot is older than farming. Pottery from Xianrendong Cave (Jiangxi, China) dated ~20,000 years
  (Wu et al., Science, 2012) — made by Ice Age hunter-gatherers, ~10,000 years before farming; scorch marks suggest
  cooking (verify how sources phrase this). Optional bridge: fired clay figurines (Dolní Věstonice, ~26,000+ years) show
  people fired clay even before making pots. Headline hook: in the Near East, pottery came only later, after farming
  (verify; Çemka Höyük item). VERIFY every number on ≥ 2 sources; don't overclaim what was cooked.
- **Viewer should feel:** "We had pots before we had farms — Ice Age hunters were cooking in clay."
- **Hook (3–8 words, same idea as cover):** e.g. "Your cooking pot is older than farming." ↔ cover "OLDER THAN / FARMING" (≥ 3 cover candidates).
- **Structure:** hook → 2nd sentence: cave in China, 20,000 years, Ice Age → tension (no farms, no villages; why carry
  heavy pots?) → surprising detail (scorch marks / cooking, or fired-clay figurines) → punchline standalone → one short
  subscribe line with reason.
- **Related long video:** none.
- **Budget:** warning true → narration **400–425 chars** (hard max 550).
- **Look:** sets `snow` (Ice Age landscape, hunters), `interior` (cave with fire), `field` (later farm for contrast).
  New types in own file `scenes/studio/shots/po_*.js`. Kaşif host 15–25 %. Close-up ≥ 1 (scorched shard). On-screen
  `source` ≥ 1 (e.g. "Science, 2012"). Must differ in pattern from ag-01 (desert/ship) and recent shorts.

## Writer — narration, fact check, shot list, cover

**Narration (418 chars, 9 scenes, ~31 s preview estimate):**
> Cooking pots are older than farming. In a Chinese cave, scientists dated broken pottery to about 20,000 years ago.
> That's the Ice Age! No farms, no villages, just hunters in the cold. So why would you haul heavy clay pots around?
> Here's the clue: scorch marks from the fire. They were probably cooking. Farming showed up about 10,000 years later.
> Dinner came first. Subscribe for the strange origin of everyday things.

**Fact check (≥ 2 sources each):**
- Xianrendong Cave, Jiangxi, southern China (south of the Yangtze): Science News (Bower, 28 June 2012), American Ceramic
  Society, Harvard Magazine (2012).
- Pottery dated to about 19,000–20,000 years ago (Wu et al., *Science* 336:1696, 29 June 2012, doi 10.1126/science.1218643;
  45 bone/charcoal radiocarbon samples, three labs): Science News, ACerS, Harvard Magazine. Narration says "about 20,000".
- Peak of the last Ice Age (Last Glacial Maximum): Science News, ACerS, Harvard Magazine.
- Made by hunter-gatherers, not farmers: Science News, ACerS, Harvard Magazine. "No farms, no villages": ACerS quotes the paper,
  pottery used "for some 10,000 years before they became sedentary or began cultivating plants".
- Scorch / burn / soot marks: ACerS quotes the paper ("scorch and soot marks on sherd exterior surfaces indicate that Xianrendong
  pottery likely was used for cooking"); Science News ("burn marks from being placed over fires"); Harvard Magazine ("evidence of
  burning on some of the shards"). Stated as "probably cooking"; no food is named (clams/snails, marrow, alcohol are only suggestions).
- Farming ~10,000 years later: Science News ("predate the arrival of farming in the region by at least 10,000 years"), ACerS,
  Harvard Magazine (agriculture began ~11,000 years ago). Narration: "about 10,000 years later".
- News hook: Archaeology Magazine 12 Nov 2026 (46 fired clay fragments, Cemka Hoyuk, ~9350 B.C., *Antiquity*); confirmed on
  Sci.News (June 2026). Mentioned in the description only (no room in a 400–425 char budget); not on screen.
- Not used: the "heavy pots" are a rhetorical question, not a claim about the weight; the Dolní Věstonice figurines (bridge idea in the brief) were cut for budget.
- On-screen sources: scene 1 and scene 5 "Science, 2012".

**Shot list** (palette `ag-slate`; sets snow(cave mouth) → interior(dig) → snow → snow → snow(cave) → none (close-up) → snow(cave) → field → snow(cave)).
New shot file `scenes/studio/shots/po_pottery.js` (po_cave, po_dig, po_ice, po_shard, po_field; uses BBL.labels, LH.kasif, LH.person read-only).

| # | Text | Type | Visual | Cue | Camera | Kaşif |
|---|---|---|---|---|---|---|
| 0 | Cooking pots are older than farming. | po_cave hook | rock arch framing falling snow, stone-ringed fire, big cord-marked pot with soot + steam; firewood, spare pot, sherds | hit=older | push 1.04 | points at the pot, then jumps back in shock |
| 1 | In a Chinese cave, scientists dated broken pottery to about 20,000 years ago. | po_dig | trench face with soil layers, string grid, lamp; archaeologist brushes a sherd; it rings red; stamp "20,000 YEARS"; bucket, sieve, bags, trowel | find=20,000 | right | — |
| 2 | That's the Ice Age! | po_ice glacier | glacier wall, dead pines, blowing snow, drifts, rocks, grass; stamp "ICE AGE" | hit=Ice | left | — |
| 3 | No farms, no villages, just hunters in the cold. | po_ice hunters | three fur-clad hunters with spears trudge through snow, breath puffs, footprints; stamps "NO FARMS", "NO VILLAGES" | farms, villages | right | — |
| 4 | So why would you haul heavy clay pots around? | po_cave lift | hunter sways under a big pot in his arms, fire beside him; "WHY?" | why | push | — |
| 5 | Here's the clue: scorch marks from the fire. | po_shard | one big sherd on a finds-table cloth, cord marks + soot; magnifier drifts; red ring + stamp "SCORCH MARKS"; ghost flames on "fire" | scorch, fire | **close-up 1.6** | — |
| 6 | They were probably cooking. | po_cave cook | two seated hunters, one stirs the bubbling pot in the fire; stamp "PROBABLY COOKING" | cook=cooking | pull | — |
| 7 | Farming showed up about 10,000 years later. | po_field | wheat field, mud-brick village, bearded farmer with sickle, sheaves; stamp "10,000 YEARS LATER" | hit=10,000 | left | — |
| 8 | Dinner came first. Subscribe for the strange origin of everyday things. | po_cave end | pot bubbling in the fire, snow outside | sub=Subscribe | pull | points at the pot, then waves |

Kaşif 2/9 scenes (22 %) + cover. Types: 5 (po_cave 4/9 = 44 %). Preview motion 1.6 (hook frame, under the cover block) – 23.

**Cover candidates** (rendered with `build.py --cover --no-tts`, compared side by side):
- **A — chosen:** scene 0 t 2.2, "OLDER THAN / FARMING" (FARMING boxed), the sooty pot in the fire as the single object, the scene's
  Kaşif in shock on the left (`kasif: false`, he is already big in the frame). Same idea as the first sentence; readable small.
- B — scene 5 close-up, "20,000 / YEARS OLD", cover Kaşif in shock beside the sherd: the sherd reads as a dark blob when small, the "SCORCH MARKS" stamp adds clutter, and the number gets no highlight box.
- C — scene 6, "ICE AGE / COOKING", Kaşif pointing between the two hunters: crowded (3 figures and a stamp half-faded), and Kaşif covers the pot.

## Eleştiri günlüğü

### ag-02-first-pottery — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 6 | 8 | 6 | 8 | 7 | 9 | 7 | 7 |
Lint OK, 418 characters, ~31 s. Motion: 1.6 on the hook frame (under the cover block, as expected), 9–23 in all other scenes. Kaşif appears in 2 of 9 scenes (22 %). Facts check out: Wu et al., Science 2012, ~20–19 ka; scorch/soot marks → "likely cooking"; Science News says "at least 10,000 years" before farming, and millet/rice cultivation in China starts ~10–9 ka, so "about 10,000 years later" is fair.
1. Sahne 5 (po_shard, the only close-up and the key clue): the sherd and the "SCORCH MARKS" stamp are packed into the top third. The stamp covers the sherd's cord marks and soot edge. Everything under the subtitle (y ≈ 1100–1920) is empty grid paper, which is exactly the "empty paper under the subtitle" the rule forbids, and the find tag is cut off at the right edge. Fix: make the sherd bigger and center it around y ≈ 750, move the stamp above it (y ≈ 0.12–0.15) so the stamp doesn't touch the soot, and fill y 1350–1800 with the finds-table foreground inside the frame (brush, tweezers, a scale ruler, a whole tag).
2. Görsel = anlatım, sahne 7 (po_field): the story is about China, but the frame shows a Near East wheat field with mud-brick houses and a bearded farmer in a tunic. The first farming in China was millet in the north and rice along the Yangtze. Fix: draw a rice paddy (flooded terraces, seedlings, a farmer bent over planting) or a millet field with thatched huts. Sahne 2 (po_ice): the glacier reads as a blue fence strip, and the middle of the frame (y ≈ 500–1100) is empty white snowfield with only the stamp. Fix: make a taller, cracked glacier wall that is clearly ice, and put a large foreground element (a mammoth or deer skeleton, a snow-covered boulder) in the middle third.
3. Kapak + tempo: the cover has the same ~200 px empty fog band between the title and the scene (y ≈ 500–700) as ag-01 round 1, and the cave arch fades into it, so the frame looks unfinished. Push the scene up (focus on the pot, zoom ~1.2) so the arch starts right under "FARMING". The pot should be the clear hero, with steam and visible bubbling to show it is a cooking pot. Separately, sahneler 0, 4, 6 and 8 all reuse the same po_cave framing (same arch, woodpile and boulder), so 44 % of the video is the same shot. Give sahne 4 a different plan (e.g. a close-up from low and in front of the hunter straining under the pot, camera zoom ≥ 1.6), or set sahne 6 from inside the cave looking at the fire. The "Dinner came first." payoff is also thin: try "Dinner came before the farm." or "So dinner came before farming." (stay ≤ 480 characters).

**Round 1 fixes (writer):**
- Palette `ag-slate` → `ag-sage`, because ag-01 already uses slate today.
- Narration is now 420 characters. The payoff reads "So dinner came before farming.", which calls back to the hook. To stay in budget, "broken pottery" became "broken pots" and the "around" in "...heavy clay pots?" was cut.
- Scene 5 (po_shard) is now laid out in screen pixels for the 1.6× close-up. The bigger sherd sits at screen y ≈ 430–1120 (centre ≈ 760). The "SCORCH MARKS" stamp is above it and does not touch the soot, and the red ring circles only the lower, sooty half. Ghost flames lick up both sides. Below the subtitle (screen y 1350–1800) there is now a brush, tweezers, a black-and-white scale ruler and a whole find tag on a string, all inside the frame.
- Scene 7 (po_field) now shows early rice farming along the Yangtze: flooded terraces with seedlings, thatched huts on stilts in front of wooded hills, and a hatless farmer with a topknot planting seedlings from a bundle. Big ripe rice stalks stand in the foreground water. There is no wheat, mud brick or beard any more.
- Scene 2 (po_ice): the glacier is taller (y 220–780). It has a snow cap, shaded faces, deep blue crevasses and strata. A big snow-capped boulder with icicles and a frozen dead tree fills the middle third, and the "ICE AGE" stamp sits over the ice.
- Repetition: scene 4 is now a 1.7× close-up from low and in front of the hunter straining under the pot, with "WHY?" by his head. Scene 6 is set deeper in the cave with the opening off to the right, shot at a 1.25× medium distance with the camera moving up. Scene 8 stays the wide closing shot.
- Cover: focus [470, 900] with zoom 1.15, so the pot is the hero, bubbling with stronger steam strokes, and Kaşif is whole and in shock on the left. The cave now starts right under the shaded zone. The pale band at y ≈ 500–700 is the engine's shared `#covershade`; a shot cannot remove it (same as ag-01).
- Lint OK (SEO 100), no STATIC?. Motion: 1.7 on the hook frame (under the cover block), 10–25 in all other scenes.

### ag-02-first-pottery — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 7 | 9 | 8 | 7 |
Fixed since round 1. Sahne 5 now has a big sherd, a stamp clear of the soot, and the ruler, brush and tag inside the frame under the subtitle. Sahne 7 is now Yangtze rice terraces with stilt huts, which fits the China story. Sahne 2 has a real glacier and a middle boulder. Sahne 4 is now a strong 1.7× close-up. The payoff "So dinner came before farming." calls back to the hook. Lint OK at 420 characters; motion is 1.7 on the hook frame and 10–24 elsewhere. The pale #covershade band is not counted, as instructed.
1. Kapak: Kaşif's fez and the top of his head sit in the covershade fade (y ≈ 720–860), so the brand fez reads washed-out salmon instead of red. The cave arch and the steam strokes above the pot are lost in the same fade. Fix: move the scene down so the fez top is at y ≥ 880, e.g. cover focus [470, 800] or zoom 1.1. Another option is a cover kasif object {"pose": "shock", "emotion": "surprised", "y": lower}. Make the steam 2–3 thick strokes rising from the pot rim at y ≈ 900–1000.
2. Kadraj taşması: in sahne 6 (po_cave cook, 1.25×) the left hunter is cut by the frame edge, with half his face outside x = 0 on both sampled frames. Fix: move the hunters to x ≈ 0.27 and 0.75, or set focus x ≈ 540, so both seated figures are whole. In sahne 2 (po_ice glacier) the dead tree's trunk runs through the "ICE AGE" stamp. Fix: move the tree to x ≈ 0.25 or put the stamp at y ≈ 0.12.
3. Tempo + görsel=anlatım: sahne 1 (po_dig) runs 5.3 s on a static archaeologist who stands with empty hands. The ringed sherd is far left of him, so "brushes the oldest one" is not shown. Fix: have him kneel with a brush right over the sherd, and push the camera toward the sherd (zoom ≥ 1.4) when "20,000" lands. Sahne 8 runs 7.3 s as one unchanged wide shot. Fix: push the camera toward Kaşif and the pot on "Subscribe" (e.g. camera focus [480, 900], zoom 1.3, move push) so the last 3 s don't sit still.

**Round 2 fixes (writer):**
- Cover: focus [470, 800] with zoom 1.1 moves the scene down. Kaşif's fez is now fully red at y ≈ 850 (it was pink in the fade before), and the arch and stalactites show. The steam is three thick strokes (`pot.steam: 2.2`, with an ink-soft edge) rising from the rim, which bubbles. Compared with the round 1 cover, this one is better: Kaşif's face and fez read clearly and the pot is the hero.
- Scene 1: the archaeologist kneels (`person.kneel`) and brushes the circled sherd at arm's length. The camera is a 1.4× close-up push (focus [400, 960]), and the "20,000 YEARS" stamp is inside the frame.
- Scene 2: the frozen tree moved to the left of the boulder (`boulder.tree: -0.9`) and the "ICE AGE" stamp to x 0.6, so the trunk no longer crosses it.
- Scene 6: the pot and fire are centred (x 0.5) with the hunters at x 0.24 / 0.78 and focus x 540, so both hunters are inside the frame.
- Scene 8: the camera pushes in on Kaşif and the pot (focus [470, 820], zoom 1.35) instead of the static wide shot.
- Lint OK (SEO 100), 420 characters, no STATIC?. Motion: 2.1 on the hook frame, 12–24 elsewhere.

### ag-02-first-pottery — tur 3 (final)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 9 | 8 | 8 |
Passes: every criterion is ≥ 7 and the cover is 8. Reviewed from the existing preview (09:27) without re-running it, as instructed. The round 2 problems are fixed: the fez is fully red and clear of the fade, the arch shows, sahne 1 has a kneeling archaeologist with a 1.4× push, the ICE AGE stamp is clear of the tree, both hunters in sahne 6 are inside the frame, and sahne 8 now pushes in. Remaining notes are minor and don't block:
1. Kapak: the spare pot at the right edge (x ≈ 1020, y ≈ 1550) is cut by the frame, and only one steam stroke reads above the rim. Optional: move the spare pot left or drop it.
2. Sahne 6: as the camera moves up, the left hunter's back touches the left frame edge. Optional: hunter x 0.27.
3. Sahne 7: the farmer stands holding seedlings instead of bending to plant, which is fine at Shorts speed. Optional: a bent planting pose.
