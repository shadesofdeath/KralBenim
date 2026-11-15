# ag-02-roman-dodecahedron — Stickstory Short (unsolved mysteries)

- **File:** `videos/2026-11-15/ag-02-roman-dodecahedron.json` · format short · publish_at `2026-11-15T19:00:00-05:00` (Istanbul 16.11 03:00)
- **Category:** unsolved mysteries (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403); no usable front-page story → **category pool** (reported).
- **Topic:** Roman dodecahedrons — small hollow bronze objects, 12 pentagonal faces, each face a round hole of a different
  size, little knobs on every corner. Over 100 found (count varies by source: ~120–130), mostly in the north-western Roman
  provinces (Britain, Gaul, Germania; none in Italy/Rome itself), 2nd–4th century AD. No Roman text mentions them. Theories:
  knitting gloves, surveying/range-finding, calendar for sowing grain, religious/divination object, candle holder — none
  proven. A 2023 find in Norton Disney (Lincolnshire, UK) is a recent example. VERIFY counts/dates on ≥ 2 sources
  (British Museum / museum pages, Smithsonian, Norton Disney History & Archaeology Group, Wikipedia). No invented facts.
- **Viewer should feel:** "Romans wrote about everything — except this. We still don't know what it is."
- **Hook (3–8 words, same idea as cover):** e.g. "Nobody knows what this Roman object did." ↔ cover "WHAT IS / THIS?". ≥ 3 cover candidates.
- **Structure:** hook (object in hand) → 2nd sentence: where/when found, how many → tension (12 holes, all different sizes;
  not one word in Roman writing) → theories knocked down → punchline standalone (it's still unsolved; maybe you find the
  answer) → one short subscribe line with reason.
- **Related long video:** none.
- **Budget:** warning true → narration **400–425 chars** (hard max 550).
- **Look:** sets `interior` (museum case, archaeologist's table), `field` (dig trench in English field), `city` (Roman
  frontier town). New types own file `scenes/studio/shots/rd_*.js` (big rotating dodecahedron with 12 different holes and
  corner knobs; a map of finds across NW Europe with dots, none in Italy; theory cards being crossed out — but in a place, not
  empty paper). Kaşif host 15–25 %. Close-up ≥ 1. On-screen `source` ≥ 1. A real photo (`photo`, sepia, credit) of a real
  dodecahedron is welcome if found via tools/media.py (use `--name rd-...`).

## Writer — narration, fact check, shot list, cover

**Narration (round 2, 430 chars):**
No one knows what this was for. Over a hundred of these bronze balls surfaced in Rome's northern provinces. Not one
in Italy. Every face has a hole, and opposite holes don't match. Rome wrote about everything, yet you won't find a
word. Gloves? A calendar? A candle holder? No one can prove it. Some archaeologists suspect a sacred Celtic object.
Rome left us the thing and kept the manual. Subscribe for a true mystery every day.
("Sacred Celtic object" is credited to "some archaeologists": Big Think lists a religious/magical, possibly Celtic object
among the theories. The finds cluster in the Celtic north-west, which pays off "not one in Italy".)

**Fact check (2+ sources per key fact):**
- Over 100 found: Big Think / Atlas Obscura say "at least 116"; The Conversation / ScienceAlert say "about 130". The narration says "over a hundred".
- Where: mostly Gaul, the Rhine basin, Switzerland, eastern France, southern Germany, the Low Countries and Britain,
  with outliers as far as Hungary, i.e. the empire's northern provinces (Big Think, Atlas Obscura). None in Italy (The
  Conversation, ScienceAlert).
- Age: mostly 2nd–3rd century AD (Big Think, Atlas Obscura), hence "1,800-year-old".
- Holes 6–40 mm; opposite holes usually differ in size (Big Think, Atlas Obscura); knobs on the corners.
- No mention in any Roman text or image (all four sources).
- Theories: glove knitting, calendar for sowing, candle holder (wax found in one or two), surveying, religious/Celtic
  (Big Think, Atlas Obscura). None is proven.
