# ag-01 — Sticky-rice mortar of the Great Wall (writer notes)

File: `videos/2026-11-25/ag-01-sticky-rice-mortar.json` · Short · `publish_at` 2026-11-25T13:00:00-05:00 · palette `yaz`
New scene code: `scenes/studio/shots/wc_ricemortar.js` (objects `great_wall`, `cauldron`, `rice_bowl`, `bulldozer`,
`ming_tomb`, `microscope` (not used in the end); shots `wc_ricemortar_mix`, `wc_ricemortar_brick`, `wc_ricemortar_crystals`).

## Verified facts (and what was left out)

| Claim in the video | Source |
|---|---|
| Builders mixed sticky-rice soup into slaked lime. This was probably the first organic–inorganic composite mortar | ScienceDaily/ACS 2010; Yang, Zhang & Ma, *Acc. Chem. Res.* 2010 (DOI 10.1021/ar9001944) |
| Its use spread in the Ming dynasty; the Great Wall's Ming sections used it. The video says "partly" and does not claim the whole wall | Smithsonian Magazine (Ming, Great Wall); Wikipedia "Sticky rice mortar" (Great Wall, widespread under the Ming); Telegraph via HNN (Zhang: Ming sections) |
| "One Ming tomb was so hard, a bulldozer could do nothing" | National Geographic 2010 (the authors: part of a Ming tomb is so firm "a bulldozer could do nothing about it"); ScienceDaily ("withstood modern bulldozers") |
| In 2010, chemists in China (Bingjian Zhang's team, Zhejiang University) found out why | National Geographic, ScienceDaily, Live Science |
| Amylopectin (a starch in the rice) inhibits calcium carbonate crystal growth → small, compact crystals → tougher, water-resistant mortar | ScienceDaily/ACS; National Geographic ("smaller crystals … resists water") |
| "Centuries later" | NatGeo: the Nanjing city wall they studied is 600 years old. "Centuries" was used so the claim stays safe |

Left out: the "weeds can't grow" claim (only the Telegraph has it, not checked), the exact first use (sources give
"about 1,500 years ago" or the Northern Wei; not needed), and restoration (it was cut for length).

## Final narration (477 characters, preview estimate ~35 s)

The Great Wall is partly glued with rice. Ming builders boiled sticky rice into soup, then stirred it into slaked
lime. It sounds like a kitchen trick, but it worked. One Ming tomb was so hard, a bulldozer could do nothing. In
2010, chemists in China found out why. A starch in the rice, amylopectin, keeps the lime's crystals tiny and tight.
The mortar sets tough and shrugs off rain. Centuries later, dinner is still holding up the wall. Subscribe for how
the past was built.

## Shot list

| # | Sentence | Visual | Type | Cue | Camera |
|---|---|---|---|---|---|
| 0 | The Great Wall is partly glued with rice. | Summer day: the wall climbs a green ridge, a big Ming watchtower with a lookout roof and a waving banner, smaller towers and a blue far ridge behind | wc_scene (`great_wall`) | — | engine push; the cover zooms in on the tower |
| 1 | Ming builders boiled sticky rice into soup, | Dawn camp: an iron wok in a mud-brick stove full of white rice soup, fire, steam, a paddle stirring, a worker; the wall faint on the far hills | wc_scene (`cauldron`) | rice=sticky (note "sticky rice") | — |
| 2 | then stirred it into slaked lime. | Close: a wooden trough of lime; a ladle tips and pours a cream stream, a swirl opens | wc_ricemortar_mix | stir=stirred (pour), slaked (note) | close-up |
| 3 | It sounds like a kitchen trick, but it worked. | Close on the wall face: grey bricks, pale seams with rice specks; a new brick drops into its bed, a bead of mortar squeezes out | wc_ricemortar_brick | worked (brick lands) | close-up |
| 4 | One Ming tomb was so hard, a bulldozer could do nothing. | A Ming soul tower (brick platform, red pavilion, yellow roof, mound behind); a yellow bulldozer rolls in and stops at the platform, exhaust smoke | wc_scene (`ming_tomb`, `bulldozer`) | bull=bulldozer (starts moving) | — |
| 5 | In 2010, chemists in China found out why. | Big "2010", "Zhejiang University", "chemists find out why" | wc_number | chem=chemists | — |
| 6 | A starch in the rice, amylopectin, keeps the lime's crystals tiny and tight. | Two microscope views: "lime only" (big loose crystals, dark pores) / "with rice" (gold starch threads, then tiny packed crystals) | wc_ricemortar_crystals | starch (threads), tiny (crystals fill) | plate |
| 7 | The mortar sets tough and shrugs off rain. | Storm, rain sweeping over the tower and wall | wc_scene (`great_wall`) | — | focus [330, 800] zoom 1.6 |
| 8 | Centuries later, dinner is still holding up the wall. | Dusk: a blue-and-white bowl heaped with steaming sticky rice before the wall on the hills | wc_scene (`rice_bowl`, `great_wall` mid) | — | — |
| 9 | Subscribe for how the past was built. | Title card "Sticky-rice mortar" / "Ming walls, still standing", a small bowl | wc_title | — | — |

Types: wc_scene 5/10, plus 3 custom types, wc_number and wc_title. Close-ups: 2, 3 and 6, plus the zoom on 7.

## Cover candidates

| | Text | Scene | Verdict |
|---|---|---|---|
| A | GLUED WITH / **RICE** | 0, watchtower (focus [330, 800], zoom 1.55) | **chosen**: the Great Wall shape is iconic and readable at thumbnail size; one subject; same idea as the first sentence |
| B | **RICE** HOLDS / THE WALL | 8, rice bowl at dusk | the bowl alone doesn't say "Great Wall" in a small thumbnail; "the wall" is vague |
| C | THE WALL'S / SECRET: **RICE** | 3, brick face | a flat brick pattern with nothing to focus on, and the note leader crossed the text |
| D | BUILT WITH / **RICE** | 7, storm | grey and dull; the subject is small |

## Lint / preview
`python tools/lint.py` → OK (0 errors, SEO 100). Preview: 10 scenes, ~35 s estimated. Scene 0 shows `motion 0.1 STATIC?`
because both preview frames sit under the cover block (the whole first sentence). The scene itself has a waving
banner, birds and the engine push.

## Known weak spots
- The architecture (tower, wall) is clean and fairly geometric. It may read a little "illustration" rather than loose watercolour.
- The lower 40% of the outdoor scenes is plain ground or slope, which is safe for the subtitles but empty.
- The scene 5 number card is plain (the microscope object looked wrong in the specimen plate, so it was swapped out).
- The duration estimate of 35 s is at the top of the range. If the real voice runs long, cut "then" or the word "slaked".
- The ladle in scene 2 reads as a big spoon, and the stream is thin.

### ag-01 — round 1 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 7 | 6 | 5 | 8 | 9 | 8 | 7 |

Lint OK (SEO 100). Preview ~35 s / 477 chars (top of range). Facts check out (NatGeo/ScienceDaily/NBC 2010: Zhang's Zhejiang team, amylopectin keeps calcium carbonate crystals small and compact, a Ming tomb "a bulldozer could do nothing about"). Script: strong 8-word opener and a good punchline ("dinner is still holding up the wall"), but the middle is a list of facts with no person or tension. One beat would fix that, e.g. who noticed it, or the restorers who now copy the recipe.

1. **Suluboya: flat vector look (scenes 0, 3, 7 and the cover).** The watchtower is plain rectangles with even ink outlines and flat fills, and the scene 3 brick face is a clip-art tile pattern. This reads as a vector illustration, not a watercolour sketchbook, so the score is capped at 5. → In `wc_ricemortar.js`, build `great_wall`/the tower and the brick wall from `WC.mk` strokes and `WC.washShape` washes: uneven brick sizes, wet edges, dry-brush texture, one darker pigment layer on the shadow side, paper-white highlights on the merlons. No hard outline around the whole tower. Scene 3: vary the bricks' tone and size, let the mortar seams bleed, and paint only part of the wall with soft edges (vignette into the paper) so it stops filling the frame edge to edge.
2. **Composition: scene 7 repeats scene 0, and several lower halves are empty.** Scene 7 is the same tower, the same slope and the same framing with a grey sky. The rain is almost invisible, so "shrugs off rain" shows nothing new. In scenes 2 and 4 the bottom ~40% is flat tan ground. → Scene 7: make it a close-up plan, rain streaking down a brick/mortar face with water beading and running off the seam (`wc_ricemortar_brick` with `weather: rain`, or a new `wc_ricemortar_rain`), or at least use `weather: "storm"`, visible diagonal rain and a different angle/side. Scenes 2/4: fill the lower ground with foreground items (rice sacks, lime baskets, a tool, rocks) up to y ≈ 1500.
3. **Cover/scene 0 image doesn't carry the hook, and its motion is static (0.1).** "GLUED WITH RICE" sits over a bare tower with no rice anywhere, so the surprise lives only in the text. The first 3 s are also motionless. → Put the claim in the picture: zoom on a mortar seam of the wall with rice grains visible, or a rice bowl/grains spilling at the foot of the tower in the foreground, with the tower behind. Keep one subject. Add visible motion during the cover (flag sway amplitude up, drifting clouds, the stroke-by-stroke paint-in of the tower). Minor: scene 2's "slaked lime" note never finishes writing, because the cue sits on the second-to-last word of a 2.4 s scene. Move it to "stirred" plus a small delay, or use a time like `"at": 0.4`. The visual shows pouring, not stirring: add a slow stirring paddle after the pour.

### Fix round 1 (writer)
1. **Watercolour.** In `wc_ricemortar.js`, the watchtower (`mtower`) and the wall face are now painted in layers: a paper underlay, two jittered body washes, uneven brick dabs in four tones, a darker shadow side with a ragged edge and pigment pooling at the edge, wet blooms, paper-white dry-brush highlights, wet double-wash windows, uneven merlons with paper-white tops, and loose broken ink (`looseInk`) instead of an even closed outline. The scene 3 brick shot now has uneven widths and tones per row, wet pooling on the lower and right edges, dry-brush tops and broken ink. The wall is painted on its own canvas and faded into the paper with a ragged soft mask, so it no longer tiles edge to edge.
2. **Composition.** Scene 7 is now `wc_ricemortar_brick` with `rain: true`: a close-up of wet bricks under a storm sky, slanted driving rain, and drops gathering on the bricks and running down the faces and seams. It has the note "rain runs off". The new props `rice_sack` and `lime_basket` fill the foreground of scenes 1 and 2. Rocks, a shrub and grass fill the foreground of scene 4 down to y ≈ 1500–1630.
3. **Cover and hook.** Scene 0 now has a blue-and-white bowl of steaming sticky rice on the slope in front of the wall. The cover is "GLUED WITH **RICE**" on the tower with the bowl in front (focus [520, 880], zoom 1.2). Motion under the cover: the wall paints in over 1.8 s, the banner waves wider and faster, a cloud drifts and the bowl steams. The preview still reads `motion 0.2 STATIC?`, because both of its sample frames sit under the cover block. Scene 2: the "slaked lime" note now starts at 0.4 s; after the pour the ladle lifts away and a paddle stirs the swirl slowly round.
4. **Not done.** I did not add the human beat (the restorers). It would push the narration past 500 characters and over 35 s. Narration unchanged: 477 characters, ~35 s.

Lint OK (SEO 100). I looked at the preview `sheet.png` and `cover.jpg`.

### ag-01 — round 2 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 8 | 7 | 7 | 6 | 8 | 9 | 8 | 8 |

Lint OK (SEO 100), ~35 s / 477 chars. Improved: the tower now has layered washes and broken ink, scene 2 shows the pour, then the stirring paddle, and the "slaked lime" note completes. Scene 7 is a new rain close-up, and scenes 1, 2 and 4 now have foreground props. The cover now shows rice. **Does not pass yet: Watercolour 6.**

1. **Watercolour (6) in scenes 1, 2, 4 and both brick shots.** The cauldron and stove, the lime trough, the Ming tomb, the bulldozer, `rice_sack` and `lime_basket` are still flat fills with even closed outlines, so they read as vector or clip art. At 360 px the brick faces of scenes 3 and 7 still read as a regular tiled pattern. → Give these objects the same treatment as `mtower`: jittered double washes, a shadow side with pigment pooling, paper-white dry brush and `looseInk` instead of the closed outline. On the brick shots, break the regularity: different course heights, some bricks dissolving into a loose wash, and seams that are not continuous.
2. **Repeated frames.** Scenes 3 and 7 are the same brick face at the same scale. Scene 8 (bowl in front of the wall on the hills) repeats the scene 0/cover composition. In scene 7 the raindrops are too small to see at 360 px. → Scene 7: `camera` zoom ~1.9 on one seam, with wide, dark wet streaks running down it. Scene 8: drop the bowl and end on the wall alone at dusk, as a wide shot with `mist` washing back into the paper. The punchline is about the wall, and the bowl already opened the video.
3. **The cover has two subjects that compete.** The tower (top left) and the bowl (bottom right) pull the eye apart, and the bottom ~25% under the bowl is empty green. → Stack them on one axis: the bowl front centre (x ≈ 0.5) and large, with the tower directly behind and above it. Use cover `focus` on the bowl/tower axis with zoom ~1.4, so the bowl fills the lower third and the tower sits just under the text.

### Fix round 2 (writer)
1. **Watercolour, all objects.** In `wc_ricemortar.js`, every object wash now goes through the shared `wsh` helper with at least 3 jittered passes and wider jitter. Every outline goes through `ink`, which is now `looseInk`, so there are broken brush pieces instead of closed outlines everywhere (cauldron and stove, lime trough, Ming tomb, bulldozer, rice bowl, rice sack, lime basket). New `dry` (paper-white dry-brush highlights) and `pool` (pigment pooled on the shadow edge) are added to the stove, the bulldozer hood, the tomb platform (which also gets uneven brick dabs) and the sack.
2. **Brick walls (scenes 3, 7).** Row heights now vary (×0.72–1.3) and the joints are uneven. About 16% of the bricks dissolve into a loose wash with no edges. Mortar and paper-white blooms break up the seams. The fade into the paper at the sides and bottom is kept.
3. **Scene 7.** The camera now sits on one seam at zoom 1.9. Baked wide, wavering dark wet streaks run down the wall (brush strokes, not bars). The drops are bigger and gathered near the centre, under slanted rain. The note is "rain runs off".
4. **Scene 8.** The bowl is gone. The scene ends on the wall and its tower alone at dusk, with the banner still waving, and from 3.0 s the picture washes back into the paper (`mist`).
5. **Cover.** The bowl is front and centre and large (x 0.34, s 1.4), with the watchtower directly behind it under the text. Cover focus is [366, 830] at zoom 1.4. The bowl fills the lower third and the ground runs to the bottom.

Lint OK (SEO 100). I looked at `sheet.png`, `cover.jpg` and frames 6, 7 and 14–17. Narration unchanged: 477 characters, ~35 s.

### ag-01 — round 3 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 8 | 8 | 8 | 7 | 8 | 9 | 8 | 8 |

**Passes** (all ≥ 7, cover 8). Lint OK (SEO 100), ~35 s / 477 chars, no STATIC flag (scene 0 is 0.4). Cover: the bowl is front and centre with the tower directly behind on one axis, which gives one clear read; the text is big and "RICE" is amber. The brick shots now dissolve into washes and no longer tile. The scene 7 rain close-up is clearly different from scene 3, and scene 8's dusk wall with `mist` makes a good ending.

Remaining (minor, not blocking):
1. Watercolour is only just at 7. The scene 4 bulldozer and tomb and the scene 1 stove/vat are still the cleanest, most "illustration"-like objects. The cover bowl's white body is a flat fill with a hard rim. If time allows, add one more darker wash on their shadow sides.
2. The script is serviceable but has no human beat (accepted: the character budget is full).
3. Scene 7: the "rain runs off" note is large and its leader crosses the streaks. It could be a little smaller and sit higher on the sky band.
