# Daily batch 2026-11-23 — Düşün Bakalım

- Plan: 1 Shorts (`01-<slug>.json`, 19:00 İstanbul). Uzun video yok (sıradaki: 2026-11-24).
- ElevenLabs: bu ay 12.114 karakter kullanıldı (bütçe 231.442; yenilenme 2026-12-20), uyarı yok.
- 2026-11-22 klasörü yok: dün iki kanal için de üretim yapılmamış. 2026-11-21'in bütün senaryolarının `*.youtube.json`'u var.
- API kontrolü (`api-check.yml`) başlatıldı.

## Manşet

- `tools/news.py --channel db` bulut ağından çalışmadı (proxy 403, Google News engelli). Web aramasıyla Türkiye manşetleri tarandı.
- Seçilen: **Sputnik Türkiye, 18.11.2026 — "Türk tarihini değiştirecek keşif: Bilge Kağan'ın kayıp sarayı bulunmuş olabilir"**
  (https://anlatilaninotesi.com.tr/20261118/turk-tarihini-degistirecek-kesif-bilge-kaganin-kayip-sarayi-bulunmus-olabilir-1110422463.html).
  Haberin arkasındaki kalıcı tarih: Orhun Yazıtları ve Bilge Kağan'ın taşa kazınmış uyarısı.

# 01 — Orhun Yazıtları: Bilge Kağan'ın taştaki uyarısı (Shorts)

- **Havuz:** imparatorlukların yükselişi ve çöküşü (plan önerisi) + Türkiye/Türk tarihi
- **Geçmiş kontrolü:** Göktürk / Orhun / Bilge Kağan iki kanalda da işlenmedi.
- **İzleyici sonunda ne hisseder:** bir hükümdarın halkına bıraktığı uyarının taşta kaldığı, imparatorluğun yine de
  yıkıldığı ve taşın bugün hâlâ bozkırda durduğu ürpertisi.
- **Kanca:** "Bu taş bir imparatorluğun son uyarısı."
- **Kapak fikri:** bozkırda tek dikili yazıt taşı, üstünde soluk runik satırlar, ışık havuzunda. Yazı
  "TAŞTAKİ / SON UYARI" (vurgu: uyarı). Adaylar: (A) dikili taş · (B) taşta yazı yakın plan, tek satır parlıyor ·
  (C) ipek kumaş + taş.
- **Tema:** `kum` (bozkır, taş, ticaret yolu). Bir önceki Düşün Bakalım videosu `derin`.

## Anlatım (son — yazar, eleştiri turu 1 sonrası; 418 karakter, -yor 2/12)

Bu taş bir imparatorluğun uyarısı. Orhun Vadisi'nde duruyor. Geçenlerde Bilge Kağan'ın kayıp sarayı uydudan
seçilmiş olabilir. Taştaki yazı bin yılı aşkın okunamadı. Kağan taşa şunu yazdırmıştı. Çin'in sözü tatlı, ipeği
yumuşak. Atalar o ipeğe kandı ve elli yıl boyun eğdi. Kağan 734'te zehirlendi. On yıl sonra imparatorluk çöktü.
Uyarı taşta kaldı. Taş on üç asırdır bekliyor. Böyle sessiz hikâyeler için abone olun.

Tur 1 düzeltmeleri: "Taş hâlâ ayakta" → "Taş on üç asırdır bekliyor" (Bilge Kağan taşı kırık bulundu; 735 → 2026 ≈ 1.291
yıl); "Bu ay" → "Geçenlerde Bilge Kağan'ın" (tarihsiz); "On yıl geçmeden" → "On yıl sonra"; karakter için
"Moğolistan'da," anlatımdan çıktı (haritada yazıyor), sahne 4 "Kağan taşa şunu yazdırmıştı".

Taslaktan değişenler: "son uyarı" → "uyarı" (Bilge Kağan yazıtı en son dikilen büyük yazıttır ama "son uyarı"
iddiası abartılı); "bulunmuş olabilir" → "uydudan seçilmiş olabilir" (haber kazı değil, uydu görüntüsü yorumu);
"esir düştü" → "boyun eğdi" (yazıt: beyler Çin unvanı aldı, halk elli yıl hizmet etti); "Taş dikildiğinde kağan
zehirlenmişti" → "Kağan 734'te zehirlendi" (Kül Tigin taşı 732'de, kağan sağken dikildi); "On yıl sonra … yine
yıkıldı" → "On yıl geçmeden … çöktü" (734 → 744).

## Çekim listesi (son; dikey 1080×1920; tipler `scenes/studio/shots/bt_orhun.js`)

