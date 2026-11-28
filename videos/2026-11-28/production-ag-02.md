# ag-02 — Sweden's February 30th, 1712 (Stickstory Short)

- **File:** `ag-02-february-30-sweden.json` · `publish_at` `2026-11-28T19:00:00-05:00` (29.11 03:00 Istanbul) · paper `keten`
  (cold linen: northern winter; previous Stickstory paper `yaz`, ag-01 today `gurub`)
- **Category / pool:** history's strangest moments
- **Topic:** Sweden's gradual Julian → Gregorian plan (1700), the skipped leap day of 1700, the leap days of 1704 and
  1708 kept anyway during the Great Northern War, Charles XII's return to the Julian calendar and the extra day,
  30 February 1712.
- **Viewer feels at the end:** delighted disbelief — a whole country lived a date that "doesn't exist", because a plan
  to make things easier made them harder.
- **Hook / cover:** first line "Sweden once had a February 30th." (6 words) ↔ cover "FEBRUARY / 30" (highlight 30), over
  the almanac page with a red-ringed 30.

## Narration (one piece, written before the shots; 492 characters, round 2)

Sweden once had a February 30th. In 1700, it began easing into the new calendar, skipping leap days. So February
lost its 29th. But with Sweden at war, 1704 and 1708 kept their leap days. Now Sweden matched no one. King Charles the
Twelfth gave up. Going back to the old calendar meant adding a day. In 1712, February got a 29th, and a 30th. One
almanac marked it with one word: added. Sweden tried to lose days quietly, and invented one instead. Subscribe for a
strange true story every day.

Read-aloud check: no inverted sentences, no hype phrases, past tense, short + longer sentences alternate, every
sentence leads to the next (plan → skip → war breaks it → mismatch → king gives up → extra day → proof → irony).
"Only February 30th ever" deliberately avoided (the Soviet revolutionary calendar of 1930–31 also had a nominal
30 February). The 1753 final switch is in the description, not the narration (budget). The war had begun in 1700, so
the line says the leap days were kept "with Sweden at war", not that war "came" afterwards.

## Shot list (round 2: 11 scenes)

| # | Sentence | Visual | Type | Painted | Cue | Camera |
|---|---|---|---|---|---|---|
| 0 | Sweden once had a February 30th. | Almanac page centred on a desk, candle at its right: big rows 29 and red 30; red wash spreads and a red ring draws round the 30 over 0–1.5 s; "1712" | `wc_feb30_page` (new) | page, wash, ring, candle | — | cover focus [540, 900] zoom 1.25 |
| 1 | In 1700, it began easing into the new calendar, skipping leap days. | "The plan": 11 leaves "29 FEB" 1700–1740 paint in, red crosses sweep over them, "= 11 days" in the 12th cell | `wc_feb30_leaps` (new) | leaves, crosses, note | skipping | plate |
| 2 | So February lost its 29th. | Page "FEBRUARY 1700", rows 23–29; red strike through 29, the row washes away, "skipped" | `wc_feb30_page` | strike, wash-out | lost | medium |
| 3 | But with Sweden at war, 1704 and 1708 kept their leap days. | Snowy plain, storm sky: a Swedish soldier in blue with a musket, a blue column with banners, cannon smoke; red note "1704, 1708: kept" (clear of the musket) | `wc_scene` | soldier, army, smoke, snow | war | wide |
| 4 | Now Sweden matched no one. | Map: Sweden + Finland wash red, red hand note "own calendar" in the wash; "new calendar" on Norway (Denmark–Norway), "old calendar" on Russia proper; Stockholm star | `wc_map` | wash, labels, star | Sweden | map |
| 5 | King Charles the Twelfth gave up. | Dusk at Bender: plain canvas ridge tent with a blue pennant (new `feb30_tent`), the king in a blue coat, a scribe writing; "Bender, 1711" | `wc_scene` | tents, king, scribe | Charles | wide |
| 6 | Going back to the old calendar meant adding a day. | "24 hours" counting up, "added to February" | `wc_number` | number | adding | card |
| 7 | In 1712, February got a 29th, and a 30th. | Page "FEBRUARY 1712" rows 25–30; 29 writes in, then 30 in red with a red wash | `wc_feb30_page` | rows 29, 30 | 29th / 30th | medium |
| 8 | One almanac marked it with one word: added. | Plate: torn almanac strip 28 / 29 / red 30, red note "added", "Feb 1712" | `wc_specimen` + `feb30_leaf` | strip, notes | added | close-up plate |
| 9 | Sweden tried to lose days quietly, and invented one instead. | Stockholm winter dusk: snow, a stone church, a pine, a walker with a lantern; red "30 February 1712" | `wc_scene` | church, walker, snow | invented | wide |
| 10 | Subscribe for a strange true story every day. | Title card "February 30, 1712", "Sweden's extra day", almanac strip (s 1.2) | `wc_title` | strip | — | card |

