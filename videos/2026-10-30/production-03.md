# 03 — Mondros Mütarekesi (günlük Shorts, belgesel tarzı)

- **Dosya:** `03-mondros-mutarekesi.json` · yayın 2026-10-30 19:00 (İstanbul) · `related`:
  `videos/2026-10-27/02-cumhuriyetin-ilani-1923.json` (Mondros'tan Cumhuriyet'e uzanan yol).
- **Manşet:** `tools/news.py --channel db` bu ortamda çalışmadı (proxy 403, Google News'e erişim yok); web aramasında
  da uygun güncel bir kazı/keşif manşeti bulunamadı. Bu yüzden **yıl dönümü** seçildi: bugün, 30 Ekim, Mondros
  Mütarekesi'nin 108. yıl dönümü (Türk basınında her yıl bugün yer alan konu). Havuz: imparatorlukların yükselişi ve
  çöküşü + Türkiye/Osmanlı tarihi (plan.py'nin önerdiği kategori).
- **Tarz:** `"theme": "belgesel"`, tema **`grafit`** (gri-siyah, gümüş, soluk altın; savaş, modern tarih; bir önceki
  video `fildisi`), ses `mF7tIc9VLrznhGooGjaT`.
- **İzleyici sonunda ne hisseder:** "savaş bitti" diye imzalanan bir ateşkes, tek bir maddeyle bir ülkenin kapılarını
  açtı. Sessiz bir ürperti: kâğıt üstündeki küçük bir cümlenin ağırlığı.
- **Kanca:** "Bir imparatorluğun savaşı, bir düşman gemisinde bitti." Karanlık, durgun bir limanda tek bir zırhlı siluet.
- **Kapak:** "SAVAŞ BİR / GEMİDE BİTTİ" (`gemide` vurgu) + ışık havuzunda tek zırhlı silueti (sahne 0). `kasif: false`.

## Anlatım (tek parça, hedef 380–415 karakter; ElevenLabs uyarısı var → alt uç)

Bir imparatorluğun savaşı, bir düşman gemisinde bitti. 30 Ekim 1918. Mondros limanı, İngiliz zırhlısı Agamemnon. Heyet
dört gün pazarlık etti. Ama tehlike yedinci maddedeydi. Tehdit görülürse, her stratejik nokta işgal edilebilirdi.
Tehdidi gören İtilaf olacaktı. Günler içinde Musul gitti. İki hafta sonra donanma İstanbul'daydı. Ateşkes sanılan
kâğıt, kapının anahtarıydı. Böyle sessiz hikâyeler için abone olun.

## Çekim listesi (taslak; yazar iyileştirebilir)

| # | Cümle | Tip | Görüntü | Cue / kamera |
|---|---|---|---|---|
| 0 | Bir imparatorluğun savaşı, bir düşman gemisinde bitti. | yeni `bt_warship` | Gece, durgun liman suyu; tek zırhlı siluet (iki baca, top kuleleri), lomboz ışıkları, suda yavaş titrek yansıma | kapak + kanca karesi |
| 1 | 30 Ekim 1918. Mondros limanı, İngiliz zırhlısı Agamemnon. | `bt_map` | Ege; Limni adası, "Mondros" noktası yanıp söner, "30 Ekim 1918" | cue "Mondros" |
| 2 | Heyet dört gün pazarlık etti. | yeni `bt_cabin` | Gemi kamarası: lamba altında masa, karşılıklı iki yüzsüz siluet, aralarında kâğıt | yavaş itme |
| 3 | Ama tehlike yedinci maddedeydi. | yeni `bt_treaty` | Tek sayfa belge, satırlar ince çizgi; "Madde 7" satırı altınla belirir | cue "yedinci" |
| 4 | Tehdit görülürse, her stratejik nokta işgal edilebilirdi. | `bt_map` | Anadolu ve Boğazlar; noktalar tek tek yanar | cue "her" |
| 5 | Tehdidi gören İtilaf olacaktı. | `bt_text` | Tek kelime / kısa ifade ("KARARI ONLAR VERECEKTİ" değil; ≤ 5 kelime) | cue "İtilaf" |
| 6 | Günler içinde Musul gitti. | `bt_map` | Musul noktası, sönen ışık | cue "Musul" |
| 7 | İki hafta sonra donanma İstanbul'daydı. | yeni `bt_bosphorus` | İstanbul silueti (kubbe + minareler), önünde suda sıra sıra zırhlı siluetleri | cue "İstanbul" |
| 8 | Ateşkes sanılan kâğıt, kapının anahtarıydı. Böyle sessiz hikâyeler için abone olun. | yeni `bt_key` | Belge solar, yerinde ışık havuzunda tek eski anahtar | cue "anahtarıydı" |

(Aynı tip üst üste en fazla 2: `bt_map` 1, 4, 6 ayrık olmalı.)

## Kaynaklar (doğrulanmış)

1. Wikipedia (Wikiwand) — Armistice of Mudros: https://wikiwand.com/EN/Armistice_of_Mudros (30 Ekim 1918, HMS Agamemnon,
   Mondros limanı / Limni, Rauf Bey ve Amiral Calthorpe, 31 Ekim öğlen yürürlük)
2. Küre Ansiklopedi — Mondros Mütarekesi: https://kureansiklopedi.com/tr/detay/mondros-mutarekesi-2 (heyet başkanı Bahriye
   Nâzırı Rauf Bey; 7. madde: güvenliği tehdit eden bir durumda herhangi bir stratejik noktanın işgali; imzadan birkaç
   gün sonra İngilizler bu maddeye dayanarak Musul'u işgal etti)
3. Atatürk Ansiklopedisi — İstanbul'un İşgali: https://ataturkansiklopedisi.gov.tr/bilgi/istanbulun-isgali/ (İtilaf
   donanması ve kuvvetlerinin 13 Kasım 1918'de İstanbul'a çıkması)

