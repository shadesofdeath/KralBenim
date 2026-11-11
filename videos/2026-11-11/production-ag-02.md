# ag-02-berlin-wall-overnight — Stickstory Short (how it was built)

- **File:** `videos/2026-11-11/ag-02-berlin-wall-overnight.json` · format short · publish_at `2026-11-11T19:00:00-05:00` (Istanbul 12.11 03:00)
- **Category:** how it was built (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403) → web search. Chosen (Germany): berlin.de, Nov 2026: "Roses and candles commemorate
  the fall of the Wall" (9 November commemorations, Bernauer Straße).
- **Topic:** how the Berlin Wall was put up almost overnight — 13 August 1961 ("Operation Rose"): in the small hours of a Sunday, East German
  troops/police and workers rolled out barbed wire and posts across the city (~155 km around West Berlin incl. ~43 km through the city — VERIFY),
  roads torn up, U-Bahn/S-Bahn stations closed; concrete blocks came days later; it grew over the years into the "fourth generation" wall
  with a death strip. Two months earlier (15 June 1961) Walter Ulbricht had said "Nobody has the intention of building a wall" (VERIFY wording).
  Famous image: soldier Conrad Schumann jumping the barbed wire on 15 Aug 1961. History, NOT current politics; neutral, factual tone,
  no modern political figures. VERIFY on ≥ 2 sources (Berlin Wall Memorial / Stiftung Berliner Mauer, berlin.de, Britannica, History.com, BBC).
- **Viewer should feel:** "A city was cut in half in one night — with wire, not concrete."
- **Hook (3–8 words, same idea as cover):** e.g. "The Berlin Wall started as wire." / "Berlin woke up cut in half."
  ↔ cover e.g. "ONE NIGHT / ONE WIRE" / "SPLIT / OVERNIGHT" / "JUST / WIRE". ≥ 3 cover candidates.
- **Structure:** hook → Sunday 13 Aug 1961, 1 a.m., wire rolls out → why at night on a Sunday (surprise; city asleep) → the June promise
  "nobody intends to build a wall" → wire becomes concrete over the next days/years → punchline + one short natural subscribe line with reason.
- **Related long video:** none.
- **Budget warning (ElevenLabs warning: true):** narration **400–430 chars**.
- **Palette:** `ag-dusk` (night). Sets: `night`, `city` (street with apartment blocks, Brandenburg Gate silhouette is fine as a generic building),
  `interior` optional. Kaşif host 15–25 %, ≥ 1 close-up (wire/coil or a clock at 1 a.m.), on-screen `source` ≥ 1.
  Pattern: a city street cut across by a line — distinct from today's Fitzgerald short and recent videos.

## Narration, shot list, cover candidates — writer

### Narration v1 (428 chars)
Berlin was split in one night. Early on Sunday, August 13, 1961, soldiers and police rolled barbed wire across the
streets. By morning, families woke up on two sides of it. Two days later, concrete slabs arrived. Here's the twist.
Two months earlier, East Germany's leader said, "Nobody intends to build a wall." The Berlin Wall stood for 28 years,
and it began as a roll of wire. Subscribe for a true story like this every day.

