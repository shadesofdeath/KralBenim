# 01-radyasyonlu-cay — günlük Shorts (Düşün Bakalım)

- **Dosya:** `videos/2026-10-28/01-radyasyonlu-cay.json` · publish_at `2026-10-28T19:00:00+03:00`
- **Konu:** Çernobil (26 Nisan 1986) bulutunun Karadeniz'e ulaşması, mayıs yağmurlarıyla Rize çay bahçelerine inen radyoaktif toz, Avrupa'nın Türk çayını geri çevirmesi, Sanayi ve Ticaret Bakanı Cahit Aral'ın 12 Ağustos 1986'da Rize'de gazetecilerin önünde çay içmesi, sonunda tonlarca çayın beton bloklara gömülmesi.
- **Havuz:** felaketler ve kazalar (+ Türkiye tarihi).
- **Manşet (kanca bağlantısı):** `tools/news.py` bu ortamdan erişilemedi (proxy 403); manşet web aramasıyla bulundu. Memurlar.net "28 Ekim 2026'dan önemli gündem başlıkları": "Akkuyu'dan 2027'de elektrik bekleniyor" (ayrıca Yeni Şafak "Akkuyu'da üretim takvimi"). Türkiye'nin ilk nükleer santrali haberinin arkasındaki tarih: Türkiye'nin nükleerle ilk büyük karşılaşması, Çernobil çayı. Manşet açıklamada geçer.
- **İzleyici sonunda ne hisseder:** "Demek o çay hâlâ toprağın altında… bunu hiç bilmiyordum."
- **Kanca + kapak fikri:** ilk cümle "Bu çay radyasyonluydu, bir bakan yine de içti." ↔ kapak "RADYASYONLU / ÇAYI İÇTİ" (RADYASYONLU kırmızı kutuda). Tek simge: buharı tüten ince belli çay bardağı (buharın içinde hafif radyasyon işareti/ışıma halkaları), yanında şokta büyük Kaşif.
- **Hassasiyet:** sağlık/kanser iddiası yok (tartışmalı), ölüm yok, siyasi yorum yok; bakan adı ekranda/anlatımda geçmez ("bir bakan"), açıklamada "dönemin Sanayi ve Ticaret Bakanı" denebilir. Ton miktarı verilmez (kaynaklar tutarsız): "tonlarca".

## Anlatım (tek parça)

Bu çay radyasyonluydu, bir bakan yine de içti. 1986'da Çernobil'de bir reaktör patladı ve rüzgâr bulutu Karadeniz'e taşıdı. Rize'ye yağan mayıs yağmuru o tozu çay bahçelerine indirdi. Düşünün, tam o günlerde ilk yapraklar toplanıyordu! Avrupa Türk çayını geri çevirdi. Bakan ise Rize'de, gazetecilerin önünde çayını içti. Ama sonunda tonlarca çay betona gömüldü ve o çay hâlâ toprağın altında. Her gün böyle gerçek bir hikâye için abone olun.

(442 karakter; ElevenLabs uyarısı açık → alt uçta tutuldu)

## Doğrulama / kaynaklar

- AA Teyit Hattı: Cahit Aral o dönem Sanayi ve Ticaret Bakanı; 12 Ağustos 1986'da Rize'de basın toplantısında gazetecilerin önünde çay içti. https://www.aa.com.tr/tr/teyithatti/politika/cahit-aral-cernobil-felaketinden-sonra-radyasyona-karsi-halka-guven-vermek-icin-gazetecilerin-karsisinda-cay-icmisti-/1814984
- Habertürk: radyasyon Karadeniz'e yağmurla ulaştı ("yağmurun getirdiği etki"), çay toplanıp Ankara, İstanbul ve Rize'de beton bloklar içinde gömüldü. https://www.haberturk.com/tonlarca-radyasyonlu-cay-ne-oldu-2480788
- CNN Türk: 3 Mayıs 1986'da bulut Trakya'ya, sonra Doğu Karadeniz'e ulaştı; Hollanda Türk çayında yüksek radyasyon açıkladı, Batı Almanya Türk çayını iade etti. https://www.cnnturk.com/turkiye/cernobil-faciasi-neydi-turkiyeyi-nasil-etkilemisti-664222
- Çernobil patlaması 26 Nisan 1986 (AA, Habertürk, CNN Türk).

