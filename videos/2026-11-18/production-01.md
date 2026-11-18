## 01 — Londra Büyük Sisi (Shorts) · `01-londra-buyuk-sisi.json`
- **Konu:** 5–9 Aralık 1952, Londra. Bir antisiklon şehrin üstüne çöktü; sıcaklık terselmesi (soğuk ve durgun hava
  yerde, üstünde ılık bir katman) evlerin ve santrallerin kömür dumanını şehrin üstüne kapattı. Görüş yer yer bir metrenin
  altına indi; otobüs kondüktörleri ellerinde fener/işaret fişeğiyle otobüslerin önünde yürüdü; Sadler's Wells'te
  *La Traviata* salon sisle dolduğu için ilk perdeden sonra durduruldu. O günlerde ~4.000 ölüm bilindi; sonraki
  tahminler ~12.000. Sonuç: 1956 Temiz Hava Yasası (Clean Air Act).
- **Havuz:** felaketler ve kazalar (manşet bulunamadı, havuzdan). Geçmişte işlenmedi (Londra Büyük Yangını 1666 ayrı konu).
- **İzleyici sonunda ne hisseder:** görünmeyen bir şeyin şehri sessizce boğması; ve o ölümlerin bugünkü temiz havaya dönüşmesi.
- **Kanca + kapak:** "Bu sis binlerce kişiyi öldürdü." ↔ kapak `LONDRA'YI BOĞAN / SİS` (vurgu: sis). Tek özne: sisin içinde
  tek bir gaz sokak lambası, ışık havuzu; arkadaki uzak lambalar sise gömülüyor.
- **Tema:** `grafit` (sanayi, şehir, modern tarih; önceki DB videosu `obsidyen`).

### Anlatım (taslak, tur 0; tur 1'de değişti, aşağıda "Anlatım (tur 1)")
Bu sis binlerce kişiyi öldürdü. Aralık 1952. Durgun hava Londra'yı kapak gibi kapattı. Kömür dumanı hiçbir yere
gidemedi. Görüş birkaç metreye indi. Otobüslerin önünde fenerli adamlar yürüdü. Bir opera, sis yüzünden yarıda kaldı.
Beş günde en az dört bin kişi öldü. Bu ölümler, Temiz Hava Yasası'nı doğurdu. Böyle sessiz hikâyeler için abone olun.

(347 karakter, bütçe uyarısı nedeniyle alt uç; "-yor" 0/10.)

### Çekim listesi
1. "Bu sis binlerce kişiyi öldürdü." — `bt_smog_lamp` hook: sisin içinde gaz lambası, arkada sıra evler ve iki uzak lamba;
   "öldürdü"de sis kapanır, uzak lambalar söner (kapak karesi). Kamera: yavaş itme.
2. "Aralık 1952. Durgun hava Londra'yı kapak gibi kapattı." — `bt_smog_city`: Thames, Parlamento ve saat kulesi; "Londra /
   Aralık 1952"; "kapak"ta altın kenarlı ılık hava katmanı oklarla iner, altında sis toplanır.
3. "Kömür dumanı hiçbir yere gidemedi." — `bt_smog_chimney`: çatılar ve baca kümeleri; duman yükselir, kesik çizgili
   tavana çarpıp yayılır; "gidemedi"de tavan altın olur.
4. "Görüş birkaç metreye indi." — `bt_smog_walk`: sokakta uzaklaşan şapkalı adam sise karışır; "metreye"de kaldırımdan
   ona altın ölçü çizgisi + "birkaç metre".
5. "Otobüslerin önünde fenerli adamlar yürüdü." — `bt_smog_bus`: önden çift katlı otobüs, sisten çıkan farlar; önde
   elinde fişekle yürüyen kondüktör; "fenerli"de alev büyür.
6. "Bir opera, sis yüzünden yarıda kaldı." — `bt_smog_opera`: sahnede spot altında tek şarkıcı, önde seyirci başları, sis
   sahneyi doldurur; "yarıda"da perde iner. "La Traviata" sahne üstünde italik.
7. "Beş günde en az dört bin kişi öldü." — `bt_smog_count`: "en az" + 0→4.000 sayaç + "kişi"; 4.000 küçük çizgi satır
   satır dolar, altında "beş gün".
8. "Bu ölümler, Temiz Hava Yasası'nı doğurdu." — `bt_smog_act`: masada bir yasa metni "Temiz Hava Yasası / 1956"; etrafındaki
   sis dağılır; "Temiz"de mühür ve yıl altın.
9. "Böyle sessiz hikâyeler için abone olun." — `bt_smog_lamp` end: sis incelir, lambanın üstünde yıldızlar çıkar.

