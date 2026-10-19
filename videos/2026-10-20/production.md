# Prodüksiyon — 2026-10-20

Uzun video bir gece önce (2026-10-19 akşamı) kanal sahibinin isteğiyle hazırlandı; `tools/plan.py` bu günün uzun videosunu `done` sayar, sabahki görev sadece 2 Shorts üretir.

## 03-pompeii-son-gun (uzun video)

- **Konu / kategori:** Pompeii'nin son günü: Vezüv bir şehri nasıl dondurdu? — tarih + yer bilimi
- **Hissedilen:** "Sıradan bir sonbahar sabahı, ekmek fırında, duvarda seçim afişleri… 24 saat sonra her şey 1.700 yıl boyunca kül altında donup kaldı." — gerilim ve hüzün, sonunda hayranlık (bugün o anı görebiliyoruz).
- **Ses:** ElevenLabs `j4vJUfke1j8j9OYq8V3b`, `eleven_v3`.
- **Palet:** `desert` (Roma şehri, sabah) → `sunset` (püskürme kolonu) → `magma` (piroklastik akıntı) → `noir` (kül altında) → `desert`/`space` (bugün, kazı).
- **Kapak:** sağda Vezüv'den yükselen dev kül kolonu ve kentin silueti; yazı ör. `BU ŞEHİR / 18 SAATTE / YOK OLDU` (yazar doğrular; sayıyı doğru seç).
- **Yayın:** 2026-10-20T20:30:00+03:00
- **Doğrulanmış bilgiler (yazar web aramasıyla tekrar doğrulasın; emin olmadığını "yaklaşık" de ya da çıkar):**
  - MS 79'da Vezüv patladı. Geleneksel tarih 24 Ağustos (Genç Plinius'un mektuplarının kopyaları); kazılarda bulunan 17 Ekim tarihli kömür yazıt, sonbahar meyveleri ve mangallar nedeniyle bugün birçok araştırmacı **24 Ekim**'i daha olası görüyor → "büyük olasılıkla sonbaharda, belki 24 Ekim'de" de. (Video tam o yıldönümünde yayınlanıyor, kancada kullanılabilir.)
  - Püskürme öğleden sonra başladı; Plinyen kolon yaklaşık 30 km yüksekliğe çıktı (kaynaklar 27–33 km). Pompeii'ye saatlerce süngertaşı (pomza) ve kül yağdı; çatılar çöktü.
  - İkinci gün sabahı piroklastik dalgalar/akıntılar (sıcak gaz ve kül bulutu) şehre ulaştı; kalanların çoğu bu sıcak bulutla öldü.
  - Genç Plinius, Misenum'dan olayı izledi ve yıllar sonra Tacitus'a iki mektupla anlattı — bir volkanik patlamanın bilinen ilk görgü tanığı anlatımı. Volkanoloji bugün bu tür patlamalara "Plinyen" der.
  - Yaşlı Plinius (amcası, Roma donanma komutanı) gemilerle kurtarma için koya açıldı ve Stabiae'de öldü.
  - Pompeii yaklaşık 4–6 metre kül ve süngertaşı altında kaldı; Herculaneum ~20 m.
  - 1748'de düzenli kazılar başladı; 1863'te Giuseppe Fiorelli küldeki boşluklara alçı dökerek kurbanların son anlarındaki biçimlerini ortaya çıkardı.
  - Şehirde fırınlarda kömürleşmiş ekmekler, duvarlarda seçim yazıları/grafitiler bulundu (sayı verme).
  - Ölü sayısı kesin değil; kurban sayısında "binlerce" ya da bulunan kalıntılar için kaynağı doğrulanmış sayı kullan.
- **Higgsfield klipleri** (Kling 3.0 Pro, 5 sn, 16:9, sessiz; `photo` tipi, `{"video": "media/hf-<ad>.mp4", "url": "<URL>", "ai": true, "credit": "Yapay zekâ ile üretilmiş temsili görüntü: Higgsfield (Kling 3.0)"}`):
  `hf-street` (sabah Pompeii sokağı, arkada yeşil Vezüv), `hf-bakery` (Roma fırını, taş fırından ekmek), `hf-column` (koyun karşısından dev kül kolonu), `hf-pumice` (çatılara yağan süngertaşı, karanlık öğleden sonra), `hf-fleet` (kül bulutuna doğru kürekli Roma gemileri), `hf-surge` (yamaçtan kente inen parlayan sıcak kül bulutu), `hf-ruins` (bugünkü Pompeii kalıntıları, gün batımı, arkada Vezüv), `hf-cast` (müze vitrininde alçı kalıp, saygılı, loş ışık).
  Kural: klipler sadece atmosfer/hikâye; mekanizma (kolon yapısı, akıntı hızı, kül kalınlığı) 3D/2D.

