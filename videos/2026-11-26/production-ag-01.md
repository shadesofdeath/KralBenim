# ag-01 — The stethoscope was born from embarrassment (writer notes)

File: `videos/2026-11-26/ag-01-stethoscope-paper-roll.json` · Short · `publish_at` 2026-11-26T13:00:00-05:00 · palette `pamuk`
· category "the human body" · `youtube.related` → `videos/2026-11-25/ag-03-first-blood-transfusion.json`
New scene code: `scenes/studio/shots/wc_stethoscope.js`. Objects `paper_tube`, `timber_beam`, `stethoscope`,
`steth_pair`. Shots `wc_steth_ward` (rest | tap | listen), `wc_steth_beam`, `wc_steth_roll`.

## Verified facts

| Claim in the video | Source |
|---|---|
| 1816, Necker Hospital, Paris; a young woman with "general symptoms of diseased heart" | Wikipedia (René Laennec); PBS NewsHour |
| Tapping (percussion) told him little | Wikipedia; Lemelson-MIT; PBS (frustrated by the limits of percussion) |
| Pressing his ear to her chest was improper | Lemelson-MIT ("awkward, if not impermissible" with a female patient); Laennec's account (translated) cites the patient's age and sex |
| A trick children play: scratch one end of a long piece of wood with a pin, listen at the other end | Wikipedia (Laennec "is said to have seen" children; his words: "scratched with a pin"); PBS doubts the courtyard episode. The narration says "he recalled a trick children play", which is the acoustic fact, not a claim that he watched them that day |
| He rolled paper (Laennec: "a quire of paper") into a cylinder, put one end on the heart region and heard it more clearly than ever | Wikipedia; UVA Health Sciences Library (quote); PBS |

Left out: the Louvre courtyard (doubtful), his death from tuberculosis in 1826 at 45 (verified, no room), the name's
etymology, and the 1819 book. "A few sheets" (on-screen note) stands for "a quire".

## Final narration (497 characters, preview estimate ~36 s)

The stethoscope was born from embarrassment. In 1816, Paris doctor René Laennec faced a young woman with heart
trouble. Tapping her chest told him little, and pressing his ear to it was improper. Then he recalled a trick
children play: scratch one end of a long beam, and listen at the other. He rolled paper into a tight tube, and set
it on her chest. Her heartbeat came through clearer than ever. Today, his blush hangs around every doctor's neck.
Subscribe for a true story like this every day.

## Shot list (after fix round 1)

| # | Sentence | Visual | Type | Cue | Camera |
|---|---|---|---|---|---|
| 0 | The stethoscope was born from embarrassment. | The hook, under the cover text: in the ward the doctor bends over the bed, his ear at the top of a paper tube standing on the young woman's chest, his hand holding it; a red wash begins to beat through her dress | wc_steth_ward listen | — | cover = this frame |
| 1 | In 1816, Paris doctor René Laennec faced a young woman with heart trouble. | Wide ward: an arched window, the woman in bed, the doctor at the foot; "Necker Hospital, Paris" | wc_scene | doc, heart | focus [560, 900], zoom 1.2 |
| 2 | Tapping her chest told him little, and pressing his ear to it was improper. | Medium shot: the doctor (flushed cheeks) behind the bed taps her chest twice with two fingers, grey rings ("dull"); then draws his hand back; red "improper" | wc_steth_ward tap | tap, ear=pressing | medium |
| 3 | Then he recalled a trick children play: | Courtyard, city far behind: a long beam on two blocks, a child kneeling at each end (large, low); "a children's game" | wc_scene (paint-in) | — | wide |
| 4 | scratch one end of a long beam, and listen at the other. | Close on the beam: a hand with a pin scratches the far end; a child bent over the near end, cheek and ear on the wood; red arcs run through the wood to the ear; "a pin", "listening" | wc_steth_beam | scr=scratch, lis=listen | close |
| 5 | He rolled paper into a tight tube, | From above on a desk (inkwell and quill, desk front edge): a sheet with faint handwriting rolls into a tube between two hands in coat sleeves; "a few sheets" | wc_steth_roll | roll=rolled | close |
| 6 | and set it on her chest. Her heartbeat came through clearer than ever. | Close on the same moment as the hook: the ear at the top of the tube, his hand on it; a red bloom beats under her dress and red pulses run up the tube; "lub-dub" | wc_steth_ward listen | beat=heartbeat, clear | focus [480, 760], zoom 1.7 |
| 7 | Today, his blush hangs around every doctor's neck. | Plate: the paper tube lying beside a modern stethoscope; "1816: paper", "today" | wc_specimen (steth_pair) | neck | plate |
| 8 | Subscribe for a true story like this every day. | Title card "The paper stethoscope" / "Paris, 1816" | wc_title | — | — |

