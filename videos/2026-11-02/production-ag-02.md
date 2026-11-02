# ag-02-hoover-dam — Stickstory Short (how it was built)

- **File:** `videos/2026-11-02/ag-02-hoover-dam.json` · format short · publish_at `2026-11-02T19:00:00-05:00` (Istanbul 03.11 03:00)
- **Category:** how it was built (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries); no fitting current headline found by web search → **category pool** (report says so).
- **Topic:** Hoover Dam's concrete problem — poured as one block, the curing concrete would have needed about 125 years to cool and would
  have cracked. So it was poured in separate interlocking columns/blocks with about 582 miles of 1-inch steel pipe inside, first river water,
  then ice-cold water from a refrigeration plant (USBR: equivalent of ~1,000 tons of ice a day). Pipes were then filled with grout — still inside.
  Source: https://www.usbr.gov/lc/hooverdam/history/essays/concrete.html. Writer verifies every number against USBR; drop anything unconfirmed.
  Avoid the myth "workers are buried in the concrete" (USBR says no).
- **Viewer should feel:** "They had to build a giant fridge inside a dam."
- **Hook (3–8 words, same idea as cover):** e.g. "This dam would take 125 years to cool." ↔ cover "125 YEARS / TO COOL".
- **Cover idea:** big Kaşif (shock / sweating) in front of a steaming concrete block / dam wall. One subject.
- **Punchline:** complete standalone line + one short subscribe line with reason.
- **Related long video:** none.
- **Budget warning (ElevenLabs warning: true):** narration 400–440 chars.
- **Palette:** `ag-newsprint` (differs from ag-01 today and from the last video, ag-dusk); sets mainly `desert` + `interior`.

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

