# ag-01-prison-toothbrush — Stickstory Short (origins of everyday things)

- **File:** `videos/2026-11-21/ag-01-prison-toothbrush.json` · format short · publish_at `2026-11-21T13:00:00-05:00` (Istanbul 21.11 21:00)
- **Category:** origins of everyday things (plan suggestion kept)
- **Headline:** `tools/news.py` failed (agent proxy 403 for Google News, all 7 countries). Director's web search found no fitting front-page headline → category pool. Writer: if a quick WebSearch finds a real recent news peg (e.g. toothbrush/oral-health history news), mention it here; otherwise keep "pool fallback".
- **Topic:** William Addis (England) and the first mass-produced bristle toothbrush, c. 1770–1780: said to be made in prison (Newgate?) from a bone saved from a meal, holes drilled, bristles from a guard, glued/tied in. Later founded a company (Addis → Wisdom Toothbrushes, still exists). Before: rags with soot and salt, chew sticks. VERIFY on ≥ 2 sources (company history, Smithsonian/Science Museum/BBC, Wikipedia as pointer). The prison story is a family/company tradition in many sources → narrate honestly ("The story goes…" if needed). Don't claim "first toothbrush ever" (Chinese bristle brushes ~1498) — say "the toothbrush in your bathroom" / "modern toothbrush".
- **Viewer should feel:** "Wait, the thing I use twice a day started in a jail cell with a dinner bone?"
- **Hook idea:** "Your toothbrush started in a prison." ↔ cover "BORN IN / PRISON" (highlight PRISON) — ≥ 3 cover candidates.
- **Narrator draft (director; writer verifies and polishes, 420–490 chars):**
  Your toothbrush was born in a prison. Around 1770, an Englishman named William Addis was locked up in a London jail. Back then, most people scrubbed their teeth with a rag dipped in soot and salt. Addis thought there had to be a better way. So he saved a small bone from his dinner, drilled tiny holes in it, and got some bristles from a guard. He pushed them in and glued them tight. When he walked free, he started selling them. His company still makes toothbrushes today. Subscribe for a true story every day.
- **Budget:** narration 400–500 chars (hard max 550), 8–11 scenes.
- **Look:** sets `city` (Georgian London street, jail gate), `interior` (stone cell with barred window, candle, wooden bowl with bone), `night`. New types in own file `scenes/studio/shots/tb_*.js`: cell with Addis at a little table drilling a bone, rag + soot jar close-up, bone → brush assembly close-up (holes, bristle tufts going in), shop with rows of brushes, modern bathroom glass with toothbrush. ≥ 1 close-up. Kaşif host 15–25 %. On-screen `source` ≥ 1. Punchline + one natural subscribe line. Sources ≥ 2. Palette `ag-dusk`.

## Writer

- **Headline:** pool fallback. A quick WebSearch found no recent news peg for toothbrushes or oral-health history.

**Final narration (498 chars; lint OK; SEO 100/100; preview estimate about 37 s):**
Your toothbrush was born in prison. Around 1770, Londoner William Addis caused a riot. It landed him in Newgate Prison. Back then, you cleaned your teeth with a rag and soot. So, the story goes, Addis saved a dinner bone. He drilled tiny holes in it. A guard gave him bristles. He tied them in tufts and pushed them through. Once free, he started selling them. Nearly 250 years later, his company still makes toothbrushes. All from one leftover bone. Subscribe for one strange true story every day.

**Title:** Who Invented the Toothbrush? A Prisoner With a Dinner Bone (tags[0] "who invented the toothbrush") · **Cover:** "BORN IN / PRISON" (highlight PRISON), scene 0, t 2.0. It shows a big shocked fez host in the foreground and Addis holding the gleaming bone toothbrush up to the candle.

