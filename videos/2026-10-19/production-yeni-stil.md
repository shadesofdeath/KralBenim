# Prodüksiyon — 2026-10-19 (yeni stil: sepya parşömen + Kaşif)

Kanal sahibinin isteğiyle yeni stilin ilk iki videosu. Kurallar: `brand/kit/BRAND.md`, beceri: `.claude/skills/tarih-bolumu/SKILL.md`.

## 04-gemiler-karadan (Shorts)

- **Konu:** 1453'te Osmanlı donanmasının bir kısmının karadan Haliç'e indirilmesi — Türk tarihi
- **Hissedilen:** "Zincirle kapatılmış bir limana gemileri tepeden aşırarak girmek mi? Bu imkânsızı tek gecede yaptılar."
- **Yayın:** 2026-10-20T10:00:00+03:00
- **Doğrulanacak bilgiler (yazar web aramasıyla doğrular):** Bizans Haliç'in girişini zincirle kapattı. 22 Nisan 1453 (gece/sabaha karşı) Osmanlı gemileri Galata'nın arkasındaki tepelerden, kızaklar/yağlanmış kütükler üzerinde çekilerek Haliç'e indirildi. Gemi sayısı kaynaklara göre değişir (~67–72): "yetmiş kadar" de. Rota yaklaşık Tophane/Dolmabahçe civarından Kasımpaşa'ya, birkaç kilometre (doğrula). Etkisi: Bizans savunması Haliç surlarına da bölünmek zorunda kaldı.
- **Görsel omurga:** `map` (İstanbul, Haliç, zincir, kara rotası), `stage` (Kaşif şaşırır, işaret eder; gemiyi çeken figürler, `ship` prop), `title`, `timeline` ya da `board`.

## 05-piri-reis-haritasi (uzun video)

