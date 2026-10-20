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

## 02-penisilin-kesfi (Shorts, parşömen stili)

- **Konu / kategori:** Penisilin nasıl bulundu? Alexander Fleming, St Mary's Hastanesi, Londra, Eylül 1928. Keşifler ve icatların hikâyesi (01 savaş/tuhaf karar, 03 felaket; bu üçüncü damar).
- **Hissedilen:** "Tarihin en çok hayat kurtaran ilaçlarından biri, tatile giden birinin yıkamadığı bir tabakta başladı." Önce gülümseme, sonra hayranlık.
- **Ses:** ElevenLabs `j4vJUfke1j8j9OYq8V3b`, `eleven_v3` (script.json'dan; ses ayarı yok).
- **Palet / stil:** `"theme": "parchment"`, BRAND.md tek paleti (`desert` art, emu ile aynı yapı). Kaşif sahnelerin en az yarısında, her seferinde bir eylemle.
- **Kanca + kapak fikri:** ilk cümle kapakla aynı fikir, ör. "Dünyayı değiştiren ilaç, kirli bir tabakta bulundu." ↔ kapak `KİRLİ BİR TABAK / DÜNYAYI / DEĞİŞTİRDİ` (vurgu `TABAK` kırmızı kutuda; 3–5 kelimeye indir, ör. `KİRLİ TABAK / DÜNYAYI DEĞİŞTİRDİ`). Kapak karesi: dev petri kabı, ortada küf, etrafında bakterisiz şeffaf halka, büyük şok Kaşif.
- **Yayın:** 2026-10-20T19:00:00+03:00. Hedef 400–500 karakter, 8–11 sahne, 28–35 sn.
- **Doğrulanmış bilgiler (yazar web aramasıyla tekrar doğrulasın):**
  - Alexander Fleming, İskoç bakteriyolog, Londra'da St Mary's Hastanesi'nde çalışıyordu.
  - 1928 yazında tatile gitti; Eylül başında (genelde 3 Eylül 1928) döndü. Masasında stafilokok bakterisi ektiği kültür tabakları duruyordu.
  - Tabaklardan birinde mavi-yeşil bir küf (Penicillium) üremişti ve küfün çevresinde bakteriler ölmüş, şeffaf bir halka oluşmuştu.
  - Fleming küfün salgıladığı maddeye "penisilin" dedi ve 1929'da yayımladı; ama maddeyi saf hâlde ve bol miktarda üretemedi.
  - Yaklaşık on yıl sonra Oxford'da Howard Florey ve Ernst Chain ekibi penisilini saflaştırıp ilaç hâline getirdi (1940–41 deneyleri); II. Dünya Savaşı sırasında seri üretime geçildi.
  - 1945 Nobel Fizyoloji/Tıp Ödülü üçüne birlikte verildi.
  - Fleming'in sözü (yaygın aktarım): "28 Eylül 1928 sabahı uyandığımda, dünyanın ilk antibiyotiğini keşfedip tıpta devrim yapmayı planlamıyordum." Kullanılırsa "sonradan şöyle demiş" diye ver; tarih çelişkisi yüzünden günü söyleme.
  - **Efsaneden kaçın:** "küf açık pencereden uçtu" anlatma; büyük olasılıkla alt kattaki küf laboratuvarından geldi ("büyük olasılıkla" de ya da hiç söyleme). Sayısal "milyonlarca hayat kurtardı" ifadesi kabul edilir, kesin sayı verme.
- **Görsel omurga önerisi:** `stage` (Kaşif + Fleming: şapkasız, papyon/önlük + yığılı tabaklar, bavul), `map` (Londra, St Mary's) ya da `timeline` (1928 → 1940 → 1945), `title` (dev "1928"), yeni sahne tipi **`petri`** (`scenes/studio/shots/petri.js`, 2D parşömen mürekkep çizimi): yuvarlak cam tabak, noktalı bakteri kolonileri, cue'da büyüyen küf lekesi, küfün çevresinde açılan temiz halka (`halo` cue), istenirse büyüteç yakınlaşması. Boil titreşimi ve palet kurallarına uyar.
- **Çekim listesi:** yazar önce anlatımı tek parça metin olarak buraya yazar, sonra sahnelere böler (sahne no / anlatım parçası / tip / görsel / cue).

### Anlatım (tek parça) — tur 3 (eleştiri tur 2'ye göre güncellendi)
"Dünyayı değiştiren ilaç, küflü bir tabakta bulundu. Gelin anlatayım: 1928, Londra. Fleming tatilden dönüp tabaklarına bakıyordu. Birinde mavi yeşil bir küf vardı. Sizce ne oldu? Küfün çevresindeki bakteriler ölmüştü! Çünkü küf, bir bakteri katili salıyordu: penisilin! İlaç hazır mıydı? Hayır! Madde çok dayanıksızdı, Fleming onu saflaştıramadı. On yıl kadar sonra bunu Florey ve Chain başaracaktı. Yani milyonlarca hayat kurtaran ilaç, tatilde unutulan bir tabakta doğdu."

- **Uzunluk:** 471 karakter, 11 sahne, preview tahmini ~34 sn (zaman çizelgesi 35,1 sn'de bitiyor; tur 1'de 35,7 sn).
- **Tur 3 metin notu:** Eleştirmenin önerdiği "baktı" (sahne 2) ile "başardı" (sahne 8) kullanılmadı. İkisi de hemen önceki ya da sonraki cümle gibi -dı ile bitiyordu ("vardı", "saflaştıramadı"); bu art arda aynı ek kuralını bozar. Yerlerine "bakıyordu" ve "başaracaktı" kullanıldı. Süre için sahne 5'ten "bir", sahne 2'den "bakteri" çıkarıldı.
- **Tur 1'e göre eklenenler:**
  - Doğrudan soru: "Sizce ne oldu?"
  - Mekanizma: "Çünkü küf bir bakteri katili salıyordu".
  - Saflaştıramama nedeni: "dayanıksızdı". Fleming'in kendi sözü "too unstable" idi.
  - "yaklaşık on yıl sonra".
- **Dil kuralları:** "-yor" ile biten cümle yok, art arda aynı ekle biten cümle yok, devrik cümle yok.
- **Kapak:** `KÜFLÜ TABAK / DÜNYAYI / DEĞİŞTİRDİ` (`TABAK` kırmızı kutuda), büyük şok pozunda Kaşif.

Web ile doğrulandı (Wikipedia "Discovery of penicillin"):
- Fleming 3 Eylül 1928'de tatilden döndü.
- *S. aureus* tabaklarından birinde mavi yeşil küf vardı, çevresinde bakteri üremiyordu.
- Adı 7 Mart 1929'da koydu, ilk adı "mould juice"tı. Haziran 1929'da yayımladı.
- Saflaştıramadı ("It's too unstable").
- Florey ekibi 1939'da Oxford'da başladı (1940–41 deneyleri).
- 1945 Nobel'i üçü eşit paylaştı.
- Açık pencere efsanesi anlatılmadı.

Yeni sahne tipleri `scenes/studio/shots/petri.js`:
- `petri`: tepeden kültür tabağı. Altın sarısı koloniler, cue'da büyüyen küf, içten dışa açılan temiz halka.
- `labbench`: St Mary's laboratuvarı. Raf, saat, tezgâh, tabak yığını, Bunsen beki, cue'da bozulan "küf suyu" şişesi.

Fleming papyonlu ve şapkasız, adı el yazısıyla üstünde. `parchment2d.js` `timeline` tipine opt-in `kasif` parametresi eklendi; parametre verilmezse davranış değişmez.

| # | Anlatım parçası | Tip | Görsel | Cue |
|---|---|---|---|---|
| 0 | Dünyayı değiştiren ilaç, küflü bir tabakta bulundu. | petri | Kapak/kanca: dev tabak, küf + temiz halka, büyük şok Kaşif | hit=küflü |
| 1 | Gelin anlatayım: 1928, Londra. | map | Britanya haritası, kırmızı Londra, not "Eylül 1928" | note=1928, city=Londra |
| 2 | Fleming tatilden dönüp tabaklarına bakıyordu. | labbench | Papyonlu Fleming bavulla kapıdan giriyor, tezgâhta tabak yığını, Kaşif el sallıyor | hi=tatilden, hit=tabaklarına |
| 3 | Birinde mavi yeşil bir küf vardı. Sizce ne oldu? | petri | "küf"te küf büyüyor, "mavi yeşil küf" oku; Kaşif dürbünle bakıyor, "sizce"de düşünüyor | mold=küf, hit=sizce |
| 4 | Küfün çevresindeki bakteriler ölmüştü! | petri | Kaşif'siz yakın plan (zoom 1.0→1.12, r 0.34, cy 0.34; tabak kadrajda, altyazının üstünde); halka ilk kelimede açılıyor, koloniler "ölmüştü"den önce sönüyor; "temiz halka!" oku | halo=Küfün, lab=bakteriler, hit=ölmüştü |
| 5 | Çünkü küf, bir bakteri katili salıyordu: penisilin! | title | "Gizli silah:" + kırmızı kutuda "penisilin" (y 0.33, size 170), oksuz not 'ilk adı: "küf suyu"', büyük Kaşif gösteriyor | w0, w1=katili, note, w2=penisilin |
| 6 | İlaç hazır mıydı? Hayır! | stage | Kaşif düşünüyor, yanında büyük "İlaç?" tabelası; "Hayır"da omuz silkiyor, kırmızı "Hayır!" | hit=Hayır |
| 7 | Madde çok dayanıksızdı, Fleming onu saflaştıramadı. | labbench | Şişe kararıyor, kısa duman çıkarıyor, Fleming omuz silkiyor, kırmızı "?"; Kaşif şaşırıyor | fail=dayanıksızdı, hit |
| 8 | On yıl kadar sonra bunu Florey ve Chain başaracaktı. | timeline | 1928 / 1929 / 1940 Oxford (odak) / 1945 Nobel; daha büyük Kaşif (0.72) 1940'ı gösteriyor | c1=Yaklaşık, c2=Florey, c3 |
| 9 | Yani milyonlarca hayat kurtaran ilaç, | petri | Tabaktan geri çekilme, "milyonlarca hayat", Kaşif gösteriyor | lab=milyonlarca |
| 10 | tatilde unutulan bir tabakta doğdu. | labbench | Yakınlaşma (1.45) tabak yığınına, üstte belirgin küf lekesi, papyonlu Fleming gülümsüyor, Kaşif "doğdu"da gösteriyor | lab=unutulan, hit=doğdu |

Kaşif 11 sahnenin 8'inde (2, 3, 5–10). Sahne 0'da da var: kanca boyunca kapak Kaşif'i olarak görünüyor.

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

### 02-penisilin-kesfi — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 7 | 7 | 8 | 7 | 7 | 7 | 9 | 8 | 8 |

lint: OK. 483 karakter, **~35,7 sn (35 sn sınırının üstünde)**, 11 sahne, 6 sahne tipi. motion min 5.2 (sahne 6), max 18.9. Geçme şartı (≥ 7) sağlanıyor, hedef (≥ 8) sağlanmıyor: Senaryo, Okunabilirlik, Görsel=anlatım, Kompozisyon, Derinlik ve Tempo 7'de kaldı.

Senaryo (sadece metin): Devrik cümle yok, "-yor" ile biten cümle yok, geçmiş zaman doğru, kanca ile kapak aynı fikir. Ama metin telgraf gibi: 11 kısa bilgi cümlesi art arda sıralanmış. Anlatıcı sesi sadece "Gelin anlatayım" ve "bakın" kelimelerinde var. "Neden" hiç söylenmiyor (küfün bakteriyi öldüren bir madde salgıladığı anlatılmıyor). Duyusal ayrıntı ve sürpriz yok. "Fleming onu saflaştıramadı." cümlesi ders kitabı dilinde.

Doğruluk (web ile kontrol edildi): Fleming Eylül 1928'de St Mary's'de tatilden döndü, stafilokok tabağında Penicillium küfü ve çevresinde bakterisiz bir bölge gördü. Önce "küf suyu" dedi, Mart 1929'da "penisilin" adını verdi. Saflaştıramadı; Florey ve Chain (Heatley ile birlikte) bunu 1939–40'ta Oxford'da başardı. 1945 Nobel üçüne birlikte verildi. Açık pencere efsanesi yok. Tek düzeltme: 1928'den 1940'a 12 yıl geçmiş; sahne 8'deki "on yıl sonra" → "yaklaşık on yıl sonra" olmalı (açıklamada zaten "yaklaşık" yazıyor).

1. **Senaryo + Tempo (tüm metin, 35,7 sn):** Metin kopuk, mekanizma yok ve video 35 sn sınırını aşıyor. Bu taslak 501 karakter, sahne sınırları aynı kalıyor. 4. sahnede ikinci cümleyi ayrı bir yakın plana bölün; böylece 5,3 sn'lik sahne de kısalır:
   0 "Dünyayı değiştiren ilaç, küflü bir tabakta bulundu." / 1 "Gelin anlatayım: yıl 1928, yer Londra." / 2 "Fleming tatilden döndü ve masada unuttuğu tabaklara baktı." / 3 "Birinde mavi yeşil bir küf vardı." / 4 "Ama bakın: küfün çevresindeki bakteriler ölmüştü!" + "Çünkü küf, bakteri öldüren bir madde salıyordu." / 5 "Fleming ona penisilin adını verdi." / 6–7 "Peki ilaç hazır mıydı? Hayır! Fleming onu saflaştıramadı." / 8 "Bunu yaklaşık on yıl sonra Oxford'da Florey ve Chain başardı." / 9 "Yani milyonlarca hayatı kurtaran ilaç," / 10 "dağınık bir masada doğdu."
   501 karakter hâlâ hedefin (500) 1 üstünde ve süre de sınırda. 483 karakter 35,7 sn ettiği için hedef ≈ 470 karakter olmalı. 2. sahneyi "Fleming tatilden dönüp tabaklarına baktı." yapın (−17), 1. sahneyi de "Gelin anlatayım: 1928, Londra." yapın (−8). Böylece metin ≈ 476 karaktere iner. Preview'da süre ≤ 35 sn çıkmalı; çıkmazsa 8. sahnede "Oxford'da" kelimesini çıkarın, zaman çizgisi bu bilgiyi zaten gösteriyor.
2. **Sahne 4 (16 sn kare), Görsel=anlatım + Okunabilirlik:** Altyazıda "tertemiz" yazarken kesikli halkanın içinde hâlâ 5–6 dolu, altın sarısı koloni görünüyor; "tertemiz halka" sözü görüntüde yok. "temiz halka!" etiketinin oku da bu karede görünmüyor. Ayrıca zoom 1.3'te tabak sağdan kesiliyor, altyazı kutusu tabağın üstüne biniyor ve Kaşif agarın üstünde duruyor. Düzeltme: `halo` cue'sunu "ölmüş" yerine daha erken bir kelimeye ("çevresindeki") alın ya da `halo.k` söndürmesinin "tertemiz" kelimesinden önce bitmesini sağlayın. `zoom: [1.08, 1.3]` → `[1.05, 1.18]` yapın, `cy` 0.4 → 0.36 olsun. Kaşif `x: 0.85` → `0.9`, `scale` 0.72 → 0.6 olsun ki tabağın dış kenarında dursun. Aynı `cy` 0.36 ayarını sahne 3 ve 9'a da uygulayın; bu sahnelerde de altyazı kutusu tabağın alt kenarını kapatıyor.
3. **Sahne 10 (kapanış görseli) + sahne 7, Kompozisyon/Derinlik:** Son karede "dağınık masada doğdu" vurgusu için sadece 6 tabaklık bir yığın var. En üstteki küf lekesi küçük (~60 px), Fleming kadrajda yok, Kaşif boşta duruyor (point pozu görünmüyor). Tabak kenarlarında testere dişi gibi çizim artefaktı da var. Düzeltme: `cast`'e `{"who": "fleming", "bowtie": true, "x": 0.22, "pose": "idle", "face": "right", "emotion": "happy"}` ekleyin. `cam.zoom` 1.18 → 1.45, `focus` [0.5, 0.42] olsun ki üst tabaktaki küf okunur büyüklükte görünsün. Kaşif'in `then: "point"` değerini `at: "hit"` ile tetikleyin. Sahne 7'de Kaşif sağ kenardan kesiliyor (şapka x > 1080) ve tabak yığınına biniyor: `x` 0.83 → 0.86 yapın, `scale: 0.8` ekleyin. Duman bulutu raf şişelerini kapatıyor: `flask.x` 0.55 → 0.5 yapın ya da dumanı kısın.

7 puanda kalan kriterler için ek notlar:
- **Senaryo:** Sorun 1'deki metinle "çünkü" (mekanizma) ve "dağınık masa" ironisi eklenir; bir yerde de izleyiciye doğrudan soru sorulmalı ("Peki sizce ne oldu?"). Bu olmadan 8'e çıkmaz.
- **Okunabilirlik:** Sahne 6'daki "İlaç?" tabelası 360 px'te zor okunuyor; tabela yazısını büyütün ya da `label` ile üstte "İlaç?" yazdırın. Sahne 8'deki zaman çizgisi açıklamaları (58 px) sınırda ama kabul edilebilir.
- **Derinlik:** Sahne 5 (başlık) ve 8 (zaman çizgisi) düz slayt gibi duruyor. 5'te arka plana soluk bir küf/tabak çizimi ya da Kaşif'i büyütmek (`scale` 0.62 → 0.85), 8'de Kaşif eklemek yeterli.
- **Tempo:** ≤ 35 sn ve sahne 4'ün bölünmesi (Sorun 1).

### 02-penisilin-kesfi — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 7 | 8 | 9 | 8 | 8 |

lint: OK. 467 karakter, ~34,8 sn (sınırın içinde ama dar), 11 sahne, 6 tip. motion min 5.9 (sahne 8). Geçme şartı (≥ 7) sağlanıyor. Kompozisyon ve Derinlik hâlâ 8'in altında.

Tur 1 sorunlarının durumu (14.6 / 17.8 / 23.8 / 34.3 sn karelerine bakıldı):
- **Sorun 1 (metin, süre) çözüldü.** "Sizce ne oldu?" sorusu ve "Çünkü küf bir bakteri katili salıyordu" mekanizması eklendi, "yaklaşık on yıl" düzeltildi, süre 35 sn'nin altına indi. Devrik cümle yok. "-yor" ile biten tek cümle var (5'teki "salıyordu").
- **Sorun 2 (sahne 4) kısmen çözüldü.** "ölmüştü" anında halka tertemiz, "temiz halka!" oku halkanın kenarını gösteriyor. Ama Kaşif hâlâ agarın üstünde, kolonilerin arasında duruyor. Tabak sağdan kesiliyor ve altyazı kutusu tabağın alt kenarını örtüyor (y 1170–1340).
- **Sorun 3 (sahne 7 ve 10) çözüldü.** Sahne 7'de duman şişeleri kapatmıyor, Kaşif kadrajda. Sahne 10'da Fleming var, üst tabaktaki küf okunur büyüklükte (~100 px).
- **Ek düzeltmeler oturmuş.** Sahne 6'daki tabela okunuyor. Sahne 8'de Kaşif var.
- **Doğruluk:** "Bakteri katili: penisilin" doğru; penisilin stafilokok gibi Gram-pozitif bakterileri öldürür. "Madde çok dayanıksızdı" doğru; Fleming'in özütü hızla etkinliğini kaybediyordu. "Yaklaşık on yıl sonra Florey ve Chain" doğru (1939–40).

1. **Sahne 4, Kompozisyon:** Kaşif (`x` 0.9) tabağın içinde, altın kolonilerin arasında duruyor. Tabak sağdan kesiliyor, altyazı tabağın alt kenarını kapatıyor; tek odak (halka) bölünüyor. Düzeltme: Kaşif'i bu sahneden çıkarın; 3. ve 5. sahnede zaten var. `zoom` [1.05, 1.18] → [1.0, 1.12] yapın, `focus` [-0.3, -0.3] → [-0.2, -0.25] olsun. Böylece tabak kadrajda kalır ve halka ortaya gelir.
2. **Sahne 5, Kompozisyon/Derinlik:** El yazısı notun oku "madde" kelimesinin üstünden geçiyor ve kelime üstü çizilmiş gibi görünüyor (x 580–730, y 670–735). Not ("bakteri öldüren madde") anlatımı ("bakteri katili") tekrar ediyor. "penisilin" kelimesi düşene kadar ekranın ortası (y 550–1150) boş bir parşömen. Düzeltme: notu, anlatımın söylemediği doğru bir bilgiyle değiştirin: `"note": "ilk adı: “küf suyu”"`. Ok kalacaksa notun sol ucundan başlasın ya da kaldırılsın. Ortadaki boşluğa soluk bir küflü tabak çizimi koyun ya da `y` 0.27 → 0.33 yapıp yazıyı büyütün (`size` 140 → 170).
3. **Sahne 2–3, Senaryo:** "Fleming tatilden dönmüştü. Tabaklardan birinde…" geçişinde "tabaklar" anlatımda hiç tanıtılmıyor; sadece dinleyen biri hangi tabaklar olduğunu bilmiyor. "Fleming tatilden dönmüştü." da kuru bir bilgi cümlesi. Düzeltme:
   - 2: "Fleming tatilden dönüp bakteri tabaklarına baktı."
   - 3: "Birinde mavi yeşil bir küf vardı. Sizce ne oldu?"
   - 8: "On yıl kadar sonra bunu Florey ve Chain başardı."

   Toplam ≈ 474 karakter. Preview 35 sn'yi geçerse 5. sahnedeki "bir" kelimesini çıkarın (≈ 470).

8 altında kalan kriterler:
- **Kompozisyon:** Sorun 1 ve 2 düzelirse 8 olur. Küçük not: 10. sahnede raf ayağı "tatilde" yazısının "t" harfine biniyor; `label.y` 0.3 → 0.33 yapın.
- **Derinlik:** Sahne 5 hâlâ düz bir slayt (Sorun 2'deki arka plan tabağı çözer). Sahne 8'de zaman çizgisinin arkasında hafif bir parşömen/harita dokusu ya da Kaşif'in daha büyük durması (`scale` ~0.8) yeterli.

### 02-penisilin-kesfi — tur 3 (son tur)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 9 | 8 | 8 |

lint: OK. 471 karakter, ~35,1 sn (tahmini; sınırda), 11 sahne, 6 tip. motion min 6.7 (sahne 8). **GEÇTİ** (tüm kriterler ≥ 8).

Tur 2 sorunlarının durumu (15.3 ve 18.6 sn karelerine bakıldı):
- **Sahne 4 çözüldü.** Kaşif çıkmış, tabak kadraja tam sığıyor, halka ortada ve tertemiz. "temiz halka!" oku halkayı gösteriyor, altyazı tabağa binmiyor.
- **Sahne 5 çözüldü.** "Gizli silah: penisilin" büyük ve kadrajı dolduruyor. Not "ilk adı: “küf suyu”" oldu: doğru, yeni bir bilgi ve üstü çizilmiş görünümü kalmadı.
- **Sahne 8 ve 10 çözüldü.** Sahne 8'de Kaşif büyüdü. Sahne 10'da etiket raf ayağından kurtuldu.
- **Metin:** Art arda aynı ek yok, devrik cümle yok. "-yor" ile biten 2 cümle var ("bakıyordu", "salıyordu"), sınırın içinde. Doğruluk değişmedi, sorun yok.

Kalan küçük notlar (yayını engellemez):
1. **Süre (tahmini 35,1 sn):** Sınırı 0,1 sn aşıyor. Gerçek TTS daha uzun çıkarsa 8. sahnedeki "Yaklaşık on yıl sonra bunu" ifadesini "On yıl kadar sonra bunu" yapın; bu yaklaşık 5 karakter kısaltır.
2. **Sahne 5 metni:** "Çünkü küf, bir bakteri katili salıyordu" kulakta biraz eksik duruyor ("bir bakteri katili" daha doğal). Süre izin verirse "bir" kelimesini geri ekleyin ve 1. nottaki kısaltmayla dengeleyin.
3. **Sahne 3:** Açılışta "mavi yeşil küf" etiketi, küf henüz büyümeden soluk olarak görünüyor. Etiketin görünmesi `mold` cue'suna kadar tamamen 0 olsun. Sahne 2'de "tabaklarına" yerine "bakteri tabaklarına" demek, sadece dinleyen için daha net olur.

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

### Çekim listesi (sahne 0'dan): YouTuber anlatıcı sesi (BRAND §6.0–6.3), üçüncü yükleme

Anlatım, tek parça hikâye olarak:
"Avustralya bir zamanlar kuşlara savaş açtı, biliyor muydunuz? Gelin anlatayım: 1932'ydi. Yirmi bin kadar emu buğday tarlalarını silip süpürüyordu. Çiftçilerin çoğu eski askerdi ve makineli tüfek istediler. Peki ordu kimi gönderdi dersiniz? Bir binbaşı, iki asker, iki tüfek! Ama bakın işin komik tarafı: emular tüfeği görünce dağılıp kaçtılar. Tüfek de tam o anda tutukluk yaptı. Binbaşı raporuna “tank gibiler” diye yazdı. Binlerce kurşundan sonra ordu eve döndü. Yani savaşı kim kazandı? Emular!"

Kapak: `AVUSTRALYA / KUŞLARA / SAVAŞ AÇTI`. 488 karakter (lint 497), 10 sahne, tahmini ~36 sn, "-yor" sonlu cümle 0.

| # | Anlatım parçası | Ton | Tip | Görsel |
|---|---|---|---|---|
| 0 | Avustralya bir zamanlar kuşlara savaş açtı, biliyor muydunuz? | curious | emu charge | Lewis'li asker ateşte, 7 emu, büyük Kaşif 'kuşlara'da şok |
| 1 | Gelin anlatayım: 1932'ydi. | mischievously | map | Avustralya, Perth, Campion, "Kasım 1932" |
| 2 | Yirmi bin kadar emu buğday tarlalarını silip süpürüyordu. | excited | emu field | Ezilmiş buğdayda gagalayan sürü, "~20.000 emu!", Kaşif dürbünden bakıp şaşırıyor |
| 3 | Çiftçilerin çoğu eski askerdi ve makineli tüfek istediler. | sarcastic | stage | "Gaziler" tabelası, "MAKİNELİ TÜFEK!", kızgın çiftçiler, Kaşif şok |
| 4 | Peki ordu kimi gönderdi dersiniz? Bir binbaşı, iki asker, iki tüfek! | laughs | stage | Kaşif soruyor; Meredith + Lewis taşıyan iki asker giriyor, "3 kişi, 2 tüfek" |
| 5 | Ama bakın işin komik tarafı: emular tüfeği görünce dağılıp kaçtılar. | mischievously | emu scatter | Ateş, boşa toz, sürü gruplara bölünüyor |
| 6 | Tüfek de tam o anda tutukluk yaptı. | surprised | emu charge + jam | Duman, "?" |
| 7 | Binbaşı raporuna “tank gibiler” diye yazdı. | laughs | stage | Meredith elinde rapor, "“Tank gibiler!”" + ok, Kaşif şok |
| 8 | Binlerce kurşundan sonra ordu eve döndü. | sarcastic | title | "9.860 / kurşun", not "5 hafta sonra: eve dönüş" |
| 9 | Yani savaşı kim kazandı? Emular! | excited | emu words + peek | "Kazanan" + kırmızı kutuda "emular", başaklardan emu fırlıyor, Kaşif gülüp omuz silkiyor |

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

### 01-emu-savasi — tur 3 (yeni anlatım, HEAD e040967 kuralları, eleştirmen)
lint OK · 494 karakter · 11 sahne · tahmini 37,4 sn (taslak MP4 37,4 sn; 35 sn üst sınırının üstünde) · motion 8,8–20,4 · hayalet şerit yok.

**Senaryo (önce sadece metin okundu): 7.**
- **Artılar:** podcast gibi akıyor; anlatıcı sesi var ("Düşman mı? Kuşlar.", "Yani — bir binbaşı…"). Cümleler bağlaçla bağlanıyor ("ama", "de", "yani"). Açılıştaki soru-cevap kalıbı sondaki "Emular mı? Tarlada kalıyor." ile güzel bir ayna kuruyor.
- **Eksiler:**
  - "savaş ilan etti" resmî bir ilanı ima ediyor; böyle bir ilan yok.
  - "dağılıp kaçıyorlar" nedeni ve duyusal ayrıntıyı vermiyor.
  - En şaşırtıcı ironi düşmüş: binlerce kurşuna karşılık bin bile olmayan emu.
  - "Binbaşı raporuna yazıyor" hâlâ biraz altyazı dili.

| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 8 | 7 | 7 | 6 | 7 | 8 | 8 |

**Sonuç: FAIL** (Tempo 6). Kolayca düzeltilebilir.

1. **Süre ve tempo.** Süre 37,4 sn. Sahne 3-4-5 üst üste üç `stage` sahnesi, 3 ile 4 aynı dekor. Toplamda 11 sahnenin 5'i birbirine benzeyen ayakta duran figür dizisi.
   - **Kısalt, evet.** Sahne 3 ile 4'ü tek sahnede birleştir. Zaten tek cümle: "Çiftçilerin çoğu savaştan dönme asker; ne istediklerini biliyorlar: makineli tüfek." (`hit`=tüfek)
   - Sahne 7: "Tüfek de tam o anda tutukluk yapıyor."
   - Sahne 0: "bir gün" çıksın.
   - Hedef ≤ 35 sn ve 10 sahne. Stage dizisi en fazla 2 olsun.
2. **Senaryo ve doğruluk.**
   - Sahne 0: "Avustralya bir gün savaş ilan etti." yerine "Avustralya ordusu bir gün savaşa çıktı." ya da "Avustralya bir gün kuşlara savaş açtı." (kapakla aynı).
   - Sahne 9'a maliyet ironisini geri koy: "Binlerce kurşun ve birkaç hafta sonra ordu evine dönüyor." Bu karakteri bütçe içinde tutar, sondaki punchline'ı da güçlendirir.
3. **Görsel.**
   - Sahne 1 boş bir slayt: iki kelime ve minik bir Kaşif. Kaşif `scale` ≥ 0,8 olsun, "kuşlar" kelimesinde arkadan tek bir emu kafası girsin.
   - Sahne 5'te hâlâ tüfek yok ve Kaşif'in yüzü dürbünün arkasında. Askerlerden ikisine Lewis tutturup Kaşif'i `point` pozuna al.
   - Sahne 10'da emular Kaşif'in üstüne biniyor. Kaşif'in etrafında x ±0,12 emusuz bir alan bırak.

**Kapak:** büyük şok Kaşif, okunaklı, kapak cümlesi ilk cümleyle uyumlu. İyi.
