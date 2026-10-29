# 03 — Öğrenilmiş çaresizlik: kaçabilen ama denemeyen köpek (EK VİDEO, Shorts, Düşün Bakalım)

- **İstek:** kanal sahibi sohbetten istedi (2026-10-29): kanal sadece tarih değil, **"ibretlik hikâye + psikoloji kavramı"**
  tarzında videolar da içersin; iki örnek verdi, "tam bu tarzda örnek bir video üretip yayınla, beğenirsem kalıcı
  repoda düzenleme yaparız". Bu yüzden kurallarda (CLAUDE.md, BRAND.md, lint) kalıcı değişiklik **yok**; bu bir deneme.
- **Dosya:** `videos/2026-10-29/03-ogrenilmis-caresizlik.json` · format short · `"extra": true` ·
  publish_at `2026-10-29T21:30:00+03:00` (İstanbul 21:30; o saate kadar Studio'da zamanlanmış/özel durur, kanal sahibi
  yayından önce bakabilir).
- **Manşet:** `tools/news.py --channel db` çalıştı; bu türe (psikoloji kıssası) uyan manşet yok (siyaset, kaza, spor,
  magazin). Konu havuzdan/örnek tarzdan seçildi.
- **Geçmişle çakışma:** iki kanalın geçmişinde psikoloji deneyi yok (Phineas Gage `pg*` beyin hasarı/nöroloji, farklı).

## Örnek videoların çözümlemesi (sesten çıkarılan metin, faster-whisper)
1. **Hain keçi (Judas goat), 60 sn:** "Yüz koyunu ölüme götürmek için bir kurda değil bir keçiye ihtiyacım var." →
   mezbaha rampası, keçi sürüyü götürüp geri dönüyor, ödülü bir sigara → dönüş: "İşin en korkunç kısmı ne biliyor
   musun? Her sürü o keçiyi ilk kez görüyordu." → ders: "Bizi uçuruma götüren nadiren kurttur…" → kavramın adı:
   "İngilizcede bu keçinin bir adı var: Judas goat" → kapanış sorusu: "Önde yürüyen neden hep geri dönüyor?"
2. **Pirinç küpündeki fare, 82 sn:** fare pirinç dolu küpe düşüyor, rahat; küpün ağzı açık ama hiç denemiyor; pirinç
   azaldıkça dibe gömülüyor, çıkamıyor → "Aslında o küp fareyi hiç hapsetmemişti." → "Psikolojide buna konfor alanı
   tuzağı denir." → izleyicinin hayatına uygulama → "Bazen hayattaki en büyük risk olduğunuz yerde kalmaktır."
- **Ortak kalıp:** (1) tek cümlelik çarpıcı kanca → (2) kısa, somut kıssa (hayvan kahraman, tek mekân) → (3) "asıl
  şaşırtıcı/korkunç kısım" dönüşü → (4) kavramın adı ("Psikolojide buna … denir") → (5) izleyicinin kendi hayatı
  ("bizler de…") → (6) akılda kalan aforizma. Görsel: tek mekânda tek kahraman hayvan, sade sepya, el çizimi,
  ekranda tek kelimelik kavram etiketleri ("rutin", "tutsaklık", "Judas Goat").
- **Bizim farkımız:** kıssa uydurma masal değil **gerçek, kaynaklı** (kanalın "gerçek hikâye" kimliği korunur) ve
  bir sürpriz ekler: deneyi yapan bilim insanı 50 yıl sonra kendi teorisini tersine çevirdi.
- **Süre:** örnekler 60–80 sn; bizim Shorts sert sınırımız 550 karakter (~38–40 sn) ve ElevenLabs bütçe uyarısı açık.
  Bu deneme sınırın içinde kalır; tarz beğenilirse bu tür için daha uzun bir sınır kalıcı kurala eklenebilir.

## Konu
- **Havuz:** (yeni) psikoloji / insan davranışı kıssası, gerçek deney.
- **İzleyici sonunda ne hisseder:** "Ben de denemeyi bıraktığım şeyler için kendime tembel diyordum; meğer sadece hiç
  kazanmamışım." + umut.
- **Kanca + kapak:** ilk cümle "Bu köpek kaçabilirdi ama denemedi." ↔ kapak **"KAÇABİLİRDİ / AMA DENEMEDİ"**
  (DENEMEDİ kırmızı kutuda). Tek simge: alçak bölmeli kutuda yere yatmış köpek, bölmenin öbür yanı açık/aydınlık;
  yanında şokta büyük Kaşif.

