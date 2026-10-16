# Düşün Bakalım — video otomasyonu

YouTube kanalı **Düşün Bakalım** için Türkçe anlatım videoları üreten pipeline.
Her gün **3 Shorts**, pazar günleri ek olarak **1 uzun video** üretilir, GitHub Actions'ta render edilip YouTube'a zamanlanmış olarak yüklenir.

## Yapı

- `build.py` — `script.json -> mp4`. ElevenLabs ile seslendirir (kelime zamanlamalı), sahneleri Playwright ile kare kare çeker (CPU sayısı kadar paralel tarayıcı), ffmpeg ile birleştirir.
- **`scenes/studio/` — Studio motoru (yeni videoların hepsi bununla, `"engine": "studio"`).** Tam ekran sahneler: Three.js 3D (`shots3d.js`), tam ekran 2D SVG (`shots2d.js`), gerçek fotoğraf/video (`photo`), video başına renk paleti (`"art"`), maskot (`mascot.js`), kelime kelime altyazı, film greni, bloom, sahne geçişleri ve aynı 3D dünyada kesintisiz kamera (`engine.js`). Zaman tamamen `window.seek(t)` ile kontrol edilir; her şey deterministik (Math.random yok, `rng(seed)` kullan).
- `scenes/index.html` — eski "klasik" motor (kart tasarımı). Sadece eski senaryoları yeniden render etmek için; yeni videoda kullanma.
- `examples/dunyanin-merkezi.json` — **Studio referans senaryosu ve kalite seviyesi** (3D kesitli Dünya, kesintisiz kamera, maskot, dev yazı, ölçek çubuğu, atom kafesi).
- `script.json` — klasik motorun eski örneği (Comet / uçak pencereleri).
- `videos/YYYY-MM-DD/*.json` — günlük senaryolar. Push edilince `.github/workflows/daily.yml` render + yükleme yapar, sonucu `*.youtube.json` olarak geri commit eder.
- `tools/preview.py` — TTS olmadan görsel kontrol (tahmini zamanlama ile kontak sayfası).
- `tools/upload.py` — YouTube yüklemesi (Actions'ta çalışır, `YOUTUBE_TOKEN_JSON` secret'ı). Fotoğraf/video kredilerini (`params.credit`) açıklamaya otomatik ekler.
- `tools/media.py` — telifsiz fotoğraf/video bulur ve indirir (Wikimedia Commons; `PEXELS_API_KEY` varsa Pexels foto + video).

Ses: anlatım + altında çok hafif ambiyans müziği (`tools/sfx.py`, kodla üretilir). **Efekt sesi (whoosh, pop, vuruş) yok — kanal sahibi istemiyor, geri ekleme.** Müziği de kapatmak için senaryoya `"sfx": false`.

Bu bulut ortamından ElevenLabs ve YouTube'a erişim yok; ses ve yükleme sadece GitHub Actions'ta çalışır. Yerel kontrol için `tools/preview.py` kullan.

## Günlük üretim görevi

Zamanlanmış görev her sabah bu bölümü uygular.

**Plan (ElevenLabs bütçesi ayda ~60 bin karakter):** her gün **3 Shorts**; **pazar günleri ek olarak 1 uzun video**. Bu planın dışına çıkma, fazladan video üretme. Bütçe sıkı: karakter sınırlarına kesinlikle uy.

| | Süre | Karakter (anlatım metni toplamı) | Yayın |
|---|---|---|---|
| Shorts ×3 | 28–35 sn | **400–500** (sert sınır 550) | her gün 11:00, 15:00 ve 19:00 (+03:00) |
| Uzun video (sadece pazar) | ~4 dk | **3.400–4.000** (sert sınır 4.300) | pazar 20:30 (+03:00) |

