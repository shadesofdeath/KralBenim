# ag-01-<slug> — Stickstory Short (the human body)

- **File:** `videos/2026-10-30/ag-01-blood-pressure-horse.json` · format short · publish_at `2026-10-30T13:00:00-04:00` (Istanbul 30.10 20:00)
- **Category:** the human body (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 Google News editions). Web instead → ScienceDaily, 28 Oct 2026:
  "Your Blood Pressure Could Be Dangerous Even When Your Numbers Look Normal" (US). Story behind it: the very first
  blood-pressure measurement.
- **Topic:** Stephen Hales, an English country parson (Teddington), c. 1733 ("Haemastaticks", Statical Essays vol. II):
  tied down a mare, opened the crural (leg) artery, connected a brass pipe + goose windpipe + a ~9 ft vertical glass tube;
  the blood rose to about 8 ft 3 in. First measured blood pressure. Today's cuff number (mmHg) measures the same push.
  (Writer verifies: date of experiment (often given 1733 publication / experiments from 1710s), height, the animal, the
  tube length; drop any number that cannot be confirmed.)
- **Viewer should feel:** "Wait — the first blood pressure was a column of horse blood taller than a man?"
- **Hook (3–8 words, same idea as cover):** e.g. "The first blood pressure came from a horse." ↔ cover "8 FEET / OF BLOOD" (highlight BLOOD) — writer picks strongest; tarih 2. cümlede.
- **Cover idea:** tall glass tube with a red column rising high above a horse's back, shocked fez host. One subject.
- **Punchline:** every cuff squeeze today asks the same question a parson asked a horse; + "Subscribe for a true story like this every day." (or a fresh natural variant with the reason).
- **Related long video:** none (leave `youtube.related` out).
- **Budget warning:** ElevenLabs `warning: true` → narration 400–440 chars.
- **Palette:** automatic (ag-), sets should differ from yesterday (yesterday: interior/ocean/city/storm).

## Facts (verified by the writer)
- Hales' own account (quoted in Hektoen International and the Wood Library-Museum paper): "I caused a mare to be tied down
  alive on her back; she was 14 hands high, and about 14 years of age … having laid open the left crural artery about
  3 inches from her belly, I inserted into it a brass pipe … a glass tube … which was 9 feet in length … the blood rose
  in the tube 8 feet 3 inches perpendicular above the level of the left ventricle".
- Published 1733 in *Haemastaticks* (Statical Essays vol. II). The experiment itself was years earlier (Hektoen: at his
  Teddington parsonage, "probably in December 1710"), so the script says "In 1733 … explained how he measured it".
- Hales was a clergyman ("parson"), born 1677, died 1761 (end kicker).
- Not used: the goose windpipe (not in the verified sources), the mmHg equivalent (no number on the dial), the date of the
  experiment itself. Visual liberty: the mare is drawn lying down with her legs folded, not on her back (kinder and
  easier to read). The script only says "tied down".

## Narration (final; written first as one text; 435 chars, budget warning 400–440, hard max 550)
The first blood pressure was eight feet tall. In 1733, an English parson named Stephen Hales explained how he measured
it. He used a horse. He tied down an old mare, and fixed a nine-foot glass tube to an
artery in her leg. Then he
let go. The blood climbed past his head, and stopped at eight feet three inches. Here's the crazy part: the cuff on your
arm still measures that same push. Subscribe for a true story like this every day.

