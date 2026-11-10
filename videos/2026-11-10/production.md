# Düşün Bakalım — 2026-11-10 (belgesel tarzı)

Manşet taraması: `tools/news.py --channel db` bu ortamdan yine erişilemedi (proxy 403, Google News tüneli). Yerine web
araması (Türkiye arkeoloji/keşif haberleri, Kasım 2026) → havuza uyan iki ayrı manşet bulundu:
- **01 (Short):** "Kütahya'da 5 bin yıllık ekmek kalıntıları bulundu" — Seyitömer Höyüğü (Hürriyet Daily News, 7 Kasım 2026;
  Yeni Asır 5 Kasım; Diken). https://www.hurriyetdailynews.com/ancient-bread-remains-unearthed-at-seyitomer-mound-229122
- **02 (uzun):** "Kekova'daki 4.700 yıllık batık Guinness Rekorlar Kitabı'na girdi" — dünyanın bilinen en eski batığı
  (Hürriyet Daily News 5 Kasım 2026; Euronews TR 4 Kasım; Oksijen). Haber kanca, asıl hikâye aynı kıyının en ünlü
  batığı: **Uluburun** (Kaş, MÖ ~1300). https://www.hurriyetdailynews.com/worlds-oldest-shipwreck-enters-guinness-world-records-229010

Plan.py kategorisi Short için "büyük kararlar ve savaşlar", uzun için "keşifler ve icatlar"; kural gereği manşet
öncelikli → ikisi de "keşifler" + Anadolu/Türkiye toprakları (haftalık Türkiye kotasına sayılır). Konular geçmişte
yok (Antikythera 22 Ekim'de işlendi; Uluburun farklı batık, farklı dönem; ekmek hiç işlenmedi).

ElevenLabs uyarısı: `warning: true` (ayın kullanımı 215.512 / bütçe 231.442, yenilenme 20 Kasım; kalan ~15.900).
→ Short alt uçta (~330–360), uzun alt uçta (~3.900–4.100). Toplam bugün ≤ ~4.450.

Paletler: önceki Düşün Bakalım videosu **fildisi** (11-09) → Short **obsidyen** (karanlıkta köz/yangın) → uzun **derin**
(deniz dibi, mavi karanlık).

---

## 01 — Short · `01-seyitomer-ekmekleri.json` · publish_at 2026-11-10T19:00:00+03:00
- Konu: Seyitömer Höyüğü (Kütahya, termik santral sahası; höyüğün altındaki linyit için kurtarma kazısı). Erken Tunç
  Çağı'nın ilk çeyreği, ~5.000 yıl. Fırınlı bir odada raf desteklerinin arasında 8 kömürleşmiş ekmek; çevrede buğday
  ve mercimek. Kazı başkanı müze müdürü Sevgi Gürdal: "Yangın sırasında raf çökünce içindekiler birbirine karıştı."
  Yangın ekmeği kömürleştirdi → kömürleşen organik madde çürümez (karbonizasyon) → korundu.
  DİKKAT: ritüel/ölü yorumu YOK (haber depolanmış yiyecek diyor). "Aile" uydurma; kim pişirdi bilinmiyor.
- İzleyici sonunda ne hisseder: sıradan bir günün sofrasının 5.000 yıl sonra önümüze konmasının sessiz ürpertisi;
  yok edecek olan ateşin koruyan şey olması. İsteğe bağlı ikinci ironi: höyük bugün altındaki kömür için kazılıyor.
- Kanca/kapak: ilk cümle "Bu ekmekler beş bin yıl önce pişti." Kapak: ışık havuzunda kömürleşmiş tek somun (kırık
  kabuk, kor parıltısı) — "5000 YILLIK **EKMEK**" / "ATEŞ **KORUDU**" / "FIRINDAN ÇIKTI". En az 3 aday.
- Punchline: o günün ekmeği, beş bin yıl bizi bekledi / yok edecek olan ateş korudu.
- related: yok.

### Anlatım (yönetmen taslağı; yazar doğrular, sesli okur gibi düzeltir, 330–360 karakter)
Bu ekmekler beş bin yıl önce pişti. Kütahya'da, bir höyüğün içinde, sekiz somun. Bir oda. Bir fırın. Bir raf. Sonra
bir yangın. Raf çöktü. Buğday ve mercimek, ekmeklere karıştı. Ateş onları yok edebilirdi. Ama kömüre çevirdi. Ve kömür
çürümez. Biri o gün ekmek pişirdi. Ekmek, beş bin yıl bekledi. Böyle sessiz hikâyeler için abone olun.

### Çekim listesi (yazar ayrıntılandırır; 9–10 sahne, en az 4 tip)
| # | Cümle | Görsel | Tip | Kamera |
|---|---|---|---|---|
| 1 | Bu ekmekler beş bin yıl önce pişti. | Işık havuzunda kömürleşmiş somun(lar), kor parıltısı (ilk kare dolu = kapak) | bt_<ekmek> | yavaş itme |
| 2 | Kütahya'da, bir höyüğün içinde, sekiz somun. | Höyük kesiti, katmanlar; derinde küçük bir ışık / sekiz somun dizisi | bt_<ekmek> | yavaş itme |
| 3 | Bir oda. Bir fırın. Bir raf. | Kerpiç oda kesiti; fırın ve raf kendini çizer | bt_<ekmek> | — |
| 4 | Sonra bir yangın. | Alev (yavaş, doğal) | bt_<ekmek> | — |
| 5 | Raf çöktü. Buğday ve mercimek, ekmeklere karıştı. | Raf yavaşça düşer; taneler süzülür | bt_<ekmek> | yakın |
| 6 | Ateş onları yok edebilirdi. Ama kömüre çevirdi. | Somunun kesiti: hamur → siyah karbon dönüşümü | bt_<ekmek> | yakın |
| 7 | Ve kömür çürümez. | Toprak katmanları üst üste kapanır, zaman çizgisi | bt_type / bt_<ekmek> | — |
| 8 | Biri o gün ekmek pişirdi. | Fırın ağzında tek el silueti / sıcak ışık | bt_<ekmek> | — |
| 9 | Ekmek, beş bin yıl bekledi. | Kazı fırçası ve somun, bugünün ışığı | bt_<ekmek> / photo | yavaş itme |
| 10 | Böyle sessiz hikâyeler için abone olun. | Karanlıkta tek kor | bt_<ekmek> | — |

### Yazar — son hâl
**Anlatım (357 karakter, lint sayımı; 9 sahne, ~28 sn tahmini):**
Bu ekmek beş bin yıl önce pişti. Kütahya'da, bir höyüğün içinde, sekiz somun. Bir oda, bir fırın, duvarda bir raf.
Sonra bir yangın çıktı. Raf çöktü. Buğday ve mercimek, ekmeklerin arasına karıştı. Ateş onları yok edebilirdi… ama
kömüre çevirdi. Ve kömür çürümez. O günün ekmeği, beş bin yıl toprağın altında bekledi. Böyle sessiz hikâyeler için abone olun.

- Taslaktan farklar: ilk cümle tekil ("Bu ekmek", ilk karede tek somun var; kapakla ortak kelime "ekmek"); "Bir oda.
  Bir fırın. Bir raf." → tek cümle (Shorts sahnesi ≤ 2 cümle); "Biri o gün ekmek pişirdi" çıkarıldı (bütçe + kimin
  pişirdiği bilinmiyor); höyüğün adı sesle değil ekranda (italik "Seyitömer Höyüğü").
