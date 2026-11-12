# Düşün Bakalım — 2026-11-12 (belgesel tarzı)

Manşet taraması: `tools/news.py --channel db` bu ortamdan erişilemedi (proxy 403, Google News tüneli). Web aramasıyla
Türkiye arkeoloji/tarih manşetleri tarandı:
- **Uzun (02):** manşet bulundu → *"Ani'de Selçuklu Çarşısı'ndaki kazılarda 5 büyük küplü erzak deposuna ulaşıldı"*
  (gzt.com, 20.07.2026; 2026 kazı sezonu 31 Aralık'a kadar sürüyor, 6 noktada ~100 kişilik ekip). Havuz: kayıp şehirler
  ve gizemler (plan.py kategorisiyle aynı). Türkiye tarihi (haftalık kota).
- **Short (01):** havuza uyan, siyaset/ölüm/suç dışı bir manşet bulunamadı (Van Gölü'nde Rus şilebi haberi savaş dönemi
  ve ayrıntısız) → **havuza dönüldü**: felaketler ve kazalar (plan.py kategorisi).

ElevenLabs uyarısı: `warning: true` — ay içi 226.643 / bütçe 231.442 (kalan ≈ 4.800), yenilenme 20 Kasım.
→ **Karakterler alt uçta ve sıkı tavanla:** Short **330–345**, uzun **3.900–3.990**. Toplam 4.335'i geçmesin.

Paletler: önceki Düşün Bakalım videosu **grafit** (11-11 Short) → Short **derin** (deniz, soğuk karanlık su), uzun **kum**
(Anadolu, antik kent, kızıl taş ve bozkır).

---

## 01 — Short · `01-vasa-gemisi.json` · publish_at 2026-11-12T19:00:00+03:00
- Konu: İsveç savaş gemisi **Vasa**. 10 Ağustos 1628 Pazar, ilk yolculuğu; Stockholm limanından ayrıldı, bir kilometre
  kadar gitti (Britannica ~1.130 m; kesin metre yazma), hafif bir rüzgâr ve ikinci bir esintiyle yan yattı, alt
  top kapaklarından su girdi, ~120 m kıyıdan, ~32 m derine battı. Gemideki ~150 kişiden **yaklaşık 30'u** öldü.
  Neden: üstü ağır (iki top güvertesi, ağır toplar ve süslemeler), dengesine göre dar/alçak gövde ve az safra.
  Sorgu yapıldı, kimse cezalandırılmadı. **333 yıl** dipte kaldı; Anders Franzén 1956'da yerini buldu; **24 Nisan
  1961'de** yüzeye çıkarıldı. Baltık'ın soğuk ve az tuzlu suyunda ahşap yiyen gemi kurdu (Teredo) yaşayamadığı için
  gövde büyük ölçüde sağlam kaldı (müze: dünyanın en iyi korunmuş 17. yy gemisi). Bugün Stockholm'deki Vasa Müzesi'nde.
  DİKKAT: "kral bizzat ölçüleri değiştirdi" anlatısı tartışmalı → kullanma. "20/25 dakika" kaynaklara göre değişir →
  "yarım saat bile" gibi güvenli ifade.
- İzleyici sonunda ne hisseder: Bir krallığın gururunun limanın ortasında, herkesin gözü önünde batmasının sessiz
  ironisi; ve onu öldüren denizin onu saklamış olması.
- Kanca/kapak: ilk cümle örn. "Bu gemi yarım saat bile yüzemedi." ↔ kapak "YARIM SAAT **YÜZDÜ**" (aday: "333 YIL
  **DİPTE**", "DENİZ ONU **SAKLADI**"). Kapak: derin karanlıkta ışık havuzunda tek, yana yatmış ya da dipte yatan
  gemi silueti. En az 3 aday.
- Punchline: "Onu batıran deniz, onu üç yüz yıl sakladı." (benzeri) + "Böyle sessiz hikâyeler için abone olun."
- related: `videos/2026-11-10/02-uluburun-batigi.json` (batık, deniz altı hikâyesi).
- Başlık önerisi: "Vasa Gemisi: İlk Yolculuğunda Neden Battı?" · tags[0] "vasa gemisi".

### Anlatım (yönetmen taslağı; yazar doğrular, sesli okur gibi düzeltir, 330–345 karaktere getirir)
Bu gemi yarım saat bile yüzemedi. Stockholm, 10 Ağustos 1628. Vasa, krallığın en güçlü savaş gemisiydi. Ama ağır
toplar çok yukarıdaydı. Hafif bir rüzgâr onu yana yatırdı. Su, açık top kapaklarından içeri doldu. Gemi limanın
ortasında, herkesin gözü önünde battı. Üç yüz otuz üç yıl karanlıkta bekledi. Onu batıran deniz, onu sakladı. Böyle
sessiz hikâyeler için abone olun.

### Çekim listesi (yazar ayrıntılandırır; 8–10 sahne, en az 4 tip; yeni nesneler `bt_vasa.js`)
| # | Cümle | Görsel | Tip | Kamera |
|---|---|---|---|---|
| 1 | Bu gemi yarım saat bile yüzemedi. | Karanlık suda yana yatmış tek gemi silueti, ışık havuzu (ilk kare dolu = kapak) | bt_vasa_* | yavaş itme |
| 2 | Stockholm, 10 Ağustos 1628. | Sade kıyı/liman haritası, yanıp sönen nokta | bt_map | — |
| 3 | Vasa, krallığın en güçlü… | Tam yelkenli gemi profili, kendini çizen çizgi | bt_vasa_* | — |
| 4 | Ama ağır toplar çok yukarıdaydı. | Gövde kesiti: iki sıra top, ağırlık merkezi yükseğe çıkıyor | bt_vasa_* | yakın |
| 5 | Hafif bir rüzgâr onu yana yatırdı. | Gemi yavaşça yatar, su çizgisi | bt_vasa_* | — |
| 6 | Su, açık top kapaklarından… | Yakın: top kapağı, içeri akan su | bt_vasa_* | yakın |
| 7 | Gemi limanın ortasında… battı. | Yüzeyden yavaşça batan direkler | bt_dip / bt_vasa_* | — |
| 8 | Üç yüz otuz üç yıl… | Dipte yatan gövde + sayaç 333 | bt_count / bt_vasa_* | — |
| 9 | Onu batıran deniz, onu sakladı. | Gerçek Vasa fotoğrafı (müzede) ya da dipten yükselen gövde | photo / bt_vasa_* | yavaş itme |
| 10 | Böyle sessiz hikâyeler için abone olun. | Karanlık suda gemi silueti | bt_vasa_* | — |

### Yazar — son hâl (01-vasa-gemisi)
Anlatım (343 karakter — tur 1 sonrası metin aşağıdaki günlükte, yine 343; 10 sahne, "-yor" 0/10, devrik cümle yok):
Bu gemi yarım saat bile yüzemedi. Stockholm, 10 Ağustos 1628. Vasa, krallığın en güçlü gemisiydi. Ama ağır topları
çok yukarıdaydı. Hafif bir rüzgâr onu yana yatırdı. Su, açık top kapaklarından içeri doldu. Herkesin gözü önünde battı.
Üç yüz otuz üç yıl karanlıkta kaldı. Onu batıran deniz, onu sakladı. Böyle sessiz hikâyeler için abone olun.

Sahneler: bt_vasa_ship (hook) · bt_vasa_harbor (date) · bt_vasa_ship (profile) · bt_vasa_front (section) ·
bt_vasa_front (heel) · bt_vasa_port · bt_vasa_harbor (watch) · bt_count (333 yıl) · bt_vasa_deep (kept) · bt_vasa_deep (rise).
Yeni tipler `scenes/studio/shots/bt_vasa.js`. Fotoğraf yok (media.py proxy 403). Kapak: "YARIM SAAT / BİLE **YÜZEMEDİ**"
(sahne 0, ilk cümleyle aynı); denenen adaylar "333 YIL **DİPTE**" (sahne 8, altın çizgili gövde) ve "HERKESİN GÖZÜ
**ÖNÜNDE**" (sahne 6, rıhtımdaki siluetler) — ilk 2 saniyenin kancasıyla aynı kare olduğu için A seçildi.
Kaynaklar: Britannica (Vasa warship), Vasamuseet (excavation), Vrak (1628 Vasa).

---

## 02 — Uzun · `02-ani-antik-kenti.json` · publish_at 2026-11-12T20:30:00+03:00
- Konu: **Ani** (Kars, Arpaçay kıyısı; UNESCO Dünya Mirası 2016). "Bin bir kilise şehri", "Anadolu'nun giriş kapısı".
  Yükseliş: 961'de Bagratlı (Ermeni) krallığının başkenti oldu; İpek Yolu kollarında zengin ticaret şehri; 1001'de
  tamamlanan katedral (mimar Trdat; aynı mimar Ayasofya kubbesini 989 depreminden sonra onarmıştı — doğrula).
  Kıvılcım: 1045 Bizans ilhakı; **1064'te Alp Arslan** kuşatıp aldı (Malazgirt'ten 7 yıl önce). Sonra Şeddadiler,
  Gürcüler, el değiştirmeler; **1236 Moğollar**; **1319 depremi**; ticaret yolunun kayması; şehir yavaşça boşaldı,
  büyük olasılıkla 17.–18. yüzyılda tamamen terk edildi. Ebu'l-Menuçehr Camii (Anadolu'daki ilk Türk camilerinden
  sayılır). Nüfus: "100.000" iddiası tartışmalı → "büyük olasılıkla on binlerce" gibi temkinli ifade ya da hiç.
  Bugün: 2026 kazısında Selçuklu Çarşısı'nda her biri 1 metreyi aşan, ağzı ~50 cm, S biçimli kabartmalı **beş dev
  küp** (pitos), büyük olasılıkla bakliyat gibi kuru erzak deposu (gzt, 20.07.2026).
  **Hassasiyet:** tarafsız, belgesel dili; şehrin Ermeni, Bizans, Selçuklu, Gürcü, Moğol katmanları olduğu gibi,
  yorum yapmadan anlatılır. Bugünkü siyaset, sınır, soykırım tartışması, köprü/sınır haberleri **yok**.
