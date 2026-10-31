# 01 — Krakatoa 1883: Duyulan en yüksek ses (günlük Shorts, belgesel tarzı)

- **Dosya:** `01-krakatoa-1883.json` · yayın 2026-10-31 19:00 (İstanbul) · `publish_at` `2026-10-31T19:00:00+03:00`.
- **Manşet:** `tools/news.py --channel db` bu ortamda çalışmadı (proxy 403, Google News'e erişim yok). Web aramasında
  bugüne tarihlenebilen, havuza uyan bir felaket/kaza manşeti bulunamadı → **havuza dönüldü** (plan: felaketler ve kazalar).
- **Havuz:** felaketler ve kazalar. Geçmişte işlenmedi (iki kanal; Tambora 1816 Stickstory'de var — farklı yanardağ, farklı fikir: ses).
- **Tarz:** `"theme": "belgesel"`, tema **`obsidyen`** (volkan camı; bir önceki Düşün Bakalım videosu `grafit`), ses `mF7tIc9VLrznhGooGjaT`.
- **İzleyici sonunda ne hisseder:** bir sesin gezegeni dolaşabileceğine dair sessiz bir ürperti; Dünya'nın ne kadar küçük olduğu.
- **Kanca fikri:** "Bu ses dünyanın etrafını dolaştı." (ya da en çarpıcı doğrulanmış iddia: 4.800 km öteden top atışı sanıldı).
- **Kapak fikri:** "BU SES / DÜNYAYI DOLAŞTI" (vurgu `dünyayı`) — karanlık denizde tek bir ada konisi, üstünde ince halkalar halinde yayılan ses dalgası.
- **Yönetmen notu:** anlatım + çekim listesi + kaynaklar yazar ajan tarafından aşağıya eklenecek.

## Anlatım (tek parça; ~385 karakter, ElevenLabs uyarısı → alt-orta bant)

Bu ses dünyanın etrafını dolaştı. 27 Ağustos 1883. Krakatoa yanardağı patladı. 4.800 kilometre ötede, bir adada top
atışı sanıldı. Ama asıl iz kulaklarda kalmadı. Dünyanın her yanında barometreler sıçradı. Basınç dalgası gezegeni üç
buçuk kez dolaştı. Aynı kâğıtlara yedi kez çizildi. Bir yanardağ bir sabah haykırdı, gezegen onu beş gün duydu. Böyle
sessiz hikâyeler için abone olun.

(Sesli okuma kontrolü: kısa, ağır cümleler; -yor 0; devrik cümle yok; ünlem yok. "Ama asıl iz kulaklarda kalmadı."
ortadaki sessiz dönüş: işitilen sesten kaydedilen dalgaya geçiş.)

## Çekim listesi

| # | Cümle | Tip | Görüntü | Cue / kamera |
|---|---|---|---|---|
| 0 | Bu ses dünyanın etrafını dolaştı. | yeni `bt_krakatoa` (rings) | Karanlık deniz, ufukta tek dik ada konisi; adadan denize ince halkalar halinde yavaşça yayılan ses dalgaları, yıldızlar | kanca + kapak karesi |
| 1 | 27 Ağustos 1883. Krakatoa yanardağı kendini parçaladı. | `bt_krakatoa` (erupt) | Aynı ada; tepeden yavaşça yükselen kül sütunu, ağızda ateş ışığı; "Krakatoa" / "27 Ağustos 1883" | cue "patladı": kül sütunu büyür, ışık açılır |
| 2 | 4.800 kilometre ötede, | yeni `bt_ocean` | Hint Okyanusu haritası: Sumatra–Cava, Madagaskar, Hindistan ucu; Krakatoa'dan Rodrigues'e altın yay, "4.800 km" | cue "kilometre": yay çizilir |
| 3 | bir adada top atışı sanıldı. | yeni `bt_rodrigues` | Gün batımında alçak bir ada kıyısı, kıyıda denize bakan tek yüzsüz siluet, ufukta küçük yelkenli gemi; denizden kıyıya yavaşça gelen soluk ses yayları | cue "top": gemi yanında soluk ışık |
| 4 | Ama asıl iz kulaklarda kalmadı. | yeni `bt_barograph` (room) | Gece bir rasat odası: lamba ışığında masada barograf (tambur, kol, kalem), pencerede gece; kalem düz çizgi yazar | yavaş itme |
| 5 | Dünyanın her yanında barometreler sıçradı. | `bt_barograph` (close) | Yakın plan: tambur kâğıdı, ızgara, düz basınç çizgisi; "sıçradı"da kalem keskin bir tepe çizer; "hava basıncı" etiketi | cue "sıçradı" |
| 6 | Basınç dalgası gezegeni üç buçuk kez dolaştı. | yeni `bt_wave` | Krakatoa merkezli küre (Asya, Avustralya, Afrika kıyıları); noktadan halka yayılır, ufukta kaybolur, arka yüzde kesikli döner; sayaç "3,5 tur" | cue "dolaştı" |
| 7 | Aynı kâğıtlara yedi kez çizildi. | yeni `bt_trace` | Uzun barograf şeridi, "1. gün … 5. gün"; yedi tepe sırayla, giderek küçülerek çizilir; "yedi"de sayı "7" | cue "yedi" |
| 8 | Bir yanardağ bir sabah haykırdı, gezegen onu beş gün duydu. Böyle sessiz hikâyeler için abone olun. | `bt_krakatoa` (after) | Sabah ışığı; adanın yerinde yarısı kopmuş tek uçurum (Rakata kalıntısı), sakin deniz, son soluk halka uzaklaşır | cue "haykırdı" |

## Kaynaklar (doğrulanmış)

1. Nautilus — "The Sound So Loud That It Circled the Earth Four Times" (A. Muthukumar):
   https://nautil.us/the-sound-so-loud-that-it-circled-the-earth-four-times-235101/ (27 Ağustos 1883 10:02; Rodrigues
   ~3.000 mil ≈ 4.800 km, "uzak top sesi gibi"; dalga her yönde 3–4 kez dolaştı; ~50 kentte barograflar 5 güne kadar
   kaydetti; Batavia gazometresi 2,5 inç cıva sıçraması)
2. Wikipedia — 1883 eruption of Krakatoa: https://en.wikipedia.org/wiki/1883_eruption_of_Krakatoa ("Rodrigues …
   4,800 km away, where the blast was thought to have been cannon fire from a nearby ship"; "Several barographs
   recorded the wave seven times over five days"; "rounded the globe three and a half times")
3. Oregon State University, Volcano World — Historical eruption sounds:
   https://volcano.oregonstate.edu/historical-eruption-sounds (Rodrigues ~4.800 km, yaklaşık dört saat sonra; dünya
   çapında basınç istasyonları kaydetti)

