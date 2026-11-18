# ag-02-duff-children — Stickstory Short (survival stories)

- **File:** `videos/2026-11-18/ag-02-duff-children.json` · format short · publish_at `2026-11-18T19:00:00-05:00` (Istanbul 19.11 03:00)
- **Category:** survival stories (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403) → web search: Australia (CBS News / Australian press, 12–13 Nov 2026):
  "Boy found alive after 6 days lost in Australian wilderness" — a 17-year-old found by a police helicopter near Walhalla,
  Victoria. Hook only (no details about the teen); the story is the historic Victorian one below. Not a Google News front page (unreachable) — reported.
- **Topic:** the Duff children, Victoria, 1864. On Fri 12 Aug 1864 Isaac (9), Jane (7) and Frank (nearly 4) went to gather
  broom near their home (Spring Hill station, NW of Horsham, Wimmera) and got lost in the mallee scrub. 30+ locals searched;
  a thunderstorm washed out their tracks; newspapers gave them up for dead. On day 7 their father brought Wotjobaluk
  trackers — Dick-a-Dick (Jungunjinanuke), Jerry and Fred — who found the trail within hours and the children alive after
  ~9 days / 8 nights and ~60+ miles walked. Jane and Isaac carried Frank; on cold nights Jane covered him with her dress.
  (Dick-a-Dick later toured England with the 1868 Aboriginal cricket team — optional twist.) Sources: Monument Australia
  (cairn at Nurcoung), State Library Victoria La Trobe Journal no. 63, Wikipedia Dick-a-Dick, ADB. VERIFY on ≥ 2 sources.
  DON'T state what they ate (wattle gum is a later speculation). Respect: name the trackers, the Wotjobaluk people; no caricature.
- **Viewer should feel:** "A 7-year-old kept her little brother alive, and the people who could read the land found them when everyone else gave up."
- **Hook idea:** first sentence 3–8 words, e.g. "Everyone said these three kids were dead." ↔ cover "GIVEN UP / FOR DEAD" (highlight DEAD) or "LOST 9 DAYS".
- **Budget:** warning true → narration **400–425 chars** (hard max 550), 8–11 scenes.
- **Look:** new types in own file `scenes/studio/shots/dc_*.js` (three small kids walking through mallee scrub, footprints in
  red sand, the storm erasing tracks, a tracker reading a bent twig/footprint close-up, Jane's dress over the sleeping
  brother under stars, the find). Sets `desert`/`field` (Wimmera mallee), `storm`, `night`. Period clothes (1860s), trackers
  drawn with dignity. ≥ 1 close-up. Kaşif host 15–25 %. On-screen `source` ≥ 1. Ends with punchline + one natural subscribe line.

## Writer

### Narration (one piece, 425 chars)
These kids were lost for nine days. In 1864, Isaac, Jane and little Frank wandered into the Australian bush. Over thirty
people searched, but a storm washed away their tracks. On cold nights, seven-year-old Jane covered Frank with her own
dress. So who found them? Three Wotjobaluk trackers, Dick-a-Dick, Jerry and Fred, found the trail within hours. All three
came home alive. Subscribe for a true story like this every day.

(News hook about the Victorian teen found after 6 days left out: it would cost ~60 chars of a tight budget and pull the
focus; the 1864 story stands on its own.)

### Verified facts
- Isaac 9, Jane 7, Frank nearly 4; went to gather broom on Fri 12 Aug 1864 from Spring Hill station (~35 miles NW of
  Horsham); lost nine days and eight nights: State Library Victoria, La Trobe Journal 63; Monument Australia ("nine days").
- 30+ local searchers; a thunderstorm erased the tracks: SLV + Monument Australia ("more than 30 local people").
- Trackers Dick-a-Dick, Jerry, Fred (Wotjobaluk) rediscovered the trail within hours, found the children alive: Wikipedia
  Dick-a-Dick ("within hours"); SLV (Simpson: "Dickey, Jerry and Fred"); Monument Australia ("quickly picked up the tracks").
