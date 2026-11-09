# Düşün Bakalım — 2026-11-09 (belgesel tarzı)

Manşet: `tools/news.py --channel db` bu ortamdan erişilemedi (proxy 403: Google News tüneli reddedildi). Web
aramasında (Türkiye arkeoloji/tarih haberleri) bu haftaya ait, havuza uyan doğrulanabilir bir manşet bulunamadı →
konu havuzdan (plan.py kategorisi: felaketler ve kazalar; aynı zamanda Türkiye/İstanbul tarihi).
ElevenLabs uyarısı (warning: true; ayın kullanımı 209.787 / bütçe 231.442, yenilenme 20 Kasım): Short aralığın
alt ucunda (~330–360 karakter).

## 01 — Short · felaketler ve kazalar (İstanbul tarihi)
- Konu: Ayasofya'nın ilk kubbesinin çöküşü (7 Mayıs 558). Kubbe 537'de tamamlandı (Anthemios + Miletoslu
  İsidoros). 553 ve 557 depremleri çatlattı; 7 Mayıs 558'de kubbenin doğu kısmı çöktü, sunağı/ambonu/ciboriumu
  ezdi. Genç İsidoros (Miletoslu İsidoros'un yeğeni) kubbeyi ~6 m daha yüksek (daha dik) yeniden kurdu, 562'de
  yeniden açıldı. Sonraki kısmi çöküşler (989, 1346) onarıldı; bugünkü kubbe esasen bu ikinci kubbedir.
  DİKKAT (yaygın yanlış): Ayasofya kubbesi dünyanın en büyüğü DEĞİLDİ (Pantheon daha geniş) → böyle bir iddia yok.
- İzleyici sonunda ne hisseder: herkesin hayranlıkla baktığı kubbenin aslında bir "ikinci deneme" olduğunu
  öğrenmenin ürpertisi; taşın da yorulduğu.
- Kanca/kapak: ilk cümle "Ayasofya'nın kubbesi bir kez çöktü." Kapak 2–4 kelime (ör. "İLK KUBBE **ÇÖKTÜ**" /
  "KUBBE **ÇÖKTÜ**"); kapak görseli: ışık havuzunda Ayasofya kubbesinin kesiti/silueti, tepesinde çatlak ya da yarısı
  kopmuş, toz. En az 3 aday.
- Punchline: bugün içine girenlerin baktığı kubbe, o ikinci kubbedir.
- Palet: **fildisi** (önceki Düşün Bakalım videosu: derin). Dosya `01-ayasofya-kubbesi.json`,
  `publish_at` 2026-11-09T19:00:00+03:00. related: yok.

### Anlatım (yönetmen taslağı; yazar doğrulayıp ince ayar yapar, ~330–360 karakter)
Ayasofya'nın kubbesi bir kez çöktü. Yıl 558, bir mayıs sabahı. Kubbe yirmi bir yıldır ayaktaydı. Ama iki deprem
onu çoktan çatlatmıştı. O sabah doğu yarısı, sunağın üstüne indi. Toz, saatlerce dinmedi?? (doğrulanamazsa çıkar)
Yeniden kuran, ilk mimarın yeğeniydi. Kubbeyi daha yükseğe kurdu. Bugün başımızın üstündeki kubbe, o ikinci
kubbedir. Böyle sessiz hikâyeler için abone olun.

### Çekim listesi (yazar ayrıntılandırır)
| # | Cümle | Görsel | Tip | Kamera |
|---|---|---|---|---|
| 1 | Ayasofya'nın ilk kubbesi çöktü. | Ayasofya kubbesinin içten kesiti, ışık havuzu; kubbenin bir dilimi kopuk, toz asılı (ilk kare dolu = kapak) | bt_ay_* hook | yavaş itme |
| 2 | Yıl 558, bir mayıs sabahı. | Şafakta Ayasofya silueti (minaresiz! 6. yy), italik "558" | bt_ay_* | yavaş itme |
| 3 | Kubbe yirmi bir yıldır ayaktaydı. | 40 pencereli kubbe kasnağı, pencerelerden ışık hüzmeleri | bt_ay_* | yavaş itme |
| 4 | Ama iki deprem onu çoktan çatlatmıştı. | Kubbede ince çatlak kendini çizer (ikinci çatlak "iki"de) | bt_ay_* | yakın |
| 5 | O sabah doğu yarısı, sunağın üstüne indi. | Kesit: doğu yarısı ağır ağır düşer, toz bulutu | bt_ay_* | yavaş itme |
| 6 | Yeniden kuran, ilk mimarın yeğeniydi. | Pergel + kubbe çizimi kendini çizer (mimar planı) | bt_ay_* | yavaş itme |
| 7 | Kubbeyi daha yükseğe kurdu. | İki kubbe profili üst üste: yassı ilk (kesik çizgi) ve yüksek ikinci | bt_ay_* | yakın |
| 8 | Bugün başımızın üstündeki kubbe, o ikinci kubbedir. | Bugünkü Ayasofya içi (minareli dış ya da içten kubbe), sıcak ışık | bt_ay_* / photo | yavaş itme |
| 9 | Böyle sessiz hikâyeler için abone olun. | Gece kubbe silueti, tek ışık | bt_ay_* | yavaş itme |

### Yazar — son hâl (tur 2 düzeltmeleri sonrası)

**Son anlatım (357 karakter, lint sayımı; hedef 330–360):**
Ayasofya'nın ilk kubbesi çöktü. Yıl 558. Kubbe yirmi yaşındaydı. Ama iki deprem onu çatlatmıştı. Bir mayıs sabahı
doğu kısmı, sunağın üstüne indi. Gerisi havada asılı gibi kaldı. Yeniden kuran bir yeğendi. İlk mimarlardan birinin yeğeni. Kubbeyi daha yükseğe kurdu. Bugün baktığınız kubbe, o ikinci kubbenin yamalı hâlidir. Böyle sessiz
hikâyeler için abone olun.

Başlık: "Ayasofya Kubbesi: İlk Kubbe Neden Yirmi Yılda Çöktü?" (cevap videoda: iki deprem çatlatmıştı; ikinci kubbe daha yüksek).
Kapak: "İLK KUBBE / **ÇÖKTÜ**", sahne 0, t 1.2, focus [540,540] × 1.4.

**Doğrulama:**
- 27 Aralık 537'de açıldı → 7 Mayıs 558'e 20 yıl ("yirmi yaşındaydı"); mimarlar Trallesli Anthemios + Miletoslu İsidoros: worldhistory.org/Hagia_Sophia, hagiasophia.com/hagia-sophia-dome
- 553 ve 557 depremleri kubbeyi çatlattı: hagiasophia.com/hagia-sophia-dome; Columbia (Theophanes: "cracked by the preceding earthquakes", Aralık 557 depremi)
- 7 Mayıs 558, doğu kısmı çöktü, sunak/ciborium/ambon ezildi: https://projects.mcah.columbia.edu/medieval-architecture/htm/or/ma_or_gloss_collapse.htm (Theophanes: "eastern part"; Salı, 5. saat ≈ sabah); https://www.historytoday.com/archive/months-past/sancta-sophia-collapses ("morning of 7 May 558", "eastern half of the dome", altar crushed)
- Kubbenin geri kalanı ayakta kaldı: History Today ("part of the dome was left standing, seemingly suspended in mid-air"; modern anlatım, tanık sözü değil → anlatımda "gibi" ile, açıklamada tanığa atıf yok)
- Genç İsidoros, ilk mimarın yeğeni: https://www.hagiasophia.com/hagia-sophia-dome ("nephew of the original architect"), https://www.worldhistory.org/Hagia_Sophia
- Daha yüksek kurdu (~6 m; Theophanes 20+ ft, Malalas 30 ft): hagiasophia.com, Columbia. Anlatımda sayı yok.
- 24 Aralık 562 ikinci açılış: Columbia, History Today
- Bugünkü kubbe = ikinci kubbenin yamalı hâli (989'da batı kemeri + kubbe kısmı, 1346'da doğu kısmı çöküp onarıldı; açıklamada var)
- Kullanılmayan iddialar: "dünyanın en büyük kubbesi" (yanlış; Pantheon daha geniş), toz süresi
- 6. yüzyıl silueti minaresiz; minareler Osmanlı döneminde eklendi (worldhistory.org): 558 sahnesinde minare yok, son sahnede bugünkü hâl 4 minareli.

**Son çekim listesi** (yeni dosya `scenes/studio/shots/bt_ayasofya.js`; fotoğraf denenmedi: `tools/media.py` proxy 403)
| # | Cümle | Görsel | Tip | Cue |
|---|---|---|---|---|
| 1 | Ayasofya'nın ilk kubbesi çöktü. | Işık havuzunda tek başına yassı ilk kubbe + kasnak (nef yok); doğu kısmı dağınık taşlar halinde havada yavaşça iner, iki kırık kenar altın (kapak karesi) | bt_ay_dome hook | — |
| 2 | Yıl 558. Kubbe yirmi yaşındaydı. | Dışarıdan minaresiz 6. yy silueti, alçak güneş, italik "558" | bt_ay_church 558 | — |
| 3 | Ama iki deprem onu çatlatmıştı. | Yakın kubbe (sunak yok); iki çatlak sırayla kendini çizer | bt_ay_dome crack | deprem, çatlat |
| 4 | Bir mayıs sabahı doğu kısmı, sunağın üstüne indi. | Doğu kısmı dağınık taşlar halinde sunağın üstünde moloz yığını olur, sunağın üstüne düşer, toz yükselir, sunak kaybolur | bt_ay_dome fall | doğu |
| 5 | Gerisi havada asılı gibi kaldı. | Yakın plan: ışık havuzunda kalan kubbe (batı kısmı + doğu kalıntısı), boşluktan toz yavaşça iner | bt_ay_hang | asılı |
| 6 | Yeniden kuran bir yeğendi. İlk mimarlardan birinin yeğeni. | Çizim kâğıdı, pergel yeni yüksek yayı çizer; "Genç İsidoros" | bt_ay_compass | yeğen |
| 7 | Kubbeyi daha yükseğe kurdu. | Kesik çizgili 537 profili + ~%14 daha yüksek 562 profili, aradaki hilal altın, altın ok | bt_ay_profile | yükseğe |
| 8 | Bugün baktığınız kubbe, o ikinci kubbenin yamalı hâlidir. | İçeriden yüksek ikinci kubbe, 40 pencereden ışık hüzmeleri | bt_ay_dome inside | ikinci |
| 9 | Böyle sessiz hikâyeler için abone olun. | Alacakaranlıkta bugünkü silüet, 4 minare kadraj içinde, kasnakta birkaç pencere net altın yanar | bt_ay_church today | — |

**Kapak adayları** (`build.py --no-tts --cover`, scratchpad'de karşılaştırıldı):
- A: "KUBBE BİR KEZ **ÇÖKTÜ**", sahne 0, t 1.2, focus yok → kubbe küçük, kapak bloğunun altında soluk.
- B: "YARISI **HAVADA** KALDI", sahne 4 (asılı yarım kubbe + siluet), focus [560,560] ×1.3 → ürkütücü ama bağlamsız; ilk cümleyle aynı fikir değil.
- C: "İLK KUBBE **ÇÖKTÜ**", sahne 3 düşüş sonrası → taşlar yerde, an geçmiş, dramı az.
- (Tur 0 seçimi: A + focus [565,480] × 1.3.)
- Tur 1 yeni adaylar (hook sahnesi artık nefsiz): R1 "KUBBE BİR KEZ **ÇÖKTÜ**" focus [540,540] ×1.25 (temiz ama küçük); R2 "İLK KUBBE **ÇÖKTÜ**" t 2.0 (aynı kare, daha zayıf iddia); R3 "GERİSİ **HAVADA** KALDI" sahne 4 (kemer çizgileri var, bağlamsız).
- **Seçilen: R1b "KUBBE BİR KEZ ÇÖKTÜ", sahne 0, t 1.2, focus [540,540] × 1.4**: bütün kubbe kadrajda, dağınık taşlar, iki altın kırık kenar, sunak/kemer yok, yazı ile kubbe arası daraldı.

## Eleştiri günlüğü

### 01-ayasofya-kubbesi — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 8 | 7 | 8 | 8 | 6 | 8 | 7 |
1. Doğruluk: 27 Aralık 537 → 7 Mayıs 558 = 20 yıl; "doğu yarısı" abartı → "Kubbe yirmi yaşındaydı", "Bir mayıs sabahı doğu kısmı sunağın üstüne indi"; açıklamada "yirmi yıl", "doğu kısmı".
2. "Öbür yarısı havada asılı" dayanaksız → "Gerisi havada asılı gibi kaldı"; açıklamadan "çağın tanıklarına göre" çıktı.
3. Punchline yarım doğru (989, 1346 kısmi çöküşler) → "Bugün baktığınız kubbe, o ikinci kubbenin yamalı hâlidir."; başlık "Ayasofya Kubbesi Bir Kez Çöktü: Bugünkü Kubbe Hangisi?"; açıklamaya 989/1346 eklendi.
Yan düzeltmeler: hook/fall'da kopan parça dağınık taşlar (kasnak düşmüyor, doğuda kısa kalıntı ayakta); hook sahnesi nefsiz, tek özne ışık havuzunda; kapak 3 yeni aday, focus [540,540] ×1.4; "asılı" sahnesi yakın plan + ışık havuzu + boşluktan inen toz (siluet ve moloz kaldırıldı); profil farkı ~%14 + altın hilal; son sahnede minareler kadraj içinde, bulanık ışık lekesi yerine net yanan pencereler; "Genç İsidoros" 96 px, kalın. Karakter 357. Lint OK, preview'da STATIC? yok.

### 01-ayasofya-kubbesi — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 8 | 8 | 8 |
1. "Bir kez çöktü" 989/1346 ile çelişiyordu → ilk cümle "Ayasofya'nın ilk kubbesi çöktü.", kapak "İLK KUBBE / ÇÖKTÜ", başlık "Ayasofya Kubbesi: İlk Kubbe Neden Yirmi Yılda Çöktü?", açıklama "Ayasofya kubbesi aslında ikinci kubbe: ilki…" ile açılıyor, etiket "ayasofya ilk kubbesi".
2. bt_ay_hang kadrajdan taşıyordu → zoom 1.5'ten 1.3'e, odak (500,560); iki kırık kenar ve kasnak kadraj içinde.
3. Altyazıda tek kelime ("indi.", "yeğeniydi.") → "Bir mayıs sabahı doğu kısmı, sunağın üstüne indi." (virgül doğal kırılma verir) ve "Yeniden kuran bir yeğendi. İlk mimarlardan birinin yeğeni." (iki kısa cümle; cue "yeğen"). Sunağa düşen taşlar artık sunağın üstünde büyük bir moloz yığını oluşturuyor.
Karakter 357. Lint OK, preview'da STATIC? yok; sheet ve cover kontrol edildi.

### Son kapı (yönetmen)
- "Amcası ilk mimarlardandı" → "İlk mimarlardan birinin yeğeni." (kaynaklar sadece "yeğen" diyor; amca/dayı bilinmiyor). 363 karakter.
- bt_ay_dome crack / bt_ay_hang: kamera itme merkezi yukarı alındı (y 250); zemin çizgisi artık altyazının üstünden geçmiyor.
- Lint hatasız, SEO 100; sheet.png ve cover.jpg yönetmen tarafından görüldü. Son tur (2) puanları: hepsi ≥ 7, kapak 8.
