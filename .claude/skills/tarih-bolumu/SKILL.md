---
name: tarih-bolumu
description: Düşün Bakalım ve Stickstory (ikisi de belgesel + tarih, suluboya/watercolor tarzı) için tarih hikâyesi bölümü (Shorts ya da uzun video) planlarken ve senaryosunu yazarken kullan. Konu seçimi, hikâye yapısı, sahne seçimi ve anlatım kuralları. Senaryo JSON'u yazmadan önce yükle.
---

# Tarih bölümü yazma becerisi

**Önce `docs/SULUBOYA.md`** (anayasa; 2026-11-23'ten beri iki kanalın bütün videoları suluboya tarzında, belgesel +
tarih, `"theme": "watercolor"`). Sonra `python tools/wc_catalog.py` ile boyanabilen nesnelere ve sahne tiplerine bak.

- **Düşün Bakalım** (Türkçe): ses `mF7tIc9VLrznhGooGjaT`, yavaş belgesel anlatımı (§4).
- **Stickstory** (global, İngilizce): ses `2t85BBUECtLLKQzxLD95`, İngilizce belgesel anlatıcısı (§4; dil kuralları
  BRAND.md §11). Metin, ekran yazıları, harita etiketleri, bölüm kartı ("CHAPTER 2") ve kapak İngilizce.

## 1. Konu seçimi (özgün; haber/manşetten konu seçilmez — kanal sahibi, 2026-11-23)

İyi bir tarih bölümü konusu şu dört testi geçer:

1. **Tek bir an var:** bir gün, bir karar, bir kaza (ör. "Titanik'in son 2 saati", "1453'te gemilerin karadan yürütülmesi").
2. **Bir insan var:** adı bilinen biri karar veriyor, hata yapıyor ya da tanıklık ediyor.
3. **Bir "neden" var:** izleyicinin aklındaki yanlış ya da eksik cevap ("Titanik buzdağı yüzünden battı" → asıl neden perçinler ve hız).
4. **Doğrulanabilir:** tarih, sayı ve isimler güvenilir kaynaklarda var.

Konu kanalın havuzundan, `tools/plan.py` çıktısındaki `category`'den başlayarak seçilir (BRAND.md §1; Stickstory
`channels.py` `categories`). `videos/*/` altındaki geçmiş başlıkları kontrol et, tekrar etme. Havuzu dönüşümlü kullan;
Düşün Bakalım'da Türkiye/Osmanlı tarihinden haftada en az 2 bölüm. Herkesin bildiği konuyu bildik açıdan anlatma: az
bilinen bir açı, beklenmedik bir neden, unutulmuş bir insan. Video yıllarca izlenecek; güncel habere bağlama.

## 2. Hikâye yapısı

**Shorts (28–35 sn, 8–11 sahne):**
1. İlk 2 saniye: en çarpıcı an ya da iddia, 3–8 kelime — kapak yazısıyla aynı fikir (tarih/yer ikinci cümlede).
2. Gerilimi kur (bir şey ters gidiyor).
3. Şaşırtıcı ayrıntı / asıl neden.
4. Net, akılda kalan punchline + tek kısa, doğal abone cümlesi nedeniyle ("Böyle sessiz hikâyeler için abone olun." /
   "Subscribe for a true story like this every day.").

**Uzun video (5–6 dk, 40–50 sahne, 4–5 bölüm):**
**Soğuk açılış (ilk 30 sn):** selam/giriş yok; olayın en dramatik anının içinde aç, videonun cevaplayacağı soruyu sor
(cevap sonda). Sonra `BÖLÜM 1` sıradan dünya → `BÖLÜM 2` kıvılcım/karar → `BÖLÜM 3` felaket ya da dönüm noktası →
`BÖLÜM 4` "peki neden?" (asıl açıklama, yaygın yanlışı düzelt) → `BÖLÜM 5` sonrası ve bugün → tek yorum sorusu.
5–6 dakika sıkı bir anlatım ister: hikâyeyi uzatma, derinleştir: olayın içinde 1–2 ara dönüm noktası, gerçek insanların
kararları ve sözleri, beklenmedik ayrıntılar. Tekrar ve dolgu yok; her bölüm yeni bir soru açıp kapatır.
Her 20–30 saniyede bir gerilim cümlesi: "Ama kimse asıl tehlikeyi fark etmemişti." Her 45–60 saniyede bir görsel
değişim (yeni yer, harita, büyük sayı, nesne levhası, yakın plan); her bölüm bir sonrakine çeken bir cümleyle biter.
Kapak: büyük kalın yazı (2–4 kelime, tek kelime kehribar), altında tek net boyanmış özne (SULUBOYA.md §7). Başlık bilgi
değil kanca (CLAUDE.md).