Kullanılmayan/şüpheli: "kulak zarları patladı" (Norham Castle günlüğü, tek kaynak), "180/172 dB" (tahmin), ölü sayısı
(36.417 resmî, başka tahminler 120.000) → metne alınmadı. "Yedi kez" = aynı barografta beş günde yedi geçiş (3,5 tur, iki yön).

## Eleştiri günlüğü

### Tur 1 (yazar)
- **Anlatım:** 384 karakter, 12 cümle, -yor 0, ünlem yok, devrik cümle yok. Ekranda tarih tekrarı kaldırıldı (sahne 1 sadece "Krakatoa").
- **Sahneler (9):** bt_krakatoa (halkalar) · bt_krakatoa (kül sütunu) · bt_ocean (Krakatoa → Rodrigues, 4.800 km) ·
  bt_rodrigues · bt_barograph (oda) · bt_barograph (yakın, sıçrama) · bt_wave (küre, 3,5 tur) · bt_trace (5 gün, 7 tepe) ·
  bt_krakatoa (yarım kalan uçurum). 6 farklı tip; yeni tipler tek dosyada `scenes/studio/shots/bt_krakatoa.js`.
- **Kapak adayları:** A sahne 0, focus yok (ada küçük, yazıyla arasında boşluk) · B focus [900,560] (yanlış piksel, ada
  kadrajdan kaydı) · C sahne 6 küre (halka ufukta, küçükken okunmuyor) · **D sahne 0, focus [470,640] zoom 1.2 (seçildi:
  büyük ada konisi, tepesinden yayılan altın ses halkaları, tek özne).**
