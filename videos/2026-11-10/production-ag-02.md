# ag-02-livingstone-i-presume — Stickstory Short (history's strangest moments)

- **File:** `videos/2026-11-10/ag-02-livingstone-i-presume.json` · format short · publish_at `2026-11-10T19:00:00-05:00` (Istanbul 11.11 03:00)
- **Category:** history's strangest moments (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403); no fitting second headline (Armistice is used by ag-01) → category pool, with today's
  anniversary as hook: 10 November 1871, Henry Morton Stanley meets David Livingstone at Ujiji on Lake Tanganyika.
- **Topic:** Stanley, a reporter sent by the New York Herald (James Gordon Bennett Jr.), searched for months (left Zanzibar March 1871)
  for the missing missionary-explorer, who had not been heard from for years. When he found him, he reportedly said "Dr. Livingstone,
  I presume?" — the most famous greeting in history. Strange twist: the line appears in Stanley's later dispatches/book, but the
  pages of his diary for exactly that day were torn out; Livingstone never recorded it; historians suspect Stanley may have made it
  up (or polished it) afterwards; it was mocked at the time. Livingstone then refused to come home and died in Africa in 1873.
  Writer: VERIFY on ≥ 2 reliable sources (Smithsonian Magazine, BBC, National Library of Scotland / Livingstone Online,
  Britannica); date of meeting is debated (diaries suggest late Oct or Nov) — if so, say it carefully or don't give an exact day
  in narration. No myths, no colonial glorification; neutral tone.
- **Viewer should feel:** "The most famous greeting in history might never have been said."
- **Hook (3–8 words, same idea as cover):** e.g. "History's most famous hello might be fake." ↔ cover "A FAKE / HELLO?" /
  "TORN PAGES" / "HE MADE IT UP?". ≥ 3 cover candidates.
- **Structure:** hook → who was missing and who went looking (a newspaper sent a reporter) → months of search, then the meeting and the
  four words → twist: the diary pages from that day are missing → punchline (complete standalone line) + one short natural subscribe
  line with reason.
