# ag-03-dart-asteroid — Stickstory long video (space and planet earth)

- **File:** `videos/2026-11-17/ag-03-dart-asteroid.json` · format long · publish_at `2026-11-17T14:00:00-05:00` (Istanbul 17.11 22:00)
- **Category:** space and planet earth (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403) → ScienceDaily (US), 16 Nov 2026: "NASA Smashed Into an Asteroid. Now Hera
  Has Revealed a Strange New World" (ESA's Hera mission at Didymos/Dimorphos). Headline is the hook in the first lines;
  VERIFY what Hera actually reported/when it arrives — if not certain, phrase it as "a European spacecraft is on its way /
  arriving to see the crater" without inventing findings.
- **Topic:** NASA's DART — the first time humans deliberately moved a natural object in space. Acts: (cold open) 26 Sept
  2022, the last seconds of the camera DRACO's images as a vending-machine-sized craft at ~6.1 km/s (~14,000 mph) closes
  on Dimorphos, a moonlet nobody had ever seen up close; the picture freezes. Question: did it work — can we actually push
  an asteroid away from Earth? Ch1 the ordinary world / why it matters (Chicxulub 66 million years ago, Tunguska 1908,
  Chelyabinsk 2013 — nobody saw it coming). Ch2 the idea: kinetic impactor; why a binary asteroid (Didymos + Dimorphos
  ~160 m) is a perfect lab — you can measure the orbit from Earth by the dimming of light; launch Nov 2021 on Falcon 9;
  SMART Nav autonomous targeting; LICIACube (Italy) along to watch. Ch3 the impact. Ch4 the surprise: orbit of 11 h 55 min
  shortened by ~32–33 minutes (goal was 73 seconds); the ejecta plume and a tail thousands of km long; rubble pile;
  boulders. Ch5 after & today: Hera (ESA) launched Oct 2024, Mars flyby March 2025, arriving at the pair late 2026 to
  measure the crater and the mass → the headline. Ending: Earth now has a tested "push"; one comment question + subscribe.
  VERIFY every number/date on ≥ 2 sources (NASA, ESA, JHU APL, Nature 2023 papers). Don't say the asteroid was a threat
  (it never was).
- **Viewer should feel:** "We actually punched a rock in space and moved it — the first real planetary defense test."
- **Cold open:** inside the final seconds of the impact (no chapter card first), the open question answered at the end.
- **Budget:** `elevenlabs_chars.warning: true` → narration **4,300–4,400 chars** (hard max 5,400), 40–50 scenes,
  `chapter` every 8–12 scenes, each chapter ends pulling into the next.
- **Look:** sets `night` (space as night set), `interior` (APL mission control), `desert` (Chicxulub / Arizona-like),
  `snow` (Chelyabinsk), `field` (Tunguska forest), `coast` (Vandenberg launch). New types in own file
  `scenes/studio/shots/da_*.js` (e.g. the DART spacecraft with solar arrays, the binary asteroid with orbit ring,
  DRACO final-frames approach, the impact plume/tail, the light-curve dip chart drawn in ink, Hera). ≥ 4 close-ups (zoom
  ≥ 1.6). Kaşif host 15–25 %. On-screen `source` ≥ 3. Real photos via tools/media.py welcome (DRACO final images, Hubble
  tail image are NASA public domain; `--name da-...`, sepia, credit).

## Writer — narration, fact check, shot list, cover

**File:** `videos/2026-11-17/ag-03-dart-asteroid.json` · 50 scenes · cold open + CHAPTER 1–5 / 5 · **4,394 narration chars**
(budget 4,300–4,400, warning respected) · preview estimate ~5:21 · palette `ag-slate` · new shot file `scenes/studio/shots/da_dart.js`
(da_craft, da_draco, da_room, da_binary, da_light, da_impact, da_sky, da_nudge, da_hera, da_rubble); reused `tunguska`, `phobos_launch`,
`stage`, `title`, `chapter`. Kaşif in 10/50 scenes (20 %), close-ups 5 (zoom 1.6), on-screen sources 13.
`tools/media.py` blocked (proxy 403) → no NASA photos; everything is drawn in code.

