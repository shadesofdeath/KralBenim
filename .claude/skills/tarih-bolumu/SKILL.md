---
name: tarih-bolumu
description: Düşün Bakalım kanalı için tarih hikâyesi bölümü (Shorts ya da uzun video) planlarken ve senaryosunu yazarken kullan. Konu seçimi, hikâye yapısı, Kaşif karakterinin sahne sahne kullanımı, sepya parşömen stilinde sahne seçimi ve anlatım kuralları. Senaryo JSON'u yazmadan önce yükle.
---

# Tarih bölümü yazma becerisi

Önce `brand/kit/BRAND.md` dosyasını oku; bu beceri onun uygulamasıdır.

## 1. Konu seçimi

İyi bir tarih bölümü konusu şu dört testi geçer:

1. **Tek bir an var:** bir gün, bir karar, bir kaza (ör. "Titanik'in son 2 saati", "1453'te gemilerin karadan yürütülmesi").
2. **Bir insan var:** adı bilinen biri karar veriyor, hata yapıyor ya da tanıklık ediyor.
3. **Bir "neden" var:** izleyicinin aklındaki yanlış ya da eksik cevap ("Titanik buzdağı yüzünden battı" → asıl neden perçinler ve hız).
4. **Doğrulanabilir:** tarih, sayı ve isimler güvenilir kaynaklarda var.

`videos/*/` altındaki geçmiş başlıkları kontrol et, tekrar etme. Konu havuzunu dönüşümlü kullan (BRAND.md §1), Türkiye/Osmanlı tarihinden haftada en az 2 bölüm.

## 2. Hikâye yapısı

**Shorts (28–35 sn, 8–11 sahne):**
1. Anın içine düş (tarih + yer + sıradan bir ayrıntı) — kapak yazısıyla aynı fikir.
2. Gerilimi kur (bir şey ters gidiyor).
3. Şaşırtıcı ayrıntı / asıl neden.
4. Net, akılda kalan kapanış cümlesi.

**Uzun video (8–10 dk, 60–80 sahne, 6–8 bölüm):**
`BÖLÜM 1` sıradan dünya → `BÖLÜM 2` kıvılcım/karar → `BÖLÜM 3` felaket ya da dönüm noktası →
`BÖLÜM 4` "peki neden?" (asıl açıklama, yaygın yanlışı düzelt) → `BÖLÜM 5` sonrası ve bugün → tek yorum sorusu.
8–10 dakikayı doldurmak için hikâyeyi uzatma, derinleştir: olayın içinde 2–3 ara dönüm noktası (ayrı bölümler), gerçek insanların kararları ve sözleri, beklenmedik ayrıntılar. Tekrar ve dolgu yok; her bölüm yeni bir soru açıp kapatır.
Her 20–30 saniyede bir gerilim cümlesi: "Ama kimse asıl tehlikeyi fark etmemişti."

## 3. Sahne seçimi (sepya stil, `"theme": "parchment"`)

| Anlatılan şey | Sahne tipi |
|---|---|
| Biri bir şey yapıyor, karar veriyor, şaşırıyor | `stage` — Kaşif ve dönem karakterleri, prop'lar |
| Yer ve yolculuk | `map` (eski harita, rota) |
| Tarihler, sıra | `timeline` |
| Karşılaştırma, kanıtlar, kontrol listesi | `board` |
| Bölüm açılışı | `chapter` ("BÖLÜM 2 / 5") |
| Tek güçlü cümle, sayı | `title` |
| Atmosfer (mekân, doğa olayı) | `photo` + Higgsfield sepya klip (`"grade": "sepia"`, `"ai": true`) |

- Kaşif sahnelerin **en az yarısında** ve her seferinde bir eylem yapıyor (yürüyor, işaret ediyor, dürbünle bakıyor, şaşırıyor).
- Aynı tip üst üste en fazla 2 sahne; `stage` hariç (Kaşif'in yolculuğu 3 sahne sürebilir).
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
