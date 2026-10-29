# 02 — İlk ameliyat eldiveni (ek video, Shorts, belgesel tarzı)

- **İstek:** kanal sahibi: "Hastanede ilk eldiven nasıl bulundu ve kullanıldı?" (ek Shorts, `"extra": true`). Konu verildiği
  için manşet taraması yapılmadı.
- **Dosya:** `02-ilk-eldiven.json` · yayın 2026-10-30 14:00 (İstanbul) · `related`: `videos/2026-10-29/04-ilk-kasik.json`
  (kanalın "kaşık nasıl icat edildi" uzun videosu; ikisi de "sıradan bir nesnenin sessiz hikâyesi").
- **Havuz:** keşifler ve icatlar (tıp tarihi).
- **Tarz:** `"theme": "belgesel"`, tema `fildisi` (açık fildişi, grafit mürekkep; hastane / müze belgesi hissi; bir önceki
  video `obsidyen` koyu temaydı), ses `mF7tIc9VLrznhGooGjaT`.
- **İzleyici sonunda ne hisseder:** bugün her ameliyathanede milyonlarca kez giyilen eldiven, mikroplara karşı değil, sevilen
  bir hemşirenin yaralı elleri için doğdu. Küçük, insani bir ironi.
- **Kanca:** "İlk ameliyat eldiveni mikroplar için yapılmadı." İzleyicinin aklındaki cevap (mikroplar) ilk saniyede çürütülür;
  asıl neden (hemşirenin elleri) sona kadar parça parça açılır.
- **Kapak:** "MİKROPLAR / İÇİN DEĞİL" (`değil` altın) + tek ince lastik eldiven, ışık havuzunda (sahne 0, `focus`
  [540, 570], `zoom` 1.15). Aynı kare ilk cümlenin kanca karesidir.

## Anlatım (tek parça, 418 karakter)

İlk ameliyat eldiveni mikroplar için yapılmadı. Hemşire Hampton'ın elleri yara içindeydi. Suçlu, mikrop öldüren cıvalı
sıvıydı. Cerrah Halsted ona lastik eldivenler yaptırdı. Elleri iyileşti. Haziranda evlendiler. Cerrahlar ise yıllarca
çıplak elle çalıştı. Eldivenle enfeksiyon, yüzde on yediden ikinin altına indi. Milyonları koruyan eldiven, bir hemşirenin
elleri için doğdu. Böyle sessiz hikâyeler için abone olun.

-yor ile biten cümle yok, devrik cümle yok, ünlem yok, kısaltma yok, tarihle açılmıyor (yıl ekranda: "Caroline Hampton, 1889").

## Çekim listesi

| # | Cümle | Tip | Görüntü | Cue / kamera |
|---|---|---|---|---|
| 0 | İlk ameliyat eldiveni mikroplar için yapılmadı. | `bt_glove` hero | Işık havuzunda dik duran tek ince lastik eldiven, uzun bileklik; çok yavaş itme | kapak + kanca karesi |
| 1 | Hemşire Hampton'ın elleri yara içindeydi. | `bt_hands` sore | İki kalkık el + önkol; kırmızı tahriş lekeleri ve ince çatlaklar yayılır; üstte "Caroline Hampton, 1889" | sore = "yara" |
| 2 | Suçlu, mikrop öldüren cıvalı sıvıydı. | `bt_basin` | Masada "Cıva klorür" etiketli şişe + emaye leğen; sıvıda yavaş halkalar | label = "cıvalı" |
| 3 | Cerrah Halsted ona lastik eldivenler yaptırdı. | `bt_don` | Boş, sarkık eldiven; lekeli bir el alttan içine girer, parmaklar dolar; "Goodyear, New York" | — |
| 4 | Elleri iyileşti. | `bt_hands` healed | Aynı iki el; lekeler yavaşça silinir | — |
| 5 | Haziranda evlendiler. | `bt_couple` | Kemerli pencere ışığında el ele iki siluet, ışıkta süzülen toz | `camera: false` |
| 6 | Cerrahlar ise yıllarca çıplak elle çalıştı. | `bt_theatre` | 1890'ların ameliyathanesi: tavan penceresi, gaz lambası, örtülü masa, eğilmiş cerrah; çıplak elleri altınla belirir | bare = "çıplak" |
| 7 | Eldivenle enfeksiyon, yüzde on yediden ikinin altına indi. | `bt_rate` | "eldivensiz %17" uzun gri sütun, "eldivenli %1,8" kısa altın sütun; "Bloodgood, fıtık ameliyatları" | b = "ikinin" |
| 8 | Milyonları koruyan eldiven, bir hemşirenin elleri için doğdu. Böyle sessiz hikâyeler için abone olun. | `bt_glove` many | Sıra sıra eldivenler; ortadaki altınla aydınlanıp yavaşça büyür, diğerleri solar; "Caroline Hampton" | hit = "hemşirenin" |

Yeni sahne tipleri tek dosyada: `scenes/studio/shots/bt_glove.js` (`bt_glove`, `bt_hands`, `bt_basin`, `bt_don`,
`bt_couple`, `bt_theatre`, `bt_rate`). Ortak dosyalara dokunulmadı.

## Kaynaklar

1. S. R. Lathan, "Caroline Hampton Halsted: the first to use rubber gloves in the operating room", Proc (Bayl Univ Med
   Cent) 2010;23(4):389–392 — https://pmc.ncbi.nlm.nih.gov/articles/PMC2943454/ (Halsted'in kendi anlatımı alıntılanır)
2. Science History Institute, Distillations: "The Nurse Who Introduced Gloves to the Operating Room" —
   https://www.sciencehistory.org/stories/magazine/the-nurse-who-introduced-gloves-to-the-operating-room/