### Perdeler

| Bölüm (`chapter`) | İçerik | Görsel omurga |
|---|---|---|
| Sıradan bir sabah | Kanca + MS 79, canlı bir Roma kenti, Vezüv'ü kimse volkan bilmiyor | hf-street, hf-bakery, headline |
| Gökyüzü kararıyor | Öğleden sonra patlama, ~30 km kolon, Plinius'un tanıklığı | hf-column, 3D yanardağ kesiti/kolon |
| Taş yağmuru | Saatlerce süngertaşı, çatılar çöker, kaçanlar/kalanlar; Yaşlı Plinius'un kurtarma seferi | hf-pumice, hf-fleet, scale_bar (kül kalınlığı) |
| Sıcak bulut | İkinci gün sabahı piroklastik akıntı, hız/sıcaklık (doğrulanmışsa), Herculaneum | hf-surge, 3D akıntı |
| Kül altında 1.700 yıl | Unutuluş, 1748 kazıları, Fiorelli'nin alçı kalıpları (saygılı anlatım) | hf-ruins, hf-cast, compare |
| Tarih tartışması | Ağustos mu Ekim mi? kömür yazıt, nar ve ceviz, mangallar | headline/compare |
| Bugün | Vezüv hâlâ aktif, çevresinde yaşayan milyonlarca insan (doğrulanmış sayı), yorum sorusu | 3D volkan, headline |

Yeni sahne tipi önerisi: `volcano` (`scenes/studio/shots/volcano.js`, 3D) — `profile` (Vezüv + koy + Pompeii/Herculaneum konumları), `column` (yükselen Plinyen kolon, şemsiye çamı biçimi, yükseklik sayacı), `fall` (süngertaşı yağmuru + kentte biriken katman, kalınlık sayacı), `surge` (yamaçtan inen yoğun bulut, kente ulaşma). Aynı dünyada kesintisiz kamera.

## Eleştiri günlüğü