## Çekim listesi (nihai, yazar ajan)

Anlatım metni değişmedi (444 karakter, preview tahmini ~31 sn); sadece sahnelere bölündü: "patladı," / "ve rüzgâr…" ve "gömüldü," / "ve o çay…" (cümle ortasında sahne geçişi). Palet: `olive`. Yeni sahne tipleri: `scenes/studio/shots/cay__lib.js` (ortak çizimler) + `cay_glass`, `cay_reactor`, `cay_map`, `cay_garden`, `cay_port`, `cay_bunker`.

| # | Cümle | Görüntü | Tip | set / kamera | Kaşif | cue | Kaynak notu |
|---|---|---|---|---|---|---|---|
| 0 | Bu çay radyasyonluydu, bir bakan yine de içti. | Kareli örtülü masada tabaklı ince belli çay bardağı, buhar; altın ışıma halkaları + bardağın yanında elle çizilmiş radyasyon işareti; masa önü, ayaklar, tahta döşeme | `cay_glass` hook | interior | sağda büyük, işaret → şok | glow "radyasyon" | — |
| 1 | 1986'da Çernobil'de bir reaktör patladı, | Gece santral: türbin binası, çatısı yarılmış reaktör bloğu (donuk altın-kırmızı ışık), kırmızı bantlı baca, sağa yatan duman sütunu; önde tel örgü + çam ormanı | `cay_reactor` | night | — | hit "patladı" | AA Teyit Hattı |
| 2 | ve rüzgâr bulutu Karadeniz'e taşıdı. | Kenardan kenara eski harita (Ukrayna, Dinyeper, Karadeniz, Anadolu, Akdeniz); bulut Çernobil'den kesikli rüzgâr okuyla Rize'ye süzülüyor, gri iz; Rize işareti atıyor | `cay_map` | yok / hafif itme | — | arrive "Karadeniz" | CNN Türk |
| 3 | Rize'ye yağan mayıs yağmuru o tozu çay bahçelerine indirdi. | Teraslı çay yamacı (ekranın altına kadar), kırmızı çatılı ev, kara bulut, sağanak; "tozu"dan sonra altın damlalar ve çalılara konan altın zerreler | `cay_garden` rain | storm | — | dust "tozu" | Habertürk |
| 4 | Düşünün, tam o günlerde ilk yapraklar toplanıyordu! | Yazmalı, küfeli çay toplayıcı kadın yaprak koparıp küfeye atıyor; çisenti, altın zerreler; ön sıra çalılar | `cay_garden` pick | hills / **yakın plan** focus [610, 880] zoom 1.65 | — | pluck "tam" | — |
| 5 | Avrupa Türk çayını geri çevirdi. | Liman: gemi bumbası sandıkları rıhtıma geri indiriyor; "TÜRK ÇAYI" sandığına "İADE" damgası basılıyor; rıhtım tahtaları, baba, halat | `cay_port` | coast | — | stamp "geri", land "çevirdi" | CNN Türk |
| 6 | Bakan ise Rize'de, gazetecilerin önünde çayını içti. | Basın toplantısı: takım elbiseli, kırmızı kravatlı, bıyıklı adam (isimsiz) mikrofonlu masada bardağı kaldırıp içiyor; pencerede çay terasları; önde gazetecilerin başları, makineler, flaşlar | `cay_glass` press | interior | — | lift "gazetecilerin", drink "içti", flaşlar | AA Teyit Hattı |
| 7 | Ama sonunda tonlarca çay betona gömüldü, | Kesit: damperli kamyon çayı beton çukura döküyor; "betona"da mikser oluğu dönüp beton akıtıyor; "gömüldü"de beton kapak | `cay_bunker` pour | field | — | pour "betona", seal "gömüldü" | Habertürk |
| 8 | ve o çay hâlâ toprağın altında. | Yıllar sonra kesit: yüzeyde çay çalıları ve kökler, kalın toprak altında kapalı beton blok, içinde çay; "1986'dan beri" notu + ok | `cay_bunker` section | hills / focus [540, 1010] zoom 1.25 itme | — | note "hâlâ" | — |
| 9 | Her gün böyle gerçek bir hikâye için abone olun. | Açık havada teraslı yamaç, terasta buharı tüten çay bardağı; Kaşif yamacı işaret ediyor, "abone"de el sallıyor | `cay_garden` end | hills | işaret → el sallama | wave "abone" | — |

