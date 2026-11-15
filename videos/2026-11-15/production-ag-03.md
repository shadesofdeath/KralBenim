# ag-03-suez-canal — Stickstory long video (how it was built)

- **File:** `videos/2026-11-15/ag-03-suez-canal.json` · format long · publish_at `2026-11-15T14:00:00-05:00` (Istanbul 15.11 22:00)
- **Category:** how it was built (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403) → **anniversary hook**: the Suez Canal opened 17 November 1869, 157 years
  ago this week (reported).
- **Topic:** Building the Suez Canal 1859–1869. Acts: (cold open) opening day 17 Nov 1869, Empress Eugénie's yacht L'Aigle
  leads the convoy into a desert ditch 164 km long — will it even float? Question: how did a ditch through the desert
  change the map of the world (London–Bombay route ~ cut by thousands of km / weeks)? Ch1 the old world: ships around Africa,
  ancient canals (Pharaohs' canal; Napoleon's surveyors 1798–99 wrongly measured a ~10 m sea-level difference → idea shelved).
  Ch2 the spark: Ferdinand de Lesseps, friend of Said Pasha, concession 1854, ground broken at Port Said 25 April 1859; Britain
  opposed. Ch3 the dig: forced labour (corvée), tens of thousands of Egyptian fellahin digging by hand, many deaths (numbers
  disputed — say "thousands" unless a source is firm, and flag dispute); fresh-water canal; 1863–64 Ismail Pasha / Napoleon III
  arbitration ends corvée → machines: steam dredgers and excavators did most of the later digging; cholera 1865. Ch4 the
  turning point: opening, Lake Timsah / Ismailia, Bitter Lakes, sea water meets; first ships; Egypt's debt → 1875 Ismail sells
  his shares to Britain (Disraeli, £4 million, Rothschild loan). Ch5 after & today: 1956 crisis briefly, 2021 Ever Given
  blocked it for six days; ~12 % of world trade (verify current figure, phrase carefully). Ending: one comment question +
  subscribe call. Don't repeat the Aida myth (Verdi's Aida was not written for the opening). VERIFY every number/date on ≥ 2
  sources (Suez Canal Authority, Britannica, Wikipedia, Smithsonian / History.com, academic).
- **Viewer should feel:** "A 10-year, hand-dug-then-machine-dug ditch rewired the whole planet — and Egypt paid the price."
- **Cold open:** inside the opening day (no chapter card first), the question it answers at the end.
- **Budget:** `elevenlabs_chars.warning: true` (243,238 / 231,442) → narration **4,300–4,450 chars** (hard max 5,400),
  40–50 scenes, `chapter` every 8–12 scenes, each chapter ends pulling into the next.
- **Look:** sets `desert`, `coast`, `sea`, `city` (Port Said), `interior` (Paris office / London Parliament), `night`;
  maps (Europe–India routes around Africa vs through Suez), timeline 1798→1869→1875→2021, dredger machines, crowds of
  diggers with baskets, the convoy. New types in own files `scenes/studio/shots/sz_*.js` (e.g. sz_dig.js trench with
  baskets, sz_dredger.js steam dredger with chain buckets, sz_convoy.js ships in the ditch, sz_route.js two routes on a
  globe). ≥ 4 close-ups (zoom ≥ 1.6). Kaşif host 15–25 %. On-screen `source` ≥ 3. Real archival photos via
  tools/media.py welcome (1869 opening, dredgers; `--name sz-...`, sepia, credit).

## Writer — narration, fact check, shot list, cover

**File:** `videos/2026-11-15/ag-03-suez-canal.json` · 47 scenes · 6 chapters (cold open + CHAPTER 1–6 / 6) · **4,363 narration chars**
(budget 4,300–4,450, warning respected) · est. ~5:20 · palette `ag-dusk` (Mawson was `ag-slate`) · new shot file
`scenes/studio/shots/sz_suez.js` (sz_harbor, sz_canal, sz_aerial, sz_dig, sz_memory, sz_water, sz_dredger, sz_levels, sz_survey,
sz_ancient, sz_paper, sz_beach, sz_camp, sz_route). Kaşif in 10/47 scenes (21 %), close-ups 4 (zoom 1.6), on-screen sources 10.

