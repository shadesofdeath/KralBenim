# 01 — Attila'nın son gecesi (Shorts)

- **Dosya:** `videos/2026-11-20/01-attila-son-gece.json` · `publish_at` 2026-11-20T19:00:00+03:00 (İstanbul)
- **Havuz:** imparatorlukların yükselişi ve çöküşü
- **Manşet:** `tools/news.py --channel db` bulut ağından çalışmıyor (proxy 403); web taramasında havuza uyan güncel
  Türkiye manşeti bulunamadı → **havuzdan** (bkz. `production.md`).
- **Geçmiş kontrolü:** iki kanalın `videos/*/` senaryolarında Attila / Hunlar işlenmemiş.
- **İzleyici sonunda ne hisseder:** Roma'yı dize getiren bir imparatorluğun tek bir burun kanamasıyla bittiği, ve
  mezarın hâlâ bir yerde, toprağın altında sessizce durduğu ürpertisi.
- **Kanca:** "Roma'yı titreten adam yatağında boğuldu." (en çarpıcı an; tarih ikinci cümlede)
- **Kapak fikri:** obsidyen zemin, karanlık odada alçak yatak ve az önce sönmüş kandilden yükselen ince duman,
  ışık havuzunda; yazı "YATAĞINDA BOĞULDU" (vurgu: boğuldu). Adaylar: (A) yatak + sönmüş kandil "Yatağında boğuldu",
  (B) aynı kare "Tek yara yoktu", (C) toprak kesitinde parlayan iç içe üç tabut "Mezarı kayıp".
- **Tema:** `obsidyen` (sıcak siyah, kemik beyazı, kandil/ateş ışığı; gece, mezar). Bir önceki video `derin` idi.

## Anlatım (tek parça, sesli okunur gibi)

Roma'yı titreten adam yatağında boğuldu. Yıl 453. Attila evlenmişti. Düğün gecesi çok içti. Sabah muhafızlar
kapıyı kırdı. Üstünde tek yara yoktu. Jordanes'e göre burun kanı boğazına akmıştı. Üç tabuta kondu: altın, gümüş,
demir. Rivayete göre gömenler de öldürüldü. Mezar hâlâ kayıp. Oğulları mirası paylaşamadı. Hun gücü
dağıldı. Bir burun kanaması bir imparatorluğu bitirdi. Böyle sessiz hikâyeler için abone olun.

(Kontrol: "-yor" yok, devrik cümle yok, enerjik kalıp yok; kesin olmayan iki bilgi kaynağa bağlandı: "Jordanes'e göre",
"anlatılana göre".)

## Çekim listesi (dikey 1080×1920; sahneler `scenes/studio/shots/bt_attila.js`)