- **Related long video:** none.
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-newsprint` (a newspaper story; differs from ag-01's ag-sage). Sets: `coast`/`field` (Lake Tanganyika, Ujiji),
  `interior` (newspaper office / diary desk), `desert`/`field` for the trek. Kaşif host 15–25 %, ≥ 1 close-up (the diary with
  torn-out pages), on-screen `source` note ≥ 1. Real `photo` possible (Stanley's book illustration / Herald page, public domain via
  tools/media.py, credit required). Pattern different from ag-01 (no trenches/clock).

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration v1 (441 chars)
History's most famous greeting might be fake. A New York newspaper sent a reporter to find a man lost in Africa for years.
In 1871, Henry Stanley marched for seven months. At Lake Tanganyika, he found David Livingstone, and said: "Doctor
Livingstone, I presume?" Here's the strange part. His diary page for that moment is torn out. The most famous greeting may
have been made up for the paper. Subscribe for a true story like this every day.

(Lint treats "hello" as a greeting/intro word in the opening, so the hook says "greeting". The exact meeting day is not given:
it is debated, late October or 10 November 1871.)

### Shot list (10 scenes; new shot file `scenes/studio/shots/lv_livingstone.js`: lv_shore / lv_office / lv_map / lv_trek / lv_diary; reused `moon_paper`)
| # | Text | Type / mode | Set · camera | Kaşif / notes |
|---|---|---|---|---|
| 0 | History's most famous greeting might be fake. | `lv_shore` hook | sea (Ujiji shore) · push | cover overlay only; Stanley lifts his sun helmet, Livingstone (grey beard, faded blue cap), bubble I PRESUME?, red stamp FAKE? on "might" |
| 1 | A New York newspaper sent a reporter | `lv_office` | interior · right | — NEW YORK HERALD sign, wall map of Africa with red "?", editor points, letter flies to the reporter on "reporter" |
| 2 | to find a man lost in Africa for years. | `lv_map` | none (map fills the frame) · slow push | — "?" over Lake Tanganyika, red ring + MISSING stamp on "lost", Zanzibar, compass rose, ship |
| 3 | In 1871, Henry Stanley marched for seven months. | `lv_trek` | field · left | — caravan with flag and porters, acacias scroll by, racing sun; 7 MONTHS card; source Smithsonian Magazine |
| 4 | At Lake Tanganyika, he found David Livingstone, | `lv_shore` arrive | sea · right | — caravan walks in, Livingstone turns and raises a hand; onlookers' heads at the bottom |
| 5 | and said: "Doctor Livingstone, I presume?" | `lv_shore` greet | sea · locked | — helmet lifted on "said", bubble DR. LIVINGSTONE, I PRESUME? on "Doctor" |
| 6 | Here's the strange part. | `lv_diary` flip | interior · pull | **points at the diary, shock on "strange"**; pages turning, candle, inkpot + quill |
| 7 | His diary page for that moment is torn out. | `lv_diary` torn | interior · **close-up** focus [620, 1080] zoom 1.4 | — page rips out on "torn", jagged stub, red ring; source Smithsonian, Tim Jeal |
| 8 | The most famous greeting may have been made up for the paper. | `moon_paper` | interior · push | — Herald front page STANLEY FINDS LIVINGSTONE, printed I PRESUME? circled on "greeting", MADE UP? stamp on "made" (`emblems: false`, a new opt-in on moon_paper) |
| 9 | Subscribe for a true story like this every day. | `lv_shore` dusk | sea · pull | **waves, then points at the dhow on "story"**; sunset glitter, beached dhow + reeds in the foreground |

Kaşif 2/10 (20 %) + cover overlay. 6 types (lv_shore 4). Pattern vs ag-01 (WWI trenches) and yesterday's shorts: lakeshore, savanna, office, diary close-up.

### Facts (verified)
- Bennett (New York Herald) ordered Stanley to find Livingstone (Smithsonian; BRANCH/Rubery: "Find out Livingstone…").
- Livingstone left England in 1865 and had been missing for years (Smithsonian).
- Stanley left Zanzibar on 21 March 1871; met Livingstone at Ujiji on Lake Tanganyika about seven months later (Smithsonian).
- Meeting date debated: 27/28/29 October, 3 or 10 November 1871 (Livingstone Online) → no exact day in the narration.
- The journal page(s) covering the meeting are missing/torn out; maybe Stanley, maybe a collector (Smithsonian; HNN/Observer 2007:
  two pages removed). Tim Jeal argues Stanley invented the line; Livingstone's letters never mention it (NYRB review of Jeal;
  BRANCH). Narration says "may have been made up", not "was".
- Dropped: exact meeting date, Livingstone's death (1873), the mockery in music halls (budget).
- Photo: `tools/media.py` failed (proxy 403); everything is drawn in code.

### Cover candidates (rendered with `build.py --cover --no-tts`, compared side by side)
- **A (chosen):** scene 0 t 1.6, "A FAKE / GREETING?" (highlight FAKE) = first spoken line; the two men, the lifted helmet and the I PRESUME? bubble, shocked Kaşif lower right (x 810).
- B: scene 7 t 3.0, "TORN / OUT" (TORN): the ripped diary; strong object but the meaning needs context.
- C: scene 0, "HE MADE / IT UP?" (MADE): punchy but gives the conclusion as the claim, and "he" is unclear in a thumbnail.

## Eleştiri günlüğü

### ag-02-livingstone-i-presume — Tur 1 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 6 | 8 | 7 | 6 | 8 | 7 | 9 | 8 | 7 |

Kapak (ayrı): **7** (hedef ≥ 8). Lint: OK, 1 uyarı (sahne 1 noktalamasız biter). Web kontrolü: Smithsonian, Bennett/Herald'ın
gönderdiğini, Mart 1871 Zanzibar → Ekim/Kasım buluşma (~7 ay) ve buluşma sayfasının günlükten yırtıldığını doğruluyor; "may have
been made up" ifadesi doğru ölçüde temkinli.

1. **Sahne 5 altyazı + sahne 8 damgası (okunabilirlik/güvenli bölge):** sahne 5'te altyazı `and said: " Doctor` (tırnaktan sonra
   boşluk) ve ikinci karede ikinci satır `presume?"` belirgin şekilde küçük puntoyla düşüyor; sahne 8'de `MADE UP?` damgası
   y 0.78 ≈ 1500 px'te, yani YouTube arayüz bölgesinde ve altyazı şeridinin hemen altında, sheet'te soluk/yarım okunuyor.
   → Sahne 5'te altyazının bölünmesini düzelt (tırnağı kelimeye yapıştır; gerekirse metni `and said, "Doctor Livingstone, I presume?"`
   yap ki altyazı tek boyda iki satır olsun), sahne 8'de damgayı `y: 0.47` civarına (manşet ile `I PRESUME?` halkası arasına, rot −8,
   size 120) taşı; `I PRESUME?` işaretini de altyazı şeridinin üstünde tut (y ≤ 0.55, şu an sınırda).
