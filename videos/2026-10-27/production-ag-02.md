# Daily batch 2026-10-27 (Stickstory) — ag-02 Stamford Bridge 1066: Vikings without armour

- **File:** `ag-02-stamford-bridge.json` · short · publish_at `2026-10-27T19:00:00-04:00` (Istanbul 28.10 02:00)
- **Category:** empires and battles (plan suggestion)
- **Headline:** `tools/news.py` failed this run (proxy 403). Fallback: web search of recent news → History Hit / Dan Snow, 8 Sep 2026: "the true site of the Battle of Stamford Bridge" found by metal detectorists about a mile from the traditional site (first artefacts ever linked to the battle: spearheads, sword parts, mail). Recent, not today's front page; may be used as a one-clause hook only if verified by the writer, otherwise omitted.
- **Feeling at the end:** "they won the war of the north and lost England three days later" — the irony of timing.
- **Hook + cover idea:** "NO ARMOUR" (ARMOUR in the red box); a Viking in a plain tunic, shocked fez narrator, mail shirts piled by the ships.
- **Related long video:** `videos/2026-10-26/ag-04-siege-of-malta.json` (empires and battles long) is the closest; set `youtube.related` to it.

## Narration (written first; ~455 chars → keep 400–450, budget warning)
The Vikings went to war without their armour. In September 1066, the Norwegian king Harald Hardrada had just taken York. On a hot morning, his men left their mail shirts at the ships. Then dust rose on the road. The English king Harold had raced north in days. The Norwegians fought almost unarmoured, and Hardrada fell with an arrow in his throat. Three days later, William of Normandy landed in the south. Subscribe for a true story like this every day.

## Facts to verify (writer; saga details must be framed as "the sagas say")
25 Sept 1066; Hardrada + Tostig; Fulford 20 Sept, York submitted; armour left at ships at Riccall (Heimskringla); Harold marched London→Tadcaster ~185 miles in ~4 days; Hardrada killed by arrow in the throat (saga); 300 ships came, ~24 went home; William landed Pevensey 28 Sept.

## Final narration (round 3, 470 chars)
Vikings walked into battle without armour. In 1066, Norway's Hardrada took York. It was hot, the sagas say, so his men left their mail at the ships. Then dust rose on the road. It was King Harold. He'd raced 185 miles north. Without mail, they broke, and Hardrada fell with an arrow in his throat. Harold won. But three days later, William of Normandy landed in the south, and Harold's tired army lost England at Hastings. Subscribe for a true story like this every day.

Facts verified: Britannica (25 Sept 1066; hot day, chainmail left in the ships; Hardrada killed by an arrow in the throat; Harold died about three weeks later at Hastings against William), Wikipedia (about 185 miles in about four days; William landed at Pevensey 28 Sept; Hastings 14 Oct 1066, Harold killed), Britain Express (about 180 miles in four days; mail shed in the hot sun). Britannica gives "nine days" for the whole march, so only the distance is given. Saga detail framed as "the sagas say". No lone-axeman legend. The 2026 History Hit find (Yorkshire Post, 15 Sep 2026) was checked but left out to stay on budget.

## Shot list
Cover = hook frame = scene 0 (t 1.2): "NO / ARMOUR. / TOO HOT." (ARMOUR boxed); a big sweating Viking (helmet, bare stick body) with his mail shirt dumped in the grass at his feet, and a big shocked fez narrator at the lower left. Round 3 candidates: (A) "No armour", zoom 1.6 (band under the text empty); (B) "No armour. Too hot." ✓ (the third line fills the band and gives the reason); (C) narrator pointing on the right (overlaps the Viking). Round 2 used scene 0 with no mail symbol; round 1 used the scene-2 rack.
Narrator: scenes 2 and 10 = 2/11, plus the hook cover.