**Title:** Suez Canal: How Did a Ditch in the Sand Rewire the World? · **Cover:** "SHIPS IN / THE DESERT" (highlight DESERT)

### Narration (written first, one piece)

It's the night of the sixteenth of November, 1869, and a British warship is sliding through a crowded harbor with every single light switched off. By sunrise, it sits right in front of the French empress's yacht. Tomorrow, the whole world wants to watch ships sail straight through a desert. So how did a ditch in the sand change the map of the planet? And who paid for it? Let me show you. Before 1869, a ship from London to India had to go all the way around Africa. That meant months at sea, and the storms off the Cape of Good Hope. And here's the crazy part. A canal across Egypt would be only about a hundred and twenty miles long. The pharaohs had already dug a canal from the Nile to the Red Sea, but in the year 775, a caliph had it filled in on purpose. Then, in 1798, Napoleon invaded Egypt, and his engineers measured the two seas. Their answer? The Red Sea was about ten meters higher. Cut through, and you might flood Egypt. They were wrong. The two seas sit at almost the same level. But that one bad number kept the idea buried for decades, until a Frenchman with a lot of charm showed up. His name was Ferdinand de Lesseps. He wasn't an engineer. He was a diplomat. What he had was a friend: Said Pasha, the new ruler of Egypt. In 1854, Said gave him the right to build the canal, and Egypt would supply the workers. Britain hated the idea. A French canal on the road to India? Never. So Lesseps sold shares, mostly to the French public, and simply started. On the twenty-fifth of April 1859, on a strip of beach that would become Port Said, he swung the first pickaxe. He promised six years. It took ten. But the hardest question was who would do the digging. Egypt had an old system called the corvée. Peasants could be ordered to work for the state, a month at a time. So tens of thousands of fellahin were marched into the desert at once, far from their own fields. They dug with picks and bare hands, and carried the wet sand up the banks in baskets on their backs. Now think about that heat. At first, even drinking water came by camel, until a second canal brought it from the Nile. How many died? Nobody knows. Historians say many thousands, maybe tens of thousands. The famous number, one hundred and twenty thousand, has no records behind it. Then, in 1863, the new ruler, Ismail Pasha, moved to end the forced labor. Lesseps was furious, and Emperor Napoleon the Third himself had to settle the fight. Egypt was ordered to pay the company a fortune. But with the diggers gone, the company needed something new. Steam. Hundreds of steam dredgers and excavators, many built just for this desert. Chains of iron buckets scooped up the mud and dumped it on the banks, day and night. In total, about seventy-five million cubic meters of sand were moved, and machines did roughly three quarters of it. Even then, the desert fought back. In 1865, cholera swept through the camps, and work slowed down. But by the summer of 1869, it was done. For the first time ever, a ship could sail straight from one sea to the other. Which brings us back to that dark harbor. Remember that sneaky British ship? The warship was HMS Newport, and her captain, George Nares, had grabbed first place in the dark. The channel was too narrow to pass. So the empress Eugénie, on the yacht L'Aigle, had to follow a British ship through France's big triumph. The Navy scolded Nares in public, and quietly thanked him. And the canal worked. The trip from Europe to Bombay became about forty percent shorter. But who paid for it? But here's the twist. Egypt had paid a huge part of the bill, with borrowed money. By 1875, it was drowning in debt, and its ruler had to sell his shares. Britain's prime minister, Benjamin Disraeli, borrowed four million pounds from the Rothschild bank and bought them. So the country that hated the canal ended up owning a big part of it. In 1956, Egypt took the canal back, and a war followed. And in March 2021, one giant ship, the Ever Given, got stuck sideways and blocked it for six days. Hundreds of ships waited, because more than a tenth of world trade squeezes through this one ditch in the sand. So here's my question: should we remember this canal as Lesseps's triumph, or as the work of diggers whose names nobody wrote down? Tell me in the comments, and subscribe to Stickstory for more stories of how the world was built.

