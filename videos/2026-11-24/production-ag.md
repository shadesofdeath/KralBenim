# Daily batch 2026-11-24 — Stickstory

- Plan (`python tools/plan.py --channel ag`): 2 Shorts — `ag-01-…` 13:00 New York (`2026-11-24T13:00:00-05:00`,
  Istanbul 24.11 21:00, category "history's strangest moments") · `ag-02-…` 19:00 New York (`2026-11-24T19:00:00-05:00`,
  Istanbul 25.11 03:00, category "unsolved mysteries"). No long video today; next long video 2026-11-25.
- ElevenLabs: 25,182 chars used this month (budget 231,442, renews 2026-12-20), no warning.
- Yesterday (2026-11-23): every script has its `*.youtube.json` (uploaded).
- API check (`api-check.yml`) triggered.
- Topic is original (CLAUDE.md, 2026-11-23: no headline-based topics). The scheduled prompt's older "headlines first" and
  "parchment + fez stick figure" instructions conflict with CLAUDE.md and were not applied. Style: watercolor.
- History check: neither the Bucket War / Zappolino nor the Phaistos Disc appears in either channel's history. Today's
  Düşün Bakalım videos: Gimli Glider (1983) and Zeugma (Euphrates) → no overlap. Last Stickstory paper: `gurub`.

# ag-01 — The War of the Bucket (Shorts)

- **File:** `videos/2026-11-24/ag-01-war-of-the-bucket.json` · `publish_at` `2026-11-24T13:00:00-05:00` · paper `keten`
  (medieval Emilia, oak, linen tones; differs from gurub)
- **Category:** history's strangest moments
- **Topic:** Battle of Zappolino, 15 November 1325 (VERIFY): Ghibelline Modena vs Guelph Bologna. Modena heavily
  outnumbered (often quoted ~7,000 vs ~30,000 — VERIFY or say "far bigger"), Bologna's army broke; Modenese chased them
  to Bologna's gates and took an oak bucket from a well as a trophy. Popular telling: the stolen bucket *started* the war —
  most sources say it was taken *after/at the end of* the battle (VERIFY carefully; if sources disagree, phrase honestly,
  e.g. "The legend says… but…"). Bucket still kept in Modena (VERIFY: original in Palazzo Comunale, replica in the
  Ghirlandina tower). 1622 mock-epic "La secchia rapita" (Tassoni) made it famous (optional). Casualty numbers only if
  verified; non-graphic.
- **Viewer should feel:** "Seven centuries later, a city still keeps a bucket as a war trophy — and the famous story is backwards."
- **Hook + cover:** first line "A city still guards a stolen bucket." ↔ cover "STOLEN / **BUCKET**" or
  "WAR FOR A / **BUCKET**?" or "THEY KEPT / THE **BUCKET**" (≥ 3 candidates; single subject: the oak bucket, big, iron
  hoops, maybe hanging on a chain in a tower window).
- **Narration draft (director; writer verifies and polishes to 400–500 chars, hard max 550, written as one flowing text):**
  A city in Italy still guards a stolen bucket. It's a plain oak pail, taken from Bologna in 1325. The legend says this
  bucket started a war. The truth is stranger. Modena and Bologna were already bitter rivals, and that November their
  armies met at Zappolino. Bologna's army was far bigger, yet it broke and ran. Modena chased it right to the city gates,
  and grabbed a bucket from a well as a trophy. Bologna never got it back. Subscribe for history's strangest true stories.
- **Shot ideas:** bucket specimen hero (hook) → tower/city of Modena → "legend" letter/scroll → two banners / armies on a
  hill at dawn (one small, one large) → clash in silhouette, smoke → chase to walled gates → well in a square, bucket
  lifted on its rope (`at` cue "bucket") → map Modena–Bologna (~40 km) → bucket hanging in the tower today → close.
  ≥ 3 types, ≥ 1 close-up, `wc_scene` max 3 in a row.