2. **Sahne 6–7 (kompozisyon + tempo + bütçe):** sahne 6 "Here's the strange part." dolgu köprü cümlesi (24 karakter, ~1,5 sn), görseli
   de zayıf: günlük kadrajın soluna yapışmış/kesilmiş, mum sol altta kesik, Kaşif küçük (0.85) ve altyazının yanında sıkışmış.
   Sahne 7'nin yakın planı `zoom 1.4` (kural: yakın plan ≥ 1.6), üst kenarda kitap sayfası marka/kicker'ın üstüne biniyor, kırmızı
   halka sheet'te görünmüyor. → Sahne 6'yı sil, sahne 7'yi tek güçlü sahne yap: metin "But his diary page for that moment is torn out.",
   `lv_diary` torn, Kaşif (scale ≥ 1.0, sağ alt, sayfa yırtılırken `shock` → `point`) bu sahneye taşınır (Kaşif 2/9 = %22 kalır),
   kamera `zoom 1.6+`, focus yırtık kökte; kitap üst kenarı y ≥ 260'tan başlasın ki marka + kicker temiz kalsın; kırmızı halka
   "torn"dan sonra en az 1 sn tam görünür olsun.
3. **Kapak (7 → ≥ 8) + kanca karesi:** `I PRESUME?` balonu kapak yazısının alt sisine giriyor, yazısı gri/soluk (kapakta asıl simge
   bu); `FAKE?` damgası t 1.6'da henüz yok, Stanley'nin kaskı havada kopuk duruyor; yazı ile balon arasında (y 520–700) boş şerit var.
   → Balonu sisin dışına indir (`y` ≈ 0.40) ve tam kontrastlı yap, kapak anını damganın indiği sonrasına al (`t` ≈ "might" + 0.4 sn)
   ya da kapağa balonun üstüne çapraz kırmızı `FAKE?` damgası koy; kaskı elle bağlı göster. Tek odak = balon + damga, Kaşif sağ altta
   şokta kalsın. (B adayı "TORN / OUT" sahne 7'den yedek olarak tekrar karşılaştırılsın.)

**Bütçe (441 → hedef 400–440, ElevenLabs sınıra yakın):** "Here's the strange part. His diary page…" yerine "But his diary page for
that moment is torn out." → toplam **420 karakter** (anlam kaybı yok, sorun 2 ile aynı düzeltme). Ek not: punchline'ı güçlendiren
"Livingstone never wrote the line down" eklemek 466'ya çıkarıyor; bütçe yüzünden açıklamada kalsın.
Küçük: sahne 1 metni noktalamasız bitiyor (lint uyarısı) — cümle sahne 2'de sürdüğü için kabul edilebilir, ama sesin araya duraklama
koymadığını Actions çıktısında kontrol edin.

### ag-02-livingstone-i-presume — Tur 1 (writer fixes)
- Narration v2 (**418 chars**): "History's most famous greeting might be fake. A New York newspaper sent a reporter to find a man lost in
  Africa for years. In 1871, Henry Stanley marched for seven months. At Lake Tanganyika, he found David Livingstone, and said,
  Doctor Livingstone, I presume? But his diary page for that moment is torn out. The most famous greeting may have been made up
  for the paper. Subscribe for a true story like this every day."
1. Scene 5: quotation marks dropped from the spoken line (the word splitter detached the opening quote → `" Doctor`); captions now
   read `and said,` / `Doctor Livingstone,` / `I presume?`, one line each at full size (checked in sheet). The on-screen bubble keeps
   DR. LIVINGSTONE, I PRESUME?. Scene 8 (now 7): MADE UP? stamp moved to page y 0.40 (screen ≈ 0.43 H, between headline and the
   I PRESUME? ring at ≈ 0.53 H), full contrast.
2. "Here's the strange part." scene deleted (9 scenes). Torn-diary scene: "But his diary page for that moment is torn out."; the page
   rips on "page", the red ring draws 0.35 s later and stays ≈ 2 s; Kaşif (scale 1.0, right) think → shock on "page" → points at the
   stub on "torn"; close-up focus [600, 880] zoom 1.6, smaller book (pw 0.36, ph 0.32) so the book top sits at ≈ 340 px, below the
   brand + kicker. Kaşif 2/9 (22 %). Scene-1 lint warning kept (sentence continues into scene 2; a comma there would read oddly).
3. Cover: three lines "A / FAKE / GREETING?" fill the old empty strip; the hook scene is laid out lower (ground 0.7) so the I PRESUME?
   bubble sits below the title fade at ≈ 0.47–0.55 H, full contrast; cover t 2.6 = after the diagonal FAKE? stamp lands on the
   bubble's right end; the helmet is held by its brim in Stanley's raised hand, clear of his face; shocked Kaşif lower right fully
   inside the frame (y 1840). Re-compared with B "TORN / OUT": A keeps the hook = first line and reads as a story at thumbnail size;
   A stays.
Lint: 0 errors, 1 warning (scene 1 punctuation), SEO 100/100. Preview: no STATIC?, every motion ≥ 2.8.

### ag-02-livingstone-i-presume — Tur 2 (critic)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |

Kapak (ayrı): **8** — "A / FAKE / GREETING?" telefonda net, I PRESUME? balonu tam kontrast ve sisin dışında, FAKE? damgası
balona çapraz iniyor, Kaşif sağ altta şokta, tek odak. Lint 0 hata / 1 uyarı (sahne 1), 418 karakter (bütçe içinde), 9 sahne,
motion hepsi ≥ 2.8, Kaşif 2/9. Tur 1'in üç sorunu çözüldü: altyazı satırları artık eşit boyda (17.2 sn karesi), MADE UP? arayüz
bölgesinden çıktı, günlük yakın planı zoom 1.6 + kırmızı halka 21.6 sn'de tam görünür. **Geçiyor; kalanlar engelleyici değil:**

1. Sahne 6 (günlük, 19.6–21.6 sn): kamera itince Kaşif'in gövdesinin yarısı sağ kenardan taşıyor (yalnız yüz + bir kol görünüyor) →
   `kasif.x` 0.82 → ~0.72 (ya da `focus` x'i 600 → 660), böylece zoom 1.6'da da tüm figür kadrajda kalır.
2. Sahne 0 kanca karesi (videonun içi, kapak değil): sunucu Kaşif Livingstone'un hemen sağında, başı sakalına değecek kadar yakın;
   FAKE? damgası Livingstone'un şapkasını örtüyor; sahnenin motion'ı 2.8 ile en düşük → Kaşif'i x ~0.88'e kaydır, damgayı balonun
   sağ ucunda biraz yukarı al; denizde dhow ya da palmiyelere hafif salınım ekleyip motion'ı ≥ 4'e çıkar.
3. Sahne 7 (gazete): MADE UP? damgası "LIVINGSTONE" manşet satırının alt yarısını örtüyor → damgayı `size` 120 → ~100 ve y'yi
   manşet ile I PRESUME? halkası arasına ortala (≈ 0.03 aşağı), iki yazı da tam okunsun.

### ag-02-livingstone-i-presume — Tur 2 (writer fixes)
1. Diary scene: Kaşif x 0.74 → 0.70; he stays fully inside the frame through the push (checked in sheet).
2. Hook / cover: the cover host moved right (x 845, clear of Livingstone's beard, fully inside the frame); the bubble moved left
   (x 0.40, 84 px) and the FAKE? stamp sits at its right end (x 0.75, y 0.36, 92 px), clear of Livingstone's cap; I PRESUME? is fully
   readable. Motion 2.8 → 4.3: palms sway and waves run faster (new `sway` param, 3), the dhow drifts, the bubble bobs gently (`bob` 14).
   Cover re-checked (same frame t 2.6): still title + bubble + stamp + host, no new overlaps.
3. Newspaper scene: MADE UP? stamp 120 → 100 px, moved down to page y 0.43, between the headline and the I PRESUME? ring.
Lint: 0 errors, 1 warning (scene 1 punctuation), SEO 100/100. Narration unchanged (418 chars).