Scene 0 is shown under the cover block for the whole first sentence, which is why the preview reads `STATIC?` (0.1).
The scene itself has the doctor easing in and the beating glow.

## Cover candidates, round 2 (text kept: BORN FROM / A **BLUSH**)

| | Image | Verdict |
|---|---|---|
| A | Close on the woman in bed, the paper tube lying across her chest, a red wash through the dress | It reads as a woman in bed with a roll of paper. Nothing says "doctor" |
| B | **chosen**: the doctor bent over the bed, his ear at the top of the paper tube on her chest, his hand holding it (scene 0 at 2.4 s, focus [520, 1020], zoom 1.6) | It explains itself: you see a doctor listening through a paper tube, which is a stethoscope. One action. The subject fills y≈420–1200 under the text, and the bed and floor fill the bottom |
| C | Plate: the paper tube beside a modern stethoscope | Clear but cold. Small subjects, lots of empty paper, no person and no "blush" |

## Lint / preview
`python tools/lint.py` → OK (no errors or warnings, SEO 100). Preview: 9 scenes, ~36 s, the only STATIC flag is scene 0
(under the cover). `out/preview/stethoscope-paper-roll/sheet.png`, `cover.jpg`.

## Known weak spots
- Scenes 1 and 0/2/6 use different beds and figures (scene 1 is the shared `sickbed` + `person`; the others are the new ward).
- The doctor's coat is a large single mass. The woman's high collar is a pale blob at small sizes.
- Scene 5: the sleeves are long straight bands.

## Eleştiri günlüğü

### ag-01 — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 6 | 8 | 6 | 5 | 8 | 7 | 8 | 7 |

Lint: OK (SEO 100). Narration 499 characters (range 400–500). Palette `pamuk`, which differs from the last three (yaz, gurub, sepya).
Narration read on its own: clear, warm and connected, no inversions, a strong 6-word hook and a punchline that pays it off ("his blush hangs around every doctor's neck"). There is little tension between "improper" and the paper, though.

1. **Scenes 2, 5, 6 (tap / roll / listen) look like flat vector art, not watercolour.** Scenes 2 and 6 fill about 70% of the frame with one flat blue gradient torso, with thin pen lines and no place, light or paper white. Scene 5 is a gradient-filled sheet with flat dark sleeves. In scene 6 the doctor's head is a blob: a huge ear, and a grey mass on top that reads as a cap. Of all the scenes, this one should be the hero ("clearer than ever"), and it is the weakest drawing. → Pull scenes 2 and 6 back to a medium shot in the ward from scene 1. Show the woman's profile on the sickbed (shoulders and pillow), the doctor bent over her in profile with a properly drawn head, and the tube between his ear and her chest. Paint the torso and dress with layered `WC` washes and dry brush, not gradient fills, and leave paper white around the subject. In scene 5, paint the sheet and sleeves with washes, add a hint of the desk edge or an inkwell for place, and drop the gradient.
2. **Scene 4: the picture does not show what is said.** The child at the right kneels upright beside the beam. Her ear is nowhere near the wood, so "listening at the other" is just an arrow to a child who is not listening. Nobody is scratching: the far end is off-frame, and no pin or second child is visible. The red sound arcs float above the beam, against the skyline, instead of running through the wood. → Put the listening child's ear (head bent down) on the end of the beam. Frame the shot so the scratching hand with a pin shows at the far end, or cut once to it on "scratching". Run the arcs along the body of the beam and arrive at the ear on "listening". (Scene 3 is a minor issue: in the wide shot the children are tiny figures at the horizon. Bring the beam and children larger and lower, to about y 900–1100.)
3. **Cover (and the first frame): the subject does not say "stethoscope", and the heart is a clip-art symbol.** "BORN FROM A BLUSH" is a strong, readable line, but under it is a flat, layered emoji-style heart with a paper tube lying across it. On a phone in the Shorts feed this reads as "a roll of paper on a valentine". Nothing points to a doctor or a chest, and the bottom ~40% of the frame is empty paper. Cover <8, so it must be renewed. → Make three new candidates where the subject explains itself. For example, a large tube resting on a high-collared dress, with a soft red heart wash glowing *through* the cloth beneath it. Or the paper tube next to (or turning into) a modern stethoscope. Or a doctor's ear at the top of the tube, painted properly. Use `focus`/`zoom` so the subject fills y≈500–1150. If the heart stays, paint it as a loose wet-in-wet bloom, not a symbolic heart outline. Keep the text.

