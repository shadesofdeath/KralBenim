# Düşün Bakalım — video otomasyonu

YouTube kanalı **Düşün Bakalım** için Türkçe anlatım videoları üreten pipeline.
Her gün **1 Shorts**, pazar günleri ek olarak **1 uzun video** üretilir, GitHub Actions'ta render edilip YouTube'a zamanlanmış olarak yüklenir.

## Yapı

- `build.py` — `script.json -> mp4`. ElevenLabs ile seslendirir (kelime zamanlamalı), `scenes/index.html` sahnelerini Playwright ile kare kare çeker, ffmpeg ile birleştirir.
- `scenes/index.html` — tüm sahne tipleri (`BUILD` nesnesi). Zaman tamamen `window.seek(t)` ile kontrol edilir; her şey deterministik olmalı (Math.random yok, `rng(seed)` kullan).
- `script.json` — örnek senaryo ve referans kalite seviyesi (Comet / uçak pencereleri).
- `videos/YYYY-MM-DD/*.json` — günlük senaryolar. Push edilince `.github/workflows/daily.yml` render + yükleme yapar, sonucu `*.youtube.json` olarak geri commit eder.
- `tools/preview.py` — TTS olmadan görsel kontrol (tahmini zamanlama ile kontak sayfası).
- `tools/upload.py` — YouTube yüklemesi (Actions'ta çalışır, `YOUTUBE_TOKEN_JSON` secret'ı).

Bu bulut ortamından ElevenLabs ve YouTube'a erişim yok; ses ve yükleme sadece GitHub Actions'ta çalışır. Yerel kontrol için `tools/preview.py` kullan.

## Günlük üretim görevi

Zamanlanmış görev her sabah bu bölümü uygular.

**Plan (ElevenLabs bütçesi ayda ~60 bin karakter):** her gün **1 Shorts**; **pazar günleri ek olarak 1 uzun video**. Bu planın dışına çıkma, fazladan video üretme.

| | Süre | Karakter (anlatım metni toplamı) | Yayın |
|---|---|---|---|
| Shorts | 55–60 sn | **800–900** (sert sınır 950) | her gün 18:00 (+03:00) |
| Uzun video (sadece pazar) | 5–6 dk | **4.300–5.000** (sert sınır 5.200) | pazar 20:00 (+03:00) |