- **Konu:** Piri Reis Haritası: 1513'te Amerika'yı nasıl çizdi? — keşifler + Türk tarihi + gizem (efsaneyi düzelt)
- **Hissedilen:** "Kolomb'dan sadece 21 yıl sonra, bir Osmanlı denizcisi dünyanın en değerli haritalarından birini çizmiş — ve hikâyesi uzaylı efsanesinden çok daha iyi."
- **Yayın:** 2026-10-20T17:00:00+03:00
- **Doğrulanacak bilgiler:** Piri Reis (Kemal Reis'in yeğeni), harita 1513'te Gelibolu'da, ceylan derisi (parşömen) üzerine; günümüze bir parçası kaldı; 1929'da Topkapı Sarayı'nda (Gustav Adolf Deissmann) bulundu; haritadaki notlara göre ~20 kaynak kullandı, aralarında Kolomb'un kayıp bir haritası; Kitab-ı Bahriye (1521/1526); Antarktika/uzaylı iddiaları neden yanlış (alt kısım Güney Amerika kıyısının kırılarak çizilmesi olarak açıklanır); UNESCO 1513'ü (500. yıl) 2013'te "Piri Reis yılı" ilan etti (doğrula). Piri Reis'in sonu (1553/1554'te idam) — saygılı ve doğrulanmış biçimde.
- **Bölümler (BÖLÜM n / 5 kartları):** 1 Saraydaki parşömen (1929 keşfi, kanca) · 2 Denizci Piri (Kemal Reis, Akdeniz seferleri) · 3 Yirmi haritadan bir harita (kaynaklar, Kolomb) · 4 Efsane ve gerçek (Antarktika iddiası) · 5 Haritanın mirası (Kitab-ı Bahriye, bugün) + yorum sorusu.
- **Görsel omurga:** `map` (eski harita, Atlantik, kıyılar çizilerek), `stage` (Kaşif parşömeni açar, dürbünle bakar, şaşırır; Piri Reis sarıklı figür), `chapter`, `timeline`, `board` (kaynaklar/efsane-gerçek), `title`. Higgsfield en fazla 2 klip (fırtınalı Akdeniz'de kadırga, sepya çizim), en ucuz model kuralıyla — gerekmiyorsa hiç.

## Eleştiri günlüğü

## Eleştiri günlüğü — 04-gemiler-karadan

### 04-gemiler-karadan — tur 1
lint: OK · preview: 10 sahne, ~34 sn, 495 karakter, STATIC? yok (en düşük hareket sahne 0: 2.9)

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 8 | 6 | 8 | 7 | 7 | 9 | 9 | 8 | 7 |

**Sonuç: GEÇMEDİ** (Görsel=anlatım, Kompozisyon, Derinlik, Kapak+SEO < 8)

1. **Sahne 0, 5 ve kapak (portage): manda keçi gibi, sarılı yelken sörf tahtası gibi duruyor.** En çok görülen kare bu (kapak + ilk saniyeler), ve iki ana nesne yanlış okunuyor. → Mandayı yeniden çiz: daha büyük, kutu gibi ağır gövde, öne doğru alçak tutulan iri baş, **yana ve yukarı açılan geniş yay boynuzlar** (şimdiki arkaya kıvrık boynuz keçi/dağ keçisi okutuyor), kalın kısa bacaklar, boyunda boyunduruk + halat. Yelken: tek beyaz oval yerine **eğik seren (lateen) direği boyunca sarılı kumaş** (seren boyunca 4–5 dalgalı sargı çizgisi, `paper-dark` dolgu) ya da yelkeni tamamen kaldırıp gövdeden çıkan 5–6 kürek çiz. Kadırga gövdesine kıç/baş yükseltisi ekle ki "savaş gemisi" okunsun.
2. **Kompozisyon/derinlik: tüm stage ve portage sahnelerinde içerik y≈300–1110'a sıkışmış, zemin çizgisinin altı (y 1110–1920) boş parşömen; stage sahneleri düz "slayt".** Altyazı bandı (1170–1320) ve UI (>1500) yüzünden alanı içerikle doldurmak gerekmez ama boş görünmemeli. → Zemin çizgisinin altına sahneye göre ön plan dokusu ekle: gemili sahnelerde (2, 3, 6) dalgalı su bandı/iskele kalasları, sur sahnelerinde (6, 8) taş sur tabanı tarama, portage'da yamacı ekranın altına kadar tarama + kütük yığınları; ayrıca arka planda ince `ink-soft` Konstantinopolis silueti (kubbe + sur dişleri) ile ikinci düzlem kur. Figürleri %10–15 büyüt ki karakterler kadrajı daha çok doldursun.
3. **Sahne 6 ve 8 (Bizans askerleri): miğfer kırmızı bereye benziyor, sahne 6'da Bizans askeri dürbün tutuyor (1453'te dürbün yok — dönem hatası; dürbün yalnızca zamansız anlatıcı Kaşif'e ait), sahne 8'de koşan asker "Haliç surları" tabelasının içinden geçiyor ve metin akıcı değil.** → `bizansli` pozunu `look` değil `idle`→`shock` (ya da `point` Haliç'e) yap. Miğferi konik metal miğfer olarak çiz: sivri tepe, burun siperi, `ink-soft`/gri-kahve dolgu, küçük kırmızı tepelik; yuvarlak örgü-bere görünümü kalksın. Sahne 8'de tabelaları sur parçalarına çevir (iki kısa taş sur dilimi + Patrick Hand etiket) ya da koşan askerin `to` değerini tabelanın sağına (0.95) al/tabelayı 0.6'ya çek ki gövde tabelayı kesmesin. Metin: "Bizans, az askerini Haliç surlarına da bölmek zorunda." → **"Bizans, zaten az olan askerini Haliç surlarına da dağıtmak zorunda."** (≈ +10 karakter, bütçe içinde) ya da daha kısa "Bizans artık Haliç surlarını da korumak zorunda."

Ek notlar (küçük):
- Kapak alt üçte biri: yamaç boş, Kaşif köşede. Madde 1 düzelince sahneyi yakınlaştır (gemi + çekenler + manda kadrajın ortasına, y 900–1500), Kaşif'i %20 büyüt ve gemiye işaret ettir (`point`), boş yamaca kalas/kütük taraması koy.
- Sahne 9 (kapanış): cümle güçlü, ama "kaya üstünde oyuncak gemi" görseli sahne 3'ün tekrarı ve "karadan geçti"yi göstermiyor. Portage'ın iniş anı (gemi tepeden Haliç'e kayıyor, Kaşif mutlu işaret ediyor) ya da haritada Haliç içindeki filo daha güçlü bir son kare olur.
- Sahne 9 altyazısında "karadan"ın küçük/kaymış görünmesi kontakt sayfasındaki kelime pop-in anına denk geliyor; t=33.5 karesinde tam boy ve hizalı. Sorun değil.
- Doğruluk: zincir, 21–22 Nisan gecesi Galata arkasındaki tepeden yağlı kalas/kütüklerle çekiş, ~70 gemi ("yetmiş kadar"), insan + hayvan gücü, Bizans'ın Haliç surlarına asker ayırmak zorunda kalması doğru ve iyi bilinen bilgiler. Kaynaklar genellikle "öküz" der; "manda" Türkçe anlatımda yaygın ve kabul edilebilir.

### 04-gemiler-karadan — tur 2
lint: OK · preview: 10 sahne, ~34 sn, 491 karakter, STATIC? yok (en düşük hareket sahne 0: 3.9)

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 8 | 8 | 8 | 8 | 8 | 9 | 9 | 9 | 8 |

**Sonuç: GEÇTİ** (tüm kriterler ≥ 8). Tur 1'deki üç sorun çözüldü: manda artık manda, yelken seren üstünde sarılı, Konstantinopolis silueti + su/iskele/sur/tarama ön planı alt yarıyı dolduruyor, Bizans miğferi konik ve okunuyor, sahne 6'da Bizanslıda dürbün yok, sahne 8'de koşan asker tabelayı kesmiyor, yeni metin akıcı, sahne 9'da gemi tepeden Haliç'e kayıyor.

Kalan küçük sorunlar (isteğe bağlı, geçişi engellemez):
1. Sahne 7 (title): ilk ~0,6–1 sn ekran boş, sadece altyazı ("Zincirin…") var; "Yetmiş" cue'su gelene kadar hiçbir görsel yok. → `note`/arka planda bir sıra küçük gemi silüetini sahne başında (lt=0) getir ya da w0 cue'sunu "Zincirin" kelimesine bağla ki dev yazı hemen başlasın.
2. Kapak: Kaşif'in kolu gemiye "işaret" değil el sallama gibi okunuyor; mandanın başındaki boyunduruk küçük bir kutu gibi duruyor. → Kaşif `point` kolunu gemiye doğru (sol yukarı, dir ≈ 150–160°) yönlendir, işaret parmağı ucu belirgin olsun; boyunduruğu boynun üstünde yatay bir kalas + iki dikey çubuk olarak çiz.
3. Sahne 9: gemi küçük ve kadrajın solunda, Kaşif yana el sallıyor; son kare "karadan geçti" fikrini daha güçlü verebilir. → Gemiyi %25 büyüt, Kaşif'i cue'da (`karadan`) gemiye `point` ettir.

Not: `preview.py --times` ile ardışık olmayan anlar alındığında sahne 7 ve 9'un üstünde sahne 6'dan kalma bir şerit (ayaklar, sütun, gemiler) görünüyor. `build.py --no-tts --still 23.6` ve `--still 32.0` karelerinde bu şerit yok; yani sorun sadece önizlemede. Sahne 9'daki "karadan"ın küçük/kaymış görünmesi kontakt sayfasındaki pop-in anı; t=33.5'te tam boy.

## Eleştiri günlüğü — 05-piri-reis-haritasi

### 05-piri-reis-haritasi — tur 1
lint: OK · preview: 40 sahne, ~236 sn (tahmini), 3.424 karakter, STATIC? yok (en düşük hareket: sahne 13, 4.9)

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 6 | 8 | 6 | 5 | 8 | 8 | 9 | 8 |

**Sonuç: GEÇMEDİ** (Kanca, Okunabilirlik, Görsel=anlatım, Kompozisyon, Derinlik < 8)

1. **Stage sahneleri düz ve yarısı boş. Bu tipte 20 sahne var, videonun yarısı** (1, 2, 4, 7, 10, 11, 13, 14, 15, 19, 20, 22, 26, 27, 29, 31, 33, 35, 37, 39). Hepsinde aynı kadraj kullanılıyor: zemin çizgisi, çöp adam, küçük bir tabela ya da ikon. Üstteki ~%40 boş parşömen, arka plan yok, kamera hareketi yok. Tabela yazıları 1080p'de ~40 px kalıyor (en az 44 px olmalı). Tabelaların solunda kaçak bir alt çizgi var: `_KAYIP`, `_1820`, `_SENCE?`, `_Kitab-ı Bahriye`, `_PİRİ REİS`. → `stage`'e sahne başına `backdrop` katmanı ekle (`ink-soft`, %40–60 opak, boil'li). Topkapı silueti (kubbeler, mutfak bacaları, Bâbüsselâm kuleleri) 1, 2, 4 ve 37'ye. Ufuk çizgisi + dalga bandı + uzak kıyı 7, 10, 11, 14, 20 ve 35'e. Gelibolu limanı (iskele, kale kulesi) 13 ve 15'e. Zemin çizgisinin altına tarama/kum dokusu koy. Figürleri ve propları ~1,2× büyüt. Zemini, içerik y≈0,22–0,80 aralığını dolduracak biçimde yerleştir. Sahne boyunca 1,00→1,06 yavaş itme ve hafif yatay kayma ekle. Tabela yazısını ≥ 48 px yap ve sign render'ındaki öndeki `_` karakterini/çizgisini kaldır.
2. **Görsel anlatılanı göstermiyor ya da dönemle çelişiyor.**
   - **Sahne 14:** "fırtına… gemisi batıyor" deniyor ama ekranda sakin denizde dik bir yelkenli var, gemi batmıyor. → Dalga bandı ekle, `fırtına` cue'sunda çapraz yağmur çizgileri ve şimşek çaksın. `batıyor`da gemi 20° yatsın ve dalgaların altına insin.
   - **Sahne 35:** 1550'lerde Piri Reis'in elinde dürbün var. Dürbün 1608'de icat edildi, bu bir dönem hatası (04'te de aynı not çıkmıştı; dürbün yalnızca Kaşif'e ait). → `look` yerine `idle`/`point` kullan. Yaşlı Piri'ye gri sakal ekle.
   - **Kemal Reis ile Piri birebir aynı figür** (10, 11, 13, 15, 20, 33). → Kemal'e sakal ve daha iri gövde ver, genç Piri sakalsız olsun, yaşlı Piri gri sakallı olsun.
   - **Sahne 18:** `c1` ve `d` cue'larının ikisi de son kelime "var". Bu yüzden "Bir tane daha" kartı ancak son anda çıkıyor ve sahne boyunca sağ yarı boş kalıyor. → Kartı `Arap`tan ~0,8 sn sonra açtır ya da kartı tek kart olarak ortala.
   - **Sahne 22:** "KAYIP" yanındaki kapının anlamı yok. → Kapı yerine yırtılmış/silinen bir harita propu koy.
3. **Kanca geç geliyor.** İlk 10,7 sn bölüm kartı ve iki ikona yürüyen Kaşif'ten oluşuyor. Harita ilk kez 16,7. sn'de görünüyor. Kapak vaadi "1513'te Amerika'yı çizdi" ancak ~36. sn'de (sahne 6) karşılanıyor. → BÖLÜM 1 kartından önce 4–5 sn'lik bir soğuk açılış ekle. `pirimap` loupe modunda "Kolomb'dan yalnızca yirmi bir yıl sonra, bir Osmanlı denizcisi Amerika'yı çiziyor." cümlesiyle Amerika kıyısını büyüteçle göster; bu, kapakla aynı fikir. Ardından "1929. İstanbul, Topkapı Sarayı." ile bölüm kartına geç. Karakter bütçesi bunu kaldırır (~70 karakter, toplam ~3.500). Sahne 5'teki "21 yıl" tekrarını kısalt.

Ek notlar (küçük):
- **Sahne 28 kalabalık.** Üstü çizili "ANTARKTİKA?" gemi ve kıvrık okun üstüne biniyor, "Güney Amerika" etiketi kıyı çizgisini kesiyor. → Üstü çizili etiketi kıyı çizgisinin altında, derinin dışında küçült (size 44). "Güney Amerika"yı v≈0,48'e taşı. Kesikli "düz devam" çizgisini daha uzun ve belirgin çiz.
- **Sahne 9 ve 12:** "Karadeniz" etiketi haritanın sağ kenarında kesiliyor. **Sahne 21:** "Karayipler" etiketi "Kolomb, 1492" notunun altında kalıyor; notu kuzeye (dy −80) taşı.
- **Harita çizimi şematik.** Ortası kum saati biçiminde ve gerçek Piri Reis parçasına (sağda İber/Afrika, solda Güney Amerika, üstte Karayipler) benzemiyor. 3. turda kıyı çizgisini gerçek fragmana yaklaştırmak "Görsel=anlatım"ı yükseltir.
- **Doğruluk.** Şunların hepsi doğru ve iyi biliniyor:
  - 1513, ceylan derisi, ~1/3'ünün (batı parçası) günümüze kalması.
  - 1929'da Topkapı'da Deissmann'ın bulması.
  - Notlara göre ~20 kaynak ve Kolomb'un kayıp haritası.
  - Kemal Reis'in esir aldığı, Kolomb'la sefere çıkmış İspanyol denizci (Piri'nin notuna göre).
  - Kemal Reis'in 1511'de fırtınada batan gemisi.
  - Kitab-ı Bahriye 1521/1526 (Kanuni), ikinci harita 1528.
  - Antarktika'nın 1820'de görülmesi.
  - Ana akım görüş olarak kıyının deriye sığdırılmak için kıvrılması.
  - Notta "sıcak / büyük yılanlar" geçmesi.
  - UNESCO'nun 500. yılı 2012–2013 anma yıldönümlerine alması.
  - 1553'te Kahire'de idam, "büyük olasılıkla" ile.

  Hafif abartılar:
  - **Sahne 22:** "onun bilinen tek izi olabilir" ifadesini "en önemli izi olabilir" ya da "bugüne kalan en iyi izi" olarak yumuşat.
  - **Sahne 24:** Efsane 1950'lerde Mallery ile başladı, Hapgood 1966'da yaydı. "1950'ler ve 60'larda" de.
  - **Sahne 35:** "seksenini aşmışken" ifadesi doğum yılı belirsiz olduğu için "seksenlerindeyken" ya da "çok yaşlıyken" olarak yazılmalı.
- **Kapak.** 1513'TE / AMERİKA'YI / ÇİZDİ yazısı küçük ekranda okunuyor. Halka Amerika kıyısında, Kaşif'in yüzü okunuyor. İyi. Kaşif'i bir tık büyütüp `shock`/`point` pozuyla halkaya döndürürsen daha dramatik olur. Başlık 52 karakter, ana anahtar kelimeyle başlıyor ve video vaadini karşılıyor.

### 05-piri-reis-haritasi — tur 2
lint: OK (ses `j4vJUfke1j8j9OYq8V3b`, kanal sahibinin yeni kararıyla uyumlu) · preview: 40 sahne, ~235 sn, 3.418 karakter, STATIC? yok (en düşük hareket: sahne 8, 5.6). Sahneler 0'dan numaralı; soğuk açılış eklendiği için 1. turdaki numaralar +0 ile +1 arasında kaydı.

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 9 | 8 | 7 | 8 | 9 | 9 | 8 |

**Sonuç: GEÇMEDİ** (yalnızca Derinlik < 8). Büyük ilerleme var. Soğuk açılış (sahne 0) kapakla aynı fikri taşıyor. Tabelalar büyüdü ve `_` kalktı. Sakal ayrımı (Kemal siyah, genç Piri yok, yaşlı Piri gri) okunuyor. Dürbün dönem hatası düzeldi. Sahne 18 kartı ve sahne 22'deki yırtık harita yerinde. Sahne 28 sadeleşti. Harita etiketleri ve doğruluk ifadeleri (22, 24, 35) düzeldi.

1. **Sahne 14 (fırtına): dalga bandı sert kenarlı bir dikdörtgen.** Açık renkli su dolgusu kadrajın yalnız sağ yarısında. Solda dikey keskin bir kenarla bitiyor ve altyazı şeridinin arkasına kadar uzanıyor; "yapıştırılmış kutu" gibi duruyor. Şimşek kontakt karelerinde hiç görünmüyor, gökyüzü tonu da değişmiyor. → Dalga bandını tam genişlik yap (x 0→1920), üst kenarı dalgalı mürekkep çizgi, dolgu `paper-dark` olsun ve dolgu kenarında dikey çizgi kalmasın. `storm` cue'sunda 0,15 sn'lik `ink` zikzak şimşek çak ve ardından 0,3 sn `paper-light` parlama ver. Gökyüzüne `ink-soft` %15 çapraz bulut taraması ekle. Gemi batarken önünden bir dalga tepesi geçsin (gemi dalganın arkasına insin).
2. **Derinlik hâlâ ince: arka planlar tek düzlem kontur, paralaks yok.** Topkapı silueti, ufuk ve dalga çizgileri aynı ince `ink-soft` çizgiyle, figürlerle aynı hızda itiliyor. Ön plan katmanı yok. Stage sahnelerinde üst ~%30 hâlâ boş (2, 3, 5, 7, 22, 26, 27, 29, 39). → Üç katman kur:
   - **Uzak plan:** `paper-dark` dolgulu, %50 opak tepe/uzak kıyı ya da kubbe kütleleri. Push-in'de 0,4× hızla hareket etsin.
   - **Orta plan:** bugünkü siluet çizgisi, 0,7× hızla.
   - **Ön plan:** kadraj kenarından kırpılan bir eleman (halat kangalı, sandık, iskele direği, saray sahnesinde perde/kemer kenarı), 1,15× hızla ve figürlerden büyük.

   Boş göğe 2–3 `ink-soft` martı ya da bulut kıvrımı ekle (boil'li, yavaş süzülen). Kemer/kapı çerçevesi gibi bir öğe saray sahnelerinde üst boşluğu da doldurur.
3. **Sahne 10 (ve 20): "Kemal Reis" el yazısı etiketi sarığın üstüne biniyor.** Figür 1,2× büyüyünce etiket y=0,17 sarığın tepesine denk geliyor ve "Kemal Reis" sarığın içinden okunuyor. → Etiketi figürün yanına taşı (x 0,72, y 0,30) ve kısa bir okla başa bağla, ya da etiketi y 0,08'e al. Aynı kontrolü diğer büyütülmüş figür + `label` sahnelerinde yap (2/3 Deissmann, 35 "büyük olasılıkla 1553"). Şu an bunlar temiz.

Ek notlar (küçük):
- **Sahne 36 (UNESCO):** düz yazı sahnesi. Kabul edilebilir, ama altta 1513 → 2013 tarih çizgisi ya da yanda Kaşif `point` eklemek kartı canlandırır.
- **Sahne 28:** üstü çizili "ANTARKTİKA?" artık derinin dışında ve doğru fikri veriyor. Yazı küçük ama çizgiyle birlikte anlaşılıyor.
- **Kapak:** değişmedi ve hâlâ iyi (yazı okunuyor, halka Amerika'da, Kaşif'in yüzü belirgin).