## Facts (verified by the writer, 2026-11-02)
- USBR concrete essay (https://www.usbr.gov/lc/hooverdam/History/essays/concrete.html): the dam was built as separate columns "to allow the
  tremendous heat produced by the curing concrete to dissipate"; in one continuous pour "it would have taken 125 years for the concrete to cool
  to ambient temperatures" and "the resulting stresses would have caused the dam to crack and crumble away"; columns rose in five-foot lifts;
  each form had cooling coils of 1-inch thin-walled steel pipe; river water first, then chilled water from a refrigeration plant on the lower
  cofferdam; afterwards the pipes were cut off and pressure grouted. First concrete 6 June 1933.
- USBR FAQ (https://www.usbr.gov/lc/hooverdam/faqs/damfaqs.html): "more than 582 miles of 1-inch steel pipe"; the refrigeration plant "could
  produce 1,000 tons of ice in 24 hours"; cooling completed March 1935; concrete placement completed 29 May 1935 (kicker "1935").
- Not used: "workers buried in the concrete" (myth), "ahead of schedule" (not worded so by USBR), column dimensions (not in the essay).
- Narration says "a plant that made 1,000 tons of ice a day" = the plant's stated capacity (USBR wording "could produce").

## Narration (one text, written first; 436 chars incl. subscribe line; budget warning → inside 400–440)
This dam would take 125 years to cool. Concrete gets hot as it hardens, and Hoover Dam is a mountain of it. Poured in one piece,
it would have cracked apart. So the engineers built it in columns, and hid 582 miles of steel pipe inside. First, river water ran
through those pipes. Then came ice water, from a plant that made 1,000 tons of ice a day. They built a giant fridge inside a dam!
Subscribe for a true story like this every day.

## Shot list (new file `scenes/studio/shots/hd_dam.js`: hd_canyon, hd_pour, hd_plan, hd_cut, hd_plant)
| # | Sentence | Visual | Type | Host | Cue | Camera / set |
|---|---|---|---|---|---|---|
| 0 | This dam would take 125 years to cool. | Hoover Dam in Black Canyon, face tinted hot red, steam rising; big fez host on a boulder, shock + sweat drops (= cover frame) | hd_canyon dam | shock, sweating | hit "years" | desert, push |
| 1 | Concrete gets hot as it hardens, | Bucket tips concrete into a timber form on older lifts; steam, red heat shimmer, thermometer climbs; "HEAT" | hd_pour | – | pour, hot | desert, push |
| 2 | and Hoover Dam is a mountain of it. | Construction: staggered columns wall to wall, cableway bucket, tiny hard-hat workers; "HOOVER DAM" | hd_canyon build | – | name "Hoover", hit "mountain" | desert, pull |
| 3 | Poured in one piece, it would have cracked apart. | One giant red-hot block, heavy steam, cracks race across on "cracked"; "ONE POUR"; source USBR | hd_canyon mono | – | one, cracks, hit | desert, push |
| 4 | So the engineers built it in columns, | Blueprint on the wall splits into columns + staggered blocks; hard-hat engineer points; drafting table in front; "COLUMNS" | hd_plan | – (engineer) | eng, grid "built", hit "columns" | interior, push |
| 5 | and hid 582 miles of steel pipe inside. | Cut-away of 3 hot columns; serpentine pipes draw in lift by lift, risers, header + valve; "582 MILES"; source USBR | hd_cut | – | pipes "hid", hit "miles" | **close-up** [540, 950] ×1.6 |
| 6 | First, river water ran through those pipes. | Pump house on the river pushes water up a pipe into the column bases (blue flow dashes); "RIVER WATER" | hd_canyon build+pump | – | flow "river" | desert, push ×1.1 |
| 7 | Then came ice water, | Same cut-away: icy water through coils, frost, red tint drains, steam dies; "ICE WATER" | hd_cut ice | – | flow "ice" | pull |
| 8 | from a plant that made 1,000 tons of ice a day. | Refrigeration plant on the cofferdam, frosted pipes to the dam, ice blocks pile up, counter "1,000 TONS" + "A DAY"; source USBR | hd_plant | – | plant, hit "tons" | desert, push |
| 9 | They built a giant fridge inside a dam! | Finished cool dam; a giant fridge door in its face swings open: frosty coils, cold vapour | hd_canyon fridge | – | door "fridge" | desert, push |
| 10 | Subscribe for a true story like this every day. | Door open; host on a boulder waves, then points at the fridge | hd_canyon fridge | wave → point | s1, s2 | desert, pull |

Host 2/11 (18%). Types: hd_canyon 6/11 (55%, max 2 in a row), hd_pour, hd_plan, hd_cut ×2, hd_plant. Palette ag-newsprint; sets desert / interior / none (cut-aways).

## Cover candidates (writer)
- **A (chosen): "125 YEARS / TO COOL" (COOL boxed), scene 0 t 1.4, no focus:** steaming red-tinted dam + big shocked, sweating host. One idea, same as line 1.
- B: same, focus [650, 1250] ×1.3: host bigger but the dam crest dissolves into the text fade, fez cut by the fade → weaker.
- C: scene 3 cracked block + shocked host overlay: host overlay did not render for this frame and the "ONE POUR" box clutters it.
- D: "THIS DAM / CAN'T COOL": overstated claim and less concrete than the number.

## Writer's check (round 0)
lint OK (SEO 100), preview: no STATIC? (motion 4.0–43). Fixed before review: "ONE POUR", "582 MILES" and "COLUMNS" labels moved out of the
kicker/caption bands; pump/pipe in scene 6 raised above the caption band and drawn with straight segments; the fridge door now visibly swings
out to the right; the host in scene 10 raised so his face is above the caption.

## Eleştiri günlüğü — Tur 1 (critic)

lint: OK (SEO 100). Looked at sheet.png, cover.jpg, frame_02 (scene 1) and frame_12 (scene 6) at full size. Facts checked on USBR (FAQ + concrete essay).

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 7 | 6 | 7 | 8 | 6 | 6 | 7 |

Cover alone: 7 (target 8). SEO part is fine (title starts with "Hoover Dam", honest question, video answers it).

1. **Scenes 8–10, accuracy + ending.** (a) Scene 8 says the plant "made 1,000 tons of ice a day". USBR FAQ says it "could produce 1,000 tons of ice in 24 hours", and the concrete essay says it supplied *chilled water*. So this is the plant's capacity, not real ice output. The ice blocks piling up in scene 8 make the claim stronger still. (b) Scene 9's punchline "They built a giant fridge inside a dam!" is half wrong: the refrigeration plant sat outside, on the lower cofferdam. Only the pipes were inside. It also just repeats the metaphor and adds no new payoff, and it leaves out the strongest true fact: the pipes were pressure-grouted and are still inside the dam today. **Fix:** scene 8 "…from a plant that could make 1,000 tons of ice a day." For the ice blocks, have them appear as a faded "equivalent" stack, or make the counter the only image. Scene 9: a complete, accurate punchline, e.g. "Those pipes are still inside the dam today, filled with grout." Show it with a cut-away of the finished, cool dam where the coils fill in grey. To stay inside 440 characters, cut "those" in scene 6 and "giant", or drop the fridge line entirely. If the fridge image is kept, the wording must be "they turned the dam into a giant fridge", not "built a fridge inside".
2. **Composition repeats; scenes 0/2/3/6/9/10 plus scene 1 and scene 6.** hd_canyon makes up 6 of 11 scenes, and all six use the same frontal canyon framing: dam in the middle, river in the bottom third, rocks in the corners. The only close-up in the video is scene 5, so on a phone this feels like one picture held for the whole video. Scene 1: the bottom ~40% (y 1250–1920) is a flat, empty grey floor, which fails the "full frame" rule. Scene 6: the "pump house" is a small brown box (~90 px) you can't make out. Its pipe runs down through the caption band (y ≈ 1180–1300), and the "RIVER WATER" stamp repeats the kicker word for word (scene 7 does the same with "ICE WATER"). **Fix:** make scene 6 a close-up (`camera.focus` ≈ [350, 1000], zoom ≥ 1.8) with a pump house large enough to read, and keep the pipe above y 1150. Give scene 3 a push-in to cracks at zoom ~1.6, or show it from a low angle. Scene 1: add a foreground layer (older lifts with formwork, workers' hard hats, rebar) across y 1320–1920. Change the kicker or the stamp in scenes 6 and 7 so the same words don't appear twice.
3. **Cover (scene 0, t 1.4) doesn't sell "hot".** The dam face is a pale salmon tint that reads as pink concrete, not heat. The steam is a few thin grey wisps, and between the title and the dam crest there is a dead empty band (y ~520–800). The host takes up only the lower-right corner; his fez cuts across the dam and his face is small next to the wall. **Fix:** set `heat` to 1.0 with a stronger red/orange glow on the face. Use thick, dense steam columns rising into the empty band so they reach up toward "COOL" (`steam.n` ~24, w ~18, rise ~700). Make the host bigger (scale ~2.0) and move him slightly left so his face sits about y 1350–1550 and clear of the frame. Optionally add one symbol, such as a thermometer bursting at the top. Render 3 candidates again and compare them at phone size.

**Factual risk:** "made 1,000 tons of ice a day" → must be "could make" (USBR wording). "giant fridge inside a dam" is misleading (the plant was on the cofferdam). The hook "would take 125 years to cool" is conditional: USBR says that only applies to a single continuous pour. Scene 3 does clarify it, so it's acceptable. 582 miles of 1-inch pipe, river water first then chilled water, and the grouting are all confirmed (USBR FAQ + concrete essay).

**Writer's fixes (round 1)** — lint OK (SEO 100), preview: no STATIC?, narration **440 chars**.
- Narration (new): This dam would take 125 years to cool. Concrete gets hot as it hardens, and Hoover Dam is a mountain of it. Poured in one
  piece, it would have cracked. So the engineers built it in columns, and hid 582 miles of steel pipe inside. River water ran through them
  first. Then ice water, from a plant that could make 1,000 tons of ice a day. Those pipes are still inside the dam, filled with grout.
  Subscribe for a true story like this every day.
- Accuracy/closing: scene 8 now says "could make" (USBR capacity wording). The ice pile is a faint ghost outline (`ghost: true`, no shading),
  and the counter "1,000 TONS" + "OF ICE A DAY" carries it. The "fridge inside a dam" line and the fridge door are gone. The new punchline (scene 9,
  hd_cut `grout`, close-up ×1.6) is "Those pipes are still inside the dam, filled with grout.": the finished, cool columns, dark grey grout
  creeping through every coil and riser, "STILL INSIDE", source USBR (concrete essay: pipes cut off and pressure-grouted). Scene 10 (subscribe) =
  the cool finished dam with a big host waving, then pointing (close-up [600, 1150] ×1.3, pull). The description now says "ice water" instead of "fridge".
- Variety/framing: hd_canyon is now 5/11. Close-ups are scene 3 (cracks ×1.6), 5 (×1.6), 6 (×1.8), 9 (×1.6) and 10 (×1.3), so the frontal canyon is only wide in 0 and 2.
  Scene 6: the pump house is 1.7× bigger with a turning flywheel and a straight pipe above the caption band (focus [350, 1000] ×1.8); scene 3
  "cracked" (scene text shortened). Kickers 6/7 are now "STEP ONE" / "STEP TWO", so they no longer repeat the RIVER WATER / ICE WATER stamps.
- Scene 1: there's a foreground layer below the form now: rebar ends, old form planks, a plank walkway on posts with two hard hats and a shovel (y 1300–1920).
- Cover: scene 0 `heat` 1.0 plus an orange glow and red heat shimmer on the face, steam n 24 / w 18 / rise 700, and a thermometer on the left wall that
  bursts at the top on "years". The host is at scale 2.0, face ≈ y 1350–1550 on the cover. New candidates: E (t 2.7, bursting thermometer, COOL boxed: **chosen**),
  F (same with focus ×1.15: the dam crest dissolves into the text fade and the host's legs are cut), G (YEARS boxed: weaker, since "cool" is the surprise),
  A2 (t 1.4: no burst yet). Labels in zoomed scenes 3/6/9 were moved so they stay clear of the kicker and the frame edges.

## Eleştiri günlüğü — Tur 2 (critic)

lint: OK (SEO 100). Narration 440 chars. Re-viewed sheet.png, cover.jpg and frame_19 (scene 9) at full size.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 7 | 7 | 7 | 8 | 8 | 8 | 8 |

Cover alone: 8. The heat now reads at a glance (orange glow, red shimmer, bursting thermometer as the one symbol), the host is big and shocked, and "125 YEARS / TO COOL" carries the idea. Every round-1 problem is fixed: "could make", the accurate grout punchline, the fridge line removed, 5 close-ups, the scene 1 foreground, scene 6 readable, no repeated stamps. All criteria are ≥ 7 and the cover is ≥ 8, so **nothing is blocking**. The polish items below are worth doing if round 3 has time:

1. **Scene 9 (punchline) is abstract.** At ×1.6 the frame is a wall of grey coils with no dam or column outline, so "inside the dam" isn't visible. The grout fill barely shows between the two frames, because the coils already look dark grey in the first one. A pipe also runs through the "STICKSTORY" brand at top left (y ≈ 110). **Fix:** zoom ~1.2–1.3 (or a focus a little lower) so the column edges and the dam's outline frame the coils. Start the coils light/hollow and let the dark grout visibly flood in on "grout". Keep pipes out of the top-left brand zone (x < 400, y < 300).
2. **Scene 8 ice pile still reads as real ice.** The "ghost" blocks are shaded, solid and piled up, which quietly contradicts "could make" (the plant mostly chilled water). **Fix:** draw them as dashed outlines only, or remove them and let the "1,000 TONS / OF ICE A DAY" counter carry the scene.
3. **Cover leftovers (not blocking).** There is still an empty band between the title and the dam crest (y ≈ 520–700) because the steam stops at about y 700. One sweat drop touches the right inner frame (x ≈ 1000). **Fix:** set steam `rise` to ~850 so the wisps reach up under "COOL", and move the host ~30 px left.

**Factual risk:** low. "Could make 1,000 tons of ice in 24 hours", 582 miles of 1-inch pipe, river water then chilled water, and the pressure-grouted pipes are all confirmed on USBR (FAQ + concrete essay). The hook "would take 125 years to cool" is conditional (single continuous pour), and scene 3 makes that clear. Acceptable.

**Writer's fixes (round 2 polish)** — lint OK (SEO 100), preview: no STATIC?, narration 440 chars (unchanged).
- Scene 9: zoom 1.25 (focus [540, 1000]). The column tops are lowered (`tops` [720, 680, 700]), so the staggered column edges frame the coils
  and the brand/kicker corner stays empty paper. The pipes start light/hollow; dark grout floods every coil and riser from "filled" (0.9 s). I didn't
  use "grout" as the trigger because it is the last word, and the flood would have been lost in the dissolve. "STILL INSIDE" is 64 px, top right, clear of the kicker.
- Scene 8: the ice blocks are dashed outlines only (no fill, no shading); the counter "1,000 TONS / OF ICE A DAY" carries the scene.
- Cover (E, scene 0 t 2.7): steam rise 850 (reaches into the band under COOL); host moved ~30 px left (x 0.612), so the sweat drop is clear of the frame.