- **Doğrulama:** Hürriyet Daily News (7 Kasım 2026) ve Diken (5 Kasım 2026, AA): Seyitömer Höyüğü (Kütahya'ya 26 km,
  termik santral sahası, linyit için kurtarma kazısı); 8 kömürleşmiş ekmek, ~5.000 yıl, Erken Tunç Çağı'nın ilk çeyreği
  (Sevgi Gürdal); fırın **geçen yılki** kazıda bir odada, duvara dayalı raf kalıntılarıyla bulundu, ekmekler bu yıl raf
  ayaklarının arasında; buğday ve mercimek kalıntıları; Gürdal: "Yangın sırasında raf çökünce içindekiler birbirine
  karıştı", rafta çuval/torbalarda tarım ürünleri ve ekmek; buluntular Kütahya Arkeoloji ve Madencilik Müzesi'nde.
  Ritüel/aile yorumu yok. `sources`: Hürriyet Daily News, Diken, Yeni Asır.
- **Sahneler:** bt_ek_loaf (hook) → bt_ek_mound (site, "sekiz"de 8 somun) → bt_ek_room (build, fırın/raf cue) →
  bt_ek_room (fire) → bt_ek_shelf (raf çöker, taneler dökülür) → bt_ek_loaf (section, kömürleşme) → bt_ek_mound (bury)
  → bt_text ("5000 yıl / toprağın altında") → bt_ek_loaf (museum, "Kütahya Müzesi"). 5 tip; yeni tipler
  `scenes/studio/shots/bt_ekmek.js`.
- **Kapak:** 4 aday denendi: "5000 YILLIK **EKMEK**" (sahne 0) · "BEŞ BİN YIL ÖNCE **PİŞTİ**" · "5000 YILLIK
  **EKMEK**" + kesit (sahne 5) · "ATEŞ BU EKMEĞİ **KORUDU**". Seçilen: **"5000 YILLIK / EKMEK"**, sahne 0, t 1.2,
  `focus` [540, 820] zoom 1.3: ışık havuzunda büyük kömürleşmiş somun, çatlaklarda kor; küçükken en iyi okunan,
  başlığın ana kelimesiyle aynı. Kesit adayı soyut kaldı; "korudu" 3 satır ve kanca cümlesiyle ortak kelimesi yok.
- **Başlık:** "5000 Yıllık Ekmek: Yangın Bu Somunları Nasıl Korudu?" · lint OK (uyarı yok, SEO 100).

---

