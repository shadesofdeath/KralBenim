# ag-01-mauro-prosperi — Stickstory Short (survival stories)

- **File:** `videos/2026-11-05/ag-01-mauro-prosperi.json` · format short · publish_at `2026-11-05T13:00:00-05:00` (Istanbul 05.11 21:00)
- **Category:** survival stories (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → **category pool** (report says so).
- **Topic:** Mauro Prosperi, Italian police officer, Marathon des Sables 1994 (Morocco). A sandstorm on the long stage hides the
  route; he walks the wrong way and is lost ~9–10 days, drifting ~200+ km into Algeria (verify numbers). Drinks his own urine,
  shelters in a marabout shrine, eats bats raw, snakes/lizards; follows clouds at dawn; found by a nomad family, lost ~15–18 kg (verify).
  **Leave out entirely** any self-harm / suicide attempt in his story (not on screen, not in narration, not in metadata).
- **Viewer should feel:** "He walked out of the Sahara on bats, urine and stubbornness."
- **Hook (3–8 words, same idea as cover):** e.g. "He survived the Sahara by eating bats." ↔ cover "HE ATE / BATS" (highlight "bats")
  or "LOST IN / THE SAHARA" (highlight "Sahara"). Writer makes ≥ 3 cover candidates.
- **Punchline:** complete standalone line (e.g. he ran the same race again later — verify) + one short natural subscribe line with reason.
- **Related long video:** none obvious → leave `related` out (upload.py links newest long).
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-slate`; sets: `desert`, `storm` (sandstorm), `night` (shrine), Kaşif host 15–25 % of scenes, ≥ 1 close-up.

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration (one flowing text, 436 chars; round 2 polish)
He survived the Sahara by eating bats. In 1994, Mauro Prosperi was running a race across the Moroccan desert. Then a
sandstorm hit, and the trail was gone. His water ran out. So what did he do? He drank his own urine. Then he found a
shrine, full of bats. So he ate them raw. Nine days later, a nomad girl found him, in Algeria, 180 miles off course. Yes,
he went back and ran that race again. Subscribe for a wild true story every day.

### Shot list (11 scenes; new shot file `scenes/studio/shots/pros_sahara.js`)
| # | Text | Type / mode | Set · camera | Kaşif |
|---|---|---|---|---|
| 0 | He survived the Sahara by eating bats. | `pros_desert` hook | desert · push | cover overlay only (big, shock) next to a big flapping bat; small shrine + circling bats behind |
| 1 | In 1994, Mauro Prosperi was running a race… | `pros_desert` race | desert · right | — (runners with packs between red flags; 1994 / MOROCCO) |
| 2 | Then a sandstorm hit, and the trail was gone. | `pros_storm` | storm · left | — (sand wall rolls in, flags fall, footprints fade; NO TRAIL) |
| 3 | His water ran out. So what did he do? | `pros_bottle` empty | desert · **close-up** zoom 1.6 | — (bottle upside down, last drop, heat shimmer; EMPTY, ?) |
| 4 | He drank his own urine. | `pros_bottle` drink | desert · pull | thinks, then jumps back in shock on "urine" (ticks); URINE |
| 5 | He found an empty shrine, full of bats. | `pros_shrine` find | night · push | — (domed shrine, bats pour out of the dome window on "full") |
| 6 | He ate them raw. | `pros_shrine` eat | interior · **close-up** zoom 1.6 | — (bats on the beam, he holds one up, tally marks; RAW) |
| 7 | Nine days later, a nomad girl found him, | `pros_desert` girl | desert · right | — (girl in blue dress + scarf, goats, palms; DAY 9) |
| 8 | in Algeria, 180 miles off course. | `pros_map` | none (full-frame map) · push | — (red track crosses the border to an X; 180 MILES; source note) |
| 9 | Yes, he went back and ran that race again. | `pros_desert` again | desert · pull | — (START banner, he waves; AGAIN) |
| 10 | Subscribe for a wild true story every day. | `pros_desert` end | desert · pull | waves, points at viewer on "story" |

Kaşif in scenes 4 and 10 (2/11 = 18 %) + cover/hook overlay. 5 types, max 2 of one type in a row, pros_desert 5/11.
Left out entirely: any self-harm detail.

### Cover candidates (rendered and compared side by side)
- **A (chosen):** scene 0 t 1.6, "HE ATE / BATS" (highlight BATS) = first spoken line; one big bat + shocked Kaşif, shrine behind.
- B: scene 2 t 2.6, "LOST IN / THE SAHARA" — reads well but brown storm frame is muddy, two figures compete.
- C: scene 3 t 1.2, "9 DAYS, / NO WATER" — four words, the EMPTY card adds a second text, weakest.

### Facts (verified)
- Marathon des Sables, Morocco, April 1994; sandstorm on day four (the long stage); lost nine days; drank his urine;
  sheltered in an empty marabout shrine and ate the bats there raw; found by a young Tuareg girl; ended up in Algeria,
  about 180 miles from where he disappeared (OffGrid: 180 miles; History-Computer: "more than 181 miles"; Wikipedia
  intro says 300 km, body 180 miles — narration uses 180 miles). Lost ~33–35 lb (not narrated). Later raced the MdS again
  (Wikipedia: returned several times; OffGrid: completed it in 2012).
- Sources: https://www.aol.com/remarkable-story-one-man-survived-140228866.html (History-Computer),
  https://www.offgridweb.com/survival/alone-in-the-sahara-the-survival-story-of-mauro-prosperi/,
  https://en.wikipedia.org/wiki/Mauro_Prosperi
- Not claimed: "followed the clouds" (not found in sources read), exact weight, bat blood.

## Eleştiri günlüğü — Round 1

### ag-01-mauro-prosperi — tur 1 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 6 | 7 | 7 | 8 | 8 | 8 | 8 | 7 (kapak) / 9 (SEO) |

Facts check (WebSearch): April 1994 MdS, sandstorm, 9 days, urine, marabout shrine with bats eaten raw, found by a young
nomad (Tuareg) girl in Algeria — all confirmed. Distance is usually cited as ~291–300 km (≈180–186 mi); "180 miles" is fine.
Hareket: no `motion` numbers were in the preview output given to me; frame pairs do differ — writer, paste STATIC? result next round.

1. **Cover / scene 0 (cover 7 < 8, must redo):** the big bat's left wing is clipped by the frame edge (x < 40), its body
   sits on top of the shrine dome, and the shrine + 3 background bats + big bat + Kaşif give 3 competing focal points; a dead
   grey band (y ≈ 520–830) sits between the text and the bat. → hook mode: bat scale ~1.0 at x ≈ 0.40, y ≈ 0.36 (fills the
   empty band, fully inside frame, overlapping nothing); shrine smaller and far left (or hidden in hook mode); drop the
   background bats on the cover frame. One bat + shocked Kaşif only.
2. **Scene 6 (and 7) visuals don't read:** scene 6 "RAW" card is cut off at the right edge (x 0.62, size 100 under zoom
   1.6) → x 0.52 / size 84; the room reads as a modern room with a window grid, not a desert shrine → whitewashed mud wall,
   arched doorway with light, no window frame; the bat in his hand is a tiny dark blob → ≥ 1.6× bigger, wings half open, ears
   visible. Scene 7: the goats read as odd lizard/cow shapes and the girl stands on top of a goat → smaller goats with horns,
   spaced apart, girl standing clear between them; the "Nine days later" subtitle frame is still fading in (OK if only preview).
3. **Script scenes 3–6 read like a list + host identity clash:** "His water ran out… He drank… He found… He ate them raw."
   are four bare sentences with no connector. Within budget (≤ 440 chars): scene 5 → "Then he found a shrine, full of bats.",
   scene 6 → "So he ate them raw." (drops "empty", adds two links). Also Mauro's head wrap has a red dot on the front
   (scenes 1–9) that echoes Kaşif's red fez and reads like a bindi/turban jewel → remove the dot (plain pale wrap). Minor:
   scene 9 "AGAIN" card (x 0.78, y 0.52) covers a runner → y 0.30; scene 2 footprint fade on "gone" is not visible in the
   frames → make prints darker/bigger; scene 8 map labels MOROCCO/ALGERIA sit at y ≈ 1480–1580 (YouTube UI zone) → move up
   to y ≈ 1350.

### ag-01-mauro-prosperi — round 1 fixes (writer)
1. Cover / scene 0: shrine and background bats removed in hook mode; one big bat (x 0.40, y 0.40, scale 1.25) fully in
   frame, below the cover shade so it stays dark, beside the shocked Kaşif overlay (x 815). The pale band under the text is
   the engine's cover shade (paper → transparent between 36 % and 50 % of the height); the bat now starts right under it.
2. Scene 6: whitewashed mud-wall interior (plaster patches) with a sunlit arched doorway and sand in it on the right;
   held bat drawn with half-open wings and ears (~2× bigger); RAW card at (0.53, 0.28), fully in frame. Scene 7: new
   goat drawing (brown body, pale belly, curved horns, floppy ear, beard, raised tail), three goats spaced at x 0.50 / 0.62
   (behind) / 0.95, girl at x 0.78 standing clear.
3. Script: "Then he found a shrine, full of bats." / "So he ate them raw." (440 chars). Mauro's head-wrap is now drawn in
   the shot file (plain pale wrap with two fold lines, no red jewel). Minor: AGAIN card (0.78, 0.37), under the START
   banner (0.30 would sit on the banner); storm footprints darker and bigger; map names at y 0.68–0.70 (≈ 1310–1345).
Preview motion: 5.6 · 13.9 · 13.5 · 12.4 · 12.9 · 17.2 · 15.8 · 17.7 · 8.2 · 19.5 · 12.9 — no STATIC?. Lint OK, SEO 100.

## Eleştiri günlüğü — Round 2

### ag-01-mauro-prosperi — tur 2 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 (kapak) / 9 (SEO) |

All round-1 points fixed: cover is now one bat + shocked Kaşif (single focus, nothing clipped; pale band = engine cover
shade, accepted); scene 6 reads as a shrine (arched doorway), RAW in frame, bat readable; scene 7 goats/girl clear; scenes
5–6 linked ("Then… / So…"); red dot gone from Mauro's wrap. Lint OK, motion 5.6–19.5. **Pass — no blockers.**
Optional polish only (not required):
1. Scene 8: on the push the "ALGERIA" label is cut at the right edge (late frame) → x ≈ 0.82 or less push.
2. Scene 5: the cued word "shrine," renders tiny mid-pop in the subtitle frame → check it's only a transient pop frame.
3. Narration is 441 chars (budget note said ≤ 440) → drop one character if it matters (e.g. "And yes," → "Yes,").
