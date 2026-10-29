# Marka Kitabı (parşömen tarzı — Stickstory)

> **2026-10-29'dan beri Düşün Bakalım'ın bütün videoları belgesel tarzındadır: anayasası `docs/BELGESEL.md`**
> (kanal sahibinin kararı). Bu dosyanın görsel kuralları (§2 Kaşif, §3 renkler, §4–5 çizim, §6.0 YouTuber anlatıcı,
> §9 kapak, §10–11) artık **Stickstory**'nin parşömen tarzı içindir. Düşün Bakalım için buradan sadece §1 (kimlik,
> niş, konu havuzu) ve §6.1, §6.3, §6.3b, §6.6, §6.7, §6.12 geçerlidir.

Kanalın "anayasası". Senaryo yazan, sahne kodlayan, ya da kapak üreten **her ajan
önce bunu okur**. Burada yazmayan bir görünüm kullanılmaz; çelişki varsa bu dosya kazanır.

## 1. Kimlik

- **Kanal:** Düşün Bakalım. **Slogan:** *Tarihin "neden"leri.*
- **Niş:** **tarih hikâyeleri.** Gerçek bir olay, gerçek insanlar, bir gerilim ve "peki neden oldu?"
  sorusunun cevabı. Bilim ancak bir tarih olayını açıklamak için girer (Pompeii'nin volkanı,
  Titanik'in çeliği).
- **Konu havuzu (dönüşümlü):** felaketler ve kazalar · kayıp şehirler ve gizemler · büyük kararlar ve
  savaşların dönüm noktaları · keşifler ve icatların hikâyesi · imparatorlukların yükseliş/çöküşü ·
  **Türkiye ve Osmanlı tarihinden anlar** (Türk izleyici için en güçlü damar: haftada en az 2 video).
- **Ton:** sıcak, merak uyandıran, saygılı. Ölüm ve acı sansasyon için kullanılmaz.
- **İzleyici sonunda ne hisseder:** "Bunu hiç böyle düşünmemiştim" + bir sonraki bölümü izleme isteği.

## 2. Karakter: Kaşif

Kanalın tek ve sabit anlatıcı karakteri. Her videoda, aynı çizimle, aynı kurallarla görünür.

| Özellik | Değer |
|---|---|
| Ad | **Kaşif** |
| Kafa | Büyük yuvarlak kafa, iç dolgu `paper-light`, kontur `ink` 6 px. Gövde boyunun ~%28'i. |
| Yüz | İki nokta göz, ince kaşlar (duyguyu kaşlar taşır), tek çizgi ağız (sabit; sadece şok pozunda "o" olur). Burun yok. |
| Gövde | Çöp çizgi: gövde, kollar, bacaklar `ink` 7 px, yuvarlak uçlar. Eller küçük yuvarlak, ayaklar küçük oval. |
| **İmza aksesuar** | **Kahverengi kâşif şapkası** (`hat` #8B5A2B, bant `hat-band` #4E3218). Silüetten tanınır. **Asla çıkarmaz.** |
| Diğer karakterler | Aynı çöp adam stili ama **şapkasız**; döneme göre tek aksesuar (Romalıya defne tacı, denizciye bere, padişaha sarık). Kaşif'le asla karıştırılmaz. |
| Hareket kütüphanesi | `idle` (nefes alır, hafif sallanır) · `walk` (sahneye yürüyerek girer/çıkar) · `point` (bir şeyi gösterir) · `think` (el çenede) · `shock` (geri sıçrar, kaşlar yukarı) · `shrug` · `talk` (el hareketleriyle anlatır) · `wave` · `run` · `sit` · `hold` (bir nesne/tabela tutar) · `look` (dürbünle bakar). |
| Kural | **Sunucu, figüran değil (kanal sahibinin kararı, 2026-10-26).** Kaşif sahnelerin **%15–25'inde** görünür (en fazla %35, lint): açılışta, bölüm dönüşlerinde, kilit anda ve kapanışta. Göründüğünde **bir şey yapar** (işaret eder, şaşırır, bir nesneyi tutar); kenarda seyirci gibi durmaz. Geri kalan sahneleri olayın kendisi doldurur. Kapakta kalır. Ağzı **sabittir** (konuşma animasyonu yok), duyguyu kaşlar ve poz taşır. |

**İkinci kanal Stickstory (eski adı Anlatayım Gel):** anlatıcı aynı çizim ve aynı kurallarla, ama kâşif şapkası yerine **kırmızı fes** (`red` #A8432F, mürekkep püskül) takar; senaryoda `"narrator": "fes"`. Stickstory'nin ekran kimliği ayrıdır (§11).

Referans çizim: `brand/kit/kasif-reference.png` (kodla üretilir; tasarım değişirse yeniden üretilir).

## 3. Renkler (5 palet, her video birini kullanır)

Aşağıdaki tablo klasik **sepia** paletidir. Kanal sahibinin kararıyla (2026-10-26) aynı rollerle 4 kardeş palet
daha var: **olive** (zeytin yeşili kâğıt), **indigo** (lacivert mürekkep, soğuk kâğıt), **terracotta** (kiremit,
sıcak kâğıt), **ash** (kül grisi kâğıt). Değerler `scenes/studio/palettes.json`'da; `build.py` her videoya birini
seçer. Hepsinde kâğıt açık, mürekkep koyu, vurgular soluk ve uyumlu; tarz her zaman parşömen + mürekkep kalır.
Sahne kodu renkleri sadece token'lardan (`INK.*`) alır, sabit hex yazmaz. Kaşif'in şapka renkleri hiç değişmez.

| Token | Hex | Kullanım |
|---|---|---|
| `paper` | `#E9DCC0` | Ana parşömen zemin |
| `paper-light` | `#F4EAD5` | Kartlar, kafa dolgusu, rozet içi |
| `paper-dark` | `#D3C09A` | Gölge, vinyet, eski kenarlar |
| `stain` | `#B88F5A` (%15–30 opaklık) | Kahve lekeleri, yaşlanma |
| `ink` | `#2B1D12` | Tüm çizgiler ve ana yazı |
| `ink-soft` | `#6B5440` | İkincil yazı, ince çizgiler |
| `blue` | `#4A6F94` | Vurgu rozetleri, onay işaretleri, bölüm numarası |
| `red` | `#A8432F` | Uyarı, tehlike, "yanlış", vurgulu başlık |
| `gold` | `#C8922E` | Altyazıda vurgulanan kelime, önemli sayı |
| `green` | `#5E7D4B` | "Doğru", güvenli |
| `hat` / `hat-band` | `#8B5A2B` / `#4E3218` | Sadece Kaşif'in şapkası |

**Yasak:** saf siyah/beyaz, neon, renk gradyanı fonlar, parlak 3D plastik görünüm, emoji ikonlar, stok
fotoğraf. Gerçek fotoğraf/klip kullanılacaksa `sepia` renk düzeltmesiyle parşömen dünyasına uydurulur.

## 4. Tipografi

| Rol | Yazı tipi | Not |
|---|---|---|
| Başlık, bölüm kartı, dev yazı | **Fraunces** 800–900 | Sıcak, kalın serif (örnek: "Önce her sahnenin görseli") |
| Altyazı | **Lora** 700 | `ink` renkte, kutusuz, açık parşömen hale ile; vurgu kelimesinin altından `gold` (ya da `red`) fosforlu kalem çizgisi geçer |
| El yazısı notlar, etiketler | **Patrick Hand** | Okların ucunda, karakterin yanında, harita notlarında |

Dosyalar: `scenes/studio/fonts/` (Türkçe karakterler dahil). Ekranda en küçük yazı 44 px (1080 genişlikte).

## 5. Çizim dili

- **Mürekkep çizgi:** 5–7 px, yuvarlak uç, `ink`. Doldurma yok ya da `paper-light`.
- **El çizimi titreşim ("boil"):** tüm çizgiler saniyede **8 kez** 1,5–2,5 px oynar (deterministik
  `rng(seed + kare)`); bu, "kâğıda elle çizilmiş" hissinin kaynağıdır. Kaşif dahil her şeye uygulanır.
- **Zemin:** parşömen dokusu + 2–4 kahve lekesi + kenar vinyeti + çok hafif kâğıt lifi. Her videoda
  aynı doku, lekelerin yeri sahneye göre değişir.
- **Kartlar/rozetler:** yuvarlatılmış köşe, 3 px `ink` kontur, hafif yumuşak gölge, `paper-light` iç.
  Hap biçimli rozetler `blue` ya da `red`, içinde `paper-light` yazı (örnekteki "Yan yana koy, kontrol et").
- **Kamera:** yavaş kayma ve yakınlaşma (2D sahnede `scale` ve `translate`), sert kesme yerine
  kâğıt kayması/sayfa çevirme geçişi. Ayrıntısı §5.1.
- **Haritalar:** eski harita stili, `ink-soft` kıyı çizgileri, kesikli rota, pusula gülü, Patrick Hand etiketler.

### 5.1 Dekor ve kamera (kanal sahibinin kararı, 2026-10-26: "videolar birbirine çok benziyor")

Eskiden her sahne boş kâğıdın ortasında yüzen bir çizimdi; her kare aynı geniş plandı. Artık her kare bir **dünya**:

- **Dekor (`"set"`):** sahnenin arkasında kenardan kenara mürekkep-yıkama dünya (`scenes/studio/sets.js`): gökyüzü,
  ufuk, orta plan ve figürlerin bastığı zemin; uzak planlar soluk ve mavimsi, yakın planlar sıcak, koyu ve taralı
  (derinlik). Türler: `field`, `hills`, `desert`, `sea` (kıyı), `ocean` (açık deniz), `coast`, `city`, `interior`,
  `night`, `snow`, `storm`. Sahnede `"set": "hills"` ya da `{"name": "sea", "ground": 1150, "horizon": 980}`
  (sahne pikseli; `ground` verilmezse motor çizimin zemin çizgisini ölçer). Zemin çizgisi olan bir sahne `"set"`
  yazmazsa sade `field` alır; `"set": false` kapatır. Harita, pano, başlık gibi kendi çerçevesi olan sahnelere dekor
  konmaz. Bir video aynı dekoru baştan sona kullanmaz: yer değiştikçe dekor değişir (kıyı → açık deniz → fırtına).
- **Kamera (`"camera"`):** motor her sahneyi kadraja oturtur ve sahne boyunca hareket ettirir (itme, çekme, sağa/sola
  kayma); hareket sahneden sahneye değişir. **Plan büyüklüğü değişir:** yakın plan için
  `"camera": {"focus": [x, y], "zoom": 1.8, "move": "push"}` (`focus` = gösterilen tek şeyin sahne pikseli: bir yüz,
  bir el, bir nesne). Shorts'ta en az 1, uzunda en az 4 yakın plan (lint uyarır); geniş plan → yakın plan → orta plan
  ritmi. `"camera": false` kilitli geniş plan. `photo` sahnesi kendi kamerasını kullanır.
- Dekor ve kamera eski sahne tiplerinin hepsiyle çalışır; yeni sahne tipi yazan ajan kendi arka planını çizmez,
  dekora bırakır (zemin çizgisi y ≈ 1100–1200 olmalı ki dekorun zemini ayakların altına otursun).

## 6. Anlatım kuralları (sert)

0. **Anlatıcı bir YouTuber'dır (kanal sahibinin kararı, en önemli kural).** Kanalın sahibi kameraya değil
   izleyiciye konuşur: **"siz" diye hitap eder, "ben" diye anlatır**, merakı paylaşır ve açıklar. Örnek açılış:
   *"Kediler neden hep dört ayağının üstüne düşer, hiç merak ettiniz mi? Gelin, hemen anlatayım."*
   Yasak: olayı üçüncü şahıs altyazısı gibi saymak (*"Belini döndürür. Dört ayağının üstüne düşer."*).
   İstenen kalıplar: "Hiç merak ettiniz mi…", "Bakın, işin sırrı şurada…", "Şimdi size çok ilginç bir şey
   söyleyeceğim:", "Peki sizce ne oldu?", "İnanması zor ama…", "İşte tam burada…". Açıklamayı sıcak, içten,
   biraz heyecanlı yap; izleyiciyle birlikte şaşır. Hikâye kısmı geçmiş zamanla anlatılır (§3).
1. **Selam ve kanal tanıtımı yok** ("Merhaba arkadaşlar, kanalıma hoş geldiniz", "bu videoda", "bugün size" yok;
   lint engeller). İlk cümle doğrudan en çarpıcı an, merak sorusu ya da şaşırtıcı iddiadır. Shorts'ta ilk cümle
   3–8 kelimedir (ilk 2 saniye); uzun videoda ilk 30 saniye olayın içinde geçer (soğuk açılış), uzun giriş yoktur.
2. **Doğal okuma (kanal sahibinin kararı).** Seslendirmeye hiçbir ses/hız ayarı yapılmaz: `tts.settings`
   yok, `"pacing"`/`"max_pause"` yok (sessizlik eklenmez/kesilmez), `"tone"` ses etiketleri yok. Ses kendi
   doğal okumasıyla okur. Tonlamayı **noktalama** taşır: cümleler nokta, soru işareti ya da ünlemle biter;
   virgüller nefes yerlerine konur; "…" sadece gerçekten bekletilecek yerde; tırnaklar kapatılır; kısaltma,
   rakam-yazı karışıklığı yok. `tools/lint.py` bunları denetler.
3. **YouTube anlatıcısı gibi konuş, "-yor -yor" diye sayma (kanal sahibinin kararı).** Hikâye anlatan biri
   gibi **geçmiş zamanla** anlat ("1932'ydi. Avustralya'da çiftçiler çaresizdi."), kipleri karıştır: -dı, -mış
   ("derler ki…"), -ecekti ("ama birazdan her şey değişecekti"), soru, ünlem, izleyiciye hitap ("Düşünün…",
   "Tahmin edin ne oldu?"). Art arda iki cümle aynı ekle bitmez; cümlelerin en fazla üçte biri "-yor" ile biter
   (`tools/lint.py` denetler). Ton: arkadaşına inanılmaz bir şey anlatan biri; şaşıran, gülen, bekleten.
   Yasak örnek: "Ordu geliyor. Emular dağılıyor. Tüfek tutukluk yapıyor." İstenen: "Ve ordu geldi. Tam
   kadro mu? Ne gezer! Bir binbaşı, iki asker, iki tüfek. Emular ise… dağıldı. Hem de nasıl!"
3b. **Devrik cümle yok (kanal sahibinin kararı).** Cümleler Türkçenin düz sırasıyla kurulur: özne başta,
   yüklem sonda. Yasak: "Geldi ordu.", "Çizdi Amerika'yı bir Osmanlı denizcisi.", "Kaçtı emular tüfeği
   görünce." Doğrusu: "Ordu geldi.", "Bir Osmanlı denizcisi Amerika'yı çizdi.", "Emular tüfeği görünce
   kaçtı." Tek kelimelik vurgu cevapları ("Kazanan mı? Emular!") ve soru kalıpları ("Nasıl mı?") devrik sayılmaz.
4. **Sahne başına tek fikir**, ekranda en fazla 5 kelime. Kaşif o fikri **gösterir** (işaret eder, şaşırır, dürbünle bakar).
5. Her 20–30 saniyede bir **soru/gerilim kancası**: "Ama asıl felaket henüz başlamamıştı."
6. **Sayı, tarih, isim doğrulanmadan yazılmaz**; tartışmalıysa "büyük olasılıkla" de.
7. **Kapanış:** Shorts tam ve akılda kalan bir punchline + tek kısa, doğal abone cümlesi (nedeniyle: "Her gün
   böyle gerçek bir hikâye için abone olun.") ile biter (döngü yok); uzun video tek bir yorum sorusu ve abone çağrısıyla.
12. **Kaynaklar görünür:** her senaryo doğrulandığı kaynakları `sources` listesinde taşır (açıklamaya eklenir);
   kilit bilgi sahnelerinde ekranda kısa bir "Kaynak: …" notu (`source`). Araştırma emeği izleyiciye görünür.
11. **Uzun videoda tempo:** her 45–60 saniyede bir hikâye kancası ve görsel değişim; her bölüm bir sonrakine çeken
   bir cümleyle biter. Efekt sesi yok, dikkat hikâye ve görüntüyle tutulur.
9. **Düz anlatım yasak (kanal sahibinin kararı).** Bilgi sıralamak değil, hikâye anlatmak: izleyiciye
   doğrudan seslen ("Şimdi şunu düşün…", "Sence ne yaptılar?"), merakı bir cümle bekletip sonra cevapla,
   zıtlık kur ("Herkes zinciri izliyordu. Kimse tepeye bakmıyordu."), somut duyusal ayrıntı ver (ses, koku,
   soğuk, ağırlık), cümle uzunluklarını değiştir (kısa vurucu cümle + bir orta cümle), bir kez sürpriz yap.
   Ders kitabı cümlesi ("X yılında Y oldu. Bu çok önemliydi.") kullanılmaz. Eleştirmen bunu "Kanca" ve
   "Derinlik" puanında sert değerlendirir.
10. **Önce senaryo, sonra görüntü.** Anlatım, ekranda ne olduğunu anlatan altyazı cümleleri değildir;
   tek başına dinlenince de işleyen bir hikâyedir. Yazar önce metni bütün olarak yazar, sonra sahnelere
   böler. Yasak örnek (altyazı dili): "Kamyona tüfek kuruyorlar; kamyon yetişemiyor. Meredith rapora
   yazıyor." İstenen (anlatıcı dili): "Binbaşı inatçı. Tüfeği bir kamyonun kasasına bağlatıyor, emuların
   peşine düşüyor. Ama arazi o kadar engebeli ki nişan almak bir yana, tüfekçi kasada zor duruyor."
   Bağlaçlar ("ama", "çünkü", "yani", "ve tam o anda"), anlatıcı yorumu ("İşte burada işler tuhaflaşıyor"),
   ritim (kısa vurucu cümle + akan uzun cümle) zorunlu. Ekranda zaten görünen bir şeyi söyleme; görüntünün
   söyleyemediğini söyle (neden, his, sonuç, ironi).
8. Uzun videoda bölümler **"BÖLÜM 2 / 5"** kartıyla açılır (örnekteki gibi: mavi daire içinde rakam, altında Fraunces başlık).

## 7. Formatlar

| | Süre | Yapı |
|---|---|---|
| Shorts (9:16) | 28–35 sn | 8–11 sahne; tek bir tarih anı ya da şaşırtıcı ayrıntı; kapak yazısı = ilk cümle |
| Uzun (16:9) | 5–6 dk | 4–5 bölüm kartı; kanca → hikâye → dönüm noktası → "peki neden?" → bugün → soru |

## 8. Görseller sadece kodla üretilir

**Kanal sahibinin kuralı (2026-10-22, 2026-10-26'de kesinleşti): Higgsfield ya da başka bir yapay zekâ
görsel/video aracı hiç kullanılmaz; Higgsfield araçları hiçbir oturumda çağrılmaz.** Her sahne kodla çizilir (Kaşif `stage`, `map`, `timeline`, `board`, `title`, `chapter` ve
konuya özel yeni kod sahneleri); gerekiyorsa yeni sahne tipi yazılır. Gerçek tarihî belge/yer/eser için
telifsiz fotoğraf (`photo`, sepya) kullanılabilir.

## 9. Kapak (thumbnail)

Parşömen zemin, solda/üstte Fraunces 900 dev yazı (1–3 satır, **2–4 kelime**, tek kelime `red` kutuda),
yanında **büyük Kaşif** güçlü bir pozda (şok, işaret) ve olayın **tek simgesi** (volkan, gemi, taç).
Her kapakta Kaşif'in yüzü okunur büyüklükte olur. **Tek net odak noktası:** kalabalık sahne, çok nesne, çok yazı
yok; uzun video kapağında `cover.focus` o tek nesneyi büyütür, gerisi kâğıda erir.
Uzun video kapağında yazı büyüklüğü `cover.size` (px, başlangıç; sığmazsa küçülür) ile ayarlanır.
Her küçük resmin kenarında kalın bir **çerçeve** vardır (kanal sahibinin kararı, 2026-10-26: akışta göze çarpsın):
Düşün Bakalım `red` çerçeve + `ink` iç çizgi, Stickstory `ink` çerçeve + `gold` iç çizgi. Motor ekler; videonun
kendi karelerinde yoktur.

## 10. Kontrol listesi (her video)

- [ ] Palet dışı renk yok, fon parşömen
- [ ] Kaşif sahnelerin %15–25'inde (sunucu), göründüğünde bir şey yapıyor; şapkası var
- [ ] Sahneler bir dünyada geçiyor (`set`), yer değiştikçe dekor değişiyor; en az 1 (uzunda 4) yakın plan
- [ ] Çizgiler titreşiyor (boil), sabit vektör görünümü yok
- [ ] İlk cümle doğrudan olayın içinde; cümle arası boşluk sıkı
- [ ] Ekranda en fazla 5 kelime/sahne, en küçük yazı 44 px
- [ ] Tarih ve sayılar doğrulanmış

## 11. Stickstory: global İngilizce kanal (2026-10-22, eski adı Anlatayım Gel)

Kanal adı **Stickstory** (ekranda sol üstte, kapakta değil). Kanal açıklamasının ilk cümlesi: *"How about hearing history from a stick figure? ✏️📜"*.

Çizim dili aynı (§2, §5, §5.1; anlatıcı kırmızı fesli), ama **ekran kimliği ayrı (kanal sahibinin kararı,
2026-10-26: iki kanal birbirinin kopyası gibi durmaz):**

- **Kâğıt:** soğuk gazete/saha defteri kâğıdı, `palettes.json` içindeki `ag-` setleri (`ag-newsprint`, `ag-slate`,
  `ag-sage`, `ag-dusk`); Düşün Bakalım'ın sıcak setlerini kullanmaz (lint).
- **Yazı:** **Zilla Slab** (kicker, altyazı, kapak, marka); kicker ve marka harf aralıklı büyük harf, işaret kare.
- **Altyazı:** koyu mürekkep şerit üstünde açık yazı, vurgu kelimesi `gold`, şeridin altında kırmızı ofset gölge.
- **Kapak:** Zilla Slab büyük harf; vurgu kelimesi mürekkep kutuda, kırmızı ofset gölgeyle, eğik değil.
- Motor bunları `"narrator": "fes"`'ten kendisi seçer; senaryoya ayrıca bir şey yazılmaz.

Dil, niş ve anlatım:

- **Dil:** her şey İngilizce: anlatım, kicker, etiketler, el yazısı notlar, harita adları (İngilizce yaygın
  adlarıyla: "Constantinople", "Azores"), kapak, YouTube metadata. Senaryoda `"lang": "en"`; motor büyük harfi
  `en-US` kuralıyla basar ve bölüm kartını "CHAPTER 2 / 5" yazar.
- **Niş:** `tools/channels.py` → `categories` (tarihin en tuhaf anları, çözülmemiş gizemler, nasıl inşa edildi,
  gündelik şeylerin kökeni, insan vücudu, hayvanların süper güçleri, uzay ve gezegenimiz, hayatta kalma hikâyeleri,
  imparatorluklar ve savaşlar). Her video gerçek ve doğrulanabilir bir hikâye/olgu anlatır; Kaşif yine anlatıcıdır.
  Konu önce günün manşetlerinden seçilir (`tools/news.py`: ABD, Avustralya, İsviçre, Norveç, Yeni Zelanda, Kanada,
  Almanya); kategoriye uyan manşetin arkasındaki kalıcı hikâye anlatılır, uyan yoksa kategori havuzu (CLAUDE.md).
- **Anlatıcı (İngilizce YouTuber sesi):** izleyiciye "you" diye seslenir, "I" diye anlatır, merakı paylaşır:
  *"Why do cats always land on their feet? Let me show you."*, *"Here's the crazy part."*, *"Now think about that
  for a second."*, *"So what actually happened?"*. Selam/kanal tanıtımı yok; ilk cümle doğrudan kanca.
  Hikâye **geçmiş zamanla** anlatılır ("In 1518, a woman stepped into the street and started to dance."),
  kısa vurucu cümle + akan uzun cümle; bağlaçlar ("but", "so", "and that's when", "because"); ekrandakini tarif etme,
  görüntünün söyleyemediğini söyle (neden, his, ironi). Ders kitabı dili ("This was very important.") yasak.
  Pasif ve dolambaçlı cümle yerine özne-yüklem-nesne düz cümle.
- **TTS için yazım:** kısaltma yok ("miles per hour", "for example"; "mph", "e.g." yok); büyük sayılar rakamla
  ama okunur ("1,701 barrels", "1872"); tırnaklar kapatılır; noktalama tonlamayı taşır. Ses ayarı/etiket yok (§6.2).
- **Kapak:** İngilizce 2–4 kelime iddia ("SHIP WITH NO CREW", "DANCED TO DEATH"); tek kelime vurgu kutusunda, tek nesne.
- **Shorts sonu:** punchline + tek kısa, doğal abone cümlesi nedeniyle: *"Subscribe for a true story like this every
  day."*, *"Follow Stickstory for one strange true story a day."* İlk cümle 3–8 kelime, en çarpıcı an, tarihle açılmaz.
- **Doğruluk:** yaygın İngilizce efsaneleri (ör. Mary Celeste'te "sıcak çay, yarım kahvaltı") anlatma ya da efsane
  olduğunu söyle.