- Norton Disney (June 2023, 33rd in England) appears only in the description.
- `tools/media.py` was blocked by the proxy (403), so there is no real photo; all visuals are code.

**Shot list** (types in `scenes/studio/shots/rd_dodeca.js`; palette `ag-newsprint`):

| # | Sentence | Visual | Type / set | Cue | Camera | Kaşif |
|---|---|---|---|---|---|---|
| 0 | Nobody knows what this was for. | big turning bronze dodecahedron on a velvet cushion, archaeologist's table, lamp | rd_object / interior | knows | push (cover zoom 1.35) | leans in pointing, jumps back in shock |
| 1 | Over a hundred of these 1,800-year-old bronze balls turned up on Rome's northern frontier. | full-frame old map, 100+ red dots; OVER 100, BRITAIN, GAUL, GERMANIA; source Big Think | rd_map | hundred, bronze, northern, frontier | pull | none |
| 2 | Not one in Italy. | Italy close-up: dots stop at the Alps, Italy fills red, big "0" | rd_map | Italy | **close-up 1.6** | none |
| 3 | Every face has a hole, | faces light up gold; 12 FACES | rd_object / interior | face | **close-up 1.6** | none |
| 4 | and opposite holes are different sizes. | closer: hole rims pulse gold, small and big; NO MATCH | rd_object / interior | different | **close-up 2.0** | none |
| 5 | Romans wrote about everything, but you won't find a word on this. | Roman library, big pigeonholes of side-on scroll rolls, laurel scribe writing; rolls flash; object drops on desk, scribe shrugs; NOT ONE WORD on plain wall | rd_scroll / interior | everything, this | left | none (scribe) |
| 6 | Gloves? A calendar? | Roman street (temple, tiled houses, cobbles): knitted finger + yarn; second holds it up to the sun by wheat | rd_theory / field + own street | Gloves, calendar | still | none |
| 7 | A candle holder? Nobody can prove it. | third townsman with a burning candle; thick red X over each card, all shrug; UNPROVEN stamp | rd_theory | candle, prove | still | none |
| 8 | My guess? A northern, Celtic thing Rome never wrote down. | English dig on the old frontier, object rises from the clay, sparkles; CELTIC? | rd_dig / field | northern, Celtic | push | none |
| 9 | Subscribe for a true mystery every day. | same dig, Kaşif holds the object up, then points at the viewer | rd_dig / field | mystery | pull | holds it up, points |

Kaşif appears in 2 of 10 scenes (20 %). There are 5 types and 3 close-ups. Theory cards use 72 px serif.

**Round 2 changes:** 11 scenes. New scene 8 `rd_altar` (hills): a hatless Gaul with a gold torc sets the object on a
stone altar, with the label SACRED?. Scene 9 is the dig with NO MANUAL. In scene 10 Kaşif points forward at the viewer
and rests the object (r 180) in his other hand at his side. Scene 0 object moved to x 0.44 so no knobs are cut.

**Cover (round 2):** "WHAT WAS / **THIS** FOR?" (same idea as the first sentence). Scene 0 at t 1.3, focus [571, 943],
zoom 1.25: the whole object sits right under the text (no cut knobs). A cover Kaşif is drawn over it (shock, scale 1.7,
x 725), with his head about 55 px inside the frame. The scene's own Kaşif sits outside the hook crop.
Earlier candidates "NO ONE / KNOWS WHY" and "ROME'S / UNSOLVED / OBJECT" were weaker.
Highlight box: Stickstory's cover is an ink box with a red offset shadow (BRAND §11 overrides §9's red box for
Stickstory, and the engine picks it from `narrator: fes`), so the navy box is the channel style.

## Eleştiri günlüğü

