# ag-02-holland-tunnel — Stickstory Short (how it was built)

- **File:** `videos/2026-11-20/ag-02-holland-tunnel.json` · format short · publish_at `2026-11-20T19:00:00-05:00` (Istanbul 21.11 03:00)
- **Category:** how it was built (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403) → web fallback: CT Mirror (US), 15 Nov 2026, "Opinion: The Holland Tunnel's centennial year" (the tunnel turns 100 on 13 Nov 2027). Not from the 7 Google News front pages (unreachable) — reported.
- **Topic:** Holland Tunnel (New York–New Jersey under the Hudson), the first mechanically ventilated underwater road tunnel, opened 13 Nov 1927. Problem: car exhaust (carbon monoxide) would poison drivers in a long tube. Tests with volunteers breathing exhaust (Yale / US Bureau of Mines, Pittsburgh experimental mine — VERIFY). Solution: four ventilation buildings, 84 huge fans, fresh air blown in under the road, all air replaced about every 90 seconds (VERIFY numbers). Chief engineer Clifford Holland died in 1924 (age 41) before the two halves met; successor Milton Freeman died months later; Ole Singstad finished it (VERIFY). Different from our Thames Tunnel short (2026-10-28, tunnelling shield): this one is about air.
  VERIFY on ≥ 2 sources (ASCE landmark page, Port Authority NY&NJ, American Heritage, ENR archive, Hagerty, Wikipedia as pointer).
- **Viewer should feel:** "They built a road under a river, and the real enemy was invisible air."
- **Hook idea:** first sentence 3–8 words, e.g. "This tunnel was designed not to kill you." / "Driving through here should be deadly." ↔ cover "THE AIR KILLS" / "84 FANS / 1 RIVER" — writer decides, ≥ 3 cover candidates.
- **Narrator draft (director; writer verifies and polishes, 420–480 chars):**
  Cars should not survive this tunnel. In the 1920s, New York wanted a road under the Hudson River. But a mile of traffic in a sealed tube fills with deadly exhaust. So engineers made volunteers breathe car fumes to find the limit. Their answer: giant fans that swap all the air every ninety seconds. The chief engineer, Clifford Holland, never saw it finished. He died worn out at forty-one. It opened in 1927, and it still breathes today. Subscribe for how the world was built.
- **Budget:** narration 400–500 chars (hard max 550), 8–11 scenes.
- **Look:** sets `city` (Manhattan skyline / ventilation tower), `interior` (tunnel tube with cars, test chamber), river cross-section (new type in own file `scenes/studio/shots/ht_*.js`: tube under the river with arrows of air, giant fan close-up, volunteers in a test room, Holland at a drafting table). ≥ 1 close-up. Kaşif host 15–25 %. On-screen `source` ≥ 1. Punchline + one natural subscribe line. Sources ≥ 2. Pick a palette different from ag-01.

## Writer

**Final narration (500 chars, lint OK, SEO 100/100):**
This tunnel should have poisoned every driver. In the 1920s New York wanted a road under the Hudson. But a mile and a half of cars in a sealed tube? That means invisible, deadly fumes. So engineers filled a test tunnel with exhaust, sent volunteers in, and checked their blood. Their answer: 84 giant fans, that swap all the air every 90 seconds. Chief engineer Clifford Holland never saw it. He died at 41. Next year his tunnel turns 100, and it still breathes. Subscribe for a true story every day.

**Title:** Holland Tunnel: Why Didn't the Fumes Kill Every Driver? · **Cover:** "IT SHOULD / KILL YOU" (highlight KILL), scene 0 t 2.6, big worried/shocked fez host + smog-filled tube.

