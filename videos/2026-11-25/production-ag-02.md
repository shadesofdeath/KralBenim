# ag-02 — The fork that scandalised Venice (writer notes)

File `videos/2026-11-25/ag-02-scandalous-fork.json` · Short · palette `gurub` · publish_at `2026-11-25T19:00:00-05:00`
(Istanbul 26.11 03:00) · new scene code `scenes/studio/shots/wc_fork.js` (objects `fork`, `fork_plate`, `fork_morsel`;
shot `wc_fork_lift`).

## Verified facts
| Fact | Source |
|---|---|
| In 1004 Maria Argyropoulina (niece of Basil II) married Giovanni Orseolo, son of Doge Pietro II Orseolo (wedding in Constantinople) | Wikipedia — Maria Argyropoulina; Smithsonian ("Greek niece of the Byzantine emperor … married the son of Venice's doge") |
| She died in 1006 or 1007 with her husband and son when plague swept Venice | Wikipedia — Maria Argyropoulina; Country Life (death from plague) |
| Peter Damian (c. 1059) wrote of an unnamed Byzantine "Venetian doge's wife" who would not touch food with her fingers; eunuchs cut it, she raised the pieces with "a certain golden instrument with two prongs"; he presented her horrible death as divine punishment | Wikipedia — Theodora Doukaina Selvo (footnote quoting Damian) |
| Attribution: later chroniclers (Dandolo, Sanudo) pinned it on Theodora Doukaina Selvo (1070s), but Damian died 1072 and wrote c. 1059 → "probably" Maria Argyropoulina | Wikipedia — Theodora Doukaina Selvo. **Script never names her** (safe: "a Byzantine princess", 1004 = Maria's wedding) |
| Coryat toured Europe 1608, published *Coryat's Crudities* 1611 praising Italian fork use; mocked as "Furcifer" (fork-bearer) | Wikipedia — Thomas Coryat; Country Life; Smithsonian ("ridiculed") |

Not used (unsure/myth): the "God gave us natural forks — fingers" line (Smithsonian attributes it vaguely to "one
Venetian"); Catherine de' Medici bringing forks to France; any direct Damian quote (letter card is a paraphrase).
Note: Damian calls her "the doge's wife" (Giovanni was co-doge); narration says "son of Venice's doge", both true.

## Narration (478 characters; preview estimate ~36 s, TTS usually a little faster)
A fork once shocked a whole city. In 1004, a Byzantine princess married the son of Venice's doge. She refused to eat
with her fingers. Servants cut her food, and she ate it with a two-pronged golden fork. To Venice, it looked like
vanity. Then plague took her, her husband and their son. A churchman called it God's punishment. In 1611, an
Englishman was still mocked for using one. The fork won. It just took six centuries. Subscribe for the strange origins
of everyday things.

## Shot list
| # | Sentence | Visual | Type | Cue | Camera |
|---|---|---|---|---|---|
| 0 | A fork once shocked a whole city. | Candlelit table, red cloth: a hand in a deep-blue sleeve with a gold pearl cuff holds up the golden two-pronged fork with a morsel, dish of morsels (steam) below, candle left | `wc_fork_lift` (hero) | — | slow rise of the fork + motor push-in |
| 1 | In 1004, a Byzantine princess married the son of Venice's doge. | Map Adriatic–Aegean, Constantinople, red route with ship to Venice (star) | `wc_map` | ven = Venice | — |
| 2 | She refused to eat with her fingers. | Rose hall: princess (wine gown, gold scarf) at the end of a laid table, two candles, goblet, servant; red note "never with fingers" | `wc_scene` interior | fing = fingers | — |
| 3 | Servants cut her food, and she ate it with a two-pronged golden fork. | Close table top: the hand brings the fork down, spears a morsel, lifts it upright; note "two prongs" | `wc_fork_lift` | lift = ate, gold = pronged | focus [540, 820] ×1.1 |
| 4 | To Venice, it looked like vanity. | Golden fork plate: notes "gold", red "vanity" | `wc_specimen` | van = vanity | — |
| 5 | Then plague took her, her husband and their son. | Night lagoon, Byzantine-domed church, far city, boat with lantern, fog; red "plague" | `wc_scene` night sea | pl = plague | — |
| 6 | A churchman called it God's punishment. | Manuscript, paraphrase of Damian, signed "Peter Damian", "c. 1059" | `wc_letter` | pun = punishment | — |
| 7 | In 1611, an Englishman was still mocked for using one. | Daylight room, traveller in cape and plumed hat at a table with a dish and silver fork, two men pointing; red "Furcifer!" + "fork-bearer" | `wc_scene` interior | mock = mocked | — |
| 8 | The fork won. It just took six centuries. | Timeline 1004 Venice: a scandal / 1611 England: mocked / today: every table (red) | `wc_timeline` | won = won | — |
| 9 | Subscribe for the strange origins of everyday things. | Title "The Sinful Fork", small golden fork, "Venice, 1004" | `wc_title` | — | — |

Types: 7 different (fork_lift ×2, map, scene ×3 non-consecutive, specimen, letter, timeline, title).

## Cover
Candidates (all rendered and compared at phone size):
- A — "A **SINFUL** / FORK", scene 0 t 1.6 (hand holding the fork up with a morsel, candle) → **chosen**: shortest,
  biggest letters, a single subject, matches the first sentence ("shocked").
- B — "THE FORK WAS / A **SCANDAL**", scene 0 → same image, smaller letters at 4 words; less punchy.
- C — "**SINFUL** / FORK", scene 4 specimen → the text overlaps the prongs, a plain plate with no hook.

## SEO
Title "Fork History: Why Was Eating With One a Sin?" (tags[0] "fork history"), category 28, #shorts #historyofthefork
#stickstory. Lint: OK, 0 errors, SEO 100.

## Known weak spots
- Estimated length ~36 s (478 characters, inside 400–500); if the real TTS runs long, cut "Then" or shorten the CTA.
- Scene 0 motion is 0.3 (just at the threshold): a slow rise, sway, candle flame and steam.
- Scene 2 and 7 figures are the library's faceless people at medium size; the princess reads as "a woman in a wine
  gown", not specifically Byzantine royalty.
- Scene 7: the silver fork lying on the table is small at phone size; the note "Furcifer!" carries the beat. The window
  sill meets the table edge.
- Scene 5 uses the Byzantine-church object (Hagia Sophia-like) to stand for Venice (San Marco is Byzantine-style, but
  it is not a true likeness).

### ag-02 — round 1 (critic)
Lint OK (0 errors). Preview: 10 scenes, ~36.8 s estimated (above the 28–35 s target), 478 chars; motion all ≥ 0.3 (scene 0 exactly 0.3).
Facts spot-checked (Wikipedia: Maria Argyropoulina, Theodora Doukaina Selvo, Thomas Coryat): 1004 wedding, plague death of wife/husband/son, Damian's two-pronged golden instrument + divine punishment, Coryat 1611 "Furcifer" — all hold.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 6 | 6 | 7 | 6 | 6 | 7 | 7 | 8 | 8 |

1. **Scene 1 (map) + scene 5 (lagoon): labels/props clash with frame and subtitles.** On the map "Venice" is clipped by the left frame edge for the whole scene ("Venii"), "Constantinople" touches the right edge, the route runs over "Adriatic", and the lower ~40 % of the frame is empty fog. In scene 5 the lantern (x 0.765, y 0.665) floats in mid-air, detached from the boat, sitting right on the subtitle line ("their son."). → Map: widen/shift `region` west and south (e.g. [7.5, 34.5, 31.5, 47.5]) or set Venice `align: "right"` with enough margin so both city names sit ≥ 60 px inside the frame; move "Adriatic" off the route. Scene 5: put the lantern on the boat's bow (y ≈ boat deck) or drop it; keep the boat itself above y 1150 or below the subtitle band.
2. **Scene 2 (and 7): the key beat is not shown.** "She refused to eat with her fingers" shows a tiny faceless woman standing away from an empty table; she is not eating, there is no food, no hands, and the note "never with fingers" is still writing when the scene ends (only "never with" readable at 9.6 s). The bottom ~45 % is bare floor. Scene 7 has the same small-figure/empty-floor problem and the fork is invisible at phone size. → Scene 2: medium shot — the princess seated at the table, plate in front of her, a servant at her side cutting; scale figures up (s ≈ 2.4–2.6, horizon ~0.72) so the subject fills y 300–1150; shorten the note to "no fingers" with `at` earlier (e.g. 0.3) so it finishes. Scene 7: raise the scale/zoom (camera focus on Coryat + plate, zoom ~1.6) so the fork reads.
3. **Watercolor quality + scene 5/6 fidelity.** The hand/sleeve in scenes 0 and 3 and the people in scenes 2/7 read as flat digital vector fills (hard outlines, uniform colour, no granulation/edge blooms), so criterion "Suluboya" ≤ 6. Scene 5 shows a Hagia Sophia-type mosque-like building as "Venice" — viewers will read it as Istanbul. Scene 6 presents an invented sentence ("God struck her down.") as a signed Peter Damian letter with a seal. → Give `wc_fork.js` hand/sleeve layered washes (WC wash + dry-brush strokes, softer edges, paper-white highlights) instead of solid fills. Scene 5: use a Venetian lagoon look (campanile/`skyline` medieval in front, low domes, no Hagia Sophia minaret-less massing) or keep only skyline + boat in fog. Scene 6: either quote Damian's real words (e.g. his line about the "golden instrument with two prongs") or remove the signature/seal and mark it as a summary (style without "sign", date "Peter Damian, c. 1059" as source). Also trim ~2 s to reach ≤ 35 s (e.g. "Then plague took her, her husband and son." / CTA "Subscribe for more strange origins.") and consider aligning the hook with the cover: "Eating with a fork was once a sin." ↔ "A SINFUL FORK".

### Fix round 1 (writer)
1. **Map (scene 1):** region [7.5, 34.5, 31.5, 47.5]; Venice drawn at 1.0 s (fully written, star + name inside the
   frame), Constantinople aligned left, route moved to the Adriatic's eastern side, "Adriatic" label west of it,
   "Mediterranean" added in the lower sea. **Lagoon (scene 5):** church and floating lantern removed; medieval
   skyline + tall square campanile in fog, lone rowing boat below the subtitle band.
2. **Scene 2:** medium shot (camera focus [540, 880] × 1.35): the princess seated behind the laid table (s 2.6),
   dish of cut food in front of her (fg layer), goblet, two candles, a robed servant beside her (s 2.2); note "no
   fingers" at 0.3 s, finished. Horizon kept at 0.6 (0.66+ triggers the lint warning). The servant stands rather than
   cuts: the library has no knife/cutting pose (known weak spot). **Scene 7:** camera focus [460, 880] × 1.3 (1.6 cut off
   the mockers and the notes); "Furcifer!" + "fork-bearer" moved into frame; dish + fork on the table now read.
3. **Watercolor (wc_fork.js):** sleeve = pale wash + second wash + granulating patches + dry-brush folds + paper-white
   light streaks + pooled dark shadow edge, light ink only on the shadow side; cuff with a darker band and glint; hand =
   three layered skin washes, knuckle lights, pooled finger creases (no hard ink outline). Sleeve now deep blue
   (clothB) so it separates from the red cloth. **Scene 6:** now Peter Damian's real chapter title (English translation
   as given on Wikipedia, Theodora Doukaina Selvo): "Of the Venetian Doge's wife, whose body, after her excessive
   delicacy, entirely rotted away." signed Peter Damian, c. 1059. No invented sentence.
4. **Length:** 452 characters, estimate ~34 s (was 478 / ~36.8 s). Hook now "Forks were once called sinful." (5 words,
   matches the "A SINFUL FORK" cover; honest: Damian condemned her luxury as sinful). "her husband and son";
   CTA "Subscribe for more everyday origins."
   Scene 0 motion raised (fork rises 110 px with a slow sway): 0.4, no STATIC flags.

Final narration (452): Forks were once called sinful. In 1004, a Byzantine princess married the son of Venice's doge.
She refused to eat with her fingers. Servants cut her food, and she ate it with a two-pronged golden fork. To Venice, it
looked like vanity. Then plague took her, her husband and son. A churchman called it God's punishment. In 1611, an
Englishman was still mocked for using one. The fork won. It just took six centuries. Subscribe for more everyday origins.

Lint: OK (0 errors, 0 warnings, SEO 100). Preview: 10 scenes, ~34 s, sheet.png + cover.jpg checked.
Remaining weak spots: library people are still simple faceless figures (scenes 2, 7); no cutting action for the
servant; Constantinople label sits close to the right edge on the map (readable).

### ag-02 — round 2 (critic)
Lint OK (0 errors). Preview ~35.0 s (at the upper limit), 452 chars, motion ≥ 0.4 everywhere, no STATIC.
Letter card verified: Wikipedia (Theodora Doukaina Selvo) gives Damian's chapter title "De Veneti ducis uxore quae prius
nimium delicata, demum toto corpore computruit", translated exactly as on the card; work dated c. 1059 → OK.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 7 | 7 | 7 | 7 | 7 | 8 | 7 | 8 |

**Passes** (all ≥ 7, cover 8). Remaining polish, optional for round 3:
1. Scene 7: the second mocker (peasant, x 0.87) is cut off by the right frame edge at zoom 1.3 — only his arm shows. → move him to x ≈ 0.78 or drop him (one pointing man is enough).
   Scene 2: the robed servant is also half-clipped at the right edge → x ≈ 0.82.
2. Scenes 0/3 (cover hand): the hand still reads as a smudgy pink blob with no readable fingers, and the fork is a flat
   uniform fill → define 3–4 finger shapes with darker crease washes; add a wet-edge/highlight stroke along the fork shaft.
3. Length 35.0 s is at the cap; real TTS may run over → trim one word ("Then plague took her…" → "Plague took her…") as insurance.
   Scene 1 map: lower ~40 % of the frame is still empty fog under the subtitle; consider `paint`/region taller so sea fills to y ≈ 1500.

### Polish (writer)
- Scene 7: the second (cut-off) pointing man removed; the remaining mocker at x 0.68, fully in frame with the notes.
- Scene 2: servant moved to x 0.76, now whole in the zoomed frame.
- wc_fork.js: a darker crease wash under each of the four fingers (on top of the pooled crease lines); paper-white
  light strokes running down the golden handle (scenes 0, 3, 4, 9).
- Plague line now "Plague took her, her husband and son." → 447 characters, estimate ~33 s.
- Map (scene 1): not changed. The fade below y ≈ 1100 is built into wc_map (a shared file, off-limits); left as is.
Lint OK (0 errors, 0 warnings, SEO 100); preview re-run, sheet.png + cover.jpg checked (cover unchanged, A SINFUL FORK).
