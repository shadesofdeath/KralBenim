# ag-01-apollo-12-lightning — Stickstory Short (survival stories)

- **File:** `videos/2026-11-14/ag-01-apollo-12-lightning.json` · format short · publish_at `2026-11-14T13:00:00-05:00` (Istanbul 14.11 21:00)
- **Category:** survival stories (plan suggestion kept; a spacecraft and its crew surviving two lightning strikes)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries); web searches gave no usable front-page story for this
  category today → **anniversary hook instead**: Apollo 12 launched 14 November 1969, exactly 57 years ago today (reported).
- **Topic:** Apollo 12 launch, 14 Nov 1969, Kennedy Space Center, in rain. Lightning struck the Saturn V ~36.5 s after
  liftoff and again ~52 s (the rocket + its exhaust plume triggered it). Fuel cells/power dropped offline, the caution panel
  lit up, telemetry turned to garbage. In Mission Control, EECOM John Aaron recognised the pattern: "Try SCE to Aux."
  Alan Bean found the obscure switch, data came back, they restored power and flew on to land on the Moon (Ocean of Storms,
  next to Surveyor 3). Crew: Pete Conrad, Dick Gordon, Alan Bean. Conrad joked about it. VERIFY every number/time on ≥ 2
  sources (NASA history pages, NASA Apollo 12 Mission report, etc.). Do not invent exact quotes beyond the well-documented
  "SCE to Aux".
- **Viewer should feel:** "One obscure switch, remembered by one engineer, saved a Moon mission seconds after liftoff."
- **Hook (3–8 words, same idea as cover):** e.g. "Lightning hit this Moon rocket. Twice." ↔ cover "STRUCK / TWICE" or
  "HIT BY LIGHTNING". ≥ 3 cover candidates.
- **Structure:** hook (rocket hit) → date in 2nd sentence + what broke (alarms, dead data) → tension (abort? 36 seconds up,
  crew don't know what happened) → the save: one engineer, one odd switch "SCE to AUX" → punchline (standalone; they still
  landed on the Moon) + one short subscribe line with reason.
- **Related long video:** none.
- **Budget:** `elevenlabs_chars.warning: true` (242,007 used / budget 231,442) → narration **400–425 chars** (hard max 550).
- **Look:** sets `storm` (launch pad in rain, low clouds), `interior` (Mission Control consoles; cabin panel with lights),
  `night`/sky for the climb. New type in its own file `scenes/studio/shots/ap12_*.js` (Saturn V climbing through clouds,
  forked lightning down the plume; cabin caution panel full of lights; Mission Control console with garbled numbers; a
  big switch "SCE → AUX" being flipped; Moon landing finale). Existing `apollo.js` (Apollo 13) shows CM/SM drawings — may
  reuse but don't repeat its look. Kaşif host 15–25 % (e.g. ducking at the strike, pointing at the switch, at the end).
  Close-up ≥ 1 (zoom ≥ 1.6), e.g. on the switch. On-screen `source` ≥ 1 (e.g. "NASA"). Pattern must differ from recent
  shorts (2026-11-13 beetle/Leonids/Mawson, 2026-11-09 Hubble).

## Writer — narration, fact check, shot list, cover

**Narration (one piece, 424 chars, 10 scenes, ~33 s):**
Lightning hit this Moon rocket. Twice. On November 14, 1969, Apollo 12 was 36 seconds off the pad. Alarms blared, the
cabin lit up, and Mission Control's data turned to garbage. So do you abort? One engineer, John Aaron, had seen this
mess in a drill. "Try SCE to Aux." Alan Bean flipped one tiny switch, and the data came back. Five days later, they
still landed on the Moon. Subscribe for a true story like this every day.

