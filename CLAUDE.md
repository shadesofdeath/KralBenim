# Düşün Bakalım — video otomasyonu

YouTube kanalı **Düşün Bakalım** için Türkçe anlatım videoları üreten pipeline.
Her gün **4 Shorts** ve **1 uzun video** üretilir, GitHub Actions'ta render edilip YouTube'a zamanlanmış olarak yüklenir.
Aynı pipeline ikinci kanal **Anlatayım Gel**'e de üretir (aynı tarz, sadece Osmanlı ve Türk tarihi; bkz. *İkinci kanal: Anlatayım Gel*).
Kanalların ayarları (ekrandaki ad, anlatıcı, dosya öneki, yayın saatleri, YouTube secret'ı) `tools/channels.py`'dedir.

**Kanalın tek tarzı (kanal sahibinin kesin kararı):** **tarih hikâyeleri**, sepya parşömen üstüne elle
çizilmiş mürekkep ve çöp adam anlatıcı **Kaşif** (`"theme": "parchment"`). Anayasa `brand/kit/BRAND.md`;
senaryo yazmadan önce `.claude/skills/tarih-bolumu/SKILL.md` becerisi yüklenir. Eski "Studio" tarzı
(renk paletleri, 3D gezegen/küre/kafes, maskot ampul, headline/bars/compare/scale_bar/waterline…) ve
eski klasik kart motoru **kaldırıldı**; geri getirme. `videos/` altındaki eski tarz senaryolar sadece
geçmiş kayıttır (konu tekrarını önlemek için okunur), artık render edilemez ve değiştirilmez.

## Yapı

- `build.py` — `<senaryo>.json -> mp4`. ElevenLabs ile seslendirir (kelime zamanlamalı), sahneleri Playwright ile kare kare çeker (CPU sayısı kadar paralel tarayıcı), ffmpeg ile birleştirir. Sadece `"engine": "studio"` senaryoları kabul eder.
- **`scenes/studio/` — tek motor.** `engine.js` (zaman çizelgesi, geçişler, kapak, Kaşif'li kapak), `core.js` (ortak yardımcılar, `SHOTS` kaydı, `svgText`, BRAND paleti `THEME_PARCHMENT`), `parchment-theme.js` (kâğıt zemin, lekeler, altyazı şeridi, kicker, marka). Zaman tamamen `window.seek(t)` ile kontrol edilir; her şey deterministik (Math.random yok, `rng(seed)` kullan).
- `scenes/studio/shots/<tip>.js` — sahne tipleri, her tip kendi dosyasında (build.py otomatik yükler): `_ink.js` (kaynayan mürekkep çizgi yardımcıları), `kasif.js` (Kaşif rig'i + `stage`), `parchment2d.js` (`chapter`, `title`, `board`, `map`, `timeline`), `photo.js` (sepya fotoğraf/klip) ve konuya özel tipler (`emu`, `petri`/`labbench`, `halic`, `portage`, `pirimap`).
- **Referans senaryolar ve kalite seviyesi:** `videos/2026-10-20/01-emu-savasi.json` (Short), `videos/2026-10-19/05-piri-reis-haritasi.json` (uzun video).
- `brand/kit/BRAND.md` — marka kitabı (kimlik, Kaşif, renkler, tipografi, çizim dili, anlatım kuralları, kapak). **Çelişki varsa BRAND.md kazanır.**
- `videos/YYYY-MM-DD/*.json` — günlük senaryolar. Push edilince `.github/workflows/daily.yml` render + yükleme yapar, sonucu `*.youtube.json` olarak geri commit eder.
- `tools/plan.py` — bugünün üretim planı: kaç video, dosya adları, `publish_at` saatleri, uzun video günü mü, aylık ElevenLabs karakter kullanımı. **Tarih/saat hesabını elle yapma, bunu kullan.**
- `tools/lint.py` — senaryo kural denetimi (tema, Kaşif oranı, karakter, sahne sayısı, çeşitlilik, cue, anlatım, kapak, SEO, `publish_at`). Hata varsa push yok.
- `tools/preview.py` — TTS olmadan görsel kontrol (tahmini zamanlama ile kontak sayfası + kapak + sahne başına hareket ölçümü, donuk sahneyi `STATIC?` diye işaretler).
- `docs/ANIMATION_GUIDE.md` — parşömen görsel dili, sahne tipleri tablosu, ekran düzeni, hareket dili, yeni sahne tipi şablonu. **Senaryo yazan ya da sahne kodlayan her ajan önce BRAND.md'yi ve bunu okur.**
- `docs/REVIEW.md` — eleştiri döngüsü: 11 kriterli puanlama, geçme şartı (hepsi ≥ 7), günlük formatı.
- `tools/upload.py` — YouTube yüklemesi (Actions'ta çalışır, `YOUTUBE_TOKEN_JSON` secret'ı). Fotoğraf/video kredilerini (`params.credit`) açıklamaya otomatik ekler.
- `tools/media.py` — telifsiz fotoğraf/video bulur ve indirir (Wikimedia Commons; `PEXELS_API_KEY` varsa Pexels foto + video).
- `cloudflare/telegram-worker.js` — Telegram komut dinleyicisi (Cloudflare Worker): `/uzun [konu]`, `/shorts [konu]` günlük görevi API ile ek video isteğiyle başlatır. Kurulum `cloudflare/KURULUM.md`.
- `tools/hf.py` — Higgsfield sepya klibini (MCP ile üretilen) indirip 1080p'ye normalleştirir. Bulut ortamı Higgsfield CDN'ine erişemezse klip `params.url` ile senaryoya yazılır; `build.py` render sırasında (GitHub Actions) indirir, önizleme yer tutucu gösterir.

Ses: anlatım + altında çok hafif ambiyans müziği (`tools/sfx.py`, kodla üretilir). **Efekt sesi (whoosh, pop, vuruş) yok — kanal sahibi istemiyor, geri ekleme.** **Nefes sesi de istenmiyor:** `eleven_v3` kelime aralarında nefes alıyor; `build.py` (`debreath`) kelime zamanlamasına göre kelime aralarını kısar, kelimelere dokunmaz. Müziği de kapatmak için senaryoya `"sfx": false`.

Bu bulut ortamından ElevenLabs ve YouTube'a erişim yok; ses ve yükleme sadece GitHub Actions'ta çalışır. Yerel kontrol için `tools/preview.py` kullan.

## Günlük üretim görevi

Zamanlanmış görev her sabah bu bölümü uygular.

**Plan:** her gün **4 Shorts + 1 uzun video** (`python tools/plan.py` söyler). Bu planın dışına çıkma, fazladan video üretme. Karakter sınırlarına kesinlikle uy; `plan.py` aylık ElevenLabs kullanımını gösterir, `warning: true` ise raporda mutlaka belirt.

| | Süre | Karakter (anlatım metni toplamı) | Yayın |
|---|---|---|---|
| Shorts ×4 | 28–35 sn | **400–500** (sert sınır 550) | her gün 12:00, 15:00, 19:00 ve 22:00 (+03:00) |
| Uzun video (her gün) | **8–10 dk** | **6.500–7.800** (sert sınır 8.300) | her gün 20:30 (+03:00) |

**Shorts'ta izlenmeyi belirleyen kurallar** (YouTube, ilk 1–2 saniyede kaydırılan videoyu akışa açmaz):
- **Anlatıcı bir YouTuber'dır:** izleyiciye "siz" diye hitap eder, merakı paylaşır ve açıklar ("Kediler neden hep dört ayağının üstüne düşer, hiç merak ettiniz mi? Gelin, hemen anlatayım."). Olayı altyazı gibi sayan, "yapıyor ediyor" diye giden anlatım yasak; **devrik cümle yok** (özne başta, yüklem sonda: "Ordu geldi.", "Geldi ordu." değil) (BRAND.md §6.0–6.3, §6.10).
- **İlk kare dolu olmalı.** Shorts otomatik olarak `cover` bloğuyla açılır: ilk cümle bitene kadar kapaktaki dev yazı + dramatik görsel ekranda durur. Bu yüzden **ilk cümle kısa (3–10 kelime) ve kapak yazısıyla aynı fikirde** olmalı ("Bisküvilerdeki bu delikler süs değil." ↔ kapak "BU DELİKLER SÜS DEĞİL").
- **Hızlı görüntü temposu:** 2–4 saniyede bir yeni görüntü, 8–11 sahne. Anlatım ise doğal akar; sahneler cümleyi bölebilir.
- **Net kapanış (döngü yok):** son cümle **tam ve kendi başına anlamlı** olsun; videoyu bağlayan, akılda kalan bir sonuç/punchline ("Yani ayağının altında, erimeyi reddeden bir demir güneş var."). Cümleyi yarım bırakıp videonun başına bağlama — kanal sahibi "sonsuz video" etkisini istemiyor. Ayrı bir soru/"yorumlara yazın" sahnesi koyma; yorum sorusu açıklamaya yazılır.
- Hiç dolgu cümle yok; her cümle ya yeni bir bilgi ya da gerilim eklesin.

### Üretim akışı: ajanlar ve kapılar

Videolar tek seferde yazılıp gönderilmez; bir prodüksiyon gibi aşamalı ilerler. Ana oturum **yönetmen**dir:
konuları seçer, işi alt ajanlara (Agent aracı) dağıtır, kapıları denetler, commit/push'u kendisi yapar.
Alt ajanlar commit/push yapmaz. Bağımsız işler **aynı mesajda paralel** başlatılır.

1. **Ön hazırlık (yönetmen):** adım 1–3. Sonra `videos/<tarih>/production.md` yaz: her video için konu,
   konu havuzu (BRAND §1), tek cümlelik "izleyici sonunda ne hisseder", kanca + kapak fikri ve **çekim listesi**
   (her sahne: anlatım cümlesi, `visual`, sahne tipi, Kaşif ne yapıyor, cue kelimesi, kamera/hareket notu). Bu dosya
   günün yaratıcı belgesidir ve commit'e girer (workflow sadece `.json` dosyalarını render eder).
2. **Önce senaryo, sonra görüntü (kanal sahibinin kuralı):** yazar önce anlatımı **tek parça, akıcı bir metin** olarak yazar: bir anlatıcının sesiyle, sahne ve görsel düşünmeden (bkz. `brand/kit/BRAND.md` §6.10). Metin `production.md`'ye konur ve sesli okunur gibi kontrol edilir; ancak bundan sonra metin sahnelere bölünür ve görseller metne göre kurulur. Görsel cümleyi değil, cümle görseli belirler. Sahne başına cümle yazıp görseli tarif etmek yasak.
   **Yazım (video başına 1 yazar ajan, paralel):** her ajana `production.md`'deki kendi bölümünü, dosya
   adını, `publish_at` değerini ver; CLAUDE.md + `brand/kit/BRAND.md` + `docs/ANIMATION_GUIDE.md` okusun ve
   `tarih-bolumu` becerisini yüklesin. Görevi: bilgileri doğrulamak (adım 4), senaryo JSON'unu yazmak, `lint` hatasız + `preview` çalıştırıp `sheet.png`/`cover.jpg`'ye bakmak.
   Uygun sahne tipi yoksa yeni tipi **kendi dosyasına** yazar (`scenes/studio/shots/<tip>.js`);
   ortak dosyalara (`engine.js`, `core.js`, `parchment-theme.js`, `_ink.js`, `kasif.js`, `parchment2d.js`)
   paralel ajanlar dokunmaz; gerekiyorsa yönetmene bildirir. Uzun videoda: önce tek bir yazar tüm anlatımı
   yazar (hikâye bütünlüğü), sonra her bölüm (`chapter`) için ayrı bir ajan o bölümün sahnelerini
   kurar ve önizler.
3. **Eleştiri (video başına 1 eleştirmen ajan, yazardan farklı, paralel):** `docs/REVIEW.md`'ye göre
   puanlar, en büyük 3 sorunu yazar. Kendisi düzeltmez.
4. **Düzeltme turu:** yazar ajan (SendMessage ile aynı ajana devam et) sorunları düzeltir → lint →
   preview → eleştirmen tekrar puanlar. En az 2, en fazla 3 tur; hedef tüm kriterler ≥ 7. Her tur
   `production.md` → "Eleştiri günlüğü"ne eklenir.
5. **Son kapı (yönetmen):** dört Shorts'un konu/dönem/konu havuzu olarak birbirinden ve geçmişten farklı
   olduğunu, `lint` hatasız geçtiğini, her `cover.jpg` ve `sheet.png`'yi **kendi gözüyle** gördüğünü
   doğrular; sonra adım 10–11.

Zaman: tüm akış ~1,5 saati geçmesin (uzun video 8–10 dk); turlar uzarsa 3. turu atla ve raporda belirt. Ağır işler
(`preview.py`, Chromium) aynı anda en fazla 3 tane çalışsın.

**Canlı Telegram durumu (her video ayrı bir mesajda, yerinde güncellenir).** Bulut oturumunda
Telegram token'ı yok; yönetmen her aşamada GitHub MCP `actions_run_trigger` ile
`telegram-status.yml` workflow'unu tetikler (`ref: claude/shorts-pipeline`, inputs: `key` = günün
tarihi, `stage`, `state` = `run|done|fail|info`, `text`, `video` = dosya adı slug'ı ör. `01-emu-savasi`,
ilk kez anılan videoda `title` + `kind` = `short|long`; aynı anda birden çok satır için `batch` =
JSON listesi `[{"stage","state","text","video","title","kind"}]`). Tetikleme başarısızsa yok say,
üretimi asla bekletme. Ne zaman (metin bilgi dolu olsun: sayı, puan, saat):
- Başta: `plan` `run` → plan.py'den sonra `plan` `done` ("4 Shorts + 1 uzun · bütçe %41").
- Konular seçilince (tek `batch`): her video için `topic` `info` ("Emu Savaşı · tarih") + `title` + `kind`, `publish` `info` ("20 Ekim 12:00").
- Yazar ajanlar başlarken `script` `run`; bitince `script` `done` + `chars` `info` ("486 karakter").
- Her eleştiri turunda `review` `run` ("1. tur: kanca 6 · tempo 8 · … en düşük 6"); geçince `review` `done` ("2. tur: hepsi ≥ 7").
- Commit'ten hemen önce `push` `run` (genel bölüm, `video` boş). Bir aşama hata verirse `fail` + kısa neden.
Push'tan sonra `Daily batch` workflow'undaki `monitor` job'u aynı mesajı devralır (seslendirme,
render yüzdesi + kalan süre, birleştirme, YouTube linki, Telegram); yönetmen bir şey yapmaz.
Aynı tarihli mesaj kayıtları GitHub commit status'ü olarak tutulur (commit atılmaz; ayrıntı `tools/telegram.py`, `tools/live.py`).

1. **Plan:** `python tools/plan.py` çalıştır. Sadece `todo` listesindeki videoları üret (`done` dolu olanlar önceden hazırlanmış, dokunma); `todo` boşsa hiçbir şey yapma, dur. Dosya adları ve `publish_at` değerleri bu çıktıdan gelir. `elevenlabs_chars.warning: true` ise karakterleri hedef aralığın alt ucunda tut ve raporda belirt.
2. **Geçmiş:** `videos/*/` altındaki tüm senaryoların (iki kanalın da: `ag-` önekli dosyalar Anlatayım Gel'in) `youtube.title` ve konularını oku; aynı ya da çok benzer konuyu tekrar seçme. Dünün `*.youtube.json` dosyalarını kontrol et; yüklenmemiş video varsa raporla.
3. **Konu:** Kanalın nişi **tarih hikâyeleridir** (BRAND §1): gerçek bir olay, gerçek insanlar, bir gerilim ve "peki neden oldu?" sorusunun cevabı. Konu havuzunu dönüşümlü kullan (felaketler ve kazalar · kayıp şehirler ve gizemler · büyük kararlar ve savaşların dönüm noktaları · keşifler ve icatların hikâyesi · imparatorlukların yükseliş/çöküşü · **Türkiye ve Osmanlı tarihinden anlar**, haftada en az 2 video). Bilim ancak bir tarih olayını açıklamak için girer. Konu `tarih-bolumu` becerisindeki 4 testi geçmeli (tek an, bir insan, bir "neden", doğrulanabilir). Uzun video: birden fazla perdesi olan, hikâyesi güçlü daha derin bir olay.
4. **Doğruluk:** Sadece emin olduğun, iyi bilinen bilgileri kullan. Web araması varsa tarih ve sayıları doğrula. Emin olmadığın sayıyı yazma; "yaklaşık" de ya da çıkar. Yaygın ama yanlış efsaneleri anlatma.
5. **Senaryo** — dosyalar: `01-<slug>.json` … `04-<slug>.json` (Shorts, dördü de farklı konu havuzlarından ve dönemlerden; en az biri Türkiye/Osmanlı tarihinden) ve `05-<slug>.json` (uzun video, Shorts'lardan farklı bir olay); numaralar `plan.py`'nin `todo` listesinden.
   - **Motor ve tarz:** her dosyada `"engine": "studio"` ve `"theme": "parchment"` (lint ikisini de denetler). Renk paleti seçilmez: tek sabit palet BRAND §3 (`"art"`/`"palette"` yazma).
   - **Storyboard (zorunlu):** her sahneye `"visual": "ekranda tam olarak ne görünüyor"` cümlesini yaz. Seçtiğin sahne tipi bu cümleyi **birebir** göstermeli; anlatılan şeyle ilgisiz ya da "yaklaşık" bir görsel kullanma. Uygun tip yoksa konuya özel yeni bir parşömen sahne tipi kodla (bkz. 6).
   - Shorts: `"format": "short"`, `"fps": 30`, 8–11 sahne; sahne sınırı anlatımın doğal duraklarına göre konur (bir sahne bir cümle ya da uzun bir cümlenin parçası olabilir). Uzun: `"format": "long"`, `"fps": 30`, 60–80 sahne, her 8–12 sahnede bir `"chapter": "Bölüm adı"` (ilk sahnede mutlaka; YouTube bölümleri otomatik oluşur).
   - Ortak alanlar (referans senaryolardaki gibi): `"channel": "Düşün Bakalım"`, `"subtitles": true`, `"tts": {"provider": "elevenlabs", "voice_id": "j4vJUfke1j8j9OYq8V3b", "model": "eleven_v3"}`; `tts.settings`, `pacing`, `max_pause`, sahne `tone` yok (BRAND §6.2).
     Ses (kanal sahibinin seçimi, asla değiştirme): **tüm videolarda (Shorts ve uzun)** ElevenLabs `voice_id: j4vJUfke1j8j9OYq8V3b`. Model `eleven_v3`. `tools/lint.py` bunu denetler.
   - **Karakter bütçesine uy** (tablo). `tools/preview.py` çıktısındaki `chars` değerini kontrol et; sınırı aşıyorsa metni kısalt.
   - Anlatım: hikâye yapısı `tarih-bolumu` §2 (Shorts: anın içine düş → gerilim → şaşırtıcı ayrıntı/asıl neden → net kapanış; uzun video: BÖLÜM 1 sıradan dünya → kıvılcım/karar → felaket/dönüm noktası → "peki neden?" → sonrası ve bugün → tek yorum sorusu). Kurallar BRAND §6 (YouTuber anlatıcı, geçmiş zaman, en fazla üçte biri "-yor", devrik cümle yok, her 20–30 sn'de gerilim kancası). Sade, konuşma dili; ama bir anlatıcı gibi: cümleler birbirine bağlanır, ekrandakini tarif etmez (BRAND.md §6.10). "km/sa" gibi kısaltmaları açık yaz.
   - Her sahne 1–3 cümle. `title` sol üstte küçük bir "kicker" etiketi olarak görünür: `title.white` 1–2 kelime, `title.gray` en fazla ~3 kelime; `title`/`chapter` sahnesinde boş bırak (`{}`). `tags` gösterilmez.
   - `cues`: sahnenin metninde geçen bir kelimenin parçası (büyük/küçük harf duyarsız, ilk eşleşme). Animasyonun vurgusunu o kelimeye bağla; erken bir kelimeyle yanlışlıkla eşleşmediğinden emin ol.
6. **Görseller (parşömen + Kaşif):** her şey `brand/kit/BRAND.md` §2–5 ve `docs/ANIMATION_GUIDE.md`'ye göre: parşömen zemin, kaynayan mürekkep çizgi, tek sabit palet, Fraunces/Lora/Patrick Hand. Sahne tipleri (parametreler her dosyanın başındaki yorumda):
   - `stage` — Kaşif + dönem karakterleri (şapkasız, tek aksesuar: `laurel`, `turban`, `beret`, `helmet`…) + mürekkep nesneler, yürüyüş/poz dizileri, uzak plan, kamera itmesi (`shots/kasif.js`).
   - `map` — eski harita, kıyı `preset`'leri ya da özel kara, şehirler, kesikli rota, pusula gülü, el yazısı not.
   - `timeline` — tarihler ve sıra (Shorts'ta dikey, uzunda yatay), isteğe bağlı Kaşif.
   - `board` — karşılaştırma, kanıtlar, ✓/✗ listesi, çubuklar, hap rozet.
   - `title` — tek güçlü cümle ya da sayı, kelime kelime, vurgulu kelime kırmızı kutuda, el yazısı not.
   - `chapter` — uzun videoda "BÖLÜM 2 / 5" kartı (her `"chapter"` alanlı bölümü açar).
   - `photo` — gerçek fotoğraf/klip, **her zaman sepya**, kâğıda basılmış gibi: `{"src": "media/x.jpg"}` ya da `{"video": "media/x.mp4", "from": 2.0, "rate": 0.6}`, `"kb"` (Ken Burns), `"credit"`, `"marks"` (daire/ok/kutu + el yazısı). Stok fotoğraf görünümü yasak (BRAND §3); sadece gerçek tarihî belge/yer/eser için ve telifsiz kaynaktan (`python tools/media.py search "<İngilizce sorgu>" --dir videos/<tarih>/media` → `candidates.jpg`'ye bak → `get <no> --dir ... --name <ad>` → `params.src` + `params.credit`; ajan başına ayrı `--name`).
   - **Konuya özel parşömen tipleri:** `emu`, `petri`, `labbench`, `halic`, `portage`, `pirimap` ve yenileri. Uygun tip yoksa yenisini **kendi dosyasına** kodla (`scenes/studio/shots/<tip>.js`, şablon ANIMATION_GUIDE'da); 2D mürekkep, Kaşif'i `KASIF.create()` ile ekleyebilir.
   - **Kaşif kuralı (zorunlu, lint denetler):** sahnelerin **en az yarısında** Kaşif ekranda ve bir eylem yapıyor (`stage` sahneleri ya da `params.cast`/`params.kasif` içinde). Kaşif anlatıcıdır; olayın kahramanları dönem figürleridir. Eski maskot (`"mascot"`) kaldırıldı, lint hata verir.
   - **Görseller kodla üretilir (kanal sahibinin kuralı).** **Higgsfield klipleri istisnadır (sadece uzun video, en fazla 2–3 klip):** kodla çizilemeyecek geniş mekân/atmosfer anları için; gerçekçi video değil, **parşömen üzerine mürekkep çizim** klibi, insan yüzü ve yazı yok. Prompt İngilizce ve BRAND §8 kalıbıyla başlar. Higgsfield araçları bu oturumda yoksa ya da `balance` 60 kredinin altındaysa klipsiz devam et ve raporda belirt. **Model seçimi (kanal sahibinin kuralı: önce ücretsiz, sonra en ucuz):**
     1. `seedance_2_0_mini`, `resolution: "720p"`, `duration: 5`, `generate_audio: false`, `aspect_ratio: "16:9"` ve **`use_unlim: true`** (ücretsiz/sınırsız hak). Kabul edilirse kredi harcanmaz.
     2. Reddedilirse ya da hata verirse aynı istek `use_unlim` olmadan (≈ **5 kredi**/klip; `get_cost` ile doğrula).
     3. O da hata verirse `seedance1_5` (`720p`, `duration: 4`, `generate_audio: false`, ≈ 4,8 kredi), en son `kling3_0` (`mode: "std"`, `sound: "off"`, ≈ 7,5 kredi).
     Ücretli Pro modeller (`kling3_0` pro 8,75, `seedance_2_5` 80 kredi) kullanılmaz. Video başına en fazla ~15 kredi. Pro plan aynı anda **2 iş** kabul eder: ikişer gönder, `jobs_wait` ile bekle. Kullanım: `photo` tipi, `{"video": "media/hf-<ad>.mp4", "url": "<result_url>", "ai": true, "grade": "sepia", "credit": "Yapay zekâ ile üretilmiş temsili görüntü: Higgsfield (<model adı>)", "rate": 0.6–1.0}`. Sayı, ölçek ve mekanizma anlatan sahneler kodla çizilir. `"ai": true` olan videolar YouTube'a "sentetik içerik" beyanıyla yüklenir (`upload.py`). Shorts'ta kullanma. Sonunda klipleri `show_generation_by_ids` ile kanal sahibine göster (bu ortamda klipler görülemiyor, önizlemede yer tutucu çıkar).
   - **Geçişler:** otomatik kâğıt kayması (`slide`) ve yumuşak geçiş (`fade`). Elle: sahneye `"transition": "slide|fade|cut"`.
   - **Çeşitlilik kuralı (zorunlu):** bir Shorts'ta en az **4 farklı sahne tipi**; aynı tip **üst üste en fazla 2 sahne** (`stage` hariç: Kaşif'in yolculuğu 3 sahne sürebilir); tek bir tip toplamın %60'ını geçmesin.
   - **Kalite (zorunlu):** her sahnede sürekli hareket (yürüyüş, poz, kamera itmesi, rota çizimi, sayaç; kaynayan çizgi tek başına yetmez), girişlerde `spring()`, vurgu anlarında `punch(lt, cue)` ya da Kaşif'in poz değişimi. Cue'ları gerçekten dramatik kelimelere bağla; altyazıda cue kelimeleri `gold` (sahnede `params.caption_color: "red"` ile kırmızı) yanar. Ekranda en fazla 5 kelime/sahne, en küçük yazı 44 px. Önemli ayrıntıyı altyazı şeridine (dikey ekranda y ≈ 1170–1320) ve en alttaki YouTube arayüzüne (y > 1500) koyma; sol üst marka + kicker'a ayrılmıştır.
7. **Kapak (thumbnail)** — her dosyada `cover` bloğu zorunlu. Kapak tıklanma oranını belirler; en çok özen gösterilecek kısım budur.
   ```json
   "cover": {"lines": ["Avustralya", "kuşlara", "savaş açtı"], "highlight": ["kuşlara"],
             "scene": 0, "t": 2.4, "kasif": "shock"}
   ```
   - **BRAND §9:** parşömen zemin, solda/üstte Fraunces 900 dev yazı, tek kelime `red` kutuda, yanında **büyük Kaşif** güçlü bir pozda (şok, işaret; yüzü okunur büyüklükte) ve olayın tek simgesi (volkan, gemi, taç, harita).
   - `lines`: 2–4 satır, toplam **3–5 kelime**, büyük harfle basılır. Başlığı tekrar etme; merakı patlatan kısa bir iddia ya da şok cümlesi olsun ("AVUSTRALYA KUŞLARA SAVAŞ AÇTI", "1513'TE AMERİKA'YI ÇİZDİ"). Soru cümlesi yerine iddia çoğu zaman daha güçlüdür.
   - `highlight`: kırmızı kutuda vurgulanacak **tek** anahtar kelime (en kritik nesne/sayı/isim).
   - `scene` + `t`: sahnenin en dramatik, en dolu anı (rota çizilmiş, gemiler tepede, emular koşuyor). Boş ya da yarım çizilmiş kare seçme.
   - `kasif`: kapağa motorun eklediği büyük Kaşif: `"shock"` ya da `{"pose": "point", "emotion": "surprised", "dir": 30, "face": -1, "scale": 1.15, "x": 1720, "y": 1070}`; seçilen sahnede Kaşif zaten büyük ve öndeyse `false`.
   - Uzun video kapağı 1280×720: solda dev yazı, sağda büyütülmüş sahne + Kaşif. Shorts kapağı 1080×1920: üstte dev yazı, altında sahne (aynı kare Shorts'un ilk saniyelerinde kanca olarak oynar).
   - `tools/preview.py` kapağı `out/preview/<slug>/cover.jpg` olarak üretir; **mutlaka açıp bak**: yazı küçük ekranda okunuyor mu, yazı görsele ya da Kaşif'e biniyor mu, Kaşif'in yüzü okunuyor mu, görsel dolu ve dramatik mi. Gerekirse `scene`, `t`, `kasif` ve metni değiştirip tekrar üret.
   - **Kapak çok daha ilgi çekici olmalı (kanal sahibi, 2026-10-21):** her video için en az **3 kapak adayı** üret (farklı `scene`/`t`, Kaşif pozu/duygusu, kapak metni), `cover.jpg`'leri yan yana karşılaştır ve en güçlüsünü seç. Aranan: tek bakışta okunan tek bir dramatik an (felaketin tam anı, dev bir nesne, şaşkın yüzler), büyük ve net Kaşif yüzü güçlü bir duyguyla (şok, korku, hayret), boş kâğıt alanı az, yazı ile görsel arasında güçlü kontrast, telefonda küçükken bile anlaşılır. Sıkıcı bir harita/pano karesi, uzak plan ya da yarım çizilmiş sahne kapak olmaz; gerekirse kapak için o sahnede nesneyi büyüt. Eleştirmen kapağı (REVIEW.md "kapak" kriteri) ayrıca puanlar; **8'in altındaysa kapak yenilenir**.
8. **YouTube SEO** — her dosyaya `youtube` bloğu:
   ```json
   "youtube": {
     "title": "Emu Savaşı: Avustralya Kuşlara Neden Savaş Açtı?",
     "description": "...",
     "tags": ["..."],
     "category_id": "27",
     "publish_at": "2026-10-16T13:00:00+03:00"
   }
   ```
   - **Başlık:** ana anahtar kelime başta (insanların gerçekten arayacağı ifade: "emu savaşı", "piri reis haritası"), merak boşluğu bırakan soru ya da iddia. Shorts ≤ 60, uzun ≤ 70 karakter. Türkçe karakterler doğru, BÜYÜK HARF spam yok, en fazla 1 emoji, yanıltıcı clickbait yok (videonun cevabı başlığın vaadini karşılamalı).
   - **Açıklama:** ilk 150 karakter (aramada görünen kısım) ana anahtar kelimeyi ve kancayı içersin. Sonra 2–4 cümlelik özet; 2–3 yan anahtar kelimeyi doğal geçir. Uzun videoda bir boş satırdan sonra "Bu videoda:" ile 3–5 madde. Sonra abone çağrısı + yoruma çağıran soru ("Her gün yeni bir 'neden?' için abone ol. Sence ...? Yorumlara yaz!"). En sonda 3–5 hashtag (ilk üçü başlığın üstünde görünür): Shorts'ta ilk hashtag `#shorts`, sonra konu hashtag'leri ve `#düşünbakalım`. Bölümler (chapters) uzun videoda otomatik eklenir; elle yazma.
   - **Etiketler:** 12–18 etiket, toplam ≤ 450 karakter: ana anahtar kelime, 3–5 varyasyonu (eş anlamlı, soru biçimi), konu/kişi/olay adları, genel kategori ("tarih", "tarih hikayeleri", "ilginç bilgiler"), `düşün bakalım`.
   - `category_id`: "27" (Eğitim). `publish_at`: `tools/plan.py` çıktısındaki değer (geçmiş saatleri zaten ertesi güne kaydırır).
9. **Kontrol:** `pip install -r requirements.txt` (gerekirse), sonra `python tools/lint.py videos/<tarih>/*.json` (hata kalmayana kadar) ve her dosya için `python tools/preview.py videos/<tarih>/<dosya>.json`. `STATIC?` işaretli sahneyi hareketlendir. `sheet.png` ve `cover.jpg` dosyalarını oku ve kontrol et: taşan/üst üste binen yazı, ekran dışına taşan nesne/etiket, boş kare, palet dışı renk, Kaşif'in olmadığı ya da sadece durduğu sahneler, altyazının arkasında kalan önemli detay, eşleşmeyen cue uyarısı, karakter bütçesi. Sorunları düzelt ve tekrar kontrol et. Ardından eleştiri döngüsü (`docs/REVIEW.md`, aşağıdaki *Üretim akışı*).
10. **Gönder:** Push'tan hemen önce `tools/lint.py` son kez hatasız geçmeli. Dosyaları (`media/` klasörü, `production.md` ve varsa `scenes/studio/` değişikliği dahil) tek commit'te `Daily batch YYYY-MM-DD` mesajıyla commit et ve doğrudan `claude/shorts-pipeline` dalına push et (varsayılan dal; yeni dal açma, PR açma). Push, `Daily batch` workflow'unu tetikler (render + kapak + YouTube'a zamanlanmış yükleme).
11. **Rapor:** Konuyu, başlığı, kapak metnini, karakter sayısını, yayın saatini ve son tur eleştiri puanlarını kısaca özetle; bir sonraki uzun video tarihini yaz.

## İkinci kanal: Anlatayım Gel

Kanal sahibinin ikinci kanalı (2026-10-21). Ayrı bir zamanlanmış görev her sabah bu bölümü uygular.
Tarz, ses, kalite kuralları, ajan akışı, kapak ve SEO kuralları **Düşün Bakalım ile birebir aynıdır**
(yukarıdaki *Günlük üretim görevi*, BRAND.md); sadece şunlar farklıdır:

- **Plan:** `python tools/plan.py --channel ag`. Kanalın ilk ayı için yavaş başlangıç: her gün **2 Shorts**
  (13:00, 17:30) + **Salı, Perşembe, Cumartesi** bir uzun video (19:30; Cumartesi 14:00). Saatler Düşün
  Bakalım'ınkinden en az 30 dk ayrı. Sadece `todo` listesindekileri üret; dosya adları `ag-NN-<slug>.json`.
- **Niş:** sadece **Osmanlı ve Türk tarihi** (Selçuklu, Osmanlı, Kurtuluş Savaşı, Cumhuriyet'in ilk yılları,
  Türk denizcileri, bilginleri, padişahları, büyük kuşatma ve savaşlar). Konu **iki kanalın geçmişinde**
  (tüm `videos/*/*.json`) işlenmiş olmamalı; Düşün Bakalım'ın aynı gün işlediği konuyla da çakışmamalı.
- **Senaryo alanları:** `"channel": "Anlatayım Gel"` (ekranda sol üstte bu ad yazar), `"narrator": "fes"`.
  Anlatıcı Kaşif'in aynı çöp adam çizimi ama kâşif şapkası yerine **kırmızı fes** takar (`KASIF.setNarrator`);
  Kaşif için yazılan tüm kurallar (sahnelerin en az yarısında ekranda ve bir şey yapıyor) bu anlatıcı için de geçerli.
  `lint` kanal adını, dosya önekini ve anlatıcıyı denetler.
- **SEO:** etiketlerde `anlatayım gel`, hashtag `#anlatayımgel`, abone çağrısı "Anlatayım Gel'e abone ol".
  "Düşün Bakalım" adı bu kanalın hiçbir metninde geçmez.
- **Telegram:** sadece video satırları (`video` = `ag-NN-<slug>`); `plan`/`push` gibi genel satırları
  gönderme (genel kutu Düşün Bakalım'ındır). Kutularda başlığın önünde kanal adı yazar.
- **Commit:** `Daily batch YYYY-MM-DD (Anlatayım Gel)`; aynı dala push. Yükleme `YOUTUBE_TOKEN_JSON_AG`
  secret'ıyla yapılır; secret yoksa render yapılır ama yükleme atlanır (video Actions artifact'inde kalır).

## Elle başlatılan ek video

Kanal sahibi zamanlamanın dışında da tek bir video başlatabilir: Telegram'da `/uzun [konu]` ya da
`/shorts [konu]` (Cloudflare Worker, günlük görevi API ile "EK VİDEO: uzun|shorts · Konu: …" payload'ıyla
başlatır) ya da sohbette "bir uzun video üret ve yayınla".
Bu, plan dışı ama **istenmiş** bir videodur; "fazladan video üretme" kuralı buna uygulanmaz.

- `python tools/plan.py --extra short|long` dosya numarasını ve en erken `publish_at`'i verir (şimdi + 1 saat;
  render daha geç biterse `upload.py` hemen yayınlar). Elle saat hesaplama.
- Senaryonun en üstüne `"extra": true` yaz: plan.py bu dosyayı günlük planın Shorts/uzun sayısına katmaz,
  sabahki görev yine kendi videolarını üretir.
- Konu verilmemişse geçmişte işlenmemiş bir tarih konusu seç (adım 2–3). Akış günlük görevle aynı:
  `production.md` (ek bölüm), yazar ajan (uzunda önce anlatım, sonra bölüm ajanları), eleştirmen (en az 1 tur;
  zaman yetiyorsa 2), lint, preview, cover/sheet'e kendi gözünle bak, Telegram canlı durum, commit
  `Extra video YYYY-MM-DD: <başlık>`, push.

## Komutlar

```bash
python build.py videos/<tarih>/<dosya>.json                 # tam render (ELEVENLABS_API_KEY gerekli)
python build.py videos/<tarih>/<dosya>.json --scenes 3      # ilk 3 sahne
python build.py videos/<tarih>/<dosya>.json --still 12.5    # tek kare
python build.py videos/<tarih>/<dosya>.json --no-tts -o out/draft.mp4   # sessiz taslak video (tahmini zamanlama)
# parçalı render (Actions bunu kullanır; üç adımda da aynı -o):
python build.py <dosya>.json -o out/x.mp4 --prepare   # TTS + zaman çizelgesi + medya -> out/x.prepared.json
python build.py <dosya>.json -o out/x.mp4 --shard 2/5 # 5 parçanın 2.'si -> out/x.parts/
python build.py <dosya>.json -o out/x.mp4 --finish    # birleştir + ses + kapak -> out/x.mp4
python tools/plan.py                                  # bugünün planı (dosyalar, saatler, bütçe)
python tools/lint.py videos/<tarih>/*.json             # kural denetimi
python tools/preview.py videos/<tarih>/<dosya>.json   # TTS'siz görsel kontrol
python tools/preview.py <dosya>.json --times 3,12.5    # belirli anlar
python tools/media.py search "Piri Reis map" --dir videos/<tarih>/media   # telifsiz görsel ara
python tools/brand_sheet.py                          # Kaşif referans çizimleri (brand/kit/)
```

Playwright Chromium'u bulamazsa `CHROMIUM_PATH=/opt/pw-browsers/chromium` ver. **Performans kuralı:** pahalı desenleri (kâğıt dokusu gibi) açılışta bir kez pişir, karede sadece kopyala; tarayıcıda `mix-blend-mode`, büyük `filter: blur`, tam ekran yarı saydam katman ve SVG grup `opacity`'sinden kaçın (yazılım raster'ında şerit artefaktı). Motor 1080p/30 fps çizer, ffmpeg 1440p'ye büyütür; render tüm CPU çekirdeklerine bölünür (`RENDER_WORKERS`). Actions'ta bir video ayrıca ~40 sn'lik parçalara bölünüp (en çok 16) ayrı işlerde render edilir. Video kareleri Chromium'un yazılım compositor'ıyla çizilir ve CDP ile yakalanır (kapak eski yolla); eski yola dönmek için `RENDER_COMPOSITOR=gpu`, `RENDER_CAPTURE=screenshot`.
