# Daily batch 2026-11-21 — Düşün Bakalım

- Plan: 1 Shorts (`01-<slug>.json`, 19:00 İstanbul). Uzun video yok (sıradaki: 2026-11-22).
- ElevenLabs: bu ay 5.770 karakter kullanıldı, uyarı yok.
- Dünkü 4 senaryonun hepsinin `*.youtube.json`'u var (yüklenmiş).
- API kontrolü (`api-check.yml`) başlatıldı.

## Manşet

- `tools/news.py --channel db` bulut ağından çalışmadı (proxy 403, Google News engelli). Web taramasında havuza uyan
  Türkiye manşeti bulunamadı.
- Yerine güncel haber + yıl dönümü: **Euronews, 17 Kasım 2026 — "'Everest of diving': Underwater adventures in Kea
  exploring Titanic's sister ship Britannic"** (https://www.euronews.com/2026/11/17/everest-of-diving-underwater-adventures-in-kea-exploring-titanics-sister-ship-britannic).
  Bugün, 21 Kasım 2026, Britannic'in Ege'de batışının **110. yıl dönümü**.

# 01 — Britannic: Titanik'in Ege'de batan kardeşi (Shorts)

- **Dosya:** `videos/2026-11-21/01-britannic.json` · `publish_at` 2026-11-21T19:00:00+03:00
- **Havuz:** felaketler ve kazalar (plan önerisi)
- **Geçmiş kontrolü:** Titanik uzun video olarak işlendi (2026-10-15), Britannic iki kanalda da işlenmedi.
  `youtube.related` → `videos/2026-10-15/10-titanik-neden-batti.json` (aynı ailenin hikâyesi).
- **İzleyici sonunda ne hisseder:** batmaz denen ailenin bir gemisinin daha bu kez bizim denizimizde, bir saatten kısa
  sürede kaybolduğu ürpertisi ve iki batıştan da sağ çıkan tek bir kadının tuhaf kaderi.
- **Kanca:** "Titanik'in kardeşi Ege'de battı." (en çarpıcı iddia, tarih ikinci cümlede)
- **Kapak fikri:** derin zemin, koyu su yüzeyinde başı suya gömülmüş, kıçı ve pervaneleri havada büyük gemi silueti
  (dört baca, beyaz gövde, yeşil şerit, kırmızı haç), ışık havuzunda. Yazı "TİTANİK'İN KARDEŞİ / BATTI"
  (vurgu: kardeşi). Adaylar: (A) eğik gemi "Titanik'in kardeşi battı" · (B) aynı kare "Ege'de battı" ·
  (C) su altında yan yatmış batık "Hâlâ orada".
- **Tema:** `derin` (deniz, soğuk mavi-siyah). Bir önceki Düşün Bakalım videosu `grafit`, ondan önceki `obsidyen`.

## Anlatım (son hali, tur 1 sonrası — 420 karakter)

Titanik'in kardeşi Ege'de battı. 1916'da Britannic hastane gemisiydi. Kea açığında mayına çarptı. Ama koğuşlar
havalansın diye lombozlar açıktı. Su hızla doldu. Kaptan gemiyi kıyıya oturtmak istedi. Ama pervaneler hâlâ
dönüyordu. Erken inen iki filika onlara çekildi. Gemi elli beş dakikada kayboldu. Kurtulanlardan biri bir
hemşireydi: Violet Jessop. Titanik'ten de sağ çıkmıştı. Böyle sessiz hikâyeler için abone olun.

("-yor": 1/14 cümle, devrik cümle yok. "hemşireydi:" iki nokta, altyazıda "Violet Jessop"un ayrı satırda bütün
kalması için; önceki sürümde ad iki altyazı parçasına bölünüyordu.)

## Çekim listesi (son hali; dikey 1080×1920; sahneler `scenes/studio/shots/bt_britannic.js`)