Tipler: 6 farklı (cay_glass 2, cay_reactor 1, cay_map 1, cay_garden 3, cay_port 1, cay_bunker 2), üst üste en fazla 2. Kaşif 2/10 (%20). Yakın plan: sahne 4 (zoom 1.65). Ekran yazısı: harita "Çernobil / Karadeniz / Anadolu / Rize", "TÜRK ÇAYI" + "İADE", "1986'dan beri".

### Kapak adayları
- **A (seçilen):** sahne 0, t 2.0: dev ince belli çay bardağı + altın radyasyon işareti + şokta büyük Kaşif; `focus [570, 880]`, zoom 1.18. Tek odak (bardak), ilk cümleyle aynı fikir, telefonda küçükken en net okunan.
- **B:** sahne 6, t 3.4: bakan bardağı ağzına götürüyor, flaş, köşede Kaşif şokta. Hikâyenin kilit anı ama kalabalık (mikrofonlar, kalabalık, pencere); bardak yüzü kapattı, ikincil kaldı.
- **C:** sahne 3, t 3.6: yağmur altında altın zerreli çay terasları + Kaşif şok. Atmosfer güzel ama "radyasyonlu çay" fikri tek nesnede değil, dağınık; en zayıfı.

## Eleştiri günlüğü

### Tur 1 (eleştirmen)
`lint`: OK (hata yok). Bakan adı anlatımda ve ekranda yok, sağlık/kanser iddiası yok, ton miktarı yok.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 6 | 7 | 6 | 7 | 8 | 7 | 8 | 6 |

Kapak (tek başına): **7**. Geçmedi (Görsel=anlatım, Kompozisyon, Kapak+SEO < 7; kapak < 8).