### 03-pompeii-son-gun — tur 1
(Sahne numaraları **0'dan** sayılıyor; JSON dizi indeksiyle aynı.)

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 7 | 7 | 7 | 9 | 7 |

lint: OK (10 uyarı, hepsi indirilemeyen HF klipleri). 3.528 karakter, ~245 sn, 37 sahne, 7 bölüm, motion min 3.4 (sahne 33). 10 HF sahnesi önizlemede yer tutucu; görselleri puanlanmadı. Klip süreleri uygun: `rate` 0.55–0.69 ile her sahnede ~%8–15 pay var. **Geçmedi** (6 kriter < 8).

1. **Kronoloji hatası, sahne 16 ve 20 (Doğruluk).** Sahne 16 "Ertesi sabah, dev sütun… çökmeye başladı" diyor, sonra 19'da Herculaneum, 20'de "Birkaç saat sonra Pompeii" geliyor. Gerçekte sütunun çökmesi ve ilk piroklastik dalgalar gece yarısından sonra başladı. Herculaneum gece vuruldu. Pompeii'ye ölümcül dalga sabah yaklaşık 6:30–7:30'da ulaştı (Sigurdsson ve diğerleri 1985: 4. dalga, ~07:00). → Sahne 16: "Gece yarısından sonra, dev sütun artık kendi ağırlığını taşıyamadı ve çökmeye başladı." (kicker `{"white": "Gece", "gray": "yarısı"}`). Sahne 20: "Sabaha karşı bulut Pompeii'ye ulaştı. …" Sahne 23: "1748'de düzenli kazılar başladı" yanlış. 18. yüzyıl kazıları hazine avıydı, düzenli ve yöntemli kazı Fiorelli dönemiyle geldi. → "1748'de kazılar başladı." Küçük not: sahne 11'deki süngertaşı Pompeii'de en fazla ~2,8 m. "Yaklaşık iki buçuk metreyi aştı" daha doğru, sayaç `"to": "2,5", "suffix": "+"`.
2. **Sahne 21–31 arasında ~80 sn boyunca 3D yok. Düz 2D "slayt"lar boş kadrajlı (Tempo, Derinlik, Kompozisyon).** 22, 24, 26, 27 ve 31 beş Anton yazı sahnesi, araya foto/compare/clues giriyor. Sahne 9 (10,3 sn) ve 31 (10,4 sn) tek headline'da çok uzun kalıyor. Compare sahneleri 13 ve 21'de iki taraf da aynı kırmızı (noir paletinde `accent` = kırmızı), kadrajın alt yarısı boş. Sahne 18'de çubuklar üst üçte birde, alt %55 boş. Sahne 30'da "XVI K NOV" plaketi ekran genişliğinin ~%8'i kadar küçük bir ikon. `visual`'da yazan "sıva duvar parçası + dev 17 EKİM" yok. → (a) Sahne 22'yi 3D'ye çevir: `volcano` `{"mode": "fall", "layer": [1.0, 1.0], "counter": {"to": "1.700", "unit": "YIL", "label": "kül altında"}, "camera": {"dist": 4, "pitch": 20, "drift": 0.8}}`. Kent tamamen gömülü, kamera yavaşça geri çekilsin. (b) Sahne 21'i `scale_bar` yap: `{"total": "20", "part": "5", "unit": "m", "step": "5", "total_label": "Herculaneum ~20 m", "part_label": "Pompeii 4–6 m"}`. (c) Sahne 13'te sol `"color": "ink"` ya da `"green"` ver, iki taraf ayrışsın. (d) `clues.js`'te `n === 1` ise öğeyi ~2,4× büyüt ve ortala (plaket ≥ 600 px genişlik, "17 EKİM" ≥ 120 px). (e) bars yatayda çubuk bloğunu dikeyde ortala (y ≈ 380–620). (f) Sahne 9'u ikiye böl: "Yıllar sonra yazdığı mektuplar… ilk görgü tanığı anlatımı." headline kalsın, "Bu yüzden… Plinyen patlama deniyor." cümlesi sahne 8'in `column` dünyasına ek bir kamera sahnesi olsun (sütunun tamamı + etiket "PLİNYEN PATLAMA").
3. **Vezüv 3D'de dağ olarak okunmuyor. Sıcak bulut "yamaçtan inen akıntı" değil, top gibi bir küme (Görsel=anlatım, Derinlik, Kapak).** Sahne 1, 15, 33 ve 34'te koni kuşbakışı koyu, ışınsal çizgili düz bir disk. Deniz kestanesi gibi duruyor, yüksekliği yok. Sahne 16, 17 ve 20'de turuncu karnabahar küme koniyi tamamen örtüyor. Sahne 17'de `visual`'daki "koninin eteklerinden aşağı yuvarlanıyor" hareketi görünmüyor. Sahne 33 videonun en durgun sahnesi (motion 3.4), VEZÜV etiketi ancak "1944"te geliyor. → volcano.js'te koni yüksekliğini ~1,6× artır, yamaçları açık renkle (yeşil/kahve gradyan) aydınlat. Sahne 1/33/34 kameralarında `pitch` 26–40 yerine 12–18 kullan, siluet ufka karşı görünsün. Surge parçacıklarını araziye yapıştır: yükseklik ≤ sütunun %15'i, radyal yayılan ince bir halı olsun ve cephe ön kenarı parlasın. Kraterin 1,5 birim çevresinde koni açıkta kalsın. Sahne 33: `"camera": {"drift": 0.9}`, cue `{"hit": "orada"}` (etiket cümlenin başında gelsin).

8 altı kriterler için gerekenler:
- **Görsel=anlatım 7:** sorun 3 ve 2(d). Sahne 11'de `visual` "evlerin arasında yükselen gri katman" diyor ama zemin düz gri, evlerin dibinde katman yükselmesi görünmüyor. Katman yüksekliğini (`depth`) evlerin ~%40'ına kadar çıkar. Sahne 15'te "gemi işareti" yok, sadece ışık noktası var: rota üstünde küçük bir kürekli gemi sprite'ı ya da üçgen ekle. Sahne 26'daki kalp ikonu kurban anlatımına uymuyor (duygu kitsch'e kayıyor): `icon`'u kaldır ya da sönük bir kandil/ışık yap.
- **Kompozisyon 7:** sorun 2(b–e). Sahne 34'te etiket çizgisi "yarım milyondan" yazısının üstünden geçiyor. Sahne 7'de çizgi "Genç Plinius buradaydı"nın başına biniyor. → etiket `dy` +60 (çizgi alt yazının altında bitsin) ya da `dx` −120.
- **Derinlik 7:** sorun 2(a–b) ve 3. 13, 21 ve 28 compare sahneleri düz iki sütun yazı. En az 21'i 3D/ölçek görseline çevir.
- **Tempo 7:** sorun 2. 21–31 aralığında 2D-yazı oranını düşür (22 → 3D, 21 → scale_bar). Sahne 9 ve 31'i ≤ 7 sn'ye indir: 31'de "Notta yıl yazmıyor, bu yüzden tartışma sürüyor." cümlesini sahne 30'a taşı. Aynı hf-ruins klibi 23 ve 32'de ~1 dk arayla tekrar ediyor. 32'de `from: 2.5` ver ve ters KB kullan, en azından farklı bir an görünsün.
- **Doğruluk 7:** sorun 1.
- **Kapak+SEO 7:** SEO iyi. Başlık 55 karakter, "Pompeii'nin son günü" başta, vaadi karşılıyor. 17 etiket, açıklama kurala uygun. Kapak yazısı "BİR ŞEHİR / BİR GÜNDE / GÖMÜLDÜ" küçükte net. Ama sağdaki görsel (sahne 16, t 5.0) bulanık bir turuncu küme: koni görünmüyor, Pompeii birkaç piksel, brief'teki "kentin silueti" yok. → Sorun 3 düzeltildikten sonra `"scene": 16, "t": 1.5` (tam boy sütun + şemsiye tepe) ya da sahne 20'de cephe Pompeii'ye varmadan hemen önceki an. `"mark"` ile Pompeii'yi halkala ve kamerayı yakın tut (dist ≤ 14).