- **Preview düzeltmeleri:** kül sütunu kadrajdan taşıyordu (ufuk aşağı, sütun kısaldı) ve iç içe halkalar gibi görünüyordu
  (önce dış çizgiler, sonra dolgular: tek bulut silueti); tarih etiketi altyazıyla çakışıyordu (kaldırıldı); harita sahnesinde
  yay sahne bitmeden tamamlanmıyordu (hızlandı, Rodrigues baştan soluk görünür); barograf kalem kolu iz gibi okunuyordu
  (yatay kol + mil); küre sayacı "0 tur" ile açılıyordu (0,5'ten başlar); 1. sahne STATIC? (halkalar hızlandı, 0,3 → 1,2).
- **Eleştirmene not:** sahne 8 (punchline + abone) ~8,6 sn tek görüntü (lint uyarısı; referans Shorts'larla aynı yapı);
  Rodrigues kıyısı sade bir eğim, ada olduğu yalnızca anlatımdan anlaşılıyor.

### 01-krakatoa-1883 — tur 1 (eleştirmen)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 6 | 7 | 7 | 8 | 6 | 9 | 7 | 8 |
1. Sahne 8: 8,6 sn tek kare (lint uyarısı, motion 1,7), son 3 sn'de altyazısız boş uçurum → ikiye böl: punchline uçurumda + son halka; abone cümlesi ayrı, sakin bir kareye (ör. geniş küre üstünde sönen son halka ya da düzleşen barograf çizgisi).
2. Sahne 5 (bt_barograph close): tepeden kalem ucuna düz çapraz çizgi çekiliyor, hata gibi okunuyor; "salınarak durulur" görünmüyor → iz kalemin arkasından sönümlü salınımla çizilsin, kalem hep izin ucunda dursun.
3. Sahne 1 (erupt) + sahne 2 (ocean): kül bulutu iç içe küçük dairelerden oluşan "baloncuk" kümesi, patlama anı zayıf ve küçük → tek dolgu silueti, kadrajın üst yarısını dolduran yükselen sütun + ağızda büyüyen ışık. Haritada kara yalnız üst üçte birde, Krakatoa etiketi kenara yapışık, Rodrigues boşlukta yüzüyor (Madagaskar/Mauritius yok), "4.800 km" yayın üstüne biniyor → haritayı ortala/büyüt, Madagaskar–Mauritius kıyısını ekle, etiketi yayın altına al.
Ek: kapanıştaki "sessiz hikâyeler" en yüksek ses videosunda çelişkili okunuyor → "Böyle gerçek hikâyeler için abone olun." Sahne 4 barograf "silindir + çizgi yığını" gibi; tambur üstünde iz ve kalem kolu belirgin olsun. Doğruluk: tüm sayılar Wikipedia/Nautilus ile tutarlı.

### Düzeltme tur 1 (yazar)
- **Sahne 8 ikiye bölündü:** punchline uçurum + son halka (sahne 8, ~4,3 sn) · abone cümlesi ayrı sakin kare: halkası
  yavaşça sönen küre (`bt_wave` `fade: true`, sayaç yok; sahne 9). Abone cümlesi "Böyle gerçek hikâyeler için abone olun."
  Karakter 384, 10 sahne, lint uyarısız.
- **Sahne 5 (barograf yakın):** çapraz kalem kolu kaldırıldı; kalem tamburun yanındaki dikey ray üstünde kayan bir
  arabaya yatay kolla bağlı, uç hep izin ucunda; kâğıt daha hızlı akıyor, sıçrama arkada salınarak sönüyor.
- **Sahne 1 (patlama):** baloncuk kümesi yerine tek dolgu silueti: dar yükselen sütun + üstte geniş şemsiye bulut
  (dış hatlar tek çizgi, içte birkaç kıvrım); ağızdaki ışık havuzu cue'da büyüyor. Sütun kadrajın üst yarısını dolduruyor.
- **Sahne 2 (harita):** sınırlar 46–116°D: Madagaskar kıyısı solda, Mauritius ve Réunion eklendi, Rodrigues küçük ada;
  harita dikeyde ortaya alındı, Krakatoa etiketi kenardan içeride, "4.800 km" yayın altında.
- **Sahne 4 (barograf oda):** tambur büyüdü, üstünde ızgara ve kalın, belirgin iz; kalem kolu mürekkep renginde, uç altın.
- **Sahne 3 (Rodrigues):** büyük kıyı eğimi kaldırıldı; ufuk + her yanı deniz olan küçük alçak ada, üstünde tek siluet,
  adanın çevresinde köpük halkası ve önde dalgacıklar.
- **Kapak:** aynı fikir, ufuk aşağı alındığı için focus [460,780] zoom 1.2 (ada konisi + altın ses halkaları yazının altında).

### 01-krakatoa-1883 — tur 2 (eleştirmen)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 8 | 7 | 7 | 8 | 8 | 9 | 8 | 8 |
Lint hatasız, uyarısız. Tur 1'in 3 sorunu çözüldü (sahne 8/9 bölündü, barograf izi kalemin ucunda, mantar kül bulutu, Rodrigues adası, barograf odası okunuyor). Geçme şartı sağlandı; kalan sorunlar:
1. Sahne 2 (bt_ocean): kara hâlâ kadrajın üst çeyreğinde, Krakatoa etiketi sağ kenara yapışık, alt %60 boş ızgara → haritayı aşağı kaydırıp ~1,3× büyüt, Krakatoa–Rodrigues yayı kadrajın ortasına gelsin.
2. Sahne 9 (bt_wave fade, abone): iki karede de hiçbir şey değişmiyor, sahne 6'nın halkasız tekrarı gibi → Krakatoa noktasından tek, soluk, sönen bir halka ya da çok yavaş dönüş ekle.
3. Sahne 1 metni "Krakatoa yanardağı patladı." düz ve en zayıf cümle; sahne 0 hareketi 1,0 (halkalar soluk) → örn. "Krakatoa yanardağı kendini parçaladı." (adanın ~2/3'ü yok oldu; sahne 8'deki yarım uçurumla bağ kurar); sahne 0'da halka çizgisini biraz kalınlaştır/parlat.

### Düzeltme tur 3 (yazar, cila)
- Sahne 1 metni: "Krakatoa yanardağı kendini parçaladı." (cue "parçaladı"); toplam 394 karakter.
- Sahne 0: ses halkaları kalınlaştı ve parladı (hareket 1,2 → 1,5).
- Sahne 2 (`bt_ocean`): dikeyde ~1,1x büyük; Krakatoa–Rodrigues yayının ortası kadrajın ortasında (y ≈ 820), kara aşağı
  indi (Hindistan, Sri Lanka, Sumatra–Cava, Madagaskar kıyısı); Krakatoa etiketi kenardan içeride, "4.800 km" yayın altında.
  (1,3x denendi: Krakatoa sağ kenara taşıyordu.)
- Sahne 9 (abone karesi): Krakatoa noktasından tek soluk halka 2,6 sn'de bir nefes gibi yayılıp söner; küre halkası daha az
  söner (hareket 2,8).
