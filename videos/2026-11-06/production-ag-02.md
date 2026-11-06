# ag-02-hessdalen-lights — Stickstory Short (unsolved mysteries)

- **File:** `videos/2026-11-06/ag-02-hessdalen-lights.json` · format short · publish_at `2026-11-06T19:00:00-05:00` (Istanbul 07.11 03:00)
- **Category:** unsolved mysteries (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → **category pool** (report says so). Norway is one of the
  channel's target countries.
- **Topic:** Hessdalen valley, central Norway. Since late 1981 strange balls of light appear above the valley — at the peak
  (1981–84) reported many times a week, hovering, drifting, sometimes for over an hour, sometimes racing off. Project Hessdalen
  (1983/84) brings cameras, radar, magnetometers; an automatic measuring station since 1998 (verify). Theories: burning dust /
  ionised gas, the valley's rocks acting like a giant battery (verify the Italian/Norwegian research claims carefully). Still
  no accepted explanation. Do NOT tell UFO myths as fact; no invented sightings.
- **Viewer should feel:** "There's a real valley where lights float in the night and scientists still can't say why."
- **Hook (3–8 words, same idea as cover):** e.g. "This valley glows and nobody knows why." ↔ cover "LIGHTS NOBODY / CAN EXPLAIN" (≤ 4 words!)
  ≥ 3 cover candidates.
- **Punchline:** complete standalone line (e.g. the cameras are still watching tonight) + one short natural subscribe line with reason.
- **Related long video:** none → no `related`.
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-dusk` (differs from ag-01's ag-slate and the previous video); sets: `night`, `snow` (winter valley), `interior`
  (measuring station); Kaşif host 15–25 % of scenes, ≥ 1 close-up.

## Narration, shot list, cover candidates — writer fills below

### Narration (one flowing text, 430 chars)
This valley makes lights nobody can explain. It's Hessdalen, in Norway. In the early 1980s, people saw them up to 20
times a week. You look outside, and a glowing ball just hangs over the snow. Sometimes for over an hour. So scientists
came with cameras and radar. One idea? The valley works like a giant battery. But nobody has proved it. And tonight, a
camera there is still watching. Subscribe for one strange true story a day.

### Shot list (10 scenes; new shot file `scenes/studio/shots/hd_valley.js`)
| # | Text | Type / mode | Set · camera | Kaşif |
|---|---|---|---|---|
| 0 | This valley makes lights nobody can explain. | `hd_valley` hook | night · push | cover overlay only (big, shock); big glowing ball over the valley, flares on "nobody" |
| 1 | It's Hessdalen, in Norway. | `hd_valley` sign | snow (day) · right | — (signpost HESSDALEN, red farmhouse, snowfall; NORWAY) |
| 2 | In the early 1980s, people saw them up to 20 times a week. | `hd_window` tally | interior · push | — (sheet "THIS WEEK" fills to 20 tallies, ball in the window; 20 A WEEK; source) |
| 3 | You look outside, and a glowing ball just hangs over the snow. | `hd_window` look | interior · push 1.2 | — (villager at the window, leans back on "glowing") |
| 4 | Sometimes for over an hour. | `hd_valley` hover | night · left | — (ball over a farm roof, racing clock; 1 HOUR+) |
| 5 | So scientists came with cameras and radar. | `hd_camp` radar | snow · right | — (1984 camp: turning radar dish pings the ball, tripod camera, two scientists; 1984; source) |
| 6 | One idea? The valley works like a giant battery. | `hd_battery` | none (cross-section) · pull | thinks, then points at the ball forming on "battery" |
| 7 | But nobody has proved it. | `title` | snow | — ("Not / proved", note "still a mystery") |
| 8 | And tonight, a camera there is still watching. | `hd_camp` box | night · **close-up** zoom 1.6 | — (Blue Box container, mast camera tracks the ball, REC blinks; LIVE) |
| 9 | Subscribe for one strange true story a day. | `hd_valley` end | night · pull | waves, points at viewer on "story" |

Kaşif in 6 and 9 (2/10 = 20 %) + cover/hook overlay. 5 types, max 2 of one type in a row, hd_valley 4/10.

### Cover candidates (rendered and compared side by side)
- **A (chosen):** scene 0 t 1.6, "LIGHTS NOBODY / CAN EXPLAIN" (highlight NOBODY) = first spoken line; one big glowing ball + shocked Kaşif.
- B: scene 4 t 2.0, "IT HOVERED / FOR AN HOUR" — ball smaller, clock + 1 HOUR+ card compete with the title.
- C: scene 8 t 3.0, "STILL / WATCHING" — reads well, but the ball is small and the container/camera is a weaker hook.

### Facts (verified)
- Peak Dec 1981 – mid 1984: lights seen 15–20 times a week (Wikipedia); "up to 20 sightings per week" (hessdalen.org).
  Duration from seconds to well over an hour (Wikipedia). Lights reported locally since at least the 1930s (not narrated).
- Project Hessdalen founded summer 1983; field investigation 21 Jan – 26 Feb 1984 with cameras at three sites and a
  radar measuring distance and speed (old.hessdalen.org article, societyforuapstudies.org).
- Automatic station ("Blue Box") installed 1998; live cameras stream 24/7 (hessdalen.org/about).
- Battery idea: Jader Monari (2014) — valley sides as electrodes, the Hesja river as electrolyte (Wikipedia). Other ideas
  (burning scandium dust, etc.) exist; no consensus. Narration says "One idea?" and "nobody has proved it".
- Not claimed: UFOs, any specific sighting, exact current numbers.

## Eleştiri günlüğü

### ag-02-hessdalen-lights — Round 1 (critic)
lint OK · 430 chars · ~33.7 s · motion: sc0 1.9, others 12–21 · Kaşif in sc6, sc9 + cover overlay on sc0 (3/10 = 30%)
Facts checked: Wikipedia (15–20/week Dec 1981–mid 1984; "few seconds to well over an hour"; Monari 2014 battery model),
old.hessdalen.org 1984 article ("A radar measured the distance and speed"; cameras at three sites; "as many as 20 observations" in a week),
hessdalen.org/about (Blue Box 1998, camera "transmitting live footage 24/7", systems "currently running"). All claims hold.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 8 | 7 | 6 | 8 | 8 | 9 | 8 | 7 |

(Scene numbers are 0-based, as in preview.py.)
1. **Scene 7 ("But nobody has proved it.", `title`)**: a plain paper card. The lower half (y 1320–1920) is empty paper, and the red handwritten note "still a mystery" collides with the subtitle band at y ≈ 1170–1320. This breaks the full-frame rule. → Replace it with a real place: e.g. the hd_battery cross-section (or the hd_camp scientists) with a big red stamp card "NOT PROVED" slammed on at "proved", plus a scientist or Kaşif shrugging. Drop the note, or move it above y 1100.
2. **Cover + scene 0 hook**: there is a pale empty band about 270 px tall between the headline and the scene (cover y ≈ 430–700). The fez almost touches the right frame (x ≈ 990 of 1035). The hook frame's motion is 1.9 (target ≥ 4). → Raise `focus`/`zoom` (1.2 → ~1.5) or move the scene up so the glowing ball sits right under the text. Move Kaşif in (x ≈ 760, scale ~1.35). In the hook, make the orb pulse/drift and let snow, the far second light and chimney smoke move visibly, so motion reaches ≥ 4. Re-render 3 cover candidates; the cover needs ≥ 8.
3. **Script, scenes 1 and 6**: "It's Hessdalen, in Norway." is a caption-style filler line (the sign and NORWAY card already say it). "One idea? The valley works like a giant battery." gives no reason, so the twist is flat. → Fold the place name into scene 2 ("In Norway's Hessdalen valley, in the early 1980s…"). Spend the ~25 freed characters on the surprising why: e.g. "One side of the valley is full of copper and zinc, the other of iron, and a sulfur river runs between them." (verify against Monari 2014). Add the Monari paper or a source covering it to `sources`, since the on-screen note says "Monari, 2014". Minor: scene 3 is a close-up at zoom 1.2 (rule ≥ 1.6). Scene 4's "1 HOUR+" card renders small; use size ≥ 96 and less rotation.

**Round 1 fixes (writer):** narration rewritten (435 chars): "It's Hessdalen, in Norway." filler folded into "In the early 1980s, Hessdalen, Norway, / saw them up to 20 times a week."; battery idea now gives its reason ("Iron and zinc on one slope, copper on the other, a river between. A giant battery." — verified in Science Norway, 13 May 2014, Jader Monari; source added). Scene 7 title card → `hd_camp` doubt (night camp, scientists shrug, red NOT PROVED stamp slams on "proved", snow foreground to the bottom). Hook: snowfall ×2, ball pulse/drift, far light crosses the sky → motion 4.4; cover zoom 1.5 (ball right under the headline), Kaşif x 760 / scale 1.35. 3 covers re-rendered (LIGHTS NOBODY CAN EXPLAIN / A VALLEY THAT GLOWS / NOT PROVED) → A kept. Scene 3 close-up zoom 1.6 with the villager's face above the subtitle band; "1 HOUR+" size 100, tilt −1. Battery scene split in two (sentence limit); 11 scenes, Kaşif 2/11.

### ag-02-hessdalen-lights — Round 2 (critic)
lint OK (1 warning: scene 6, 15 words) · 435 chars · ~34.3 s · preview re-run on the current files: motion sc0 4.4, the rest 12.6–21.8 ·
Kaşif in sc7, sc10 + cover overlay on sc0 (3/11 ≈ 27%). Science Norway (13 May 2014) checked: western slope iron + zinc minerals,
eastern slope copper, Hesja river as electrolyte, Jader Monari. The narration matches. Round 1 issues 1–3 are fixed: no title card;
NOT PROVED stamp at the camp; the hook moves; Kaşif no longer at the cover edge; filler line gone; battery reason given; close-up at zoom 1.6.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |

Passes (all ≥ 7, cover 8). Remaining small issues, none blocking:
1. Scene 6 runs 5.9 s with 15 words (lint warning). Optional: split at "…copper on the other," so the river and the spark land as a separate beat.
2. Scene 1: the "NORWAY" card renders much smaller than the "1981–84" card, and two cards compete. Raise NORWAY to size ≥ 96 or drop the 1981–84 card (the subtitle already says "early 1980s").
3. Scene 8: the NOT PROVED stamp nearly touches the right edge and clips the top of the radar dish. Move it left/down by about 0.04 and enlarge it slightly so the outlined letters read at phone size.

**Round 2 polish (writer):** battery split after "copper on the other." ("A river between. A giant battery." + RIVER label; Kaşif still 2/11), scene 1 keeps only NORWAY (size 100), NOT PROVED stamp at x 0.46 / y 0.27 / size 104 with a shorter radar mast so it clears the dish; lint clean (no warnings), 435 chars.
