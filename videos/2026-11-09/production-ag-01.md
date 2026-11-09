# ag-01-hubble-blurry-mirror — Stickstory Short (space and planet earth)

- **File:** `videos/2026-11-09/ag-01-hubble-blurry-mirror.json` · format short · publish_at `2026-11-09T13:00:00-05:00` (Istanbul 09.11 21:00)
- **Category:** space and planet earth (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → web search. Chosen: KeepTrack Space Brief, 4 Nov 2026 (US):
  "NASA seeks industry ideas to save Hubble as drag lowers its orbit". The headline is the hook context only; the story is permanent history.
- **Topic:** Hubble's flawed mirror. Launched April 1990 (STS-31, Discovery); first images blurry. The 2.4 m primary mirror had been
  ground to the wrong shape with great precision — edge too flat by about 2.2 micrometres (~1/50 of a human hair). Cause: the test
  instrument (reflective null corrector) had a lens spaced about 1.3 mm out of place. Fix: December 1993 servicing mission STS-61
  (Endeavour) — astronauts installed COSTAR ("glasses") and the new WFPC2 camera with its own corrective optics; images became sharp.
  Writer: VERIFY every number/date on ≥ 2 reliable sources (NASA, ESA/Hubble, Smithsonian NASM); drop anything uncertain; no myths.
- **Viewer should feel:** "A $1.5 billion telescope needed glasses — because of a millimetre."
- **Hook (3–8 words, same idea as cover):** e.g. "NASA launched a telescope that couldn't see." ↔ cover "IT COULDN'T / SEE" (highlight "see") or
  "BLIND IN / SPACE". ≥ 3 cover candidates.
- **Structure:** hook → 1990 launch + blurry first image → the flaw (hair-width 1/50) → why (1.3 mm lens in the test tool) → 1993
  spacewalk "glasses" → punchline (complete standalone line) + one short natural subscribe line with reason.
- **Related long video:** none → no `related`.
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-newsprint` (differs from the last Stickstory video, ag-sage). Sets: `night` (orbit/space), `interior` (clean room /
  mirror lab). Kaşif host 15–25 %, ≥ 1 close-up (e.g. the mirror edge / blurry star), on-screen `source` note ≥ 1.
  Pattern different from yesterday's Siffre/godwit shorts.

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration v1 (438 chars; superseded by round 1, see Eleştiri günlüğü)
NASA launched a telescope that couldn't see. In April 1990, Hubble reached orbit, and its first pictures came back blurry.
Its giant mirror was perfectly smooth, and the wrong shape. The error was one fiftieth of a hair. And the cause? One lens in
the test tool sat 1.3 millimeters out of place. In 1993, astronauts flew up, and gave Hubble glasses. One tiny slip blurred
the whole universe. Subscribe for a true story like this every day.

### Shot list (10 scenes; new shot file `scenes/studio/shots/hu_hubble.js`: hu_space / hu_room / hu_mirror / hu_hair / hu_sky)
| # | Text | Type / mode | Set · camera | Kaşif / notes |
|---|---|---|---|---|
| 0 | NASA launched a telescope that couldn't see. | `hu_space` hook | night (space, Earth curve fills bottom) · push | cover overlay only; Hubble drifts toward a blurred star with halo rings, blur swells on "see" |
| 1 | In April 1990, Hubble reached orbit, | `hu_space` deploy | night · up | — shuttle Discovery's arm lifts Hubble out of the bay, wings unroll; card APRIL 1990 |
| 2 | and its first pictures came back blurry. | `hu_room` blurry | interior · pull | **points at the monitor, shock on "blurry"**; two scientists, blinking console fills bottom |
| 3 | Its giant mirror was perfectly smooth, and the wrong shape. | `hu_mirror` polish | interior · push | — gleam on "smooth", edge ring red + grid bends on "wrong"; 2.4 m label, EDGE TOO FLAT card; technician in hood |
| 4 | The error was one fiftieth of a hair. | `hu_hair` | interior · **close-up** focus [540, 760] zoom 1.6 | — hair cut end + 50-tick ruler, one slice red on "fiftieth"; 1/50 card; mirror edge at bottom; source NASA |
| 5 | And the cause? One lens in the test tool sat 1.3 millimeters out of place. | `hu_mirror` test | interior · left | — null-corrector tower + red laser fan; lens slips on "millimeters", magnifier shows gap; 1.3 mm card; source NASA failure report |
| 6 | In 1993, astronauts flew up, | `hu_space` service | night · right | — Endeavour, Hubble upright in the bay, astronaut on the arm with a tool; card 1993 |
| 7 | and gave Hubble glasses. | `hu_space` glasses | night · push | — front view of the tube; spectacles drop on "glasses", sharp 4-spike stars in the second lens; COSTAR label |
| 8 | One tiny slip blurred the whole universe. | `hu_room` sharp | interior · pull | — split screen BEFORE (blur) / AFTER (sharp galaxy) wipes in on "universe" |
| 9 | Subscribe for a true story like this every day. | `hu_sky` | night hills · pull | **waves on the hilltop, points up at Hubble crossing the sky on "story"**; grass foreground |

Kaşif 2/10 (20 %) + cover overlay. 5 types (hu_space 4, hu_room 2, hu_mirror 2, hu_hair 1, hu_sky 1). Pattern vs yesterday
(Siffre cave / godwit): space + Earth curve, control room, clean room, cool ag-newsprint paper.

### Facts (verified)
- Launch 24 April 1990, shuttle Discovery (Space.com); first images blurry, spherical aberration found June 1990 (ESA/Hubble).
- Mirror 2.4 m; "curvature off by less than one millionth of a meter, 1/50th the width of a human hair" (NASA Science, Hubble optics).
  Other sources give ~2 microns at the edge; narration keeps NASA's hair comparison only.
- Cause: lens in the reflective null corrector incorrectly spaced, displacement 1.3 mm (NASA TM-103443, failure report, Nov 1990).
- Fix: STS-61, Endeavour, launched 2 Dec 1993, five spacewalks; COSTAR "glasses" + WFPC2 (ESA/Hubble SM1, NASA, Space.com).
- Dropped: the $1.5 billion cost (one source only in my check), the paint-flake detail, exact micrometres.

### Cover candidates (rendered with `build.py --cover --no-tts`, compared side by side)
- **A (chosen):** scene 0 t 1.2, "IT COULDN'T / SEE" (highlight SEE) = first spoken line; Hubble aimed at a big blurred star, shocked Kaşif lower right (x 790).
- B: same frame, "BLIND IN / SPACE" (BLIND) — punchier but overstates (Hubble was blurred, not blind).
- C: scene 7, "IT NEEDED / GLASSES" — funny, but gives away the ending and Kaşif is cropped at the edge.

## Eleştiri günlüğü

### Round 1 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 6 | 8 | 7 | 8 | 8 | 9 | 8 | 7 |
1. Scene 4 (hu_hair): the hair end read as a wooden log (rings, bark shading); bottom half nearly empty.
2. Cover: fez overlapped the blurred-star halo, two colliding focal points (cover alone 7).
3. Scene 5: 15 words (lint warning); split into a short "cause" close-up + the lens line with a bigger magnifier.

### Writer fixes (round 1)
- Narration v2 (440 chars): "NASA launched a telescope that couldn't see. In April 1990, Hubble reached orbit, and its first photos came
  back blurry. Its huge mirror was perfectly smooth, and the wrong shape. The error was one fiftieth of a hair's width. The cause?
  One lens in the test tool sat 1.3 millimeters out of place. In 1993, astronauts flew up, and gave Hubble glasses. One tiny slip
  blurred the whole universe. Subscribe for a true story like this every day."
- Scene 4 redrawn: a single thin dark hair crosses the frame, a callout circle magnifies its cut end into a plain grey disc (no rings,
  just a gloss), ruler of 50 ticks; on "fiftieth" a red slice one fiftieth wide slides out of the disc and its tick turns red; the
  mirror rim (red sliver) and a lab bench with glassware fill the bottom. Close-up focus [540, 700] zoom 1.6; 1/50 card top right.
- Scene 5 split (now 11 scenes): 5a "The cause?" close-up on the test tool (focus [454, 500], zoom 1.8, lens not yet slipping);
  5b "One lens in the test tool sat 1.3 millimeters out of place." wider shot, magnifier radius 215, 1.3 mm card right under it,
  source note moved here. Kaşif 2/11 (18 %). Lint: 0 errors, 0 warnings, SEO 100/100.
- Cover: blurred star moved to (0.78, 0.33), Kaşif to x 720, scale 1.15: halo and fez no longer touch. New candidate D
  "BLURRY FOR / 3 YEARS" (true: blurry from 1990 until the December 1993 fix) rendered and compared with A; **A kept**: it is the
  spoken first line (hook = cover), D shares no word with it. The highlight box colour is the channel skin (engine), not touched.


### Round 2 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 7 | 6 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |
1. Scene 4 (hu_hair): the hair read as a shiny grey sphere; needs a long dark strand, a small cut-end disc, the slice on it, a callout to the ruler.
2. Scene 6 first frame: subtitle "the test tool" ghosted over the mirror.
3. Scene 5 close-up: technician cut off at the left edge.

### Writer fixes (round 2)
- Scene 4 redrawn: one long dark brown hair (about 54 px thick, slight curve) runs in from the right and ends in a small dark cut-end
  disc (no rings, no gloss); two callout lines open from its edges onto a big vertical ruler of 50 ticks, so the ruler measures the
  hair's width; on "fiftieth" one tick and a slice of the disc turn red, joined by a red line; 1/50 card top right (fully in frame).
- Scene 6: checked with `build.py --still 17.9`: the ghost is only the dissolve between scenes 5 and 6; the frame is clean.
- Scene 5 (close-up): technician removed (`P.tech: false`); only the tool, the laser fan and the mirror.
- Lint: 0 errors, 0 warnings, SEO 100/100; preview: no STATIC?/cue warnings; cover unchanged (A).

### Yönetmen son kapı
lint 0 hata / SEO 100; sheet.png + cover.jpg yönetmen tarafından görüldü. Son tur puanları rapora yazıldı.