| # | Cümle | Tip | Visual | Cue | Kamera |
|---|---|---|---|---|---|
| 0 | Roma'yı titreten adam yatağında boğuldu. | `bt_attila_bed` (hook) | Karanlık ahşap oda; alçak yatakta kürk örtü altında yüzsüz yatan siluet; solda ayaklı kandil yanar, "boğuldu"da alev küçülüp söner, ince duman yükselir | boğuldu | yavaş itme |
| 1 | Yıl 453. Attila yeniden evlenmişti. | `bt_attila_hall` | Gece, yıldızlar; ovada çit içinde uzun ahşap salon silueti, tek pencere sıcak ışıkla yanar, çatıdan duman; üstte altın "453" | evlenmişti | yavaş itme |
| 2 | Düğün gecesi çok içti. | `bt_attila_cup` | Kandil ışığında ahşap masa üstünde tek ahşap kupa (Priskos: Attila ahşap kupadan içerdi); kenarından tek damla şarap yavaşça süzülür | içti | yakın plan |
| 3 | Sabah muhafızlar kapıyı kırdı. | `bt_attila_door` | Kalın tahta kapı demir kuşaklarıyla; "kapıyı"da kapı açılır, karanlık zemine solgun sabah ışığı kaması düşer, kapı ağzında iki karşı ışık siluet, toz zerreleri | kapıyı | sabit itme |
| 4 | Üstünde tek yara yoktu. | `bt_attila_bed` (dawn) | Aynı yatak, kandil sönük; sağdan soluk ışık kaması örtünün üstüne düşer, "yara"da ışık siluetin üstünde yumuşakça yoğunlaşır | yara | yakın plan |
| 5 | Jordanes'e göre burun kanı boğazına akmıştı. | `bt_attila_codex` | Açık eski el yazması kodeks, soluk satırlar; üstte "Jordanes", italik "Getica, MS 551"; "kanı"nda tek satır altın olur | kanı | yavaş itme |
| 6 | Üç tabuta kondu: altın, gümüş, demir. | `bt_attila_coffins` | Üstten bakılan iç içe üç tabut çizgisi: "altın"da içteki altın, "gümüş"te ortadaki açık gümüş, "demir"de dıştaki kalın koyu demir; yanlarında küçük italik etiketler | altın, gümüş, demir | sabit |
| 7 | Anlatılana göre gömenler de öldürüldü. Mezar hâlâ kayıp. | `bt_attila_grave` (cut) | Gece ova kesiti: yüzeyde üç kürek saplı toprak yığını, derinde iç içe tabut soluk ışıkta; "öldürüldü"de kürekler solar, "kayıp"ta yüzey düzleşip ot çizgisi kapanır | öldürüldü, kayıp | yavaş itme |
| 8 | Miras bölündü. İmparatorluk dağıldı. | `bt_attila_map` | Sade şema: Tuna kıvrımı, Hun toprakları tek soluk leke; "dağıldı"da leke çatlayıp parçalara ayrılır, parçalar uzaklaşıp solar; altın italik "Nedao Savaşı" (yıl ekranda yok: kaynaklar 454/455 arasında) | dağıldı | sabit |
| 9 | Bir burun kanaması bir imparatorluğu bitirmişti. | `bt_attila_drop` | Karanlık durgun su yüzü; tek küçük kırmızı damla yavaşça düşer, "imparatorluğu"nda suya değer, halkalar yayılır, sudaki imparatorluk lekesinin yansıması halkalarla dağılır | imparatorluğu | sabit |
| 10 | Böyle sessiz hikâyeler için abone olun. | `bt_attila_grave` (end) | Aynı kesit: yıldızlar, düz ova, derindeki tabutun ışığı yavaşça söner | — | yavaş itme |

**Kapak seçimi (3 aday denendi):** (A) yatak + sönen kandil "YATAĞINDA BOĞULDU" · (B) sabah ışığında yatak "TEK YARA
YOKTU" · (C) toprak kesitinde parlayan iç içe tabutlar "MEZARI HÂLÂ KAYIP". C görsel olarak en gizemli ama ilk cümleyle
(kanca) aynı fikir değil; A seçildi: ilk cümleyle birebir, tek özne ışık havuzunda, hook boyunca kandil söner ve duman
yükselir (cover `t` 3.2, focus yok: focus yatağı kadraj dışına itiyordu).

"Oğulları birbirine düştü" yerine "Miras bölündü": oğulların iç savaşı tezi tartışmalı (Medievalists makalesi), mirasın
bölünmesi ve ardından dağılma Britannica ile uyumlu.

## Kaynaklar

- Jordanes, *Getica* XLVIII.254–258, L.259–262 (Mierow çevirisi, 1915) — LacusCurtius:
  https://topostext.org/work/744 (§254–260 doğrulandı; Ildico ile evlilik; şarap ve uyku;
  burundan akacak kanın boğaza akması; "yarasız" bulunuş; kapının kırılması; altın, gümüş, demir tabutlar; gömenlerin
  öldürülmesi; Nedao)
