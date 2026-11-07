# Düşün Bakalım — 2026-11-07 (belgesel tarzı)

Manşet: `tools/news.py --channel db` bu ortamdan erişilemedi (proxy 403: Google News tüneli reddedildi). Web
aramasında havuza uyan güncel bir Türkiye manşeti bulunamadı → konu bugünün yıl dönümünden (CLAUDE.md: "bir yıl
dönümü → o günün kendisi"): 7 Kasım 1917, Kış Sarayı'nın alınışı. Havuz: büyük kararlar ve savaşlar (plan önerisi).
ElevenLabs uyarısı (warning: true): karakter aralığın alt ucunda (~330–370).

## 01 — Short · büyük kararlar ve savaşlar
- Konu: Kış Sarayı'nın Küçük (Beyaz) Yemek Odası'ndaki şömine saati. 25 Ekim (eski takvim) = 7 Kasım 1917 gecesi
  21.40'ta Aurora kruvazörü Petropavlovsk Kalesi'nden gelen işaretle tek bir kurusıkı atış yapar, saldırı başlar.
  Geçici Hükûmet bakanları sarayın Küçük Yemek Odası'nda bekler; gece 2.10 civarında (26 Ekim / 8 Kasım) tutuklanırlar.
  Odadaki şömine saati 2.10'da durur; Sovyet döneminde hiç kurulmaz, yüz yılı aşkın 2.10'u gösterir; Ermitaj onu
  2017'de, devrimin 100. yılında yeniden kurar (TASS).
- İzleyici sonunda ne hisseder: bir hükümetin bir yemek odasında, bir saatin akrebinde donup kalmasının sessiz ürpertisi.
- Kanca/kapak: ilk cümle "Bu saat yüz yıl boyunca durdu." ↔ kapak "SAAT / YÜZ YIL DURDU" (vurgu SAAT ya da DURDU);
  kapak: karanlık zeminde ışık havuzunda tek şömine saati, akrep 2.10. Yazar en az 3 aday dener.
- Palet: **obsidyen** (önceki Düşün Bakalım videoları: derin, grafit). Dosya `01-kis-sarayi-saati.json`,
  `publish_at` 2026-11-07T19:00:00+03:00, `"palette": "obsidyen"`. related: yok.
- Doğrulanacak/kaçınılacak: Rus İmparatorluğu Şubat 1917'de çökmüştü (Çar tahttan Mart'ta indi) → "imparatorluk
  bitti" denmez, düşen Geçici Hükûmet'tir. Aurora'nın atışı kurusıkıdır (canlı mermiyle sarayı bombaladı efsanesi
  yanlış). Eisenstein filmindeki kanlı "saldırı" sahnesi anlatılmaz. Saatin kendiliğinden mi durduğu, durdurulduğu mu
  belirsiz → "akrebi 2.10'da kaldı" de.

### Anlatım (tur 3 sonrası; 392 karakter, 11 cümle, "-yor" 0/11, devrik cümle yok)
Bu saat yüz yıl boyunca durdu. 7 Kasım 1917 gecesi, Petrograd. Aurora kruvazörü kurusıkı ateşledi. Kış Sarayı'nda
bakanlar yemek odasında bekledi. Ayak sesleri yaklaştı. Gece ikiyi on geçe kapı açıldı. Geçici Hükûmet'in bakanları orada tutuklandı.
İbreler o anda dondu. Ama Sovyetler onu hiç kurmadı. Saat ancak devrimin yüzüncü yılında yeniden işledi. Böyle sessiz
hikâyeler için abone olun.

Notlar: "2.10" sesli okumada "iki nokta on" olmasın diye metinde "ikiyi on geçe" yazıldı (ekranda "gece 2.10").
"Saatin akrebi kaldı" yerine "İbreler o anda dondu" (durdurulup durdurulmadığı belirsiz; "dondu" tarafsız). Bütçe
uyarısı yüzünden "tek bir", "küçük", "koridorlarda" kısaltıldı. Doğrulama: TASS (Küçük/Beyaz Yemek Odası saati 2.10'da
kaldı, Sovyet döneminde kurulmadı, 2017'de yeniden kuruldu), encspb (25 Ekim/7 Kasım 21.40, Petropavlovsk işaretiyle
kurusıkı atış), Wikipedia (Storming of the Winter Palace).