**Title:** DART Asteroid Impact: Can We Really Knock an Asteroid Away? · **Cover:** "WE PUNCHED / AN ASTEROID" (highlight PUNCHED), scene 33 (plume) + shocked fez narrator

### Narration (written first, one piece)

Seven million miles from Earth, a little box-shaped spacecraft is racing toward a rock that nobody has ever seen up close. It's moving at fourteen thousand miles per hour. On the screen, the rock grows. Boulders. More boulders. Then the picture freezes, halfway down. And in a control room in Maryland, people cheer. Because this crash was the whole point. So here's the question: can we actually push an asteroid off its path? Let me show you. Now, why would anyone smash a spacecraft on purpose? Because Earth gets hit. Sixty-six million years ago, a rock about six miles wide slammed into what is now Mexico, and the age of the dinosaurs was over. Smaller rocks hit more often. In June 1908, something exploded in the sky over Siberia and flattened about eighty million trees. In 2013, a rock about sixty-five feet wide blew up over the Russian city of Chelyabinsk. Windows shattered all over town, and about fifteen hundred people were hurt, mostly by flying glass. Here's the scary part. No telescope had spotted it. So if we ever do see one coming, what do we actually do? Their answer sounds almost too simple. You hit it. Not with a bomb. With something fast. Give a rock a tiny nudge years ahead of time, and that nudge can grow into a miss of thousands of miles. But nobody had ever tried it. So NASA picked a harmless target: a pair of asteroids. The big one, Didymos, is about half a mile wide. Circling it is a little moon called Dimorphos, about as wide as the Great Pyramid is tall. And here's the clever part. Every time the little moon passes in front of the big one, the pair gets a bit dimmer. Telescopes on Earth can time those dips. Before the crash, one lap took eleven hours and fifty-five minutes. Change the lap, and you've proven the push worked. In November 2021, a Falcon 9 rocket launched the spacecraft from California. Its name was DART. It carried one camera, and a tiny Italian satellite called LICIACube, to film the crash. Ten months later, DART was closing in. And the scariest part wasn't the speed. Nobody on Earth would be steering. In the final hours, DART steered itself. First it saw one dot of light. Then the dot split into two. The computer had to pick the small one and aim for its middle. LICIACube had already split off, to watch. On the twenty-sixth of September 2022, the little moon filled the screen. For the first time, we saw what Dimorphos looked like. And it wasn't a solid rock. It was a pile of boulders, loosely stuck together. The last full picture came about two seconds before the end, from roughly seven miles away. Then the signal stopped. In the control room, that silence meant a direct hit. But did it actually move anything? Three minutes later, LICIACube flew past and caught the moment. A huge spray of rock and dust was blasting off Dimorphos. Later, Hubble saw that debris stretched into a comet-like tail thousands of miles long. Then came the real test: the timing. NASA's minimum goal was a change of seventy-three seconds. The result? The lap got shorter by about thirty-two minutes. That's more than twenty-five times the goal. And here's the crazy part. The spacecraft wasn't doing most of the pushing. All that rubble flying off worked like a rocket engine, and it pushed the moon more than twice as hard as DART itself. The asteroid helped push itself. But that left one big question. What did the crash do to the little moon? For two years, nobody could get close enough to check. In October 2024, Europe launched Hera, a crash site investigator. And this month, it finally arrived. The first pictures show Didymos covered in boulders, craters and strange grooves, and some of those boulders might be rubble from DART's crash. The lead scientist said, "The first thing we said was wow!" Over the next months, Hera will weigh the little moon and look for the crater. And here's a twist. Some scientists think there is no crater at all. Their models say DART may have reshaped the whole moon, like a fist in a beanbag. So, can we push an asteroid off its path? Yes. We did it once, on purpose, and it worked better than anyone hoped. The catch is time. A nudge only works if we spot the rock years before it arrives. So here's my question: if we found one heading our way, would you trust a punch like this, or something bigger? Tell me in the comments, and subscribe to Stickstory for more true stories from space. 

### Fact check (each key fact on ≥ 2 sources)

