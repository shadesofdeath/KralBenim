# Daily batch 2026-10-27 (Stickstory) — ag-01 Poon Lim, 133 days on a raft

- **File:** `ag-01-poon-lim.json` · short · publish_at `2026-10-27T13:00:00-04:00` (Istanbul 27.10 20:00)
- **Category:** survival stories (plan suggestion)
- **Headline:** `tools/news.py` failed this run (proxy 403 for every Google News edition). Fallback: web search of recent news → Aug 2026 "Two Mexican fishermen survive 5 days adrift in a fishing cooler" (ITV / NBC, 2026-08-21) used only as the angle "how long can a person last adrift?"; the story itself is from the category pool (not a front-page headline today).
- **Feeling at the end:** awe at the ingenuity (a nail → a fishhook) and the humility of his quote.
- **Hook + cover idea:** "133 DAYS ALONE" (ALONE in the red box); tiny raft on a huge ocean, big fez narrator shocked. First sentence = cover idea.
- **Related long video:** none on-topic (survival longs: none) → leave `youtube.related` empty.

## Narration (written first, read aloud; ~480 chars → trim towards 400–440, budget warning)
He survived 133 days alone on a raft. In November 1942, a German submarine sank his ship in the Atlantic. Poon Lim, a young steward from China, swam to an empty raft with a few tins of food. When the food ran out, he pulled a nail from the planks and bent it into a fishhook. He caught fish, then seabirds, even a shark. Brazilian fishermen finally found him in April 1943. He said: "I hope no one will ever have to break that record." Subscribe for a true story like this every day.

## Verified facts (director, Wikipedia "Poon Lim"; writer re-checks with ≥2 sources)
SS Benlomond, Ben Line, torpedoed by U-172 on 23 Nov 1942; Poon Lim second steward; 8-ft wooden raft with water, hardtack, chocolate, pemmican, flares; later caught fish, gulls, a shark (drank its blood), rainwater in life-jacket cover; rescued 5 Apr 1943 by three Brazilian fishermen near Pará, landed Belém; 133 days; British Empire Medal; quote "I hope no one will ever have to break that record."

## Shot list (after round 1)
Final narration (448 chars, ~35 s): He survived 133 days alone on a raft. In 1942, a U-boat sank his ship. Poon Lim, a Chinese steward, was the only survivor. So when his food ran out, he bent a nail from the raft into a hook. It worked: fish, seabirds, even a shark! But ships passed. A U-boat even saw him, and left. Day 133: Brazilian fishermen found him. A world record. "I hope no one will ever have to break that record," he said. Subscribe for a true story like this every day.

Shot types in `scenes/studio/shots/pl_raft.js`: `pl_sea`, `pl_sink`, `pl_hook`, `pl_catch`, `pl_end` (+ shared `front` foreground swell / fin). Narrator: scenes 6 and 9 (20%) + the cover/hook overlay.

| # | Sentence | Visual | Type | Set / camera | Narrator | Cue |
|---|---|---|---|---|---|---|
| 0 | He survived 133 days alone on a raft. | Raft (keg, tins) on open Atlantic, Poon Lim sitting worried, foreground swell; hook frame = cover (raft 1.8×, big shocked fez narrator lower-left) | pl_sea | ocean | cover overlay only | hit "alone" |
| 1 | In 1942, a U-boat sank his ship. | Steamer + U-boat, torpedo track, explosion + spray, ship sinks; "NOV 23, 1942" | pl_sink | ocean, shake | – | torpedo "U-boat", hit "sank" |
| 2 | Poon Lim, a Chinese steward, was the only survivor. | He swims to the empty raft and grabs it; "ONLY SURVIVOR" | pl_sea | ocean, close-up 1.6 | – | hit "only" |
| 3 | So when his food ran out, | Top view of planks, empty tin tips over, "EMPTY" | pl_hook | close-up 1.6 | – | empty "ran" |
| 4 | he bent a nail from the raft into a hook. | Hand pulls the nail, second hand curls it into a barbed hook, glint; "NAIL", "HOOK!" | pl_hook | 1.25 pull | – | nail, bend "raft", hit "hook" |
| 5 | It worked: fish, seabirds, even a shark! | Split surface view: fish bites, gull lands, shark glides under the raft, Lim (0.7) shocked; "SHARK!" | pl_catch | ocean | – | fish, seabirds, shark |
| 6 | But ships passed. A U-boat even saw him, and left. | Steamer crosses the horizon; Lim + fez narrator on the raft wave; U-boat surfaces, narrator points; it dives away, narrator shocked; "IT LEFT HIM"; shark fin in the foreground | pl_sea | ocean | on the raft: waves → points → shock | sub "U-boat", hit "left" |
| 7 | Day 133: Brazilian fishermen found him. A world record. | Counter to red DAY 133, fishing sailboat arrives, everyone waves; gold "WORLD RECORD" | pl_sea | coast; source "Guinness World Records" | – | found, record |
| 8 | "I hope no one will ever have to break that record," he said. | "“BREAK THAT / RECORD.”"; Poon Lim on a big raft holds out the hook | pl_end | ocean | – | break, record |
| 9 | Subscribe for a true story like this every day. | "ONE RAFT. / ONE NAIL."; fez narrator on the raft waves | pl_end | ocean | waves | Subscribe, story |