# ag-02 — The Phaistos Disc (Shorts)

- **File:** `videos/2026-11-24/ag-02-phaistos-disc.json` · `publish_at` `2026-11-24T19:00:00-05:00` · paper `pamuk`
  (bright Cretan light, white clay; differs from keten)
- **Category:** unsolved mysteries
- **Topic:** found 1908 (VERIFY date, 3 July) by Italian archaeologist Luigi Pernier in the Minoan palace of Phaistos,
  Crete. Fired clay, ~16 cm across (VERIFY), signs stamped (not drawn) with punches in a spiral on both sides — often
  called the earliest "printed" text; 241/242 tokens, 45 distinct signs (VERIFY); dated c. 1850–1600 BC (VERIFY range).
  Unique: no other text with these signs → too little to decipher. Heraklion Archaeological Museum. Mention honest doubts
  only if sourced (some scholars questioned authenticity).
- **Viewer should feel:** "One object, signs pressed in by stamps 3,700 years ago, and nobody on Earth can read it."
- **Hook + cover:** "Nobody can read this clay disc." ↔ cover "NOBODY / CAN **READ** IT" or "**45** SIGNS / NO KEY" or
  "UNREADABLE / FOR 3,700 YEARS" (2–4 words! ≥ 3 candidates; single subject: the disc, big, spiral of signs).
- **Narration draft (writer verifies and polishes to 400–500 chars, hard max 550):**
  Nobody on Earth can read this clay disc. It was dug up in 1908, in a ruined palace on Crete called Phaistos. It's
  smaller than a dinner plate, and a spiral of tiny pictures covers both sides: heads with crests, fish, birds, a ship.
  But nobody drew them. Each sign was pressed in with a stamp, three thousand years before the printing press. There are
  forty-five different signs, and no other text like it has ever turned up. With one copy, there's no key. Subscribe for
  one unsolved mystery a day.
- **Shot ideas:** disc specimen hero (hook) → Crete map → palace ruin on a hillside with Mesara plain, 1908 dig (Pernier
  figure) → close-up of signs (head with crest, fish, ship) → a stamp pressing a sign into wet clay (new `wc_phaistos`
  type: punch + clay) → timeline: disc vs Gutenberg → "45 signs" number card → lone disc in a museum case → close.
  Must look different from ag-01 (no armies, no towers; light, airy, sea).

## Eleştiri günlüğü

## ag-01 writer

**Verified facts**
- Battle of Zappolino, 15 November 1325 (around sunset; one chronicler dates it a day later): Ghibelline Modena beat
  Guelph Bologna; the Bolognese were routed within a couple of hours and the Modenese pursued them to Bologna's walls.
  (Wikipedia "Battle of Zappolino")
- Army sizes are approximate and differ by source: Bologna ~30,000 foot + 2,000–2,500 horse; Modena ~5,000 foot +
  2,000–2,800 horse (~7,000). Narration says "some thirty thousand" / "about seven thousand". (Wikipedia, HistoryNet)
- The bucket was taken AFTER the battle: the Modenese held a palio (horse race) outside Bologna's gates and took a
  bucket from a well outside Porta San Felice. The "stolen bucket started the war" story is a legend; the real
  spark was Modena's capture of Monteveglio (Sept 1325) and long border rivalry. (Wikipedia, TheCollector, inkl;
  HistoryNet gives both versions and calls the theft-first version a legend)
- Today the bucket is shown in the Camerino dei Confirmati, Palazzo Comunale, Modena (Visit Modena); for centuries it
  was kept in the Ghirlandina tower, where a copy is shown now (Comune di Modena tourism page, inkl).
- Tassoni's mock-epic "La secchia rapita", published 1622 (only in the YouTube description).
- Sources in the JSON: Wikipedia (Battle of Zappolino), TheCollector, Visit Modena (Palazzo Comunale), HistoryNet.