Doğrulanan (sorun yok): Genç Plinius 17 yaşında ("on sekizinci yaşımdaydım"), Misenum'dan izledi, Tacitus'a iki mektup yazdı. Yaşlı Plinius donanma komutanıydı, Stabiae'de öldü. "Çam ağacı" benzetmesi ve "Plinyen" adı doğru. Kolon ~30 km (modern tahmin 27–33 km). Uçak irtifası ~10–12 km, "yaklaşık üç katı" doğru. Pompeii 4–6 m. Herculaneum ~20 m+ (kaynaklar 20–23 m). Kayıkhane ve kumsalda ≥ 300 (en az 340) kalıntı, "yaklaşık üç yüz" kabul. Akıntı 100+ km/saat. Fiorelli 1863, alçı tekniği doğru, saygılı anlatılmış. 79→1748 ≈ 1.670 yıl, "yaklaşık 1.700" doğru. 24 Ağustos el yazması kopyalardan geliyor. 2018'de Regio V'te bulunan kömür yazıtı "XVI K NOV" = 17 Ekim, yılı yok. Nar, ceviz, mangal kanıtları doğru. Son püskürme Mart 1944. Kırmızı bölge 2024 planında ~670–700 bin kişi, "yarım milyondan fazla" doğru. Pompeii yılda ~4 milyon ziyaretçi alıyor. Kapanış sahne 35 ("Yani… sıradan bir günün kendisi") güçlü. Sahne 36'daki tek yorum sorusu uzun video kuralına uygun.

### 03-pompeii-son-gun — tur 2
(Sahne numaraları **0'dan** sayılıyor. Sahne 9 ikiye bölündüğü için tur 1'e göre +1 kaydı.)

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 9 | 9 | 9 |

lint: OK (10 uyarı, hepsi indirilemeyen HF klipleri). 3.480 karakter, ~240 sn, 38 sahne. motion min 4.1 (sahne 34). **Geçmedi:** Derinlik 7.

Tur 1 düzeltmeleri doğrulandı:
- Kronoloji doğru: 17 gece yarısından sonra, 21 sabaha karşı.
- "1748'de kazılar başladı" ve "2,5+ M" doğru.
- 10 PLİNYEN PATLAMA 3D sahnesi var.
- 22 scale_bar Herculaneum ~20 m / Pompeii 4–6 m.
- 23 gömülü kent + 1.700 YIL.
- 14 compare yeşil/kırmızı.
- 27 kandil ve 31 XVI K NOV plaketi büyük, tek öğe.
- Piroklastik akıntı artık yere yapışan bir halı.
- Kapak (sahne 21, t 1.2) çok iyi: koni, sütun, akıntı halkası ve parlayan POMPEİİ tek karede. "BİR ŞEHİR / BİR GÜNDE / GÖMÜLDÜ" küçükte okunuyor.

