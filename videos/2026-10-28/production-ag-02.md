# ag-02-voynich-manuscript — Stickstory Short

- **File:** `videos/2026-10-28/ag-02-voynich-manuscript.json` · format short · publish_at `2026-10-28T19:00:00-04:00` (Istanbul 29.10 02:00)
- **Category:** unsolved mysteries
- **Headline:** `tools/news.py` failed (proxy 403 on all editions); no usable fresh headline → category pool (reported).
- **Topic:** the Voynich Manuscript (Beinecke Library, Yale, MS 408): ~240 vellum pages in an unknown script, plants that
  match no known species, bathing women, star charts; bought by Wilfrid Voynich in 1912; vellum radiocarbon-dated to
  1404–1438 (University of Arizona, 2009) — so it isn't a modern forgery by Voynich; WWII codebreakers (William Friedman)
  failed; the text behaves statistically like language (word patterns), yet no one can read one word. Avoid
  unsupported "solved" claims (many claimed solutions were rejected).
- **Viewer should feel:** "A 600-year-old book nobody on Earth can read — even the codebreakers who beat wartime codes."
- **Hook / first line:** "Nobody on Earth can read this book." ↔ cover "NOBODY / CAN READ IT" (highlight READ). Real page
  photo (Wikimedia, public domain) is ideal for the hook frame / a `photo` scene.
- **Punchline:** the vellum is real and 600 years old; whatever it says, someone wrote it for a reason we've lost. + subscribe line.

## Narration (written first, read aloud; 428 chars, ~33 s, budget warning → low end)
Nobody on Earth can read this book. It's about 600 years old, in a script nobody knows. Strange plants, star charts, bathing women. In 1944, America's top codebreaker attacked it with a team. It beat them. A modern fake? Carbon dating says no: the vellum is from the early 1400s. The crazy part? Its words repeat like a real language. Someone wrote this to be read. We just can't. Subscribe for a true story like this every day.