Also (accuracy, small): "Then he remembered children at play" presents the children as Laennec's own memory. In his own account he recalls an acoustic fact: a pin scratching one end of a piece of wood is heard clearly at the other end. Wikipedia says he "is said to have seen" children, and PBS doubts the episode happened. → Reword it with the same length, e.g. "Then he recalled a trick children play: scratch one end of a long beam, and listen at the other." This also fixes the production note that says "as his own account does".

### Fix round 1 (writer)
1. **Watercolour, scenes 2, 5, 6 (and 0).** I replaced the flat bodice close-ups with a medium shot in the ward (`wc_steth_ward`):
   - **Setting:** a wall with washes, blooms and granulation, an arched window with a light shaft, a floor with board strokes, and the bedstead, mattress, pillow and blanket painted in layered washes with dry-brush folds and loose ink.
   - **The woman:** she lies in profile on the pillow (hair in a bun, eyes closed) in a high-collared dress with an Empire ribbon.
   - **The doctor:** he is a dark-coated figure behind the bed with a white cravat and a head painted in profile (hair, sideburn, ear, closed or open eye, a slight blush when tapping).
   - **Tap:** he taps her chest, then draws his hand back.
   - **Listen:** he bends, his ear sits exactly at the top of the paper tube, and the ear is painted over the tube end. His hand holds the tube. Red pulses run up the tube and a wet-in-wet red bloom beats under the cloth. There is no heart symbol any more.
   - **Scene 5:** a desk with an inkwell and quill and the desk's front edge. The sheet and its shadow are washes, the roll is built from wash, shadow and dry-brush strokes with loose ink (no gradient), and the sleeves are washed, coming from the lower left.
2. **Scenes 3 and 4.**
   - **Scene 4 is a new close shot:** a hand with a pin scratches the far end, and a child kneels bent over the near end with cheek and ear on the wood, an arm hugging the beam. Bigger red arcs run *through* the wood to the ear.
   - **Scene 3:** the children are larger (s 2.5) and the horizon is lower (.56).
3. **Cover.** I tried three new images (see the table above). I chose B: the doctor listening through the paper tube, which is also the first frame now. Scene 0 is that same moment and scene 6 is its close-up, as a bookend.
4. **Accuracy.** Scene 3/4 now say "Then he recalled a trick children play: scratch one end of a long beam, and listen at the other." The facts table no longer says it is his own memory. 497 characters.
5. **Scene 7:** the specimen now shows the paper tube beside today's stethoscope ("1816: paper" → "today").

Lint OK (SEO 100). I looked at `sheet.png`, `cover.jpg` and the full frames of scenes 0, 5 and 6.

### ag-01 — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 8 | 6 | 6 | 6 | 8 | 9 | 8 | 7 |

Lint: OK (SEO 100). 497 characters. Preview re-run (12:24): **scene 0 `motion= 0.1 STATIC?`**; every other scene is between 1.2 and 17.7.

What improved:
- Scene 2 (a medium shot of the tap, with "dull" and "improper") now matches the words.
- Scene 4 is fixed: the pin hand is at the far end, the child's ear is on the wood, and the arcs run through the beam.
- Scene 3 is larger, and the "a trick children play" wording fixes the accuracy issue.
- The heart symbol is gone.

Not passing yet: Hareket, Kompozisyon and Suluboya are 6, and the cover is 7.

