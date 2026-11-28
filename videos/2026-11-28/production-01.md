# 01 — Salamis: tek bir yalan (Shorts) · yazar notları

- Dosya: `01-salamis-mesaji.json` · `publish_at` 2026-11-28T19:00:00+03:00 · kâğıt `yaz` (bir önceki Düşün Bakalım
  videosu `pamuk`, bir önceki Short `keten`) · 10 sahne · 420 karakter (üst sınırda; sert sınır 480)
- Yeni sahne kodu: `scenes/studio/shots/wc_salamis.js` — nesneler `trireme` (Yunan / Pers-Fenike, tunç mahmuz, göz,
  üç kürek sırası, aphlaston, `row` canlı kürek, `damage`, `sail`), `skiff` (gece sandalı: kukuletalı kürekçi, pelerinli
  yolcu, kıçta kandil; canlı alev, ışık halesi, sudaki yansıma), `xerxes` (şemsiye altında aslan ayaklı tahtta Kserkses,
  uzun taç, asa, şemsiyeyi tutan hizmetkâr); sahne tipi `wc_salamis_night` (wc_scene + denizi gece pigmentiyle örten
  sır, ay yolu, ufukta koyu ada sırtı `ridge`). Ortak dosyalara dokunulmadı.

## Tek parça anlatım (tur 1 sonrası, 417 karakter)

Bu savaşı tek bir yalan kazandı. Milattan önce 480. Persler Atina'yı yakmıştı. Yunan donanması dağılmak üzereydi.
O gece Themistokles, oğullarının lalası Sikinnos'u düşmana yolladı. Mesaj: Yunanlılar kaçacak. Kserkses inandı,
boğazları gece kapattırdı. Sabah dar suda Pers gemileri birbirine takıldı. Kserkses, Yunan zaferini tahtından izledi.
Onu yenen, düşmanına inanmasıydı. Böyle sessiz hikâyeler için abone olun.

(Tur 0: 420 karakter; "Salamis'te" ve "kısaydı" çıkarıldı, Kserkses cümlesine "Yunan zaferini" eklendi.)

Sesli okuma kontrolü: kısa ağır cümleler, "-yor" yok, devrik cümle yok, enerjik kalıp yok. İlk cümle 6 kelime, kapakla
aynı fikir; tarih ikinci cümlede. "Onu" bir önceki cümledeki Kserkses'e bağlanır. Karakter bütçesi yüzünden "bir
sandalla" ve "bütün gece"deki "bütün" çıkarıldı (sandal görüntüde).

## Çekim listesi

| # | Cümle | Visual | Tip | Nesneler | Cue | Kamera |
|---|---|---|---|---|---|---|
| 0 | Bu savaşı tek bir yalan kazandı. | Gece, koyu deniz; kandilli tek sandal, kukuletalı kürekçi + pelerinli yolcu, ufukta koyu ada sırtı, ay | `wc_salamis_night` | skiff s 1.9 (yavaş ilerler) | yalan | kapak karesi (540, 760) ×1,25 |
| 1 | Milattan önce 480. Persler Atina'yı yakmıştı. | Attika–Saronik haritası, Atina kırmızı yıldız, Salamis, Faliron önünde Pers donanması | `wc_map` | yıldız, gemi işareti | yakmıştı → gemi | motor |
| 2 | Yunan donanması dağılmak üzereydi. | Akşamüstü deniz; yelkenini açıp açığa giden tek Yunan triremi, arkada adanın önünde trireme'ler; "kaçmak isteyenler" | `wc_scene` sea | trireme (sail full, move), 2 uzak trireme, island | dağılmak | motor |
| 3 | O gece Themistokles, oğullarının lalası Sikinnos'u düşmana yolladı. | Gece kıyı; elini denize uzatan Themistokles, kandilli sandal kıyıdan ayrılıyor; "Sikinnos" | `wc_salamis_night` coast | person point robe, skiff (move) | Sikinnos → not | motor |
| 4 | Mesaj: Yunanlılar kaçacak. | Ortalanmış eski kâğıt: "Yunanlılar kaçacak." / kırmızı "Önlerini kesin." · Herodotos'a göre (özet) | `wc_salamis_message` | — | kaçacak | levha |
| 5 | Kserkses inandı, boğazları gece kapattırdı. | Salamis Boğazı yakın harita; doğu ve batı çıkışlarına kırmızı çizgiler, Pers gemileri, Psittalia | `wc_map` | 2 rota, gemi, Psittalia | inandı (+0,5 / +0,9 sn çizgiler) | yakın harita |
| 6 | Sabah dar suda Pers gemileri birbirine takıldı. (cue "birbirine": Yunan mahmuzu Pers gövdesine giriyor) | Şafak; böğrü delik yan yatmış Pers triremi, soldan mahmuzla gelen Yunan triremi, arkada sıkışmış Pers gemileri, duman | `wc_scene` sea | trireme persian damage, trireme greek row (move), 3 uzak | takıldı → duman | motor |
| 7 | Kserkses, Yunan zaferini tahtından izledi. | Aigaleos'un kayalık tepesinde şemsiye altında tahtında Kserkses, hizmetkâr; aşağıda boğazda gemiler, duman | `wc_scene` coast | xerxes s 1.7 | izledi | motor |
| 8 | Onu yenen, düşmanına inanmasıydı. | Levha: kâğıtta tek sandal, kıçta kandil; "tek bir fısıltı" | `wc_specimen` | skiff | inanmasıydı → not | levha (yakın plan) |
| 9 | Böyle sessiz hikâyeler için abone olun. | Sabah, sakin boğaz, uzakta Salamis, kürek çeken Yunan triremi, kuşlar; kâğıda siliniyor | `wc_scene` sea | island, trireme row | — | motor, mist 3,4 sn |

