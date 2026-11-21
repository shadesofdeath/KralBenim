# ag-02-forssmann-heart — Stickstory Short (the human body)

- **File:** `videos/2026-11-21/ag-02-forssmann-heart.json` · format short · publish_at `2026-11-21T19:00:00-05:00` (Istanbul 22.11 03:00)
- **Category:** the human body (plan suggestion kept)
- **Headline:** `tools/news.py` failed (agent proxy 403). No fitting headline found by director → category pool. Writer: if a quick WebSearch finds a real recent news peg (heart catheter / cardiology milestone), note it; otherwise "pool fallback".
- **Topic:** Werner Forssmann, Eberswalde (Germany), 1929, age 25: superiors forbade the experiment; he persuaded operating nurse Gerda Ditzen (who wanted to be the subject — he strapped her/pretended, then did it on himself — VERIFY exact version), numbed his own arm, pushed a urinary catheter ~65 cm up a vein of his arm into his right atrium, walked to the X-ray room (stairs) and took an X-ray image as proof. Reprimanded / mocked, left cardiology, became a urologist; Nobel Prize in Physiology or Medicine 1956 with Cournand and Richards. VERIFY every number (age, cm, year) on ≥ 2 sources (nobelprize.org, a medical-history journal, BBC/Smithsonian).
- **Viewer should feel:** "He did WHAT to himself? And it worked?"
- **Hook idea:** "This doctor put a tube in his own heart." ↔ cover "INTO HIS / OWN HEART" (highlight HEART) — ≥ 3 cover candidates.
- **Narrator draft (director; writer verifies and polishes, 420–490 chars):**
  This doctor pushed a tube into his own heart. It was 1929, in a small German hospital. Werner Forssmann was only 25, and his bosses said the idea would kill anyone. So he talked a nurse into handing him the tools. He numbed his arm, and slid a thin tube up a vein, inch by inch, all the way to his heart. Then he walked to the X-ray room to prove it. He was mocked, and he left heart medicine. Twenty-seven years later, he won the Nobel Prize. Subscribe for a true story every day.
- **Budget:** narration 400–500 chars (hard max 550), 8–11 scenes.
- **Look:** sets `interior` (1920s operating room, X-ray room with an old tube machine), `city` (small hospital building). New types in own file `scenes/studio/shots/fh_*.js`: arm with catheter going in (no gore: clean line art), a body outline with the tube's path drawing up the arm to the heart (great close-up), the X-ray plate image (ribs + heart + white line), Forssmann on stairs, a Nobel medal 1956. ≥ 1 close-up. Kaşif host 15–25 %. On-screen `source` ≥ 1. Punchline + one natural subscribe line. Sources ≥ 2. Palette `ag-newsprint`. Keep it non-graphic (YouTube: no blood, no needle close-up into skin).

## Writer

**Headline:** pool fallback. A quick WebSearch for a heart-catheter or cardiology milestone in November 2026 found no fitting headline (`tools/news.py` is blocked by the proxy).

**Narration (496 characters; preview estimates about 38 s):**
He pushed a tube into his own heart. It was 1929, in a German hospital. Werner Forssmann wanted to reach the heart through a vein, but his boss said no. It could kill you! So he got a nurse to unlock the tools. She offered to be the test subject. But he strapped her down and used his own arm. He walked to the X-ray room. There it was, inside his heart! Experts laughed. He quit heart medicine. Twenty-seven years later, that stunt won him a Nobel Prize. Subscribe for one wild true story a day.

**Title:** Werner Forssmann: Why Did He Push a Tube Into His Own Heart? · **Cover:** "INTO HIS / OWN HEART" (highlight HEART), scene 0, t 2.3, focus [560, 900] ×1.2, big shocked fez host at the bottom left.

**Pattern note:** Barry Marshall (2026-10-25) is a similar "doctor experiments on himself → Nobel" story. To keep this one different, the first line is "He pushed…", not "This doctor…". It uses its own scenes (see-through bust, operating room, stairwell, X-ray, laughing experts), and bm_* scenes are not reused.

### Verified facts
| Fact | Sources |
|---|---|
| 1929, Eberswalde (Auguste-Viktoria hospital), Germany | nobelprize.org facts; Siemens MedMuseum; MDedge |
| Catheter went from the crook of his (left) arm through a vein into his heart; he took an X-ray photo | nobelprize.org facts; Siemens; Wikipedia |
| The chief (Schneider) refused permission or a patient | Siemens ("cannot provide you with a patient"); Wikipedia |
| Nurse Gerda Ditzen held the instruments and agreed if he would do it on her; he strapped her to the table and used his own arm | Wikipedia; MDedge |
| Walked to the X-ray room (Wikipedia: floor below; MDedge: basement; Siemens: "ran") | Wikipedia; MDedge; Siemens. Narration only says "walked to the X-ray room" |
| Mocked (Sauerbruch: work for a circus); left cardiology and became a urologist | Siemens; Wikipedia |
| Nobel Prize 1956 (shared with Cournand and Richards); 1956 − 1929 = 27 years | nobelprize.org; Wikipedia |