1. **Scenes 0 and 6 and the cover: the figures look like ghosts, and the crop is poor.**
   - **Problem:** The doctor's face and head are see-through: the wall and window show through his face, and the paper tube is drawn *across* his cheek instead of ending at his ear, so it reads as a tube in his face. His coat is a smooth grey gradient that fills the right ~40% of the frame like a tombstone, with no folds and no wash edge. The woman's face is cut off by the left edge (x≈0–100) and is tiny next to the doctor. On the cover there are now two half-transparent people, a window, a red blanket and a coat mass, so there is no single clean subject, and the bottom ~35% of the frame is empty floor bands.
   - **Fix:**
     - Paint the figures with an opaque base wash, then add texture, so nothing shows through them.
     - Draw the tube *behind* the head so that its top end meets the ear.
     - Paint the coat as layered washes with folds and a dry-brush edge, not a gradient.
     - Shift the focus so her whole head is inside the frame (e.g. focus about [620, 1000], zoom 1.35).
     - Crop the cover tighter on the ear, tube and chest, so one subject sits at about y 500–1150, and drop the window from the cover crop.
2. **Scene 0 (the hook, 0–3.1 s) is static (motion 0.1).**
   - **Problem:** Under the cover text the first 3 seconds do not move. That breaks the "every scene moves" rule, in the exact seconds that decide whether people swipe away.
   - **Fix:** Start the red bloom beating and the pulses climbing the tube at t=0. Add a slow rise and fall of her chest, a slow shimmer in the light shaft, and the blush slowly deepening on his cheek.
3. **Scene 5 arms, and scene 1 continuity.**
   - **Problem in scene 5:** At the end of the roll, two long grey arms that look like hoses cross the whole sheet diagonally, from the lower left to the right edge. They are anatomically impossible and flat, and they cover the paper that is the subject.
   - **Problem in scene 1:** The doctor is still a tiny, rigid figure at the frame edge (x 0.85), in a brown coat. In scenes 0, 2 and 6 he is a large figure in a grey-blue coat with a cravat, so he does not read as the same man.
   - **Fix in scene 5:** Bring short forearms in from the bottom edge, have the hands follow the rolling edge, and paint the sleeves as washes.
   - **Fix in scene 1:** Use the same coat colour and cravat as scenes 0, 2 and 6, make him larger (about s 2.2, x 0.72), and turn him toward the bed.

Smaller notes: in scene 4 the child is half cut off by the right edge (move x in to about 0.82). The scene 7 stethoscope still stands upright rather than draping "around a neck", which is acceptable.

### Fix round 2 (writer)
1. **Scenes 0 and 6, and the cover.**
   - **No more ghosts:** every figure (both heads and hair, the doctor's neck, cravat and coat, the child's smock) now sits on an opaque paper-tone underlay, so the wall no longer shows through.
   - **Tube meets the ear:** the paper tube is drawn behind his head. Its top end sits at his ear (hidden behind the jaw), and its bottom end rides on her chest as she breathes.
   - **Coat:** it is now layered washes (a light first wash, a darker second wash offset to the shadow side, a deep shadow under the arm), ten fold strokes, a ragged dry-brush edge down the back, pooled colour, and a high coat collar that wraps the neck so the head joins the body. It is grey-blue, made from the clothB and ink tokens.
   - **Cover crop:** tight on ear, tube and chest (scene 0 at 2.4 s, focus [480, 900], zoom 2.0). The window is switched off for scene 0 (`window: false`). The subject fills y≈460–1420 with the bed under it, so there is no empty floor.
   - **Scene 6:** now the wide shot of the same moment (no camera zoom), so her whole head is in frame and it differs from the close hook.
2. **Scene 0 moves from t=0.** The red bloom beats from the first frame and red pulses climb the tube (thicker strokes). Her chest rises and falls, carrying the tube and hand. The light shaft shimmers, dust drifts in it, and his blush slowly deepens. The preview now gives motion 0.4 under the cover, with no STATIC flag.
3. **Scene 5.** The sheet now rolls up from its top edge toward the viewer. Two short forearms in coat sleeves reach in from the sides (elbows just off frame) and hold the roll's ends as it moves down. The sleeves no longer cross the paper. A first try with forearms from the bottom edge made them read like table legs, because the distance to the roll is about 900 px, so I used the sides.
4. **Scene 1.** The doctor is now the same man: a grey-blue coat (`cols.cloth` clothB, legs ink), a white collar, bare head, s 2.2, x 0.74, turned toward the bed. The bed moved to x 0.36.
5. **Scene 4.** The listening child moved 70 px in, so the child sits at x≈0.8 and is no longer cut off.

