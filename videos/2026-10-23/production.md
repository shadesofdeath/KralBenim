# Prodüksiyon — 2026-10-23 (Cuma)

Plan (`tools/plan.py`): 4 Shorts + 1 uzun video. ElevenLabs: bu ay 51.067 / 231.442 karakter (uyarı yok).
Görseller sadece kodla (Higgsfield ve diğer yapay zekâ araçları yasak, 2026-10-22).

Konu dağılımı (dört Shorts farklı havuz ve dönem; uzun video ayrı olay):

| Dosya | Konu | Havuz | Dönem | Yayın |
|---|---|---|---|---|
| 01-vasili-arhipov | Küba Füze Krizi, B-59 denizaltısı, 27 Ekim 1962 | büyük kararlar | 20. yy, Soğuk Savaş | 23 Ekim 12:00 |
| 02-ilk-rontgen | Röntgen ve ilk X-ışını fotoğrafı (Anna Bertha'nın eli), 1895 | keşifler ve icatlar | 19. yy sonu, Almanya | 23 Ekim 15:00 |
| 03-roma-son-imparator | Batı Roma'nın son imparatoru Romulus Augustulus, 476 | imparatorlukların yükselişi/çöküşü | Geç Antik Çağ | 23 Ekim 19:00 |
| 04-preveze-1538 | Preveze Deniz Savaşı, Barbaros Hayreddin, 28 Eylül 1538 | Türkiye ve Osmanlı tarihi | 16. yy, Osmanlı | 23 Ekim 22:00 |
| 05-lizbon-depremi-1755 (uzun) | 1 Kasım 1755 Lizbon depremi, tsunami ve yangın | felaketler ve kazalar | 18. yy, Portekiz | 23 Ekim 20:30 |

Geçmişte işlenmedi (Viyana 1529, Nusret, Haliç, Malazgirt, Apollo 13, Pompeii, Londra yangını, Tunguska… ile çakışmıyor).

---

## 01-vasili-arhipov (Shorts, 12:00)

- **Hissedilen:** "Dünyayı nükleer savaştan kurtaran bir başkan ya da general değildi; bir denizaltıda 'hayır' diyen tek bir subaydı."
- **Kanca + kapak fikri:** "Bir adamın 'hayır'ı dünyayı kurtardı." ↔ kapak `ONUN 'HAYIR'I / DÜNYAYI / KURTARDI` ya da `TEK BİR / HAYIR` (vurgu `HAYIR`). Kapak karesi: karanlık denizaltı içinde kırmızı ışık, nükleer torpido, büyük şok Kaşif.
- **Doğrulanacak bilgiler:** 27 Ekim 1962, Küba Füze Krizi'nin en gergin günü. Sovyet denizaltısı B-59 Karayipler'de ABD gemilerince sıkıştırıldı; ABD destroyerleri yüzeye çıkmaya zorlamak için eğitim amaçlı küçük derinlik bombaları (sinyal bombaları) attı. Denizaltı günlerdir Moskova ile bağlantısızdı, içerisi çok sıcak, karbondioksit yüksekti. Kaptan Valentin Savitski savaşın başladığını düşündü, nükleer torpidoyu hazırlatmak istedi. Fırlatma için gemideki üç üst subayın onayı gerekiyordu (Savitski, siyasi subay Ivan Maslennikov, filotilla kurmay başkanı Vasili Arhipov); Arhipov karşı çıktı, denizaltı yüzeye çıktı. Bilgi büyük ölçüde sonradan tanıklıklarla ortaya çıktı (2002 Havana konferansı) → ayrıntıları "anlatılana göre" ile ver. Savitski'nin sözlerini birebir alıntılama, ya da "tanıklara göre" de.
- **Görsel omurga önerisi:** `map` (Karayipler, Küba, karantina hattı, denizaltı noktası çevresinde gemiler), `stage` (Kaşif + üç subay; şapkasız, tek aksesuar ör. `beret`), yeni tip öneri **`ar_sub`** (denizaltı kesiti, kırmızı ışık, yukarıda gemi silüetleri, inen derinlik bombası halkaları, torpido; cue'da patlama sarsıntısı), `board` (3 anahtar: ✓ ✓ ✗), `title` ("3 SUBAYDAN 1'İ").
- **Kapanış örneği (yazar kendi cümlesini kursun):** "Yani dünyanın en tehlikeli gününde, kurtuluş tek bir kelimeydi: hayır."

## 02-ilk-rontgen (Shorts, 15:00)

- **Hissedilen:** "Tarihin ilk röntgen fotoğrafında bir kadın kendi iskeletini gördü ve korktu."
- **Kanca + kapak fikri:** "Bu el, tarihin ilk röntgeni." ↔ kapak `KENDİ ÖLÜMÜNÜ / GÖRDÜ` ya da `İLK RÖNTGEN / BU ELDİ` (vurgu `RÖNTGEN`/`ÖLÜMÜNÜ`). Kapak karesi: dev el kemikleri, parmakta yüzük, büyük hayret Kaşif.
- **Doğrulanacak bilgiler:** 8 Kasım 1895, Würzburg, Wilhelm Conrad Röntgen katot ışını tüpüyle çalışırken, tüpü siyah kartonla kapattığı halde odadaki floresan ekranın parladığını fark etti. Haftalarca laboratuvarda çalıştı. 22 Aralık 1895'te eşi Anna Bertha Röntgen'in elinin görüntüsünü aldı (yüzüğü görünüyor). Anna Bertha'nın "kendi ölümümü gördüm" dediği anlatılır → "anlatılana göre". Adını bilinmezlik için "X" koydu. 28 Aralık 1895 makale; 1901'de ilk Nobel Fizik Ödülü. Patent almadı (doğrula). Pozlama süresi yaklaşık 15 dakika (doğrula, emin değilsen verme).
- **Görsel omurga önerisi:** `stage` (Kaşif + Röntgen laboratuvarda, karanlık oda, parlayan ekran), yeni tip öneri **`xr_hand`** (fotoğraf plakasında beliren el kemikleri ve yüzük, mürekkep ışınlar, cue'da kemikler görünür), `timeline` (8 Kasım → 22 Aralık → 1901 Nobel), `photo` (gerçek "Hand mit Ringen" fotoğrafı, Wikimedia Commons, kamu malı; `tools/media.py`), `title` ("X").
- **Kapanış örneği:** "Yani ilk röntgen bir hastanede değil, bir kocanın eşinin elini tutmasıyla çekildi."

## 03-roma-son-imparator (Shorts, 19:00)

- **Hissedilen:** "Koca Batı Roma bir savaşta değil, bir çocuğun tahttan sessizce indirilmesiyle bitti."
- **Kanca + kapak fikri:** "Roma'nın son imparatoru bir çocuktu." ↔ kapak `ROMA'NIN SONUNCUSU / BİR ÇOCUKTU` (vurgu `ÇOCUK`). Kapak karesi: büyük tahtta küçücük çocuk, defne tacı kayıyor, büyük şaşkın Kaşif.
- **Doğrulanacak bilgiler:** 475'te general Orestes, imparator Julius Nepos'u kovup oğlu Romulus'u tahta oturttu (yaşı yaklaşık 14–16 civarı; "henüz bir genç/çocuk" de, kesin yaş verme). Lakabı "Augustulus" = "küçük Augustus" (alay). Adı Roma'nın kurucusu Romulus ile ilk imparator Augustus'u birleştiriyordu. 476'da Germen paralı askerler toprak istedi, Orestes reddetti; komutan Odoaker (Odoacer) ayaklandı, Orestes'i öldürdü, Eylül 476'da Ravenna'da Romulus'u tahttan indirdi. Odoaker çocuğu öldürmedi, emekli maaşıyla Napoli yakınlarına (Campania'daki Lucullus villası) gönderdi. İmparatorluk işaretlerini Konstantinopolis'e, Doğu imparatoru Zeno'ya gönderdi: "Batı'ya imparator gerekmez" anlamında. Doğu Roma 1453'e kadar sürdü (Türkiye bağlantısı, kısaca). 476 tarihçilerin sonradan koyduğu bir sınır; o gün kimse "Roma bitti" demedi.
- **Görsel omurga önerisi:** `timeline` (753 MÖ kuruluş → 27 MÖ Augustus → 476), `stage` (Kaşif + çocuk imparator `laurel`, Odoaker `helmet`), yeni tip öneri **`rm_throne`** (dev boş taht, kayan defne tacı, sandığa konan mor pelerin; cue'da taç düşer), `map` (Ravenna → Konstantinopolis, nişanların gönderilişi), `board` (Romulus + Augustus = Augustulus).
- **Kapanış örneği:** "Yani bin yıllık Roma bir savaşla değil, bir posta paketiyle bitti."

## 04-preveze-1538 (Shorts, 22:00)

- **Hissedilen:** "Sayıca üstün Haçlı donanması, rüzgârı ve kıyıyı okuyan Barbaros karşısında dağıldı."
- **Kanca + kapak fikri:** "Barbaros iki kat büyük donanmayı dağıttı." (oranı doğrula; emin değilsen "çok daha büyük") ↔ kapak `BARBAROS / DEV DONANMAYI / DAĞITTI` (vurgu `BARBAROS` ya da `DEV`). Kapak karesi: dalgalarda çatışan kadırgalar, alevler, büyük şok/işaret eden Kaşif.
- **Doğrulanacak bilgiler:** 28 Eylül 1538, Preveze (Yunanistan'ın batı kıyısı, Arta körfezi ağzı). Papa III. Paulus'un öncülüğünde Kutsal İttifak (Venedik, İspanya/Habsburg, Papalık…) donanması, komutan Cenevizli Andrea Doria. Osmanlı Kaptan-ı Deryası Barbaros Hayreddin Paşa. Haçlı donanması çok daha büyüktü (gemi sayıları kaynaklara göre değişir; "yaklaşık" ya da sayı verme). Barbaros önce körfezde bekledi, Doria saldırmakta tereddüt etti, rüzgâr değişince açılıp saldırdı; birleşik donanmanın komutanları arasında anlaşmazlık; Doria çekildi. Sonuç: Akdeniz'de Osmanlı deniz üstünlüğü yaklaşık 1571 İnebahtı'ya kadar sürdü. 27 Eylül bugün Türkiye'de Deniz Kuvvetleri Günü (Preveze'nin yıldönümü; doğrula). Taraf tutmayan, saygılı anlatım.
- **Görsel omurga önerisi:** `map` (İyon Denizi, Preveze, Arta körfezi, iki donanmanın konumu, kesikli manevra), `stage` (Kaşif + Barbaros `turban`, kırmızı sakal mürekkeple), yeni tip öneri **`pv_fleet`** (kuşbakışı kadırgalar, rüzgâr oku döner, Haçlı hattı dağılır; cue'da rüzgâr değişir), `board` (Haçlı: büyük donanma ✓, tek komuta ✗ · Osmanlı: kıyı ✓, rüzgâr ✓), `timeline` (1538 Preveze → 1571 İnebahtı).
- **Kapanış örneği:** "Yani Preveze'yi büyük donanma değil, denizi okuyan bir kaptan kazandı."

## 05-lizbon-depremi-1755 (uzun video, 20:30)

- **Hissedilen:** "Bir bayram sabahı Avrupa'nın en zengin şehirlerinden biri üç felaketi üst üste yaşadı: deprem, dalga, ateş. Ve bu felaketten modern deprem biliminin ve şehir planlamasının ilk adımları çıktı."
- **Kanca + kapak fikri:** kanca: "1 Kasım 1755 sabahı, Lizbon'da kiliseler tıklım tıklımdı." Kapak `ÜÇ FELAKET / TEK SABAH` ya da `DENİZ / ÇEKİLDİ` (vurgu `ÜÇ` / `ÇEKİLDİ`). Kapak karesi: dev dalga, yıkılan kilise, büyük şok Kaşif.
- **Doğrulanacak bilgiler (yazar web ile doğrulasın):** 1 Kasım 1755, Azizler Günü (Tüm Azizler Bayramı), sabah yaklaşık 09:40. Merkez Atlantik'te, Lizbon'un güneybatısında; büyüklük bugün yaklaşık 8,5–9 civarı tahmin ediliyor ("yaklaşık" de). Birkaç dakika süren sarsıntılar; şehir merkezinde kiliseler, Ribeira Sarayı, kraliyet kütüphanesi ve opera binası yıkıldı. Halk liman meydanına, Tejo kıyısına kaçtı; deniz çekildi, insanlar açılan deniz tabanına baktı; yaklaşık 30–40 dakika sonra tsunami geldi. Kiliselerdeki mumlar ve ocaklar yangın başlattı; yangın günlerce (yaklaşık 5 gün) sürdü. Ölü sayısı çok tartışmalı (Lizbon'da on binlerce; sayı vermeden önce kaynakla doğrula, aralık kullan). Kral I. José ailesiyle şehir dışında olduğu için kurtuldu; sonra çadırlarda yaşamayı tercih etti (doğrula). Bakan Sebastião de Melo (sonradan Marquês de Pombal) — meşhur "ölüleri gömün, yaşayanları doyurun" sözü ona atfedilir (atfedildiğini söyle). Pombal ülke çapında papazlara anket gönderdi (sarsıntı ne kadar sürdü, kuyularda su değişti mi…) → sismolojinin öncülerinden sayılır. Baixa yeniden ızgara planla yapıldı; "gaiola pombalina" ahşap kafes yapı sistemi, askerlerin etrafında yürüyerek test ettiği anlatılır (doğrula). Voltaire'in "Lizbon Felaketi Üzerine Şiir"i ve Candide; Kant'ın deprem yazıları; felaket Avrupa'da iyimserlik felsefesini sarstı. Tsunami Kuzey Afrika ve Karayipler'e kadar ulaştı (doğrula). Yaygın efsaneleri kesin gibi anlatma.
- **Önerilen bölümler (6–8):** 1 Bayram sabahı (zengin Lizbon, altın, liman, kiliseler) · 2 Sarsıntı · 3 Deniz çekildi (tsunami) · 4 Şehir yanıyor · 5 "Ölüleri gömün": Pombal'ın kararları · 6 Peki neden? (fay, okyanus tabanı, neden bu kadar yıkıcı: üç felaket zinciri, ahşap/taş yapılar, kalabalık kiliseler, mumlar) · 7 Pombal'ın anketi ve deprem biliminin doğuşu · 8 Sonrası ve bugün (Baixa, Voltaire, Kant; tek yorum sorusu).
- **Görsel omurga önerisi:** `map` (İber yarımadası, Atlantik, merkez üssü, dalganın ulaştığı kıyılar), `stage` (Kaşif + halk, rahip, Pombal `beret`/peruksuz, Kral José), `timeline` (09:40 → 10:20 dalga → yangın 5 gün), `board`, `title`, `chapter`; yeni konuya özel tipler önerisi: **`lz_city`** (kilise cepheleri sallanıp çöker, toz bulutu), **`lz_wave`** (çekilen deniz, açılan taban, ufukta yükselen dalga), **`lz_fire`** (mumlardan yayılan alev), **`lz_grid`** (Baixa ızgara planı + gaiola kafes çizimi). `photo` için telifsiz gerçek gravürler (1755 Lizbon gravürü, Wikimedia Commons; kamu malı).

---

## Çekim listeleri


### Notlar 01

# 01-vasili-arhipov — yazar notları (tur 2 sonrası)

Dosya: `videos/2026-10-23/01-vasili-arhipov.json` · yayın 2026-10-23T12:00:00+03:00 · yeni sahne tipleri: `scenes/studio/shots/ar_sub.js` (`ar_room`, `ar_sea`)

## Tek parça anlatım (492 karakter)

Tek bir "hayır" dünyayı kurtardı. Gelin anlatayım: 1962, Küba Füze Krizi. Adanın açığında bir Sovyet denizaltısı saklanıyordu. İçerisi fırın gibiydi, günlerdir Moskova'dan haber yoktu. Derken tepede bombalar patladı. Amerikalılar sadece "yüzeye çık" diyordu, ama siz bilir miydiniz? Tanıklara göre kaptan savaş sandı ve nükleer torpidoyu hazırlattı. Ama üç subayın da onayı şarttı. Anlatılana göre ikisi evet dedi. Arhipov ise hayır dedi. Yani dünyayı bir ordu değil, tek bir kelime kurtardı.

YouTuber sesi: "Gelin anlatayım", "siz bilir miydiniz?". Çekince: "Tanıklara göre" (kaptan/torpido) + "Anlatılana göre" (oylama). "-yor" sonu yok, devrik yok.

## Çekim listesi

| # | Anlatım | Visual (özet) | Tip | Kaşif | Cue |
|---|---|---|---|---|---|
| 0 | Tek bir "hayır" dünyayı kurtardı. | Alarm ilk karede yanıyor, "nükleer" torpido etiketi 0.15 sn'de; kaptan öfkeli, Arhipov işaret ediyor + "HAYIR!" balonu (kapak/kanca karesi) | ar_room | kapak Kaşif'i (büyük, şok) | alarm=Tek, no=hayır |
| 1 | Gelin anlatayım: 1962, Küba Füze Krizi. | Harita: Havana, Küba'yı saran kırmızı kesikli abluka halkası, doğu kenarında "B-59", not "Ekim 1962" | map | — | city=1962, route=Küba, sub=Krizi |
| 2 | Adanın açığında bir Sovyet denizaltısı saklanıyordu. | 2 muhrip + sonar halkaları; büyük denizaltı, geniş pencerede büyük Kaşif dürbünle bakıyor → omuz silkiyor; "B-59" | ar_sea | look → shrug | ping=Sovyet, hide=saklanıyordu |
| 3 | İçerisi fırın gibiydi, günlerdir Moskova'dan haber yoktu. | Termometre tırmanıyor, sıcak dalgaları, ter; telsiz çarpılıyor, "Moskova?" | ar_room | think → shrug | heat=fırın, radio=haber |
| 4 | Derken tepede bombalar patladı. | Fıçılar batıyor, denizaltı üstünde patlamalar, şok halkaları, sarsıntı | ar_sea | talk → shock | b1=bombalar, b2=patladı |
| 5 | Amerikalılar sadece "yüzeye çık" diyordu, ama siz bilir miydiniz? | Muhrip pruvasında denizci aşağıyı gösteriyor + "Yüzeye çık!" balonu; Kaşif yukarı işaret → omuz silkme + "?" | ar_sea | point → shrug | say=yüzeye, q=bilir |
| 6 | Tanıklara göre kaptan savaş sandı ve nükleer torpidoyu hazırlattı. | Alarm hızlanıyor, kapak açılıyor, torpido kayıyor, "nükleer" | ar_room | → shock | alarm=savaş, lab=nükleer, load=torpidoyu |
| 7 | Ama üç subayın da onayı şarttı. | Pano "Ateş için şart": 3 kart (Kaptan / Siyasi subay / Arhipov) + "Üçü de evet" | board | — | c0/c1/c2, pill=şarttı |
| 8 | Anlatılana göre ikisi evet dedi. Arhipov ise hayır dedi. | ✓ ✓ ✗ oy işaretleri + "Hayır!" balonu | ar_room | → shock | v1=ikisi, v2=evet, v3=hayır |
| 9 | Yani dünyayı bir ordu değil, tek bir kelime kurtardı. | "Dünyayı / bir kelime / kurtardı" sırayla, "kelime" kırmızı kutuda, not "27 Ekim 1962" | title | point (mutlu) | w0..w3 |

Kaşif 7/10 (+ kapak/kanca). Tipler: ar_room 4, ar_sea 3, map, board, title.

## Tur 1 eleştirisine göre yapılanlar

1. Senaryo: "Gelin anlatayım", "siz" hitabı; ders kitabı başlığı yerine anlatıcı cümlesi; sahne 5 sorusu "siz bilir miydiniz?"; oylamaya "Anlatılana göre"; 500 → 492 karakter, tahmini ~35,9 sn (preview tahmini; gerçek TTS ~33 sn beklenir).
2. Kapak: 3 aday üretildi, yan yana karşılaştırıldı (aşağıda). Kapak Kaşif'i scale 1.3. Yeni `cover_cam` parametresi (ar_sub.js) kapak/kanca karesinde sahneyi büyütüp yukarı alıyor (zoom 1.1, dy -110) ve gerekirse sahnenin kendi Kaşif'ini gizliyor.
3. Kompozisyon: deniz sahnelerinde Kaşif 0.92 (eski 0.72), daha büyük denizaltı ve pencere; bulutlar kapalı, gemiler küçültüldü, kicker temiz; sahne 5 balonu kadraj içinde; sahne 8 karakterler 0.12/0.32/0.52, Kaşif 0.78; harita abluka hattı Küba'yı saran kesikli halka; sahne 9 cue'ları kelime indeksine göre düzeltildi (w0 Dünyayı, w1 bir, w2 kelime, w3 kurtardı), satırlar sırayla geliyor; sahne 0'da alarm ve "nükleer" etiketi ilk saniyede, kamera itmesi 1.0 → 1.14.

## Doğruluk notları

- 27 Ekim 1962; B-59 Küba açıklarında (Sargasso Denizi); Amerikan muhripleri eğitim amaçlı sinyal bombaları attı (zarar amacı yok).
- Moskova'yla birkaç gündür bağlantı yok; içeride dayanılmaz sıcak (derece verilmedi).
- Üç subay onayı: Savitski, Maslennikov, Arhipov; Arhipov karşı çıktı, denizaltı yüzeye çıktı.
- Kaptanın torpidoyu hazırlatması Orlov tanıklığına dayanıyor, tartışmalı → "Tanıklara göre"; oylama ayrıntısı → "Anlatılana göre". Radchenko (2024) sözlü tanıklık uyarısı.
- Kaynaklar: https://en.wikipedia.org/wiki/Vasily_Arkhipov · https://en.wikipedia.org/wiki/Soviet_submarine_B-59 · https://nsarchive.gwu.edu/node/2765

## Kapak adayları (tur 2)

| Aday | Kare | Sonuç |
|---|---|---|
| A | sahne 8, t 3.5, Kaşif point/surprised 1.3 | ✓✓ görünüyor ama ✗ ve Arhipov'un hareketi henüz yok, "Hayır!" balonu üst geçiş solukluğunda; Kaşif gülümsüyor gibi |
| B | sahne 6 sonu, açık kapak + "nükleer" torpido | tek kaptan, boş orta alan, torpido soluk; dramatik değil |
| **C (seçilen)** | sahne 0, t 3.0, Kaşif shock 1.3 | büyük "HAYIR!" balonu, öfkeli kaptan + Arhipov, "nükleer" torpido okunur, büyük şok Kaşif; ilk cümleyle birebir |

Metin: TEK BİR / **HAYIR** / DÜNYAYI KURTARDI.

## Bilinen sınırlar

- Kapakta yazı ile sahne arasında ~150 px boşluk kalıyor; kapak karesindeki üst solukluk ve aşağı kaydırma motordan geliyor (`engine.js` `coverShift` + covershade). Daha fazla yukarı alınca torpido solukluğun içine giriyor.
- Sahne 0 hareketi 2.3 (kapak kancasının altında oynuyor).
- Sahne 5'teki Amerikalı denizci küçük (gemi ölçeği yüzünden).

## Tur 2 eleştirisine göre yapılanlar (tur 3)

Anlatım (485 karakter, preview ~34 sn):
Tek bir "hayır" dünyayı kurtardı. Gelin anlatayım: 1962, Küba Füze Krizi. Bir Sovyet denizaltısı orada saklanıyordu. İçerisi fırın gibiydi, Moskova'dan ses yoktu. Derken bombalar patladı. Amerikalılar sadece "yüzeye çık" diyordu. Ama siz o karanlıkta bunu nereden bilecektiniz? Tanıklara göre kaptan savaşın başladığını sandı ve nükleer torpidoyu hazırlattı. Ama üç subayın onayı şarttı. Anlatılana göre ikisi evet, Arhipov ise hayır dedi. Yani dünyayı ordu değil, tek kelime kurtardı.

- Sahne 5 ve 6 eleştirmenin cümleleri; kısaltma sahne 3/4/7/8/9'dan. Sahne 9 yazısı "Dünyayı / tek kelime / kurtardı".
- Sahne 8 altyazısındaki "evet  dedi" boşluğu: metinde çift boşluk yoktu (lint denetliyor); cümle "ikisi evet, Arhipov ise hayır dedi." olarak değişti, yeni önizlemede sorun yok.
- Sahne 0: alarm t=0'dan, kaptan t=0.3'te işaret, kamera doğrusal 1.0→1.18, "hayır"da kamera punch'ı (`hits`) ve Arhipov'un kolu kalkıyor (dir 35). Motion 2.4 (kare çiftleri önizlemede kapak kancasının altında).
- Kapak: 3 aday yan yana (`covers03.jpg`): sahne 0 t 3.0 · **sahne 8 sonu (seçilen)** · sahne 6 sonu. Seçilen: ✓ ✓ ✗ + "Hayır!" balonu + öfkeli kaptan/Arhipov + büyük şok Kaşif (1.3), sahnenin kendi Kaşif'i kapakta gizli. cover_cam zoom 1.12, dx 30, dy -30 (✓✓✗ ve balon motorun opak gölge bölgesinin altında).
- Kalan: yazı ile sahne arasındaki boşluk (~180 px) motorun `index.html` #covershade gradyanından (y 0–36% tam opak, 50%'de biter); sahneyi daha yukarı alınca nesneler soluyor. Ortak dosya, yönetmene bırakıldı.


### Notlar 02

## 02-ilk-rontgen — yazar notları (tur 0)

### Tek parça anlatım (500 karakter)

Bu kadın kendi ölümünü gördü. Hem de 1895'te! Würzburg'da Wilhelm Röntgen, katot tüpünü siyah kartonla sarmıştı. Ama karanlık odada, masadaki bir ekran birden parladı. Işık kartonu nasıl geçmişti? Röntgen haftalarca laboratuvarda yatıp kalktı. Bu gizemli ışına da "X" dedi. Sonra eşi Anna Bertha'nın elini fotoğraf plakasına koydu. Plakada kemikleri ve yüzüğü apaçık belirdi. Anlatılana göre Anna, "Kendi ölümümü gördüm." dedi. Röntgen buluşuna patent bile almadı. Çünkü ona göre bu ışık, herkesindi.

Preview tahmini ~35 sn, 10 sahne. "-yor" ile biten cümle yok.

### Çekim listesi

| # | Anlatım | Visual | Tip | Kaşif | Cue |
|---|---|---|---|---|---|
| 0 | Bu kadın kendi ölümünü gördü. Hem de 1895'te! | Dev röntgen plakası: soluk et içinde sol elin kemikleri, yüzük parmağında koyu yüzük; kenarda altın nabız, kamera yüzüğe iter; kırmızı "1895" + yüzüğe kırmızı halka | xr_hand (plate) | bakar → şok | shock=ölümünü, year=1895 |
| 1 | Würzburg'da Wilhelm Röntgen, katot tüpünü siyah kartonla sarmıştı. | Tezgâh: raf, kıvılcımlı bobin, parlayan armut tüp, ekran; siyah karton kutu inip tüpü örter | xr_lab (wrap) | kutuyu işaret eder | wrap=kartonla |
| 2 | Ama karanlık odada, masadaki bir ekran birden parladı. | Oda taramayla kararır; küçük ekran altın yanar, halkalar + ışınlar | xr_lab (glow) | şok | dark=karanlık, glow=parladı |
| 3 | Işık kartonu nasıl geçmişti? | Röntgen düşünür; Kaşif yürüyerek gelir, düşünür, omuz silker; el yazısı "Karton geçirmez ki?" | stage | yürür → düşünür → omuz silker | q=kartonu, end=geçmişti |
| 4 | Röntgen haftalarca laboratuvarda yatıp kalktı. | Dikey zaman çizgisi: 8 Kasım · ekran → kırmızı 6 hafta · laboratuvarda | timeline | alttakini işaret eder | a=Röntgen, b=haftalarca |
| 5 | Bu gizemli ışına da "X" dedi. | Dev "X / ışını", X kırmızı kutuda, not "bilinmeyen" | title | X'i işaret eder | w0=X |
| 6 | Sonra eşi Anna Bertha'nın elini fotoğraf plakasına koydu. | Topuzlu, etekli Anna elini uzatır, avucu plakaya kayar; tüp yanar, altın ışınlar ele iner; Röntgen işaret eder | xr_lab (hand) | bakar → aşağı işaret eder | hand=elini, rays=plakasına |
| 7 | Plakada kemikleri ve yüzüğü apaçık belirdi. | Önce et silueti; altın tarama çizgisiyle kemikler bilekten uçlara belirir; yüzük vurarak çıkar, kırmızı halka | xr_hand (reveal) | işaret eder → şok | bones=kemikleri, ring=yüzüğü |
| 8 | Anlatılana göre Anna, "Kendi ölümümü gördüm." dedi. | Raptiyeli eğik röntgen baskısı, "22 Aralık 1895"; Anna şokla geri sıçrar | xr_hand (print) | düşünür → şok | hit=ölümümü, date=Anlatılana |
| 9 | Röntgen buluşuna patent bile almadı. Çünkü ona göre bu ışık, herkesindi. | Röntgen "PATENT YOK" tabelası tutar; Kaşif gelip işaret eder; sonra Röntgen el sallar, "Işık herkesin!" | stage | yürür → işaret eder → kollarını açar | p=patent, h=herkesindi |

Tipler: xr_hand 3, xr_lab 3, stage 2, timeline 1, title 1 (5 farklı tip). Kaşif 10/10 sahnede.

### Doğruluk notları
- 8 Kasım 1895, Würzburg: Röntgen, Crookes–Hittorf tüpünü siyah kartonla kapatmıştı; birkaç adım ötedeki baryum platinosiyanür ekran parladı. Sonraki haftalarda laboratuvarda yiyip uyudu (Wikipedia); PBS'e göre "altı hafta" laboratuvarda kaldı.
- "X": matematikte bilinmeyen anlamında (Wikipedia).
- Anna Bertha'nın sol elinin görüntüsü, 22 Aralık 1895 (Hyperallergic, PBS; Commons dosya adı 18951222). Yüzük görünüyor (görüntünün adı "Hand mit Ringen").
- "Kendi ölümümü gördüm" sözü kaynaklarda aktarılıyor ama birincil kaynak gösterilmiyor → metinde "Anlatılana göre".
- Patent almadı: buluşun bütün topluma yaraması için (Wikipedia). 1901 ilk Nobel Fizik sadece açıklamada geçiyor.
- Bilerek kullanılmayanlar: pozlama süresi (~15 dk iddiası, doğrulanamadı), kemiklerin rengi/negatif-pozitif ayrıntısı.
- Kaynaklar: https://en.wikipedia.org/wiki/Wilhelm_R%C3%B6ntgen · https://hyperallergic.com/i-have-seen-my-death-the-first-x-ray-photograph · https://www.pbs.org/newshour/health/i-have-seen-my-death-how-the-world-discovered-the-x-ray · https://c.enwp.org/wiki/File:First_medical_X-ray_by_Wilhelm_R%C3%B6ntgen_of_his_wife_Anna_Bertha_Ludwig%27s_hand_-_18951222.jpg

### Kapak adayları (hepsi "BU KADIN / KENDİ ÖLÜMÜNÜ / GÖRDÜ" ya da "KENDİ ÖLÜMÜNÜ GÖRDÜ", vurgu ÖLÜMÜNÜ)
- A: sahne 0, t 2.0, büyük Kaşif şok, 1.25: güçlü, ama kırmızı halka yok.
- B: sahne 7, t 2.9, Kaşif point: yüz gülümsüyor gibi duruyor, zayıf.
- C: sahne 8 (baskı + Anna şok), Kaşif yok, metin "Kendi ölümünü gördü": figürler küçük, zayıf.
- **Seçilen A2:** sahne 0, t 3.3 (yüzüğe kırmızı halka çizilmiş), büyük Kaşif `shock` scale 1.3 x 850 y 1840. Arkada sahnedeki küçük Kaşif'in yarısı görünüyor (küçük kusur).

### Diğer
- Gerçek "Hand mit Ringen" fotoğrafı kullanılamadı: bu bulut ortamından commons/upload.wikimedia.org proxy'de 403. `params.url` yolu (build.py fetch_media → hf.fetch) dosyayı 1920×1080 videoya kırptığı için portre bir fotoğraf için uygun değil. El röntgeni bu yüzden kodla çizildi (`xr_hand`).
- Yeni dosya: scenes/studio/shots/xr_lab.js (SHOTS.xr_lab + SHOTS.xr_hand). Kadın figürü için topuz + etek bu dosyada çiziliyor (kasif.js'e dokunulmadı).


---
## Tur 2 (eleştiri 1. turundan sonra)

### Yeni tek parça anlatım (496 karakter)
Bu kadın kendi ölümünü gördü. Gelin, anlatayım. 1895'te Röntgen, deney tüpünü siyah kartonla sarmıştı. Işık sızamazdı. Ama karanlıkta, masadaki bir ekran parladı! Siz olsanız ne yapardınız? Röntgen haftalarca laboratuvarda yiyip uyudu. Bu ışına, matematikteki bilinmeyen gibi "X" dedi. Sonra eşi Anna'nın elini plakaya koydu. Işın eti geçmişti, ama kemiklere ve yüzüğe takılmıştı. Anlatılana göre Anna, "Ölümümü gördüm." dedi. Röntgen buna patent bile almadı. Çünkü ona göre bu ışık, hepimizindi.

Değişenler: "siz" hitabı ve köprü cümleleri eklendi ("Gelin, anlatayım.", "Siz olsanız ne yapardınız?"). "X"in bilinmeyen anlamı artık sesle söyleniyor. Sahne 7 ekranı tarif etmek yerine nedeni anlatıyor ("Işın eti geçmişti, ama kemiklere ve yüzüğe takılmıştı."). Kapanış "hepimizindi" ile izleyiciye bağlanıyor.

### Çekim listesi (tur 2)
| # | Anlatım | Visual | Tip | Cue |
|---|---|---|---|---|
| 0 | Bu kadın kendi ölümünü gördü. Gelin, anlatayım. | Parşömen üstünde dev bir röntgen plakası: soluk et silueti içinde bir sol elin kemikleri, yüzük parmağında koyu bir yüzük; çerçeve altın nabızla atar, kamera yüzüğe iter; 'ölümünü'de Kaşif sağdan kayarak girer ve şokla geri sıçrar; 'anlatayım'da yüzüğe kırmızı halka çizilir ve sağ üstte kırmızı '1895' belirir. | xr_hand (plate) | {'shock': 'ölümünü', 'year': 'anlatayım'} |
| 1 | 1895'te Röntgen, deney tüpünü siyah kartonla sarmıştı. | Laboratuvar tezgâhı: rafta şişeler, solda kıvılcım çakan bobin, ortada bir sehpa koluna kıskaçla tutturulmuş armut biçimli cam tüp sarı sarı parlar; sağda tezgâha eğik dayanmış küçük bir levha, üstünde el yazısı 'ekran'; solda sakallı Röntgen tüpü gösterir; 'kartonla'da tüpün biçimini izleyen buruşuk siyah karton kılıf yukarıdan inip tüpü sarar, parıltı söner; sağda Kaşif kılıfı işaret eder. | xr_lab (wrap) | {'wrap': 'kartonla', 'start': 'Röntgen'} |
| 2 | Işık sızamazdı. Ama karanlıkta, masadaki bir ekran parladı! | Aynı tezgâh, oda mürekkep taramasıyla kararır; tüp buruşuk siyah kartonun içinde; 'parladı'da sağdaki eğik 'ekran' levhası altın renkte yanar, çevresine genişleyen altın halkalar ve ışınlar yayılır; Röntgen ve Kaşif şokla geri sıçrar. | xr_lab (glow) | {'dark': 'karanlıkta', 'glow': 'parladı'} |
| 3 | Siz olsanız ne yapardınız? | Parşömen sahnede Röntgen elini çenesine koymuş düşünür; Kaşif yürüyerek ortaya gelir, 'Siz'de izleyiciyi işaret eder, 'yapardınız'da omuz silker; üstte el yazısı 'Siz ne yapardınız?'. | stage | {'q': 'Siz', 'end': 'yapardınız'} |
| 4 | Röntgen haftalarca laboratuvarda yiyip uyudu. | Dikey zaman çizgisi: '8 Kasım · ekran', kırmızı '6 hafta · laboratuvarda', '28 Aralık · makale'; işaretçi aşağı iner; sağda Kaşif ortadaki tarihi işaret eder. | timeline | {'a': 'Röntgen', 'b': 'haftalarca', 'c': 'uyudu'} |
| 5 | Bu ışına, matematikteki bilinmeyen gibi "X" dedi. | Dev yazı kelime kelime çarpar: 'X / ışını', 'X' kırmızı kutuda; 'bilinmeyen'de el yazısı not 'bilinmeyen' belirir; solda Kaşif X'i işaret eder. | title | {'w0': '"X"', 'w1': 'dedi', 'note': 'bilinmeyen'} |
| 6 | Sonra eşi Anna'nın elini plakaya koydu. | Tezgâhta koyu bir fotoğraf plakası, üstünde kıskaçlı kolla tutulan cam tüp; topuzlu, etekli Anna 'elini'de elini uzatır, avucu plakanın üstüne kayar; 'plakaya'da bobin kıvılcım çakar, tüp parlar ve altın ışınlar plakadaki ele iner; sağda Röntgen, solda Kaşif plakayı işaret eder. | xr_lab (hand) | {'hand': 'elini', 'rays': 'plakaya'} |
| 7 | Işın eti geçmişti, ama kemiklere ve yüzüğe takılmıştı. | Röntgen plakasında önce sadece soluk et silueti; 'eti'de alttan yukarı altın bir tarama çizgisi geçer ve koyu kemikler bilekten parmak uçlarına doğru belirir; 'yüzüğe'de koyu yüzük vurarak çıkar ve etrafına kırmızı mürekkep halka çizilir; sağda Kaşif işaret eder, sonra şaşırır. | xr_hand (reveal) | {'bones': 'eti', 'ring': 'yüzüğe'} |
| 8 | Anlatılana göre Anna, "Ölümümü gördüm." dedi. | Duvara kırmızı raptiyeyle iğnelenmiş, hafif eğik bir röntgen baskısı (el kemikleri ve yüzük), altında el yazısı '22 Aralık 1895'; solda topuzlu Anna 'ölümümü'de şokla geri sıçrar; sağda Kaşif düşünür, sonra o da şaşırır. | xr_hand (print) | {'hit': 'Ölümümü', 'date': 'Anlatılana'} |
| 9 | Röntgen buna patent bile almadı. Çünkü ona göre bu ışık, hepimizindi. | Parşömen sahnede yere dikili büyük tabela 'PATENT YOK'; solda Röntgen tabelayı gösterir, Kaşif yürüyerek gelir ve tabelayı işaret eder; 'hepimizindi'de Röntgen el sallar, Kaşif sevinçle kollarını açar ve üstte el yazısı 'Işık herkesin!' belirir. | stage | {'p': 'patent', 'h': 'hepimizindi'} |

### Görsel düzeltmeler
- xr_lab: karton artık tüpün biçimini izleyen, kırışık çizgili buruşuk siyah bir kılıf (eskiden kutuydu). Tüp, monitör ayağı yerine kıskaçlı bir laboratuvar sehpasında duruyor. Ekran, tezgâha eğik dayanmış ayaksız bir levha ve üstünde el yazısı "ekran" var.
- Tüm cast x değerleri 0.15–0.85 arasında. Sahne 6'da Kaşif solda (x 0.15, scale 0.62).
- Sahne 0: Kaşif "ölümünü"de sağdan kayarak giriyor (yeni `enter` seçeneği). "1895" notu y 0.12'de.
- Sahne 3: "Siz ne yapardınız?" sahnesi. Kaşif izleyiciyi işaret ediyor, Röntgen düşünüyor. Karton prop'u olmadığı için visual buna göre yeniden yazıldı.
- Timeline: "28 Aralık · makale" eklendi.
- Sahne 8: figürler büyütüldü, baskı küçültüldü.
- Sahne 9: yere dikili "PATENT YOK" tabelası, iki yüz de açık.

### Kapak adayları (tur 2, metin "BU KADIN / KENDİ ÖLÜMÜNÜ / GÖRDÜ", vurgu ÖLÜMÜNÜ)
- A: sahne 8, t 2.4, kasif false (Anna + Kaşif şok, iğneli baskı). İlk denemede Anna ve Kaşif kenardan kesikti.
- **A2 (seçilen):** A'nın düzeltilmiş hali. Anna x 0.25, Kaşif x 0.77, ikisi büyük ve şok yüzleri okunuyor. "BU KADIN" yazısının karede bir yüzü var.
- B: sahne 0, t 1.2, tek büyük Kaşif (sahne Kaşif'i o anda henüz girmediği için çakışma yok). Temiz, ama karede kadın yok.
- C: sahne 7, t 3.6, kasif false. Kaşif küçük, zayıf.


---
## Tur 3 (eleştiri 2. turundan sonra)

### Anlatım (498 karakter)
Bu kadın kendi ölümünü gördü. Gelin, anlatayım. 1895'te Röntgen, katot tüpünü siyah kartonla sarmıştı. Işık sızamazdı. Ama karanlıkta bir ekran parladı! Haftalarca denedi. Işık bin sayfalık kitabı da, tahtayı da geçti; sadece kurşunda durdu. Bu ışına matematikteki bilinmeyen gibi "X" dedi. Sonra eşi Anna'nın elini plakaya koydu. Işın eti geçmişti, ama kemiğe ve yüzüğe takılmıştı. Anlatılana göre Anna, "Ölümümü gördüm." dedi. Röntgen buna patent bile almadı. Çünkü ona göre bu ışık, hepimizindi.

- Sahne 3–4: dolgu cümle çıkarıldı. Yerine timeline "Haftalarca denedi." ve board "Işık bin sayfalık kitabı da, tahtayı da geçti; sadece kurşunda durdu." geldi (Kitap ✓ · Tahta ✓ · Kurşun ✗).
  Kaynak, Röntgen'in 1895 makalesi (https://web.lemoyne.edu/GIUNTA/Roentgen.html): "paper is very transparent; the fluorescent screen will light up when placed behind a book of a thousand pages", "Thick blocks of wood are still transparent", "Lead 1.5 mm thick is practically opaque."
- Sahne 1: "deney tüpü" yerine "katot tüpü". "1895" notu sahne 1'e, "1895" kelimesine taşındı.
- Sahne 0: plaka cx 0.38 w 600. Kaşif x 0.82 scale 0.8, baştan ekranda (bakar → şok). Kırmızı halka "ölümünü"de çiziliyor. Kamera odağı [0.45, 0.42].
- Sahne 6: Kaşif idle → point (yüz açık).
- Sahne 8: baskı aşağı alındı (cy 0.36), figürler büyütüldü (ground 0.65). "Ölümümü"de yüzüğe kırmızı halka çiziliyor.

### Kapak adayları (tur 3)
- **A (seçilen):** sahne 8, t 2.4. Baskı yazının altında tam ve net, yüzükte kırmızı halka var, Anna ve Kaşif büyük, ikisinin de yüzünde şok.
- B: sahne 8, t 3.0. A ile neredeyse aynı, biraz daha soluk.
- C: sahne 0, t 3.0. Dev plaka ve halka var ama kadın yok, Kaşif kenarda küçük.
Kalan küçük kusur: kapağın en altında (~%15) boş kâğıt kalıyor.


### Notlar 03

# 03-roma-son-imparator — yazar notları (tur 0)

Dosya: `videos/2026-10-23/03-roma-son-imparator.json` · publish_at 2026-10-23T19:00:00+03:00
Yeni sahne tipi: `scenes/studio/shots/rm_throne.js` (dev taht + küçük çocuk imparator, kayan/düşen defne tacı,
kuklacı Orestes + kopan ipler, boş taht modu, sütun + perde, kamera itmesi, sarsıntı).

## Tek parça anlatım (491 karakter, ~34 sn tahmini)

Batı Roma'nın son imparatoru bir çocuktu. Adı da Romulus'tu, yani Roma'nın kurucusunun adı! Ama ipleri babası
Orestes tutuyordu. Ona alayla Augustulus dediler: küçük Augustus. 476'da paralı askerler toprak istedi, Orestes
reddetti. Komutanları Odoaker ayaklandı ve Orestes öldürüldü. Peki sizce çocuğa ne oldu? Odoaker ona dokunmadı
bile, maaş bağlayıp Napoli'ye yolladı. Tacı ve mor pelerini de Konstantinopolis'e gönderdi. Yani koca Roma bir
savaşla değil, bir çocuğun emekliliğiyle bitti.

- "-yor" ile biten: 1/11 (tutuyordu). Devrik cümle yok. Kapanış tam cümle, döngü yok.

## Çekim listesi

| # | Anlatım | Visual | Tip | Kaşif | Cue |
|---|---|---|---|---|---|
| 0 | Batı Roma'nın son imparatoru bir çocuktu. | Dev taht, küçük endişeli çocuk; defne tacı kayıp gözüne iniyor, 'çocuktu'da taht sarsılıyor (hook sırasında kapak Kaşif'i şokta) | rm_throne | kapakta büyük şok (motorun cover.kasif'i; sahnede cast yok) | slip=Roma'nın, hit=çocuktu |
| 1 | Adı da Romulus'tu, yani Roma'nın kurucusunun adı! | Dikey zaman çizgisi MÖ 753 Romulus Roma'yı kurar → MS 475 yine Romulus! (kırmızı) | timeline | düşünür → işaret | c0=Romulus, c1=kurucusunun |
| 2 | Ama ipleri babası Orestes tutuyordu. | Miğferli Orestes kukla çubuğundan çocuğa ipler; "Babası Orestes" | rm_throne | işaret | strings=ipleri, hit=Orestes |
| 3 | Ona alayla Augustulus dediler: küçük Augustus. | AUGUSTUS + kırmızı kutuda +ULUS, not "= küçük Augustus" | title | konuşur → omuz silker | w0, w1, note=küçük |
| 4 | 476'da paralı askerler toprak istedi, Orestes reddetti. | 3 Germen asker yürüyerek gelir "TOPRAK!"; Orestes "HAYIR!" | stage | dürbün → şok | arr, land=toprak, no=reddetti |
| 5 | Komutanları Odoaker ayaklandı ve Orestes öldürüldü. | Odoaker yürüyüp gelir (kırmızı "Odoaker"); 'öldürüldü'de ipler kopar, Orestes silinir, taht sarsılır | rm_throne | — (Kaşif yok) | arr=ayaklandı, cut=öldürüldü |
| 6 | Peki sizce çocuğa ne oldu? | Kaşif izleyiciye sorar, yanında küçük çocuk; dev kırmızı "?" | stage | konuşur → düşünür | q=çocuğa, hit=oldu |
| 7 | Odoaker ona dokunmadı bile, maaş bağlayıp Napoli'ye yolladı. | Odoaker sikke uzatır, çocuk sikkeyle villaya yürür, "Napoli'de emeklilik" | stage | işaret | coin=maaş, go=Napoli |
| 8 | Tacı ve mor pelerini de Konstantinopolis'e gönderdi. | Akdeniz haritası Ravenna → Konstantinopolis kırmızı rota, not "taç + pelerin, Doğu'ya" | map | — | route=Tacı, city, note |
| 9 | Yani koca Roma bir savaşla değil, bir çocuğun emekliliğiyle bitti. | Boş taht, defne tacı yerde; "Savaş yok, emeklilik var!" | rm_throne | işaret → omuz silker | war, hit=emekliliğiyle |

Tipler: rm_throne 4, stage 3, timeline, title, map (5 tip). Kaşif lint sayımıyla 7/10 sahnede (+ hook'ta kapak Kaşif'i).

## Doğruluk notları

- 31 Ekim 475: Orestes (magister militum) Julius Nepos'u kovup oğlu Romulus'u tahta çıkardı; doğum ~460 → yaşı
  belirtilmedi ("çocuk"; kaynaklar "little more than a child").
- "Augustulus" = "küçük Augustus" (-ulus küçültme eki), alaycı lakap.
- 476: Heruli/Sciri/Turcilingi paralı askerler İtalya topraklarının üçte birini istedi, Orestes reddetti, Odoaker
  önderliğinde ayaklandılar; Orestes 28 Ağustos 476'da Placentia yakınında yakalanıp öldürüldü. 4 Eylül 476'da
  Romulus Ravenna'da tahttan indirildi.
- Anonymus Valesianus: yıllık 6.000 solidus maaş, Campania'daki Castellum Lucullanum (Napoli'de, Lucullus villası).
  Cassiodorus 507 mektubu maaşı doğrular. Metinde sayı verilmedi.
- İmparatorluk nişanları (taç/diadem, mor pelerin) Konstantinopolis'e Zeno'ya gönderildi (Senato elçileri aracılığıyla;
  anlatımda Odoaker'e bağlandı, yaygın anlatım).
- Nüans: Zeno Julius Nepos'u 480'e kadar meşru Batı imparatoru saydı; "son imparator" yaygın tanım. Metinde "Batı Roma'nın son imparatoru" dendi.
- Kaynaklar: https://solarspell-dls.sfis.asu.edu/mea/wikipedia/wp/r/Romulus_Augustulus.htm ,
  https://wikieyetracking.di.unito.it/wpcd/wp/r/Romulus_Augustus.htm , https://www.worldhistory.org/audioplayer/en/1-13238/
  (en.wikipedia.org/wiki/Romulus_Augustulus WebFetch'te provenance nedeniyle engellendi).

## Kapak adayları

1. A: "ROMA'NIN SONUNCUSU / BİR ÇOCUKTU" (2 satır), sahne 0, sahnedeki küçük Kaşif → yazı küçük, Kaşif kenarda kırpık. Elendi.
2. B: aynı metin + cover.kasif şok → yazı küçük kaldı. Elendi.
3. C: "ROMA'YI BİR / ÇOCUK / BİTİRDİ", sahne 5 (ipler kopuyor) → dramatik ama kalabalık + iddia yanıltıcı (çocuk bitirmedi). Elendi.
4. D: "ROMA'NIN SONUNCUSU" sahne 2 (kuklacı) → kalabalık, küçük yazı. Elendi.
5. **Seçilen:** 3 satır "ROMA'NIN / SONUNCUSU / BİR [ÇOCUKTU]", sahne 0 t=2.0 (taç kaymış, endişeli çocuk, dev taht),
   cover.kasif şok scale 1.45 sağ önde (yüz büyük). Yazı dev ve okunur, ilk cümleyle aynı fikir.

---
## Tur 1 düzeltmeleri (eleştiri: review-03.md)

Yeni anlatım (496 karakter, ~35 sn):
Batı Roma'nın son imparatoru bir çocuktu. Adı Romulus'tu, Roma'nın efsanevi kurucusu gibi! Ama ipleri babası Orestes
tutuyordu. Ona alayla Augustulus dediler: küçük Augustus. 476'da paralı askerler toprak istedi, Orestes reddetti. Sonra
komutanları Odoaker ayaklandı ve Orestes öldürüldü. Peki sizce çocuğa ne oldu? Odoaker ona dokunmadı bile, maaş bağlayıp
Napoli'ye yolladı. Tacı ve mor pelerini de Konstantinopolis'e gönderdi. Yani Batı Roma bir savaşla değil, bir çocuğun
emekliliğiyle bitti.

1. Doğruluk: son cümle "Batı Roma"; sahne 1 "efsanevi kurucusu", zaman çizelgesi maddesi "MÖ 753 · efsanevi kurucu Romulus".
   Sahne 5'e "Sonra" bağlacı eklendi (4→5 kronik sıralama yumuşadı). Bütçe için "Adı da"→"Adı", "Derken" çıkarıldı.
2. Sahne 4: sütun kaldırıldı; Orestes x 0.18 scale 1.0, 'reddetti'de askerleri işaret ediyor ve başının üstünde kırmızı
   "HAYIR!" (label) beliriyor; Kaşif x 0.42 scale 0.7; asker3 çıkarıldı; askerler helmet_byz (sivri koyu miğfer).
3. Yeni sarmalayıcı tip `scenes/studio/shots/rm_plus.js`: herhangi bir 2D sahneyi (map/timeline…) ölçekler ve üstüne Kaşif/cast
   ekler (ortak dosyalara dokunmadan). Sahne 1 = rm_plus(timeline) scale 1.08, Kaşif büyük (0.95) sağda düşünüp işaret ediyor.
   Sahne 8 = rm_plus(map): focus [22,40] zoom 1.3, pusula bl, Konstantinopolis etiketi noktanın altında, Karadeniz içeri alındı,
   Ravenna pusuladan ayrıldı, sağ altta Kaşif 'Tacı'da rotayı işaret ediyor. Sahne 3: Kaşif yazının altındaki boşlukta.
4. Kapak: taht scale 1.12, çocuk 0.95, sahne kamerası yaklaştı; kapak Kaşif'i scale 1.6 (yüz daha büyük, alt boşluk azaldı).
Kaşif artık 8/10 sahnede (lint sayımı) + hook'ta kapak Kaşif'i.

## Tur 2 cilaları
- Sahne 8: Karadeniz x 27.5 (artık kesik değil); Kaşif haritanın altında x 0.75 y 0.72 scale 1.0, rotayı işaret ediyor.
- Sahne 4 artık `rm_plus(stage)`: askerler stage'de (asker1 to 0.72, asker2 to 0.9); Orestes ve Kaşif sarmalayıcının cast'ında.
  rm_plus'a `helmet: "roman"` eklendi (tunç galea + yelpaze biçimli kırmızı at kılı sorguç + yanak siperi): Orestes artık
  açıkça Roma miğferli. Kaşif x 0.43, Orestes'in kolundan ayrı. "HAYIR!" Orestes'in başının üstünde, martılar kaldırıldı.
- Sahne 1 düz `timeline`a döndü (kendi kasif parametresiyle, aynı görünüm); tip çeşitliliği 5 (rm_throne, timeline, title, rm_plus, stage).
- Kapak: taht 1.22, çocuk 1.05, kamera yakın; kapak Kaşif'i x 780→740 (şapka artık kesik değil).


### Notlar 04

# 04-preveze-1538 — yazar notları (tur 1)

## Tek parça anlatım (499 karakter, ~35 sn tahmini)
Barbaros dev bir donanmayı dağıttı. Hem de rüzgârı okuyarak! Gelin anlatayım. Yıl 1538. Karşısında Andrea Doria'nın yüzlerce gemisi vardı. Barbaros ise sığ bir körfeze çekilip bekledi. Doria'nın ağır yelkenlileri oraya giremezdi. Doria güneye dönünce Barbaros körfezden fırladı. Ve bakın, rüzgâr düştü! Yelkenliler kıpırdayamadı, kadırgalar kürekle geldi. Komutanlar zaten anlaşamıyordu. Gece Doria fenerlerini söndürüp çekildi. Yani Preveze'yi büyük donanma değil, denizi okuyan bir kaptan kazandı.

## Çekim listesi
| # | Anlatım | Visual (özet) | Tip | Kaşif | Cue |
|---|---|---|---|---|---|
| 0 | Barbaros dev bir donanmayı dağıttı. | Soldan kürekli Osmanlı kadırgaları, sağda dev mavi flamalı yelkenliler; 'dev'de yelkenli alev alır + sarsıntı, 'dağıttı'da yelkenliler dönüp ufka dağılır | pv_sea | sağ kayada dürbünle bakar → şok | hit=dev, scatter=dağıttı |
| 1 | Hem de rüzgârı okuyarak! Gelin anlatayım. | Kadırga kıç güvertesi; sarıklı kırmızı sakallı Barbaros parmağını havaya kaldırır, flama dalgalanır, 'rüzgâr' oku | pv_deck | konuşur → el sallar | gust=rüzgârı, lab=okuyarak, wave=Gelin |
| 2 | Yıl 1538. Karşısında Andrea Doria'nın yüzlerce gemisi vardı. | Akdeniz haritası Preveze'ye yaklaşır; Venedik→Korfu→Preveze kırmızı rota; not 'yüzlerce gemi!' | map | — | city=1538, route=Andrea, note=yüzlerce |
| 3 | Barbaros ise sığ bir körfeze çekilip bekledi. | Kuşbakışı: İyon Denizi'nde mavi filo, Preveze boğazı, kırmızı kadırgalar Arta Körfezi'ne girer | pv_gulf | güney kıyıda dürbünle bakar → düşünür | in=çekilip, wait=bekledi |
| 4 | Doria'nın ağır yelkenlileri oraya giremezdi. | Kesit: sığlık tümseği, yelkenlinin kesikli derin omurgası sığlığa yaklaşıp sarsılarak durur, 'sığ!' oku | pv_sea (section) | kayada aşağıyı işaret eder → şok | heavy=ağır, stop=giremezdi |
| 5 | Doria güneye dönünce Barbaros körfezden fırladı. | Mavi filo güneye kayar (mavi ok); kırmızı kadırgalar boğazdan sıra halinde fırlayıp hilale açılır (kırmızı ok) | pv_gulf | sağ altta → işaret | south=güneye, out=Barbaros, burst=fırladı |
| 6 | Ve bakın, rüzgâr düştü! | İki dev yelkenli, rüzgâr çizgileri; 'düştü'de çizgiler kaybolur, 'rüzgâr' yazısına kırmızı çarpı, yelkenler söner, flamalar düşer | pv_sea | konuşur → şok | drop=düştü |
| 7 | Yelkenliler kıpırdayamadı, kadırgalar kürekle geldi. | Sarkık yelkenli gemiler sağda; soldan kürek çeken kadırgalar; 'kürek!' notu; 'geldi'de top dumanı | pv_sea | (yok) | row=kadırgalar, hit=geldi |
| 8 | Komutanlar zaten anlaşamıyordu. | Müttefik güvertesi, mavi flama sarkık; Doria ve Venedikli komutan öfkeyle birbirini işaret eder | pv_deck | → omuz silker | arg=Komutanlar, arg2=zaten, hit=anlaşamıyordu |
| 9 | Gece Doria fenerlerini söndürüp çekildi. | Gece, ay; kıç fenerleri söner (duman), gemiler sağa uzaklaşır | pv_sea (night) | dürbünle bakar → düşünür | dark=söndürüp, go=çekildi |
| 10 | Yani Preveze'yi büyük donanma değil, denizi okuyan bir kaptan kazandı. | Dev yazı 'Denizi okuyan / KAPTAN' (kırmızı kutu), not '28 Eylül 1538' | title | konuşur → işaret | w0..w2, note=kazandı |

Tipler: pv_sea ×5, pv_gulf ×2, pv_deck ×2, map, title (6 tip); Kaşif 9/11 sahnede.

## Doğruluk notları
- Tarih: 28 Eylül 1538 (Türk resmî anmaları 27 Eylül; 27 Eylül = Deniz Kuvvetleri Günü). Yer: Preveze, Arta Körfezi ağzı (İyon Denizi).
- Komutanlar: Barbaros Hayreddin (Kaptan-ı Derya); Kutsal İttifak (Papa III. Paulus) başında Andrea Doria; Venedik: Vincenzo Cappello, Papalık: Marco Grimani.
- Gemi sayıları kaynaklara göre çok değişiyor (İttifak ~130–170 kadırga + 50–140 yelkenli, EBSCO 246 gemi; Osmanlı ~120–150). "İki kat" yazılmadı; "dev / yüzlerce" denildi.
- Barbaros körfezde korundu; Doria dar/sığ boğaza (kum seti) ağır yelkenlileri güvenle sokamadı (Wikipedia; EBSCO "sand bar at the mouth"). Metinde "giremezdi" diye sadeleştirildi.
- Doria 27 Eylül gecesi güneye (Sessola/İnebahtı yönü) döndü; Barbaros çıkıp saldırdı.
- Rüzgâr değişip düşünce yelkenliler hareketsiz kaldı; kürekli kadırgalar rüzgâra bağlı değildi (Wikipedia "becalmed"; yeniankara/TDV özeti).
- Müttefik komutanlar arasında anlaşmazlık (Cappello/Grimani vs. Doria). Doria geceleyin fenerlerini söndürerek Korfu'ya çekildi (Wikipedia).
- Kayıp sayıları tartışmalı → metne konmadı. Osmanlı deniz üstünlüğü ~1571 İnebahtı'ya kadar (sadece açıklamada).
Kaynaklar: https://en.wikipedia.org/wiki/Battle_of_Preveza · https://ebsco.com/research-starters/history/battle-preveza · https://www.yeniankara.com.tr/guncel/preveze-deniz-zaferi-nedir-ne-zaman-ve-nasil-kazanildi-488-yillik-zaferin-hikayesi-184145

## Kapak adayları
- A (seçildi): sahne 0, t 1.2, kasif false — yanan dev yelkenli + Osmanlı kadırgaları + sağda büyük şok Kaşif; metin BARBAROS / DEV DONANMAYI / DAĞITTI, vurgu BARBAROS.
- B: sahne 7 t 3.0 + motor Kaşif (shock), vurgu DEV — Kaşif yanlış yerde, gemilerin üstüne biniyor; zayıf.
- C: sahne 1 t 2.6 — kırmızı sakallı Barbaros yüzü net ama savaş/dram yok; ikinci tercih.

## Tur 2 düzeltmeleri (eleştiri 1. tur → review-04.md)
Yeni anlatım (500 karakter):
Barbaros dev bir donanmayı dağıttı. Hem de rüzgârı okuyarak! Gelin anlatayım. 1538'di. Andrea Doria'nın donanması çok daha büyüktü. Barbaros sığ bir körfeze çekilip bekledi. Doria'nın ağır gemileri oraya giremezdi. Doria güneye dönünce Barbaros körfezden fırladı. Ve tam o anda rüzgâr düştü! Yelkenliler kıpırdayamadı, kadırgalar kürekle geldi. Doria ile Venedikliler de birbirine güvenmiyordu. Gece Doria fenerleri söndürüp çekildi. Yani Preveze'yi büyük donanma değil, denizi okuyan kaptan kazandı.
- Güç farkı: "çok daha büyüktü". "Yarısı bile yoktu" yazılmadı, çünkü sayılar kaynaklara göre değişiyor (EBSCO 246'ya ~150; Türk kaynakları 122 kadırga). "Çok daha büyük" konusunda kaynakların hepsi uyuşuyor.
- Sahne 8 → "Doria ile Venedikliler de birbirine güvenmiyordu." (Cappello/Grimani ile Doria arasındaki çekişme: Wikipedia). Sahne 6 → "Ve tam o anda rüzgâr düştü!".
- Kapak: sahne 0 baştan kuruldu. Ufuk 0.3'e çekildi, gemiler büyütüldü, yazı ile sahne arasındaki boşluk ~300 px'ten ~60 px'e indi. Öndeki kadırgada kızıl sakallı, sarıklı Barbaros işaret ediyor; yanan yelkenlide dalgalı mürekkep alevler ve kara duman var; sağda büyük şok Kaşif.
  4 aday denendi: A sahne 0 t 1.3 (seçildi) · B sahne 0 t 2.45 dağılma anı, vurgu DAĞITTI (alevler gemi dönerken sütun gibi duruyor) · C sahne 1 güverte Barbaros portresi (dram yok) · D sahne 7 kürek anı, vurgu DEV (Kaşif yok, boş).
- Güverte sahneleri (1, 8): deck 0.68, figürler 0.95–1.02 ölçek, kamera 1.08.
- Sahne 7: kadırgalar kadrajın ortasına geliyor (to 0.44 / 0.26, ölçek 1.6), top dumanı ×2 büyük ve sarsıntılı, "kürek!" oku küreklere iniyor.
- Sahne 5: "Arta Körfezi" etiketi aşağıya taşındı, Kaşif x 0.58'e alındı. Sahne 10: "DONANMA DEĞİL / KAPTAN" + not "denizi okuyan", Kaşif büyütüldü ve yazının yanına alındı.
- pv_fleet.js: alevler dalgalı dillere (kırmızı dış, altın iç) çevrildi, yangından kara duman çıkıyor, top dumanına `r` boyut parametresi eklendi.

## Tur 3 cilası
- Güverte sahneleri (1, 8): kamera zoom 1.15, odak karakterlerde [0.45, 0.5]; figürler daha büyük görünüyor, boş tahta alanı azaldı.
- Sahne 7: kadırgalar baştan tam görünüyor (öndeki 0.27→0.45, ölçek 1.35; arkadaki 0.2→0.3); "kürek!" oku küreklere iniyor.
- Sahne 10: Kaşif ilk saniyeden yazıyı işaret ediyor (at 0.15, dir 40). Önceki sürümdeki string `dir` (`"up-left"`) title tipinde NaN üretip Kaşif'i bozuyordu; sayıya çevrildi.


### Notlar 05

# 05-lizbon-depremi-1755 — yazar notları

Karakter: 7421 · sahne: 75 · bölüm: 8 · tahmini süre ≈ 8 dk 35 sn (preview ~514 sn) · Kaşif: 57/75 sahne

## Tek parça anlatım (sesli okuma kontrolü yapıldı)

Bir sabah, birkaç saat içinde, Avrupa'nın en zengin şehirlerinden biri üç kez yıkıldı. Önce yer, sonra deniz, sonra ateş. Gelin, bu inanılmaz günü baştan anlatayım. Takvimler 1 Kasım 1755'i gösteriyordu. Yer, Portekiz'in başkenti Lizbon. O günlerde Lizbon bir hazine şehriydi. Brezilya'dan gelen altın ve elmas, gemilerle bu limana akardı. Tejo Nehri'nin ağzında yüzlerce gemi demirliydi. Liman meydanında baharat, ipek ve şeker kokusu birbirine karışırdı. Üstelik o sabah sıradan bir gün değildi. Azizler Günü'ydü, yani Katolik dünyasının en büyük bayramlarından biri. Şehrin dört bir yanındaki kiliseler tıklım tıklımdı. Binlerce mum yanıyor, tütsü kokusu tavanlara yükseliyordu. Kral Birinci José ise sabah ayinini erkenden dinlemiş, ailesiyle şehrin dışına çıkmıştı. Çünkü kızı, bayramı kırda geçirmek istemişti. Bu küçük aile kararını aklınızda tutun. Birkaç saat sonra kralın hayatını kurtaracaktı. Saat dokuzu kırk geçiyordu. Ayin tam ortasındaydı. Önce derinden gelen bir uğultu duyuldu. Sanki yerin altından ağır bir araba geçti. Sonra zemin sallanmaya başladı. Avizeler salındı, mumlar birer birer devrildi. Tanıkların anlattığına göre sarsıntı, üç buçuk ile altı dakika arasında sürdü. Düşünün: altı dakika boyunca ayakta duramıyorsunuz! Taş kiliselerin tavanları, içindeki kalabalığın üstüne çöktü. Kaçmaya çalışanlar da dar sokaklarda yıkılan duvarların altında kaldı. Şehrin ortasında, bazı kaynaklara göre beş metre genişliğe varan yarıklar açıldı. Kraliyet sarayı Ribeira da yıkıldı. Sarayın kütüphanesinde tahminen yetmiş bin cilt kitap vardı. Titian'ın, Rubens'in tabloları, krallığın arşivleri… Ve yedi ay önce açılan görkemli opera binası. Hepsi tek bir sabahta yok oldu. Toz bulutu şehrin üstüne çöktü, gökyüzü karardı. Hayatta kalanlar tek bir şey düşündü: açık alana çıkmak. Binlerce kişi yıkıntıların arasından geçip nehrin kıyısındaki büyük liman meydanına koştu. Orada güvende olacaklarını sandılar. Ama asıl felaket henüz başlamamıştı. Kıyıya varanlar, gözlerine inanamadı. Deniz geri çekiliyordu! Su limandan uzaklaştı ve geride çamurlu bir düzlük kaldı. Batık gemilerin enkazı, denize düşmüş yükler, çırpınan balıklar… Hepsi açıkta kalmıştı. Bazı insanlar meraktan çamura doğru yürüdü. Peki sizce bu ne demekti? Bugün çok iyi biliyoruz: deniz birden çekilirse, büyük bir dalga yoldadır. Depremden yaklaşık kırk dakika sonra, ufukta bir su duvarı belirdi. Dalga limanı ve aşağı şehri yuttu, nehrin içinden yukarı doğru tırmandı. Arkasından iki dalga daha geldi. Meydana sığınan kalabalık kaçacak yer bulamadı. Demirli gemiler parçalandı, rıhtım sulara gömüldü. Ve bu dalga sadece Lizbon'u vurmadı. Fas kıyılarında, kaynaklara göre yirmi metreye varan dalgalar görüldü. Dalga İngiltere'ye ve İrlanda'ya ulaştı. Hatta okyanusu geçip Karayipler'e, Barbados ve Martinik kıyılarına kadar vardı! Yani tek bir sarsıntı, koca bir okyanusu baştan sona çalkalamıştı. Peki su çekilince ne oldu? Şehir bu kez yanmaya başladı. Hatırlayın, kiliselerde binlerce mum vardı. Evlerde de bayram yemekleri için ocaklar yanıyordu. Yıkılan kirişler, perdeler, kitaplar… Devrilen her mum, kuru bir yığına düşen bir kıvılcım oldu. Rüzgâr da çıkınca küçük yangınlar birleşti. Kısa sürede şehrin merkezi dev bir ateş fırtınasına döndü. Alevler o kadar güçlüydü ki yaklaşanlar dumandan ve sıcaktan nefes alamadı. Sudan kaçanlar ateşe, ateşten kaçanlar suya sıkıştı. İşte Lizbon'un o günkü çaresizliği buydu. Anlatılanlara göre şehir tam beş gün yandı. Peki kaç kişi öldü? Bunu kimse kesin olarak bilmiyor. Tahminlere göre yalnızca Lizbon'da otuz ile kırk bin kişi hayatını kaybetti. Bu, yaklaşık iki yüz bin kişilik bir şehirdi. Yani kabaca her altı kişiden biri… Şehir artık enkaz, kül ve korkudan ibaretti. Peki bu kaosu kim toparlayacaktı? Kral José geri döndüğünde gördüğü manzara karşısında sarsıldı. Öyle ki bir daha taş duvarların arasında yaşamak istemedi. Sarayı bıraktı, şehrin tepelerinde kurulan dev çadırlara taşındı. Ama birinin hemen karar vermesi gerekiyordu. İşte tam burada sahneye bir bakan çıktı: Sebastião de Melo. Onu bugün daha çok sonraki unvanıyla tanıyoruz: Pombal Markisi. Ona atfedilen meşhur bir söz var: "Ölüleri gömün, yaşayanları iyileştirin." Bunu gerçekten söyledi mi, tarihçiler emin değil. Ama yaptıkları tam olarak buydu. Salgın çıkmasın diye cesetler hızla toplandı. Anlatılanlara göre bir kısmı mavnalara yüklenip açık denize götürüldü. Yağmacılara karşı askerler şehrin çevresine yerleştirildi. Evsiz kalanlar için çadır kamplar kuruldu, yiyecek getirildi. Ve bir yıl dolmadan, yıkıntıların büyük kısmı temizlenmişti. Ama Pombal'ın aklında çok daha büyük bir soru vardı: Bu felaket neden oldu? O dönemde çoğu insanın cevabı hazırdı. Bazı vaizlere göre deprem, Tanrı'nın günahkâr şehre verdiği bir cezaydı. Ama bir sorun vardı. Bayramda dua eden insanlar kiliselerin altında kalmıştı. Bu nasıl bir ceza olabilirdi? Bugün asıl cevabı biliyoruz. Deprem şehrin altında değil, Atlantik'te, Lizbon'un yaklaşık iki yüz doksan kilometre güneybatısında oldu. Orada iki dev levha, Afrika ve Avrasya, birbirine sürtünür. Yüzyıllar boyunca biriken gerilim, o sabah bir anda boşaldı. Büyüklüğü mü? O zaman ölçen bir alet yoktu tabii. Ama bugünkü tahminlere göre sekizin üzerindeydi, belki de dokuza yakındı. Kırılma okyanus tabanında olduğu için koca bir su kütlesini yerinden oynattı. İşte dalga buradan geldi. Peki Lizbon neden bu kadar ağır yıkıldı? Çünkü üç felaket zincirleme geldi. Sarsıntı taş binaları yıktı. Dalga, kaçanların sığındığı kıyıyı vurdu. Ateş ise bayram mumlarından doğdu. Bir de zamanlama vardı. Felaket, insanların en kalabalık ve en savunmasız olduğu ana, bayram ayininin ortasına denk gelmişti. Şimdi size bu hikâyenin en sevdiğim kısmını anlatacağım. Pombal, ülkenin dört bir yanındaki papazlara aynı soruları gönderdi. Sarsıntı saat kaçta başladı, ne kadar sürdü? Hangi yönden geldi? Binalar daha çok hangi tarafa yıkıldı? Deniz önce yükseldi mi, alçaldı mı? Ne kadar? Yangın kaç gün sürdü? Fark ettiniz mi? Bunlar duaya ya da cezaya dair sorular değil. Bunlar bir bilim insanının soruları! Cevaplar bugün hâlâ Lizbon'daki Torre do Tombo arşivinde duruyor. Bu yüzden Pombal, modern deprem biliminin öncülerinden biri sayılır. Ve yeni şehri de bu soruların ışığında kurdu. Mimarlar, yıkılan aşağı şehir için dört plan sundu. Kral en cesur olanı seçti. Eski dar ve kıvrımlı sokaklar tamamen kaldırıldı. Yerine dümdüz, geniş caddeler ve dik açılı bir ızgara çizildi. Binaların içine, gaiola denen esnek bir ahşap kafes yerleştirildi. Duvar çatlasa bile kafes ayakta kalacaktı. Peki nasıl test ettiler? Anlatılana göre önce küçük modeller yaptılar. Sonra askerler bu modellerin etrafında tempoyla yürüdü, ve yeri sarsan adımlar depremin yerine geçti! Bu sistem, dünyadaki ilk depreme dayanıklı yapı yöntemlerinden biri olarak görülür. Deprem Avrupa'nın düşünürlerini de sarstı. Voltaire, Lizbon felaketi üzerine bir şiir yazdı. Sonra da Candide'de, "her şey en iyisi için" diyen iyimserlerle alay etti. Genç Kant ise depremi doğal nedenlerle açıklamaya çalışan üç yazı yayımladı. Açıklaması yanlıştı, ama soruyu doğru sormuştu. Bugün Lizbon'a giderseniz, Carmo Manastırı'nın çatısız kemerlerini görebilirsiniz. O yıkıntı, o sabahın sessiz tanığı olarak bilerek ayakta bırakıldı. Yani 1755'te bir şehir yıkıldı, ama o yıkıntıdan felakete "neden?" diye soran yeni bir dünya doğdu. Peki siz o sabah limanda olsaydınız, çekilen denizi görünce ne yapardınız? Yorumlara yazın.

## Bölümler

- sahne 0: Bayram sabahı
- sahne 8: Yer sarsıldı
- sahne 19: Deniz çekildi
- sahne 29: Şehir yanıyor
- sahne 39: Ölüleri gömün
- sahne 48: Peki neden?
- sahne 58: Bakanın soruları
- sahne 65: Yeniden doğan şehir

## Sahne tablosu

| no | anlatım | visual | tip | Kaşif | cue |
|---|---|---|---|---|---|
| 0 | Bir sabah, birkaç saat içinde, Avrupa'nın en zengin şehirlerinden biri üç kez yıkıldı. Önce yer, sonra deniz, sonra ateş. Gelin, bu inanılmaz günü baştan anlatayım. | Nehirden Lizbon: kiliseler, saray, gemiler; 'yıkıldı'da şehir sallanır, binalar birer birer çöker, toz bulutu kalkar, 'ateş'te rıhtımda kırmızı yarıklar açılır; önde Kaşif şok olur | lz_city | evet | shake=yıkıldı, hit=Önce, crack=ateş |
| 1 | Takvimler 1 Kasım 1755'i gösteriyordu. Yer, Portekiz'in başkenti Lizbon. | BÖLÜM 1 / 8 kartı: mavi dairede 1, altında 'Bayram sabahı' ve el çizimi alt çizgi | chapter | — | n=Takvimler, title=Lizbon |
| 2 | O günlerde Lizbon bir hazine şehriydi. Brezilya'dan gelen altın ve elmas, gemilerle bu limana akardı. | Eski Atlas haritası: Brezilya kıyısından Lizbon'a kesikli altın rota çizilir; 'altın'da Brezilya, 'limana'da Lizbon kırmızı belirir | map | — | br=Brezilya'dan, go=altın, lis=limana |
| 3 | Tejo Nehri'nin ağzında yüzlerce gemi demirliydi. Liman meydanında baharat, ipek ve şeker kokusu birbirine karışırdı. | Nehir ağzında demirli gemiler sallanır, martılar uçar, çan kuleli kiliseler ve uzun saray; Kaşif rıhtımda yürüyerek gelir ve gemileri işaret eder; 'Tejo' etiketi | lz_city | evet | hit=gemi, sm=baharat |
| 4 | Üstelik o sabah sıradan bir gün değildi. Azizler Günü'ydü, yani Katolik dünyasının en büyük bayramlarından biri. | Dev yazı kelime kelime: '1 KASIM / AZİZLER GÜNÜ', 'Azizler' kırmızı kutuda; yanda Kaşif işaret eder | title | evet | w0=Üstelik, w2=Azizler, bayramlarından=bayramlarından |
| 5 | Şehrin dört bir yanındaki kiliseler tıklım tıklımdı. Binlerce mum yanıyor, tütsü kokusu tavanlara yükseliyordu. | Kilise içi: kemerler, sunakta sıra sıra yanan mumlar, iki avize hafifçe salınır, sıralarda cemaat; sağda Kaşif dürbünle bakar, 'mum'da 'binlerce mum' notu | lz_church | evet | hit=tıklım, mum=mum |
| 6 | Kral Birinci José ise sabah ayinini erkenden dinlemiş, ailesiyle şehrin dışına çıkmıştı. Çünkü kızı, bayramı kırda geçirmek istemişti. | Taçlı Kral José ve küçük kızı soldan sağa sarayın önünden yürüyerek şehirden çıkar; Kaşif el sallayarak uğurlar; 'Kral I. José' etiketi | stage | evet | hit=José, go=dışına |
| 7 | Bu küçük aile kararını aklınızda tutun. Birkaç saat sonra kralın hayatını kurtaracaktı. | Kaşif parmağını kaldırıp anlatır, 'aklınızda'da 'KIRDA BAYRAM' tabelasını işaret eder, 'kurtaracaktı'da şaşkınlıkla geri sıçrar; yanında ağaç ve tepeler | stage | evet | hit=aklınızda, save=kurtaracaktı |
| 8 | Saat dokuzu kırk geçiyordu. Ayin tam ortasındaydı. | BÖLÜM 2 / 8 kartı: mavi dairede 2, altında 'Yer sarsıldı' ve el çizimi alt çizgi | chapter | — | n=Saat, title=Ayin |
| 9 | Önce derinden gelen bir uğultu duyuldu. Sanki yerin altından ağır bir araba geçti. | Kilise içi, ayin sürer; 'uğultu'da avizeler kıpırdar, Kaşif sağda dinler ve endişeyle kaşlarını kaldırır; 'uğultu…' notu | lz_church | evet | hit=uğultu, car=araba |
| 10 | Sonra zemin sallanmaya başladı. Avizeler salındı, mumlar birer birer devrildi. | Kilise sarsılır: 'sallanmaya'da kamera titrer, avizeler deli gibi salınır, 'mumlar'da sunaktaki mumlar birer birer devrilir; Kaşif şok olur | lz_church | evet | shake=sallanmaya, topple=mumlar |
| 11 | Tanıkların anlattığına göre sarsıntı, üç buçuk ile altı dakika arasında sürdü. Düşünün: altı dakika boyunca ayakta duramıyorsunuz! | Dev yazı: 'ALTI DAKİKA SARSINTI', 'Altı' kırmızı kutuda; el yazısı not 'tanıklara göre 3,5–6 dk'; yanda Kaşif şok olur | title | evet | w0=Tanıkların, note=altı, w1=Düşünün |
| 12 | Taş kiliselerin tavanları, içindeki kalabalığın üstüne çöktü. Kaçmaya çalışanlar da dar sokaklarda yıkılan duvarların altında kaldı. | Kilise sarsılmaya devam eder; 'çöktü'de tavanda kalın bir çatlak açılır, taşlar düşer, toz bulutu sıraları kaplar | lz_church | — | shake=Taş, collapse=çöktü |
| 13 | Şehrin ortasında, bazı kaynaklara göre beş metre genişliğe varan yarıklar açıldı. | Dev yazı: '5 METRELİK YARIKLAR', 'yarıklar' kırmızı kutuda; not 'bazı kaynaklara göre'; Kaşif işaret eder | title | evet | w0=Şehrin, w2=yarıklar, note=kaynaklara |
| 14 | Kraliyet sarayı Ribeira da yıkıldı. Sarayın kütüphanesinde tahminen yetmiş bin cilt kitap vardı. | Nehir kıyısındaki uzun kemerli Ribeira Sarayı 'yıkıldı'da sallanıp çöker, toz yükselir; '70.000 cilt' notu belirir; Kaşif soldan işaret eder | lz_city | evet | shake=Kraliyet, hit=yıkıldı, lib=yetmiş |
| 15 | Titian'ın, Rubens'in tabloları, krallığın arşivleri… Ve yedi ay önce açılan görkemli opera binası. Hepsi tek bir sabahta yok oldu. | Pano 'Kaybolanlar': Titian ve Rubens tabloları ✗, kraliyet arşivleri ✗, opera binası ✗ tek tek işaretlenir; altta kırmızı hap 'Tek sabahta' | board | — | a=Titian, b=arşivleri, c=opera, pill=Hepsi |
| 16 | Toz bulutu şehrin üstüne çöktü, gökyüzü karardı. Hayatta kalanlar tek bir şey düşündü: açık alana çıkmak. | Yıkılmış şehrin üstünde toz bulutu, gökyüzü taralı ve karanlık; Kaşif ve iki kişi koşarak sağa, açık alana kaçar; 'açık alana!' notu | lz_city | evet | hit=Toz, run=açık |
| 17 | Binlerce kişi yıkıntıların arasından geçip nehrin kıyısındaki büyük liman meydanına koştu. Orada güvende olacaklarını sandılar. | Liman meydanına yürüyen kalabalık: şapkasız figürler sağa, nehre doğru yürür; Kaşif aralarında yürür, sonra rahatlayıp el sallar; 'Liman meydanı' etiketi | stage | evet | hit=koştu, safe=güvende |
| 18 | Ama asıl felaket henüz başlamamıştı. | Dev yazı: 'ASIL FELAKET HENÜZ BAŞLAMAMIŞTI', 'felaket' kırmızı kutuda; Kaşif endişeyle omuz silker | title | evet | w1=felaket |
| 19 | Kıyıya varanlar, gözlerine inanamadı. | BÖLÜM 3 / 8 kartı: mavi dairede 3, altında 'Deniz çekildi' ve el çizimi alt çizgi | chapter | — | n=Kıyıya, title=inanamadı |
| 20 | Deniz geri çekiliyordu! Su limandan uzaklaştı ve geride çamurlu bir düzlük kaldı. | Rıhtımdan liman: 'çekiliyordu'da su kıyıdan uzaklaşır, geride çamur düzlüğü açılır, batık gemi ve fıçılar görünür; rıhtımda Kaşif ve iki kişi şaşkın bakar | lz_sea | evet | recede=çekiliyordu, mud=çamurlu |
| 21 | Batık gemilerin enkazı, denize düşmüş yükler, çırpınan balıklar… Hepsi açıkta kalmıştı. Bazı insanlar meraktan çamura doğru yürüdü. | Açık kalmış deniz tabanı: batık gemi enkazları, fıçılar, çırpınan balıklar; 'yürüdü'de bir kişi rıhtımdan çamura doğru yürür, Kaşif onu durdurmak ister gibi işaret eder | lz_sea | evet | hit=Batık, walk=yürüdü, recede=Batık |
| 22 | Peki sizce bu ne demekti? Bugün çok iyi biliyoruz: deniz birden çekilirse, büyük bir dalga yoldadır. | Kaşif düşünür, 'demekti'de el çenesinde; 'dalga'da 'DALGA YOLDA' tabelası belirir ve Kaşif şok olup işaret eder; arkada sakin deniz | stage | evet | q=demekti, hit=dalga |
| 23 | Depremden yaklaşık kırk dakika sonra, ufukta bir su duvarı belirdi. | Yatay zaman çizgisi: '09:40 Deprem', '≈ 10:20 Dalga' (kırmızı), 'Ateş' noktaları sırayla belirir; yanda Kaşif işaret eder | timeline | evet | a=Depremden, b=kırk, c=duvarı |
| 24 | Dalga limanı ve aşağı şehri yuttu, nehrin içinden yukarı doğru tırmandı. Arkasından iki dalga daha geldi. | Ufukta su duvarı yükselir ve 'yuttu'da rıhtıma doğru yuvarlanır; gemiler dalganın tepesine fırlar; rıhtımda Kaşif şok olup geri sıçrar | lz_sea | evet | wave=Dalga, hit=yuttu |
| 25 | Meydana sığınan kalabalık kaçacak yer bulamadı. Demirli gemiler parçalandı, rıhtım sulara gömüldü. | Fırtınalı deniz: 'parçalandı'da demirli gemi yan yatıp batar, önünden dev dalga tepesi geçer; Kaşif kıyıdan dürbünle bakar, sonra şaşırır | stage | evet | hit=parçalandı, storm=kalabalık |
| 26 | Ve bu dalga sadece Lizbon'u vurmadı. Fas kıyılarında, kaynaklara göre yirmi metreye varan dalgalar görüldü. | Eski harita, Portekiz ve Fas kıyısı: Lizbon ve Fas (kırmızı) belirir; okyanustaki merkezden Fas'a kesikli kırmızı ok çizilir; not '≈ 20 metre' | map | — | lis=Lizbon'u, go=Fas, note=yirmi |
| 27 | Dalga İngiltere'ye ve İrlanda'ya ulaştı. Hatta okyanusu geçip Karayipler'e, Barbados ve Martinik kıyılarına kadar vardı! | Atlas haritası: merkezden kesikli kırmızı rotalar İngiltere'ye, İrlanda'ya ve okyanus boyunca Karayipler'e (Barbados, Martinik) çizilir | map | — | en=İngiltere'ye, car=Karayipler'e |
| 28 | Yani tek bir sarsıntı, koca bir okyanusu baştan sona çalkalamıştı. | Kaşif 'TEK SARSINTI' tabelasını kaldırır, 'çalkalamıştı'da omuz silker; arkada dalgalı okyanus ve sallanan gemi | stage | evet | hit=sarsıntı, big=çalkalamıştı |
| 29 | Peki su çekilince ne oldu? Şehir bu kez yanmaya başladı. | BÖLÜM 4 / 8 kartı: mavi dairede 4, altında 'Şehir yanıyor' ve el çizimi alt çizgi | chapter | — | n=Peki, title=yanmaya |
| 30 | Hatırlayın, kiliselerde binlerce mum vardı. Evlerde de bayram yemekleri için ocaklar yanıyordu. | Kilise sunağında sıra sıra yanan mumlar ve avizeler; Kaşif mumları işaret eder; 'ocaklar' notu belirir | lz_church | evet | hit=mum, oc=ocaklar |
| 31 | Yıkılan kirişler, perdeler, kitaplar… Devrilen her mum, kuru bir yığına düşen bir kıvılcım oldu. | 'Devrilen'de mumlar sunağın üstüne devrilir, 'kıvılcım'da sunak örtüsü ve perdeler alev alır; Kaşif şok olur | lz_church | evet | topple=Yıkılan, fire=kıvılcım |
| 32 | Rüzgâr da çıkınca küçük yangınlar birleşti. Kısa sürede şehrin merkezi dev bir ateş fırtınasına döndü. | Dar sokakta yan yana ahşap katlı evler; 'Rüzgâr'da rüzgâr çizgileri, alev evden eve atlar, kıvılcımlar savrulur; Kaşif soldan bakar, sonra şaşırır | londonfire | evet | wind=Rüzgâr, fire=yangınlar, hit=fırtınasına |
| 33 | Alevler o kadar güçlüydü ki yaklaşanlar dumandan ve sıcaktan nefes alamadı. | Nehirden yanan Lizbon: yıkık binaların üstünde alev dilleri, kara duman sütunları, nehirde kırmızı yansımalar; önde Kaşif sıcaktan geri çekilir | lz_fire | evet | hit=güçlüydü, back=nefes |
| 34 | Sudan kaçanlar ateşe, ateşten kaçanlar suya sıkıştı. İşte Lizbon'un o günkü çaresizliği buydu. | Kaşif ortada: solda dalgalı su, sağda 'ATEŞ' tabelası; 'Sudan'da sola, 'ateşten'de sağa bakar, sonra çaresiz omuz silker | stage | evet | a=Sudan, b=ateşten, hit=çaresizliği |
| 35 | Anlatılanlara göre şehir tam beş gün yandı. | Dev yazı: 'ŞEHİR BEŞ GÜN YANDI', 'beş' kırmızı kutuda; Kaşif şok olur | title | evet | w1=beş |
| 36 | Peki kaç kişi öldü? Bunu kimse kesin olarak bilmiyor. Tahminlere göre yalnızca Lizbon'da otuz ile kırk bin kişi hayatını kaybetti. | Pano 'Kaç kişi öldü?': Lizbon kartında '30.000' ve '40.000' çubukları büyür; altta mavi hap 'Kesin sayı yok' | board | — | q=kaç, a=otuz, b=kırk, pill=Tahminlere |
| 37 | Bu, yaklaşık iki yüz bin kişilik bir şehirdi. Yani kabaca her altı kişiden biri… | Altı şapkasız figür yan yana durur, biri öne çıkar; Kaşif onu işaret eder ve başını eğer; '≈ 200.000 kişi' etiketi | stage | evet | hit=iki, one=altı |
| 38 | Şehir artık enkaz, kül ve korkudan ibaretti. Peki bu kaosu kim toparlayacaktı? | Duman tüten yıkıntılar, küçük alevler, karanlık gökyüzü; Kaşif önde düşünür, 'kim'de omuz silker; büyük el yazısı '?' | lz_fire | evet | hit=kaosu, who=kim |
| 39 | Kral José geri döndüğünde gördüğü manzara karşısında sarsıldı. | BÖLÜM 5 / 8 kartı: mavi dairede 5, altında 'Ölüleri gömün' ve el çizimi alt çizgi | chapter | — | n=Kral, title=manzara |
| 40 | Öyle ki bir daha taş duvarların arasında yaşamak istemedi. Sarayı bıraktı, şehrin tepelerinde kurulan dev çadırlara taşındı. | Tepedeki büyük çadır: taçlı Kral José tahtında oturur, 'çadırlara'da ayağa kalkar; solda Kaşif anlatır, sonra işaret eder | ag03c_court | evet | hit=taş, tent=çadırlara |
| 41 | Ama birinin hemen karar vermesi gerekiyordu. İşte tam burada sahneye bir bakan çıktı: Sebastião de Melo. | Şapkasız, kısa saçlı bakan Sebastião de Melo sağdan yürüyerek gelir ve elindeki parşömeni kaldırır; Kaşif onu işaret eder; isim etiketi | stage | evet | hit=bakan, name=Sebastião |
| 42 | Onu bugün daha çok sonraki unvanıyla tanıyoruz: Pombal Markisi. | Dev yazı: 'POMBAL MARKİSİ', 'Pombal' kırmızı kutuda; not 'sonraki unvanı'; Kaşif işaret eder | title | evet | w0=Pombal |
| 43 | Ona atfedilen meşhur bir söz var: "Ölüleri gömün, yaşayanları iyileştirin." Bunu gerçekten söyledi mi, tarihçiler emin değil. Ama yaptıkları tam olarak buydu. | Yazı masası: kâğıda 'Ölüleri gömün, yaşayanları iyileştirin' başlığı yazılır, tüy kalem satırları doldurur; 'emin'de kırmızı 'ATFEDİLİR' damgası; Kaşif solda düşünür, sonra omuz silker | mcB_desk | evet | hit=söz, stamp=emin |
| 44 | Salgın çıkmasın diye cesetler hızla toplandı. Anlatılanlara göre bir kısmı mavnalara yüklenip açık denize götürüldü. | Sakin liman: bir mavna yavaşça açık denize doğru süzülür; Kaşif kıyıda başını eğip dürbünle bakar; 'mavnalar' etiketi | stage | evet | hit=Salgın, go=mavnalara |
| 45 | Yağmacılara karşı askerler şehrin çevresine yerleştirildi. Evsiz kalanlar için çadır kamplar kuruldu, yiyecek getirildi. | Miğferli iki asker mızrakla nöbet tutar; 'yiyecek'te ekmek sepeti belirir, Kaşif ekmeği gösterir; arkada şehir | stage | evet | hit=askerler, food=yiyecek |
| 46 | Ve bir yıl dolmadan, yıkıntıların büyük kısmı temizlenmişti. | Yatay zaman çizgisi: '1 Kasım 1755 Deprem', '4 Aralık 1755 Yeni planlar', '1756 Enkaz temizlendi' (kırmızı); Kaşif işaret eder | timeline | evet | a=Ve, b=yıl, c=temizlenmişti |
| 47 | Ama Pombal'ın aklında çok daha büyük bir soru vardı: Bu felaket neden oldu? | Kaşif düşünür; 'neden'de büyük kırmızı 'NEDEN?' tabelası belirir, Kaşif ona döner ve işaret eder | stage | evet | hit=soru, why=neden |
| 48 | O dönemde çoğu insanın cevabı hazırdı. | BÖLÜM 6 / 8 kartı: mavi dairede 6, altında 'Peki neden?' ve el çizimi alt çizgi | chapter | — | n=dönemde, title=cevabı |
| 49 | Bazı vaizlere göre deprem, Tanrı'nın günahkâr şehre verdiği bir cezaydı. | Şapkasız bir vaiz parmağıyla gökyüzünü gösterir; 'ceza'da 'CEZA' tabelası belirir; Kaşif kenarda kollarını kavuşturup düşünür | stage | evet | hit=vaizlere, c=cezaydı |
| 50 | Ama bir sorun vardı. Bayramda dua eden insanlar kiliselerin altında kalmıştı. Bu nasıl bir ceza olabilirdi? | Dev yazı: 'BU NASIL BİR CEZA?', 'ceza' kırmızı kutuda; Kaşif omuz silker | title | evet | w0=sorun, w3=ceza |
| 51 | Bugün asıl cevabı biliyoruz. Deprem şehrin altında değil, Atlantik'te, Lizbon'un yaklaşık iki yüz doksan kilometre güneybatısında oldu. | Eski harita, Portekiz kıyısı ve okyanus: Lizbon, okyanusta kırmızı 'Merkez' noktası, aralarında kesikli çizgi ve '≈ 290 km' notu | map | — | lis=Lizbon'un, ep=Atlantik'te, km=kilometre |
| 52 | Orada iki dev levha, Afrika ve Avrasya, birbirine sürtünür. Yüzyıllar boyunca biriken gerilim, o sabah bir anda boşaldı. | Okyanus kesiti: deniz, deniz tabanı, iki levha ve aralarında kırmızı fay; 'sürtünür'de kırmızı oklar levhaları iter, 'boşaldı'da fay kayar, odaktan altın parlama ve halkalar çıkar; Kaşif solda işaret eder | lz_fault | evet | push=sürtünür, hit=boşaldı |
| 53 | Büyüklüğü mü? O zaman ölçen bir alet yoktu tabii. Ama bugünkü tahminlere göre sekizin üzerindeydi, belki de dokuza yakındı. | Dev yazı: '8'İN ÜZERİNDE, BELKİ 9', '9' kırmızı kutuda; not 'bugünkü tahmin'; Kaşif düşünür | title | evet | w0=Büyüklüğü, w3=dokuza, note=tahminlere |
| 54 | Kırılma okyanus tabanında olduğu için koca bir su kütlesini yerinden oynattı. İşte dalga buradan geldi. | Aynı kesit: 'oynattı'da fay kayar, su yüzeyi tümsek yapar ve iki dalgaya ayrılıp sağa sola koşar, sağdaki dalga kıyıdaki Lizbon'a ulaşır; gemi dalgada sallanır; Kaşif şok olur | lz_fault | evet | hit=oynattı, w=dalga |
| 55 | Peki Lizbon neden bu kadar ağır yıkıldı? Çünkü üç felaket zincirleme geldi. | Dev yazı: 'ÜÇ FELAKET ZİNCİRLEME', 'Üç' kırmızı kutuda; Kaşif işaret eder | title | evet | w0=Peki, w1=üç |
| 56 | Sarsıntı taş binaları yıktı. Dalga, kaçanların sığındığı kıyıyı vurdu. Ateş ise bayram mumlarından doğdu. | Pano 'Zincir': Sarsıntı → taş binalar, Dalga → kıyı, Ateş → mumlar maddeleri sırayla işaretlenir; kırmızı hap 'Üst üste üç darbe' | board | — | a=Sarsıntı, b=Dalga, c=Ateş, pill=doğdu |
| 57 | Bir de zamanlama vardı. Felaket, insanların en kalabalık ve en savunmasız olduğu ana, bayram ayininin ortasına denk gelmişti. | Tıklım tıklım kilise, mumlar yanar; 'savunmasız'da Kaşif endişeyle cemaate bakar; 'bayram ayini' notu | lz_church | evet | hit=zamanlama, w=savunmasız |
| 58 | Şimdi size bu hikâyenin en sevdiğim kısmını anlatacağım. | BÖLÜM 7 / 8 kartı: mavi dairede 7, altında 'Bakanın soruları' ve el çizimi alt çizgi | chapter | — | n=Şimdi, title=sevdiğim |
| 59 | Pombal, ülkenin dört bir yanındaki papazlara aynı soruları gönderdi. | Portekiz haritası: Lizbon'dan Porto, Coimbra, Évora ve Faro'ya kesikli çizgiler uzanır, şehirler sırayla belirir; not 'aynı sorular' | map | — | go=papazlara, q=soruları |
| 60 | Sarsıntı saat kaçta başladı, ne kadar sürdü? Hangi yönden geldi? Binalar daha çok hangi tarafa yıkıldı? | Yazı masası: kâğıtta 'Saat kaçta? / Ne kadar sürdü?' başlığı belirir, tüy kalem soruları yazar; Kaşif solda işaret eder | mcB_desk | evet | hit=Sarsıntı, dir=yönden |
| 61 | Deniz önce yükseldi mi, alçaldı mı? Ne kadar? Yangın kaç gün sürdü? | Pano 'Pombal'ın anketi': 'Deniz yükseldi mi?', 'Ne kadar?', 'Yangın kaç gün?' maddeleri tek tek ✓ alır; mavi hap 'Ölç, kaydet' | board | — | a=Deniz, b=kadar, c=Yangın, pill=sürdü |
| 62 | Fark ettiniz mi? Bunlar duaya ya da cezaya dair sorular değil. Bunlar bir bilim insanının soruları! | Kaşif önce omuz silker, 'bilim'de 'BİLİM' tabelası belirir ve Kaşif şaşkınlıkla geri sıçrayıp tabelayı işaret eder; el yazısı 'ceza değil, ölçüm' | stage | evet | hit=cezaya, sci=bilim |
| 63 | Cevaplar bugün hâlâ Lizbon'daki Torre do Tombo arşivinde duruyor. Bu yüzden Pombal, modern deprem biliminin öncülerinden biri sayılır. | Arşiv: yan yana dürülmüş parşömen tomarları birer birer belirir, 'TORRE DO TOMBO' tabelası; Kaşif bir tomarı tutar, sonra işaret eder | stage | evet | hit=Cevaplar, arc=arşivinde, pio=öncülerinden |
| 64 | Ve yeni şehri de bu soruların ışığında kurdu. | Kaşif elinde katlanmış harita ile yürür, 'kurdu'da durup haritayı kaldırır; arkada yıkıntı kolonları ve tepeler | stage | evet | hit=kurdu |
| 65 | Mimarlar, yıkılan aşağı şehir için dört plan sundu. Kral en cesur olanı seçti. | BÖLÜM 8 / 8 kartı: mavi dairede 8, altında 'Yeniden doğan şehir' ve el çizimi alt çizgi | chapter | — | n=Mimarlar, title=cesur |
| 66 | Eski dar ve kıvrımlı sokaklar tamamen kaldırıldı. Yerine dümdüz, geniş caddeler ve dik açılı bir ızgara çizildi. | Pafta: nehir kenarındaki kıvrımlı eski sokaklar 'kaldırıldı'da silikleşip kırmızıyla çizilir, 'Yerine'de düz caddeler tek tek çizilir ve ızgara oluşur, 'çizildi'de nehir kıyısındaki büyük meydan kırmızıyla çevrilir; Kaşif sağda işaret eder | lz_grid | evet | erase=kaldırıldı, grid=Yerine, square=çizildi |
| 67 | Binaların içine, gaiola denen esnek bir ahşap kafes yerleştirildi. Duvar çatlasa bile kafes ayakta kalacaktı. | Duvar kesiti: tuğla dolgunun içinde ahşap çerçeve ve çapraz X kirişler 'gaiola'da kendini çizer; 'Duvar'da duvar sallanır, 'çatlasa'da tuğlalar düşer, kafes ayakta kalır; Kaşif sağda işaret eder, sonra şaşırır | lz_gaiola | evet | frame=gaiola, shake=Duvar, hit=çatlasa |
| 68 | Peki nasıl test ettiler? Anlatılana göre önce küçük modeller yaptılar. Sonra askerler bu modellerin etrafında tempoyla yürüdü, ve yeri sarsan adımlar depremin yerine geçti! | Kaide üstünde küçük ahşap model ev; önde ve arkada miğferli askerler tempoyla yürür, her adımda model ve zemin titrer, toz kalkar; Kaşif sağda işaret eder | lz_march | evet | hit=askerler, d=depremin |
| 69 | Bu sistem, dünyadaki ilk depreme dayanıklı yapı yöntemlerinden biri olarak görülür. | Dev yazı: 'DEPREME DAYANIKLI İLK YAPILARDAN', 'dayanıklı' kırmızı kutuda; Kaşif işaret eder | title | evet | w1=depreme |
| 70 | Deprem Avrupa'nın düşünürlerini de sarstı. Voltaire, Lizbon felaketi üzerine bir şiir yazdı. Sonra da Candide'de, "her şey en iyisi için" diyen iyimserlerle alay etti. | Yazı masası: 'Lizbon Felaketi Üzerine Şiir' başlığı, tüy kalem satırları yazar; altta 'HER ŞEY EN İYİSİ' yazısının üstü 'alay'da kırmızıyla çizilir; Kaşif solda anlatır | mcB_desk | evet | hit=şiir, strike=alay |
| 71 | Genç Kant ise depremi doğal nedenlerle açıklamaya çalışan üç yazı yayımladı. Açıklaması yanlıştı, ama soruyu doğru sormuştu. | Şapkasız genç Kant elinde tomarla durur; 'üç'te üç tomar belirir; 'yanlıştı'da Kaşif omuz silker, 'doğru'da Kant'ı işaret eder; 'Kant, 1756' etiketi | stage | evet | hit=üç, wrong=yanlıştı, right=doğru |
| 72 | Bugün Lizbon'a giderseniz, Carmo Manastırı'nın çatısız kemerlerini görebilirsiniz. O yıkıntı, o sabahın sessiz tanığı olarak bilerek ayakta bırakıldı. | Çatısız Carmo Manastırı: yükseklikleri farklı taş kolonlar ve kırık kemer kalıntıları; Kaşif soldan yürüyerek gelir ve dürbünle yukarı bakar; 'Carmo' etiketi | stage | evet | hit=Carmo, w=tanığı |
| 73 | Yani 1755'te bir şehir yıkıldı, ama o yıkıntıdan felakete "neden?" diye soran yeni bir dünya doğdu. | Dev yazı: 'YIKINTIDAN YENİ BİR DÜNYA DOĞDU', 'dünya' kırmızı kutuda; Kaşif el sallar | title | evet | w0=Yani, w3=dünya |
| 74 | Peki siz o sabah limanda olsaydınız, çekilen denizi görünce ne yapardınız? Yorumlara yazın. | Rıhtımdan liman: deniz yavaşça geri çekilir, çamur açılır; Kaşif rıhtımda izleyiciye döner, 'ne'de omuz silker; el yazısı 'Siz ne yapardınız?' | lz_sea | evet | recede=limanda, q=yapardınız |

## Doğruluk notları

- 1 Kasım 1755, Azizler Günü, ~09:40; sarsıntı tanıklara göre 3,5–6 dk; merkez Atlantik, Lizbon'un ~290 km GB'sı (Azor–Cebelitarık fay zonu, Afrika–Avrasya sınırı). Büyüklük tahminleri 7,7–9 arası; metinde "bugünkü tahminlere göre sekizin üzerinde, belki dokuza yakın" (yaygın 8,5–9 tahmini). [Wikipedia: 1755 Lisbon earthquake](https://en.wikipedia.org/wiki/1755_Lisbon_earthquake)
- Şehir merkezinde 5 m'ye varan yarıklar ("bazı kaynaklara göre"). Ribeira Sarayı, ~70.000 ciltlik kütüphane, Titian/Rubens tabloları, kraliyet arşivleri, 7 ay önce açılan opera (Ópera do Tejo). (Wikipedia)
- Deniz çekildi, çamur düzlüğü + batıklar açıldı; ~40 dk sonra dalga, ardından iki dalga daha. Fas kıyısında 20 m'ye varan dalgalar; Cornwall, İrlanda, Barbados ve Martinik'e ulaştı. (Wikipedia)
- Yangın: mumlardan; "beş gün" yaygın anlatım → metinde "anlatılanlara göre". [lisboasecreta](https://lisboasecreta.co/en/1755-earthquake-in-lisbon/)
- Ölü: Lizbon'da 30–40 bin (~200 bin nüfus) tahmini, "kesin bilinmiyor" dendi; "kabaca altıda bir". (Wikipedia, Pereira)
- Kral José sabah ayininden sonra kızının isteğiyle şehir dışındaydı; sonrasında duvarlar arasında yaşamaktan korktu, Ajuda tepelerinde çadır sarayda yaşadı. (Wikipedia)
- "Ölüleri gömün, yaşayanları iyileştirin": atfedilir, Kendrick apokrif sayar → metinde "tarihçiler emin değil". Cesetlerin mavnalarla denize götürülmesi "anlatılanlara göre".
- Pombal'ın papazlara anketi (saat, süre, yön, hangi tarafa yıkıldı, deniz önce yükseldi mi alçaldı mı, ne kadar, yangın süresi, ölüler); cevaplar Torre do Tombo'da; Pombal sismolojinin öncülerinden sayılır. (Wikipedia)
- 4 Aralık 1755 Manuel da Maia dört plan sundu, kral en radikalini seçti; bir yıl dolmadan enkaz temizlendi; dik açılı Baixa. Gaiola pombalina ahşap kafes [Wikipedia: Gaiola](https://en.wikipedia.org/wiki/Gaiola_(construction)); askerlerin model etrafında yürüyerek test etmesi Wikipedia'da var → metinde "anlatılana göre".
- Voltaire: Poème sur le désastre de Lisbonne + Candide; Kant 1756'da üç yazı, açıklaması yanlış ama doğal neden arayan ilklerden. Carmo Manastırı çatısız kalıntı olarak bırakıldı (iyi bilinen, Lizbon'da bugün müze).
- Kaçınılan efsane: "genelevler mahallesi ayakta kaldı" anekdotu doğrulanamadığı için anlatılmadı.

## Kapak adayları

- A: sahne 24 (dalga) t 2.4 — dalga kadrajın sağında kesik, sol yarı boş → zayıf.
- B: sahne 33 (yangın) t 3 — alevler güçlü ama Kaşif alevlerin önünde küçük, tek felaket.
- C: sahne 0 (deprem) t 7.5 — toz bulutu, okunmuyor.
- D (SEÇİLDİ): sahne 0 t 4 + `params.cover` (sadece kapakta: yanan şehir + kırık rıhtım + sağdan kıvrılan dev dalga) + büyük şok Kaşif (scale 1.4). Metin BİR SABAH / [ÜÇ] FELAKET. Üç felaket tek karede.
- E/F: D'nin yangın sahnesi ve işaret pozlu varyantları; E karanlık, F'de Kaşif gülümsüyor → elendi.

## Yeni sahne tipleri

- `scenes/studio/shots/lz_city.js`: lz_city (city/quake), lz_church, lz_sea (recede/wave), lz_fire + kapak kompoziti
- `scenes/studio/shots/lz_grid.js`: lz_grid (Baixa planı), lz_gaiola, lz_march
- `scenes/studio/shots/lz_fault.js`: lz_fault (okyanus altı fay kesiti, kayma, iki dalga)
- Diğer ajanların tipleri (değiştirilmeden) kullanıldı: londonfire (sokak yangını), mcB_desk (yazı masası), ag03c_court (çadır saray). Fotoğraf yok (bulut ortamında medya proxy'si 403).

## Tur 1 düzeltmeleri (eleştiri: review-05.md)

Karakter: 7469 · 75 sahne · ~517 sn · lint OK (SEO 100).

- Metin: 29 → "Ama sarsıntı başka bir şeyi daha başlatmıştı: ateşi."; 53 → "yaklaşık sekiz ile dokuz arasındaydı" (kart "Büyüklük ≈ 8–9"); 65 → "Başmühendis Manuel da Maia ... dört seçenek sundu. Kral ve Pombal en cesurunu seçti: aşağı şehri yıkıp baştan kurmak."; 68 virgül silindi.
- Kapak: ["Lizbon", "3 kez", "yıkıldı"], vurgu "3"; sahne 0 t 6.4, kapak kompoziti: yanan şehir + eğilip çöken iki bina + kalın kırmızı yarıklar + sağdan kıvrılan dalga; Kaşif şok, scale 1.8, yüzü ve kolları kadrajda. Adaylar: G (seçildi), H (Kaşif sol kenarda, yazıya biniyor), I (t 8.5, toz bulutu çöken binaları bulandırıyor). Sol boşluk motorun uzun video kapak düzeninden (engine.js, ortak dosya, dokunulmadı).
- Kaşif: kilise sahnelerinde x 0.83, scale 1.3, sıraların önünde; liman (20, 21, 24, 74) rıhtımın önünde y 0.97, scale 0.78; 32/33/52/54 x ≥ 0.12 tam boy; 6'da ağaç kaldırıldı.
- Görsel=anlatım: 13 → lz_city yarıklar (≈ 5 metre); 17 → 10 kişilik kalabalık; 25 → lz_sea dalga + rıhtımda sıkışmış 6 kişi + yan yatan gemiler; 35 → lz_fire + 1–5. GÜN sayacı; 54 → halkalar kapalı, su yüzeyinde büyük tümsek + iki dalga; 72 → lz_church `ruin` (çatısız, gökyüzüne açık sivri kemerler); 45 → ekmek yerine 'ÇADIR + YİYECEK' tabelası, visual'den mızrak çıkarıldı.
- Okunabilirlik: kilise üst kirişi y ≈ 170'e indi; Baixa paftası y 0.17'den başlıyor.
- Yeni parametreler: lz_city `ruin`, `crack_w`, `days`, `cover.tilt/crack_w`; lz_fault `rings`, `wave_amp`.

### Güncel tek parça anlatım

Bir sabah, birkaç saat içinde, Avrupa'nın en zengin şehirlerinden biri üç kez yıkıldı. Önce yer, sonra deniz, sonra ateş. Gelin, bu inanılmaz günü baştan anlatayım. Takvimler 1 Kasım 1755'i gösteriyordu. Yer, Portekiz'in başkenti Lizbon. O günlerde Lizbon bir hazine şehriydi. Brezilya'dan gelen altın ve elmas, gemilerle bu limana akardı. Tejo Nehri'nin ağzında yüzlerce gemi demirliydi. Liman meydanında baharat, ipek ve şeker kokusu birbirine karışırdı. Üstelik o sabah sıradan bir gün değildi. Azizler Günü'ydü, yani Katolik dünyasının en büyük bayramlarından biri. Şehrin dört bir yanındaki kiliseler tıklım tıklımdı. Binlerce mum yanıyor, tütsü kokusu tavanlara yükseliyordu. Kral Birinci José ise sabah ayinini erkenden dinlemiş, ailesiyle şehrin dışına çıkmıştı. Çünkü kızı, bayramı kırda geçirmek istemişti. Bu küçük aile kararını aklınızda tutun. Birkaç saat sonra kralın hayatını kurtaracaktı. Saat dokuzu kırk geçiyordu. Ayin tam ortasındaydı. Önce derinden gelen bir uğultu duyuldu. Sanki yerin altından ağır bir araba geçti. Sonra zemin sallanmaya başladı. Avizeler salındı, mumlar birer birer devrildi. Tanıkların anlattığına göre sarsıntı, üç buçuk ile altı dakika arasında sürdü. Düşünün: altı dakika boyunca ayakta duramıyorsunuz! Taş kiliselerin tavanları, içindeki kalabalığın üstüne çöktü. Kaçmaya çalışanlar da dar sokaklarda yıkılan duvarların altında kaldı. Şehrin ortasında, bazı kaynaklara göre beş metre genişliğe varan yarıklar açıldı. Kraliyet sarayı Ribeira da yıkıldı. Sarayın kütüphanesinde tahminen yetmiş bin cilt kitap vardı. Titian'ın, Rubens'in tabloları, krallığın arşivleri… Ve yedi ay önce açılan görkemli opera binası. Hepsi tek bir sabahta yok oldu. Toz bulutu şehrin üstüne çöktü, gökyüzü karardı. Hayatta kalanlar tek bir şey düşündü: açık alana çıkmak. Binlerce kişi yıkıntıların arasından geçip nehrin kıyısındaki büyük liman meydanına koştu. Orada güvende olacaklarını sandılar. Ama asıl felaket henüz başlamamıştı. Kıyıya varanlar, gözlerine inanamadı. Deniz geri çekiliyordu! Su limandan uzaklaştı ve geride çamurlu bir düzlük kaldı. Batık gemilerin enkazı, denize düşmüş yükler, çırpınan balıklar… Hepsi açıkta kalmıştı. Bazı insanlar meraktan çamura doğru yürüdü. Peki sizce bu ne demekti? Bugün çok iyi biliyoruz: deniz birden çekilirse, büyük bir dalga yoldadır. Depremden yaklaşık kırk dakika sonra, ufukta bir su duvarı belirdi. Dalga limanı ve aşağı şehri yuttu, nehrin içinden yukarı doğru tırmandı. Arkasından iki dalga daha geldi. Meydana sığınan kalabalık kaçacak yer bulamadı. Demirli gemiler parçalandı, rıhtım sulara gömüldü. Ve bu dalga sadece Lizbon'u vurmadı. Fas kıyılarında, kaynaklara göre yirmi metreye varan dalgalar görüldü. Dalga İngiltere'ye ve İrlanda'ya ulaştı. Hatta okyanusu geçip Karayipler'e, Barbados ve Martinik kıyılarına kadar vardı! Yani tek bir sarsıntı, koca bir okyanusu baştan sona çalkalamıştı. Ama sarsıntı başka bir şeyi daha başlatmıştı: ateşi. Hatırlayın, kiliselerde binlerce mum vardı. Evlerde de bayram yemekleri için ocaklar yanıyordu. Yıkılan kirişler, perdeler, kitaplar… Devrilen her mum, kuru bir yığına düşen bir kıvılcım oldu. Rüzgâr da çıkınca küçük yangınlar birleşti. Kısa sürede şehrin merkezi dev bir ateş fırtınasına döndü. Alevler o kadar güçlüydü ki yaklaşanlar dumandan ve sıcaktan nefes alamadı. Sudan kaçanlar ateşe, ateşten kaçanlar suya sıkıştı. İşte Lizbon'un o günkü çaresizliği buydu. Anlatılanlara göre şehir tam beş gün yandı. Peki kaç kişi öldü? Bunu kimse kesin olarak bilmiyor. Tahminlere göre yalnızca Lizbon'da otuz ile kırk bin kişi hayatını kaybetti. Bu, yaklaşık iki yüz bin kişilik bir şehirdi. Yani kabaca her altı kişiden biri… Şehir artık enkaz, kül ve korkudan ibaretti. Peki bu kaosu kim toparlayacaktı? Kral José geri döndüğünde gördüğü manzara karşısında sarsıldı. Öyle ki bir daha taş duvarların arasında yaşamak istemedi. Sarayı bıraktı, şehrin tepelerinde kurulan dev çadırlara taşındı. Ama birinin hemen karar vermesi gerekiyordu. İşte tam burada sahneye bir bakan çıktı: Sebastião de Melo. Onu bugün daha çok sonraki unvanıyla tanıyoruz: Pombal Markisi. Ona atfedilen meşhur bir söz var: "Ölüleri gömün, yaşayanları iyileştirin." Bunu gerçekten söyledi mi, tarihçiler emin değil. Ama yaptıkları tam olarak buydu. Salgın çıkmasın diye cesetler hızla toplandı. Anlatılanlara göre bir kısmı mavnalara yüklenip açık denize götürüldü. Yağmacılara karşı askerler şehrin çevresine yerleştirildi. Evsiz kalanlar için çadır kamplar kuruldu, yiyecek getirildi. Ve bir yıl dolmadan, yıkıntıların büyük kısmı temizlenmişti. Ama Pombal'ın aklında çok daha büyük bir soru vardı: Bu felaket neden oldu? O dönemde çoğu insanın cevabı hazırdı. Bazı vaizlere göre deprem, Tanrı'nın günahkâr şehre verdiği bir cezaydı. Ama bir sorun vardı. Bayramda dua eden insanlar kiliselerin altında kalmıştı. Bu nasıl bir ceza olabilirdi? Bugün asıl cevabı biliyoruz. Deprem şehrin altında değil, Atlantik'te, Lizbon'un yaklaşık iki yüz doksan kilometre güneybatısında oldu. Orada iki dev levha, Afrika ve Avrasya, birbirine sürtünür. Yüzyıllar boyunca biriken gerilim, o sabah bir anda boşaldı. Büyüklüğü mü? O zaman ölçen bir alet yoktu tabii. Ama bugünkü tahminlere göre yaklaşık sekiz ile dokuz arasındaydı. Kırılma okyanus tabanında olduğu için koca bir su kütlesini yerinden oynattı. İşte dalga buradan geldi. Peki Lizbon neden bu kadar ağır yıkıldı? Çünkü üç felaket zincirleme geldi. Sarsıntı taş binaları yıktı. Dalga, kaçanların sığındığı kıyıyı vurdu. Ateş ise bayram mumlarından doğdu. Bir de zamanlama vardı. Felaket, insanların en kalabalık ve en savunmasız olduğu ana, bayram ayininin ortasına denk gelmişti. Şimdi size bu hikâyenin en sevdiğim kısmını anlatacağım. Pombal, ülkenin dört bir yanındaki papazlara aynı soruları gönderdi. Sarsıntı saat kaçta başladı, ne kadar sürdü? Hangi yönden geldi? Binalar daha çok hangi tarafa yıkıldı? Deniz önce yükseldi mi, alçaldı mı? Ne kadar? Yangın kaç gün sürdü? Fark ettiniz mi? Bunlar duaya ya da cezaya dair sorular değil. Bunlar bir bilim insanının soruları! Cevaplar bugün hâlâ Lizbon'daki Torre do Tombo arşivinde duruyor. Bu yüzden Pombal, modern deprem biliminin öncülerinden biri sayılır. Ve yeni şehri de bu soruların ışığında kurdu. Başmühendis Manuel da Maia, yıkılan aşağı şehir için dört seçenek sundu. Kral ve Pombal en cesurunu seçti: aşağı şehri yıkıp baştan kurmak. Eski dar ve kıvrımlı sokaklar tamamen kaldırıldı. Yerine dümdüz, geniş caddeler ve dik açılı bir ızgara çizildi. Binaların içine, gaiola denen esnek bir ahşap kafes yerleştirildi. Duvar çatlasa bile kafes ayakta kalacaktı. Peki nasıl test ettiler? Anlatılana göre önce küçük modeller yaptılar. Sonra askerler bu modellerin etrafında tempoyla yürüdü ve yeri sarsan adımlar depremin yerine geçti! Bu sistem, dünyadaki ilk depreme dayanıklı yapı yöntemlerinden biri olarak görülür. Deprem Avrupa'nın düşünürlerini de sarstı. Voltaire, Lizbon felaketi üzerine bir şiir yazdı. Sonra da Candide'de, "her şey en iyisi için" diyen iyimserlerle alay etti. Genç Kant ise depremi doğal nedenlerle açıklamaya çalışan üç yazı yayımladı. Açıklaması yanlıştı, ama soruyu doğru sormuştu. Bugün Lizbon'a giderseniz, Carmo Manastırı'nın çatısız kemerlerini görebilirsiniz. O yıkıntı, o sabahın sessiz tanığı olarak bilerek ayakta bırakıldı. Yani 1755'te bir şehir yıkıldı, ama o yıkıntıdan felakete "neden?" diye soran yeni bir dünya doğdu. Peki siz o sabah limanda olsaydınız, çekilen denizi görünce ne yapardınız? Yorumlara yazın.

## Tur 2 cilası

- Kaşif x ≥ 0.13 (≈ 250 px), scale 1.3, tam boy: 32, 33, 35, 38, 52, 54; 20, 21, 74'te rıhtımın önünde, ön planda (y 0.99, scale 1.3); 72'de scale 1.3; 68'de askerlerin önünde (cast katmanı yürüyen sıraların üstüne alındı).
- Kilise üst kirişi y ≈ 213 (CY 0.16H); Baixa paftası x 0.21 / y 0.18; gaiola duvarı x 0.28 / y 0.2: marka ve kicker serbest.
- 72 Carmo: lz_church `ruin` artık eşkenar sivri gotik kemerler (biri kırık, ikisi yarım), kalın taş sütun başlıkları, tepe y ≈ 260.
- 65: "yıkılan şehir merkezi için dört seçenek sundu ... aşağı şehri tamamen yıkıp baştan kurmak" ("aşağı şehir" tekrarı kalktı).
- 7.479 karakter, lint OK (SEO 100), tam preview ~517 sn, STATIC yok.


## Eleştiri günlüğü

### 01-vasili-arhipov — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 | 8 | 7 | 7 | 7 | 6 | 8 | 7 | 8 | 9 | 6 |

lint: OK (SEO 100). preview: ~36,6 sn tahmini (sınır 35), 500 karakter; sahne 0 motion=1.9 (en düşük), diğerleri 5.9–15.7.

1. **Senaryo, YouTuber sesi yok (BRAND §6.0, "en önemli kural").** On sahnenin hiçbirinde izleyiciye "siz" hitabı ya da "ben/gelin anlatayım" yok; metin üçüncü şahıs özet gibi akıyor. Sahne 1 "Yıl 1962, Küba Füze Krizi." ders kitabı başlığı gibi duruyor. Sahne 5'teki "ama bunu kim bilebilirdi?" sorusunun öznesi belirsiz (kim neyi bilecekti?). Devrik cümle yok, kapanış iyi. **Düzeltme** (~500 karakter, sahne sınırları aynı kalabilir): "Tek bir "hayır" dünyayı kurtardı. / Yıl 1962, Küba Füze Krizi. / Bir Sovyet denizaltısı adanın açıklarında saklanıyordu. / İçerisi fırın gibiydi, günlerdir Moskova'dan haber yoktu. / Derken tepede bombalar patladı. / Amerikalılar sadece "yüzeye çık" diyordu, ama siz o karanlıkta bunu nereden bilecektiniz? / Tanıklara göre kaptan, savaş başladı sandı ve nükleer torpidoyu hazırlattı. / Ama üç subayın da onayı şarttı. / İkisi evet dedi. Arhipov ise hayır dedi. / Yani dünyayı bir ordu değil, tek bir kelime kurtardı." Süre 35 sn altına insin diye 480–490 karaktere indir. Kapak metni ilk cümleyle uyumlu kalır. Cue'ları yeni metne göre güncelle (sahne 0 "hayır", sahne 8 "evet"/"hayır").
2. **Kapak yenilenmeli (6/10).** cover.jpg (sahne 0, t=2.4): (a) denizaltı içi küçük ekranda tahta çit/fıçı gibi okunuyor, alarm lambası görünmüyor, torpidonun üstünde "nükleer" etiketi yok (label_at "save" bu karede henüz çizilmemiş); (b) sahne soluk, yazı bloğunun altında ~170 px, üstünde ~180 px boş kâğıt var; (c) olayın tek simgesi (nükleer torpido) yarı saydam. **Düzeltme:** en az 3 aday üret: (A) sahne 8 en sonu (✓ ✓ ✗ + "Hayır!" balonu, kırmızı alarm, Arhipov'un eli kalkık); (B) sahne 6 en sonu (kapak açık, "nükleer" yazılı kırmızı bantlı torpido, öfkeli kaptan); (C) sahne 0 t≈3.0 (etiketler çizildikten sonra). Kaşif kapakta `{"pose":"point","emotion":"surprised","scale":1.3}` olsun, yüzü torpidoya baksın. Sahneyi büyütüp yukarı al ki yazı ile sahne arasındaki boşluk kapansın. B ya da A'dan güçlü olanı seç.
3. **Deniz sahneleri ve kenarlar (sahne 2, 4, 5, 8), kompozisyon/okunabilirlik.** Sahne 2/4/5'te Kaşif pencerede `scale 0.72` ile o kadar küçük ki 360 px karede yüzü okunmuyor; üç sahnenin hepsinde de aynı küçük, aynı pozda duruyor. Kicker'ın ("B-59 Sovyet denizaltısı", "Amerikan muhribi") üstünden bulut, baca dumanı ve sahne 5'teki Amerikalının kafası geçiyor. Sahne 5'te "Yüzeye çık!" balonu sağ kenarda kesiliyor. Sahne 8'de Kaşif (x 0.83) sağ kenardan taşıyor, şapkası kesik. **Düzeltme:** sahne 2/4/5'te kamerayı `focus` [0.5,0.55] ve `zoom` 1.2'ye al (ya da `sub.y` değerini aşağı çek) ve Kaşif'i ≥ 0.95 yap. Bulut ve gemileri y ≥ 0.12'ye indir. Sahne 5'te balonu x 0.68'e al. Sahne 8'de karakterleri x 0.12/0.32/0.52, Kaşif'i 0.78 yap. Ek olarak: sahne 1 haritasında "abluka" Küba'yı saran halka değil, Miami'den çıkan bir rota gibi çizilmiş ve "abluka" etiketi B-59 okuyla çakışıyor; hattı Küba çevresinde kesikli yay olarak çiz. Sahne 9'da "kurtardı" satırı "bir kelime"den önce çıkıyor ("tek" anında Dünyayı + kurtardı görünüyor); satırlar sırayla gelsin. Sahne 0'ın motion değeri 1.9; iki karesi neredeyse aynı, alarm ve torpido etiketini 1. saniyede başlat.

Doğruluk notu: 27 Ekim 1962, B-59, uyarı amaçlı küçük derinlik bombaları, üç subay onayı (Savitski, Maslennikov, Arhipov) kaynaklarla uyumlu. Ancak "üç onay" ve "ikisi evet dedi" kısmı tek tanığın (Orlov) anlatımına dayanıyor. "Tanıklara göre" kalıbı sadece sahne 6'da kullanılmış; sahne 7–8 bunu kesin bilgi gibi veriyor (8/10 bu yüzden).

### 01-vasili-arhipov — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 8 | 7 | 7 | 8 | 7 | 9 | 9 | 7 |

lint: OK. preview: 492 karakter, ~35,9 sn tahmini (sınır 35); sahne 0 motion=2.3 (en düşük), diğerleri 7.7–15.6.
Tur 1'den çözülenler: "siz" hitabı ve "Gelin anlatayım" eklendi; sahne 7–8'e "Anlatılana göre" çekincesi geldi; harita abluka hattı artık Küba'yı saran kesikli halka; deniz sahnelerinde bulutlar kaldırıldı, kicker temiz, Kaşif 0.92'ye büyüdü; "Yüzeye çık!" balonu kadraj içinde; sahne 8'de Kaşif kenardan taşmıyor; sahne 9'da satır sırası düzeldi.

1. **Kapak hâlâ 7 (8'in altında): kapak yenilenmeli.** cover.jpg yine sahne 0 (t=3.0). Yazar sadece Kaşif'i büyütmüş. Kalan sorunlar:
   - Sahnenin üst yarısı soluk ve silik; torpido ile "nükleer" etiketi açık pembe, küçük ekranda okunmuyor.
   - Alarm lambası karede yok, bölme hâlâ tahta çit gibi duruyor.
   - Yazı ile sahne arasında yaklaşık 170 px boş kâğıt var (y≈520–690).
   - Sadece tek bir aday var; 3 aday kuralı uygulanmamış.

   **Düzeltme:** sahne 8'in son anını aday olarak dene (✓ ✓ ✗, "Hayır!" balonu, kırmızı alarm, öfkeli kaptan; olayın tamamı tek karede). İkinci aday sahne 6'nın sonu olsun (açık kapak, "nükleer" etiketli torpido). `cover_cam` değerini zoom 1.25 / dy −200 yap ki boşluk kapansın. Torpido etiketi kapakta tam opak `red` olsun. Üç adayı yan yana karşılaştır.
2. **Sahne 5 ve 6'da bozuk cümleler (Senaryo).**
   - Sahne 5'te "ama siz bilir miydiniz?" cümlesinin nesnesi yok; neyi bilecekleri anlaşılmıyor. Şöyle olsun: "…diyordu. Ama siz o karanlıkta bunu nereden bilecektiniz?"
   - Sahne 6'daki "kaptan savaş sandı" kulağa eksik geliyor. Şöyle olsun: "Tanıklara göre kaptan savaşın başladığını sandı ve nükleer torpidoyu hazırlattı."
   - Bu iki değişiklik karakteri ~510'a çıkarır, süre de zaten 35,9 sn. Dengelemek için sahne 2'yi "Bir Sovyet denizaltısı orada saklanıyordu." diye kısalt; sahne 3'teki "günlerdir" kelimesini de çıkar ("İçerisi fırın gibiydi ve Moskova'dan haber yoktu."). Hedef ≤ 485 karakter ve ≤ 35 sn.
3. **Sahne 0 neredeyse donuk (motion 2.3) ve tahmini süre sınırı aşıyor.** Sheet'teki iki kare birebir aynı: "hayır" kelimesine kadar kaptan, Arhipov ve kamera hiç kıpırdamıyor. Bu, Shorts'un ilk 2,4 saniyesi. **Düzeltme:**
   - Alarm yanıp sönmesini t=0'dan başlat.
   - Kameraya `cam.from: 0` ile 1.0'dan 1.18'e sürekli itme ver.
   - Kaptan t=0.3'te torpidoyu göstersin.
   - "hayır" kelimesinde Arhipov'un kolu kalksın ve punch eklensin.

   Süreyi 2. maddedeki kısaltmayla 35 sn'nin altına indir. Ek not: sahne 8 altyazısında "evet  dedi." kelimeleri arasında fazla boşluk var, yazar kontrol etsin.

### 01-vasili-arhipov — tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 7 | 8 | 8 | 9 | 8 | 8 |

lint: OK (476 karakter, lint sayımı). Preview istenildiği gibi yeniden çalıştırılmadı (sheet/cover 04:05, JSON 04:05:24'ten sonra üretilmiş, güncel). **Tüm kriterler ≥ 7: geçti.**
Tur 2'den çözülenler: kapak artık sahne 8'den (✓ ✓ ✗ + "Hayır!" + büyük şok Kaşif); olayın tamamını tek karede anlatıyor, Kaşif'in yüzü net. Sahne 5 ("Ama siz o karanlıkta bunu nereden bilecektiniz?") ve sahne 6 ("savaşın başladığını sandı") düzgün. Süre ~34 sn. Başlık ile sahne arasındaki ~180 px soluk bant motorun ortak kapak gradyanından geliyor; puan kesilmedi, ama kapağın tek zayıf yeri bu (yönetmen notu: engine.js kapak gradyanı ileride kısaltılmalı).

Kalan 3 sorun:
1. **Sahne 9 kapanışı telgraf diline döndü.** "Yani dünyayı ordu değil, tek kelime kurtardı." cümlesinde iki "bir" düşmüş, kulağa kesik geliyor. Şöyle olsun: "Yani dünyayı bir ordu değil, tek bir kelime kurtardı." (+8 karakter, ~484, süre sınırı içinde).
2. **Kapakta ve Shorts'un açılış karesinde "Hayır!" balonu ile alarm lambası gradyan bandına düşüyor.** Balon yazısı soluk pembe görünüyor, kırmızı vurgu kayboluyor. Sahne 8'de balonu `y` 0.235 → ~0.30'a indir (gradyanın altına), lambanın kırmızı halesi de görünür kalsın. Sahne içi konumu değiştiği için kapak yeniden üretilip bakılmalı.
3. **Sahne 4 (2. kare): şok halkaları sol üstteki "Düşün Bakalım" markası ve "Uyarı bombaları" kicker'ının üstünden geçiyor.** Halka yarıçapını sınırla ya da `charges` derinliğini 0.38'e indir. Ayrıca sahne 0'ın (kapak bekleme bloğu) iki kontak karesi birebir aynı; motion bu turda ölçülmedi. Push'tan önce `preview` çıktısında sahne 0 motion ≥ 1.5 olduğu doğrulanmalı.


### 02-ilk-rontgen — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 | 8 | 7 | 6 | 7 | 6 | 7 | 8 | 8 | 8 | 6 |

Lint: OK (SEO 100). Karakter: 491. 10 sahne, 5 tip (xr_hand ×3, xr_lab ×3, stage ×2, timeline, title).
Senaryo 7'nin altında: REVIEW.md'ye göre anlatım baştan yazılmalı (sadece yamalanmamalı).
**KAPAK YENİLENMELİ (6 < 8).**

1. **Senaryo (6): YouTuber anlatıcı yok, metin bir kronik gibi akıyor.** Metnin hiçbir yerinde "siz" diye hitap yok (CLAUDE.md'deki Shorts kuralı ve BRAND §6.0–6.3). Kancadan sonra köprü kurulmadan doğrudan "Würzburg'da Wilhelm Röntgen…" cümlesine atlanıyor. Sahne 4–7 arası "yatıp kalktı / X dedi / koydu / belirdi" diye olay sayıyor. Sahne 7'deki "Plakada kemikleri ve yüzüğü apaçık belirdi." cümlesi ekranda görüneni tarif ediyor, yani altyazı cümlesi. Hikâyenin "neden?" sorusu da cevapsız kalıyor: ışının neden "X" diye adlandırıldığı (bilinmeyeni gösterdiği için) ve kemiklerin neden göründüğü (ışın eti geçiyor, kemik ile metal yüzük ışını tutuyor) anlatılmıyor. "Bilinmeyen" bilgisi sadece ekrandaki notta kalıyor.
   → Düzeltme: 2. cümle bir köprü olsun, ör. "Ve bunu ona kocası gösterdi. Gelin, nasıl olduğunu anlatayım." Sahne 5 şöyle olsun: "Ne olduğunu bilmediği için de bu ışına matematikteki bilinmeyen gibi 'X' dedi." Sahne 7'de tarif yerine nedeni anlatın: "Işın eti geçmiş, ama kemikle altın yüzüğe takılmıştı." Bütçe 400–500 karakter içinde kalmalı.

2. **Kapak (6) — yenilenmeli.** cover.jpg'de iki Kaşif var: kapağın eklediği büyük Kaşif'in arkasında sahne 0'ın kendi Kaşif'i (`cast` x 0.88) sağ kenardan taşıyor. Büyük Kaşif'in şapkası ve gövdesi sağ kenarda kesik, `x: 850` fazla sağda. Kapak yazısı "BU KADIN" diyor ama karede bir kadın yok, sadece bir el var. Alt dörtte birlik bölüm (y ≈ 1480–1900) boş kâğıt.
   → Düzeltme: sahne 0'daki `cast` Kaşif'ini kapaktan çıkarın; seçilen sahnede Kaşif zaten varsa `cover.kasif: false` yapıp sahnedeki Kaşif'i büyütün, ya da sahne 0 Kaşif'ini plakanın soluna/altına alın. Büyük Kaşif'i `x ≈ 760`, `y ≈ 1700`, `scale 1.2` civarına getirip yüzü tam görünecek şekilde, ışıklı plakanın önünde kollarını yanaklarına koymuş şok pozunda kurun. Daha iyi seçenek: sahne 8'in `t` anını kapak yapın. Orada topuzlu Anna şokla geri sıçrıyor ve iğnelenmiş röntgen baskısı görünüyor, böylece "BU KADIN" yazısının bir yüzü olur. En az 3 aday üretip yan yana karşılaştırın.

3. **Görsel=anlatım ve Kaşif kadrajı (6/6): sahne 1–2'deki "kartonla sarılmış tüp" bir bilgisayar monitörüne benziyor, Kaşif ise birçok sahnede kenardan taşıyor.** frame_03'te sehpa üstünde siyah dikdörtgen bir kutu ile yanında ayaklı beyaz bir çerçeve var; ikisi birlikte 2026 masaüstü bilgisayar ve monitör gibi okunuyor, 1895 laboratuvarı gibi değil. Kaşif'in kenardan taşıdığı sahneler: sahne 0'da (frame_01) Kaşif `x 0.88` ile sağ kenarda yarım ve yüzü kesik; sahne 2'de (frame_05) Röntgen solda (x 0.12), Kaşif sağda (x 0.89) kesik; sahne 6'da Kaşif `scale 0.52` ile en sağda minicik ve kesik; sahne 8'de (frame_16–17) Anna `x 0.13` ile sol kenarda, Kaşif sağ kenarda kesik. Sahne 9'da "PATENT YOK" tabelası Röntgen'in yüzünü kapatıyor ve yazısı 360 px'de zor okunuyor. Sahne 3'ün `visual` alanı "Röntgen elinde siyah kartonu tutar" diyor ama karton görünmüyor; karede boş kâğıt üstünde iki figür var.
   → Düzeltme: sahne 1–2'de kartonu tüpün biçimini izleyen buruşuk, düzensiz bir siyah kılıf olarak çizin, ayağı (monitör ayağı) kaldırın. Ekranı da ayaksız, eğik dayanmış küçük bir levha olarak çizip üstüne el yazısıyla "ekran" yazın. Tüm `cast` x değerlerini 0.15–0.85 arasında tutun, sahne 6'da Kaşif scale ≥ 0.62 olsun. Sahne 9'da tabelayı göğüs hizasına indirin (yüz açık kalsın) ve metni büyütün. Sahne 3'te Röntgen'e gerçekten siyah karton tutturun ya da sahneyi ışının kartonu delip geçtiğini gösteren bir `board`/özel kareyle değiştirin.

Diğer notlar:
- Sahne 0'daki "1895" el yazısı plakanın sağ üst köşesine biniyor; y'yi 0.12'ye çekin.
- Sahne 4'teki timeline'da yalnız 2 madde var, kare çoğunlukla boş; "28 Aralık · makale" maddesini ekleyin.
- Doğruluk kontrolü: 8 Kasım 1895'te siyah kartonla örtülü tüp ve parlayan baryum platinosiyanür ekranı; 22 Aralık 1895'te Anna Bertha'nın el röntgeni; "Ölümümü gördüm" sözü "anlatılana göre" diye doğru temkinle verilmiş; patent alınmadığı doğru. Kancadaki "Bu kadın kendi ölümünü gördü." cümlesi mecaz olarak kabul edilebilir.
- Preview motion ölçümü çıktıda kayıtlı değildi. Hareket puanı karelerdeki değişime göre verildi; sahne 3 ve 9'daki duran figürlerin `STATIC?` olup olmadığına yazar tekrar baksın.

### 02-ilk-rontgen — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 7 | 7 | 7 | 8 | 7 | 8 | 7 |

Lint: OK. Karakter: 487. Önizleme JSON'dan sonra üretilmiş, güncel.
Tur 1 maddeleri:
- Senaryo: çözüldü. "Gelin, anlatayım." köprüsü var, "siz" hitabı var, X'in adının nedeni ve "et geçti, kemik/yüzük tuttu" açıklaması eklendi. Devrik cümle yok.
- Monitör görünümü: çözüldü. Siyah kılıf ve ayaksız "ekran" levhası artık bilgisayar gibi okunmuyor.
- Kenardan taşma: çoğunlukla çözüldü (sahne 2, 6, 8). PATENT YOK tabelası artık yüzü kapatmıyor ve okunuyor. Timeline'a 28 Aralık eklenmiş.
- Kapak: çift Kaşif sorunu çözüldü, kapak Anna ile şaşkın Kaşif'e taşındı. Ancak kapak hâlâ 8 değil.
**KAPAK YENİLENMELİ (7 < 8)**, küçük bir düzeltme yeterli.

1. **Senaryo/Doğruluk: sahne 3 dolgu, sahne 1'de yanlış terim var.**
   - Sahne 3'teki "Siz olsanız ne yapardınız?" cümlesi ne bilgi ne gerilim ekliyor; kuralın yasakladığı dolgu cümle bu. Görseli de boş kâğıtta iki figür ve bir soru.
   - Sahne 1'deki "deney tüpü" Türkçede test tüpü demek; Röntgen'in kullandığı şey vakumlu katot ışını tüpüydü (Hittorf–Crookes / Lenard tüpü).
   → Düzeltme:
   - Sahne 3'ü bilgi ve gerilim taşıyan bir cümleyle değiştirin, ör. "Ekranın önüne kâğıt koydu, tahta koydu; ışık hepsini geçti." Görseli bu cümleyi gösteren bir `board` olsun (kâğıt ✓, tahta ✓, kurşun ✗) ya da Röntgen ekranın önüne levhalar tutsun.
   - Sahne 1: "katot tüpünü" ya da "cam tüpünü" deyin.
   - Bütçe 500 karakteri aşmamalı.

2. **Kapak + SEO (7): kapak yenilenmeli.**
   - Röntgen baskısının üst kısmı (parmak uçları ve üst çerçeve) yazı altındaki geçiş gradyanında kayboluyor; baskı soluk ve yarım görünüyor. En dramatik nesne kapağın en zayıf yeri.
   - y ≈ 1580–1920 arası boş kâğıt.
   - Yüzler okunuyor, iki şok ifadesi iyi, yazı net.
   → Düzeltme:
   - Kapakta sahne 8'i büyütün ya da aşağı kaydırın, ya da bir `cam` (zoom ≈ 1.15, odak baskının ortası) verin. Baskının tamamı yazının altında net kalsın, figürler alttaki boşluğu doldursun.
   - Ayrıca `t` değerini kırmızı halkanın çizildiği ana alın: halka kapakta görünmüyor, oysa sahne 0'da var ve kapakta güçlü bir odak olur.
   - 3 aday üretip karşılaştırın.

3. **Kompozisyon + Kaşif (7): sahne 0 ve sahne 6'da Kaşif zayıf.**
   - Sahne 0 (frame_01): plaka kadrajın %75'ini kaplıyor. Kaşif (x 0.82, scale 0.62) sağ alt köşeye sıkışmış minik bir figür, ilk saniyelerdeki tepkisi görünmüyor.
   - Sahne 6 (frame_12): Kaşif'in eli yüzünü kapatıyor ("look" pozu kafa hizasında), yüz okunmuyor.
   → Düzeltme:
   - Sahne 0'da plakayı daraltıp sola alın (`cx ≈ 0.38`, `w ≈ 600`), Kaşif'i `x ≈ 0.84`, `scale ≈ 0.8` yapın.
   - Sahne 6'da Kaşif'e yüzü açık kalan bir poz verin (`point` dir down ya da `idle` → `shock`).
   - Sahne 0'daki "1895" artık "anlatayım" cue'suna bağlı, oysa yıl sahne 1'de söyleniyor. Etiketi sahne 1'deki "1895" kelimesine taşıyın ya da sahne 0'dan çıkarın.

Not: Hareket ölçümü (`motion`) çıktıda yok; puan karelere göre verildi.

### 02-ilk-rontgen — tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 7 | 7 | 7 | 8 | 8 | 8 | 8 |

Lint: OK. Karakter: 489. Preview JSON'dan sonra üretilmiş (güncel). **Tüm kriterler ≥ 7: GEÇTİ.** Kapak 8: yenilenmesi gerekmiyor.
Tur 2 maddeleri:
- Sahne 3'teki dolgu soru: çözüldü. Yerine timeline ("Haftalarca denedi.") ve kitap/tahta/kurşun board'u geldi. Röntgen'in 1895 makalesindeki "yaklaşık 1000 sayfalık ciltli kitap" ve kurşunun ışını neredeyse tamamen tutması ile uyumlu.
- "Katot tüpü" terimi düzeltilmiş.
- Kapak: düzeltilmiş. Baskı tam görünüyor, yüzük kırmızı halkada, Anna ve Kaşif büyük, yüzleri şokta ve okunuyor.
- Sahne 0'da "1895" etiketi sahne 1'e taşınmış.

Kalan 3 sorun (push'u engellemez; vakit varsa yapılsın):
1. **Sahne 4 (board, frame_08–09) yarı boş ve Kaşif yok.** Kutunun alt yaklaşık %55'i boş kâğıt. Maddeler küçük (Kitap/Tahta/Kurşun) ve "bin sayfalık" ayrıntısı görünmüyor; ışının içinden geçtiği görülmüyor.
   → Düzeltme: maddeleri büyütüp kutuyu dikeyde onlara göre daraltın. Altına Kaşif'i ekleyin (`params.kasif`, "kurşunda" cue'sunda `shock`). Ya da sağdan sola giden altın bir ışın çizgisi ekleyin: kalın kitap ve tahta levhadan geçsin, kurşun levhada dursun.
2. **Sahne 1'deki kırmızı "1895" etiketi (frame_02–03) raftaki şişelerin üstüne biniyor**, sağ üstte şişelerle karışıyor. → Etiketi `y ≈ 0.27`'ye, rafın altındaki boşluğa alın ya da etiketi kaldırın: kicker zaten "8 Kasım 1895" diyor.
3. **Kaşif kenara dayanıyor.** Kapakta şapkasının sağ kenarı kadrajın sonuna değiyor (x ≈ 1080). Sahne 0'da (frame_01) Kaşif hâlâ sağ kenara sıkışık. → Kapakta sahne 8 Kaşif'ini `x` ≈ 0.84'e çekin. Sahne 0'da Kaşif'i `x ≤ 0.84`, `scale ≥ 0.75` yapın.


### 03-roma-son-imparator — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 7 | 7 | 8 | 7 | 8 | 8 | 7 | 8 | 8 |
1. Sahne 9 + sahne 1 (doğruluk): "Yani koca Roma ... bitti" yanlış genelleme; 476'da biten Batı Roma, Doğu Roma 1453'e kadar sürdü (ilk cümle de "Batı Roma" diyor, son cümle bununla çelişiyor). Sahne 1 zaman çizelgesi "MÖ 753 · Romulus Roma'yı kurar" efsaneyi gerçek gibi sunuyor. Düzeltme: son cümle "Yani Batı Roma bir savaşla değil, bir çocuğun emekliliğiyle bitti."; sahne 1 metni "Roma'nın efsanevi kurucusunun adı!", madde "MÖ 753 · efsanevi kurucu Romulus".
2. Sahne 4 (stage, 476 paralı askerler): kadraj kalabalık ve okunmuyor; Orestes sol kenarda sütunun arkasında yarı kesik, "HAYIR!" tabelası Kaşif ile askerler arasında kaldığı için Kaşif'in tabelası gibi okunuyor; miğferler kırmızı tepeli bere gibi görünüyor. Düzeltme: sütunu kaldır ya da x 0.02'ye çek, Orestes x 0.18 scale 1.0, Kaşif x 0.42 scale 0.7, asker3'ü çıkar (iki asker yeter), "HAYIR!" tabelası Orestes'in başının üstünde.
3. Sahne 1 (timeline), 3 (title), 8 (map): ekranın alt yarısı (y ≈ 900–1150) boş, yazılar küçük ("Romulus Roma'yı kurar", "yine Romulus!" el yazısı 44 px altında görünüyor); haritada sağda "Karaden(iz)" kenardan kesik, "Konstantinopolis" etiketi rotanın ve kıyının üstüne biniyor, ilk karede "Ravenna" pusulaya yapışık; harita sahnesinde Kaşif yok. Düzeltme: timeline maddelerini büyüt, Kaşif'i scale 0.9 ve y 0.7 ile boşluğu doldur; haritada focus [22,40] zoom 1.3, Konstantinopolis dy +50 (altına), pusulayı "bl"ye al, Kaşif'i haritanın altına rotayı işaret eder halde ekle.

Kapak 8: yazı ve Kaşif yüzü güçlü, "çocuktu" vurgusu doğru, ilk cümleyle aynı fikir. Zayıf yanı: tahttaki çocuk küçük ve alt %25 boş zemin; geçme sınırında, yenilenmesi zorunlu değil (çocuk/taht scale 1.2 ve focus aşağı alınırsa 9 olur).
Lint: OK.

### 03-roma-son-imparator — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 8 | 8 | 7 | 8 | 8 | 9 | 9 | 8 |
Tur 1 maddeleri: (1) doğruluk ÇÖZÜLDÜ (son cümle "Batı Roma", "efsanevi kurucu"); (2) sahne 4 KISMEN çözüldü (Orestes görünür, "HAYIR!" onun üstünde, asker3 çıktı, askerlere sivri miğfer); (3) KISMEN çözüldü (Konstantinopolis etiketi rotadan ayrıldı, pusula sol altta, haritaya Kaşif eklendi; ama "Karadeniz" hâlâ kesik). Lint: OK.
1. Sahne 8 (harita): sağdaki "Karadeniz" yazısı hâlâ çerçeveden taşıp kesiliyor ("Karadeni…"); Kaşif küçük (scale 0.8) ve harita çerçevesinin sağ alt kenarına yarısı binmiş, ne haritanın içinde ne dışında. Düzeltme: Karadeniz x 27.5 (ya da anchor "end"), Kaşif'i haritanın altına (y ≈ 0.72, x 0.75, scale 1.0) al, rotayı işaret etsin.
2. Sahne 4 (stage): Kaşif Orestes ile asker1 arasında sıkışmış; "TOPRAK!" tabelası Kaşif'in yüzünün yanına biniyor, ikinci karede Kaşif'in kafası Orestes'in koluna değiyor. Orestes'in miğferi hâlâ kırmızı tepeli bere gibi. Düzeltme: Kaşif x 0.38 scale 0.65, asker1 to 0.72, asker2 to 0.9; Orestes'e de "helmet_byz" ya da daha belirgin Roma miğferi.
3. Kapak: Kaşif büyüdü (scale 1.6) ama şapkası sağ kenardan kesiliyor; tahttaki çocuk hâlâ küçük ve alt ~%25 boş zemin. Düzeltme: kasif x 780, tahtı/çocuğu kapak için 1.2 ölçeğe büyüt ya da odak noktasını aşağı al; çocuğun endişeli yüzü kapakta ikinci odak olmalı. (Kapak 8 — yenileme zorunlu değil.)
Sonuç: tüm kriterler ≥ 7, geçti.



### 04-preveze-1538 — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 7 | 7 | 6 | 7 | 8 | 8 | 9 | 6 |

Lint: OK (hata yok). Kapak + SEO 6 < 8 → **kapak yenilenmeli.**

1. **Kapak (cover, sahne 0 t=1.2):** Yazı ile görsel arasında ~300 px boş kâğıt bandı var (y≈560–850); vurgulanan kelime BARBAROS ama kapakta Barbaros yok; "alev alan gemi" kırmızı/sarı sivri koniler olarak çiziliyor, ateş gibi değil boya kalemi gibi okunuyor; "dağıttı" anı (gemilerin dağılması) görünmüyor, sadece duran gemiler var. Düzeltme: sahneyi ve Kaşif'i yukarı al (boşluğu kapat), `t`'yi 'dağıttı' cue'sundan sonraki dağılma anına kaydır ya da sahne 1'deki sarıklı, kızıl sakallı Barbaros'u (büyük, işaret ederken) ön plana koy; alevleri dalgalı mürekkep alev + duman olarak çiz. En az 3 aday üretip karşılaştır (ör. "BARBAROS" yerine vurgu "RÜZGÂRI" + metin "RÜZGÂRLA DONANMA YENDİ" denenebilir).
2. **Senaryo kopukluğu + gerilim eksikliği (sahne 2 ve 8):** Sahne 8 "Komutanlar zaten anlaşamıyordu." savaşın ortasına bağlantısız düşüyor; hangi komutanlar olduğu söylenmiyor ve eylem zincirini (rüzgâr düştü → kadırgalar geldi → Doria çekildi) kesiyor. Ayrıca sahne 2'de güç farkı yok: "yüzlerce gemi" karşısında Barbaros'un yaklaşık 120 kadırgası söylenmiyor, gerilim kurulmuyor. Düzeltme: sahne 2'ye "Barbaros'un elindeyse bunun yarısı bile yoktu." ekle; sahne 8'i nedene bağla: "Üstelik Doria ile Venedikliler birbirine hiç güvenmiyordu; kimse riske girmek istemedi." Sahne 6'daki "Ve bakın," ekrana gönderme yapan dolgu; "Ve tam o anda rüzgâr düştü!" yap.
3. **Kompozisyon: boş alt yarılar ve kesik kadırgalar (sahne 1, 7, 8, 10):** Güverte sahnelerinde (1 ve 8) karenin alt %40'ı sadece tahta çizgileri; sahne 10'un ilk karesinde ekran neredeyse boş ("Denizi" + Kaşif). Sahne 7'de, hikâyenin dönüm noktası olan kürekli kadırgalar sol kenardan kesik ve küçük kalıyor, 'geldi'deki top dumanı minicik; "kürek!" oku boşluğu gösteriyor. Düzeltme: güverte sahnelerinde `deck`'i 0.72'ye indirip karakterleri büyüt (scale ~1.0) ya da kamerayı yakınlaştır; sahne 7'de kadırgaların `to` değerini 0.25/0.42'ye çek, ölçeği büyüt, kürekleri kadrajın ortasında göster, "kürek!" okunu küreklere hedefle. Ek: sahne 5'te kırmızı filo "Arta Körfezi" etiketinin üstüne biniyor; etiketi aşağı kaydır.

Doğruluk notu: 28 Eylül 1538, Doria komutası, Arta Körfezi'nin dar ağzında bekleme, rüzgârın düşmesiyle yelkenlilerin (Condulmer'in kalyonu) kadırgalar karşısında çaresiz kalması ve Doria'nın geceleyin çekilmesi bilinen anlatımla uyumlu. "Dağıttı" biraz abartılı (müttefik kaybı ~10–13 gemi; donanma imha edilmedi, geri çekildi); kanca olarak kabul edilebilir ama son cümle bunu dengeliyor.

### 04-preveze-1538 — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 7 | 8 | 8 | 9 | 8 |

Lint: OK. Tüm kriterler ≥ 7 → geçti. Kapak 8 (yenileme gerekmez).

Tur 1 maddeleri:
- Kapak: ÇÖZÜLDÜ. Sarıklı, kızıl sakallı Barbaros kadırgada öfkeli ve okunur; alev artık gerçek alev + duman; Kaşif yüzü büyük ve şokta. Yazı ile sahne arası boşluk ~300 px'ten ~130 px'e indi.
- Senaryo: ÇÖZÜLDÜ. "çok daha büyüktü" güç farkını veriyor; "Ve tam o anda" bağlacı geldi; sahne 8 artık "Doria ile Venedikliler de birbirine güvenmiyordu." ile hangi komutanlar olduğunu söylüyor ve gece çekilmeye gerekçe oluyor.
- Kompozisyon: KISMEN. Sahne 5 etiket çakışması giderildi; sahne 1/8 boş alt yarı ve sahne 7 kesik kadırgalar duruyor (aşağıda).

1. **Sahne 1 ve 8 (pv_deck): alt %40 hâlâ sadece güverte tahtası.** Karakterler y≈0.6'da, altyazı şeridinin altı boş perspektif çizgileri. Düzeltme: `zoom` ~1.15 + `focus` karakterlere, ya da karakterleri scale 0.95–1.0 ile büyütüp `deck`'i aşağı (≈0.7) indir; boş zemine kadırga küreği/top/halat gibi bir ön plan nesnesi koy.
2. **Sahne 7 (dönüm noktası): Osmanlı kadırgaları hâlâ sol kenardan kesik.** İlk karede sadece direk/kürek uçları görünüyor, 'geldi'de bile gövdenin yarısı kadraj dışında; izleyici "kürekle gelen kadırga"yı tam görmüyor. Düzeltme: büyük kadırganın `to` değerini 0.12/0.3'ten ≈0.28/0.45'e çek, başlangıç `x`'ini -0.05'e al; kadırgalar 'kadırgalar' cue'sunda kadrajın içine tam girsin.
3. **Sahne 10 (title) açılış karesi boş.** İlk ~1 sn ekranda yalnızca "Donanma" kelimesi ve küçük, duran Kaşif var; kartın alt yarısı boş. Düzeltme: Kaşif'i büyüt (scale ~0.85) ve girişte `spring()` ile işaret pozuna sok, ya da arka plana soluk kadırga silueti/hilal flama ekle; "28 Eylül 1538" notu kaldırıldığı için tarihi el yazısı notla geri koymak da kartı doldurur.



### 05-lizbon-depremi-1755 — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 6 | 7 | 6 | 7 | 7 | 7 | 9 | 7 |

lint: OK (SEO 100). 7.347 karakter (bütçe içinde). Geçmedi: Görsel=anlatım 6, Kompozisyon+Kaşif 6. **Kapak 7: kapak yenilenmeli.**

1. **Kapak (7, yenilenmeli):** Sol yarının yaklaşık %40'ı boş kâğıt. Yazı sadece 2 satır ve orta boyda ("BİR SABAH / ÜÇ FELAKET"). Kaşif'in gövdesi alttan kesik, dalga sağ üçte biri kaplıyor, deprem (yarık, çöken bina) hiç görünmüyor. "Bir sabah üç felaket" de olayı adlandırmayan, genel bir ifade. → 3 satır, yazıyı sol yarıyı dolduracak kadar büyüt: `["Lizbon", "bir sabahta", "3 kez yıkıldı"]`, vurgu `"3"` (ya da `"yıkıldı"`). Kaşif'i `scale` ≈ 1.8 yap, `y`'yi yukarı al ki yüzü ve kolları kadraja girsin, şok pozu korunsun. Sahne 0'da yarıkların ve çöken binaların göründüğü daha geç bir `t` seç. 3 aday üretip karşılaştır.
2. **Kaşif kenarda, kesik ya da binanın içinde (Kompozisyon 6):** Kilise sahnelerinde (5, 9, 10, 30, 31, 57) Kaşif ~80 px boyunda, sağ kenarda yarısı kadraj dışında ve sıraların arkasında kalıyor. 20, 21, 24 ve 74'te gövdesi evin cephesinin içinden geçiyor (evin içinde duruyormuş gibi görünüyor). 32, 33, 52 ve 54'te sol alt köşede, yarısı ekran dışında. 6'da kral ağacın arkasında kalıyor. → Kilisede Kaşif'i `x` ≈ 1600, ölçeği ≥ 1.3 ile sıraların önüne al. Liman sahnelerinde Kaşif'i rıhtıma, evlerin önüne yerleştir (ev katmanının üstünde çiz). 32, 33, 52 ve 54'te `x` ≥ 200 olsun ve Kaşif tam boy görünsün. 6'da ağacı sağ kenara kaydır.
3. **Görsel anlatımı karşılamıyor (Görsel=anlatım 6):**
   - Sahne 25 "Meydana sığınan kalabalık kaçacak yer bulamadı": ekranda Kaşif dürbünle sakin bir yelkenliye bakıyor, kalabalık ve dalga yok. → Rıhtımda sıkışmış 5–6 figür, arkalarından gelen dalga tepesi ve 'parçalandı'da yan yatan gemi gösterilmeli (lz_sea'nin dalga hâli + kalabalık).
   - Sahne 72 "Carmo'nun çatısız kemerleri": ekranda dört bağımsız sütun var, kemer yok. → Carmo'yu tanıtan sivri gotik kemerler sütunların üstüne çizilmeli.
   - Sahne 17 "Binlerce kişi... meydana koştu": ekranda sadece 2 figür yürüyor. → Kalabalık sıra halinde 8–12 figür ve koşma yürüyüşü.
   - Sahne 54 "su kütlesini yerinden oynattı": ikinci karede dalga yerine deniz tabanının içinden geçen daireler görünüyor. → Su yüzeyinde tümsek ve iki dalga olmalı; halkalar kabuğun içine taşmamalı.

**Ek liste:**
- Doğruluk (53): "sekizin üzerindeydi, belki dokuza yakındı" denmiş, ama tahminler 7,7 ile 9,0 arasında (Wikipedia). → "bugünkü tahminlere göre yaklaşık sekiz ile dokuz arasındaydı" yaz; kartı "≈ 8–9" yap.
- Doğruluk (29): "Peki su çekilince ne oldu? Şehir bu kez yanmaya başladı." cümlesi yangının dalgadan sonra başladığını ima ediyor, oysa mumlar sarsıntıda devrildi. → "Ama sarsıntı başka bir şeyi daha başlatmıştı: ateşi."
- Doğruluk (65): "Mimarlar dört plan sundu. Kral en cesur olanı seçti." Wikipedia'ya göre dört seçeneği başmühendis Manuel da Maia sundu, seçimi kral ve bakanı (Pombal) birlikte yaptı. → "Başmühendis Manuel da Maia dört seçenek sundu. Kral ve Pombal en cesurunu seçti: aşağı şehri yıkıp baştan kurmak."
- Okunabilirlik: 66 ve 67'de kicker ("Baixa ızgara plan", "Gaiola ahşap kafes") pafta ve kafes çerçevesinin üstüne biniyor. Kilise sahnelerinde üst kiriş çizgisi "Düşün Bakalım" marka yazısının içinden geçiyor. → Pafta ve kafesi y ≥ 170'ten başlat, kilise kirişini y ≥ 140'a indir.
- Tempo/derinlik: 11 `title` + 8 `chapter` = 75 sahnenin 19'u düz yazı kartı ve hepsi aynı düzende (sağda küçük, ayakta duran Kaşif). → 13, 35 ve 53'ten en az ikisini görsele çevir: 13 → lz_city'de açılan yarık, 35 → lz_fire'da gün sayacı (1…5), 53 → lz_fault'ta ölçek çubuğu.
- Sahne 45: ekmek sepeti kalkan ya da tekerlek gibi görünüyor, askerlerde visual'de yazan mızrak yok.
- Sahne 68: "yürüdü, ve" → virgülü sil.
- Hareket değerleri (preview motion) bu turda ölçülmedi; kontak sayfasındaki kare çiftlerinde sahnelerin çoğu değişiyor. Title ve chapter kartlarında hareket sadece yazının girişinden ibaret.

### 05-lizbon-depremi-1755 — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 8 | 7 | 7 | 7 | 9 | 9 | 8 |

lint: OK. preview: 75 sahne, yaklaşık 517 sn (8,6 dk), 7.469 karakter, STATIC? yok, en düşük motion 4,9 (sahne 23).
Not: out/preview'deki sheet.png bir `--times` çalıştırmasıyla 2 karelik sayfaya dönmüştü. Tam preview'i yeniden çalıştırdım; değerlendirme bu yeni sayfaya göre.

**Tur 1 maddeleri:**
- **Kapak çözüldü (8):** "LİZBON / 3 KEZ / YIKILDI" telefonda bile okunuyor. Kaşif büyük ve yüzü şok ifadesiyle net. Kare dolu: dalga ve yanan şehir aynı anda görünüyor. Sol yazı alanının düzeni motorun sabit kuralı olduğu için puandan düşülmedi. Kapak yenilenmesine gerek yok.
- **Kaşif kısmen çözüldü:** Kilise sahnelerinde (5, 9, 10, 30, 31, 57) Kaşif artık büyük. Sahne 6'daki ağaç sorunu ve sahne 25 düzeldi.
- **Görsel=anlatım çözüldü:** 25'te kalabalık dalganın önünde. 54'te su tümseği ve "dalga" notu var. 17'de on kişilik kalabalık var. 13 ve 35 artık sahne (yarık, gün sayacı). 45'teki tabela çalışıyor.
- **Doğruluk çözüldü:** 29, 53 ve 65'teki üç cümle düzeltildi.
- **Okunabilirlik çözülmedi:** Kicker çakışmaları hâlâ duruyor.

**En büyük 3 sorun (geçiyor ama kalan):**
1. **Yangın ve fay sahnelerinde Kaşif küçük ve kesik:** 32, 33, 35, 38, 52 ve 54'te Kaşif yaklaşık 80 px boyunda, sol alt köşede, bacakları ya da yarısı kadraj dışında. 20, 21 ve 74'te hâlâ evin cephesine biniyor. → Bu sahnelerde Kaşif'i x ≥ 220 ve scale ≥ 1.3 yap, ayakları zemin çizgisinin üstünde kalsın. Liman sahnelerinde onu rıhtımın önüne, evlerin dışına al.
2. **Sol üst marka ve kicker üstüne çizim biniyor:** Kilise sahnelerinde (5, 9, 10, 12, 30, 31, 57) üst kiriş çizgisi "Düşün Bakalım" ve kicker yazısının ("Kiliseler", "Mumlar", "Zamanlama") içinden geçiyor. 66 ve 67'de pafta ve kafes çerçevesi kicker'ın üstüne biniyor. 72'de Carmo kemerleri "Bugün Lizbon" kicker'ını ve marka yazısını kesiyor. → Bu sahnelerde üst sınır y ≥ 170 olsun; kiriş, pafta, kafes ve kemer bu çizginin altından başlasın.
3. **Sahne 72 (Carmo) zayıf:** Kemerler kadrajın üstünden taşan ince tek çizgiler. Taş dokusu, kırık kemer uçları ve gotik sivrilik yok, bu yüzden "yıkıntı" okunmuyor. Kaşif de küçük. → Kalın taş sütunlar çiz, kırık ve yarım kalmış 2–3 sivri kemer kadrajın içinde kalsın, Kaşif'i büyüt (scale ≥ 1.3).

**Ek:**
- Sahne 65: "aşağı şehir" ifadesi iki cümlede üst üste geçiyor ("aşağı şehir için… aşağı şehri yıkıp…"). İkincisi "her şeyi yıkıp baştan kurmak" olabilir.
- Sahne 68: askerler ve Kaşif küçük, Kaşif bir askerin üstüne biniyor.


## Not

- 01 tur 3 sonrası yönetmen düzeltmesi: kapanış "Yani dünyayı bir ordu değil, tek bir kelime kurtardı." (eleştirmen önerisi).
- Telifsiz gerçek fotoğraflar (Wikimedia) bu ortamdan indirilemedi; tüm görseller kodla çizildi.

---

# Prodüksiyon — 2026-10-23 (Stickstory)

Plan (`tools/plan.py --channel ag`): 2 Shorts (uzun video günü değil; sıradaki uzun 24 Ekim). ElevenLabs: bu ay 60.533 / 231.442 karakter (uyarı yok).
Görseller sadece kodla. Konular iki kanalın geçmişinde yok; bugünkü Düşün Bakalım konularıyla (Arhipov, röntgen, Romulus Augustulus, Preveze, Lizbon) çakışmıyor.

| Dosya | Konu | Kategori | Dönem | Yayın |
|---|---|---|---|---|
| ag-01-anglo-zanzibar-war | Anglo-Zanzibar Savaşı, 27 Ağustos 1896 | empires and battles | 19. yy sonu, Doğu Afrika | 23 Ekim 13:00 |
| ag-02-cadaver-synod | Kadavra Sinodu, Ocak 897, Roma | history's strangest moments | 9. yy, Orta Çağ Roma | 23 Ekim 17:30 |

## ag-01-anglo-zanzibar-war (Shorts, 13:00) — empires and battles

- **Hissedilen:** "Tarihin en kısa savaşı bir kibir yüzünden çıktı ve bir kahvaltıdan bile kısa sürdü."
- **Kanca + kapak fikri:** "This war lasted less than an hour." ↔ kapak `A WAR THAT LASTED / 38 MINUTES` (vurgu `38`; kaynaklar 38–45 dk der → "about 40 minutes" ya da "less than an hour" güvenli). Kapak karesi: alevler içindeki saray, körfezde gemiler, büyük şok Kaşif, cep saati.
- **Doğrulanacak bilgiler:** 25 Ağustos 1896 İngiliz yanlısı Sultan Hamad bin Thuwaini öldü; yeğeni/kuzeni Khalid bin Barghash İngiliz onayı olmadan sarayı ele geçirdi (1886 antlaşmasına göre İngiliz onayı gerekiyordu). İngilizler 27 Ağustos sabah 09:00'a kadar ültimatom verdi; Khalid sarayda ~2.800 adamla barikat kurdu (doğrula). 09:00'da süre doldu, 09:02 civarı bombardıman başladı; tek Zanzibar gemisi HHS Glasgow batırıldı; ~09:40 bayrak indi. Zanzibar tarafında ~500 ölü/yaralı, İngiliz tarafında 1 ağır yaralı denizci. Khalid Alman konsolosluğuna sığındı. Komutan Amiral Harry Rawson; yeni sultan Hamud bin Mohammed. Rivayet: İngilizler bombardımanın masrafını Zanzibar'a ödettirdi (doğrula, "reportedly"). Sayılarda "about".
- **Görsel omurga:** `map` (Doğu Afrika kıyısı, Zanzibar adası, saray ve körfezdeki gemiler), `stage` (Kaşif + Khalid `turban`, İngiliz subay), `timeline` (25 Ağustos → 27 Ağustos 09:00 → 09:02 → 09:40), yeni tip öneri **`zw_palace`** (saray cephesi, körfezden ateşlenen gemiler, sayaç/saat, düşen bayrak), `board`/`title` ("38 MINUTES").
- **Kapanış örneği (yazar kendi cümlesini kursun):** "So the shortest war in history was over before most people finished breakfast."

## ag-02-cadaver-synod (Shorts, 17:30) — history's strangest moments

- **Hissedilen:** "Bir papa ölmüş bir papayı mahkemeye çıkardı ve bu delilik onu da yaktı."
- **Kanca + kapak fikri:** "In 897, a pope put a corpse on trial." ↔ kapak `THEY PUT A CORPSE / ON TRIAL` (vurgu `CORPSE`). Kapak karesi: tahtta cüppeli iskelet, karşısında öfkeyle işaret eden papa, büyük şok Kaşif.
- **Doğrulanacak bilgiler:** Papa Formosus 896'da öldü. Ocak 897 (bazı kaynaklar Şubat), Papa VI. Stephen cesedini mezardan çıkarttı, papalık cübbesi giydirip tahta oturttu, Lateran Bazilikası'nda yargıladı. Bir diyakon ceset adına cevap verdi. Suçlama: bir piskoposken kanuna aykırı şekilde Roma piskoposu (papa) olmak (dönemin İtalyan siyaseti, Spoleto ailesi gerilimi). Hüküm: suçlu; papalığı geçersiz sayıldı, kutsama yaptığı sağ elinin üç parmağı kesildi, ceset Tiber'e atıldı (önce sıradan bir mezara gömüldü sonra nehre, kaynaklara göre değişir — sade tut). Halk tepkisi; aynı yıl (Ağustos 897) Stephen tahttan indirildi, hapsedildi, boğularak öldürüldü. Formosus'un cesedi daha sonra kurtarıldı ve yeniden gömüldü (bir keşişin bulduğu anlatılır → "the story goes"). Sonraki papa(lar) bu tür yargılamayı yasakladı. Aşırı makabre değil, tuhaf ve ironik ton.
- **Görsel omurga:** `stage` (Kaşif + papa Stephen `mitre` yoksa uygun aksesuar, diyakon), yeni tip öneri **`cs_trial`** (mahkeme salonu, tahtta cüppeli iskelet, tokmak, papanın öfke pozu; cue'da iskeletin başı düşer gibi değil — saygılı), `map` (Roma, Lateran, Tiber), `timeline` (896 ölüm → 897 Ocak dava → 897 Ağustos Stephen'ın sonu), `board` (charges / verdict ✓✗), `title`.
- **Kapanış örneği:** "So the pope who put a dead man on trial didn't even outlive his own scandal."

## Çekim listeleri (Stickstory)


### ag-01-anglo-zanzibar-war: narration (467 chars, ~35 s estimate) — after critic round 1

> This war lasted just 38 minutes. In 1896, Zanzibar's sultan died, and his cousin Khalid grabbed the palace without asking Britain. Britain ordered him out by nine, but he refused. At 9:02, the warships opened fire. His royal yacht sank in minutes. By about 9:40, his flag was down. About 500 people were killed or wounded, but only one British sailor was hurt. And the strangest part? Britain sent his side the bill for the shells. So yes, you can lose a war before breakfast.

Verified (Wikipedia "Anglo-Zanzibar War", History Today): Hamad died 25 Aug 1896; Khalid (Hamad's cousin; both grandsons of Sultan Said) took the palace without British approval; ultimatum 09:00, 27 Aug; fire opened 09:02; shelling ceased ~09:40 (38-45 min); royal yacht HHS Glasgow (the navy's only ship) sunk; ~500 Zanzibari killed or wounded, one British petty officer severely wounded; Khalid took refuge in the German consulate; his supporters were made to pay reparations "to cover the cost of shells fired against them".

| # | Narration | Visual | Type | Kaşif | Cue | Camera |
|---|---|---|---|---|---|---|
| 1 | This war lasted just 38 minutes. | Burning palace with clock tower, two cruisers firing, shells bursting, big clock 9:02 to 9:40 | zw_palace (new) | big in the foreground, shock, then points | minutes | slow push-in, shake |
| 2 | In 1896, Zanzibar's sultan died, | Old map zoomed on Zanzibar island, red "Zanzibar", note "August 1896" | map | - | Zanzibar / died | zoom |
| 3 | and his cousin Khalid grabbed the palace without asking Britain. | Khalid (turban) strides in, points up at the palace; red "NO PERMISSION" | stage | point -> shock | palace / Britain | push-in |
| 4 | Britain ordered him out by nine, but he refused. | Admiral holds "LEAVE BY 9:00", Khalid shrugs; red "NO." | stage | think -> shrug | nine / refused | push-in |
| 5 | At 9:02, the warships opened fire. | Big + tower clocks tick to 9:02, cruisers fire, palace catches fire, shake | zw_palace | on a small ledge, binoculars -> shock | 9:02 / fire | zoom 1.14-1.22 |
| 6 | His royal yacht sank in minutes. | Royal yacht is hit, smokes and sinks | zw_palace | points, then shock | royal / sank | zoom 1.14-1.22 |
| 7 | By about 9:40, his flag was down. | Timeline 9:02 fire -> red ~9:40 flag down | timeline | think -> point | 9:40 | - |
| 8 | About 500 people were killed or wounded, but only one British sailor was hurt. | Ink bars: red "Zanzibar ~500" vs tiny "Britain 1", tick "One-sided" | ag03c_compare | talk -> shrug | 500 / sailor | push-in |
| 9 | And the strangest part? Britain sent his side the bill for the shells. | Admiral hands a "BILL" sign, Khalid's man shocks; red "FOR THE SHELLS" | stage | talk -> shrug | strangest / bill | push-in |
| 10 | So yes, you can lose a war before breakfast. | Giant "OVER BEFORE / BREAKFAST" | title | shrug | breakfast | - |

Cover: "THIS WAR / LASTED / 38 MINUTES" (highlight 38), scene 1 t 2.0, scene's own big shocked narrator (cover kasif false). Candidates compared: (A) scene 1 + ledge narrator + motor Kaşif (double narrator), (B) scene 6 yacht blast (less fire, emptier), (C) scene 5 first salvo (no flames yet) -> A reworked into the final.

### ag-02-cadaver-synod: narration (459 chars, tur 1 sonrası)

> In 897, a pope put a corpse on trial. Formosus had been dead for months, but Pope Stephen the Sixth still wanted revenge. He had him dug up, robed and propped on a throne. Get this: a deacon answered for the corpse. The verdict? You guessed it: guilty! They cut off three fingers of his blessing hand, and dumped him in the Tiber. But Rome turned on Stephen, and he was strangled in prison. So within months, the pope who judged a corpse was a corpse himself.

Doğrulama: Formosus 896'da öldü; dava 897 başı (Ocak, bazı kaynaklar Şubat), Lateran; ceset cübbeyle tahta oturtuldu, bir diyakon onun adına cevap verdi; hüküm suçlu, kutsama yapan üç parmak kesildi, ceset önce sıradan mezara sonra Tiber'e (metinde sadeleştirildi); Stephen aynı yıl yaz sonunda (~Ağustos 897) hapsedilip boğuldu. Kaynak: National Geographic (2016), medievalists.net, Atlas Obscura. Wikimedia'ya erişim bu ortamda kapalı (proxy 403), Laurens tablosu kullanılamadı; tüm görseller kodla.

| # | Anlatım | Görsel | Tip | Kaşif | Cue | Kamera |
|---|---|---|---|---|---|---|
| 0 | In 897, a pope put a corpse on trial. | Kemerli salon, kırmızı perdeli tahtta mitralı, cüppeli iskelet; mitralı papa öfkeyle işaret ediyor | `cs_trial` (yeni) | bakar → şok | corpse | itme + kapak kadrajı |
| 1 | Formosus had been dead for months, | Dikey zaman çizgisi 896 Formosus dies → 897 Trial | `timeline` | işaret eder | Formosus, months | – |
| 2 | but Pope Stephen the Sixth still wanted revenge. | Boş taht, Stephen ayak vurup tahtı gösterir, "REVENGE!" | `cs_trial` | düşünür → omuz silker | revenge | itme + punch |
| 3 | He had him dug up, robed and propped on a throne. | Dev yazı kelime kelime: DUG UP, / ROBED, / ENTHRONED. (kırmızı kutu) | `title` | omuz silker | dug, up, robed, throne | – |
| 4 | Get this: a deacon answered for the corpse. | Cesedin yanında konuşan diyakon, noktalı konuşma balonu, "THE DEACON" | `cs_trial` | işaret → şok | deacon, corpse | itme |
| 5 | The verdict? You guessed it: guilty! | THE VERDICT: / GUILTY! (kırmızı kutu) | `title` | şok | Guilty | – |
| 6 | They cut off three fingers of his blessing hand, | Kırmızı yenden çıkan kutsama eli, 1-2-3 numaralar, kesik çizgi, parmaklar kesik çizgili hayalete döner | `cs_hand` (yeni) | düşünür → şok | three, blessing | itme |
| 7 | and dumped him in the Tiber. | Roma haritası: Tiber, kırmızı Lateran, nehre kesikli rota, 897 | `map` | – | dumped, Tiber | zoom |
| 8 | But Rome turned on Stephen, | Üç öfkeli Romalı soldan yürür, kollar yukarı, "FURIOUS!" | `stage` | anlatır → işaret → şok | Rome, turned | itme, paralaks şehir |
| 9 | and he was strangled in prison. | Taş hücre, mitralı Stephen samanda oturur, parmaklıklar iner | `cs_trial` (cell) | anlatır → şok | he, strangled | itme |
| 10 | So within months, the pope who judged a corpse was a corpse himself. | Selvili mezarlık: FORMOSUS 896 ve STEPHEN VI 897 mezar taşları yükselir | `cs_trial` (graves) | işaret → omuz silker | months, was, himself | itme |

Kapak: `A POPE'S / CORPSE / ON TRIAL` (vurgu CORPSE), sahne 0 t=2.6, yakın kadraj (zoom 1.22), büyük şok Kaşif sağ altta. 5 aday denendi (geniş kadraj şok, yakın kadraj işaret, diyakon sahnesi, "THEY JUDGED A DEAD POPE", yakın kadraj şok); en güçlüsü yakın kadraj + şok.


## Eleştiri günlüğü (Stickstory)

Tur 1 düzeltmeleri: anlatım 498 → 459 karakter (tahmini ~35 sn); kapanış netleşti ("was a corpse himself"); "You guessed it" ile hitap; sahne 8 kadraj (Kaşif 0.74, Romalılar 0.55/0.40/0.25, odak 0.5); sahne 1/3/5 Kaşif altyazı şeridinin üstünde ve daha büyük; zaman çizelgesinde 897 artık "dead" kelimesinde yanıyor; sahne 0 papa "put" kelimesinde işaret ediyor.

### ag-01-anglo-zanzibar-war — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 | 7 | 6 | 7 | 8 | 6 | 7 | 7 | 6 | 8 | 8 |

lint OK (SEO 100). preview: 498 karakter, tahmini ~37 sn (hedef 28–35), 10 sahne, motion 3.4–21.6 (timeline 3.4 en düşük).

1. **Anlatıcı sesi yok, altyazı gibi kesik (Senaryo 6):** metinde hiç "you" yok; "He didn't." / "His only warship sank." / "Britain had one sailor hurt." / "Then his side got the bill for the shells." madde listesi gibi art arda. BRAND §6.0/§11 YouTuber hitabı istiyor. Kanca da kapakla tam eşleşmiyor (kapak "38 MINUTES", ilk cümle "less than an hour"). → İlk cümle: "This war lasted just thirty-eight minutes." Sonra bir hitap + bağlaçlar: "...and you'd think Britain would negotiate. It didn't. It gave him until nine in the morning, and he stayed put." "But here's the strangest part: Britain then sent his side the bill for the shells." Toplam 400–470 karakterde kal; tahmini süre 35 sn altına insin (sahne 7 "Britain had one sailor hurt" ve sahne 8'i sıkılaştır).
2. **Sahne 4–5 (zw_palace, ledge) alt yarı boş + kicker çakışması (Kompozisyon/Okunabilirlik):** saray+körfez üst %45'te, altta dev boş uçurum/kâğıt; sahne 4'te kırmızı "9:02" saat etiketi kicker'ın yanında, sahne 5'te el yazısı "HHS Glasgow" etiketi kicker "HHS Glasgow royal yacht" üstüne biniyor (aynı yazı iki kez). Sahne 1 (harita) ve 7 (board) de alt yarı boş, board kartının %70'i boş. → zw_palace'ta ledge'i kaldır, kamerayı yaklaştır (zoom ~1.35, focus y ~0.5) ya da sahneyi aşağı kaydır ki gemiler/su y 900–1150'yi doldursun, Kaşif'i büyüt (scale ≥0.95) ön planda; sahne 5'te label'ı kaldır ya da kicker'ı "Royal yacht" yap ve etiketi yatın yanına (y~0.45) koy. Board'u yukarı kısalt (tek kart, barlar kalın) ve kalan alana Kaşif koy (board'da Kaşif yok); haritada focus/zoom'u artır, notu altyazı bandının üstüne al.
3. **Doğruluk:** Khalid bin Barghash, ölen Sultan Hamad bin Thuwaini'nin **yeğeni değil kuzeniydi** (Khalid, Sultan Barghash'ın oğlu; Hamad, Thuwaini'nin oğlu; Wikipedia "Hamad's cousin"). "His only warship sank" de yanlış: Glasgow kraliyet yatıydı ve iki küçük buharlı tekne de batırıldı. → "his cousin Khalid", kicker "the cousin"; "His royal yacht, the pride of his tiny navy, sank." gibi. Ayrıca sahne 6 zaman çizelgesinde "~9:40" rakamı soluk/eriyik görünüyor; vurgu anında tam mürekkep olmalı (motion 3.4, en zayıf sahne: Kaşif'e yürüyüş/işaret ekle).

Kapak: 8 — dev yazı okunuyor, 38 kırmızı kutuda, yanan saray + şok Kaşif. Yükseltmek için: Kaşif yüzü daha yukarı/büyük (şu an çene altı kadraj dışında, gövde boş kâğıtta), gemilerden ateş/duman görünür olsun; saat kulesi kapak karesinde yok. Başlık/açıklama/etiketler iyi (SEO 100); açıklamadaki "his nephew Khalid bin Barghash" da "his cousin" olmalı; "the royal yacht HHS Glasgow sank" doğru, kalabilir.

### ag-02-cadaver-synod — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 8 | 7 | 6 | 7 | 6 | 9 | 6 | 8 |
1. **Tempo + sahne 10 (süre ~38,7 sn > 35; lint: sahne 10 = 15 kelime, 6,7 sn):** 498 karakter üst sınırda ve tahmin 35 sn'yi aşıyor. → ~40 karakter kes: sahne 2 "but the new pope, Stephen the Sixth, still wanted revenge."; sahne 10 "So within months, the pope who judged a corpse was a corpse himself." (sahne 10 ≤ 4,5 sn olsun). Sahne 3 (5,1 sn) "He had him dug up, robed and propped on a throne." diye kısalabilir.
2. **Kapanış + anlatıcı sesi:** "became one himself" kulakla belirsiz: "one" hemen "on trial"dan sonra geliyor, "yargılanan papa oldu" gibi de duyuluyor (Stephen yargılanmadı). Ayrıca metinde hiç "you"/"I" yok (BRAND §11 YouTuber sesi). → Kapanışı madde 1'deki net cümleyle değiştir; sahne 5'i "The verdict? You guessed it. Guilty!" yap (kesintilerle bütçe içinde kalır), "Get this:" yerine "And here's the crazy part:" olabilir.
3. **Kompozisyon:** sahne 8 (stage) soldaki Romalı ve sağdaki Kaşif kadraj kenarında yarım kesiliyor (Kaşif'in yüzü ikinci karede kesik) → Kaşif x 0.72, Romalılar to 0.58/0.42/0.26, cam focus [0.5,0.6]. Sahne 1 (timeline), 3 ve 5 (title): Kaşif küçük (0.8) ve altyazı şeridi göğsünün üstüne biniyor, alt yarı boş kâğıt; timeline'da "Formosus dies"/"Trial" yazıları 44 px altında görünüyor ve 897 soluk → Kaşif scale ~1.0, ayakları altyazı şeridinin altında değil yanında olacak şekilde y/x ayarla; timeline etiketlerini büyüt. Ek: sahne 0 motion 1.8 (sınırda) — ilk saniyede papa/ceset hareketini erken başlat (kanca karesi canlı olsun).
Doğruluk notu: Ocak 897, deacon, üç kutsama parmağı, Tiber, Ağustos 897 boğulma hepsi doğru; Tiber öncesi geçici gömü sadeleştirmesi kabul edilebilir. Kapak (8): okunuyor, tek dramatik an, şok Kaşif; üstte ~200 px boş şerit var, yazı biraz aşağı/daha büyük olabilir. SEO başlık 52 karakter, iyi. Lint: 0 hata, 1 uyarı (sahne 10).

### ag-01-anglo-zanzibar-war — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 8 | 8 | 7 | 7 | 8 | 8 | 8 | 8 |

lint OK, 467 karakter. Tur 1 düzeltmeleri yerinde: kuzen, kraliyet yatı, kanca "38 minutes" = kapak, "And the strangest part?" bağlacı, 9:02→~9:40 = 38 dk tutarlı, compare sahnesinde Kaşif var, HHS Glasgow etiketi çakışması gitti. **Geçti (hepsi ≥ 7).** Kalan küçük sorunlar (isteğe bağlı 3. tur):
1. Sahne 4–5 (zw_palace): altyazı bandının altında hâlâ dev boş uçurum/kâğıt (y ≈ 1320–1920); sahne 4'te kicker "9:02 deadline passes" saat kulesinin çatısına değiyor; sahne 5'in sonunda Kaşif sol kenarda yarı kesik. → ledge'i kaldır ya da sahneyi ~150 px aşağı kaydır, Kaşif x ≥ 0.2; kicker'ı "9:02" tek kelimeye indir.
2. Senaryo: "About 500 people were killed or wounded, but only one British sailor was hurt." eksiltili, sesli okunurken takılıyor; "you" sadece son cümlede. → "About 500 people were killed or wounded. On the British side? One sailor was hurt." ve ortada bir hitap ("you'd think he'd fight back. He couldn't.") ekle; karakteri 500 altında tut.
3. Compare sahnesi (7): alt kart neredeyse boş (yalnız "One-sided" kutucuğu), Kaşif küçük; harita (1) alt yarı boş. → alt kartı kaldırıp barları büyüt (kalın, ekranın ortasına), Kaşif scale ≥ 0.8 ve "500"de şok; haritada zoom ~1.5.

Kapak 8: Kaşif artık büyük ve yüzü okunuyor, 38 kırmızı kutuda; gemilerden görünür namlu ateşi eklenirse 9 olur.

### ag-02-cadaver-synod — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 7 | 7 | 8 | 9 | 8 | 8 |
Geçti (hepsi ≥ 7, lint 0 hata 0 uyarı, 459 karakter, ~35 sn). Kalan küçük sorunlar:
1. Sahne 3 (DUG UP / ROBED / ENTHRONED): Kaşif tur 1'den bile küçük (yazının altında minik figür), alt yarı boş kâğıt → Kaşif scale ~1.0, x 0.7, yazının sağ altında büyük; ya da yazıyı y 0.35'e indirip boşluğu kapat.
2. Sahne 7 (harita): Tiber sadece ince bir kıyı çizgisi, su/nehir gövdesi yok ve Kaşif yok; "dumped" anı soyut kalıyor → nehri dolu mürekkep şerit olarak çiz, rota ucunda küçük bir sıçrama/halka ekle.
3. Kapak: üstte ~200 px boş şerit; yazı bloğunu ~120 px aşağı al ya da 1 kademe büyüt. (Önizlemede altyazıda "onStephen," / "the  Sixth" boşluk hatası görünüyor; tahmini zamanlama kaynaklı olabilir, gerçek render'da kontrol edilsin.)