Left out because the sources disagree: catheter length (60 cm in Wikipedia vs 65 cm in MDedge) and his age (24 or 25; he was born on 29 Aug 1904 and the experiment was in "early summer").

### Shot list
| # | Text | Type | Set / camera | Kaşif |
|---|---|---|---|---|
| 0 | He pushed a tube into his own heart. | fh_body hook (see-through bust; tube climbs from the elbow to the heart) | – / push | in the cover block |
| 1 | It was 1929, in a German hospital. | fh_hospital ("GERMANY, 1929") | **city** / up | – |
| 2 | Werner Forssmann wanted to reach the heart through a vein, | fh_body plan (anatomy chart, red route, pointer, "FORSSMANN") | – / right | – |
| 3 | but his boss said no. It could kill you! | fh_office (chief shakes his head, "NO!") | – / left | points, then shock on "kill" |
| 4 | So he got a nurse to unlock the tools. She offered to be the test subject. | fh_room cabinet (key, door opens, she points to her own arm, "GERDA DITZEN") | – / push | – |
| 5 | But he strapped her down and used his own arm. | fh_room strap (straps drop; gold line climbs his arm to his heart, "HIS OWN ARM") | – / push | – |
| 6 | He walked to the X-ray room. | fh_stairs (walking down, tube dangling, glowing X-RAY door) | – / right | – |
| 7 | There it was, inside his heart! | fh_xray plate (catheter draws in, gold ring, "HIS HEART"); source nobelprize.org | **close-up** focus [480, 820] ×1.6 | – |
| 8 | Experts laughed. He quit heart medicine. | fh_mock (laughing rows, "HA!", red X on the chalk heart) | – / pull | – |
| 9 | Twenty-seven years later, that stunt won him a Nobel Prize. | fh_nobel (1929→1956 counter, swinging medal, old Forssmann, "NOBEL PRIZE"); source nobelprize.org | – / up | – |
| 10 | Subscribe for one wild true story a day. | fh_xray host (lightbox and X-ray stand) | – / push | waves, then points |

Kaşif is in 2/11 scenes (18 %). There are 7 scene types, all in `scenes/studio/shots/fh_forssmann.js`. Nothing is graphic: no blood or needle, and the tube enters under a bandage.

### Cover candidates
1. **"INTO HIS / OWN HEART", scene 0 with focus [560, 900] ×1.2** — chosen. It matches the first line, there is a single subject (the gold tube in the red heart), and the host's shocked face reads clearly.
2. The same text without focus — the head faded into the title gradient, the chest was small and the host was cut off at the right edge.
3. "A TUBE IN / HIS HEART", scene 7 (X-ray close-up) — the X-ray is abstract when small, its "HIS HEART" card repeats the cover text, and it doesn't match the spoken first line.

## Eleştiri günlüğü

### ag-02 — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 9 | 7 | 8 | 9 | 7 | 8 | 7 | 7 | 8 | 7 |

Lint: OK, 1 warning (scene 4: 16 words). Preview: ~38 s (target 28–35), 496 chars; motion 8.7–30.1 in every scene (no STATIC).