- Jane covered Frank with her dress on cold nights: SLV + Monument Australia. All three survived: both.
- Not used: what they ate (wattle gum = Fairclough 1896 speculation, SLV); 60+ miles (true in both, cut for budget);
  "search called off / given up for dead" (only Wikipedia; Port Phillip Pioneers says the search went on) → avoided.
- Sources: https://latrobejournal.slv.vic.gov.au/latrobejournal/issue/latrobe-63/t1-g-t7.html ·
  https://www.monumentaustralia.org.au/themes/people/tragedy/display/32976-isacc,-jane-and-frank-duff ·
  https://en.wikipedia.org/wiki/Dick-a-Dick

### Shot list (palette ag-sage; new types in scenes/studio/shots/dc_duff.js)
| # | Text | Type / mode | Set | Camera | Notes |
|---|---|---|---|---|---|
| 0 | These kids were lost for nine days. | dc_bush hook | desert | push | three kids among tall mallee, worried; cover frame |
| 1 | In 1864, Isaac, Jane and little Frank wandered into the Australian bush. | dc_bush walk | field | right | they walk with broom bundles, Frank holds Jane's hand; cards 1864 + names |
| 2 | Over thirty people searched, | dc_search search | hills | left | searchers with lanterns, one calls; kids' prints in front; 30+ SEARCHERS; source SLV |
| 3 | but a storm washed away their tracks. | dc_tracks storm | storm | **close-up** [540,1450] ×1.6 | prints in red sand, rain, lightning, prints fill and vanish; TRACKS GONE |
| 4 | On cold nights, seven-year-old Jane covered Frank with her own dress. | dc_night | night | push | Jane in chemise spreads her blue dress over sleeping Frank; HER OWN DRESS; source Monument Australia |
| 5 | So who found them? | dc_bush ask | desert | pull | **Kaşif** thinks, then points at three figures on the horizon |
| 6 | Three Wotjobaluk trackers, Dick-a-Dick, Jerry and Fred, | dc_search trackers | field | right | three men in single file, leader bends and points; name tags on each name |
| 7 | found the trail within hours. | dc_tracks read | desert | **close-up** [640,1200] ×1.6 | Dick-a-Dick crouches at a print + snapped twig (gold ring), gold trail draws away; WITHIN HOURS |
| 8 | All three came home alive. | dc_search find | field | push | sunrise, tracker kneels offering a hand, Jane stands up with Frank; ALIVE |
| 9 | Subscribe for a true story like this every day. | dc_bush end | hills | pull | **Kaşif** waves, then points; memorial stone; kids walk home far away |

Kaşif 2/10 (20 %). Close-ups: 2. Types: 4 (dc_bush, dc_search, dc_tracks, dc_night), never > 2 in a row.

### Cover (3 candidates compared)
- A **"LOST FOR / 9 DAYS"** (highlight LOST), scene 0 t 2.0, focus [480,1150] ×1.25, shocked Kaşif right — **chosen**: same idea as the first sentence, the three kids are the one clear subject, reads at phone size.
- B "HER DRESS / SAVED HIM" (scene 4) — touching, but the sleeping figures read small and dark; Kaşif crowds Jane.
- C "TRACKS / GONE" (scene 3) — rain + prints only, no human subject, weakest.

## Eleştiri günlüğü

