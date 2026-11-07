# ag-01-leaning-tower-pisa — Stickstory Short (how it was built)

- **File:** `videos/2026-11-07/ag-01-leaning-tower-pisa.json` · format short · publish_at `2026-11-07T13:00:00-05:00` (Istanbul 07.11 21:00)
- **Category:** how it was built (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries); web search for current news found no fitting headline →
  **category pool** (report says so).
- **Topic:** why the Leaning Tower of Pisa did NOT fall: building began 1173; after the third floor (~1178) the tower started to sink
  into soft clay on a shallow foundation; then wars (Pisa vs Genoa / Florence / Lucca) stopped construction for almost a century —
  the pause let the soil settle and harden; without it, engineers say, it would very likely have collapsed. Builders later made the
  upper floors taller on the low side, so the tower is slightly curved (a "banana"). 1990: closed, ~5.5°; 1999–2001 engineers
  (John Burland's team) dug soil out from under the high (north) side, it straightened ~45 cm; reopened 2001.
  (Verify every number; drop any you can't confirm.)
- **Viewer should feel:** "A war saved it — and it's not even straight, it's bent."
- **Hook (3–8 words, same idea as cover):** e.g. "A war saved the Leaning Tower." ↔ cover "SAVED BY / A WAR" (highlight "war"). ≥ 3 cover candidates.
- **Punchline:** complete standalone line (e.g. "To save it, they had to dig *under* it." or the banana shape) + one short natural subscribe line with reason.
- **Related long video:** none → no `related`.
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-sage` (differs from the last Stickstory video, ag-dusk); sets: `city` (Pisa square), `field`/`hills` for the war
  (soldiers marching past the half-built stump), `interior`? — vary; Kaşif host 15–25 % of scenes with an action, ≥ 1 close-up
  (e.g. cutaway of the soil under the foundation). Pattern must differ from yesterday's whale/Hessdalen videos.

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration (one flowing text, 438 chars)
A war saved the Leaning Tower. Work began in 1173. Five years later, it was sinking into soft clay. Then Pisa went to war,
and building stopped for almost a century. Here's the twist: that pause let the clay firm up. Without it, the tower would
almost certainly have fallen. Builders made the upper floors taller on the low side. So the tower you see isn't just tilted.
It's bent like a banana. Subscribe for one strange true story a day.

### Shot list (9 scenes; new shot file `scenes/studio/shots/pz_pisa.js`: pz_tower, pz_build, pz_war, pz_floors)
| # | Text | Type / mode | Set · camera | Kaşif |
|---|---|---|---|---|
| 0 | A war saved the Leaning Tower. | `pz_tower` hook | city (Piazza) · push | cover overlay only; tower creaks further over, pigeons scatter, red Pisan war banner springs up on "war" |
| 1 | Work began in 1173. Five years later, it was sinking into soft clay. | `pz_build` sink (cutaway) | city · pull | — (stump rises in scaffold on shallow slab, sinks + tilts into clay on "sinking"; 1173 / SOFT CLAY) |
| 2 | Then Pisa went to war, and building stopped for almost a century. | `pz_war` | hills · right | — (soldiers with spears + banners march past the abandoned stump, vines grow, counter 1178 → 1272; ALMOST 100 YEARS) |
| 3 | Here's the twist: that pause let the clay firm up. | `pz_build` settle | city · **close-up** 1.6 | points down at the clay, shock on "firm"; clay layers squeeze, water beads rise; FIRMER |
| 4 | Without it, the tower would almost certainly have fallen. | `pz_build` fall | city · left | — (red ghost tower keeps rising, cracks and topples on "fallen", dust; NO PAUSE?; source Mental Floss) |
| 5 | Builders made the upper floors taller on the low side. | `pz_floors` build | city · **close-up** 1.6 | — (wedge storeys drop in on the scaffold, mason in beret holds a column then points; arrow TALLER HERE) |
| 6 | So the tower you see isn't just tilted. | `pz_tower` plumb | city · left | — (tourists do the "hold it up" pose; red plumb line drops from the top; ABOUT 4°; source Wikipedia) |
| 7 | It's bent like a banana. | `pz_floors` banana | city · push | — (gold line traces the bent axis next to a straight red dashed line; banana pops) |
| 8 | Subscribe for one strange true story a day. | `pz_tower` end | city · pull | "holds up" the tower like a tourist, points at the viewer on "story" |

Kaşif in scenes 3 and 8 (2/9 = 22 %) + cover overlay. 4 types, never 3 of one type in a row. Pattern differs from yesterday's
whale (beach/sea sets, blast plume): Piazza + underground cutaway + hillside march, cutaway close-up, year counter.

### Cover candidates (rendered and compared side by side)
- **A (chosen):** scene 0 t 1.6, "SAVED BY / A WAR" (highlight WAR) = first spoken line; whole leaning tower + one war banner + shocked Kaşif, focus [560, 700] zoom 1.08 so the tower top is clear of the text fade.
- B: scene 7 t 1.8, "BENT LIKE / A BANANA" — fun, but the axis line + banana + tower is three things; the claim is the punchline, not the hook.
- C: scene 4 t 3.4, "IT SHOULD / HAVE FALLEN" — red ghost tower + "NO PAUSE?" card = two texts, weaker single focus.

### Facts (verified)
- Foundations laid August 1173; the tower began to sink after work reached the second floor in 1178 (3 m shallow foundation, weak
  subsoil) — Wikipedia; Mental Floss ("by 1178 ... started to lean"; soft clay, sand and shells).
- Pisa almost constantly at war with Genoa, Lucca and Florence → construction halted for almost a century; the pause let the
  soil settle; "otherwise, the tower would almost certainly have toppled" (Wikipedia); Mental Floss says the same.
- Work resumed 1272 (Giovanni di Simone); upper floors built with one side taller than the other, so the tower is curved (Wikipedia).
- Closed 7 January 1990 at ~5.5°; soil removed from under the raised (north) side; reopened 2001; tilt now ~3.97° ("about 4°").
  Straightening is reported as 38 cm (Designing Buildings) or 45 cm (Wikipedia) → no cm figure on screen or in narration.
- Not used: the brief's "after the third floor" (sources say second floor / 1178 → narration says "five years later").
- Sources: https://en.wikipedia.org/wiki/Leaning_Tower_of_Pisa (read via a Wikipedia mirror; the en.wikipedia.org URL could not be
  fetched directly from this environment), https://www.mentalfloss.com/culture/architecture/why-does-leaning-tower-pisa-lean,
  https://www.designingbuildings.co.uk/wiki/Stabilising_the_Leaning_Tower_of_Pisa

## Eleştiri günlüğü — Round 1

### ag-01 — tur 1 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 9 | 7 | 6 | 7 | 6 | 8 | 8 | 9 | 7 | 8 |

Kapak ayrı: **8** (tek net odak, "SAVED BY / A WAR" telefonda okunuyor, şok Kaşif + kule + Pisa bayrağı; ama kulenin tepe katı yazı geçişinde soluk/silik kalıyor ve bayrak kulenin gövdesine biniyor). Başlık "Leaning Tower of Pisa: Why Didn't It Fall Over?" iyi (ana kelime + soru, vaat karşılanıyor).

**En büyük 3 sorun**
1. **Sahne 4 ("…would almost certainly have fallen") — görsel cue'yu karşılamıyor.** "fallen" karesinde kırmızı hayalet kule hâlâ dik duruyor, sadece çatlak + toz var; izleyici yıkılışı görmüyor. → `pz_build` `fall` modunda devrilmeyi cue'nun **başında** başlat ve "fallen" kelimesi biterken kule ≥ 60° yatmış/yere çarpmış olsun (toz bulutu çarpma anında). Ayrıca "NO PAUSE?" kartı `q: "Without"` ile ilk kelimede çıkıyor; sorun değil ama kart kulenin tepesini kapatıyor → kartı x 0.30'a (sol üst boşluk) al.
2. **Sahne 2 (savaş) — kompozisyon/kadraj ve karakter karışıklığı.** (a) Kadrajın alt ~%40'ı (altyazının altı, y 1320–1920) düz boş çimen: "kadraj dolu" kuralına aykırı → ön plana yürüyen askerlerin baş/mızrak sırası, çit ya da yol iner; kamera `focus` ile güdüğe yakınlaşabilir (zoom ≥ 1.6, bu ikinci yakın plan da olur). (b) Terk edilmiş güdük sayfanın solunda kesik ve önüne bayrak + asker binmiş; sahnenin öznesi (yarım kule + sarmaşık) okunmuyor → güdüğü x ≈ 0.35'e al, askerleri önünden değil altından/önünden geçir, bayraklar kulenin gövdesini kapatmasın. (c) Askerlerin **kırmızı yuvarlak miğferleri** küçük ekranda Kaşif'in fesine benziyor (BRAND: fes sadece Kaşif'te) → miğferleri mürekkep/gri metal (`INK.*`), kırmızı sadece bayrakta.
3. **Senaryo bağlantısı + kapanış sahnesi.** (a) "Without it, the tower would almost certainly have fallen. Builders made the upper floors taller…" arasında zaman köprüsü yok; izleyici yapımın yeniden başladığını bilmiyor → "When work finally restarted, builders made the upper floors taller on the low side." (≈ +25 karakter, bütçe 438 → ~463; gerekirse "Here's the twist:" yerine "But here's the twist:" eklemeyin, "So the tower you see" → "So today's tower" ile kısaltın). (b) Sahne 8'in `visual`'ı "Kaşif kuleyi turist gibi eliyle itiyor" diyor ama karelerde Kaşif kuleden uzakta, boş zeminde duruyor; kule ile teması yok → Kaşif'i kulenin tabanına (x ≈ 0.45) yaklaştır, ilk yarıda kolu kuleye dayalı "itme" pozu, "story"de izleyiciyi göstersin. Punchline "It's bent like a banana." eğlenceli ama kapakta vaat edilen savaşa dönmüyor; kabul edilebilir.

**Diğer gözlemler (küçük)**
- Sahne 3, 2. kare: altyazı şeridi yarı saydam/soluk ("the clay firm") ve "FIRMER" kartı kulenin tepe katına biniyor → kartı sağ alt boşluğa (y ≈ 0.62) taşı; altyazı geçişini kontrol et (`--times` ile).
- Sahne 5: "TALLER HERE" oku ve kama şeklindeki katlar 360 px'de okunmuyor; katların sağ tarafı belirgin biçimde (abartılı) uzun çizilsin, ok kalınlaşsın; kule tabanı zemine oturmuyor (havada gibi).
- Sahne 6: kamera `left` kayınca kule sağ kenara taşıyor, sol turist kesik; çekül çizgisi (red dashed) çok ince → kalınlaştır, kamera `push` yap.
- Sahne 7: kulenin eğriliği (banana) altın eksen çizgisinde zor görünüyor; düz kesikli çizgiyle fark küçük → `curve` 3.4 → 5 civarı (abartı serbest, gösterim amaçlı).
- Kaşif 2/9 (%22) — kural içinde. Yakın plan 2 (sahne 3, 5) — kural içinde. 4 tip, çeşitlilik tamam.

**Doğruluk (web ile kontrol edildi)**
- 1173 başlangıç ✓; 1178'de 2. kat bitince batmaya başladı ✓ ("five years later" doğru); Cenova/Lucca/Floransa savaşlarıyla neredeyse bir asır duraklama ✓, toprağın oturması sayesinde "aksi halde neredeyse kesin devrilirdi" (Wikipedia) ✓; 1272'de yeniden başlandı, üst katlar bir yüzü daha uzun → kule kavisli ✓; bugün ~3.97° ("ABOUT 4°") ✓; Pisa bayrağı kırmızı zemin üstünde beyaz haç ✓.
- Uyarı yok. Küçük nüans: "taller on the low side" doğru, ama bu sadece 1272 sonrası katlar için; metin "upper floors" dediği için sorun değil. Kaynaklar gerçek ve ilgili.

### ag-01 — round 1 fixes (writer)
New narration (443 chars): A war saved the Leaning Tower. Building began in 1173. Five years on, it was sinking into soft clay. Then Pisa
went to war, and work stopped for nearly a century. Here's the twist: the pause let the clay firm up. Without it, the tower would
almost surely have fallen. When work restarted, builders made the upper floors taller on the low side. So today it's not just
tilted. It's bent like a banana. Subscribe for one strange true story a day.
1. Scene 4: the ghost tower now starts toppling 0.55 s before "fallen" and lies at ~72° by the end of the word (impact dust where
   the top lands + dust at the base); base moved to x 0.22 so it falls inside the frame; "NO PAUSE?" card moved top right (x 0.66, y 0.2), off the tower.
2. Scene 2: a near row of 3 big soldiers marching the other way fills y 1320–1920 (helmets + spears); stump moved to x 0.36,
   back-row soldiers now walk behind it (drawn first, higher); all helmets are grey conical iron (`helmet_byz`), red only on the banners.
3. Narration: restart bridge added ("When work restarted, …"), trimmed elsewhere ("almost surely", "nearly a century", "So today it's
   not just tilted"). Scene 8: Kaşif at the tower foot (x 0.36), arm against the base (tourist push), points at the viewer on "story".
- Scene 3: camera locked (still, 1.6) so nothing drifts off; Kaşif x 0.37, smaller; "FIRMER" card in the sand layer left, clear of the tower and the subtitle strip.
- Scene 5: wedge storeys exaggerated (curve 4), thicker arrow; all Piazza towers now sit on the ground (tilted base sinks on the low side).
- Scene 6: camera push instead of left, plumb line thicker. Scene 7: curve 5 (clear banana bend vs the straight red dashed line).
- Cover: focus [540, 620] zoom 1.08 — whole tower incl. the bell chamber below the text fade; single banner at the right edge, off the tower.
Lint OK (0 errors, 0 warnings, SEO 100/100); preview: no STATIC (min motion 2.0, hook).

## Eleştiri günlüğü — Round 2

### ag-01 — tur 2 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 7 | 7 | 8 | 8 | 8 | 8 | 9 | 8 | 8 |

Kapak ayrı: **8** — kule artık tamamen net (çan katı dahil), tek odak, yazı küçük ekranda okunuyor, şok Kaşif güçlü. Tek kusur: bayrak sağ çerçeveye değip kesiliyor.
Lint: OK (0 hata). Tur 1'in 3 ana sorunu çözüldü: sahne 4 kule artık gerçekten devriliyor (~72°, toz); sahne 2'de ön sıra askerler alt kadrajı dolduruyor, miğferler gri (fes karışıklığı yok); "When work restarted" köprüsü eklendi, sahne 8'de Kaşif kulenin dibinde. **Geçme şartı sağlandı (hepsi ≥ 7, kapak 8).**

**Kalan en büyük 3 sorun (3. turda düzeltilirse iyi olur, zorunlu değil)**
1. **Sahne 3, "firm" anı — altyazı hâlâ soluk/yarı saydam** ("the clay firm" koyu kil bandının içinde gri görünüyor; diğer sahnelerde böyle değil). Büyük olasılıkla `settle` modunda sıkışan kil katmanı/su damlaları altyazının *üstüne* çiziliyor ya da altyazı arkasındaki koyu kil ile kontrast kayboluyor. → `pz_pisa.js` `settle` modunda kil katmanının z-sırasını/opaklığını kontrol et (altyazı şeridi y ≈ 1170–1320 üstünde yarı saydam katman olmasın), `--times` ile "firm" anını tekrar çek. Okunabilirlik puanını 7'de tutan sorun bu.
2. **Sahne 5 — "taller on the low side" hâlâ görülemiyor.** 360 px'de katlar düz dikdörtgen gibi; kama farkı ve kırmızı ok çok küçük, "TALLER HERE" kartı kulenin tepesine yapışık. Videonun asıl "neden kavisli" bilgisi bu sahnede. → Yeni katın iki kenarına kırmızı ölçü çizgileri (sol kısa, sağ uzun, ör. ince köşeli parantezler) koy, oku 2× kalınlaştır ve sağ kenara doğrult; kartı x 0.30, y 0.20'ye al ki kule tepesiyle çakışmasın.
3. **Küçük kadraj işleri.** (a) Sahne 2: ön sıra askerlerin mızrakları altyazı şeridini kesiyor ve 2. karede bayraklar güdüğün tepesini kapatıyor → mızrakları kısalt (uç y < 1170 değil, şeridin altında bitsin) ya da şeridin dışında tut; arka sıra bayrak direklerini güdükten uzaklaştır. (b) Sahne 6: kırmızı çekül çizgisi hâlâ ince (360 px'de zor seçiliyor) → 2× kalınlık; soldaki turist kenardan kesik → x'i +0.04. (c) Kapak: bayrak sağ çerçeveye değiyor → banner x ≈ 0.90.

**Doğruluk:** yeni metinde değişiklik yok sayılır ("Building began in 1173", "Five years on", "nearly a century", "almost surely", "When work restarted" — 1272) — hepsi tur 1'de doğrulanan bilgilerle uyumlu. Sorun yok.

### ag-01 — round 2 fixes (writer)
- Scene 3 "firm": re-shot with `--times 14.6,15.0,15.4,15.8` — the caption is fully opaque on every frame; the grey caption in the
  contact sheet is the engine's word-to-word caption crossfade caught mid-blend (the caption is an engine overlay above the shot,
  no pz layer can cover it), so no code change was needed there.
- Scene 5: red measure brackets on the new storey (short on the left/high side, long on the right/low side, drawn from "taller"),
  arrow 2× thicker with a bigger head; camera locked (still) so the frame stays put; card shortened to "TALLER!" and moved into the
  empty sky at the right (x 0.72, y 0.37), off the tower top and the kicker (x 0.30 cropped the card in the close-up).
- Scene 2: near-row spears shortened (tips stay below the subtitle strip); back-row banners raised on longer poles, clear of the stump top.
- Scene 6: plumb line 2× thicker; tourists moved +0.04 right. Cover: banner at x 0.90, inside the frame.
Lint OK (0 errors, SEO 100/100); full preview: no STATIC, 443 chars.