Tipler: `wc_salamis_night` 2, `wc_map` 2, `wc_scene` 4, `wc_letter` 1, `wc_specimen` 1 (5 tip; wc_scene %40).

## Kapak adayları

- **A (seçildi): "TEK BİR / YALAN"** (vurgu "yalan"), sahne 0, t 2,0, odak (540, 760) ×1,25: gece denizinde tek kandilli
  sandal. İlk cümleyle birebir aynı fikir; tek özne, sıcak ışık soğuk mavide göze çarpıyor.
- B: "DÜŞMANA / FISILTI" (vurgu "fısıltı"), aynı kare. Merak uyandırıyor ama ilk cümleyle aynı fikir değil, "fısıltı"
  telefonda daha uzun ve zor okunuyor.
- C: "KSERKSES / KANDIRILDI" (vurgu "kandırıldı"), sahne 7. Kserkses ve şemsiye tek özne ama kalabalık (hizmetkâr,
  duman, gemiler); isim Türk izleyicide kaydırmayı durduracak kadar tanıdık değil. Elendi.

## Doğrulanan bilgiler

- Herodotos 8.75: Peloponezliler oy çokluğuyla Themistokles'i yenerken o meclisten çıkıp Sikinnos'u bir tekneyle Pers
  donanmasına yolladı. Sikinnos onun hizmetkârı (oiketes) ve oğullarının lalası (paidagogos). Mesaj: Themistokles
  krala yakın, Yunanlılar korkuyor ve kaçmayı planlıyor, kaçmalarını önlerseniz büyük bir iş başarırsınız; aralarında
  birlik yok. (Perseids/Perseus İngilizce metni.)
- Aiskhylos, Persler (345–420): Atina ordusundan bir Yunanlı Kserkses'e Yunanlıların gece gizlice kaçacağını söyledi;
  Kserkses kurnazlığı anlamadan kaptanlarına çıkışları ve boğazları kapatmalarını emretti; donanma gece boyu boğazda
  dolaştı, şafakta Yunanlılar paean'la saldırdı.
- Herodotos 8.90: Kserkses savaşı Salamis'in karşısında Aigaleos dağının eteğinde oturarak izledi, başarılı kaptanların
  adını katiplerine yazdırdı. "Tahtından" ayrıntısı Plutarkhos'tan (Themistokles 13: altın ayaklı taht) gelir; anlatıda
  sadece "tahtından izledi" dendi.
- Tarih: MÖ 480, Eylül (World History Encyclopedia; Britannica MÖ 480). Persler Atina'yı aynı yıl, savaştan önce yaktı.
- Britannica: Themistokles Pers donanmasını dar boğaza çekti, kalabalık Pers gemileri manevra yapamadı.
- Anlatılmadı (sayılar kaynaklar arasında çok farklı): gemi sayıları (Herodotos/Aiskhylos 1.207 Pers, Britannica ~800
  Pers ~370 Yunan, WHE 310 Yunan), kayıplar. Pers kürekçilerin "yorgunluğu" yaygın bir yorumdur, metne konmadı.
- Görsel notlar: Pers donanması büyük ölçüde Fenike trireme'lerinden oluşur (o yüzden Pers gemileri de trireme, sadece
  renk/bezek farklı). Kandil sanatsal bir tercih; Herodotos sadece "tekne" der.

## Kaynaklar