| # | Cümle | Tip | Visual (kısa) | Cue | Kamera |
|---|---|---|---|---|---|
| 0 | Titanik'in kardeşi Ege'de battı. | `bt_britannic_sink` (hook) | Sabah, sakin deniz; başı suya gömülmüş dört bacalı beyaz gemi, yeşil şerit + kırmızı haç, kıç ve dönen pervaneler havada | battı | yavaş itme |
| 1 | 1916'da Britannic hastane gemisiydi. | `bt_britannic_ship` | Tam profil gemi, üç bacadan duman (4. sahte), altın "1916"; "hastane"de yeşil şerit kendini çizer, haçlar parlar | hastane | yavaş itme |
| 2 | Kea açığında mayına çarptı. | `bt_britannic_mine` | Su çizgisinde bölünmüş kare: üstte gemi, altta zincirli dikenli mayın; gövde üstüne kayar, çakma, kabarcık, pruvada yarık | mayına | yavaş itme |
| 3 | Ama koğuşlar havalansın diye lombozlar açıktı. Su hızla doldu. | `bt_britannic_portholes` | Yakın plan beyaz sac, yeşil şerit, 4 pirinç lomboz; kapaklar açılır, deniz yükselir ve içeri akar | açıktı | yakın plan (çizimde) |
| 4 | Kaptan gemiyi kıyıya oturtmak istedi. | `bt_britannic_map` | Sunion ucu + Kea; rota, kırmızı çarpı (mayın); altın kesikli çizgi Kea kıyısına, gemi işareti yarı yolda durur, halka | kıyıya | yavaş itme |
| 5 | Ama pervaneler hâlâ dönüyordu. Erken inen iki filika onlara çekildi. | `bt_britannic_prop` | Yükselmiş kıç yakın plan, yarısı sudan çıkmış dönen bronz pervane, girdap; iki filika girdaba sürüklenir | filika | yakın plan (çizimde) |
| 6 | Gemi elli beş dakikada kayboldu. | `bt_britannic_sink` (gone) | Dikleşmiş kıç suya kayar, altın "55 dakika", halkalar | kayboldu | yavaş itme |
| 7 | Kurtulanlardan biri bir hemşireydi: Violet Jessop. | `bt_britannic_nurse` | Filikada beyaz hemşire örtülü tek yüzsüz kadın; "hemşire"de önlükte kırmızı haç | hemşire | yavaş itme |
| 8 | Titanik'ten de sağ çıkmıştı. | `bt_britannic_two` | Üstte Titanik 1912 (koyu gövde), altta Britannic 1916; Britannic'te altın ışık, "sağ"da Titanik'te de yanar, noktalı altın çizgi | sağ | sabit |
| 9 | Böyle sessiz hikâyeler için abone olun. | `bt_britannic_wreck` | Su altı, dipte bacasız batık, soluk haçlar, "120 m", kabarcıklar | — | yavaş itme |

9 farklı tip (sink ×2, üst üste değil), lint hatasız, SEO 100/100.

## Kapak

Adaylar (`preview.py` ile üretildi, yan yana karşılaştırıldı):
- **A (seçildi):** sahne 0, t 2.4 — "TİTANİK'İN / KARDEŞİ BATTI" (vurgu: kardeşi). Batan geminin tamamı okunuyor
  (bacalar, haç, havadaki pervaneler); ilk cümleyle aynı fikir, küçükken de net.
- B: sahne 6, t 0.6 — "EGE'DE / BATTI": gemi küçük, arkada soluk "55 dakika" kapakla yarışıyor.
- C: sahne 5, t 3.6 — "PERVANELER / DÖNÜYORDU": güçlü görüntü ama gemi/Titanik bağı yok, merak zayıf.
- D: A + `focus` [560, 820] zoom 1.3: bacalar ve kıç kadraj dışına taşıyor.

## Doğrulama notları

- Wikipedia (HMHS Britannic): 21 Kasım 1916, 08:12'de patlama, 09:07'de battı (55 dk); Kea kanalı; mayınları
  21 Ekim 1916'da SM U-73 (Gustav Sieß) döşedi; hemşireler havalandırma için lombozları açmıştı; Kaptan Bartlett
  gemiyi Kea'da karaya oturtmak için döndü; Üçüncü Zabit Laws'ın izinsiz indirdiği iki filika dönen pervanelere
  çekildi; 1.066 kişiden 30'u öldü; batık ~120 m'de sancak tarafına yatık; hastane gemisi: beyaz, yeşil yatay şerit,
  kırmızı haçlar; dört baca.