1. **Başlığın vaadi ("Bakan Neden İçti?") videoda cevaplanmıyor; iki cümle bulanık.** Anlatım bakanın *neden* içtiğini hiç söylemiyor, bu yüzden hikâyenin dönüşü (güven vermek için içti → ama çay yine de gömüldü) kaybolup düz sıralamaya dönüyor. AA Teyit Hattı kaynağı nedeni veriyor ("halka güven vermek için"). Ayrıca "rüzgâr bulutu" kulağa tamlama gibi geliyor ("rüzgâr bulutu" diye bir şey), "o tozu" da önceden anılmamış bir tozu gösteriyor. Düzeltme (≈ +35 karakter, ~480, bütçe içinde):
   - Sahne 2: "ve rüzgâr, radyasyon bulutunu Karadeniz'e taşıdı."
   - Sahne 3: "Rize'ye yağan mayıs yağmuru o radyoaktif tozu çay bahçelerine indirdi."
   - Sahne 6: "Bakan ise halka güven vermek için Rize'de, gazetecilerin önünde çayını içti." (cue'lar aynı kalabilir.)
   Sahne 7 "Ama sonunda…" böylece gerçek bir ironi olur. Ayrıca `sources[0].title` içinde bakanın adı geçiyor ve `upload.py` bunu açıklamanın Kaynaklar bölümüne yazacak; brief'e uymak için başlığı "AA Teyit Hattı — Çernobil sonrası gazetecilerin karşısında içilen çay" yap (URL aynı kalır).
2. **Sahne 6 ve sahne 2'de görüntü anlatımı karşılamıyor.**
   - Sahne 6 (`cay_glass` press, frame_13): bardak kalkarken yaklaşık 2 katına büyüyor ve sürahi/ibrik gibi okunuyor (gövdesi omuzdan mikrofona kadar, ~y 620–870); ağız ve yüzün yarısını kapatıyor, "içti" anı duygusuz kalıyor. Kaldırılan bardak masadaki ölçüde kalmalı (masadaki bardak ölçeğiyle aynı, `s` 0.95 için kabaca 90×150 px), dudağın sağ köşesine 20–25° eğik değsin, yüz (gözler + bıyık) açık kalsın. Ayrıca y 1450–1920 düz gri bir bant (gazetecilerin sırtları detaysız): omuz/ceket yakası çizgileri, ikinci sıra başlar ya da tahta zemin çiz; kadrajın altı boş görünmesin.
   - Sahne 2 (`cay_map`, frame_04/05): "Çernobil" etiketi (`x: (ch[0]+150)/W, y: (ch[1]-50)/H` ≈ 350, 300 px) kicker kutusunun (y ≈ 160–290) altında kalıyor, hiç okunmuyor → `chern`'i [230, 430] gibi aşağı al ya da etiketi y ≥ 0.20 H'ye, işaretin sağına koy. "Anadolu" etiketi (y 0.75) Anadolu'nun üstünde değil Akdeniz'deki Kıbrıs'ın üstünde duruyor (coğrafi hata) → y ≈ 0.62 (≈1190 px), x 0.45; bu da altyazı şeridine (1170–1320) düştüğü için daha iyisi Anadolu'yu büyütmek: projeksiyonu biraz büyüt/ aşağı kaydır ki Anadolu y 1350–1650'yi kaplasın ve etiket oraya otursun. "Rize" etiketi `arrive`'da çıkıyor, bu yüzden "ve rüzgâr bulutu" boyunca izleyici hedefi bilmiyor → Rize etiketini 0.3 sn'de soluk göster, `arrive`'da kırmızı attır.
3. **Kapak/kanca karesi ve birkaç sahnede kompozisyon hatası.**
   - Kapak + sahne 0: Kaşif (`x 0.68`) masanın sağ kenarının (`tx1 = W*0.7` ≈ 756 px) içinde duruyor; bacakları kareli örtünün içinden geçiyor, örtünün kenar çizgisi gövdesini kesiyor. Kaşif'i `x: 0.82` yap ya da hook modunda masayı `tx1 = W*0.6`'da bitir; ayakları tahta döşemeye bassın. Kapakta yazı (y ≈ 450) ile bardağın ağzı (y ≈ 820) arasında ~370 px boş duvar var ve buhar neredeyse görünmüyor: kapakta `zoom` 1.18 → **1.4**, `focus` [570, 880] → [520, 960] (bardak + işaret büyür, boş bant kapanır) ya da hook'ta `gy` 0.6 → 0.52 ile masayı yukarı al; buharı koyulaştır (opaklık ~0.6) ki "radyasyonlu çay" tek bakışta okunsun. Radyasyon işareti (≈190 px) bardağın yanında küçük kalıyor: `tref` ölçeği 0.55 → 0.75.
   - Sahne 9 (`cay_garden` end): çay bardağı (≈ y 1040–1380) altyazı şeridinin (1170–1320) tam arkasında; "gerçek bir hikâye" bardağın üstüne biniyor. Bardağı y ≈ 900–1150'ye, Kaşif'in yanına al (`top` 0.5 → ~0.42 ya da bardağın konumu); üstteki boş gökyüzü (~%35) bu sayede azalır.
   - Sahne 7 (`cay_bunker` pour): damperli kamyonun kabini sol kenarda kesik (yalnızca mavi bir parça görünüyor), kasa kırmızı bir blok gibi; sağdaki mikser tamburu da kenardan taşıyor. Kamyonu x ≥ 60 px'ten başlat, ölçeği ~0.85'e indir, kasayı yeşil yaprak yığını görünecek şekilde açık çiz; mikseri W − 60 içine al. Çay akışı tek tek nokta değil, yoğun bir yaprak şelalesi olsun.

İkincil notlar (puanı etkiledi, ilk üçten sonra):
- Sahne 1 (`cay_reactor`): kara çam ormanı kadrajın ~%60'ını (y ≈ 700–1920) ağır, sık üçgenlerle dolduruyor; santral küçük kalıyor ve brief'teki tel örgü görünmüyor. Ormanı y ≥ 1400'e indir (ön plan katmanı yeter), santrali ~1,3 büyütüp yarık çatıyı y ≈ 650–750'ye getir, y ≈ 1350'de tel örgü çizgisi koy.
- Sahne 5 (`cay_port`): "TÜRK ÇAYI" sandık yazısı 360 px'te zor okunuyor (≈ 40 px) → ≥ 56 px; "İADE" damgası iyi.
- Sahne 3: altın "toz" zerreleri 360 px'te seçilmiyor; sayısını azaltıp boyunu ~2 katına çıkar.
- Hareket: preview `motion` ölçümü elde yok; karelere göre her sahnede bir olay var (flaş, damga, döküm, bulut), ama sahne 8 ("Bugün") yalnızca not + itme; içindeki altın ışıltıya yavaş nabız ver.
- Doğruluk: tarih (26 Nisan 1986, 12 Ağustos 1986), yağmurla gelen kirlenme, iadeler ve beton gömme kaynaklarla uyumlu. "Avrupa geri çevirdi" kaynakta Hollanda/Batı Almanya; genelleme kabul edilebilir. Sahne 1'in kaynak notu (AA Teyit) aslında Aral yazısı; Çernobil tarihi için "CNN Türk" daha doğru.

### Tur 1 düzeltmeleri (yazar)
- **Anlatım (470 karakter, preview ~33 sn):** sahne 2 "ve rüzgâr radyasyon bulutunu Karadeniz'e taşıdı."; sahne 3 "Mayıs yağmuru radyoaktif tozu Rize'nin çay bahçelerine indirdi." (kısaltıldı); sahne 4 "Düşünün, ilk hasat tam o günlerdeydi!" (bütçe için kısaltıldı); sahne 6 "Bakan ise halka güven vermek için Rize'de, gazetecilerin önünde çayını içti." Başlıktaki "neden" sorusunu artık videonun kendisi cevaplıyor, sahne 7'deki "Ama sonunda…" da ironiye dönüyor.
- **Kaynaklar:** AA başlığı "AA Teyit Hattı — Çernobil sonrası Rize'de çay içen bakan" oldu (kişi adı yok). Sahne 1'in kaynak notu "CNN Türk".
- **Kapak + sahne 0:** masa W·0.58'de bitiyor, Kaşif (x 0.74) tahta döşemede, örtünün dışında. Buhar daha koyu (opaklık 0.62), radyasyon işareti büyüdü (ölçek 0.75). Kapak yazısı 3 satıra çıktı ("RADYASYONLU / ÇAYI / İÇTİ"), böylece boş bant kısaldı; `focus [563, 897]`, zoom 1.15 (zoom 1.3'te bardak ve Kaşif kenarlardan kesiliyordu). Buharın üst kısmı motorun kapak gölgesinin (y 690–960) altında soluk kalıyor; bu ortak motor dosyası, dokunmadım.
- **Kapak adayları (yeniden):** A sahne 0 (bardak, radyasyon işareti, şokta Kaşif) · B sahne 6 (bakan içerken, flaş, köşede Kaşif) · C sahne 3 (yağmurlu teraslar ve Kaşif). Telefon boyunda (135×240) A, tek odakla en net okunan; B kalabalık, C dağınık. **A seçildi.**
- **Sahne 6:** bardak gerçek boyutta (s 0.75), dudağın sağ köşesine 24° eğik değiyor, gözler ve bıyık açık. Gazetecilerin sırtlarına gömlek yakası, orta dikiş, kırışıklar ve ikinci bir ceket rengi (lacivert) eklendi; alt bant artık dolu.
- **Sahne 2:** projeksiyon yukarı kaydı (Çernobil [230, 330], Rize [628, 900]). "Çernobil" etiketi işaretin altında ve sağında, kicker'ın dışında. "Anadolu" İç Anadolu'nun üstünde (y ≈ 1027, altyazı şeridinin üstünde). Rize etiketi 0.3 sn'de soluk görünüyor, `arrive`'da koyulaşıp büyüyor.
- **Sahne 7:** kamyon (ölçek 0.85, x 60'tan başlıyor) ve mikser (ölçek 0.72, W−60 içinde) kadrajın içinde. Kasa alçak, üstünde yeşil yaprak yığını görünüyor. Yaprak akışı artık yoğun bir şelale (gövde + 60 yaprak).
- **Sahne 9:** bardak y ≈ 860–1100'de, Kaşif'in yanında, altyazının üstünde. Teraslar 0.42H'den başlıyor; kamera `pull` (zoom 1.0).
- **Sahne 1:** santral 1,3 kat büyüdü, yarık çatı y ≈ 650–750'de. Tel örgü y ≈ 1300–1390'da, orman y ≥ 1430'da (seyrek, açık tonlu ön sıra).
- **Sahne 5:** "TÜRK ÇAYI" 78 px.
- **Sahne 3:** altın zerreler daha az, yaklaşık 2 kat büyük.
- **Sahne 8:** altın ışıltı nabız gibi atıyor (boyut ±%7, opaklık 0.12–0.36).
- `lint`: OK (SEO 100). Tam preview: motion 2.2 (sahne 0, büyük kısmı kapak bindirmesi altında) … 18.3; STATIC? yok.

### Tur 2 (eleştirmen)
`lint`: OK (hata yok). Tur 1'in metin düzeltmeleri yerinde: "neden" artık cevaplanıyor (halka güven vermek için), "radyasyon bulutunu" ve "radyoaktif tozu" netleşti, AA kaynak başlığında kişi adı yok, sahne 1 kaynak notu CNN Türk. Sahne 1 (santral büyüdü, tel örgü, orman aşağıda), sahne 5 ("TÜRK ÇAYI" okunuyor), sahne 7 (kamyon ve mikser kadrajda, yaprak şelalesi), sahne 9 (bardak altyazının üstünde) ve sahne 0'da Kaşif'in masadan çıkması **çözülmüş**. Sahne 6'daki bardak ve sahne 2'deki harita **çözülmemiş**, kapakta yeni bir kural ihlali var.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 6 | 8 | 7 | 8 | 8 | 7 | 8 | 7 |

Kapak (tek başına): **7**. Geçmedi (Görsel=anlatım < 7; kapak < 8).

1. **Sahne 6 (frame_13): kaldırılan bardak hâlâ sürahi boyunda.** Masadaki bardak (frame_12) ≈ 70×110 px, ama "içti"de dudaktaki bardak ≈ 150×220 px: bakanın kafasından (≈ 150 px) büyük, kulpsuz bir sürahi gibi okunuyor, ağzı ve çenesi kapanıyor. Yazar notu "s 0.75" diyor ama kaldırma/içme durumunda bardak ayrı (büyütülmüş) bir ölçekle çiziliyor. Düzeltme: `cay_glass` press modunda lift/drink çiziminde masadaki bardakla **aynı** ölçeği kullan (ek çarpan yok); bardak ≈ 70×110 px, eli tutarken bıyığın sağ ucuna 20–25° eğik değsin, bıyık ve gözler tamamen açık kalsın. Kontrol: frame_12 ve frame_13'teki bardak yükseklikleri eşit olmalı.
2. **Sahne 2 (`cay_map`, frame_04/05): harita coğrafyası yanlış, Çernobil işareti kicker'ın arkasında, alt yarı boş.**
   - Akdeniz, Anadolu'nun güneyinde yatay bir deniz değil; sol kenardan (x 0–440) ekranın dibine kadar inen dikey bir şerit olarak çizilmiş. Anadolu'nun güney kıyısı yok, "Anadolu" alanı aşağı doğru sonsuza uzuyor; izleyici Türkiye'yi tanımıyor. Düzeltme: Anadolu'yu yatay bir yarımada olarak çiz (Karadeniz kıyısı y ≈ 880, Akdeniz kıyısı y ≈ 1400), Ege'yi batıda dar bir şerit, Akdeniz'i y ≈ 1400–1700 arasında yatay bir deniz olarak çiz ve Kıbrıs'ı oraya koy; "Akdeniz" etiketini y ≈ 1550'ye yaz (alt yarıyı da bu doldurur). Pusulayı y > 1500 YouTube arayüzü bölgesinden çıkar ya da sağ alta küçük bırak.
   - Çernobil'in kırmızı işareti (≈ x 185, y 245) kicker kutusunun (y 160–290) arkasında kalıyor; sadece etiket görünüyor. Projeksiyonu ≈ 120 px aşağı kaydır ya da ölçeği 0,9 yap ki işaret y ≥ 340'a insin; bulutun ilk karesi de görünür olsun.
3. **Kapak: Kaşif çerçeveye değiyor, buhar görünmüyor.** Şapkanın sağ kenarı (x ≈ 1035) motorun iç çerçeve çizgisini (x ≈ 1030) kesiyor; CLAUDE.md "Kapak yazısı ve Kaşif çerçeveye değmez". Kaşif'i `x 0.74 → 0.70` al ya da hook modunda `scale 1.15 → 1.05` yap (sahne 0'da da şapka kenara yapışık). Buhar kapak gölgesi altında kayboluyor ve yazı (y ≈ 580) ile bardak ağzı (y ≈ 810) arasında hâlâ boş bir bant var: kapakta `focus` [563, 897] → [540, 1000], `zoom` 1.15 → 1.3 dene (kenarlardan kesiliyorsa bardağı `x 0.3 → 0.34` al), buharı bardağın hemen üstünde 2–3 kalın kıvrım olarak çiz ki "sıcak çay" tek bakışta okunsun. Kapak adayları B ve C (abc.jpg) bunu aşmıyor: B'de de bardak sürahi boyunda, C dağınık; A doğru seçim, sadece bu üç ayar gerekiyor.