## Doğrulanan bilgiler (yönetmen)
- Seligman, M. E. P. & Maier, S. F. (1967). "Failure to escape traumatic shock." *Journal of Experimental Psychology*
  74(1), 1–9 (Pennsylvania Üniversitesi). Köpeklerin bir grubu koşum takımında (harness) bir paneli iterek şoku
  kesebildi; "yoked" grup aynı şokları aldı ama kesemedi. Sonra hepsi **mekik kutusuna** (shuttle box, ortada alçak
  bir bölme) kondu: bölmenin üstünden atlamak şoku bitiriyordu. Kaçamayan şok almış köpekler çoğunlukla kaçmadı;
  birkaç denemeden sonra yere yatıp şoku "kabullendi". Kesin oran anlatılmaz ("çoğu").
- Maier, S. F. & Seligman, M. E. P. (2016). "Learned helplessness at fifty: Insights from neuroscience."
  *Psychological Review* 123(4), 349–367: "the original theory got it backwards": pasiflik öğrenilmez; uzun süren
  kötü olaylara karşı **varsayılan, öğrenilmemiş** tepkidir (beyin sapında dorsal rafe çekirdeği). Öğrenilen şey
  **kontrol**: olayların kontrol edilebildiğini fark etmek (ön beyin, medial prefrontal korteks) bu varsayılanı
  frenler. 1967 → 2016 = 49 yıl, makalenin adı "at fifty" → "elli yıl sonra" (yaklaşık, adıyla uyumlu).
- Kaynaklar: https://doi.org/10.1037/h0024514 · https://pmc.ncbi.nlm.nih.gov/articles/PMC4920136/ ·
  https://en.wikipedia.org/wiki/Learned_helplessness
- Ton: hayvan acısı sansasyon için kullanılmaz; şok ekranda sadece küçük bir zikzak işaretiyle gösterilir, köpek
  acı çekerken çizilmez (yatmış, kulakları düşük, bekliyor). Kan, kıvranma, bağırma yok.

## Anlatım (tek parça; yönetmen; ~535 karakter)
Bu köpek kaçabilirdi ama denemedi. 1967'de psikolog Martin Seligman, köpeklere kaçamadıkları şoklar verdi. Sonra
onları alçak bir bölmeli kutuya koydu. Tek bir zıplama acıyı bitirecekti. Ama çoğu yere yattı ve bekledi. Buna
öğrenilmiş çaresizlik dendi. Peki şaşırtıcı kısım ne? Elli yıl sonra Seligman teorisini tersine çevirdi. Pes etmek
öğrenilmiyordu, beynin ilk tepkisiydi. Öğrenilen şey umuttu. Yani hep kaybeden biri tembel değildir; sadece hiç
kazanmamıştır. Pes etmeyi değil, umudu öğreniriz. Her gün böyle bir hikâye için abone olun.

- İlk cümle 6 kelime, kapakla aynı fikir. "-yor" ile biten cümle yok. Devrik cümle yok. Dönüş: "Peki şaşırtıcı kısım
  ne?" (örnekteki "İşin en korkunç kısmı ne biliyor musun?" kalıbı). Kavramın adı: "Buna öğrenilmiş çaresizlik dendi."
  Hayata uygulama: "hep kaybeden biri tembel değildir". Aforizma: "Pes etmeyi değil, umudu öğreniriz."
- Yazar sesli okuyup düzeltebilir ama yapı ve karakter bütçesi (≤ 550) korunur.