| # | Cümle | Tip | Visual | Cue |
|---|---|---|---|---|
| 0 | Bu taş bir imparatorluğun uyarısı. | `bt_orhun_stele` hook | Büyük plan: taş kaplumbağa kaidesi üstünde yazıt taşı, runik sütunlar; bir sütun yukarıdan aşağı altınla yeniden yazılır, "uyarı"da çevresinde altın hale ve büyüyen ışık, bulutlar kayar | uyarı |
| 1 | Orhun Vadisi'nde duruyor. | `bt_orhun_map` | Orhun vadisine yakın plan, tüm kadraj: ırmak ve vadi tabanı yukarı sağa çizilir, taralı tepe işaretleri kadrajın altına kadar iner; yazıtların yeri kadraj ortasında (y ≈ 700), "Orhun Vadisi" etiketi ilk karede tam koyu, altın nokta "Vadisi"de; sağda, ırmağın altında küçük Moğolistan haritası (altın çerçeve) + koyu "Moğolistan" | Vadisi |
| 2 | Geçenlerde Bilge Kağan'ın kayıp sarayı uydudan seçilmiş olabilir. | `bt_orhun_sat` | Yukarıdan uydu görüntüsü, tam kadraj; üstte "Hotont", köşe işaretli tarama çerçevesi y 300–1150, inen tarama çizgisi; "saray"da büyük altın iç içe sur izleri + höyük çizilir ve kamera onlara yavaşça yaklaşır; altta arazi devam eder (ikinci dere, koyu doku, tarla şeritleri) | saray |
| 3 | Taştaki yazı bin yılı aşkın okunamadı. | `bt_orhun_runes` | Taş yüzü yakın plan, tüm kadraj: çizgili altı sütunda büyük runik harfler y 150–1150 arası oyulur, sütunlar altyazının altında soluk ve aşınmış olarak sürer; ışık taşta gezinir; "okunamadı"da harfler aşınmış griye döner | okunamadı |
| 4 | Kağan taşa şunu yazdırmıştı. | `bt_orhun_khagan` | Keçe otağ önünde alçak tahtta oturan yüzsüz kağan silueti, tuğ, otağdan duman; ışık ısınır | Kağan |
| 5 | Çin'in sözü tatlı, ipeği yumuşak. | `bt_orhun_silk` | Çubuğa sarılı ipek topu; kumaş dikey kıvrımlarla aşağı sarkar, dokuma baklava şeridi ve saçak, altında gölge, yavaş salınır; parıltı aşağı kayar | ipeği |
| 6 | Atalar o ipeğe kandı ve elli yıl boyun eğdi. | `bt_orhun_years` | Beşli çentikler kazınır, sayı 0 → 50, "yıl" | elli |
| 7 | Kağan 734'te zehirlendi. | `bt_orhun_cup` | Tek kâse yakın plan, kadraj ortasında; ince ahşap kenar + gölge, buhar; içki koyulaşır, yüzeyde halkalar yayılır, buhar kesilir, ışık havuzu daralır | zehir |
| 8 | On yıl sonra imparatorluk çöktü. | `bt_orhun_camp` | Alacakaranlıkta beş otağ; sahnenin ilk yarısından itibaren dumanları tek tek kesilir, otağlar soluklaşır, "çöktü"de sonuncusu söner | çöktü |
| 9 | Uyarı taşta kaldı. Taş on üç asırdır bekliyor. | `bt_orhun_stele` end | Aynı taş, arkasında alçak güneş batar, uzun gölge | asır |
| 10 | Böyle sessiz hikâyeler için abone olun. | `bt_orhun_stele` far | Geniş plan: uçsuz bozkırda küçük tek taş, güneş ufka iner | — |

Tip çeşitliliği: 9 farklı tip, 11 sahne; en sık tip (`bt_orhun_stele`) 3/11, üst üste en fazla 2. Fotoğraf
kullanılmadı (`tools/media.py` bulut ağından engelli: proxy 403).

## Doğrulama notları

- **Dikilme yılları:** Kül Tigin yazıtı 732, Bilge Kağan yazıtı 735 (Britannica "Orhon inscriptions"). Kül Tigin 731'de,
  Bilge Kağan 734'te öldü. Metinleri Bilge Kağan'ın yeğeni/oğlu Yollug Tigin yazdı (Wikipedia). Taşlar kaplumbağa
  biçimli taş kaideler üzerine dikilmişti (Wikipedia). 1889'da Yadrintsev keşfetti.
- **Zehirlenme:** Bilge Kağan 734'te Buyruk Çor tarafından zehirlendi, hemen ölmedi; 25 Kasım 734'te öldü
  (Wikipedia, Bilge Qaghan). Metinde sadece "734'te zehirlendi".
- **"Sözü tatlı, ipeği yumuşak":** Kül Tigin yazıtında "süçig sabın yımşak agın" (tatlı sözleri ve yumuşak ipekleriyle
  Çin halkı uzaktaki halkları yaklaştırır) geçiyor; aynı pasajın Bilge Kağan yazıtında da tekrarlandığı yaygın kabul (yüz/satır
  numarası web'de doğrulanamadı; metin bu yüzden yazıt adı vermiyor, "taşa yazdırmıştı" diyor). Wikipedia aynı fikri "altın, gümüş, ipek veren Çinliler hep yaltaklanan sözler
  kullandı" diye özetliyor.
- **Elli yıl:** Kül Tigin yazıtı doğu yüzü 7–8: Türk beyleri Çin unvanları aldı ve Çin imparatoruna "elli yıl" hizmet
  etti (Wikipedia; Türkçe çeviri "Elli yıl hizmet etmişler"). Metinde "boyun eğdi" (esir düşme değil).
- **Çözülme:** Vilhelm Thomsen 1893'te çözdü (Britannica, Wikipedia). Yazı 8. yüzyıldan 1893'e kadar okunamadı:
  "bin yılı aşkın" doğru.
- **Yıkılış:** İkinci Göktürk Kağanlığı 744'te Basmıl, Karluk ve Uygur ittifakıyla yıkıldı (Wikipedia, Second Turkic
  Khaganate). 734 → 744: "on yıl geçmeden".
