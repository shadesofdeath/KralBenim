# Eleştiri döngüsü (review)

Her video yayına gitmeden önce **senaryoyu yazmayan** bir eleştirmen ajan tarafından puanlanır.
Eleştirmen önce **sadece anlatım metnini** (tüm sahnelerin `text` alanları art arda) görüntüye bakmadan okur ve "Senaryo" puanını verir. Sonra taze gözle bakar: sadece `sheet.png`, `cover.jpg`, senaryo JSON'u, `tools/lint.py` ve
`tools/preview.py` çıktısını görür. Görsel kriterlerde ölçü `brand/kit/BRAND.md`'dir (§2 Kaşif, §3 renkler, §5 çizim dili, §9 kapak, §10 kontrol listesi).

## Puanlama (1–10)

| Kriter | 10 puan nasıl görünür |
|---|---|
| **Senaryo (metin tek başına)** | Anlatım görüntü olmadan, düz metin olarak okununca da (podcast gibi) sürükleyici bir hikâye: anlatıcının sesi, merak, gerilim, dönüş, akılda kalan son. Cümleler ekrandakini tarif etmiyor ("kamyona tüfek kuruyorlar" gibi altyazı cümlesi yok); görüntünün söyleyemediğini söylüyor. Devrik cümle yok (özne başta, yüklem sonda; BRAND.md §6.3b), devrik cümle görülürse bu kriter en fazla 6 alır. Cümleler birbirine bağlanıyor ("ama", "yani", "çünkü", "ve tam o anda"), madde listesi gibi kopuk değil. **Bu kriter 7'nin altındaysa diğer puanlara bakılmaz, senaryo baştan yazılır.** |
| **Kanca** | Shorts: ilk 2 saniye (kapak karesi + 3–8 kelimelik ilk cümle) konunun en çarpıcı anı; tarihle/bağlamla açılmıyor; kaydırmayı durdurur (hedef ≥ %70 devam). Uzun: ilk 30 saniye selamsız, olayın içinde açılıyor ve cevabı sonda olan bir soru soruyor. |
| **Okunabilirlik (360 px)** | Kontak sayfasında (her kare 360 px genişlik) tüm sahne yazıları okunuyor; yazı görsele binmiyor; altyazı bandı ve YouTube arayüzü bölgesi temiz. |
| **Görsel = anlatım** | Her sahnenin görseli `visual` cümlesini ve o an söylenen şeyi birebir gösteriyor; "yaklaşık" görsel yok. |
| **Hareket** | Her sahne canlı (preview `motion` ≥ 1.5, tercihen ≥ 4); her 3–5 sn'de yeni görsel ödül; cue'lar dramatik kelimelerde. |
| **Kompozisyon + Kaşif** | Tek odak, dolu kadraj, güvenli bölgeler korunmuş, nesne ekran dışına taşmıyor. Kaşif sahnelerin en az yarısında, şapkalı ve her seferinde bir şey yapıyor (yürüyor, işaret ediyor, şaşırıyor); dönem karakterleri şapkasız. |
| **Derinlik + marka** | Parşömen üstünde ön/orta/arka plan mürekkep katmanları, yavaş kamera itmesi, paralaks; çizgiler kaynıyor (boil); düz "slayt" yok. Sadece BRAND.md §3 renkleri (palet dışı renk, parlak 3D, emoji ikon görülürse en fazla 5). |
| **Akış ve tempo** | 2–4 sn sahneler, sahne tipi çeşitliliği (stage / map / timeline / board / title / konuya özel), dolgu cümle yok. Uzun videoda her 45–60 sn'de hikâye kancası + görsel değişim, her bölüm sonu bir sonrakine çekiyor; arka plan uzamıyor (izleyici yarıda bırakmasın). |
| **Doğruluk** | Her sayı/tarih doğrulanmış ya da "yaklaşık"; yaygın efsane yok. `sources` gerçek ve ilgili sayfalar (eleştirmen en az birini açıp bakar), kilit bilgilerde ekranda "Kaynak" notu var. |
| **Kapanış** | Shorts: punchline tam, kendi başına anlamlı ve akılda kalan; ardından tek kısa, doğal abone cümlesi nedeniyle (zorlama ya da uzun değil); döngü/soru yok. Uzun: tek yorum sorusu + abone çağrısı. |
| **Kapak + SEO** | Kapak BRAND.md §9'a uygun (parşömen, Fraunces dev yazı, 2–4 kelime, tek kelime kırmızı kutuda, büyük Kaşif + olayın tek simgesi), **tek net odak noktası, görsel karmaşa yok**, küçük ekranda okunuyor ve dramatik. Başlık aranan ifadeyle başlıyor ve bilgi vermek yerine merak bırakıyor (soru ya da şaşırtıcı iddia), vaadini video karşılıyor. Uzun video kapağı tıklanma oranını belirler: kalabalıksa en fazla 6. |

## Kurallar

- Eleştirmen her video için puan tablosunu + **en büyük 3 sorunu** (somut: hangi sahne, ne yanlış, nasıl
  düzelir) yazar. "Daha iyi olabilir" gibi belirsiz yorum yasak.
- **Geçme şartı:** tüm kriterler ≥ 7 (kanal sahibinin kararı) ve `tools/lint.py` hatasız.
- Yazar ajan sorunları düzeltir, `lint` + `preview` tekrar çalışır, eleştirmen tekrar puanlar.
  **En az 2, en fazla 3 tur.** 3. turdan sonra hâlâ < 7 olan kriter varsa en zayıf sahneyi daha basit
  ama doğru bir sahneyle değiştir ve raporda belirt.
- Her tur `videos/<tarih>/production.md` içindeki "Eleştiri günlüğü" bölümüne eklenir:

```md
### 01-<slug> — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 8 | 9 | 8 | 7 | 9 | 10 | 9 | 8 |
1. Sahne 4: ... → ...
2. ...
3. ...
```