- Encyclopaedia Britannica — Attila: https://www.britannica.com/EBchecked/topic/42236/Attila ve özet https://www.britannica.com/summary/Attila-king-of-the-Huns (düğün gecesi
  uykuda ölüm; gömenlerin öldürülmesi ki mezar bulunmasın; oğulların imparatorluğu bölüşmesi)
- Medievalists.net — Collapse of the Hunnic Empire: Jordanes, Ardaric and the Battle of Nedao:
  https://www.medievalists.net/2018/02/collapse-hunnic-empire-jordanes-ardaric-battle-nedao/
- Priskos'un ahşap kupa ayrıntısı (Attila'nın ziyafeti) kapak/görüntü içindir; anlatımda geçmez.

## Eleştiri günlüğü

### 01-attila-son-gece — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 7 | 8 | 7 | 8 | 8 | 7 | 8 | 8 |
1. Sahne 7 (`bt_attila_coffins`): ilk kare neredeyse boş (kesik çizgili hayalet çerçeveler, soluk tek çizgi; "altın" etiketi zor görünüyor); ikinci karede dış tabut sağ üstte kopuk bir köşe çizgisi olarak duruyor, üç tabut iç içe oturmuyor; italik etiketler küçük ve soluk. → Altın tabut sahne başında tam çizili olsun, gümüş/demir aynı merkezde tam kapalı çizilsin, etiketler ≥ 44 px ve okunur kontrastta.
2. Sahne 9–10 (harita → damla): anlatım "Miras bölündü. İmparatorluk dağıldı." diyor ama ekranda anlatımda hiç geçmeyen "Nedao Savaşı" yazıyor; ölümle çöküş arasındaki nedensellik (oğulların taht kavgası, 454 Nedao) metinde yok, bu yüzden "Bir burun kanaması bir imparatorluğu bitirmişti" punchline'ı aşırı basitleşiyor. → Metni "Oğulları mirası paylaşamadı. Bir yıl sonra imparatorluk dağıldı." gibi bağla (ya da etiketi kaldır). Tuna çizgisi Hun lekesinin içinden geçiyor; leke Tuna'nın kuzeyinde/ötesinde dursun.
3. Sahne 10 (`bt_attila_drop`): kare çok boş; "imparatorluk lekesinin yansıması" okunmuyor (koyu gri tek leke), damla çok küçük. → Sahne 9'daki Hun haritası şeklini suda açıkça (ince ışıklı kontur) göster, damlayı büyüt; halkalar yansımayı belirgin biçimde parçalasın. (Küçük: sahne 4'te kapı "kırılmıyor", sadece açılıyor; menteşeden sarsılarak açılması yeter.)
Doğruluk: Jordanes, Getica XLIX (Priskos'a dayanır) ile uyumlu: 453, Ildico düğünü, aşırı içki, sırtüstü yatarken burun kanının boğaza akması, muhafızların ertesi gün kapıyı kırması, yarasız ceset, altın-gümüş-demir tabutlar, gömenlerin öldürülmesi ("anlatılana göre" doğru çekince). Getica ~551 doğru. Kaynak URL'si `.../Thayer/.../Jordanes/Getica/D*.html` şüpheli (joker karakterli, doğrulanamadı) → Mierow çevirisinin gerçek adresiyle değiştir (ör. people.ucalgary.ca/~vandersp/Courses/texts/jordgeti.html). Lint OK, 420 karakter.

### 01-attila-son-gece — tur 1 düzeltmeleri (yazar)
1. Sahne 7 `bt_attila_coffins`: altın tabut sahne başından tam çizili; gümüş ve demir aynı merkezde kapalı çizgi olarak
   bütün halinde belirir (yarım çizim/kopuk köşe yok); etiketler 64 px, Lora 500, altın / kemik / açık gri.
2. Metin: "Miras bölündü." → "Oğulları mirası paylaşamadı." (ölüm → çöküş bağı). Yer açmak için: "Sabah muhafızlar kapıyı
   kırdı." → "Sabah kapıyı kırdılar.", "Attila yeniden" → "Attila yine", "Anlatılana göre" → "Rivayete göre", "bitirmişti" →
   "bitirdi". 418 karakter. Haritadan "Nedao Savaşı" etiketi kaldırıldı (anlatımda yok); Hun lekesi Tuna'nın kuzeyine alındı.
3. Sahne 10 `bt_attila_drop`: suda Hun haritası ince ışıklı konturla ve ışık havuzuyla görünür, damla ~2 kat büyük, gökte
   yıldızlar; çarpınca halkalar büyür ve yansıma yatay şeritler halinde kayarak bozulup söner.
   Sahne 4 `bt_attila_door`: kapı açılırken üst menteşeden kopup serbest kenarı sarkar, kilit tarafında kıymıklar, yerde
   kırık bir tahta parçası (altyazı bandının altında).
4. Kaynak: Jordanes URL'si → https://topostext.org/work/744 (Mierow çevirisi; §254 Ildico/yarasız ölüm, §258 altın-gümüş-
   demir tabutlar ve gömenlerin öldürülmesi, §260 Nedao doğrulandı).
