# Düşün Bakalım + Stickstory — video otomasyonu

İki YouTube kanalı için parşömen tarzı anlatım videoları üreten pipeline. Senaryolar bu bulut oturumunda yazılır,
push'tan sonra GitHub Actions render edip YouTube'a zamanlanmış olarak yükler.

| Kanal | Dil | Shorts | Uzun video (5–6 dk) | Saat dilimi |
|---|---|---|---|---|
| **Düşün Bakalım** (Türkçe, tarih) | tr | günde **1** — 19:00 | **her gün 1** — 20:30 | İstanbul |
| **Stickstory** (global, İngilizce) | en | günde **3** — 09:00, 13:00, 19:00 | **her gün 1** — 14:00 | **New York** |

**İki kanal asla karışmaz:** Türkçe videolar sadece Düşün Bakalım'a, İngilizce videolar sadece Stickstory'ye gider.
Kanal dosya önekinden gelir (`ag-` = Stickstory); `upload.py` token'ın bağlı olduğu YouTube kanalını kontrol eder,
yanlış kanalsa yüklemez. **Üretim saatleri ayrı:** Düşün Bakalım sabah 05:50'de, Stickstory 11:50'de (İstanbul)
üretilir; bir oturum sadece kendi kanalının videolarını yazar.

Takvim, saatler, ses, hashtag, kategori havuzu, dosya öneki ve YouTube secret'ı tek yerde: `tools/channels.py`.
Stickstory saatleri New York saatidir (en büyük İngilizce kitle ABD; aynı saatler İngiltere/Avrupa öğleden sonra
ve akşamına denk gelir; yaz/kış saati otomatik). İstanbul'da gece olması sorun değil, YouTube zamanlanmış videoyu
kendisi yayınlar. **Tarih/saat hesabını elle yapma: `python tools/plan.py [--channel ag]` kullan.**