## 02 — Uzun · `02-uluburun-batigi.json` · publish_at 2026-11-10T20:30:00+03:00
- Konu: Uluburun batığı (Kaş açıkları, Antalya). MÖ ~1300 (dendrokronoloji ~MÖ 1305 civarı — yazar doğrulasın).
  1982'de süngerci Mehmet Çakır dipte "kulaklı metal bisküviler" gördü (öküz derisi biçimli bakır külçeler). INA
  (George Bass, Cemal Pulak) + Bodrum Sualtı Arkeoloji Müzesi, 1984–1994, 11 sezon, ~22.000 dalış, 44–61 m.
  Yük: ~10 ton Kıbrıs bakırı (354 külçe), ~1 ton kalay → 9:1 oranı = ~11 ton bronz; mavi cam külçeler, abanoz,
  fildişi, su aygırı dişi, deve kuşu yumurtası, Baltık kehribarı, Nefertiti adlı altın skarabe, tahta katlanır
  yazı tableti (bilinen en eski "kitap" örneklerinden), silahlar; en az 7–8 kültürün eşyası. Soru: kimin gemisiydi,
  nereye gidiyordu? (krallar arası hediye/ticaret; Amarna mektupları — Alaşiya kralı firavuna bakır). Neden battı:
  bilinmiyor. Sonrası: bir asırdan kısa süre sonra Geç Tunç Çağı çöküşü; o dünya bitti, gemi onun anlık fotoğrafı.
  Bugün: Bodrum'da sergileniyor. HER SAYIYI doğrula (INA, Pulak yayınları, Bodrum müzesi, Penn Museum, Wikipedia
  kaynakçası); emin olmadığın sayıyı yazma; "dünyanın en eski batığı" deme (o unvan artık Kekova'nın).
- Kanca (soğuk açılış, ilk 30 sn): 1982, 50 metre dipte bir süngerci, kulaklı metal bisküviler. Haber kancası ilk
  cümlelerde: "Geçen hafta Antalya kıyısındaki bir batık, dünyanın bilinen en eski batığı oldu. Ama o kıyıda bir gemi
  daha var..." (sıra yazara: en dramatik an önce). Açık döngü sorusu: 3.300 yıl önce bu gemi, kimin yükünü, nereye
  taşıyordu? (cevap sonda: bir dünyanın son fotoğrafı; krallar arası hediye hipotezi, kesin değil).
- İzleyici sonunda ne hisseder: tek bir gemide bütün bir dünyanın — çökmeden hemen önceki halinin — saklı olduğunu
  görmenin ürpertisi.
- Kapak fikri: ışık havuzunda tek öküz derisi külçe dipte, kum, mavi karanlık — "ON TON **BAKIR**" / "DİPTEKİ
  **HAZİNE**" / "KİMİN **GEMİSİ**?". `focus` zorunlu. En az 3 aday.
- Bölümler (öneri; 5 bölüm, 40–50 sahne): soğuk açılış → B1 Dipteki bisküviler (keşif, 1982–84) → B2 Yük (bakır+kalay
  = bronz, cam, fildişi, skarabe, tablet) → B3 Kimin gemisi? (rota, krallar, mektuplar) → B4 Batış ve sessizlik →
  B5 Çöküş ve bugün → tek yorum sorusu + abone çağrısı.
- related: yok.

### Anlatım
Yazar ajan önce sahne düşünmeden tek parça yazar (3.900–4.100 karakter), sesli okur gibi kontrol eder, buraya ekler.

### Anlatım (yazar)
Sahne düşünülmeden tek parça yazıldı, sesli okunur gibi kontrol edildi (≈4.030 karakter). Paragraflar = soğuk açılış + 5 bölüm + kapanış.

1982 yazı. Kaş açıklarında, elli metre derinde, bir sünger avcısı karanlığa iniyordu. Adı Mehmet Çakır'dı. Kayaların arasında, kuma gömülü garip şeyler gördü. Yukarı çıkınca onları tek bir sözle anlattı: kulaklı metal bisküviler. Geçen hafta, aynı kıyıda başka bir batık Guinness Rekorlar Kitabı'na girdi. Kekova'daki dört bin yedi yüz yıllık gemi, bilinen en eski batık sayıldı. Ama o kıyının en zengin sırrı, Çakır'ın gördüğü yerde yatıyordu. Üç bin üç yüz yıl önce bu gemi kimin yükünü taşıyordu? Ve nereye gidiyordu?

Cevap, önce o bisküvilerdeydi. Çakır'ın çizimini gören arkeologlar, ne olduklarını hemen anladı. Bunlar, Tunç Çağı'nın bakır külçeleriydi. Dört köşesi kulak gibi uzanan, öküz derisine benzeyen metal levhalar. 1984'te kazı başladı. Önce George Bass, sonra Cemal Pulak. Bodrum Sualtı Arkeoloji Müzesi ve Amerikalı bir sualtı arkeoloji enstitüsü birlikte çalıştı. O derinlikte bir dalgıç, günde iki kez, yirmişer dakika kalabiliyordu. Daha fazlası tehlikeliydi. On bir yaz boyunca, yirmi iki bin dört yüz on üç dalış yapıldı. Ama her dalış, dipten biraz daha tuhaf bir dünya çıkardı.

Dipten çıkan ilk şey, bir servetti. Bakır külçelerin sayısı üç yüz elli dörttü. Toplam on ton. Yanlarında bir ton da kalay vardı. Kalayın bir kısmı büyük olasılıkla Toros Dağları'ndan, bir kısmı ise çok uzaklardan, Orta Asya'dan gelmişti. Bir düşünün. Dokuz ölçü bakıra bir ölçü kalay katarsanız bronz elde edersiniz. Bu gemi, on bir ton bronzun hammaddesini taşıyordu. Tunç Çağı'nda bronz, kılıç demekti, saban demekti, güç demekti. Ama yük bununla bitmiyordu. Kobalt mavisi ve turkuaz renkte yüz yetmiş beş cam külçe. Afrika'dan abanoz kütükler. Bir fil dişi ve on dört su aygırı dişi. Deve kuşu yumurtaları. Kuzey Avrupa'dan gelmiş kehribar boncuklar. Eşyalar, en az yedi farklı kültürden geliyordu. Mısır, Kıbrıs, Kenan, Miken, Asur… Sonra küçük bir şey bulundu. Altından bir böcek. Bir skarabe. Üzerinde, Mısır kraliçesi Nefertiti'nin adı yazıyordu. Ve bir de, fildişi menteşeli, katlanır tahta bir yazı tableti. İçi mumla kaplanırdı, üstüne yazı yazılırdı. Mum çoktan erimişti. Belki bu geminin bütün sırrı… o kayıp satırlardaydı.

Geriye ipuçları kaldı. Gemi yaklaşık on beş metreydi ve Lübnan sedirinden yapılmıştı. Büyük olasılıkla doğudan, Kıbrıs ya da Kenan kıyılarından yola çıkmış, batıya, Ege'ye doğru ilerliyordu. O yıllarda krallar birbirine mektup yazardı. Mısır'da bulunan Amarna tabletlerinde, Alaşiya kralı, yani büyük olasılıkla Kıbrıs kralı, firavuna şöyle yazmıştı: Şimdi sana beş yüz bakır gönderdim. Bir görüşe göre Uluburun gemisi de böyle bir kraliyet gönderisiydi. Bir kraldan bir krala, hediye dolu bir ambar. Ama gemide yüz elliye yakın terazi ağırlığı da vardı. Belki de yükün sahibi birkaç tüccardı. Kimin olursa olsun, gemi o limana asla varamadı.

Uluburun, büyük burun demektir. Sarp, kayalık bir burun. Belki bir fırtına, gemiyi o kayalara sürdü. Belki rüzgâr bir anda döndü. Bunu kimse bilmiyor. Mürettebata ne olduğunu da bilmiyoruz. Bilinen tek şey, geminin bu burnun dibinde, sarp bir yokuşta yattığı. Yük, eğimli dibe dağıldı. Kum, hepsini yavaş yavaş örttü. Ahşabın çoğu çürüdü. Ama metal, cam ve taş kaldı. Gemideki yakacak bir dal, ağaç halkalarına göre milattan önce 1305 dolaylarında kesilmişti. Yani gemi, Nefertiti'nin çağından yalnızca birkaç on yıl sonra batmıştı. Ama yukarıda, karada, o dünyanın sonu yaklaşıyordu.

Bir asır kadar sonra, Doğu Akdeniz'in büyük krallıkları birer birer çöktü. Hitit başkenti terk edildi. Ugarit yandı. Miken sarayları yıkıldı. Bu gemiyi yola çıkaran ticaret yolları, bir daha aynı şekilde açılmadı. Uluburun, o dünyanın çökmeden hemen önce çekilmiş bir fotoğrafı gibiydi. Bugün o fotoğraf, Bodrum Sualtı Arkeoloji Müzesi'nde. Külçeler, cam, skarabe ve geminin aslına benzer bir kopyası orada. Bu gemi kimin yükünü taşıyordu? Belki bir kralın, belki birkaç tüccarın. Ama kesin olan bir şey var. Taşıdığı şey, bütün bir dünyaydı.

Sizce bu gemi bir kralın hediyesi miydi, yoksa tüccarların mı? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun.

### Yazar — son hâl (tur 0, eleştiri öncesi)
- Dosya: `02-uluburun-batigi.json` · tema `derin` · ses `mF7tIc9VLrznhGooGjaT` · **4.029 karakter** (bütçe uyarısı nedeniyle alt uçta) · **50 sahne** · preview tahmini ~4:47 (belgesel sesiyle gerçek süre büyük olasılıkla ~5:00).
- Başlık: "Uluburun Batığı: 3.300 Yıllık Gemi Kimin Yükünü Taşıyordu?" · kapak: **DİPTEKİ / HAZİNE** (vurgu "hazine"), sahne 48 (`bt_ul_sea` glint), `focus` [1010, 660], zoom 1.3.
- Bölümler (YouTube): 0 Elli metre derinde (soğuk açılış) · 6 I Kulaklı bisküviler · 13 II Ambar · 22 Skarabe ve tablet (kartsız ara bölüm) · 27 III Kimin gemisi? · 34 IV Büyük burun · 42 V Çöküş.
- Kanca: dalgıç dibe iniyor → "kulaklı metal bisküviler" → Kekova Guinness haberi (2 harita sahnesi) → açık soru "kimin yükü, nereye?" (sahne 5, ~35 sn). Cevap sonda: kesin değil; kral hediyesi hipotezi (Amarna EA 35) vs. tüccarlar (terazi ağırlıkları); "taşıdığı şey bütün bir dünyaydı".
- Yeni sahne tipleri: `scenes/studio/shots/bt_uluburun.js` (bt_ul_sea, bt_ul_section, bt_ul_ship, bt_ul_hold, bt_ul_collapse + ortak çizimler `window.ULB`) ve `bt_uluburun_b.js` (bt_ul_ingot, bt_ul_relic, bt_ul_goods, bt_ul_alloy, bt_ul_tablet). Gordion'dan yeniden kullanılan: `bt_gd_tablet` (Amarna tableti), `bt_gd_rings` (MÖ 1305). Ortak dosyalara dokunulmadı.
- Kapak adayları: (A) DİPTEKİ HAZİNE — ışık havuzunda kuma yarı gömülü tek bakır külçe, altın kenar → **seçildi** (tek özne, küçükte okunuyor, başlığı tekrar etmiyor); (B) ON TON BAKIR — aynı kare, yazı daha az gizemli; (C) KİMİN GEMİSİ? — gece yelkenli gemi silueti; temiz ama başlıktaki soruyu tekrar ediyor.
- Lint: hatasız, uyarısız. Preview: STATIC? yok (en düşük motion 1.6, bölüm kartı).

**Doğrulama listesi** (kaynaklar `sources`'ta):
- 1982, sünger avcısı Mehmet Çakır, "metal biscuits with ears" çizimi → Wikipedia (Uluburun shipwreck), INA.
- Kazı 1984–1994, 11 sezon, 22.413 dalış; Bass 1984, Pulak 1985–1994 → Wikipedia, INA ("more than 22,000"), HeritageDaily (22.413).
- Derinlik 44–52 m, eserler 61 m'ye kadar; "elli metre civarı" → Wikipedia, HeritageDaily (~50 m); günde iki, 20 dakikalık dalış → HeritageDaily.
- 354 bakır külçe (~10 ton), ~1 ton kalay, 9:1 → ~11 ton bronz → Wikipedia, INA (354).
- Kalay: ~%65 Kestel/Toros, ~%30 Orta Asya → Wikipedia ("büyük olasılıkla" ile verildi).
- ~175 cam külçe, kobalt mavisi ve turkuaz → Wikipedia, HeritageDaily.
- Abanoz kütükleri, 1 fil dişi + 14 su aygırı dişi, deve kuşu yumurtası kabukları, kehribar (Kuzey Avrupa/Baltık) → Wikipedia, HeritageDaily.
- En az yedi kültür (Miken, Suriye-Filistin/Kenan, Kıbrıs, Mısır, Kassit, Asur, Nübye) → HeritageDaily (Archaeology dergisi "en az 11" diyor; düşük ve güvenli olan yazıldı).
- Nefertiti adlı altın skarabe → HeritageDaily, INA. Fildişi menteşeli şimşir tahta yazı tableti, mum yüzeyi korunmamış → Wikipedia (diptych), HeritageDaily.
- ~15 m, Lübnan sediri → Wikipedia, HeritageDaily; doğudan batıya, Ege'ye → HeritageDaily ("sailing west"), Wikipedia (Miken limanları hipotezi).
- Amarna EA 35: Alaşiya kralı firavuna "beş yüz (talent) bakır gönderdim" → Wikipedia EA 35; kraliyet gönderisi = "bir görüşe göre"; ~150 terazi ağırlığı → Wikipedia.
- Batış nedeni bilinmiyor (Wikipedia: "burnun kayalarına çarpmış olabilir" — sadece "belki" diye verildi). MÖ 1305 dal (dendrokronoloji) → Wikipedia, HeritageDaily; radyokarbon 1320±15 da var, "dolaylarında" denildi.
- Kekova: 4.700 yıllık, Guinness'e "bilinen en eski batık" olarak girdi (Kasım 2026) → Hürriyet Daily News. Uluburun için "en eski" denmedi.
- Bodrum Sualtı Arkeoloji Müzesi'nde sergi + replika → Wikipedia.

**Bilinen zayıflıklar:** `bt_map` ortak kıyı verisi bu yakınlıkta kaba (Kekova/Uluburun haritası); `bt_ul_goods`'ta fil dişi ve su aygırı dişi koyu temada sadece çizgi (dolgu zeminle aynı ton); kartuştaki işaretler gerçek Nefertiti hiyeroglifleri değil, sade semboller; Ugarit'in "yandı"sı için ayrı alev yok (ışık söner).

---

## Eleştiri günlüğü

### 01-seyitomer-ekmekleri — Tur 1 — eleştirmen
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 7 | **5** | 7 | 7 | 8 | 7 | 9 | 7 | 7 |

Lint: OK. Preview (tahmin): ~27 sn, 357 karakter; motion: s0 1.0, s1 5.5, s2 4.3, s3 6.3, s4 5.2, s5 3.7, s6 2.1, s7 4.0, s8 2.7. Titreşim yok, sol üst boş, sahneler sadece `bt_*`. Kaynak açıldı (Hürriyet DN + Diken): 8 ekmek, Erken Tunç Çağı'nın ilk çeyreği (~5000 yıl), raf yangında çöktü, buğday + mercimek, oda/fırın/raf geçen yıl, ekmekler bu yıl, Kütahya Arkeoloji ve Maden(cilik) Müzesi; açıklama doğru.

1. **Sahne 1, 2 ve 5'te görsel söylenen anı göstermiyor (Görsel=anlatım 5).** S1 "sekiz somun": sahne sonunda bile odada sadece 4 minik somun var (360 px'te ~8 px), oda ise boş siyah kutu → sekiz somunun hepsi cue'dan sonra ≤ 1,5 sn içinde yansın, oda + somunlar büyük olsun (oda kesitine `camera.focus` ile yaklaş ya da höyüğü küçültüp odayı büyüt). S2 "duvarda bir raf": sahnenin son karesinde rafta sadece iki dikey çubuk var; tahta, çuvallar ve somunlar hiç görünmüyor → `b` cue'sunda raf tahtaları + çuvallar + somunlar 1 sn içinde tamamlansın. S5 "ama kömüre çevirdi": sahne sonunda somunun içi hâlâ turuncu/açık, sadece içte bir altın halka var; kömüre dönüş hiç görülmüyor → ateş cephesi "kömür" cue'sundan sonra ~1,2 sn'de merkeze ulaşsın, iç tamamen siyaha dönsün ve sahne siyah somunla bitsin.
2. **Kapak yazısı başlığı tekrar ediyor ve merak bırakmıyor; kanca düz bilgi (Kapak+SEO 7, Kanca 7).** Kapak "5000 YILLIK EKMEK" = başlığın ilk üç kelimesi (CLAUDE.md: kapak başlığı tekrar etmez, BELGESEL §7: merak bırakır). Hikâyenin gizemi "yangın ekmeği korudu". Öneri: kapak "ATEŞİN KORUDUĞU EKMEK" (vurgu: ATEŞ) ya da "YANGIN KURTARDI" ve ilk cümle aynı fikir: "Bu ekmeği bir yangın kurtardı." (tarih ikinci cümleye: "Beş bin yıl önce, Kütahya'da."). Kapak görseli (tek somun, ışık havuzu, kor çatlaklar) güçlü ve telefonda okunuyor, aynen kalabilir. S0 motion 1.0: kor çatlakların nefesi/kıvılcımlar biraz daha belirgin olabilir.
3. **Süre ve kapanış zayıf (Tempo 7, Kapanış 7).** Tahmini ~27 sn (Shorts hedefi 28–35; 357 karakter, belgesel sesi 4355 kr = 5:23 ölçüsüyle ~26 sn); s6 "Ve kömür çürümez." sadece ~1,4 sn ekranda, toprak katmanlarının inişi görülemiyor. Punchline "O günün ekmeği, beş bin yıl toprağın altında bekledi." açılıştaki "beş bin yıl"ı tekrar ediyor, yeni bir şey söylemiyor; s8 görseli (müze vitrini) anlatımda hiç geçmiyor. → 30–50 karakter ekle: ör. s6'yı "Ve kömür çürümez. Onu ne su bozar, ne de zaman." gibi uzat; punchline'ı müzeye bağla ve dönüş yap: "O gün kimsenin yiyemediği ekmek, bugün Kütahya'da bir vitrinde duruyor." (s8 görseliyle birebir). Ayrıca s8 "Kütahya Müzesi" etiketi koyu zeminde soluk gri; 360 px'te zor okunuyor → `ink` rengine yaklaştır. Küçük: s4 "çuvallar" amfora/küp gibi çizilmiş; çuval (bağlı ağızlı torba) ya da metin "çuvallardaki" vurgusunu kaldır.

### 01 — Tur 1 — yazar düzeltmesi
**Yeni anlatım (395 karakter, ~30 sn tahmini, 9 sahne):** Bu ekmeği bir yangın kurtardı. Beş bin yıl önce, Kütahya'da.
Bir höyükte, sekiz somun. Bir oda, bir fırın, duvarda bir raf. Sonra bir yangın çıktı. Raf çöktü. Buğday ve mercimek,
ekmeklere karıştı. Ateş onları yok edebilirdi… ama kömüre çevirdi. Kömür çürümez. Toprak onu sadece sakladı. O gün
kimsenin yiyemediği ekmek, bugün bir müze vitrininde duruyor. Böyle sessiz hikâyeler için abone olun.
1. Görsel=anlatım: s1 oda ~2 kat büyük (680 px), içi sıcak tonlu, 8 somun büyük ve hepsi "sekiz"den sonra ~1,1 sn'de
   yanıyor, yaklaşma %8. s2 raf "raf" cue'sunda (en geç sahne sonundan 1,1 sn önce) dikme + tahta + çuval + somunlarla
   tamam. s5 ateş cephesi "kömür"den ~1,2 sn sonra merkeze varıyor, iç tamamen siyah, sahne siyah somunla bitiyor.
2. Kanca/kapak: ilk cümle "Bu ekmeği bir yangın kurtardı." (5 kelime), tarih ikinci cümlede. Kapak adayları
   "YANGIN **KURTARDI**" · "BU EKMEĞİ **YANGIN** KURTARDI" · "BİR **YANGIN** KURTARDI" (ilk tur adayları "5000 YILLIK
   EKMEK", "BEŞ BİN YIL ÖNCE PİŞTİ", "ATEŞ BU EKMEĞİ KORUDU"). Seçilen **"YANGIN / KURTARDI"** (vurgu: kurtardı; en büyük
   puntolu, iki kısa satır, başlığı tekrar etmiyor, "ateş nasıl kurtarır?" merakı). Görsel aynı: tek somun, kor çatlaklar,
   focus [540, 820] zoom 1.3. s0 kor nefesi ve kıvılcımlar belirginleşti (motion 0,5 → 1,1).
3. Süre/kapanış: +38 karakter (~27 → ~30 sn). s6 "Kömür çürümez. Toprak onu sadece sakladı." (~3,2 sn, katmanlar
   görünür; "su bozmaz" iddiası doğrulanamadığı için kullanılmadı). Punchline müzeye bağlandı (s7 = müze vitrini, birebir);
   "Kütahya" iki kez geçmesin diye "bir müze vitrininde". bt_text sahnesi çıktı; kapanışta yeni `ember` modu (somunun
   koru ve ışığı yavaşça söner). Müze etiketi `ink` rengi, 58 px. Çuvallar ağzı bağlı, püsküllü torba (çuval dokusu tonu).
- Tipler: bt_ek_loaf ×4 (hook, section, museum, ember), bt_ek_mound ×2, bt_ek_room ×2, bt_ek_shelf ×1 (4 tip, en çok %44).
- Lint: OK (hata/uyarı yok). Preview motion: s0 1.1, s1 6.7, s2 5.9, s3 6.3, s4 6.0, s5 6.9, s6 3.7, s7 3.0, s8 3.8.

### 02-uluburun-batigi — Tur 1 — eleştirmen
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | **5** | 8 | 8 | 7 | 7 | **6** | 8 | **5** |

Kapak ayrı: **5**. Lint: OK. 3.980 karakter ≈ 4:55 (04-ilk-kasik ölçüsüyle; 5–6 dk hedefinin altında, +150–300 karakter yer var). Titreşim yok (salınımlar yavaş, küçük genlikli: kandil, su, deniz karı), sol üst boş, Kaşif/dekor yok, sadece `bt_*`. Tema `derin` bir önceki DB videosundan (obsidyen) farklı ama bir önceki uzun video (11-08 Patrona Halil) de `derin`. Bölüm sonları iyi çekiyor (I "tuhaf bir dünya", II "kayıp satırlar", III "asla varamadı", IV "dünyanın sonu yaklaşıyordu"). Enerjik kalıp yok, ses tonu doğru.

1. **Bakır külçe yastık gibi görünüyor; videonun ana nesnesi ve kapak tanınmıyor (Görsel=anlatım 5, Kapak 5).** S1, 7, 8, 14, 16, 31, 38–39, 45, 47, 48 ve kapakta külçe: içbükey kenarlı, bordo dolgulu, kabarcık desenli dikdörtgen; dört köşedeki "kulaklar" neredeyse hiç çıkıntı yapmıyor. S1, s48 ve kapakta kuma dik dikilmiş, önden görünüyor → 360 px'te ve telefonda **yastık/minder** okunuyor; "kulaklı metal bisküvi" fikri (videonun kancası) görselde yok. → Öküz derisi külçe: dört köşede belirgin, dışa uzanan kulaklar (gövde genişliğinin ~%15'i), metal tonu (bakır/altın token, düz dolgu, kabarcık yerine ince döküm dokusu), dibe **yatık** 3/4 perspektif, yarısı kuma gömülü. S8'deki öküz postu dış çizgisi ancak o zaman anlam kazanır. Kapak: aynı düzeltilmiş külçe yatık, kumdan çıkan kulaklarıyla ışık havuzunda; yazı "DİPTEKİ HAZİNE" jenerik (her batık videosu olabilir) → "KULAKLI BİSKÜVİLER" (vurgu: KULAKLI) ya da "DENİZİN DİBİNDE BİR DÜNYA"; en az 3 aday karşılaştırılsın.
2. **Haritalar (s3, 4, 21, 29) okunmuyor ve hatalı görünüyor.** Kıyı çizgisi kaba, testere dişli; kara ile deniz aynı ton, hangi tarafın Anadolu olduğu anlaşılmıyor; kırpma artefaktları var: s21'de Anadolu güney kıyısında ve s29 sağ üstte cetvelle çizilmiş gibi düz yatay çizgi, s3/4 sağda düz dikey kenar (Levant sınır kesimi). Harita paneli ayrıca videonun geri kalanından açık bir dikdörtgen olarak ayrışıyor. S3–4'te Kekova ile Uluburun aynı noktada gibi; izleyici "Kaş" ile "Kekova" arasındaki ilişkiyi göremiyor. → Daha ayrıntılı kıyı verisi (bounds içinde düzgün kırpılmış), kara dolgusu (`paperLight`/`inkSoft` tonu) ile deniz ayrışsın, "Anadolu", "Kıbrıs", "Girit" gibi italik bölge adları; s3–4 için Likya kıyısına yaklaş (ör. bounds ~[28.5, 35.6, 31.5, 37.0]) ki Kaş–Kekova iki ayrı nokta olsun; s29 rotası kıyıya değil denize çizilsin.
3. **Bölüm II bir müze kataloğu; videonun sorusu sonda cevaplanmıyor (Senaryo 7, Tempo 7, Kanca 7).** S14–21 (~60 sn) eşya sayımı: "Afrika'dan abanoz kütükler. Bir fil dişi ve on dört su aygırı dişi. Deve kuşu yumurtaları. Kuzey Avrupa'dan gelmiş kehribar boncuklar." yüklemsiz, kopuk madde listesi (REVIEW: madde listesi gibi değil); bu 60 sn'de yeni soru/kanca yok, ilk gerilim s22 skarabede. Ayrıca soğuk açılışın ortasındaki Guinness/Kekova sapması (s3–4) dalış gerilimini kesiyor ve "Geçen hafta" video yıllarca izleneceği için eskiyor ("2026 sonbaharında"/"Bu yıl" yazılsın). Sonda başlığın vaadi ("Kimin yükünü taşıyordu?") "belki kral, belki tüccar… bütün bir dünyaydı" ile geçiştiriliyor. → Katalog sahnelerini tek bir soruya bağla: her eşya "bu yük nereden geliyor?" ipucu olsun (ör. "Abanoz Afrika'dan geliyordu. Kehribar ise binlerce kilometre kuzeyden. Tek bir gemide, bilinen dünyanın iki ucu vardı." + s19 sonunda "Ama ambarda bunlardan çok daha küçük bir şey bekliyordu."). Sonda cevaba bir adım daha yaklaş: Pulak'ın görüşü (Kenan limanından, büyük olasılıkla Karmel/Ugarit; gemide iki Miken seçkini → bir hediye eşlik ediliyordu) somut olarak verilsin, punchline o somut cevabın üstüne otursun.