### Fact check (each key fact on ≥ 2 sources)

| Claim in narration | Sources |
|---|---|
| Opened 17 Nov 1869 at Port Said; L'Aigle with Empress Eugénie officially first | Britannica (History), HISTORY.com "Suez Canal", Dawlish Chronicles |
| HMS Newport (Cdr George Nares) slipped through the crowded anchorage at night with no lights and sat in front of L'Aigle; officially reprimanded, unofficially thanked | Dawlish Chronicles (Newport/Nares), HISTORY.com ("HMS Newport was actually first … under cover of darkness") |
| Canal ~120 miles (~164 km) | HISTORY.com (120 miles), CNRS (164 km map caption) |
| Ancient canal (c. 1850 BCE onward), deliberately filled in in 775 by the Abbasids | Britannica (History) — single source; phrased only as "a caliph had it filled in" |
| Napoleon's survey (Le Père, 1798–1801) put the Red Sea ~10 m (33 ft) higher; wrong | Britannica (History); HISTORY.com (1830s Linant survey found seas at same level) |
| 1854 concession from Said Pasha; Egypt to supply labour; Lesseps a diplomat, not an engineer | Britannica, HISTORY.com, CNRS |
| Britain opposed; shares sold mostly in France (500 francs each, France 52 %) | Britannica (shares, 52 %), HISTORY.com 9 facts (Palmerston clashed with Lesseps) |
| Ground broken 25 April 1859 at the future Port Said; planned 6 years, took 10 | HISTORY.com "this day" (25 April 1859), Britannica (10 years instead of 6) |
| Corvée: peasants drafted a month at a time; tens of thousands at once | CNRS (400,000 mobilised 1859–62, one-month rotation), HISTORY.com 9 facts (tens of thousands dug by hand) |
| Water first by camel, then the fresh-water canal from the Nile (finished 1863) | Britannica (freshwater canal 1863); camel transport widely reported — kept general |
| Deaths: unknown, "many thousands, maybe tens of thousands"; 120,000 has no records behind it | CNRS (Caroline Piquet: tens of thousands; Nasser's 120,000 not supported by archives), HISTORY.com ("tens of thousands believed") — **disputed, phrased honestly** |
| 1863 Ismail Pasha moved to end forced labour; Napoleon III arbitrated; Egypt paid compensation | HISTORY.com 9 facts (Ismail banned forced labour 1863), CNRS (Napoleon III arbitration), ICCA arbitration record — amount (84 m francs) deliberately not stated |
| Hundreds of steam dredgers/excavators; ~75 million m³; ~3/4 by machine | HISTORY.com 9 facts; Britannica (dredgers and steam shovels did later work) |
| Cholera 1865 slowed work | Britannica (History) |
| Finished summer 1869 (Britannica: completed August 1869) | Britannica |
| Europe–Bombay ~40 % shorter | Transport Geography (Rotterdam–Mumbai −41 %) |
| 1875 Ismail sold his shares (176,602) to Britain; Disraeli; £4 million Rothschild loan | Britannica (176,602 shares, 1875), Rothschild Archive (£4 m, Disraeli) |
| 1956: Egypt took the canal back (nationalisation), war followed | Britannica, CNRS |
| Ever Given, March 2021, six days (23–29 March), hundreds (≥ 369) of ships waiting | Al Jazeera 29 Mar 2021, HISTORY.com ("nearly a week", >100 ships each end) |
| "More than a tenth of world trade" | Al Jazeera (≈15 % of world shipping traffic); other outlets cite ~12 % → phrased as "more than a tenth" |
| Aida myth | not mentioned (avoided) |

### Shot list

**Cold open (dark harbor, 16 Nov 1869)**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 0 | sz_harbor | It's the night of the sixteenth of November, 1869, and a British warship is sliding through a crowded harbor with every single light switched off. | Night at Port Said: dark water, four moored steamships glow with gold lanterns and their reflections; one blac… | switched,light | wide/auto |  |
| 1 | sz_harbor | By sunrise, it sits right in front of the French empress's yacht. | Dawn at the canal mouth: a lighthouse on the breakwater at left; the white imperial yacht with flags in the mi… | front,empress | close 1.6 |  |
| 2 | sz_canal | Tomorrow, the whole world wants to watch ships sail straight through a desert. | Wide desert: a narrow strip of blue water runs straight across the sand; masts, funnels and flags of steamship… | desert,whole | wide/auto |  |
| 3 | stage | So how did a ditch in the sand change the map of the planet? And who paid for it? Let me show you. | The fez narrator on the desert bank of the canal, hand on chin, then holds up a sign 'HOW?' on 'map', then poi… | map,paid,show | wide/auto | yes |

**Ch1 The Long Way Round**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 4 | chapter | Before 1869, a ship from London to India had to go all the way around Africa. | CHAPTER 1 / 6 card: blue disc with 1, title 'The Long Way Round'.… | Before,Africa | wide/auto |  |
| 5 | sz_route | That meant months at sea, and the storms off the Cape of Good Hope. | Full-frame old chart of the Atlantic, Africa and India: a red dashed route draws from London down past West Af… | months,storms | wide/auto |  |
| 6 | sz_route | And here's the crazy part. A canal across Egypt would be only about a hundred and twenty miles long. | Close-up of the same chart on Egypt: the Mediterranean above, the Nile in blue, the Gulf of Suez below; a red … | crazy,canal,miles | wide/auto |  |
| 7 | sz_ancient | The pharaohs had already dug a canal from the Nile to the Red Sea, but in the year 775, a caliph had it filled in on purpose. | From above: the Nile with green banks at left, the Red Sea at right, and an ancient canal between them with a … | pharaohs,filled | wide/auto |  |
| 8 | sz_survey | Then, in 1798, Napoleon invaded Egypt, and his engineers measured the two seas. | Desert: a French engineer in a bicorne peers through a levelling instrument on a tripod; far right a peasant h… | 1798,measured | wide/auto |  |
| 9 | sz_levels | Their answer? The Red Sea was about ten meters higher. Cut through, and you might flood Egypt. | Cross-section of the isthmus: the Mediterranean basin at left, the Red Sea basin at right drawn much higher, a… | higher,flood | wide/auto |  |
| 10 | sz_levels | They were wrong. The two seas sit at almost the same level. But that one bad number kept the idea buried for decades, until a Frenchman with a lot of charm showed up. | The same cross-section: on 'wrong' the Red Sea drops down to the same level as the Mediterranean, a green dash… | wrong,level,buried | wide/auto | yes |

**Ch2 The Friend of the Pasha**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 11 | chapter | His name was Ferdinand de Lesseps. He wasn't an engineer. He was a diplomat. | CHAPTER 2 / 6 card: blue disc with 2, title 'The Friend of the Pasha'.… | Lesseps,diplomat | wide/auto |  |
| 12 | stage | What he had was a friend: Said Pasha, the new ruler of Egypt. | A palace room: Ferdinand de Lesseps (short beard) and Said Pasha (turban) stand face to face and talk; label '… | friend,Said | wide/auto |  |
| 13 | sz_paper | In 1854, Said gave him the right to build the canal, and Egypt would supply the workers. | Close on a desk: a big scroll unrolls, the heading 'Concession · 1854' writes itself, lines of handwriting fol… | workers | wide/auto |  |
| 14 | stage | Britain hated the idea. A French canal on the road to India? Never. | A London room: a grey-bearded British statesman shakes his fist and holds up a sign 'NEVER!' on 'Never'.… | Britain,Never | wide/auto |  |
| 15 | sz_paper | So Lesseps sold shares, mostly to the French public, and simply started. | Close on the desk: share certificates of the canal company fan out one after another; note '500 francs each'.… | shares,started | wide/auto |  |
| 16 | sz_beach | On the twenty-fifth of April 1859, on a strip of beach that would become Port Said, he swung the first pickaxe. | A flat beach by the sea: Lesseps in a top hat raises a pickaxe and strikes the sand on 'pickaxe', sand bursts … | twenty,pickaxe | close 1.6 |  |
| 17 | stage | He promised six years. It took ten. But the hardest question was who would do the digging. | On the beach the fez narrator holds up a sign '6 YEARS?', then on 'ten' the sign turns to '10', and he shrugs … | ten,digging | wide/auto | yes |

**Ch3 The Diggers**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 18 | chapter | Egypt had an old system called the corvée. Peasants could be ordered to work for the state, a month at a time. | CHAPTER 3 / 6 card: blue disc with 3, title 'The Diggers'.… | corv,month | wide/auto |  |
| 19 | sz_dig | So tens of thousands of fellahin were marched into the desert at once, far from their own fields. | Across the desert a long column of peasants in wrapped caps walks to the dig, some with picks on their shoulde… | tens,fields | wide/auto |  |
| 20 | sz_dig | They dug with picks and bare hands, and carried the wet sand up the banks in baskets on their backs. | Cut-away of the trench: at the bottom diggers swing picks into the wet sand; on the left bank a line of carrie… | picks,baskets | wide/auto |  |
| 21 | sz_water | Now think about that heat. At first, even drinking water came by camel, until a second canal brought it from the Nile. | Along the dig a camel caravan carries red water jars, led by a man on foot; on 'canal' a blue fresh-water cana… | heat,camel,canal | wide/auto |  |
| 22 | title | How many died? Nobody knows. | Giant words 'Nobody' / 'knows' word by word, 'knows' in a red box; handwritten note '120,000? no records'.… | died,knows,many | wide/auto |  |
| 23 | board | Historians say many thousands, maybe tens of thousands. The famous number, one hundred and twenty thousand, has no records behind it. | Pinned board 'The death toll': card 'Historians' with ✓ 'many thousands' and 'maybe tens of thousands'; card '… | many,tens,famous,records | wide/auto |  |
| 24 | stage | Then, in 1863, the new ruler, Ismail Pasha, moved to end the forced labor. | A palace room: Ismail Pasha (turban, black beard) raises his hand and holds up a sign 'NO FORCED LABOR' on 'en… | Ismail,end | wide/auto |  |
| 25 | board | Lesseps was furious, and Emperor Napoleon the Third himself had to settle the fight. Egypt was ordered to pay the company a fortune. | Pinned board 'Who pays?': card 'Egypt' with ✓ forced labor ends and ✗ pays the company; card 'The company' wit… | Napoleon,settle,fortune | wide/auto |  |
| 26 | sz_dig | But with the diggers gone, the company needed something new. | The trench lies empty: abandoned baskets and picks half buried, sand blowing across; far away on 'new' a black… | gone,needed | wide/auto |  |

**Ch4 The Machines**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 27 | chapter | Steam. | CHAPTER 4 / 6 card: blue disc with 4, title 'The Machines'.… | Steam,Steam | wide/auto |  |
| 28 | sz_dredger | Hundreds of steam dredgers and excavators, many built just for this desert. | A steam dredger floats in the channel: a tall frame holds a long ladder down into the water with a chain of ir… | dredgers,desert | wide/auto | yes |
| 29 | sz_dredger | Chains of iron buckets scooped up the mud and dumped it on the banks, day and night. | Close on the bucket chain: iron buckets rise out of the water full of wet sand, mud splashes, and the load sli… | buckets,night | wide/auto |  |
| 30 | title | In total, about seventy-five million cubic meters of sand were moved, and machines did roughly three quarters of it. | Giant words '75 million' / 'cubic meters' word by word, '75' in a red box; note '3/4 by machine'.… | seventy,machines | wide/auto | yes |
| 31 | sz_camp | Even then, the desert fought back. In 1865, cholera swept through the camps, and work slowed down. | Night over the work camp: a row of tents glows gold from lanterns inside; one by one the lanterns go out; note… | cholera | wide/auto |  |
| 32 | sz_canal | But by the summer of 1869, it was done. For the first time ever, a ship could sail straight from one sea to the other. | Side view of the finished dry channel through the desert; on 'done' sea water rushes in from the left with foa… | summer,done,straight | wide/auto |  |
| 33 | stage | Which brings us back to that dark harbor. Remember that sneaky British ship? | Night harbor again: the fez narrator on the quay looks out through a spyglass, then points at a dark ship on '… | harbor,sneaky | close 1.6 | yes |

**Ch5 Opening Day**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 34 | chapter | The warship was HMS Newport, and her captain, George Nares, had grabbed first place in the dark. | CHAPTER 5 / 6 card: blue disc with 5, title 'Opening Day'.… | warship,dark | wide/auto |  |
| 35 | sz_canal | The channel was too narrow to pass. So the empress Eugénie, on the yacht L'Aigle, had to follow a British ship through France's big triumph. | The procession in the desert canal: the dark British gunboat leads, the white imperial yacht with flags follow… | narrow,Aigle | wide/auto |  |
| 36 | stage | The Navy scolded Nares in public, and quietly thanked him. | A navy office: a grey-bearded admiral wags a finger at Captain Nares (beret, black beard), then smiles and sha… | Nares,thanked | wide/auto |  |
| 37 | sz_route | And the canal worked. The trip from Europe to Bombay became about forty percent shorter. But who paid for it? | The world chart again: the old route around Africa stays as a faint grey line, and a new red route draws from … | worked,forty,paid | wide/auto |  |

**Ch6 Who Paid?**

| # | type | sentence | visual | cues | camera | Kaşif |
|---|---|---|---|---|---|---|
| 38 | chapter | But here's the twist. Egypt had paid a huge part of the bill, with borrowed money. | CHAPTER 6 / 6 card: blue disc with 6, title 'Who Paid?'.… | twist,borrowed | wide/auto |  |
| 39 | sz_paper | By 1875, it was drowning in debt, and its ruler had to sell his shares. | Close on a desk: a ledger opens, lines of figures write themselves, the last ones in red; stacks of bills pile… | debt,sell | wide/auto |  |
| 40 | stage | Britain's prime minister, Benjamin Disraeli, borrowed four million pounds from the Rothschild bank and bought them. | A London room: Benjamin Disraeli (short beard) holds up a sign '£4,000,000' on 'four', then points at it on 'b… | four,Rothschild,bought | wide/auto |  |
| 41 | stage | So the country that hated the canal ended up owning a big part of it. | A London street: the fez narrator spreads his hands in an ironic shrug, then holds up a sign 'BRITAIN?!' on 'o… | hated,owning | wide/auto | yes |
| 42 | timeline | In 1956, Egypt took the canal back, and a war followed. | Horizontal timeline: '1798 / the wrong survey', '1859 / first pickaxe', '1869 / opening', '1875 / shares sold'… | Egypt,war | wide/auto | yes |
| 43 | sz_aerial | And in March 2021, one giant ship, the Ever Given, got stuck sideways and blocked it for six days. | From above: the blue canal between sand banks; a giant container ship with rows of coloured containers lies we… | Ever,six | close 1.6 |  |
| 44 | sz_aerial | Hundreds of ships waited, because more than a tenth of world trade squeezes through this one ditch in the sand. | Far above the canal: a long line of ship shapes queues at both ends of the blocked spot, more appearing; note … | Hundreds,trade | wide/auto |  |
| 45 | sz_memory | So here's my question: should we remember this canal as Lesseps's triumph, or as the work of diggers whose names nobody wrote down? | Desert at dusk: at left a big statue of Lesseps on a stone plinth; at right, one by one, a row of faint digger… | Lesseps,diggers,names | wide/auto | yes |
| 46 | stage | Tell me in the comments, and subscribe to Stickstory for more stories of how the world was built. | By the canal the fez narrator points at the viewer on 'comments', then waves goodbye on 'subscribe'; a steamsh… | comments,subscribe | wide/auto | yes |

### Cover candidates
1. **"SHIPS IN / THE DESERT"** — scene 2 (desert canal, steamship gliding behind gold dunes), Kaşif shocked right. **Chosen**: the one image that
   says the paradox in one look; reads at thumbnail size; one object (ship in sand).
2. "DUG BY / HAND" — scene 20 trench close: diggers too small and thin at thumbnail size, no single object → rejected.
3. "ALL LIGHTS / OFF" — scene 0 dark warship: strong mystery but the dark hull reads as a blob and doesn't say "Suez" → rejected.

Open notes: the headline step fell back to the anniversary hook (news.py proxy 403, per brief).

### Writer — round 1 fixes (after critic round 1)
- Chapter cards now hold one short line each ("Before 1869," / "His name was Ferdinand de Lesseps." / "Egypt had an old system called the corvée." /
  "The warship was HMS Newport." / "But here's the twist."). The rest moved to new scenes that show it: Lesseps's study with a DIPLOMAT sign (close-up 1.6),
  `sz_corvee` (an official reads a decree, peasants drop their hoes and line up, stamp "1 MONTH"), a close-up `sz_harbor` of the dark warship labelled
  HMS Newport / Captain George Nares (push 1.6). The debt scene now carries "Egypt had paid… borrowed money." 50 scenes, 4,359 characters.
- New `sz_room` (in sz_suez.js) replaces the 5 grey `stage` rooms. Each room has its own identity and a foreground layer:
  - study: bookshelf, turning globe, desk edge
  - Said's palace: arches, divan, swinging lamp, rug
  - House of Commons: green benches full of members, front bench
  - Ismail's throne room: big arch, gilded chair, palms, rug
  - Admiralty: wall chart, ship model, desk; the admiral (bicorne) wags a finger, then on "thanked" both smile and shake hands (checked at t=249.5)
  - Disraeli's London study: fireplace with flickering fire, portrait, money bag; close-up 1.6

  "NEVER!" is on screen at "Never." (checked at t=103.6). The "Said Pasha" label is now serif, size 84.
- Cover: 3 new candidates, all at zoom 2.0–2.2 at t=1.0, before the crowd rises in (scene 2 crowd now enters on "whole"):
  (a) dark steamer: hull mostly lost in the dunes; (b) **white yacht half-buried in the dune line, big shocked Kaşif looking at it: chosen**; (c) "A SHIP IN THE SAND"
  with Kaşif pointing: weaker emotion. Scene 1: yacht_x 0.5 / gun_x 0.8, focus [1240, 640], so both ships are in shot.

### Writer: round 2 polish
- Scene 37: "HMS Newport" and "Captain George Nares" are now in paper-light on the open sky at x 0.66; the moored ships moved left and the warship ends at x 0.48, so no mast crosses the text.
- Scene 43: the "Rothschild loan" label sits left of Disraeli, clear of the sign and the fireplace.
- Scene 12: Lesseps is smaller and the camera focus is lower, so the DIPLOMAT sign is fully in frame.
- Scene 15: the speaker stands in the centre, with a close-up at 1.6 and curved, shaded bench tiers. "NEVER!" goes up on "India?" and stays through "Never." to the end of the scene (checked at t=102.9 and 103.7).
- Scene 26: the throne is smaller and moved to the right; Ismail stands in front of the arch, and his sign is clear of the throne.
- Scene 45: Kaşif points up at 1956 from "Egypt" onward. (`dir` must be numeric in `timeline`; the string "up" broke the rig.)
- Scene 41: "Here's the twist." The narration is now 4,355 characters.

## Eleştiri günlüğü

### ag-03-suez-canal — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 6 | 9 | 6 | 7 | 7 | 9 | 9 | 7 |
1. Sahne 4, 11, 18, 34 (chapter): 6–8 sn'lik kilit anlatım boş bölüm kartının üstünde geçiyor — Lesseps'in tanıtımı ("He wasn't an engineer. He was a diplomat."), corvée'nin tanımı ve videonun ana sırrının cevabı ("HMS Newport… George Nares") hiç görüntülenmiyor. → Bölüm kartının metnini 1 kısa cümleye indir (ya da kartı tek kelimelik ana bırak); Lesseps cümlelerini bir `stage` portresine (Lesseps + "DIPLOMAT" tabelası), Newport/Nares cümlesini karanlık savaş gemisine yakın plan `sz_harbor` sahnesine ("HMS Newport" etiketi, `camera` push) taşı.
2. Sahne 12, 14, 24, 36, 40 (iç mekân `stage`): beşi de aynı gri duvar + havada asılı gri pencere dikdörtgeni, küçük figürler, alt üçte bir boş — "boş kâğıt üstünde slayt" görünümü, iç mekânlar birbirinden ayırt edilmiyor. Sahne 14'te "NEVER!" tabelası "Never." karesinde görünmüyor; sahne 36'da gülümseyip el sıkışma yok; sahne 12'de "Said Pasha" etiketi soluk ve küçük. → Her odaya kimlik ver (Said: kemerli saray + divan; Londra: masa + şömine; Amirallik: masa + duvar haritası), ön plan (masa önü/zemin) indir, en az ikisinde `camera` yakın plan (zoom ≥ 1,6); `seq`/`then` zamanlamalarını preview'da `--times` ile kontrol et.
3. Kapak: gemi küçük ve sağ yarının yumuşak solmasında eriyor, alttaki kesik kalabalık kafaları ikinci bir odak yaratıyor, çöl turuncu bir leke gibi okunuyor; telefonda "çölde gemi" fikri bir bakışta anlaşılmıyor. Ayrıca sahne 1'de imparatorluk yatı sol kenardan kesik (kapanış cümlesinin öznesi). → `focus`'u gemi gövdesi + kum çizgisine al (zoom ~2.0–2.2), kalabalığın kadraja girmediği bir an/sahne seç, Kaşif'i büyüt ve gemiye bakan şok yüzüyle yaklaştır; 3 aday üret ve karşılaştır. Sahne 1'de `yacht_x`'i sağa kaydır ya da `camera.focus`'u yat + gambotu birlikte alacak şekilde düzelt.

### ag-03-suez-canal — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 9 | 7 | 8 | 7 | 9 | 9 | 8 |
Tur 1'in üç sorunu büyük ölçüde çözüldü: bölüm kartları kısa, Lesseps/corvée/Newport sahneleri görüntüleniyor, odaların her biri farklı, kapak temiz (kuma gömülü beyaz yat + büyük şok Kaşif, tek odak). Kalanlar:
1. Yazı çakışması ve kontrast: sahne 37'de kırmızı "HMS Newport" lacivert gece göğünde zor okunuyor, "Captain George Nares" yazısının üstünden direk çizgisi geçiyor; sahne 43'te "Rothschild loan" etiketi "£4,000,000" tabelasına ve şömineye biniyor; sahne 12'de (yakın plan) "DIPLOMAT" tabelası kadrajın üst kenarına değiyor. → 37: etiketi gemi direklerinden uzak, boş göğe (ör. x 0.7) koy, açık kâğıt tonunda ya da kâğıt zeminli yaz; 43: etiketi portrenin altına/sol üste taşı; 12: tabelayı aşağı indir ya da `focus` y'sini yukarı al.
2. Sahne 15 (House of Commons): kontak sayfasında "Never." altyazısının olduğu karede "NEVER!" tabelası yok (yazarın t=103.6 kontrolüne rağmen); sıralar düz yeşil şerit deseni gibi duruyor, konuşan adam sıra çizgilerinin önünde kaybolmuş. → tabelayı "Never" kelimesinden sahne sonuna kadar ekranda tut ve `--times` ile sahnenin son 0,5 sn'sinde tekrar kontrol et; konuşmacıyı öne/ortaya al (zoom 1.6), sıra çizgileri onun bacaklarının arkasında kalsın.
3. Sahne 26 (İsmail'in taht odası): taht İsmail'den büyük ve önünde, İsmail sol kenara sıkışmış, "NO FORCED LABOR" tabelası tahtın üstüne biniyor; ilk karede "Ismail Pasha · 1863" etiketi küçük. Ayrıca sahne 45 (timeline) köşede küçük, hiçbir şey yapmayan Kaşif (seyirci) ve anlatımda sahne 40→41 "But who paid for it? But here's the twist." art arda iki "But". → İsmail'i tahtın önüne/ortaya al, tahtı arkaya küçült; Kaşif'i timeline'dan çıkar ya da 1956'yı işaret ettir; 41'i "Here's the twist." yap.