### Shot list (10 scenes; new shot file `scenes/studio/shots/bw_berlin.js`: bw_street / bw_clock / bw_coil / bw_podium)
| # | Text | Type / mode | Set · camera | Kaşif / notes |
|---|---|---|---|---|
| 0 | Berlin was split in one night. | `bw_street` wire | night · push | **shock, lower right** (cover); wire unrolls across the street behind a drum, two helmeted soldiers walk with it, windows light up |
| 1 | Early on Sunday, August 13, 1961, | `bw_clock` | night · push | — street clock passes 1:00, second hand ticks, wire draws itself along the bottom; card "Sunday, Aug 13, 1961" |
| 2 | soldiers and police rolled barbed wire across the streets. | `bw_coil` roll | night · move right | — soldier + policeman roll the drum, posts and barbed strands appear as it passes |
| 3 | By morning, families woke up on two sides of it. | `bw_street` morning | city · close (1.25) | — father waves from the far side, mother + child wave back; neighbours' heads fill the bottom |
| 4 | Two days later, concrete slabs arrived. | `bw_street` slabs | city · pull | — crane lowers a slab on "concrete", dust; card "Aug 15"; source Chronik der Mauer |
| 5 | Here's the twist. Two months earlier, East Germany's leader said, | `bw_podium` | interior · push | — press conference, Ulbricht (glasses, goatee) at microphones, flash bulbs; card "June 15, 1961", label "Walter Ulbricht"; source German Government |
| 6 | "Nobody intends to build a wall." | `bw_podium` | interior · **close (1.6)** | — face close-up, flashes burst on "Nobody", red "No wall?" |
| 7 | The Berlin Wall stood for 28 years, | `bw_street` wall | night · pull | — concrete wall with pipe top, watchtower + sweeping searchlight, year rolls 1961 → 1989 |
| 8 | and it began as a roll of wire. | `bw_coil` still | night · **close (1.7)** | — coil on the cobbles, post, swaying barbed strands, glint |
| 9 | Subscribe for a true story like this every day. | `bw_street` memorial | city · push | **waves, then points at the roses/candles** (ties to the 9 Nov commemoration headline) |

Kaşif 2/10 (20 %). 4 types (bw_street 5 = 50 %, bw_coil 2, bw_podium 2, bw_clock 1). Palette ag-dusk.

### Facts (verified)
- Sealing began in the night of 12–13 August 1961, early on Sunday 13 August (German Federal Government: "Sunday morning",
  troops, border police, police and workers' militia; HISTORY.com: "shortly after midnight", barbed wire, families woke up cut off;
  historyskills: ~1 a.m. — so the clock shows ~1:00 and the kicker says "1 a.m." only as an approximate on-screen time).