**Küçük:** s19 "aygırı" cue'sunda su aygırı dişi tek bir yay, etiketi yok (çizim cue'dan önce tamamlansın, dolgu koyu temada görünsün); s16 "kalay" cue anında kalay külçesi henüz yok, s14 "on" cue'sunda "toplam 10 ton" görünmüyor; s36 "fırtına" ama gemi neredeyse dik ve deniz sakin (yalpa ve dalga genliği artsın); s41/43 Miken "Aslanlı Kapı" üçgen çatılı ev gibi (iki taş sütun + üstte üçgen kabartma olsun); s37 "Bilinen tek şey, geminin … yattığı." yüklemi eksik cümle → "…yattığıdır." ya da "Bildiğimiz tek şey şu: gemi bu burnun dibinde, sarp bir yokuşta yatıyordu."; s25 "Mum çoktan erimişti" → mum suda erimez, "çoktan yok olmuştu".

**Doğruluk (Wikipedia Uluburun, INA, Hürriyet DN 05.11.2026 açıldı):** 1982 Mehmet Çakır, 44–52 m (eşyalar 61 m'ye kadar), 1984 Bass / 1985–94 Pulak, 11 sezon 22.413 dalış, 354 külçe ~10 ton, ~1 ton kalay (≈%65 Kestel/Toros, ≈%30 Orta Asya), ~175 cam külçe, 1 fil dişi + 14 su aygırı dişi, ~150 ağırlık, ~15 m Lübnan sediri, fildişi menteşeli tahta tablet, altın Nefertiti skarabesi, "en az yedi bölge/kültür" (Cline) doğru. Kekova: Hürriyet DN 5 Kasım 2026, ~4.700 yıl, Guinness'e "en eski batık" → doğru.
- **Hata — s40 "MÖ 1305 dolaylarında kesilmişti":** 1305 dalın kabuksuz örneğindeki *en son halka*; ağacın ne zaman kesildiğini göstermez. Kuniholm sonra ~MÖ 1327 önerdi, radyokarbon (Manning vd.) batışı ~MÖ 1320 ± 15 verir; kabul gören sonuç "MÖ 14. yüzyılın sonu". → "Gemideki bir dal ve radyokarbon ölçümleri, batışı MÖ 1300'lerin hemen öncesine, yaklaşık MÖ 1320'ye koyuyor." Ekrandaki "MÖ 1305 / dal kesildi" de "≈ MÖ 1320 / batış" olsun.
- **Doğrulanamadı — s7 "Çakır'ın çizimini gören arkeologlar":** kaynaklar Çakır'ın *tarifini* ("kulaklı metal bisküviler") veriyor; çizim yaptığına dair kaynak bulamadım (anlatılan: kaptanı, INA'nın sünger avcılarına gösterdiği külçe çizimlerinden tanıdı). → "Çakır'ın tarifini duyanlar" ve s2'deki kâğıt taslak sahnesi buna göre ("tarif") yeniden düşünülsün.
- s19 "abanoz": aslında Afrika kara ağacı (Dalbergia melanoxylon, "Mısır abanozu"); "abanoz" kabul edilebilir. s30 EA 35'te birim (talent/şekel) tartışmalı; "beş yüz bakır" ifadesi güvenli.

