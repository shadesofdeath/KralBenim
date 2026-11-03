# ag-02-stomach-window — Stickstory Short (the human body)

- **File:** `videos/2026-11-03/ag-02-stomach-window.json` · format short · publish_at `2026-11-03T19:00:00-05:00` (Istanbul 04.11 03:00)
- **Category:** the human body (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403/502); no usable current headline via web search → **category pool** (report says so).
- **Topic:** Alexis St. Martin and William Beaumont. 6 June 1822, Fort Mackinac (Michigan): a musket fires at close range into young
  voyageur Alexis St. Martin's side. Army surgeon William Beaumont saves him, but the wound heals into a permanent hole (gastric
  fistula) into the stomach. Beaumont lowers food on a silk string into it and pulls it out hours later; takes gastric juice out:
  proves digestion is chemical (acid), not grinding/rotting. Book 1833 "Experiments and Observations on the Gastric Juice". St. Martin
  lived to 1880 (age ~78), outliving Beaumont (d. 1853). Writer verifies all dates/numbers; handle the ethics honestly
  (St. Martin was bound by contract, ran away to Canada) without gore.
- **Viewer should feel:** "We learned how our stomach works through a hole in one man's side."
- **Hook (3–8 words, same idea as cover):** e.g. "This man had a window into his stomach." ↔ cover "A HOLE / INTO HIS STOMACH" (highlight "hole").
- **Cover idea:** big Kaşif in shock, pinching a silk string with a dangling chunk of meat; no gore. One subject.
- **Punchline:** complete standalone line + one short subscribe line with reason.
- **Related long video:** `videos/2026-10-24/ag-04-phineas-gage.json` (another 19th-century accident that taught medicine) — put in `youtube.related`.
- **Budget warning (ElevenLabs warning: true):** narration 400–440 chars.
- **Palette:** `ag-slate` (differs from ag-01 today); sets: `coast` (Mackinac island trading post) → `interior` (surgeon's room).

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration (one flowing text, 440 chars)
This man had a hole into his stomach. In 1822, a musket fired by accident, and hit a young fur trader, Alexis St. Martin.
Doctor William Beaumont saved him, but the wound never closed. So Beaumont tied food to a silk string, dropped it in, and
pulled it out hours later. The food wasn't ground up. Acid had dissolved it. St. Martin hated it, but his side taught the
world how digestion works. Subscribe for a true story like this every day.

### Shot list (10 scenes; new shot file `scenes/studio/shots/sw_stomach.js`; Kaşif 2/10 = 20 %)
| # | Line | Type | Set / camera | Visual |
|---|---|---|---|---|
| 0 | This man had a hole into his stomach. | sw_belly | interior, push | Close on the healed side: gauze pad, small round dark opening, red ring on "hole"; Kaşif big in shock, silk string with meat in hand (cover frame) |
| 1 | In 1822, a musket fired by accident, | sw_island | coast, pan right | Fort Mackinac on its bluff, fur company store; muzzle flash + smoke from the door on "fired"; "1822", "MACKINAC ISLAND" |
| 2 | and hit a young fur trader, Alexis St. Martin. | sw_room store | interior, push | Furs, blankets, counter; musket flashes, St. Martin knocked back on "hit"; stamp "ALEXIS ST. MARTIN" |
| 3 | Doctor William Beaumont saved him, but the wound never closed. | sw_room clinic | interior | St. Martin sits bandaged, Beaumont points; window opens on "closed", "STILL OPEN" |
| 4 | So Beaumont tied food to a silk string, | sw_belly | **close-up** focus [500, 900] ×1.6 | Army-coat hand holds the string; meat, bread, cabbage leaf pop on |
| 5 | dropped it in, and pulled it out hours later. | sw_cut drop | no set (full-frame cutaway) | Food slides through the fistula into the stomach, clock spins, food comes out smaller |
| 6 | The food wasn't ground up. Acid had dissolved it. | sw_cut acid | push ×1.2 | Millstones crossed out on "ground"; gold juice, bubbles, food shrinks; "ACID" |
| 7 | St. Martin hated it, | sw_island | coast | St. Martin stomps toward a canoe, Beaumont with notes; "~200 TESTS" |
| 8 | but his side taught the world how digestion works. | sw_book | interior desk | 1833 book: "GASTRIC JUICE / 1833", stomach sketch draws itself, gold rings on "world" |
| 9 | Subscribe for a true story like this every day. | sw_island | coast, pull | Kaşif waves, then points; fort flag, canoe |

### Cover candidates
1. Scene 0 (old beach version): Kaşif + St. Martin full figures, small patch: two subjects, the hole too small. Rejected.
2. Scene 0 with focus on the patch ×1.35: St. Martin's head cut, flat. Rejected.
3. Scene 4 "FOOD WENT IN THE HOLE" + Kaşif shock overlay: strong, but not the hook frame. Rejected.
4. **Chosen:** scene 0, t 1.6, "HOLE IN / HIS STOMACH" (highlight "hole"): big round opening in a gauze pad with a red ring + big
   shocked fez host with the meat on a string. One subject, readable small.

## Facts (verified)
- 6 June 1822, American Fur Company store, Mackinac Island (Michigan); musket went off by accident ~3 feet away, hit St. Martin's
  left side; wound healed into a permanent opening (fistula) with an inner flap. — https://www.sciencehistory.org/stories/magazine/probing-the-mysteries-of-human-digestion , https://en.wikipedia.org/wiki/William_Beaumont
- Food tied to a silk string, put in through the opening, pulled out at intervals (hours) to check digestion; gastric juice
  "very perceptibly acid" (hydrochloric acid, Prout 1824); ~200 experiments over ~10 years. — Science History Institute
- Book: *Experiments and Observations on the Gastric Juice, and the Physiology of Digestion* (1833). — Wikipedia (Beaumont)
- St. Martin left for Canada without Beaumont's consent, came and went several times. — Science History Institute
- St. Martin born 8 April 1802, died 24 June 1880 (78), Saint-Thomas, Quebec; Beaumont died 1853 (67). — https://en.wikipedia.org/wiki/Alexis_St._Martin
- Not used on screen: exact age at the shooting (sources say 19–20 → narration says "young").

### Narration v2 (after critic round 1, 438 chars)
This man had a hole in his stomach. In 1822, a musket went off and hit fur trader Alexis St. Martin. William Beaumont saved
him, but the wound never closed. So he tied food to a silk string, dropped it in, and pulled it out hours later. It wasn't
ground up. Acid dissolved it. St. Martin hated being a test subject and fled to Canada. But that hole taught the world how
your stomach works. Subscribe for a true story like this every day.
(Shot changes: scene 0 = St. Martin in side profile with the round pad under his ribs + Kaşif's string with meat above the
hole, cover from this frame with focus [470, 1080] ×1.1; scene 7 = St. Martin paddles off in the canoe, Beaumont left on the
sand, "to Canada"; scene 4 = round pad, hand at ~1/3 height, foods hang one under the other, shirt hem + belt + trousers fill the
bottom. "Outlived his doctor" twist (1880 vs 1853, verified) did not fit the 440-char budget.)

## Eleştiri günlüğü

### ag-02-stomach-window — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 6 | 7 | 6 | 7 | 6 | 8 | 8 | 9 | 7 | 6 |
1. Scene 0 + cover: no man, no stomach → St. Martin drawn in side profile (beret, arm up, shirt bunched), round pad with the hole under the ribs; Kaşif arm out, string with meat just above the hole; hook "a hole in his stomach"; cover re-rendered from this frame. **Fixed.**
2. Scene 7 + ending lacked the human beat → "hated being a test subject and fled to Canada", canoe pushing off with Beaumont left on shore, round patch; punchline "But that hole taught the world how your stomach works."; cut "Doctor"/"young". **Fixed.**
3. Scene 4 hand cropped, food piled, empty bottom; scene 1 stamp clash + weak flash → hand at ~0.33 H, foods hang vertically, hem/belt/trousers fill the bottom; "1822" at (0.72, 0.30), flash ×1.8 for 0.7 s. Also "STILL OPEN" at (0.5, 0.28), millstones at x 0.75. **Fixed.**

### ag-02-stomach-window — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 7 | 7 | 7 | 8 | 8 | 9 | 8 | 7 |
1. Cover/scene 0: Kaşif not shocked, St. Martin a grey cylinder → scene 0 is now `sw_room` "bare": St. Martin as a normal stick figure (blue cap, uneasy face, open shirt flaps), round pad + hole + pulsing red ring on his side; Kaşif in "point" with a new gasp overlay (wide eye rings, open O mouth, shock ticks), arm out, string + meat on a top layer hanging just above the pad; cover focus [560, 1150] ×1.2 (×1.35 pushed both heads under the cover fade). **Fixed.**
2. Scene 4: no body around the pad → open shirt flaps (with buttons) on both sides of the round pad, belt + trousers fill the bottom. **Fixed.**
3. Scene 7: St. Martin sits in the canoe from the start, on "Canada" it slides right 0.2 W, small round patch, "~200 TESTS" removed. Minor: "1822" stamp at (0.30, 0.26), clear of the source note; muzzle flash now on "musket" (mid-scene, 0.7 s) so it is not cut by the transition. **Fixed.**

## Yönetmen — son kapı
Round 3 (final) scores: script 8, hook 8, readability 8, visual 8, motion 7, composition 7, depth 8, pace 8, accuracy 9, closing 8, cover 8. Lint OK. Cover and sheet checked by director.