1. **Sahne 27–32 (~42 sn) art arda düz 2D, hepsi aynı amber güneş ışını zemin (Derinlik, Tempo).** Sıra şöyle: clues, headline, compare, clues, clues, headline. Arada 3D ya da görüntü yok. 29'da compare kadrajın alt yarısı boş, iki taraf da aynı amber. Bu bölüm hâlâ "slayt" gibi duruyor. → (a) Sahne 32'yi 3D yap: `volcano`, sonbahar ışığında körfez, `"camera": {"dist": 9, "pitch": 14, "drift": 0.8}`, etiket "24 EKİM? · büyük olasılıkla". Ya da 28'i 3D yap (koni + "HANGİ GÜN?" etiketi). (b) 29'da sağ tarafa `"color": "accent"` ver, sola `"ink"`. İkonları ekle (sol 📜 kopya, sağ nar), alt yarı dolsun. (c) 30–31'e `"art": {"palette": "sunset"}` ver, arka plan değişsin.
2. **Sahne 34–35 videonun en durgun sahneleri (motion 4.1 / 4.5). Gece görünümünde Vezüv hâlâ basık bir disk (Hareket, Görsel=anlatım).** `visual`'daki "yanıp sönen ölçüm istasyonları" seçilmiyor. → Kamera `pitch` 10–14, `dist` biraz yakın ve `"drift": 1.0` olsun, koni ufka karşı siluet versin. İstasyon noktalarını 2× büyüt ve nabız gibi atsın. 35'te kırmızı halka cue'da genişleyerek gelsin; zaten öyleyse halkayı `spring` ile 0'dan büyüt.
3. **Sahne 23'te anlatım ile görsel ayrışıyor (Görsel=anlatım).** Anlatım "Üstünde bağlar ve tarlalar uzandı" diyor ama kare boydan boya gri kül ovası. Ayrıca 22'nin ilk karesinde büyüteç boş daire (`part` cue'su "pompeii" geç geliyor). → 23'te ikinci cümle sırasında (cue `"bağ": "bağlar"`) kül yüzeyine yeşil/kahve sıra sıra bağ çizgileri ve tarla dokusu yayılsın, gömülü duvarlar kaybolsun. 22'de büyüteç `total` cue'sunda boş görünmesin, `part`'a kadar gizli kalsın.

Doğrulanan (sorun yok):
- MS 79 Vezüv patlaması.
- Genç Plinius 17 yaşında, Misenum'dan izledi, mektupları ilk görgü tanığı anlatımı.
- Yaşlı Plinius donanma komutanıydı, kurtarma için açıldı, Stabiae'de öldü.
- 24 Ağustos el yazması kopyalardan geliyor.
- 2018 Regio V kömür yazıtı "XVI K NOV" = 17 Ekim, yıl yok. Nar, ceviz ve mangal bulguları doğru.
- Herculaneum ~20 m+, Pompeii 4–6 m.
- Kazılar 1748'de başladı, Fiorelli alçı kalıpları 1863.
- Sütun ~30 km, akıntı 100+ km/saat, son püskürme 1944.
- Kapanış (36) güçlü. 37 tek yorum sorusu, kurala uygun.

### 03-pompeii-son-gun — tur 3 (son tur)
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 9 |

lint: OK (10 uyarı, hepsi indirilemeyen HF klipleri). 3.480 karakter, ~240 sn, 38 sahne. motion min 5.0 (sahne 15). **GEÇTİ** (tüm kriterler ≥ 8).

Değişen sahneler kare kare kontrol edildi (136.5, 147, 184, 185.8, 191, 199, 206, 208.5, 218, 225 sn):
- **22:** Açılışta büyüteç boş daire olarak görünmüyor, çubuk 0 m'den doluyor.
- **23:** "bağlar" cue'sunda kül ovasına yeşil bağ sıraları ve tarlalar yayılıyor, gömülü duvarlar altta seçiliyor. Anlatımla birebir (motion 33.3).
- **29:** Solda güneş ikonu + "Ağustos", sağda turuncu yaprak ikonu + "Sonbahar?". Taraflar ayrışıyor.
- **30–31:** Yeşil (forest) ve lacivert (lab) zeminler. 27–32 arasındaki amber "slayt" duvarı kırıldı.
- **32:** 3D sonbahar ışığında koni ve körfez, etiket "24 EKİM? · büyük olasılıkla sonbahar".
- **34–35:** Alçak açı, koni ufka karşı daha belirgin, istasyon halkaları ve kırmızı bölge halkası okunuyor (motion 5.5 / 7.5).
- **Kapak:** Değişmedi, güçlü.

Kalan küçük notlar (yayını engellemez):
1. Sahne 29 (9,3 sn) ve 32: sağ taraf ve "24 EKİM?" etiketi cümlenin sonunda geliyor, sahnenin ~%80'i tek taraflı ya da etiketsiz duruyor. İstenirse 29'da `right` cue'su "bulgular" yerine "Ama" kelimesine, 32'de `hit` cue'su "sonbaharda" kelimesine alınabilir.
2. Sahne 34'te gece görünümünde koni hâlâ alçak. Siluet yeterli ama dramatik değil.
3. Sahne 15 en durgun sahne (motion 5.0). HF klibi gerçek render'da daha canlı olacak.

## 01-emu-savasi (Shorts, parşömen stili)

- **Konu / kategori:** Büyük Emu Savaşı, Batı Avustralya, Kasım–Aralık 1932. Savaşlar ve tuhaf kararlar.
- **Hissedilen:** "Bir ordu makineli tüfeklerle kuşlara savaş açtı ve kaybetti." Önce gülümseme, sonra hayret.
- **Palet / stil:** `"theme": "parchment"`, `desert`. Kaşif 10 sahnenin 7'sinde. Askerlerde yeni `slouch` aksesuarı var: zeytin yeşili, geniş kenarlı Avustralya asker şapkası (`kasif.js`, eklemeli).
- **Kanca + kapak:** İlk cümle "Avustralya ordusu kuşlara savaş açtı." Kapak `ORDU / KUŞLARA / SAVAŞ AÇTI` (`KUŞLARA` kırmızı kutuda). Kapak karesi sahne 0'dan: tüfek ateş ediyor, emu sürüsü koşuyor, Kaşif şaşkın.
- **Yayın:** 2026-10-20T12:00:00+03:00. 491 karakter, 10 sahne, ~35 sn (tahmini).
- **Yeni sahne tipi:** `scenes/studio/shots/emu.js`. Modları:
  - `field`: emular buğdayda geziniyor ve gagalıyor.
  - `charge`: sürü koşarak tüfeğe geliyor.
  - `scatter`: `scatter` cue'sunda sürü 4 küçük gruba bölünüyor. `jam` cue'sunda tüfek tutukluk yapıyor: duman ve kırmızı "?".
  - `truck`: kamera kamyonla birlikte gidiyor, tarla kayıyor, emular açılıyor.

  Lewis tüfeği tripod üstünde. Ateşte namlu alevi, iz mermiler ve ıskalanan mermilerin kaldırdığı toz var.
- **Doğrulanmış bilgiler:**
  - İlk temas 2 Kasım 1932'de, Campion çevresinde.
  - Ekip Binbaşı G. P. W. Meredith, iki asker ve iki Lewis tüfeğiydi.
  - Emu sayısı yaygın anlatımlara göre ~20.000.
  - Çiftçilerin çoğu I. Dünya Savaşı'ndan dönen eski askerdi (soldier settlers). Savunma bakanından makineli tüfek istediler.
  - Emular küçük gruplara dağıldı. Baraj başındaki pusuda bir Lewis tutukluk yaptı.
  - Kamyona tüfek kuruldu ama kamyon emulara yetişemedi.
  - Ordu ilk haftanın sonunda geri çekildi. 13 Kasım'da yeniden sahaya çıktı, 10 Aralık'ta tamamen çekildi.
  - Meredith'in raporu: 9.860 mermi, 986 doğrulanmış ölüm (iddia).
  - Meredith'in sözü: "…they can face machine guns with the invulnerability of tanks."

### Çekim listesi (sahne 0'dan, tur 1 düzeltmeleri sonrası)

| # | Anlatım | Tip | Görsel |
|---|---|---|---|
| 0 | Avustralya ordusu kuşlara savaş açtı. (`dramatic`) | emu charge | 7 emu, `hit`e kadar x ≥ 0,45'te; solda Lewis'li asker; önde büyük Kaşif (1,15) şok |
| 1 | Yirmi bin kadar emu buğdaya dalıyor. | map | Avustralya, Perth, Campion, "~20.000 emu!" |
| 2 | Eski asker çiftçiler makineli tüfek istiyor. | stage | Kızgın çiftçiler, büyük el yazısı "MAKİNELİ TÜFEK!" (96 px), Kaşif şok |
| 3 | Gelen “ordu”: bir binbaşı, iki asker, iki tüfek. (`mischievously`) | stage | Meredith ve iki asker yürüyerek giriyor, "3 kişi, 2 tüfek", Kaşif dürbünden omuz silkiyor |
| 4 | Emular küçük gruplara dağılıyor, tüfek tık diye susuyor. (`amazed`) | emu scatter | 7 emu gruplara bölünüyor; tık'ta duman ve "?" |
| 5 | Şimdi düşün: kaçan kuşu nasıl vurursun? (`curious`) | stage | Kaşif omuz silkiyor, Meredith düşünüp yukarıyı gösteriyor |
| 6 | Kamyona tüfek kuruyorlar; kamyon yetişemiyor. | emu truck | Sarsılan kamyon, 7 emu kaçıyor, "?" |
| 7 | Meredith rapora yazıyor: “Tank gibi dayanıklılar!” | stage | Meredith elinde rapor (tomar), üstte büyük alıntı "“Tank gibiler!”" + ok |
| 8 | On bine yakın kurşun; vurulan emu bin bile değil. | title | "9.860 / kurşun / 986 emu", not "iddiaya göre", Kaşif omuz silkiyor |
| 9 | Ordu çekildi; savaşı kuşlar kazandı. (`mischievously`) | emu field | Emular gagalıyor, asker çıkıyor, Kaşif mutlu omuz silkiyor |

440 karakter (lint 449), tahmini ~32 sn.

### 01-emu-savasi — tur 1 (eleştirmen)
lint OK · 500 karakter · tahmini 36,7 sn (35 sn üst sınırını aşıyor) · motion 10,9–23,5 (hepsi ≥ 4) · taslak MP4'te hayalet şerit görülmedi.

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 7 | 8 | 6 | 7 | 7 | 7 | 8 | 7 |

**Sonuç: FAIL** (Kompozisyon 6).

1. **Sahne 0, 3, 4 ve kapak: emu sürüsü kişileri gömüyor.** Sahne 0'da nişancının gövdesi ve tüfeği emu bacaklarının arkasında kalıyor. Sahne 3'te dürbünlü Kaşif sürünün arkasında, neredeyse görünmüyor. Kapakta Kaşif'in gövdesi emuların içinde kayboluyor.
   - **Düzeltme:** `n` değerini 10–12'den 6–7'ye indir. Kişileri (`cast`) ve tüfeği emuların önünde çiz (z sırası). Sürü `hit` cue'suna kadar x ≥ 0,45'te kalsın. Sahne 3'te Kaşif'in `scale` değerini ≥ 0,8 yap ve sürünün önüne al.
   - **Kapak (BRAND §9):** büyük Kaşif şok pozunda, yüzü emusuz bir alanda olsun. Örneğin `kasif` kapak seçeneğini aç ya da sahne 0'da Kaşif'i x 0,8'e, `scale` 1,1'e al ve emuları onun arkasına çiz.
2. **Anlatım düz (§6.9), sahne 7 de bilgiyi fazla güçlü söylüyor.**
   - Sahne 1–3 ve 6 "X oluyor. Y istiyor. Z geliyor." biçiminde ders kitabı zinciri. Duyusal ayrıntı ve sürpriz yok.
   - Sahne 7'deki "kuşlar tank gibi kurşun geçirmez" Meredith'in benzetmesini olgu gibi sunuyor.
   - **Düzeltme:** sahne 3'ü somut bir sürprize çevir: "Gelen 'ordu': bir binbaşı, iki asker, iki tüfek." Bu cümle gerçek (Meredith, McMurray, O'Halloran) ve "ordu" abartısını da dengeliyor.
   - Sahne 4'e bir ses ayrıntısı ekle: "…tüfek tık diye susuyor."
   - Sahne 7'yi alıntı olarak kur: "Meredith rapora yazıyor: 'Tank gibi dayanıklılar!'"
   - Karakterleri 500'ün altında tutmak için sahne 1'i kısalt: "Yirmi bin kadar emu buğdaya dalıyor."