- Asıl soru (açık döngü): "Bu kadar büyük bir şehri kim öldürdü? Bir kılıç mı, bir deprem mi, yoksa bir yol mu?"
  Cevap (sonda): tek bir darbe değil; kuşatmalar yaraladı, deprem sarstı, ama asıl ölüm sessizdi: kervanlar başka
  yoldan gitmeye başladı. Bir şehir yolu kaybedince yavaşça boşaldı. Küpler bu yüzden önemli: yaşamın son izleri.
- İzleyici sonunda ne hisseder: Bozkırın ortasındaki boş katedralin ürpertisi; şehirlerin bazen kılıçla değil
  sessizlikle öldüğü fikri.
- Soğuk açılış: kazı çukurunda, toprağın altından yükselen beş dev küp; içleri boş. "Biri bunları doldurdu ve bir daha
  geri gelmedi." → soru.
- Kapak fikri: kum temasında, ışık havuzunda tek, çatısı yarık katedral silueti (ya da tek dev küp). "ŞEHRİ KİM
  **ÖLDÜRDÜ**?" / "BOŞ **BAŞKENT**" / "BİN BİR **KİLİSE**". `focus` zorunlu, en az 3 aday.
- Bölümler (öneri): I Bozkırdaki başkent · II Kılıç (1064) · III El değiştiren kapı · IV Deprem ve yol · V Küpler.
- Başlık önerisi: "Ani Antik Kenti: Bin Bir Kilise Şehri Neden Boşaldı?" · tags[0] "ani antik kenti" (ya da "ani ören yeri").
- Kapanış: tek yorum sorusu ("Sizce bir şehri en çok ne öldürür: savaş mı, deprem mi, unutulmak mı?") + abone çağrısı.