| Claim in narration | Sources |
|---|---|
| Impact 26 Sept 2022, ~7 million miles (11 million km) from Earth | APL Mission Overview; NASA DART page; JHU Hub |
| ~14,000 mph (≈ 6.1 km/s) | NASA DART page (14,000 mph); DLR 12 Nov 2026 (6.1 km/s); JHU Hub |
| Box-shaped spacecraft; one instrument, the DRACO camera | NASA DART page ("box-shaped", DRACO only instrument); APL |
| Control room in Maryland (APL, Laurel) | APL / JHU Hub |
| Chicxulub 66 million years ago, ~6 miles (10 km) wide, Mexico | Planetary Society (10–15 km, ~65 Ma); widely 66 Ma — phrased "about six miles" |
| Tunguska June 1908, ~80 million trees | Planetary Society (80 million trees, 2,150 km²) |
| Chelyabinsk 2013, ~20 m (65 ft), ~1,500 hurt mostly by flying glass, no warning | Planetary Society (20 m, ~1,500 injured, glass); Space.com ("without warning"; 17–20 m) |
| Didymos ~half a mile (~760–780 m); Dimorphos ~150 m (Great Pyramid ~139–147 m, "about") | APL (760 m / 150 m); DLR/AP (780 m / 151 m) |
| Light-curve method: mutual eclipses dim the pair; ground telescopes time them | Daly et al. 2023 (Nature) abstract; JHU Hub (ground telescopes) |
| Orbit 11 h 55 min before impact | APL; NASA DART page; JHU Hub |
| Launch Nov 2021, Falcon 9, Vandenberg (California) | APL (23 Nov 2021 PST, Vandenberg, Falcon 9) |
| LICIACube, Italian Space Agency cubesat, released 15 days before; flew past ~3 min after impact | APL (15 days); Space.com (~3 min); JHU Hub (ASI) |
| Final hours autonomous targeting (SMART Nav), had to tell the two apart and pick Dimorphos | NASA DART page |
| Last complete image ~2 s before impact, ~7 miles away | NASA DART page |
| Dimorphos a loosely bound rubble pile / boulders | Space.com (loose boulders → more ejecta); Raducan 2024 via Sci.News (rubble pile) |
| Hubble saw a debris tail (thousands of miles; >10,000 km) | JHU Hub (Hubble 8 Oct 2022); AP/ClickOrlando 11 Nov 2026 (>10,000 km for months) |
| NASA minimum goal 73 s; result ~32 min (later refined ~33), >25× goal | JHU Hub (32 min ±2, 73 s, >25×); NASA page (32 min); DLR/APL say 33 — narration "about thirty-two" |
| Ejecta pushed more than twice as hard as DART (β ≈ 3.6) | Space.com (β = 3.6, Cheng et al. 2023 Nature) — ejecta share 2.6× → "more than twice" |
| Hera launched Oct 2024 (7 Oct), arrived early Nov 2026 | ESA (launch 7 Oct 2024, arrival Nov 2026); DLR 12 Nov 2026; Sky at Night 11 Nov 2026 |
| First images: Didymos boulders, craters, groove/ridge patterns; some boulders may be DART ejecta | DLR 12 Nov 2026; Sky at Night 11 Nov 2026 |
| Quote "The first thing we said was wow!" (Patrick Michel, Hera PI) | Sky at Night 11 Nov 2026 |
| Hera will measure Dimorphos's mass and the crater/impact effects (≥ 6 months) | APL (mass); DLR (≥ 6 months, crash site investigation) |
| Models: DART may have reshaped the whole moonlet, no well-defined crater | Sci.News on Raducan et al., Nature Astronomy 26 Feb 2024 ("may find a reshaped asteroid rather than a well-defined crater") |
| Dimorphos/Didymos was never a threat | not claimed (narration says "harmless target") |

No invented Hera findings: only what DLR / Sky at Night reported (boulders, craters, groove-like patterns, "might be" DART ejecta).

### Shot list


