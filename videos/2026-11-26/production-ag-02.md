# ag-02 — Electric Eels vs Horses: Did Humboldt Tell the Truth? (Stickstory Short)

- **File:** `videos/2026-11-26/ag-02-humboldt-electric-eels.json` · `publish_at` `2026-11-26T19:00:00-05:00`
  (Istanbul 27.11 03:00) · paper `yaz` (green llanos, brown pond, hot sun; ag-01 is `pamuk`, indoor Paris)
- **Category:** animal superpowers · **related:** `videos/2026-11-03/ag-03-bat-echolocation.json`
- **Viewer should feel:** a "tall tale" about horses fighting fish turned out to be true.

## Narration (499 characters)

Horses were sent to battle eels. In 1800, Alexander von Humboldt wanted live electric eels in Venezuela. So local men
drove about thirty wild horses into a muddy pond. The eels rose, pressed against their bellies and fired, again and
again. Two horses drowned within minutes. Then the tired eels were caught. For two centuries, it sounded like a tall
tale. In 2016, a biologist filmed eels leaping from the water to shock a threat. Humboldt was right. Subscribe for a
true story like this every day.

## Shot list

| # | Text | Type | Visual / objects | Cue |
|---|---|---|---|---|
| 0 | Horses were sent to battle eels. | `wc_eel_strike` pond (new) | bay horse belly-deep in a brown pond, palms on the far bank; eel arches out, chin on the horse's flank, gold sparks; 2nd eel under the surface. Already painted at frame 0 (hook + cover) | battle |
| 1 | In 1800, … in Venezuela. | `wc_map` | South America → zoom to Venezuela, country wash, red star Calabozo, "Llanos", Caribbean Sea | ven |
| 2 | So local men drove … muddy pond. | `wc_eel_herd` (new) | wide plain, palms, pond; 8 horses gallop in from the left and wade in (legs vanish, rings, splash), 2 riders behind; note "about 30 horses" | pond |
| 3 | The eels rose, … again and again. | `wc_eel_strike` pond, flipped (close) | chestnut horse big in frame, eel rises on "rose", sparks pulse on "fired"; red note "shock!" | rose, fired |
| 4 | Two horses drowned within minutes. | `wc_number` | "2" on a water swatch, small horse vignette, "horses drowned" / "within minutes" | — |
| 5 | Then the tired eels were caught. | `wc_scene` | still pond, eel lying in the shallows, man with a harpoon on the bank, palms; note "harpoons on ropes" | — |
| 6 | For two centuries, … tall tale. | `wc_letter` diary | "March 1800 / thirty horses and mules / the eels pressed against them / two horses drowned — A. von Humboldt" | tale |
| 7 | In 2016, a biologist filmed … | `wc_eel_strike` tank (new mode) | lab, glass tank, low water, aluminium plate with a column of lights; eel leaps up it on "leaping", lights glow on "shock"; note "Vanderbilt lab, 2016" | leap, shock |
| 8 | Humboldt was right. | `wc_scene` | dusk llanos, calm pond, one horse on the bank, palms, birds; mist | — |
| 9 | Subscribe … every day. | `wc_title` | "The horses and the eels" / "Humboldt, Venezuela, 1800", small eel | — |

Types: wc_eel_strike ×3, wc_eel_herd, wc_map, wc_number, wc_scene ×2, wc_letter, wc_title (7 types). Close-up: scene 3
(big horse), plate-like card: scene 4.

## New code

`scenes/studio/shots/wc_eel.js` (own file, auto-loaded): objects `electric_eel` (pose swim/rise), `pond` (live rings);
shots `wc_eel_strike` (mode pond/tank, rising eel, pulsing sparks, horse rearing slightly, LED glow) and `wc_eel_herd`.
Bodies get a paper-coloured underlay so the background doesn't show through the washes.

## Cover candidates

- **A (chosen):** "HORSES / VS **EELS**", scene 0, t 2.0, focus [580, 820] zoom 1.25: one horse + one eel at the spark,
  big bold text, same as the first frame and first sentence.
- B: "THE **EELS** / WON", scene 3: the horse's head is cut off and the "shock!" note sits under the text; weaker.
- C: "FISH THAT / BEAT **HORSES**": the words are smaller (longer lines), so it reads worse on a phone.

## Facts and sources

- 19 March 1800, Venezuelan llanos (Humboldt was based at Calabozo; the pool was near Rastro de Abaxo): local men drove
  about 30 wild horses and mules into a muddy pool; two horses were stunned and drowned within the first ~5 minutes;
  once the eels were exhausted they were caught with small harpoons on ropes; Humboldt stepped on one and ached all day
  (Smithsonian; APS; Vanderbilt; PNAS).
- The story was doubted for about 200 years ("tommyrot", "tales"): PNAS 2016 discussion.
- Kenneth Catania (Vanderbilt), PNAS 2016: eels leap out of the water, press the chin against a threatening conductor
  and discharge; voltage and current rise the higher they climb; tested with an aluminium plate and LED-lit props.