### Anlatım
(3.961 karakter, tur 1 sonrası; sahne metinleri boşlukla birleşik; paragraflar = soğuk açılış + 5 bölüm)

Kars'ın doğusunda, bozkırın ortasında, bir kazı çukuru. Toprağın altından beş dev küp çıktı. Boyları bir metreyi buluyordu. Ağızları yarım metre genişliğindeydi. Bir erzak deposunun içinde duruyorlardı. Biri onları doldurmuştu. Sonra bir gün gitti… ve bir daha geri gelmedi. Bu küpler, bir zamanlar bin bir kilise şehri denen bir yerin çarşısındaydı. Ani'nin. Bu kadar büyük bir şehri kim öldürdü? Bir kılıç mı, bir deprem mi, yoksa bir yol mu?

Cevap için bin yıl geriye gitmek gerekir. Ani, iki derin vadinin arasında, üçgen bir yaylanın üstüne kurulmuştu. Doğusunda, dipte Arpaçay akardı. Kuzeyde tek bir açık yan kalıyordu. Oraya çifte sur ördüler, yarım daire kulelerle. 961 yılında Ermeni Bagratlı kralı Üçüncü Aşot, başkentini Kars'tan buraya taşıdı. Şehir hızla büyüdü. Çünkü İpek Yolu'nun bir kolu, tam bu yayladan Anadolu'ya giriyordu. Kervanlar doğudan ve batıdan geldi. Hanlar doldu, çarşılar doldu, depolar doldu. Büyük olasılıkla on binlerce insan bu surların içinde ve çevresinde yaşadı. Kiliseler birbiri ardına yükseldi. Halk ona bin bir kilise şehri dedi. En büyüğü katedraldi. Bin yılının hemen ardından tamamlandı. Mimarı Ermeni usta Trdat'tı. 989'da büyük bir deprem İstanbul'u sarsmış, Ayasofya'nın kubbesi kısmen çökmüştü. Onu yeniden kuran usta, bu adamdı. Ama zengin bir kapı, herkesin istediği kapıdır.

