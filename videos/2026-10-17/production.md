# Prodüksiyon — 2026-10-17 (deneme Shorts)

Yeni ajanlı akışın ilk denemesi. Günün planı dışında, kanal sahibinin isteğiyle üretilen tek Shorts.

## 04-sogan-neden-aglatir

- **Konu / kategori:** Soğan doğrarken neden ağlarız? — insan vücudu + kimya
- **Hissedilen:** "Soğan beni bilerek ağlatıyormuş!" — gündelik bir şeyin arkasındaki gizli kimyasal savaşa şaşırma.
- **Palet:** `lab` → kimya sahnelerinde `magma` (tepkime), göz sahnelerinde `ocean` (gözyaşı).
- **Kanca + kapak:** ilk cümle "Soğan seni kimyasalla vuruyor." ↔ kapak `SOĞAN SENİ / KİMYASALLA / VURUYOR`, vurgu `KİMYASALLA`.
- **Yayın:** 2026-10-17T17:30:00+03:00
- **Doğruluk notları:** Bıçak hücreleri parçalar → alliinaz enzimi kükürtlü bileşiklerle (amino asit sülfoksitler) karşılaşır → sülfenik asit → "gözyaşı faktörü sentazı" enzimi → uçucu gaz *syn-propanetial-S-oksit*. Gaz göze ulaşır, korneadaki sinirleri uyarır, refleks gözyaşı. Bu, soğanın hayvanlara karşı savunmasıdır. Soğutmak gazın uçmasını azaltır; keskin bıçak daha az hücre ezer. ("Gaz gözde sülfürik asit olur" efsanesini **kullanma**.)

### Çekim listesi

| # | Anlatım (taslak) | Visual | Tip | Cue | Kamera / hareket |
|---|---|---|---|---|---|
| 0 | Soğan seni kimyasalla vuruyor. | Bıçağın soğanı kestiği gerçek yakın çekim; kapak yazısı üstte | photo | hit: kimyasal | Ken Burns içeri, bıçağı halkayla işaretle |
| 1 | Bu, soğanın kendini savunma yöntemi. | Dev yazı: "SAVUNMA" amber kutuda | headline | w0 | kelimeler çarpar, maskot şok |
| 2 | Bıçak, soğanın hücrelerini patlatır. | 3D hücre kafesi sıkışıp parçalanıyor | lattice (squeeze) | hit: patlatır | yakın, sarsıntı |
| 3 | Hücrelerde ayrı duran iki madde ilk kez karşılaşır. | Bölünmüş ekran: "Enzim" ↔ "Kükürt" | compare | left/right | iki taraf sırayla girer |
| 4 | Bu karşılaşma havaya uçan bir gaz üretir. | Moleküller ısınıp kafesten kopup yukarı uçuyor | lattice (melt/heat) | hit: gaz | kamera yukarı süzülür |
| 5 | Gaz birkaç saniyede gözüne ulaşır. | Gerçek göz yakın çekimi, gazın geldiği yöne ok | photo | hit: gözüne | Ken Burns göze yaklaşır |
| 6 | Gözündeki sinirler bunu saldırı sanır. | Dev yazı "SALDIRI!" kırmızı; maskot şok | headline | w0 | punch |
| 7 | Beynin, gözü yıkamak için gözyaşı pompalar. | Gözyaşı / damla yakın çekim ya da su hattı | photo / waterline | hit: gözyaşı | akış |
| 8 | Soğanı önce soğutursan daha az gaz çıkar. | Karşılaştırma çubukları: oda sıcaklığı vs buzdolabı gaz miktarı (nitel) | bars / compare | b0/b1 | |
| 9 | Yani o gözyaşları duygusal değil, soğanın savunma kalkanına karşı verdiğin cevap. | Dev yazı kapanış; maskot mutlu | headline | | |

Not: yazar ajan metni 400–500 karaktere, sahne başına tek cümleye uydurur; görsel tipleri `visual` ile birebir eşleşmezse değiştirir.

## Eleştiri günlüğü

### 04-sogan-neden-aglatir — tur 1
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 7 | 8 | 7 | 8 | 8 | 9 | 8 | 9 |

lint: OK (1 uyarı: gerçek foto yok — ortam kısıtı, puan kırılmadı). 465 karakter, ~33 sn, 11 sahne, motion min 5.1 (sahne 8). **Geçmedi** (3 kriter < 8).