- Euronews (17 Kasım 2026): ~120 m, 55 dakika, ~30 ölü (erken indirilen filikalar ve çalışan makineler).
- Wikipedia (Violet Jessop): Birinci Dünya Savaşı'nda VAD hemşiresi; Britannic batarken filikası pervanelere
  yaklaşınca atladı, başından yaralandı ve kurtuldu; 1912'de Titanik'ten Carpathia ile kurtarıldı.
- Metinden çıkarılanlar / dikkat: "Titanik'ten büyük" iddiası (doğrulamadım) açıklamaya yazılmadı; "dördüncü baca
  sahte" sadece çizimde (smoke yok), metinde yok; Euronews "~1.300 kurtarıldı" diyor, Wikipedia 1.036 — sayı
  metinde kullanılmadı.

## Kaynaklar (JSON `sources`, açılıp doğrulandı)

- https://en.wikipedia.org/wiki/HMHS_Britannic
- https://www.euronews.com/2026/11/17/everest-of-diving-underwater-adventures-in-kea-exploring-titanics-sister-ship-britannic
- https://en.wikipedia.org/wiki/Violet_Jessop

## Eleştiri günlüğü

### 01-britannic — tur 1 (eleştirmen)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 9 | 7 | 7 | 7 | 8 | 8 | 8 | 7 | 7 |
1. Kapak/sahne 0: kapak yazısı başlığı tekrar ediyor; gemi ışık havuzunda değil, sağdan taşıyor, eğim ~20°, kıç ve pervaneler okunmuyor, alt ~800 px boş su; hareket 0,7. → Başlığı değiştir, gemiyi 30–35° eğ, kıç/pervaneler kadrajda, gövde y≈850–1050, `BTL.glow`, batış + pervane + köpük görünür.
2. Senaryo telgraf gibi, bağlaç yok; lombozların neden açık olduğu (hemşireler havalandırmak için açmıştı) anlatılmıyor. → "Ama lombozlar açıktı…", "Ama pervaneler hâlâ dönüyordu…" gibi bağla; ≤ 420.
3. Sahne 4 harita: mayın X'i yok, durma noktası Kea kıyısına değiyor, Attika kesik, alt yarı boş. Ayrıca sahne 1/2/8'de gemiler su çizgisinin üstünde oyuncak gibi; sahne 5'te iki kırmızı dikdörtgen kırık parça gibi; sahne 9 batık sancak tarafına yatık olmalı.
Doğruluk: tüm bilgiler doğrulandı (Wikipedia, Euronews); kaynaklar gerçek.

### 01-britannic — tur 1 düzeltmeleri (yazar)
1. **Başlık / kapak:** kapak ve ilk cümle aynı kaldı ("TİTANİK'İN KARDEŞİ BATTI"), başlık değişti:
   "Britannic: Hastane Gemisi Neden 55 Dakikada Kayboldu?" (53 kr), açıklama uyumlandı. Sahne 0 yeniden kuruldu:
   gemi 28° eğik (32°'de kıç kapak yazısının altındaki koyu geçişe (#covershade, y ≈ 0–960) giriyordu; 28° kıçı
   ve pervaneleri bu bölgenin altında tutuyor), dört baca da görünür, kıç + büyütülmüş pervaneler sudan açıkça
   çıkmış, gövde kapakta y ≈ 950–1440, arkasında `BTL.glow` ışık havuzu, ön direk kaldırıldı (sağdan taşıyordu),
   köpük sola akıyor (sağdan taşmıyor), su çizgisi aşağı indi (alttaki boş su 740 → 470 px), suda ışık pırıltıları.
   Batış hızlandı (hook ×0,35 oynatıyor): preview hareketi 0,8 → 1,7.