### Verified facts
| Fact | Sources |
|---|---|
| Opened 13 Nov 1927 | Hagerty; CT Mirror (1927); WTTW ("three years after" 1924) |
| ~1.6 miles long (8,500 ft per tube) | ASME/ETHW; CT Mirror; Hagerty |
| 4 ventilation buildings, 84 fans | ASME/ETHW; CT Mirror; Hagerty; WTTW; TIME 1927 |
| Air replaced every 90 s (ASME: "at full speed"; TIME: 42 times an hour) | ASME/ETHW; CT Mirror; WTTW; TIME |
| Fresh air from a duct under the roadway | ASME/ETHW |
| Test tunnel built at the Bureau of Mines experimental mine, Bruceton (near Pittsburgh), to study exhaust removal | Bureau of Mines RI 2288; Hagerty ("small Pennsylvania coal mine"); WTTW ("old Pennsylvania coal mine") |
| Volunteers' blood monitored for CO | WTTW ("student volunteers… carbon monoxide in their bloodstreams"); RI 2338 (Henderson/Yale, Sayers at Pittsburgh station; exposure tests). Yale named only as a research site (TIME), not in narration |
| Holland died 27 Oct 1924, age 41 (heart attack, Battle Creek sanatorium, after a breakdown) | Wikipedia; Hagerty; WTTW; CT Mirror |
| Freeman succeeded him and died of pneumonia ~5 months later (Mar 1925); Singstad finished it | Hagerty; Wikipedia (not used in narration: no room) |
| Turns 100 on 13 Nov 2027 | CT Mirror (news hook) |
Not used / hedged: "a day before the halves met" (Wikipedia: one day; WTTW: two days) → dropped. CT Mirror's "$11 million" cost conflicts with other sources → not used.

### Shot list
| # | Text | Type | Set / camera | Kaşif |
|---|---|---|---|---|
| 0 | This tunnel should have poisoned every driver. | ht_tube (hook, haze 0.6) | none / push | cover block: big shocked host |
| 1 | In the 1920s New York wanted a road under the Hudson. | ht_river plan (ferries, dashed tube) | none / right | – |
| 2 | But a mile and a half of cars in a sealed tube? | ht_river fumes | none / push | – |
| 3 | That means invisible, deadly fumes. | ht_tube close ("CARBON MONOXIDE") | **close-up** focus [540,980] ×1.6 | – |
| 4 | So engineers filled a test tunnel with exhaust, sent volunteers in, | ht_mine enter | none / pull | – |
| 5 | and checked their blood. | ht_mine blood (vial fills red, CO gauge); source US Bureau of Mines | none / push | – |
| 6 | Their answer: 84 giant fans, | ht_fan (counter 1→84) | none / up | points at fan, shock on "fans" |
| 7 | that swap all the air every 90 seconds. | ht_river air (towers, arrows, stopwatch 90); source ASME | none / pull | – |
| 8 | Chief engineer Clifford Holland never saw it. He died at 41. | ht_desk (lamp goes out, 1924 calendar, "DIED AT 41") | none / left | – |
| 9 | Next year his tunnel turns 100, and it still breathes. | ht_tower ("100 YEARS") | city / up | – |
| 10 | Subscribe for a true story every day. | ht_tower | city / push | waves, then points at viewer |
Kaşif 2/11 = 18 %; 6 scene types; all ht_* in `scenes/studio/shots/ht_holland.js`.

### Cover candidates
1. **"IT SHOULD / KILL YOU"** (scene 0, t 2.6) — chosen: same idea as the first sentence, host's face big and readable, smoky tube as the single symbol.
2. "POISON / TUNNEL?" (scene 0) — weaker, reads like a label.
3. "THE AIR / KILLS" (scene 3, thickest haze) — strong image but doesn't match the spoken first line.
4. "IT SHOULD / KILL YOU" with focus zoom 1.3 — car bigger but tunnel loses its depth.

## Eleştiri günlüğü

### ag-02-holland-tunnel — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 6 | 6 | 7 | 6 | 7 | 7 | 8 | 7 | 8 |
1. Safe zones: the 84 counter sat in the YouTube UI zone; Kaşif in scenes 6 and 10 was small or behind the subtitles; the VOLUNTEERS and CLIFFORD HOLLAND cards were badly placed.
2. Visuals didn't match the words: the planned road was faint dashes; the bottom of the river scenes was empty; only one volunteer was visible; the lamp going out and DIED AT 41 came late; the airflow arrows were thin; the smoke in scene 0 barely grew.
3. Script: about 38 s and 500 chars. "Next year… turns 100" will date the video. The fans line had a stray comma and dropped "can". There was no "you" and no channel-specific subscribe reason. The ASME PDF was missing from the sources.