New code: `scenes/studio/shots/wc_feb30.js` (shots `wc_feb30_page`, `wc_feb30_leaps`; objects `feb30_leaf`, `feb30_tent`). No shared file touched.

## Cover candidates

| | Text | Scene / framing | Verdict |
|---|---|---|---|
| A (r1) | FEBRUARY / **30** | 0, rows 26–30 page, zoom 1.25 | page under the title, but the ringed 30 small in the corner |
| A2 (r1 choice) | FEBRUARY / **30** | 0, rows 28–30 edge-to-edge page, zoom 1.45 | critic: page off the right edge, empty desk below → 7 |
| B | SWEDEN'S / **EXTRA** DAY | 7 (almanac strip, "added") | weaker claim, brush digits less period |
| C | **30** DAYS IN / FEBRUARY | 6 / 5.0 | the 30 not yet painted; busy small rows |
| D (r2) | FEBRUARY / **30** | 0, rows 28–30, focus on the 30, zoom 1.6 | 30 bigger, but the page is cut on both sides, candle gone |
| **E (r2 choice)** | FEBRUARY / **30** | 0, rows 29 + red 30 only (number 190 px), whole page centred, candle at right, zoom 1.25 | biggest 30, centred under the title, one subject, page complete |

## Fact check

| Claim | Source |
|---|---|
| Nov 1699 Sweden decided to move to the Gregorian calendar gradually by omitting leap days 1700–1740 | Wikipedia "Swedish calendar"; Högman |
| 1700 was not a leap year in Sweden | timeanddate "February 30"; Wikipedia; Högman |
| 1704 and 1708 remained leap years (by error; the Great Northern War, begun in 1700, stopped further adjustments) | timeanddate ("by error"); Wikipedia ("Great Northern War", citation needed); phrased as "with Sweden at war, ... kept their leap days" |
| Sweden was then one day ahead of the Julian and ten days behind the Gregorian calendar ("matched no one") | arithmetic from the above; Wikipedia |
| Charles XII (from Bender, January 1711) ordered the return to the Julian calendar | Wikipedia; Högman |
| An extra day in 1712: February had 30 days | all four sources |
| A 1712 Swedish almanac printed "Tillökad" ("added") beside the 30 (also "Snöö", a snow forecast) — hence "One almanac marked it with one word: added" (the word beside the 30), not "said only" | Tøndering |
| Final switch 1753: 17 February followed by 1 March (description only) | Wikipedia; Högman; Swedish-Finn Historical Society |
| Soviet calendar 1930–31 had a nominal 30 February → "only February 30th ever" NOT claimed | timeanddate |

Sources in JSON: Wikipedia Swedish calendar, timeanddate February 30, Tøndering 30 February, Hans Högman.

## Critique log

### ag-02 — round 1
| Script | Hook | Readability | Visual=narration | Motion | Composition | Watercolour | Flow | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 6 | 6 | 7 | 8 | 7 | 8 | 7 |
1. Scene 0 / cover: page off the right edge ("1712" a lone "1"), empty lower desk, static → page shrunk to rows 29–30 and centred (ringed 30 at y ≈ 1000), candle beside it, red wash spreads + ring draws over 0–1.5 s; new candidate E chosen (see table).
2. Scene 4 map: labels on the coast / clipped, "Baltic Sea" buried, "old calendar" on Swedish Livonia → red hand note "own calendar" inside the wash, "new calendar" on Norway, "old calendar" on Russia proper (lon 34.5, lat 61), "Baltic Sea" dropped, Stockholm star painted after the wash.
3. Narration: "labelled it: added" → "marked it with one word: added"; "Then war came" → "But with Sweden at war"; scenes 1 and 6 split (new `wc_number` "24 hours" for "Going back to the old calendar meant adding a day."); 492 characters, lint without warnings.
Smaller: "= 11 days" now painted in the 12th cell; scene 3 note moved to x .62 y .16; scene 5 circus tent replaced by a plain canvas ridge tent (`feb30_tent`); title strip s 1.2.

### ag-02 — round 2 (passed: all ≥ 7, cover 8) + polish
1. Cover / scene 0: page raised and narrowed (box 170–830 × 500–1060), cover focus [520, 960] zoom 1.35 → ringed 30 ≈ y 1100 on the cover, page whole, candle (x .74) fully in frame beside the page.
2. Scene 4 map: "new calendar" / "old calendar" size 56, "new calendar" moved to lon 12.5 lat 61.5; red "own calendar" note bigger (1.4); Stockholm star dropped.
3. Scene 9: skyline and pine removed, the church stands alone; the lantern walker (s 1.7) walks x .10 → .24 on the left, clear of the church front.
Not done: "gave up on the plan" (would be 504 characters); scene 6 label size is fixed in the shared `wc_number` (wc_cards.js, not editable by a parallel writer). Scene 0 ring/wash animate in the shot, but the engine holds the cover frame during the first sentence, so on screen the hook is the finished cover image (same as every Short).