**Final narration (499 chars, lint OK)**
A city still guards a stolen bucket. It's a plain oak pail, taken from Bologna in 1325. Legend says it started a war.
The truth runs backwards. In November, some thirty thousand Bolognese met Modena at Zappolino. Modena had about seven
thousand, yet Bologna broke within hours. Modena chased them to Bologna and raced horses outside its gates. Before
leaving, they took a bucket from a well. It never started the war. It was the trophy for winning it. Subscribe for
history's strangest true stories.

**Shot list** (new types and objects in `scenes/studio/shots/wc_bucket.js`: objects `bucket`, `well`, `niche`; shots
`wc_bucket_relic`, `wc_bucket_well`)

| # | Sentence | Visual | Type | Cue | Camera |
|---|---|---|---|---|---|
| 1 | A city still guards a stolen bucket. | Stone niche, two candles, the oak bucket hanging on a chain, slowly swinging (already painted: cover frame) | wc_bucket_relic | — | engine push-in |
| 2 | It's a plain oak pail, taken from Bologna in 1325. | Bucket plate; notes "oak staves", red "1325" | wc_specimen | bol "Bologna" | close-up plate |
| 3 | Legend says it started a war. The truth runs backwards. | Night, medieval skyline, stone well, soldier with lantern; bucket hauled up; red "the legend" | wc_bucket_well | start "started" (bucket rises) | wide |
| 4 | In November, some thirty thousand Bolognese met Modena at Zappolino. | Map Modena–Bologna, red route Bologna→Zappolino, battle mark | wc_map | thirty (route), zap (battle) | map |
| 5 | Modena had about seven thousand, yet Bologna broke within hours. | Dawn hills: small army left, big army right; smoke and the big army falls back at "broke"; notes 7,000 / 30,000 | wc_scene | broke | wide |
| 6 | Modena chased them to Bologna and raced horses outside its gates. | Dusk, city wall with gate and towers; two riders gallop past; "a victory race" | wc_scene | raced (riders move) | medium |
| 7 | Before leaving, they took a bucket from a well. | Day, well in front of the wall, soldier with spear; bucket rises on the rope; red "the trophy" | wc_bucket_well | bucket (rises) | medium/close |
| 8 | It never started the war. It was the trophy for winning it. | Vertical timeline: 15 Nov the battle → after the race → then the bucket (red) | wc_timeline | trophy | — |
| 9 | Subscribe for history's strangest true stories. | Title card "The Stolen Bucket", small bucket, "Modena, since 1325" | wc_title | — | — |

**Cover candidates**
- A: scene 1 (niche + hanging bucket), "STOLEN / **BUCKET**": biggest letters, same idea as the first line, one clear subject. **Chosen.**
- B: scene 2 (specimen), "WAR FOR A / **BUCKET**?": readable, but a flat plate on white paper, and the handle runs into the text.
- C: scene 7 (well), "THEY **KEPT** / THE BUCKET": the bucket is small inside the well frame, smaller letters, and the note line clutters it.

Known weak spot: the map (scene 4) reads pale/foggy at this zoom (inland region, no coastline); the markers and route are legible.

## ag-02 writer