- Herodotus 8.75 — https://cts.perseids.org/read/greekLit/tlg0016/tlg001/perseus-eng2/8.75.1-8.75.3
- Herodotus 8.90 — https://cts.perseids.org/read/greekLit/tlg0016/tlg001/perseus-eng2/8.90.4-8.91.1
- Aeschylus, Persians 345–420 — https://cts.perseids.org/read/greekLit/tlg0085/tlg002/perseus-eng2/345-420
- Britannica — https://www.britannica.com/EBchecked/topic/518945/Battle-of-Salamis
- World History Encyclopedia — https://www.worldhistory.org/battle-of-salamis/

## Kontrol (tur 0, yazar)

- `python tools/lint.py videos/2026-11-28/01-salamis-mesaji.json` → OK (hata/uyarı yok, SEO tam).
- `preview.py`: 10 sahne, ~30 sn, 420 karakter, STATIC? uyarısı yok (sahne 0 motion 0,4: kapak bloğu ilk cümle boyunca
  ekranda; sandal yavaş ilerliyor, kandil titriyor). Düzeltilenler: kahraman gemiler ve Kserkses altyazı bandının
  üstüne alındı, sahne 2 ve 9 gemileri karaya oturuyordu (açık denize alındı), not taşmaları, mektup imzası kısaltıldı,
  ay kapak yazısının arkasından çıkarıldı, sandaldaki figürler kütüphanenin boyalı `person` figürleriyle değiştirildi.
- Bilinen zayıflıklar: trireme kalkan sırası biraz "oyuncak" renkli; canlı kürekler gövdenin üstünde tarama gibi duruyor;
  Kserkses figürü düz yıkama ağırlıklı.

## Eleştiri günlüğü

### 01-salamis-mesaji — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 6 | 6 | 7 | 6 | 5 | 8 | 8 | 7 | 7 |
1. Suluboya: trireme çizgi film gibi (kocaman göz, sarı gaga mahmuz, gökkuşağı kalkanlar, kalın kuyruk); skiff
   figürleri ve Kserkses düz vektör; kapakta ay kadraj dışı, alt %40 boş deniz.
2. Görsel=anlatım: sahne 6'da çarpışma yok; sahne 7'de Kserkses tepede değil, taht altyazı bandında.
3. Okunabilirlik/kompozisyon: mektup küçük ve köşede, imza sığmıyor; haritalar kadrajı doldurmuyor; sahne 3'te
   altyazı figürlerin üstünde; sahne 8 notu geç; sahne 9 sisi poligon artığı bırakıyor; sahne 0 hareket 0,4.
   Senaryo: "takıldı"dan Kserkses'e atlanıyor, Yunan zaferi söylenmiyor.

Yapılanlar (yazar):
- Trireme yeniden boyandı: kalkanlar 2 tonda (bronz / mürekkep-ahşap), yarı saydam, küçük, alt yarıları dış bordanın
  arkasında (güverte önce boyanıyor); göz küçük badem; mahmuz kısa, koyu tunç; aphlaston ince; gövdeye ikinci yıkama
  katmanı, kuru fırça darbeleri, fırça kenarlı bant. Hasarlı gemide büyük yarık, kırık kürekler, daha fazla yatma.
- Skiff: pelerinlere ve gövdeye kuru fırça kıvrımları; kürek artık canlı (küpeşte üstünde dönüp suya girip kalkıyor,
  dalga izi); kandil yansıması 14 dalgalanan şerit. Kserkses: giyside yıkama lekeleri, şemsiye ve tahtta kuru fırça,
  kenarda koyu birikme.
- Kapak: ay kadraj içinde (sağ, yazının altında), sandal büyük (s 2.1) ve aşağıda, focus (560, 1000) ×1,4; alttaki boş
  deniz yarıdan aza indi, kandil yansıması orayı dolduruyor.
- Sahne 6: Yunan triremi "birbirine" kelimesine 2,2 sn kala soldan giriyor, cue anında mahmuzu yarık Pers gövdesine
  giriyor; arkada üst üste binen üç Pers gemisi, cue'da iki duman sütunu.
- Sahne 7: Kserkses Aigaleos yamacındaki koyu kayalığın tepesinde (taban y 0,55), boğaz ve gemiler aşağıda küçük;
  cümle "Kserkses, Yunan zaferini tahtından izledi." (cue "zaferini").
- Sahne 4: yeni `wc_salamis_message` tipi: ortalanmış eski kâğıt, iki büyük satır ("Yunanlılar kaçacak." / kırmızı
  "Önlerini kesin."), altında "Sikinnos'un mesajı, Herodotos'a göre (özet)". Anlatım: "Mesaj: Yunanlılar kaçacak."