1. Sahne 2 ve 9 (`onion` cells/sharp): "bıçak" 14 birim uzunluğunda, kameraya kenarından bakan bir kutu (`BoxGeometry(th, 3.2, 14)`); karede sol üst köşede gri bir duvar/çizgi olarak görünüyor, bıçak olarak okunmuyor. Sahne 9 aynı kamera (`camDef.sharp` = `camDef.cells`) ile sahne 2'nin kopyası gibi duruyor; "keskin bıçak" farkı (th 0.03) neredeyse görünmez. → `cut` modundaki şef bıçağı geometrisini (onion.js ~142) burada da kullan, uzunluğu ~3'e indir, yassı yüzü kameraya döndür ve kadrajın ortasına (ekran y 400–900) insin. Sahne 9'a farklı kamera ver (`"camera": {"yaw": -25, "pitch": 28, "dist": 6}`) ve kör/keskin farkını göster: önce soluk "KÖR" hayalet patlama genişliği (burstW 0.9), sonra keskin bıçağın ince hattı (0.3) — ya da sahne 9'u `compare` ("KÖR: çok hücre ✗ / KESKİN: tek sıra ✓") ile değiştir.
2. Sahne 5 ve 7 (`eye`): `visual` "değdiği yerde kırmızı sinir parlamaları, damarlar kızarıyor" ve "damlalar yanaktan aşağı süzülüyor" diyor; 16.8 ve 22.8 sn karelerinde ikisi de görünmüyor (göz beyazı temiz, gözyaşı sadece alt kapakta ince bir şerit). → eye.js'de temas noktalarına `glowSprite(RED)` + `punch(lt, hit)` ile belirgin kıvılcım ekle, damar opaklığını/kalınlığını artır (`"red": 1`), sahne 7'de kamerayı biraz geri çek (`"camera": {"dist": +%25, "ty": -0.3}`) ve 2–3 damlayı yanaktan ekran y ≈ 900–1150 aralığında aşağı akıt (altyazı bandına girmeden).
3. Sahne 3 (`onion` mix) + sahne 4 (gas) kompozisyon/okunurluk: sahne 3 karışım anında beyaz sis ve glow ile yıkanıyor (sheet 2. kare neredeyse beyaz), "KÜKÜRTLÜ" etiketi "madde" alt yazısına ve parçacıklara biniyor, ENZİM etiketinden ekranı çapraz kesen ince beyaz bir çizgi var. Sahne 4'te GAZ etiketi kadrajın üstünde kesik bir molekülden inen çizgiye bağlı; "syn-propanetial-S-oksit" yazısı ~30 px (min 44). → heroGlow ölçeğini `0.6 + 1.2*after`, opaklığı ≤ 0.45 ile sınırla; mix etiket slotlarını `[0.26,0.3]`/`[0.7,0.3]`'e indir ve leader çizgisini etiket–hedef arası ile kırp (ekran dışı hedefe çizgi çizme); gaz etiketinin anchor'ını kadraj içindeki bir moleküle bağla; kimyasal adı ekrandan kaldır (açıklamada zaten var) ya da sub'ı ≥ 44 px yap.

Diğer: Sahne 1'de 2.2–~3.4 sn arası ekran boş (sadece "hayvanlara karşı" + maskot) çünkü w0 = "savunma" cümlenin 4. kelimesi — kapaktan hemen sonra boş kare kancayı zayıflatır; satırları sahne başında spring ile soluk getir, cue'da sadece punch yap ya da metni "Bu bir savunma silahı, hayvanlara karşı." gibi öne al. Kicker gri kısımları ("patlıyor", "ulaşıyor", "gazı yıkar") açık zeminde (göz/hücre sahneleri) zor okunuyor.

### 04-sogan-neden-aglatir — tur 2
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 8 | 8 | 8 | 8 | 8 | 8 | 9 | 8 | 9 |

lint: OK (sadece "gerçek foto yok" uyarısı — ortam kısıtı). 461 karakter, ~33 sn, 11 sahne, motion min 5.1 (sahne 7), 5.2 (sahne 8). **Geçti** (tüm kriterler ≥ 8). Tur 1 düzeltmeleri karede doğrulandı: sahne 1'de "SAVUNMA" 3.2 sn'de ekranda; sahne 2'de gerçek bıçak yaprağı hücreleri patlatıyor (7.4 sn); sahne 3 temiz, ENZİM / KÜKÜRTLÜ MADDE okunuyor, çapraz çizgi yok; sahne 4'te GAZ etiketi kadraj içinde, kimyasal ad ekrandan kalkmış; sahne 5'te temas kıvılcımları var (17.1 sn); sahne 7'de damlalar yanaktan akıyor (22.9 sn); sahne 9 farklı açı + "KÖR BIÇAK → KESKİN BIÇAK" farkı.

Kalan küçük sorunlar (geçmeyi engellemiyor, 3. tur yapılırsa):
1. Sahne 9: alt yazılar "geniş hasar" / "tek ince hat" ~30 px (min 44) ve "tek ince hat" üstünden etiket çizgisi geçiyor → `labels[].sub` font boyutunu ≥ 44 px yap ya da sub'ları kaldır; çizginin başlangıcını etiket kutusunun altına al.
2. Sahne 5: damar kızarması hâlâ sadece göz köşesinde, zayıf; "gözün damarları kızarıyor" tam okunmuyor → `"red": 1` ver ve kızarmayı göz beyazının tamamına yay (veins opacity ↑).
3. Sahne 2 başı (6.3 sn): bıçak kadraja üstten, kicker bölgesinin (y < 260) içinden giriyor; sahne 4 kicker'ının gri "gaz" kısmı turuncu zeminde soluk → bıçak başlangıç yüksekliğini düşür / kamerayı hafif aşağı bak (`"camera": {"ty": 0.3}`); sahne 4'te `title.gray`'i kaldır ("Göz yakan gaz" hepsi beyaz).