3. S. R. Lathan, "Rubber gloves redux", Proc (Bayl Univ Med Cent) 2011;24(4):324 — https://pmc.ncbi.nlm.nih.gov/articles/PMC3205159/

## Doğrulanan bilgiler

- Caroline Hampton 1889'da Johns Hopkins Hastanesi'nde ameliyathane baş hemşiresi oldu (Distillations, Wikipedia).
- Halsted'in kendi sözleri: "1889–1890 kışında, ayını hatırlamıyorum, ameliyathanemin sorumlu hemşiresi cıva klorür
  çözeltilerinin kollarında ve ellerinde dermatit yaptığından yakındı." Onu "olağanüstü yetenekli" bulduğu için Goodyear
  Rubber Company'den deneme olarak iki çift ince, uzun bilekli lastik eldiven istedi (PMC2943454, LITFL).
- Ellerinin alçı kalıbı alındı (Distillations); eldivenlerle dermatit geçti. Hampton işi bırakmayı düşünmüştü (Distillations).
- Evlilik: Haziran 1890 (Distillations; PMC3205159 "1890").
- Eldiveni önce asistanlar, sonra cerrahlar giydi; cerrahlar yıllarca çıplak elle çalışmaya devam etti (1911'de cerrahların
  ancak yarısı eldiven giyiyordu — Distillations). Halsted sonradan: "Onları her zaman giymenin gerekliliğini görememek için
  nasıl bu kadar kör olabildim?" (PMC3205159).
- Bloodgood'un fıtık serisi (1899'da yayımlandı): eldivensiz 220 ameliyatta 38 enfeksiyon (%17,3), eldivenli 226 ameliyatta 4
  (%1,8) (Distillations). Bloodgood'un eldivene başladığı yıl kaynaklarda 1893 / 1896 diye farklı, bu yüzden metne alınmadı.
- **Nüans:** Daha önce de eldiven vardı (18. yüzyılda Walbaum'un doğumda kullandığı koyun bağırsağı eldivenler, otopsi
  eldivenleri; kalın ve hantal). Hampton'ınki ameliyathanede kullanılan ilk ince lastik eldiven olarak anılır; anlatım
  "ilk ameliyat eldiveni" der, "ilk eldiven" demez. Eldiven mikroplara karşı değil, mikrop öldüren kimyasala karşı
  yapıldı: punchline bu ironidir.
- Alınmayanlar: "aşk hikâyesi" süslemeleri, kesin olmayan ay/yıllar, karbolik asit (bazı kaynaklar ekliyor; Halsted'in
  kendi anlatımı sadece cıva klorür diyor).

## Eleştiri günlüğü

- **Tur 1 (yazar, görsel):** ilk preview. Kapak kareside eldiven ötelenip parmak uçları kapak gölgesinde kalıyordu →
  3 kapak adayı denendi (A: tek eldiven + 3 satır yazı, B: giyilen eldiven + "Mikrop için yapılmadı", C: lekeli eller +
  "Mikroplar için değil"). B'de etiket hayaleti göründü; C dramatik ama kanca cümlesiyle (eldiven) uyuşmuyor ve 1. sahneyi
  tekrar ediyor. A'nın büyük hâli (A3, `focus` + `zoom` 1.15) seçildi: tek özne, telefonda okunuyor.
  Ameliyathanedeki gaz lambası sol üstteydi (sol üst boş kalmalı) → sağa alındı. Leğen sahnesi küçüktü → %15 büyütüldü.
  Bitiş sahnesindeki tek eldiven az büyüyordu → 2,1 kata kadar yavaş büyüme. Oran sahnesine "fıtık ameliyatları" notu
  eklendi (rakam o seriye ait).
- **Tur 2 (yazar, görsel):** kanca sahnesi `STATIC?` (0,0) → çok yavaş itme + ışık nefesi (0,8). Tahriş lekeleri puantiye gibi
  duruyordu → düzensiz leke şekilleri, hızlı yayılma. Giyme sahnesinde elin başparmağı bilekliğin dışından görünüyordu →
  el bilekliğin ağzının üstünde kırpılıyor. Önkollar kadrajın altında bitiyordu → uzatıldı.
- Öz puan (2. tur sonrası, eleştirmen ajan turu yönetmende): senaryo 7, kanca 8, okunabilirlik 8, görsel = anlatım 8,
  hareket 7, kompozisyon 8, tema 8, akış 8, doğruluk 9, kapanış 8, kapak + SEO 8.

### Yönetmen turu (son)
- Görsel: 9 sahne, kontak sayfası ve kapak kontrol edildi; temiz, fildişi tema kaşık videosunun koyu temasından farklı. Kapak "MİKROPLAR İÇİN DEĞİL" kaldı.
- Anlatım akışı sıkılaştırıldı (cümleler birbirine bağlandı, istatistik "eldiven gelince" olarak verildi; ekrandaki "Bloodgood, fıtık ameliyatları" notu kaynağı gösteriyor). Son metin 448 karakter:
  İlk ameliyat eldiveni mikroplar için yapılmadı. 1889 kışında hemşire Hampton'ın elleri yara içindeydi. Suçlu, mikrop öldüren cıvalı sıvıydı. Cerrah Halsted ona ince lastik eldivenler yaptırdı. Elleri iyileşti. Birkaç ay sonra evlendiler. Cerrahlar ise yıllarca çıplak elle çalıştı. Eldiven gelince enfeksiyon, yüzde on yediden ikinin altına indi. Milyonları koruyan eldiven, bir hemşirenin elleri için doğdu. Böyle sessiz hikâyeler için abone olun.
