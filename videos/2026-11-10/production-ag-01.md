# ag-01-armistice-last-minutes — Stickstory Short (empires and battles)

- **File:** `videos/2026-11-10/ag-01-armistice-last-minutes.json` · format short · publish_at `2026-11-10T13:00:00-05:00` (Istanbul 10.11 21:00)
- **Category:** empires and battles (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → web search. Chosen: Remembrance / Armistice Day coverage
  (Euro Weekly News, 8 Nov 2026: "King Charles leads Remembrance Sunday…"; Armistice Day 11 Nov is observed in Canada, Australia,
  New Zealand; Veterans Day in the US). The headline is only the hook context; the story is permanent history.
- **Topic:** 11 November 1918. The Armistice was signed in Marshal Foch's railway carriage at Compiègne at about 5 a.m. (5:10/5:12 —
  verify), to take effect at 11 a.m. Fighting continued for the last ~6 hours; on 11 Nov there were roughly 10,900–11,000 casualties
  incl. ~2,700+ dead (verify numbers on ≥2 sources; if uncertain, don't use exact numbers). Henry Gunther (US, 313th Infantry),
  widely recorded as the last soldier killed in action, at 10:59 a.m. — one minute before the guns stopped (the German soldiers
  reportedly tried to wave him off). Writer: VERIFY every number/date on ≥ 2 reliable sources (Imperial War Museums, Smithsonian,
  National WWI Museum, BBC, History.com); drop anything uncertain; no myths. Tone: respectful (it is a death), no jokes about it.
- **Viewer should feel:** "The war was already over on paper, and men still died for six hours."
- **Hook (3–8 words, same idea as cover):** e.g. "World War One ended at five in the morning." / "The war ended. The shooting didn't."
  ↔ cover "OVER AT / 5 A.M." or "STILL / FIGHTING" or "ONE MINUTE / LEFT". ≥ 3 cover candidates.
- **Structure:** hook (signed at 5 a.m., guns ordered silent at 11) → why 11 (the "eleventh hour" symbolism, time to pass the order) →
  generals kept attacking; thousands of casualties that last morning → Henry Gunther charges at 10:59 → 11:00 silence →
  punchline (complete standalone line) + one short natural subscribe line with reason.
- **Related long video:** none.
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-sage` (differs from the last Stickstory video, ag-slate). Sets: `field` (trenches / no man's land), `interior`
  (the railway carriage), `night`/dawn for 5 a.m. Kaşif host 15–25 %, ≥ 1 close-up (a pocket watch / clock hands at 10:59),
  on-screen `source` note ≥ 1. Pattern different from yesterday's Mongol invasion short.

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration v1 (438 chars)
The war ended at five in the morning. In 1918, Germany signed the armistice in a train car, but the guns would stop at
eleven. For six hours, generals kept attacking, and 2,738 men died that day. At 10:59, an American private, Henry Gunther,
charged a German machine gun. The Germans waved him back. He kept running. Sixty seconds later, the guns went silent.
He missed peace by one minute. Subscribe for a true story like this every day.

### Shot list (10 scenes; new shot file `scenes/studio/shots/am_armistice.js`: am_watch / am_carriage / am_field; reused tank_field, tank_mg)
| # | Text | Type / mode | Set · camera | Kaşif / notes |
|---|---|---|---|---|
| 0 | The war ended at five in the morning. | `am_watch` 5:00 | night (dawn trench) · push | **shock, lower right** (cover frame); pocket watch on a post, far gun flashes |
| 1 | In 1918, Germany signed the armistice in a train car, | `am_carriage` | interior · pull | — Foch (kepi), German delegate, officer; signatures write on "signed", seal on "armistice"; 5 A.M. card; source UK National Archives |
| 2 | but the guns would stop at eleven. | `am_watch` spin 5→11 | field · close (focus watch, 1.08) | — hands race on "guns", 11 circled on "eleven"; 11:00 card |
| 3 | For six hours, generals kept attacking, | `tank_field` | storm · **close** (focus 520,1330, 1.4) | — officer points from trench, two soldiers advance, shell bursts; 6 HOURS stamp |
| 4 | and 2,738 men died that day. | `am_field` crosses | field · push | — rows of crosses rise far→near, counter rolls to 2,738 on "died"; poppies; source Joseph Persico |
| 5 | At 10:59, an American private, Henry Gunther, charged a German machine gun. | `tank_field` | field · close (1.3) | — Gunther runs right across no man's land; 10:59 stamp, name label |
| 6 | The Germans waved him back. He kept running. | `tank_mg` (not firing) | field · close (1.2) | — two German gunners wave on "waved"; Gunther runs in, foreground |
| 7 | Sixty seconds later, the guns went silent. | `am_watch` 10:59→11:00 | field · **close** (1.55) | — second hand sweeps, flashes stop + smoke thins on "silent", 12 circled |
| 8 | He missed peace by one minute. | `am_field` marker | hills · push | — rifle bayonet-down with helmet on the butt, poppies open on "peace"; 1 MINUTE card |
| 9 | Subscribe for a true story like this every day. | `am_field` poppies | hills · close (1.3) | **waves, points at the poppies on "story"** |

Kaşif 2/10 (20 %). 5 types (am_watch 3, am_field 3, tank_field 2, am_carriage 1, tank_mg 1). Palette ag-sage. Pattern vs
yesterday (space/clean room): a pocket watch as the recurring clock motif, a railway car interior, trenches, a cemetery, poppies.

### Facts (verified)
- Signed about 5 a.m., 11 Nov 1918, in a converted railway dining car in the Forest of Compiègne; ceasefire 11:00 (UK National
  Archives blog; History.com: "shortly after 5 a.m.", Foch set 11 a.m.; Wikipedia: signatures 5:00–5:45).
- 2,738 men died on the last day (Persico, via History.com: "at least 2,738"; Wikipedia: 10,944 casualties, 2,738 dead).
- Henry Gunther, private, 313th Infantry, 79th Division, killed 10:59 a.m. charging German machine guns; German soldiers waved him
  away / shouted at him to stop (Wikipedia citing Persico + Baltimore Sun; History.com).
- Dropped: the BAR vs bayonet detail (sources differ), the exact signing minute, his demotion story (budget).

### Cover candidates (rendered with `build.py --cover --no-tts`, compared side by side)
- A: scene 0, "OVER AT / 5 A.M." (5) — literal match to line 1 but abstract ("over" what?).
- **B (chosen):** scene 0, "WAR OVER. / STILL / SHOOTING" (SHOOTING) — the paradox in 4 words; pocket watch at 5:00 + shocked fez host.
- C: scene 7, "ONE MINUTE / TOO LATE" (MINUTE) — strong, but gives away the ending and the watch is cropped at the top.

## Eleştiri günlüğü

### ag-01-armistice-last-minutes — Tur 1 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 6 | 8 | 9 | 9 | 8 | 7 |

Lint OK. Facts spot-checked: 2,738 dead on 11 Nov (Persico via History.com, Wikipedia, PBS/AP coverage) ✔; Gunther killed 10:59, Germans tried to wave him off (Wikipedia, Western Front Association, Time) ✔. Script reads well as audio, no inverted sentences, clean paradox → payoff. Minor: "generals kept attacking" → "some generals" would be more precise (not all commanders attacked).

1. **Scene 6 (tank_mg) — wrong emotion + crowded framing.** Gunther has no `emotion`, so he runs in with the default *smile* toward a machine gun — tonally wrong for the death beat. His head sits right under the subtitle band (~y 1400), g2 at x 0.88 is cropped by the right edge, and the gunners are already arms-up in the first frame (before "waved"). Fix: Gunther `"emotion": "angry"` (or determined), y 1.0 → ~1.08 / scale 1.0 so the head lands ≥ 1450 below the band or move him up above it (y ≈ 0.55, head ≈ 900); g1/g2 x 0.66/0.80, scale 0.85; make them `idle` until cue `w` really (check `at`/`then` timing).
2. **Scene 3 (tank_field) — subject cut off, figures small.** With `focus [520,1330]` zoom 1.4 + move "right", the pointing officer (x 0.13) is cropped to half a moustache at the left edge; the two soldiers are small, plain and float in the upper-middle of the frame while the bottom third is just sandbags. "Generals kept attacking" has no readable general. Fix: officer x 0.22, scale 1.1, moustache visible, pose point toward the wire; soldiers scale ~1.0 and lower (y 0.86); camera focus ~[560,1250], zoom 1.3, move "push" (not "right"); a faint "For six hours" ghost text also shows in the first frame — check it isn't a label leaking from the transition.
3. **Cover + scene 0 — Kaşif cropped, image doesn't show "SHOOTING".** On the cover the fez host is a head + hands jammed into the bottom-right corner touching the frame; BRAND §9 wants a big, readable shocked Kaşif. And the cover image is a calm 5:00 watch — nothing is "shooting", so the boxed word is not shown. Fix: Kaşif x 0.74, y 0.84, scale 1.4 (full head + torso inside, clear of the border), and make the gun flashes over the parapet bright and visible at t 1.2 (bigger burst behind the watch, top-right of sky), or reposition the watch slightly left (x 0.45) so a flash/burst sits beside it. Keep the text (it's the paradox); alternatively "WAR OVER. / GUNS FIRING" (FIRING) if flashes stay small. Scene 1 note (smaller): Foch's "point down" hand ends on the brass lamp, not the document — move the lamp off the table or point Foch's `dir` toward the document (x 0.45).

### ag-01-armistice-last-minutes — Tur 1 (writer fixes)
- Narration v2 (443 chars): "…For six hours, **some** generals kept attacking, and 2,738 men died that day…" (rest unchanged); description: "some commanders".
- Scene 0 / cover: watch moved left (x 0.38, y 0.45, r 0.25); new `bursts` param in `am_watch` → a big shell burst (gold star flash,
  red core, smoke cloud, flying dirt) over the parapet right of the watch, bright at the cover t 1.2 (second burst's cloud behind it);
  fez host x 0.74, y 0.85, scale 1.4, shock, fully inside the frame under the burst. Cover text kept "WAR OVER. / STILL / SHOOTING" —
  the burst now shows the shooting.
- Scene 1: table lamp removed (`am_carriage` new `lamp: false`), Foch moved to x 0.3 so his pointing hand ends at the document.
- Scene 3: ground 0.84; officer x 0.36, scale 1.1, angry, moustache visible, points toward the wire; soldiers scale 1.0 at y 0.85/0.86,
  worried; camera focus [620,1330] zoom 1.6 push; 6 HOURS stamp x 0.64 y 0.5 (clear of kicker and heads). The faint "For six hours"
  ghost was the outgoing subtitle during the transition; no longer visible at the sample frame.
- Scene 6: Gunther `emotion: angry`, y 1.08, scale 1.0 (head below the subtitle band); gunners x 0.66/0.80, scale 0.85, idle until "waved".
- Lint OK (0 errors, 0 warnings, SEO 100); preview: no STATIC?, motion 6.8–29.

### ag-01-armistice-last-minutes — Tur 2 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 9 | 9 | 8 | 8 |

Re-rendered (lint OK, 443 chars, ~34 s, motion 5.9–27.7, no STATIC?). Stills checked at 1.2 / 11.5 / 23.3 s. Fixed: cover now has a bright shell
burst beside the 5:00 watch, so SHOOTING is shown, and the shocked host is big and inside the border (cover 8). Scene 3 has a large, angry
moustached officer and two worried soldiers filling the frame, "6 HOURS" is clear of the kicker, and "some generals" is accurate. Scene 1
lamp removed. All criteria ≥ 7, cover ≥ 8 → **passes**. Remaining problems (none blocking; fix if there is time for round 3):
1. **Scene 6 (tank_mg):** Gunther's angry face now sits at y ≈ 1520–1720, inside the YouTube UI zone (> 1500), and he is in the bottom-left corner
   while the gun barrel points at empty air above him; the subject of the beat is where the like/comment buttons go. Fix: Gunther scale ~1.3,
   y so his head centre is ≈ 1400 (between band 1320 and UI 1500), and move him in to x ≈ 0.25; or raise the nest (`y` 0.58 → ~0.45) so the barrel
   aims at him.
2. **Scene 9 (am_field poppies):** the host waves with a big `happy` grin one line after a man's death; that clashes with the respectful tone. Fix:
   `emotion: "calm"`/neutral (soft smile), keep the wave → point.
3. **Scene 0:** the host's legs run off the bottom edge and his body is cut by the duckboard; fine for the hook, but at y 0.85 / scale 1.4 move him to
   y ≈ 0.80 so his torso reads as a whole figure (check that the cover still clears the border).

### ag-01-armistice-last-minutes — Tur 2 (writer fixes)
- Scene 6: Gunther scale 1.3, runs to x 0.25, y 1.07 → head centre ≈ y 1490 on screen (big, angry, brim of the helmet visible
  under the subtitle band; earlier y 1.05 put the helmet behind the sandbags).
- Scene 9: host `emotion: neutral` (soft smile) for both the wave and the point on "story".
- Scene 0 / cover: host y 0.85 → 0.80; feet now on the duckboards inside the frame, cover clears the border.
- Lint OK (0 errors, SEO 100); preview no STATIC?; 443 chars.