**Tek tarz (kanal sahibinin kesin kararı):** sepya parşömen üstüne elle çizilmiş mürekkep ve çöp adam anlatıcı
**Kaşif** (`"theme": "parchment"`; Stickstory'de aynı çizim kırmızı fesli). Anayasa `brand/kit/BRAND.md`
(çelişkide BRAND.md kazanır); senaryo yazmadan önce `.claude/skills/tarih-bolumu/SKILL.md` yüklenir.
Eski "Studio" tarzı (paletler, 3D, maskot ampul, headline/bars/compare…) kaldırıldı; geri getirme.
`videos/` altındaki eski tarz senaryolar sadece geçmiş kayıttır (konu tekrarını önlemek için okunur).

## Yapı

- `build.py` — `<senaryo>.json -> mp4`. ElevenLabs (kelime zamanlamalı, nefes sesleri kısılır: `debreath`),
  sahneleri Playwright ile kare kare çeker (CPU sayısı kadar paralel tarayıcı), ffmpeg ile birleştirir. Sadece `"engine": "studio"`.
- `scenes/studio/` — tek motor: `engine.js` (zaman çizelgesi, geçişler, kapak), `core.js` (yardımcılar, `SHOTS`,
  `THEME_PARCHMENT`), `parchment-theme.js` (kâğıt, altyazı şeridi, kicker, marka). Zaman sadece `window.seek(t)`;
  her şey deterministik (`Math.random` yok, `rng(seed)`).
- `scenes/studio/shots/<tip>.js` — her sahne tipi kendi dosyasında (otomatik yüklenir): `_ink.js`, `kasif.js`
  (Kaşif + `stage`), `parchment2d.js` (`chapter`, `title`, `board`, `map`, `timeline`), `photo.js` ve konuya özel tipler.
- Referans kalite: `videos/2026-10-20/01-emu-savasi.json` (Short), `videos/2026-10-19/05-piri-reis-haritasi.json` (uzun).
- `docs/ANIMATION_GUIDE.md` (görsel dil, sahne tipleri, yeni tip şablonu) ve `docs/REVIEW.md` (11 kriterli eleştiri).
  **Senaryo yazan ya da sahne kodlayan her ajan önce BRAND.md'yi ve ANIMATION_GUIDE'ı okur.**
- `tools/plan.py` planı · `tools/lint.py` kural + SEO denetimi · `tools/preview.py` TTS'siz kontak sayfası + kapak +
  hareket ölçümü (`STATIC?`) · `tools/media.py` telifsiz fotoğraf (Wikimedia, Pexels) · `tools/news.py` Stickstory konusu için 7 ülkenin manşetleri · `tools/sfx.py` hafif ambiyans müziği.
- `tools/upload.py` YouTube yüklemesi (kanal dosya önekinden; krediler ve bölümler açıklamaya eklenir).
- `tools/check.py` **API kontrolü**: ElevenLabs anahtarı/kalan kredi/sesler, iki kanalın YouTube girişi (token tazelenir,
  doğru kanala mı bağlı), Telegram botu. `.github/workflows/api-check.yml` her sabah 03:15'te ve her `Daily batch`
  başında çalışır; süresi dolmuş YouTube girişinde `YouTube login (phone)` workflow'unu o kanal için kendisi başlatır
  (kod Telegram'a gelir, gelen JSON kanalın secret'ına yapıştırılır: `YOUTUBE_TOKEN_JSON` / `YOUTUBE_TOKEN_JSON_AG`).
- `tools/telegram.py` + `tools/live.py` — **kanal başına günde tek** Telegram mesajı (her video bir blok, yerinde
  güncellenir), Shorts'un Instagram'a hazır dosyası. API kontrolü Telegram'a sadece sorun varsa yazar. `cloudflare/telegram-worker.js` — Telegram `/uzun`, `/shorts` komutları (`cloudflare/KURULUM.md`).

Ses: anlatım + çok hafif ambiyans (`"sfx": false` kapatır). **Efekt sesi (whoosh, pop) ve nefes sesi yok** —
kanal sahibi istemiyor. **Görseller sadece kodla üretilir:** Higgsfield ya da başka bir yapay zekâ görsel/video
aracı hiç kullanılmaz (lint engeller); çizilemeyen an için yeni parşömen sahne tipi ya da telifsiz gerçek fotoğraf.
Bu bulut ortamından ElevenLabs ve YouTube'a erişim yok; ses ve yükleme sadece Actions'ta. Yerel kontrol: `preview.py`.

## Günlük üretim görevi

Zamanlanmış görev her sabah bu bölümü uygular (Düşün Bakalım; Stickstory farkları aşağıda).

| | Süre | Anlatım karakteri | Sahne |
|---|---|---|---|
| Shorts | 28–35 sn | **400–500** (sert sınır 550) | 8–11 |
| Uzun video | **5–6 dk** | **4.300–5.000** (sert sınır 5.400) | **40–50**, her 8–12 sahnede bir `"chapter"` (ilk sahnede mutlaka) |

### Akış (ana oturum = yönetmen; alt ajanlar commit/push yapmaz; bağımsız işler aynı mesajda paralel)

0. **API kontrolü:** GitHub MCP `actions_run_trigger` ile `api-check.yml`'i başlat (`ref: claude/shorts-pipeline`),
   sonucu bekleme. Sorun varsa Telegram'a kendisi yazar; YouTube girişi bozuksa render yine yapılır, video Actions'ta 14 gün saklanır.
1. **Plan:** `python tools/plan.py`. Sadece `todo` listesindekileri üret (`done` olanlara dokunma); `todo` boşsa dur.
   Dosya adları, `publish_at` ve önerilen `category` buradan gelir. `elevenlabs_chars.warning: true` ise karakteri
   aralığın alt ucunda tut ve raporda belirt. Plan dışına çıkma, fazladan video üretme.
2. **Geçmiş:** `videos/*/` altındaki tüm senaryoların (iki kanal; `ag-` Stickstory'dir) `youtube.title` ve konularını
   oku, aynı ya da çok benzer konuyu seçme. Dünün senaryolarının `*.youtube.json`'u yoksa (yüklenmemiş) raporla.
3. **Konu:** niş **tarih hikâyeleri** (BRAND §1): gerçek olay, gerçek insanlar, gerilim, "peki neden oldu?".
   Havuzu dönüşümlü kullan (felaketler ve kazalar · kayıp şehirler ve gizemler · büyük kararlar ve savaşlar ·
   keşifler ve icatlar · imparatorlukların yükselişi/çöküşü · **Türkiye ve Osmanlı tarihi, haftada en az 2 video**).
   Konu `tarih-bolumu` becerisinin 4 testini geçmeli. Uzun video: birden fazla perdesi olan daha derin bir olay;
   aynı günün Short'undan farklı.
4. **`videos/<tarih>/production.md`:** her video için konu, havuz, "izleyici sonunda ne hisseder", kanca + kapak
   fikri, önce **tek parça akıcı anlatım metni**, sonra çekim listesi (her sahne: cümle, `visual`, tip, Kaşif ne yapıyor,
   cue, kamera notu). **Önce senaryo, sonra görüntü** (kanal sahibinin kuralı, BRAND §6.10): metin sahne düşünmeden
   yazılır, sesli okunur gibi kontrol edilir, sonra sahnelere bölünür. Sahne başına cümle yazıp görsel tarif etmek yasak.
5. **Yazım:** video başına 1 yazar ajan (uzunda: önce tek yazar tüm anlatımı, sonra bölüm başına bir ajan sahneleri).
   Her ajana `production.md` bölümünü, dosya adını, `publish_at`'i ver; CLAUDE.md + BRAND.md + ANIMATION_GUIDE okusun,
   `tarih-bolumu` becerisini yüklesin, bilgileri doğrulasın, JSON'u yazsın, `lint` hatasız + `preview` çalıştırıp
   `sheet.png`/`cover.jpg`'ye baksın. Yeni sahne tipi gerekirse **kendi dosyasına** yazar; ortak dosyalara
   (`engine.js`, `core.js`, `parchment-theme.js`, `_ink.js`, `kasif.js`, `parchment2d.js`) paralel ajan dokunmaz.
6. **Eleştiri:** video başına yazardan farklı 1 eleştirmen ajan, `docs/REVIEW.md`'ye göre puanlar, en büyük 3 sorunu
   yazar, düzeltmez. **Düzeltme turu:** aynı yazar ajan (SendMessage) düzeltir → lint → preview → tekrar puan.
   En az 2, en fazla 3 tur; hedef tüm kriterler ≥ 7 (kapak ≥ 8). Her tur `production.md` → "Eleştiri günlüğü".
7. **Son kapı (yönetmen):** videoların konu/dönem olarak birbirinden ve geçmişten farklı olduğunu, `lint`'in hatasız
   geçtiğini, her `cover.jpg` ve `sheet.png`'yi **kendi gözüyle** gördüğünü doğrular.
8. **Gönder:** push'tan hemen önce `python tools/lint.py videos/<tarih>/*.json` son kez hatasız. Hepsini (`media/`,
   `production.md`, varsa `scenes/studio/` değişikliği) tek commit'te `Daily batch YYYY-MM-DD` mesajıyla commit et,
   `git pull --rebase origin claude/shorts-pipeline`, sonra doğrudan `claude/shorts-pipeline`'a push (yeni dal/PR yok).
9. **Rapor:** konu, başlık, kapak metni, karakter, yayın saati (İstanbul), son tur puanları, aylık ElevenLabs
   kullanımı, API kontrolünün sonucu ve bir sonraki uzun video tarihi (`next_long_video`).

Zaman: tüm akış ~1,5 saati geçmesin; turlar uzarsa 3. turu atla ve belirt. Ağır işler (`preview.py`) aynı anda en fazla 3.

### Telegram
Yönetmen (bulut oturumu) Telegram'a **hiçbir şey göndermez**. Her kanalın günlük mesajını push'tan sonra
`Daily batch` workflow'u otomatik yazar: seslendirme, render yüzdesi + kalan süre, YouTube linki, hata nedeni.
Böylece mesaj hiçbir zaman eski kalmaz.

### Senaryo kuralları (lint denetler)
- Alanlar: `"engine": "studio"`, `"theme": "parchment"`, `"format": "short|long"`, `"fps": 30`, `"subtitles": true`,
  `"channel"`, `"tts": {"provider": "elevenlabs", "voice_id": <kanalın sesi>, "model": "eleven_v3"}`.
  `tts.settings`, `pacing`, `max_pause`, sahne `tone`, `art`/`palette`, `mascot` yok. **Ses asla değişmez**
  (Düşün Bakalım `j4vJUfke1j8j9OYq8V3b`, Stickstory `ppLqTilh7rH7fbUVlXsf`).
- **Anlatıcı bir YouTuber'dır:** izleyiciye "siz" der, merakı paylaşır ve açıklar; olayı altyazı gibi sayan "yapıyor
  ediyor" anlatım yasak (en fazla üçte biri "-yor"), **devrik cümle yok**, ekrandakini tarif etmez, cümleler birbirine
  bağlanır, her 20–30 sn'de gerilim kancası, dolgu cümle yok (BRAND §6). Kısaltmaları açık yaz ("km/sa" değil).
- **Shorts:** ilk kare doluyla açılır (kapak bloğu ilk cümle bitene kadar ekranda) → **ilk cümle 3–10 kelime ve kapak
  yazısıyla aynı fikir** ("Bisküvilerdeki bu delikler süs değil." ↔ "BU DELİKLER SÜS DEĞİL"). 2–4 sn'de bir yeni görüntü.
  Yapı: anın içine düş → gerilim → şaşırtıcı ayrıntı/asıl neden → **net kapanış**: son cümle tam ve kendi başına anlamlı
  bir punchline; videonun başına bağlanan döngü yok, soru/"yorumlara yazın" sahnesi yok (soru açıklamaya yazılır).
- **Uzun:** BÖLÜM 1 sıradan dünya → kıvılcım/karar → felaket/dönüm noktası → "peki neden?" → sonrası ve bugün →
  tek yorum sorusu (`tarih-bolumu` §2). Bölümler YouTube'a otomatik eklenir.
- Her sahne 1–3 cümle (Shorts'ta en fazla 2), `"visual"` = ekranda tam olarak ne görünüyor; seçilen tip bunu **birebir**
  göstermeli, uygun tip yoksa yeni tip kodla. `title` sol üstte küçük kicker: `white` 1–2, `gray` ≤ 3 kelime;
  `title`/`chapter` sahnesinde `{}`. `cues`: sahne metnindeki dramatik bir kelimenin parçası (ilk eşleşme; erken bir
  kelimeye denk gelmesin), altyazıda altın (sahnede `params.caption_color: "red"` ile kırmızı) yanar.
- **Sahne tipleri:** `stage` (Kaşif + dönem karakterleri, tek aksesuar), `map`, `timeline`, `board`, `title`, `chapter`,
  `photo` (gerçek fotoğraf/klip, hep sepya; sadece gerçek tarihî belge/yer/eser için: `python tools/media.py search
  "<İngilizce sorgu>" --dir videos/<tarih>/media` → `candidates.jpg`'ye bak → `get <no> --dir … --name <ad>`;
  `params.credit` zorunlu, ajan başına ayrı `--name`) ve konuya özel tipler (parametreler dosya başındaki yorumda).
- **Kaşif kuralı:** sahnelerin **en az yarısında** Kaşif ekranda ve bir eylem yapıyor (`stage` ya da `params.cast`/`kasif`).
- **Çeşitlilik:** Shorts'ta en az 4 farklı tip; aynı tip üst üste en fazla 2 (`stage` 3); tek tip toplamın %60'ını geçmez.
- **Kalite:** her sahnede sürekli hareket (kaynayan çizgi tek başına yetmez), girişlerde `spring()`, vurguda
  `punch(lt, cue)` ya da Kaşif poz değişimi. Ekranda sahne başına en fazla 5 kelime, en küçük yazı 44 px. Dikey ekranda
  önemli ayrıntı altyazı şeridine (y ≈ 1170–1320) ve YouTube arayüzüne (y > 1500) konmaz; sol üst marka + kicker'ındır.
- Geçişler otomatik (`slide`, her üçüncüde `fade`); elle `"transition": "slide|fade|cut"`.

### Kapak (tıklanma oranını belirler, en çok özen burada)
```json
"cover": {"lines": ["Avustralya", "kuşlara", "savaş açtı"], "highlight": ["kuşlara"], "scene": 0, "t": 2.4, "kasif": "shock"}
```
- BRAND §9: parşömen, Fraunces 900 dev yazı, tek kelime kırmızı kutuda, yanında **büyük Kaşif** güçlü bir duyguyla
  (şok, korku, hayret; yüzü okunur) ve olayın tek simgesi. `lines` 2–4 satır, toplam **3–5 kelime**, başlığı tekrar
  etmeyen merak patlatan iddia. `highlight` tek kelime. `scene` + `t`: en dramatik, dolu an (boş/yarım çizilmiş kare,
  sıkıcı harita/pano, uzak plan olmaz; gerekirse nesneyi büyüt). `kasif`: `"shock"`, `{"pose", "emotion", "dir",
  "face", "scale", "x", "y"}` ya da sahnede zaten büyükse `false`.
- Uzun video kapağı 1280×720 (solda yazı, sağda sahne + Kaşif); Shorts 1080×1920 (üstte yazı; aynı kare kancadır).
- **Her video için en az 3 kapak adayı** üret (farklı sahne/an/poz/metin), `cover.jpg`'leri karşılaştır, en güçlüsünü
  seç; telefonda küçükken okunmalı. Eleştirmen kapağa **8'in altında** verirse kapak yenilenir.

### YouTube SEO (lint 100/100 ister; altı hatadır, push yok)
```json
"youtube": {"title": "Emu Savaşı: Avustralya Kuşlara Neden Savaş Açtı?", "description": "...", "tags": ["emu savaşı", "..."],
            "category_id": "27", "publish_at": "<plan.py'den>"}
```
- **`tags[0]` ana anahtar kelimedir** (insanların gerçekten aradığı ifade). Başlık onunla başlar, merak boşluğu
  (`?`/`!`/`:`), Shorts 30–60 / uzun 30–70 karakter, en fazla 1 emoji, BÜYÜK HARF yok, cevabı videoda olan dürüst vaat.
- Açıklama: ilk 150 karakterde ana kelime + kanca; 2–4 cümle özet (2–3 yan kelime); uzunda boş satırdan sonra
  "Bu videoda:" 3–5 madde; abone çağrısı + yorum sorusu ("Her gün yeni bir 'neden?' için abone ol. Sence …? Yorumlara
  yaz!"); son satırda 3–5 hashtag (Shorts'ta ilki `#shorts`, sonra konu, `#düşünbakalım`). Shorts ≥ 250, uzun ≥ 600 karakter.
- Etiketler: 12–18, toplam ≤ 450 karakter, tekrar/hashtag yok, ana kelimenin ≥ 3 varyasyonu, konu/kişi adları,
  "tarih", "tarih hikayeleri", `düşün bakalım`. `category_id` "27". Diğer kanalın adı/hashtag'i geçmez.

### Kontrol
`pip install -r requirements.txt`, `python tools/lint.py videos/<tarih>/*.json` (hata kalmayana kadar), her dosya için
`python tools/preview.py …` (`CHROMIUM_PATH=/opt/pw-browsers/chromium`). `STATIC?` sahneyi hareketlendir. `sheet.png` ve
`cover.jpg`'de: taşan/üst üste binen yazı, ekran dışı nesne, boş kare, palet dışı renk, Kaşif'siz ya da duran sahne,
altyazının arkasında kalan ayrıntı, eşleşmeyen cue uyarısı, karakter bütçesi. Doğruluk: sadece emin olunan bilgiler;
web varsa tarih ve sayıları doğrula, emin olmadığın sayıyı yazma, yaygın yanlış efsaneleri anlatma.

## İkinci kanal: Stickstory (global, İngilizce)

Ayrı bir zamanlanmış görev her gün 11:50'de (İstanbul) bunu uygular (aynı görev, saate göre kanal seçer). Tarz, akış, kalite, kapak ve SEO kuralları yukarıdakiyle
**birebir aynı**; İngilizce anlatım kuralları **BRAND.md §11**. Farklar:
- `python tools/plan.py --channel ag`; dosyalar `ag-NN-<slug>.json`; plan her video için farklı bir `category` önerir.
- **Konu önce manşetten (kanal sahibinin kalıcı kuralı, 2026-10-26):** her Stickstory videosunda (günlük, ek video,
  Shorts ve uzun) konu seçmeden önce `python tools/news.py` çalıştır: ABD, Avustralya, İsviçre, Norveç, Yeni Zelanda,
  Kanada ve Almanya'nın Google News manşetleri (birden çok ülkede manşette olanlar en üstte). Kanal kategorilerinden
  birine uyan bir manşet seç ve **haberin arkasındaki gerçek, doğrulanabilir hikâyeyi** anlat (ör. "Japonya Mars'ın
  uydusuna sonda fırlattı" → "Phobos Mars'a düşüyor"); haber ilk cümlelerde kanca olarak geçer, gerisi kalıcı bilgi
  (video yıllarca izlenir). Habere ait tarih/sayıyı web'de doğrula. Siyaset, seçim, suç, kurbanı olan güncel
  felaket, ölüm haberi, ünlü/magazin, spor sonucu ve ürün haberi seçilmez. Aynı gün her video ayrı manşetten;
  uyan manşet yoksa o video için kategori havuzuna dön ve raporda belirt. `production.md`'ye seçilen manşeti
  (ülke, kaynak, başlık) yaz. Plan'ın önerdiği `category` bu durumda manşetin kategorisiyle değişebilir.
- **Her şey İngilizce:** ses, ekrandaki her yazı (kicker, etiketler, el yazısı notlar, "CHAPTER 2 / 5"), altyazı, kapak,
  başlık/açıklama/etiketler. Metadata'da Türkçe karakter ve "Düşün Bakalım" geçmez.
- **Niş:** sadece tarih değil, en çok izlenen Shorts kategorilerinden parşömen + çöp adama uyanlar (`channels.py`
  `categories`; Osmanlı/Türk tarihi "empires and battles" altında global izleyiciye). Her konu yine gerçek ve
  doğrulanabilir (`tarih-bolumu` 4 testi; bilim/hayvan konularında kahraman bir canlı ya da deney olabilir). Konu iki
  kanalın geçmişinde işlenmemiş ve aynı gün Düşün Bakalım'la çakışmıyor olmalı.
- Senaryo: `"channel": "Stickstory"`, `"narrator": "fes"`, `"lang": "en"`, ses `ppLqTilh7rH7fbUVlXsf`.
- SEO: başlık aranan İngilizce ifadeyle başlar ("Mary Celeste: …"); uzunda "In this video:"; "Subscribe to Stickstory
  for …" + yorum sorusu; hashtag'ler `#shorts` (Shorts'ta ilk) + konu + `#stickstory`; etiketlerde `stickstory`.
- Commit: `Daily batch YYYY-MM-DD (Stickstory)`. Yükleme `YOUTUBE_TOKEN_JSON_AG` ile, dil `en`.

## Elle başlatılan ek video
Telegram `/uzun [konu]`, `/shorts [konu]` (payload "EK VİDEO: uzun|shorts · Konu: …") ya da sohbetten istek: plan
dışı ama **istenmiş** bir videodur. `python tools/plan.py --extra short|long [--channel ag]` numara ve en erken
`publish_at`'i verir; senaryoya `"extra": true` yaz (günlük plana sayılmaz). Konu yoksa geçmişte işlenmemiş bir konu
seç (Stickstory'de önce `tools/news.py` manşetleri, yukarıdaki kural). Akış aynı (eleştirmen en az 1 tur, zaman yetiyorsa 2); commit `Extra video YYYY-MM-DD: <başlık>`.

## Komutlar

```bash
python tools/plan.py [--channel ag] [--date YYYY-MM-DD] [--extra short|long]
python tools/lint.py videos/<tarih>/*.json
python tools/preview.py videos/<tarih>/<dosya>.json [--times 3,12.5]
python tools/media.py search "Piri Reis map" --dir videos/<tarih>/media
python tools/check.py                                      # API kontrolü (secret'lar Actions'ta)
python tools/news.py [--links]                             # Stickstory: 7 ülkenin Google News manşetleri
python build.py <dosya>.json [--scenes 3 | --still 12.5 | --cover | --no-tts -o out/draft.mp4]
python build.py <dosya>.json -o out/x.mp4 --prepare | --shard 2/5 | --finish   # Actions'ın parçalı render'ı
python tools/brand_sheet.py                                # Kaşif referans çizimleri (brand/kit/)
```

**Performans kuralı (sahne kodu):** pahalı desenleri açılışta bir kez pişir, karede sadece kopyala; `mix-blend-mode`,
büyük `filter: blur`, tam ekran yarı saydam katman ve SVG grup `opacity`'sinden kaçın (yazılım raster'ında şerit
artefaktı). Motor 1080p/30 fps çizer (yazılım compositor'ı, CDP yakalama), ffmpeg 1440p'ye büyütür. Actions'ta bir
video ~40 sn'lik parçalara (en çok 16) bölünüp ayrı işlerde render edilir.