| # | Text | Type | Set | Visual | Narrator | Cues | Camera | Source |
|---|---|---|---|---|---|---|---|---|
| 0 | Vikings walked into battle without armour. | `sb_camp` | field | Hook frame: a big Viking warrior on the river bank under a blazing sun, conical helmet but no mail (bare stick body), sweat drops flying as he stretches in the heat; his grey mail shirt lies dumped in the grass at his feet, his planked round shield leans against his spear; camp smoke across the river; under the hook text 'NO ARMOUR' the big shocked fez narrator stands at the lower left. | — | hit=armour | locked |  |
| 1 | In 1066, Norway's Hardrada took York. | `sb_map` | none (map) | Full-bleed old map of the North Sea: a red dashed route draws itself from Norway down the British coast into the Humber while a fleet of tiny striped longships sails along it; on 'York' the city pops in red and a red stamp 'TAKEN' lands above it. | — | york=York | locked |  |
| 2 | It was hot, the sagas say, so his men left their mail at the ships. | `sb_ships` | sea | The river bank at Riccall under a blazing sun with heat shimmer: two moored longships with furled sails rock on the water; in front a wooden pole rack where two grey mail shirts (dense rings, sleeves, belt) drop in and swing; the fez narrator beside the rack lifts a third mail shirt up high on 'left', amazed; a red stamp 'LEFT HERE' slams in on 'mail' (close push-in). | lifts a mail shirt high on 'left', amazed | hot=hot, left=left, hit=mail | close-up push [560, 800] x1.6 | Britannica |
| 3 | Then dust rose on the road. | `sb_dust` | hills | Looking over the heads of resting Vikings (helmeted backs, shields on their backs, cropped at the bottom) to a far ridge: a pale road winds over the crest; a dust cloud boils up behind it and a row of dark helmets and spears with gold glints rises over the ridge; a Viking lookout on the left points at it in alarm, a red stamp 'WHO IS THAT?' slams in and the resting men turn and rise. | — | dust=dust, road=road | auto push |  |
| 4 | It was King Harold. He'd raced 185 miles north. | `sb_map` | none (map) | Close old map of England (hill and tree glyphs, double border, compass rose, scale bar): a red dashed route draws itself from London up the old road to York while a column of tiny spearmen marches along it; London and York are marked; on '185' a red stamp '185 MILES' slams onto the map. | — | hit=185 | locked | Wikipedia |
| 5 | Without mail, they broke, | `sb_clash` | field | Battle line, closer: on the left two Vikings without mail (bare stick bodies) behind planked red round shields, on the right two English warriors in dark ring-mail shirts behind blue kite shields (rim, boss) advance; stamps 'NO MAIL' (red) and 'MAIL' (blue) above them; on 'broke' the Vikings jolt in shock, turn and run left; along the bottom the backs of the English front rank (helmets, raised kite shields). | — | hit=broke | auto  |  |
| 6 | and Hardrada fell with an arrow in his throat. | `sb_clash` | field | Close shot of Harald Hardrada (gold circlet, beard, no mail) under his raven banner with two Vikings behind him; on 'fell' he looks up in shock as an arrow streaks in from the right edge; it hits at his neck with a gold ink star (no blood) and he topples backwards on 'arrow'; the raven banner falls on 'throat'. | — | go=fell, hit=arrow, down=throat | close-up push [500, 960] x1.6 |  |
| 7 | Harold won. | `sb_map` | none (map) | Old map of England (glyphs, border, compass): York gets a green ring and a green stamp 'NORTH: WON'; then a red ring starts pulsing on the empty south coast at Pevensey. | — | won=won | locked |  |
| 8 | But three days later, William of Normandy landed in the south, | `sb_ships` | coast | The south coast at Pevensey: two Norman ships with striped sails sail in from the left and run aground on the beach on 'landed' while surf washes in; two big mailed Normans with gold kite shields step ashore; a red stamp '3 DAYS LATER' slams in on 'three'. | — | land=landed, hit=three | auto  | Wikipedia |
| 9 | and Harold's tired army lost England at Hastings. | `sb_clash` | hills | Hastings on a hill: on the left two weary English warriors in mail behind blue kite shields, on the right two Normans in mail with gold kite shields push in; on 'lost' the English stagger and fall back; a red stamp 'LOST AT HASTINGS' slams in; the backs of the Norman front rank (helmets, gold kite shields) fill the bottom. | — | hit=lost, stamp=Hastings | auto  |  |
| 10 | Subscribe for a true story like this every day. | `sb_camp` | hills | The empty battlefield by the river at evening: dropped round and kite shields, spears stuck in the ground, low sun; the fez narrator walks in from the right and waves; a big red '1066' springs in above. | walks in, waves | hit=Subscribe | auto pull |  |

