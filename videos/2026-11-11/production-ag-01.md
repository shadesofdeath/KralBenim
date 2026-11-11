# ag-01-edmund-fitzgerald — Stickstory Short (unsolved mysteries)

- **File:** `videos/2026-11-11/ag-01-edmund-fitzgerald.json` · format short · publish_at `2026-11-11T13:00:00-05:00` (Istanbul 11.11 21:00)
- **Category:** unsolved mysteries (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries) → web search. Chosen (US): Northern News Now, 10 Nov 2026:
  "Split Rock Lighthouse lights beacon on 51st anniversary of the wreck of the SS Edmund Fitzgerald" (Minnesota).
- **Topic:** SS Edmund Fitzgerald, the 729-ft ore carrier that sank in Lake Superior on 10 Nov 1975 in a storm, all 29 crew lost,
  no distress call. Last radio words of Captain Ernest McSorley to the Arthur M. Anderson ("We are holding our own", ~7:10 p.m.).
  Wreck found in two pieces ~530 ft deep ~17 miles from Whitefish Point. Still no agreed cause: US Coast Guard (leaking hatch covers →
  flooding), NTSB, Lake Carriers' Association (shoaling at Six Fathom Shoal), rogue waves ("Three Sisters") — VERIFY every number on ≥ 2
  sources (NOAA, Great Lakes Shipwreck Museum, USCG report summary, Britannica, Smithsonian/Maritime Executive). Respectful tone: 29 men died;
  no jokes, no song lyrics (do NOT quote Gordon Lightfoot's song).
- **Viewer should feel:** "A huge ship vanished from radar a few minutes after saying it was fine, and nobody knows why."
- **Hook (3–8 words, same idea as cover):** e.g. "Her last words were: we're holding our own." / "This giant ship vanished in ten minutes."
  ↔ cover e.g. "HOLDING / OUR OWN" / "NO MAYDAY" / "GONE IN / MINUTES". ≥ 3 cover candidates.
- **Structure:** hook (last radio words) → 10 Nov 1975, storm, 729 ft, 29 men → off the radar, no mayday → found broken in two at the
  bottom → three theories, none proven → punchline (complete standalone line) + one short natural subscribe line with reason.
- **Related long video:** none (leave `youtube.related` out).
- **Budget warning (ElevenLabs warning: true; ~10k chars left this month):** narration at the low end, **400–430 chars**.
- **Palette:** `ag-slate` (storm lake; differs from the last Stickstory video, ag-newsprint). Sets: `storm`, `ocean` (underwater wreck),
  `interior` (radio / wheelhouse) or `coast` (lighthouse). Kaşif host 15–25 %, ≥ 1 close-up (radio / radar blip), on-screen `source` ≥ 1.
  Pattern different from recent sea videos (Okene, Mongol fleet, Copenhagen): e.g. radar screen motif, a long ore freighter silhouette
  (very long, low, cabin at the stern AND bow), lighthouse beam.

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration v1 (425 chars)
Her last words: "We are holding our own." On November 10, 1975, the Edmund Fitzgerald, a 729-foot ore ship, was fighting a
storm on Lake Superior. Minutes later, she vanished from the radar. No mayday. Twenty-nine men, gone. She lies 530 feet
down, snapped in two. Leaking hatches? A shoal? A rogue wave? Nobody can tell you for sure. She was holding her own, until
she wasn't. Subscribe for a true story like this every day.

### Shot list (11 scenes; new shot file `scenes/studio/shots/ef_fitz.js`: ef_lake / ef_deck / ef_radio / ef_radar / ef_wreck / ef_shore)
| # | Text | Type / mode | Set · camera | Kaşif / notes |
|---|---|---|---|---|
| 0 | Her last words: "We are holding our own." | `ef_radio` talk | interior · push | **shock behind the console** (hook frame is the cover: scene 9 at 2.8 s) |
| 1 | On November 10, 1975, the Edmund Fitzgerald, a 729-foot ore ship, | `ef_lake` storm + measure | storm · push | — long red-hulled laker, 729 FT arrow on "729", name label; source Britannica |
| 2 | was fighting a storm on Lake Superior. | `ef_lake` storm | storm · **close** (bow, 1.7) | — spray over the bow, lit pilothouse |
| 3 | Minutes later, she vanished from the radar. | `ef_radar` | interior · **close** (1.6) | — the Anderson's scope; FITZGERALD blip stops returning on "vanished", red dashed ring |
| 4 | No mayday. Twenty-nine men, gone. | `ef_lake` empty | storm · push | — empty lake, swamped lifeboat; NO MAYDAY stamp, 29 MEN card |
| 5 | She lies 530 feet down, snapped in two. | `ef_wreck` | ocean (underwater) · push | — bow upright, stern upside down, debris; 530 FT depth arrow, cracks on "two"; source Shipwreck Museum |
| 6 | Leaking hatches? | `ef_deck` | storm · push | — hatch covers cutaway, water streams into the ore hold on "Leaking"; HATCHES? stamp |
| 7 | A shoal? A rogue wave? | `ef_lake` theory | storm · push | — rocks rise under the hull (SHOAL?), huge wave rears (ROGUE WAVE?) |
| 8 | Nobody can tell you for sure. | `ef_wreck` | ocean · **close** (1.6) | — the two broken ends, big red "?" |
| 9 | She was holding her own, until she wasn't. | `ef_lake` dive | storm · still | — lights go out, bow plunges, ship slides under on "until" |
| 10 | Subscribe for a true story like this every day. | `ef_shore` | night · pull | **waves, points at the lighthouse beam on "story"** (Split Rock beacon hook) |

Kaşif 2/11 (18 %) + cover overlay. 6 types; ef_lake 5/11 (45 %), never more than 2 in a row. Palette ag-slate.

### Facts (verified)
- 729 ft ore freighter; sank 10 Nov 1975 in Lake Superior; all 29 men lost (Britannica, History.com).
- ~7:10 p.m. Capt. McSorley to the Arthur M. Anderson: "We are holding our own." (Britannica, Great Lakes Shipwreck Museum, History.com).
- Gone from the Anderson's radar ~7:15 p.m. (Museum: "around 7:15"; Britannica: about 10 minutes later) → narration says "Minutes later".
- No distress call (Britannica, History.com).
- Wreck ~530 ft down, in two main pieces, stern upside down (Britannica, History.com; Museum says 535 ft).
- Theories: USCG — flooding through ineffective hatch closures; Lake Carriers' Association — Six Fathom Shoal; rogue waves; no definitive cause (Britannica, Museum, History.com).
- Dropped: "Three Sisters" wave story (not verified on 2 sources), Gordon Lightfoot song (brief), "divers found her" (the wreck was located by Navy aircraft / sonar).

### Cover candidates (build.py --cover --no-tts, compared side by side)
- A: scene 0 radio, "HOLDING / OUR OWN" (OWN) — the quote matches the hook, but the image is a calm radio; the host is cropped.
- B (chosen): scene 9 at 2.8 s, "HOLDING / OUR OWN" (OWN), focus [540,1040] zoom 1.2, big shocked host lower right — the ship
  stern-up with the bow under water: the words and the image contradict each other, which is the whole story. Also the hook frame.
- C: scene 4, "NO MAYDAY. / JUST GONE" (GONE) — clear but generic (empty sea + stamps repeat the text), shares no word with line 1.

## Eleştiri günlüğü

### Round 1 (critic) — ag-01-edmund-fitzgerald
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 5 | 8 | 6 | 8 | 5 | 8 | 8 | 9 | 8 | 7 |

Lint OK. Facts check out (729 ft, 10 Nov 1975, 29 men, "We are holding our own" ~7:10 p.m., off the Anderson's radar ~7:15, no distress call, ~530 ft in two pieces, hatch / shoal / wave theories unproven).

1. **Hook frame (cover block over scene 0) is broken in the video:** `frame_00`/`frame_01` show an EMPTY lake (ship already sunk) with the host standing on the water, because `cover.scene 9, t 2.8` falls after the `until` dive cue in the preview timing; `cover.jpg` happens to catch the ship mid-plunge, so the result depends on TTS timing. Also on the cover the host's head covers the bow and the stern is cut by the left edge. → Make the hook state independent of timing (e.g. an `ef_lake` param that freezes the ship at a fixed dive progress for the cover, or pick a t safely inside the plunge measured from the real cue) and put the host on something solid (pilothouse console, a rock ledge, a lifeboat) away from the ship so the whole hull reads: "lights on, bow going under" + "HOLDING OUR OWN".
2. **Host and scene 0 are effectively invisible:** the cover block lasts the whole first sentence, which is all of scene 0, so the `ef_radio` pilothouse, the quote card and the shocked host never appear on screen. The host is visible only in scene 10 (1/11 ≈ 9 %, below 15 %). → Give the host 1–2 action beats in the body: scene 3 (host at the Anderson's radar, leaning in as the blip fails to return) and/or scene 8 (host with a lamp at the broken ends, shrugging at the "?"). Either let scene 0 run past the cover block (split the quote from the next words) or drop `ef_radio` and reuse its idea elsewhere.
3. **Storm scenes 1, 2, 4, 9: sky about half the frame and a small ship:** `horizon 930` puts the sky above about 48 % of the 1920 frame (rule: at most one third). In scene 1 the "729-foot" ship is a thin strip, and below the subtitle there is only flat water. → Horizon about 620–680, ship at y about 0.42–0.45 and larger, a foreground wave crest / spray layer in the lower third (y 1320–1920), and the 729 FT arrow inside the frame. Script, minor: "Minutes later" now hangs off the storm sentence and "the radar" is unexplained → "Minutes later, she vanished from the radar of the ship behind her." "Her last words" reads as the ship's words; "The captain's last words" is clearer (within budget if "ore ship" becomes "freighter" or "a 729-foot" is cut).

### Round 1 fixes (writer)
- Narration v2 (430 chars): 'The captain radioed: "We are holding our own." On November 10, 1975, on Lake Superior, the 729-foot Edmund Fitzgerald fought a storm. Minutes later, she vanished from the radar of the ship behind her. No mayday. Twenty-nine men, gone. She lies 530 feet down, snapped in two. Leaking hatches? A shoal? A rogue wave? Nobody can tell you why. She was holding her own, until she wasn't. Subscribe for a true story like this every day.' (The 8-word hook rule ruled out "The captain's last words: …", which is 9 words; "ore ship" was cut for budget.)
- Hook and cover are now independent of timing: scene 0 is the new `ef_lake` mode `"plunge"`, with the ship held mid-plunge (13°, lights on, bow under, stern up, spray). Cover = scene 0, t 1.0, with no dependence on cues. The host (cover overlay) stands on a foreground bow rail (`deck` param), away from the whole hull. Candidates: A (chosen) scene 0, "HOLDING / OUR OWN", whole ship + host on the rail; B the same with focus zoom 1.2 (bow and the host's feet cut); C scene 3 radar, "GONE FROM / THE RADAR" (abstract, host cropped).
- Host is now in 3/11 visible scenes, including the hook: scene 0 (cover), scene 3 (he points at the FITZGERALD blip, then jumps back in shock on "vanished"; radar smaller at cy 0.3, r 330) and scene 10. Lint counts the scene host as 2/11 (18 %), because scene 0's host is the cover overlay.
- Storm scenes: horizon 650, waterline 0.45 H, hull drawn 1.45× taller (`ys`), and a new foreground swell + spray layer at 0.76 H filling the lower third. Scene 1 is now `ef_radio` (pilothouse in the storm, "On November 10, 1975, on Lake Superior,"). Scene 2 is the ship with the 729 FT arrow inside the frame, and the kicker is "Edmund Fitzgerald" (the overlapping name label was removed).
- Wreck: plate seams, portholes, hatch stubs, torn ribs at both broken ends, mud banked against the hulls.
- Lint OK (0 errors, 0 warnings); preview: no STATIC?, motion 4.9–22.9.

### Round 2 (critic) — ag-01-edmund-fitzgerald
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |

**Passes (all ≥ 7, cover 8).** Lint OK. All three Round 1 problems are fixed. The hook is now independent of timing: the whole ship is mid-plunge, the host stands on a rail, and "HOLDING OUR OWN" plays against the image. The host is visible in 3/11 scenes and acts each time. The storm scenes have a lower horizon and a filled foreground. The script is clearer ("The captain radioed…", "the ship behind her"). The remaining items are polish and none of them blocks:
1. Scene 3 (radar): the lower third (y ≈ 1400–1920) is a blank grey console face, and the host's feet "float" in front of it at y ≈ 1500. → Add a console top / floor line under his feet (or a chart table / logbook in the foreground) and fill the lower panel (switches, a radio handset, the Anderson's log).
2. Scenes 5 and 8 (wreck): below the hulls, about the bottom 35–40 % is flat mud with dashes. In 5 the "530 FT" arrow sits on the very right edge and its label lies over a faint ink blob; the stern half is cut by the right edge. → Raise `bed` to about 0.70, add a foreground debris/ore-pellet/silt layer in the lower third, and move the depth arrow inside to x ≈ 0.85.
3. Cover/hook: the foreground red bow the host stands on reads as a second, unexplained ship of the same colour as the Fitzgerald. In scene 7 the "SHOAL?" stamp touches the left frame edge. → Make the foreground bow clearly different (a darker tone or a grey bulwark), or put the host on a rock/breakwater. Move SHOAL? to x ≈ 0.30.

### Round 2 polish (writer)
- Scene 3: chart-table ledge (`shelf` 0.765) under the host's feet; the lower panel now has toggle switches, an open logbook and a handset on a coiled cord.
- Scenes 5 and 8: lake bed raised to 0.70 H; foreground ore pellets, torn plates and silt across the bed; stern half moved to x 0.70 (in frame); in scene 5 the 530 FT arrow is at x 0.85.
- Cover / scene 0: the host now stands on a grey rock breakwater (`deck.kind: "rock"`, with spray at its tip) instead of a red bow, so it no longer reads as a second ship. Scene 7: SHOAL? moved to x 0.30.
- Narration unchanged (430 chars). Lint OK (0 errors, 0 warnings); preview: no STATIC?, motion 5.7–22.9.