## Critique log

### ag-01-poon-lim — round 1
| Script | Hook | Readability | Visual=narration | Motion | Composition+narrator | Depth | Pace | Accuracy | Ending | Cover+SEO | Cover |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 6 | 8 | 6 | 7 | 8 | 6 | 7 | 8 | 8 | 6 | 7 | 7 |
1. Script/ending: "record" appeared only in the quote; scenes 3–5 read as a list; "Not one stopped" had no pay-off; last scene 22 words.
2. Caption band hid raft/boat/Lim in scenes 6–7; nail under the caption in scene 3; empty repeated sea below y 1320 in scenes 2, 6, 7, 8; scene 2 zoom 1.3; shark cut off and Lim tiny in scene 5; counter cut the sail.
3. Narrator only in 0 and 8, both on a barrel, scene 0 visual said binoculars; cover had two subjects, empty sky and a small raft.

**Writer fixes (round 1):** narration rewritten to 448 chars: "So when his food ran out, / he bent a nail… / It worked: fish, seabirds, even a shark! / But ships passed. A U-boat even saw him, and left. (Wikipedia + Today I Found Out: a German submarine surfaced near him and left him) / Day 133: Brazilian fishermen found him. A world record. (Guinness) / quote scene / own subscribe scene"; lint 0 errors, 0 warnings. Scenes 6–7 moved to y 0.50, Lim scale 0.7, raft 1.2–1.3; scene 6 adds a U-boat that surfaces and dives away plus the fez narrator ON the raft waving at the ship, pointing at the U-boat, shocked when it leaves; new foreground layer (`front`: dark swell with foam / shark fin) in scenes 0, 2, 6, 7, 8, 9; scene 2 zoom 1.6 on the swimmer; nail at y 0.40; scene 5 Lim 0.7, shark smaller and fully in frame; counter moved above the sail with "WORLD RECORD" under it; ending split: scene 8 Poon Lim on a big raft holding the hook ("BREAK THAT RECORD."), scene 9 fez narrator on the raft waving ("ONE RAFT. ONE NAIL."). No barrels any more. Narrator in scenes 6 and 9 (2/10 = 20%) + the cover/hook overlay. Cover candidates: A scene 0 focus raft 1.8× + big shocked narrator overlay lower-left (CHOSEN: Lim's worried face right under the text, one raft, narrator's face readable); A3 focus 1.9 lower (Lim's head fades into the text shade: rejected); B shark-under-raft (raft faded, label cut, does not match line 1: rejected); D scene 6 two figures + ship (heads fade, busy: rejected).

### ag-01-poon-lim — round 2
| Script | Hook | Readability | Visual=narration | Motion | Composition+narrator | Depth | Pace | Accuracy | Ending | Cover+SEO | Cover |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 8 | 8 | 7 | 7 | 8 | 9 | 8 | 8 | 8 |
Passed. Polish asked: 1. scene 6 back to "Ships passed. Not one stopped. A U-boat even saw him, and left." and the steamer must not slide behind the heads; 2. scene 7 "WORLD RECORD" label touches the card/sail; 3. scenes 8 and 9 look alike: make 8 a close-up on the hook; 4. optional: empty grey band under "ALONE" on the cover.

### ag-01-poon-lim — round 3 (writer)
- Text restored; lint allows at most 2 sentences per Short scene, so it is split: scene 6 "Ships passed. Not one stopped." (pl_sea: steamer far on the right horizon at y 0.31, s 0.3, steaming out of frame; Lim + fez narrator waving on the raft, narrator shocked on "stopped"; "NOT ONE STOPPED"; shark fin foreground) and new scene 7 "A U-boat even saw him, and left." (new type `pl_uboat`: a U-boat surfaces next to the raft, lookout with binoculars, sails off and dives on "left"; "IT LEFT HIM"). 11 scenes, 461 chars (preview estimate ~36 s).
- Scene 8 (rescue): the "WORLD RECORD" label is dropped (no spot that clears the card, Lim's head and the sail); the red DAY 133 card + on-screen source "Guinness World Records" carry it.
- Scene 9 (quote): `"camera": false` + internal `close` (zoom 1.8 on Lim and the hook; the quote words stay fixed); "“BREAK THAT" is on screen from 0.1 s. Scene 10 stays wide with a camera push on the narrator.
- Cover: the grey band under "ALONE" is the engine's cover text shading, not sky (scene 0 horizon raised to 430 did not change it); zooming lower fades Lim's head (tested in round 1), so cover A is kept.
- Narrator: scenes 6 and 10 (2/11 = 18%) + the cover/hook overlay. lint OK, 0 warnings.
