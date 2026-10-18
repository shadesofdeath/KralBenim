# Prodüksiyon — 2026-10-18

Plan (`tools/plan.py`): 2 Shorts, uzun video yok (sonraki uzun video: 2026-10-22). ElevenLabs bu ay 23.835 karakter, uyarı yok.
Ortam notu: Wikimedia/Pexels erişimi bu bulut ortamında engelli (proxy 403) → gerçek fotoğraf yok; her video en az bir 3D sahne taşır.
Dünün (2026-10-17) 5 videosunun hepsi YouTube'a yüklenmiş.

## 01-saat-yonu

- **Konu / kategori:** Saat yönü neden sağa doğru? — gündelik tasarımların hikâyesi + tarih
- **Hissedilen:** "Duvardaki saat aslında yüzlerce yıl önceki bir gölgeyi taklit ediyormuş!" — her gün baktığı şeyin kökenine şaşırma.
- **Palet:** `desert` (güneş saati, sıcak öğle ışığı) → `sunset` (Avrupa/ustalar) → `space` (Dünya küresi); kapanış `desert`.
- **Kanca + kapak:** ilk cümle "Saatler aslında Güneş'i taklit ediyor." ↔ kapak `SAATLER / GÜNEŞİ / TAKLİT EDİYOR`, vurgu `GÜNEŞİ`.
- **Yayın:** 2026-10-18T12:00:00+03:00
- **Doğruluk notları:** Kabul gören açıklama: mekanik saatler 13. yüzyıl sonu–14. yüzyılda Avrupa'da (kuzey yarımküre) ortaya çıktı; ondan önce yaygın zaman ölçer güneş saatiydi. Kuzey yarımkürede (tropiklerin kuzeyinde) yatay güneş saatinin gölgesi gün boyu batı → kuzey → doğu yönünde, yani yukarıdan bakınca saat yönünde döner. İlk saat yapımcıları bu alışılmış yönü sürdürdü. Güney yarımkürede gölge ters (saat yönünün tersine) döner. "Kesin tek bir yasa/karar" gibi anlatma; "ustalar alışılan yönü korudu" de. Tarih için "1300'ler civarı" / "yaklaşık 700 yıl önce" yeterli.

### Çekim listesi

| # | Anlatım (taslak) | Visual | Tip | Cue | Kamera / hareket |
|---|---|---|---|---|---|
| 0 | Saatler aslında Güneş'i taklit ediyor. | 3D güneş saati; gnomonun keskin gölgesi kadranda süzülüyor, arkada parlayan güneş; kapak yazısı üstte | sundial (yeni 3D) | hit: güneş | alçak açı, yavaş dolly-in |
| 1 | Mekanik saatten önce zamanı gölge gösterirdi. | Aynı güneş saati, kadrandaki saat çizgileri (VI…XII…VI) ve gölge bir çizgiden diğerine kayıyor | sundial | hit: gölge | match cut: kamera yükselir |
| 2 | Güneş doğudan doğar, batıdan batar. | Güneş gökyüzünde doğu→batı yayı çizer, gölge tam ters tarafta uzayıp kısalır; D / B etiketleri | sundial (arc) | hit: batı | geniş plan, kamera hafif döner |
| 3 | Kuzey yarımkürede gölge hep aynı yöne döner. | Tepeden bakış: gölge kadranda soldan sağa süpürür, arkasında amber yay + ok | sundial (top) | hit: aynı | kamera tepeye süzülür |
| 4 | Soldan sağa, tıpkı bugünkü saat ibresi gibi. | Bölünmüş ekran: solda gölge yönü (ok), sağda saat ibresi aynı yönde | compare | left/right | iki taraf sırayla |
| 5 | İlk mekanik saatler 1300'lerde Avrupa'da yapıldı. | 3D Dünya, kuzey yarımküre aydınlık/vurgulu, Avrupa üzerinde parlayan nokta + "AVRUPA" | planet / sundial(globe) | hit: Avrupa | yavaş dönüş |
| 6 | Ustalar, herkesin alıştığı gölge yönünü kopyaladı. | 3D saat kadranı; ibre dönerken altında soluk bir gölge "hayalet"i aynı yönde ilerliyor | sundial (clock) | hit: kopyaladı | yakın plan, maskot explain |
| 7 | Güney yarımkürede ise gölge ters döner. | Güney yarımküredeki güneş saati: gölge sağdan sola, kırmızı ters ok | sundial (south) | hit: ters | kamera tepeden |
| 8 | Saat orada icat edilseydi, ibreler sola dönebilirdi. | Saat kadranı ibreleri saat yönünün tersine dönüyor; maskot think | sundial (clock, reverse) | hit: sola | punch |
| 9 | Yani saat yönü, kuzeyde düşen bir gölgenin yönü. | Dev yazı kapanış: "SAAT YÖNÜ = GÖLGE YÖNÜ"; maskot happy | headline | w… | kelimeler çarpar |

Yeni sahne tipi: `scenes/studio/shots/sundial.js` (3D) — modlar `dial` (yakın), `arc` (güneş yayı), `top` (tepe), `south` (ters yön), `clock` (kadran + ibre, `reverse` parametresi). Kadran gölgesi ve güneş konumu `lt`'nin saf fonksiyonu; art arda sahnelerde aynı dünyada match cut.