**Cold open: the last minutes**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 0 | da_craft | Seven million miles from Earth, a little box-shaped spacecraft is racing toward a rock that nobody has ever seen up close. | Deep space with stars: the DART spacecraft (a box with two long striped solar arrays, a dish and a camera tube… | million,rock | wide/auto |  |
| 1 | da_craft | It's moving at fourteen thousand miles per hour. | Close on the spacecraft racing right, speed streaks rushing past; a red note '14,000 mph' pops in on 'fourteen… | fourteen | close 1.6 |  |
| 2 | da_draco | On the screen, the rock grows. Boulders. More boulders. | DART's camera view: a viewfinder with corner brackets and crosshair; the moonlet swells from a small lump to f… | grows,Boulders | wide/auto |  |
| 3 | da_draco | Then the picture freezes, halfway down. | The viewfinder shows a boulder field arriving line by line from the top; on 'freezes' it stops halfway, the lo… | freezes | wide/auto |  |
| 4 | da_room | And in a control room in Maryland, people cheer. Because this crash was the whole point. | Mission control: a big wall screen reads 'NO SIGNAL' in red; consoles with glowing monitors; four team members… | control,cheer,point | wide/auto |  |
| 5 | stage | So here's the question: can we actually push an asteroid off its path? Let me show you. | Night sky over a hill: the fez narrator holds up a sign 'PUSH IT?' and looks up at a big ink rock in the sky, … | push,show | wide/auto | yes |

**Nobody Saw It Coming**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 6 | chapter | Now, why would anyone smash a spacecraft on purpose? Because Earth gets hit. | CHAPTER 1 / 5 card: blue disc with 1, title 'Nobody Saw It Coming'.… | why,Earth | wide/auto |  |
| 7 | da_sky | Sixty-six million years ago, a rock about six miles wide slammed into what is now Mexico, and the age of the dinosaurs was over. | Desert plain with two sauropods and cycad trees; a huge flaming rock with a smoke trail dives toward the horiz… | Sixty,slammed,dinosaurs | wide/auto |  |
| 8 | tunguska | Smaller rocks hit more often. In June 1908, something exploded in the sky over Siberia and flattened about eighty million trees. | Siberian taiga from the side: a fireball streaks in and bursts in the sky on 'exploded'; the shock front knock… | Smaller,exploded,eighty | wide/auto |  |
| 9 | da_sky | In 2013, a rock about sixty-five feet wide blew up over the Russian city of Chelyabinsk. | Snowy city of apartment blocks with rows of windows; a bright fireball crosses the sky leaving a long white sm… | blew,Chelyabinsk | wide/auto |  |
| 10 | da_sky | Windows shattered all over town, and about fifteen hundred people were hurt, mostly by flying glass. | Close on an apartment block: red cracks run across its windows one after another and shards of glass tumble do… | Windows,hurt | close 1.6 |  |
| 11 | stage | Here's the scary part. No telescope had spotted it. So if we ever do see one coming, what do we actually do? | Snowy night: the fez narrator peers through a spyglass at the sky, then jumps back in shock and holds up a sig… | spotted,actually | wide/auto | yes |

**A Rock With a Moon**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 12 | chapter | Their answer sounds almost too simple. | CHAPTER 2 / 5 card: blue disc with 2, title 'A Rock With a Moon'.… | answer,simple | wide/auto |  |
| 13 | stage | You hit it. Not with a bomb. With something fast. | Night hill: the fez narrator holds up a sign 'HIT IT!', then shrugs on 'bomb', then he points up at the rock o… | hit,bomb,fast | wide/auto | yes |
| 14 | da_nudge | Give a rock a tiny nudge years ahead of time, and that nudge can grow into a miss of thousands of miles. | Space diagram: a rock on a grey dashed path heading straight at Earth; on 'nudge' a tiny red arrow pushes it a… | nudge,miss | wide/auto |  |
| 15 | da_binary | But nobody had ever tried it. So NASA picked a harmless target: a pair of asteroids. The big one, Didymos, is about half a mile wide. | Space: the big spinning-top asteroid Didymos with an equatorial ridge, and its little moon on a dashed orbit a… | harmless,Didymos | wide/auto |  |
| 16 | da_binary | Circling it is a little moon called Dimorphos, about as wide as the Great Pyramid is tall. | Close on the little moon Dimorphos on its orbit with a label riding over it; on 'Pyramid' a hatched Great Pyra… | Dimorphos,Pyramid | wide/auto |  |
| 17 | da_light | And here's the clever part. Every time the little moon passes in front of the big one, the pair gets a bit dimmer. | Graph paper: a pen draws a brightness line from left to right that dips every time; over each deep dip a small… | clever,dimmer | wide/auto |  |
| 18 | da_light | Telescopes on Earth can time those dips. Before the crash, one lap took eleven hours and fifty-five minutes. | The same light curve, already drawn; a red bracket spans from one deep dip to the next on 'eleven' with the no… | time,eleven | wide/auto |  |
| 19 | stage | Change the lap, and you've proven the push worked. | Night hill: the fez narrator holds up a sign 'LAP = PROOF', then gives a happy point at the viewer on 'worked'… | Change,worked | wide/auto | yes |
| 20 | phobos_launch | In November 2021, a Falcon 9 rocket launched the spacecraft from California. Its name was DART. | California coast at dawn: a rocket on a pad beside a lattice tower; on 'launched' the engines light, smoke bil… | launched,DART | wide/auto |  |
| 21 | da_craft | It carried one camera, and a tiny Italian satellite called LICIACube, to film the crash. | Close on the spacecraft: a red ring circles its camera tube on 'camera' with note 'one camera'; a small gold c… | camera,Italian | close 1.6 |  |
| 22 | da_room | Ten months later, DART was closing in. And the scariest part wasn't the speed. Nobody on Earth would be steering. | Mission control: the wall screen shows the asteroid pair; the team stands still at the consoles with arms down… | closing,steering | wide/auto |  |

**The Last Hour**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 23 | chapter | In the final hours, DART steered itself. | CHAPTER 3 / 5 card: blue disc with 3, title 'The Last Hour'.… | final,steered | wide/auto |  |
| 24 | da_draco | First it saw one dot of light. Then the dot split into two. | Camera view: one blurry dot in the middle of the viewfinder; on 'split' it separates into a big dot and a tiny… | dot,split | wide/auto |  |
| 25 | da_draco | The computer had to pick the small one and aim for its middle. | Camera view: the crosshair glides from the big dot to the tiny one; on 'aim' a red target box snaps around the… | pick,aim | wide/auto |  |
| 26 | da_craft | LICIACube had already split off, to watch. | Space: the gold little cubesat drifts away behind the spacecraft, leaving a dotted trail; note 'to watch' on '… | split,watch | wide/auto |  |
| 27 | da_draco | On the twenty-sixth of September 2022, the little moon filled the screen. | Camera view: the moonlet grows fast until it fills the whole viewfinder; date note '26 September 2022'.… | twenty,filled | wide/auto |  |
| 28 | da_draco | For the first time, we saw what Dimorphos looked like. | Camera view filled with a field of rocks and boulders of every size, slowly drifting closer; note 'first look'… | first,looked | wide/auto |  |
| 29 | da_rubble | And it wasn't a solid rock. It was a pile of boulders, loosely stuck together. | Cut-away of Dimorphos: boulders pop in one by one and pack the outline with gaps between them; the fez narrato… | solid,pile | wide/auto | yes |
| 30 | da_draco | The last full picture came about two seconds before the end, from roughly seven miles away. Then the signal stopped. | Camera view: a last boulder frame arrives line by line and stops halfway on 'stopped', the rest static; notes … | two,seven,stopped | wide/auto |  |
| 31 | da_room | In the control room, that silence meant a direct hit. But did it actually move anything? | Mission control: the wall screen shows 'NO SIGNAL'; the team cheers on 'hit'; the fez narrator in front scratc… | hit,move | wide/auto | yes |

**The Surprise**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 32 | chapter | Three minutes later, LICIACube flew past and caught the moment. | CHAPTER 4 / 5 card: blue disc with 4, title 'The Surprise'.… | Three,moment | wide/auto |  |
| 33 | da_impact | A huge spray of rock and dust was blasting off Dimorphos. | Space: the moonlet with a gold flash on its right edge and a wide cone of dust, gold sparks and tumbling rocks… | spray,blasting | wide/auto |  |
| 34 | da_impact | Later, Hubble saw that debris stretched into a comet-like tail thousands of miles long. | Far view in space: the asteroid pair at left with a long feathery tail of debris growing out to the right like… | Hubble,thousands | wide/auto |  |
| 35 | da_light | Then came the real test: the timing. NASA's minimum goal was a change of seventy-three seconds. | Graph paper light curve again; on 'seventy' a thin red dashed line appears just before one dip with the note '… | test,seventy | wide/auto |  |
| 36 | title | The result? The lap got shorter by about thirty-two minutes. That's more than twenty-five times the goal. | Giant words '32' / 'minutes' word by word, '32' in a red box; handwritten note '25 times the goal'.… | lap,thirty,twenty | wide/auto |  |
| 37 | stage | And here's the crazy part. The spacecraft wasn't doing most of the pushing. | Night hill: the fez narrator jumps back in shock, then holds up a sign 'NOT DART?' on 'pushing'.… | crazy,pushing | close 1.6 | yes |
| 38 | da_impact | All that rubble flying off worked like a rocket engine, and it pushed the moon more than twice as hard as DART itself. | Space: the moonlet with debris spraying out to the right; a small blue arrow 'DART' and then, on 'twice', a bi… | rubble,twice,engine | wide/auto |  |
| 39 | da_binary | The asteroid helped push itself. But that left one big question. What did the crash do to the little moon? | Space: Didymos and its moon; on 'push' the dashed orbit tightens with red arrows pointing inward; on 'crash' a… | push,crash | wide/auto |  |

**The Crime Scene**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 40 | chapter | For two years, nobody could get close enough to check. | CHAPTER 5 / 5 card: blue disc with 5, title 'The Crime Scene'.… | two,check | wide/auto |  |
| 41 | da_hera | In October 2024, Europe launched Hera, a crash site investigator. | Space: ESA's Hera spacecraft (a gold box with two square blue solar wings and a dish) cruises past speed strea… | Hera,crash | wide/auto |  |
| 42 | da_hera | And this month, it finally arrived. The first pictures show Didymos covered in boulders, craters and strange grooves, and some of those boulders might be rubble from DART's crash. | Space: a giant Didymos fills the right side, covered in boulders, craters, grooves and a ridge; small Hera at … | arrived,boulders,rubble | wide/auto |  |
| 43 | da_room | The lead scientist said, "The first thing we said was wow!" | Hera control room: the wall screen shows the boulder-covered asteroid; a scientist at the left throws up his a… | thing | wide/auto |  |
| 44 | da_hera | Over the next months, Hera will weigh the little moon and look for the crater. | Space: Hera at left beams a red dashed laser at a big Dimorphos; two little cubesats drift out of it on 'weigh… | weigh,Over,crater | wide/auto |  |
| 45 | da_rubble | And here's a twist. Some scientists think there is no crater at all. Their models say DART may have reshaped the whole moon, like a fist in a beanbag. | Space: the round moonlet; an ink fist pushes in from the right and on 'reshaped' the whole moon squashes wider… | crater,reshaped,beanbag | wide/auto |  |
| 46 | stage | So, can we push an asteroid off its path? Yes. We did it once, on purpose, and it worked better than anyone hoped. | Night hill: the fez narrator thinks, then holds up a big sign 'YES!' on 'Yes', then points up at the rock in t… | Yes,better | close 1.6 | yes |
| 47 | da_nudge | The catch is time. A nudge only works if we spot the rock years before it arrives. | Space diagram again: the rock far out on its dashed path to Earth; on 'nudge' the tiny red push and the red pa… | nudge,years | wide/auto |  |
| 48 | da_nudge | So here's my question: if we found one heading our way, would you trust a punch like this, or something bigger? | Space: a rock on a dashed path straight at Earth; the fez narrator stands below and thinks; on 'punch' a tiny … | heading,punch,bigger | wide/auto | yes |
| 49 | stage | Tell me in the comments, and subscribe to Stickstory for more true stories from space. | Night hill under the stars: the fez narrator points at the viewer on 'comments', then waves goodbye on 'subscr… | comments,subscribe | wide/auto | yes |

### Cover — 3 candidates compared

| | Scene / moment | Text | Verdict |
|---|---|---|---|
| A | 33 plume: the moonlet with the gold blast and the dust cone, shocked fez narrator | WE PUNCHED / AN ASTEROID | **chosen** — one clear subject (the rock being hit), the action is visible at thumbnail size, the claim is the hook |
| B | 3 DRACO last frame (boulders top half, static + red SIGNAL LOST) | THE LAST / PICTURE | strong mystery, but the frame is busy (boulders + static + red text) and reads as "camera broke" |
| C | 38 push arrows (DART blue, rubble red) | IT PUSHED / ITSELF | clever, but needs the video to make sense; arrows + labels compete with the title |

Final cover: scene 33, t 2.0, focus [760, 520], zoom 1.3, narrator shock at x 1630 (clear of the frame).

## Eleştiri günlüğü

### ag-03-dart-asteroid — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 7 | 7 | 7 | 7 | 8 | 8 | 8 | 7 |
1. Cover: Kaşif inside the plume, no clear moment, rock half faded, stray cubesat → **fixed**: 3 new candidates (scene 31 zoom 1.1 / scene 25 viewfinder / scene 31 zoom 1.0); chosen scene 31, rock fully inked (`fade: false`), flash + spray on its right, Kaşif standing clear on its left facing it, cubesat hidden until 1.6 s.
2. da_nudge read as a hit → **fixed**: rewritten. Dashed course aimed at Earth's centre, red nudge arrow under the rock, red bent path that sails clearly above Earth and off frame, red double-headed "a miss!" bracket right of Earth (no stem), Earth drawn with blue ocean + green land tokens. Scene 46 label now "a punch... or bigger?" (matches the line).
3. Repetitive night-hill Kaşif scenes → **fixed**: scene 10 (No warning) now in snowy Chelyabinsk under the fireball (spyglass → shock, big red "NO WARNING" box replaces the small sign); scene 12 (Hit it) in space beside the spacecraft racing at the rock ("a bomb" struck out); scene 17 (Change the lap) beside the light-curve graph pointing at the 11 h 55 min bracket as the red shorter-period curve draws; scene 35 (Plot twist) in front of the debris spray, jumping back. LICIACube scene now close-up 1.7 with labels; Hubble tail fills the frame; Hera 1.25× bigger.
Minor: mission-control notes moved onto the wall screen; "about thirty-three minutes" (APL/DLR/Nature 2023 refined; title card "33"); LICIACube line is now "By then, LICIACube had split off to watch from a distance."; "box-shaped" and "That's" cut to stay in budget. To avoid 3× same type in a row, the Chelyabinsk + windows lines merged into one da_sky scene, and the dips/11 h 55 min/change-the-lap lines into one da_light scene → **48 scenes, 4,394 chars**. Kaşif 10/48 (21 %), close-ups 4, lint OK (SEO 100).

### ag-03-dart-asteroid — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 8 | 7 | 8 | 7 | 8 | 9 | 8 | 7 |
1. Cover: Kaşif collided with the headline → **fixed**: `cover.kasif` x 1650, face -1 (looking back at the flash), scale 0.88, lower right under the plume; focus [700, 562] (rock nudged left), zoom 0.95, `fade: false`. Checked at full size and at 320×180: nothing touches the text block or the frame.
2. Scene 34 ("33 minutes"): the note's arrow cut through "minutes" → **fixed**: `"arrow": false`, note sits alone under the word block.
3. Scenes 44/47 identical night-hill frames → **fixed**: scene 47 is now a close-up (zoom 1.6) on a green `hills` set, Kaşif pointing straight at the viewer on "comments", then waving on "subscribe".
Lint OK (SEO 100), 48 scenes, 4,394 chars, no STATIC? scenes.
