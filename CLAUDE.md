# Düşün Bakalım — video otomasyonu

YouTube kanalı **Düşün Bakalım** için Türkçe anlatım videoları üreten pipeline.
Her gün **2 Shorts** ve **1 uzun video** üretilir, GitHub Actions'ta render edilip YouTube'a zamanlanmış olarak yüklenir.

## Yapı

- `build.py` — `script.json -> mp4`. ElevenLabs ile seslendirir (kelime zamanlamalı), sahneleri Playwright ile kare kare çeker (CPU sayısı kadar paralel tarayıcı), ffmpeg ile birleştirir.
- **`scenes/studio/` — Studio motoru (yeni videoların hepsi bununla, `"engine": "studio"`).** Tam ekran sahneler: Three.js 3D (`shots3d.js`), tam ekran 2D SVG (`shots2d.js`), gerçek fotoğraf/video (`photo`), video başına renk paleti (`"art"`), maskot (`mascot.js`), kelime kelime altyazı, film greni, bloom, sahne geçişleri ve aynı 3D dünyada kesintisiz kamera (`engine.js`). Zaman tamamen `window.seek(t)` ile kontrol edilir; her şey deterministik (Math.random yok, `rng(seed)` kullan).
- `scenes/index.html` — eski "klasik" motor (kart tasarımı). Sadece eski senaryoları yeniden render etmek için; yeni videoda kullanma.
- `examples/dunyanin-merkezi.json` — **Studio referans senaryosu ve kalite seviyesi** (3D kesitli Dünya, kesintisiz kamera, maskot, dev yazı, ölçek çubuğu, atom kafesi).
- `script.json` — klasik motorun eski örneği (Comet / uçak pencereleri).
- `videos/YYYY-MM-DD/*.json` — günlük senaryolar. Push edilince `.github/workflows/daily.yml` render + yükleme yapar, sonucu `*.youtube.json` olarak geri commit eder.
- `tools/plan.py` — bugünün üretim planı: kaç video, dosya adları, `publish_at` saatleri, uzun video günü mü, aylık ElevenLabs karakter kullanımı. **Tarih/saat hesabını elle yapma, bunu kullan.**
- `tools/lint.py` — senaryo kural denetimi (karakter, sahne sayısı, çeşitlilik, cue, kapak, SEO, `publish_at`). Hata varsa push yok.
- `tools/preview.py` — TTS olmadan görsel kontrol (tahmini zamanlama ile kontak sayfası + kapak + sahne başına hareket ölçümü, donuk sahneyi `STATIC?` diye işaretler).
- `docs/ANIMATION_GUIDE.md` — görsel dil, ekran düzeni, hareket dili, yeni sahne tipi şablonu. **Senaryo yazan ya da sahne kodlayan her ajan önce bunu okur.**
- `docs/REVIEW.md` — eleştiri döngüsü: 10 kriterli puanlama, geçme şartı (hepsi ≥ 7), günlük formatı.
- `scenes/studio/shots/<tip>.js` — konuya özel yeni sahne tipleri, her tip kendi dosyasında (otomatik yüklenir).
- `tools/upload.py` — YouTube yüklemesi (Actions'ta çalışır, `YOUTUBE_TOKEN_JSON` secret'ı). Fotoğraf/video kredilerini (`params.credit`) açıklamaya otomatik ekler.
- `tools/media.py` — telifsiz fotoğraf/video bulur ve indirir (Wikimedia Commons; `PEXELS_API_KEY` varsa Pexels foto + video).
- `tools/hf.py` — Higgsfield klibini (MCP ile üretilen) indirip 1080p'ye normalleştirir. Bulut ortamı Higgsfield CDN'ine erişemezse klip `params.url` ile senaryoya yazılır; `build.py` render sırasında (GitHub Actions) indirir, önizleme yer tutucu gösterir.

Ses: anlatım + altında çok hafif ambiyans müziği (`tools/sfx.py`, kodla üretilir). **Efekt sesi (whoosh, pop, vuruş) yok — kanal sahibi istemiyor, geri ekleme.** Müziği de kapatmak için senaryoya `"sfx": false`.