### Verified facts
| Fact | Sources |
|---|---|
| Addis was jailed in Newgate in 1770 for causing a riot (Spitalfields) | Wikipedia (Newgate, 1770); History.com ("jail for inciting a riot"); Bite Sized Britain (riot in Spitalfields) |
| Before him, people rubbed their teeth with a cloth and soot or crushed shell | Wikipedia; Bite Sized Britain. "Salt" does not appear in these sources, so the narration leaves it out |
| The bone from a meal, the drilled holes, the bristles from a guard, and the tufts tied and pushed through (glued, in Wikipedia) | Wikipedia (labelled "According to legend"); History.com (bone handle with drilled holes and boar bristles, held by wire); Wisdom (holes bored in a bone). The narration says **"the story goes"**, and the kicker reads **"The legend"** |
| After his release he started a business. He made the first mass-produced toothbrush around 1780 | Wikipedia; Grace's Guide (1780, founded the company); Wisdom (established 1780) |
| The company still makes toothbrushes today as Wisdom Toothbrushes (about 70 million a year in the UK) | Wisdom about-us; Wikipedia; Bite Sized Britain |
| "Nearly 250 years": 1780 to 2026 is 246 years | arithmetic |
Not claimed: "the first toothbrush ever." The narration says "your toothbrush" instead, because Chinese bristle brushes existed around 1498. The bristle type is not named, because sources differ (boar bristles or horse hair).

### Shot list
| # | Text | Type (tb_toothbrush.js) | Set / camera | Kaşif |
|---|---|---|---|---|
| 0 | Your toothbrush was born in prison. | tb_cell hook (Addis lifts the bone brush to the candle; it gleams on "prison"; a rat runs across) | none / push | cover block: big shocked host |
| 1 | Around 1770, Londoner William Addis caused a riot. | tb_street riot (fists, window cracks on "riot", card WILLIAM ADDIS; heads of the front row fill the bottom) | city / right | – |
| 2 | It landed him in Newgate Prison. | tb_street gate (windowless Newgate front with fetters; guards walk him in; grille drops on "Prison") | city / pull | – |
| 3 | Back then, you cleaned your teeth with a rag and soot. | tb_soot (host scrubs with a sooty rag, black smudge, SOOT jar) | none / **close-up** [470,720] ×1.6 | scrubs, worried face |
| 4 | So, the story goes, Addis saved a dinner bone. | tb_bone (bone rises from the bowl into his hand, card DINNER BONE) | none / push | – |
| 5 | He drilled tiny holes in it. | tb_bone drill (awl twists, holes appear one by one, bone dust); source Wikipedia, History.com | none / **close-up** [380,780] ×1.6 | – |
| 6 | A guard gave him bristles. | tb_cell guard (guard with keys hands a bristle bundle through the bars, card BRISTLES) | none / left | – |
| 7 | He tied them in tufts and pushed them through. | tb_bone tufts (tufts fill the holes; gleams on "through") | none / **close-up** [330,700] ×1.6 | – |
| 8 | Once free, he started selling them. | tb_shop (W. ADDIS sign, jars of brushes; coins land on "selling") | none / up | – |
| 9 | Nearly 250 years later, his company still makes toothbrushes. All from one leftover bone. | tb_bath (modern glass of brushes; the bone brush springs up on "company"; card SINCE 1780); source Wisdom Toothbrushes | none / pull | – |
| 10 | Subscribe for one strange true story every day. | tb_bath (host brushes his teeth at the sink, then waves and points) | none / push | brushes, waves, points |
Kaşif is in 2 of 11 scenes (18%). There are 5 scene types, with the same type at most twice in a row. Every new type lives in `scenes/studio/shots/tb_toothbrush.js`, which uses LH helpers from lh__lib.js.

### Cover candidates
1. **"BORN IN / PRISON"** (scene 0, t 2.0): chosen. It states the same idea as the first spoken line, and its single focus is the gleaming bone toothbrush in the cell, with the host's shocked face large.
2. "JAIL CELL / TOOTHBRUSH" (scene 7, finished brush close-up): the bone reads well, but the hands and the host crowd the frame, and the wording is longer.
3. "MADE FROM / A DINNER / BONE" (scene 4): with no bristles, the bone does not read as a toothbrush, and 3 lines of text is heavy.

## Eleştiri günlüğü

### ag-01 — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 6 | 8 | 6 | 8 | 6 | 8 | 8 | 7 |

Lint OK (SEO 100/100). Preview tahmini yaklaşık 37 sn, hedef 28–35 sn.