1. **Tarih:** Bugünün tarihi (Europe/Istanbul). Klasör: `videos/YYYY-MM-DD/`. Klasör zaten varsa hiçbir şey yapma, dur.
2. **Geçmiş:** `videos/*/` altındaki tüm senaryoların `youtube.title` ve konularını oku; aynı ya da çok benzer konuyu tekrar seçme. Dünün `*.youtube.json` dosyalarını kontrol et; yüklenmemiş video varsa raporla.
3. **Konu:** Kanala uygun, aranan ve merak uyandıran bir soru seç ("Neden...?", "Nasıl...?", "Ne olurdu...?"). Kategorileri günden güne değiştir: gündelik tasarımların hikâyesi, bilim, insan vücudu, tarih, hayvanlar, uzay, mühendislik, psikoloji. Uzun video: birden fazla perdesi olan, hikâyesi güçlü daha derin bir konu.
4. **Doğruluk:** Sadece emin olduğun, iyi bilinen bilgileri kullan. Web araması varsa tarih ve sayıları doğrula. Emin olmadığın sayıyı yazma; "yaklaşık" de ya da çıkar. Yaygın ama yanlış efsaneleri anlatma.
5. **Senaryo** — dosyalar: `01-<slug>.json` (Shorts) ve pazar günleri `02-<slug>.json` (uzun video).
   - Shorts: `"format": "short"`, `"fps": 60`, 7–10 sahne. Uzun: `"format": "long"`, `"fps": 30`, 35–45 sahne, her 5–8 sahnede bir `"chapter": "Bölüm adı"` (ilk sahnede mutlaka; YouTube bölümleri otomatik oluşur).
   - `channel`, `subtitles`, `tts` alanlarını `script.json`'dan aynen kopyala.
     Ses her zaman ElevenLabs `voice_id: BwhlzGpUiZ9uHtfvCl1H` (kanal sahibinin seçtiği ses), model `eleven_v3`. Sesi veya modeli asla değiştirme.
   - **Karakter bütçesine uy** (tablo). `tools/preview.py` çıktısındaki `chars` değerini kontrol et; sınırı aşıyorsa metni kısalt.
   - Anlatım: ilk cümle kanca (ilk 2 saniyede merak — soru ya da şaşırtıcı iddia), sonra hikâye (kişiler, yer, tarih, gerilim), sonra açıklama (mekanizma, basitçe), sonra dönüş ("yani..."), sonda yoruma çağıran tek bir soru. Sade, konuşma dili, kısa cümleler. "km/sa" gibi kısaltmaları açık yaz.
   - Her sahne 1–3 cümle. `title.white` 1–2 kelime, `title.gray` en fazla ~4 kelime (Shorts'ta en fazla 3 satır). 1–3 `tags`.
   - `cues`: sahnenin metninde geçen bir kelimenin parçası (büyük/küçük harf duyarsız, ilk eşleşme). Animasyonun vurgusunu o kelimeye bağla; erken bir kelimeyle yanlışlıkla eşleşmediğinden emin ol.
6. **Görseller:** Mevcut sahne tiplerini kullan (`window_compare`, `plane`, `plane_breakup`, `timeline`, `pressure_cycle`, `water_tank`, `stress_flow`, `stress_corner`, `window_glow`, `stat`, `list`, `question`). Konuya özgü görsel gerekiyorsa `scenes/index.html` içine yeni bir sahne tipi ekle:
   - Stil: koyu kart üzerinde ince çizgi SVG (viewBox 920×680), beyaz/gri çizgiler, tek vurgu amber `#d9a441`, tehlike/hata için kırmızı `#e5484d`. Çizimler `draw()` ile çizilerek gelsin, her sahnede sürekli bir hareket olsun (akış, nefes alma, sayaç, süzülme). Easing: `prog()`.
   - Yeni tipleri olabildiğince genel ve parametrik yaz (başka konularda da kullanılabilsin). Mevcut tipleri bozma.
7. **Kapak (thumbnail)** — her dosyada `cover` bloğu zorunlu. Kapak tıklanma oranını belirler; en çok özen gösterilecek kısım budur.
   ```json
   "cover": {"lines": ["Bu pencere", "uçak düşürdü"], "highlight": ["pencere"],
             "scene": 6, "t": 9.5, "mark": {"x": 310, "y": 160, "r": 70}}
   ```
   - `lines`: 2–4 satır, toplam **3–5 kelime**, büyük harfle basılır. Başlığı tekrar etme; merakı patlatan kısa bir iddia ya da şok cümlesi olsun ("BU PENCERE UÇAK DÜŞÜRDÜ", "BEYNİN SENİ KANDIRIYOR", "3.000 UÇUŞTA ÇATLADI"). Soru cümlesi yerine iddia çoğu zaman daha güçlüdür.
   - `highlight`: amber kutu içinde vurgulanacak **tek** anahtar kelime (en kritik nesne/sayı).
   - `scene` + `t`: illüstrasyonun en dramatik, en dolu anı (çatlak çizilmiş, kırmızı çizgiler sıkışmış, sayaç dolmuş, parçalar ayrılmış). Boş ya da yarım çizilmiş kare seçme.
   - `mark` (uzun videoda zorunlu, Shorts'ta yok sayılır): kırmızı halka + ok ile işaretlenecek nokta, sahnenin SVG koordinatlarında (viewBox 920×680) `x`, `y`, `r`. Hikâyenin kilit detayını göstersin (çatlağın başladığı köşe, kritik parça).
   - Uzun video kapağı 1280×720: solda dev yazı, sağda kenardan taşan büyütülmüş illüstrasyon. Shorts kapağı 1080×1920.
   - `tools/preview.py` kapağı `out/preview/<slug>/cover.jpg` olarak üretir; **mutlaka açıp bak**: yazı küçük ekranda okunuyor mu, yazı görsele biniyor mu, halka doğru noktada mı, görsel dolu ve dramatik mi. Gerekirse `scene`, `t`, `mark` ve metni değiştirip tekrar üret.
8. **YouTube SEO** — her dosyaya `youtube` bloğu:
   ```json
   "youtube": {
     "title": "Uçak Pencereleri Neden Kare Değil? ✈️",
     "description": "...",
     "tags": ["..."],
     "category_id": "27",
     "publish_at": "2026-10-16T18:00:00+03:00"
   }
   ```
   - **Başlık:** ana anahtar kelime başta (insanların gerçekten arayacağı ifade: "uçak pencereleri neden yuvarlak"), merak boşluğu bırakan soru ya da iddia. Shorts ≤ 60, uzun ≤ 70 karakter. Türkçe karakterler doğru, BÜYÜK HARF spam yok, en fazla 1 emoji, yanıltıcı clickbait yok (videonun cevabı başlığın vaadini karşılamalı).
   - **Açıklama:** ilk 150 karakter (aramada görünen kısım) ana anahtar kelimeyi ve kancayı içersin. Sonra 2–4 cümlelik özet; 2–3 yan anahtar kelimeyi doğal geçir. Uzun videoda bir boş satırdan sonra "Bu videoda:" ile 3–5 madde. Sonra abone çağrısı tek satır ("Her gün yeni bir 'neden?' için abone ol."). En sonda 3–5 hashtag (ilk üçü başlığın üstünde görünür): Shorts'ta ilk hashtag `#shorts`, sonra konu hashtag'leri ve `#düşünbakalım`. Bölümler (chapters) uzun videoda otomatik eklenir; elle yazma.
   - **Etiketler:** 12–18 etiket, toplam ≤ 450 karakter: ana anahtar kelime, 3–5 varyasyonu (eş anlamlı, soru biçimi), konu/kişi/olay adları, genel kategori ("bilim", "tarih", "ilginç bilgiler"), `düşün bakalım`.
   - `category_id`: "27" (Eğitim). `publish_at`: tablodaki saat. Render ~1 saat sürer: şu andan en az 2 saat sonrası değilse ertesi güne kaydır.
9. **Kontrol:** `pip install -r requirements.txt` (gerekirse), sonra her dosya için `python tools/preview.py videos/<tarih>/<dosya>.json`. `sheet.png` ve `cover.jpg` dosyalarını oku ve kontrol et: taşan/üst üste binen yazı, boş kart, eşleşmeyen cue uyarısı, okunamayan küçük metin, karakter bütçesi. Sorunları düzelt ve tekrar kontrol et.
10. **Gönder:** Dosyaları (ve varsa `scenes/index.html` değişikliğini) tek commit'te `Daily batch YYYY-MM-DD` mesajıyla commit et ve doğrudan `claude/shorts-pipeline` dalına push et (varsayılan dal; yeni dal açma, PR açma). Push, `Daily batch` workflow'unu tetikler (render + kapak + YouTube'a zamanlanmış yükleme).
11. **Rapor:** Konuyu, başlığı, kapak metnini, karakter sayısını ve yayın saatini kısaca özetle.

## Komutlar

```bash
python build.py script.json                  # tam render (ELEVENLABS_API_KEY gerekli)
python build.py script.json --scenes 3       # ilk 3 sahne
python build.py script.json --still 12.5     # tek kare
python tools/preview.py videos/<tarih>/<dosya>.json   # TTS'siz görsel kontrol
```

Playwright Chromium'u bulamazsa `CHROMIUM_PATH=/opt/pw-browsers/chromium` ver.
