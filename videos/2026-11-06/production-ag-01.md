# ag-01-exploding-whale — Stickstory Short (history's strangest moments)

- **File:** `videos/2026-11-06/ag-01-exploding-whale.json` · format short · publish_at `2026-11-06T13:00:00-05:00` (Istanbul 06.11 21:00)
- **Category:** history's strangest moments (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries); a web search for current news found no fitting headline →
  **category pool**, with a date hook: the anniversary is next week (12 November 1970). Report says so.
- **Topic:** Florence, Oregon, 12 Nov 1970. A dead sperm whale (~45 ft, ~8 tons) on the beach; the Oregon Highway Division
  decides to blow it up with about half a ton (20 cases) of dynamite so gulls would eat the pieces. KATU reporter Paul Linnman
  films it. Blubber rains down on the crowd far back; a chunk flattens the roof of a brand-new Oldsmobile in the parking lot.
  No one hurt. Most of the whale is still on the beach; crews bury it. (Verify every number; drop any you can't confirm.)
- **Viewer should feel:** "They really tried to dynamite a whale and it rained blubber."
- **Hook (3–8 words, same idea as cover):** e.g. "Oregon tried to blow up a whale." ↔ cover "THEY BLEW UP / A WHALE" (highlight "whale").
  ≥ 3 cover candidates.
- **Punchline:** complete standalone line (e.g. the car-dealer "whale of a deal" detail ONLY if verified, or "most of the whale never moved")
  + one short natural subscribe line with reason.
- **Related long video:** none → no `related`.
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-slate` (differs from the last Stickstory video, ag-newsprint); sets: `coast`/`sea` (beach), maybe `city` for parking lot;
  Kaşif host 15–25 % of scenes (e.g. hiding behind a dune on the blast), ≥ 1 close-up.

## Narration, shot list, cover candidates — writer fills below

### Narration (one flowing text, 440 chars)
Oregon once blew up a whale. In 1970, a dead sperm whale washed up near Florence. It stank, so the highway crew made a
plan. Half a ton of dynamite, and seagulls would eat the bits. Can you guess what happened? It rained blubber. One chunk
flew a quarter mile and crushed a brand-new car. Nobody got hurt. Most of the whale stayed put. And that car's dealer?
Its slogan was "a whale of a deal." Subscribe for a strange true story every day.

### Shot list (10 scenes; new shot file `scenes/studio/shots/wh_whale.js`)
| # | Text | Type / mode | Set · camera | Kaşif |
|---|---|---|---|---|
| 0 | Oregon once blew up a whale. | `wh_blast` hook | sea · push | cover overlay only (big, shock, left foreground); whale erupts into a plume on "blew", chunks fly |
| 1 | In 1970, a dead sperm whale washed up near Florence. | `wh_beach` arrive | sea · right | — (whale on sand, foam, gulls, local man jumps back; 1970 / FLORENCE, OREGON) |
| 2 | It stank, so the highway crew made a plan. | `wh_beach` stink | sea · **close-up** zoom 1.6 | — (worker in hard hat holds nose by the whale's head, stink lines + flies; on "crew" he holds up a PLAN sign; STINK) |
| 3 | Half a ton of dynamite, and seagulls would eat the bits. | `wh_crew` | coast · left | — (DYNAMITE crates stack up, worker carries one more, gulls swoop in; HALF A TON / 20 CASES; source Offbeat Oregon) |
| 4 | Can you guess what happened? | `wh_beach` wait | sea · pull | points at the far wired whale, jumps back in shock on "happened"; worker at the plunger box; ? |
| 5 | It rained blubber. | `wh_blast` rain | coast · down | — (plume behind the dune, blubber lumps rain, spectators run; BLUBBER!) |
| 6 | One chunk flew a quarter mile and crushed a brand-new car. | `wh_car` crush | coast · right | — (lump arcs in along a dashed track, flattens the new car's roof on "crushed"; QUARTER MILE; source Jalopnik) |
| 7 | Nobody got hurt. Most of the whale stayed put. | `wh_beach` after | sea · push | — (whale still there with a blast hole, smoke, lumps on the sand; NO ONE HURT / STILL THERE) |
| 8 | And that car's dealer? Its slogan was "a whale of a deal." | `wh_car` dealer | city · push | — (dealer sign "A WHALE / OF A DEAL" pops up on "slogan", pennants, new car) |
| 9 | Subscribe for a strange true story every day. | `wh_beach` end | sea · pull | waves, points at viewer on "story"; smoking whale behind |

Kaşif in scenes 4 and 9 (2/10 = 20 %) + cover/hook overlay. 4 types, max 2 of one type in a row, wh_beach 5/10.

### Cover candidates (rendered and compared side by side)
- **A (chosen):** scene 0 t 1.6, "BLEW UP / A WHALE" (highlight WHALE) = first spoken line; one plume over the whale + shocked Kaşif. Single focus, matches the hook.
- B: scene 6 t 3.3, "CRUSHED BY / BLUBBER" — car scene is busy (other cars, label, dust), weaker focus.
- C: scene 5 t 1.2, "IT RAINED / BLUBBER" — crowd + many lumps, cluttered.

### Facts (verified)
- 12 November 1970, beach south of Florence, Oregon; sperm whale ~45 ft, ~8 tons; Oregon State Highway Division
  (George Thornton); 20 cases ≈ half a ton of dynamite; idea: small pieces for scavengers/seagulls; KATU's Paul Linnman filmed it.
- A chunk flattened the roof of Walter Umenhofer's brand-new car parked ~450 yards away (≈ a quarter mile); nobody hurt;
  the large remaining part of the whale was buried/bulldozed afterwards.
- Dealer slogan: "Get a Whale of a Deal" (Dunham Oldsmobile, Eugene; Offbeat Oregon, Jalopnik, Mental Floss).
- Car make is reported inconsistently (Oldsmobile 88 / 98 in most sources, Cadillac in Mental Floss) → narration says only "a brand-new car".
- Sources: https://www.mentalfloss.com/history/florence-oregon-exploding-whale-1970,
  https://www.jalopnik.com/heres-the-story-behind-the-oldsmobile-crushed-by-300-lb-1848658789/,
  https://offbeatoregon.com/H001_ExplodWhale.html

## Eleştiri günlüğü

### ag-01-exploding-whale — Round 1 (critic)
Lint OK · preview ~33 s / 440 chars · motion 3.9–27.7 (no STATIC) · Kaşif 3/10 incl. hook overlay (30 %, within 35 %).
Accuracy checked: Offbeat Oregon (12 Nov 1970, half a ton = 20×50 lb cases, Oldsmobile 88 parked 450 yd ≈ quarter mile, no injuries,
"Get a Whale of a Deal on a New Oldsmobile", Dunham Oldsmobile) and Jalopnik (brand-new Olds, nobody hurt, "Come to us for a whale of a deal").
All narration claims hold; "most of the whale stayed put" is from the standard accounts (not in these two pages, keep Mental Floss as backing).

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |

1. Scene 2 (stink): the red "STINK" card sits on the worker's hard hat/head, the worker stands with crossed arms instead of
   holding his nose (visual says he pinches his nose), and the stink lines/flies are barely visible at 360 px. → move the card
   off the figure (e.g. x 0.30, y 0.55 over the whale's head), give the worker a hand-to-nose pose until "crew", and make the
   green stink lines thicker/longer so the "it stank" beat reads.
2. Scene 7 (after): the "STILL THERE" card (x 0.66, size 80) is cut by the right frame edge, and the scattered blubber lumps +
   whale belly sit behind the subtitle strip. → x ≈ 0.58 or size 68; lift the whale/lumps ~80 px or lower them below y 1320.
3. Scenes 1 and 4 (wide beach): sky fills about half of the frame and the whale is a small strip; in scene 4 the wired whale and
   plunger box are tiny next to Kaşif, and in scene 1 the local man who "jumps back" is too small to notice. → raise the
   ground/horizon (sky ≤ 1/3), scale the whale up (scene 4 whale ~1.4×, closer to centre-right), make the local man ≥ 1.5× or push
   the camera in (zoom ≥ 1.3) on him at "whale".
Minor: cover plume fades into a pale empty band (y ≈ 520–700); a fuller, less transparent plume top would add drama. Scene 8 car is
red while the crushed car was blue (fine as "dealer's lot", but a blue sedan would tie it together).

### ag-01-exploding-whale — round 1 fixes (writer)
1. Scene 2: STINK card moved to (0.35, 0.55) over the whale's head, clear of the worker; the shared rig has no hand-to-nose
   pose (kasif.js is off-limits), so the worker gets a clothes-peg clipped on his nose on "stank" (keeps it while holding
   PLAN); stink lines thicker (≈13 px) and ~45 % longer, flies bigger and around the head. 2. Scene 7: STILL THERE at
   x 0.58 / size 72 (in frame); whale lifted 50 px and blubber lumps moved onto the near sand (below y 1380), the subtitle
   band is clear. 3. Scenes 1 and 4: ground 960 / horizon 640 (sky ≈ a third); scene 1 whale 0.95 and the local man 0.85;
   scene 4 whale 0.5 (1.4×), plunger box moved to x 0.34 so the wires and box read. Minor: plume wider/fuller at the top on
   the cover; dealer car now the same blue as the crushed car; HALF A TON label at x 0.42 previewed (in frame).
   Accuracy: Mental Floss confirms "bite-sized pieces of blubber that seagulls and other scavengers would eat" and "A large
   portion of the whale remained" → narration and description now say "Much of the whale stayed put" (still 440 chars).
   Lint OK, SEO 100; motion 4.6–28.1, no STATIC?.

### ag-01-exploding-whale — Round 2 (critic)
Lint OK · preview fresh (09:06, after the fixes). All round 1 problems resolved: scene 2 peg on the nose + thicker stink lines read
at 360 px and STINK no longer covers the worker; scene 7 STILL THERE fully in frame, subtitle band clear; scenes 1/4 sky ≈ a third,
whale and local man / plunger box readable; dealer car now blue; "Much of the whale stayed put" matches Mental Floss.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 9 | 8 | 8 |

No blocking problems; passes (all ≥ 7, cover 8). Optional polish only: the cover plume top still fades into the pale band
under the title (y ≈ 600–750); scene 8's first half is mostly empty sky until the sign pops on "slogan".