## 02-kelime-anlamsizlasir

- **Konu / kategori:** Bir kelimeyi çok tekrar edince neden anlamsızlaşır? (anlamsal doyum) — psikoloji
- **Hissedilen:** "Az önce bunu kendi kafamda yaşadım!" — izleyici videoyu izlerken etkiyi bizzat hisseder, sonra beynin anlamı her seferinde yeniden kurduğunu öğrenir.
- **Palet:** `lab` (beyin, nöronlar) → `noir` (anlamın söndüğü an) → `candy` ya da `lab` (anlamın geri dönüşü).
- **Kanca + kapak:** ilk cümle "Bu kelime birazdan anlamsızlaşacak." ↔ kapak `BU KELİME / ANLAMSIZLAŞACAK`, vurgu `KELİME`.
- **Yayın:** 2026-10-18T19:00:00+03:00
- **Doğruluk notları:** Olgunun adı "anlamsal doyum" (semantic satiation); terim psikolog Leon Jakobovits James'in 1962 McGill doktora tezine atfedilir (yazar doğrulasın; emin değilse yıl/isim kullanma). En yaygın açıklama: "reaktif ketlenme" — aynı sinirsel örüntü art arda uyarılınca tepkisi geçici olarak zayıflar. Bu bir **hipotez**: "bilim insanlarına göre" / "en güçlü açıklama" de, kesin kanıtlanmış gibi anlatma. Kısa dinlenmeden sonra anlam geri gelir. Tekrar sayısı/saniye gibi kesin sayı verme.

### Çekim listesi

| # | Anlatım (taslak) | Visual | Tip | Cue | Kamera / hareket |
|---|---|---|---|---|---|
| 0 | Bu kelime birazdan anlamsızlaşacak. | Dev "KAŞIK" yazısı nabız gibi atıyor; kapak yazısı üstte | headline / wordecho (yeni 2D) | w0 | hızlı punch |
| 1 | Kaşık. Kaşık. Kaşık. Kaşık. | Her tekrarda yeni bir "KAŞIK" kopyası çarpar, öncekiler soluklaşıp geriye kayar (yankı tüneli) | wordecho | her "kaşık" | derinliğe doğru zoom |
| 2 | Bak, kelime tuhaf bir ses yığınına dönüşüyor. | Harfler K-A-Ş-I-K birbirinden ayrılıp dağılıyor, anlamsız heceler | wordecho (scatter) | hit: ses | harfler sallanır |
| 3 | Buna anlamsal doyum deniyor. | Dev yazı "ANLAMSAL DOYUM", sub "semantic satiation" ya da sayaç 1962 | headline | w0 | maskot shock |
| 4 | Bir kelimeyi duyunca beyninde bir sinir ağı ateşlenir. | 3D nöron ağı: düğümler arasında parlak sinyaller akıyor, merkezde "KAŞIK" kümesi yanıyor | neurons (yeni 3D) | hit: ateşlenir | kamera ağın içinde süzülür |
| 5 | Aynı ağı üst üste uyarırsan, nöronlar yorulur. | Aynı ağ: her darbe daha sönük, düğümler griye dönüyor | neurons (fade) | hit: yorulur | match cut, kamera yakınlaşır |
| 6 | Her tekrarda verdikleri tepki biraz daha zayıflar. | Çubuklar: 1., 2., 3., 4. tekrar tepkisi azalarak (nitel, sayı yok) | bars | b0…b3 | |
| 7 | Ses kulağına hâlâ geliyor, ama anlam artık gelmiyor. | Bölünmüş ekran: "SES ✓" yeşil / "ANLAM ✗" kırmızı | compare | left/right | |
| 8 | Neyse ki birkaç saniye dinlenince anlam geri döner. | Nöron ağı yeniden aydınlanıyor, sinyaller tekrar akıyor | neurons (recover) | hit: geri | kamera geri çekilir, maskot happy |
| 9 | Yani anlam kelimede değil, onu her seferinde yeniden kuran beyninde. | Dev yazı kapanış; vurgu "BEYNİNDE" | headline | w… | |