**Shorts'ta izlenmeyi belirleyen kurallar** (YouTube, ilk 1–2 saniyede kaydırılan videoyu akışa açmaz):
- **İlk kare dolu olmalı.** Shorts otomatik olarak `cover` bloğuyla açılır: ilk cümle bitene kadar kapaktaki dev yazı + dramatik görsel ekranda durur. Bu yüzden **ilk cümle kısa (3–7 kelime) ve kapak yazısıyla aynı fikirde** olmalı ("Bisküvilerdeki bu delikler süs değil." ↔ kapak "BU DELİKLER SÜS DEĞİL").
- **Hızlı tempo:** her sahne tek cümle, 2–4 saniye; 8–11 sahne. Uzun cümleleri böl.
- **Net kapanış (döngü yok):** son cümle **tam ve kendi başına anlamlı** olsun; videoyu bağlayan, akılda kalan bir sonuç/punchline ("Yani ayağının altında, erimeyi reddeden bir demir güneş var."). Cümleyi yarım bırakıp videonun başına bağlama — kanal sahibi "sonsuz video" etkisini istemiyor. Ayrı bir soru/"yorumlara yazın" sahnesi koyma; yorum sorusu açıklamaya yazılır.
- Hiç dolgu cümle yok; her cümle ya yeni bir bilgi ya da gerilim eklesin.

1. **Tarih:** Bugünün tarihi (Europe/Istanbul). Klasör: `videos/YYYY-MM-DD/`. Klasör zaten varsa hiçbir şey yapma, dur.
2. **Geçmiş:** `videos/*/` altındaki tüm senaryoların `youtube.title` ve konularını oku; aynı ya da çok benzer konuyu tekrar seçme. Dünün `*.youtube.json` dosyalarını kontrol et; yüklenmemiş video varsa raporla.
3. **Konu:** Kanala uygun, aranan ve merak uyandıran bir soru seç ("Neden...?", "Nasıl...?", "Ne olurdu...?"). Kategorileri günden güne değiştir: gündelik tasarımların hikâyesi, bilim, insan vücudu, tarih, hayvanlar, uzay, mühendislik, psikoloji. Uzun video: birden fazla perdesi olan, hikâyesi güçlü daha derin bir konu.
4. **Doğruluk:** Sadece emin olduğun, iyi bilinen bilgileri kullan. Web araması varsa tarih ve sayıları doğrula. Emin olmadığın sayıyı yazma; "yaklaşık" de ya da çıkar. Yaygın ama yanlış efsaneleri anlatma.
5. **Senaryo** — dosyalar: `01-<slug>.json`, `02-<slug>.json`, `03-<slug>.json` (Shorts, üçü de farklı kategorilerden), pazar günleri ayrıca `04-<slug>.json` (uzun video).
   - **Motor:** her dosyada `"engine": "studio"` ve video için bir renk paleti `"art": {"palette": "space"}` (bkz. 6). Sahne bazında `"art"` ile palet değiştirilebilir (renk geçişi yumuşak olur).
   - **Storyboard (zorunlu):** her sahneye `"visual": "ekranda tam olarak ne görünüyor"` cümlesini yaz. Seçtiğin sahne tipi bu cümleyi **birebir** göstermeli; anlatılan şeyle ilgisiz ya da "yaklaşık" bir görsel kullanma. Uygun tip yoksa konuya özel yeni bir sahne tipi kodla (bkz. 6).
   - Shorts: `"format": "short"`, `"fps": 30`, 8–11 sahne, sahne başına tek cümle. Uzun: `"format": "long"`, `"fps": 30`, 35–45 sahne, her 5–8 sahnede bir `"chapter": "Bölüm adı"` (ilk sahnede mutlaka; YouTube bölümleri otomatik oluşur).
   - `channel`, `subtitles`, `tts` alanlarını `script.json`'dan aynen kopyala.
     Ses her zaman ElevenLabs `voice_id: BwhlzGpUiZ9uHtfvCl1H` (kanal sahibinin seçtiği ses), model `eleven_v3`. Sesi veya modeli asla değiştirme.
   - **Karakter bütçesine uy** (tablo). `tools/preview.py` çıktısındaki `chars` değerini kontrol et; sınırı aşıyorsa metni kısalt.
   - Anlatım (Shorts): kanca iddiası → neden (mekanizma, basitçe) → şaşırtıcı detay → net kapanış cümlesi. Uzun video: kanca, hikâye (kişiler, yer, tarih, gerilim), açıklama, dönüş ("yani..."), sonda yoruma çağıran tek bir soru. Sade, konuşma dili, kısa cümleler. "km/sa" gibi kısaltmaları açık yaz.
   - Her sahne 1–3 cümle. `title` sol üstte küçük bir "kicker" etiketi olarak görünür: `title.white` 1–2 kelime, `title.gray` en fazla ~3 kelime; dev yazı sahnesinde boş bırak (`{}`). `tags` studio'da gösterilmez.
   - `cues`: sahnenin metninde geçen bir kelimenin parçası (büyük/küçük harf duyarsız, ilk eşleşme). Animasyonun vurgusunu o kelimeye bağla; erken bir kelimeyle yanlışlıkla eşleşmediğinden emin ol.