**Writer changes (tur 1):**
- **Narration:** rewritten to 461 chars (~34 s): "This tunnel should have poisoned you. In the 1920s New York wanted a road under the Hudson. But cars in a sealed tube? That means invisible, deadly fumes. So engineers made volunteers breathe exhaust in a test tunnel. Then they checked their blood. The answer was 84 giant fans. They can swap all the air every 90 seconds. Its chief engineer, Clifford Holland, died at 41. Nearly 100 years later, it still breathes. Subscribe for how the world was really built."
- **Fan scene (6):** counter moved up-right next to the fan; right window removed; Kaşif scale 1.15 in the right foreground with his head below the subtitles, pointing up and then shocked on "fans".
- **River scenes (1, 2, 7):** water, riverbed and tube moved up; dark foreground boulders fill the bottom. The planned road is now a thick, solid red outline with a light fill that draws itself from bank to bank. In scene 7 the arrows are about twice as thick and "FRESH AIR IN" is a 54 px blue card by the left tower.
- **Mine scene (4):** the three volunteers start walking on "made", so all three are visible. The card moved to y 0.45.
- **Desk scene (8):** table raised above the subtitles. The lamp now goes out in 0.7 s on "died", and "DIED AT 41" appears on the same word. The name card moved to y 0.18.
- **Opening scene (0):** starts with thin haze that thickens sharply on "poisoned"; the cars drive faster (motion 2.8).
- **Closing scene (10):** Kaşif at y 0.97, scale 1.0, with his head below the subtitles.
- **Sources and description:** ASME landmark PDF added (checked: 84 fans in 4 buildings, every 90 seconds at full speed, opened 13 Nov 1927). Description updated.
- **Checks:** lint OK with SEO 100/100. `preview`: no STATIC? scenes. I looked at the sheet and the cover.

### ag-02-holland-tunnel — tur 2 (PASS)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 8 | 7 | 7 | 8 | 8 | 8 | 8 |
1. Kaşif in scenes 6 and 10 sat under the Shorts buttons or in the title zone.
2. The "three years before it opened" stake was lost in Holland's line.
3. FRESH AIR IN was far from the arrows and the volunteers were too low. Fact safety: the place where volunteers were exposed is uncertain.

**Writer changes (tur 2 polish):**
- **Narration (478 chars, ~35 s):** scene 4 → "So engineers made volunteers breathe car exhaust." Scene 8 → "Its chief engineer, Clifford Holland, died at 41, three years before it opened."
- **Scene 4:** the kicker is now "Exhaust tests" and the sign "EXHAUST TEST"; the scene description no longer names a mine. The volunteers walk 80 px higher.
- **Scene 6:** Kaşif at x 0.74, y 0.6, scale 1.1, standing on the floor right of the fan with his head above the subtitles; he points up and then shows shock. The 84 counter moved up to x 0.72, y 0.22, fully inside the frame.
- **Scene 7:** "FRESH AIR IN" card next to the left tower (x 0.25, y 0.30) and a "FOUL AIR OUT" card by the right tower.
- **Scene 10:** Kaşif stands between the portal and the tower (x 0.54, feet y 0.6), so the wave and point are above the subtitles. He was moved from the coordinator's x ≈ 0.15 because there his body vanished against the dark portal mouth.
- **Checks:** lint OK with SEO 100/100; `preview` flags no static scenes; I looked at the sheet and the cover.

### Yönetmen son kapı
- Tur 2 eleştirmen puanı (geçti): 8/8/7/7/8/7/7/8/8/8/8; ardından son cila turu uygulandı. Lint OK; sheet.png ve cover.jpg yönetmen tarafından görüldü.