## Verified facts (writer)
- Britannica: ~102 vellum folios (~234 pages), at Yale's Beinecke since 1969; Voynich acquired it in 1912 near Rome; radiocarbon → early 15th century; William and Elizebeth Friedman among those who failed; Montemurro's statistics show non-random, language-like word patterns; undeciphered.
- University of Arizona / EurekAlert (Greg Hodgins, NSF Arizona AMS lab): four 1×6 mm margin samples, vellum early 1400s (1404–1438 is the widely cited range), inks consistent with the period; "240 pages"; "a language and script no one has read".
- NSA (D'Imperio 1978): First Voynich Manuscript Study Group 1944–1946 (Friedman), all claimed solutions rejected.
- Not used (unverified / myths): Rudolf II 600 ducats, Roger Bacon, any "solved" claim. No real page photo: Wikimedia/Pexels blocked by the proxy (media.py 403), every frame is code-drawn.

## Shot list
| # | Sentence | Visual | Type | Set / camera | Narrator | Cue |
|---|---|---|---|---|---|---|
| 0 | Nobody on Earth can read this book. | Candle-lit desk, big open manuscript (plant + unknown script), pages glow gold; hook frame = cover | voy_book | interior | cover overlay (shock, right) | glow "read" |
| 1 | It's about 600 years old, in a script nobody knows. | Full vellum page, magnifier glides over the script; "600 YEARS OLD", "UNKNOWN SCRIPT" | voy_page | desk top | – | age "600", hit "nobody" |
| 2 | Strange plants, star charts, bathing women. | Three loose pages drop on the desk: plant, star wheel, bathing pools | voy_panels | desk top view | – | plants / star / bathing |
| 3 | In 1944, America's top codebreaker attacked it with a team. | 1940s code room, chalk script on the board, Friedman + two colleagues; "W. FRIEDMAN" | voy_room | interior | – | hit "codebreaker" |
| 4 | It beat them. | Close-up 1.7: paper balls drop, team shrugs; "UNSOLVED" | voy_room | interior, zoom 1.7 push | – | hit "beat" |
| 5 | A modern fake? | Fez narrator behind the desk thinks, then shock; "FAKE?" | voy_book | interior | think → shock | hit "fake" |
| 6 | Carbon dating says no: the vellum is from the early 1400s. | Scalpel cuts a margin strip, strip into a vial, card "1404–1438 / carbon dated" | voy_date | bench; source "University of Arizona" | – | cut / lift / 1400s |
| 7 | The crazy part? Its words repeat like a real language. | Big script page, the same word ringed in gold 4×, red thread; "SAME WORD" | voy_page | source "Britannica" | – | hit "repeat" |
| 8 | Someone wrote this to be read. We just can't. | Night, a bearded scribe in a beret over the book as the script inks itself; "STILL UNREAD" | voy_book | interior + night wash | – | hit "can't" |
| 9 | Subscribe for a true story like this every day. | Fez narrator waves behind the desk; "600 YEARS. / 0 READERS." | voy_book | interior, push | wave | s1 / s2 |

New shot file: `scenes/studio/shots/voy.js` (voy_book, voy_page, voy_panels, voy_room, voy_date; reuses TD.label / TD.figure).
Narrator: scenes 5, 9 (2/10 = 20%) + cover/hook overlay.

**Cover candidates:** A scene 0 zoom 1.3–1.45, narrator lower-left (only his head shows, quill clashes: rejected); B scene 8 scribe book (scribe fades into the text shade, pools read as blobs: rejected); C scene 1 "600 YEARS. / 0 READERS." on the magnifier (busy glyph wall, no single object: rejected); A3 (CHOSEN) scene 0 t 1.6, zoom 1.6, full-body shocked fez narrator on the right page, plant + script clearly a book.

## Critique log — round 1
| Script | Hook | Readability | Visual=narration | Motion | Composition+Kaşif | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 7 | 7 | 6 | 7 | 8 | 8 | 7 | 7 (cover 7) |

Facts: 1404–1438 checks out (UA/Hodgins tests 2009, announced Feb 2011; NBC/Fox/Medievalists all cite "1404–1438"). Friedman's study group 1944–46 OK. Caveat: carbon only dates the vellum (ink "consistent with period" per UA), so "modern fake? no" is fair; but "Someone wrote this to be read" (sc 8) is stated as fact while a 15th-century gibberish hoax (Rugg) is still open.

1. **Composition — lower frame is the same empty desk/drawers in 6 of 10 scenes (0, 3, 4, 5, 8, 9).** In sc 3/4/5/8/9 the bottom ~35–40% is flat brown drawer panels; the story objects (book, figures) are small in the middle band and the figures in sc 3/4 sit right in the subtitle strip. Sc 4 (zoom 1.7) cuts both colleagues in half at the edges and the chalk glyphs run under the brand + "CODEBREAKERS 1944" kicker. Sc 5 and 9: Kaşif and the book are small, window + empty wall above. → Raise `ground`/table line so the book/desk top fills y 1300–1700 (book bigger, w ≥ 0.5), add a foreground layer (open drawer with papers, candle/inkpot, stacked folios) instead of blank panels; sc 4 focus lower (y ~1050) so board text clears the kicker and keep all three men in frame; sc 5/9 Kaşif scale ≥ 1.5 and push in on him + book. Also the green slouch hat on the 1944 colleague (sc 3/4) breaks "period characters hatless".
2. **Cover (7) — not a single clear focus; Kaşif's face sits on top of the glyph wall.** His white head is over the right page's script, so on a phone the face reads as noise; there's a dead empty band y ~500–770 between the text and the book, and the plant is cropped/smaller than the script mass. → Move Kaşif left-of-book or in front of the desk edge with his head over plain vellum/background (e.g. x ~760, y lower so head ≈ y 1100 on the blank page margin, or set the book lower and Kaşif in front), zoom the book so the plant + glow is the one symbol and fills y 600–1500; consider highlighting "NOBODY" (the stronger word) and try "NOBODY / CAN READ / THIS" variant. Make ≥3 fresh candidates.
3. **Script/closing — choppy list rhythm, no "you", punchline overclaims.** "Strange plants, star charts, bathing women." (sc 2) is a bare list; the whole Short never addresses the viewer (BRAND §11: talk to "you"). Sc 8 visual: the scribe is just standing behind the book, the "inks itself" writing isn't readable and he isn't writing (point-down pose, no quill). → Sc 2: "And inside? Plants that don't exist, star charts, and bathing women." Sc 8: "Someone filled 240 pages for a reason. And you still can't read one word." (keeps punchline, removes the unproven "to be read" claim, adds "you"); give the scribe a quill in hand over the page with visible line-by-line ink. Subscribe line is fine.

### ag-02-voynich-manuscript — round 1 fixes (writer)
- **Script (449 chars, ~34 s):** Nobody on Earth can read this book. It's about 600 years old, in a script nobody knows. Inside? Strange plants, star charts, bathing women. In 1944, America's top codebreakers attacked it. It beat them. A modern fake? Carbon dating says no: the vellum is from the early 1400s. The crazy part? Its words repeat like a real language. Someone filled 240 pages for a reason. You still can't read one word. Subscribe for a true story like this every day. (The "wrote this to be read" overclaim is gone. "240 pages" is from the University of Arizona release. I kept "strange plants" rather than "plants that don't exist", because some identifications have been proposed.)
- **Lower frame:** in scenes 0, 5, 8 and 9 the book is now full width (w 0.5, d 0.38) and covers y 940–1670. The desk line is up at 0.47, and the blank drawer panels are replaced by an open drawer full of folios (`front: "drawer"`). The room table in scenes 3–4 uses the same drawer front. The candle in scene 0 is bigger.
- **Scenes 3–4:** the table is up at 0.55 and the men stand higher (ground 0.62), so their bodies are clear of the subtitle strip. The green hat is gone. "W. FRIEDMAN" is now a red box on the table front. Scene 4 is a still close-up (focus y 1050, zoom 1.7) with all three men in frame. The chalkboard is hidden there, so nothing runs under the kicker. "UNSOLVED" now sits under the subtitle.
- **Scenes 5, 9:** the narrator is scale 1.5 behind the desk and fills the wall. In scene 9 the words "600 YEARS. / 0 READERS." are smaller and moved clear of his fez.
- **Scene 8:** the scribe holds a quill whose tip follows the writing point. The script inks line by line, left page first, then the right. "240 PAGES" appears on "pages" and "STILL UNREAD" on "word".
- **Cover:** new candidates K1 ("NOBODY / CAN READ / THIS", NOBODY highlighted, plant page at zoom 1.25, narrator's head over the blank vellum), K2 (whole book, narrator over the script: rejected) and K3 (zoom 1.5, narrator cut at the frame edge: rejected). **K1 chosen:** the plant is the one symbol, filling y ≈ 600–1500, with no empty band.
- lint: OK (0 errors, SEO 100). Scene 0 motion is 1.3 (STATIC?). The whole scene is the hook (cover frame up until the first sentence ends), so only the cover drift shows. The right page inks in over 1.4 s under it.

## Critique log — round 2
| Script | Hook | Readability | Visual=narration | Motion | Composition+Kaşif | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 7 | 7 | 8 | 9 | 8 | 8 (cover 8) |

Round 1 issues fixed: the hat is gone, the scene 4 framing is fixed, the overclaim is gone, there is a "you" line, the book now fills the lower frame, and the scribe writes. Lint OK.
Scene 0 STATIC? (motion 1.3) is acceptable: it is the cover/hook block (about 2 s, while the first sentence plays), and the right page inks in under it.
1. **Scene 4: the red "UNSOLVED" box sits at about y 1650, inside the YouTube UI zone (y > 1500).** On a phone it falls under the like/title overlay, and the middle band is a pile of overlapping papers under the subtitle. → Move UNSOLVED to y ≈ 0.2–0.25 (between the kicker and the heads; shrink the heads/zoom to 1.6 if needed), and cut the table papers to 3 clean sheets.
2. **Cover and hook frame: a hard rectangular seam where the focus crop starts.** A vertical edge at x ≈ 165 runs from y ≈ 710 down, with a plain paper strip to its left, so the zoomed book reads as a pasted box. → Widen the focus crop or push the zoom so the book runs to the left frame edge (e.g. focus x ≈ 420), or let the `fade` cover the left edge too. With that, the cover is a solid 8–9: one symbol (the plant), the face on blank vellum, readable.
3. **Scene 2: the first ~1 s shows one small page top-left on an empty brown desk, and the lower third (y 1320–1920) stays empty desk + inkpot throughout.** Also, scenes 0/5/8/9 are four near-identical open-book-on-desk compositions. → In scene 2, drop the pages lower and larger (y 0.4–0.75, w ≥ 0.6) so the lower frame is covered; in scene 8 vary the shot (camera push on the scribe's quill, focus ≈ [700, 1200], zoom 1.6) so the closing book scenes don't repeat scene 0.

### ag-02-voynich-manuscript — round 2 fixes (writer)
- **Scene 4:** still close-up (focus [540, 720], zoom 1.7). "UNSOLVED" now sits between the kicker and the three heads, out of the YouTube UI zone. The table front is plain panels (no drawer), so only the 3 clean sheets lie on the table.
- **Cover/hook:** focus x moved to 420, which removes the crop seam. The narrator moved to x 640: his face now sits on blank vellum next to the plant, and the fez is fully in frame.
- **Scene 2:** the pages are bigger and lower (w 0.6 / 0.6 / 0.62, y 0.40 / 0.50 / 0.70) and fill the lower third.
- **Scene 8:** push-in on the quill (focus [700, 1200], zoom 1.6). The labels moved down into view: "240 PAGES" in an ink box, "STILL UNREAD" in a red box.
- lint: OK (0 errors, SEO 100). Preview: no STATIC? scene.

## Critique log — round 3 (final)
| Script | Hook | Readability | Visual=narration | Motion | Composition+Kaşif | Depth+brand | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 7 | 8 | 7 | 8 | 9 | 8 | 9 (cover 9) |

PASS (all ≥ 7, cover ≥ 8, lint OK). The cover seam is gone: the book now runs edge to edge, the plant is the one symbol, and the shocked face is clear. Scene 4 UNSOLVED is out of the UI zone. Scene 2 now fills the lower frame.
Residual (optional, not blocking): in scene 8 the push-in crops the scribe off the top edge (only his legs and the quill show behind the kicker), so "a scribe writing" is not visible. The "240 PAGES" box also crowds the kicker, and "STILL UNREAD" overlaps it. If there is time, use zoom 1.4 with focus y ≈ 1000 so his head and quill stay in frame, and move "240 PAGES" to y ≈ 0.3.

### ag-02-voynich-manuscript — round 3 quick fix (writer)
- **Scene 8:** the camera now pushes in on zoom 1.4 at focus [620, 1000], so the scribe's head, beret and quill stay in frame. The quill has a fixed length (≤ 190 px) and points at the line being written, instead of stretching across the page. "240 PAGES" (ink box) and "STILL UNREAD" (red box under it) are lower on the right page, clear of the kicker.
- lint: OK (0 errors, SEO 100); full preview: no STATIC? scene.