Lint OK (SEO 100), 497 characters, no STATIC flags. I looked at `sheet.png`, `cover.jpg` and the full frames of scenes 0, 5 and 6.

### ag-01 — tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 8 | 7 | 7 | 7 | 8 | 9 | 8 | 7 |

Lint: OK (SEO 100). 497 characters. Preview re-run: no STATIC flags; scene 0 has motion 0.4, every other scene is between 1.2 and 10.4.

What improved:
- Scene 1: the doctor is now the same man (grey-blue coat, larger, turned to the bed).
- Scene 5 reads well: the sheet rolls from the top and the hands hold the ends, with no arms crossing the paper.
- Scene 6 is now the wide shot, with her whole head in frame.
- Scene 0 moves (the beat, pulses, light shaft, dust).
- The figures are no longer see-through.

Every criterion except the cover is now ≥ 7. **The cover is still below 8.**

1. **Cover and scene 0: his head sits on top of the tube like a head on a pole.**
   - **Problem:** The tube's top end is hidden under his jaw, and no neck or collar shows between his head and his coat. The paper tube therefore reads as his neck, not as something at his ear. The far arm is a striped, half-transparent grey "hose", and the coat is still mostly a smooth gradient.
   - **Fix:** Paint a visible neck and a high collar behind the tube, connecting the head to the shoulders. Tilt the head about 20–30° so the ear turns down and rests visibly on the tube's top rim; the rim should show around the ear. Make the arm an opaque wash with 2–3 fold strokes instead of parallel stripes.
2. **Cover and scenes 0 and 1: the woman's face is cut off by the left edge.**
   - **Problem:** On the cover only her chin and part of her face show at x≈0–70, so the "her" of the story is missing from the key image. Scene 1 is the same: her head touches the left edge.
   - **Fix:** On the cover, move the focus left to about [440, 900] or use zoom 1.8, so her profile and pillow are inside the frame and the composition reads as doctor → tube → her. In scene 1, move the focus to about x 600, or move the bed to x 0.4.
3. **Suluboya still lags in the hero close-up compared with the wide shots.**
   - **Problem:** Scenes 2, 3, 4 and 6 now read as painted. But at cover zoom (2.0) the woman's dress and the blanket are large flat shapes with hard edges, and red blooms sit over them like stickers.
   - **Fix:** At this crop, add a second wash layer with soft lost edges, let the red bloom spread *into* the dress colour (wet-in-wet), and add a few dry-brush strokes at the bed edge.

Smaller notes: the scene 4 child still touches the right edge. The scene 7 stethoscope stands upright rather than "around a neck" (acceptable).

Verdict after 3 rounds: everything else passes (≥ 7). Before push, the director must fix problem 1 on the cover (neck and collar, ear on the tube rim) and check `cover.jpg` again, because the cover must be ≥ 8.

### Fix round 3 (writer, cover-focused)
1. **The doctor (scenes 0 and 6).**
   - **Head:** bowed about 25° more (ang −0.35 → −0.78). The order is now head → tube → ear, so his ear sits on the tube's top rim.
   - **Neck:** a visible neck runs from the nape down and back into a high coat collar and cravat, to the right of the tube, so the tube no longer reads as his neck.
   - **Coat and arm:** the coat body has moved right to make room. The near arm (the one holding the tube) is a solid sleeve wash with three fold strokes, with no striped bristles.
2. **Cover crop.** Focus [430, 900], zoom 1.6, t 2.3. It now reads doctor → tube → her, with her whole profile (face, hair bun, collar) in frame. The subject fills y≈550–1400 under the text.
3. **Washes.** The dress has an opaque underlay, a second soft-edged offset wash, and red bleeding into the cloth around the chest. The blanket has a second soft wash. The bed rail has dry-brush strokes.
4. **Scene 0 motion.** The light shaft shimmers more strongly, dust drifts faster, and the red bloom has a visible floor and a stronger beat. The preview gives motion 0.4, with no STATIC flag.
5. **Scene 1.** The bed is at x 0.4 and the doctor at x 0.78, with camera focus [600, 900] and zoom 1.2, so her face is no longer cut. **Scene 4:** the child is 110 px in from the right edge.

Lint OK (SEO 100), 497 characters, no STATIC flags. I looked at `cover.jpg` and `sheet.png`.