1. **Kapak / sahne 0 (t 2.0), tek odak yok.** Kemik fırça dev boyutta ve havada asılı duruyor: Addis'in kolundan uzun ve eli fırçayı tutmuyor. Kaşif'in kafası fırçanın başıyla mum ışığının üst üste geldiği yere oturuyor, mum alevi de fesin içinden çıkıyormuş gibi görünüyor. Yazının altında, y 520–700 arasında boş ve soluk bir şerit kalıyor. Göz üç yere bölünüyor: fırça, Kaşif'in yüzü ve Addis. **Düzeltme:** fırçayı yaklaşık %65'e küçült ve sapını Addis'in yumruğuna yerleştir (başı yaklaşık (560, 900)'da, parıltı da orada olsun). Kaşif'i `x: 300, y: 2120, scale: 1.9`'a al ki fes mumla ve fırçayla kesişmesin, yüz fırçaya baksın. Kapağa `"focus": [560, 950], "zoom": 1.3` ekle; böylece hücre yukarı çıkar ve boş şerit kapanır. Ardından ≥ 3 adayı yeniden karşılaştır.
2. **Sahne 4, 7 ve 9: kemik ya kadrajda kayboluyor ya da elde değil.** Sahne 4'ün ilk karesi neredeyse boş bir tahta masa: alt yarı sadece tahta, kâse kemiği küçük. Kemik kalkınca kâsede ikinci bir kemik kalmış gibi görünüyor ve gri "eldiven" kol kadraj altından anlamsız giriyor. Sahne 7'de kemik havada süzülüyor; `visual` "in Addis's hand" diyor ama el aşağıda ayrı duruyor ve y > 1500 bölgesinde kesiliyor. Sahne 9'da punchline'ın kahramanı kemik fırça sol kenarda küçük kalıyor ve kılları x = 0'da kesiliyor. **Düzeltme:** `tb_bone` içinde sol el kemiğin sap ucunu kavrasın, kemik kalkınca kâsedeki kemik silinsin. y 1350–1800 arasına ön plan inmeli: masa kenarı, kâse, kıl yığını ve mum dibi. Sahne 9'da standı x ≈ 320'ye taşı. "leftover" cue'sunda kemik fırça 1,6 kat büyüyüp parlasın ya da `camera.focus: [320, 980], zoom: 1.6` kullanılsın. Ek: sahne 8'in ikinci karesinde sallanan "W. ADDIS" tabelası sol üstteki STICKSTORY markasının üstüne biniyor; tabelayı x ≥ 0.6'ya al. Sahne 2'deki Newgate sıradan bir tuğla duvara benziyor; rustik taş blok ve pencere yokluğu daha belirgin olmalı.
3. **Senaryo ve tempo: yaklaşık 37 sn (hedef ≤ 35), ortası altyazı gibi.** Sahne 5–7 ("He drilled… A guard gave… He tied…") eylemleri bağlaç kullanmadan tek tek sayıyor. **Düzeltme:** sahne 1+2'yi ve 6+7'yi birleştirerek 9 sahneye in. Önerilen metin 461 karakter, yaklaşık 34 sn: "Your toothbrush was born in prison. Around 1770, a riot landed William Addis in Newgate Prison. Back then, people scrubbed their teeth with a rag and soot. So, the story goes, Addis saved a dinner bone and drilled tiny holes in it. A guard slipped him bristles, and he pushed them through in tufts. Once free, he sold them. Nearly 250 years later, his company still makes toothbrushes. All from one leftover bone. Subscribe for one strange true story every day." Cue'ları ve etiketleri buna göre güncelle: `riot`, `Prison`, `drilled`, `bristles`, `tufts`.

**Writer changes (tur 1):**
- **Narration:** now 458 chars over 10 scenes, about 34 s in preview. I adapted the critic's text but kept the YouTuber "you": "Your toothbrush was born in prison. Around 1770, a riot landed William Addis in Newgate Prison. Back then, you scrubbed your teeth with a rag and soot. So, the story goes, Addis saved a dinner bone, and drilled tiny holes in it. A guard slipped him bristles, and he pushed them through in tufts. Once free, he sold them. Nearly 250 years later, his company still makes toothbrushes. All from one leftover bone. Subscribe for one strange true story every day."
  - The old scenes 1 and 2 are now one scene. The cues are William (name card) and Prison (the grille drops).
  - The old scenes 6 and 7 also became linked sentences. The cues are now slipped/bristles, pushed/tufts, and sold.
- **Cover / scene 0:**
  - The brush is 65% of its old size, and its handle sits in Addis's fist: a skin-coloured fist is drawn on the grip, and the brush head is at about (560, 900).
  - The candle moved left of the brush head and lights it, and the bowl moved to the left end of the table.
  - Kaşif is at x 360, y 2120, scale 1.9, so his fez no longer meets the candle or the brush.
  - The cover has `focus [600, 900]` and `zoom 1.45`. A narrow fade band remains under the text block, because the engine draws the cover block that way.