### ag-02-duff-children — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 5 | 7 | 6 | 7 | 8 | 9 | 6 | 6 |
1. **Scenes 3 and 6 lose their key image.** Scene 3: the `TRACKS GONE` card (y 0.2) sits outside the zoom 1.6 / focus [540,1450] crop, so it never appears (checked at 12.5 s). There is no person, the prints are tiny grey blobs, and there is no visible lightning, so the frame reads as grey rain on grass. → Draw labels in screen space (outside the camera group) or move the card to y ≈ 0.55 in scene space. Make the prints 3× bigger (s ≥ 0.6) in a clear row at y 1350–1600 that melts on "washed". Put a lightning flash plus a bending mallee silhouette at the top. Optionally add a searcher's boots/lantern cropped at the left edge, staring at the vanished trail. Scene 6: only two men show (the camera "right" pans the third, x 0.15, out). The leader is cut by the right edge and is not bending or pointing. The tags float in the sky, not over the men. FRED appears at 22.64 s, about 0.4 s before the cut, so it is only seen in the dissolve. → Use `move: push` (no pan) and place the men at x 0.22/0.5/0.78 with s ≈ 1.4, heads at y ≈ 900–1000. Put each tag just above its own head (y ≈ 0.40), and have the leader bend and point down at a print in the foreground. Give them distinct dignified detail (e.g. one carries a spear/stick, possum-skin cloak or 1860s shirt + trousers, beards), not three identical white-shirt figures. Trim scene 6 or add 0.6 s of hold so FRED stays on screen ≥ 1 s. Scene 4: the visual says Isaac sleeps too, but only Frank and Jane are drawn → add Isaac by the log.
2. **Kaşif scenes 5 and 9 are weak and the frames are half empty.** Scene 5 ("So who found them?"): Kaşif stands mid-left with a tiny hand on his chin, three 60 px figures on the horizon at x ≈ 0.95, and empty sand and sky (top 35 % blank). → Make it a close-up: Kaşif at scale ≥ 1.6, kneeling over the empty sand where the tracks vanished (rain puddles), looking up on "found". Bring the three trackers in at x 0.65–0.85 with s ≥ 0.9, their heads clear of the band (y < 1150). Scene 9: the memorial cairn is ~250 px wide, its plaque is blank, and it partly sits in the subtitle band (≈ y 1270–1420). → Cairn s ≈ 2.0 at x 0.68, with the plaque top below y 1330 (lower third filled). The plaque gets 2 lines of readable text ("DUFF / 1864", ≥ 44 px). Kaşif crouches and touches the plaque, then points at the viewer. Show the kids-walking-home figures at ≥ 150 px or drop them. Scene 2: the prints at y ≈ 1600 are tiny; the searchers' legs and lanterns sit behind the subtitle → set the men's ground ≈ y 1450 and make the prints s ≥ 0.5. Scene 7: Dick-a-Dick's head is cut by the left edge → focus [700,1200].
3. **Cover and closing do not land.** Cover: the kids look bored rather than lost and scared (flat mouths, no tears/sweat). Kaşif's face touches the right frame edge (x ≈ 1010 of 1035) and his body cuts across Frank. Band y 520–700 is empty fog, and nothing says "lost in the wild". → Give the kids a scared/exhausted expression (open-mouth worry, sweat drops, Jane hugging Frank), and move Kaşif to x ≈ 760, scale 1.4, face left toward the kids, clear of the frame. Lower the text block or bring the mallee canopy up so the image starts at y ≈ 560. Add the one symbol: a small trail of footprints leading into dark scrub (or night-dark background). Closing: "All three came home alive." is complete but flat, because the narration never says the trackers came in after a week of failure, so "within hours" has no contrast. → e.g. "So who found them? Not the thirty searchers. Three Wotjobaluk trackers, Dick-a-Dick, Jerry and Fred, found the lost trail within hours." Then the punchline "And all three kids came home alive." To pay for it, cut "little"/"Australian" (+ ≈ 25 chars net, still ≤ 450; note the budget warning). Also: the narration never speaks to "you" (BRAND §11). One short beat is enough, e.g. "Could you survive that at seven?" before "So who found them?", or "you" inside the hook.
Facts: verified against Monument Australia (Isaac 9, Jane 7, Frank almost 4, nine days, 30+ searchers, storm wiped tracks, Jane's dress, alive but weak) and Wikipedia Dick-a-Dick (Dick-a-Dick, Jerry, Fred; trail "within hours"). Note: Wikipedia names Isaac as "Isaac Cooper" (a different surname). The narration uses no surname, so this is fine. Lint: OK.

#### ag-02-duff-children — fixes round 1 (writer)
New narration (438 chars, under the 440 the coordinator allowed; budget warning noted): "These kids were lost for nine days. In 1864, Isaac, Jane and Frank
wandered into the bush. Over thirty people searched, but a storm washed away their tracks. On cold nights, seven-year-old
Jane covered Frank with her own dress. So who do you think found them? Not the searchers. Three Wotjobaluk trackers,
Dick-a-Dick, Jerry and Fred, found the trail within hours. And all three kids came home alive. Subscribe for a true story every day."
("you" beat + the contrast; "little"/"Australian" cut, so the kickers now say AUSTRALIA / VICTORIA; the subscribe line is shortened.)
1. Scene 3: card at y 0.565 (inside the 1.6 crop, size 58), focus [540,1300]; one row of big prints (size 3.4) + 2 smaller at
   y ≈ 0.83–0.93 that fill with water and vanish on "washed"; a lightning bolt in frame on "storm"; mallee bend in the wind.
   Scene 6: push (no pan), men at 0.2/0.45/0.64, s ≈ 1.35, ground 1517; each tag sits over its own man (FRED shown at
   "Jerry" + 0.35 s, so ≥ 1 s on screen); the leader stops, bends and points at a child's print in the foreground; the
   trackers get muted blue/brown/green shirts, beards, two long sticks (fixed a bug where they drifted right with global time).
   Scene 4: Isaac sleeps sitting against the log. Scene 7: focus [700,1200]. Scene 2: searchers' ground 0.755, prints size 1.8.
2. Scene 5: Kaşif s 1.65 in the foreground over the rain-pooled empty prints, pointing down; right after "found" three
   trackers walk in from the right (s 1.0, heads ≈ y 1000) and he turns and points at them. Kneeling isn't in the Kaşif rig,
   so he stands and points down. Scene 9: cairn s 2.0 at x 0.68, plaque "DUFF / 1864" (≈ 52 px), below the band; Kaşif points at it,
   then turns and points at the viewer; the far kids are dropped.
3. Cover: the kids are scared (open mouths, worried brows, a sweat drop), Jane hugs Frank, Isaac looks back; Kaşif x 760
   s 1.4 faces the kids, clear of the frame; a footprint trail in the foreground; mallee canopy brought up (image starts
   ≈ y 700; a fog band of ~150 px remains under the text).
Also: kids' brows now read worried (they were angry before); hands behind the body are drawn behind the clothes.
Lint: OK (0 errors, 0 warnings, SEO 100); preview: no STATIC?, all cues matched.

### ag-02-duff-children — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 7 | 7 | 7 | 8 | 9 | 7 | 8 |
Passing. The round-1 fixes landed: the TRACKS GONE card shows, the scene-3 prints are big, Isaac is by the log, scene 5 has a big Kaşif plus trackers walking in, scene 6 shows three distinct trackers with each tag over its own man and the leader bending, the DUFF / 1864 plaque reads, the cover kids look scared, and the "you" + "Not the searchers." contrast works. Minor polish (optional):
1. Scene 6: the 2-line subtitle (y ≈ 1190–1390) covers the trackers' torsos, and the top ~40 % is empty sky with a ghost blob. Lower the men's ground to ≈ y 1600 (or scale 1.5), so the heads sit at ≈ 1000–1150 and the bodies fall below the band, and bring the mallee canopy down into the sky.
2. Scene 9: in the first half the subtitle sits on Kaşif's torso, and the upper ~40 % is empty sky. Put Kaşif at y ≈ 0.80, s 1.5 (face above the band, body below), and add one big mallee crown at the top left. Scene 5: the trackers' torsos are also in the band; their heads are clear, which is acceptable.
3. Cover: ~150 px of empty fog remains under "9 DAYS" (y ≈ 520–700), and the footprint trail is faint and cut by the bottom frame. Raise the canopy about 120 px and darken the 3 prints, placing them between the kids and Kaşif (y ≈ 1560–1650). Scene 3 still has no human; it is optional, but a searcher's lantern or boots cropped at the left edge would add stakes.
Lint: OK (SEO 100), 438 chars (budget warning: above 425, allowed by coordinator).

- Polish after tur 2 (writer): scene 6 trackers ground 1603 + tall mallee crowns fill the sky (tags moved down with them); scene 9 Kaşif y 0.80 s 1.5 + big crown top-left; cover: bigger near/mid mallee and a darker footprint trail between the kids and Kaşif (the cover's own fade still starts the image ≈ y 700). Narration unchanged (438). Lint OK.
