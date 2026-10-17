# Eleştiri döngüsü (review)

Her video yayına gitmeden önce **senaryoyu yazmayan** bir eleştirmen ajan tarafından puanlanır.
Eleştirmen taze gözle bakar: sadece `sheet.png`, `cover.jpg`, senaryo JSON'u, `tools/lint.py` ve
`tools/preview.py` çıktısını görür.

## Puanlama (1–10)

| Kriter | 10 puan nasıl görünür |
|---|---|
| **Kanca** | İlk kare + ilk cümle 1 saniyede merak yaratıyor; kapak yazısı ile ilk cümle aynı fikir; kaydırmayı durdurur. |
| **Okunabilirlik (360 px)** | Kontak sayfasında (her kare 360 px genişlik) tüm sahne yazıları okunuyor; yazı görsele binmiyor; altyazı bandı ve YouTube arayüzü bölgesi temiz. |
| **Görsel = anlatım** | Her sahnenin görseli `visual` cümlesini ve o an söylenen şeyi birebir gösteriyor; "yaklaşık" görsel yok. |
| **Hareket** | Her sahne canlı (preview `motion` ≥ 1.5, tercihen ≥ 4); her 3–5 sn'de yeni görsel ödül; cue'lar dramatik kelimelerde. |
| **Kompozisyon** | Tek odak, dolu kadraj, güvenli bölgeler korunmuş, nesne ekran dışına taşmıyor. |
| **Derinlik** | Ön/orta/arka plan katmanları, ışık, paralaks; düz "slayt" yok. |
| **Akış ve tempo** | 2–4 sn sahneler, sahne tipi çeşitliliği, palet geçişleri anlamlı, dolgu cümle yok. |
| **Doğruluk** | Her sayı/tarih doğrulanmış ya da "yaklaşık"; yaygın efsane yok. |
| **Kapanış** | Son cümle tam, kendi başına anlamlı, akılda kalan sonuç; döngü/soru yok. |
| **Kapak + SEO** | Kapak küçük ekranda okunuyor ve dramatik; başlık aranan ifadeyle başlıyor, vaadini video karşılıyor. |

## Kurallar

- Eleştirmen her video için puan tablosunu + **en büyük 3 sorunu** (somut: hangi sahne, ne yanlış, nasıl
  düzelir) yazar. "Daha iyi olabilir" gibi belirsiz yorum yasak.
- **Geçme şartı:** tüm kriterler ≥ 8 ve `tools/lint.py` hatasız.
- Yazar ajan sorunları düzeltir, `lint` + `preview` tekrar çalışır, eleştirmen tekrar puanlar.
  **En az 2, en fazla 3 tur.** 3. turdan sonra hâlâ < 8 olan kriter varsa en zayıf sahneyi daha basit
  ama doğru bir sahneyle değiştir ve raporda belirt.
- Her tur `videos/<tarih>/production.md` içindeki "Eleştiri günlüğü" bölümüne eklenir:

```md
### 01-<slug> — tur 2
| Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Derinlik | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|
| 9 | 8 | 8 | 9 | 8 | 7 | 9 | 10 | 9 | 8 |
1. Sahne 4: ... → ...
2. ...
3. ...
```