### Kaynaklar
- Met Office — The Great Smog of 1952: https://weather.metoffice.gov.uk/learn-about/weather/case-studies/great-smog
- Historic England (Heritage Calling) — The Great Smog of London 1952: https://heritagecalling.com/2022/12/01/the-great-smog-of-london-1952
- London Museum — The Great Smog of 1952: https://www.londonmuseum.org.uk/collections/london-stories/the-great-smog-of-1952/
- History.com — The Killer Fog That Blanketed London: https://www.history.com/articles/the-killer-fog-that-blanketed-london-60-years-ago

### Anlatım (tur 1)
Bu sis binlerce kişiyi öldürdü. Aralık 1952, Londra. Sis dağılmadı, çünkü ılık bir hava katmanı kömür dumanını
hapsetti. Görüş birkaç metreye indi. Otobüslerin önünde ışık tutan adamlar yürüdü. Bir opera bile sisten yarıda kaldı.
Haftalar içinde en az dört bin kişi öldü. Londra'nın temiz havasının bedelini onlar ödedi. Böyle sessiz hikâyeler için abone olun.

(360 karakter, "-yor" 0/9.) Sahneler: 0 lamba (hook) · 1 şehir "Aralık 1952, Londra." (kapak katmanı yok) · 2 bacalar
"Sis dağılmadı, çünkü…" (cue `warm` "ılık" → "ılık hava" yazısı, `hit` "hapsetti" → tavan altın) · 3 yürüyen adam ·
4 otobüs + ışık tutan kondüktör (cue "ışık") · 5 opera · 6 sayaç 4.000 (çizgi alanı yok) · 7 Temiz Hava Yasası 1956
(cue "bedelini") · 8 lamba (end). Kapak: `BU SİS / ÖLDÜRDÜ`, vurgu "öldürdü", sahne 0, t 2.2, focus [600, 740], zoom 1.65.

## Eleştiri günlüğü
- **Tur 1** (eleştirmen ≠ yazar): Senaryo 6 · Kanca 8 · Okunabilirlik 8 · Görsel=anlatım 7 · Hareket 7 · Kompozisyon 7 · Tema 8 · Tempo 7 · Doğruluk 6 · Kapanış 6 · Kapak 6 / SEO 8.
  Sorunlar: anlatım madde listesi, "peki neden?" yok, "beş günde 4.000" yanlış, kuru punchline, fener/fişek uyumsuz; kapakta boşluk + ikinci lamba + başlığı tekrar eden yazı; baca sahnesi üst üçte bire sıkışmış, sayaç gri parazit, kırmızı perde, sallanan meşale.
  Düzeltme: anlatım bağlaçlı ("çünkü", "bile"), neden cümlesi (ılık katman dumanı hapsetti), "Haftalar içinde en az dört bin" (açıklama: sis günleri ve sonraki haftalarda ≥4.000, sonraki tahminler 8.000–12.000), punchline "Londra'nın temiz havasının bedelini onlar ödedi.", metin "ışık tutan adamlar" (çizim: işaret fişeği). Kapak `BU SİS / ÖLDÜRDÜ` (ilk cümle), lamba büyütüldü (zoom 1.65), uzak lambalar kapak anında gizli; 3 aday denendi (vurgu "sis" zoom 1.7 / "sis" zoom 1.55 / "öldürdü" zoom 1.65 → seçilen). Baca sahnesi: çatı hattı y 900–1060, tavan y 450 + "ılık hava", cepheler ve pencereler 1920'ye kadar, duman sürekli sütun. Sayaç: sadece büyük sayı + "en az"/"kişi" + sis. Perde gri (inkSoft/paperLight), kondüktör ve adamın sallanması kaldırıldı.
- **Tur 2**: Senaryo 7 · Kanca 9 · Okunabilirlik 8 · Görsel=anlatım 7 · Hareket 7 · Kompozisyon 8 · Tema 8 · Tempo 8 · Doğruluk 9 · Kapanış 7 · Kapak 8.
  Cila: punchline yasaya bağlandı → "Onların ölümü, dört yıl sonra Temiz Hava Yasası'nı doğurdu." (sahne 7, cue "Temiz"; anlatım 371 karakter);
  sahne 4 otobüs + kondüktör ~120 px yukarı (kondüktörün ayakları y ≈ 1160, altyazı şeridinin üstünde); sahne 6 sayaç sahnenin ~%65'inde 4.000'de durur.
  Lint OK (SEO 100), sheet.png ve cover.jpg yeniden görüldü.