**Fact check (≥ 2 sources each):**
- Launch 14 Nov 1969, 11:22 a.m. EST, Pad 39A — NASA "Repeat Performance" + AmericaSpace.
- Struck at 36.5 s and 52 s after liftoff — NASA Science "Lightning Strikes Twice" + Space.com (NASA humans-in-space page: telemetry lost at 36 and 52 s). Narration says "36 seconds" (first strike).
- First strike ran down the exhaust plume to the pad — AmericaSpace; Space.com/NASA paper: vehicle-triggered lightning. Shown visually only.
- Master alarm, caution-and-warning panel "lit up like a Christmas tree", fuel cells off line, platform lost — AmericaSpace (Conrad's calls).
- Data in Mission Control turned unreadable; SCE (Signal Conditioning Equipment) — NASA Science + AmericaSpace.
- John Aaron (EECOM) had seen the pattern in a simulation; "Flight, try SCE to Aux." — AmericaSpace; NASA Science + Space.com (Aaron, earlier simulation). Narration shortens the quote to the well-documented "Try SCE to Aux."
- Alan Bean moved the switch to AUX, data returned — AmericaSpace ("Bean promptly complied"); NASA Science (SCE to AUX restored readings).
- Landing 19 Nov 1969, Ocean of Storms (5 days after launch); Conrad and Bean landed — NASA "Repeat Performance" + AmericaSpace.

**Shot list** (new types in `scenes/studio/shots/ap12_bolt.js`: ap12_climb, ap12_clock, ap12_cabin, ap12_mc, ap12_switch, ap12_moon):
| # | Text | Type | Set | Camera | Kaşif | Cue |
|---|---|---|---|---|---|---|
| 0 | Lightning hit this Moon rocket. Twice. | ap12_climb (Saturn V in storm, 2 bolts down the plume to the red tower) | storm | push | – | hit, Twice |
| 1 | On November 14, 1969, … 36 seconds off the pad. | ap12_clock (countdown board counts to +00:00:36, crowd of umbrellas, "NOV 14, 1969"; source NASA) | field | right | – | November, 36 |
| 2 | Alarms blared, the cabin lit up, | ap12_cabin alarm (panel, MASTER ALARM, C&W cascade, helmets) | interior | push | – | lit |
| 3 | and Mission Control's data turned to garbage. | ap12_mc room (screens scramble, "GARBAGE") | interior | left | – | garbage |
| 4 | So do you abort? | ap12_cabin abort (T-handle pulses, "ABORT?") | interior | push | reaches, then thinks (worried) | abort |
| 5 | One engineer, John Aaron, had seen this mess in a drill. | ap12_mc aaron (thought bubble "IN A DRILL", "JOHN AARON") | interior | push | – | Aaron, drill |
| 6 | "Try SCE to Aux." | ap12_mc call (speech balloon "SCE TO AUX"; source NASA) | interior | pull | – | Try |
| 7 | Alan Bean flipped one tiny switch, and the data came back. | ap12_switch (gloved hand flips SCE to AUX, lamps go green, "DATA BACK") | interior | **close-up zoom 1.7** | – | flipped, back |
| 8 | Five days later, they still landed on the Moon. | ap12_moon land (LM touches down in dust, Earth, "5 DAYS LATER") | night | up | – | Five, landed |
| 9 | Subscribe for a true story like this every day. | ap12_moon end (LM, flag, footprints) | night | pull | waves, then points at viewer | true |

Kaşif 2/10 = 20 %. Palette `ag-dusk` (yesterday: newsprint / slate).

**Cover candidates (rendered, compared):**
1. **"HIT BY / LIGHTNING"** (highlight LIGHTNING), scene 0 t 2.7: rocket with both bolts, shocked Kaşif — **chosen** (same idea and words as the first sentence, single focus).
2. "STRUCK / TWICE", same frame — reads well but weaker without context.
3. "ONE SWITCH / SAVED IT", scene 7 — the cover ignores the scene close-up, the switch is small and it does not match the hook; rejected.

## Eleştiri günlüğü

### ag-01-apollo-12-lightning — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 6 | 8 | 7 | 7 | 8 | 9 | 8 | 8 |
1. Abort scene: the T-handle read as a red stool, Kaşif's hand didn't reach it, his face stayed calm, the subtitle covered the post and the bottom 40% was a flat dark band.
   → Real T-handle: black grip on a shaft with a red "ABORT" placard, grip at y≈0.45 above the subtitles. Kaşif at x 0.56 with his hand on the grip (worried), jumping back in shock on "abort" while the handle glows red. Crew helmets fill the bottom.
2. Mission Control headsets looked like eyepatches, and the desk below the subtitles was flat grey.
   → The earpiece is now a small arc at the ear with a thin band over the head and a thin boom mic to the mouth. The foreground has console door panels with vents, papers, a red binder, a coffee cup, and the backs of two front-row controllers (hair, white shirts, headset bands).
3. The opening missed its beat and "Twice" wasn't paid off.
   → Bolt 1 on "hit", bolt 2 on "Twice", an opaque paper-white frame flash for 2 frames on each strike, and thicker bolts (paper-white core, gold glow, pale outer glow); the cover at t 2.7 shows both. The narration now names the second strike: "On November 14, 1969, Apollo 12 was hit at 36 seconds, / and again at 52." This is split into 2 `ap12_clock` scenes because lint warned at 15 words. In the second, the board runs 36 → 52, a bolt hits the small rocket on "again" and an "AGAIN!" label appears. Trimmed "one tiny switch" → "one switch"; 431 chars.
   Smaller: "DATA BACK" is bigger (120) above the panel. All 5 lamps sit clear of the hand and turn green quickly. The flag in scene 10 is in frame (LM x 0.5). The Earth sits over the backdrop's moon disc (scene 10 horizon 940).
Now 11 scenes, Kaşif 2/11 (18%).

### ag-01-apollo-12-lightning — tur 2 (PASS)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 8 | 7 | 8 | 9 | 8 | 8 |
Polish after the pass:
1. Abort: Kaşif's arm covered the "T" → handle moved to x 0.32 and Kaşif to x 0.60. After the cue he is in the shock pose with worried brows. kasif.js has no "scared" emotion, and it is a shared file, so I didn't add one; shock pose + "worried" is the closest.
2. Clock scene 2: the board reaches +00:00:52 0.35 s before the word "52" and holds it in red to the end.
3. Switch: the lamp cascade starts on "data" (0.1 s apart), so the whole row is green by "back".