### ag-02-roman-dodecahedron — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 7 | 8 | 7 | 7 | 8 | 8 | 8 | 7 |
1. Senaryo, sahne 1/3/4/5: ortası liste gibi. "Over a hundred, about 1,800 years old, turned up…" öznesiz (yüz tane ne?); "Twelve faces, holes of different sizes, and knobs on every corner." fiilsiz ve ekrandakini tarif ediyor; "None in Italy" ilginç bir kanca ama karşılığı hiç gelmiyor (neden sadece kuzey sınırı?); "Here's the crazy part:" dolgu; izleyiciye hiç "you" denmiyor. → Bağlı cümlelerle yeniden yaz, bütçe 400–425 kalsın: ör. "Over a hundred of these bronze balls have been dug up, all from Rome's cold northern frontier. Not one in Italy. Every face has a hole, and no two holes are the same size. Romans wrote about everything, but never this." Delik boyutlarının farklı olması gizemin kendisi yapılsın (ekranı tarif değil, bilmece).
2. Kapak (cover.jpg, sahne 0 t 1.3): alt %40 (y ≈ 1450–1900) ölü gri masa, nesne kadrajın ortasında küçük kalıyor, sağdaki çömlek rafı ikinci odak, vurgu kutusu kırmızı değil lacivert (BRAND §9: tek kelime kırmızı kutuda), "WHAT IS THIS?" çok kalıp. Kapak 8 şartını geçmiyor. → `focus` ≈ [420, 1180], `zoom` ≈ 1.35 ile dodekahedronu yazının altından y ≈ 1750'ye kadar büyüt, Kaşif'i kapakta büyüt (`kasif: {"pose":"shock","scale":1.6,…}`) ki şok yüzü küçükte okunsun; vurgu kutusu kırmızı; en az bir aday metin daha dene (ör. "NO ONE / KNOWS **WHY**" ya da "ROME'S / **SECRET**"), ilk cümleyle aynı fikirde kalsın.
3. Sahne 5–7 görsel: sahne 5'te kitaplık gözleri aynı beyaz disklerden oluşan duvar gibi okunuyor (parşömen rulosu değil saat/göz dizisi), yazıcı küçük, düşen dodekahedron sağ kenarda (x ≈ 0.97) kadrajdan taşıyor, "NOT ONE WORD" kalabalık rafın üstünde küçük; altyazıda "wrote" küçük ve "Romans"un altına kaymış görünüyor. Sahne 6–7'de iki güneş var (sarı + soluk pembe disk), teori kartları 62 px el yazısı, 360 px'te sınırda; "prove"daki kırmızı X'ler zor seçiliyor. → Rulolar yandan silindir uçları, daha az ve büyük gözler; nesne `obj.x` ≤ 0.72, `r` ≈ 190; etiket düz duvar alanına; pembe diski kaldır; kart yazıları ≥ 72 px serif; X kalın ve kartın tamamını kesecek şekilde.