**Verified facts** (Wikipedia "Phaistos Disc"; National Geographic "This ancient script has remained unsolved for over a century"):
- Found 3 July 1908 by Italian archaeologist Luigi Pernier (Halbherr's mission) in the Minoan palace of Phaistos, Crete. (Both sources)
- Fired clay, about 16 cm across (15.8–16.5 cm), about 2 cm thick. (Wikipedia; NatGeo 16.5 cm)
- 45 distinct signs, 241 or 242 tokens, a spiral on each side; each sign pressed in with a separate stamp, the spiral and dividers scored with a stylus. (Both)
- Date disputed: c. 1850–1600 BC (Duhoux), NatGeo c. 1700 BC / 1800–1600 BC; some put it as late as c. 1400 BC. Narration says "about three thousand years before Gutenberg" (safe for the whole range); timeline card says "c. 1700 BC".
- Undeciphered, no other text in this script; Heraklion Archaeological Museum. Forgery claims exist (Eisenberg) but it is generally accepted as authentic. Not mentioned in the narration.
- Sign names: PLUMED HEAD, SHIP, ROSETTE, SHIELD; the fish is "tunny", birds are "eagle/dove". Painted signs are invented shapes inspired by these, not replicas.

**Final narration (495 chars):**
Nobody on Earth can read this disc. In 1908, archaeologist Luigi Pernier dug it out of a palace ruin on Crete. Tiny pictures spiral over both sides: plumed heads, fish, a ship. But nobody drew them. Each sign was pressed into the clay with a stamp. That was about three thousand years before Gutenberg. There are forty-five different signs. No other text like it has ever turned up. Someone made stamps to print copies, yet only one has ever been found. Subscribe for one unsolved mystery a day.

**Shot list** (palette `pamuk`; new file `scenes/studio/shots/wc_phaistos.js`: objects `phaistos_disc`, `phaistos_sign`, `phaistos_stamp`; shots `wc_phaistos_disc`, `wc_phaistos_signs`, `wc_phaistos_stamp`)

| # | Sentence | Visual | Type | Cue | Camera |
|---|---|---|---|---|---|
| 0 | Nobody on Earth can read this disc. | Disc face on, big, standing on a table, turning very slowly | wc_phaistos_disc (hero) | — | engine push-in; cover |
| 1 | In 1908, archaeologist Luigi Pernier dug it… | Cretan hillside ruin, Pernier kneeling, small disc paints in | wc_scene | dug | wide |
| 2 | Tiny pictures spiral over both sides… | Close on the clay: plumed head, fish, ship stamp in one by one, named in pen | wc_phaistos_signs | head/fish/ship | close-up |
| 3 | But nobody drew them. Each sign was pressed… | Hand presses a stamp into a blank disc, lifts, new sign; red "stamped, not drawn" | wc_phaistos_stamp | press | close |
| 4 | That was about three thousand years before Gutenberg. | Vertical timeline c. 1700 BC → 1450s | wc_timeline | gut | — |
| 5 | There are forty-five different signs. | "45" counting up, one stamped sign above | wc_number | — | — |
| 6 | No other text like it has ever turned up. | Map of Crete, red X at Phaistos "the only one" | wc_map | other | — |
| 7 | Someone made stamps to print copies, yet only one… | Disc alone in a glass case, pool of light, dust; red "one copy" | wc_phaistos_disc (museum) | one | — |
| 8 | Subscribe for one unsolved mystery a day. | Title card "The Phaistos Disc", "Crete · still unread" | wc_title | — | — |

**Cover candidates:** (A) "NOBODY CAN / **READ** IT", scene 0 hero disc. (B) "**45** SIGNS, / NO KEY", scene 2 close-up (pen labels clash with the text, busy). (C) "STILL / **UNREAD**", scene 7 museum (darker, disc smaller).
**Choice: A.** It matches the first sentence, has one clear subject and reads best small.

### ag-02 — round 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 9 | 7 | 6 | 7 | 7 | 5 | 6 | 9 | 8 | 8 |
1. Scene 3 (wc_phaistos_stamp) looks like clip art: the "hand" is a flat blue rectangle with a blob, the stamp is a tiny box that is out of scale with the signs, the subtitle (y ~1250) sits on top of the disc's groove rings, and the red note "stamped, not drawn" is small and sits in the top-left corner, which must stay empty. Fix: paint a real close-up hand (fingers, washed sleeve cuff, wet-edge strokes) gripping a carved wooden stamp whose face shows the plumed head, at roughly the size of the sign it leaves. Move the disc plane up so the 1170–1320 band falls on a plain clay or table margin (or fade the rings there). Move the note to x 0.5–0.7, y ~0.1, size ≥ 60. The ruin walls in scene 1 (wall `broken`) also read as flat grey boxes; use irregular painted stones or drop the wall and let the column stumps and rocks carry the ruin.
2. Visual ≠ narration in scene 2 (wc_phaistos_signs): the narration says "both sides", but one band of one side is shown. The third label ("ship") is still only a pen stroke when "ship" is spoken, and in the first ~1.5 s the band is empty apart from the old signs, under a subtitle that crosses a groove line. Fix: show the two faces (A and B) side by side, small, with the three new signs stamping into one of them, or change the text to "Tiny pictures spiral across it: plumed heads, fish, a ship." Make each label finish writing ≤ 0.5 s after its cue, and keep the subtitle band clear of groove lines.
3. Too long, and the title's promise ("Why can nobody read it?") is never answered: ~37.6 s (target 28–35) at 495 chars. "There are forty-five different signs." is a loose stand-alone fact. Fix: merge scenes 5+6 into one line that gives the reason, e.g. "Forty-five signs, and not one other text to check a guess against." (keep the map, change the X label to "no second text"; or keep the wc_number and drop the map). Trim scene 1 to "In 1908, Luigi Pernier dug it out of a palace ruin on Crete." Target ≈ 450–465 chars, ≤ 35 s. Minor: the scene 7 subtitle sits on the light plinth (low contrast), so lift the plinth top below y 1320 or darken it. The hero/cover frame's lower 40% is empty table; add a soft cast shadow or a table-edge wash.

### ag-01 — round 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 7 | 7 | 6 | 6 | 6 | 9 | 8 | 8 |

Lint OK. Preview: 37.8 s, 499 chars (Shorts target is 28–35 s). Facts check out (Wikipedia: Bologna about 32,000 including cavalry vs Modena about 7,000, routed in about 2 hours, race/palio outside the walls, bucket taken from a well, original now in the Palazzo Comunale). "Some thirty thousand" and "about seven thousand" are safe.

1. **Length and repetition (Tempo, Senaryo).** At 37.8 s the Short runs past 35 s, and scenes last 3.6–4.8 s. "Bologna" is said 5 times and "Modena" 4 times; "Modena chased them to Bologna" is clumsy. → Cut to about 440–455 chars: S2 "A plain oak pail, taken from Bologna in 1325." · S4 "Some thirty thousand Bolognese met Modena at Zappolino." · S5 "Modena had seven thousand. Within hours, Bologna broke." · S6 "The victors chased them home and raced horses at the gates." · S7 "Then they took a bucket from a well." Keep S1, S3, S8 and S9. Re-check that the cues still match (thirty, zap, broke, raced, bucket).
2. **Scene 4 (wc_map) is weak.** It is pale green fog with a strange diagonal stripe of triangle hill glyphs at the lower left, and Zappolino (the place the narration names) only appears as a red blob in the last instant, with no label. → Tighten `region` to about [10.85, 44.38, 11.45, 44.72] so the three places paint larger. Give Zappolino `at: 0.3` so its label and battle mark paint early, and have the route grow to it on "thirty". Lower the fog/`paint` wash, or crop out the hill-glyph stripe.
3. **Scene 5 sun clash, and scene 7 repeats scene 3.** In S5 the red dawn sun sits right on the "30,000" leader line between the red banners and reads as a target. → `"sun": false`, or `"sun": {"x": 0.9, "y": 0.12, "r": ...}` clear of the note. S7 reuses S3's layout (centred well, lone soldier to one side, the same bucket rise), so the payoff shot looks like a repeat. → Make S7 a close-up (`"camera": {"focus": [~620, ~760], "zoom": 1.9}` on the well mouth, a bigger `bucket_s`, the soldier's hand at the rope) so the trophy moment has a new shot size. Minor: the bucket sprite has a white paper-rim outline (cover, S1, S2) that looks like a sticker or clip art. Soften it into a wash edge.