Bu bulut ortamından ElevenLabs ve YouTube'a erişim yok; ses ve yükleme sadece GitHub Actions'ta çalışır. Yerel kontrol için `tools/preview.py` kullan.

## Günlük üretim görevi

Zamanlanmış görev her sabah bu bölümü uygular.

**Plan:** her gün **2 Shorts + 1 uzun video** (`python tools/plan.py` söyler). Bu planın dışına çıkma, fazladan video üretme. Karakter sınırlarına kesinlikle uy; `plan.py` aylık ElevenLabs kullanımını gösterir, `warning: true` ise raporda mutlaka belirt.

| | Süre | Karakter (anlatım metni toplamı) | Yayın |
|---|---|---|---|
| Shorts ×2 | 28–35 sn | **400–500** (sert sınır 550) | her gün 12:00 ve 19:00 (+03:00) |
| Uzun video (her gün) | ~4–5 dk | **3.400–4.000** (sert sınır 4.300) | her gün 20:30 (+03:00) |

**Shorts'ta izlenmeyi belirleyen kurallar** (YouTube, ilk 1–2 saniyede kaydırılan videoyu akışa açmaz):
- **İlk kare dolu olmalı.** Shorts otomatik olarak `cover` bloğuyla açılır: ilk cümle bitene kadar kapaktaki dev yazı + dramatik görsel ekranda durur. Bu yüzden **ilk cümle kısa (3–7 kelime) ve kapak yazısıyla aynı fikirde** olmalı ("Bisküvilerdeki bu delikler süs değil." ↔ kapak "BU DELİKLER SÜS DEĞİL").
- **Hızlı tempo:** her sahne tek cümle, 2–4 saniye; 8–11 sahne. Uzun cümleleri böl.
- **Net kapanış (döngü yok):** son cümle **tam ve kendi başına anlamlı** olsun; videoyu bağlayan, akılda kalan bir sonuç/punchline ("Yani ayağının altında, erimeyi reddeden bir demir güneş var."). Cümleyi yarım bırakıp videonun başına bağlama — kanal sahibi "sonsuz video" etkisini istemiyor. Ayrı bir soru/"yorumlara yazın" sahnesi koyma; yorum sorusu açıklamaya yazılır.
- Hiç dolgu cümle yok; her cümle ya yeni bir bilgi ya da gerilim eklesin.

### Üretim akışı: ajanlar ve kapılar

Videolar tek seferde yazılıp gönderilmez; bir prodüksiyon gibi aşamalı ilerler. Ana oturum **yönetmen**dir:
konuları seçer, işi alt ajanlara (Agent aracı) dağıtır, kapıları denetler, commit/push'u kendisi yapar.
Alt ajanlar commit/push yapmaz. Bağımsız işler **aynı mesajda paralel** başlatılır.

1. **Ön hazırlık (yönetmen):** adım 1–3. Sonra `videos/<tarih>/production.md` yaz: her video için konu,
   kategori, tek cümlelik "izleyici sonunda ne hisseder", palet, kanca + kapak fikri ve **çekim listesi**
   (her sahne: anlatım cümlesi, `visual`, sahne tipi, cue kelimesi, kamera/hareket notu). Bu dosya
   günün yaratıcı belgesidir ve commit'e girer (workflow sadece `.json` dosyalarını render eder).
2. **Yazım (video başına 1 yazar ajan, paralel):** her ajana `production.md`'deki kendi bölümünü, dosya
   adını, `publish_at` değerini ver; CLAUDE.md + `docs/ANIMATION_GUIDE.md` okusun. Görevi: bilgileri
   doğrulamak (adım 4), gerçek görüntü bulmak (`tools/media.py`, ajan başına ayrı `--name`), senaryo
   JSON'unu yazmak, `lint` hatasız + `preview` çalıştırıp `sheet.png`/`cover.jpg`'ye bakmak.
   Uygun sahne tipi yoksa yeni tipi **kendi dosyasına** yazar (`scenes/studio/shots/<tip>.js`);
   `shots2d.js`/`shots3d.js`'e paralel ajanlar dokunmaz. Uzun videoda: önce tek bir yazar tüm anlatımı
   yazar (hikâye bütünlüğü), sonra her bölüm (`chapter`) için ayrı bir ajan o bölümün sahnelerini
   kurar ve önizler.