Ve bu kapıya, önce batıdan biri uzandı. 1045'te Bizans, Ani'yi kendi topraklarına kattı. Bagratlı krallığı sona erdi. Ama doğuda, bozkırın öbür ucunda, yeni bir güç yükseliyordu. Selçuklular. 1064 yazında Sultan Alp Arslan, ordusuyla Ani'nin önüne geldi. Vadiler ve surlar şehri yenilmez gösteriyordu. Kuşatma yirmi beş gün sürdü. Türk kaynaklarına göre, 16 Ağustos'ta surlar aşıldı. Anlatılana göre katedralin kubbesindeki haç indirildi, yerine bir hilal kondu. Katedral artık Fethiye Camii'ydi. Bu, Malazgirt'ten yedi yıl önceydi. Anadolu'nun kapılarından biri açılmıştı. Ama Ani için asıl uzun yolculuk daha yeni başlayacaktı.

Bundan sonra şehir, bir anahtar gibi elden ele geçti. 1072'de Selçuklular Ani'yi Şeddadilere bıraktı. Yeni yönetici Menuçehr adında bir beydi. Onun adını taşıyan cami, Anadolu'daki ilk Türk camilerinden sayılır. Minaresinde bugün hâlâ kufi bir besmele okunur. Sonra Gürcüler geldi. Şehri defalarca aldılar, defalarca kaybettiler. 1199'da Kraliçe Tamar'ın ordusu girdi. Ani bir süre yeniden parladı. Her yeni sahip surları onardı, kendi tapınağını yaptırdı. Ama çarşı yaşamaya devam etti. Kılıçlar gelip geçti. Kervanlar geldikçe Ani yaşadı. Sonra 1236'da, doğuda büyük bir toz bulutu belirdi. Ama bu kez gelen kimdi?