### 02 — Tur 1 — yazar düzeltmesi
4.237 karakter (≤ 4.250; preview ~5:00, belgesel sesiyle büyük olasılıkla ~5:15), 50 sahne. Lint hatasız + uyarısız; sheet/cover gözle kontrol edildi.
1. **Külçe yeniden çizildi** (`ULB.ingot`, `ULB.ingotMini`): öküz derisi biçimi, dört köşede gövdenin ~%15'i kadar dışa uzanan kulaklar, bakır tonu (`red` + `gold` parıltı), kalın kenar, dibe yatık 3/4 perspektif (izdüşüm), kabarcık yerine ince döküm izleri. Bütün kullanımlar (s1, 2, 3, 8, 9, 10, 14, 16, 38–39, 45, 48, ambar, kesit, alaşım) ve kapak buna geçti. s9 öküz postu çizgisi artık kulaklarla aynı biçimi büyütüyor.
2. **Kapak:** KULAKLI / **BİSKÜVİLER** (vurgu "bisküviler"); s48'de kuma yarı gömülü, kulakları kumdan çıkan tek külçe, altın ışık havuzu, zoom 1.45. Adaylar: (A) KULAKLI BİSKÜVİLER, (B) DİPTE ON TON BAKIR, (C) DENİZİN DİBİNDE BİR DÜNYA → A seçildi (en büyük yazı, görselle aynı fikir, ilk sahnelerin kancası, başlığı tekrar etmiyor).
3. **Haritalar:** ortak `bt_map` bırakıldı; `bt_uluburun.js` içinde yeni `bt_ul_map`: elle girilmiş Doğu Akdeniz kıyıları (Likya kıyısı ayrıntılı, Kekova adası, Girit, Kıbrıs, Rodos), Catmull-Rom ile yumuşatılmış, kara denizden bir ton açık, deniz videonun zemini (ayrışan panel yok), italik bölge adları. s5–6 Likya yakın planı: Kekova (sağ) ve Uluburun (sol) ayrı noktalar. s30 rotası denizden Karmel → Uluburun, Ege'ye devamı soluk; s48 Kenan → Miken.
4. **Doğruluk:** "MÖ 1305 dolaylarında kesilmişti" → "Gemideki bir dalın halkaları ve radyokarbon ölçümleri, batışı yaklaşık milattan önce 1320'ye koyuyor." (ekran "≈ MÖ 1320 / batış"). "çizimini gören" → "tarifini duyanlar"; s2 kâğıt kaldırıldı, tarif edilen şekil karanlıkta ince çizgi + altın kulaklar. "Mum erimişti" → "yok olmuştu". s38 → "Bildiğimiz tek şey şu: gemi bu burnun dibinde, sarp bir yokuşta yatıyordu."
5. **Yapı:** soğuk açılış artık kesintisiz dalış → bisküviler → "altında bir gemi" (yeni s3, dağınık yük geniş planı) → soru; Kekova haberi sorudan sonra ve "2026 sonbaharında". Bölüm II her eşyayı kökenine bağlıyor (Kıbrıs bakırı, Toros/Orta Asya kalayı, Afrika abanozu, Baltık kehribarı → "bilinen dünyanın iki ucu"), ortada kanca "Bu kadar metali kim gönderebilirdi?", skarabeye "Ama asıl ipucu, çok daha küçük bir şeydi." ile geçiliyor. Bölüm III'e Pulak'ın görüşü eklendi (Wikipedia, Pulak'a dayanarak: çapalar ve gündelik kaplar Karmel/Kenan kıyısından; Ege'ye yöneliş; iki Mikenliye ait mühür/kılıç/içki takımı; yükü bir Miken sarayına götüren elçiler "olabilirdi"), yeni sahne `bt_ul_hold` "envoys" (güvertede iki yüzsüz yolcu). Final cevap veriyor: "Büyük olasılıkla Kenan kıyısındaki bir hükümdarın ya da seçkinin. Ve büyük olasılıkla, iki elçinin gözetiminde, bir Miken sarayına gidiyordu." → punchline "taşıdığı şey, bir kralın hediyesinden fazlasıydı. Bütün bir dünyaydı."
6. **Küçükler:** su aygırı dişi büyük, dolgulu, etiketli, cue'dan önce çizili; kalay cue'dan önce çiziliyor; "toplam 10 ton" cue'da görünüyor (cue "Toplam"); fırtınada gemi ±9° yalpalıyor, dalga genliği 30; Miken artık büyük taş duvarda lento + kabartma üçgeni + iki aslan + sütunlu Aslanlı Kapı. Çıkarılanlar (bütçe için): "Daha fazlası tehlikeliydi", "Mürettebata ne olduğunu da bilmiyoruz", deve kuşu yumurtası, müze cümlesinin ikinci yarısı, "1984" yazı sahnesi (kazı sahnesine katıldı).

