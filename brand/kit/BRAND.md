# Düşün Bakalım — Marka Kitabı

Kanalın "anayasası". Senaryo yazan, sahne kodlayan, kapak ya da Higgsfield görseli üreten **her ajan
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
| Kural | Her videonun sahnelerinin **en az yarısında** Kaşif ekranda ve **bir şey yapıyor** (sadece durmuyor). Ağzı **sabittir** (konuşma animasyonu yok; kanal sahibinin kararı), duyguyu kaşlar ve poz taşır. |

**İkinci kanal Anlatayım Gel:** anlatıcı aynı çizim ve aynı kurallarla, ama kâşif şapkası yerine **kırmızı fes** (`red` #A8432F, mürekkep püskül) takar; senaryoda `"narrator": "fes"`.

Referans çizim: `brand/kit/kasif-reference.png` (kodla üretilir; tasarım değişirse yeniden üretilir).

## 3. Renkler (tek palet, sabit)

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
| Altyazı | **Lora** 700 | `ink` renkte, açık parşömen şerit üstünde; vurgu kelimesi `gold`/`red` |
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
  kâğıt kayması/sayfa çevirme geçişi.
- **Haritalar:** eski harita stili, `ink-soft` kıyı çizgileri, kesikli rota, pusula gülü, Patrick Hand etiketler.

## 6. Anlatım kuralları (sert)

0. **Anlatıcı bir YouTuber'dır (kanal sahibinin kararı, en önemli kural).** Kanalın sahibi kameraya değil
   izleyiciye konuşur: **"siz" diye hitap eder, "ben" diye anlatır**, merakı paylaşır ve açıklar. Örnek açılış:
   *"Kediler neden hep dört ayağının üstüne düşer, hiç merak ettiniz mi? Gelin, hemen anlatayım."*
   Yasak: olayı üçüncü şahıs altyazısı gibi saymak (*"Belini döndürür. Dört ayağının üstüne düşer."*).
   İstenen kalıplar: "Hiç merak ettiniz mi…", "Bakın, işin sırrı şurada…", "Şimdi size çok ilginç bir şey
   söyleyeceğim:", "Peki sizce ne oldu?", "İnanması zor ama…", "İşte tam burada…". Açıklamayı sıcak, içten,
   biraz heyecanlı yap; izleyiciyle birlikte şaşır. Hikâye kısmı geçmiş zamanla anlatılır (§3).
1. **Selam ve kanal tanıtımı yok** ("Merhaba arkadaşlar, kanalıma hoş geldiniz" yok). İlk cümle doğrudan
   merak sorusu ya da şaşırtıcı iddiadır; hemen ardından "gelin anlatayım" gibi kısa bir davet gelebilir.
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
7. **Kapanış:** Shorts tam ve akılda kalan bir cümleyle biter (döngü yok); uzun video tek bir yorum sorusuyla.
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
| Uzun (16:9) | 8–10 dk | 6–8 bölüm kartı; kanca → hikâye → dönüm noktası → "peki neden?" → bugün → soru |

## 8. Görseller kodla üretilir; Higgsfield istisnadır

**Kanal sahibinin kuralı: görseller genel olarak kodla üretilir.** Her sahne önce kodla çizilir
(Kaşif `stage`, `map`, `timeline`, `board`, `title`, `chapter` ve konuya özel yeni kod sahneleri).
Kodla çizmek için yeni bir sahne tipi yazmak gerekiyorsa yazılır; yapay zekâ görseli kolay yol değildir.

Higgsfield yalnızca kodla makul sürede çizilemeyecek **geniş mekân/atmosfer** anları için, uzun videoda
**en fazla 2–3 klip** (Shorts'ta hiç). Kullanılırsa: gerçekçi video değil, **parşömen üzerine mürekkep çizim** sahneleri üretilir; karakter ve yazılar kodla
üstüne biner. Klipte **insan yüzü ve yazı olmaz** (karakter tutarlılığını kod sağlar).

Her prompt şu kalıpla başlar:

> `Hand-drawn sepia ink illustration on aged parchment paper with coffee stains, simple confident line art, muted brown and cream tones, subtle paper texture, gentle slow camera drift, no text, no faces,`

ardından sahne (ör. *"a Roman street with columns and a distant volcano"*). Model: önce ücretsiz hak, sonra en ucuz
(`seedance_2_0_mini` 720p 5 sn sessiz, `use_unlim: true` → olmazsa kredili ≈ 5 kredi; ayrıntı CLAUDE.md Higgsfield maddesi);
16:9 (uzun) / 9:16 (Shorts). Studio'da `photo` tipiyle `"grade": "sepia"`, `"ai": true`.

## 9. Kapak (thumbnail)

Parşömen zemin, solda/üstte Fraunces 900 dev yazı (2–3 satır, 3–5 kelime, tek kelime `red` kutuda),
yanında **büyük Kaşif** güçlü bir pozda (şok, işaret) ve olayın tek simgesi (volkan, gemi, taç).
Her kapakta Kaşif'in yüzü okunur büyüklükte olur.

## 10. Kontrol listesi (her video)

- [ ] Palet dışı renk yok, fon parşömen
- [ ] Kaşif sahnelerin en az yarısında ve hareket ediyor; şapkası var
- [ ] Çizgiler titreşiyor (boil), sabit vektör görünümü yok
- [ ] İlk cümle doğrudan olayın içinde; cümle arası boşluk sıkı
- [ ] Ekranda en fazla 5 kelime/sahne, en küçük yazı 44 px
- [ ] Tarih ve sayılar doğrulanmış
