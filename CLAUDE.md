# Düşün Bakalım + Stickstory — video otomasyonu

İki YouTube kanalı için anlatım videoları üreten pipeline. **İki kanal da belgesel ve tarih kanalıdır ve aynı
suluboya (watercolor) tarzında boyanır** (Lemo-Opuscar'ın Watercolor Brush stili; anayasa `docs/SULUBOYA.md`).
Senaryolar bu bulut oturumunda yazılır, push'tan sonra GitHub Actions render edip YouTube'a zamanlanmış olarak yükler.

| Kanal | Dil | Shorts | Uzun video (5–6 dk) | Saat dilimi |
|---|---|---|---|---|
| **Düşün Bakalım** (Türkçe, belgesel + tarih) | tr | günde **1** — 19:00 | **2 günde 1** — 20:30 | İstanbul |
| **Stickstory** (global, İngilizce, belgesel + tarih) | en | günde **2** — 13:00, 19:00 | **2 günde 1** — 14:00 | **New York** |

**Kanal sahibinin kararı (2026-11-23):** "Tüm videolar https://github.com/lemomo-ai/lemo-opuscar reposu kullanılarak
üretilecek. Styles olarak watercolor stili kullan." İki kanalın tarzı **belgesel ve tarih**; **haber/manşetten konu
seçme tamamen kaldırıldı, içerik özgün**; **kapaklar büyük, dikkat çeken yazılı** (örnek: "**5** TÜR VARDI");
**altyazı her videoda kesin var**. Eski tarzlar (Düşün Bakalım'ın koyu "belgesel" çizgi tarzı, Stickstory'nin parşömen +
çöp adam Kaşif'i) yeni videolarda kullanılmaz; `videos/` altındaki eski senaryolar sadece geçmiş kayıttır (konu
tekrarını önlemek için okunur) ve eski motorla render olmaya devam eder.

**Daha az ama daha iyi (kanal sahibinin kararı, 2026-10-26):** YouTube seri üretilmiş/tekrarlayan içeriğe para
kazanma açmıyor; bu yüzden sıklık düşük (uzun videolar 2 günde bir, Stickstory Shorts günde 2). Kazanılan zaman
araştırmaya, kaynaklara ve kaliteye gider; her video bir öncekinden kalıp olarak da farklı olmalı.

**İki kanal asla karışmaz:** Türkçe videolar sadece Düşün Bakalım'a, İngilizce videolar sadece Stickstory'ye gider.
Kanal dosya önekinden gelir (`ag-` = Stickstory); `upload.py` token'ın bağlı olduğu YouTube kanalını kontrol eder,
yanlış kanalsa yüklemez. **Üretim saatleri ayrı:** Düşün Bakalım sabah 05:50'de, Stickstory 11:50'de (İstanbul)
üretilir; bir oturum sadece kendi kanalının videolarını yazar. Aynı tarzı paylaşsalar da iki kanal aynı konuyu,
aynı kapak düzenini ya da aynı sahne kurgusunu aynı gün kullanmaz.

Takvim, saatler, ses, hashtag, kategori havuzu, dosya öneki, tarz ve YouTube secret'ı tek yerde: `tools/channels.py`.
Stickstory saatleri New York saatidir (en büyük İngilizce kitle ABD; aynı saatler İngiltere/Avrupa öğleden sonra
ve akşamına denk gelir; yaz/kış saati otomatik). İstanbul'da gece olması sorun değil, YouTube zamanlanmış videoyu
kendisi yayınlar. **Tarih/saat hesabını elle yapma: `python tools/plan.py [--channel ag]` kullan.**

**Tarz (`"theme": "watercolor"`, iki kanal; lint denetler; anayasa `docs/SULUBOYA.md`, çelişkide o kazanır):**
sıcak pamuk kâğıdı üstünde kendini darbe darbe boyayan yarı saydam fırça darbeleri ve suluboya yıkamaları, el yazısı
notlar ve kalem çizgileri, sahne başına tek kahraman özne, yavaş doğal hareket (boyanma, rüzgâr, alev, duman, su),
sahneler arası fırça kenarlı silme. Kâğıt seti (`palette`: pamuk, keten, sepya, yaz, gurub) her videoda değişir.
Sahne tipleri sadece `wc_*` ve `photo`. Sunucu/maskot yok, sol üst köşe boş (uzunda sadece bölüm etiketi birkaç saniye).
Senaryo yazmadan önce `.claude/skills/tarih-bolumu/SKILL.md` yüklenir ve `docs/SULUBOYA.md` okunur;
`python tools/wc_catalog.py` boyanabilen bütün nesneleri ve sahne tiplerini listeler.

## Yapı

- `build.py` — `<senaryo>.json -> mp4`. ElevenLabs (kelime zamanlamalı; watercolor tarzında ses hiç işlenmez),
  sahneleri Playwright ile kare kare çeker (CPU sayısı kadar paralel tarayıcı), ffmpeg ile birleştirir. Sadece `"engine": "studio"`.
- `scenes/studio/` — tek motor: `engine.js` (zaman çizelgesi, kamera, geçişler, kapak), `core.js` (yardımcılar, `SHOTS`,
  `THEME_PARCHMENT` renk token'ları). Zaman sadece `window.seek(t)`; her şey deterministik (`Math.random` yok).
- **Suluboya tarzı (iki kanal):** `watercolor-theme.js` (kâğıt dokusu, altyazı, uzun videoda bölüm etiketi),
  `watercolor-themes.json` (kâğıt + pigment setleri), `shots/wc__lib.js` (fırça motoru `WC.*`, nesne kaydı `WC.G`,
  genel sahne kurgulayıcı `wc_scene`; Lemo-Opuscar'dan MIT kodla uyarlandı), `shots/wc_g_places.js` (mimari),
  `shots/wc_g_people.js` (insanlar, ordular, hayvanlar), `shots/wc_g_sea.js` (gemiler, deniz, hava, felaketler),
  `shots/wc_g_objects.js` (eşyalar), `shots/wc_specimen.js` (tek nesne levhası), `shots/wc_map.js` + `shots/wc_world.js`
  (Natural Earth kıyıları ile boyanmış harita), `shots/wc_cards.js` (bölüm, sayı, zaman çizelgesi, mektup, başlık kartları)
  ve konuya özel `shots/wc_<konu>.js` tipleri. Yazı tipleri: Cormorant Garamond (başlık/altyazı), Caveat (el yazısı),
  Nunito Black (kapak).
- **Referans kalite (suluboya):** `docs/ornek/01-rumeli-hisari.json` (Düşün Bakalım Short) ve
  `docs/ornek/ag-01-pharos-of-alexandria.json` (Stickstory Short). Yayınlanmaz; sahne tipi, ölçek, cue ve kapak
  kullanımına örnektir (`python tools/preview.py docs/ornek/<dosya>.json`).
- Eski tarzların dosyaları (`parchment-theme.js`, `sets.js`, `belgesel-theme.js`, `shots/bt_*.js`, `_ink.js`, `kasif.js`,
  `parchment2d.js` …) eski senaryolar için durur; yeni videoda kullanılmaz, silinmez.
- `docs/SULUBOYA.md` (anayasa) ve `docs/REVIEW.md` (11 kriterli eleştiri). `docs/BELGESEL.md` §3 Düşün Bakalım'ın
  anlatım sesi için, `brand/kit/BRAND.md` §1, §6, §11 konu havuzu ve anlatım kuralları için hâlâ geçerli (görsel
  kısımları eski). **Senaryo yazan ya da sahne kodlayan her ajan önce SULUBOYA.md'yi okur.**
- `tools/plan.py` planı · `tools/lint.py` kural + SEO denetimi · `tools/preview.py` TTS'siz kontak sayfası + kapak +
  hareket ölçümü (`STATIC?`) · `tools/wc_catalog.py` suluboya nesne/sahne kataloğu · `tools/media.py` telifsiz fotoğraf
  (Wikimedia, Pexels) · `tools/sfx.py` hafif ambiyans müziği.
- `tools/upload.py` YouTube yüklemesi (kanal dosya önekinden; krediler ve bölümler açıklamaya eklenir).
- `tools/check.py` **API kontrolü**: ElevenLabs anahtarı/kalan kredi/sesler, iki kanalın YouTube girişi (token tazelenir,
  doğru kanala mı bağlı), Telegram botu. `.github/workflows/api-check.yml` her sabah 03:15'te ve her `Daily batch`
  başında çalışır; süresi dolmuş YouTube girişinde `YouTube login (phone)` workflow'unu o kanal için kendisi başlatır
  (kod Telegram'a gelir, gelen JSON kanalın secret'ına yapıştırılır: `YOUTUBE_TOKEN_JSON` / `YOUTUBE_TOKEN_JSON_AG`).
- `tools/telegram.py` + `tools/live.py` — **kanal başına günde tek** Telegram mesajı (her video bir blok, yerinde
  güncellenir), Shorts'un Instagram'a hazır dosyası. API kontrolü Telegram'a sadece sorun varsa yazar. `cloudflare/telegram-worker.js` — Telegram `/uzun`, `/shorts` komutları (`cloudflare/KURULUM.md`).

Ses: anlatım + çok hafif ambiyans (suluboya tarzında sıcak, yavaş ped + seyrek yumuşak piyano; `"sfx": false` kapatır).
**Efekt sesi (whoosh, pop) yok** — kanal sahibi istemiyor. **Ses işlenmez** (kanal sahibi, 2026-10-29: kırpma/nefes
efekti yok). **Görseller sadece kodla üretilir:** Higgsfield (kanal sahibi tamamen kaldırdı, 2026-10-26: Higgsfield
araçları hiçbir oturumda çağrılmaz) ya da başka bir yapay zekâ görsel/video aracı hiç kullanılmaz (lint engeller);
çizilemeyen an için yeni `wc_<konu>` sahne tipi/nesne ya da telifsiz gerçek fotoğraf.
Bu bulut ortamından ElevenLabs ve YouTube'a erişim yok; ses ve yükleme sadece Actions'ta. Yerel kontrol: `preview.py`.

## Günlük üretim görevi

Zamanlanmış görev her sabah bu bölümü uygular (Düşün Bakalım; Stickstory farkları aşağıda).

| | Süre | Anlatım karakteri | Sahne |
|---|---|---|---|
| Shorts | 28–35 sn | **330–420** (sert sınır 480; belgesel sesi yavaş) | 8–11 |
| Uzun video | **5–6 dk** | **3.900–4.500** (sert sınır 5.000) | **40–50**, her 8–12 sahnede bir `"chapter"` (ilk sahnede mutlaka) |

(Stickstory'nin sesi daha hızlı: Shorts 400–500 / 550, uzun 4.300–5.000 / 5.400; `tools/plan.py` kanala göre verir.)

### Akış (ana oturum = yönetmen; alt ajanlar commit/push yapmaz; bağımsız işler aynı mesajda paralel)

0. **API kontrolü:** GitHub MCP `actions_run_trigger` ile `api-check.yml`'i başlat (`ref: claude/shorts-pipeline`),
   sonucu bekleme. Sorun varsa Telegram'a kendisi yazar; YouTube girişi bozuksa render yine yapılır, video Actions'ta 14 gün saklanır.
1. **Plan:** `python tools/plan.py`. Sadece `todo` listesindekileri üret (`done` olanlara dokunma); `todo` boşsa dur.
   Dosya adları, `publish_at` ve önerilen `category` buradan gelir. `elevenlabs_chars.warning: true` ise karakteri
   aralığın alt ucunda tut ve raporda belirt. Plan dışına çıkma, fazladan video üretme.
2. **Geçmiş:** `videos/*/` altındaki tüm senaryoların (iki kanal; `ag-` Stickstory'dir) `youtube.title` ve konularını
   oku, aynı ya da çok benzer konuyu seçme. Dünün senaryolarının `*.youtube.json`'u yoksa (yüklenmemiş) raporla.
3. **Konu özgün (kanal sahibinin kararı, 2026-11-23: haberden/manşetten konu seçme kaldırıldı):** konu kanalın
   havuzundan, plan'ın önerdiği `category`'den başlayarak seçilir; güncel haber aranmaz, haber kanca olarak
   kullanılmaz. Video yıllarca izlenecek kalıcı bir hikâye anlatır.
   **Konu havuzu:** niş **tarih hikâyeleri** (BRAND §1): gerçek olay, gerçek insanlar, gerilim, "peki neden oldu?".
   Havuzu dönüşümlü kullan (felaketler ve kazalar · kayıp şehirler ve gizemler · büyük kararlar ve savaşlar ·
   keşifler ve icatlar · imparatorlukların yükselişi/çöküşü · **Türkiye ve Osmanlı tarihi, haftada en az 2 video**).
   Konu `tarih-bolumu` becerisinin 4 testini geçmeli; az bilinen bir açı, beklenmedik bir neden ya da az anlatılmış
   bir insan seç (herkesin bildiği konuyu bildik açıdan anlatma). Uzun video: birden fazla perdesi olan daha derin
   bir olay; aynı günün Short'undan farklı.
4. **`videos/<tarih>/production.md`:** her video için konu, havuz, "izleyici sonunda ne hisseder", kanca + kapak
   fikri, seçilen kâğıt seti (`palette`, bir önceki videodan farklı), önce **tek parça akıcı anlatım metni**, sonra
   çekim listesi (her sahne: cümle, `visual`, tip, boyanacak nesneler, cue, kamera notu). **Önce senaryo, sonra
   görüntü** (kanal sahibinin kuralı, BRAND §6.10): metin sahne düşünmeden yazılır, sesli okunur gibi kontrol edilir,
   sonra sahnelere bölünür. Sahne başına cümle yazıp görsel tarif etmek yasak.
5. **Yazım:** video başına 1 yazar ajan (uzunda: önce tek yazar tüm anlatımı, sonra bölüm başına bir ajan sahneleri).
   Her ajana `production.md` bölümünü, dosya adını, `publish_at`'i ver; CLAUDE.md + `docs/SULUBOYA.md` okusun,
   `python tools/wc_catalog.py` ile nesneleri görsün, `tarih-bolumu` becerisini yüklesin, bilgileri doğrulasın, JSON'u
   yazsın, `lint` hatasız + `preview` çalıştırıp `sheet.png`/`cover.jpg`'ye baksın. Yeni sahne tipi/nesne gerekirse
   **kendi dosyasına** yazar (`wc_<konu>.js`); ortak dosyalara (`engine.js`, `core.js`, `watercolor-theme.js`,
   `wc__lib.js`, `wc_g_*.js`, `wc_map.js`, `wc_world.js`, `wc_cards.js`, `wc_specimen.js`, `photo.js`) paralel ajan dokunmaz.
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
- Alanlar: `"engine": "studio"`, `"theme": "watercolor"`, `"palette": "<pamuk|keten|sepya|yaz|gurub>"`,
  `"format": "short|long"`, `"fps": 30`, `"subtitles": true`, `"channel"`, `"narrator"` (kanal anahtarı: Düşün
  Bakalım `kasif`, Stickstory `fes`; ekranda sunucu yok), `"lang"`,
  `"tts": {"provider": "elevenlabs", "voice_id": <kanalın sesi>, "model": "eleven_v3"}`.
  `tts.settings`, `pacing`, `max_pause`, sahne `tone`, `art`, `mascot` yok. **Ses asla değişmez**
  (Düşün Bakalım `mF7tIc9VLrznhGooGjaT` — belgesel sesi, kanal sahibinin isteğiyle 2026-10-29'dan beri; Stickstory
  `2t85BBUECtLLKQzxLD95`, kanal sahibinin isteğiyle 2026-10-26'dan beri).
- **Anlatım belgeseldir (SULUBOYA.md §3).** Düşün Bakalım: yavaş, alçak, hafif ürkütücü, merak uyandıran belgesel sesi
  (BELGESEL.md §3): kısa ağır cümleler, sessizlik bırakan noktalama, derin zaman ve bilinmeyen imgeleri; "Peki",
  "inanılmaz", "hemen anlatayım" gibi enerjik kalıplar yok. Stickstory: sıcak, meraklı, net bir İngilizce belgesel
  anlatıcısı (BRAND.md §11 dil kuralları); "you" hitabı seyrek ve doğal; aşırı heyecanlı YouTuber kalıpları yok.
  İkisinde de: olayı altyazı gibi sayan "yapıyor ediyor" anlatım yasak (Türkçede en fazla üçte biri "-yor"),
  **devrik cümle yok**, ekrandakini tarif etmez, cümleler birbirine bağlanır, dolgu cümle yok (BRAND §6).
  Kısaltmaları açık yaz ("km/sa" değil).
- **Kanal analizi (2026-10-26, iki kanal için de geçerli):** Shorts izleyicilerinin ~%46'sı ilk 1–2 saniyede
  kaydırıyor (hedef ≥ %70 devam); uzun videolar yarıda bırakılıyor (ortalama %39 izlenme); uzun video tıklama oranı
  %0,96; trafiğin %99'u Shorts'tan ama abone ve uzun video izlenmesi neredeyse yok. Aşağıdaki kurallar bunun için.
- **Shorts — ilk 2 saniye:** ilk kare doluyla açılır (kapak bloğu ilk cümle bitene kadar ekranda; tek net görsel +
  kapak yazısı) → **ilk cümle 3–8 kelime**, konunun **en çarpıcı anı ya da iddiası**, kapak yazısıyla aynı fikir
  ("Bisküvilerdeki bu delikler süs değil." ↔ "BU DELİKLER SÜS DEĞİL"). Tarihle, bağlamla, "bir zamanlar"la açılmaz
  (tarih ikinci cümlede). Bekleme yok: ses ilk karede başlar. 2–4 sn'de bir yeni görüntü.
  Yapı: en çarpıcı an → gerilim → şaşırtıcı ayrıntı/asıl neden → **punchline + abone çağrısı**: punchline tam ve
  kendi başına anlamlı bir cümle; hemen ardından **tek kısa, doğal abone cümlesi, nedeniyle birlikte**
  ("Böyle sessiz hikâyeler için abone olun." / "Subscribe for a true story like this every day."; lint
  ister). Videonun başına bağlanan döngü yok, soru/"yorumlara yazın" sahnesi yok (soru açıklamaya yazılır).
- **Shorts → uzun video:** `upload.py` her Short'un açıklamasına (ilk paragrafın hemen altına) kanalın bir uzun
  videosunun linkini koyar: `youtube.related` (uzun videonun senaryo yolu ya da video id'si) varsa o, yoksa Short
  yayınlandığında yayında olan en yeni uzun video. Konuyla bağlantılı bir uzun video varsa yönetmen `related`'ı
  yazar. (YouTube'un Shorts "İlgili video" alanının API'si yok; istenirse Studio'dan elle de seçilir.)
- **Uzun — ilk 30 saniye (soğuk açılış):** selam, kanal tanıtımı, "bu videoda", "bugün size", uzun giriş yok (lint).
  Video, vaat edilen olayın **en dramatik anının içinde** açılır (bölüm kartıyla değil: ilk sahne `wc_chapter` tipi
  olamaz) ve videonun cevaplayacağı soruyu sorar (açık döngü; cevap sonda). Arka plan bilgisi kısa tutulur ve
  hep "bu neden önemli?" sorusuna bağlanır.
- **Uzun — tempo:** her **45–60 saniyede** bir hikâye kancası (yeni soru, "ama kimse bilmiyordu ki…", sürpriz,
  cliffhanger) ve bir **görsel değişim** (yeni yer, harita/zaman çizelgesi, büyük sayı, yakın plan, nesne levhası).
  Her bölüm bir sonraki bölüme çeken bir cümleyle biter (lint uyarır). Efekt sesi yine yok; dikkat görsel değişim ve
  hikâye kancasıyla tutulur.
- **Uzun yapı:** soğuk açılış → BÖLÜM 1 sıradan dünya → kıvılcım/karar → felaket/dönüm noktası → "peki neden?" →
  sonrası ve bugün → tek yorum sorusu + abone çağrısı (`tarih-bolumu` §2). Bölümler YouTube'a otomatik eklenir.
  Sahnenin `"chapter"` alanı bölüm adıdır (uzunda sol üstte birkaç saniye "02 / 05 · ad" olarak da görünür).
- Her sahne 1–3 cümle (Shorts'ta en fazla 2), `"visual"` = ekranda tam olarak ne görünüyor; seçilen tip ve
  boyanan nesneler bunu **birebir** göstermeli; uygun nesne/tip yoksa yeni `wc_<konu>` kodla. `title` (kicker)
  yazılmaz. `cues`: sahne metnindeki dramatik bir kelimenin parçası (ilk eşleşme; erken bir kelimeye denk gelmesin),
  altyazıda vurgu renginde yanar; sahne içinde bir olayı (bir nesnenin boyanması, bir notun yazılması, bir rotanın
  çizilmesi) o ana bağlamak için `"at": "<cue adı>"` ile kullanılır.
- **Sahne tipleri (SULUBOYA.md §4):** `wc_scene` (genel boyanmış sahne: gökyüzü, zemin, nesneler, notlar, ateş, duman,
  hava), `wc_map`, `wc_specimen`, `wc_number`, `wc_timeline`, `wc_letter`, `wc_chapter`, `wc_title`, `photo`
  (gerçek fotoğraf/belge, sıcak baskı; sadece gerçek tarihî belge/yer/eser için: `python tools/media.py search
  "<İngilizce sorgu>" --dir videos/<tarih>/media` → `candidates.jpg`'ye bak → `get <no> --dir … --name <ad>`;
  `params.credit` zorunlu, ajan başına ayrı `--name`) ve konuya özel `wc_<konu>` tipleri.
- **Kamera:** sahne boyunca tek yavaş yaklaşma (motor); yakın plan `"camera": {"focus": [x, y], "zoom": 1.6–2.2}` ya da
  nesneyi büyük boyamak (`s`, `wc_specimen`). Plan büyüklüğü değişir: Shorts'ta ≥ 1, uzunda ≥ 4 yakın plan/levha.
- **Çeşitlilik:** Shorts'ta en az 3 farklı tip; `wc_scene` üst üste en fazla 3, diğerleri 2; tek tip toplamın %70'ini
  geçmez; ardışık iki `wc_scene` aynı gökyüzü + zemin + nesneyle tekrar etmez (lint). Her video önceki videolardan
  kalıp olarak farklı (yer, gün saati, kâğıt seti, açılış görüntüsü, kapak düzeni).
- **Kalite:** her sahnede yavaş, doğal hareket (boyanma, salınım, alev, duman, su, ilerleyen bir şey); zıplama/titreşim
  yok. Sahne başına tek kahraman özne, bol kâğıt boşluğu; ekranda sahne başına en fazla 5 kelime not. **Dikey ekranda**
  özne y ≈ 200–1150'de; altyazı şeridi (y ≈ 1170–1320) ve YouTube arayüzü (y > 1500) üstüne önemli ayrıntı konmaz,
  zemin ve ön plan oraya kadar boyanır (boş kalmaz).
- Geçişler otomatik (sahneler arası fırça kenarlı `wipe`, bölüm başında `dip`); elle `"transition"`.
- **Kaynaklar görünür (kanal sahibinin kararı, 2026-10-26; lint):** senaryoda `"sources": [{"title": "NASA — Phobos",
  "url": "https://…"}, …]` (Shorts ≥ 2, uzun ≥ 3; bilgilerin doğrulandığı gerçek sayfalar, uydurma yok) →
  `upload.py` açıklamaya "📚 Kaynaklar / Sources" bölümü olarak ekler. Suluboya tarzında ekranda kaynak notu yok.
  Mümkünse gerçek belge, mektup, eski harita (`photo`, `wc_letter`) ve kişilerin kendi sözleri kullanılır.
- **Kâğıt seti her videoda değişir:** `scenes/studio/watercolor-themes.json` (pamuk, keten, sepya, yaz, gurub); yazar
  konuya uyanı ve bir öncekinden farklısını `"palette"` ile seçer (SULUBOYA.md §2). Sahne kodu renkleri sadece
  token'lardan alır (`WC.C.*` / `THEME_PARCHMENT.*`; sabit hex yazılmaz).

### Kapak (tıklanma oranını belirler, en çok özen burada)

**Büyük, dikkat çeken yazı (kanal sahibinin kararı, 2026-11-23; SULUBOYA.md §7):** kalın, yuvarlak büyük harfler
(Nunito Black), açık kâğıt renginde dolgu, kalın mürekkep kontur ve sert gölge; **tek kelime kehribar sarısında**
(örnek: "**5** TÜR VARDI"). Yazı üstte, altında boyanmış tek net özne. Çerçeve yok, sunucu yok.

```json
"cover": {"lines": ["5 tür", "vardı"], "highlight": ["5"], "scene": 3, "t": 2.2}
"cover": {"lines": ["200 gemi", "tek ada"], "highlight": ["ada"], "scene": 21, "t": 2.5, "focus": [960, 640], "zoom": 1.5}
```
- `lines` 1–3 satır, toplam **2–4 kelime** (lint), başlığı tekrar etmeyen merak patlatan iddia. `highlight` tek kelime.
  `scene` + `t`: en dramatik, **tam boyanmış** an (boş/yarım boyanmış kare, sıkıcı harita, uzak plan olmaz).
  **Görsel karmaşa yok: tek net odak noktası.** Kalabalık sahne yerine tek nesne/tek insan/tek gemi.
- `focus` [x, y]: kapağın gösterdiği tek öznenin sahne pikseli; motor onu yazının altına büyütür (`zoom`; uzun
  varsayılan 1,6, Shorts 1,25); `"side": "left"|"right"` yana kaydırır. Uzun kapakta önerilir (lint uyarır).
- Uzun video kapağı 1280×720; Shorts 1080×1920 (aynı kare ilk 2 saniyenin kancasıdır).
- **Her video için en az 3 kapak adayı** üret (farklı sahne/an/metin), `cover.jpg`'leri karşılaştır, en güçlüsünü
  seç; telefonda küçükken okunmalı. Eleştirmen kapağa **8'in altında** verirse kapak yenilenir.

### YouTube SEO (lint 100/100 ister; altı hatadır, push yok)
```json
"youtube": {"title": "Emu Savaşı: Avustralya Kuşlara Neden Savaş Açtı?", "description": "...", "tags": ["emu savaşı", "..."],
            "category_id": "27", "publish_at": "<plan.py'den>"}
```
- **`tags[0]` ana anahtar kelimedir** (insanların gerçekten aradığı ifade). Başlık onunla başlar, merak boşluğu
  (`?`/`!`/`:`), Shorts 30–60 / uzun 30–70 karakter, en fazla 1 emoji, BÜYÜK HARF yok, cevabı videoda olan dürüst vaat.
  **Başlık bilgi değil kanca:** ana kelimeden sonra izleyicide soru işareti bırakan bir soru ya da şaşırtıcı iddia
  ("Malta Kuşatması 1565: Küçük Bir Ada Koca Orduyu Nasıl Durdurdu?", "Phobos: Mars'a Yavaş Yavaş Düşen Uydu").
  "X Tarihi", "X Nedir", "Belgesel", "The History of", "Explained", "Documentary" gibi bilgi veren kalıplar yasak (lint).
- Açıklama: ilk 150 karakterde ana kelime + kanca; 2–4 cümle özet (2–3 yan kelime); uzunda boş satırdan sonra
  "Bu videoda:" 3–5 madde; abone çağrısı + yorum sorusu ("Her gün yeni bir 'neden?' için abone ol. Sence …? Yorumlara
  yaz!"); son satırda 3–5 hashtag (Shorts'ta ilki `#shorts`, sonra konu, `#düşünbakalım`). Shorts ≥ 250, uzun ≥ 600 karakter.
- Etiketler: 12–18, toplam ≤ 450 karakter, tekrar/hashtag yok, ana kelimenin ≥ 3 varyasyonu, konu/kişi adları,
  "tarih", "tarih hikayeleri", `düşün bakalım`. `category_id` "27" (Stickstory "28"). Diğer kanalın adı/hashtag'i geçmez.

### Kontrol
`pip install -r requirements.txt`, `python tools/lint.py videos/<tarih>/*.json` (hata kalmayana kadar), her dosya için
`python tools/preview.py …` (`CHROMIUM_PATH=/opt/pw-browsers/chromium`). `STATIC?` sahneyi hareketlendir. `sheet.png` ve
`cover.jpg`'de: taşan/üst üste binen yazı, ekran dışı nesne, boş ya da yarım boyanmış kare, palet dışı renk, sallanan/
titreyen öğe, altyazının arkasında kalan ayrıntı, okunmayan altyazı, eşleşmeyen cue uyarısı, karakter bütçesi.
Doğruluk: sadece emin olunan bilgiler; web varsa tarih ve sayıları doğrula, emin olmadığın sayıyı yazma, yaygın yanlış
efsaneleri anlatma.

## İkinci kanal: Stickstory (global, İngilizce)

Ayrı bir zamanlanmış görev her gün 11:50'de (İstanbul) bunu uygular (aynı görev, saate göre kanal seçer). Akış, tarz
(suluboya, `"theme": "watercolor"`), eleştiri ve SEO kuralları yukarıdakiyle **birebir aynı**. Farklar:
- `python tools/plan.py --channel ag`; dosyalar `ag-NN-<slug>.json`; plan her video için farklı bir `category` önerir.
- **Konu özgün** (kanal sahibinin kararı, 2026-11-23: haber/manşetten konu seçme kaldırıldı): kanalın kategori
  havuzundan, plan'ın önerdiği `category`'den başlayarak gerçek, doğrulanabilir, kalıcı bir hikâye.
- **Her şey İngilizce:** ses, ekrandaki her yazı (notlar, etiketler, harita yazıları, "CHAPTER 2"), altyazı, kapak,
  başlık/açıklama/etiketler. Metadata'da Türkçe karakter ve "Düşün Bakalım" geçmez.
- **Niş: belgesel + tarih**, en çok izlenen kategorilerde (`channels.py` `categories`: tarihin en tuhaf anları,
  çözülmemiş gizemler, bir şey nasıl inşa edildi, gündelik eşyaların kökeni, insan vücudu, hayvanların süper güçleri,
  uzay ve dünya, hayatta kalma hikâyeleri, imparatorluklar ve savaşlar; Osmanlı/Türk tarihi "empires and battles"
  altında global izleyiciye). Her konu yine gerçek ve doğrulanabilir (`tarih-bolumu` 4 testi; bilim/hayvan
  konularında kahraman bir canlı ya da deney olabilir) ve tarihsel bir hikâye olarak anlatılır (ilk kim fark etti,
  nasıl keşfedildi). Konu iki kanalın geçmişinde işlenmemiş ve aynı gün Düşün Bakalım'la çakışmıyor olmalı.
- Senaryo: `"channel": "Stickstory"`, `"narrator": "fes"` (kanal anahtarı), `"lang": "en"`, ses `2t85BBUECtLLKQzxLD95`.
- SEO: başlık aranan İngilizce ifadeyle başlar ("Mary Celeste: …"); uzunda "In this video:"; "Subscribe to Stickstory
  for …" + yorum sorusu; hashtag'ler `#shorts` (Shorts'ta ilk) + konu + `#stickstory`; etiketlerde `stickstory`.
- `category_id` **"28"** (Bilim ve Teknoloji); yüklemede "yapay zekâ kullanımı / değiştirilmiş ya da sentetik içerik"
  kutusu **evet** işaretlenir (kanal sahibinin kararı, 2026-10-26; ikisi de `channels.py`'den, `upload.py` uygular).
- Commit: `Daily batch YYYY-MM-DD (Stickstory)`. Yükleme `YOUTUBE_TOKEN_JSON_AG` ile, dil `en`.

## Elle başlatılan ek video
Telegram `/uzun [konu]`, `/shorts [konu]` (payload "EK VİDEO: uzun|shorts · Konu: …") ya da sohbetten istek: plan
dışı ama **istenmiş** bir videodur. `python tools/plan.py --extra short|long [--channel ag]` numara ve en erken
`publish_at`'i verir; senaryoya `"extra": true` yaz (günlük plana sayılmaz). Kanal sahibi "hemen paylaş" derse
`"publish_at": "now"`: render biter bitmez herkese açık yayınlanır (sadece `extra` videolarda, lint denetler). Konu
verilmemişse geçmişte işlenmemiş özgün bir konu seç (kanalın havuzundan). Akış aynı (eleştirmen en az 1 tur, zaman
yetiyorsa 2); commit `Extra video YYYY-MM-DD: <başlık>`.

## Komutlar

```bash
python tools/plan.py [--channel ag] [--date YYYY-MM-DD] [--extra short|long]
python tools/lint.py videos/<tarih>/*.json
python tools/preview.py videos/<tarih>/<dosya>.json [--times 3,12.5]
python tools/wc_catalog.py [arama]                         # suluboya nesneleri ve sahne tipleri
python tools/media.py search "Piri Reis map" --dir videos/<tarih>/media
python tools/check.py                                      # API kontrolü (secret'lar Actions'ta)
python build.py <dosya>.json [--scenes 3 | --still 12.5 | --cover | --no-tts -o out/draft.mp4]
python build.py <dosya>.json -o out/x.mp4 --prepare | --shard 2/5 | --finish   # Actions'ın parçalı render'ı
```

**Performans kuralı (sahne kodu):** pahalı şeyleri açılışta bir kez pişir (`WC.make` nesne sprite'ları, `WC.backdrop`
arka plan tuvali), karede sadece kopyala; boyanma bitince nesne sprite'tan çizilir. `mix-blend-mode`, büyük
`filter: blur`, tam ekran yarı saydam katmanlar ve kare başına binlerce fırça darbesinden kaçın (yazılım raster'ı).
Motor 1080p/30 fps çizer (yazılım compositor'ı, CDP yakalama), ffmpeg 1440p'ye büyütür. Actions'ta bir video
~40 sn'lik parçalara (en çok 16) bölünüp ayrı işlerde render edilir.