Yeni sahne tipleri: `scenes/studio/shots/neurons.js` (3D nöron ağı, `mode: fire|fade|recover`, ateşleme şiddeti `lt` ve cue'ya bağlı) ve gerekirse `scenes/studio/shots/wordecho.js` (2D tekrar/yankı + harf dağılması). Tekrar sahnesinde altyazı her "kaşık"ı yakar.

Not (her iki video): yazar ajan metni 400–500 karaktere, sahne başına tek cümleye uydurur; görsel tipleri `visual` ile birebir eşleşmezse değiştirir; çeşitlilik kuralı (≥ 4 tip, 2D'de üst üste ≤ 2) korunur.

## Eleştiri günlüğü

### 01-saat-yonu — tur 1
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 8 | 7 | 7 | 8 | 8 | 8 | 7 |

lint: OK (1 uyarı: gerçek foto yok — ortam kısıtı). 448 karakter, 10 sahne, 5 tip. **Geçmedi.**
1. Sahne 9 (kapanış headline): iki kelimelik `highlight` eşleşmiyor (amber kutu yok); satırlar üst üste biniyor (Ö/Ü noktaları üst satıra çarpıyor), maskot yazıya biniyor, alt yarı boş → `lines` 3 satır ("Saat yönü", "=", "gölge yönü"), `highlight: ["gölge"]`, maskot küçük/uzak ya da kaldır.
2. Kanca/kapak sorunun kendisini (yön) söylemiyor; başlık "neden sağa doğru" doğal arama değil → ilk cümle "Saat yönünü aslında bir gölge belirledi.", kapak `SAAT YÖNÜNÜ / BİR GÖLGE / BELİRLEDİ` (vurgu GÖLGE), başlık "Saat Yönü Neden Bu Yönde? Cevap Bir Gölgede ☀️".
3. Sahne 3 (arc): güneş saati altyazı bandının arkasında (y≈1000–1430), gölge görünmüyor → kamera ile kadranı y≈750–1100'e çıkar; gnomon şekli sahne 0 ile tutarlı olsun.
Diğer: sahne 5 compare alt yarısı boş/düz; sahne 7 "GÜNEY YARIMKÜRE" etiketi zayıf; "soldan sağa" sadece üst yarı için geçerli, "kuzey yarımkürede" yerine "kuzeyde/Avrupa'da" daha güvenli; sahne 2 gölge saatleri visual ile uyuşmuyor.

### 02-kelime-anlamsizlasir — tur 1
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 7 | 8 | 9 | 7 | 7 | 7 | 8 | 9 | 9 |

lint: OK (1 uyarı: gerçek foto yok — ortam kısıtı). 481 karakter, ~34 sn, 10 sahne, motion min 4.3. **Geçmedi.**
1. Sahne 9 (kapanış headline): satırlar çarpışıyor (Ğ şapkası üst satıra giriyor), satır kenarlara değiyor, maskot yazıya biniyor, 6,2 sn uzun → `lines` ["Anlam", "kelimede değil,", "beyninde!"], cümle "Yani anlam kelimede değil, onu kuran beyninde.", maskotu kaldır/uzaklaştır.
2. Sahne 7 (compare): ANLAM paneli son kelimede giriyor, alt yarı %80 süre boş; "VS" rozeti anlamı bozuyor → `cues.right: "anlam"`, VS kapatılamıyorsa farklı tiple kur.
3. Tempo/derinlik: 10 sahnenin 6'sı düz 2D; decay alt yarı boş → sahne 6'yı neurons akışına bağla ya da derinlik ekle.
Diğer: sahne 1 başında yankı kopyaları ön yazıyla karışıyor (opaklık ≤0.35); sahne 5'te düğüm kicker'a biniyor; "Bilim insanlarına göre" kesin uzlaşı gibi → "En yaygın açıklamaya göre".

### 01-saat-yonu — tur 2
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 8 | 8 | 9 | 8 | 8 | 8 | 9 | 9 | 9 |

lint: OK (sadece "gerçek foto yok" — ortam kısıtı). 426 karakter, ~31 sn, 10 sahne, motion min 2.7 (kanca, kapak altında). **Geçti.** Tur 1 sorunları giderildi (kanca/kapak, sahne 9, sahne 3, sahne 5 `pair`, Kuzeyde/Güneyde).
Kalan küçük sorunlar (3. tur yapılmadı):
1. Sahne 5 (`clockface` pair): görseller küçük, alt yarı boş → `camera.dist` 16.
2. Sahne 9: en düz kare, alt yarı boş; maskot kapanışta yok → `mascot: happy` küçük.
3. Sahne 2: gölge IX–X yerine XI–XII'ye yakın görünüyor → `hours` aralığı ya da `visual` düzeltmesi.

### 02-kelime-anlamsizlasir — tur 2
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 8 | 8 | 9 | 8 | 8 | 8 | 9 | 9 | 9 |

lint: OK (sadece "gerçek foto yok" — ortam kısıtı). 451 karakter, ~33,8 sn, 10 sahne, 6 tip, motion min 3.8. **Geçti.** Tur 1 sorunları giderildi (sahne 9 `statement`, sahne 7 `signal`, decay derinliği, yankı opaklığı, hipotez çerçevesi).
Kalan küçük sorunlar (3. tur yapılmadı):
1. Sahne 7 (`signal`): "kurulmuyor" alt yazısı cue'dan önce görünüyor; çift kırmızı X; kırık ANLAM etiketi soluk.
2. Sahne 9 (`statement`): arka plandaki beyin konturu bulut gibi, sap çizgisi harflerden geçiyor; alt yarı boş.
3. Sahne 6 (`decay`): hayalet "KAŞIK" sağ kenarda kesiliyor.
Motor notu: altyazıda aktif kelime büyüyünce önceki kelimeye yapışıyor ("geridöner") — ayrı iş.

Yönetmen notu: iki video da 2. turda geçti; süre sınırı (~1 saat) nedeniyle 3. tur atlandı.
