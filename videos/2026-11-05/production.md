# Düşün Bakalım — 2026-11-05 (belgesel tarzı)

Manşet: `tools/news.py --channel db` bu ortamdan erişilemedi (proxy 403: Google News tüneli reddedildi); web
aramasında da güncel, havuza uyan bir Türkiye manşeti bulunamadı → konu havuzdan, bugünün yıl dönümüne bağlı
seçildi (5 Kasım 1556: II. Panipat Savaşı).

## 01 — Short · imparatorlukların yükselişi ve çöküşü
- Konu: II. Panipat Savaşı (5 Kasım 1556). Delhi'yi birkaç hafta önce almış ve kendini Vikramaditya ilan etmiş
  Hemu, savaş filinin üstünde ordusunu yönetiyor ve kazanmak üzere. Babür tarafında çocuk yaştaki Ekber (kaynaklar:
  13) ve vasisi Bayram Han, cepheden ~8 mil (≈13 km) geride. Savaştan önce Hemu'nun topları Ali Kulı Han'ın öncü
  birliğine kaptırılmıştı. Kör bir ok Hemu'nun gözüne saplanır, bayılır, filin sırtındaki köşkte (hevdah) gözden
  kaybolur; ordusu lideri öldü sanıp dağılır. Babür hanedanı Hindistan'a geri döner, Ekber'in uzun saltanatı başlar
  (Babür İmparatorluğu 1857'ye dek, ~300 yıl).
- İzleyici sonunda ne hisseder: imparatorlukların kaderinin bazen tek bir rastlantıya asılı olduğu ürpertisi.
- Kanca/kapak: ilk cümle "Savaşı tek bir ok bitirdi." ↔ kapak "TEK BİR OK" (vurgu: OK). Kapak: ışık havuzunda
  zırhlı savaş filinin siluet başı/köşkü ve havada tek ok (yazar kesinleştirir; en az 3 aday).
- Palet: fildisi (önceki Düşün Bakalım short: obsidyen, önceki video kum). Dosya `01-panipat-ok.json`,
  `publish_at` 2026-11-05T19:00:00+03:00. related: yok.
- ElevenLabs uyarısı (warning: true) → anlatım 330–360 karakter.
- Efsaneler anlatılmaz: kafa kesme, Ekber'in kılıç vurup vurmadığı (tartışmalı) metne girmez. Fil sayısı kaynaklara
  göre çok değişiyor (500 – 1500) → sayı verilmez.

### Anlatım (taslak; yazar sesli okuyup cilalar)
Savaşı tek bir ok bitirdi. 5 Kasım 1556. Panipat. Hemu, dev bir savaş filinin sırtında kazanmak üzereydi. Karşı
tarafın hükümdarı Ekber ise henüz bir çocuktu. Kilometrelerce geride bekliyordu. Sonra kimin attığı bilinmeyen bir
ok, Hemu'nun gözüne saplandı. Hemu gözden kayboldu. Lidersiz kalan ordu dağıldı. O tek ok, Babürlere üç yüz yıl
verdi. Böyle sessiz hikâyeler için abone olun.

### Anlatım (son, tur 3 sonrası: 355 karakter; -yor ile biten cümle 0/10)
Savaşı tek bir ok bitirdi. 5 Kasım 1556. Panipat. Delhi'yi yeni alan Hemu, kazanmak üzereydi. Rakibi Ekber bir
çocuktu, kilometrelerce gerideydi. Kimin attığı bilinmeyen bir ok, Hemu'nun gözüne saplandı. Bayıldı, gözden
kayboldu. Ordusu onu ölü sandı, dağıldı. O tek ok, Ekber'in yarım asırlık saltanatını kurtardı. Böyle sessiz
hikâyeler için abone olun.

(Tur 1: "Babürlere üç yüz yıl kazandırdı" abartılı → Ekber'in 1556–1605 saltanatı; "Delhi'yi yeni alan" eklendi.
Tur 3: Ekber 14 Şubat 1556'da Kalanaur'da tahta çıkmıştı → "başlattı" yerine "kurtardı"; bütçe için sahne 2'den
"filin sırtında" çıktı (görüntü gösteriyor). Açıklamada "böyle başladı" → "böyle kurtuldu", "üç yüz yıl" cümlesi çıktı.)

### Çekim listesi
Sahne tipleri yeni dosyada: `scenes/studio/shots/bt_panipat.js` (`bt_pn_howdah`, `bt_pn_plain`, `bt_pn_elephant`,
`bt_pn_camp`, `bt_pn_line`, `bt_pn_arrow`). Kamera: hepsinde motorun yavaş itmesi + sahnenin kendi %3–6 yaklaşması.

| # | Cümle | Visual | Tip | Cue | Kamera |
|---|---|---|---|---|---|
| 0 | Savaşı tek bir ok bitirdi. | Ağır çekim: köşk (sağda, kubbe kadrajda), sarıklı yüzsüz siluet; sol üçte birde tek ok göz hizasında başa doğru ~160 px ilerler, ulaşmaz; saçak/sancak yavaş salınır, filin sırtında toz | `bt_pn_howdah` hook | – | yakın plan; kapak karesi |
| 1 | 5 Kasım 1556. Panipat. | Geniş ova, ufukta iki ordu (sağda küçük filler), toz; üstte ince "1556", italik "Panipat" | `bt_pn_plain` date | – | geniş plan |
| 2 | Delhi'yi yeni alan Hemu, kazanmak üzereydi. | Yandan zırhlı savaş fili, köşk ve içinde siluet; hortum/kulak/kuyruk/sancak yavaş | `bt_pn_elephant` | kazanmak → sancak altın | orta plan |
| 3 | Rakibi Ekber bir çocuktu, kilometrelerce gerideydi. | Yükseltide yuvarlak çadır, uzun adam + çocuk sola bakar; ufukta küçük toz bulutu | `bt_pn_camp` | kilometrelerce → toza noktalı altın çizgi | geniş plan |
| 4 | Kimin attığı bilinmeyen bir ok, Hemu'nun gözüne saplandı. | Köşk yakın plan; ok son 0,75 sn'de soldan gelir, yüze göz hizasında ulaşır (kan yok), siluet geriye yaslanır | `bt_pn_howdah` arrow | saplandı | yakın plan |
| 5 | Bayıldı, gözden kayboldu. | Aynı köşk; siluet okla birlikte korkuluğun arkasına çöker, ok da kaybolur, köşk boş kalır | `bt_pn_howdah` fall | bayıldı | yakın plan |
| 6 | Ordusu onu ölü sandı, dağıldı. | Daha yakın: boş köşklü fil ortada büyük; iri asker siluetleri iki yana açılarak tozun içine uzaklaşır | `bt_pn_plain` rout | dağıldı → hızlanır | orta plan, %6 itme |
| 7 | O tek ok, Ekber'in yarım asırlık saltanatını kurtardı. | Kalın yatay ok + kalın zaman çizgisi (ilk karede çizili, genişliğin ~%72'si) 1556 → 1605; erken büyük altın "49 yıl", italik "Ekber'in saltanatı"; altın ışık çizgide ilerler; altta ova, toz, otlar | `bt_pn_line` | yarım | sabit, hafif itme |
| 8 | Böyle sessiz hikâyeler için abone olun. | Alacakaranlık, boş ova; toprağa saplı ok, güneş battıkça gölgesi uzar, altın toz zerreleri süzülür, otlar | `bt_pn_arrow` ground | – | orta plan |