### Fix round 1 (writer)
- **Text:** cut from 499 to 455 characters (preview about 34–35 s, was 37.8 s). S2 "A plain oak pail, taken from Bologna in 1325." ·
  S4 "Some thirty thousand Bolognese met Modena at Zappolino." · S5 "Modena had seven thousand. Within hours, Bologna
  broke." · S6 "The victors chased them home and raced horses at the gates." · S7 "Then they took a bucket from a well."
  S1, S3, S8 and S9 are unchanged. Bologna is now said 3 times and Modena 2. The cues still match (bol, start, thirty, broke, raced, bucket, trophy).
- **Scene 4 map:** region tightened to [10.85, 44.38, 11.45, 44.72], `mountains: false` (the hill-glyph stripe is gone), land
  `ground`, paint .6, larger place labels. Zappolino's battle mark and name now paint at 0.3, and the red route grows to it on "thirty".
  The map's own pale land wash is still there (it is the wc_map style at this zoom; that is shared code, so I did not touch it).
- **Scene 5:** `sun: false`, so nothing sits on the "30,000" leader line any more.
- **Scene 7:** new close-up (`camera` focus [600, 780], zoom 1.55; 1.9 cropped the roller and pushed the parapet into
  the subtitle band). Bigger bucket (`bucket_s` .55). The person is removed: a soldier's forearm in a blue sleeve reaches in from the right
  and his hand grips the rope above the bucket as it rises (new `hand: true` in `wc_bucket_well`, sprite baked once).
  "the trophy" now sits left of the bucket, fully on screen.