Bu kez gelen, bir imparatorluktu. Moğollar on yıl önce bir kez denemiş, şehri alamamıştı. Bu kez aldılar ve yağmaladılar. Ani yaralandı, ama yine ayakta kaldı. Asıl sarsıntı, 1319'da yerin altından geldi. Büyük bir deprem, katedralin kubbesini çökertti. Ani bu darbeden sonra bir daha toparlanamadı. Ama bir şey, depremden de sessizdi. Ticaret yolları yavaş yavaş kaydı. Kervanlar başka geçitlerden, başka şehirlerden geçmeye başladı. Bir şehir kılıçtan sağ çıkabilir. Depremden de. Ama yolunu kaybederse… Önce tüccarlar gitti. Sonra ustalar. Evlerin ışıkları birer birer söndü. Şehir büyük olasılıkla on yedinci yüzyılda boşaldı. Kalan son keşişlerin de 1735 dolaylarında ayrıldığı anlatılır. Ama toprak, bir sırrı saklamaya devam etti.

Geriye taş kaldı. Rüzgâr. Ve toprak. 2016'da Ani, UNESCO Dünya Mirası Listesi'ne girdi. Ve 2026'da kazıcılar, Selçuklu Çarşısı'nın bir deposunda o beş küpü buldu. Üzerlerinde S biçimli, dalgalı kabartmalar vardı. Büyük olasılıkla içlerinde bakliyat gibi kuru erzak saklanırdı. Bu şehri kim öldürdü? Tek bir darbe değil: kuşatmalar yaraladı, deprem sarstı. Ama asıl ölüm sessizdi: kervanlar başka yoldan gitti. Bu küpler, o sessizlikten önceki son hayatın izi. Biri onları, yarın da burada olacağını düşünerek doldurmuştu. Sizce bir şehri en çok ne öldürür: savaş mı, deprem mi, unutulmak mı? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun.

### Yazar — son hâl (02-ani-antik-kenti)
- **3.961 karakter** (tur 1 sonrası; ilk hâl 3.975), **50 sahne**, palette `kum`, sadece `bt_*` (yeni: `scenes/studio/shots/bt_ani.js`, `bt_ani_b.js`; ortak dosyaya dokunulmadı).
- Soğuk açılış (sahne 0–5): kazı çukuru → beş dev küp (> 1 m) → ağız ≈ 50 cm, boş → doldurulup terk edilmiş küp → Ani silueti → "kılıç? deprem? yol?".
- Bölümler: I Bozkırdaki başkent (961; sahne 6) · II Kılıç (1045–1064; 17) · III El değiştiren kapı (1072–1236; 26) · IV Deprem ve yol (1236–1735; 34) · V Küpler (bugün; 43). Her bölüm sonu kanca cümlesiyle biter (lint uyarısız).
- Yeni tipler: `bt_an_dig`, `bt_an_jar`, `bt_an_skyline`, `bt_an_cathedral`, `bt_an_dome`, `bt_an_plateau`, `bt_an_map`, `bt_an_walls`, `bt_an_days`, `bt_an_riders`, `bt_an_caravan`, `bt_an_city`, `bt_an_line`, `bt_an_mosque`, `bt_an_quake`.
- Kapak (tur 2 sonrası): "BU ŞEHRİ / KİM / **ÖLDÜRDÜ**?"; tur 1: "KİM / **ÖLDÜRDÜ** / BU ŞEHRİ?" + yeniden çizilmiş, kubbesi düşmüş Ani Katedrali (sahne 42, t 4.0, focus [960, 520], zoom 1.2). İlk hâl: "ŞEHRİ KİM **ÖLDÜRDÜ**?" (focus [1000, 620]). Adaylar: (A) aynı yazı + gece katedral (sahne 49) — kırık kasnak taç gibi okunuyordu; (B) aynı yazı + beş küp (sahne 48) — kalabalık, yazıya yakın; (C) "BEŞ **BOŞ** KÜP" + tek küp (sahne 2) — sakin ama zayıf merak; (D) "**BOŞ** BAŞKENT" + yıkık katedral — güçlü ama başlıktaki "boşaldı"yı tekrar ediyor. Seçilen: D'nin görüntüsü + A'nın yazısı.
- Doğrulama: 961 başkent (Aşot III), katedral 989–1001/1010 (mimar Trdat; 989 depremi sonrası Ayasofya kubbesi onarımı, 994), 1045 Bizans, 1064 25 günlük kuşatma (16 Ağustos tarihi Türk kaynakları/kazı başkanı), 1072 Şeddadiler (Menuçehr), Gürcü alımları 1124/1161/1174/1199 (Tamar), 1226 başarısız + 1236 Moğol, 1319 depremi kubbeyi çökertti, ticaret yollarının kayması (UNESCO), 17. yy terk / son keşişler ~1735, UNESCO 2016, 2026 Selçuklu Çarşısı'nda 5 küp (gzt). Nüfus için sayı verilmedi ("büyük olasılıkla on binlerce"). Haç→hilal ve 16 Ağustos "anlatılana göre / Türk kaynaklarına göre" diye verildi. Bugünkü siyaset/sınır yok.
- lint OK (SEO 100); preview: `out/preview/02-ani-antik-kenti/sheet.png`, `cover.jpg`; STATIC? uyarısı yok.

