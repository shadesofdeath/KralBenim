# Düşün Bakalım — video otomasyonu

YouTube kanalı **Düşün Bakalım** için Türkçe anlatım videoları üreten pipeline.
Her gün **4 Shorts + 1 uzun video** üretilir, GitHub Actions'ta render edilip YouTube'a zamanlanmış olarak yüklenir.

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

1. **Tarih:** Bugünün tarihi (Europe/Istanbul). Klasör: `videos/YYYY-MM-DD/`. Klasör zaten doluysa hiçbir şey yapma, dur.
2. **Geçmiş:** `videos/*/` altındaki tüm senaryoların `youtube.title` ve konularını oku; aynı ya da çok benzer konuyu tekrar seçme. Dünün `*.youtube.json` dosyalarını kontrol et; yüklenmemiş video varsa raporla.
3. **Konular:** 5 konu seç — farklı kategorilerden (gündelik tasarımların hikâyesi, bilim, insan vücudu, tarih, hayvanlar, uzay, mühendislik, psikoloji). Her biri bir merak sorusu olsun ("Neden...?", "Nasıl...?"). Uzun video, bir hikâyesi ve birden fazla perdesi olan daha derin bir konu olsun.
4. **Doğruluk:** Sadece emin olduğun, iyi bilinen bilgileri kullan. Web araması varsa tarih ve sayıları doğrula. Emin olmadığın sayıyı yazma; "yaklaşık" de ya da çıkar. Yaygın ama yanlış efsaneleri anlatma.
5. **Senaryo yaz** — dosyalar:
   - `01-<slug>.json` … `04-<slug>.json`: Shorts. `"format": "short"`, `"fps": 60`, 75–100 sn (~180–240 kelime), 9–12 sahne.
   - `05-<slug>.json`: Uzun video. `"format": "long"`, `"fps": 30`, 5–6 dk (~750–850 kelime), 35–45 sahne.
   - `channel`, `subtitles`, `tts` alanlarını `script.json`'dan aynen kopyala.
   - Anlatım: ilk cümle kanca (ilk 2 saniyede merak), sonra hikâye (kişiler, yer, tarih, gerilim), sonra açıklama (mekanizma, basitçe), sonra dönüş ("yani..."), sonda yoruma çağıran bir soru. Sade, konuşma dili, kısa cümleler. Sayıları okunacağı gibi yazmak gerekmez ama "km/sa" gibi kısaltmaları açık yaz ("kilometre").
   - Her sahne 1–3 cümle. `title.white` 1–2 kelime, `title.gray` en fazla ~4 kelime (Shorts'ta en fazla 3 satır olmalı). 1–3 `tags`.
   - `cues`: sahnenin metninde geçen bir kelimenin parçası (büyük/küçük harf duyarsız, ilk eşleşme). Animasyonun vurgusunu o kelimeye bağla; erken bir kelimeyle yanlışlıkla eşleşmediğinden emin ol.
6. **Görseller:** Mevcut sahne tiplerini kullan (`window_compare`, `plane`, `plane_breakup`, `timeline`, `pressure_cycle`, `water_tank`, `stress_flow`, `stress_corner`, `window_glow`, `stat`, `list`, `question`). Konuya özgü görsel gerekiyorsa `scenes/index.html` içine yeni bir sahne tipi ekle:
   - Stil: koyu kart üzerinde ince çizgi SVG (viewBox 920×680), beyaz/gri çizgiler, tek vurgu amber `#d9a441`, tehlike/hata için kırmızı `#e5484d`. Çizimler `draw()` ile çizilerek gelsin, her sahnede sürekli bir hareket olsun (akış, nefes alma, sayaç, süzülme). Easing: `prog()`.
   - Yeni tipleri olabildiğince genel ve parametrik yaz (başka konularda da kullanılabilsin). Mevcut tipleri bozma.
7. **YouTube bilgileri:** Her dosyaya `youtube` bloğu ekle:
   ```json
   "youtube": {
     "title": "Uçak Pencereleri Neden Kare Değil?",
     "description": "2-3 cümlelik özet.\n\n#shorts #bilgi #düşünbakalım",
     "tags": ["uçak", "mühendislik", "tarih"],
     "category_id": "27",
     "publish_at": "2026-10-16T10:00:00+03:00"
   }
   ```
   - Başlık ≤ 70 karakter, merak uyandıran ama yanıltmayan. Shorts açıklamasında `#shorts` olsun; uzun videoda olmasın.
   - Yayın saatleri (bugün, +03:00): Shorts 10:00, 13:00, 17:00, 21:00; uzun video 19:00. Render ~1 saat sürer: şu andan en az 2 saat sonrası olmayan saatleri ertesi güne kaydır.
8. **Kontrol:** `pip install -r requirements.txt` (gerekirse), sonra her dosya için `python tools/preview.py videos/<tarih>/<dosya>.json`. Çıkan `out/preview/<slug>/sheet.png` dosyasını oku ve kontrol et: taşan/üst üste binen yazı, boş kart, eşleşmeyen cue uyarısı, okunamayan küçük metin. Sorunları düzelt ve tekrar kontrol et.
9. **Gönder:** 5 dosyayı (ve varsa `scenes/index.html` değişikliğini) tek commit'te `Daily batch YYYY-MM-DD` mesajıyla commit et ve doğrudan `claude/shorts-pipeline` dalına push et (varsayılan dal; yeni dal açma, PR açma). Push, `Daily batch` workflow'unu tetikler.
10. **Rapor:** Seçilen 5 konuyu, başlıkları ve yayın saatlerini kısaca özetle.

## Komutlar

```bash
python build.py script.json                  # tam render (ELEVENLABS_API_KEY gerekli)
python build.py script.json --scenes 3       # ilk 3 sahne
python build.py script.json --still 12.5     # tek kare
python tools/preview.py videos/<tarih>/<dosya>.json   # TTS'siz görsel kontrol
```

Playwright Chromium'u bulamazsa `CHROMIUM_PATH=/opt/pw-browsers/chromium` ver.