İkincil notlar:
- Sahne 5 (`cay_port`): y ≈ 1100–1920 yalnızca perspektif tahta çizgileri + baba + halat, büyük ölçüde boş. Ön plana 2–3 iri çay sandığı ya da çuval yığını koy (y ≈ 1450–1900).
- Sahne 8 (frame_17): itme sırasında üst sıradaki çalılar "Düşün Bakalım" marka satırının üstüne biniyor; focus y'sini ≈ 40 px aşağı al ya da zoom 1.25 → 1.2.
- Senaryo: "patladı, ve rüzgâr…" iki sahneye bölünmüş tek cümle; virgülü kaldır ("patladı ve rüzgâr…"), TTS'te doğal durak zaten var. "Avrupa Türk çayını geri çevirdi." öncesinde bağlaç yok, kopuk duruyor: "Haber yayılınca Avrupa Türk çayını geri çevirdi." (+18 karakter, bütçe içinde).

### Tur 2 düzeltmeleri (yazar)
- **Anlatım (474 karakter, preview ~33 sn):**
  - Sahne 1: "1986'da Çernobil'de bir reaktör patladı" (virgül kalktı, cümle "ve rüzgâr…" ile devam ediyor). Lint "noktalama yok" uyarısı veriyor; cümle bilerek sahne geçişinde bölündü.
  - Sahne 5: "Haber yayılınca Avrupa Türk çayını geri çevirdi."
  - 475 sınırı için: sahne 6 "Bakan ise halka güven vermek için gazetecilerin önünde çayını içti." ("Rize'de" çıktı; yer bilgisi kicker'da "Rize 12 Ağustos 1986" olarak duruyor, flaş cue'su "Bakan"). Sahne 8 "ve o çay hâlâ toprak altında."