---

## Eleştiri günlüğü

### 01-vasa-gemisi — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 6 | 7 | 7 | 8 | 8 | 9 | 8 | 7 |
1. Sahne 0 + kapak: gemi batıyor görünmüyordu → hook modunda gemi ilk kareden pruvadan ~10° eğik, alt top kapaklarının hepsi ve pruva güvertesi su çizgisinde, su altı gövde soluk çizgi, su çizgisi boyunca iki grup kabarcık; gemi biraz büyüdü (0.56); kapak focus [540, 760], zoom 1.15 (1.4 gemiyi kırpıyordu).
2. Sahne 7: bt_count yerine yeni `bt_vasa_years`: dipte yatan gövdenin üstünde büyük altın sayaç ilk ~1,5 sn'de 0→333 sayar, altında "yıl"; ışık huzmesi + deniz karı. (6 farklı tip.)
3. Sahne 6: "Gemi, herkesin gözü önünde battı." (öznesi var); bütçe için sahne 5 "içeri" çıktı → "Su, açık top kapaklarından doldu." Toplam yine 343. Rıhtım siluetleri kadraj kenarlarına alındı, su altı hayalet gövde bu sahnede yok; gemi pruvadan eğilerek gövdesine kadar gömülür, sadece direkler ve yatık yelkenler kalır.
Ek: "Stockholm · 10 Ağustos" 62 px (ink rengi), "ağırlık / merkezi" 54 px; yatma ve ağırlık merkezi animasyonu cue'dan ~1 sn önce başlar.

