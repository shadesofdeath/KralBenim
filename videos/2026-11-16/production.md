# 2026-11-16 — Düşün Bakalım üretim notu

Plan (`tools/plan.py`): 1 Shorts (`01-…`, 19:00 İstanbul) + 1 uzun video (`02-…`, 20:30 İstanbul). Sonraki uzun video: 2026-11-18.
ElevenLabs: `warning: true` (ay içi 248.465 / bütçe 231.442, yenileme 2026-11-20) → karakterler alt uçta
(Shorts ~330–360, uzun ~3.900–4.050).

## Manşet
`tools/news.py --channel db` çalışmadı (bulut ağından Google News'e erişim yok: 403). Web aramasında güncel, havuza uyan
belirli bir manşet bulunamadı → iki video için de konu havuzdan (plan kategorileri: Shorts "büyük kararlar ve savaşlar",
uzun "keşifler ve icatlar").

## 01 — Kadeş Savaşı ve ilk barış (Shorts) · `01-kades-savasi.json`
- **Konu:** Kadeş Savaşı (MÖ ~1274, Asi/Orontes kıyısı, bugünkü Suriye): Mısır firavunu II. Ramses ile Hitit kralı II. Muvatalli.
  Ramses ordusu pusuya düştü, Ramses kendi anlatımına göre tek başına geri püskürttü; savaş belirsiz bitti, Kadeş Hititlerde kaldı.
  Ramses zaferini Karnak, Luksor, Ebu Simbel, Ramesseum duvarlarına kazıttı; Hitit kaynakları başka anlatır. ~16 yıl sonra
  (MÖ ~1259) Ramses ile III. Hattuşili barış antlaşması imzaladı: bilinen en eski barış antlaşmalarından biri. Hititçe (Akadça)
  kil tablet kopyası Hattuşa'da (Boğazköy) bulundu, bugün İstanbul Arkeoloji Müzeleri'nde; büyütülmüş bir kopyası BM binasında.
- **Havuz:** büyük kararlar ve savaşlar (Anadolu / Hititler). Geçmişte Kadeş ayrı işlenmedi (Hattuşa Short'unda tek cümle).
- **İzleyici sonunda ne hisseder:** sessiz ironi; zafer duvarlara yazıldı, ama asıl kalan şey bir barış tableti.
- **Kanca + kapak:** "Bu savaşı iki taraf da kazandı." ↔ kapak `İKİ TARAF DA / KAZANDI` (vurgu: kazandı); tek özne: ışık
  havuzunda çivi yazılı kil tablet ya da iki kral silueti arasında kırık bir mızrak.
- **Tema:** `kum` (Mısır/Suriye çölü, kil; önceki DB videosu `derin`).

### Anlatım taslağı (yönetmen; yazar sesli okuma testinden geçirip sıkılaştırır, 330–360 karakter)
Bu savaşı iki taraf da kazandı. En azından öyle yazdılar. Yaklaşık 3.300 yıl önce, Kadeş'te. Mısır firavunu Ramses ve Hitit
ordusu karşı karşıya geldi. Savaş belirsiz bitti. Ramses zaferini tapınak duvarlarına kazıttı. Hititler başka bir hikâye
anlattı. On altı yıl sonra iki krallık barış yazdı. O kil tablet bugün İstanbul'da duruyor. Kazanılamayan bir savaş, ilk
barışlardan birini bıraktı. Böyle sessiz hikâyeler için abone olun.

### Anlatım (son) — yazar, eleştiri turu 1 sonrası (383 karakter, preview ~28 sn)
Bu savaşı iki taraf da kazandı. En azından öyle yazdılar. Üç bin üç yüz yıl önce, Kadeş'te Mısır ile Hititler çarpıştı.
Savaş belirsiz bitti. Ramses geri döndü. Ama zaferini duvarlara kazıttı. Kadeş ise Hititlerin elinde kaldı.
Yıllar sonra barış yazıldı. O kil tablet bugün İstanbul'da. Kazanılamayan bu savaş, ilk barışlardan birini bıraktı.
Böyle sessiz hikâyeler için abone olun.

Doğrulama: savaş yaklaşık MÖ 1274/1275 (Britannica, World History Encyclopedia), sonuç belirsiz; Ramses Mısır'a döndü,
Kadeş Hititlerin (II. Muvatalli) elinde kaldı; antlaşma yaklaşık MÖ 1259/1258, II. Ramses ile III. Hattuşili; Akadca kil
tablet kopyası Hattuşa'da (Boğazköy) bulundu, İstanbul Arkeoloji Müzeleri'nde, kopyası BM binasında (turkishmuseums.com).
"15 ya da 16 yıl" kaynağa göre değiştiği için "Yıllar sonra"; "ilk barış antlaşması" yerine "ilk barışlardan biri".
"Çünkü kimse geri çekilmedi" önerisi doğru değil (Ramses geri döndü), yerine "Ramses geri döndü. Ama…" bağlantısı.

### Çekim listesi (yeni tipler `scenes/studio/shots/bt_kades.js`)
| # | Cümle | Tip | Görüntü | Cue |
|---|---|---|---|---|
| 0 | Bu savaşı iki taraf da kazandı. | `bt_kd_standards` | ışık havuzunda tek özne: çapraz iki sancak (firavunun mavi yelpaze başlıklı direği + Hitit kıvrık asası), dibinde ortadan kırık mızrak; flamalar ve düğüm altına döner | kazandı |
| 1 | En azından öyle yazdılar. | `bt_kd_wall` glyphs | kumtaşı duvarda hiyeroglif sütunları oyulur, kartuş altın | yazdılar |
| 2 | Üç bin üç yüz yıl önce, Kadeş'te Mısır ile Hititler çarpıştı. | `bt_kd_map` | yakın Doğu Akdeniz: mavi-gri deniz + "Akdeniz", Kıbrıs, Asi; Hatti/Mısır rotaları Kadeş'e çizilir; Kadeş + "yaklaşık MÖ 1274"; buluşmada altın halka | Kadeş, çarpıştı |
| 3 | Savaş belirsiz bitti. Ramses geri döndü. | `bt_kd_field` after | yarı gömülü kırık tekerlek, eğik mızrak; ufukta eve dönen küçük savaş arabası kolu; güneş pusa batar | belirsiz |
| 4 | Ama zaferini duvarlara kazıttı. | `bt_kd_wall` relief | savaş arabasında yay geren firavun + uzun boyunlu, ince bacaklı at kabartması, altınla çizilir | duvarlara |
| 5 | Kadeş ise Hititlerin elinde kaldı. | `bt_kd_kings` hatti | firavun ve sivri başlıklı, saç örgülü Hitit kralı; arkada surlu Kadeş kalesi; firavun gölgeye çekilir, kale altınla çizilir | Hititlerin |
| 6 | Yıllar sonra barış yazıldı. | `bt_kd_tablet` | köşesi kırık kil tablet, satırlar basılır, üç satır altın | barış |
| 7 | O kil tablet bugün İstanbul'da. | `bt_kd_museum` | spot altında vitrin; kaidede "İstanbul / Arkeoloji Müzeleri" | İstanbul |
| 8 | Kazanılamayan bu savaş, ilk barışlardan birini bıraktı. | `bt_kd_tablet` peace | tek özne tablet, önünde kırık mızrak; satırlar birer birer altın | barışlardan |
| 9 | Böyle sessiz hikâyeler için abone olun. | `bt_kd_field` river | bugün: Asi nehri, Kadeş höyüğü, kamışlar, batan güneş | — |

Kapak: `İKİ TARAF DA / KAZANDI` (vurgu: kazandı), sahne 0, t 2.2; kapakta (html.cover) flamalar her zaman altın.
Tur 1 adayları: (A) çapraz sancaklar, odaksız — **seçildi** (tek özne, her şey kadrajda, kırık mızrak y ≈ 1390–1445);
(B) aynı sahne focus [540,830] zoom 1.25 — kıvrık asa ve sağ flama kesiliyor; (C) sahne 5 (iki kral + kale), focus
[620,860] zoom 1.2 — kalabalık, tek özne değil.

### Eleştiri günlüğü
#### 01-kades-savasi — tur 1 (eleştirmen; yönetmen aktardı)
Kapak 6, Görsel=anlatım 6; diğer kriterler 7–8.
1. Kapak: iki kral, tek özne değil; sol flama x=0'da kesik, kırık mızrak y≈1520–1580 (YouTube arayüzü); kapak anında flamalar altın değil; Hitit kralı keşiş cüppesine benziyor.
2. Sahne 2 harita okunmuyor: deniz/kara tonları, etiket çakışması, harita küçük, cue çok.
3. Metin kısa (~26 sn) ve vaadi açmıyor; sahne 3 < 2 sn; sahne 8 altyazısı ortadan bölünüyor; sahne 4 at keçiye benziyor; antlaşma sahnesindeki Hitit kralı Muvatalli ile aynı; nehirde skewX sallanması.

**Yazarın düzeltmeleri (tur 1 → 2):**
- Kapak/sahne 0: yeni `bt_kd_standards` — çapraz iki sancak tek özne, kırık mızrak kapakta y ≈ 1390–1445, her şey kadrajda; kapakta flamalar ve düğüm hep altın (cue zamanından bağımsız). 3 aday karşılaştırıldı (yukarıda).
- Hitit kralı yeniden çizildi: sivri başlık (altın bant), uzun saç örgüsü, saçaklı pelerin, ucu kalkık ayakkabı; firavun flaması kısaltıldı (kadraj içinde).
- Harita: yakın plan (Kıbrıs → Asi), ölçek 165, y ≈ 150–1150; deniz mavi-gri + dalga çizgileri, "Akdeniz" ve "Kıbrıs" denizde, Kıbrıs gerçek silüet, Nil kaldırıldı (kadraj dışı), Kadeş etiketi halkanın solunda (çakışma yok), Asi etiketi nehrin doğusunda, nehirde akan ışık; cue 4 → 2.
- Metin 359 → 383 karakter, preview ~28 sn: "Ramses geri döndü. Ama zaferini…", "Kadeş ise Hititlerin elinde kaldı." (somut sonuç), sahne 3 artık 3,2 sn; sahne 8 "Kazanılamayan bu savaş," virgülle bölünüyor (altyazı iki tam parça).
- Sahne 3: ufukta eve dönen savaş arabası kolu eklendi (Ramses geri döndü). Sahne 4: at yeniden çizildi (uzun kavisli boyun, ince bacaklar, iki tutam kuyruk, yele, sorguç).
- Sahne 5: el tableti kaldırıldı, arkaya surlu Kadeş kalesi; cue "Hititlerin"de kale altınla çizilir.
- Sahne 8: krallar yerine tek özne tablet (`bt_kd_tablet` peace), önünde kırık mızrak — Muvatalli/Hattuşili karışıklığı yok.
- Sahne 9: kamışlardaki skewX salınımı kaldırıldı.
- lint: OK; preview: STATIC uyarısı yok (hareket 0,7–5,6).

## 02 — Rosetta Taşı ve Champollion (uzun) · `02-rosetta-tasi.json`
- **Konu:** Rosetta Taşı. Temmuz 1799, Napolyon'un Mısır seferi; Reşit (Rosetta) yakınında bir kale onarılırken Fransız
  askerleri (subay Pierre-François Bouchard) yazılı bir taş buldu. MÖ 196'da Memfis'te V. Ptolemaios adına çıkarılmış bir
  rahipler fermanı; aynı metin üç yazıyla: hiyeroglif, demotik, eski Yunanca. 1801 İskenderiye kapitülasyonuyla İngilizlere
  geçti, 1802'den beri British Museum'da. Hiyeroglifle yazılmış bilinen son yazıt MS 394 (Philae) → ~1.400 yıl kimse okuyamadı.
  Thomas Young (kartuşlar, Ptolemaios adı, demotik ilerleme) ve Jean-François Champollion (Kıptice bilgisi; Eylül 1822'de
  Ebu Simbel kartuşlarından Ramses ve Thutmosis adlarını okudu; rivayete göre ağabeyine "Buldum!" deyip bayıldı; 27 Eylül 1822
  "Lettre à M. Dacier"). Asıl keşif: hiyeroglifler hem ses hem anlam işaretiydi.
- **Havuz:** keşifler ve icatlar (bir yazının çözülmesi). Geçmişte Rosetta/Champollion yok.
- **Short'tan farkı:** Short bir savaş ve barış (Hititler, MÖ 13. yy); uzun video bir taşın ve bir dilin çözülmesi (1799–1822).
  Bağ: Champollion'un ilk okuduğu adlardan biri Ramses'ti (anlatımda kısa bir ses, zorunlu değil).
- **İzleyici sonunda ne hisseder:** derin zamanın ürpertisi; 1.400 yıl susan bir medeniyetin bir anda yeniden konuşması.
- **Kanca + kapak fikri:** soğuk açılış: 1822, Paris, bir oda, bir adam bayılıyor / ya da 1799 çölde topraktan çıkan kara taş.
  Kapak `1.400 YIL / SUSTU` (vurgu: sustu) ya da `KİMSE / OKUYAMADI` (vurgu: okuyamadı); tek özne: ışık havuzunda kara taş,
  yüzeyinde üç yazı bandı.
- **Tema:** `grafit` (granodiyorit taş; Short'tan farklı).

### Anlatım
Baş yazar ajan yazar (aşağıya ekler), 3.900–4.050 karakter, 5 bölüm.

Anlatım (baş yazar, tek parça; **4029 karakter** = sahne metinleri boşlukla birleşik, lint ölçüsü). Python ile ölçüldü: '-yor' ile biten cümle 2/94 (yalnız bugünü anlatan son bölümde); devrik cümle, 'Peki', 'inanılmaz', ünlem, kısaltma yok ('MÖ' → 'Milattan önce'). Bölüm sonları ve her ~840 karakter lint HOOK simülasyonundan geçiyor; SEO `seo_score` = 100/100.

Paris, Eylül 1822. Bir adam, elinde kâğıtlarla dar bir sokakta koşuyordu. Ağabeyinin odasına daldı ve tek bir söz söyledi. Buldum. Rivayete göre hemen ardından yere yığıldı. Masadaki kâğıtlarda bir firavunun adı vardı. Ve o adı, bin dört yüz yıldır kimse okuyamamıştı. Bu adam, ölü bir yazıyı yeniden konuşturmuştu. Nasıl? Herkes cevabın kara bir taşta olduğunu söyler. Ama taş, hikâyenin sadece yarısıydı.

24 Ağustos 394. Nil'in güneyinde, Philae adasında bir rahip, tapınağın duvarına birkaç satır kazıdı. Bilinen son hiyeroglif yazıt buydu. Ondan sonra kimse bu işaretlerle yazmadı. Tapınaklar kapandı. Ve yazıyı okuma bilgisi, son rahiplerle birlikte kayboldu. Yüzyıllar boyunca bilginler bu işaretlerin gizli semboller olduğuna inandı. Her kuşun, her gözün, her yılanın derin bir fikri sakladığını sandılar. Bu yanlış inanç, kapıyı kilitli tuttu. Ama anahtar, eski bir duvarın içinde bekliyordu.

1798'de Napolyon'un ordusu Mısır'a çıktı. Askerlerle birlikte yüzü aşkın bilgin de gelmişti. Temmuz 1799. Reşit kasabasının yakınında, Fransızlar eski bir kaleyi onarıyordu. Teğmen Pierre-François Bouchard, eski bir duvarın taşları arasında koyu renkli bir taş fark etti. Taşın yüzü üç ayrı yazıyla kaplıydı. En üstte hiyeroglif. Ortada, Mısırlıların gündelik yazısı demotik. En altta eski Yunanca. Yunanca okunabiliyordu. Ve aynı fermanın üç yazıyla yazıldığını söylüyordu. Milattan önce 196'da Memfis'teki rahipler, on üç yaşındaki kral Ptolemaios'u onurlandırmıştı. Ama taşın üst kısmı kırıktı. Hiyerogliflerden sadece on dört satır kalmıştı. 1801'de Fransızlar yenildi. Taş İngilizlere geçti ve ertesi yıl Londra'da British Museum'a kondu. Kopyaları bütün Avrupa'ya dağıldı. Anahtar artık herkesin elindeydi. Ama kapıyı kimse açamadı.

Londra'da hekim Thomas Young, 1814'te taşın üzerine eğildi. Bazı işaretler oval bir çerçevenin içindeydi. Bunlara kartuş denir; içlerinde kral adları vardı. Çerçevedeki ad Ptolemaios'tu. Young, işaretlerin bu adı seslerle yazdığını gösterdi. Ama orada durdu. Ona göre sesler sadece yabancı adlar içindi. Fransa'da ise Jean-François Champollion vardı. Gençken birçok dil öğrenmişti. Biri her şeyi değiştirecekti: Kıptice. Kıptice, eski Mısır dilinin son hâliydi ve kilise dualarında hâlâ yaşıyordu. 1822'de eline bir dikilitaşın kopyası geçti. Üstünde bir kartuş daha vardı: Kleopatra. İki adı yan yana koydu. P, O ve L, iki adda da aynı işaretlerle yazılmıştı. Ama bunlar Yunan kökenli kralların adlarıydı. Gerçek Mısırlılar da sesle mi yazmıştı?

14 Eylül 1822'de Ebu Simbel tapınağından çizimler geldi. Bu adlar çok daha eskiydi. Bir kartuşun başında bir güneş diski vardı. Güneş, Mısır dilinde Ra'ydı. Ardından bildiği bir işaret geldi: mes. Ve sonda, s sesi. Ra, mes, ses. Ramses. Kıpticede mise, doğurmak demekti. Ad, kendi anlamını taşıyordu: Ra onu doğurdu. İşte sır buydu. Aynı işaret hem bir resimdi hem bir ses. Champollion kâğıtları kapıp ağabeyine koştu. Yere yığılan adam oydu. Sık anlatılan hikâyede Rosetta Taşı bu yazıyı tek başına çözdü. Öyle olmadı. Taş kapıyı gösterdi. Kilidi Kıptice, yıllarca süren sabır ve uzak bir tapınaktan gelen bir ad açtı. 27 Eylül 1822'de Champollion buluşunu Paris'te bilginlere okudu. Hemen yanında Thomas Young oturuyordu. İki rakip ilk kez yüz yüzeydi. Young, kendi payının unutulduğunu düşündü. Ama taşın kendi hikâyesi bitmemişti.

Champollion 1828'de Mısır'a gitti, tapınak duvarlarını okudu. Dört yıl sonra, kırk bir yaşında öldü. Taş ise hâlâ British Museum'da. Yan yüzünde beyaz boyayla bir satır var: 1801'de İngiliz ordusu tarafından Mısır'da ele geçirildi. Mısır'da birçok kişi taşın geri dönmesini istiyor. 2022'de bir dilekçe yüz bini aşkın imza topladı. Müze ise 1801 anlaşmasının geçerli olduğunu söylüyor. Bin dört yüz yıl susan yazı nasıl yeniden konuştu? Bir taş aynı sözü üç yazıyla söyledi. Bir dil dualarda yaşadı. Ve bir adam, bir güneş resminin aynı zamanda bir ses olduğunu gördü. Sizce bu yazıyı asıl kim çözdü: yolu açan Young mu, kapıdan geçen Champollion mu? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun.

### Bölümler
- Sahne 0–5 (6): soğuk açılış (sahne 0 tipi chapter DEĞİL; `"chapter": "Paris, 1822"`). Açık döngü: "Ölü bir yazıyı nasıl yeniden konuşturdu?" + "taş hikâyenin sadece yarısıydı"; cevap sahne 39–40 ve 46–47.
- Sahne 6–11 (6): I Sessizlik · Philae, 394
- Sahne 12–21 (10): II Kara taş · Reşit, 1799
- Sahne 22–30 (9): III Yarış · Londra · Paris, 1814 – 1822
- Sahne 31–42 (12): IV Ses mi, resim mi? · 14 Eylül 1822 (yaygın yanlışın düzeltilmesi: sahne 39–40)
- Sahne 43–49 (7): V Taş bugün · 1828 – bugün
- Bölüm kartları (`bt_chapter`): 6, 12, 22, 31, 43. Görsel değişim: sokak/oda → taş → tapınak → dikilitaş → harita → kale → taş bantları → harita → kartuşlar → kilise → Ebu Simbel → güneş işareti → akademi salonu → müze → harita.

### Sahne ajanları: A / B sınırı
- **A = sahne 0–21** (soğuk açılış + I + II) → `scenes/studio/shots/bt_rosetta_a.js`. A'nın yeni tipleri (B de kullanır; **bütün modlarını A yazar**):
  `bt_ros_street` (run), `bt_ros_room` (door, fall), `bt_ros_stone` (reveal, three, bands, broken, side), `bt_ros_philae` (carve + P.label, dusk, night),
  `bt_ros_obelisk`, `bt_ros_glyphs` (trio: kuş, göz, yılan), `bt_ros_wall` (hidden), `bt_ros_fort` (dig), `bt_ros_greek` (read), `bt_ros_king`, `bt_ros_copies`.
  B'nin kullandığı A modları: sahne 38 `bt_ros_street run`, 44 `bt_ros_stone side`, 46 `bt_ros_stone three`, 49 `bt_ros_philae night`. A önce bunları bitirir.
- **B = sahne 22–49** (III + IV + V) → `scenes/studio/shots/bt_rosetta_b.js`. B'nin yeni tipleri: `bt_ros_cartouche` (paper, frame, ptolemy, kleopatra, compare, mes, ramses),
  `bt_ros_desk` (young), `bt_ros_books`, `bt_ros_church`, `bt_ros_abusimbel`, `bt_ros_sign` (sun, dual, glow), `bt_ros_triad`, `bt_ros_academy`, `bt_ros_rivals` (face, ask).
  A'nın kullandığı B modu: sahne 3 `bt_ros_cartouche paper` (B önce bunu bitirir; A sahne 3'ü en son bağlar).
- Mevcut tipler: `bt_text` (4, 30, 39), `bt_map` (13, 20, 45), `bt_word` (36; `icon` vermeden), `bt_chapter` (6, 12, 22, 31, 43).
- **Hiyeroglif işaretleri sade ve gerçek değerlerine yakın** (tek çizgi, dolgu `paperLight`): Ptolemaios = tabure (p), ekmek somunu (t), kement/ilmek (o), aslan (l), m işareti, iki saz (i), katlanmış kumaş (s); Kleopatra = tepe/sepet (k), aslan (l), saz (e), kement (o), tabure (p), akbaba (a), el (t), ağız (r), akbaba (a); Ramses = güneş diski (ra), üç saplı ms işareti (mes), katlanmış kumaş (s, iki kez). Kartuş: oval + bir ucunda düz çizgi. Ortak tabure/kement/aslan aynı çizimle iki kartuşta (sahne 29 bunu gösterir). A'nın sahne 10'daki baykuş, göz, yılanı da aynı sade dil.
- Kara taş (granodiyorit, ~112 cm, kırık üst kenar, sol üst ve sağ üst köşe eksik): koyu gri gövde `inkSoft`/`paperLight` tonları, üç bant: üst kısa hiyeroglif satırları (14), orta yoğun demotik (32 satırlık his), alt düzenli Yunanca. Tema `grafit`: soluk altın vurgu, gümüş çizgi. İnsanlar yüzsüz siluet; ekranda en fazla 5 kelime.

### Çekim listesi (50 sahne)
| # | Bölüm | Metin | Visual (tek özne) | Tip | Cue | Kamera | Ajan |
|---|---|---|---|---|---|---|---|
| 0 | Paris, 1822 | Paris, Eylül 1822. Bir adam, elinde kâğıtlarla dar bir sokakta koşuyordu. | Gece, dar bir Paris sokağı: iki yanda yüksek taş cepheler, tek gaz lambası (alev yavaş). Soldan sağa koşan yüzsüz bir siluet, elinde bir deste kâğıt; 'koşuyordu'da kâğıtların ucu ışıkta parlar. | `bt_ros_street {mode:'run'}` | koşuyordu | yavaş itme (varsayılan) | A |
| 1 |  | Ağabeyinin odasına daldı ve tek bir söz söyledi. | Sade bir çalışma odası: masa, üstünde tek mum ve kitap yığını; sağda kapı aralığından içeri giren siluet, elinde kâğıtlar; 'söz'de mum alevi hafifçe eğilir. | `bt_ros_room {mode:'door'}` | söz | yavaş itme (varsayılan) | A |
| 2 |  | Buldum. Rivayete göre hemen ardından yere yığıldı. | Aynı oda, alçak plan: masanın yanında yere yığılmış siluet, kâğıtlar yerde yelpaze gibi açılmış; mum yanmaya devam eder. Kanlı/dramatik değil, sessiz. | `bt_ros_room {mode:'fall'}` | yığıldı | yavaş itme (varsayılan) | A |
| 3 |  | Masadaki kâğıtlarda bir firavunun adı vardı. Ve o adı, bin dört yüz yıldır kimse okuyamamıştı. | Yakın plan: ışık havuzunda tek kâğıt yaprağı; üstünde kurşunkalemle çizilmiş dikey bir Ramses kartuşu (oval çerçeve: güneş diski, ms işareti, iki katlanmış kumaş 's') kendini çizer; 'kimse'de kâğıdın kenarları karanlığa erir. | `bt_ros_cartouche {mode:'paper'}` | firavunun, kimse | yakın: focus kartuş, zoom 1.3 | B |
| 4 |  | Bu adam, ölü bir yazıyı yeniden konuşturmuştu. Nasıl? | Işık havuzunda büyük ince 'nasıl?'; altında küçük italik 'ölü bir yazı'. | `bt_text` | nasıl | yavaş itme (varsayılan) | — |
| 5 |  | Herkes cevabın kara bir taşta olduğunu söyler. Ama taş, hikâyenin sadece yarısıydı. | Karanlıkta dik duran kara bir taş levha (kırık üst kenar, yüzeyinde soluk yazı bantları); 'kara'da taş ışık havuzunda belirir; 'yarısıydı'da ışık yalnız taşın sol yarısında kalır, sağ yarısı karanlığa çekilir. | `bt_ros_stone {mode:'reveal'}` | kara, yarısıydı | yavaş itme (varsayılan) | A |
| 6 | Sessizlik | 24 Ağustos 394. Nil'in güneyinde, Philae adasında bir rahip, tapınağın duvarına birkaç satır kazıdı. | Bölüm kartı: altın 'I', ince çizgi, büyük ince 'Sessizlik', italik 'Philae, 394'. | `bt_chapter {n:'I', title:'Sessizlik', sub:'Philae, 394'}` | — | sabit | — |
| 7 |  | Bilinen son hiyeroglif yazıt buydu. Ondan sonra kimse bu işaretlerle yazmadı. | Nil üstünde Philae tapınağının pilon kapısı silueti, suda ince yansıma; kapının yanındaki duvarda küçük bir tanrı figürü ve birkaç satır işaret ince altın çizgiyle kendini kazır; 'son'da italik '394' belirir. | `bt_ros_philae {mode:'carve'}` | son | yavaş itme (varsayılan) | A |
| 8 |  | Tapınaklar kapandı. Ve yazıyı okuma bilgisi, son rahiplerle birlikte kayboldu. | Aynı tapınak, alacakaranlık: kapının önünde tek kandil; 'kayboldu'da alev yavaşça söner, duvardaki altın satırlar griye döner, ince duman yükselir. | `bt_ros_philae {mode:'dusk'}` | kayboldu | yavaş itme (varsayılan) | A |
| 9 |  | Yüzyıllar boyunca bilginler bu işaretlerin gizli semboller olduğuna inandı. | Gece, yıldızlı gök altında tek, yüksek dikilitaş (alttan bakış); yüzeyinde dikey sıra işaretler; 'semboller'de işaretler birer birer soluk altın parlar. | `bt_ros_obelisk` | semboller | yavaş itme (varsayılan) | A |
| 10 |  | Her kuşun, her gözün, her yılanın derin bir fikri sakladığını sandılar. | Işık havuzunda sırayla üç büyük, sade hiyeroglif: kuş (baykuş), göz, yılan; her biri cue'sunda kendini çizer; sonda üçünün altında soluk italik 'gizli anlam?'. | `bt_ros_glyphs {mode:'trio'}` | kuşun, gözün, yılanın | yavaş itme (varsayılan) | A |
| 11 |  | Bu yanlış inanç, kapıyı kilitli tuttu. Ama anahtar, eski bir duvarın içinde bekliyordu. | Yıkık bir kale duvarının kesiti: üst üste sade taş blokları; 'anahtar'da aralarındaki tek koyu taşın kenarı ince altın bir çizgiyle belirir. | `bt_ros_wall {mode:'hidden'}` | anahtar | yavaş itme (varsayılan) | A |
| 12 | Kara taş | 1798'de Napolyon'un ordusu Mısır'a çıktı. Askerlerle birlikte yüzü aşkın bilgin de gelmişti. | Bölüm kartı: 'II', 'Kara taş', italik 'Reşit, 1799'. | `bt_chapter {n:'II', title:'Kara taş', sub:'Reşit, 1799'}` | — | sabit | — |
| 13 |  | Temmuz 1799. Reşit kasabasının yakınında, Fransızlar eski bir kaleyi onarıyordu. | Sade Nil deltası haritası: kıyı çizgisi, Nil'in iki kolu; İskenderiye, Kahire ve Memfis soluk noktalar; 'Reşit'te Reşit noktası altın atar, italik 'Reşit (Rosetta)'. | `bt_map` | Reşit | yavaş itme (varsayılan) | — |
| 14 |  | Teğmen Pierre-François Bouchard, eski bir duvarın taşları arasında koyu renkli bir taş fark etti. | Gün batımında yıkık kale duvarı: kazmalı iki asker silueti uzakta, önde eğilmiş bir subay silueti (bikorn şapka); 'koyu'da taşların arasında kara taşın köşesi ışık havuzunda belirir; italik 'Bouchard'. | `bt_ros_fort {mode:'dig'}` | koyu | yavaş itme (varsayılan) | A |
| 15 |  | Taşın yüzü üç ayrı yazıyla kaplıydı. | Işık havuzunda kara taş, ön yüz; 'üç'te üç yazı bandı yukarıdan aşağı sırayla kendini çizer (üstte resimli işaretler, ortada kıvrık kısa çizgiler, altta düzenli harf satırları). Kapak adayı. | `bt_ros_stone {mode:'three'}` | üç | yavaş itme (varsayılan) | A |
| 16 |  | En üstte hiyeroglif. Ortada, Mısırlıların gündelik yazısı demotik. En altta eski Yunanca. | Aynı taş; her cue'da o bant ışıklanır, diğerleri soluklaşır; bandın yanında italik etiket: 'hiyeroglif', 'demotik', 'Yunanca'. | `bt_ros_stone {mode:'bands'}` | hiyeroglif, demotik, Yunanca | sabit (bantlar ışıkla vurgulanır) | A |
| 17 |  | Yunanca okunabiliyordu. Ve aynı fermanın üç yazıyla yazıldığını söylüyordu. | Yakın plan: Yunanca bandının birkaç satırı (sade büyük harf satırlar, bir satırda okunur 'ΠΤΟΛΕΜΑΙΟΣ'); ince altın çizgi satır boyunca okunur gibi ilerler; 'üç'te yukarıdaki iki banda doğru iki ince çizgi uzanır. | `bt_ros_greek {mode:'read'}` | okunabiliyordu, üç | yakın: zoom 1.4 | A |
| 18 |  | Milattan önce 196'da Memfis'teki rahipler, on üç yaşındaki kral Ptolemaios'u onurlandırmıştı. | Tapınak içi: tahtta oturan genç kral silueti (çift taç), önünde eğilmiş üç rahip silueti (tıraşlı baş, uzun etek); 'on üç'te kralın üstüne ışık düşer; italik 'Memfis · MÖ 196'. | `bt_ros_king` | on üç | yavaş itme (varsayılan) | A |
| 19 |  | Ama taşın üst kısmı kırıktı. Hiyerogliflerden sadece on dört satır kalmıştı. | Taşın kırık üst kenarına yakın plan; kayıp kısım kesik ince çizgiyle havada belirir ve solar; 'on dört'te kalan satırlar tek tek sayılır gibi ince altın çizgiyle işaretlenir, italik '14 satır'. | `bt_ros_stone {mode:'broken'}` | kırıktı, on dört | yakın: focus kırık kenar, zoom 1.6 | A |
| 20 |  | 1801'de Fransızlar yenildi. Taş İngilizlere geçti ve ertesi yıl Londra'da British Museum'a kondu. | Sade Akdeniz–Atlas kıyısı haritası: İskenderiye'den Cebelitarık üzerinden Londra'ya ince altın rota kendini çizer; 'Londra'da'da Londra noktası atar, italik '1802'. | `bt_map` | Londra'da | yavaş itme (varsayılan) | — |
| 21 |  | Kopyaları bütün Avrupa'ya dağıldı. Anahtar artık herkesin elindeydi. Ama kapıyı kimse açamadı. | Işık havuzunda taşın mürekkep baskısı bir kâğıt (soluk üç bant); arkasında aynı kâğıttan birkaç kopya yelpaze gibi açılır; 'kimse'de kâğıtlar karanlığa solar, yalnız ortadaki kalır. | `bt_ros_copies` | dağıldı, kimse | yavaş itme (varsayılan) | A |
| 22 | Yarış | Londra'da hekim Thomas Young, 1814'te taşın üzerine eğildi. | Bölüm kartı: 'III', 'Yarış', italik 'Londra · Paris, 1814 – 1822'. | `bt_chapter {n:'III', title:'Yarış', sub:'Londra · Paris, 1814 – 1822'}` | — | sabit | — |
| 23 |  | Bazı işaretler oval bir çerçevenin içindeydi. Bunlara kartuş denir; içlerinde kral adları vardı. | Işık havuzunda yatay bir oval çerçeve (sağ ucunda dikey çizgi) kendini çizer; içinde soluk işaretler; 'kartuş'ta altında altın italik 'kartuş'. | `bt_ros_cartouche {mode:'frame'}` | kartuş | yavaş itme (varsayılan) | B |
| 24 |  | Çerçevedeki ad Ptolemaios'tu. Young, işaretlerin bu adı seslerle yazdığını gösterdi. | Aynı kartuş, işaretler net: tabure (p), ekmek somunu (t), kement/ilmek (o), aslan (l), (m), iki saz (i), katlanmış kumaş (s); 'seslerle'de her işaretin altında küçük harf belirir: P T O L M İ S; üstte italik 'Ptolemaios'. | `bt_ros_cartouche {mode:'ptolemy'}` | seslerle | yavaş itme (varsayılan) | B |
| 25 |  | Ama orada durdu. Ona göre sesler sadece yabancı adlar içindi. | Gece, Young'ın masası: mum, açık defter, kalem; 'durdu'da kalem deftere bırakılır, defterde yarım kalmış bir satır; italik 'Thomas Young'. | `bt_ros_desk {mode:'young'}` | durdu | yavaş itme (varsayılan) | B |
| 26 |  | Fransa'da ise Jean-François Champollion vardı. Gençken birçok dil öğrenmişti. Biri her şeyi değiştirecekti: Kıptice. | Raf yerine masada üst üste dizili birkaç eski kitap sırtı; 'Kıptice'de tek kitap öne kayar, açılır, sayfasında birkaç Kıpti harfi (ⲣⲏ ⲙⲓⲥⲉ gibi sade harfler) altın belirir; italik 'Champollion'. | `bt_ros_books` | Champollion, Kıptice | yavaş itme (varsayılan) | B |
| 27 |  | Kıptice, eski Mısır dilinin son hâliydi ve kilise dualarında hâlâ yaşıyordu. | Loş bir Kıpti kilisesi içi: tek kemer, asılı tek kandil (alev yavaş), kürsüde açık dua kitabı; 'dualarında'da kitabın sayfası ışıklanır. | `bt_ros_church` | dualarında | yavaş itme (varsayılan) | B |
| 28 |  | 1822'de eline bir dikilitaşın kopyası geçti. Üstünde bir kartuş daha vardı: Kleopatra. | Soluk bir dikilitaş silueti; 'Kleopatra'da üstünden bir kartuş öne büyür: tepe/sepet (k), aslan (l), saz (e), kement (o), tabure (p), akbaba (a), el (t), ağız (r), akbaba (a); italik 'Kleopatra'. | `bt_ros_cartouche {mode:'kleopatra'}` | Kleopatra | yavaş itme (varsayılan) | B |
| 29 |  | İki adı yan yana koydu. P, O ve L, iki adda da aynı işaretlerle yazılmıştı. | İki kartuş üst üste: Ptolemaios ve Kleopatra; 'aynı'da tabure, kement ve aslan işaretleri altın yanar, aralarında ince altın çizgiler kurulur. | `bt_ros_cartouche {mode:'compare'}` | aynı | yavaş itme (varsayılan) | B |
| 30 |  | Ama bunlar Yunan kökenli kralların adlarıydı. Gerçek Mısırlılar da sesle mi yazmıştı? | Işık havuzunda büyük ince 'sesle mi?'; üstünde küçük italik 'Yunan adları'. | `bt_text` | Gerçek | yavaş itme (varsayılan) | — |
| 31 | Ses mi, resim mi? | 14 Eylül 1822'de Ebu Simbel tapınağından çizimler geldi. | Bölüm kartı: 'IV', 'Ses mi, resim mi?', italik '14 Eylül 1822'. | `bt_chapter {n:'IV', title:'Ses mi, resim mi?', sub:'14 Eylül 1822'}` | — | sabit | — |
| 32 |  | Bu adlar çok daha eskiydi. | Gece, kumun içinde kayaya oyulmuş dört dev oturan heykel silueti (Ebu Simbel cephesi), üstte yıldızlar; 'eskiydi'de cephenin ortasındaki kapıdan ince ışık sızar. | `bt_ros_abusimbel` | eskiydi | yavaş itme (varsayılan) | B |
| 33 |  | Bir kartuşun başında bir güneş diski vardı. Güneş, Mısır dilinde Ra'ydı. | Işık havuzunda tek, büyük güneş diski işareti (daire, ortada nokta) kendini çizer; 'Ra'ydı'da altında altın 'Ra'. | `bt_ros_sign {mode:'sun'}` | güneş, Ra'ydı | yavaş itme (varsayılan) | B |
| 34 |  | Ardından bildiği bir işaret geldi: mes. Ve sonda, s sesi. | Dikey kartuş: en üstte güneş diski, altına 'mes'te üç saplı ms işareti, 's sesi'nde katlanmış kumaş işaretleri belirir; yanlarında küçük 'ra', 'mes', 's'. | `bt_ros_cartouche {mode:'mes'}` | mes, sesi | yavaş itme (varsayılan) | B |
| 35 |  | Ra, mes, ses. Ramses. | Tam Ramses kartuşu ışık havuzunda; 'Ramses'te kartuş altın kontürle parlar, altında büyük ince 'Ramses'. Kapak adayı. | `bt_ros_cartouche {mode:'ramses'}` | Ramses | yakın: zoom 1.3 | B |
| 36 |  | Kıpticede mise, doğurmak demekti. Ad, kendi anlamını taşıyordu: Ra onu doğurdu. | Kelime kökü: 'mise' (Kıptice, doğurmak) → 'Ramses' (Ra onu doğurdu). | `bt_word` | doğurmak | yavaş itme (varsayılan) | — |
| 37 |  | İşte sır buydu. Aynı işaret hem bir resimdi hem bir ses. | Tek güneş diski işareti ortada; 'resimdi'de solunda italik 'resim', 'ses'te sağında italik 'ses' belirir; ikisi de altın, işaret ikisine ince çizgiyle bağlanır. | `bt_ros_sign {mode:'dual'}` | resimdi, ses. | yavaş itme (varsayılan) | B |
| 38 |  | Champollion kâğıtları kapıp ağabeyine koştu. Yere yığılan adam oydu. | Soğuk açılıştaki gece sokağına dönüş: koşan siluet, elinde kâğıtlar; 'yığılan'da gaz lambası titremeden söner gibi kısılır. | `bt_ros_street {mode:'run'}` | yığılan | yavaş itme (varsayılan) | A |
| 39 |  | Sık anlatılan hikâyede Rosetta Taşı bu yazıyı tek başına çözdü. Öyle olmadı. | Işık havuzunda büyük ince 'tek başına?'; 'olmadı'da altında altın italik 'öyle olmadı'. | `bt_text` | olmadı | yavaş itme (varsayılan) | — |
| 40 |  | Taş kapıyı gösterdi. Kilidi Kıptice, yıllarca süren sabır ve uzak bir tapınaktan gelen bir ad açtı. | Üç öğe yan yana, aralarında boşluk: küçük kara taş, açık Kıpti kitabı, Ramses kartuşu; her biri cue'sunda ışıklanır ('Taş', 'Kıptice', 'ad'), sonda üçü ince altın çizgiyle bağlanır. | `bt_ros_triad` | Kıptice, sabır, ad açtı | yavaş itme (varsayılan) | B |
| 41 |  | 27 Eylül 1822'de Champollion buluşunu Paris'te bilginlere okudu. Hemen yanında Thomas Young oturuyordu. | Kubbeli bir salon (Institut de France): sıra sıra yüzsüz oturan siluetler, ortada kürsüde ayakta biri, elinde kâğıt; 'Young'da ön sırada kürsüye yakın bir siluet ışıklanır; italik '27 Eylül 1822'. | `bt_ros_academy` | Young | yavaş itme (varsayılan) | B |
| 42 |  | İki rakip ilk kez yüz yüzeydi. Young, kendi payının unutulduğunu düşündü. Ama taşın kendi hikâyesi bitmemişti. | İki yüzsüz profil karşı karşıya (solda Young, sağda Champollion), aralarında küçük kartuş; 'unutulduğunu'da Young'ın profili soluklaşır; 'bitmemişti'de aralarındaki kartuş yerini kara taşın küçük silueti alır. | `bt_ros_rivals {mode:'face'}` | rakip, unutulduğunu, bitmemişti | yavaş itme (varsayılan) | B |
| 43 | Taş bugün | Champollion 1828'de Mısır'a gitti, tapınak duvarlarını okudu. Dört yıl sonra, kırk bir yaşında öldü. | Bölüm kartı: 'V', 'Taş bugün', italik '1828 – bugün'. | `bt_chapter {n:'V', title:'Taş bugün', sub:'1828 – bugün'}` | — | sabit | — |
| 44 |  | Taş ise hâlâ British Museum'da. Yan yüzünde beyaz boyayla bir satır var: 1801'de İngiliz ordusu tarafından Mısır'da ele geçirildi. | Müze salonu, loş: cam vitrin içinde kara taş, üstten tek spot; 'Yan'da kamera taşın yan yüzüne yaklaşır, beyaz boyalı ince bir satır (okunmayan soluk harfler) belirir; 'ele geçirildi'de altında italik 'ele geçirildi · 1801'. | `bt_ros_stone {mode:'side'}` | Yan yüzünde, ele geçirildi | yakın: focus yan yüz, zoom 1.6 | A |
| 45 |  | Mısır'da birçok kişi taşın geri dönmesini istiyor. 2022'de bir dilekçe yüz bini aşkın imza topladı. Müze ise 1801 anlaşmasının geçerli olduğunu söylüyor. | Sade harita: Londra ve Kahire iki nokta, aralarında ok olmadan kesik ince çizgi (tarafsız); 'geri'de Kahire noktası, 'anlaşmasının'da Londra noktası atar; italik '2022'. | `bt_map` | geri, anlaşmasının | yavaş itme (varsayılan) | — |
| 46 |  | Bin dört yüz yıl susan yazı nasıl yeniden konuştu? Bir taş aynı sözü üç yazıyla söyledi. Bir dil dualarda yaşadı. | Işık havuzunda kara taş, üç bant aynı anda yumuşakça ışıklanır (açılıştaki taşın tamamı ışıkta). | `bt_ros_stone {mode:'three'}` | üç yazıyla | yavaş itme (varsayılan) | A |
| 47 |  | Ve bir adam, bir güneş resminin aynı zamanda bir ses olduğunu gördü. | Karanlıkta tek güneş diski işareti, etrafında büyüyen ışık havuzu; 'ses'te diskin altında ince altın 'Ra'. Kapak adayı. | `bt_ros_sign {mode:'glow'}` | ses olduğunu | yavaş itme (varsayılan) | B |
| 48 |  | Sizce bu yazıyı asıl kim çözdü: yolu açan Young mu, kapıdan geçen Champollion mu? Yorumlara yazın. | İki yüzsüz profil yan yana, aralarında boşluk; altlarında italik 'Young' ve 'Champollion'; 'Young'da sol, 'Champollion'da sağ ışıklanır. | `bt_ros_rivals {mode:'ask'}` | Young, Champollion mu | yavaş itme (varsayılan) | B |
| 49 |  | Böyle sessiz hikâyeler için abone olun. | Gece, Nil üstünde Philae tapınağının silueti, yıldızlar, suda ince yansıma; tek kandil yanık kalır. | `bt_ros_philae {mode:'night'}` | abone | yavaş itme (varsayılan) | A |

Sahne bazında `params` (bt_map sınırları/noktaları, bt_text satırları, bt_word) `videos/2026-11-16/_parts/02-plan.json` içinde.

### Kapak adayları (uzun, 1280×720; `"kasif": false`, `focus` zorunlu, zoom 1,1–1,4)
1. **`KİMSE / OKUYAMADI`** (vurgu: okuyamadı) — sahne 15, t ≈ 3.0; focus [960, 470], zoom 1.25. Önerilen. Işık havuzunda kara taş, üç bant da çizilmiş; tek net özne, başlığı tekrar etmiyor.
2. **`SIR / GÜNEŞTEYDİ`** (vurgu: güneşteydi) — sahne 33, t ≈ 3.0; focus [960, 450], zoom 1.2. Tek güneş diski işareti ışık havuzunda (altında 'Ra'); en gizemli ve en sade an. Küçükte okunur mu kontrol et.
3. **`1.400 YIL / SUSTU`** (vurgu: sustu) — sahne 5, t ≈ 3.5; focus [960, 470], zoom 1.2. Yarısı ışıkta, yarısı karanlıkta kara taş. Başlıktaki 'susan' ile örtüşür; seçilirse başlık 'Rosetta Taşı: Ölü Bir Yazıyı Kim Konuşturdu?' olur.
Karar `cover.jpg`'ler yan yana bakılarak; focus koordinatları sahne kodu yazılınca düzeltilir.

### YouTube taslağı
```json
{
 "title": "Rosetta Taşı: 1.400 Yıl Susan Yazıyı Kim Çözdü?",
 "description": "Rosetta Taşı 1799'da Mısır'da bir kale duvarından çıktığında, hiyeroglifleri 1.400 yıldır kimse okuyamıyordu. Napolyon'un askerlerinin bulduğu bu kara taşta aynı ferman üç yazıyla yazılıydı: hiyeroglif, demotik ve eski Yunanca. Ama taş yazıyı tek başına çözmedi. Londra'da Thomas Young ile Paris'te Jean-François Champollion arasındaki sessiz yarış, Kıptice ve Ebu Simbel'den gelen bir firavun adı, 1822'de ölü bir yazıyı yeniden konuşturdu.\n\nBu videoda:\n• Philae'deki son hiyeroglif yazıt (394) ve 1.400 yıllık sessizlik\n• 1799'da Reşit'te kara taşın bulunuşu ve Londra'ya yolculuğu\n• Thomas Young ve Ptolemaios kartuşu\n• Champollion, Kıptice ve Ramses adının okunduğu gün\n• Taş bugün nerede ve Mısır neden geri istiyor\n\nHer gün yeni bir \"neden?\" için abone ol. Sence bu yazıyı asıl kim çözdü: Young mu, Champollion mu? Yorumlara yaz!\n\n#rosettataşı #hiyeroglif #antikmısır #tarih #düşünbakalım",
 "tags": [
  "rosetta taşı",
  "rosetta taşı hikayesi",
  "rosetta taşının sırrı",
  "rosetta stone",
  "champollion",
  "thomas young",
  "hiyeroglif",
  "hiyeroglifler nasıl çözüldü",
  "mısır hiyeroglifleri",
  "antik mısır",
  "napolyon mısır seferi",
  "kıptice",
  "british museum",
  "ramses",
  "tarih",
  "tarih hikayeleri",
  "düşün bakalım"
 ],
 "category_id": "27",
 "publish_at": "2026-11-16T20:30:00+03:00"
}
```
(başlık 47 kr., açıklama 894 kr., 17 etiket / 240 kr.; lint `seo_score` 100/100.)

### Kaynaklar (`sources`, doğrulanmış)
- British Museum — Everything you ever wanted to know about the Rosetta Stone (196 BC, 13 yaşındaki V. Ptolemaios'un taç giyme yıl dönümü, rahipler meclisi; Temmuz 1799, Reşit yakınındaki kale; 1801 antlaşması, Temmuz 1802 müzeye; Young Ptolemaios adını, Champollion 1822; hiyeroglif 4. yy sonunda bitti): https://www.britishmuseum.org/blog/everything-you-ever-wanted-know-about-rosetta-stone
- Wikipedia — Rosetta Stone (granodiyorit, 112,3 cm, ~760 kg; 27 Mart 196 MÖ, Memfis; hiyeroglifin son 14 satırı, demotik 32, Yunanca 54; Bouchard, Fort Julien, Temmuz 1799; HMS Égyptienne, Şubat 1802 Portsmouth, Haziran 1802'den beri sergide; yan yüzde 'Captured in Egypt by the British Army in 1801'): https://en.wikipedia.org/wiki/Rosetta_Stone
- Britannica — Hieroglyphic writing: discovery of the Rosetta Stone and decipherment (ilk bilginlerin 'semboller' yanılgısı; Young'ın demotik/tek ünsüz işaretleri; Champollion Kıptice ile, Ptolemaios ve Kleopatra kartuşlarından ve Ramses yazımından ses değerleri): https://www.britannica.com/topic/hieroglyphic-writing/Discovery-of-the-Rosetta-Stone
- Wikipedia — Graffito of Esmet-Akhom (Philae, 24 August 394) (Philae, 24 Ağustos 394: bilinen son hiyeroglif yazıt): https://en.wikipedia.org/wiki/Graffito_of_Esmet-Akhom
- Wikipedia — Lettre à M. Dacier (27 September 1822) (27 Eylül 1822 Académie'de; rivayete göre 'Je tiens l'affaire!' deyip bayıldı (ağabeyi Jacques-Joseph)): https://en.wikipedia.org/wiki/Lettre_%C3%A0_M._Dacier
- National Geographic — Hieroglyphics were a mystery until this man solved the riddle of the Rosetta Stone (14 Eylül 1822 Ebu Simbel metninden Ramses; Ra = güneş, mes = doğurmak; Philae dikilitaşı kopyası; 1828'de Mısır; 1832'de 41 yaşında ölüm): https://www.nationalgeographic.com/history/history-magazine/article/hieroglyphics-were-a-mystery-until-he-solved-the-rosetta-stone
- Royal College of Physicians — Thomas Young and the decipherment of hieroglyphics (Young 1814'te başladı, Ptolemaios kartuşu; 27 Eylül 1822 toplantısında Champollion'un yanında oturdu, ilk karşılaşmaları; payının tanınmadığını düşündü): https://history.rcp.ac.uk/blog/thomas-young-and-decipherment-hieroglyphics
- Al Jazeera — ‘Act of plunder’: Egyptians want the Rosetta Stone back (2022) (2022: Hawass dilekçesi 100.000'i aşkın imza (Hanna'nınki 4.200); müze: 1801 antlaşması, Mısır hükümetinden resmî talep yok): https://www.aljazeera.com/news/2022/11/30/after-220-years-egypt-demands-the-return-of-the-rosetta-stone

**Doğruluk notları:** '1.400 yıl' = 394 → 1822 (1.428 yıl), 'bin dört yüz yıl' olarak. Bayılma 'rivayete göre'; 'günlerce/beş gün' yazılmadı. Wikipedia Ebu Simbel/Thutmosis okumasını 1823'e koyuyor, National Geographic Ramses'i 14 Eylül 1822'ye: anlatımda sadece Ramses ve 14 Eylül 1822 (yaygın tarih), Thutmosis yok. 'Kartuşta kral adı olduğu' fikri Young'dan önce de vardı → anlatımda 'Bunlara kartuş denir; içlerinde kral adları vardı.' (Young'a mal edilmedi). Napolyon'un bilginleri 'yüzü aşkın' (~160'tan fazla). Kıpticede güneş 'rē' → 'Güneş, Mısır dilinde Ra'ydı.' Kıptice 'mise' = doğurmak. P, O, L ortaklığı gerçek işaretlerle uyumlu (t iki adda farklı işaret, bu yüzden söylenmedi). Mısır'ın talebi tarafsız: iki taraf da tek cümle. Doğrudan alıntı İngilizce yazıt Türkçeye çevrildi (ekranda yalnız 'ele geçirildi · 1801').

### Eleştiri günlüğü (02)
- **Tur 1:** senaryo 8, kanca 8, okunabilirlik 7, görsel=anlatım 6, hareket 8, kompozisyon 7, tema 8, tempo 8, doğruluk 9, kapanış 9, kapak+SEO 8.
  Sorunlar: B'nin taşı/sokağı (38, 44, 46) açılıştakinden farklı; sahne 45 haritası (Britanya yok, düz kenarlar); sahne 19 kadrajı + sahne 20 kıyı; sahne 6 "Nil'in güneyinde".
  Düzeltme: B, A'nın `bt_rosa_stone`/`bt_rosa_street`/`bt_rosa_map` tiplerine geçti; A 19/20/6'yı düzeltti; Kıpti glifleri, 41 ışık, 48 saç, 39 boş başlangıç.
- **Tur 2:** 8/8/8/8/8/8/8/8/9/9/8 → geçti.
- **Tur 3 (cila):** 35 Ramses yazısı cue anında, 45 Kahire etiketi altyazıdan uzak, 32 nemes başlık, 13 Delta deniz/kara ayrımı.

## Son kapı (yönetmen)
- İki video konu olarak farklı (Short: Kadeş Savaşı ve barış tableti, MÖ 13. yy; uzun: Rosetta Taşı'nın çözülmesi, 1799–1822); ikisi de Mısır'a dokunuyor ama
  olay, dönem ve soru ayrı. Geçmişte Kadeş/Rosetta/Champollion işlenmedi. Temalar `kum` / `grafit` (önceki DB: `derin`).
- `lint` iki dosya için OK (SEO 100/100). Kadeş 383 karakter (~29 sn), Rosetta 4.040 karakter (50 sahne, preview ~4:48; gerçek ses ≈5:00).
- `sheet.png` ve `cover.jpg` yönetmen tarafından görüldü: taşan yazı, sol üstte yazı, STATIC? yok.
- `_parts/` uzun videonun A/B sahne ajanı çalışma dosyaları (plan + birleştirme betiği).