- **Haber (Sputnik Türkiye, 18.11.2026):** Doç. Dr. Hayrettin İhsan Erkoç (ÇOMÜ) ve Prof. Dr. Gürhan Kirilen (Ankara Ü.),
  13. yüzyıl Kitan kökenli bir şairin şiirine düşülen nottan yola çıkıp Moğolistan'ın Hotont bölgesinde uydu
  görüntülerinde Bilge Kağan'ın saray şehri olabilecek yapı izleri belirledi. Kazı yok, tarihleme yok; kesinleşmesi için
  yüzey araştırması ve kazı gerekiyor. Bu yüzden metinde "uydudan seçilmiş olabilir", açıklamada "henüz kazıyla
  doğrulanmadı".
- Kullanılmayanlar: "Ey Türk milleti…" gibi modern uydurma alıntılar yok; "son uyarı" ve "esir" kaldırıldı.

## Kapak

Tur 1 sonrası üç yeni aday (`out/preview/01-orhun-yazitlari/cover-candidates.png`), hepsi "BU TAŞ / BİR UYARI"
(vurgu: uyarı; ilk cümleyle ortak kelime):
- A — sahne 0, t 2.3, odaksız: taş %12 büyük, ama altta hâlâ boş bozkır var.
- **B — sahne 0, t 2.3, `focus [540, 760]`, `zoom 1.18`: seçildi.** Taş ilk sürüme göre ≈ %40 büyük, altın sütun kalın
  ve ışık havuzunda parlıyor, başlık yazısının altından kaplumbağa kaidesine kadar kadrajı dolduruyor, boş bozkır şeridi
  ince. Not: kapak karesi aynı zamanda ilk 2 saniyenin kancası; kaplumbağa kaidesi orada y ≈ 1600–1730'a iniyor
  (YouTube arayüzü bölgesi). Kaide ikincil bir öğe, asıl özne (yazılı yüz) y 930–1580 arasında.
- C — sahne 9 (batan güneş): taş küçük, güneş ikinci odak.

## Eleştiri günlüğü

### Tur 1 (eleştirmen ajan)
Puanlar: Senaryo 7 · Kanca 8 · Okunabilirlik 8 · Görsel=anlatım 6 · Hareket 7 · Kompozisyon 6 · Tema 8 · Akış 7 ·
Doğruluk 7 · Kapanış 8 · Kapak+SEO 7 · Kapak 7.
En büyük 3 sorun: (1) kâse sahnesi: alt yarıda düz koyu masa bloğu, kâse küçük, hareket 0.9, "zehir" anında değişim yok;
(2) harita küçük + altı boş, "Orhun Vadisi" etiketi haritaya biniyor; ipek sahnesi tek şerit, kumaş gibi okunmuyor;
(3) kapakta taş küçük, alt yarı boş bozkır; "Taş hâlâ ayakta" riskli (Bilge Kağan taşı kırık bulundu), "Bu ay" eskir,
"kağanın" → "Bilge Kağan'ın", "On yıl geçmeden" → "On yıl sonra". Küçük: kamp sahnesinde sönüş görünmüyor.

### Tur 2 (eleştirmen ajan)
Puanlar: Senaryo 8 · Kanca 8 · Okunabilirlik 8 · Görsel=anlatım 7 · Hareket 7 · Kompozisyon 7 · Tema 8 · Akış 8 ·
Doğruluk 8 · Kapanış 8 · Kapak+SEO 8 · Kapak 8. Geçti.
Kalan (engel değil): (1) uydu sahnesinde sur izleri üst yarıda, alt kısım soluk; (2) Orhun haritasında odak üst üçte
birde, etiket ilk karede soluk; (3) runik sahnesinde harflerin altı boş + y≈1420–1500'de başıboş kavis çizgisi.

### Tur 3 (yazar, kompozisyon)
Tur 2'nin kalan 3 notu düzeltildi: uydu çerçevesi y 300–1150 + "saray"da yaklaşma, harita odağı kadraj ortasında ve
etiket ilk karede koyu, runik sütunlar kadrajı dolduruyor ve başıboş çizgi kaldırıldı, açılışta "uyarı" parıltısı güçlendi.
Metin ve kapak ayarı değişmedi. Yönetmen sheet.png ve cover.jpg'yi gördü; yeniden puanlama yapılmadı (tur 2 puanları geçerli).