5. Kapak: oda 1.4× yakın plan; kandil yatağın baş ucuna alındı, alev ve uyuyan baş tek grup halinde yazının hemen altında
   (focus kullanılmadı: hook karesi kapakla aynı olsun diye kompozisyon sahne içinde yapıldı).
Lint OK (SEO 100), preview: tüm sahneler motion ≥ 1.4, STATIC yok.

### 01-attila-son-gece — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 8 | 8 | 8 | 8 | 8 | 9 | 8 | 8 |
Tur 1 sorunları giderildi (tabutlar tam ve iç içe, etiketler okunur; harita etiketi kaldırıldı, Tuna kuzeyde; ölüm→çöküş bağı metinde; kapı kırılıyor). Kalan küçük sorunlar:
1. Sahne 10 (`bt_attila_drop`): sudaki şekil hâlâ düz bir su birikintisi gibi okunuyor, sahne 9'daki Hun haritasıyla göz bağ kurmuyor. → Sahne 9'un konturunu birebir kullan (aynı çıkıntılar, gerekirse çatlak çizgileri soluk), böylece damla "o imparatorluğun" yansımasına düşsün.
2. Kapak: alt %40 boş zemin ızgarası; alev kandil tablasının ucunda havada asılı gibi duruyor; yatak sağdan kesik. → Kandil+baş grubunu biraz büyütüp aşağı/merkeze al, alevi kandil ağzına oturt; zemin payını azalt.
3. Sahne 4: "Sabah kapıyı kırdılar." öznesiz kaldı (kim?). Bütçe izin veriyor (418 → ~424): "Sabah muhafızlar kapıyı kırdı." geri alınabilir. (Küçük: sahne 7 ilk karede kesik çizgili hayalet çerçeveler hâlâ görünüyor; dış tabutlar belirene kadar gizlenebilir.)
Doğruluk: yeni kaynak https://topostext.org/work/744 = "Jordanes, Getica" (ToposText, Mierow çevirisi), uygun ve gerçek. Lint OK (SEO 100), 418 karakter.

### 01-attila-son-gece — tur 2 sonrası son rötuşlar (yazar)
Sahne 10'daki su yansıması artık sahne 9 haritasının aynı dış çizgisi (aynı `realm()` noktaları, düzgün 0,7 ölçek).
Kapak/sahne 0–4: yatak kısaltıldı, oda 1,55× ve aşağı alındı; alev kandilin ağzında, kandil + baş büyük ve ortada, yatak
sağdan kesilmiyor. Sahne 4 "Sabah muhafızlar kapıyı kırdı." geri geldi (yer için "Attila yine" → "Attila", "İmparatorluk
dağıldı" → "Hun gücü dağıldı"; 417 karakter). Sahne 7'de kesik çizgili hayalet çerçeveler kaldırıldı. Lint OK, STATIC yok.
