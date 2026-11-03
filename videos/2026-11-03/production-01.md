# 01 — Laika ve Sputnik 2, 3 Kasım 1957 (günlük Shorts, belgesel tarzı)

- **Dosya:** `01-laika-sputnik-2.json` · yayın 2026-11-03 19:00 (İstanbul) · `publish_at` `2026-11-03T19:00:00+03:00`.
- **Manşet:** `tools/news.py --channel db` bu ortamda çalışmadı (proxy 403, Google News'e erişim yok) → **yıl dönümü
  kancası**: bugün, 3 Kasım, Sputnik 2'nin fırlatılışının (3 Kasım 1957) 69. yıl dönümü; video tam o gün yayınlanıyor.
- **Havuz:** felaketler ve kazalar (plan önerisi) / keşifler: kabinin aşırı ısınması, 45 yıl saklanan ölüm.
  Geçmişte (iki kanal) işlenmedi. Haftanın Türkiye/Osmanlı kotası 1 ve 2 Kasım'da dolu.
- **Tarz:** `"theme": "belgesel"`, tema **`derin`** (uzay; bir önceki Düşün Bakalım videosu `grafit`).
- **ElevenLabs:** `warning: true` → anlatım alt uçta, **330–375 karakter**.
- **İzleyici sonunda ne hisseder:** Dönüşü hiç planlanmamış bir yolculuğun sessiz ağırlığı; yalanın 45 yıl sürmesi;
  kapsülün aylarca boş bir mezar gibi Dünya'nın çevresinde dönmesi.
- **Kanca fikri:** "Yörüngeye çıkan ilk hayvan, geri dönmeyecekti." ↔ kapak "DÖNÜŞÜ YOKTU" (vurgu `yoktu`).
- **Kapak fikri:** karanlık uzayda Dünya'nın kenarı üstünde tek Sputnik 2 konisi, küçük lombozunda ışık havuzunda
  tek bir köpek başı silueti.

## Anlatım taslağı (yönetmen; yazar doğrulayıp cilalar)

Yörüngeye çıkan ilk hayvan, geri dönmeyecekti. 3 Kasım 1957. Sovyetler, Moskova sokaklarından bir köpeği Sputnik 2'ye
bindirdi. Adı Laika'ydı. Kapsülün bir dönüş planı yoktu. Sovyetler, Laika'nın günlerce yaşadığını açıkladı. Gerçek
kırk beş yıl saklandı. Kabin ısındı. Laika birkaç saat içinde öldü. Kapsül beş ay boyunca, onunla birlikte Dünya'nın
çevresinde döndü. Böyle sessiz hikâyeler için abone olun.

(Taslak ~400 karakter → yazar 375'in altına indirir. Doğrulanacak: kaç saat — 2002'de Dimitri Malaşenko "5–7 saat";
yeniden giriş 14 Nisan 1958, ~2.570 tur; köpek ~3 yaşında, ~6 kg sokak köpeği.)

## Anlatım (tek parça; tur 1, 373 karakter, ElevenLabs uyarısı → alt uç)

Uzaya giden bu köpeğin dönüşü yoktu. Adı Laika'ydı. Moskova sokaklarında bulunmuştu. 3 Kasım 1957'de Sputnik 2 ile
yörüngeye çıktı. Sovyetler, onun günlerce yaşadığını söyledi. Gerçek kırk beş yıl sonra ortaya çıktı. Kabin
ısınmıştı. Laika birkaç saat içinde ölmüştü. Kapsül, beş ay boyunca Dünya'nın çevresinde dönen bir mezar oldu. Böyle
sessiz hikâyeler için abone olun.

- Taslaktan farklar: kanca "Uzaya giden bu köpeğin dönüşü yoktu." (6 kelime, kapak "DÖNÜŞÜ YOKTU" ile aynı fikir; "ilk
  hayvan" iddiası kancadan çıktı, çünkü Laika'dan önce suborbital uçan köpekler vardı; o yörüngedeki ilk canlı).
  "Gerçek kırk beş yıl saklandı" → "kırk beş yıl sonra ortaya çıktı" (1957 → 2002; Sovyet anlatısı zamanla değişti,
  "saklandı" fazla kesin). Ölüm ve ısınma -mıştı ile (sonradan öğrenilen gerçek). Punchline: "Kapsül, beş ay boyunca
  Dünya'nın çevresinde dönen bir mezar oldu." (162 gün ≈ 5 ay).
- "-yor" 0/11, devrik cümle yok, kısaltma yok, ünlem yok.

## Çekim listesi (tur 1; tipler `scenes/studio/shots/bt_laika.js`)

| # | Cümle | Tip | Görüntü | Cue |
|---|---|---|---|---|
| 0 | Uzaya giden bu köpeğin dönüşü yoktu. | `bt_lk_capsule` window | Dünya kenarının üstünde perçinli silindir kabin (kubbe, iki anten); lombozda sıcak ışık havuzunda profilden köpek başı; kıtalar alttan kayar; lomboza altın halka çizilir | hit `yoktu` — kanca + kapak |
| 1 | Adı Laika'ydı. Moskova sokaklarında bulunmuştu. | `bt_lk_street` | Gece, çisenti; bina sırası + uzakta soğan kubbe, ıslak parke, tek sokak lambası; ışık havuzunda küçük sokak köpeği; yansıma dalgalanır, havuz genişler | hit `sokaklarında` |
| 2 | 3 Kasım 1957'de Sputnik 2 ile yörüngeye çıktı. | `bt_lk_launch` | Gece bozkır; R-7 (gövde + yan iticiler); servis kolları açılır, alev, duman yere yayılır, roket yavaşça yükselip kadrajdan çıkar (alev altyazı şeridine girmez) | hit `yörüngeye` |
| 3 | Sovyetler, onun günlerce yaşadığını söyledi. | `bt_lk_vitals` claim | Yuvarlak osiloskopta düzenli kalp çizgisi; üstte italik "Resmî açıklama"; altta "1. gün" → "6. gün" sayacı | hit `günlerce` |
| 4 | Gerçek kırk beş yıl sonra ortaya çıktı. | `bt_lk_file` | Masada ışık havuzunda "GİZLİ" damgalı, "1957" yazılı kapalı dosya, toz; kapak açılır, içte altın "2002" | hit `Gerçek` (açılma +0,9 sn) |
| 5 | Kabin ısınmıştı. Laika birkaç saat içinde ölmüştü. | `bt_lk_capsule` dark | Açılıştaki kabin; "ısınmıştı"da loboz ışığı kırmızıya döner; "saat"ten sonra ışık söner, köpek başı karanlığa karışır | heat `ısınmıştı`, hit `saat` |
| 6 | Kapsül, beş ay boyunca Dünya'nın çevresinde dönen bir mezar oldu. | `bt_lk_orbit` tomb | Uzaktan Dünya; kapsül ışığı tekrar tekrar döner, her tur soluk yörünge çizgisi; üstte "0 → 162 gün", "yörüngede"; "mezar"da ışık soğur | hit `mezar` |
| 7 | Böyle sessiz hikâyeler için abone olun. | `bt_lk_orbit` burn | Dünya kenarı; üstte italik "14 Nisan 1958"; küçük altın iz atmosfere kayar, parlar, söner | — |

8 sahne, 5 tip (`bt_lk_capsule` 2, `bt_lk_orbit` 2 üst üste, diğerleri 1). `bt_lk_vitals` heat (termometre) kodda duruyor,
kullanılmıyor: tek başına 1,4 sn'lik sahneydi ve geçişte kayboluyordu → ısınma kabin sahnesine (kırmızı ışık) taşındı.

## Kapak adayları

| Aday | lines | Sahne/t | focus/zoom | Not |
|---|---|---|---|---|
| **A (seçildi)** | "Dönüşü" / "yoktu" (vurgu `yoktu`) | 0 / 2.0 | [540,760] 1.2 | Kancayla birebir; en büyük yazı; tek özne: lombozdaki köpek başı ışık havuzunda |
| B | "Dönüş" / "bileti" / "yoktu" | 0 / 2.0 | [540,760] 1.15 | Üç satır, yazı küçülüyor, nesneye yer daralıyor |
| C | "45 yıl" / "saklandı" | 4 / 2.6 | — | Açık dosyada "2002"; güçlü ama köpek yok, kanca değil |
| D | "Dönen" / "bir mezar" | 6 / 3.5 | [540,780] 1.2 | Dünya + yörünge; soyut, telefonda köpeğin hikâyesi olduğu anlaşılmıyor |

## Kaynaklar (doğrulanmış)

- Laika sokak köpeği, ~6 kg (13 lb), yaklaşık 2 yaşında (Britannica; yönetmen notundaki "~3 yaş" kaynaklarda ayrışıyor →
  yaş anlatılmadı); 3 Kasım 1957 Sputnik 2; resmî Sovyet anlatısı: 6–7 gün sonra zehirli yemekle ötanazi; gerçekte
  fırlatmadan ~5–7 saat sonra aşırı ısınma ve panikten öldü; 2002'de Dimitri Malaşenko açıkladı; Sputnik 2 14 Nisan
  1958'de atmosfere girip yandı — [Britannica: Laika](https://www.britannica.com/topic/Laika)
- Moskova sokaklarından toplandı, ~6 kg; Sputnik 2 güvenli dönüş için tasarlanmamıştı; erken Sovyet yayınları ~bir hafta
  sonra acısız öldüğünü söyledi; 14 Nisan 1958'de 2.570 tur (başka kaynakta 2.370), 162 gün — [Space.com](https://www.space.com/38660-laika-space-dog-launch-60th-anniversary.html)
- 2002: Malaşenko (Biyomedikal Problemler Enstitüsü), sıcaklık ve nem yükseldi, Laika ~5 saat sonra telemetri
  bozulurken öldü; Sovyetler on yıllarca huzur içinde öldüğünü söyledi — [Mail & Guardian (2002)](https://mg.co.za/article/2002-01-01-fate-of-first-canine-cosmonaut-revealed)
- Genel kayıt — [Wikipedia: Sputnik 2](https://en.wikipedia.org/wiki/Sputnik_2) (bu ortamda açılamadı; arama sonucunda doğrulandı, bilgiler yukarıdakilerle örtüşüyor)
- Cümle kontrolü: "Moskova sokaklarında bulunmuştu" ✓; "3 Kasım 1957 … yörüngeye çıktı" ✓; "günlerce yaşadığını söyledi" ✓
  (6–7 gün / ~bir hafta); "kırk beş yıl sonra" ✓ (2002); "Kabin ısınmıştı. … birkaç saat içinde" ✓ (5–7 saat); "beş ay" ✓
  (162 gün). Baykonur anlatımda yok (görüntü: bozkır). Ekranda "162 gün", "14 Nisan 1958" ✓. Sayaç "6. gün"e kadar
  (resmî anlatı 6–7 gün). Tur sayısı (2.570/2.370 ayrışıyor) yazılmadı.

## Eleştiri günlüğü

### 01-laika-sputnik-2 — Tur 1 (yazar)
- `bt_laika.js` yazıldı: `bt_lk_capsule` (window/dark), `bt_lk_street`, `bt_lk_launch`, `bt_lk_vitals` (claim/heat),
  `bt_lk_file`, `bt_lk_orbit` (tomb/burn). Deterministik `rng`, sadece tema token'ları, titreşim yok; isimler `bt_lk_`
  önekli (`bt_cosmos.js`'teki `bt_street`/`bt_orbit` ile çakışmasın).
- lint OK (SEO 100/100); preview ~27–28 sn tahmin, 8 sahne, 373 kr, cue'lar eşleşti.
- Düzeltilen: roket alevi altyazı şeridine iniyordu → ufuk 1040'a çekildi, alev boyu y 1110'da kesiliyor; Dünya
  kıtaları koyu lekeler gibi (Ay kraterleri) okunuyordu → açık yeşil kara, daha koyu okyanus; termometre sahnesi 1,4 sn
  ve geçişte kayboluyordu → kabin sahnesiyle birleşti (ışık kırmızıya döner, sonra söner); dosya çok geç açılıyordu,
  "2002" görünmüyordu → cue `Gerçek`, açılma +0,9 sn (önce GİZLİ, sonra 2002 okunur); köpek başı çakal gibiydi →
  kulaklar kısaldı, kafa yuvarlandı; yanma izi büyütüldü.
- Bilinen: sahne 0 `motion=0.2 STATIC?` — ilk cümle boyunca kapak kancası ekranda (kural gereği). Kapakta kabin
  kubbesi kapak kararmasında silik. `bt_lk_orbit` burn sahnesinde altyazı Dünya diskinin üstünde (okunuyor).
  Sahne 6'daki Dünya (yörünge) karikatürize lekeli; kıtalar gerçek coğrafya değil.

### 01-laika-sputnik-2 — Eleştirmen — Tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 6 | 7 | 7 | 8 | 8 | 9 | 8 | 7 |

lint OK (SEO 100/100); preview 8 sahne, ~28 sn, 373 kr, cue'lar eşleşti (sahne 0 `motion=0.2` kapak kancası; sahne 7 `1.8`).
Ton belgesel: kısa ağır cümleler, enerjik kalıp yok, devrik cümle yok, "-yor" 0/11. Kanca 6 kelime, kapakla ("DÖNÜŞÜ
YOKTU") aynı fikir. Punchline ("…Dünya'nın çevresinde dönen bir mezar oldu.") tam ve akılda kalıyor, abone cümlesi doğal.
Bilgiler doğru (web: Britannica, Space.com, Mail & Guardian 2002): Moskova sokak köpeği ✓, 3 Kasım 1957 ✓, resmî anlatı
~bir hafta / "6. gün" ✓, 2002 Malaşenko = 45 yıl ✓ (not: 1999'da bazı Rus kaynakları ısınmayı yazmıştı; tam açıklama 2002,
"ortaya çıktı" kabul edilebilir), 5–7 saat = "birkaç saat" ✓, 14 Nisan 1958 / 162 gün = "beş ay" ✓; "yörüngeye çıkan ilk
canlı" yaygın kabul (Britannica). Sol üst boş, tek özne, titreşim yok, tema `derin` (önceki `grafit`) ✓. Sorun görsel tarafta:

1. **Kapak + sahne 0: telefonda "uzaydaki köpek" okunmuyor (Kapak+SEO 7, Kanca 7).** Kapakta kubbenin üst çizgisi
   karanlığa eriyor (y ≈ 690–880 arası neredeyse görünmez), kabin bir kavanoz/fener gibi; Dünya sadece y ≈ 1900'de ince bir
   yay (`visual`'deki "Dünya kenarı, kayan kıtalar" yok, üstelik YouTube arayüzü bölgesinde); köpek başı uzun sivri burun +
   iki dik kulakla tilki/çakal gibi. Alt üçte bir (y 1580–1920) boş. Düzeltme: kabini ~150 px yukarı al (gövde y ≈ 560–1380,
   kubbe kontur çizgisi tam opak, iki anten görünsün — sahne 5'teki gibi); Dünya kenarını sahne 5'teki gibi y ≈ 1450'den
   başlat (yarıçap büyük, ince soğuk atmosfer halesi, kıtalar yavaşça kayar) → hem "uzay" okunur hem alt dolar; köpek
   başında burnu ~%25 kısalt, alnı yuvarlat, kulakları biraz yana aç ve boyna ince bir tasma/kayış çizgisi ekle (Laika'nın
   koşum takımı). Kapak `focus` [540, 900] civarına, `zoom` 1.15. Metin değişmez (0 kr etkisi).
2. **Sahne 5–7: Dünya, Ay'a / Satürn'e benziyor (Görsel=anlatım 6).** Disk ve kenar tek ton gri-turkuaz, kıtalar düzgün
   açık elipsler → 360 px'te krater gibi; sahne 6'da üst üste binen eğik yörünge çizgileri Satürn halkası gibi okunuyor;
   kapsül ışığı (r ≈ 5 px) çok küçük, "mezar"da ışığın soğuması seçilmiyor. Düzeltme: okyanusu koyulaştır (`inkSoft`
   karışımı), kıtaları düzensiz kıyılı birkaç büyük kara parçası yap (elips değil), diske ince parlak atmosfer halkası
   (`BTL.glow`, soğuk mavi token) ekle; sahne 6'da tek bir eğik yörünge elipsi çiz, eski turlar çok soluk ve diskin
   ARKASINDA kalan yarı gizlensin (halka etkisi kalkar); kapsül ışığını r ≈ 12 + hale yap, "mezar"da altından buz beyazına/
   gri'ye 0,8 sn'de dönsün ve halesi küçülsün. Sahne 7'deki iz de Dünya kenarına (atmosfere) değip orada parlasın.
3. **Alt yarılar boş (Kompozisyon 7).** Sahne 2 (fırlatma) y ≈ 1100–1920, sahne 3 (osiloskop) y ≈ 1320–1920, sahne 6 y ≈
   1300–1920 düz koyu zemin. Düzeltme: sahne 2'de bozkır zeminini ve rampa yapısını (beton platform, iki yana açılan
   servis kuleleri, yerde yayılan duman) y ≈ 1100–1700'e indir, duman alt kenara kadar yayılsın; sahne 3'te osiloskobu
   bir kontrol panelinin içine koy (panel y ≈ 600–1750: altında iki düğme + küçük kadran, altyazı şeridi 1190–1300 boş
   kalacak şekilde panel yüzeyi düz); sahne 6'da Dünya'yı büyüt ve aşağı al (merkez y ≈ 1350, r ≈ 420; sayaç y ≈ 380'de
   kalır, kapsül yörüngesi diskin üstünde y ≈ 700–1000 arasında görünsün), altyazı diskin üstünde okunuyorsa sorun yok.
   Metin değişmez; anlatım 373 kr (bütçe 330–375 içinde). İsteğe bağlı: "Gerçek kırk beş yıl…" → "Ama gerçek kırk beş yıl…"
   bağlacı akışı iyileştirir ama 377 kr eder; yaparsan başka yerden 2+ kr kısalt ("3 Kasım 1957'de Sputnik 2 ile
   yörüngeye çıktı" → "3 Kasım 1957'de yörüngeye çıktı" −13 kr, Sputnik 2 başlıkta/kapakta değil ama açıklamada var).

### 01-laika-sputnik-2 — Tur 2 (yazar)
- Metin değişmedi (373 kr; isteğe bağlı "Ama gerçek…" eklenmedi, bütçe).
- **Sahne 0 / kapak:** kabin 100 px yukarı (gövde y≈230–1010, antenler y≈90'a kadar), Dünya kenarı y≈1330'dan (R 2200):
  koyu okyanus, düzensiz kıyılı kıtalar yavaşça kayar, ince soğuk atmosfer halkası + hale. Köpek başı yeniden çizildi:
  burun ~%25 kısa, alın yuvarlak, kulaklar ayrık ve hafif yana, boynunda koşum kayışı + küçük altın toka. Kapak focus
  [540, 660] zoom 1.0 (önerilen [540,900]/1.15 denendi: kubbe kapak yazısının karartma bandına giriyordu; zoom < 1
  kadraj kenarlarını açığa çıkarıyordu). Kapakta kubbe ve lomboz tam, alt kenarda Dünya kenarı + atmosfer çizgisi;
  antenler yazı bandının karartmasında silik.
- **Dünya (sahne 5–7):** ortak `earthDisc`: koyu okyanus (paperDark + blue + inkSoft), `landmass` ile düzensiz kıyılı
  kıtalar, bulut çizgileri, `BTL.glow` atmosfer halesi + ince mavi halka; globe'da gece tarafı. Sahne 6: Dünya büyük ve
  aşağıda (merkez y 1360, R 400), tek belirgin eğik yörünge (−35°), eski turlar çok soluk (0,12), yörüngenin arka yarısı
  diskin arkasında kalıyor; kapsül r 12 + hale 90; "mezar"da 0,8 sn'de altından `inkSoft` griye döner, hale küçülür.
  Sayaç y 570 / "yörüngede" y 640. Sahne 7: iz çapraz kayıp atmosfere (kenarın 18 px üstü) değiyor, orada parlıyor,
  atmosfer çizgisi bir an altın yanıyor, sonra sönüyor.
- **Boş alt yarılar:** sahne 2: geniş beton platform (perspektif derzler, alev çukuru) y 1040–1350, altında bozkır ve
  ot öbekleri y 1380–1900, iki kafes servis kulesi dışa açılıyor (eski kollar kalktı), duman platform ve bozkır boyunca
  y≈1050–1600'e yayılıyor (soluk, 0,09). Sahne 3: osiloskop bir kontrol panelinin içinde (panel y 560–1760); altyazı
  şeridi düz panel yüzeyi; altında sayaç penceresi (y 1345–1480), iki döner düğme ve yavaşça salınan iğneli kadran.
- lint OK (SEO 100/100); preview ~27–28 sn tahmin, 8 sahne, 373 kr, cue'lar eşleşti. Hareket: 0,2 (kapak kancası) /
  2,5 / 10,9 / 8,9 / 8,5 / 5,9 / 4,1 / 2,4.
- Bilinen: sahne 0 STATIC? (kapak kancası, kural gereği). Sahne 6 ve 7'de altyazı Dünya diskinin üstünde (kontrast
  yeterli, okunuyor). Sahne 3'te ikinci altyazı satırı sayaç penceresinin hemen üstünde, binmiyor.

### 01-laika-sputnik-2 — Eleştirmen — Tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 7 | 7 | 8 | 8 | 8 | 9 | 8 | 7 |

lint OK (SEO 100/100); preview yeniden çalıştırıldı: 8 sahne, ~28 sn, 373 kr, cue'lar eşleşti; motion 0,2 (kapak kancası)
/ 2,5 / 10,9 / 8,9 / 8,5 / 5,9 / 4,1 / 2,4. Ek kareler `--times 2.6,11.8,22.8,26.5`. Tur 1'in sorunlarının çoğu giderildi:
köpek artık köpek (kısa burun, yuvarlak alın, tasma + altın toka), Dünya sahne 5–7'de Dünya gibi okunuyor (koyu okyanus,
düzensiz kıtalar, atmosfer halesi), sahne 2 (platform + bozkır + duman) ve sahne 3 (kontrol paneli) alt yarıları dolu.
Metin/doğruluk değişmedi (tur 1'deki gibi doğru). **Geçmedi: Kapak+SEO 7 (< 8).**

1. **Kapak + ilk 2 saniye: Dünya yine sadece en altta ince bir yay (y ≈ 1820–1920, kıta yok).** Yazarın "Dünya kenarı
   y≈1330" notu sadece kapak bloğu çekildikten sonraki kare için doğru (t=2.6'da kenar y≈1350, kıtalar görünüyor). Kapak
   bloğu varken (`focus` [540,660], zoom 1.0) sahne ~500 px aşağı kayıyor: kabin y≈720–1500, antenler kararmada kayboluyor,
   y 1500–1820 boş yıldız; küçük ekranda "kavanozdaki köpek" gibi, "uzay" bağlamı zayıf. Kancanın ilk karesi de bu.
   Düzeltme: `window` modunda kabini %85'e küçült (gövde ≈ 660 px yükseklik) ve kapak `focus`'unu [540, 520–560]'a çek ki
   kayma ~250 px'te kalsın → Dünya kenarı kapakta y ≈ 1550–1600'den başlasın, kıtalar ve atmosfer halesi görünsün,
   antenler yazı bandının altında (y > 560) kalsın. Hedef: kapakta yazı (y 190–480) / kabin (≈ 620–1450) / Dünya
   (≈ 1560–1920) üç net bant. Metin değişmez (0 kr).
2. **Sahne 6 ("mezar"): yörünge elipsi diskin iki yanından dışarı taşıyor → hâlâ halkalı gezegen (Satürn) hissi;
   altyazı açık kıtaların üstünde.** Ayrıca kapsül bazı anlarda diskin sol altından y ≈ 1650–1750'ye iniyor (YouTube
   arayüzü bölgesi, sheet satır 3 ilk kare). Düzeltme: elipsi daha az eğik ve diske yakın çiz (yarı eksenler ≈ R+50 /
   0,3R, eğim −20°), arka yarı gizli kalsın; kapsülün görünür yolunu y < 1450 ile sınırla (ön yarıda dolaşsın).
   Altyazı şeridinde (y 1170–1320) kıta çizme ya da Dünya merkezini y ≈ 1480'e indirip üst kenarı y ≈ 1070'e getir ki
   altyazı koyu okyanus/atmosfer üstüne düşsün.
3. **Sahne 3: sayaç kutusu altyazının hemen altında, sıkışık.** "yaşadığını" satırının altı y ≈ 1340, "N. gün" kutusunun
   üstü y ≈ 1356 (16 px), kutunun altı y ≈ 1495 (arayüz sınırı). Düzeltme: osiloskobu ~120 px yukarı al (merkez y ≈ 740,
   alt kenar ≈ 1010) ve sayaç kutusunu osiloskobun hemen altına, y ≈ 1030–1150'ye taşı (altyazının üstünde); düğmeler/kadran
   y ≈ 1380–1480'de kalabilir. Metin değişmez.

### 01-laika-sputnik-2 — Tur 3 (yazar)
- Metin değişmedi (373 kr).
- **Kapak / ilk 2 sn:** `window` modunda kabin %80'e küçüldü (480 çevresinde) ve Dünya kenarı y 1000'e çıktı
  (`dark` modu, sahne 5, eski düzende). Kapak focus [540, 600] zoom 1.0 → kapakta yazı y≈190–480, antenler y≈720'den,
  kabin ≈830–1460, Dünya ≈1550–1920 (kıtalar + atmosfer çizgisi). Önerilen [540,540] da denendi (antenler net, Dünya
  1600'den); [540,670]'te antenler yazı bandının karartmasında kayboluyordu. Kapak hook karesi (sahne 0 başı) aynı düzen.
- **Sahne 6:** Dünya merkezi y 1440, R 380; yörünge yarı eksenleri 430/115 (≈R+50 / 0,3R), eğim −20°, yörünge merkezi
  y 1300 → kapsül yolu y≈1150–1450; arka yarı diskin arkasında. Bu sahnenin kıtaları −0,3R'nin altında: altyazı şeridinde
  (1170–1320) açık kıta yok, sadece koyu okyanus; bulut çizgileri de şeridin altında.
- **Sahne 3:** osiloskop merkezi y 740 (panel y 440–1760, "Resmî açıklama" y 380); sayaç kutusu y 1030–1150 (altyazının
  üstünde); düğmeler y 1450, kadran y 1500 (altyazının altında).
- lint OK (SEO 100/100); preview ~27–28 sn, 8 sahne, 373 kr, cue'lar eşleşti. Hareket: 0,1 (kapak kancası) / 2,5 / 11,0 /
  8,5 / 8,5 / 5,8 / 3,9 / 2,4.
- Bilinen: sahne 0 STATIC? (kapak kancası). Sahne 6'da yörünge diske yakın olduğundan kapsül turun bir kısmında diskin
  arkasında gizli; ön yarıda disk üstünde görünür. Sahne 6 ve 7'de altyazı koyu okyanus üstünde.

### 01-laika-sputnik-2 — Eleştirmen — Tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 8 | 8 | 8 | 9 | 8 | 8 |

lint OK (SEO 100/100); preview yeniden: 8 sahne, ~28 sn, 373 kr, cue'lar eşleşti; motion 0,1 (kapak kancası, kural gereği)
/ 2,5 / 11,0 / 8,5 / 8,5 / 5,8 / 3,9 / 2,4. Ek kareler `--times 1.0,11.8,20.5,22.8`. **Tüm kriterler ≥ 7, kapak 8 → geçti.**
Kapak ve ilk 2 sn artık üç net bant: yazı (y 190–480) / antenli kabin + lombozda tasmalı köpek (≈ 720–1460) / kıtalı
Dünya kenarı (≈ 1550–1920); telefonda "uzaydaki köpek, dönüşü yok" tek bakışta okunuyor. Sahne 3'te sayaç kutusu
altyazının üstünde (y ≈ 1030–1150), çakışma yok. Sahne 6'da altyazı koyu okyanus üstünde, kapsül yolu y < 1470.
Kalan küçük sorunlar (yayını engellemez):
1. Sahne 6: yörünge elipsi diskin iki yanından ~40–60 px taşıyor; 360 px'te hâlâ hafif "halkalı gezegen" izi. İstenirse
   yarı ekseni R+20'ye indir ya da diskin dışındaki parçaları %50 soluklaştır.
2. Sahne 6: "mezar"daki altın → gri soğuma küçük kapsülde zor seçiliyor (t=22.8'de ışık hâlâ altın görünüyor); soğumayı cue'dan
   hemen sonra başlat ve hale yarıçapını belirgin küçült.
3. Sahne 7: altyazının ilk satırı Dünya'nın atmosfer çizgisini kesiyor (y ≈ 1210); okunuyor, ama Dünya kenarı ~60 px
   aşağı (y ≈ 1270) alınırsa yazı tamamen karanlık uzayda kalır.

### Yönetmen — son kapı
- 3 tur sonunda tüm kriterler ≥ 7, kapak 8 → geçti. Konu iki kanalın geçmişinden farklı (uzay/1957; son DB videoları Atahualpa, Vaka-i Hayriye).
- lint OK (SEO 100/100), 373 karakter (ElevenLabs uyarısı → alt uç). cover.jpg ve sheet.png yönetmen tarafından gözle incelendi: sol üst boş, taşan yazı yok, tek özne, kapakta üç net bant (yazı / antenli kabin + köpek / Dünya kenarı).