### 02-ani-antik-kenti — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 8 | 7 | 6 | 8 | 7 |
1. Doğruluk: "Ve hepsi boştu." çıktı → "Bir erzak deposunun içinde duruyorlardı." (AA, kazı başkanı Doç. Dr. Muhammet Arslan); "Her biri bir metreden uzundu" → "Boyları bir metreyi buluyordu."; açıklamadaki "hepsi boştu" → "bir erzak deposunda beş dev küp". AA haberi kaynaklara eklendi (6 kaynak). "Doldurmuştu… bir daha geri gelmedi" anlatı olarak kaldı.
2. Tarafsızlık: sahne 9 "Ermeni Bagratlı kralı Üçüncü Aşot", sahne 14 "Mimarı Ermeni usta Trdat'tı.", açıklamada "Ermeni Bagratlı krallığının" ve "Ermeni mimar Trdat"; sahne 12'deki "Kaç kişinin yaşadığı bugün de tartışmalıdır." çıktı; sahne 31 "Ama çarşı yaşamaya devam etti."
3. Kapak: katedral yeniden çizildi (Ani Katedrali silueti: neredeyse kare gövde, 7 dar yüksek kör kemer, sivri kapı ve pencere, alçak üçgen alınlıklar, yüksek kasnak + sivri konik kubbe; yıkık hâlde kasnak kırık bir kütük, kırık kenar tek altın çizgi, doğu köşesi düşmüş). Bina sağ yarıya tam sığıyor (focus [960, 520], zoom 1.2), yıkık sahnede ışık havuzu 0.46. Yazı "KİM / ÖLDÜRDÜ / BU ŞEHRİ?" (Ş'nin çengeli artık altta bir satıra değmiyor). Aday: aynı yazı + tek dev küp (sahne 3) — temiz ama soruyla bağı zayıf; seçilen katedral.
4. Sahne 33 toz bulutu: bulanık lekeler yerine 7 katmanlı, ince çizgili, yavaşça yükselen dalgalı toz perdesi. Sahne 0: çukurda sadece beş küpün ağız halkaları görünüyor, küpler sahne 1'deki "beş"te birer birer beliriyor. Sahne 9: yakın harita (Kars–Ani arası ~180 px, kesikli altın ok). Sahne 16 bt_text yerine harita: batıdan ve doğudan Ani'ye uzanan iki kesikli yol ("herkesin istediği kapı"). Ek: skyline yazısı katedralle çakışmıyor; kervan tozu daha hafif.
lint OK (SEO 100), preview STATIC? yok; sheet.png ve cover.jpg kontrol edildi.

### 01-vasa-gemisi — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 7 | 8 | 7 | 9 | 8 | 8 |
Son cila (yazar):
1. Sahne 8 ("sakladı") artık farklı plan: `camera` focus [210, 940], zoom 1.7 → kuma gömülü gövdenin oymalı kıç kasarası, kıç pencereleri ve kaplama tahtalarına yakın plan; altın çizgi gövde boyunca ilerler. Sahne 7 (sayaç) ve 9 (yükselme) geniş planda kaldı.
2. Sahne 6: rıhtım ~60 px aşağı (Q 812 → 858; daha aşağısı siluetleri altyazı şeridine sokuyordu), siluetler küçüldü (116–140), taş dokusu çok soluk; gemi gövdesine kadar gömülüp sadece direkler kalıyor.
3. Sahne 5 "Su, açık top kapaklarından içeri doldu." geri geldi; sahne 4 → "Hafif bir rüzgâr onu yatırdı." Toplam 344 karakter.
4. Kapak: focus [500, 760], zoom 1.1 → kıç kasarası artık kadrajın içinde.
Son anlatım (344): Bu gemi yarım saat bile yüzemedi. Stockholm, 10 Ağustos 1628. Vasa, krallığın en güçlü gemisiydi. Ama ağır
topları çok yukarıdaydı. Hafif bir rüzgâr onu yatırdı. Su, açık top kapaklarından içeri doldu. Gemi, herkesin gözü önünde
battı. Üç yüz otuz üç yıl karanlıkta kaldı. Onu batıran deniz, onu sakladı. Böyle sessiz hikâyeler için abone olun.

### 02-ani-antik-kenti — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 8 | 8 | 8 |
Son cila: (1) Sahne 9 haritası neredeyse tam kadraj (bounds 40.9–45.9 / 39.6–41.4), mavi Arpaçay ve Aras nehirleri + etiketleri ve "Kars" noktası ilk andan görünür, "Ani" + "961" "buraya"da gelir. (2) Sahne 37: kubbe çökerken gri puf'lar yerine 5 ince, blur'suz, yükselen dalgalı toz çizgisi + düşen taşlar. (3) Kapak: ["Bu şehri", "kim", "öldürdü?"]; Ş çengeli alttaki KİM satırına değmiyor (~15 px boşluk). Yıkık katedralin dış hattı kalınlaştı (4.6), kasnak kırığı altın 7 px, düşen köşenin kenarı artık altın 6 px. (4) Sahne 16: oklar koyulaştı (opaklık 0.9, 5.5 px) ve daha erken/hızlı çizilir ("zengin", "kapı" cue'ları, 1,3 sn). Karakter 3.961. lint OK, preview STATIC? yok; sheet ve cover kontrol edildi.