## Çekim listesi
| # | Cümle | Görüntü (`visual`) | Tip | Set / kamera | Kaşif | Cue | Kaynak notu |
|---|---|---|---|---|---|---|---|
| 0 | Bu köpek kaçabilirdi ama denemedi. | 1960'lar laboratuvarı; ortada iki bölmeli mekik kutusu, ortadaki bölme diz boyu; sol bölmede yere yatmış, kulakları düşük köpek; sağ bölme açık ve aydınlık; kutunun yanında Kaşif bölmeyi işaret ediyor, "denemedi"de şok | lh_box (hook) | interior, orta plan; **kapak karesi** | işaret → şok | shock: denemedi | — |
| 1 | 1967'de psikolog Martin Seligman, köpeklere kaçamadıkları şoklar verdi. | Laboratuvar masası: gözlüklü, beyaz önlüklü genç Seligman (şapkasız) not defterine yazıyor; yanda koşum takımındaki köpeğin zemininde küçük zikzak şok işareti çakıyor, köpek irkiliyor; duvarda "1967" takvimi | lh_lab | interior (farklı köşe), sağa kayma | — | zap: şoklar | Seligman & Maier, 1967 |
| 2 | Sonra onları alçak bir bölmeli kutuya koydu. Tek bir zıplama acıyı bitirecekti. | Mekik kutusuna yakın plan: sol zeminde zikzak işaretleri, sağ zemin temiz; bölmenin üstünden kesikli altın bir zıplama yayı çiziliyor, ucunda "TEK ZIPLAMA" | lh_box (jump) | interior, **yakın plan** focus bölme, zoom 1.7 | — | arc: zıplama | — |
| 3 | Ama çoğu yere yattı ve bekledi. | Köpeğin yüzüne yakın plan: başı patilerinde, kaşları düşük, gözler yarı kapalı; duvardaki saatin akrebi dönüyor; altın yay solup kayboluyor | lh_box (wait) | interior, **yakın plan** focus köpek yüzü, zoom 1.8 | — | wait: bekledi | — |
| 4 | Buna öğrenilmiş çaresizlik dendi. | Laboratuvar kara tahtası tam kadraj: tebeşirle "ÖĞRENİLMİŞ ÇARESİZLİK" yazılıyor, altı çiziliyor; tahtanın kenarına iliştirilmiş 1967 dergi sayfası | lh_board | interior (tahta duvarı), itme | — | term: çaresizlik | J. Exp. Psychology, 1967 |
| 5 | Peki şaşırtıcı kısım ne? Elli yıl sonra Seligman teorisini tersine çevirdi. | Duvar takvimi/yaprak saati 1967'den 2016'ya hızla döner; tahtadaki yazının üstüne kırmızı bir ok "TERS!" diye kıvrılıp yazıyı ters çevirir; yaşlanmış, ak saçlı Seligman kendi notuna bakıp kaşını kaldırır | lh_flip | interior, geniş → çekme | — | flip: tersine | Psychological Review, 2016 |
| 6 | Pes etmek öğrenilmiyordu, beynin ilk tepkisiydi. Öğrenilen şey umuttu. | Tam kadraj dev el çizimi beyin kesiti (anatomi defteri sayfası gibi, masada): beyin sapında küçük bir bölge kendiliğinden kırmızı yanar, etiket "PES ET"; sonra ön beyinden altın ışık yayılıp o kırmızıyı söndürür, etiket "UMUT" | lh_brain | set yok (masa üstünde defter, tam kadraj), **yakın plan** itme | — | red: tepkisi, gold: umut | Maier & Seligman, 2016 |
| 7 | Yani hep kaybeden biri tembel değildir; sadece hiç kazanmamıştır. | Bugün: gece, küçük bir odada masa başında omuzları düşük bir insan; etrafında kırmızı çarpılı buruşuk kâğıtlar; önündeki bir basamak (köpeğin bölmesinin aynısı) alçak ama o bakmıyor; "kazanmamıştır"da masaya tek küçük altın yıldız düşer | lh_person | night (oda/pencere), orta plan | — | star: kazanma | — |
| 8 | Pes etmeyi değil, umudu öğreniriz. Her gün böyle bir hikâye için abone olun. | Dışarı: tepeler, sabah; aynı köpek alçak bölmenin üstünden zıplayıp aydınlık çayıra koşar; Kaşif bölmenin yanında gülümseyip el sallıyor | lh_box (out) ya da lh_field | hills, geniş, çekme | sevinç → el sallar | jump: umudu, wave: abone | — |

Kaşif 2/9 sahne (%22: açılış + kapanış). Tipler: lh_box, lh_lab, lh_board, lh_flip, lh_brain, lh_person (≥ 4).
Yakın plan: 2, 3, 6. Dekor: interior (laboratuvar) → tahta → takvim → defter → night (bugün, oda) → hills (dışarı,
özgürlük). Palet: `indigo` (son günlerde olive/ash/terracotta; soğuk laboratuvar havası). Yeni sahne kodu kendi
dosyalarında: `scenes/studio/shots/lh__lib.js` (köpek, laboratuvar, mekik kutusu çizimleri) + `lh_*.js`.

## YouTube taslağı (yazar düzeltir; lint 100/100)
- title: "Öğrenilmiş Çaresizlik: Bu Köpekler Neden Kaçmadı?" (tags[0] = "öğrenilmiş çaresizlik")
- description: ilk cümlede "öğrenilmiş çaresizlik"; 1967 deneyi + 2016'daki dönüş; "umut öğrenilir"; abone çağrısı +
  yorum sorusu ("Sence insan pes etmeyi mi öğrenir, umut etmeyi mi? Yorumlara yaz!"); son satır
  `#shorts #öğrenilmişçaresizlik #psikoloji #düşünbakalım`.