### Kapak
Seçilen (tur 1 sonrası): **"TEK BİR / OK"** (vurgu OK), sahne 0 hook karesi, `t` 1.6, `focus` [540, 610], `zoom` 1.12,
`kasif: false`. Videonun ilk karesiyle aynı. Köşk küçültülüp sağa alındı: kubbe ve altın topuz tam, fil gövdesi
açık tonda ve önünde toz (gri kütle azaldı); ok sol üçte birde, göz hizasında başa yönelmiş. Tur 3: köşk ve sancak
direk 40 px sola, sancak kısaltıldı (artık tam kadrajda), fil gövdesi daha açık ve önündeki toz daha yoğun.
Tur 0 adayları: A (ova + uzak fil), B (vuruş anı), C (toprakta ok), D (3 satır yazı) → B'den hook modu türetildi.
Tur 1 adayları (hepsi sahne 0):
- A: `focus` [540, 700], `zoom` 1.05. Kubbe tam ama topuz kapak gölgesinde soluk, sancak kesik.
- B: `focus` [540, 600], `zoom` 0.95. Topuz ve sancak tam, ama özne küçük ve fil gövdesi kadrajın yarısı.
- C: `t` 1.9, `focus` [540, 640], `zoom` 1.15. En büyük özne, ok en yakın; topuz soluk, sancak kesik, açılışta ok
  sol üçte birde başlamıyor.
- Seçilen: A ile C arası (`focus` [540, 610], `zoom` 1.12): büyük özne, topuz yazı gölgesinin altında altın, kubbe tam.
  Not: kapak = açılışın ilk karesi, bu yüzden "ok başa daha yakın" (kapak) ile "ok sol üçte birde" (kanca) arasında
  orta nokta seçildi (ok ucu ile yüz arası ~200 px).

## Eleştiri günlüğü

### Tur 1 (eleştirmen)
Puanlar: Senaryo 7 · Kanca 7 · Okunabilirlik 8 · Görsel=anlatım 7 · Hareket **5** · Kompozisyon 7 · Tema 8 · Tempo 7 ·
Doğruluk **6** · Kapanış 7 · Kapak **7** / SEO 9.
En büyük 3 sorun: (1) sahne 0 kanca karesi donuk (motion 1.2), kubbe sağdan kesik, ok sahne 4 ile aynı yerde;
(2) "Babürlere üç yüz yıl kazandırdı" abartılı (fiili güç 1707'de çöktü) → yumuşat; (3) sahne 7 zaman çizgisi
boş/küçük, sahne 6 dağılan ordu karınca boyunda. Ek: ok göze değil kaska değiyor; Hemu'nun kim olduğu söylenmiyor;
kapakta kubbe kesik + alt %25 gri gövde. (panipat.gov.in kaynağı yönetmen tarafından WebFetch ile doğrulandı, gerçek.)

### Tur 2 (eleştirmen)
Puanlar: Senaryo 7 · Kanca 8 · Okunabilirlik 8 · Görsel=anlatım 8 · Hareket 7 · Kompozisyon 7 · Tema 8 · Tempo 8 ·
Doğruluk 7 · Kapanış 7 · Kapak 8 / SEO 9 → geçti. Kalan: "saltanatını başlattı" olgu hatası (Ekber Şubat 1556'da
tahta çıkmıştı) → "kurtardı"; 370 karakter > 360 brief; kanca okunun ilerlemesi az, kapakta sancak kesik.

### Tur 3 (yazar düzeltmesi, yönetmen kontrolü)
Punchline "O tek ok, Ekber'in yarım asırlık saltanatını kurtardı."; açıklama düzeltildi; 355 karakter; kanca oku
~160 px ilerliyor; kapakta sancak tam. Yönetmen sheet.png + cover.jpg'yi gördü; lint hatasız.
