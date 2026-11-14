# 2026-11-14 — Düşün Bakalım üretim notu

Plan (`tools/plan.py`): 1 Shorts (`01-…`, 19:00 İstanbul) + 1 uzun video (`02-…`, 20:30 İstanbul). Sonraki uzun video: 2026-11-16.
ElevenLabs: `warning: true` (ay içi 237.541 / bütçe 231.442, yenileme 2026-11-20) → karakterler alt uçta
(Shorts ~330–360, uzun ~3.900–4.050).

## Manşet
`tools/news.py --channel db` çalışmadı (bulut ağından Google News'e erişim yok: 403). Web aramasında güncel, havuza uyan
belirli bir manşet bulunamadı → iki video için de konu havuzdan.

## 01 — Kroisos'un kehaneti (Shorts) · `01-kroisos-kehaneti.json`
- **Konu:** Lidya kralı Kroisos, MÖ 6. yy. Delfi'ye sordu; Herodot'a (I.53) göre cevap: "Perslere ordu gönderirse büyük bir
  imparatorluk yıkacak." (Halys'li biçim — "Kroisos Halys'i geçerse büyük bir imparatorluk yıkacak" — Herodot'ta değil, Aristoteles'in
  Retorik'inde geçer.) Herodot I.75'e göre Kızılırmak'ı (Halys) geçti; Pteria'daki ilk savaş sonuçsuz kaldı, Sardes'e döndü; Kiros
  peşinden gelip başkent Sardes'i (Manisa, Salihli) aldı (MÖ ~547/546). Yıkılan imparatorluk kendisininkiydi. Tarih tartışmalı →
  kesin yıl verilmez. Odun yığını/yağmur rivayeti anlatılmaz. Not: "Karun" (Kur'an'daki Korah) Kroisos değildir; halk deyimindeki
  karışıklık. Anlatımda ve açıklamada geçmez, sadece SEO etiketi olarak kalır.
- **Havuz:** imparatorlukların yükselişi ve çöküşü (Anadolu). Geçmişte Lidya/Kroisos yok.
- **İzleyici sonunda ne hisseder:** soğuk ironi; kehanet yalan söylemedi, insan duymak istediğini duydu.
- **Kanca + kapak:** "Bu kehanet doğru çıktı." ↔ kapak `KEHANET / DOĞRU ÇIKTI` (vurgu: doğru); tek özne: ışık havuzunda,
  ağzı içeriden parlayan Delfi tripodu.
- **Tema:** `kum` (Lidya altını, Anadolu; bir önceki DB videosu `fildisi`).

### Anlatım (tek parça, tur 2)
Bu kehanet doğru çıktı. Yirmi altı asır önce, Lidya kralı Kroisos savaş istiyordu. Önce Delfi'ye sordu.
Cevap geldi: Savaşırsan büyük bir imparatorluk yıkılacak. Kroisos sevindi. Kızılırmak'ı geçti.
İlk savaş sonuçsuz kaldı. Kiros peşinden geldi, Sardes düştü. Herodot'a göre rahibe sonra şöyle dedi: Hangisi, diye sormalıydı.
Yıkılan imparatorluk, onunkiydi. Böyle sessiz hikâyeler için abone olun.

(399 karakter, preview ~29–30 sn. "Kroisos sevindi": Herodot I.54. Pteria sonuçsuz, Kiros Sardes'i aldı: Herodot I.76–84,
Britannica. "Hangisi diye sormalıydı": Herodot I.91. Kesin yıl verilmedi.)

### Çekim listesi
1. "Bu kehanet doğru çıktı." — `bt_kr_tripod` (hook): koyu zeminde dar ışık havuzu, koyu bronz Delfi tripodu (aslan pençeli
   üç ayak, halka kulplar); karedeki tek parlak nokta kazanın içeriden altın parlayan ağzı; ağızdan yumuşak, kalın buhar kıvrımları
   (kulpların arkasından); "doğru"da ağzın çevresinde altın çizgi. Kapak karesi (kapakta yazı açık renk, kapak gölgesi koyu).
2. "Yirmi altı asır önce, Lidya kralı Kroisos savaş istiyordu." — `bt_kr_coin` (gold): tek Lidya altın sikkesi (aslan ve boğa),
   yavaş parıltı; "Kroisos"ta kenarı altın.
3. "Önce Delfi'ye sordu." — `bt_kr_map`: kadrajı dolduran Ege (Yunanistan, Anadolu kıyısı, adalar, italik "Ege"); Sardes
   yanıp söner, altın rota sahne başından denizin üstünde kavis çizer ve "Delfi"de Delfi'ye varır.
4. "Cevap geldi: Savaşırsan büyük bir imparatorluk yıkılacak." — `bt_text`: üstte küçük "SAVAŞIRSAN", ortada "büyük bir
   imparatorluk", "imparatorluk"ta büyük italik vurgu "yıkılacak" (söylendiğinde tam görünür). cue a "imparatorluk", hit "yıkılacak".
5. "Kroisos sevindi. Kızılırmak'ı geçti." — `bt_kr_river`: toprak renkli nehir, mızraklı askerler çapraz sırayla geçer;
   "geçti"de öndeki sancak altın.
6. "İlk savaş sonuçsuz kaldı. Kiros peşinden geldi, Sardes düştü." — `bt_kr_sardes`: aşınmış, dişli sırtlı sarp kaya, çentiklerden
   inen oyuklar, zirvede surlar; kalın kıvrımlı duman; "düştü"den hemen önce surların ardında sıcak kırmızı-altın ışık, kararma.
7. "Herodot'a göre rahibe sonra şöyle dedi: Hangisi, diye sormalıydı." — `bt_kr_tripod` (pythia): tapınakta tripodun üstünde
   peçeli rahibe, defne dalı, yarıktan buhar; "Hangisi"de ışık daralır.
8. "Yıkılan imparatorluk, onunkiydi." — `bt_kr_coin` (crack): "imparatorluk"ta sikke çatlar, yarımlar ayrılır, altın söner.
9. "Böyle sessiz hikâyeler için abone olun." — `bt_kr_ruins`: bugün Sardes, Artemis Tapınağı'nın iki İon sütunu, güneş iner.

Kapak adayları, tur 3 (hepsi `KEHANET / DOĞRU ÇIKTI`, vurgu "doğru"; Shorts'ta kapak = ilk kare kancası, ilk cümleyle aynı
fikir olmalı, o yüzden metin sabit, özne değişti; üçü de üretildi ve yan yana karşılaştırıldı):
(a) sahne 0 koyu tripod, t 1,6; (b) sahne 7 çatlak sikke, t 2,0; (c) sahne 6 rahibe, t 3,6.
**Seçilen: (a)** — koyu zemin, tek parlak nokta (kazanın ağzı), açık renk yazı; küçükte en okunur ve en ürkütücü. (b) açık
zeminde sikke, "kehanet" fikrini taşımıyor; (c) siluet küçükte karışıyor, kare açık ve sakin.

Sahne kodu: `scenes/studio/shots/bt_kroisos.js` (`bt_kr_tripod`, `bt_kr_coin`, `bt_kr_map`, `bt_kr_river`, `bt_kr_sardes`,
`bt_kr_ruins`); yazı `bt_text`.

### Kaynaklar
- Herodot, Tarih I.53 ve I.91 (Perseus İngilizce çeviri) — kehanet ve "hangi imparatorluk" sorusu.
- Britannica — Croesus (MÖ 560–546, Halys'te sonuçsuz savaş, Sardes'in düşüşü, altın/gümüş sikkeler).
- Livius — Croesus (kehanet, Pteria, Sardes, odun yığını rivayetine kuşku).

### Eleştiri günlüğü (01)

#### 01-kroisos-kehaneti — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 7 | 7 | 7 | 8 | 7 | 7 | 8 | 7 |
1. Doğruluk: "Kroisos, yani Karun" yanlış (Karun = Korah); "Ama Kiros başkenti aldı" nehirden hemen sonra düşüş izlenimi.
2. Senaryo/tempo: 27 sn < 28; sahne 2 kopuk; "Kroisos sevindi" ironisi yok; sahne 7 Türkçesi aksıyor.
3. Görsel/kapak: bt_text'te "yıkılacak" cue anında soluk; nehir gri-mavi, soldaki asker kesik; kapak ürün fotoğrafı gibi, karanlık/ürkütücü değil.

**Yazarın düzeltmeleri (tur 1 → 2):** Karun anlatımdan ve açıklamadan çıktı (etiket kaldı); "İlk savaş sonuçsuz kaldı. Kiros peşinden
geldi, Sardes düştü."; sahne 2 akan cümle; "Kroisos sevindi." eklendi; sahne 7 "Herodot'a göre rahibe sonra şöyle dedi: Hangisi,
diye sormalıydı."; açıklamaya Pteria eklendi. bt_text: "SAVAŞIRSAN / büyük bir imparatorluk / yıkılacak", "yıkılacak" bir kelime önce
("imparatorluk") belirir. Nehir suyu `paperDark`+`inkSoft` karışımı; asker 70 px sağa. Kanca/kapak: tripod %15 büyük ve kapakta
yazının altına oturacak kadar aşağıda (halka kulplar görünür), kazanın ağzı içeriden altın parlar (nabız gibi), ağzından yoğun
kıvrılan buhar, yarık ve zemin altta, kenarları ve altı koyulaştıran radyal karartma. 399 karakter, ~29–30 sn.

#### 01-kroisos-kehaneti — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 9 | 8 | 7 |
1. Kapak: üst yarı açık kum, karartma sadece altta; ağız ışığı tek parlak nokta değil, buhar gri kıl çizgisi, kulpların üstüne biniyor.
2. Sahne 3 harita: altın rota görünmüyor, harita üst üçte birde, altı boş, "Sardes" kıyıya biniyor.
3. Sahne 6 Sardes: kaya pasta dilimi/silindir gibi; duman ince; "düştü"de sıcak ışık zayıf.

**Yazarın düzeltmeleri (tur 2 → 3):** Kanca sahnesi tamamen koyu (temanın mürekkebinden koyu zemin), dar ışık havuzu, tripod koyu
bronz; tek parlak nokta kazanın ağzı (büyük altın parıltı, nabız gibi); buhar üç katman yumuşak, kalın kıvrım, kulpların arkasından;
yarık kaldırıldı. Sahne kapak olarak gösterilirken kapak gölgesi koyu, yazı açık renk olur (sahne kodu kapak anında `#covershade` ve
`#covertext` öğelerine inline stil verir, kapak dışında temizler; ortak dosyaya dokunulmadı). Harita yeni `bt_kr_map` tipi: kadrajı
dolduran Ege, deniz koyu/kara açık, rota sahne başından çizilir ve "Delfi"de varır (`--times 6.2,6.9,7.45` ile doğrulandı), etiketler
kıyıdan uzak. Sardes: asimetrik, aşınmış, dişli sırtlı kaya ve oyuklar; duman kalın ve kıvrımlı; sıcak ışık "düştü"den 0,9 sn önce
gelir. 3 kapak adayı üretildi (yukarıda), (a) seçildi.

## 02 — Çiçek aşısı ve Lady Montagu (uzun) · `02-cicek-asisi-istanbul.json`
- **Konu:** 1717, İstanbul. İngiliz elçinin karısı Lady Mary Wortley Montagu (kendisi çiçekten yüzünde iz taşıyor, kardeşini
  çiçekten kaybetmiş) Edirne/İstanbul'da yaşlı kadınların "aşılama" (variolasyon) yaptığını görür, 1 Nisan 1717 mektubu
  (Sarah Chiswell'e). 1718'de Pera'da oğlunu aşılatır (elçilik cerrahı Charles Maitland). 1721 Londra salgını: kızını
  aşılatır; Newgate hapishanesinde mahkûmlar üzerinde deney (Ağustos 1721, 6 mahkûm, serbestlik karşılığı) → kraliyet
  çocukları aşılanır. Kilise ve doktorların karşı çıkışı. 1796 Jenner (inek çiçeği) → 1980 DSÖ çiçek hastalığının
  yok edildiğini ilan eder. Ayrıca Osmanlı'da uygulama (Timoni ve Pylarini'nin 1714 Royal Society raporları).
  Rakamları doğrula; emin olmadığın sayıyı yazma.
- **Havuz:** Türkiye ve Osmanlı tarihi + keşifler ve icatlar (haftanın Osmanlı/Türkiye videosu).
- **Soğuk açılış:** Pera 1718, bir annenin çocuğunun koluna bir iğneyle hastalığın kendisini koyması (en dramatik an).
  Açık döngü: "Bir hastalık, kendisiyle nasıl yenildi?" / "Bu yaşlı kadınlar neyi biliyordu?"
- **İzleyici sonunda ne hisseder:** ürpertiyle karışık hayranlık; dünyayı kurtaran bilgi İstanbul'da bir sokakta, yaşlı bir
  kadının ceviz kabuğundaydı.
- **Kapak fikri:** ışık havuzunda ceviz kabuğu + iğne (yaşlı kadının aşı takımı). `ÇARE / İSTANBUL'DAYDI` (vurgu:
  İstanbul'daydı) ya da `HASTALIĞI / KOLUNA KOYDU`.
- **Tema:** `obsidyen` (gece, salgın, mum ışığı; Shorts `kum`'dan farklı).
- Anlatım, bölümler, çekim listesi, kaynaklar, eleştiri günlüğü: yazar ajanlar aşağıya ekler.

### Anlatım (baş yazar, tek parça; 4.025 karakter = sahne metinleri boşlukla birleşik, lint ölçüsü)
Doğrulandı: python ile sayıldı; '-yor' ile biten cümle 0/86 ('-yordu' geçmiş zaman); devrik cümle yok; 'Peki', 'inanılmaz', kısaltma yok. Bölüm sonları ve her ~840 karakter lint HOOK kontrolünden geçiyor (simülasyon).

İstanbul, Pera. Mart 1718. Beş yaşına yaklaşan bir çocuk, kolunu uzatmış bekliyordu. Karşısında yaşlı bir kadın vardı. Elinde bir iğne. Önünde küçük bir ceviz kabuğu. Kabuğun içinde, dünyanın en korkulan hastalığı vardı. Kadın iğneyi çocuğun derisine batırdı… ve hastalığı içeri koydu. Bunu isteyen, çocuğun annesiydi. Bir anne, çocuğunu bir hastalıktan korumak için neden o hastalığın kendisini onun koluna koydurur?

Bu annenin adı Mary'ydi. Leydi Mary Wortley Montagu. Ve bu hastalığı herkesten iyi tanıyordu. Adı çiçek hastalığıydı. Yakalananların yaklaşık üçte biri ölürdü. Kurtulanların yüzünde ömür boyu izler kalırdı. 1713'te Mary'nin kardeşi bu hastalıktan öldü. İki yıl sonra sıra ona geldi. Mary kurtuldu. Ama yüzünde derin izler kaldı, kirpikleri döküldü. 1716'da kocası İstanbul'a elçi olarak atandı. Ama orada, Osmanlı topraklarında, Mary'yi bir sır bekliyordu.

1717 baharında aile Edirne'deydi. 1 Nisan'da Mary, Londra'daki bir arkadaşına bir mektup yazdı. Bu topraklarda, diye yazdı, çiçek hastalığı bizdeki kadar korkunç değil. Her eylül yaşlı kadınlar evleri dolaşırdı. Yanlarında, hafif bir çiçek yarasından alınmış irinle dolu bir ceviz kabuğu olurdu. Büyük bir iğneyle deriyi açar, iğnenin ucuna sığacak kadarını içeri koyarlardı. Çocuklar birkaç gün ateşlenir, sonra iyileşirdi. Mary, bundan ölen birini duymadığını yazdı. Avrupa aslında bunu biliyordu. 1714'te İstanbul'daki iki hekim, Timoni ve Pylarini, bu yöntemi Londra'daki Kraliyet Bilim Derneği'ne anlatmıştı. Ama kimse ciddiye almamıştı. Mary ise okumakla yetinmedi. Bir yıl sonra kocası şehirde yokken, elçiliğin cerrahı Charles Maitland'ı çağırdı. Pera'dan yaşlı bir Rum kadın geldi. Ve iğne, Mary'nin oğlu Edward'ın koluna girdi. Çocuk birkaç gün ateşlendi ve iyileşti. Ama asıl sınav İstanbul'da değil, Londra'daydı.

1721 baharında Londra'da çiçek salgını başladı. Mary yine Maitland'ı çağırdı. Bu kez küçük kızı aşılandı. Üç hekim tanık olarak izledi. Ama bir annenin cesareti, hekimleri ikna etmeye yetmedi. Kanıt istediler. Ve kanıt, hiç beklenmedik bir yerden geldi. Ağustos 1721'de Newgate Hapishanesi'nde idamı bekleyen altı mahkûma bir teklif yapıldı. Aşıya razı olurlarsa serbest kalacaklardı. Altısı da kabul etti. Altısı da yaşadı ve bağışlandı. Ertesi yıl Galler Prensesi Caroline, kendi kızlarını aşılattı. Ama karşı çıkanlar da sesini yükseltti. Bazı hekimler bunu bir halk batıl inancı diye küçümsedi. 1722'de bir din adamı vaazında aşıyı tehlikeli ve günah ilan etti. Üstelik aşılananların bazıları gerçekten öldü. Bu tehlikeli oyun neden işe yarıyordu?

Cevap, iğnenin girdiği yerdeydi. Çiçek hastalığı normalde nefesle bulaşır, bütün bedene yayılırdı. Ama yaşlı kadınlar onu deriden, çok küçük bir dozla veriyordu. Büyük olasılıkla bu yol, beden için daha yavaş ve daha hafif bir savaş demekti. Ve bu savaşı bir kez kazanan beden, düşmanını unutmazdı. Çiçek, bir kişiye ikinci kez gelmezdi. Hekim James Jurin sayıları topladı. Doğal yoldan yakalananların yaklaşık sekizde biri ölüyordu. Aşılananlarda bu oran ellide bire düşüyordu. Ama ellide bir de hâlâ bir ölümdü. Daha güvenli bir yol var mıydı?

Cevap bir ahırdaydı. Köy hekimi Edward Jenner, eski bir köylü inancını ciddiye aldı: inek çiçeği geçiren sağımcılar, çiçeğe yakalanmazdı. 1796 baharında Jenner, bir sağımcının elindeki yaradan aldığı sıvıyı sekiz yaşındaki James Phipps'in koluna koydu. Haftalar sonra çocuğa gerçek çiçeği verdi. Hiçbir şey olmadı. Aşının batıdaki adı, Latincede inek demek olan vakka kelimesinden geldi. Ama hastalık kolay pes etmedi. Yalnızca yirminci yüzyılda yüz milyonlarca insanı öldürdü. 8 Mayıs 1980'de Dünya Sağlık Örgütü, çiçek hastalığının yeryüzünden silindiğini ilan etti. İnsanlığın tamamen yok ettiği ilk hastalıktı. Bir hastalık, kendisiyle nasıl yenildi? Ona küçük bir doz verildi, beden öğrendi. Ve bu yolun başında, İstanbul'da bir ceviz kabuğu ve yaşlı bir kadının eli vardı. Sizce bu hikâyenin asıl kahramanı kim: Mary mi, yoksa adını bilmediğimiz o yaşlı kadın mı? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun.

### Bölümler
- Sahne 0–5 (6 sahne): soğuk açılış (sahne 0, `chapter` alanı "Pera, 1718", tipi chapter DEĞİL)
- Sahne 6–11 (6 sahne): I Yüzdeki iz · 1713 – 1716
- Sahne 12–21 (10 sahne): II Ceviz kabuğu · Edirne, 1717
- Sahne 22–31 (10 sahne): III Kanıt · Londra, 1721 (chapter alanı "Londra, 1721")
- Sahne 32–38 (7 sahne): IV İğnenin yeri · neden işe yaradı? (chapter alanı "Neden işe yaradı?")
- Sahne 39–48 (10 sahne): V İnek çiçeği · 1796 – 1980
- Bölüm kartları (`bt_chapter`): sahne 6, 12, 22, 32, 39. Sahne 0 `bt_mw_room` + `"chapter": "Pera, 1718"`.

### Sahne ajanları: A / B sınırı
- **A = sahne 0–21** (soğuk açılış + I + II) → `scenes/studio/shots/bt_montagu.js`. A'nın tipleri (B de kullanır; **bütün modlarını A yazar**):
  `bt_mw_room` (child, woman, mother, all, two), `bt_mw_nutshell` (closed, open, hand), `bt_mw_arm` (prick, dose, skin, jenner),
  `bt_mw_candle` (out; P.label), `bt_mw_face` (scars, mirror), `bt_mw_letter` (write, line + P.text), `bt_mw_street`,
  `bt_mw_journal` (book), `bt_mw_figure` (who: maitland), `bt_mw_pera`.
  B'nin kullandığı A modları: sahne 31 `bt_mw_candle out`, 34 `bt_mw_arm skin`, 41 `bt_mw_arm jenner`, 46 `bt_mw_nutshell hand`,
  47 `bt_mw_room two`, 48 `bt_mw_pera`. A önce bunları bitirir; B kendi sahnelerini önce test eder, bu altı sahneyi en son bağlar.
- **B = sahne 22–48** (III + IV + V) → `scenes/studio/shots/bt_montagu_b.js`. B'nin yeni tipleri:
  `bt_mw_girl`, `bt_mw_newgate` (gate, cell, free), `bt_mw_royal`, `bt_mw_doctors` (turn), `bt_mw_pulpit`, `bt_mw_body` (breath, immune),
  `bt_mw_routes` (nefes ↔ deri iki sütun), `bt_mw_ratio` (P.n 8|50, label), `bt_mw_barn`, `bt_mw_globe` (dark, clear).
- Mevcut tipler: `bt_text` (5, 45), `bt_count` (7, 26), `bt_map` (11, 21), `bt_word` (42; `icon` vermeden), `bt_chapter`.
- İsteğe bağlı `photo` (gerçek belge): sahne 18 Philosophical Transactions 1714 (Timoni) sayfası, sahne 30 Massey'nin 1722 vaazının kapak
  sayfası (Wellcome Collection); bulunamazsa çizim tipi.
- İnsanlar yüzsüz siluet (`BTL.person` ya da dönem kıyafetli kendi siluet: geniş etek, üç köşeli şapka, peruk, başörtüsü).
  Kanlı/iğrenç çizim yok: "irin" sadece ışık, çiçek izleri çok ince noktalar. Tema `obsidyen`: mum alevi `ink`, ışık `BTL.glow`.

### Çekim listesi (49 sahne)
| # | Bölüm | Metin | Visual (tek özne) | Tip | Cue | Dosya |
|---|---|---|---|---|---|---|
| 0 | Pera, 1718 | İstanbul, Pera. Mart 1718. Beş yaşına yaklaşan bir çocuk, kolunu uzatmış bekliyordu. | Gece, mum ışığında sade bir oda: alçak sedirde oturan küçük bir çocuk silueti, bir kolunu öne uzatmış; yanında tek mum (alev yavaş). Pencereden uzakta Haliç üstünde Pera yamacının silueti. | `bt_mw_room {mode:'child'}` | kolunu | A |
| 1 |  | Karşısında yaşlı bir kadın vardı. Elinde bir iğne. Önünde küçük bir ceviz kabuğu. | Aynı oda, plan değişir: çocuğun karşısında başörtülü, hafif eğik yaşlı kadın silueti belirir; 'iğne'de elinde ince bir iğne altın parlar; 'ceviz'de önündeki küçük sehpada ceviz kabuğu ışık havuzunda. | `bt_mw_room {mode:'woman'}` | iğne | A |
| 2 |  | Kabuğun içinde, dünyanın en korkulan hastalığı vardı. | Işık havuzunda tek, kapalı ceviz kabuğu (iki yarım, kıvrımlı damarlı yüzey) kendini çizer; 'korkulan'da iki yarımın arasındaki ince yarıktan soluk altın bir ışık sızar. | `bt_mw_nutshell {mode:'closed'}` | korkulan | A |
| 3 |  | Kadın iğneyi çocuğun derisine batırdı… ve hastalığı içeri koydu. | Aşırı yakın plan: çocuğun ön kolunun yumuşak çizgisi; yukarıdan iğne yavaşça iner, 'batırdı'da ucu deriye değer; 'koydu'da iğne ucundaki minik altın damla deriye geçer, yerinde küçük bir nokta kalır. | `bt_mw_arm {mode:'prick'}` | batırdı | A |
| 4 |  | Bunu isteyen, çocuğun annesiydi. | Odanın geniş planı: kapı aralığında geniş etekli, 18. yüzyıl elbiseli, ayakta duran kadın silueti (yüzsüz); önde soluk çocuk ve yaşlı kadın; 'annesiydi'de kadının üstüne yumuşak ışık düşer. | `bt_mw_room {mode:'mother'}` | annesiydi | A |
| 5 |  | Bir anne, çocuğunu bir hastalıktan korumak için neden o hastalığın kendisini onun koluna koydurur? | Işık havuzunda büyük ince 'neden?'; altında küçük italik 'hastalığın kendisi' belirir. | `bt_text` | neden | — |
| 6 | Yüzdeki iz | Bu annenin adı Mary'ydi. Leydi Mary Wortley Montagu. | Bölüm kartı: altın 'I', ince çizgi, büyük ince 'Yüzdeki iz', italik '1713 – 1716'. | `bt_chapter {n:'I', title:'Yüzdeki iz', sub:'1713 – 1716'}` | — | — |
| 7 |  | Ve bu hastalığı herkesten iyi tanıyordu. Adı çiçek hastalığıydı. Yakalananların yaklaşık üçte biri ölürdü. | Karanlıkta düzenli ince işaretler alanı; 'üçte'de her üç işaretten biri altın yanıp söner gibi kararır; etiket 'çiçek hastalığı', not 'üçte biri'. | `bt_count {total:300, hit:100, label:'çiçek hastalığı', note:'üçte biri'}` | üçte | — |
| 8 |  | Kurtulanların yüzünde ömür boyu izler kalırdı. | Işık havuzunda tek, zarif bir yüz profili çizgisi (kadın, saç topuz); 'izler'de yanağında çok küçük, soluk noktalar yavaşça belirir (kanlı/abartılı değil, ince). | `bt_mw_face {mode:'scars'}` | izler | A |
| 9 |  | 1713'te Mary'nin kardeşi bu hastalıktan öldü. | Masada tek mum, yanında küçük oval bir portre çerçevesi (içinde yüzsüz genç erkek silueti); 'öldü'de alev yavaşça söner, ince bir duman yükselir; italik '1713'. | `bt_mw_candle {mode:'out', label:'1713'}` | öldü | A |
| 10 |  | İki yıl sonra sıra ona geldi. Mary kurtuldu. Ama yüzünde derin izler kaldı, kirpikleri döküldü. | Oval el aynası, içinde Mary'nin profili; 'kurtuldu'da ayna ışıklanır; 'kirpikleri'nde kameranın göz çizgisine yaklaştığı yakın planda kirpik çizgileri tek tek solar. | `bt_mw_face {mode:'mirror'} + camera focus göz` | kirpikleri | A |
| 11 |  | 1716'da kocası İstanbul'a elçi olarak atandı. Ama orada, Osmanlı topraklarında, Mary'yi bir sır bekliyordu. | Sade Avrupa haritası: Londra → Viyana → Edirne → İstanbul rotası kendini çizer; 'elçi'de Londra yanar, 'sır'da İstanbul noktası altın atar. | `bt_map {bounds:[-6,36,32,54], points: Londra, Viyana, Edirne, İstanbul; routes}` | sır | — |
| 12 | Ceviz kabuğu | 1717 baharında aile Edirne'deydi. | Bölüm kartı: 'II', 'Ceviz kabuğu', italik 'Edirne, 1717'. | `bt_chapter {n:'II', title:'Ceviz kabuğu', sub:'Edirne, 1717'}` | — | — |
| 13 |  | 1 Nisan'da Mary, Londra'daki bir arkadaşına bir mektup yazdı. Bu topraklarda, diye yazdı, çiçek hastalığı bizdeki kadar korkunç değil. | Mum ışığında masa üstünde mektup kâğıdı; tüy kalem yavaşça ince satırlar çizer; üstte italik '1 Nisan 1717'; 'korkunç'ta bir satır altın italik 'korkunç değil' olarak belirir. | `bt_mw_letter {mode:'write'}` | korkunç | A |
| 14 |  | Her eylül yaşlı kadınlar evleri dolaşırdı. | Gece, ahşap Osmanlı evlerinin sade sokağı (cumbalı siluetler); elinde fener olan eğik yaşlı kadın silueti yavaşça soldan sağa yürür; kapı ışıkları birer birer yanar; italik 'eylül'. | `bt_mw_street` | eylül | A |
| 15 |  | Yanlarında, hafif bir çiçek yarasından alınmış irinle dolu bir ceviz kabuğu olurdu. | Işık havuzunda ceviz kabuğu; üst yarımı yavaşça kalkar, içinde soluk, yoğun bir damla parıltısı (iğrenç değil, sadece ışık). | `bt_mw_nutshell {mode:'open'}` | ceviz | A |
| 16 |  | Büyük bir iğneyle deriyi açar, iğnenin ucuna sığacak kadarını içeri koyarlardı. | Büyütülmüş iğne ucu, ucunda minik altın damla; 'ucuna'da yanında ince ölçü çizgisi ve italik 'iğnenin ucu kadar'. | `bt_mw_arm {mode:'dose'}` | ucuna | A |
| 17 |  | Çocuklar birkaç gün ateşlenir, sonra iyileşirdi. Mary, bundan ölen birini duymadığını yazdı. | Mektuba yakın plan: bir satırın altına tüy kalem yavaşça ince çizgi çeker; altın italik 'ölen yok'. | `bt_mw_letter {mode:'line', text:'ölen yok'}` | duymadığını | A |
| 18 |  | Avrupa aslında bunu biliyordu. 1714'te İstanbul'daki iki hekim, Timoni ve Pylarini, bu yöntemi Londra'daki Kraliyet Bilim Derneği'ne anlatmıştı. | Işık havuzunda kapalı, deri ciltli tek dergi; sırtında italik 'Royal Society'; 'anlatmıştı'da kapağında '1714' belirir; altında küçük 'Timoni · Pylarini'. (İstenirse: Philosophical Transactions 1714 sayfasının gerçek fotoğrafı, `photo`.) | `bt_mw_journal {mode:'book'} (ya da photo)` | 1714 | A |
| 19 |  | Ama kimse ciddiye almamıştı. Mary ise okumakla yetinmedi. Bir yıl sonra kocası şehirde yokken, elçiliğin cerrahı Charles Maitland'ı çağırdı. | Kapı aralığında üç köşeli şapkalı, uzun ceketli bir adam silueti, elinde hekim çantası; yanında italik 'Charles Maitland', altında 'elçilik cerrahı'. | `bt_mw_figure {who:'maitland'}` | Maitland | A |
| 20 |  | Pera'dan yaşlı bir Rum kadın geldi. Ve iğne, Mary'nin oğlu Edward'ın koluna girdi. Çocuk birkaç gün ateşlendi ve iyileşti. | Soğuk açılıştaki odaya dönüş, üçü birlikte: anne, çocuk, yaşlı kadın; 'girdi'de iğne parlar; 'iyileşti'de pencereden sabah ışığı girer, mum söner. | `bt_mw_room {mode:'all'}` | girdi | A |
| 21 |  | Ama asıl sınav İstanbul'da değil, Londra'daydı. | Harita: İstanbul'dan Londra'ya doğru ince altın rota; 'Londra'daydı'da Londra noktası atar. | `bt_map {İstanbul → Londra}` | Londra'daydı | — |
| 22 | Londra, 1721 | 1721 baharında Londra'da çiçek salgını başladı. | Bölüm kartı: 'III', 'Kanıt', italik 'Londra, 1721'. | `bt_chapter {n:'III', title:'Kanıt', sub:'Londra, 1721'}` | — | — |
| 23 |  | Mary yine Maitland'ı çağırdı. Bu kez küçük kızı aşılandı. Üç hekim tanık olarak izledi. | İngiliz odası (yüksek pencere): sandalyede küçük kız silueti kolunu uzatmış, eğilmiş Maitland; 'Üç'te arkada peruklu üç hekim silueti birer birer belirir. | `bt_mw_girl` | Üç | B |
| 24 |  | Ama bir annenin cesareti, hekimleri ikna etmeye yetmedi. Kanıt istediler. Ve kanıt, hiç beklenmedik bir yerden geldi. | Gece, ağır taş bir hapishane kapısı (kemer, demir kapı, tek fener); yavaş çözülme. | `bt_mw_newgate {mode:'gate'}` | beklenmedik | B |
| 25 |  | Ağustos 1721'de Newgate Hapishanesi'nde idamı bekleyen altı mahkûma bir teklif yapıldı. | İçeriden: parmaklıklı yüksek pencere, ay ışığı şeridi; yerde oturan altı yüzsüz siluet; italik 'Newgate · 1721'. | `bt_mw_newgate {mode:'cell'}` | altı | B |
| 26 |  | Aşıya razı olurlarsa serbest kalacaklardı. Altısı da kabul etti. | Karanlıkta altı dikey ince çizgi (altı insan); 'kabul'de altısı da birer birer altın yanar; etiket 'altı mahkûm'. | `bt_count {total:6, hit:6, label:'altı mahkûm'}` | kabul | — |
| 27 |  | Altısı da yaşadı ve bağışlandı. | Aynı kapı, gün doğumu: demir kapı yavaşça açılır, içeriden ışık, altı siluet dışarı yürür. | `bt_mw_newgate {mode:'free'}` | bağışlandı | B |
| 28 |  | Ertesi yıl Galler Prensesi Caroline, kendi kızlarını aşılattı. | Işık havuzunda yastık üstünde küçük bir taç; arkasında iki küçük kız silueti; italik 'Prenses Caroline', '1722'. | `bt_mw_royal` | kızlarını | B |
| 29 |  | Ama karşı çıkanlar da sesini yükseltti. Bazı hekimler bunu bir halk batıl inancı diye küçümsedi. | Peruklu üç hekim silueti; 'küçümsedi'de birer birer sırtlarını döner; yerde basılı bir broşür. | `bt_mw_doctors {mode:'turn'}` | küçümsedi | B |
| 30 |  | 1722'de bir din adamı vaazında aşıyı tehlikeli ve günah ilan etti. | Kilise içi: yüksek ahşap kürsü, kollarını kaldırmış vaiz silueti; 'günah'ta altın italik 'günah'. (İstenirse Edmund Massey'nin 1722 vaazının gerçek kapak sayfası, Wellcome, `photo`.) | `bt_mw_pulpit (ya da photo)` | günah | B |
| 31 |  | Üstelik aşılananların bazıları gerçekten öldü. Bu tehlikeli oyun neden işe yarıyordu? | Masada tek mum; 'öldü'de alev söner; 'neden'de karanlıkta ceviz kabuğunun silueti soluk belirir. | `bt_mw_candle {mode:'out'}` | öldü | A |
| 32 | Neden işe yaradı? | Cevap, iğnenin girdiği yerdeydi. | Bölüm kartı: 'IV', 'İğnenin yeri', italik 'neden işe yaradı?'. | `bt_chapter {n:'IV', title:'İğnenin yeri', sub:'neden işe yaradı?'}` | — | — |
| 33 |  | Çiçek hastalığı normalde nefesle bulaşır, bütün bedene yayılırdı. | Sade beden silueti (baş, gövde), içinde ince akciğer çizgisi; 'nefesle'de ağızdan içeri soluk noktalar akar, 'yayılırdı'da bütün bedene dağılır. | `bt_mw_body {mode:'breath'}` | nefesle | B |
| 34 |  | Ama yaşlı kadınlar onu deriden, çok küçük bir dozla veriyordu. | Kolun yakın planı: deri çizgisi; tek minik altın nokta deriye girer, çevresinde küçük bir halka. | `bt_mw_arm {mode:'skin'}` | küçük | A |
| 35 |  | Büyük olasılıkla bu yol, beden için daha yavaş ve daha hafif bir savaş demekti. | İki sütun yan yana: solda 'nefes' altında çok sayıda nokta, sağda 'deri' altında birkaç nokta; 'hafif'te sağ sütun altın olur. | `bt_compare-benzeri → bt_mw_routes` | hafif | B |
| 36 |  | Ve bu savaşı bir kez kazanan beden, düşmanını unutmazdı. Çiçek, bir kişiye ikinci kez gelmezdi. | Beden silueti; etrafında ince bir ışık halkası; 'ikinci'de dışarıdan gelen noktalar halkaya çarpıp söner. | `bt_mw_body {mode:'immune'}` | unutmazdı | B |
| 37 |  | Hekim James Jurin sayıları topladı. Doğal yoldan yakalananların yaklaşık sekizde biri ölüyordu. | Sade yüzsüz insan siluetleri sırası: 8 kişi; 'sekizde'de biri yavaşça soluklaşır; italik 'James Jurin', 'sekizde bir'. | `bt_mw_ratio {n:8, label:'doğal yoldan'}` | sekizde | B |
| 38 |  | Aşılananlarda bu oran ellide bire düşüyordu. Ama ellide bir de hâlâ bir ölümdü. Daha güvenli bir yol var mıydı? | 50 küçük siluetlik ızgara; 'ellide'de biri soluklaşır; 'hâlâ'da kamera o tek siluete yaklaşır. | `bt_mw_ratio {n:50, label:'aşılananlar'}` | ellide | B |
| 39 | İnek çiçeği | Cevap bir ahırdaydı. | Bölüm kartı: 'V', 'İnek çiçeği', italik '1796 – 1980'. | `bt_chapter {n:'V', title:'İnek çiçeği', sub:'1796 – 1980'}` | — | — |
| 40 |  | Köy hekimi Edward Jenner, eski bir köylü inancını ciddiye aldı: inek çiçeği geçiren sağımcılar, çiçeğe yakalanmazdı. | Şafakta sade ahır: açık kapı, içeride bir inek silueti, yanında kovalı sağımcı kadın silueti; italik 'Edward Jenner'. | `bt_mw_barn` | sağımcılar | B |
| 41 |  | 1796 baharında Jenner, bir sağımcının elindeki yaradan aldığı sıvıyı sekiz yaşındaki James Phipps'in koluna koydu. Haftalar sonra çocuğa gerçek çiçeği verdi. Hiçbir şey olmadı. | Çocuğun kolu, neşter ucu; 'koydu'da küçük iz; italik 'James Phipps · 8'; 'Hiçbir'de kol değişmeden durur, iz soluklaşır. | `bt_mw_arm {mode:'jenner'}` | Hiçbir | A |
| 42 |  | Aşının batıdaki adı, Latincede inek demek olan vakka kelimesinden geldi. | Kelime kökü: 'vacca' (inek) → 'vaccine' (aşı). | `bt_word {from:{word:'vacca', gloss:'inek'}, to:{word:'vaccine', gloss:'aşı'}}` | vakka | — |
| 43 |  | Ama hastalık kolay pes etmedi. Yalnızca yirminci yüzyılda yüz milyonlarca insanı öldürdü. | Işık havuzunda ince çizgili küre (kıta konturları); üstünde çok sayıda soluk nokta yavaşça belirir. | `bt_mw_globe {mode:'dark'}` | yüz | B |
| 44 |  | 8 Mayıs 1980'de Dünya Sağlık Örgütü, çiçek hastalığının yeryüzünden silindiğini ilan etti. İnsanlığın tamamen yok ettiği ilk hastalıktı. | Aynı küre; noktalar birer birer söner, sonuncusu en son; italik '8 Mayıs 1980'; 'ilk'te kürenin çevresinde ince altın halka. | `bt_mw_globe {mode:'clear'}` | silindiğini | B |
| 45 |  | Bir hastalık, kendisiyle nasıl yenildi? Ona küçük bir doz verildi, beden öğrendi. | Büyük ince 'kendisiyle'; altında italik 'küçük bir doz' belirir. | `bt_text` | doz | — |
| 46 |  | Ve bu yolun başında, İstanbul'da bir ceviz kabuğu ve yaşlı bir kadının eli vardı. | Işık havuzunda yaşlı, ince damarlı bir el; avucunda ceviz kabuğu; 'eli'de ışık biraz büyür. (Kapak adayı.) | `bt_mw_nutshell {mode:'hand'}` | eli | A |
| 47 |  | Sizce bu hikâyenin asıl kahramanı kim: Mary mi, yoksa adını bilmediğimiz o yaşlı kadın mı? Yorumlara yazın. | Solda geniş etekli Mary silueti, sağda başörtülü yaşlı kadın silueti, aralarında tek mum. | `bt_mw_room {mode:'two'}` | kahramanı | A |
| 48 |  | Böyle sessiz hikâyeler için abone olun. | Gece, Pera yamacının silueti, Haliç'te ince su çizgisi; tek pencere ışığı yanık kalır. | `bt_mw_pera` | abone | A |

### Kapak adayları (uzun, 1280×720; `"kasif": false`, `focus` zorunlu, zoom 1,1–1,4)
1. **`ÇARE / İSTANBUL'DAYDI`** (vurgu: İstanbul'daydı) — sahne 46 (`bt_mw_nutshell hand`), t ≈ 3,5; focus = avuçtaki ceviz kabuğu (≈ [1000, 520]). Önerilen.
2. **`HASTALIĞI / KOLUNA / KOYDU`** (vurgu: koluna) — sahne 3 (`bt_mw_arm prick`), t ≈ 3,0 (iğne ucu deride, altın damla); focus = iğne ucu.
3. **`KABUKTAKİ / HASTALIK`** (vurgu: hastalık) — sahne 2 (`bt_mw_nutshell closed`), t ≈ 3,0 (yarıktan sızan altın ışık); focus = kabuğun yarığı.
Başlıktaki "İstanbul" kapakta tekrar ederse 3. aday (ya da 2.) seçilir; karar `cover.jpg`'ler yan yana bakılarak.

### YouTube taslağı
```json
{
 "title": "Çiçek Aşısı: Avrupa Bu Sırrı İstanbul'dan Nasıl Öğrendi?",
 "description": "Çiçek aşısı Avrupa'ya bir laboratuvardan değil, İstanbul'da yaşlı bir kadının ceviz kabuğundan geldi. 1717'de Edirne'de bu uygulamayı gören Leydi Mary Wortley Montagu, bir yıl sonra Pera'da kendi oğlunu aşılattı. Yüzü çiçek izleriyle dolu bu kadın, hastalığın kendisiyle nasıl yenildiğini Londra'ya taşıdı: Newgate Hapishanesi'ndeki altı mahkûm, prensesin kızları ve öfkeli vaazlar. Variolasyondan Edward Jenner'ın inek çiçeğine, oradan 1980'de çiçek hastalığının yeryüzünden silinmesine uzanan sessiz bir hikâye.\n\nBu videoda:\n• Çiçek hastalığı neden bu kadar korkulurdu ve Mary'nin yüzünde ne bıraktı\n• Osmanlı'da yaşlı kadınların \"aşılama\" yöntemi ve 1 Nisan 1717 mektubu\n• Newgate deneyi: idamı bekleyen altı mahkûma yapılan teklif\n• Variolasyon neden işe yaradı, riski neydi\n• Jenner, James Phipps ve 1980'deki zafer\n\nHer gün yeni bir \"neden?\" için abone ol. Sence bu hikâyenin asıl kahramanı kim: Mary mi, adını bilmediğimiz yaşlı kadın mı? Yorumlara yaz!\n\n#çiçekaşısı #osmanlı #tarih #düşünbakalım",
 "tags": [
  "çiçek aşısı",
  "çiçek aşısı tarihi",
  "çiçek hastalığı aşısı",
  "aşının tarihi",
  "lady mary wortley montagu",
  "lady montagu",
  "variolasyon",
  "çiçek hastalığı",
  "osmanlıda aşı",
  "edward jenner",
  "newgate deneyi",
  "istanbul tarihi",
  "osmanlı tarihi",
  "tıp tarihi",
  "tarih",
  "tarih hikayeleri",
  "düşün bakalım"
 ],
 "category_id": "27",
 "publish_at": "2026-11-14T20:30:00+03:00"
}
```
(başlık 56 kr., açıklama 1003 kr., 17 etiket / 239 kr.; tags[0] "çiçek aşısı": Türkçede "lady montagu"dan çok aranan ifade.)

### Kaynaklar (`sources`, doğrulanmış)
- Fordham Modern History Sourcebook — Lady Mary Wortley Montagu, smallpox letter (Adrianople, "Mrs. S. C."; yaşlı kadınlar, eylül, ceviz kabuğu, iğne, 8 gün): https://fordham.edu/Halsall/mod/montagu-smallpox.asp
- Wikipedia — Lady Mary Wortley Montagu (kardeşi 1713, kendisi Aralık 1715, 1 Nisan 1717 mektubu, Edward Mart 1718, kızı Nisan 1721, prensesler Nisan 1722): https://en.wikipedia.org/wiki/Lady_Mary_Wortley_Montagu
- Wikipedia — Charles Maitland (Pera'lı yaşlı Rum kadın, Maitland gözetiminde; koca bir hafta sonra öğrendi; kızına üç hekim tanık; Newgate 6 mahkûm, hepsi yaşadı ve bağışlandı): https://en.wikipedia.org/wiki/Charles_Maitland_(physician)
- Boylston, J R Soc Med 2010 (James Lind Library) — Newgate Ağustos 1721, altı mahkûm, bağışlanma vaadi, biri zaten çiçek geçirmiş; prenseslerin aşılanması Nisan 1722: https://www.jameslindlibrary.org/wp-data/uploads/2016/08/J-R-Soc-Med-2010-08-Boylston-335-9.pdf
- Royal Society — Smallpox in the archives (Timoni 1714 mektubu; Jurin: aşıyla ≈ 1/50, doğal çiçek ≈ 1/8): https://makingscience.royalsociety.org/in-focus/smallpox-in-the-archives
- Hektoen International — Lady Mary Wortley Montagu and smallpox (1 Nisan 1717, Timonius 1714, Pylarini): https://hekint.org/2020/07/13/lady-mary-wortley-montagu-and-smallpox/
- WHO — History of smallpox vaccination (variolasyon, Jenner Mayıs 1796, 8 yaşındaki Phipps, Temmuz'da çiçekle sınama): https://who.int/news-room/spotlight/history-of-vaccination/history-of-smallpox-vaccination
- WHO — 8 Mayıs 1980, 33. Dünya Sağlık Asamblesi; 20. yüzyılda 300 milyon ölüm: https://www.who.int/news/item/08-05-2020-commemorating-smallpox-eradication-a-legacy-of-hope-for-covid-19-and-other-diseases
- Wellcome Collection — Edmund Massey, *A Sermon against the Dangerous and Sinful Practice of Inoculation* (1722): https://wellcomecollection.org/works/gphhsn39 (doğrulandı: Massey, 1722)

**Doğruluk notları:** Ölüm oranı "yaklaşık üçte biri" (WHO "en az üçte biri", CDC ≈ %30). Mektubun alıcısı kaynaklarda "Mrs. S. C."
(genelde Sarah Chiswell diye tanımlanır) → anlatımda "Londra'daki bir arkadaşına". Newgate: bazı kaynaklar 7 der, Royal Society
ve Boylston 6 → 6. Wikipedia/Maitland'ın "Ağustos 1722" ifadesi hatalı (lisans 9 Ağustos 1721). Kızın aşı yaşı kaynaklarda 3–4 →
"küçük kızı". Jenner tarihi 14 Mayıs (yaygın) / 17 Mayıs (bazı kaynaklar) → "1796 baharında". "Variolasyonun deri yoluyla
neden hafif olduğu" "büyük olasılıkla" ile verildi. "Kör/paslı iğne" anekdotu doğrulanamadı, kullanılmadı. Anlatılmayanlar:
yüz milyonlar için kesin sayı (WHO 300 milyon; anlatımda "yüz milyonlarca"), Sarah Chiswell'in ölümü (doğrulanmadı).

### Eleştiri günlüğü (02)
#### 02-cicek-asisi-istanbul — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 7 | 7 | 8 | 7 | 8 | 8 | 7 | 8 | 7 |

Düzeltmeler (sahne ajanı A; B kendi tiplerini `bt_montagu_b.js`'te düzeltti, JSON yamasını `.02b-patch.json`'dan A uyguladı: 25, 26, 27, 29, 38):
- Doğruluk/metin: 7 "Bazı salgınlarda yakalananların üçte biri ölürdü." (Jurin'in 1/8'iyle çelişki giderildi); 18 "önce 1714'te Timoni, ardından Pylarini"; 23 "Hekimler tanık olarak izledi."; 39 "Cevap, bir İngiliz köyünde, bir ahırdaydı." (bölüm kartı ekranda daha uzun). Karakter 4.025 → 4.067.
- 7: `bt_count` yerine yeni `bt_mw_field` (ortada 300 işaret, 'üçte'de her üçüncüsü soldan sağa altın, altında 'üçte biri'; sayaç yok).
- Bölüm kartları 6, 12, 22, 32, 39: yeni `bt_mw_chapter` (aynı görünüm, başlık ve alt yazı ~1 sn içinde tam görünür).
- 5: cue c1 "anne" (özne ilk kelimelerden itibaren ekranda).
- 10: ayna sapsız ve küçük, göze yaklaşma 1,3× ile sınırlı; çerçeve kadrajda, altyazı şeridi boş.
- 11, 21: yeni `bt_mw_map` (Britanya, İrlanda, Manş ve Kuzey Denizi kıyıları çizildi; Londra adasında).
- 13: mektup kâğıdı yukarı alındı (altyazı şeridinin üstünde), tüy kalem 'korkunç değil' satırının sonuna çekildi.
- 34 (`bt_mw_arm skin`): soyut bant yerine okunur ön kol yakın planı (el, kol, yen); altın doz deriye düşer, deride yayılan halka. Kol sıcak ten rengi.
- Kapak: ceviz çizimi yeniden yapıldı (sivri uç, yükseltili ek yeri, kahverengi kabuk, meridyen boyunca derin kırışıklar; yarım kabuklar da). 3 aday (hepsi `KABUKTAKİ / HASTALIK`): (1) sahne 2 kapalı ceviz, ek yerinden altın ışık; (2) sahne 15 açılan kabuk; (3) sahne 46 eldeki kabuk. **Seçilen (1)**: tek, net, küçükte okunan özne; (3)'te el hâlâ kıskaca benziyor, (2)'de kapak yarımı dağınık.
- Lint hatasız; tam preview'da STATIC? yok.

#### 02-cicek-asisi-istanbul — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 7 | 8 | 8 | 8 | 8 | 8 | 9 | 8 | 8 |

Geçti. Tur 3 (cila, metin değişmedi):
- 46 (`bt_mw_nutshell hand`): el yeniden çizildi: avuç yukarı, eklem çizgili dört ayrı parmak, kabuğun arkasında yükselen başparmak, avuç çizgileri, bilekte ince damarlar, yen.
- 9: cue "öldü" → "kardeşi"; mum sahne bitmeden söner, duman yükselir.
- 19: "elçilik cerrahı" ink renginde ve 54 px; 7: "üçte biri" 110 px, cue'dan hemen sonra tam opak.
- Kapak/ceviz: kırışıklar daha az, daha düz ve temiz (karalama görüntüsü azaldı); kapak aynı (sahne 2, t 3,4).
- Lint hatasız; sahne 2, 7, 9, 19, 46 ve kapak preview'da kontrol edildi.

## Son kapı (yönetmen)
- Konular birbirinden ve geçmişten farklı (Lidya/Kroisos ve Montagu/çiçek aşısı daha önce işlenmedi); temalar `kum` / `obsidyen` (önceki DB videosu `fildisi`).
- Son tur puanları — 01 (tur 3): 8·8·8·8·8·8·8·8·9·8, kapak 8. 02 (tur 2 + cila): 8·9·7·8·8·8·8·8·9·8, kapak 8.
- cover.jpg ve sheet.png'ler yönetmen tarafından görüldü; lint hatasız.