2. **Senaryo bağlandı:** "Ama koğuşlar havalansın diye lombozlar açıktı.", "Kaptan … istedi. / Ama pervaneler hâlâ
   dönüyordu.", "1916'da Britannic hastane gemisiydi.", "Kurtulanlardan biri bir hemşireydi: Violet Jessop.
   / Titanik'ten de sağ çıkmıştı." 420 karakter.
3. **Harita:** Attika'nın Sunion ucu tam kadrajda, harita y ≈ 300–1100; kırmızı X rotanın kırıldığı noktada (opaklık
   hatası düzeltildi, artık görünüyor); gemi işareti X ile Kea kıyısının tam ortasında durur, halka orada.
   **Sahne 1/2/8:** gemiler suya oturdu (su çizgisi gövde yüksekliğinin ~1/3'ünde; sahne 8'de gövde altı clipPath
   ile kesiliyor). **Sahne 5:** kırmızı şaft yatağı kaldırıldı, tek net dümen (kıç bodoslamasına bağlı) + ince şaft.
   **Sahne 9:** batık sancak tarafına yatık: iskele gövdesi yukarı (kırmızı karina, soluk şerit/haçlar, lombozlar),
   güverte izleyiciye dönük, bacaların yerinde koyu açıklıklar, sancak kenarı kuma gömülü.
   **Hemşire:** omuzlarına battaniye sarıldı, kollar gizli (kürek çeker gibi görünmüyor), önlük ve kırmızı haç üstte.
- Lint hatasız, SEO 100/100. Preview hareketi: 0: 1,7 · 1: 2,6 · 2: 6,4 · 3: 28,4 · 4: 2,9 · 5: 6,8 · 6: 4,2 ·
  7: 1,5 · 8: 4,1 · 9: 1,6.

### 01-britannic — tur 2 (eleştirmen)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 9 | 7 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |
Geçti (tümü ≥ 7, kapak 8). Kalan: 1. Sahne 7 hemşire figürü yamuk kutu gibi → oturan insan silueti + başörtü/önlük. 2. Sahne 1 gövde fazla gömülü, haçlar/yeşil şerit telefonda seçilmiyor; "1916" arkasında hayalet dikdörtgenler. 3. Sahne 9 batık ters kayık gibi, alt %45 boş → baca yuvaları halka, gövde büyük, dip y≈1400. (Küçük: sahne 5 filikalar küçük.)

### 01-britannic — tur 2 düzeltmeleri (yazar)
(Metne ve kapağa dokunulmadı; sadece `bt_britannic.js` + sahne `visual` metinleri.)
1. **Sahne 7 hemşire:** kutu gibi pelerin kaldırıldı; kendi çizilen yandan oturan siluet: iki bacak (uyluk + diz +
   baldır), elleri kucakta, boyun/omuz, omuzlara inen beyaz başörtü, beyaz önlük (etek + göğüslük), göğüslükte
   küçük kırmızı haç ("hemşire"de belirir). Kürek artık filika boyunca yatık, kürek çekme pozu yok.
2. **Sahne 1:** yakın orta plan (K 1,8): gövde su çizgisinden 90 px görünür; haçlar 72 px ve kadraj içinde
   (x ≈ 150 / 930), yeşil şerit 11 px. "1916" arkasındaki "hayalet dikdörtgen": sahne 1 karelerinde yok; preview'da
   sahne 1'in son anında görülen soluk şekil, bir sonraki sahnenin (mayın: üstte gemi, y ≈ 380–560) dissolve
   geçişinin başlangıcı. Motorun otomatik geçişi, sahne kodu değil.
3. **Sahne 9 batık:** gövde büyütüldü ve y ≈ 900–1150 bandını dolduruyor; baca yuvaları güverte boyunca ince açık
   halkalı koyu açıklıklar; deniz dibi gövdenin altında y ≈ 1150, altında kum dalgası çizgileri ve kayalar ≈ 1430'a dek.
- Lint hatasız, SEO 100/100. Preview hareketi: 0: 1,7 · 1: 3,9 · 2: 6,4 · 3: 28,4 · 4: 2,9 · 5: 6,8 · 6: 4,2 ·
  7: 1,5 · 8: 4,1 · 9: 2,0.