### Çekim listesi (son; sahne kodu `scenes/studio/shots/bt_ks.js`)
| # | Cümle | Visual | Tip | Cue |
|---|---|---|---|---|
| 0 | Bu saat yüz yıl boyunca durdu. | Işık havuzunda kubbeli şömine saati, ibreler 2.10, durgun sarkaç, altında soğuk şömine, süzülen toz (kapak/kanca karesi) | bt_ks_clock hook | durdu |
| 1 | 7 Kasım 1917 gecesi, Petrograd. | Neva'nın karşısında Kış Sarayı'nın barok cephesi, birkaç altın pencere suda yansır; "1917", italik "Petrograd" | bt_ks_city night | – |
| 2 | Aurora kruvazörü kurusıkı ateşledi. | Yandan Aurora (üç eğik baca, iki direk, baş topu), bacalardan duman; cue'da baş topunda tek altın parlama + duman bulutu | bt_ks_ship | kurusıkı |
| 3 | Kış Sarayı'nda bakanlar yemek odasında bekledi. | Mum ışığında uzun masanın arkasında beş yüzsüz siluet, üç mumlu şamdan, kemerli gece penceresi, duvarda küçük saat | bt_ks_room wait | – |
| 4 | Ayak sesleri yaklaştı. | Perspektif saray koridoru, dipten üç siluet ve fener ışığı yaklaşır | bt_ks_hall | – |
| 5 | Gece ikiyi on geçe kapı açıldı. | Çift kanatlı kapı, altında titrek ışık; cue'da kanatlar açılır, yere ışık üçgeni, aralıkta tek siluet; "gece 2.10" | bt_ks_door | açıldı |
| 6 | Geçici Hükûmet'in bakanları orada tutuklandı. | Aynı oda boş: yüksek arkalıklı sandalyeler itilmiş, yan yatmış kadeh; cue'da mum söner, duman yükselir | bt_ks_room empty | tutuklandı |
| 7 | İbreler o anda dondu. | Yakın plan kadran: kısa kalın altın akrep, ince uzun yelkovan son dakikayı geçip 2.10'da durur, kadran çerçevesi altın yanar | bt_ks_clock close | dondu |
| 8 | Ama Sovyetler onu hiç kurmadı. | Soğuk şömine üstünde saat; pencere ışığı duvarı tekrar tekrar geçer, yıl 1917→2016 sayar, ibreler kıpırdamaz | bt_ks_room years | – |
| 9 | Saat ancak devrimin yüzüncü yılında yeniden işledi. | Saat: sarkaç yeniden sallanır, yelkovan ilerler; "2017", italik "yüz yıl sonra" | bt_ks_clock wind | yeniden |
| 10 | Böyle sessiz hikâyeler için abone olun. | Şafak: güneş ufkun altında, çatının arkasında soluk sıcak ışık yükselir, sönük pencereler, suda altın yansımalar | bt_ks_city dawn | – |

Tipler: 4 farklı tip (clock 3, room 3, city 2, ship/hall/door 1); aynı tip üst üste en fazla 1.

### Kapak adayları (3 aday render edildi, telefonda küçükken karşılaştırıldı)
- **A (seçildi):** "SAAT / YÜZ YIL **DURDU**", sahne 0 (hook), focus [540, 795], zoom 1.5 (tur 1'de 1.35'ten büyütüldü): kubbe karanlıktan çıkar,
  kadran ışık havuzunda; ilk cümleyle birebir aynı fikir.
- B: "ZAMAN / 2.10'DA / **DONDU**", sahne 7 (yakın kadran): en büyük kadran ama 3 satır kalabalık ve kanca cümlesiyle
  aynı fikir değil.
- C: "BİR HÜKÛMET / BURADA **DURDU**", sahne 0: merak güçlü ama "burada" görselde (saat) karşılığı zayıf, yazı uzun.

## Eleştiri günlüğü

### 01-kis-sarayi-saati — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 9 | 7 | 6 | 7 | 7 | 8 | 8 | 6 | 7 | 8 |
1. Doğruluk: "Geçici Hükûmet orada düştü." fazla iddialı (devrilme 25 Ekim sabahı ilan edilmişti, Kerenski kaçmıştı); açıklamada tutuklama tarihi belirsiz.
2. Görsel=anlatım: 2.10 okunmuyor (ibreler üst üste, akrep halkası tek kalın çizgi gibi); sahne 7'de kadranda soluk ikinci saat hayaleti; sahne 7'de altyazı kaide çizgisine biniyor.
3. Sahne 4 koridor: siluetler dip açıklığından büyük, fener görünmüyor, çizgiler X/kum saati yapıyor. Ek: sahne 10 şafak sahne 1'in aynısı; yemek odası siluetleri mezar taşı gibi; kapakta saat küçük, alt üçte bir boş.

