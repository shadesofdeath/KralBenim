---
name: tarih-bolumu
description: Düşün Bakalım kanalı için tarih hikâyesi bölümü (Shorts ya da uzun video) planlarken ve senaryosunu yazarken kullan. Konu seçimi, hikâye yapısı, Kaşif karakterinin sahne sahne kullanımı, sepya parşömen stilinde sahne seçimi ve anlatım kuralları. Senaryo JSON'u yazmadan önce yükle.
---

# Tarih bölümü yazma becerisi

Önce `brand/kit/BRAND.md` dosyasını oku; bu beceri onun uygulamasıdır.

**Stickstory (eski Anlatayım Gel; global, İngilizce):** aynı yapı ve kurallar; metin, ekran yazıları ve kapak İngilizce
(BRAND.md §11), konu önce `python tools/news.py` manşetlerinden (kategoriye uyan manşetin arkasındaki gerçek hikâye; CLAUDE.md), uyan yoksa `tools/plan.py --channel ag` çıktısındaki `category`'den; "-yor"/devrik cümle kuralları
yerine İngilizce YouTuber anlatıcı kuralları geçerli. Bölüm kartı "CHAPTER" yazar.

## 1. Konu seçimi

İyi bir tarih bölümü konusu şu dört testi geçer:

1. **Tek bir an var:** bir gün, bir karar, bir kaza (ör. "Titanik'in son 2 saati", "1453'te gemilerin karadan yürütülmesi").
2. **Bir insan var:** adı bilinen biri karar veriyor, hata yapıyor ya da tanıklık ediyor.
3. **Bir "neden" var:** izleyicinin aklındaki yanlış ya da eksik cevap ("Titanik buzdağı yüzünden battı" → asıl neden perçinler ve hız).
4. **Doğrulanabilir:** tarih, sayı ve isimler güvenilir kaynaklarda var.

**Önce manşet:** `python tools/news.py --channel db` (Türkiye) / `python tools/news.py` (Stickstory); havuza uyan bir manşetin arkasındaki gerçek hikâyeyi seç (CLAUDE.md). `videos/*/` altındaki geçmiş başlıkları kontrol et, tekrar etme. Konu havuzunu dönüşümlü kullan (BRAND.md §1), Türkiye/Osmanlı tarihinden haftada en az 2 bölüm.

## 2. Hikâye yapısı

**Shorts (28–35 sn, 8–11 sahne):**
1. İlk 2 saniye: en çarpıcı an ya da iddia, 3–8 kelime — kapak yazısıyla aynı fikir (tarih/yer ikinci cümlede).
2. Gerilimi kur (bir şey ters gidiyor).
3. Şaşırtıcı ayrıntı / asıl neden.
4. Net, akılda kalan punchline + tek kısa, doğal abone cümlesi nedeniyle ("Her gün böyle gerçek bir hikâye için abone olun.").

**Uzun video (5–6 dk, 40–50 sahne, 4–5 bölüm):**
**Soğuk açılış (ilk 30 sn):** selam/giriş yok; olayın en dramatik anının içinde aç, videonun cevaplayacağı soruyu sor
(cevap sonda). Sonra `BÖLÜM 1` sıradan dünya → `BÖLÜM 2` kıvılcım/karar → `BÖLÜM 3` felaket ya da dönüm noktası →
`BÖLÜM 4` "peki neden?" (asıl açıklama, yaygın yanlışı düzelt) → `BÖLÜM 5` sonrası ve bugün → tek yorum sorusu.
5–6 dakika sıkı bir anlatım ister: hikâyeyi uzatma, derinleştir: olayın içinde 1–2 ara dönüm noktası, gerçek insanların kararları ve sözleri, beklenmedik ayrıntılar. Tekrar ve dolgu yok; her bölüm yeni bir soru açıp kapatır.
Her 20–30 saniyede bir gerilim cümlesi: "Ama kimse asıl tehlikeyi fark etmemişti." Her 45–60 saniyede bir görsel
değişim (yeni yer, harita, büyük sayı, yakın plan); her bölüm bir sonrakine çeken bir cümleyle biter.
Kapak: tek nesne + büyük Kaşif, 2–4 kelime, uzunda `cover.focus` zorunlu. Başlık bilgi değil kanca (CLAUDE.md).

## 3. Sahne seçimi (sepya stil, `"theme": "parchment"`)

| Anlatılan şey | Sahne tipi |
|---|---|
| Biri bir şey yapıyor, karar veriyor, şaşırıyor | `stage` — Kaşif ve dönem karakterleri, prop'lar |
| Yer ve yolculuk | `map` (eski harita, rota) |
| Tarihler, sıra | `timeline` |
| Karşılaştırma, kanıtlar, kontrol listesi | `board` |
| Bölüm açılışı | `chapter` ("BÖLÜM 2 / 5") |
| Tek güçlü cümle, sayı | `title` |
| Atmosfer (mekân, doğa olayı) | konuya özel kod sahnesi ya da gerçek telifsiz fotoğraf (`photo`); yapay zekâ klibi yok |

- Kaşif **sunucudur**: sahnelerin **%15–25'inde** (açılış, bölüm dönüşü, kilit an, kapanış) ve her seferinde bir eylem
  yapıyor (işaret ediyor, şaşırıyor, bir nesne tutuyor). Diğer sahnelerde olayın kendisi ve dönem karakterleri oynar.
- Her sahne bir dünyada geçer: `"set"` (hills, sea, ocean, coast, city, interior, night, desert, snow, storm, field);
  yer değiştikçe dekor değişir. Plan büyüklüğü değişir: en az 1 (uzunda 4) yakın plan `"camera": {"focus": [x, y], "zoom": 1.8}`
  (BRAND.md §5.1). Kalıp tekrarı yok: dünkü videonun dekor/plan/kapak düzenini aynen kopyalama.
- Aynı tip üst üste en fazla 2 sahne; `stage` 3 sahne sürebilir.
- Kaşif anlatıcıdır; olayın kahramanları şapkasız dönem figürleridir (defne tacı, sarık, bere, miğfer).

## 4. Anlatım

- Ses ayarı yok: `pacing`, `tone`, `tts.settings` kullanılmaz; ses doğal okur, tonlamayı noktalama taşır (BRAND.md §6.2).
- **Düz anlatım yok:** izleyiciye seslen, merakı bekletip cevapla, zıtlık ve duyusal ayrıntı kullan,
  cümle uzunluklarını değiştir (BRAND.md §6.9). Kaşif'in ağzı sabittir (konuşma animasyonu yok).
- **Anlatıcı bir YouTuber:** izleyiciye "siz" diye hitap et, merakı paylaş, "gelin anlatayım", "bakın", "sizce?" (BRAND.md §6.0).
- **Devrik cümle yok:** özne başta, yüklem sonda ("Ordu geldi.", "Geldi ordu." değil) — BRAND.md §6.3b.
- YouTube anlatıcısı gibi: geçmiş zamanla hikâye anlat, kipleri karıştır, soru/ünlem/hitap kullan; cümlelerin en fazla üçte biri "-yor" ile biter (BRAND.md §6.3). Selam/giriş yok.
- Ekranda en fazla 5 kelime/sahne; asıl bilgiyi ses taşır.
- Ölüm ve acıyı saygıyla, sayıyla değil insan hikâyesiyle anlat.
- Tartışmalı bilgiyi "büyük olasılıkla", "bir görüşe göre" diye ver.

## 5. Kontrol

`brand/kit/BRAND.md` §10 kontrol listesi + `tools/lint.py` + `tools/preview.py` (sheet ve cover'ı aç, bak).