- **Cover candidates (re-compared):**
  - (A) "BORN IN / PRISON" at zoom 1.45: **chosen**. It is clean, with one focus: the brush in the fist under the candle.
  - (B) The same text at zoom 1.8: the brush is bigger, but the fez overlaps the candle.
  - (C) "JAIL CELL / TOOTHBRUSH": two text lines compete, and its idea is weaker than the spoken hook.
- **tb_bone (scenes 3, 4, 6):**
  - Addis's hand now comes in horizontally from the right edge and grips the handle end.
  - The bowl is a large foreground object (bottom left, y ≈ 1450–1620). Once the bone is lifted, no bone is left in it.
  - A dark table front edge now runs across y 1730 to the bottom of the frame.
  - In scene 6 the bone sits at x 0.42 and the close-up is at [400, 800] ×1.6, so the gripping hand stays in frame. The bristle pile and the red thread are in the foreground.
- **Scene 8 (bath):** the bone-brush stand moved to x 0.3, and the sink moved right to x 0.54. On "leftover" the brush rises and grows 1.6× with a gleam.
- **Scene 7 (shop):** the "W. ADDIS" sign moved to x 0.72 with a narrower board, clear of the brand and kicker.
- **Newgate (scene 1):**
  - The front is now built of big rusticated blocks with bevelled corners and dark deep joints, with no windows.
  - "NEWGATE" is carved lower on the wall, clear of the kicker.
  - A front row of rioters' heads and fists fills y 1350–1920, so the riot is shown in this one scene.
  - The WILLIAM ADDIS card sits at y 0.71, between the subtitles and the crowd.
- **Checks:** lint OK, SEO 100/100. Preview flags no STATIC? scenes. I looked at sheet.png and cover.jpg.

### ag-01 — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 8 | 8 | 8 |

**GEÇTİ.** Tüm kriterler ≥ 7, kapak 8, lint OK, yaklaşık 34 sn, 10 sahne, Kaşif 2/10 (%20).
Tur 1'in üç sorunu da çözüldü:
- Kapakta fırça Addis'in yumruğunda, tek odak var.
- Kemik artık elde, kâse ön planda.
- Banyoda kemik fırça "leftover" anında büyüyor.
- Tabela markadan uzak.
- Newgate taş bloklu.

Kalan küçük sorunlar (isteğe bağlı, yayına engel değil):
1. **Sahne 1: Addis kim, belli değil.** "WILLIAM ADDIS" kartı y 0.71'de kalabalığın üstünde boşta duruyor, kapıdan sokulan mahkûmu göstermiyor. **Düzeltme:** kartı "William" cue'sunda x 0.5, y 0.40'a, kapı kemerinin üstüne al ve muhafızların ortasındaki mahkûma kırmızı boyunbağı ver (tur 1'deki gibi). Ayrıca "NEWGATE" oyma yazısını bir blok derzi kesiyor ("NEWG|ATE"); yazıyı tek, düz bir lento bloğunun içine koy.
2. **Sahne 3, ilk kare ("goes,"): kadrajın ortası (y 600–1350) boş tahta.** Kemik sadece altta, kâsede. **Düzeltme:** el sahne başında sağdan girsin ve kemiğe uzansın (kemik 0,4 sn içinde kalkmaya başlasın) ya da ilk yarıda `camera.focus` kâseye ([300, 1500], zoom 1.4) gitsin.
3. **Kapak: fesin sağ üst köşesi mum gövdesinin sol kenarına değiyor** (yaklaşık x 300, y 1150–1290). **Düzeltme:** Kaşif'i `x: 330`'a al ya da mumu 40 px sağa kaydır; aralarında ince bir boşluk kalsın.

**Writer final polish (after round 2):**
- **Scene 1:** "NEWGATE" is now carved on a single lintel block. The prisoner wears a red neckerchief. The WILLIAM ADDIS card sits above the gate arch at x 0.5, y 0.40 and appears on "William".
- **Scene 3:** the hand comes in at 0 s (`save_at: 0`), and the bone is up within 0.4 s.
- **Cover:** the host is at x 330, and the fez clears the candle.
- **Checks:** lint OK. I re-ran preview and looked at the cover and frames.