**Yazarın düzeltmeleri (tur 1 → 2):**
- Sahne 6: "Geçici Hükûmet'in bakanları orada tutuklandı." (cue "tutuklandı"); anlatım 370 → 388 karakter. Açıklama: Aurora 7 Kasım (eski takvimle 25 Ekim) akşamı 21.40; tutuklama "7'yi 8 Kasım'a bağlayan gece saat 2.10'da (eski takvimle 26 Ekim)"; saatin neden kurulmadığına gerekçe yazılmadı (sadece "Sovyet döneminde hiç kurulmadı", TASS).
- İbreler: akrep kısa (~%46 yarıçap), geniş, altın dolgu + koyu kenar, halka/kuyruk yok, üstte; yelkovan ince, koyu, dakika çizgilerine kadar. Cue'da artık ibreler değil kadran çerçevesi altın yanıyor (iki ibre renkle ayrışık kalsın diye). Kapak, sahne 0, 7, 8, 9'da aynı saat çizimi.
- Sahne 7: kadran yukarı alındı (CY 540, K 1,75); kaide ~y 1065–1142, altyazı bandının üstünde. "Hayalet saat" sahne 8'e geçişteki dissolve'du (sahne 8'in saati üst üste biniyordu): sahne 8'e `"transition": "dip"` verildi, karanlıktan geçiş (yılların geçmesine de uyuyor).
- Sahne 4: koridor tek kaçış noktalı ışınlarla yeniden kuruldu; derinlikte tam kemer çerçeveleri (pilastr + tavan kirişi + eşik), köşe ışınları soluk; siluetler dip açıklığında ~175 px başlayıp ~370 px'e büyür, öndekinin feneri göğüs hizasında uzattığı elinde, zemin ve hava ışık havuzu onunla ilerler.
- Sahne 3: siluetler baş, boyun ve eğimli omuzlarla insan gibi; sahne 6: sandalyeler içi boş yüksek arkalıklar (dikmeler, üst kemer, oyma ara tahta) olarak çizildi.
- Sahne 10: ufukta geniş sıcak bant + güneş sarayın çatısının arkasından yükselir (sahne 1'in gecesinden net ayrışır).
- Kapak: zoom 1,35 → 1,5, focus [540, 795]: kadran ~y 860–1340, alt üçte birde kaide, raf ve şömine (boş saat gövdesi değil).
- Lint OK; preview: STATIC? uyarısı yok, tüm cue'lar eşleşti, ~28 sn tahmin.

### 01-kis-sarayi-saati — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 9 | 8 | 8 | 7 | 8 | 8 | 8 | 9 | 8 | 8 |
Geçti. Kısa son tur istendi:
1. Sahne 8'de bağlantı eksik → "Ama Sovyetler onu hiç kurmadı."
2. Sahne 10'da büyük turuncu güneş diski fazla → disk kaldırılsın, şafağı ufuk ışığı ve sudaki yansımalar versin.
3. Sahne 5'te üçgen alınlık saraya uymuyor, kapı ve ışık altyazı bandına iniyor → düz pervaz, kapı ~80 px yukarı, ışık üçgeni bandın altından açılsın.

**Yazarın düzeltmeleri (tur 3):**
- Sahne 8: "Ama Sovyetler onu hiç kurmadı." (+4 karakter → 392).
- Sahne 10: güneş diski kaldırıldı; güneş ufkun altında kalıyor, çatının arkasında soluk altın bir ışık yavaşça yükseliyor; ufuk bandı ve sudaki altın yansımalar duruyor.
- Sahne 5: üçgen alınlık yerine düz saray kapı pervazı (iki profilli korniş); kapı, kanatlar ve siluet 80 px yukarıda (eşik y 1160); yerdeki ışık üçgeni altyazı bandında (y 1175–1330) çok soluk, bandın altında açılıyor; "gece 2.10" notu 30 px yukarı alındı.
- Lint OK; preview: STATIC? yok, cue'lar eşleşti, ~28–29 sn tahmin; sheet ve cover görüldü (kapak değişmedi).

