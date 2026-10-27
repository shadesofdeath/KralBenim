# 01 — Çemişgezekli İoannes: tahtı bir yatak odasında alan imparator (günlük Shorts)

- **Dosya:** `01-<slug>.json` (yazar slug'ı koyar, ör. `01-cemisgezekli-ioannes.json`) · format short · publish_at `2026-10-27T19:00:00+03:00` (İstanbul 19:00)
- **Havuz:** imparatorlukların yükselişi ve çöküşü (plan.py önerisi).
- **Manşet:** Türkiye — Hürriyet / Habertürk / Yeni Asır, Ekim 2026: "Karaburun'da şaşırtan keşif! Suyun 3 metre altında 1050 yıl önceye ait altın sikke bulundu" — amatör dalgıcın denizde bulup teslim ettiği, "Çemişgezekli İoannes" (I. İoannes Tzimiskes, 969–976) döneminde basılmış Doğu Roma altın sikkesi. (`tools/news.py` bu ortamda Google News'e erişemedi: proxy 403; manşet web aramasıyla bulundu.)
- **Hikâyenin özü:** sikkenin üstündeki imparator tahtı 10–11 Aralık 969 gecesi bir cinayetle aldı: amcası (dayısı) II. Nikephoros Phokas'ı imparatoriçe Theophano'nun yardımıyla, Bukoleon sarayındaki yatak odasında öldürdü. Patrik Polyeuktos onu kiliseye sokmadı; taç için bedel: Theophano'yu sürmek, katilleri cezalandırmak, servetini dağıtmak. Sonra iyi bir imparator oldu (Rus seferi 971). Adı bugün Tunceli'deki Çemişgezek'ten gelir.
- **Geçmişle çakışma:** kanalda Bizans/Doğu Roma imparatoru videosu yok (Rum Ateşi farklı konu/dönem; Son Roma İmparatoru Batı Roma 476).

## Yazar notları (01-cemisgezekli-ioannes.json)

- **Doğrulama:** Hürriyet / Ege Telgraf (7 Ekim 2026): amatör dalgıç Karaburun açığında, 2–3 metre derinlikte, nisan ayında buldu; sikkenin bir yüzünde İsa, diğerinde Meryem imparatoru sağ eliyle taçlandırıyor; İzmir Arkeoloji Müzesi'ne teslim edildi. Wikipedia (John I Tzimiskes; Theophano): Nikephoros dayısı (annesinin kardeşi); Theophano yatak odası kapılarını sürgüsüz bıraktı, İoannes fırtınada Boğaz'ı geçip saraya sokuldu ve dayısını öldürdü; patrik Polyeuktos suç ortakları cezalandırılmadan ve Theophano saraydan uzaklaştırılmadan taç giydirmeyi reddetti; Theophano Prinkipo'ya (Büyükada; bazı kaynaklara göre Prote/Kınalıada) sürüldü, bu yüzden ekranda sadece "Adalar". Britannica: "forced to do penance by Polyeuctus", Theophano'yu sürdü, katilleri cezalandırdı. Doğrulanamayan ayrıntılar (sepet, ayı postu, servet dağıtma) kullanılmadı. `tools/media.py` proxy 403 verdi: gerçek sikke fotoğrafı yok, sikke kodla çizildi.
- **İzleyici sonunda ne hisseder:** "Sikkedeki kutsal taç bir cinayetle geldi; tahtı ona açan kadını da ilk o sattı." Soğuk bir ironi + "bunu hiç bilmiyordum".
- **Kanca + kapak:** ilk cümle "Bu altını bir katil bastırdı." ↔ kapak "BU ALTINI / KATİL / BASTIRDI" (KATİL kırmızı kutuda); kıyıda dev altın sikke (Meryem imparatoru taçlandırıyor) + şok olmuş büyük Kaşif.

### Anlatım (tek parça, 437 karakter)
Bu altını bir katil bastırdı. Karaburun'da bir dalgıç onu denizde buldu. Üstündeki imparatoru tanıyor musunuz? Çemişgezekli İoannes. Peki tahtı nasıl aldı? 969'da bir gece, imparatoriçe Theophano kapıları açık bıraktı. İoannes içeri girdi ve imparator dayısını öldürdü. Ama patrik şart koştu: taç istiyorsan Theophano'yu sürgüne gönder! Ve İoannes, kapıyı ona açan kadını sürgüne yolladı. Her gün böyle gerçek bir hikâye için abone olun.

### Çekim listesi
| # | Cümle | Tip | Dekor / kamera | Görsel | Kaşif | Cue |
|---|---|---|---|---|---|---|
| 0 | Bu altını bir katil bastırdı. | `tz_coin` hold | coast, otomatik | denizden damlayarak yükselen dev histamenon (Meryem imparatoru taçlandırıyor), kayalar + deniz ekranın altına | büyük, kayada sikkeyi gösterir → `katil`de şok | hit: katil |
| 1 | Karaburun'da bir dalgıç onu denizde buldu. (kicker: Karaburun · 1050 yıllık) | `tz_dive` | set yok (kendi su altı), otomatik | kum, taş, deniz çayırı, ışık huzmeleri; dalgıç eli iner, sikkeyi kavrar; "2-3 metre derinlik" | — | reach: dalgıç, take: buldu |
| 2 | Üstündeki imparatoru tanıyor musunuz? Çemişgezekli İoannes. | `tz_coin` face | interior, **yakın plan** focus [600,640] ×1.7 | müze masası, kırmızı kadife, Meryem'in eli tacı imparatora indirir | — | crown: imparatoru, glint: Çemişgezekli |
| 3 | Peki tahtı nasıl aldı? | `tz_shore` night | storm | fırtınalı Boğaz, surlu saray + deniz kapısı, kapüşonlu figürlü kayık, şimşek | — | flash: tahtı |
| 4 | 969'da bir gece, imparatoriçe Theophano kapıları açık bıraktı. | `tz_door` | interior | mozaikli koridor, taçlı Theophano sürgüyü çeker, kanat karanlığa açılır, mermer zemin | — | open: açık |
| 5 | İoannes içeri girdi ve imparator dayısını öldürdü. | `tz_bed` | interior | uyuyan imparator, duvarda kılıçlı adamın büyüyen gölgesi; mum söner, duman (şiddet gösterilmez) | — | hit: öldürdü |
| 6 | Ama patrik şart koştu: … sürgüne gönder! | `tz_gate` | city | Ayasofya kapısı, patrik asasıyla yolu keser, yastıkta taç, İoannes başını eğer; damga "THEOPHANO: SÜRGÜN!" | — | deny: şart, stamp: sürgüne |
| 7 | Ve İoannes, kapıyı ona açan kadını sürgüne yolladı. | `tz_shore` exile | sea | kırmızı örtülü Theophano kayıkla adaya, "Adalar" oku, martılar | — | tag: kadını |
| 8 | Her gün böyle gerçek bir hikâye için abone olun. | `tz_coin` hold | coast | denizin üstünde süzülen sikke | sikkeyi gösterir → `abone`de el sallar | wave: abone |

Kaşif 2/9 sahne (%22). Tipler: tz_coin, tz_dive, tz_shore, tz_door, tz_bed, tz_gate (yeni dosyalar: `scenes/studio/shots/tz__lib.js`, `tz_coin.js`, `tz_dive.js`, `tz_shore.js`, `tz_door.js`, `tz_bed.js`, `tz_gate.js`; `mcB__lib.js` (cast/labels) ve `kaime__lib.js` (el) sadece okunarak kullanılır).

### Kapak adayları
1. Sahne 0, "KATİLİN / ALTINI": sikke küçük, Kaşif sağ kenardan kesik. Elendi.
2. Sahne 5, "TAHTI / CİNAYETLE / ALDI": yatak odası + gölge; gölge silik, karmaşık, tek odak yok. Elendi.
3. Sahne 2 yakın plan, "BU ALTINI / KATİL / BASTIRDI" + kapak Kaşif'i: çok güçlü ama ilk sahneyle kare uyuşmuyor.
4. **Seçilen:** sahne 0 (t 1.6, sikke büyütüldü r 320, Kaşif x 0.72), "BU ALTINI / KATİL / BASTIRDI": tek dev sikke + şok Kaşif tam boy, ilk cümleyle aynı fikir.

## Eleştiri günlüğü

### Eleştiri günlüğü — Tur 1 (01, eleştirmen)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 6 | 6 | 7 | 6 | 7 | 8 | 8 | 7 | 8 |

Lint: OK. Preview motion: s0 **2.0** (düşük), s1 19.4, s2 15.0, s3 10.5, s4 16.6, s5 13.5, s6 15.3, s7 9.5, s8 11.2. ~31 sn, 437 karakter, Kaşif 2/9 (%22).
Geçmedi: Okunabilirlik, Görsel=anlatım, Kompozisyon < 7.

**En büyük 3 sorun**
1. **Sahne 6 (`tz_gate`) — damga kicker'ın üstüne biniyor ve kadraj dışına taşıyor; alt yarı boş.** "THEOPHANO: SÜRGÜN!" (label y 0.2, size 80) kicker kutusunu (x 52–570, y 158–290) kesiyor, sağ ucu x 1080'de kırpılıyor. → label `y: 0.36`, `size: 64`, `rot` ≈ −4; genişlik ≤ 960 px. y 1320–1920 sadece çıplak karo ızgara → ön plan katmanı indir (avlu korkuluğu / nöbetçi ve kalabalık başları, basamakların devamı) ya da `camera: {focus: [520, 860], zoom: 1.6, move: "push"}` ile patrik + İoannes + tacı kadraja doldur. Visual "İoannes başını eğiyor" diyor ama İoannes çene tutup düşünüyor ve bacakları basamakta kesik → başı öne eğik, eli göğüste pozu, tüm boy basamağın üstünde. Kubbe çıplak gri tümsek, Ayasofya okunmuyor → kubbe tabanına pencere dizisi + iki yarım kubbe + payandalar (minare yok, 969 için doğru).
2. **Sahne 5 (`tz_bed`) — videonun kilit anı (cinayet) zayıf ve kâğıt boş.** Gölgede kılıç okunmuyor: x≈470–535, y 350–1130 arası ince kahverengi kama sütun gibi duruyor; gölge figürü yatağa doğru "büyümüyor" gibi. `set: interior` penceresi (x 665–915, y 220–560) kemerli ay penceresinin arkasına çakışıyor (çift pencere). Uyuyan imparator x ≈ 880–1020'de küçük ve yatak sağda x 1060'ta kesik; y 1160–1920 ortası gri lekeli boş halı. → `set` penceresini kapat (ya da sahneye `set: false` + kendi duvarı); kılıcı gölge elinde net bir bıçak silueti olarak çiz (kabza + 300 px ağız) ve `öldürdü`ye kadar gölgeyi yatağın üstüne uzat; `camera: {focus: [640, 900], zoom: 1.6, move: "push"}` ile yatak + gölge + mum kadrajı doldursun; yatak tamamen kadrajda.
3. **Sahne 1 (`tz_dive`) — dalgıç okunmuyor, sikke küçük.** Sağ üstten inen şey (x 660–1080, y 0–1060) maskesiz, eldivensiz, düz kahverengi bir direk/ağaç gövdesi gibi; sikke r 120, yarısı gömülü ve x 400–580, y 1015–1090'da altyazı şeridinin hemen üstünde, içindeki Meryem/imparator seçilemiyor. Visual'daki "sikkeyi kaldırıyor, izleyiciye dönüyor" kareye gelmiyor. → kola dalgıç elbisesi kolu + bilek kayışı/eldiven, köşeden maske + şnorkel ucu ver; sikke `r: 190`, `buldu`da `y 0.55 → 0.40`'a yükselsin ve yüzü dönerek tam görünsün (spring + punch). Kabarcıklar elden çıksın.

**Senaryo notları (metin tek başına, 7):**
- Punchline "Ve İoannes, kapıyı ona açan kadını sürgüne yolladı." içinde "ona" belirsiz (Theophano'ya mı, İoannes'e mi?). → "Ve İoannes, ona kapıyı açan kadını tacı için sürgüne yolladı." (ironiyi "tacı için" taşıyor). Devrik cümle yok, "-yor" oranı düşük, iyi.
- "Çemişgezekli İoannes." cevabı izleyiciye bir şey söylemiyor; en büyük sürpriz kullanılmamış: bu Bizans imparatorunun adı bugünkü Tunceli'deki Çemişgezek'ten geliyor. Bütçe var (437 → ≤ 500): "Çemişgezekli İoannes: adı bugün Tunceli'de yaşayan bir Bizans imparatoru." gibi tek cümle ekle.
- Theophano'nun öldürülen imparatorun **karısı** olduğu söylenmiyor; "imparatoriçe" yetmiyor. → "969'da bir gece, imparatorun kendi karısı Theophano kapıları açık bıraktı." Gerilimi ikiye katlar.

**Küçük notlar**
- Sahne 0 hareket 2.0 (kanca karesi): kapak bloğu ilk cümle boyunca duruyor, ilk kare dolu, iyi; ama sikke `rise: 0` neredeyse sabit → hafif süzülme/dönme, düşen damlalar, dalga kayması ekle (hedef ≥ 4). Kaşif önizlemenin ilk karesinde zaten şokta; `point` pozu `katil`e kadar görünsün.
- Sahne 3: kayıktaki "kapüşonlu figür" yüzsüz koyu bir koni; kürekçi olması gereken çöp adam kıçta küreksiz ayakta. Kapüşon içine gölgeli yüz/göz, kürek kürekçinin elinde. Kayığın kıçı (x 0–560, y 1060–1260) altyazı şeridine giriyor → kayığı y ≈ 0.55'e çek.
- Sahne 2: imparatorun sakalı siyah maske gibi duruyor (yüzün alt yarısı tek blok) → sakalı çizgi tarama ya da daha küçük/kahverengi yap.
- Sahne 7: kayık ve figürler orta ölçek, iyi; adanın üst kısmı ve "Adalar" oku temiz.
- Sahne 8: kapanış kıyı sahnesi sahne 0'ın tekrarı; kabul edilebilir ama sikke daha küçük (r 285), sağdaki kaya kadrajın %40'ı. Sorun değil.
- **Kaynaklar:** Hürriyet ve Ege Telgraf URL'leri doğrulanamadı (proxy 403, web aramasında bu adresler çıkmadı). Aramada bulunan gerçek haberlerle değiştir: halktv.com.tr/turkiye/egede-amator-dalgic-bin-yillik-bizans-sikkesi-buldu-1060026h (I. John Tzimiskes, 969–976, 2–3 metre, Meryem imparatoru taçlandırıyor, İzmir Arkeoloji Müzesi — eleştirmen doğruladı), evrensel.net/haber/6003822/…, dha.com.tr/foto-galeri/denizden-tarihi-sikke-cikti-2957995.
- **Doğruluk kontrolü (eleştirmen):** Wikipedia John I Tzimiskes: Nikephoros annesinin kardeşi (dayı) ✓, saltanat 11 Aralık 969 ✓, Theophano ve generallerle komplo ✓, Çemişgezek adını ondan alıyor/orada doğdu ✓. Wikipedia Theophano: "doors unbolted" ✓, Polyeuktos şartları: suç ortaklarını cezalandırmak, Theophano'yu saraydan uzaklaştırmak, kiliseye aykırı fermanları kaldırmak ✓; sürgün Prinkipo (bazılarına göre Prote) → ekranda "Adalar" doğru tercih. Efsane yok.
- Kapak (8): tek dev sikke + şok Kaşif, "KATİL" kırmızı kutuda, telefonda okunuyor, ilk cümleyle birebir; çerçeveye değen yok. Sikkedeki figürler küçükte bulanık ama sikke tek odak olarak çalışıyor. Başlık SEO kurallarına uyuyor; "Çemişgezekli İoannes" arama hacmi düşük olabilir, `tags`'de "bizans imparatoru" var, yeterli.

### Yazar — Tur 1 düzeltmeleri
Lint OK (uyarı yok), preview ~33 sn, 9 sahne, **470 karakter**; hareket s0 4.5, s1 22.0, s2 13.7, s3 10.8, s4 15.7, s5 18.7, s6 20.2, s7 9.4, s8 11.8 (STATIC yok).
1. **Sahne 6 (`tz_gate`):** damga y 0.25, size 64, rot −4; kicker'a binmiyor, kadrajın içinde. Ön plana taş korkuluk ve bekleyen kalabalığın sırtları eklendi (y 1500–1920 dolu). Kubbeye pencere dizisi ve payandalar eklendi. İoannes üst basamakta tam boy duruyor, `deny`den sonra öne eğilip başını eğiyor.
2. **Sahne 5 (`tz_bed`):** `set: false` + kendi duvarı (çift pencere yok). Gölgenin elinde kabzası, siperi ve geniş ağzıyla net bir kılıç siluet olarak var. Gölge büyüyerek yatağa uzanıyor. Mum, yatak ve imparator (baş r 56) yakın plan kadrajda: `camera {focus: [600, 860], zoom: 1.6, push}`. Yakın planda alt bölgeyi halı dolduruyor.
3. **Sahne 1 (`tz_dive`):** yüzeyde maske, şnorkel ve kayış; dalgıç kolunda koyu eldiven ve mavi bilek bandı. El kadraj dışından giriyor, üstte uç görünmüyor. Sikke r 190; `buldu`da kavranıyor ve y 0.555 → 0.40'a dönerek, yüzü izleyiciye bakacak şekilde yükseliyor. Kabarcıklar maskeden çıkıyor.
4. **Sahne 0:** sikke süzülüyor, sallanıyor ve dönüyor, sürekli damla düşüyor, dalgalar daha hareketli (hareket 2.0 → 4.5). Kaşif `katil`e kadar işaret ediyor, sonra şok. Kapak bloğu aynı (dolu).
5. **Anlatım:**
   - Theophano artık "imparatorun karısı" olarak geçiyor.
   - Çemişgezek sürprizi eklendi: "Adı, Tunceli'deki Çemişgezek'le aynı!". Yön tartışmalı olduğu için (yer mi ondan, o mu yerden ad aldı) iddiasız yazıldı.
   - Punchline: "Ve İoannes, ona kapıyı açan kadını tacı için sürgüne yolladı."
   - Bütçe için kısaltılanlar: "Bir dalgıç onu Karaburun'da buldu." ve "İoannes içeri girip dayısını öldürdü."
   - Yeni metin: Bu altını bir katil bastırdı. Bir dalgıç onu Karaburun'da buldu. Üstündeki imparatoru tanıyor musunuz? Çemişgezekli İoannes. Adı, Tunceli'deki Çemişgezek'le aynı! Peki tahtı nasıl aldı? 969'da bir gece, imparatorun karısı Theophano kapıları açık bıraktı. İoannes içeri girip dayısını öldürdü. Ama patrik şart koştu: taç istiyorsan Theophano'yu sürgüne gönder! Ve İoannes, ona kapıyı açan kadını tacı için sürgüne yolladı. Her gün böyle gerçek bir hikâye için abone olun.
6. **Küçükler:**
   - Sahne 3: kayık y 0.55 (altyazı şeridinden uzak); kapüşonlu figürün gölgeli yüzü, gözleri ve kaşları var; kürek kürekçinin elinde ve sallanıyor.
   - Sahne 2: sakal küçük, kahverengi, yüzü kapatmıyor.
   - Sahne 4 kicker: "Theophano / imparatorun karısı".
7. **Kaynaklar:** halktv adresi WebFetch ile doğrulandı ve eklendi. Hürriyet adresini yazar bu oturumda WebFetch ile açıp doğruladı (2–3 metre, nisan, Meryem imparatoru taçlandırıyor, İzmir Arkeoloji Müzesi); listede kaldı. Ege Telgraf çıkarıldı. Ekrandaki "Kaynak": sahne 1–2'de Halk TV.
Kalan küçük not: sahne 1'de maske, otomatik kamera yüzünden üst kenarda yarım görünüyor ama maske + şnorkel olarak okunuyor.

### Eleştiri günlüğü — Tur 2 (01, eleştirmen)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 8 | 7 | 7 | 8 | 9 | 8 | 8 |

Lint: OK. 470 karakter. **Geçti:** tüm kriterler ≥ 7, kapak 8. Tur 1'in üç büyük sorunu çözüldü: sahne 6'da damga kicker'a binmiyor ve alt bölge kalabalıkla dolu, İoannes başını eğiyor; sahne 1'de sikke büyük ve izleyiciye dönüyor; sahne 5'te kılıç siluet olarak var. Anlatım daha güçlü: "imparatorun karısı", Çemişgezek sürprizi, net punchline.
Kalan 3 sorun 3. turda (zaman yetiyorsa) düzeltilmeli:
1. **Sahne 5 (`tz_bed`):**
   - Yakın planda y 1270–1920 hâlâ boş halı. Ortadaki gri oval (≈ x 300–580, y 1650–1790) bir delik ya da leke gibi duruyor.
   - İmparatorun başı ve yastığı sağ kenarda (x 870–1080) kesik.
   - Kılıcın ağzı kicker ve marka bölgesine giriyor (x 420–640, y 0–300).
   - Çözüm: `camera.focus` → [520, 820] ya da yatağı ~140 px sola al, baş tamamen kadrajda olsun. Halıdaki gri ovali kaldır ve alt kısma ön plan katmanı koy: yatak ucu, sandık ya da alçak sehpa üstünde kadeh, yere düşmüş taç. Gölgedeki kılıcın ucu y ≥ 330'da bitsin ya da kılıç sağa eğik dursun.
2. **Sahne 1 (`tz_dive`):**
   - Dalgıç maskesi (x 540–850, y 0–210) üst kenarda yarı kesik ve kicker kutusunun sağ ucuna (x 676) değiyor.
   - Kol hâlâ düz kahverengi bir kalas gibi.
   - Çözüm: maskeyi tamamen kaldır ya da x ≥ 780'e taşı. Kola dalgıç elbisesi dikiş/fermuar çizgisi ve iki ton gölge ekle.
3. **Sahne 2 cue'su:** `crown: "Çemişgezekli"` sahnenin ilk kelimesine denk geliyor, Meryem'in taç indirme hareketi geçişin içinde kayboluyor (kural: cue erken kelimeye düşmesin). Çözüm: `crown: "aynı"`, `glint: "Tunceli"`. Not: "Çemişgezek" yazılırsa ilk eşleşme yine "Çemişgezekli" olur.

**Küçük notlar**
- Sahne 1 artık "Üstündeki imparatoru tanıyor musunuz?" cümlesini de taşıyor; sikke tam o anda izleyiciye döndüğü için uyumlu.
- Sahne 4'te kicker "Theophano imparatorun karısı" iki satıra kırılıyor; okunuyor, sorun değil.
- Sahne 0'da hareket 4.5 oldu. Kapak bloğu ilk cümle boyunca ekranda, ilk kare dolu.
- Sahne 3: kapüşonlu figürün yüzü var, kürek kürekçinin elinde, kayık altyazı şeridinden uzak.
- Doğruluk: Ege Telgraf çıkarıldı, halktv eklendi (eleştirmen doğruladı). Hürriyet adresini yazar doğruladığını yazıyor; bu oturumdan açılamadı. "Adı, Çemişgezek'le aynı!" ifadesi yön iddiası taşımadığı için dürüst.
- Kapak değişmedi (8). Sikkedeki figürler daha temiz.

### Yazar — Tur 2 düzeltmeleri
Lint OK (uyarı yok), preview ~33 sn, 9 sahne, 470 karakter (anlatıma dokunulmadı), STATIC yok (s2 17.2, s5 19.4).
1. **Sahne 5 (`tz_bed`):**
   - Gri oval madalyon kaldırıldı. Ön planda (y 1300–1920) yaldızlı kemerli ahşap bir sandık ve pirinç tepside ibrik ile kadeh var.
   - Yatak 140 px sola alındı (x 0.27–0.80), mum x 0.2'de; kamera focus [520, 820] ×1.6. İmparatorun başı kadrajda.
   - Gölge ve kılıç küçültüldü (s 0.46–0.60, kılıç 170×250·s). Kılıcın ucu y ≈ 330'un altında kalıyor, kicker'a girmiyor.
2. **Sahne 1 (`tz_dive`):** maske ve şnorkel x 0.86'ya taşındı, kicker'a değmiyor. Dalgıç kolunda açık tonlu ışık şeridi, koyu gölge tarafı ve dikişli bir elbise dikişi var.
3. **Sahne 2 (`tz_coin` face):** taç cue'su "aynı" (taç 0.45 sn'de iner, kelimenin üstünde oturuyor; `--times 11.3,11.5` ile kontrol edildi), parıltı "Tunceli".

### Yönetmen — son kapı
3. tur yazar düzeltmeleri yapıldı (yeniden puanlanmadı; son puanlar Tur 2). Lint hatasız, sheet.png ve cover.jpg yönetmen tarafından görüldü. Not: tools/news.py ve tools/media.py bu ortamda proxy 403 verdi; manşet web aramasıyla seçildi, görseller kodla çizildi.
