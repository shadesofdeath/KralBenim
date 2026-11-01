# 01 — Saltanatın kaldırılması, 1 Kasım 1922 (günlük Shorts, belgesel tarzı)

- **Dosya:** `01-saltanatin-kaldirilmasi.json` · yayın 2026-11-01 19:00 (İstanbul) · `publish_at` `2026-11-01T19:00:00+03:00`.
- **Manşet:** `tools/news.py --channel db` bu ortamda çalışmadı (proxy 403, Google News'e erişim yok). Web aramasında
  bugünün yıl dönümü haberleri çıktı: "Bugün saltanatın kaldırılışının yıl dönümü" (Cumhuriyet, yıl dönümü haberi) →
  **yıl dönümü → o günün kendisi** kuralıyla konu bu gün. (Siyasi haber değil; 104 yıl önceki tarihî karar.)
- **Havuz:** büyük kararlar ve savaşlar · Türkiye ve Osmanlı tarihi. Geçmişte işlenmedi (Mondros 10-30 ve Cumhuriyetin
  ilanı 10-27 ayrı olaylar; bu ikisinin arasındaki halka).
- **Tarz:** `"theme": "belgesel"`, tema **`derin`** (gece denizi + boş taht; bir önceki Düşün Bakalım videosu `kum`).
- **İzleyici sonunda ne hisseder:** 623 yıllık bir hanedanın bir oylamayla ve sessiz bir gemi yolculuğuyla bitmesinin ağırlığı.
- **Kanca:** "Altı asırlık taht, tek bir günde boşaldı."
- **Kapak fikri:** "ALTI ASIRLIK TAHT / BOŞALDI" (vurgu `boşaldı`) — karanlıkta tek bir boş taht, üstüne düşen ışık havuzu.
- **related:** `videos/2026-10-27/02-cumhuriyetin-ilani-1923.json` (konuyla bağlantılı uzun video).

## Anlatım (tek parça; tur 3, 378 karakter, ElevenLabs uyarısı → alt uç, 380'i geçmez)

Altı asırlık taht, tek bir günde boşaldı. 1 Kasım 1922. Barış masasına iki hükümet çağrılmıştı: İstanbul'daki padişah ve
Ankara. Ankara, masada tek bir Türkiye istedi. Meclis oylamaya geçti. Ve saltanatı tek oturumda kaldırdı. On altı gün sonra
son padişah, bir İngiliz savaş gemisine bindi. Altı asırlık saltanat, sessizce denize açıldı. Böyle sessiz hikâyeler için abone olun.

(Tur 1 metni "Ankara'daki meclis, tek bir ses yeter dedi" ve "Altı yüz yıllık hanedan" diyordu; hanedan 17 Kasım'da
gitmedi — Abdülmecid Efendi halife oldu, hilafet Mart 1924'e kadar sürdü — bu yüzden "saltanat" yazıldı.)

## Çekim listesi (son hâli, tur 2; tipler `scenes/studio/shots/bt_saltanat.js`)

| # | Cümle | Tip | Görüntü | Cue |
|---|---|---|---|---|
| 0 | Altı asırlık taht, tek bir günde boşaldı. | `bt_throne` lit | Karanlık salon, sivri niş, kaidede tek boş Osmanlı tahtı (yuvarlak kemerli alçak sırt, altın gül motifi, tepede küçük alem); ışık hüzmesi, toz; minder kenarında altın çizgi | hit `boşaldı` (kanca + kapak) |
| 1 | 1 Kasım 1922. | `bt_date` | Büyük ince "1 Kasım 1922", altın çizgi; ışıklı döşeme zeminde küçük boş taht, uzun gölgesi uzar | — |
| 2 | Barış masasına iki hükümet çağrılmıştı: İstanbul'daki padişah ve Ankara. | `bt_table` names | Lamba altında masa, iki boş sandalye; "iki"de iki zarf iner; "padişah"ta İstanbul, "Ankara"da Ankara zarfı ve adı; önde zemin ışık havuzu + döşeme | hit `iki`, a `padişah`, b `Ankara` |
| 3 | Ankara, masada tek bir Türkiye istedi. | `bt_table` one | Aynı masa; "tek"te İstanbul sandalyesi/zarfı/adı karanlığa çekilir, Ankara sandalyesi kendi ışığında tek kalır | hit `tek` |
| 4 | Meclis oylamaya geçti. | `bt_assembly` | Gece I. TBMM binası, döşeli avlu, iki alçak duvar; pencereler tek tek yanar; kapı üstündeki pencere altın, kapıdan avluya ışık yolu | hit `oylamaya` |
| 5 | Ve saltanatı tek oturumda kaldırdı. | `bt_decree` | Yukarıdan masada tek karar kâğıdı, satırlar kendiliğinden yazılır, altın mühür; kâğıdın sağında küçük kare hokka (y≈1010), altta ahşap damar + masa kenarı | hit `kaldırdı` |
| 6 | On altı gün sonra son padişah, | `bt_malaya` pier | Sisli şafak, iskelede tek siluet ucuna yürür; uzakta gri savaş gemisi | — |
| 7 | bir İngiliz savaş gemisine bindi. | `bt_malaya` ship | Kadrajı dolduran HMS Malaya; motorbot gemiye ilerler; lombozlar yanar | hit `savaş` |
| 8 | Altı asırlık saltanat, sessizce denize açıldı. | `bt_nightsea` | Gece denizi; uzaklaşan geminin tek ışığı küçülüp söner | hit `sessizce` |
| 9 | Böyle sessiz hikâyeler için abone olun. | `bt_throne` fade | Boş taht; ışık yavaşça kararır | — |

10 sahne, 7 tip (bt_table üst üste 2; bt_throne 2 ama ayrık).

## Kapak adayları

| Aday | lines | Sahne/t | focus/zoom | Not |
|---|---|---|---|---|
| A | "Altı asırlık taht" / "boşaldı" | 0 / 3.0 | [540,880] 1.2 (ilk denemede [540,800] 1.3) | Üst satır uzun, yazı küçülüyor; zoom 1.3'te tahtın tepesi kapak gölgesinde kayboluyor |
| B | "Taht" / "boşaldı" | 0 / 3.0 | [540,880] 1.2 | En büyük yazı ama "altı asır" ağırlığı yok, kancayla bağı zayıf |
| C | "Altı asırlık taht" / "boşaldı" | 9 / 1.2 | [540,800] 1.3 | Sönen ışık; kapakta altın minder çizgisi yok, daha sönük |
| D | "Son padişah" / "denize açıldı" | 8 / 1.0 | [600,820] 1.4 | Gece denizi + tek ışık; özne küçük, telefonda okunmuyor |
| **E (seçildi)** | "Altı asırlık" / "taht boşaldı" (vurgu `boşaldı`) | 0 / 3.0 | [540,720] 1.15 (tur 2: yeni Osmanlı sırtıyla; 680/820 denendi, 820'de alem kapak gölgesine giriyor) | İki dengeli satır, büyük yazı; tahtın tamamı (tepedeki altın damla dahil) ışık havuzunda, kancayla aynı fikir |

## Kaynaklar (doğrulanmış)

- 1 Kasım 1922'de Meclis saltanatı kaldırdı; Müttefikler Lozan Konferansı'na hem İstanbul hem Ankara hükümetini davet etti; hanedan 1299'dan beri kesintisiz hüküm sürüyordu; VI. Mehmed 17 Kasım'da İngiliz savaş gemisi Malaya'ya sığınıp İstanbul'dan ayrıldı — [Wikipedia: Abolition of the Ottoman sultanate](https://en.wikipedia.org/wiki/Abolition_of_the_Ottoman_sultanate)
- 1 Kasım 1922 kararı; tahttan indirilen VI. Mehmed'in İngiliz savaş gemisi HMS Malaya ile ülkeden ayrılması — [Wikipedia: Mehmed VI](https://en.wikipedia.org/wiki/Mehmed_VI)
- "1 Kasım 1922 … Meclis iki maddelik bir kanunu kabul ederek padişahlığı kaldırdı"; Lozan için İstanbul Hükümeti'ne de resmî davet; "1299'da kurulan … padişahlık tam 623 yıl sonra" — [Cumhuriyet, Alev Coşkun](https://www.cumhuriyet.com.tr/yazarlar/alev-coskun/padisahligin-sonu-100-yil-onceki-meclis-karari-2000026)
- Cümle kontrolü: "On altı gün sonra" = 1 → 17 Kasım ✓; "Altı asırlık / altı yüz yıllık" = 1299–1922 (623 yıl) yuvarlak ✓; "tek bir ses yeter" Ankara'nın Lozan'da tek temsil talebinin yorumudur (Refet Paşa: İstanbul delege gönderirse Ankara çekilir — Mehmed VI maddesi) ✓; "tek bir günde boşaldı": saltanat tek oturumda kaldırıldı; hilafet ve padişahın sarayda kalışı 17 Kasım'a kadar sürdü (metin "taht" diyor, yanlış değil ama dramatik).

## Eleştiri günlüğü

### 01-saltanatin-kaldirilmasi — Tur 1 (yazar)
- `bt_saltanat.js` yazıldı: `bt_throne`, `bt_date`, `bt_table`, `bt_assembly`, `bt_decree`, `bt_malaya`, `bt_nightsea` (deterministik, sadece tema token'ları, `mix` ile türetilmiş gri).
- lint OK (SEO 100/100). preview: ~25 sn tahmin (belgesel sesiyle ~30 sn bekleniyor), 10 sahne, 349 karakter; tüm cue'lar eşleşti.
- Düzeltilen: iskele ve motorbot altyazı şeridine iniyordu (yukarı alındı); tarih sahnesinde gölge görünmüyordu ve altyazının arkasındaydı (zemin aydınlatıldı, zemin yükseltildi); kapakta tahtın tepesi kapak gölgesinde kalıyordu (focus/zoom).
- Bilinen: sahne 0 `motion=0.0 STATIC?` — ilk cümle boyunca kapak kancası ekranda (kural gereği), ölçüm kanca karesini görüyor. `bt_nightsea` motion 1.6, `bt_malaya` pier 2.0 (sakin ama hareketli).

### 01-saltanatin-kaldirilmasi — Tur 2 (yazar)
- Anlatım eleştirmenin metniyle değişti (368 kr): "tek bir Türkiye istedi", "Meclis oylamaya geçti", "saltanat" (hanedan değil). Sahne 2+3 tek masa sahnesinde birleşti; "tek Türkiye" için `bt_table` `one` (İstanbul tarafı karanlığa çekilir).
- Karar kâğıdında divit ve imza kaldırıldı (sadece satırlar + mühür).
- Alt yarı dolduruldu: tarih/masa sahnelerinde y 1800'e döşeme çizgileri ve ışık havuzu, meclis önünde avlu + ışık yolu + alçak duvarlar (y 1400–1460, altyazının altında), karar sahnesinde hokka + masa kenarı.
- Taht sırtı Osmanlılaştırıldı: soğan kubbe yerine alçak yuvarlak kemer, ortada altın gül motifi, tepede küçük alem.
- Başlık: "Saltanatın Kaldırılması: Son Padişah Neden Gemiye Bindi?" (eleştirmenin önerisi 67 kr, 60 sınırını aştığı için kısaltıldı). Açıklamaya halifeliğin Mart 1924'e kadar sürdüğü eklendi.
- Tarih yazısı y 350'ye alındı (geçiş karesinde taht alemiyle çakışmıyor).
- lint OK, SEO 100/100; preview ~27 sn tahmin, 368 kr, tüm cue'lar eşleşti; sahne 0 STATIC? uyarısı kapak kancasından (bilinen).

### 01-saltanatin-kaldirilmasi — Tur 3 (yazar)
- Başlık: "Saltanatın Kaldırılması: 623 Yıllık Taht Nasıl Bitti?" (52 kr; videonun anlattığı şey). Açıklamada "1299'da kurulan saltanat, 623 yıl sonra 1922'de".
- Sahne 5: "Ve saltanatı tek oturumda kaldırdı." (cue `kaldırdı`). Toplam 381 olunca 380 sınırı için sahne 8 "Altı yüz yıllık" → "Altı asırlık" (kancayla yankı) → 378 kr.
- Karar sahnesinde alttaki yuvarlak hokka (mercek gibi, YouTube bölgesinde) kaldırıldı; kâğıdın sağına y≈1010'a üstten görünen küçük kare hokka kondu; alt yarıda sadece ahşap damar + masa kenarı.
- Alem: hilal büyütüldü ve dolduruldu (boynuzlar yukarı), topa oturuyor; küçükte hilal olarak okunuyor.
- lint OK, SEO 100/100; preview ~28,6 sn tahmin (sahne 9 bitişi), 378 kr, cue'lar eşleşti.


### Eleştirmen puanları (ayrı ajan, REVIEW.md)
| Tur | Senaryo | Kanca | Okunabilirlik | Görsel | Hareket | Kompozisyon | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 7 | 8 | 8 | 7 | 7 | 7 | 8 | 7 | 6 | 7 | 7 |
| 2 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 7 | 8 | 8 | 7 |
| 3 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 8 | 8 | 8 | 8 |

- Tur 1 sorunları: "hanedan denize açıldı" yanlış (hanedan 1924'e kadar kaldı) → "saltanat"; "tek bir ses yeter" belirsiz → "Ankara, masada tek bir Türkiye istedi. Meclis oylamaya geçti."; başlık kapağı tekrar ediyordu; alt yarılar boştu.
- Tur 2 sorunları: başlık "neden gemiye bindi" vaadini karşılamıyordu → "623 Yıllık Taht Nasıl Bitti?"; karar sahnesinde YouTube bölgesinde hokka; süre ~27 sn → "tek oturumda" (+süre).
- Yönetmen son kapı: sheet.png ve cover.jpg gözle incelendi; sol üst boş, taşan yazı yok, tek özne.
