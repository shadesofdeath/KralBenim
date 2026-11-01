# ag-02-<slug> — Stickstory Short (history's strangest moments)

- **File:** `videos/2026-11-01/ag-02-great-stink.json` · format short · publish_at `2026-11-01T19:00:00-05:00` (Istanbul 02.11 03:00)
- **Category:** history's strangest moments (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403); no current headline fitting this category found → **category pool** (report says so).
- **Topic:** The Great Stink, London, summer 1858 — the Thames smelled so bad that Parliament soaked its curtains in chemicals
  (chloride of lime) and MPs considered leaving; within weeks they passed the law that funded Joseph Bazalgette's sewer system,
  which ended London's cholera outbreaks. (Writer verifies every claim, e.g. the bill passed in ~18 days; drop unconfirmed numbers;
  avoid the myth that the smell itself caused cholera — miasma belief was the motive, the sewers worked for a different reason: clean water.)
- **Viewer should feel:** "A bad smell did what thousands of deaths could not."
- **Hook idea:** 3–8 words, e.g. "A smell saved London." ↔ cover "A SMELL SAVED LONDON" / "THE RIVER STANK".
- **Cover idea:** big Kaşif holding his nose, Parliament / a filthy river. One subject.
- **Punchline:** complete standalone line + one short subscribe line with reason.
- **Related long video:** none.
- **Budget warning (ElevenLabs warning: true):** narration 400–440 chars.
- **Palette:** `ag-slate`.

## Facts (verified by the writer)
- Summer 1858, temperatures around 30 °C for weeks; the Thames carried London's sewage (London Museum:
  https://londonmuseum.org.uk/collections/london-stories/great-stink-of-1858).