## Shot list
| # | Sentence | Visual | Type | Host | Cue | Camera / set |
|---|---|---|---|---|---|---|
| 0 | The first blood pressure was eight feet tall. | Barn by lantern light: tall glass tube on a pole in the middle with a foot ruler, red column pulsing at 8 ft 3 in with a gold line, the old mare lying on straw (ropes over her back), brass pipe from her hind leg to the tube; dust motes. Hook = cover frame (shocked fez host from the cover overlay). | hp_barn | cover overlay | hit "tall" | interior, push |
| 1 | In 1733, an English parson named Stephen Hales explained how he measured it. | Candlelit study: wigged parson (black gown, white bands) behind his desk writing with a quill in the open "Haemastaticks" (left page: sketch of the mare and the tube, red column rising); red box "1733"; source note | hp_book | – | hit "1733", write "parson" | interior, left |
| 2 | He used a horse. | Paddock: old sway-backed mare grazing lifts her head; fez host points, then shocked; church tower, fence | hp_field | points → shock | lift "used", hit "horse" | field, right |
| 3 | He tied down an old mare, | Barn: the mare lies down, the ropes swing over her back and pull taut; empty tube waits at the left | hp_barn | – | ropes "tied" | interior, pull |
| 4 | and fixed a nine-foot glass tube to an artery in her leg. | Close-up of the stretched hind leg + belly: thread tied round the red artery, lace-cuffed hand; the tube drops in, the brass pipe slides into the artery, red arrow + "9 FEET" | hp_leg | – | tube "glass", arrow/hit "nine", pipe "artery" | interior, push |
| 5 | Then he let go. | Same close-up: hand pulls the thread loose, blood surges up the tube | hp_leg | – | untie "let", flow "go" | interior, up |
| 6 | The blood climbed past his head, | Tube + ruler beside the parson; the column climbs past his head, he jumps in shock; mare flank and pipe below | hp_tube | – | rise "blood", head "head" | interior, up |
| 7 | and stopped at eight feet three inches. | **Close-up** on the tube top: column creeps to just under 9 and stops, gold line, red box "8 FT 3 IN"; source note | hp_tube | – | stop "stopped", mark "eight", lab "inches" | interior, focus [580, 440] zoom 1.6 |
| 8 | Here's the crazy part: the cuff on your arm still measures that same push. | Today: an arm with a blue cuff on a table, bulb squeezes, the dial needle climbs and pulses; a ghost of the 9-ft tube at right; gold arc links its column to the dial, "SAME PUSH" | hp_cuff | – | pump "cuff", link "same", hit "push" | city, pull |
| 9 | Subscribe for a true story like this every day. | Paddock at sunset, mare grazing, fez host waves; giant "8 FEET / OF BLOOD." | hp_field | waves | s1 "Subscribe", s2 "story" | hills, pull |

Host: 2/10 scenes (20%). Types: hp_barn, hp_book, hp_field, hp_leg, hp_tube, hp_cuff (6; new file
`scenes/studio/shots/hp_hales.js`). Sets: interior → interior → field → interior ×5 (the barn) → city → hills. Close-up: scene 7.

## Cover candidates (writer)
Rendered in `out/preview/blood-pressure-horse/cand/` (A/B/C.jpg, grid.jpg); all use "8 FEET / OF BLOOD" (BLOOD boxed).
- **A (chosen): scene 0, t 1.2:** the tall tube with its red column and gold 8-ft line in the middle, the lying mare
  connected by the brass pipe at the bottom right, and a big shocked fez host at the left. One subject, and the ruler numbers read when small.
- B, scene 7 (top close-up with "8 FT 3 IN"): the column top disappears into the cover fade, the label competes with the cover text, and the host covers the parson.
- C, scene 6 (parson beside the tube): the column top is in the fade too, two figures stack on top of each other, and there is no horse.

## Critique log

## Critique log — round 1
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 6 | 7 | 6 | 8 | 8 | 9 | 7 | 8 (cover 8) |

Lint OK. Preview: no STATIC; motion scene 0 = 1.5 (hook still, on the floor), others 8.0–19.0. Scenes 1 and 8 run 5.4 s each (longest). Host 2/10 (20 %), 6 types, one zoom close-up (scene 7). Facts checked live (Hektoen International): "tied down alive on her back … 14 hands … about 14 years", "glass tube … 9 feet in length", "the blood rose in the tube 8 feet 3 inches", experiment "probably in December 1710", *Haemastaticks* 1733, Hales 1677–1761. All on-screen numbers are correct. Drawing her lying on her side is a disclosed liberty, and the script only says "tied down". Cover: one subject (the tube with its gold 8-ft line), a big shocked host, readable ruler and text. Weak points are the empty band at y 520–700 and a small horse. Title "Blood Pressure: Why the First Reading Was 8 Feet Tall" is honest and curious.