**Anlatım (tur 1 son hâli):**
1982 yazı. Kaş açıklarında, elli metre derinde, bir sünger avcısı karanlığa iniyordu. Adı Mehmet Çakır'dı. Kayaların arasında, kuma gömülü garip şeyler gördü. Yukarı çıkınca onları tek bir sözle anlattı: kulaklı metal bisküviler. O bisküvilerin altında, üç bin üç yüz yıllık bir gemi yatıyordu. Bu gemi kimin yükünü taşıyordu? Ve nereye gidiyordu? 2026 sonbaharında, aynı kıyıda, Kekova açıklarındaki dört bin yedi yüz yıllık bir batık, bilinen en eski batık olarak Guinness Rekorlar Kitabı'na girdi. Ama o kıyının en zengin batığı, biraz batıda, Çakır'ın gördüğü yerde yatıyordu. Cevap, önce o bisküvilerdeydi. Çakır'ın tarifini duyanlar, ne olduklarını hemen anladı. Bunlar, Tunç Çağı'nın bakır külçeleriydi. Dört köşesi kulak gibi uzanan, öküz derisine benzeyen metal levhalar. 1984'te kazı başladı. Önce George Bass, sonra Cemal Pulak. Bodrum'daki müze ve Amerikalı bir enstitü birlikte çalıştı. O derinlikte bir dalgıç, günde iki kez, yirmişer dakika kalabiliyordu. On bir yaz boyunca, yirmi iki bin dört yüz on üç dalış yapıldı. Ama her dalış, dipten biraz daha tuhaf bir dünya çıkardı. Dipten çıkan ilk şey, bir servetti. Bakır külçelerin sayısı üç yüz elli dörttü. Toplam on ton. Bu bakır, büyük olasılıkla Kıbrıs'tan geliyordu. Yanlarında bir ton da kalay vardı. Kalayın bir kısmı Toros Dağları'ndan, bir kısmı ise çok uzaklardan, Orta Asya'dan gelmişti. Bir düşünün. Dokuz ölçü bakıra bir ölçü kalay katarsanız bronz elde edersiniz. Bu gemi, on bir ton bronzun hammaddesini taşıyordu. Tunç Çağı'nda bronz, kılıç demekti, saban demekti, güç demekti. Bu kadar metali kim gönderebilirdi? Ambarda yüz yetmiş beş mavi cam külçe de vardı. Abanoz Afrika'dan geliyordu. Bir fil dişi ve on dört su aygırı dişi de vardı. Kehribar ise binlerce kilometre kuzeyden, Baltık kıyılarından gelmişti. Tek bir ambarda, bilinen dünyanın iki ucu yan yana duruyordu. Eşyalar, en az yedi farklı kültüre aitti. Mısır, Kıbrıs, Kenan, Miken, Asur… Ama asıl ipucu, çok daha küçük bir şeydi. Altından bir böcek. Bir skarabe. Üzerinde, Mısır kraliçesi Nefertiti'nin adı yazıyordu. Ve bir de, fildişi menteşeli, katlanır tahta bir yazı tableti. İçi mumla kaplanırdı, üstüne yazı yazılırdı. Mum çoktan yok olmuştu. Belki bu geminin bütün sırrı… o kayıp satırlardaydı. Geriye başka ipuçları kaldı. Gemi yaklaşık on beş metreydi ve Lübnan sedirinden yapılmıştı. Taş çapaları ve gündelik kapları, Karmel Dağı çevresinden, yani Kenan kıyısından geliyordu. Kazıyı yöneten Cemal Pulak'a göre gemi oradan yola çıkmış, kıyı boyunca batıya, Ege'ye ilerliyordu. O yıllarda krallar birbirine mektup yazardı. Mısır'da bulunan Amarna tabletlerinde, Alaşiya kralı, yani büyük olasılıkla Kıbrıs kralı, firavuna şöyle yazmıştı: Şimdi sana beş yüz bakır gönderdim. Gemide yüz elliye yakın terazi ağırlığı da vardı. Yani yükün bir kısmı tüccarların olabilirdi. Ama eşyaların arasında, iki Mikenliye ait mühürler, kılıçlar ve içki takımları da bulundu. Pulak'a göre bu iki yolcu, yükü bir Miken sarayına götüren elçiler olabilirdi. Kimin olursa olsun, gemi o saraya asla varamadı. Uluburun, büyük burun demektir. Sarp, kayalık bir burun. Belki bir fırtına, gemiyi o kayalara sürdü. Belki rüzgâr bir anda döndü. Bunu kimse bilmiyor. Bildiğimiz tek şey şu: gemi bu burnun dibinde, sarp bir yokuşta yatıyordu. Yük, eğimli dibe dağıldı. Kum, hepsini yavaş yavaş örttü. Ahşabın çoğu çürüdü. Ama metal, cam ve taş kaldı. Gemideki bir dalın halkaları ve radyokarbon ölçümleri, batışı yaklaşık milattan önce 1320'ye koyuyor. Ama yukarıda, karada, o dünyanın sonu yaklaşıyordu. Bir asır kadar sonra, Doğu Akdeniz'in büyük krallıkları birer birer çöktü. Hitit başkenti terk edildi. Ugarit yandı. Miken sarayları yıkıldı. Bu gemiyi yola çıkaran ticaret yolları, bir daha aynı şekilde açılmadı. Uluburun, o dünyanın çökmeden hemen önce çekilmiş bir fotoğrafı gibiydi. Bugün o fotoğraf, Bodrum Sualtı Arkeoloji Müzesi'nde. Bu gemi kimin yükünü taşıyordu? Büyük olasılıkla Kenan kıyısındaki bir hükümdarın ya da seçkinin. Ve büyük olasılıkla, iki elçinin gözetiminde, bir Miken sarayına gidiyordu. Ama taşıdığı şey, bir kralın hediyesinden fazlasıydı. Bütün bir dünyaydı. Sizce bu gemi bir kralın hediyesi miydi, yoksa tüccarların mı? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun.

