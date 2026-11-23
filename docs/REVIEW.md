# Eleştiri döngüsü (review)

Her video yayına gitmeden önce **senaryoyu yazmayan** bir eleştirmen ajan tarafından puanlanır.
Eleştirmen önce **sadece anlatım metnini** (tüm sahnelerin `text` alanları art arda) görüntüye bakmadan okur ve "Senaryo" puanını verir. Sonra taze gözle bakar: sadece `sheet.png`, `cover.jpg`, senaryo JSON'u, `tools/lint.py` ve
`tools/preview.py` çıktısını görür. Görsel kriterlerde ölçü iki kanal için de **`docs/SULUBOYA.md`**'dir (2026-11-23'ten
beri suluboya tarzı, belgesel + tarih). Eski tarzdaki (belgesel çizgi / parşömen + Kaşif) videolar için BELGESEL.md ve
BRAND.md geçerliydi; yeni videoda o ölçüler kullanılmaz.

**Suluboya videolarında kriterler şöyle okunur:** *Senaryo/Kanca*: Düşün Bakalım'da yavaş, hafif ürkütücü, merak
uyandıran belgesel sesi; Stickstory'de sıcak, net İngilizce belgesel anlatıcısı (enerjik YouTuber kalıbı varsa en fazla
6). *Hareket*: yavaş ve doğal (kendini boyayan darbeler, salınım, alev, duman, su, ilerleyen bir şey); titreyen ya da
zıplayan öğe varsa en fazla 5 (`motion` eşiği 0,3). *Kompozisyon*: sahne başına tek kahraman özne, bol kâğıt boşluğu,
güvenli bölgeler korunmuş, ardışık sahneler farklı. *Suluboya*: gerçek bir suluboya resmi gibi mi (yarı saydam
katmanlar, fırça dokusu, kâğıt beyazı, token renkleri, bir önceki videodan farklı kâğıt seti); klip art, düz vektör,
çocuk kitabı görüntüsü varsa en fazla 5. *Doğruluk*: ekranda kaynak notu aranmaz, `sources` listesi yeter.
*Kapak*: SULUBOYA.md §7 (büyük kalın yazı, tek kelime kehribar, tek net özne).

## Puanlama (1–10)

| Kriter | 10 puan nasıl görünür |
|---|---|
| **Senaryo (metin tek başına)** | Anlatım görüntü olmadan, düz metin olarak okununca da (podcast gibi) sürükleyici bir hikâye: anlatıcının sesi, merak, gerilim, dönüş, akılda kalan son. Cümleler ekrandakini tarif etmiyor ("kamyona tüfek kuruyorlar" gibi altyazı cümlesi yok); görüntünün söyleyemediğini söylüyor. Devrik cümle yok (özne başta, yüklem sonda; BRAND.md §6.3b), devrik cümle görülürse bu kriter en fazla 6 alır. Cümleler birbirine bağlanıyor ("ama", "yani", "çünkü", "ve tam o anda"), madde listesi gibi kopuk değil. **Bu kriter 7'nin altındaysa diğer puanlara bakılmaz, senaryo baştan yazılır.** |
| **Kanca** | Shorts: ilk 2 saniye (kapak karesi + 3–8 kelimelik ilk cümle) konunun en çarpıcı anı; tarihle/bağlamla açılmıyor; kaydırmayı durdurur (hedef ≥ %70 devam). Uzun: ilk 30 saniye selamsız, olayın içinde açılıyor ve cevabı sonda olan bir soru soruyor. |
| **Okunabilirlik (360 px)** | Kontak sayfasında (her kare 360 px genişlik) altyazı her karede okunuyor, notlar okunuyor; yazı özneye binmiyor; altyazı bandı ve YouTube arayüzü bölgesi temiz. |
| **Görsel = anlatım** | Her sahnenin görseli `visual` cümlesini ve o an söylenen şeyi birebir gösteriyor; "yaklaşık" görsel yok. |
| **Hareket** | Her sahne canlı ama sakin (preview `motion` ≥ 0,3; kendini boyama, salınım, alev, su, ilerleme); her 3–5 sn'de yeni görsel ödül; cue'lar dramatik kelimelerde ve bir olayı (boyanma, not, rota) tetikliyor. |
| **Kompozisyon** | Sahne başına tek kahraman özne, bol kâğıt boşluğu, güvenli bölgeler korunmuş (dikeyde özne y 200–1150), nesne ekran dışına taşmıyor, notlar özneyi kapatmıyor. Her sahne bir yerde geçiyor (gökyüzü, zemin, gün saati); yer değiştikçe resim değişiyor; plan büyüklüğü değişiyor (geniş manzara / orta / yakın plan, nesne levhası); önceki videolardan kalıp olarak farklı. Sunucu/maskot yok. |
| **Suluboya** | Gerçek bir suluboya defter sayfası gibi: yarı saydam katmanlar, fırça dokusu ve kuru fırça izleri, kâğıt beyazı ışık, ön/orta/arka plan derinliği, dönemine uygun inandırıcı nesneler. Sadece token renkleri, kâğıt seti bir önceki videodan farklı. Düz vektör, klip art, çizgi film/çocuk kitabı görüntüsü ya da yarım boyanmış kare görülürse en fazla 5. |
| **Akış ve tempo** | 2–4 sn sahneler, sahne tipi çeşitliliği (wc_scene / wc_map / wc_specimen / wc_number / wc_timeline / wc_letter / konuya özel), dolgu cümle yok. Uzun videoda her 45–60 sn'de hikâye kancası + görsel değişim, her bölüm sonu bir sonrakine çekiyor; arka plan uzamıyor (izleyici yarıda bırakmasın). |
| **Doğruluk** | Her sayı/tarih doğrulanmış ya da "yaklaşık"; yaygın efsane yok; dönemin nesneleri doğru (gemi, giysi, mimari). `sources` gerçek ve ilgili sayfalar (eleştirmen en az birini açıp bakar). |
| **Kapanış** | Shorts: punchline tam, kendi başına anlamlı ve akılda kalan; ardından tek kısa, doğal abone cümlesi nedeniyle (zorlama ya da uzun değil); döngü/soru yok. Uzun: tek yorum sorusu + abone çağrısı. |
| **Kapak + SEO** | Kapak SULUBOYA.md §7'ye uygun (büyük kalın yuvarlak harfler, açık dolgu + kalın mürekkep kontur, 2–4 kelime, tek kelime kehribar, altında boyanmış tek net özne), **tek net odak noktası, görsel karmaşa yok**, küçük ekranda okunuyor ve dramatik. Başlık aranan ifadeyle başlıyor ve bilgi vermek yerine merak bırakıyor (soru ya da şaşırtıcı iddia), vaadini video karşılıyor. Uzun video kapağı tıklanma oranını belirler: kalabalıksa en fazla 6. |

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
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 8 | 8 | 9 | 8 | 7 | 9 | 10 | 9 | 8 |
1. Sahne 4: ... → ...
2. ...
3. ...
```
