# ag-01-terracotta-army — Stickstory Short (empires and battles)

- **File:** `videos/2026-11-19/ag-01-terracotta-army.json` · format short · publish_at `2026-11-19T13:00:00-05:00` (Istanbul 19.11 21:00)
- **Category:** empires and battles (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → web fallback: IFLScience (US), 22 Oct 2026, "Ancient fingerprints are revealing the unexpected makers of China's 2,200-year-old Terracotta Army" (also SCMP: "Terracotta warriors could be mainly built by women and children, fingerprints show"). Study in *Journal of Cultural Heritage*: 79 fingerprints, ~45 % adult men, just under 1/3 adult women, ~22 % children under 15 (caveat: counts prints, not people). Not one of the 7 Google News front pages (unreachable) — reported.
- **Topic:** the Terracotta Army of Qin Shi Huang, China's first emperor (unified China 221 BC, died 210 BC), near Xi'an. 1974: farmers digging a well during a drought hit pieces of a clay soldier. Thousands of life-size soldiers (commonly "about 8,000", only part excavated) + horses, chariots, real bronze weapons. They were once brightly painted; the lacquer/paint curls and flakes within minutes of hitting dry air. The emperor's own burial mound has never been opened (preservation worries are one reason; Sima Qian also wrote of rivers of mercury — soil mercury tests are elevated). New: fingerprints in the clay suggest men, women and children worked in the workshops.
  VERIFY every fact/number on ≥ 2 sources (UNESCO, Smithsonian, National Geographic, History.com, IFLScience/SCMP for the study). Do NOT claim "no two faces are alike" as fact. Keep the fingerprint claim hedged ("scientists say", "prints from children").
- **Viewer should feel:** "An emperor built an army for the afterlife — and kids' hands are still in the clay."
- **Hook idea:** first sentence 3–8 words, e.g. "Children's fingerprints are hidden in this army." ↔ cover "KIDS MADE / THIS ARMY?" (highlight KIDS) or "8,000 SOLDIERS / NO ONE ALIVE" — writer decides, ≥ 3 candidates.
- **Narrator draft (director; writer may polish, keep ≈ 400–425 chars because `elevenlabs_chars.warning: true`):**
  Children's fingerprints are hidden in this army. Twenty-two centuries ago, China's first emperor ordered thousands of clay soldiers to guard his tomb. In 1974, farmers digging a well hit one of them. Now scientists studying prints in the clay say men, women and even kids shaped it. And the warriors were once painted, but the colour flakes off within minutes of touching air. Subscribe for a true story like this every day.
- **Budget:** narration **400–425 chars** (hard max 550), 8–11 scenes.
- **Look:** new types in own file `scenes/studio/shots/tc_*.js` (a clay soldier head with a fingerprint close-up, rows of warriors in the pit, farmers with a well shaft / spade hitting a clay head, the emperor on a throne / burial mound, painted warrior whose colour peels away). Sets `field` (Xi'an farmland), `interior`/pit, `hills` (mound). ≥ 1 close-up. Kaşif host 15–25 %. On-screen `source` ≥ 1. Ends with punchline + one natural subscribe line. Sources ≥ 2.

## Writer

### Narration (one piece, 423 chars)
Kids' fingerprints are hidden in this army. 2,200 years ago, China's first emperor ordered thousands of clay soldiers,
to guard his tomb. They lay buried until 1974, when farmers digging a well hit a clay head. The soldiers were once
brightly painted, but that colour flakes off minutes after touching air. The prints survived. Scientists think one in
five came from children. Subscribe for a true story like this every day.

(The comma after "soldiers" comes from the scene split; lint asks every scene to end with punctuation.)

### Verified facts
- Fingerprint study: *Journal of Cultural Heritage* (lead author Xiaoxi Li, Emperor Qinshihuang's Mausoleum Site Museum).
  It looked at 79 prints on 36 warriors from one pit and estimates 45 % adult men, 32.7 % adult women and 22.3 % children
  under 15. The estimate covers prints, not people, so the narration hedges ("Scientists think", "one in five came from
  children"). Sources: ScienceAlert and SCMP (Smithsonian has the same story but would not load here).
- 1974: farmers digging a well hit a clay head (National Geographic: a well for their orchard; IFLScience: Yang Zhifa,
  his brothers and a neighbour, March 1974; they first thought it was a Buddha).
- About 8,000 soldiers, buried 210–209 BC, about 2,200 years ago, guarding Qin Shi Huang's tomb, which has never been
  opened. Sources: IFLScience and ScienceAlert.
- Paint: "the lacquer underneath the paint begins to curl after 15 seconds and flake off in just four minutes"
  (National Geographic). IFLScience also gives about 15 seconds for the curling. On screen: "4 MINUTES".
- Left out: the mercury rivers and "no two faces alike" (as the brief asked).

### Shot list (palette ag-dusk; new types in scenes/studio/shots/tc_terracotta.js)
| # | Text | Type / mode | Set | Camera | Notes |
|---|---|---|---|---|---|
| 0 | Kids' fingerprints are hidden in this army. | tc_head hook | interior | push | big clay warrior head; a print draws itself on his cheek and glows; rows of warriors behind; cover frame |
| 1 | 2,200 years ago, China's first emperor ordered thousands of clay soldiers, | tc_emperor | interior | right | Qin Shi Huang on the throne with a mianguan crown, points; incense; little soldiers spring up on the steps; FIRST EMPEROR |
| 2 | to guard his tomb. | tc_army mound | hills | pull | burial mound on the horizon, rows rise out of the ground; HIS TOMB |
| 3 | They lay buried until 1974, | tc_well buried | field | pull | earth in cross-section over toppled warriors; counter runs from 210 BC to a red 1974 |
| 4 | when farmers digging a well hit a clay head. | tc_well dig | field | **close-up** [600,1250] ×1.6 | farmer in the shaft, earth flying; the spade strikes a clay head; CLAY HEAD! |
| 5 | The soldiers were once brightly painted, | tc_paint reveal | interior | up | a brush paints the full warrior from the top down; ONCE PAINTED |
| 6 | but that colour flakes off minutes after touching air. | tc_paint flake | interior | pull | paint curls and falls in chips, stopwatch; 4 MINUTES; **Kaşif** shocked; source National Geographic |
| 7 | The prints survived. | tc_head lens | interior | **close-up** [700,640] ×1.6 | bare clay with paint traces, a magnifying glass over the print; STILL IN THE CLAY |
| 8 | Scientists think one in five came from children. | tc_workshop | desert | left | a man, a woman and a child shaping a warrior, kiln; the child's print glows; 5 prints (1 red); 1 IN 5; source Journal of Cultural Heritage |
| 9 | Subscribe for a true story like this every day. | tc_army pit | interior | push | Pit 1 corridors, light shafts; **Kaşif** waves, then points |

Kaşif: 2/10 scenes (20 %), plus the cover/hook Kaşif. Close-ups: 2. Types: 6, none more than 2 in a row.
Motion (preview): 1.9 to 30.

### Cover (3 candidates compared)
- A **"KIDS MADE / THIS ARMY?"** (highlight KIDS). Scene 0, t 1.6, focus on the cheek print ×1.6, shocked Kaşif at the
  bottom left. **Chosen:** it is the same idea as the first sentence, it has one subject (the warrior's face with the
  glowing print) and it reads at phone size.
- B "HIDDEN IN / THE CLAY" (scene 7, the lens over the print). It is the cleanest image, but it does not match the first
  sentence, and the scene's own STILL IN THE CLAY card repeats the cover text.
- C "PAINT GONE / IN MINUTES" (scene 6, flaking). It is busy (chips everywhere, a cut-off stopwatch), it promises a
  different story and Kaşif gets cropped.

## Eleştiri günlüğü

### ag-01-terracotta-army — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 7 | 6 | 7 | 6 | 7 | 8 | 9 | 7 | 6 |
1. **Cover + scene 0 (the hook frame) do not read at phone size (cover 6 → must be redone):** the gold glow disc and the rings (cover x ≈ 260–800, y ≈ 850–1450) cover the warrior's eyes, nose and moustache, so the face becomes a brown blob with gold circles. The top of the head and the topknot (y ≈ 690–900) are washed out by the paper fade. Under the text, y ≈ 520–780 is empty paper. Kaşif (scale 1.2, head ≈ 170 px, x ≈ 50–230, y ≈ 1230–1470) is small and pressed against the armour, and his face reads like a skull. → Keep the warrior's features sharp and visible: eyes, moustache and mouth in dark ink. Make the fingerprint ≈ 220 px, on the cheek only (≈ [820, 1150]), with dark ridges and a thin gold glow ring. Drop the orange disc. Move focus to ≈ [700, 820] so the whole head sits at y ≈ 650–1350 with no fade on the topknot. Kaşif scale ≈ 1.7 at x ≈ 240, y ≈ 1880, shocked/surprised, pointing up at the print (`dir`), head ≈ 260 px and clear of the armour lines. Same fix in scene 0 (`mode: hook`).
2. **Scene 8 (the payoff, 23.1–26.6 s) does not show "one in five came from children":** the child (green robe, x ≈ 840–900, y ≈ 1060–1250 at t 26.5) is tiny, half behind the warrior and in the subtitle band (y 1170–1320), so the thumb press and the red print on the robe cannot be seen. Only 4 prints are visible in the row of five (y ≈ 550): the middle one (x ≈ 540) is hidden behind the warrior's topknot. The adults' arms cross the warrior. → Make the child the subject: scale ×1.6, standing in front of the warrior at x ≈ 0.62 with the head at y ≈ 1380–1480, below the subtitle band, pressing a thumb into the robe hem at y ≈ 1500 with a big red print (≈ 140 px) glowing there on "children". Move the row of five prints to y ≈ 0.40 (≈ 770 px), each ≈ 110 px and spaced 170 px, clear of the head, with the last one red. Put the adults at the edges (x 0.12 / 0.88) so their arms do not cross the figure. The `desert` set reads as a sunny beach. Use `field` or `city` (a workshop yard) or `interior` with a kiln.
3. **Kaşif is a bystander and gets cropped (scenes 6 and 9), and the scene 9 "pit" reads as a hall:** in scene 6, Kaşif (scale 0.85, x 0.15) is cut by the left edge (x ≈ 0–150, y ≈ 1380–1920). Only his head and legs show next to the plinth, and his jump at "flakes" is barely visible. In scene 9, his stick body merges into the warrior torsos (x ≈ 170–330, y ≈ 1250–1900). The pit has a window and plank floor, and the top third (y 0–620) is an empty wall. → Scene 6: Kaşif x ≈ 0.22, scale 1.2, fully in frame, shock pose facing the statue with an arm up as the chips fly. Scene 9: stand Kaşif on the earthen ridge or walkway in front of the rows (a solid ground band y ≈ 1450–1920 drawn over the front rank), scale 1.3, x ≈ 0.3, so his body has clean ground behind it. Replace the window with the pit's arched hangar roof trusses (lines converging toward the same vanishing point) and earth walls between the corridors.
Minor: **palette → `ag-newsprint`** (director: today's long video and ag-03 use `ag-dusk`). Scene 4: the zoom pushes the "CLAY HEAD!" card to y ≈ 60–130, onto the STICKSTORY brand row. Set the label to y ≈ 0.60 so it lands at ≈ 400–500 after the push. Scenes 1–2: "…clay soldiers, to guard his tomb." will get a TTS pause before "to guard". Use "ordered thousands of clay soldiers. Their job: guard his tomb." (+10 chars) or merge the scenes. Scene 2: "HIS TOMB" card is small at 360 px (size 80 → 110), and the mound reads as a green hedge or mesa. Draw it as an earth-coloured stepped pyramid with trees on top. Grey smudge blobs show at scene 2 (top centre), scene 3 (top right) and scenes 5, 6 and 9 (left wall, y ≈ 700–900). Remove them or make them read as something. Scene 3: the rolling year digits overlap ("AD 84": the 8 and 4 collide). Facts checked: the fingerprint study (Smithsonian, ScienceAlert, IFLScience; ~22 % of prints from under-15s) and NatGeo's "curl in 15 s, flake off in 4 min". Both correct. Lint OK (SEO 100), 424 chars. Title is good.

**Fixes round 1 (writer):**
1. Cover and scene 0 hook:
   - The orange glow disc and the ripple rings are gone. The print is smaller (radius 27 units, about 200 px on the cover) and sits on the cheek, under the face lines, with dark ridges, a thin gold ring and gold glints.
   - The warrior's eyes are now open (almond outline + pupil), and the brows, nose and moustache are drawn heavier in ink.
   - Cover focus moved to [640, 700] ×1.45, so the head sits at about y 690–1360 on the cover. Only the topknot still touches the engine's paper fade.
   - Cover Kaşif: shock pose, scale 1.6, x 330, head about 260 px, fully in frame.
2. Scene 8:
   - The set is now `interior`, with the kiln in the back right.
   - The warrior is bigger and sits lower (s 1.3, x 0.4). The man (x 0.12) and the woman (x 0.9, carrying a lump of clay) stand at the edges, and their arms no longer cross the figure.
   - The child is ×1.45, head at about y 1430 (below the subtitle band), pressing a thumb into the robe hem at about y 1500. On "kids" a red print of about 160 px glows there, inside a gold ring.
   - The row of five print cards (110 px each, spaced 170 px, the last one red) now sits at y 0.32, clear of the topknot. It springs in on "one". The 1 IN 5 card is at y 0.24.
3. Kaşif and the pit:
   - Scene 6: Kaşif is at x 0.27, scale 1.2, fully in frame. He points at the statue, then jumps back in shock on "flakes". The statue moved to x 0.6.
   - Scene 9: `set: false` with a drawn Pit 1 hangar: arched roof trusses converging on the vanishing point, earth floor, no window. Kaşif (scale 1.3, x 0.3) stands on an earth walkway band (y 0.76 → bottom) drawn over the front rank.
4. Minor items:
   - Palette is now `ag-newsprint`.
   - Scene 4: CLAY HEAD! card moved to y 0.60.
   - Scenes 1–2 reworded: "…ordered thousands of clay soldiers." / "Their job: guard his tomb."
   - Scene 8 now ends "…one in five came from kids." (a callback to the hook) to stay under 430 chars. Narration is now **428 chars**.
   - Scene 2: the mound is a three-tier stepped earth pyramid with trees on top, plus drifting clouds. HIS TOMB is now size 110.
   - Scenes 5/6: a panelled museum display wall now covers the left-wall smudges and the window.
   - Scene 3: year digits have letter-spacing (no more collisions), and clouds were added.
   - Scene 6: the 4 MINUTES card moved in from the right edge (x 0.75).
5. Cover candidates (3, compared):
   - A "KIDS MADE / THIS ARMY?" (scene 0, focus on the face): **kept**. Clear face and print, same idea as the first sentence, Kaşif readable.
   - B "HIDDEN IN / THE CLAY" (scene 7, lens): a clean print, but the scene's own STILL IN THE CLAY card repeats the cover text, and it does not match the hook.
   - C "KIDS' HANDS / IN THE ARMY" (scene 8): it shows the child and the red print, but the warrior's head falls into the fade and the frame is busier, with no Kaşif.

Lint OK (SEO 100). Full preview rerun. Motion: scene 0 is 1.7, all others 10–31.

Left as is:
- Paper coffee-ring stains are drawn by the engine (parchment-theme), so I could not remove them. A faint one still shows in the scene 2 sky.
- The extra-small word in scene 1's subtitle ("emperor") is the engine's subtitle layout.

### ag-01-terracotta-army — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 7 | 7 | 8 | 9 | 8 | 8 |
Passing. The round-1 problems are fixed:
- The cover face now reads (open eyes, moustache, a clear cheek print with a thin ring) and the cover Kaşif is big.
- Scene 8 shows the five print cards and the child's red print.
- In scene 6, Kaşif is fully in frame and acts.
- Scene 9 is a real Pit 1 hangar.
- Palette is ag-newsprint.
- "Their job: guard his tomb." flows well, and "…from kids." closes the hook loop.

Lint OK (SEO 100), 428 chars. Remaining polish:
1. **Scene 9:** during "true story like…" Kaşif's face sits in the subtitle band. His head is at y ≈ 1270–1460, so the subtitle (y 1170–1320) covers his eyes in the first half of the scene. → Kaşif y ≈ 0.99, scale ≈ 1.1 (head ≈ 1340–1490, between the band and the UI zone). Or keep his scale and stand him at x ≈ 0.75 so the left-aligned subtitle box does not cover him.
2. **Cover:**
   - Kaşif's long stick body and legs run diagonally across the armour (x ≈ 120–340, y ≈ 1350–1880), so his body tangles with the armour's lines.
   - The topknot is still ghosted by the fade (y ≈ 690–840).
   - → Give Kaşif a paper-coloured halo/outline (or put his feet on a short floor strip at x 60–360), or crop him at the chest with scale ≈ 1.9 so only his head and shoulders show. Set focus ≈ [640, 760] so the topknot sits below the fade.
3. **Scene 8 + scene 4:**
   - The child (head ≈ 95 px at [700, 1420]) and the red print ring (≈ [470, 1500]) are still small at 360 px. → Child ×1.3, ring stroke ×2.
   - Scene 4: the CLAY HEAD! card (≈ x 290–530, y 540–600) sits on the farmer's chest in the shaft. → Card at x ≈ 0.72, y ≈ 0.55, beside the shaft.
Scene 0 motion is 1.7 (cover block held, OK for the hook).

**Polish round 2 (writer):**
- Scene 9: Kaşif's ground moved to y 1.1. His head is now at about y 1410–1560, below the subtitle band (feet cropped).
- Cover:
  - Focus moved to [640, 600]. Going to [640, 760] pushed the head up into the fade, so I went the other way: the head now sits at about y 830–1480 and the topknot is fully clear of the fade.
  - Kaşif is at scale 2.0, ground at y 2120 (cropped at the chest), x 380. His face is about 300 px and fully in frame, with no stick legs crossing the armour plates.
- Scene 8: the child is scaled ×1.28 (1.45 → 1.85, head still below the subtitle band), and the gold ring around the red print is 2.2× thicker.
- Scene 4: the camera focus is now [640, 1250]. The CLAY HEAD! card (size 40) moved to x 0.74, y 0.66, into the soil right of the shaft, off the farmer's chest.

Lint OK. Full preview rerun; sheet and cover checked.