- tags (12–18): öğrenilmiş çaresizlik, öğrenilmiş çaresizlik deneyi, öğrenilmiş çaresizlik nedir, seligman köpek
  deneyi, martin seligman, psikoloji, psikoloji deneyleri, ünlü psikoloji deneyleri, motivasyon, pes etmemek, umut,
  kişisel gelişim, ilginç bilgiler, düşün bakalım …
- category_id "27", `"extra": true`, publish_at `2026-10-29T21:30:00+03:00`.

## Nihai anlatım (yazar, düzeltme turu 1)
Bu köpek kaçabilirdi ama denemedi. 1967'de iki psikolog, köpeklere kaçamadıkları şoklar verdi. Sonra tek
zıplamayla kaçabilecekleri bir kutuya koydular. Ama çoğu yere yattı ve bekledi. Buna öğrenilmiş çaresizlik dendi.
İşin şaşırtıcı kısmı? Elli yıl sonra aynı ikili, teorilerini tersine çevirdi. Pes etmek beynin ilk tepkisiydi;
öğrenilen şey kontroldü. Yani denemeyi bıraktıysanız tembel değilsiniz; henüz kazanmadınız. Pes etmeyi değil, umudu
öğreniriz. Her gün böyle bir hikâye için abone olun.

- **498 karakter** (yönetmen metni 512 idi; iki küçük kırpma: "Sonra onları tek zıplamayla" → "Sonra tek zıplamayla",
  "aynı iki psikolog" → "aynı ikili"). Tahmini süre ~35 sn, 10 sahne (2,4–5,6 sn; en uzun sahne 5, içinde iki
  görsel olay var: takvim sayımı + kelimenin ters dönmesi).
- Lint hatasız, uyarı yok. "-yor" ile biten cümle yok, devrik cümle yok, ilk cümle 6 kelime.

### Doğrulama notları (yazar)
- Seligman & Maier (1967), *J. Exp. Psychology* 74(1), 1–9 (doi 10.1037/h0024514): koşum takımında kaçamayan
  ("yoked") şok alan köpekler sonra mekik kutusunda (alçak bölme, üstünden atlamak şoku bitiriyor) çoğunlukla kaçmadı.
  Oran söylenmedi ("çoğu"). Seligman o yıllarda Pennsylvania'da doktora öğrencisiydi; "psikolog" demek doğru ve sade.
  Deney 1965–67 arasında yapıldı; "1967'de" makalenin yılıdır, yaygın kullanım.
- Maier & Seligman (2016), *Psychological Review* 123(4), 349–367, "Learned helplessness at fifty": pasiflik
  öğrenilmez, uzun süren kötü olaylara karşı varsayılan tepkidir (beyin sapında dorsal rafe çekirdeği); öğrenilen şey
  kontroldür (medial prefrontal korteks bu tepkiyi frenler). 1967 → 2016 = 49 yıl; makalenin adı "elli yıl" diyor.
- "Öğrenilen şey umuttu": makale "kontrol beklentisi" der; Seligman bunu sonradan kendisi "umut devresi" olarak
  anlatır (anı kitabı *The Hope Circuit*, 2018). Açıklamada "Öğrenilen şey kontrol, yani umut" diye ikisi birlikte yazıldı.
- 1. tur düzeltmesi: anlatım artık "öğrenilen şey kontroldü" diyor (makalenin kendi ifadesi); ekranda "KONTROL = UMUT".
- 1967 sahnesinde artık iki psikolog var (Seligman gözlüklü önlüklü, Maier kazaklı); 2016 sahnesinde ikisi de ak saçlı.
- Ekranda: beyin sapındaki kırmızı bölge = dorsal rafe, öndeki altın ışık = medial prefrontal korteks (adları
  ekranda yazmaz, 5 kelime sınırı). Şok ekranda sadece küçük altın zikzak işaretleri; köpek acı çekerken çizilmedi.

## Kapak adayları
**İlk teslim (eleştirmen 7 verdi):** A/B/C (eski düzen, köpek küçük) → A2/B2/D2, D2 seçilmişti.