- **Watercolor:** the well now has dry-brush strokes across the stones, moss/damp blooms and grain strokes on the posts.
  The well has a solid paper underlay, so the wall no longer shows through it. The bucket's solid underlay is now eroded
  inside the painted edge, so the white "sticker" rim around the bucket is gone (cover, S1, S2). The army, wall, tower and
  rider drawings come from the shared libraries (`wc_g_people.js`, `wc_g_places.js`); I can't change those in parallel.
- **Cover:** kept "STOLEN / BUCKET" (scene 0); it now has no white rim.
- Lint OK (0 errors, 0 warnings). Preview estimate about 34 s, 455 characters, no STATIC scenes.

### Fix round 1 (writer) — ag-02
- **Text:** cut from 495 to 461 characters; preview now about 34 s (was 37.6 s). Changes: S1 "In 1908, Luigi Pernier dug it out of a palace ruin on Crete." ·
  S2 "Tiny pictures spiral across it: plumed heads, fish, a ship." (the "both sides" claim is gone) · S3 "…pressed in with a stamp." ·
  the 45-signs line now gives the reason the title promises: "Forty-five different signs, and not one other text to check a guess against."
  The map scene was dropped. The number card now carries it: label "signs, no second text". 8 scenes, 6 types.
- **Stamp scene, rewritten (`wc_phaistos_stamp`):** a painted right hand comes in from the right: sleeve with folds, a pale cuff, the back of the hand, four
  fingers with edges, nails and knuckle creases, and the thumb. It holds a round carved wooden stamp, first tilted to show its face: the plumed head in
  relief, mirrored, about the size of the sign it leaves. The stamp turns upright, presses on "pressed", lifts away, and the sign is left beside four
  earlier ones. The disc has been moved up, so its front edge sits at y ≈ 1170 and the subtitles fall on the plain table. The note is now at x .6, y .075, size 66.
- **Signs close-up:** in the first 1.5 s the lower turn fills itself sign by sign (no static opening). The labels now finish 0.45 s after
  their sign starts. The ship paints in time. The third groove ring is removed, so no groove crosses the subtitle band.