3. **Eleştiri (video başına 1 eleştirmen ajan, yazardan farklı, paralel):** `docs/REVIEW.md`'ye göre
   puanlar, en büyük 3 sorunu yazar. Kendisi düzeltmez.
4. **Düzeltme turu:** yazar ajan (SendMessage ile aynı ajana devam et) sorunları düzeltir → lint →
   preview → eleştirmen tekrar puanlar. En az 2, en fazla 3 tur; hedef tüm kriterler ≥ 7. Her tur
   `production.md` → "Eleştiri günlüğü"ne eklenir.
5. **Son kapı (yönetmen):** iki Shorts'un konu/kategori/palet olarak birbirinden ve geçmişten farklı
   olduğunu, `lint` hatasız geçtiğini, her `cover.jpg` ve `sheet.png`'yi **kendi gözüyle** gördüğünü
   doğrular; sonra adım 10–11.

Zaman: tüm akış ~1 saati geçmesin; turlar uzarsa 3. turu atla ve raporda belirt. Ağır işler
(`preview.py`, Chromium) aynı anda en fazla 3 tane çalışsın.

1. **Plan:** `python tools/plan.py` çalıştır. Sadece `todo` listesindeki videoları üret (`done` dolu olanlar önceden hazırlanmış, dokunma); `todo` boşsa hiçbir şey yapma, dur. Dosya adları ve `publish_at` değerleri bu çıktıdan gelir. `elevenlabs_chars.warning: true` ise karakterleri hedef aralığın alt ucunda tut ve raporda belirt.
2. **Geçmiş:** `videos/*/` altındaki tüm senaryoların `youtube.title` ve konularını oku; aynı ya da çok benzer konuyu tekrar seçme. Dünün `*.youtube.json` dosyalarını kontrol et; yüklenmemiş video varsa raporla.
3. **Konu:** Kanala uygun, aranan ve merak uyandıran bir soru seç ("Neden...?", "Nasıl...?", "Ne olurdu...?"). Kategorileri günden güne değiştir: gündelik tasarımların hikâyesi, bilim, insan vücudu, tarih, hayvanlar, uzay, mühendislik, psikoloji. Uzun video: birden fazla perdesi olan, hikâyesi güçlü daha derin bir konu.
4. **Doğruluk:** Sadece emin olduğun, iyi bilinen bilgileri kullan. Web araması varsa tarih ve sayıları doğrula. Emin olmadığın sayıyı yazma; "yaklaşık" de ya da çıkar. Yaygın ama yanlış efsaneleri anlatma.
5. **Senaryo** — dosyalar: `01-<slug>.json`, `02-<slug>.json` (Shorts, ikisi farklı kategorilerden) ve `03-<slug>.json` (uzun video, Shorts'lardan farklı bir konu); numaralar `plan.py`'nin `todo` listesinden.
   - **Motor:** her dosyada `"engine": "studio"` ve video için bir renk paleti `"art": {"palette": "space"}` (bkz. 6). Sahne bazında `"art"` ile palet değiştirilebilir (renk geçişi yumuşak olur).
   - **Storyboard (zorunlu):** her sahneye `"visual": "ekranda tam olarak ne görünüyor"` cümlesini yaz. Seçtiğin sahne tipi bu cümleyi **birebir** göstermeli; anlatılan şeyle ilgisiz ya da "yaklaşık" bir görsel kullanma. Uygun tip yoksa konuya özel yeni bir sahne tipi kodla (bkz. 6).
   - Shorts: `"format": "short"`, `"fps": 30`, 8–11 sahne, sahne başına tek cümle. Uzun: `"format": "long"`, `"fps": 30`, 35–45 sahne, her 5–8 sahnede bir `"chapter": "Bölüm adı"` (ilk sahnede mutlaka; YouTube bölümleri otomatik oluşur).
   - `channel`, `subtitles`, `tts` alanlarını `script.json`'dan aynen kopyala.
     Ses (kanal sahibinin seçimi, asla değiştirme): **tüm videolarda (Shorts ve uzun)** ElevenLabs `voice_id: j4vJUfke1j8j9OYq8V3b`. Model `eleven_v3`. `tools/lint.py` bunu denetler.
   - **Karakter bütçesine uy** (tablo). `tools/preview.py` çıktısındaki `chars` değerini kontrol et; sınırı aşıyorsa metni kısalt.
   - Anlatım (Shorts): kanca iddiası → neden (mekanizma, basitçe) → şaşırtıcı detay → net kapanış cümlesi. Uzun video: kanca, hikâye (kişiler, yer, tarih, gerilim), açıklama, dönüş ("yani..."), sonda yoruma çağıran tek bir soru. Sade, konuşma dili, kısa cümleler. "km/sa" gibi kısaltmaları açık yaz.
   - Her sahne 1–3 cümle. `title` sol üstte küçük bir "kicker" etiketi olarak görünür: `title.white` 1–2 kelime, `title.gray` en fazla ~3 kelime; dev yazı sahnesinde boş bırak (`{}`). `tags` studio'da gösterilmez.
   - `cues`: sahnenin metninde geçen bir kelimenin parçası (büyük/küçük harf duyarsız, ilk eşleşme). Animasyonun vurgusunu o kelimeye bağla; erken bir kelimeyle yanlışlıkla eşleşmediğinden emin ol.
6. **Görseller (Studio motoru):** ekran bir "kart" değil, **tam ekran bir sahne**dir. Her video konuya uygun bir renk dünyası, sinematik ışık ve hareket taşır. Sahne tipleri (`params` alanları):
   - **3D** (`scenes/studio/shots3d.js`, Three.js r159 — `THREE` global):
     - `planet` — 3D gezegen, istenirse kesitli: `{"preset": "earth|moon|mars|sun", "cut": true, "highlight": "inner|outer|mantle|crust", "labels": [{"layer": "mantle", "text": "MANTO", "sub": "~2.900 km", "at": "hit", "angle": 60, "dx": -250, "dy": -150}], "drill": {"to": 6400, "unit": "km", "round": 10}, "layers": [...özel katmanlar], "spin": 0.1, "camera": {...}}`. Cue: `hit` (vurgu), `drill`.
     - `orbs` — 1–3 küre yan yana + sayaçlar (sıcaklık/boyut/kütle karşılaştırması): `{"items": [{"label", "value": "5.500", "prefix": "~", "suffix": "+", "unit": "°C", "material": "sun|core|earth|moon|mars|metal|rock|ice|lava", "size": 1}]}`. Cue: `o0`, `o1` (giriş), `v0`, `v1` (sayaç).
     - `lattice` — 3D atom/molekül kafesi: `{"mode": "squeeze|heat|melt", "hot": 0.8, "n": 5, "spacing": 0.8, "arrows": false, "metal": false, "color": "#e8f8ff", "counter": {"to": "3.000.000", "suffix": "+", "label": "..."}}`. Cue: `hit`, `count`.
     - `collision` — gezegen ölçeğinde çarpışma: `{"stage": "approach|impact|disk|moon", "labels": {"target": "Proto-Dünya", "impactor": "Theia"}}` (yaklaşma → çarpma ve enkaz → enkaz halkası → halkadan uydu oluşumu). Cue: `hit`.
     - `orbit3d` — gezegen + yörüngedeki uydu: `{"center": "earth", "satellite": "moon", "dist": 3.2, "angle": 0.25, "label": "384.400 km", "laser": true, "recede": "+3,8 cm / yıl", "tides": true}`. Cue: `hit`.
     - `planet` ek parametreler: `"fade": true` (cue'da söner, ör. "Güneş sönseydi"), `"tilt": 23.4` (eksen eğikliği).
     - **Kamera:** `"camera": {"dist", "yaw", "pitch", "tx", "ty", "tz", "fov", "drift"}` (derece). **Aynı 3D tipin art arda sahneleri tek bir dünyada kesintisiz kamera hareketiyle bağlanır** (match cut): kamera önceki sahnenin bittiği yerden yenisine süzülür. Bunu hikâyeyi "içeri doğru yolculuk" gibi anlatmak için kullan (uzaktan → katmana → çekirdeğe). Dikey ekranda tüm gezegen için `dist` ≈ 6.5; yakın plan 2–4.
   - **2D tam ekran** (`scenes/studio/shots2d.js`, SVG viewBox = ekran boyutu 1080×1920 / 1920×1080):
     - `headline` — dev kinetik yazı (Anton): `{"lines": ["Peki neden", "erimiyor?"], "highlight": ["erimiyor?"], "sub": "küçük not", "count": {"to": "3.000.000", "suffix": "+"}}`. Cue: `w0`, `w1`… (kelimeler tek tek çarpar), `count` (sayaç).
     - `scale_bar` — "bu, şunun yanında minicik": `{"total": "6.400", "part": "12", "unit": "km", "step": "1.000", "top_label", "total_label", "part_label"}`. Cue: `total`, `part` (büyüteç açılır).
     - `bars` — animasyonlu karşılaştırma çubukları: `{"items": [{"label", "value", "unit"}], "highlight": 1}`. Cue: `b0`, `b1`…
     - `compare` — tam ekran ikiye bölünmüş karşılaştırma: `{"left": {"title", "value", "icon", "mark": "x|check", "color": "red|green|accent"}, "right": {...}}`. Cue: `left`, `right`.
     - `waterline` — su hattı: `{"mode": "float|sink|lake", "fraction": 0.9, "above": "%10", "below": "%90", "top_temp": "0 °C", "bottom_temp": "4 °C", "fish": 3}` (yüzen/batan cisim, donmuş göl kesiti). Cue: `hit`.
     - `headline` sayacında yıl gibi noktasız sayılar için `"count": {"to": "1969", "plain": true}`.
     - `photo` — **gerçek fotoğraf ya da video klip**, Ken Burns hareketi, renk düzeltme ve üstüne çizilen işaretler: `{"src": "media/flamingo.jpg"}` ya da `{"video": "media/surf.mp4", "from": 2.0, "rate": 0.5}`, `"kb": {"from": [1.0, 0.5, 0.5], "to": [1.15, 0.55, 0.45]}`, `"grade": "cinematic|natural|mono|duotone"`, `"credit": "..."`, `"marks": [{"type": "circle|arrow|box", "x": 0.42, "y": 0.31, "r": 0.06, "text": "Gaga", "at": "hit"}]` (x, y görüntünün 0–1 koordinatı). Yol senaryo dosyasına göredir (`videos/<tarih>/media/`).
   - **Gerçek görüntü (mümkünse her Shorts'ta 1–3 sahne):** `python tools/media.py search "<İngilizce sorgu>" --dir videos/<tarih>/media` → `candidates.jpg` dosyasını **aç ve bak**, sahnenin `visual` cümlesini birebir gösteren görseli seç → `python tools/media.py get <no> --dir videos/<tarih>/media --name <ad>` → `params.src` + `params.credit` (aracın yazdığı kredi satırı). Sadece telifsiz/özgür lisanslı kaynak kullan (araç zaten filtreler). Ağ erişimi yoksa (Wikimedia engelliyse) fotoğrafsız devam et ve raporda belirt.
   - **Görseller genel olarak kodla üretilir (kanal sahibinin kuralı).** Uygun sahne tipi yoksa yenisini kodla. **Higgsfield yapay zekâ klipleri istisnadır (sadece uzun video):** kodla çizilemeyecek geniş mekân/atmosfer anları için uzun video başına **en fazla 2–3 klip** (Higgsfield araçları bu oturumda yoksa ya da `balance` 60 kredinin altındaysa klipsiz devam et ve raporda belirt). **Model seçimi (kanal sahibinin kuralı: önce ücretsiz, sonra en ucuz):**
     1. `seedance_2_0_mini`, `resolution: "720p"`, `duration: 5`, `generate_audio: false`, `aspect_ratio: "16:9"` (Shorts için `9:16`) ve **`use_unlim: true`** (ücretsiz/sınırsız hak). Kabul edilirse kredi harcanmaz.
     2. Reddedilirse ya da hata verirse aynı istek `use_unlim` olmadan (≈ **5 kredi**/klip; `get_cost` ile doğrula).
     3. O da hata verirse `seedance1_5` (`720p`, `duration: 4`, `generate_audio: false`, ≈ 4,8 kredi), en son `kling3_0` (`mode: "std"`, `sound: "off"`, ≈ 7,5 kredi).
     Ücretli Pro modeller (`kling3_0` pro 8,75, `seedance_2_5` 80 kredi) kullanılmaz. Video başına en fazla ~15 kredi. Pro plan aynı anda **2 iş** kabul eder: ikişer gönder, `jobs_wait` ile bekle. Prompt İngilizce ve `brand/kit/BRAND.md` §8 kalıbıyla başlar. Kullanım: `photo` tipi, `{"video": "media/hf-<ad>.mp4", "url": "<result_url>", "ai": true, "credit": "Yapay zekâ ile üretilmiş temsili görüntü: Higgsfield (<model adı>)", "rate": 0.6–1.0}`. Sadece atmosfer/hikâye anları için; sayı, ölçek ve mekanizma anlatan sahneler kodla çizilir. `"ai": true` olan videolar YouTube'a "sentetik içerik" beyanıyla yüklenir (`upload.py`). Shorts'ta kullanma. Sonunda klipleri `show_generation_by_ids` ile kanal sahibine göster (bu ortamda klipler görülemiyor, önizlemede yer tutucu çıkar).
   - **Maskot** (kanal logosundaki soru işaretli ampul): sahneye `"mascot": "explain|think|shock|happy|point|sad"` ya da `{"pose": "shock", "size": "big", "side": "left", "dir": "left"}`. Ağzı anlatımla birlikte oynar. Her Shorts'ta 2–4 sahnede kullan (soru, şaşırtıcı bilgi, kapanış); 3D etiketlerin olduğu sahnelerde sağ üstü boş bırak.
   - **Paletler** (`"art": {"palette": ...}` ya da `{"palette": "lab", "colors": {"accent": "#ff7eb3"}}`): `space`, `magma`, `ocean`, `sunset`, `candy`, `forest`, `lab`, `ice`, `desert`, `noir`. Konuya göre seç (flamingo → `candy`, okyanus → `ocean`, volkan → `magma`); tek bir videoda 2–4 palet arasında gezin.
   - **Geçişler:** otomatik (`zoom`, `whip`, `flash`, aynı 3D dünyada `match`). Elle: sahneye `"transition": "zoom|whip|flash|cut"`.
   - **Çeşitlilik kuralı (zorunlu):** bir Shorts'ta en az **4 farklı sahne tipi**; aynı tip **üst üste en fazla 3 sahne** (sadece 3D dünyada kamera yolculuğu yaparken; 2D'de en fazla 2); tek bir tip toplamın %60'ını geçmesin. Her videoda en az bir 3D sahne ya da gerçek görüntü olsun.
   - **Yeni sahne tipi** (konuya özgü görsel gerekiyorsa — tercih edilen yol 3D'dir): `SHOTS.<ad> = {kind: '3d'|'2d', build(ctx) { ... return {update(lt, dur, cues, env)} }}`. 3D: `ctx.scene`, `ctx.camera`, `ctx.labels.add('layer'|'counter')`, yardımcılar `shotCam`, `applyCam`, `glowSprite`, `starfield`, `GLSL_NOISE` (simplex/fbm). 2D: `ctx.svg`, `ctx.defs`, `backdrop()`, `svgText()`. Renkler `ctx.pal` (`accent`, `accent2`, `glow`, `ink`, `bg`). Her şey `lt`'nin saf fonksiyonu olsun. Genel ve parametrik yaz; mevcut tipleri bozma.
   - **Kalite (zorunlu):** her sahnede sürekli hareket (kamera süzülmesi, akış, parıltı, sayaç), girişlerde `spring()`, vurgu anlarında `punch(lt, cue)`. Cue'ları gerçekten dramatik kelimelere bağla. Altyazıda cue kelimeleri palet rengiyle yanar. Önemli görsel ayrıntıyı altyazı bandına (dikey ekranda y ≈ 1170–1320) ve en alttaki YouTube arayüzüne (y > 1500) koyma; sol üst kicker'a, sağ üst maskota ayrılmıştır.
7. **Kapak (thumbnail)** — her dosyada `cover` bloğu zorunlu. Kapak tıklanma oranını belirler; en çok özen gösterilecek kısım budur.
   ```json
   "cover": {"lines": ["Bu pencere", "uçak düşürdü"], "highlight": ["pencere"],
             "scene": 6, "t": 9.5, "mark": {"x": 310, "y": 160, "r": 70}}
   ```
   - `lines`: 2–4 satır, toplam **3–5 kelime**, büyük harfle basılır. Başlığı tekrar etme; merakı patlatan kısa bir iddia ya da şok cümlesi olsun ("BU PENCERE UÇAK DÜŞÜRDÜ", "BEYNİN SENİ KANDIRIYOR", "3.000 UÇUŞTA ÇATLADI"). Soru cümlesi yerine iddia çoğu zaman daha güçlüdür.
   - `highlight`: amber kutu içinde vurgulanacak **tek** anahtar kelime (en kritik nesne/sayı).
   - `scene` + `t`: illüstrasyonun en dramatik, en dolu anı (çatlak çizilmiş, kırmızı çizgiler sıkışmış, sayaç dolmuş, parçalar ayrılmış). Boş ya da yarım çizilmiş kare seçme.
   - Uzun video kapağı 1280×720: solda dev yazı, sağda büyütülmüş sahne. Shorts kapağı 1080×1920: üstte dev yazı, altında tam ekran sahne (aynı kare Shorts'un ilk saniyelerinde kanca olarak oynar).
   - `tools/preview.py` kapağı `out/preview/<slug>/cover.jpg` olarak üretir; **mutlaka açıp bak**: yazı küçük ekranda okunuyor mu, yazı görsele biniyor mu, halka doğru noktada mı, görsel dolu ve dramatik mi. Gerekirse `scene`, `t`, `mark` ve metni değiştirip tekrar üret.
8. **YouTube SEO** — her dosyaya `youtube` bloğu:
   ```json
   "youtube": {
     "title": "Uçak Pencereleri Neden Kare Değil? ✈️",
     "description": "...",
     "tags": ["..."],
     "category_id": "27",
     "publish_at": "2026-10-16T13:00:00+03:00"
   }
   ```
   - **Başlık:** ana anahtar kelime başta (insanların gerçekten arayacağı ifade: "uçak pencereleri neden yuvarlak"), merak boşluğu bırakan soru ya da iddia. Shorts ≤ 60, uzun ≤ 70 karakter. Türkçe karakterler doğru, BÜYÜK HARF spam yok, en fazla 1 emoji, yanıltıcı clickbait yok (videonun cevabı başlığın vaadini karşılamalı).
   - **Açıklama:** ilk 150 karakter (aramada görünen kısım) ana anahtar kelimeyi ve kancayı içersin. Sonra 2–4 cümlelik özet; 2–3 yan anahtar kelimeyi doğal geçir. Uzun videoda bir boş satırdan sonra "Bu videoda:" ile 3–5 madde. Sonra abone çağrısı + yoruma çağıran soru ("Her gün yeni bir 'neden?' için abone ol. Sence ...? Yorumlara yaz!"). En sonda 3–5 hashtag (ilk üçü başlığın üstünde görünür): Shorts'ta ilk hashtag `#shorts`, sonra konu hashtag'leri ve `#düşünbakalım`. Bölümler (chapters) uzun videoda otomatik eklenir; elle yazma.
   - **Etiketler:** 12–18 etiket, toplam ≤ 450 karakter: ana anahtar kelime, 3–5 varyasyonu (eş anlamlı, soru biçimi), konu/kişi/olay adları, genel kategori ("bilim", "tarih", "ilginç bilgiler"), `düşün bakalım`.
   - `category_id`: "27" (Eğitim). `publish_at`: `tools/plan.py` çıktısındaki değer (geçmiş saatleri zaten ertesi güne kaydırır).
9. **Kontrol:** `pip install -r requirements.txt` (gerekirse), sonra `python tools/lint.py videos/<tarih>/*.json` (hata kalmayana kadar) ve her dosya için `python tools/preview.py videos/<tarih>/<dosya>.json`. `STATIC?` işaretli sahneyi hareketlendir. `sheet.png` ve `cover.jpg` dosyalarını oku ve kontrol et: taşan/üst üste binen yazı, ekran dışına taşan 3D nesne/etiket, boş ya da karanlık kare, altyazının arkasında kalan önemli detay, eşleşmeyen cue uyarısı, karakter bütçesi. Sorunları düzelt ve tekrar kontrol et. Ardından eleştiri döngüsü (`docs/REVIEW.md`, aşağıdaki *Üretim akışı*).
10. **Gönder:** Push'tan hemen önce `tools/lint.py` son kez hatasız geçmeli. Dosyaları (`media/` klasörü, `production.md` ve varsa `scenes/studio/` değişikliği dahil) tek commit'te `Daily batch YYYY-MM-DD` mesajıyla commit et ve doğrudan `claude/shorts-pipeline` dalına push et (varsayılan dal; yeni dal açma, PR açma). Push, `Daily batch` workflow'unu tetikler (render + kapak + YouTube'a zamanlanmış yükleme).
11. **Rapor:** Konuyu, başlığı, kapak metnini, karakter sayısını, yayın saatini ve son tur eleştiri puanlarını kısaca özetle; bir sonraki uzun video tarihini yaz.

## Komutlar

```bash
python build.py script.json                  # tam render (ELEVENLABS_API_KEY gerekli)
python build.py script.json --scenes 3       # ilk 3 sahne
python build.py script.json --still 12.5     # tek kare
python build.py videos/<tarih>/<dosya>.json --no-tts -o out/draft.mp4   # sessiz taslak video (tahmini zamanlama)
# parçalı render (Actions bunu kullanır; üç adımda da aynı -o):
python build.py <dosya>.json -o out/x.mp4 --prepare   # TTS + zaman çizelgesi + medya -> out/x.prepared.json
python build.py <dosya>.json -o out/x.mp4 --shard 2/5 # 5 parçanın 2.'si -> out/x.parts/
python build.py <dosya>.json -o out/x.mp4 --finish    # birleştir + ses + kapak -> out/x.mp4
python tools/plan.py                                  # bugünün planı (dosyalar, saatler, bütçe)
python tools/lint.py videos/<tarih>/*.json             # kural denetimi
python tools/preview.py videos/<tarih>/<dosya>.json   # TTS'siz görsel kontrol
python tools/preview.py <dosya>.json --times 3,12.5    # belirli anlar
python tools/media.py search "flamingo flock" --dir videos/<tarih>/media   # telifsiz görsel ara
```

Playwright Chromium'u bulamazsa `CHROMIUM_PATH=/opt/pw-browsers/chromium` ver. 3D sahneler başsız Chromium'da yazılım WebGL (SwiftShader, ekran kartı yok) ile çizilir. **Performans kuralı:** shader'da kare başına piksel piksel `fbm`/`snoise` hesaplama — desenleri `bake()` / `surfaceMaps()` / `noiseMap()` ile açılışta bir kez dokuya pişir, karede sadece `texture2D` oku. Tarayıcıda `mix-blend-mode`, büyük `filter: blur` ve tam ekran yarı saydam katmanlardan kaçın (gren yok). Studio 1080p/30 fps çizer, ffmpeg 1440p'ye büyütür; render tüm CPU çekirdeklerine bölünür (`RENDER_WORKERS`). Actions'ta bir video ayrıca ~40 sn'lik parçalara bölünüp (en çok 8) ayrı işlerde render edilir. Video kareleri Chromium'un yazılım compositor'ıyla çizilir ve CDP ile yakalanır (kapak eski yolla); eski yola dönmek için `RENDER_COMPOSITOR=gpu`, `RENDER_CAPTURE=screenshot`.