- **Sahne 6:** ayrı bir büyütme yoktu; asıl sorun kolun bardağın üstünden dolanması ve bardağın kafaya göre büyük okunmasıydı (sürahi etkisi). Bardak artık masada da elde de aynı ölçekte (s 0.55). El bardağı alttan tutuyor, dirsek aşağıda; bardak 24° eğik, ağzı bıyığın sağ ucunda. Göz ve bıyık açık.
- **Sahne 2 haritası:** Akdeniz poligonu gerçek kıyılarla yeniden çizildi (Levant, Mısır, Libya kıyısı). Anadolu artık yatay bir yarımada: Karadeniz kıyısı y ≈ 1040, Akdeniz kıyısı y ≈ 1400. Altında Kıbrıs'la birlikte yatay Akdeniz (y ≈ 1400–1780), "Akdeniz" etiketi y ≈ 1540, en altta Afrika kıyısı. Çernobil işareti y 340'ta, kicker'ın altında. Pusula küçüldü, sağ altta. Ekran yazısı 5 kelime: Çernobil, Karadeniz, Anadolu, Rize, Akdeniz.
- **Kapak / sahne 0:**
  - Kaşif x 0.70, ölçek 1.05; çerçeveye değmiyor.
  - Bardak x 0.34; buhar bardağın hemen üstünde 3 kalın kıvrım (kalınlık ×1.8, yükseklik 150).
  - `focus [572, 775]`, zoom 1.15. Önerilen [540, 1000] / 1.3 denendi: bardak ağzı motorun kapak gölgesine giriyor, Kaşif ise sağ çerçeveye değiyordu. Boş bant artık y ≈ 580–700.
  - A seçili kaldı.
