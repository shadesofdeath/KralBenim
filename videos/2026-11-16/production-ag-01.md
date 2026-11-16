# ag-01-khufu-ship — Stickstory Short (how it was built)

- **File:** `videos/2026-11-16/ag-01-khufu-ship.json` · format short · publish_at `2026-11-16T13:00:00-05:00` (Istanbul 16.11 21:00)
- **Category:** how it was built (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → web search. Chosen headline: Daily News Egypt
  (Egypt), 3 Oct 2026, "Egypt-Japan team completes restoration, installation of 16 pieces from Khufu's Second Boat"
  (also Ahram Online "16 wooden pieces of Khufu's second boat restored at Grand Egyptian Museum"; public live
  reassembly at the GEM since Dec 2025). Not one of the 7 front pages (they were unreachable) — reported.
- **Topic:** Khufu's FIRST ship (the one already rebuilt): a ~4,500-year-old cedar ship found in 1954 by Kamal el-Mallakh
  in a sealed pit beside the Great Pyramid, in ~1,224 pieces (verify exact number), built **without nails** — planks
  sewn/lashed together with rope, swelling tight in water. Restorer Hag Ahmed Youssef Moustafa spent ~13–14 years
  (and several attempts) putting it back together, studying modern Nile boatbuilders; ~43.6 m long. Moved to the Grand
  Egyptian Museum in 2021. Today the second boat is being rebuilt in public. VERIFY every number on ≥ 2 sources.
  Don't claim as fact what it was used for (funeral barge vs. "solar boat" — debated).
- **Viewer should feel:** "A 4,500-year-old ship with no nails, held together by rope — and one man rebuilt it like a puzzle with no picture."
- **Hook (3–8 words, same idea as cover):** e.g. "This ship has no nails at all." ↔ cover "NO NAILS / AT ALL" (≥ 3 cover candidates).
- **Structure:** hook → 2nd sentence: buried beside the Great Pyramid 4,500 years ago, found 1954 → tension (1,224 loose
  pieces, no plans) → asked how it was built: rope through hidden holes, wood swells in water → Moustafa's years →
  punchline standalone → one short subscribe line with reason.
- **Related long video:** none.
- **Budget:** `elevenlabs_chars.warning: true` (252,888 used / budget 231,442) → narration **400–425 chars** (hard max 550).
- **Look:** sets `desert` (Giza, pyramid, pit with limestone blocks), `interior` (restoration shed / museum hall), `sea`
  hint for Nile (river). New types in own file `scenes/studio/shots/kh_*.js`. Kaşif host 15–25 %. Close-up ≥ 1 (zoom ≥ 1.6)
  (rope lashing through planks). On-screen `source` ≥ 1. Pattern must differ from recent shorts (meat shower, dodecahedron, Apollo 12, Myeongnyang).

## Writer — narration, fact check, shot list, cover

**Narration (410 chars, 9 scenes, ~31 s preview estimate):**
> This ship has no nails at all. In 1954, it was found sealed in a pit beside the Great Pyramid, in 1,224 loose
> pieces. No plans. So how do you build it? You sew it! Ropes ran through hidden holes inside the cedar planks. Ahmed
> Youssef Moustafa spent over ten years on that puzzle. Its twin is being rebuilt right now. Khufu's ship was never
> nailed. It was sewn. Subscribe for one true story like this every day.

**Fact check (≥ 2 sources each):**
- Found in 1954 in a sealed pit beside (south side of) the Great Pyramid, by Kamal el-Mallakh: Wikipedia, PBS NOVA,
  Ahram Online, Madain Project. AramcoWorld gives 26 May 1954 and 41 limestone blocks over the pit. Date and block
  count are not spoken.
- 1,224 pieces: Wikipedia, PBS NOVA, Ahram Online, AramcoWorld, Ancient Pages.
- No nails; the planks are lashed with halfa-grass rope through V-shaped channels on the inside faces, plus unpegged
  tenons: PBS NOVA ("features no nails"; channels, not around the hull), Ancient Pages, Madain Project (lashings
  through drilled holes, no metal fasteners). Wikipedia: halfa lashings, Lebanon cedar.
- Ahmed Youssef Moustafa (Hag Ahmed Youssef) rebuilt it: Wikipedia, PBS NOVA. Ahram Online says "almost 14 years";
  Ancient Pages says 13 years → spoken as "over ten years".
- Twin (second boat) being rebuilt now: Daily News Egypt (3 Oct 2026, 16 floor pieces installed, Egypt-Japan team,
  visitors watch), Ahram Online (first boat "awaiting its twin" at the GEM), Dawn / The National (Dec 2025 start of
  the public reassembly).
- "4,500-year-old" (description and visual only): Wikipedia, c. 2500 BC.
- Not used: purpose (solar barge or funeral barge, debated), "wood swells to make it watertight" (only AramcoWorld
  says this), the four assemblies (only AramcoWorld), and length (sources give 42–43.6 m).
- On-screen sources: scene 2 "Ahram Online" (1,224 pieces), scene 4 "PBS NOVA" (hidden channels), scene 6 "Daily
  News Egypt, 2026" (twin).

**Shot list** (palette `ag-slate`; sets desert → desert → desert (cut-away, ground 557) → interior → interior →
interior → interior → interior → desert). New shot file: `scenes/studio/shots/kh_ship.js` (kh_ship, kh_pit, kh_pieces,
kh_lash, kh_twin; uses BBL.labels and LH.kasif read-only).

| # | Text | Type | Visual | Cue | Camera | Kaşif |
|---|---|---|---|---|---|---|
| 0 | This ship has no nails at all. | kh_ship desert | full ship (papyrus prow, curled stern post, deckhouse, oars) on props, Great Pyramid behind; rope stitches glow gold and shimmer; wind-blown sand | hit=nails | push 1.03 | (cover Kaşif in shock during the hook) |
| 1 | In 1954, it was found sealed in a pit beside the Great Pyramid, | kh_pit | row of limestone blocks at the pyramid's foot; middle block rises from a derrick, two workers in turbans haul; dark pit with cedar ends; stamp 1954 | lift=found, y=1954 | right | — |
| 2 | in 1,224 loose pieces. No plans. | kh_pieces | cross-section of the pit, timbers appear layer by layer, counter 0 → 1,224 "PIECES"; stamp NO PLANS | done=pieces, plans | down | — |
| 3 | So how do you build it? You sew it! | kh_lash | inside face of three cedar planks with holes; rope zig-zags across the seams; stamp SEW IT! | sew | push | — |
| 4 | Ropes ran through hidden holes inside the cedar planks. | kh_lash | seam close-up: holes ring gold, X-ray of the V-channel inside the wood; stamp HIDDEN | holes, hidden | **close-up 1.7** | — |
| 5 | Ahmed Youssef Moustafa spent over ten years on that puzzle. | kh_ship shed | half-rebuilt hull (ribs and ghost outline), restorer carries a plank, numbered planks on the floor, tally of years; stamp 10+ YEARS | s=spent, ten | left | — |
| 6 | Its twin is being rebuilt right now. | kh_twin | museum hall, steel cradle, floor planks, a plank lowered between two conservators, visitors behind a glass rail; stamp RIGHT NOW | now=rebuilt | push | — |
| 7 | Khufu's ship was never nailed. It was sewn. | kh_ship hall | finished ship under spotlights; a nail gets a red X; stitches glow gold; stamp SEWN | never, nailed, sewn | pull | at the rail: shock at the nail, then points at the stitches |
| 8 | Subscribe for one true story like this every day. | kh_ship desert | back on the Giza sand, ship and pyramid | p=true | pull | waves, then points at the viewer |

Kaşif appears in 2 of 9 scenes (22%), plus the big shocked Kaşif on the cover and in the hook. Motion is 2.1 in scene 0
(the hook frame is mostly the static cover block) and 12–24 in the other scenes.

**Cover candidates** (rendered and compared side by side):
- A — scene 0, "NO NAILS / AT ALL" (NAILS boxed), focus on the whole ship (zoom 0.95), with the gold stitches and big shocked Kaşif bottom right. **Chosen.**
  It is the same idea as the first sentence, shows one clear object (the whole ship with both posts), and reads well
  at small size.
- B — scene 4 close-up of the stitched seam, "SEWN, / NOT NAILED": clear, but the planks and holes don't read as a "ship" at small size.
- C — scene 7 in the museum hall, "NO NAILS. / JUST ROPE": the scene's own Kaşif doubled up with the cover Kaşif, and the hall is cluttered.
- (A at zoom 1.15 cropped off the prow and stern, so the final cover uses zoom 0.95.)

## Eleştiri günlüğü

### ag-01-khufu-ship — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 7 | 6 | 8 | 8 | 9 | 7 | 7 |
Lint OK. Facts check out: 1954, 1,224 pieces, rope lashings through V-channels with no nails, Moustafa ~13–14 years, and the second boat's live reassembly at the GEM (Daily News Egypt 3 Oct 2026, Ahram Online, Dawn/The National Dec 2025).
1. Sahne 2 (kh_pieces, "1,224 loose pieces. No plans."): about half of the frame below the pit (y ≈ 1000–1920) is flat gray-blue with dots. The area under the subtitle is empty, and with ground 557 the cut-away doesn't read as "a pit beside the pyramid". Fix: lower the cross-section so it spans y ≈ 450–1450 with the pyramid base and sand above it. Put a sand foreground under the subtitle, e.g. the trench edge, a rope coil and a few pieces already laid out and numbered. Same rule elsewhere: in sahne 6 (kh_twin) the second conservator is cut off by the right frame edge, and the steel ribs read as thin sticks or grass. Pull both conservators inside x 150–930 and draw the cradle as thick U-ribs under a visible floor of planks. In sahne 7, Kaşif is tangled with the stern post and an oar. Move him to clear rail space (x ≈ 0.85, in front of the hull, not overlapping it).
2. Kapak: Kaşif overlaps the stern and the oars, and his fez merges with the stern post, so there is no single clean focus. His legs run down to y ≈ 1700, into the YouTube UI zone. A ~180 px empty fog band sits between "AT ALL" and the ship, and the gold stitches are tiny chevrons that don't say "no nails" at phone size. Fix: put Kaşif on clear sand in front of the ship, not overlapping the hull (head at y ≈ 1150–1250, feet ≤ 1500, face fully clear), and raise the ship to sit right under the title so the band disappears. Make the rope stitches thicker and brighter so the hull clearly reads as "stitched". Render 3 new candidates again, and keep the prow and stern inside the frame.
3. Senaryo/Kapanış: "4,500 years" is never spoken, though it is the biggest wow after "no nails" and only appears in the description. "Ahmed Youssef Moustafa" arrives cold with no role, so the listener doesn't know who he is. The punchline "never nailed. It was sewn." only repeats the hook and adds no payoff. Fix (stay ≤ 425 chars): "In 1954, it was found sealed for 4,500 years beside the Great Pyramid," → "One restorer, Ahmed Youssef Moustafa, spent over ten years on that puzzle." Give the ending a new idea, e.g. "The oldest intact ship on Earth was never nailed. It was sewn." (only if verified; otherwise "4,500 years on, it still holds."). Apart from "how do you build it", the narration never talks to the viewer ("you", BRAND §11).

### ag-01-khufu-ship — Round 1 fixes (writer)
- **Script (425 chars):** "This ship has no nails at all. In 1954, it was found beside the Great Pyramid, sealed for 4,500 years, in 1,224
  loose pieces. So how do you build it? You sew it! Rope ran through hidden holes inside the planks. One restorer,
  Ahmed Youssef Moustafa, spent over ten years on that puzzle. Its twin is being rebuilt today. Next time you tie your
  shoes, think of a pharaoh's ship. Subscribe for one true story like this every day."
  - "4,500 years" is now spoken.
  - Moustafa is introduced with his role ("One restorer").
  - The ending gives a new payoff, the shoelace comparison, instead of repeating the hook, and talks to the viewer
    ("you" ×3).
  - To stay within the budget, "No plans." and "cedar" were cut.
- **Sahne 1:** stamps "1954" + "4,500 YEARS" (on '4,500').
- **Sahne 2:** the cross-section now spans y ≈ 530–1340, with the Great Pyramid's base and sand above it.
  - The sand foreground holds numbered pieces laid out and a rope coil (`kh_pieces` P.bottom / P.front).
  - The counter sits top right, clear of the kicker.
  - "NO PLANS" is gone, since it is no longer spoken.
- **Sahne 6:** five thick U-shaped steel ribs, three floor planks in place, both conservators inside x 170–910, stamp "TODAY".
- **Sahne 7:** new visual for the punchline.
  - On "shoes", an inset with a laced shoe appears.
  - On "think", the laces and the hull's rope stitches glow gold together.
  - On "ship", the stamp "SAME TRICK" appears.
  - The ship is smaller (L 760, x 0.42), so Kaşif stands in clear rail space on the right (no nail any more).
- **Sahne 0 / cover:**
  - The ship is shown smaller (L 760), resting on the sand, without props or oars, with thick shimmering gold stitches
    (stitch ×2.2).
  - Cover candidates R1A "NO NAILS / AT ALL", R1C (close-up of the stitched seam), and R1D "SEWN, / NOT NAILED" were
    rendered and compared, plus intermediate tries with the ship higher, which washed out in the engine's
    `#covershade` fog, and with zoom < 1, which showed the paper edge.
  - **Chosen: R1A.** The whole ship (both posts in frame) sits right under the fog line with gold stitches. Kaşif is
    on open sand under the prow (feet y 1490, face clear, not overlapping the hull).
  - The pale band under the title is the shared engine `#covershade` (solid to 36% of the height); the pyramid now
    fills it.
- Lint OK; preview motion 2.2 / 15–34 (scene 0 is mostly the static cover block during the hook).

### ag-01-khufu-ship — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 7 | 7 | 8 | 8 | 9 | 8 | 7 |
Fixed since round 1:
- Sahne 2: the pit is now tied to the pyramid, with numbered pieces in the foreground, and the bottom band is full.
- Sahne 6: both conservators are inside the frame and the ribs are thick.
- Narration: "4,500 years" is now spoken, the restorer is introduced with his role, and the narration says "you".

The punchline is fair: it's a comparison, not a claim. It's a whole sentence that stands on its own, and the subscribe line comes right after it. One note: the inner V-channels are not shoe eyelets, so the shoe is an image, not an identical method. That means "SAME TRICK" overclaims a little; "SAME IDEA" would be safer. The pale band under the cover title is the engine's #covershade and is not counted.

1. Kapak (and the hook frame, sahne 0):
   - Without props and oars, the deep crescent hull with dense stitching reads more like a hammock or a woven basket than a ship. It sits in a pale sand haze.
   - Kaşif is small (scale 0.78), and his fez and head touch the prow post, so he is still not separate from the ship.
   - The bottom ~35% (y ≈ 1300–1880) is empty sand.
   - Fix: bring back the props and 3–4 oars, flatten the hull curve a little, and keep the stitches thick and gold. Make Kaşif bigger (scale ≈ 1.05–1.15) on the open sand in front, head at y ≈ 1250–1350, at least 40 px clear of the prow post, so the lower third holds him.
2. Sahne 7 (punchline):
   - The "SAME TRICK" stamp lands right on the deckhouse and on the gold stitches it is meant to point at.
   - The gray shoe in the inset reads as a block or iron. Only the laces identify it.
   - Kaşif stands passively at the right edge.
   - Fix: move the stamp between the inset and the hull (y ≈ 0.40) or into the inset. Draw a clear sneaker (toe cap, white sole, eyelets, bow). On "think", have Kaşif point from the shoe to the hull, as in the round 1 plan. Consider "SAME IDEA".
3. Sahne 3 (kh_lash "You sew it!") + sahne 0 motion:
   - Three rows of evenly spaced black dots read as a pegboard.
   - On "sew", only 2 short rope segments appear, so the scene's payoff ("You sew it!") is weak.
   - Sahne 0 has motion 2.2, under the preferred 4.
   - Fix: in 3, have the rope run fast across all the seams, led by a visible end or needle, with a visible gap between the planks closing as the rope pulls them together. Put the holes in pairs on the seams instead of a grid. In 0, under the cover block, make the gold stitch shimmer travel from prow to stern and add some blowing sand.

### ag-01-khufu-ship — Round 2 fixes (writer)
- **Cover / sahne 0:**
  - The ship is back on its wooden props with four oars and a flatter hull (L 640, ex 1.5).
  - The stitches are smaller (×1.6) and no longer read as a basket.
  - A bright gold shimmer band travels from prow to stern, and 80 sand streaks blow across the foreground (motion 1.9).
  - The cover Kaşif (scale 0.95, shock) stands on open sand left of the prow, about 50 px clear of the post, feet at y 1500.
  - With feet ≤ 1500, his head centre is at about y 1140; at this scale it can't sit lower without breaking the feet limit.
  - The sand band at the bottom is smaller (focus [540, 900]).
- **Sahne 7:**
  - The stamp now reads "SAME IDEA", placed at the bottom of the shoe inset, off the deckhouse.
  - The shoe is redrawn as a clear sneaker: toe cap, pale sole with a midline, four pairs of eyelets, criss-cross laces.
  - Kaşif points up at the shoe, then down at the hull on "think".
- **Sahne 3 (and 4):**
  - Holes come in pairs hugging each seam (±38 px), not a pegboard grid.
  - The planks start with a 30 px gap.
  - On "sew" the rope end races across both seams in 0.9 s and the gaps close.
- Lint OK (SEO 100); preview: no STATIC? warnings.

### ag-01-khufu-ship — tur 3 (final)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 7 | 8 | 8 | 9 | 8 | 8 |
All criteria pass (Kapak+SEO ≥ 8). Fixed since round 2:
- Kapak: the ship reads clearly as a ship (props, oars, a flatter hull), and the shocked Kaşif stands clear of the prow on open sand.
- Sahne 7: the sneaker is readable, and "SAME IDEA" sits off the deckhouse.
- Sahne 3: the holes now come in pairs along the seams.

Remaining notes (not blocking):
1. Sahne 0 (hook) has motion 1.9. That is above the 1.5 minimum but below the preferred 4. The cover block covers most of the frame, so this is acceptable.
2. Kapak: the bottom ~20% (y ≈ 1520–1880) is still plain sand, and the gold stitches are small at phone size. A bigger ship (zoom ≈ 1.1) would help in a later version.
3. Sahne 7: Kaşif is small (scale 0.75) and pressed against the right edge. His pointing gesture barely reads at 360 px.