- **Scene 1:** the box-like walls are gone. The ruin is now column stumps and an architrave, irregular rocks, and a shrub and grass in the foreground.
- **Minor:** the museum plinth top has moved to y ≈ 1345 (below the subtitles; behind the text is the lit glass case and the thin stand). The hero/cover table gets
  a long soft cast shadow, wood grain and a darker front edge. Lint OK (SEO 100), no STATIC?, no cue warnings. The cover is unchanged ("NOBODY CAN / READ IT").

### ag-01 — round 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 7 | 8 | 7 | 7 | 7 | 7 | 9 | 8 | 8 |

Lint OK. 455 chars, about 35 s. The narration is tighter and the Bologna/Modena repetition is gone. The map now shows Zappolino's label, the battle mark and the route. The S5 sun is gone. S7 is a real close-up with a new shot size. The bucket's halo is softer. **Passes (all ≥ 7, cover 8).** Watercolor stays at 7 because the armies, walls and towers are flat shared-library figures. Optional polish if time allows:
1. S7 (well close-up): the subtitle band (y ≈ 1170–1320) lies across the well's stone drum. → Shift `camera.focus` down to about [600, 900], or lower zoom to about 1.4, so the well mouth and the bucket sit above y ≈ 1100 and the band covers only grass.
2. S6 (race): a horse fragment pokes in at the left edge in the first frames before "raced", and the striped red dusk sun reads as a graphic disc. → Start the riders at x ≤ -0.3 / -0.55, and use `"sun": false` or a softer, smaller sun.
3. S4 (map): the lower half is still an empty fog wash. → Move the region's lower edge up (lat min about 44.32), or lower the `paint` fog, so the three places fill y 300–1100.

### ag-02 — round 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 8 | 7 | 7 | 7 | 8 | 9 | 8 | 8 |
**Passes** (all ≥ 7, cover 8, lint OK, 461 chars, ~34 s). The round 1 problems are fixed: painted hand + carved stamp, subtitles on clear table/clay, note top-centre, ruin redrawn as stones + columns, all three sign labels written on cue, the "why" answered ("not one other text to check a guess against"). Optional polish, not blocking:
1. Scene 4 (wc_timeline): the red highlight blob sits over the "BC" of "c. 1700 BC". Move the year label left, or shrink or offset the blob.
2. Scene 5 (wc_number): the frame is mostly bare paper, and "no second text" is only a small note. Could add a faint empty clay outline (a "missing second disc") beside the stamped sign to make the reason visible.
3. Scene 6 (museum): the subtitle crosses the bottom edge of the glass case and the stand pole, so it reads less cleanly. End the case above y ~1150.

### Polish (writer)
- Scene 7: camera focus [600, 900], zoom 1.4. The well mouth, bucket, hand and "the trophy" now sit above y ≈ 1100; the subtitles run over the grass.
- Scene 6: riders start at x -0.5 / -0.75 (move 3 s), so no horse shows before "raced"; the striped red sun is removed (`sun: false`).
- Scene 4: region [10.88, 44.30, 11.40, 44.72]; Modena, Bologna and Zappolino now span y ≈ 320–900. The paler land under the subtitles is the shared wc_map fade.
- Narration unchanged (455 characters, about 34 s). Lint OK, preview checked.

### Polish (writer) — ag-02
- Scene 4 timeline: removed `highlight`, so the red blob no longer covers "BC"; both marks are ink now.
- Scene 5 (45 card): new object `phaistos_pair` in `wc_phaistos.js`: the stamped plumed-head patch with, beside it, a dashed ghost
  outline of a second disc (faint wash, empty spiral) standing for the missing second text; vignette `s` 1.6.
- Scene 6 museum: the case and stand now end on the plinth at y ≈ 1123 (subtitles sit on the pale plinth, clear of the glass edge and pole);
  disc raised (cy .33), plinth lighter with softer shading. Narration unchanged (461 chars, ~34 s). Lint OK (SEO 100), preview clean.