1. **Scene 8 (hp_cuff): the payoff image is unreadable and half hidden.** The subtitle box (x 390–700, y 1175–1300) sits right on the cuff/bulb join; the bulb (≈ 670, 1320) is mostly behind it. The arm reads as a white pipe ending in a mitten. Below the table edge, y 1310–1920 is an empty flat grey-green slab with four ruled lines. The `city` skyline puts a clinic table outdoors. The "ghost" tube (x 945–1020) is fully opaque, not faded. The gold link arc (x 770–935, y 430–500) never reaches the dial, so "same push" is not shown. → Use `set: interior` (clinic wall). Raise the table to ≈ 0.5 so the arm, cuff and bulb sit at y 900–1100, above the subtitle band, with the bulb at ≈ (780, 1060) squeezed by a visible hand. Move the dial to y ≈ 0.27. Draw the arm as a real forearm with a hand (fingers, sleeve), and fill y 1320–1920 with the front of the table plus the patient's lap/knee. Draw the ghost at ~35 % ink and run the arc from its column top to the dial rim (≈ 690, 560).
2. **Scene 6 (hp_tube, "The blood climbed past his head"): the bottom third is a blob, and the parson smiles.** At y 1380–1920 there is a huge white arc with hair ticks (the mare's flank) over a grey band, and nothing reads as a horse. The brass pipe hooks into it behind the subtitle. Until the "head" cue Hales is smiling contentedly (frame 18.5 s), so the drama of the sentence is missing. → Either drop the flank and continue the barn floor and straw, with the pipe running off-frame right to a visible hind leg + hoof at y 1450–1800, or draw the mare's rump with tail and hind leg at that scale. Give Hales `emotion: "worried"`, looking up from the start. Check that the column top passes his head line (y ≈ 610, about 5.9 ft) exactly on "head": with from 0 → 7.0 over 2.0 s starting at "blood", it crosses at about 1.7 s, so either shorten `dur` to ~1.4 or move the shock to "past".
3. **Closing line (scene 8 → 9): the punchline is abstract, and there is no concrete payoff.** "Here's the crazy part: the cuff on your arm still measures that same push" says *what*, but gives the viewer no number to carry away. "Here's the crazy part" is also a filler phrase. → Make the link concrete, and keep it verified: a normal 120 mmHg ≈ 1.54 m of blood (120 × 13.6 / 1.06), i.e. "about five feet". E.g. "Your arm cuff measures that same push. A normal reading of 120 would lift your blood about five feet." Pay for the characters by trimming scene 1 to "In 1733, an English parson, Stephen Hales, wrote down how." to stay ≤ 440. Show it in scene 8 as a second, 5-ft red column beside the faded 8-ft ghost with "120 ≈ 5 FT". Minor: in scene 4 the glass tube (x 300–335) runs up through the STICKSTORY brand and kicker (y 90–230); start it below y 260.

## Round 1 fixes (writer)
New narration (432 chars, 11 scenes): The first blood pressure was eight feet tall. In 1733, English parson Stephen Hales
wrote down how. He used a horse. He tied down an old mare, and fixed a nine-foot glass tube to an artery in her leg.
Then he let go. The blood climbed past his head, and stopped at eight feet three inches. Your arm cuff measures that
same push. A reading of 120 would lift your blood about five feet. Subscribe for a true story like this every day.

1. **Scene 8 (cuff), rebuilt:**
   - Set is now `interior` (clinic wall); the city skyline is gone. The table is at 0.5. Arm, cuff, hand and bulb sit at y ≈ 860–1080, above the caption band.
   - The arm is a real one: sleeve, cuff on the upper arm, elbow crease, forearm, and a hand with four fingers.
   - A second person's hand (blue sleeve, from the right) squeezes the bulb in beats, and the needle climbs and pulses with the squeeze.
   - The dial is at y 0.27. A hanging tablecloth with folds, a swinging stethoscope, table legs and a tiled clinic floor fill y 1050–1920.
   - The ghost tube is drawn at 35% ink (fill-opacity on each path, no group opacity). The gold arc runs from its column top to the dial rim and ends in a dot. "SAME PUSH" moved clear of the arm.
   - The camera is locked wide (`false`) so nothing is cut at the edges.
2. **Scene 6 ("past his head"):**
   - The flank blob is gone. The straw floor continues, and the mare's rump, swishing tail and stretched hind leg come in from the right, with the hoof roped to a stake (y 1350–1900). The brass pipe runs into her thigh.
   - Hales is `worried` and points up from the start. The rise starts on "climbed" (dur 2.2), and his shock is now on "past". In the preview the column top is just at his head on "past".
3. **Punchline:**
   - "Here's the crazy part" is cut. Scene 8 is now "Your arm cuff measures that same push."
   - New scene 9 (`hp_cuff` with `twin`): "A reading of 120 would lift your blood about five feet." A full-ink 5-ft red column with a ruler climbs next to the faded 8-ft ghost. A gold line marks it on "five", and a red box reads "120: ABOUT 5 FT".
   - Maths: 120 mmHg × 13.6 / 1.06 = 1.54 m = 5.05 ft, so "about five feet".
   - I wrote "a reading of 120", not "a normal reading of 120", because the AHA classes 120 systolic as "elevated" (normal is under 120). The description gets the same line.
   - Scene 1 is trimmed to "In 1733, English parson Stephen Hales wrote down how."
- **Minor:**
  - Scene 4: the glass tube now starts at y 0.16 (≈ 307) with a rim, clear of the brand and kicker. The arrow tip and the "9 FEET" label moved down to match.
  - Scene 0: the heartbeat pulse of the column is bigger and the mare nods more. Motion is 1.6 (was 1.5); the cover frame is unchanged and clean.

Host 2/11 (18%). Types: 6, and `hp_cuff` runs twice in a row (allowed). Lint OK: 0 errors, 0 warnings. Preview: no STATIC, about 33.5 s.

## Critique log — round 2
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 7 | 8 | 8 | 9 | 8 | 8 (cover 8) |

**PASS** (all ≥ 7, cover 8). Lint OK. Preview: 11 scenes, about 33.5 s, 432 chars, no STATIC. Motion: scene 0 = 1.6 (the hook still under the cover overlay, by design), the rest 7.4–18.9. Round 1 fixes are in: scene 8/9 is now a readable clinic (interior, arm + cuff + bulb above the subtitle band, tablecloth + tiled floor fill the bottom, faded ghost + gold arc to the dial); scene 6 has the rump, leg and hoof instead of the blob, and a worried → shocked Hales on "past"; the new "120: ABOUT 5 FT" punchline is concrete and correct (120 × 13.6 / 1.06 = 1.54 m). "A reading of 120" instead of "normal" is right (AHA: 120 systolic = elevated). Cover unchanged and still clean. Remaining polish (not blocking):

1. **Scene 7 ("eight feet three inches"): the subtitle covers Hales' face.** In the 1.6× close-up his head sits at x 810–1080, y 1040–1330, and the subtitle box (x 183–905, y 1175–1300) runs over his left eye and mouth, so the shocked face does not read. → Raise him out of the band: `hales.y` 0.6 → ≈ 0.53 (or `scale` 1.1 → 0.95) so the head lands at about y 850–1150 on screen, right of the "8 FT 3 IN" box. Check frame ≈ 20 s in the preview.
2. **Scene 9 (120 → five feet): the comparison is cramped, and the dial contradicts the number.** The base of the 5-ft tube is hidden behind the arm (ruler "1" and the column foot at y ≈ 880–900 are under the arm), so the red column seems to start at about 1.5 ft. The 8-ft ghost (x 925–1005) is squeezed against the right edge and cut by the blue sleeve (x > 970, y 880–1060). The dial has no numbers, and its needle points to about 11 o'clock here but about 1 o'clock in scene 8. → Stand both tubes on the table top (base y ≈ 1060) in clear wall space x ≈ 560–1000, drawn in front of the arm. Put the ghost at x ≈ 0.78 with a full-ink outline (only the fill faded). Add 0/60/120/180/240/300 to the dial and park the needle on 120 in scene 9 (scene 8 ending at the same angle).
3. **Scene 2 ("He used a horse."): the horse looks wooden, and the church merges into her.** The legs are straight boxes with block hooves (y 1125–1160), and the church (x 450–655, y 750–1005) sits behind her body, so its walls show between her legs and the silhouettes merge. A large grey paper blob (x 470–800, y 365–700) floats in the empty sky above. → Give the legs knee/hock bends and narrower hooves. Move the church left and smaller (`church` x ≈ 0.4, s ≈ 0.45, standing on the horizon so it clears her back and head) or drop it. Lower the horizon, or bring the mare up to s ≈ 1.0 so the sky is at most a third of the frame.

## Round 2 fixes (writer)
1. **Scene 7:**
   - The parson now stands on a wooden crate beside the tube (new `box` option in `hp_tube`): hales y 0.525, scale 0.95, x 0.72. In the 1.6× close-up his shocked face sits right of "8 FT 3 IN", above the caption band, and his feet are on the crate, not floating.
   - Story read: he climbed up to read the top of the column.
2. **Scene 9:**
   - Both tubes now stand on the table top (base 0.55), drawn in front of the arm (`front: true`), in the clear wall space: the 5-ft column at x 0.62 and the 8-ft ghost at x 0.8. The ghost keeps a full-ink outline with only its fills faded (`outline: true`).
   - The arm is shorter (`arm: 0.62`) and the bulb and second hand are dropped here (`bulb: false`), so nothing overlaps the tubes.
   - The dial is numbered 0/60/120/180/240/300 in both scenes 8 and 9. Scene 8's needle climbs to 120 (`to: 0.4`), and scene 9's rests on the same angle (`from`/`to` 0.4).
3. **Scene 2 (and the closing scene 10, same horse):**
   - The standing mare has jointed legs: forearm → knee → cannon → fetlock in front, and gaskin → hock bent back → cannon behind. The hooves are narrower.
   - The church is smaller (s 0.42) and stands on the horizon at x 0.36, clear of her back and head. The horizon is lowered (field 700, hills 760), so the sky is about a third of the frame.
   - The mare moved to x 0.6, so her head is fully in frame.

The cover is untouched. Lint OK: 0 errors, 0 warnings. Preview: no STATIC, 11 scenes, about 32 s, 432 chars.

## Critique log — round 3 (final)
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 9 | 8 | 8 (cover 8) |

**PASS** (all ≥ 7, cover 8). Lint OK (0 errors). Preview: 11 scenes, about 33.5 s, 432 chars, no STATIC. Motion: scene 0 = 1.6 (the hook still under the cover overlay), the rest 7.9–18.7. Round 2 fixes verified on the frames:
- Scene 7: the parson on the crate puts his shocked face above the caption band.
- Scene 9: both tubes stand clear on the table, and the dial is numbered with the needle on 120 in scenes 8 and 9.
- Scene 2/10: the mare has jointed legs, and the small church sits on the horizon clear of her.

The cover is unchanged. Remaining notes (optional, not blocking):

1. Scene 7: his wig still touches the right end of the subtitle box (x 830–905, y 1175–1290), and his right side is cut by the frame edge at x 1080. → `hales.x` 0.72 → ≈ 0.68 if there is a spare pass.
2. Scene 9: the faded 8-ft ghost (x 860–940) has no mark, so "horse vs you" relies on the narration alone. The patient's fingertips (x 505–575, y 905–980) touch the ruler numerals (x ≈ 600). → Add a short gold tick at the ghost's column top (no extra words, so the 5-word limit holds), and shorten the hand by about 30 px.
3. Cover / hook frame: the band at y 520–700 between the text and the barn is empty fade, and the mare is small (x 480–1010, y 1390–1700). → If you rebuild it, raise the focus or zoom about 1.15 so the tube top and the gold 8-ft line sit right under "BLOOD".