### 01-seyitomer-ekmekleri — Tur 2 — eleştirmen
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 7 | 8 | 8 | 8 | 9 | 8 | 8 |

**Geçti** (tüm kriterler ≥ 7, kapak 8). Lint: OK. Ayrı klasörde preview: ~30,8 sn, 395 karakter, motion s0 1.1 · s1 6.7 · s2 5.9 · s3 6.3 · s4 6.0 · s5 6.9 · s6 3.7 · s7 3.0 · s8 3.8. Tur 1 sorunlarının üçü de çözülmüş: s1'de sekiz büyük somun, s2'de raf tahta + çuval + somunla tamam, s5'te iç tamamen kömüre dönüyor; ilk cümle "Bu ekmeği bir yangın kurtardı." ↔ kapak "YANGIN KURTARDI" aynı fikir, başlığı tekrar etmiyor, telefonda okunuyor, tek odak; punchline müze vitriniyle birebir; müze etiketi artık okunuyor. Doğruluk değişmedi (Hürriyet DN + Diken ile uyumlu).

Kalan küçük sorunlar (isteğe bağlı tur 3):
1. S4 (ve s2–s3'teki raf): püsküllü, ağzı bağlı turuncu çuvallar 360 px'te soğan/sarımsak gibi okunuyor → püskülleri kaldır, çuvalı daha geniş tabanlı, dokulu (`inkSoft` çapraz çizgi) ve sönük tonlu çiz.
2. S7 → s8: arka arkaya iki neredeyse aynı somun karesi (müze vitrini, sonra vitrinsiz aynı somun); son görüntü yeni bir şey vermiyor → s8'de ya kamera yakın plana girsin (`camera.focus` çatlaklara, zoom ~1.8; son kor sönüyor) ya da s8 vitrinin içinde kalsın, sadece spot yavaşça sönsün.
3. S5 kesit somun, kesik yüzü olmadığı için yarım kubbe/kâse gibi okunuyor; s0 hareketi hâlâ düşük (1.1) → kesit sahnesinin ilk 0,5 sn'inde tam somun gösterilip ince bir kesme çizgisiyle ikiye ayrılsın; s0'da kıvılcımlar biraz daha görünür olsun.

### 01 — Tur 3 — yazar düzeltmesi
Anlatım değişmedi (395 karakter, ~30,8 sn).
1. Çuvallar: püskül yok; geniş, basık tabanlı, ağzı büzülüp bağlanmış torba; yatay dokuma çizgileri ve bir kıvrım;
   sönük ton (paper + inkSoft, hafif stain). s2, s3, s4'te aynı çizim.
2. S8 artık s7'nin tekrarı değil: çatlaklara yakın plan (somun ~1,9 kat, kadrajı dolduruyor, çatlaklar altyazının
   üstünde), son kor ve ışık havuzu sahne boyunca %80 söner, birkaç kıvılcım yükselir (motion 4,3).
