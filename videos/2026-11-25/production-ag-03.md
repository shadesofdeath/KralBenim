# ag-03 — The first blood transfusions (writer notes)

- File: `videos/2026-11-25/ag-03-first-blood-transfusion.json` · long · palette `sepya` · publish_at `2026-11-25T14:00:00-05:00`
- Narration: **4997 chars** (target 4,300–5,000) · **50 scenes** · 8 chapters (cold open + 7) · preview estimate ~6:02
- New code (own file only): `scenes/studio/shots/wc_transfusion.js`. Objects: `sickbed`, `calf`, `lamb`, `silver_tube`,
  `bleeding_bowl`, `heart` (o.loop = Harvey's circle), `test_tubes` (smooth vs clumped), `microscope`, `blood_bag`, `rbc`.
  Shots: `wc_transfusion_room` (a wc_scene + a tube that fills with blood between two item parts, a `burn` glow, `late_notes`
  drawn after a `mist`), `wc_transfusion_cells` (a brass lens with drifting red cells; modes smooth / clump / attack).
- Lint: OK, 0 errors, 0 warnings, SEO 100.

## Verified facts (≥ 2 sources each unless noted)

| Fact | Sources |
|---|---|
| Harvey shows circulation, 1628 | Red Cross history page; (common knowledge) |
| Richard Lower, dog-to-dog transfusion, England 1665 (Oxford) | Red Cross; Wikipedia/Lower |
| Denys = personal physician to Louis XIV | Wikipedia (Denys) — single source, widely repeated; kept as "a physician to King Louis the Fourteenth" |
| 15 June 1667, 15-year-old boy, fever ~2 months, bled ~20 times (leeches), ~12 oz of lamb/sheep blood, alert next morning | Wikipedia (lamb, 12 oz, 20×, alert); LITFL (15 June 1667, 12 oz sheep's blood, recovered); Smithsonian (15-y-o boy, sheep's blood, survived) |
| Lamb chosen as purest animal | Wikipedia ("the lamb ... the purest form") |
| Mauroy 34; first time 5–6 oz calf blood; later reaction: burning arm/armpit, racing pulse, back (kidney) pain, choking feeling, urine "as black as if mixed with the soot of chimneys" | LITFL (34, 5–6 oz, symptoms, quote), Smithsonian (5–6 oz, burning arm, sweating), Wikipedia (soot quote) |
| Recovered and went home to his wife; months later madness returned, wife pressed for another attempt, violent fit, died next day | LITFL, Wikipedia (Perrine; fit; next day) |
| Arsenic: court found poison killed him; wife suspected (arsenic in broth) vs rivals bribing her | Wikipedia (vials, broth, Perrine imprisoned), LITFL (rumoured bribe; court established poisoning), Smithsonian/Tucker (arsenic by rival surgeons) — told as two versions |
| 17 April 1668 ruling: no transfusion on any human body without approval of the Paris Faculty of Medicine; Denys cleared | LITFL, Wikipedia |
| ~150 years without transfusion | Smithsonian ("roughly 150 years") |
| Blundell: animal experiments showed cross-species blood dangerous; 1829 Lancet case: mother with post-partum haemorrhage, ~8 oz from his assistant, "as if life were infused into her body", lived; ten transfusions recorded, only some successful | BBTS (Learoyd) PDF; Wikipedia Blundell (10 transfusions, 1829 Lancet) |
| Landsteiner 1900–1901, blood of colleagues, serum × cells, agglutination; groups A, B, C (later O); AB found 1902 by Decastello & Sturli; initially ignored | Rockefeller Univ.; EBSCO research starter; Red Cross |
| Ottenberg 1907 first transfusion using typing and cross-matching (New York); group O universal donor observation (not used in narration) | Red Cross; Wikipedia Ottenberg |
| Landsteiner Nobel 1930 | Rockefeller Univ. |
| Fantus, Cook County Hospital Chicago, 1937, coined "blood bank", stored blood (up to ~10 days) | Smithsonian (blood bank); Wikipedia Fantus |
| 14 June (Landsteiner's birthday) = World Blood Donor Day | WHO pages (search results), AABB |

Left out (single-sourced or conflicting): the Swedish Baron Bonde case, the 45-year-old paid labourer, Arthur Coga in London,
the 1670 Parliament ban, the exact day of Mauroy's first transfusion, Blundell's 1818 first patient; "two days later" between
Mauroy's first and second transfusion (sources disagree on which attempt caused the reaction — narration says "when they tried again").

## Narration (one flowing text)

Paris, at the end of 1667. A man lies in a candlelit room, and beside him a calf is tied down. A thin tube carries the animal's blood into his arm. His doctors hope a gentle animal's blood will cure his madness. Within minutes, his arm begins to burn. The next morning, his urine is as black as chimney soot. Some of the first people to receive blood survived. Many did not. But it would take more than two hundred years to learn why. For most of history, doctors did not give blood. They took it. Sick patients were bled to restore the balance of the body's fluids. Then, in 1628, William Harvey showed that the heart pumps blood around the body in a closed circle. That opened a door. If blood travels in a circle, perhaps it could be moved from one body into another. In Oxford, in 1665, Richard Lower drained a dog almost to death and refilled it with another dog's blood. The dog lived. In Paris, an ambitious doctor wondered: could it work on a human? Jean-Baptiste Denys was a physician to King Louis the Fourteenth. On the fifteenth of June, 1667, he was called to a fifteen-year-old boy who had burned with fever for two months. Bled about twenty times, the boy could barely stay awake. Denys decided to put blood back in, but not human blood. He chose a lamb, the purest animal he could think of. About twelve ounces went into the boy's arm, and the next morning he was alert. It looked like a miracle. Soon all of Paris was talking about Denys. But that fame led him to his most dangerous patient. Antoine Mauroy was thirty-four, and he suffered from fits of madness. Denys and his patrons had a bold idea. If a calm animal's blood flowed into a troubled man, perhaps it would calm him too. So they chose a calf. The first time, only five or six ounces got through, and afterwards Mauroy seemed quieter. When they tried again, his body fought back. His pulse raced, his back ached, and he felt as if he would choke. Then came the black urine. His body was treating the calf's blood as an invader, destroying it cell by cell, and the wreckage poured out through his kidneys. Yet Mauroy recovered and went home to his wife, Perrine. Months later his madness returned, and Perrine begged Denys to try once more. The attempt was barely under way when Mauroy shook in a violent fit. The next day, he was dead. So was it the blood? Perrine blamed Denys, and the case went to court. Then investigators found something no one expected. Arsenic. The court decided that poison, not calf's blood, had killed Mauroy. Some said his wife had slipped it into his broth. Others believed Denys's rivals had paid her to blame him. Denys walked free. But in April 1668, the court added a rule. No transfusion on any human body without the approval of the Paris Faculty of Medicine, and the Faculty wanted nothing to do with it. Transfusion stopped. For about a hundred and fifty years, almost nobody dared to try again. The silence ended in London. The obstetrician James Blundell kept watching women bleed to death after giving birth. His experiments on dogs showed what Denys had missed: blood from another species was dangerous. So the blood had to come from a human. In 1829 he reported a mother, bleeding after childbirth, who received about eight ounces from his assistant. She said it felt as if life were being poured into her body. She lived. But across ten recorded attempts, success came only some of the time. Same doctor, same method, same human blood, and still one patient lived while another died. Nobody could explain it. In 1900, in Vienna, Karl Landsteiner tried a simple experiment. He took blood from his colleagues, separated the red cells from the clear liquid, and mixed them in every combination. Sometimes the mixture stayed smooth. Sometimes the cells clumped into tiny red knots. In 1901 he published the answer. Human blood comes in different groups. He called them A, B and C, the group we now call O. A year later, two colleagues found a fourth, AB. Suddenly the old mystery made sense. Blood attacks cells it does not recognise. A matching donor is safe, and the wrong one can kill. Denys's first patients probably survived because very little animal blood reached them. Blundell's patients lived or died by the luck of the match. And yet, at first, almost nobody paid attention. That changed in New York in 1907, when Reuben Ottenberg tested a donor's blood against his patient's before a transfusion, the first one matched by type. In 1930, Landsteiner won the Nobel Prize. In 1937, in Chicago, Bernard Fantus opened a place where donated blood could be kept for days. He called it a blood bank. Today the fourteenth of June, Landsteiner's birthday, is World Blood Donor Day. Every bag of blood that passes safely between strangers carries a little of this story, from a calf in a candlelit room to a few red knots in a glass tube. Would you have let a doctor try this in 1667? Tell me in the comments, and subscribe to Stickstory for more true stories of the human body.

## Shot list

| # | Chapter | Type | Text | Visual | Cues | Camera |
|---|---|---|---|---|---|---|
| 0 | Cold open | wc_scene | Paris, at the end of 1667. A man lies in a candlelit room, and beside him a calf is tied down. | Night interior, stone wall: a dark window, a candle in the foreground; a man asleep in a wooden bed paints in, then a calf lying tied on the floor beside it; note 'Paris, 1667'. | calf=calf | zoom 1.2 |
| 1 |  | wc_transfusion_room | A thin tube carries the animal's blood into his arm. His doctors hope a gentle animal's blood will cure his madness. | Closer on the same candlelit room: a thin silver tube runs from the calf's neck to the man's arm, and on 'blood' it fills red from the calf toward the arm. | blood=blood | zoom 1.6 |
| 2 |  | wc_transfusion_room | Within minutes, his arm begins to burn. | Close-up on the man's arm on the blanket, the red-filled tube entering it; on 'arm' a red heat glow swells over the arm. | burn=arm | zoom 2.0 |
| 3 |  | wc_letter | The next morning, his urine is as black as chimney soot. | An aged sheet written in line by line: Denys's own words, 'as black as if it had been mixed with the soot of chimneys', signed 'J.-B. Denys, 1668'. | black=black |  |
| 4 |  | wc_number | Some of the first people to receive blood survived. Many did not. But it would take more than two hundred years to learn why. | One big painted number '200+' on a gold swatch, hand note 'years to learn why'. |  |  |
| 5 | A circle of blood | wc_chapter | For most of history, doctors did not give blood. They took it. | Chapter card: 'Chapter 1 · A Circle of Blood · 1628 – 1665' with a small painted heart. |  |  |
| 6 |  | wc_specimen | Sick patients were bled to restore the balance of the body's fluids. | Specimen plate: a pewter bleeding bowl full of blood with a lancet beside it; notes 'bloodletting' and 'the lancet'. | bled=bled, balance=balance |  |
| 7 |  | wc_specimen | Then, in 1628, William Harvey showed that the heart pumps blood around the body in a closed circle. | An anatomical heart painted large with its great vessels; a red ring of three arrows circles it; notes 'William Harvey, 1628' and 'a closed circle'. | Harvey=Harvey, circle=circle. |  |
| 8 |  | wc_transfusion_room | That opened a door. If blood travels in a circle, perhaps it could be moved from one body into another. | Two men stand facing each other in a bare candlelit room; a thin silver tube paints in between their arms and a red line runs along it on 'moved'; note 'body to body?'. | moved=moved, circle=circle, | zoom 1.5 |
| 9 |  | wc_map | In Oxford, in 1665, Richard Lower drained a dog almost to death and refilled it with another dog's blood. The dog lived. In Paris, an ambitious doctor wondered: could it work on a human? | Map of southern England and northern France: Oxford marked with a star and 'Richard Lower, 1665'; on 'Paris' a red route crosses the Channel to Paris. | Oxford=Oxford, Lower=Lower, Paris=Paris, |  |
| 10 | The boy and the lamb | wc_chapter | Jean-Baptiste Denys was a physician to King Louis the Fourteenth. | Chapter card: 'Chapter 2 · The Boy and the Lamb · Paris, June 1667' with a small lamb lying down. |  |  |
| 11 |  | wc_scene | On the fifteenth of June, 1667, he was called to a fifteen-year-old boy who had burned with fever for two months. | A Paris street on a hot summer day: a skyline of steeples far away, a tall half-timbered house; a physician in a cape and plumed hat walks toward its door; note '15 June 1667'. | June=June, |  |
| 12 |  | wc_transfusion_room | Bled about twenty times, the boy could barely stay awake. | Day interior, light falling through a window: a pale boy asleep in the wooden bed, a bleeding bowl of blood on the floor beside it; note 'bled 20 times'. | Bled=Bled, twenty=twenty | zoom 1.45 |
| 13 |  | wc_specimen | Denys decided to put blood back in, but not human blood. He chose a lamb, the purest animal he could think of. | Specimen plate: a white lamb lying down, painted large on clean paper; notes 'the purest animal' and 'not human blood'. | human=human, lamb=lamb,, purest=purest |  |
| 14 |  | wc_transfusion_room | About twelve ounces went into the boy's arm, and the next morning he was alert. | Close on the tube from the lamb to the boy's arm filling red on 'twelve'; note '12 ounces'. | twelve=twelve, ounces=ounces | zoom 1.5 |
| 15 |  | wc_scene | It looked like a miracle. Soon all of Paris was talking about Denys. But that fame led him to his most dangerous patient. | Paris at dusk by the Seine: a crowd gathered on the quay talking, steeples beyond; note 'the talk of Paris'. | Paris=Paris, talking=talking |  |
| 16 | The madman and the calf | wc_chapter | Antoine Mauroy was thirty-four, and he suffered from fits of madness. | Chapter card: 'Chapter 3 · The Madman and the Calf · Paris, winter 1667' with a small calf lying down. |  |  |
| 17 |  | wc_scene | Denys and his patrons had a bold idea. If a calm animal's blood flowed into a troubled man, perhaps it would calm him too. | A study at night: a writing desk with an open book, a quill in its ink pot and a candle; note 'calm blood, calm mind?'. | calm=calm | zoom 1.4 |
| 18 |  | wc_transfusion_room | So they chose a calf. The first time, only five or six ounces got through, and afterwards Mauroy seemed quieter. | Winter night, the candlelit room again: Mauroy in the bed, the calf tied on the floor, the tube between them filling red on 'five'; note '5 or 6 ounces'. | calf=calf., five=five, ounces=ounces | zoom 1.4 |
| 19 |  | wc_transfusion_room | When they tried again, his body fought back. His pulse raced, his back ached, and he felt as if he would choke. | Closer on Mauroy's arm in the bed, the red tube in it; on 'fought' a hot red glow swells over the arm; note 'burning'. | fought=fought | zoom 1.9 |
| 20 |  | wc_transfusion_cells | Then came the black urine. His body was treating the calf's blood as an invader, destroying it cell by cell, and the wreckage poured out through his kidneys. | A brass magnifying lens on the paper: red human cells and paler calf cells drift in the liquid; on 'destroying' the calf cells break up into dark specks that sink away; notes 'calf cells' and 'destroyed'. | invader=invader, destroying=destroying, wreckage=wreckage |  |
| 21 |  | wc_scene | Yet Mauroy recovered and went home to his wife, Perrine. | A quiet Paris lane on a grey winter morning: a man and a woman walk side by side toward a small house; note 'home'. | wife=wife,, Perrine=Perrine | zoom 1.4 |
| 22 |  | wc_scene | Months later his madness returned, and Perrine begged Denys to try once more. | Night interior: Perrine, hands clasped, pleading before the physician in his cape by a candle; note 'once more'. | begged=begged | zoom 1.5 |
| 23 |  | wc_transfusion_room | The attempt was barely under way when Mauroy shook in a violent fit. The next day, he was dead. So was it the blood? | The candlelit room with the bed and the calf, the tube only half-laid; on 'dead' the whole picture washes slowly back into paper; note 'the blood?'. | shook=shook, dead=dead., blood=blood? |  |
| 24 | Arsenic | wc_scene | Perrine blamed Denys, and the case went to court. | The Grand Châtelet, Paris's fortress court: a gate between two round towers under a grey sky; note 'Grand Châtelet'. | court=court |  |
| 25 |  | wc_specimen | Then investigators found something no one expected. Arsenic. | A small glass flask alone on the plate, a white powder inside; on 'Arsenic' a red note 'arsenic'. | expected=expected |  |
| 26 |  | wc_scene | The court decided that poison, not calf's blood, had killed Mauroy. Some said his wife had slipped it into his broth. | A plain kitchen table by a window: a cup of broth and the little flask beside it, a candle; note 'in his broth?'. | wife=wife |  |
| 27 |  | wc_specimen | Others believed Denys's rivals had paid her to blame him. Denys walked free. | A gold coin painted large, slowly turning; note 'paid to blame him?'. | paid=paid |  |
| 28 |  | wc_letter | But in April 1668, the court added a rule. No transfusion on any human body without the approval of the Paris Faculty of Medicine, and the Faculty wanted nothing to do with it. | The court's ruling on old paper, written in line by line: 'No transfusion upon any human body without the approval of the Faculty of Medicine.' signed 'Paris court, 17 April 1668'. |  |  |
| 29 |  | wc_number | Transfusion stopped. For about a hundred and fifty years, almost nobody dared to try again. | One big painted number '150' on a red swatch, hand note 'years of silence'. |  |  |
| 30 | A gamble in London | wc_chapter | The silence ended in London. | Chapter card: 'Chapter 5 · A Gamble in London · 1818 – 1829' with a small candle. |  |  |
| 31 |  | wc_scene | The obstetrician James Blundell kept watching women bleed to death after giving birth. | London in rain: a brick hospital with many windows, St Paul's-like dome far away; a doctor in a dark coat and hat stands outside; note 'James Blundell'. | Blundell=Blundell | zoom 1.3 |
| 32 |  | wc_transfusion_room | His experiments on dogs showed what Denys had missed: blood from another species was dangerous. | A bare laboratory floor: a dog lying on one side, a lamb on the other, a tube between them; on 'another' a red note 'another species: danger'. | dogs=dogs, another=another | zoom 1.5 |
| 33 |  | wc_transfusion_room | So the blood had to come from a human. In 1829 he reported a mother, bleeding after childbirth, who received about eight ounces from his assistant. | A lying-in room: a mother in a bed, a young assistant standing beside it, a tube from his arm to hers filling red on 'eight'; note '8 ounces'. | human=human, eight=eight, ounces=ounces | zoom 1.45 |
| 34 |  | wc_letter | She said it felt as if life were being poured into her body. She lived. | Blundell's report in The Lancet, written in by hand: 'She felt as if life were infused into her body.' signed 'The Lancet, 1829'. |  |  |
| 35 |  | wc_number | But across ten recorded attempts, success came only some of the time. | One big painted number '10' on a blue swatch, hand note 'recorded attempts', smaller note 'only some lived'. |  |  |
| 36 |  | wc_scene | Same doctor, same method, same human blood, and still one patient lived while another died. Nobody could explain it. | Two beds side by side in a dim ward: one with a sleeping woman, the other empty under a candle; notes 'lived' and 'died' and a red 'why?'. | lived=lived, died=died., Nobody=Nobody |  |
| 37 | Red knots | wc_chapter | In 1900, in Vienna, Karl Landsteiner tried a simple experiment. | Chapter card: 'Chapter 6 · Red Knots · Vienna, 1900' with a small rack of test tubes. |  |  |
| 38 |  | wc_scene | He took blood from his colleagues, separated the red cells from the clear liquid, and mixed them in every combination. | A Vienna laboratory by a tall window: a desk with a brass microscope and a rack of test tubes, bookshelves behind; note 'cells + serum'. | colleagues=colleagues, mixed=mixed |  |
| 39 |  | wc_transfusion_cells | Sometimes the mixture stayed smooth. Sometimes the cells clumped into tiny red knots. | Under the brass lens: red cells drifting evenly in pale liquid; on 'clumped' they pull together into five tight red knots; note 'clumped'. | smooth=smooth., clumped=clumped, knots=knots |  |
| 40 |  | wc_specimen | In 1901 he published the answer. Human blood comes in different groups. | Specimen plate: the rack of four test tubes painted large, two smooth red, two clumped; notes 'smooth' and 'clumped' and 'groups'. | published=published, Human=Human |  |
| 41 |  | wc_timeline | He called them A, B and C, the group we now call O. A year later, two colleagues found a fourth, AB. | A short timeline painting itself in: 1901 'A, B, C', 'C = O', 1902 'AB'. | called=called, now=now, fourth=fourth |  |
| 42 |  | wc_transfusion_cells | Suddenly the old mystery made sense. Blood attacks cells it does not recognise. A matching donor is safe, and the wrong one can kill. | The lens again: red cells with a few paler strangers among them; on 'attacks' the strangers break apart into dark specks; notes 'match: safe' and 'wrong: deadly'. | attacks=attacks, matching=matching, wrong=wrong |  |
| 43 |  | wc_map | Denys's first patients probably survived because very little animal blood reached them. Blundell's patients lived or died by the luck of the match. And yet, at first, almost nobody paid attention. | Map of western Europe: Paris marked 'a few ounces', London marked 'luck of the match', Vienna with a red star. | Denys=Denys, Blundell=Blundell, nobody=nobody |  |
| 44 | The blood bank | wc_map | That changed in New York in 1907, when Reuben Ottenberg tested a donor's blood against his patient's before a transfusion, the first one matched by type. | Map of the North Atlantic: a red route grows from Vienna across the ocean to New York, marked 'Ottenberg, 1907'. | York=York, Ottenberg=Ottenberg |  |
| 45 |  | wc_specimen | In 1930, Landsteiner won the Nobel Prize. | A gold medal on a ribbon painted large; notes 'Nobel Prize' and '1930'. | Landsteiner=Landsteiner |  |
| 46 |  | wc_specimen | In 1937, in Chicago, Bernard Fantus opened a place where donated blood could be kept for days. He called it a blood bank. | A modern blood bag painted large, red with a white label and its tube; notes 'Chicago, 1937' and 'blood bank'. | Chicago=Chicago, bank=bank. |  |
| 47 |  | wc_number | Today the fourteenth of June, Landsteiner's birthday, is World Blood Donor Day. | A big painted date '14 June' on a red swatch, hand note 'World Blood Donor Day'. |  |  |
| 48 |  | wc_timeline | Every bag of blood that passes safely between strangers carries a little of this story, from a calf in a candlelit room to a few red knots in a glass tube. | The whole story as a timeline painting itself in: 1628 Harvey's circle, 1667 the lamb and the calf, 1668 the ban, 1829 Blundell, 1901 blood groups, 1937 blood bank. | calf=calf, knots=knots |  |
| 49 |  | wc_title | Would you have let a doctor try this in 1667? Tell me in the comments, and subscribe to Stickstory for more true stories of the human body. | Closing title card: 'The Wrong Blood' with the silver tube and its red drop painted below, subtitle 'Paris 1667 · Vienna 1901'. |  |  |

## Cover

Candidates rendered (1280×720), compared side by side:
1. **"BLOOD FROM / A CALF"** (highlight CALF), scene 1 t 5.0, calf + red tube + patient's bed — **chosen**: reads at phone size, one idea, the calf is the subject.
2. "THE WRONG / BLOOD" (WRONG), scene 42 cells lens — clean, but abstract (red dots) and less clickable.
3. "CALF'S BLOOD, / MAN'S VEINS" (CALF'S), scene 19 burn close-up — dramatic glow, but 4 long words fill the frame and the calf is cut.
4. "A CALF / CURED MADNESS?" — highlight failed on punctuation and a note overlapped the text; dropped.

## Known weak spots

- Preview estimate ~6:02 at 4,997 chars (slightly above 6 min); if the real voice reads slower, trim scene 31/43.
- The calf reads a little long-necked (llama-like); the lamb is acceptable but stylised.
- Room/interior scenes share one look (candlelit wall + bed) across chapters 0, 2, 3, 5 — separated by different blankets,
  day/night window, camera size and animals, but a critic may find them repetitive.
- Scene 8 (two men joined by a tube) is a literal illustration of an idea.
- No real photos/engravings used (time budget); a 17th-c. transfusion engraving (Wikimedia) could replace one room scene.

### ag-03 — round 1 (critic)
Lint OK (0 errors, SEO 100). Preview ~362 s (6:02), 50 scenes, all motion ≥ 0.7 (no STATIC).

| Script | Hook | Readability | Visual=narration | Motion | Composition | Watercolor | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 6 | 6 | 7 | 5 | 6 | 7 | 8 | 8 | 6 |

1. **Composition: one bed tableau repeated ~11 times** (scenes 0, 1, 2, 12, 14, 18, 19, 23, 33, 36, plus the near-identical bare room in 8), always the same flat side-on elevation (wall horizon 0.8, bed left, animal right). From minute 2 the viewer has seen it all. → Keep at most 4 (0, 1, 18, 23). Replace 2 with a big `wc_specimen` close-up of the arm + `silver_tube` filling red with the burn glow; replace 19 with a `wc_letter` of Denys's symptom list ("pulse raced… back ached… choking") or a `wc_transfusion_cells` mode; replace 14 with a real 17th-c. lamb-to-man transfusion engraving (`photo`, Wikimedia; e.g. search "blood transfusion lamb 17th century engraving") — it also gives the video its first real document; make 12 a high/close camera on the boy's face + bowl instead of the full bed. Scene 33/36: change viewpoint (closer, 3/4 bed, lit window) so London does not look like Paris.
2. **Cover (6): text is excellent ("BLOOD FROM A CALF", reads at phone size), the image is not.** The calf reads as a llama/alpaca (long upright neck, small head), the patient is a faceless red blanket cut off at the left edge, so the frame is a cartoon animal + a bed, no human drama. The same llama calf appears in 0, 1, 16, 18, 19, 23. → Fix the `calf` object in `wc_transfusion.js`: short thick neck, broad boxy head, wide muzzle, stubby horn buds, ears sideways, head held low; then re-shoot the cover with focus between the man's head (visible face on pillow) and the calf, tube glowing red, e.g. scene 2-style burn glow with the calf in frame (focus ≈ [1050, 650], zoom 1.4) so man + tube + calf read as one image. Render 3 candidates again.
3. **Visual/text bugs.** (a) Scene 0/1: note "Paris, 1667" is clipped by the top edge (y≈0 after zoom) and a stray leader line hangs at the top right (its note is off-screen) → move the note to y≈0.25 and fix/remove the leader. (b) The top-left label shows **"01 / 08 · Cold open"** to viewers → rename the first chapter (e.g. "The black urine" / "Paris, 1667"). (c) Chapter cards jump **Chapter 3 → Chapter 5** (Arsenic has no card) and card numbers disagree with the label (card "Chapter 5" vs label "06 / 08") → number cards to match the label, or add a card for Arsenic; consider merging to 6 chapters (SULUBOYA §3 says 4–5). (d) Scene 33: the tube starts in mid-air and runs across the mother's face; the assistant is a tiny figure at the frame edge → assistant at x≈0.22, s≈1.8, tube from his arm to her arm. (e) Scene 8: two tiny men far apart with a tube floating between them (literal, empty) → replace with a `wc_specimen` of `silver_tube` + a red drop, or Harvey's heart with the loop opening into a second loop. (f) Scene 26: a jewelled goblet as Mauroy's broth → plain bowl/cup. (g) Scene 11 "Paris street" is one house in an empty field; 15 crowd with banners reads as a protest/army → put houses on both sides / remove banners.

Accuracy notes (checked LITFL, Red Cross, AABB, Smithsonian, BBTS): Denys 15 June 1667, 15-year-old, ~12 oz lamb/sheep blood ✓; Mauroy 34, 5–6 oz calf blood, black urine "soot of chimneys" ✓; arsenic, 17 April 1668 sentence ✓; Blundell 1829 Lancet case ✓; Landsteiner 1900/1901, AB 1902 ✓; Ottenberg 1907 ✓; Fantus 1937 Cook County ✓. Minor: LITFL says the last attempt was abandoned because Mauroy would not cooperate (Wikipedia: violent fit) — current wording acceptable. Scene 44 route Vienna→New York implies Ottenberg came from Vienna → start the route without an origin or label it "the idea". Nobel medal shows a star (real medal: Nobel's profile) → use `motif: "head"`.

### Fix round 1 (writer)

Lint OK (0 errors, 0 warnings, SEO 100). Preview: 49 scenes, 4,977 chars, ~6:01 estimated, no STATIC.

1. **Repetition:** the full bed tableau now appears only in 0, 1, 17 (Mauroy + calf) and 22 (the fatal attempt). Scene 2 →
   a forearm close-up plate (new `forearm` object): the silver tube is already full of red and a burn glow swells at the vein
   on "arm". Scene 18 → `wc_letter` (diary) with Denys's symptom list. Scene 13 (12 ounces) → `wc_number` "12 / ounces of lamb's
   blood / alert the next morning" (I could not use the Wikimedia engraving: `tools/media.py` is blocked by the proxy (403), so
   there is no photo). Scene 11 (boy) → close camera on the boy's face + the bleeding bowl by the bed. Scene 32 (Blundell) →
   a different room (pale walls, pointed window, bed head on the right), assistant at x 0.22, s 1.8, tube runs from his arm to
   hers. Scene 35 (lived/died) → two candles on paper, one burning, one just blown out with smoke (new `candle_out`). Scene 7
   → a silver-tube plate (tube + red drop, large). Scenes 10/14: a Paris street of houses on both sides; the crowd is a small
   knot of townspeople with no flags or raised arms, between lit houses at dusk.
2. **Cover:** I redrew `calf` with a short thick neck, a broad boxy head held low, a wide pink muzzle with nostrils, horn buds,
   ears out sideways and a white blaze. Scene 1 has a faint burn glow from "hope", so the cover (scene 1, t 8.0, focus
   [1050, 650], zoom 1.4) shows the man's face on the pillow, the glowing arm, the red tube and the calf as one image. I
   compared 3 candidates (A this framing; B zoom 1.7, which crops the man's face; C scene 17, where a note overlaps the text).
   **Chose A.**
3. **Bugs:** the "Paris, 1667" note was moved down (y 0.3) and the "a calf" note is now inside the frame. The first chapter is
   renamed "The black urine". The "A circle of blood" card is merged into chapter 1: 7 chapters now, and the card numbers match
   the label (Chapter 2, 3, 5, 6 cards; Arsenic = 4 and The blood bank = 7 run on top-left labels only). Scene 25 broth is a
   plain earthenware bowl (`bleeding_bowl` o.broth). Scene 43 map: New York only, no route from Vienna. Nobel: a gold medal
   with a profile head (`coin` motif head). Trims: "At first, almost nobody paid attention.", shorter scene 47; scenes 5+6
   merged.

Still weak: the estimate is ~6:01 (on the 6:00 line). The lab scene (37) is small (the camera on table-top items misplaces
them, so it is wide). Scene 2's fingers are thin.

### ag-03 — round 2 (critic)
Lint OK (0 errors, SEO 100). Preview ~361 s (6:01), 49 scenes, no STATIC. Chapter labels and cards are consistent now (01–07; cards 2, 3, 5, 6 match the labels). The repeated bed scene is down to 4 (0, 1, 17, 22). The new calf reads as a calf (short neck, boxy head, horn buds). No clipped notes or stray pointer lines remain in the cold open.

| Script | Hook | Readability | Visual=narration | Motion | Composition | Watercolor | Tempo | Accuracy | Closing | Cover+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 7 | 7 | 7 | 8 | 9 | 8 | 8 |

**Passes** (all ≥ 7, cover 8). Remaining polish for an optional round 3:
1. Scene 2 (`forearm` close-up): the arm reads as an arm, but the hand is a square block with a curved crease that looks like a small frowning face. The fingers are five straight stiff sticks like a rake, and the thumb floats apart. The sleeve is a plain marshmallow-like block. → Remove the palm crease and draw the hand as a loosely curled, half-closed hand (fingers bent toward the palm, thumb attached at the base), or crop so the frame ends at the wrist (focus on the crook of the elbow where the tube enters).
2. Scene 44 (Nobel): the "medal" is now the same gold coin with a profile head used for the bribe in scene 26, so the viewer sees "the bribe coin" again. → Use the `medal` object (with ribbon) with a profile-head motif, or tint/size it differently and add the ribbon.
3. Scene 32 (Blundell, 8 ounces): the tube still starts in mid-air at the assistant's hip, and he stands far from the bed. It does not read as arm-to-arm. → Move the assistant next to the bed (x≈0.38), arm extended or seated, with the tube starting at his forearm. Minor: scene 21 (Perrine pleading) is still two small figures on a large empty wall. Push the camera in (zoom ~1.6 on the pair).

### Polish (writer)

Lint OK (0 errors, 0 warnings, SEO 100). Preview: 49 scenes, 4,977 chars, ~6:01, no STATIC. The cover is unchanged.
1. Scene 2: the camera now crops in on the crook of the arm (focus [1000, 640], zoom 1.4, arm at x 0.62). The tube enters
   the vein with the burn glow, and the hand is pushed to the frame edge. I removed the palm crease from `forearm`.
2. Scene 44: new `nobel_medal` object (a gold disc on a blue ribbon with a profile head in relief), so the bribe coin is no
   longer reused.
3. Scene 32: the assistant stands right beside the bed (x 0.38) and the tube starts at his forearm.
4. Scene 20: camera zoom 1.6 on the walking pair; the "Perrine" note was moved into the frame.