- Curtains/blinds in the Houses of Parliament soaked in chloride of lime against the smell (London Museum; Historic UK:
  https://www.historic-uk.com/HistoryUK/HistoryofBritain/Londons-Great-Stink/; History.co.uk says "blinds").
- MPs floated temporary homes for Parliament: Oxford, Edinburgh, Dublin (History.co.uk:
  https://www.history.co.uk/articles/the-great-stink-londons-unbearable-summer-of-1858).
- Disraeli put the bill before Parliament on 15 July 1858; law by 2 August → "law in just 18 days" (History.co.uk; London Museum; Historic UK "eighteen days").
- Cholera in London: 1832 (6,536 deaths), 1848–49 (more than double), 1853–54 (10,738) (Historic UK) → "thousands" and the poster years 1832 / 1849 / 1854.
- Bazalgette's main intercepting sewers (82 miles; History.co.uk Bazalgette page:
  https://www.history.co.uk/history-of-london/sir-joseph-bazalgette-and-londons-sewers); last cholera epidemic 1866 (same page).
- Myth avoided: the smell did not cause cholera (miasma belief was the motive; cholera spreads through water, John Snow 1854). The script
  only says the smell got the law passed. Bazalgette's 1856–58 plans were held up by the government until the stink (wording: "the sewer plans sat there").
- Not used: exact sewer length (sources give 82/83/85 miles), "MPs fled the building" (only the library retreat is documented).

## Narration (one text, written first; 435 chars, budget warning: inside 400–440)
A bad smell saved London. In the summer of 1858, the Thames was an open sewer, and Parliament sat right on its bank.
They soaked the curtains in chloride of lime. It didn't help! Some wanted to move Parliament out of London. You know
what's crazy? Cholera had killed thousands, and the sewer plans sat there. Then the stink got a sewer law passed in
18 days. A smell did what death couldn't. Subscribe for one strange true story a day.

## Shot list
| # | Sentence | Visual | Type | Host | Cue | Camera / set |
|---|---|---|---|---|---|---|
| 0 | A bad smell saved London. | Brown Thames, Westminster on the far bank, stink wisps; fez host in a rowing boat holding a handkerchief over his nose (= cover frame) | gs_river | holds nose (think pose + kerchief) | hit "smell" | city, push |
| 1 | In the summer of 1858, the Thames was an open sewer, | Brick arch outfall gushing sewage into the river, slime, dead fish, heavy stink; "1858", "OPEN SEWER"; source London Museum | gs_outfall | – | yr, gush "Thames", hit "sewer" | city, push |
| 2 | and Parliament sat right on its bank. | Westminster facade on the water's edge, stink wisps drift up into its windows; "PARLIAMENT" | gs_river | – | hit "Parliament" | city, **close-up** [560, 720] ×1.6 |
| 3 | They soaked the curtains in chloride of lime. It didn't help! | Gothic windows, crimson curtains; top-hatted MP brushes them from a steaming pail, curtains darken and drip; on "didn't" stink pours in, second MP jumps, kerchief; "CHLORIDE OF LIME"; source Historic UK | gs_room | – | soak, lime, seep "didn't", hit "help" | interior, push |
| 4 | Some wanted to move Parliament out of London. | Cobbled street, Parliament under a stink cloud, two MPs walk off with bags; signpost OXFORD / EDINBURGH / DUBLIN; source History.co.uk | gs_street (road) | – | s1 "move", s2, s3 | city, pan left |
| 5 | You know what's crazy? Cholera had killed thousands, | Brick wall, cholera notices 1832 / 1849 / 1854 slap on, street pump drips; source Historic UK | gs_street (wall) | – | p1 "crazy", p2, p3 | city, push |
| 6 | and the sewer plans sat there. | Office: calendar 1856→1857→1858, pendulum clock, rolled plans with red ribbon gather dust, cobweb; "SEWER PLANS" | gs_desk | – | y2, y3, pl | interior, push |
| 7 | Then the stink got a sewer law passed in 18 days. | Calendar days flip 15 JULY → 2 AUGUST; plan unrolls (Thames + red sewers along both banks); red "LAW" stamp; "18 DAYS"; source History.co.uk | gs_desk | – | fl "stink", un "sewer", st "passed", hit "days" | interior, push |
| 8 | A smell did what death couldn't. | Cut-away under the street: egg-shaped brick sewer closes course by course around two navvies, lantern, shoring; "BAZALGETTE'S SEWERS" | gs_tunnel | – | hit "death" | city, tilt up |
| 9 | Subscribe for one strange true story a day. | Back on the Thames: host in the boat points up at "A BAD SMELL / SAVED LONDON." (SMELL boxed) | gs_river | points (happy) | s1, s2 | city, pull |

Host 2/10 (20%) + hook/cover. Types: gs_river, gs_outfall, gs_room, gs_street, gs_desk, gs_tunnel (new file
`scenes/studio/shots/gs_stink.js`). Palette ag-slate. Sets city / interior (no snow/coast as yesterday).

## Cover candidates (writer)
- A scene 0 t 2.0, no focus: host small under the sky gradient → weak.
- B scene 0 focus [500,1100] ×1.5: big host but fez melts into the text gradient.
- C "THE RIVER STANK", scene 2 + shocked host overlay: readable but less of a claim; host cropped.
- D scene 3 curtains + host overlay: crowded (pail, label, two MPs, host).
- E/G scene 0 ×1.25–1.3: host smaller.
- **F (chosen): "A SMELL / SAVED LONDON" (SMELL boxed), scene 0 t 2.0, focus [600,960] ×1.45, fade off:** big host with
  handkerchief over his nose, stink curling off his fez, Westminster behind, brown river. Same idea as line 1 (hook frame).

## Eleştiri günlüğü — Tur 1

### ag-02-great-stink — Round 1 (critic)
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 6 | 6 | 7 | 6 | 7 | 8 | 8 | 7 | 6 |

1. Scene 0 + cover: the Thames read as a muddy field, the boat was cut off, Parliament looked like railings, the top third was empty sky; the handkerchief read as a beard.
2. Scenes 6–7: a ghosted "and the sewer" subtitle; the "SEWER PLANS" label was thin, faint and over the clock; the cue word "sewer" was shared by 6 and 7 and looked small; the plan unrolled too late.
3. Scenes 8–9: the punchline showed two tiny workers in a dark tunnel with an empty bottom and the label under the subtitle band; scene 9 repeated the hook headline (read as a loop back).
+ Fact check: Edinburgh/Dublin as proposed seats must come from the cited source.

**Writer's fixes (round 1)** — narration unchanged (435 chars), lint OK, preview: no STATIC? scene.
- Fact: History.co.uk (cited) says verbatim "Some of the places floated as interim homes included Oxford, Edinburgh, and Dublin" (after MP John Brady
  urged moving the business of Westminster). The signposts stay OXFORD / EDINBURGH / DUBLIN; St Albans / Hampton Court are not used.
- Scene 0 / cover: the river now has light ripple strokes and a broken reflection of the palace, so it reads as water.
  Parliament has been redrawn: slate roof, bays with pointed-arch windows, pinnacles only every third bay, pyramid-roofed towers, and the clock tower.
  The host is bigger (scale 1.55) with a disgust face: eyes squeezed into > <, puffed red cheeks, a wobbly mouth, and thumb and finger pinching his nose. The handkerchief is gone.
  A thick three-strand stink plume curls up from the river beside his face. The boat is fully in frame in the lower part, and the sky is under the cover text only.
  The camera zoom is 1.05 so nothing is cut.
  Cover candidates: H (t 2.0), **H2 (t 1.2, plume curling into his face: chosen)**, J ("THE RIVER STANK", same frame), I (focus close on the host: Parliament lost).
  Two earlier options, scene 1 outfall + a recoiling host overlay with "THE RIVER STANK" or "A SMELL SAVED LONDON", read weaker: the host was small and the outfall frame busy.
- Scene 6: the faint "and the sewer" in the sheet is the engine's 0.08 s caption hand-over fade. The preview frame happened to land in that
  window; in the video it lasts 2 frames, so there is no fix in the script. Cues are now "plans" and "there"; "sewer" is no longer a cue anywhere.
  "SEWER PLANS" is now a red Fraunces box (76 px) on the clear wall at the top. The clock moved left (x 0.2) and the calendar right (x 0.75).
- Scene 7: cues "stink" (calendar flips), "law" (the LAW stamp lands on the word) and "days" (18 DAYS). The plan unrolls at 0.3 s, so the Thames map with
  red sewer lines fills the desk at once.
- Scene 8: rebuilt as a close-up (focus [540, 800], zoom 1.6). The river runs on top and the finished egg-shaped brick sewer carries the brown flow
  away (streaks and arrows) just above the subtitle band. Clay strata and pebbles fill the lower frame. On "death" the CHOLERA 1849/1854
  notices fall away, and on "couldn't" clear blue water washes through the river above. A bold red serif "BAZALGETTE'S SEWERS" box sits over the river (above y 1170).
- Scene 9: a new frame with no repeated headline. Clean blue Thames ("THE THAMES TODAY") with a clean reflection; the host (scale 1.5) waves from his boat,
  then points at the viewer on "story".

## Eleştiri günlüğü — Tur 2

### ag-02-great-stink — Round 2 (critic)
| Script | Hook | Readability | Visual=narration | Motion | Composition+host | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 7 | 7 | 8 | 8 | 8 | 8 |

None blocking. Polish:
1. Scene 2: the red hand-written "PARLIAMENT" sat over the spires and stink wisps. → Now a boxed red Fraunces label (64 px, x 0.56, y 0.33), fully
   inside the close-up frame and readable over the wisps (checked with `preview.py --times 8.0`).
2. Scene 6 subtitle opacity checked with `preview.py --times 20.95,21.2`: "and" / "and the" are at full opacity 0.35 s and 0.6 s into the scene.
   The faint frame in the round-1 sheet was the 0.08 s caption hand-over.
Lint OK, narration 435 chars, preview: no STATIC? scene.