3. **Okunabilirlik ve tempo.**
   - Sahne 8'deki "~" işareti küçük basılıyor. Ayrıca "~986" yanlış, çünkü 986 raporun kesin iddiası. Satırları `["10.000","kurşun","986 emu"]` yap. "iddiaya göre" notu kalsın; 10.000 yerine istersen "9.860" yaz.
   - "MAKİNELİ TÜFEK!" (sahne 2) ve "TANK GİBİLER!" (sahne 7) tabela yazıları 44 px'in altında. Tabelayı büyüt, yazıyı ≥ 48 px yap.
   - Sahne 7'deki tabela Meredith'in gövdesini kapatıyor.
   - Sahne 1'de zoom sonrası "Perth" soldan kırpılıyor: `anchor: "start"` ya da zoom 1,15.
   - Sahne 5 ve 7'de sağdaki tabela ya da asker kenardan kırpılıyor (x ≤ 0,84).
   - Süre 36,7 sn. Sahne 8 (4,6 sn) ve 9 (5,4 sn) cümlelerini kısaltarak ≤ 35 sn'ye indir.

**Doğruluk notları:**
- Campion, 2 Kasım–10 Aralık 1932; Binbaşı G. P. W. Meredith, 2 asker, 2 Lewis; ~20.000 emu; gazi çiftçiler (Pearce'a başvuru); kamyon (yol bozuk, nişancı nişan alamıyor); 4 Kasım baraj pususunda tutukluk; 9.860 mermi / 986 iddia: hepsi doğru.
- Kapanış ("Ordu çekildi… kuşlar kazandı") kabul edilebilir. 8 Kasım'daki ilk çekilişten sonra 13 Kasım'da operasyon yeniden başladı; ölümlerin çoğu bu ikinci evrede oldu. Ama 10 Aralık'ta kesin çekiliş oldu, sorun sürdü ve sonraki askerî yardım talepleri reddedildi. "Kuşlar kazandı" standart tarih yorumu, yanıltıcı değil.
- Tek abartı sahne 7 (bkz. 2. madde).

**Writer'ın bilinen zayıflıkları:**
- Teyit edildi: yoğun sürü, gizlenen asker, kamyonda emuların erken çıkması, küçük "~", orta boy kapak Kaşif'i.
- Sahne 5 ve 7 cue öncesi durgun ama motion 11–12 yeterli; öncelik düşük.

### 01-emu-savasi — tur 2 (eleştirmen)
lint OK · 449 karakter · tahmini 33,3 sn · motion 8,7–19,4 · taslak MP4'te hayalet şerit yok.

| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 7 | 8 | 9 | 8 | 8 |

**Sonuç: PASS** (hepsi ≥ 7).

**Tur 1 düzeltmeleri tuttu:**
- Sürü seyreldi ve kişilerin arkasında kalıyor.
- Kapakta büyük, şok pozunda Kaşif var ve yüzü temiz.
- "Gelen 'ordu'" sürprizi ve "tık diye susuyor" anlatımı canlandırdı.
- Alıntı artık doğru çerçevede: Meredith'in raporu.
- Sayı artık 9.860/986.

**Kalan küçük sorunlar (isteğe bağlı 3. tur):**
1. **Sahne 3:** anlatım "iki tüfek" diyor ama ekranda tüfek yok. Ayrıca Kaşif'in yüzü dürbünün arkasında kalıyor. Askerlerden ikisine Lewis tüfeği taşıt (`hold` + tüfek prop). Kaşif'i `point` pozuna al.
2. **Sahne 8:** Kaşif (x 0,86) "emu" kelimesine değiyor. x'i 0,9'a, y'yi 0,66'ya taşı ya da `scale` 0,5 yap.
3. **Sahne 9:** kapanış karesinde Kaşif küçük (0,82) ve ortada sıkışmış. Asker sol kenarda emunun arkasında kaybolarak çıkıyor. Kaşif'i 0,95 boyunda öne al. Askerin çıkışını emusuz bir şeritten yap.