## 3. Sahne seçimi (suluboya, sadece `wc_*` ve `photo`)

| Anlatılan şey | Sahne |
|---|---|
| Bir yer, bir an, bir olay (ordu ilerliyor, gemi batıyor, şehir yanıyor, biri karar veriyor) | `wc_scene`: `sky` + `land` + boyanan nesneler (`items`), `notes`, `fire`/`smoke`/`weather` |
| Yer ve yolculuk, sınırlar, yayılma | `wc_map` (bölge, şehirler, rota, imparatorluk alanı) |
| Kanıt, eser, silah, alet, belge nesnesi | `wc_specimen` (tek nesne büyük, el yazısı notlar) |
| Tek çarpıcı sayı/tarih | `wc_number` |
| Sıra, tarihler | `wc_timeline` |
| Mektup, ferman, kitabe, günlük, bir sözün kendisi | `wc_letter` |
| Bölüm açılışı (uzun; ilk sahne olamaz) | `wc_chapter` ("BÖLÜM 2" / "CHAPTER 2") |
| Gerçek belge/harita/yer fotoğrafı | `photo` (telifsiz, `credit` zorunlu) |
| Hiçbiri birebir göstermiyorsa | kendi dosyanda yeni `wc_<konu>` tipi ya da `WC.G` nesnesi (SULUBOYA.md §9) |

- Sahne başına **tek kahraman özne** ve onu anlatan bir not; kalabalık yerine tek gemi, tek insan, tek kapı.
- Ritim: mekân → ayrıntı → bilgi dönüşümlü; `wc_scene` üst üste en fazla 3, ardışık iki sahne aynı görünmez (yer,
  gün saati, gökyüzü, plan büyüklüğü değişir). Plan büyüklüğü değişir: geniş manzara → orta → yakın/levha.
- Bir olayı sözle eşzamanla: nesnenin boyanması (`"at": "<cue>"`), notun yazılması, rotanın çizilmesi cue kelimesinde.
- Kâğıt seti (`palette`) konuya göre (pamuk, keten, sepya, yaz, gurub) ve bir önceki videodan farklı.
- Sunucu, maskot, kicker, ekranda kaynak notu yok.

## 4. Anlatım

**Düşün Bakalım (belgesel sesi, BELGESEL.md §3):** yavaş, alçak, hafif ürkütücü, merak uyandıran: kısa ağır cümleler +
arada akan uzun cümle, sessizlik bırakan noktalama, derin zaman/karanlık/bilinmeyen imgeleri, cevabı bekleten yapı.
Enerjik YouTuber kalıpları ("Peki", "inanılmaz", "hemen anlatayım", ünlem) yok; "siz" hitabı seyrek ve sakin. Devrik
cümle yok, "-yor" ≤ 1/3, geçmiş zaman ağırlıklı, kısaltma yok, tartışmalı bilgi "büyük olasılıkla"/"rivayete göre".
Karakter: uzun 3.900–4.500, Shorts 330–420.

**Stickstory (İngilizce belgesel anlatıcısı):** sıcak, meraklı, net; kısa cümleler ve aktif fiiller, cümle uzunlukları
değişir; "you" hitabı seyrek ve doğal ("Picture the harbour that morning."); aşırı heyecanlı kalıplar ("guys",
"insane", "you won't believe") yok; kısaltma yok; dolgu yok (BRAND.md §11). Karakter: uzun 4.300–5.000, Shorts 400–500.

**İkisinde de:**
- Ses ayarı yok: `pacing`, `tone`, `tts.settings` kullanılmaz; ses doğal okur, tonlamayı noktalama taşır.
- Görüntüyü tarif etme; görüntünün söyleyemediğini söyle. Cümleler birbirine bağlanır ("ama", "çünkü", "ve tam o anda").
- Ekranda en fazla 5 kelime/sahne (notlar); asıl bilgiyi ses taşır.
- Ölüm ve acıyı saygıyla, sayıyla değil insan hikâyesiyle anlat.

## 5. Kontrol

`docs/SULUBOYA.md` §11 kontrol listesi, sonra `tools/lint.py` + `tools/preview.py` (sheet ve cover'ı aç, bak: her
sahnenin ikinci karesi tam boyanmış mı, altyazı okunuyor mu, kapak yazısı telefonda okunuyor mu).