- Not used in narration: E. voltai 860 V (de Santana et al., Nature Communications 2019, phys.org).
- Sources in the JSON: PMC4922196 (PNAS), Vanderbilt News, Smithsonian, APS News.

## Eleştiri günlüğü

### ag-02 — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 6 | 7 | 6 | 6 | 8 | 9 | 8 | 8 |

Lint OK. 499 chars (top of 400–500), preview ~37.7 s. Motion: all ≥ 0.3 (scene 0 only 0.6: the hook frame is nearly frozen). Sources: PMC4922196 opened; it confirms March 1800, ~30 horses and mules, two drowned, eels exhausted then caught, 200 years of doubt, Catania's chin-press leap. Narration alone works: clear hook, cause and effect, a twist 200 years later, a short punchline; no inverted sentences, no YouTuber phrasing. Cover reads well small ("HORSES / VS **EELS**", one horse + one eel). The title starts with tags[0].

1. **Scene 5 (tired eels caught), the weakest frame.** The "man" is a faceless green blob seen from behind (it looks like a rolled rug), standing at x 0.8 (YouTube's right-side UI) with his feet at y ≈ 1260, inside the subtitle band. He holds a plain spear, not a harpoon on a rope, so the visual and the note ("harpoons on ropes") don't match. The eel is almost as wide as the pond. A stray leader dash floats in the sky before the note writes, and both far palms are bent like hooks. → Rebuild: one llanero in profile (`face: "right"`, s ≈ 1.8) at x ≈ 0.6, feet at y ≈ 0.55 (above the subtitle band). Draw a visible rope line from a harpoon to a smaller eel (s ≈ 0.7) in the shallows. Draw the leader only when the note appears, and use upright palms. Or make it a `wc_specimen` close-up of a harpoon and rope with the limp eel.
2. **Scene 2 (herd driven into the pond): subject in the subtitle band.** The herd and riders fill y ≈ 930–1330, so "horses into a muddy pond" sits right on top of the horses' bodies and legs. The sky and the "about 30 horses" note use the top half while the bottom 600 px are empty grass. → Raise the pond/horizon so the herd sits at y ≈ 650–1100. Put a fg grass/reed band under the subtitles. Let the horses enter from the left on a slight diagonal so one lead horse reads as the hero.
3. **Scenes 0/3 (and cover): flat, stiff drawing and a cropped hero.** The horse is a rigid geometric block with straight-cut legs. The eel's belly is a row of pale rectangular tiles, which reads as flat vector rather than watercolor. In scene 3 the horse is so large (`horse_s` 4.6) that its rump runs off the left edge and the head hugs the frame, so the close-up has no breathing room. On the cover the red sun shows through behind the "S" of HORSES. → Add soft wash layers and a darker belly/shadow stroke on the horse, replace the eel's belly tiles with a continuous graded wash, bring scene 3 down to `horse_s` ≈ 3.6 with the whole horse in frame (focus on the contact point instead), and drop or move the sun out from behind the cover text (or `sun: none` in mode pond). The hook frame also needs more life (motion 0.6): let the sparks and ripples pulse from t = 0.

**Writer fixes after round 1:**
1. Scene 5 → new `wc_eel_catch` type: one llanero in profile (straw hat, light shirt, `man_seed` 3) at x 0.36 with feet at
   y 0.55, a visible rope from his hands to a harpoon shaft standing in the shallows beside a smaller limp eel (s 0.7),
   which is drawn toward the bank as the rope tightens. Rings spread. Camera at [500, 880] ×1.4. Upright palms (own seeds).
   Notes now write the words first; the pen line follows after them (no stray dash).
2. Scene 2 → horizon 0.36, pond at y 0.5: the herd sits at y ≈ 650–1000. The lead bay horse (s 1.6) is nearest and
   furthest into the water, the herd trails back up-left on a diagonal, riders behind. A grass/reed band fills the lower
   area and sways.
3. Scenes 0/3/cover → a new `horse_shade` overlay (belly shadow, hindquarter glaze, wet back light, dry brush) plus a
   paper underlay so nothing shows through. The eel's belly, throat and fin are now continuous graded leaf strokes
   (no rectangular tiles). No sun in pond mode (nothing behind the cover text). Scene 0 starts with the eel already up
   and the discharges already running (`rise` -1, `fire` -1.2), so sparks and rings pulse from frame 0. Scene 3 is at
   `horse_s` 3.6 with the whole horse in frame (camera removed), and the "shock!" leader points at the contact.
Lint OK (SEO 100), 499 chars, no STATIC.

### ag-02 — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 7 | 7 | 7 | 8 | 9 | 8 | 8 |

Lint OK, 499 chars, preview re-run (~37.7 s). Motion: all ≥ 0.3 (scene 0 still only 0.6; 2: 7.7, 3: 5.5, 5: 4.2). Narration unchanged.
Round-1 fixes landed:
- Scene 2: the herd now sits at y ≈ 690–1075 with a lead horse, and grass/reeds fill the bottom.
- Scene 3: the whole horse is in frame, and the "shock!" note points at the contact.
- The eel's belly is a continuous wash.
- The cover sun is gone, and the cover reads cleanly.
- Scene 5: the llanero now has a rope and a harpoon.

This passes the bar (all ≥ 7, cover 8), but only barely on Suluboya and Kompozisyon.

1. **Scene 5 (frame_11): a render bug and an empty bottom half.**
   - A pale rectangular box (the paper underlay) shows behind the llanero's legs, at about x 300–450, y 845–900.
   - The rope coil floats beside his hip instead of hanging from his hand.
   - Everything sits above y ≈ 1000, so y 1000–1920 is bare grass, and the pond runs off the right edge.
   - → Clip the underlay to the figure's silhouette (or remove it). Put the coil in his hand. Move the group down (feet at y ≈ 1080, pond fully in frame), or add `camera` focus [560, 760] ×1.4 so the scene fills the screen.
2. **The horse model (cover, scenes 0, 3, 8): still stiff and paper-cut.**
   - The head is a polygon with a straight-cut neck, and the legs are straight rectangles with no knee or hock.
   - On the cover it is the biggest shape, so it is what keeps Suluboya at 7.
   - → Round the muzzle and jaw, taper the legs with joints, and soften the outer edges with dry-brush strokes. As a quick win for the cover only, tighten on the eel's chin and the spark (focus ≈ [470, 1180], zoom ≈ 1.5) so the eel and the discharge are the subject and the horse's legs fall out of the frame.
3. **Scene 4 (`wc_number`): a weak card.**
   - The "within minutes" note is tiny (≈ 30 px, unreadable on the 360 px contact sheet).
   - The note is still being written at the second sample ("within minu…").
   - A healthy horse stands calmly above "horses drowned".
   - → Finish writing the note by mid-scene and make it label-sized, or drop it (the subtitle already says it). Show the horse half-sunk in a water wash, or replace it with a ring of ripples where a horse went under.

Minor: scene 0 motion is 0.6 even with discharges running from frame 0. Make the sparks and rings pulse more visibly so the hook frame doesn't read as a still.

**Writer polish after round 2:**
1. Scene 5: the pale box behind the llanero's legs (the water skin over the eel) is now clipped to the pond's ellipse.
   The rope coil hangs from his hand. The group is larger (man s 2.3) and sits in y ≈ 450–1020: the pond is fully in
   frame and above the subtitle band, with the eel in it (s 0.8). The camera was removed and the note's leader points at
   the rope.
2. Horse: the library horse is kept, with the shade layer (custom horse judged too risky). Tight cover tried (focus
   [470, 1180] ×1.5): the horse's head is lost behind the text and "HORSES" no longer shows a horse, so the current
   cover is kept.
3. Scene 4: the "within minutes" note was dropped (the subtitle carries it). The calm horse was replaced with a new
   `eel_rings` vignette: brown water with rings and bubbles where something went under.
   Scene 0: sparks are drawn at 1.35× and each discharge sends a pale-gold ring across the water (motion 0.7).
Lint OK (SEO 100), 499 chars, no STATIC.

### ag-02 — tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 7 | 7 | 8 | 9 | 8 | 8 |

Lint OK, 499 chars, preview re-run (~37.7 s). No STATIC: scene 0 is 0.7 and every other scene is ≥ 1.8. Narration unchanged.

Round-2 fixes landed:
- Scene 5: the underlay box is gone. The rope runs from the llanero's hand to the harpoon. The pond is fully in frame above the subtitle band, and the leader points at the rope.
- Scene 4: the calm horse is replaced by rings and bubbles in brown water, which now matches "drowned". The tiny half-written note is gone.
- Scene 0: each discharge sends a gold ring across the water.

**PASS:** all criteria ≥ 7 and the cover is 8. Remaining problems are not blocking; they are for future videos and the shared library:
1. **Library `horse` (cover, scenes 0, 3, 8):** still a polygonal head with a straight-cut neck and rectangular legs. It holds Suluboya and Kompozisyon at 7 and keeps the cover from a 9. → In a later, non-parallel session, give the shared horse a rounded muzzle and jaw, jointed tapering legs and dry-brush edges (`wc_g_people.js`, not a per-video file).
2. **Scene 5:** the llanero has no visible arms (one hand patch on the thigh holds the coil). The eel (s 0.8) still spans about 70% of the pond, so the pond reads as a tub. → Draw the rope arm forward from the shoulder, and use eel s ≈ 0.6 or a wider pond (`w` ≈ 900).
3. **Scene 8 (punchline "Humboldt was right.", 1.5 s):** the visual is a near-repeat of the llanos plain with one standing horse and a flat striped red sun disc, a weak reward for the payoff. Scene 0 motion is still only 0.7. → Optionally hold the frame about 0.5 s longer (a pause in the text). Make the sun a soft wet-in-wet wash, or let the mist wash the pond back to paper visibly within the scene.