- 15 August 1961: first cement slabs across road crossings (Chronik der Mauer chronicle, 15 Aug; concrete posts already on 13 Aug).
- Ulbricht, 15 June 1961: "Nobody intends to build a wall" (German Federal Government page; the German original "Niemand hat die Absicht,
  eine Mauer zu errichten").
- The Wall stood from 1961 until 9 November 1989 = 28 years.
- Dropped: lengths (155 km / 43 km — sources give different figures for different stages), Conrad Schumann (budget).

### Cover candidates (rendered with `build.py --cover --no-tts`, compared side by side)
- **A (chosen):** scene 0 t 1.6, "SPLIT IN / ONE NIGHT" (NIGHT) — same idea as line 1; shocked fez host big in the lower right, wire line + soldiers.
- B: scene 8, "IT BEGAN / AS WIRE" (WIRE) — strong single object (coil + post) but no host (cover Kaşif override didn't render on this shot), less human.
- C: scene 4, "WIRE FIRST, / THEN CONCRETE" (CONCRETE) — explains instead of teasing; busy frame, no host.

## Eleştiri günlüğü

### Round 1 (critic)
lint: OK · preview motion: s0 2.6 (lowest), s1 19.1, s2 16.1, s3 22.0, s4 20.5, s5 20.8, s6 12.6, s7 22.6, s8 15.0, s9 18.0 · ~31 s, 428 chars · Kaşif 2/10.
Facts spot-checked (web): 13 Aug 1961 night sealing with barbed wire, first concrete slabs 15 Aug, Ulbricht 15 June 1961 "Niemand hat die
Absicht, eine Mauer zu errichten", 1961–1989 = 28 years: all correct. Note: the German Government page now lives at
`https://www.bundesregierung.de/breg-en/service/archive/construction-berlin-wall-1777024` (search result); the `breg-en/issues/…` URL in
`sources` may be stale. Update it.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 6 | 7 | 6 | 8 | 7 | 9 | 8 | 7 |

1. **Scene 0 (hook + cover), the "split" can't be seen.** The barbed wire is a thin grey line far back at y ≈ 1330. It sits behind the
   soldiers, at the same depth as the buildings. No wire drum is visible, and the soldiers walk with nothing in their hands. Nothing
   unrolls in the frames, and motion is 2.6 (the lowest of the video). The fez covers the wire on the right. The top ~35 % (y 520–720 under
   the cover text) is empty pale fog. At thumbnail size it reads as "two soldiers in a street", not "a city cut in half". **Fix:** bring the
   wire forward and make it the hero: a thick coil across the full width at y ≈ 1350–1450 in front of the host, visibly unrolling from a
   drum that soldier 1 pushes (drum at the wire's leading edge), and the two sides contrasted (lit windows on the near side, a dark far
   side). Move the host so the fez doesn't cover the wire (x ≈ 0.78, behind the coil, or put him on the near side reaching toward it).
   Raise the street or lower the cover text so the fog band is gone. Re-render 3 cover candidates. Cover target ≥ 8.
2. **Scenes 5–6 (press conference, 7.1 s of 32 s = the twist), visually dead and slow.** S5 is 4.8 s. Ulbricht is a small head behind a
   wall of blob microphones, and "Here's the twist." is a filler phrase that spends ~1.5 s. In S6 the "close-up" shows four black tadpole
   mics covering his chest. No flash bulbs and no red "No wall?" label appear in either sampled frame. His face reads oddly: eyes closed
   behind glasses, and a dark grey jaw patch for the goatee. The bottom 40 % (y 1250–1920) is a flat green tablecloth. **Fix:** cut
   "Here's the twist." (start with "Two months earlier, …"; this frees ~18 chars). Make the mics thin stick-and-ball mics on stands, set
   lower so his face and hands show. In S6, put reporters' heads + raised notebooks in the lower third and fire 2–3 flash bursts on
   "Nobody". Fire the "No wall?" label on "Nobody" (or `intends`), not on the last word "wall", so it holds for more than a few frames.
   Give Ulbricht open eyes and a thin goatee line instead of the shaded jaw.
3. **Empty lower half in scenes 1, 2, 4, 7, 8 (and 9): breaks the "full frame" rule (BRAND §5.1 / CLAUDE.md: y 1320–1920 must not be
   empty).** Below the subtitle these frames show only plain cobble/pavement texture. In S7 the "1961→1989" counter also collides with the
   watchtower (the counter at x 0.5 y 0.2 overlaps the tower box), and S4's single slab hangs in an empty sky while the 4 placed slabs are
   tiny at mid-height. **Fix:** add a foreground layer to the `bw_*` street/coil sets: a kerb + gutter with a coil end or posts in the
   foreground (S1, S2, S8), the backs of onlookers' heads (S4, S7, S9), and a lower ground line so the scene sits lower. In S7 move the
   counter to x ≈ 0.35 or the tower to x ≈ 0.85 and lower it. In S4 zoom the camera to the slab line (`focus` on the drop, zoom ≥ 1.6), which
   also gives a close-up for the concrete beat.

Minor (not in top 3): the script has no "why". One clause on why the GDR sealed the border (people were fleeing west; verify a figure
before using it) would turn a fact list into a story, and the ~18 chars from cutting "Here's the twist" pay for part of it. S2: the
soldier/police walk *behind* the posts and the coil is already fully strung in the first frame, so "rolled" doesn't play. S9: the host's
"point at the roses" pose isn't readable in the sample (the arm hangs down).

### ag-02-berlin-wall-overnight — Round 1 fixes (writer)
- Narration v2 (429 chars): "Here's the twist." cut; WHY added without a number: "soldiers rolled barbed wire across the streets, **to stop
  people fleeing west**" (German Federal Government archive: "tens of thousands had already voted with their feet"; HISTORY.com: soldiers
  laid the wire); "By morning" → "By dawn"; "**Yet** two months earlier, East Germany's leader said, …".
- Source URL updated to the current archive page (verified live): bundesregierung.de/breg-en/service/archive/construction-berlin-wall-1777024.
- Scene 0 / cover: new `front` coil in `bw_street`. A thick coil runs across the near pavement (y ≈ 1270–1440) and unrolls from a drum
  that a helmeted soldier pushes. The host has moved off the wire to the right of the pavement and is shocked as the coil rolls towards
  him. The lamp has been removed and the windows light up one by one. Motion went from 2.6 to 3.4. The pale band at the top is the
  engine's Shorts cover/hook text backdrop (ty = 17 % H shift, engine.js `coverShift`). It is a shared file, so I didn't touch it.
- Covers re-rendered: **A "SPLIT IN / ONE NIGHT"** (chosen: coil rolling at the shocked host, soldier, lit windows), B "ONE NIGHT, /
  ONE WIRE" (the soldier overlaps the host), C "\"NO WALL,\" / HE SAID" (podium; no host and a small subject).
- Scenes 5–6: thin microphones on stands below the chin, open eyes behind thin glasses and a thin goatee stroke (the big beard is gone).
  The table cloth is shorter, so reporters' heads and notebooks sit in the lower third. On "Nobody" four flash bulbs fire around him, and
  "No wall?" now appears on "Nobody" (x 0.4, inside the close-up).
- Foreground filled: clock (1) gets a kerb and a thick coil unrolling along the bottom. The coil scenes (2, 8) get a near kerb, two post
  stubs and a big second coil. Scenes 4, 7 and 9 get onlookers' heads. Scene 2 starts with 20 % already unrolled, and the drum rolls on
  "rolled"; a "WEST →" card appears on "west". Scene 4 is a close-up (focus [700, 1000], zoom 1.6) on the slab line. Scene 7's year
  counter moved left (x 0.3) and is clear of the watchtower (x 0.82). Scene 8 is a close-up at zoom 1.6 on the coil. In scene 9 the host
  stands at x 0.62 and waves, then points down-left at the roses.
- Lint OK (0 errors, 0 warnings); preview: no STATIC?, motion 3.4–30.

### Round 2 (critic)
lint: OK · preview (re-run): motion s0 4.4, s1 23.3, s2 27.1, s3 21.9, s4 29.3, s5 19.7, s6 18.9, s7 26.4, s8 23.4, s9 20.5. No STATIC? · ~32 s, 429 chars.
Narration v2 reads well: the WHY ("to stop people fleeing west") turns the fact list into a story, and "Yet two months earlier" is a
better turn than "Here's the twist". Fixed: the hook (the coil rolls at the shocked host and reads as "cut in half"), the S6 close-up
("No wall?" and flashes on "Nobody"), the foreground layers in 1, 2, 7, 8 and 9, and the S7 counter. The pale band behind the hook/cover
text is the engine's (not penalised).

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | **6** | 7 | 8 | 7 | 8 | 7 | 9 | 8 | 8 |

1. **Scene 4 (concrete), blocking: the "Aug 15" card collides with the kicker.** The new close-up (focus [700, 1000], zoom 1.6) scales the
   label with the scene. The red "Aug 15" card now sits under "CONCRETE / Source: Chronik der Mauer" at top-left: half the date is hidden
   behind the kicker, the card is cropped at the left edge, and it covers the hanging slab (frame_09). The zoom also pushes the onlookers'
   heads out of frame (one head peeks in at y > 1820), so y 1340–1920 is bare paving again. **Fix:** move the label to x ≈ 0.62, y ≈ 0.42
   in scene space, which lands right of and below the kicker after zoom. Alternatively, drop the zoom to ~1.3 and keep the label at
   y ≥ 0.33. Either way, raise or enlarge the crowd so heads fill the bottom ~15 % after zoom, then check frame_08/09 again.
2. **Scene 5 (press conference wide): Ulbricht stands on top of the table, and the mics are at table level, not at his mouth.** His feet
   end on the tablecloth line (y ≈ 1060) and the four mics are tiny blobs lying on the table about 200 px below his chin. He reads as a
   man standing on a desk, not a leader speaking into microphones. **Fix:** lower the speaker so the table edge cuts him at mid-chest
   (head centre ≈ y 900). Give the mics stems from the table up to chin height (heads ≈ y 960–1000, ~40 px), spread around him. The
   "Walter Ulbricht" label can stay.
3. **Tempo, Scene 2 is 5.3 s on one shot.** The only change across "soldiers rolled barbed wire across the streets, to stop people
   fleeing west" is the small "WEST →" card. Scene 9 also runs 4.9 s. The Shorts rule is a new image every 2–4 s. **Fix:** split scene 2
   at "to stop people fleeing west" into its own scene. It must show the reason, for example people with suitcases hurrying towards the
   wire / the Brandenburg Gate silhouette with a big "WEST →" arrow, or a simple `map` of Berlin with the West in a different tone and
   arrows. That gives 11 scenes and adds variety (a `map` makes 5 types). In S9, fire the point at the roses earlier (on "true") so the
   pose change lands mid-scene.

Minor: in frame_10 (S5) the subtitle box is drawn two lines tall with only "earlier," on the first line (probably a phrase-transition
frame; check that the box doesn't stay tall in the render). Cover A is now strong (the coil leads the eye to the shocked host, lit
windows, the soldier pushing the drum), so 8. The fez tip is ~30 px from the gold frame; nudging the host to x ≈ 0.80 gives it air.

### ag-02-berlin-wall-overnight — Round 2 fixes (writer)
- Narration v3 (426 chars, 11 scenes): scene 2 is split. "soldiers rolled barbed wire across the streets," | "to stop people fleeing west."
  (new scene 3, `bw_coil` still: a man and a woman with suitcases hurry right behind the finished wire, a boy runs after them, red
  "WEST →" card on "west"; new `suitcase: true` cast option). Scene 5 is now "Two days later, concrete arrived." (frees characters).
  Scene 6 is now "Yet East Germany's leader had said two months earlier," so "earlier," no longer sits alone on a subtitle line.
- Scene 5 (slabs, blocking): zoom 1.3 (focus [700, 1000]). The "Aug 15" card moved onto the cobbles below the line (x 0.54, y 0.63),
  clear of the kicker and the slab. The crowd has a new `crowd: {y, r, n}` option; heads now fill the bottom from about y 1400 on screen.
- Scenes 6–7: Ulbricht lowered (y 0.665), so the table edge cuts mid-chest. The mics are on thin stems, their heads at chin height,
  either side of his face.
- Scene 10: the host points at the roses on "true". The cover host stays at x 0.80; the fez clears the frame. Cover A is unchanged.
- Lint OK (0 errors, 0 warnings); preview: no STATIC?.

### Round 3 (critic)
lint: OK · preview (re-run): 11 scenes, 426 chars, ~32 s, motion 4.4–27.0, no STATIC? · types: bw_street 4 (36 %), bw_coil 3, bw_podium 2,
bw_clock 1 · Kaşif 2/11 (18 %).
All three Round 2 problems are fixed. S5: "Aug 15" sits on the cobbles, clear of the kicker and the slab, and heads fill the bottom. S6–7:
the table cuts Ulbricht at mid-chest and the mics on stems are at his chin. S2 is split: S3 "WHY?" shows people with suitcases hurrying
toward "WEST →", and each shot now runs 2.1–3.8 s except the subscribe close (4.9 s). S10: the point at the roses lands mid-scene.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |

**Passes (all ≥ 7, cover 8). Nothing blocking.** Minor, optional:
1. S3: the fleeing family walks *behind* the finished wire, so it is unclear which side they are on. A version where they hurry toward
   the wire from the near side, with the "WEST →" card beyond it, would read the motive more clearly.
2. S7: the orange flash burst at right sits half under the subtitle bar edge (y ≈ 1300–1400). Moving it to y ≤ 0.6 keeps the bar clean.
3. Kompozisyon+Kaşif stays at 7. The host appears only at the open and the close (18 %, inside the rule), and the middle is all
   soldiers, wire and podium. Acceptable for a 32 s Short.