Görüşmeler 27 Ekim'de başladı, 30 Ekim'de imza (dört gün). Gemi sayısı kaynaklarda farklı → metne alınmadı.

## Eleştiri günlüğü

### Tur 1 (yazar)
- **Anlatım:** plandaki metin; tek değişiklik "Ateşkes sanılan kâğıt" → "Barış sanılan kâğıt" (ateşkes gerçekten
  ateşkesti; yanılgı onun barış sanılmasıydı). 412 karakter, 11 cümle, -yor 0, ünlem yok.
- **Sahneler (9):** bt_warship · bt_map (Mondros) · bt_cabin · bt_treaty (Madde 7) · bt_map (Anadolu, 7 nokta
  kelime kelime yanar) · bt_text ("Tehdidi gören / İtilaf") · bt_map (Musul) · bt_bosphorus · bt_key. 6 farklı tip,
  bt_map ayrık. Yeni tipler tek dosyada: `scenes/studio/shots/bt_mondros.js` (ortak dosyalara dokunulmadı).
- **Kapak adayları** (hepsi sahne 0, t 3.0, zırhlı ışık havuzunda): A "SAVAŞ BİR / GEMİDE BİTTİ" focus [540,640]
  zoom 1.05 (yazı ile gemi arasında büyük boşluk) · **B aynı metin, focus yok (seçildi: gemi yazının hemen altında,
  tek özne, telefonda net)** · C "BİR GEMİDE / BİTTİ" focus zoom 1.1 (gemi aşağıda kaldı) · D "İMPARATORLUK / BİR
  GEMİDE / BİTTİ" (3 satır, kalabalık).
- **Düzeltmeler (preview turları):** zırhlı ilk denemede kadraja sığmıyordu (0.92 → 0.8 ölçek, su hattı aşağı);
  antlaşma sayfasında 9. paragraf sayfanın altına taşıyordu (8 paragraf, sıkı satır aralığı); "Madde 7" yazısının
  üstünden altın çizgi geçiyordu (hizalama + satır başı); İstanbul silueti çit gibi minareliydi (3 cami, 8 minare,
  büyük kubbeler) ve gemiler çok küçüktü (ölçek 0.17–0.36); Mondros haritası daha geniş (Ege tanınır), Anadolu
  haritasındaki noktalar cue'larla anlatıya bağlandı.