6. **Görseller (Studio motoru):** ekran bir "kart" değil, **tam ekran bir sahne**dir. Her video konuya uygun bir renk dünyası, sinematik ışık ve hareket taşır. Sahne tipleri (`params` alanları):
   - **3D** (`scenes/studio/shots3d.js`, Three.js r159 — `THREE` global):
     - `planet` — 3D gezegen, istenirse kesitli: `{"preset": "earth|moon|mars|sun", "cut": true, "highlight": "inner|outer|mantle|crust", "labels": [{"layer": "mantle", "text": "MANTO", "sub": "~2.900 km", "at": "hit", "angle": 60, "dx": -250, "dy": -150}], "drill": {"to": 6400, "unit": "km", "round": 10}, "layers": [...özel katmanlar], "spin": 0.1, "camera": {...}}`. Cue: `hit` (vurgu), `drill`.
     - `orbs` — 1–3 küre yan yana + sayaçlar (sıcaklık/boyut/kütle karşılaştırması): `{"items": [{"label", "value": "5.500", "prefix": "~", "suffix": "+", "unit": "°C", "material": "sun|core|earth|moon|mars|metal|rock|ice|lava", "size": 1}]}`. Cue: `o0`, `o1` (giriş), `v0`, `v1` (sayaç).
     - `lattice` — 3D atom/molekül kafesi: `{"mode": "squeeze|heat|melt", "hot": 0.8, "n": 5, "counter": {"to": "3.000.000", "suffix": "+", "label": "..."}}`. Cue: `hit`, `count`.
     - **Kamera:** `"camera": {"dist", "yaw", "pitch", "tx", "ty", "tz", "fov", "drift"}` (derece). **Aynı 3D tipin art arda sahneleri tek bir dünyada kesintisiz kamera hareketiyle bağlanır** (match cut): kamera önceki sahnenin bittiği yerden yenisine süzülür. Bunu hikâyeyi "içeri doğru yolculuk" gibi anlatmak için kullan (uzaktan → katmana → çekirdeğe). Dikey ekranda tüm gezegen için `dist` ≈ 6.5; yakın plan 2–4.
   - **2D tam ekran** (`scenes/studio/shots2d.js`, SVG viewBox = ekran boyutu 1080×1920 / 1920×1080):
     - `headline` — dev kinetik yazı (Anton): `{"lines": ["Peki neden", "erimiyor?"], "highlight": ["erimiyor?"], "sub": "küçük not", "count": {"to": "3.000.000", "suffix": "+"}}`. Cue: `w0`, `w1`… (kelimeler tek tek çarpar), `count` (sayaç).
     - `scale_bar` — "bu, şunun yanında minicik": `{"total": "6.400", "part": "12", "unit": "km", "step": "1.000", "top_label", "total_label", "part_label"}`. Cue: `total`, `part` (büyüteç açılır).
     - `bars` — animasyonlu karşılaştırma çubukları: `{"items": [{"label", "value", "unit"}], "highlight": 1}`. Cue: `b0`, `b1`…
     - `compare` — tam ekran ikiye bölünmüş karşılaştırma: `{"left": {"title", "value", "icon", "mark": "x|check", "color": "red|green|accent"}, "right": {...}}`. Cue: `left`, `right`.
     - `photo` — **gerçek fotoğraf ya da video klip**, Ken Burns hareketi, renk düzeltme ve üstüne çizilen işaretler: `{"src": "media/flamingo.jpg"}` ya da `{"video": "media/surf.mp4", "from": 2.0, "rate": 0.5}`, `"kb": {"from": [1.0, 0.5, 0.5], "to": [1.15, 0.55, 0.45]}`, `"grade": "cinematic|natural|mono|duotone"`, `"credit": "..."`, `"marks": [{"type": "circle|arrow|box", "x": 0.42, "y": 0.31, "r": 0.06, "text": "Gaga", "at": "hit"}]` (x, y görüntünün 0–1 koordinatı). Yol senaryo dosyasına göredir (`videos/<tarih>/media/`).
   - **Gerçek görüntü (mümkünse her Shorts'ta 1–3 sahne):** `python tools/media.py search "<İngilizce sorgu>" --dir videos/<tarih>/media` → `candidates.jpg` dosyasını **aç ve bak**, sahnenin `visual` cümlesini birebir gösteren görseli seç → `python tools/media.py get <no> --dir videos/<tarih>/media --name <ad>` → `params.src` + `params.credit` (aracın yazdığı kredi satırı). Sadece telifsiz/özgür lisanslı kaynak kullan (araç zaten filtreler). Ağ erişimi yoksa (Wikimedia engelliyse) fotoğrafsız devam et ve raporda belirt.
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
   - `category_id`: "27" (Eğitim). `publish_at`: tablodaki saat. Render ~15 dk sürer: şu andan en az 1 saat sonrası değilse ertesi güne kaydır.
9. **Kontrol:** `pip install -r requirements.txt` (gerekirse), sonra her dosya için `python tools/preview.py videos/<tarih>/<dosya>.json`. `sheet.png` ve `cover.jpg` dosyalarını oku ve kontrol et: taşan/üst üste binen yazı, ekran dışına taşan 3D nesne/etiket, boş ya da karanlık kare, altyazının arkasında kalan önemli detay, eşleşmeyen cue uyarısı, karakter bütçesi. Sorunları düzelt ve tekrar kontrol et.
10. **Gönder:** Dosyaları (`media/` klasörü ve varsa `scenes/studio/` değişikliği dahil) tek commit'te `Daily batch YYYY-MM-DD` mesajıyla commit et ve doğrudan `claude/shorts-pipeline` dalına push et (varsayılan dal; yeni dal açma, PR açma). Push, `Daily batch` workflow'unu tetikler (render + kapak + YouTube'a zamanlanmış yükleme).
11. **Rapor:** Konuyu, başlığı, kapak metnini, karakter sayısını ve yayın saatini kısaca özetle.

## Komutlar

```bash
python build.py script.json                  # tam render (ELEVENLABS_API_KEY gerekli)
python build.py script.json --scenes 3       # ilk 3 sahne
python build.py script.json --still 12.5     # tek kare
python build.py videos/<tarih>/<dosya>.json --no-tts -o out/draft.mp4   # sessiz taslak video (tahmini zamanlama)
python tools/preview.py videos/<tarih>/<dosya>.json   # TTS'siz görsel kontrol
python tools/preview.py <dosya>.json --times 3,12.5    # belirli anlar
python tools/media.py search "flamingo flock" --dir videos/<tarih>/media   # telifsiz görsel ara
```

Playwright Chromium'u bulamazsa `CHROMIUM_PATH=/opt/pw-browsers/chromium` ver. 3D sahneler başsız Chromium'da yazılım WebGL (SwiftShader, ekran kartı yok) ile çizilir. **Performans kuralı:** shader'da kare başına piksel piksel `fbm`/`snoise` hesaplama — desenleri `bake()` / `surfaceMaps()` / `noiseMap()` ile açılışta bir kez dokuya pişir, karede sadece `texture2D` oku. Tarayıcıda `mix-blend-mode`, büyük `filter: blur` ve tam ekran yarı saydam katmanlardan kaçın (gren yok). Studio 1080p/30 fps çizer, ffmpeg 1440p'ye büyütür; render tüm CPU çekirdeklerine bölünür (`RENDER_WORKERS`).