3. S5 kesit: önce bütün kömürleşmiş somun, ~0,8 sn'de ince altın kesme çizgisi onu ortadan böler, sonra kesik yüz
   (gözenekli iç) belirir; kömürleşme "kömür" cue'sunda (en erken 1,5 sn) başlar ve merkeze ulaşır. S0: kıvılcımlar
   daha çok, daha büyük ve parlak (26 → 34, boyut 2,8 → 3,6); titreşim yok, sadece yavaş yükselme.
- Lint: OK (hata/uyarı yok). Kapak aynı ("YANGIN / KURTARDI"), cover.jpg ve sheet.png yeniden görüldü.

### 02-uluburun-batigi — Tur 2 — eleştirmen
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 8 | 7 | 8 | 8 | 8 | 8 |

**Geçti** (tüm kriterler ≥ 7, kapak 8). Lint: OK. 50 sahne, 4.188 karakter (≈ 5:10). Tur 1'in üç büyük sorunu çözülmüş:
- **Külçe:** öküz derisi biçimi, belirgin dört kulak, bakır tonu, dibe yatık; 360 px'te ve kapakta artık "kulaklı bisküvi" okunuyor. s9'daki post çizgisi anlamlı.
- **Kapak** "KULAKLI / BİSKÜVİLER": tek özne, ışık havuzu, telefonda okunuyor, başlığı tekrar etmiyor, ilk sahnelerin kancasıyla aynı fikir → 8.
- **Haritalar** (`bt_ul_map`): yumuşak kıyılar, ANADOLU/LİKYA/Girit adları, düz çizgi artefaktı yok, Likya yakın planında Kekova ve Uluburun ayrı noktalar, rota denizden.
- **Yapı:** soğuk açılış kesintisiz (dalış → bisküviler → gemi → soru), Kekova haberi sorudan sonra ve "2026 sonbaharında". Bölüm II her eşyayı kökenine bağlıyor; "Bu kadar metali kim gönderebilirdi?" ve "Ama asıl ipucu, çok daha küçük bir şeydi." kancaları iş görüyor. Final somut bir cevap veriyor.
- **Doğruluk** (Wikipedia Uluburun yeniden açıldı): çapaların çoğu Karmel kıyısından ve Pulak'a göre ana liman orada (Tell Abu Hawam vb.) ✔; iki Mikenliye ait kişisel eşya grubu (mercek mühürler, kılıçlar, içki takımı) ✔; bakır Kıbrıs ✔; batış ≈ MÖ 1320 ± 15 ✔; "tarifini duyanlar" ✔; "mum yok olmuştu" ✔.

Kalan sorunlar (isteğe bağlı tur 3, hiçbiri geçişi engellemiyor):
1. **Final cevabı kaynaktan bir derece kesin (Doğruluk 8).** "Ve büyük olasılıkla, iki elçinin gözetiminde, bir Miken sarayına gidiyordu." Kaynak iki yolcuyu "elçi ya da ulak, ya da tüccar, ya da ikisi" diye veriyor; "büyük olasılıkla" ancak varış yeri için (bir Miken sarayı, ekibin senaryosu) uygun. → "Büyük olasılıkla bir Miken sarayına gidiyordu. Belki de iki elçinin gözetiminde." Yorum sorusu da bu belirsizliğe bağlanabilir: "Sizce o iki Mikenli yolcu elçi miydi, yoksa tüccar mı?" (şimdiki "kralın hediyesi mi, tüccarların mı" sorusu, az önce verilen cevapla hafifçe çelişiyor).
2. **Birkaç cue/görsel boşluğu (Görsel=anlatım 7).**
   - "Bu bakır büyük olasılıkla Kıbrıs'tan geliyordu." cümlesinde ekranda hâlâ 354 sayacı var, Kıbrıs hiç görünmüyor → sayacın altına italik "Kıbrıs" çıksın ya da küçük bir Kıbrıs silueti belirsin.
   - Alaşım sahnesinde "kalay" cue karesinde kalay külçesi hâlâ yok (sheet).
   - Fırtına sahnesinin örnek karelerinde gemi neredeyse dik duruyor; yalpa en geniş açısını cümlenin ortasında versin.
3. **Harita paneli hâlâ ayrışıyor (Tema 7).**
   - s4–6, s21, s30, s47–48'de bütün kare diğer sahnelerden belirgin biçimde açık (deniz tonu zeminden açık), kontak sayfasında açık dikdörtgenler olarak sırıtıyor → deniz = temanın zemini (vinyet + ışık havuzu), kara bir ton açık.
   - Son haritada (Kenan → Miken) rota Anadolu kıyısına yapışık, yer yer karanın üstünden geçiyor gibi; 20–30 px denize alınsın.
   - Küçük: kapaktaki külçede gri kenar çizgisi altın konturdan kaymış, hafif "çift görüntü" veriyor.
   - Tema `derin` bir önceki uzun videoyla (11-08 Patrona Halil) aynı. Lint geçiyor ve kural "bir önceki video" diyor, bilgi olarak not edildi.

### 02 — Tur 3 — yazar düzeltmesi
4.237 karakter, 50 sahne; lint hatasız + uyarısız; sheet/cover ve kontrol kareleri (87,2 / 99,3 / 223,5 sn) gözle görüldü.
1. **Final yumuşatıldı:** "Ve büyük olasılıkla bir Miken sarayına gidiyordu, belki de iki elçinin gözetiminde." Yorum sorusu cevapla çelişmiyor: "Sizce o iki Mikenli yolcu elçi miydi, yoksa tüccar mı?" Açıklamadaki soru aynı: "Sence o iki Mikenli yolcu elçi miydi, yoksa tüccar mı? Yorumlara yaz!"
2. **s14:** "Kıbrıs" cue'sunda sayının altında altın "Kıbrıs" belirir (`params.from`). **s16 alaşım:** "+" ve kalay külçesi "kalay" cue'sundan ~1 sn önce çizilmeye başlar, cue anında ekranda. **s36 fırtına:** gemi sürekli ~13° (±3°) yana yatık, dalgalar büyük.
3. **Haritalar:** `bt_ul_map` artık kendi zeminini çizmiyor; deniz = motorun tema zemini (ışık havuzu ve kenar karartmasıyla diğer sahnelerle aynı), kara %60 `paperLight`. s47 Kenan→Miken rotası Malea burnunu güneyden dolaşıp Argolis kıyısında denizde bitiyor (Mora'nın içinden geçmiyor). **Kapak külçesi:** yan yüzün kayık kontur çizgisi kaldırıldı (yan yüz sadece koyu dolgu); tek, temiz dış kontur.