- **Kalan/eleştirmene not:** `bt_map` ortak kıyı verisinde Limni adası yok (Mondros noktası denizde duruyor) ve 36,6°
  enleminde iki kara poligonunun eki ince bir çizgi olarak görünüyor (Musul haritasında sınır gibi okunuyor).

### Tur 1 eleştirmen
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 8 | 8 | 8 | 7 | 9 | 8 | 8 |

Sorunlar: (1) sahne 1 künye gibi, "Agamemnon." altyazıda tek; (2) dönüş için insan ayrıntısı yok; (3) 3 zayıf
`bt_map` (Limni yok, "her stratejik nokta" okunmuyor, Musul'da 36,6° eki); (4) son sahne 7 sn tek görüntü.

### Tur 1 düzeltmeleri (yazar)
- **Metin (413 karakter):** "Yer, Limni'deki Mondros limanıydı." · "Osmanlı heyeti, Agamemnon'da dört gün pazarlık
  etti." · "İyi bir anlaşma sandılar. Ama tehlike yedinci maddedeydi." (insan ayrıntısı; doğrudan alıntı yok) ·
  "Tehdidi gören İtilaf, / her stratejik noktayı işgal edebilecekti." (iki sahneye bölündü). Tarih ekranda
  ("30 Ekim 1918" etiketi) ve açıklamada; 420 sınırı için anlatımdan çıkarıldı.
- **Haritalar 3 → 2 (yeni tipler `bt_mondros.js`'te):** `bt_aegean` kendi Kuzey Ege haritası (Limni ortada,
  Mondros koyu noktası atar, koyun altında demirli zırhlı + "Agamemnon", Gökçeada); `bt_occupy` = `bt_map` + her
  noktada yayılan altın bölge halkaları, "Boğazlar / İstanbul / İzmir" etiketli, noktalar her / stratejik /
  noktayı / işgal kelimelerinde yanar; Musul artık `bt_mosul`: alacakaranlıkta eğik el-Hadba minaresi + Nuri
  kubbesi, "Musul"da evlerin ışıkları ve gök aydınlığı söner, yıldızlar çıkar.
- **Son sahne:** "Böyle"de kapı kenarı + kilit plakası belirir, anahtar düzleşip deliğe girer, çeyrek tur döner,
  kapı aralığından altın ışık açılır (7 sn'de 3 görsel aşama).
- `bt_text` tek kelime "İtilaf" (kısa sahnede ikinci satır geç açılıyordu).

### Tur 2 eleştirmen
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |

Sorunlar: (1) `bt_aegean` boş, Limni biçimsiz ve görünmüyor, zırhlı çok küçük; (2) `bt_occupy` halkalar sol kenarda
kesik, "İstanbul"/"Boğazlar" üst üste; (3) son karede anahtar küçülüp sağ kenara gidiyor.

### Tur 3 düzeltmeleri (yazar; metin aynı, 413 karakter)
- `bt_aegean`: bounds doğuya (25,0–26,55°D): solda Limni, ortada Gökçeada, sağda Gelibolu yarımadası + Troas kıyısı
  tam. Limni yeniden çizildi (güneyde derin Mondros koyu, kuzeyde Purnia koyu), dolgusu açık yüzey
  (`mix(paperLight, ink, 0.2)`); "Mondros / 30 Ekim 1918" ince altın çizgiyle sağa, denize alındı; zırhlı 2,5 kat
  (ölçek 0.42) adanın güneyinde, altında "Agamemnon".
- `bt_occupy`: bounds 1,5° batıya (24,0°D); etiketleri artık sahne kendisi çiziyor (`side`): "Boğazlar" üstte,
  "İstanbul" ve "İzmir" sağda, çakışma yok.
- `bt_key`: kilit plakası x≈720, kapı aralığı x≈830 (ortaya yakın); anahtar büyük kalır (ölçek 1,1) ve ışık
  havuzunun içinde deliğe girer.