### ag-02-roman-dodecahedron — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 7 | 8 | 8 | 7 | 7 |
(Tur 1 sorunları: anlatım bağlı ve "you" var, Italy kancası karşılık buldu; sahne 5 rulolar okunuyor, nesne kadrajda; iki güneş gitti, kartlar 72 px serif. Lacivert vurgu kutusu kanal stili (BRAND §11), hata sayılmadı.)
1. Kapak (cover.jpg): Kaşif'in fesi ve yüzünün sağ yarısı çerçeveye değiyor ve kesiliyor (kural: Kaşif çerçeveye değmez), dodekahedronun sol düğmeleri de x ≈ 45'te kesik; yazıyla nesne arasında (y ≈ 520–800) hâlâ boşluk var. → `zoom` 1.35'ten ≈ 1.2'ye indir, `focus` ≈ [600, 900] (ya da kapakta `kasif: {"pose":"shock","x":0.76,"scale":1.3,…}`) ki Kaşif'in başı ve fesi kenardan ≥ 40 px içeride, nesne tam görünsün ve yukarı, yazının hemen altına çıksın.
2. Sahne 8, kapanış/doğruluk: "My guess? A northern, Celtic thing Rome never wrote down." kişisel tahmin olarak işaretlendiği için yalan değil ve buluntuların Galya/Ren dağılımına dayanan yaygın bir hipotez; ama ses akılda kalan punchline'ı ("Rome left us the object and kept the manual") kaybettirdi, "Celtic" ekranda hiç gösterilmiyor (kazı + "CELTIC?" yazısı), "northern frontier" de kesin değil (buluntuların çoğu iç Galya'da, sınırda değil). → Hipotezi arkeologlara bağla, punchline'ı geri getir: ör. "Most turn up in old Celtic lands, so many archaeologists suspect a local, maybe sacred, object. Rome left us the thing and kept the manual." Sahne 1'de "frontier" yerine "Rome's northern provinces" dersin; bütçe için sahne 5'ten kelime kıs. Görselde Celtic ögesi olsun (ör. torklu, şapkasız bir Galyalı figür dodekahedronu sunağa koyuyor).
3. Sahne 0 ve 9 (Kaşif): Kaşif yalnız 2/10 sahnede ve 9'da pasif: nesneyi kaldırıyor, öbür eli belde, "mystery"de izleyiciyi gösterme okunmuyor; nesne sağ üst kenara yapışık. Sahne 0'ın kanca karesinde de dodekahedronun sol düğmeleri x = 0'da kesik. → Sahne 9'da `seq` ile net bir öne işaret pozu (`pose: "point"`, kameraya dönük, kol yatay) ve nesneyi göğüs hizasında büyüt (`r` ≈ 180, kenardan içeride); sahne 0'da `obj.x` ≈ 0.42–0.45, böylece kanca karesinde nesne tam görünsün.

### ag-02-roman-dodecahedron — tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 7 | 8 | 8 | 8 | 8 |
(Geçti: tüm kriterler ≥ 7, kapak 8, lint OK. Tur 2 sorunları çözüldü: kapakta nesne tam, Kaşif çerçeveden içeride ve şok yüzü küçükte okunuyor; kapanış hipotezi arkeologlara bağlıyor ("Some archaeologists suspect a sacred Celtic object"), dürüst ve kaynaklarla uyumlu; "kept the manual" punchline geri geldi; "northern provinces" doğru; sahne 10'da Kaşif net işaret ediyor.)
1. Sahne 0 / kapak-kanca karesi (frame_00, t 0): ayrı kapak Kaşif'i çizilirken sahnenin kendi Kaşif'i de görünüyor: sağ kenarda (x ≈ 1050–1080, y ≈ 1060–1220) ikinci bir Kaşif'in kolu/kafa kenarı yarım kalmış. Videonun ilk karesinde (kanca) ikinci, kesik bir figür var. → Kapak bloğu ekrandayken sahne Kaşif'ini gizle ya da sahnedeki Kaşif'i kapak Kaşif'iyle aynı konuma al (`params.kasif.x` kapakla eşleşsin) ya da kapak `focus`/`zoom` onu kadraj dışına itecek şekilde ayarlansın; preview frame_00'da sağ kenar temiz olmalı.
2. Sahne 8 (rd_altar, Galya): altyazının altı (y ≈ 1320–1920) boş, sisli yeşil tepe; ön plan katmanı yok (CLAUDE.md kadraj kuralı). Torklu Galyalı ve sunak üst yarıda küçük kalıyor. → Ön plana çimen/taş çit/kutsal koru gövdeleri ya da çalı katmanı indir, sunak ve figürü 1.15–1.2 büyütüp aşağı al.
3. Küçük: sahne 3'te etiket "12 FACES" anlatımla ("Every face has a hole") tam örtüşmüyor (kabul edilebilir); sahne 6–7 kamera "still" olunca motion 8.7/10.9'a düştü, geçerli ama hafif bir "push" (zoom 1.03) canlılık katar.