**Düzeltme turu 1, üç gerçek aday** (dosyalar scratchpad `covers/` klasöründe; 270 px genişlikte yan yana karşılaştırıldı: `r4_small.png`):
- **R4A_hook (SEÇİLDİ):** sahne 0 kanca karesi, focus [456, 679], zoom 1.15. Sol bölme koyu lacivert, altın
  zikzaklar yalnızca solda; kalın, alçak bölme; sağ bölme sıcak altın ışık hüzmesiyle aydınlık. Köpek kadrajda tam
  (kuyruktan buruna), Kaşif sağ bölmede şokta (yüz büyük, şapka kenarı çerçeveden ~60 px içeride), alt bant kutunun
  ön tahtaları. Şok cihazı kaldırıldı. Telefon boyunda bile "karanlık taraf / aydınlık çıkış / bölme / yatan köpek /
  şaşkın Kaşif" hikâyesinin tamamı okunuyor; kanca karesiyle aynı olduğu için ilk 2 saniyeyle de birebir uyumlu.
- **R4B_sad:** sahne 3 yakın planı (hüzünlü, gözleri açık köpek yüzü kadrajın yarısı) + motorun büyük Kaşif'i
  (cover.kasif shock). Köpeğin duygusu en güçlü aday ama aydınlık çıkış tarafı ince bir şerit kalıyor, Kaşif kutunun
  önünde havada duruyor gibi; kapak sahne 3 olursa kanca karesi de sahne 3 olur ve aynı kare videoda iki kez görünür.
- **R2C_leap:** sahne 8 zıplama + Kaşif. Görsel olarak canlı ama yazıyla çelişiyor ("DENEMEDİ" derken köpek
  zıplıyor); elendi.

## Eleştiri günlüğü

### 03-ogrenilmis-caresizlik — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 7 | 6 | 7 | 6 | 7 | 7 | 7 |
1. Kapak/sahne 0: "kaçabilirdi" okunmuyor (ince bölme, sağ bölme ayırt edilmiyor, köpek kesik, Kaşif çerçeveye değiyor, alt %20 boş + yarım cihaz; tek kapak adayı) → bölme kalın, sağ taraf altın "çıkış", köpek tam, Kaşif içeride, 3 aday.
2. Tempo: 547 karakter ~40 sn, 4 sahne > 4 sn; kapanışta tekrar ("umuttu" / "umudu") → metin ~500'e indi, sahne 8 ikiye bölündü.
3. Sahne 3: köpek huzurla uyuyor gibi, sahne 2'nin kopyası, alt %40 gri cihaz → gözler açık hüzünlü, göz hizası zoom, cihaz kalktı.
- Doğruluk: "Seligman teorisini tersine çevirdi" yanlış atıf (2016 makalesi Maier & Seligman; nörobilim Maier'in Colorado laboratuvarı) → "iki psikolog / aynı ikili"; makale "öğrenilen şey kontrol" diyor → anlatımda "kontrol" geçiyor. İzleyiciye "siz" hitabı eklendi. Hayvan acısı sansasyon için kullanılmamış (onaylandı).
- Yönetmen yeni anlatımı verdi; yazar düzeltti (498 karakter, ~35 sn, 10 sahne, lint OK uyarısız).

### 03-ogrenilmis-caresizlik — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 7 | 8 | 9 | 8 | 8 |
**GEÇTİ** (tümü ≥ 7, kapak 8; lint uyarısız, 498 karakter, ~35 sn, 10 sahne, Kaşif 2/10). Örnek tarza uyum ~8/10.
1. Sahne 2–3: alt ~%45 desensiz kutu tahtası, iki sahne benzer; sahne 3'teki saat kadraj dışında → focus aşağı, ızgara zemin büyüsün.
2. Kapak R4A: köpeğin gözü kapalı ("uyuyor" gibi), Kaşif'in bacakları bölmenin üstünden geçiyor → göz açık-hüzünlü, Kaşif sağa.
3. Sahne 9: Kaşif'in şapkası sağ kenara değiyor, köpeğin ön bacakları çapraz → Kaşif içeri, bacaklar paralel.
- Yönetmen kararı: geçti, ama bu üç rötuş için kısa bir son düzeltme yapıldı (metin değişmedi); sonucu yönetmen kendi gözüyle kontrol etti (aşağıda).
- Son düzeltme (yazar): kapakta köpeğin gözü açık-hüzünlü, Kaşif aydınlık tarafta (bölmeden ayrı); sahne 9 zoom 1.45, Kaşif içeride, köpeğin ön bacakları paralel; sahne 3 ızgara zemin + zoom 2.6 (saat çıkarıldı). Lint OK uyarısız. Yönetmen cover.jpg ve sheet.png'yi kendi gözüyle kontrol etti: onaylandı.