- Haritalar: sahne 1 bölgesi daraltıldı (Salamis–Atina–Faliron kadrajı dolduruyor), etiketler erken yazılıyor;
  sahne 5 etiketleri 0,3–0,4 sn'de. Sahne 3: ufuk 0,45, figürler y ≤ 0,58, not yeniden konumlandı.
  Sahne 8 notu 0,3 sn'de. Sahne 9 sis kaldırıldı. Sahne 0 sandal belirgin süzülüyor (motion 0,4 → 1,3).
- Kontrol: lint OK (SEO tam), preview 10 sahne, ~31 sn, 417 karakter, STATIC? yok.

### 01-salamis-mesaji — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 8 | 7 | 6 | 8 | 9 | 8 | 7 |
1. Suluboya: sahne 7 Kserkses klip art (kare taç, blok sakal, tek parça gövde, göğüste gri çizik), kaya yarı saydam;
   sahne 8 skiff çevresinde uçuşan gri darbe artıkları; pelerinler tek katman.
2. Kapak: gökyüzü gri, kandil figürleri aydınlatmıyor, alt %35 boş deniz; sahne 6'dan aday istendi.
3. Sahne 1 "Pers donanması" etiketi görünmüyor, "Saronik Körfezi" ilk karede yarım; sahne 3 altyazı bacaklara değiyor.

Yapılanlar (yazar, son tur):
- Kserkses: genişleyen yivli kidaris taç (iki ton, kırmızı bant, tepe boncukları, birikmiş kenar), sıra sıra kıvırcık
  sakal ve saç; giysi iki yıkama katmanı + kumaş renginde koyu birikmiş kenar; açık renkli lekeler ve kolun kuru fırça
  kılları (göğüsteki gri çizik) kaldırıldı, kol yıkama. Kaya artık `xerxes` nesnesinin içinde (`o.rock`): kâğıt
  renginde örtücü alt kat + taş yıkamaları + çatlaklar; taht ayakları ve hizmetkâr kayanın üstünde, arkası görünmüyor.
- Skiff: uçuşan kıvrım darbeleri kaldırıldı; her figür poligonuna ikinci koyu sır katmanı + kuru fırçalı birikmiş kenar.
- Kandil: hale 200 px / 0,5 alfa + figürlere uzanan ikinci sıcak hale; yansıma daha parlak. Gece: deniz örtüsü 0,8,
  yeni `sky_veil` (gökyüzüne gece sırrı, ay halesi korunur). Kapak odağı kandil–figürler arası (520, 960) ×1,55, ay
  kadraj içinde; alttaki boş deniz yaklaşık %20 ve yansıma ile dolu.
- Kapak adayları (3): A "TEK BİR / YALAN" gece sandalı (seçildi: ilk cümleyle aynı fikir, tek özne, sıcak ışık / soğuk
  gece kontrastı); D aynı yazı, sahne 6 mahmuz anı (kalabalık: 5 gemi, odak dağınık); B "DÜŞMANA / FISILTI" (ilk
  cümleyle farklı fikir).
- Sahne 1: "Pers donanması" gemi simgesi ×1,5, etiket 0,8 sn'de kadraj içinde (Salamis ile Atina arasında), deniz adı
  0 sn'de. Sahne 3: Themistokles ve sandal y 0,55, Themistokles s 1,4; gökyüzüne hafif gece sırrı.
- Kontrol: lint OK (SEO tam), preview 10 sahne, ~31 sn, 417 karakter, STATIC? yok; sheet ve kapak gözle kontrol edildi.
- Kalan (bilinen): kapak gökyüzünün üst kısmı motorun yazı arkası açık katmanı yüzünden hâlâ griye çalıyor (ortak
  motor dosyası, dokunulmadı); kürekçi pozu arkaya yaslanıyor (kütüphane `row` duruşu).

### 01-salamis-mesaji — tur 3
Suluboya 6, diğer bütün kriterler ≥ 7, kapak 8. REVIEW.md gereği en zayıf sahne (7, Kserkses yakın plan) daha basit
ama doğru bir sahneyle değiştirildi, metin aynı ("Kserkses, Yunan zaferini tahtından izledi."):
- Yeni sahne 7: gündüz Salamis Boğazı; kahraman özne önde yan yatmış, yanan, böğrü delik Pers triremi ve dumanlar, soldan
  gelen Yunan triremi; sağda uzakta kayalık tepede şemsiye altında küçük (s 0,5) Kserkses ve tahtı, "Kserkses" notu
  "zaferini" anında. Kserkses nesnesinden yarı saydam gri kıvrım darbeleri kaldırıldı (giysi artık iki yıkama katı +
  birikmiş kenar). Lint OK, preview 417 karakter, STATIC? yok, sheet gözle kontrol edildi.
