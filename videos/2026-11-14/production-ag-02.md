# ag-02-myeongnyang-13-ships — Stickstory Short (empires and battles)

- **File:** `videos/2026-11-14/ag-02-myeongnyang-13-ships.json` · format short · publish_at `2026-11-14T19:00:00-05:00` (Istanbul 15.11 03:00)
- **Category:** empires and battles (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403); no usable front-page story for this category → **topic from the pool** (reported).
- **Topic:** Battle of Myeongnyang, 1597 (Imjin War). Admiral Yi Sun-sin — shortly before stripped of command, jailed and
  tortured, sent back as a common soldier — was reinstated after the Korean fleet was destroyed at Chilcheollyang. He was
  left with about 12–13 warships. The court suggested he give up the sea and fight on land; he wrote back (famous line)
  "I still have twelve ships" (今臣戰船 尙有十二). At Myeongnyang Strait (Uldolmok) — narrow, with one of the strongest tidal
  currents in Korea — he faced ~133 Japanese warships (plus support ships). He held the strait, the tide turned against the
  Japanese, about 30 Japanese ships were destroyed/disabled, Korea lost none. VERIFY all numbers on ≥ 2 sources (Britannica,
  Korean sources, Yi's war diary Nanjung Ilgi references); use only numbers the sources agree on, hedge ("about").
  Avoid myths (no "turtle ships fought at Myeongnyang" — they were lost at Chilcheollyang; check).
- **Viewer should feel:** "13 against 133, and he won by using the sea itself."
- **Hook (3–8 words, same idea as cover):** e.g. "13 ships against 133. He won." ↔ cover "13 vs 133". ≥ 3 cover candidates.
- **Structure:** hook (13 vs 133) → 2nd sentence 1597 Korea + who he is (jailed, demoted, fleet gone) → "I still have
  twelve ships" → the strait + the tide (the trick) → punchline (standalone) + one short subscribe line with reason.
- **Related long video:** none.
- **Budget:** `elevenlabs_chars.warning: true` → narration **400–425 chars** (hard max 550).
- **Look:** sets `sea`/`coast`/`storm`; a map of the narrow strait with the current arrows (map type or new type), a
  wall of enemy ships vs a thin line, a close-up of Yi writing the letter with a brush (zoom ≥ 1.6), the tide turning
  (whirlpools, ships colliding). New type in its own file `scenes/studio/shots/mn_*.js`. Korean (Joseon) and Japanese
  period figures: dress respectfully, no caricature. Kaşif host 15–25 %. On-screen `source` ≥ 1 (e.g. "Britannica").
  Pattern must differ from recent shorts (2026-11-09 Mongol invasion of Japan uses Japan/sea — make this look different:
  narrow strait, cliffs, whirlpools).

## Writer — narration, fact check, shot list, cover

### Narration (written first, one piece; 422 chars + scene joins = 423)
Thirteen ships against 133. In 1597, Japan wiped out Korea's navy, while Admiral Yi Sun-sin was demoted to a common
soldier. The king told him to fight on land. Yi wrote back, "I still have twelve ships." His trick? A narrow strait
where the tide roars. When it turned, the Japanese ships drifted back and smashed together. About thirty were lost.
Yi lost none. The sea fought for him. Subscribe for a true story every day.

(12 vs 13: the letter says twelve; one more ship joined before the battle, so 13 fought. Both numbers are the
historical ones; the hook uses the battle count, the quote stays as Yi wrote it.)

### Fact check (each ≥ 2 sources)
| Claim | Sources | Note |
|---|---|---|
| 13 Joseon warships vs 133 Japanese warships | Wikipedia Battle of Myeongnyang (Yi's record: 133); Korea JoongAng Daily; Haenam county (Asia Economy) "13 ships defeated 133"; Encyclopedia.com (133) | Support ships (up to ~200 more) not mentioned |
| 1597, Japan destroyed almost the whole Korean navy (Chilcheollyang) while Yi was demoted | Britannica (demoted to common soldier; Japanese "destroying almost all of the Korean navy"); Encyclopedia.com (arrested, death sentence commuted, served in the ranks; reappointed after Won Kyun's defeat); Wikipedia | |
| King ordered the navy disbanded, men to fight on land; Yi replied "I still have twelve ships" | Wikipedia (Imjin Changch'o); Encyclopedia.com (12 ships, none turtle ships) | Turtle ships: none at Myeongnyang (myth avoided) |
| Narrow strait with a roaring, very fast tide | Wikipedia Myeongnyang Strait (~293 m narrowest, up to 11.5 knots, "Uldolmok" = screaming/roaring sea); Wikipedia Jindo (~300 m, fastest currents); JoongAng Daily ("notoriously strong and fast") | On screen "300 m WIDE" |
| Tide turned, Japanese ships drifted back and collided | Wikipedia (Hawley, Turnbull); Encyclopedia.com (lured into the strait) | |
| About 30 Japanese ships lost, none Korean | Wikipedia (31; Nanjung ilgi "at least 30"; Lewis "about 30"); Encyclopedia.com (31 sunk, Yi lost none); JoongAng Daily (31) | Hedged "about thirty" |

### Shot list (new type file `scenes/studio/shots/mn_strait.js`: mn_sea, mn_deck, mn_letter, mn_map)
| # | Text | Type | Set / camera | Visual |
|---|---|---|---|---|
| 0 | Thirteen ships against 133. | mn_sea | ocean · push | wall of 133 Japanese ships on the horizon, thin diagonal line of 13 panokseon; stamps 13 / 133; source "Yi's war diary" |
| 1 | In 1597, Japan wiped out Korea's navy, | mn_sea | night · pull | Joseon ships burn and sink, Japanese ships close in; "1597", "NAVY GONE" |
| 2 | while Admiral Yi Sun-sin was demoted to a common soldier. | mn_deck march | hills · right | column of spearmen, bearded Yi among them; "ADMIRAL" struck, "SOLDIER" stamp |
| 3 | The king told him to fight on land. | mn_letter order | interior · push | royal scroll unrolls, "FIGHT ON LAND", red seal on "land" |
| 4 | Yi wrote back, "I still have twelve ships." | mn_letter reply | interior · **close-up 1.6** | brush writes "I STILL HAVE / 12 SHIPS" |
| 5 | His trick? A narrow strait where the tide roars. | mn_map + **Kaşif** points / shocks | set false | chart of the strait, neck, tide lines, whirlpools, "300 m WIDE", "TIDE" |
| 6 | When it turned, the Japanese ships drifted back and smashed together. | mn_sea | ocean · **close-up 1.6** | cliffs, tide streaks reverse, ships drift back and collide, splinters; "TIDE TURNS" |
| 7 | About thirty were lost. Yi lost none. | mn_sea | ocean · left | Japanese ships burn and sink behind, 13 Joseon ships intact; counter "~30 LOST", "YI: 0 LOST"; source |
| 8 | The sea fought for him. | mn_deck deck | ocean · push | Yi (jeonrip hat with red tassel) behind his flagship's wall points; whirlpool swallows a Japanese ship |
| 9 | Subscribe for a true story every day. | mn_sea + **Kaşif** waves → points | ocean · pull | headland, 13 ships sail home |

Kaşif 2/10 = 20 %. Palette `ag-sage`. Joseon/Japanese drawn as ships and plain stick figures with period headgear; no caricature.

### Cover candidates (same text "13 SHIPS / VS 133", first-sentence idea)
- **A (chosen):** scene 0, t 1.0, focus [560, 1120] zoom 1.5 — fleet wall + Joseon line big, shocked Kaşif. Clearest single idea (few vs many).
- B: scene 6 collision — ships small, "TIDE TURNS" stamp competes with the cover text.
- C: scene 7 aftermath — readable but Kaşif pointing with a smile, weaker emotion.

### Narration v2 (after round 1; 430 chars)
Thirteen ships against 133. In 1597, Japan wiped out Korea's navy. Yi Sun-sin, its demoted admiral, got back what was
left. The king said: fight on land. Yi replied, "I still have twelve ships." One more joined. His trick? A narrow strait
where the tide roars. When it turned, the Japanese ships drifted back and smashed together. About thirty were lost.
Yi lost none. The sea fought for him. Subscribe for a true story every day.

## Eleştiri günlüğü

### ag-02-myeongnyang-13-ships — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 6 | 6 | 7 | 7 | 8 | 8 | 8 | 8 | 6 / 9 |
1. Cover/hook: 13 Joseon ships blend into the Japanese wall, Kaşif cut off, empty fog band.
2. Script skips the reinstatement; 12 vs 13 confuses.
3. Readability: map labels clipped, brush covers "12 SHIPS", strait cliffs not in crop, "~30 LOST" glyphs, Yi's face black, little motion in 8–9.

**Changes (writer):**
- Narration v2 (reinstatement + "One more joined."), 430 chars; lint OK, SEO 100/100.
- Scene 0: wall pushed back to the horizon (y 0.37–0.43, smaller), clear water band, 13 Joseon ships in an evenly spaced, staggered row (countable), "13" stamp moved into the water band. Cover: 3 new candidates (A hook row vs wall, B "YI: 0 LOST" scene crop, C collision with cliffs) → A kept: focus [540, 1010] zoom 1.12, `fade: false`, Kaşif fully inside (x 850, y 1860, scale 1.0).
- Scene 2: "ADMIRAL" crossed → "SOLDIER" on "demoted" → on "got back" SOLDIER struck, Yi's felt hat flips to the officer's jeonrip, he points, blue "ADMIRAL" stamp.
- Scene 4: brush lifts and parks below the text; drawn hand (palm, curled fingers, thumb, blue cuff); on "One" a red line strikes "12" and a red "13" is written above it.
- Scene 5: "300 M WIDE" stamp 76 px in open land (x 0.66, y 0.28) with arrow to the neck; "TIDE" at x 0.42 y 0.5 on land, arrow to the channel.
- Scene 6: cliffs at x 0.21 / 0.84 with a dark rock fill, ships +30 %, camera zoom 1.3 so both cliffs stay in frame.
- Scene 7: counter "30 SUNK"; Joseon line raised to y 0.50–0.55, sinking Japanese ships smaller behind; line drifts.
- Scene 8: jeonrip brim raised, short beard → face readable; Yi's head/shoulders above y 1170; command banner snapping in the wind, tide streaks, two ships spiral into the whirlpool.
- Scene 9: the 13-ship line sails (vx 22 px/s).

### ag-02-myeongnyang-13-ships — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 7 | 7 | 8 | 7 | 8 | 8 | 9 | 8 | 7 / 9 |
1. Cover/hook: the 133 wall reads as a faded fog strip, dead band above it.
2. Scene 4: struck "12" reads as "42".
3. Scene 8: flat blue rectangle cut at the right edge; scene 6 cliffs do not read as a narrow strait. (Minor: scene 2 old ADMIRAL/SOLDIER pair stays.)

**Changes (writer, final round):**
- Wall: horizon 690, rows y0 0.372, s0 0.10 (+0.04/row), all rows full ink with dark (ink-soft) hulls and red banners; 13-ship line raised to y 0.535 (≈1030 px), s 0.15, pennants ×1.7. Cover: 3 candidates (focus [540, 900] z1.35 / [540, 920] z1.2 / [540, 880] z1.5) → kept the wide one, final focus [540, 900] zoom 1.12, `fade: false`, Kaşif scale 1.15 at the line's level, fully inside (fez ≈ 70 px from the frame).
- Scene 4: on "One" a paper patch with a red ring covers the "12" and a red "13" is written on it (no strike line).
- Scene 8: pennant half size (165 × 105) on a visible pole at x 0.88, fully in frame.
- Scene 6: cliffs at 0.26 / 0.80 with a steeper face (slope 0.10) → a narrow channel between two dark walls; ships moved off the left cliff.
- Scene 2: the first ADMIRAL / SOLDIER pair fades out when the blue ADMIRAL lands.
- Lint OK (SEO 100/100), preview: no STATIC?, all cues matched.

### Round 3 (critic, director's final gate)
Senaryo 8 · Kanca 8 · Okunabilirlik 8 · Görsel 8 · Hareket 8 · Kompozisyon+Kaşif 7 · Derinlik 8 · Tempo 8 · Doğruluk 9 · Kapanış 8 · Kapak 8 / SEO 9 → **pass**.
Leftover (not blocking): on the cover Kaşif covers ~2 of the 13 ships; a fog band remains at y≈520–860.