1. **The "why" is never answered, and the video is too long (title, script, scenes 2/4/5/6/8).** The title asks "Why did he push a tube into his own heart?", but the narration never says why. He wanted a safe way to get drugs straight into a failing heart instead of stabbing a needle through the chest. Without that, "strapped her down" in scene 5 reads as plain violence, because the trick (he strapped her down so she *thought* she was the subject) is missing. Several lines are also caption-like or choppy: scene 6 "He walked to the X-ray room." and scene 8 "Experts laughed. He quit heart medicine." At 38 s the video is over target, and scene 4 runs 5.8 s.
   → Target ≤ 460 chars. Scene 2: "Werner Forssmann wanted to get medicine straight into a dying heart, through a vein," · scene 4: "A nurse unlocked the tools and offered her own arm." · scene 5: "But he tricked her: he strapped her to the table and used his own arm." · scene 6: "Then he walked to the X-ray room, tube still inside." · scene 8: "Top surgeons mocked him, so he left heart medicine." (Sauerbruch's "circus" line; "experts laughed" in a lecture hall is invented). Scene 9: "won him a share of the Nobel Prize" (shared with Cournand and Richards). The punchline can stay, but a short payoff would help ("Today doctors do it millions of times a year."), and only if the char budget allows.
2. **Cover = 7 (must be ≥ 8): headless body (cover + scene 0).** The see-through bust ends in a neck stub with an empty beige area under the title, so at small size it reads as a headless torso. The tube also runs outside the arm over the shoulder and does not clearly enter the chest through a vein. → Give the bust a head (the young doctor's face, calm or determined, looking down at the tube), or raise the bust so the head sits just under "OWN HEART". Draw the gold line inside the arm under the collarbone into the heart. Make 1–2 new candidates (e.g. a close-up of the bust's chest + heart with the host in shock) and compare them. Also, the title pattern copies Barry Marshall exactly ("X: Why Did This Doctor…?", 2026-10-25). Either change the title (e.g. "Werner Forssmann: The Doctor Who Snaked a Tube Into His Own Heart") or keep "Why" only if fix #1 answers it.
3. **Labels clipped at the frame edge and the brand zone covered (scenes 5, 7, 9).** Scene 7: the "HIS HEART" card is cut off at the left edge (x < 0) and, at zoom 1.6, the X-ray ribs and spine run over the "STICKSTORY" brand at the top left. Scene 5: the "HIS OWN ARM" card is cut off at the right edge, the top third is empty ceiling, and the key subject (his arm + gold line + heart) is tiny at 360 px. Scene 9: old Forssmann is pushed against the left edge and cut. → Scene 7: card x ≈ 0.5, keep it ≥ 60 px inside the frame, focus lower (≈ [480, 900]) or dim the film behind the brand. Scene 5: card x ≈ 0.62, add `camera.focus` on his arm/chest, zoom ≥ 1.6 (a second close-up), and make the tube start at the elbow bandage, not the hand. Scene 9: move the old doctor in to x ≈ 0.2 and make him bigger.

**Writer changes (tur 1):**
- **Narration (460 chars; preview estimates about 36 s):** "He pushed a tube into his own heart. It was 1929, in Germany. Werner Forssmann wanted to get drugs into a dying heart, through a vein. His boss said no. It could kill you! A nurse offered her arm. But he tricked her, strapped her down, and used his own arm. Then he walked to the X-ray room. There it was, inside his heart! Surgeons mocked him, and he quit. 27 years later, that tube won him a share of the Nobel Prize. Subscribe for one wild true story a day."
  - The why is now answered: he wanted to get drugs into a dying heart through a vein. Wikipedia lists "directly delivering drugs" as one of the uses he had in mind.
  - Strapping the nurse is now framed as a trick ("he tricked her"), not violence.
  - "Experts laughed" became "Surgeons mocked him". Siemens MedMuseum: Sauerbruch dismissed the work as suited to a circus.
  - The Nobel line is now "a share of" the prize (shared with Cournand and Richards).
- **Title:** "Werner Forssmann: He Pushed a Tube Into His Own Heart!" It is a claim, which breaks away from Barry Marshall's "Why Did This Doctor…?" pattern. The description now states the motive, the trick, the surgeons' mockery and the shared prize.
- **Cover (scene 0):**
  - The bust is now whole: the head (determined face, eyes on the tube) sits just under "OWN HEART" (focus [540, 657], zoom 1.1).
  - The tube runs inside the arm: there is a pale see-through channel in the sleeve, then it passes under the collarbone into the chest window and ends at the heart.
  - Kaşif is big and shocked at the bottom left, fully in frame.
  - Candidates compared: A2 (this one) beats A1 (headless, last round), A0 (no focus: head lost in the title gradient) and B (X-ray, "A TUBE IN / HIS HEART").
- **Scene 5:** now the second close-up (focus [690, 800], zoom 1.6). The nurse lies with her head next to the doctor, so her face, the straps, his arm, the elbow bandage, the gold line and the heart are all in the shot. The tube runs from a coil on the board into the bandage. The "HIS OWN ARM" card is at x 0.62, size 40, fully inside the frame.
- **Scene 7:** the film sits lower (0.28–0.63 H) and the focus is now [480, 800], since the engine centres focus on the picture area at about y 705. The STICKSTORY brand and source note are now on the wall, and "HIS HEART" is fully inside the frame and no longer covers the catheter.
- **Scene 9:** old Forssmann is at x 0.2 and bigger (×1.3), fully in frame. The year box moved to x 0.64, clear of the source note.
- **Scene 8 cue:** "HA!" pops on "mocked".
- **Checks:** lint OK (0 errors, 0 warnings), SEO 100/100. Preview flags no STATIC? scenes. I looked at sheet.png, cover.jpg and an extra frame of scene 7.

### ag-02 — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 8 | 8 |

Lint: OK (0 errors, 0 warnings). 450 chars, about 36 s. All the round-1 problems are fixed: the motive is answered, the nurse scene is now a trick, the wording is "mocked" and "a share of the Nobel", the cover bust has a head, and the labels in scenes 5, 7 and 9 sit inside the frame. **PASS.** Optional polish:
1. Scene 8: "Surgeons mocked him, and he quit." Quit what? → "Surgeons mocked him, so he quit heart medicine." (+13 chars). On the sheet the word "him," also renders smaller than the rest of the subtitle; check that the subtitle line is not being shrunk.
2. Cover: there is an empty beige band (about y 500–760) between "OWN HEART" and the head, and the heart is fairly small. → Move the focus down a little or zoom about 1.2 so the chest and heart fill more of the frame and the head sits just under the title.
3. Scene 4: the line is "A nurse offered her arm", but most of the scene shows the cabinet and key. → Bring the moment she points at her own arm to the start of the scene (on "nurse"), or cut the key/cabinet action.

**Writer changes (final polish after tur 2):**
- Scene 8 now reads "Surgeons mocked him, so he quit heart medicine." Narration is 474 characters, about 37 s.
- Cover is now zoom 1.2, focus [540, 700]. The bust is bigger and its head sits higher, so the empty band under the title is smaller. A head any higher fades into the title's shade.
- Lint is OK and preview flags no STATIC? scenes.
