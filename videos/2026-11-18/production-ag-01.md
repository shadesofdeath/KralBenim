# ag-01-cmb-pigeons — Stickstory Short (space and planet earth)

- **File:** `videos/2026-11-18/ag-01-cmb-pigeons.json` · format short · publish_at `2026-11-18T13:00:00-05:00` (Istanbul 18.11 21:00)
- **Category:** space and planet earth (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → ScienceDaily space (US), 17 Nov 2026: "A Mysterious Twist
  in the Universe's Oldest Light Could Reveal New Physics". Not one of the 7 Google News front pages (unreachable) — reported.
  (First pick, Voyager 1 one light-day, was dropped: Düşün Bakalım already told it on 2026-10-17 → topic repeat rule.)
- **Topic:** the discovery of the cosmic microwave background (the universe's oldest light). 1964–65, Bell Labs, Holmdel,
  New Jersey: Arno Penzias and Robert Wilson's giant horn antenna picked up a faint hiss from every direction, day and night.
  They suspected the pigeons nesting inside the horn and their droppings ("white dielectric material"), removed the birds,
  cleaned it — the noise stayed. Princeton's Robert Dicke team, about to search for exactly this leftover glow of the Big Bang,
  got the call ("Boys, we've been scooped"). Penzias & Wilson: Nobel Prize in Physics 1978. Temperature ~3 K (about −270 °C).
  VERIFY every fact/number on ≥ 2 sources (NASA, Nobel Prize, APS physics history, AIP, Bell Labs/Nokia). Be careful with the
  "old TV static is partly CMB" claim (only "a small part"; skip if unsure). The pigeon fate (shot by a pest controller) — avoid gore; "removed" is enough.
- **Viewer should feel:** "The proof of the Big Bang was first blamed on pigeon poop — and it's still all around us."
- **Hook idea:** first sentence 3–8 words, e.g. "They blamed the Big Bang on pigeons." ↔ cover "BLAME THE / PIGEONS" (highlight PIGEONS) or "BIG BANG / OR POOP?".
- **Budget:** `elevenlabs_chars.warning: true` (263,758 / 231,442) → narration **400–425 chars** (hard max 550), 8–11 scenes.
- **Look:** new types in own file `scenes/studio/shots/cmb_*.js` (the huge horn antenna on a hill, pigeons nesting inside the
  horn, two men with brooms in the horn, a pen-chart recorder needle hissing, the glow filling the whole sky). Sets `hills`
  (Holmdel), `interior` (control room), `night`/space. ≥ 1 close-up. Kaşif host 15–25 %. On-screen `source` ≥ 1. Ends with
  punchline + one natural subscribe line.

## Writer

### Narration (one piece, 423 chars)
They blamed the Big Bang on pigeons. In 1964, two Bell Labs scientists heard a hiss in their giant antenna, from every
direction, day and night. Pigeons were nesting inside, so they cleaned out the droppings. The hiss stayed. Then Princeton
got a call, and Robert Dicke told his team, "Boys, we've been scooped." It was the oldest light in the universe, still all
around you. Subscribe for a true story like this every day.

### Verified facts
- 1964–65, Bell Labs, Holmdel NJ, horn antenna (20-foot horn, built 1960); radiation from all directions, about 3 K; pigeons
  nesting + droppings cleaned; Nobel 1978: APS Historic Sites + Nokia Bell Labs "Confirming the Big Bang" ("from all parts
  of the sky at all times", pigeons removed, Nobel 1978) + NPR 2014 (a pair of pigeons, cleaned, hiss stayed; signal 20 May 1964).
- "Well, boys, we've been scooped": Princeton Alumni Weekly + Massive Science (Dicke had been planning to search for it).
- Oldest light / afterglow of the Big Bang: NPR, Massive Science, Nokia Bell Labs.
- Left out: the pigeons' fate (shot, per NPR) and the "TV static" claim. The exact date of the Princeton call is also left out
  (PAW says 1964; most accounts say early 1965).

### Shot list (palette ag-newsprint; new types in scenes/studio/shots/cmb_pigeons.js)
| # | Text | Type / mode | Set | Camera | Notes |
|---|---|---|---|---|---|
| 0 | They blamed the Big Bang on pigeons. | cmb_horn hook | hills | push | Holmdel horn, two pigeons strut on the lip of the dark square mouth, gold hiss squiggles creep in; cover frame |
| 1 | In 1964, two Bell Labs scientists heard a hiss in their giant antenna, | cmb_room | interior | right | racks, pen chart recorder scribbles from "hiss", two scientists; cards 1964, HISS; source APS |
| 2 | from every direction, day and night. | cmb_horn every | field | pull | horn swings, squiggles from every edge, sun sets / moon rises on "night"; EVERY DIRECTION |
| 3 | Pigeons were nesting inside, so they cleaned out the droppings. | cmb_inside | none | **close-up** [500,980] ×1.6 | down the horn's throat: nest, two pigeons, droppings; broom sweeps on "cleaned", birds fly off; PIGEONS! |
| 4 | The hiss stayed. | cmb_room | interior | **close-up** [560,1040] ×1.7 | recorder still scribbling; STILL THERE |
| 5 | Then Princeton got a call, | cmb_dicke ring | interior | left | **Kaşif** points at the ringing rotary phone, blackboard behind |
| 6 | and Robert Dicke told his team, "Boys, we've been scooped." | cmb_dicke scooped | interior | push | Dicke turns from the phone to two colleagues; WE'VE BEEN SCOOPED; source Princeton Alumni Weekly |
| 7 | It was the oldest light in the universe, | cmb_map | night | pull | oval all-sky map fills blob by blob, waves drift down to the little horn; OLDEST LIGHT |
| 8 | still all around you. | cmb_horn glow | night | push | whole sky speckled gold, mouth glows; STILL HERE |
| 9 | Subscribe for a true story like this every day. | cmb_horn end | hills | pull | **Kaşif** waves then points, a pigeon in the mouth |

Kaşif 2/10 (20 %). Close-ups: 2. Types: 5 (cmb_horn ×4, never more than 2 in a row).

### Cover (3 candidates compared)
- A **"BLAME THE / PIGEONS"** (highlight PIGEONS), scene 0 t 1.6, shocked Kaşif bottom-left: **chosen**. It matches the first
  sentence, has one clear subject (the horn's dark mouth with two pigeons) and reads at phone size.
- B "BIG BANG / OR POOP?" (scene 3, inside the horn): strong, but the highlight box did not render on "poop?" and the image
  reads less clearly as an antenna.
- C "IT WASN'T / THE PIGEONS" (scene 0, Kaşif pointing): it gives the answer away and Kaşif covers the horn.

## Eleştiri günlüğü

### ag-01-cmb-pigeons — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 6 | 7 | 6 | 7 | 8 | 8 | 7 | 8 |
1. **Lower third empty in 4 of 10 scenes (1, 4, 5, 6):** below the desk top (y ≈ 1150 → 1920) there is only a flat grey wall of drawer fronts with dots; the Princeton scenes (5, 6) are ~45 % empty cabinet. → Raise the desk/cabinet so the action sits at y 1350–1650 and fill the band: scene 1/4 put the chart recorder ON the near desk edge at y ≈ 1450 (paper spilling down to the frame bottom in a long curling strip of red noise trace — that is the "hiss stayed" image), coffee cups, cables, a reel of tape; scene 5 the ringing phone big in the foreground at y ≈ 1500 (scale ×1.5, cord hanging to the frame bottom) with Kaşif full-body standing beside it (now his body is cut at the waist by the desk, y ≈ 1140, so the "point" pose barely reads); scene 6 papers/chalk tray/backs of chairs in the foreground. Keep the subtitle band y 1170–1320 clear.
2. **Scene 3 (inside the horn) does not show what is said:** at "cleaned" the pigeons just vanish, the broom is a faint grey stick at the left edge (x ≈ 0–90, y ≈ 330–480), and the droppings read as eyeballs (white circles with a dark dot); lower half (y 1000–1920) is bare white floor. → Draw the droppings as white splats/streaks (no pupils), clustered around the nest and down the floor to y ≈ 1700; on "cleaned" bring a full broom (handle + bristle head, ~500 px, sweeping arc across x 200–800, y 1350–1650) or a scientist's arm in a lab coat pushing it; make the pigeons visibly flap up and out toward the mouth at the top (wings open, 0.6–1 s), not pop out. The "PIGEONS!" card (y 0.17) is fine.
3. **Scene 6 key moment hidden + scene 7 horn behind the subtitle:** the "WE'VE BEEN SCOOPED" card (y 0.56 ≈ 1075 px) covers the three men's chests/mouths and the phone is cut off at the left edge (x 0.14); Dicke's face reads like a beak/hand on his nose. → Card up to y ≈ 0.30 over the blackboard (x 0.5), men moved down so faces sit at y ≈ 900–1000 with mouths open (gaping) clearly visible, phone fully in frame at x ≈ 0.22, Dicke's profile redrawn (glasses, normal nose). Scene 7: the "little horn on the hill" sits at y ≈ 1300–1540, half behind the subtitle → move it to y ≈ 1500–1750 (gy 0.85) and enlarge ×1.3; it is a `night` set but the meadow has bright daytime flowers — darken/remove flowers in night scenes 7–8.
Minor: scene 0 motion 1.8 (cover block held; OK for the hook but add a hiss squiggle/pigeon peck visibly moving behind the text). Hook line "They blamed the Big Bang on pigeons" is a playful compression (they blamed the noise) — acceptable as a hook; the narration never says "Big Bang" again, so consider "It was the afterglow of the Big Bang — the oldest light in the universe, still all around you." if budget allows (~+30 chars). Facts checked (APS, PAW, Nobel): 1964 hiss, pigeons + droppings cleaned, Dicke "Boys, we've been scooped", Nobel 1978 — correct. Cover: strong (one subject, big shocked Kaşif, PIGEONS boxed), 8. Lint OK; 423 chars.

**Fixes round 1 (writer):**
1. Scenes 1, 4, 5 and 6: action moved down and the lower third filled.
   - Scenes 1/4: desk top at y ≈ 1574 with the chart recorder on it (paper at y ≈ 1350–1530). A long curling paper strip
     with the scrolling red noise trace now runs to the frame bottom. Added a steaming mug and a spinning tape reel. The
     scientists stand behind the desk (faces at y ≈ 990). The scene 4 close-up focuses on [540, 1440].
   - Scene 5: Kaşif is now full body (scale 1.55) in front of the desk, pointing at a big ringing phone (×1.7, y ≈ 1420–1650)
     whose cord hangs to the floor.
   - Scene 6: the card is at y 0.30 on the blackboard. The men's faces are at y ≈ 920–1000 and their mouths open on "Boys".
     The phone is fully in frame at x 0.22. Dicke turns from the phone and gestures; his arm no longer crosses his face.
     Chair backs fill the foreground.
2. Scene 3:
   - Droppings are now white splats with streaks (no pupils), spread down the floor to y ≈ 1700.
   - On "cleaned" a full broom (head about 370 px wide, handle out of frame) sweeps right to left across y ≈ 1480–1600 in
     back-and-forth strokes and pushes the droppings ahead of it.
   - The pigeons flap with their wings open and fly up and out over 1.7 s.
3. Scene 7: the horn is ×1.3 at ground y 1750 (about 1450–1750). Scenes 7–8 now use dark night grass with no flowers.
4. Scene 0: the pigeons strut along the lip with twice the range, the antenna sways more and there are more hiss squiggles.
   Motion went from 1.8 to 2.7.
5. Narration (423 chars): "giant" cut. The payoff is now "It was the afterglow of the Big Bang, and it's still all around
   you." (card AFTERGLOW, cue "afterglow").

Lint: OK (SEO 100). All motion values are now 2.7–31.

### ag-01-cmb-pigeons — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 7 | 7 | 8 | 9 | 8 | 8 |
Passing. All round-1 problems are fixed: the lower third is filled in scenes 1, 4, 5 and 6 (recorder on the near desk, paper strip, phone, chair backs), and scene 3 now shows the broom, the splats and the pigeons flying out (checked at t 12.3/13.0/13.7). The scene 6 card sits on the blackboard and the faces are clear. The scene 7 horn is below the subtitle band and the night grass works. The afterglow/Big Bang payoff closes the hook loop. Lint OK, 423 chars. Minor polish:
1. Cover (scene 0, t 1.6): with the wider strut range the two pigeons now overlap into one two-headed blob in the horn mouth (cover y ≈ 1010–1140). → Pick a t where they are apart (beak to beak, as in round 1), or clamp their x so they never come within ~180 px of each other during 1.2–2.0 s.
2. Scene 5: Kaşif only switches to "point" on the last word "call" (≈ 17.7 s, then the cut at 18.0), so for most of the scene he just stands with his hand on his hip. → Move the seq cue to "Princeton" (or start in "point") so the action reads.
3. Scene 4: the "STILL THERE" card (y 0.47) crosses the right scientist's face and chest. → Card at y ≈ 0.30 over the racks, or move the scientist to x ≈ 0.85.

**Polish round 2 (writer):** cover pigeons stay at the two ends of the lip, beak to beak (≈220 px apart, no blob); scene 5 Kaşif points on "Princeton"; scene 4 STILL THERE card sits between the faces and the recorder (screen y ≈ 0.30, size 56). Lint OK, preview checked.