- **Sahne 5:** ön planda kadrajın altından taşan 3 iri çay sandığı ve baba; halat kangalı çıktı.
- **Sahne 8:** kamera `focus [540, 940]`, zoom 1.2; çalılar marka satırının altında kalıyor.
- `lint`: hata yok, SEO 100, 1 uyarı (sahne 1, bilinçli). Tam preview: motion 2.8–18.1, STATIC? yok.

### Tur 3 (eleştirmen)
`lint`: OK, SEO 100, 1 uyarı (sahne 1 noktalamasız). Uyarı zararsız: `build.py` sahne metinlerini boşlukla birleştirip tek TTS metni yapıyor, ses "patladı ve rüzgâr…" diye kesintisiz okur.

Tur 2 sorunlarının durumu:
- **Sahne 6:** çözüldü. Bardak masada ve elde aynı ölçekte, kafadan küçük ve ince belli çay bardağı olarak okunuyor. Bıyığın ucunda eğik duruyor, göz ve bıyık açık.
- **Sahne 2:** çözüldü. Anadolu yatay bir yarımada; Ege batıda, Akdeniz ve Kıbrıs güneyde. Rize Karadeniz'in güneydoğu köşesinde, Çernobil işareti kicker'ın altında. Sağ alt (Suriye/Irak kara alanı) biraz boş, ama harita için kabul edilebilir.
- **Kapak:** çözüldü. Kaşif çerçeveye değmiyor. Buhar üç kalın kıvrımla görünüyor, boş bant kısaldı. Tek odak (bardak + radyasyon işareti + şokta Kaşif), telefonda küçükken okunuyor.
- **Sahne 5 ve sahne 8:** çözüldü. Ön planda sandıklar var; marka satırı temiz.
- **Metin:** "Haber yayılınca…" bağlantısı iyi. "Rize'de"nin çıkması sorun değil, yer bilgisi kicker'da duruyor.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 8 | 8 | 8 |

Kapak (tek başına): **8**. **Geçti:** tüm kriterler ≥ 7, kapak ≥ 8, lint hatasız.

Kalan küçük notlar (engel değil):
1. **Sahne 7:** "gömüldü, ve o çay…" içinde "ve"den önce virgül var (sahne 7 metni sonu). Türkçede gereksiz, ses de burada durabilir. Virgülü kaldır: "gömüldü" (sahne 1'deki gibi).
2. **Sahne 2:** Çernobil'in halka işareti (y ≈ 300) kicker kutusunun alt kenarına (y ≈ 290) değiyor. Projeksiyonu 30–40 px aşağı almak yeter.
3. **Kapak:** Kaşif (ölçek 1.05) bardağa göre küçük kaldı. Radyasyon işareti tabağın kenarına biniyor. İstenirse işareti ≈ 40 px sağa/yukarı al. Puanı düşürmüyor.