## Critique log

### ag-02-stamford-bridge — round 1
| Script | Hook | Readability | Visual=narration | Motion | Composition+narrator | Depth+brand | Pace | Accuracy | Ending | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 | 7 | 6 | 6 | 8 | 6 | 7 | 7 | 8 | 5 | 6 / 8 |
1. Story order confusing (dust before the march), no surprise, weak ending → rewritten: opening "Vikings walked into battle without armour."; dust first, then the reveal "It was King Harold. He'd raced about 185 miles north."; ending "Harold won. But guess who landed in the south three days later? William the Conqueror. Next stop: Hastings." (463 chars).
2. Cover/hook: polka-dot shirt, lifebuoy shields, small cut-off narrator, hook never showed scene 0 → mail redrawn (dense ring arcs, elbow sleeves, belt + buckle); shields redrawn (plank seams, thick rim, iron boss); English mail darker and denser; cover = scene 0 with a big unarmoured Viking + narrator at scale 1.65, chosen from 3 new candidates.
3. Full frame / caption band → maps get a double border, hill and tree glyphs on the land, a compass rose and a scale bar; scene 7 (now Normandy → Pevensey with a fleet) keeps Pevensey above y 1170; "WHO IS THAT?" is now a 84 px stamp and the English column is dark and large with glints; the king's close-up is reframed (feet ≈ y 990) with a real raven on the banner and a thicker, longer arrow; scene 2 label is now the stamp "LEFT HERE" inside the frame; scene 9 has one sun; the narrator holds up a mail shirt in scene 2.

### ag-02-stamford-bridge — round 2
| Script | Hook | Readability | Visual=narration | Motion | Composition+narrator | Depth+brand | Pace | Accuracy | Ending | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 8 | 6 | 7 / 8 |
1. BLOCKING punchline: "William the Conqueror. Next stop: Hastings." is two fragments → one sentence across scenes 8–9: "But three days later, William of Normandy landed in the south, and Harold's tired army lost England at Hastings." New scene 9 (`sb_clash` at Hastings, English stagger, stamp "LOST AT HASTINGS"); trimmed "about", "king", "the north" to pay for it (470 chars).
2. BLOCKING cover: "no armour" not visible → mail shirt dumped at the Viking's feet, sweat drops, bigger sun, background Vikings removed; 3 candidates, picked "NO ARMOUR. TOO HOT." (the third line closes the empty band).
3. Scenes 5/8: mail vs no mail unreadable → 2 against 2 at scale 0.95, ground lower, stamps "NO MAIL"/"MAIL", English dense dark ring mail, kite shields with a thick rim and boss, a front rank of helmeted backs + raised shields across the bottom; Normans in scene 8 at scale 0.85.
Not done: splitting scene 2 (15 words) would push the Short to 12 scenes (the limit is 11), so the lint warning stays. The scene 1 caption box width is engine-side.

### ag-02-stamford-bridge — round 3
Fixes above applied; lint 0 errors, SEO 100/100, 1 warning (scene 2: 15 words). Preview: no STATIC? flags; sheet and cover checked by the writer.
