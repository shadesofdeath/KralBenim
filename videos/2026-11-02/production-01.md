# 01 — Atahualpa'nın fidye odası, Cajamarca 1532–1533 (günlük Shorts, belgesel tarzı)

- **Dosya:** `01-atahualpa-fidye-odasi.json` · yayın 2026-11-02 19:00 (İstanbul) · `publish_at` `2026-11-02T19:00:00+03:00`.
- **Manşet:** `tools/news.py --channel db` bu ortamda çalışmadı (proxy 403, Google News'e erişim yok); web aramasında
  havuza uyan güncel bir manşet bulunamadı → **havuza dönüldü** (plan önerisi: imparatorlukların yükselişi ve çöküşü).
- **Havuz:** imparatorlukların yükselişi ve çöküşü. Geçmişte işlenmedi.
- **Tarz:** `"theme": "belgesel"`, tema **`obsidyen`** (karanlıkta parlayan altın; bir önceki Düşün Bakalım videosu `derin`).
- **İzleyici sonunda ne hisseder:** Bir imparatorun özgürlüğünü bir odayı altınla doldurarak satın almaya çalışması ve
  sözün yine de tutulmamasının soğuk ağırlığı; altının çoğunun eritilip külçe olması.
- **Kanca fikri:** "Bir odayı altınla doldurdu." → kapak "ODAYI ALTINLA / DOLDURDU" (vurgu `altınla`) ya da "ALTIN YETMEDİ".
- **Kapak fikri:** karanlık taş oda, duvarda elin uzandığı yükseklikte çizilmiş tek çizgi, altın yığını o çizgiye
  ulaşmış, ışık havuzunda.
- Anlatım, çekim listesi, kaynaklar, eleştiri günlüğü: yazar ajan doldurur.

## Anlatım (tek parça; tur 3, 367 karakter, ElevenLabs uyarısı → alt uç, 380'i geçmez)

Bir oda dolusu altın, bir canı kurtaramadı. 1532'de bir avuç İspanyol, İnka imparatorunu esir aldı. Atahualpa elini
duvara uzattı. Odayı o çizgiye kadar altınla dolduracaktı. Altın aylarca aktı. Tapınak levhaları eritildi. Ama
İspanyollar onun ordularından korktu. 1533'te idam edildi. Duvardaki çizgi kaldı. İmparator kalmadı. Böyle
sessiz hikâyeler için abone olun.

- Eleştirmenin metni; 380 için "bile" ve sahne 7'deki "Atahualpa" çıkarıldı. "-yor" 0, devrik cümle yok.
- "Neden": İspanyollar serbest kalacak bir imparatorun ordularını yeniden toplamasından korktu (WHE: Atahualpa'nın ordu
  topladığı söylentisi, ihanet suçlaması).
- İki kez gümüş teklifi anlatımda yok (bütçe), açıklamada var. İdam günü yazılmadı (26 Temmuz / 29 Ağustos 1533 ayrışıyor).

## Çekim listesi (tur 2; tipler `scenes/studio/shots/bt_atahualpa.js`)

| # | Cümle | Tip | Görüntü | Cue |
|---|---|---|---|---|
| 0 | Bir oda dolusu altın, bir canı kurtaramadı. | `bt_goldroom` full | Taş İnka odası, iki trapez niş; çizgiye kadar altın yığını (seyrek, ayrık, opak tabak/kupa/kap), ışıltılar, toz | hit `kurtaramadı` — kanca + kapak |
| 1 | 1532'de bir avuç İspanyol, İnka imparatorunu esir aldı. | `bt_captive` taken | Aydınlık trapez kapıda başında altın bant + alnına inen kısa kırmızı saçak olan siluet; önde kapının iki yanında arkası dönük, miğferli iki İspanyol askeri; teberler çaprazlanır | hit `esir` |
| 2 | Atahualpa elini duvara uzattı. | `bt_goldroom` reach | Boş oda, siluet kolu yukarıda; parmak ucundan iki yana altın çizgi | hit `duvara` |
| 3 | Odayı o çizgiye kadar altınla dolduracaktı. | `bt_goldroom` measure | Kesik çizgili yığın hayaleti, içi çizgiye kadar altınla dolar | hit `altınla` |
| 4 | Altın aylarca aktı. | `bt_road` | Zikzak İnka yolunda altın yüklü lama kervanı; önde kadrajı düz kesen çokgen taşlı taraça duvarı | — |
| 5 | Tapınak levhaları eritildi. | `bt_furnace` | Ocak üstünde pota; altın levha iner, erir | hit `eritildi` |
| 6 | Ama İspanyollar onun ordularından korktu. | `bt_andes` fires | Gece dağlar; sol üçte birde (y≈700–1150) arkası dönük miğferli asker; sırtlarda birer birer büyük kamp ateşleri yanar | hit `ordularından` |
| 7 | 1533'te idam edildi. | `bt_captive` empty | Aynı kapı, boş; ışık havuzunun ortasında eşikte düşmüş büyük (2x) kraliyet saçağı; kamera push focus [540,1180] zoom 1.6; ışık söner | hit `idam` |
| 8 | Duvardaki çizgi kaldı. İmparator kalmadı. | `bt_goldroom` line | Boş oda, duvarda sadece altın çizgi; ışık soğur | hit `kalmadı` |
| 9 | Böyle sessiz hikâyeler için abone olun. | `bt_andes` fade | Vadideki tek ışık söner | — |

10 sahne, 5 tip; `bt_goldroom` 4/10 (üst üste en fazla 2), `bt_ingot` ve `bt_fringe` artık kullanılmıyor (dosyada duruyor).

## Kapak adayları

| Aday | lines | Sahne/t | focus/zoom | Not |
|---|---|---|---|---|
| A | "Oda dolusu altın" / "yetmedi" (vurgu `yetmedi`) | 0 / 2.4 | [540,720] 1.35 | Kancayla birebir, ama üst satır uzun → yazı küçülüyor |
| **B (seçildi)** | "Altın" / "yetmedi" (vurgu `yetmedi`) | 0 / 2.4 | [540,720] 1.35 | En büyük yazı, telefonda okunuyor; altta çizgiye kadar yükselmiş tek altın yığını ışıkta |
| C | "Bu çizgiye" / "kadar altın" (vurgu `altın`) | 4 / 3.0 | [540,760] 1.3 | Düz dolu yığın, nesne ayrıntısı yok, sönük |
| D | "Altın onu" / "kurtaramadı" (vurgu `kurtaramadı`) | 0 / 2.4 | [540,720] 1.35 | İyi ama ikinci satır uzun, yazı küçük |

## Kaynaklar (doğrulanmış)

- Oda yaklaşık 6,7 × 5,2 m; çizgi Atahualpa'nın uzanabildiği yükseklikte (~2,75 m; kaynaklara göre değişiyor); bir oda altın + iki kez gümüş teklifi; altın külçeye eritildi (1.326.539 peso) — [Wikipedia: Ransom Room](https://en.wikipedia.org/wiki/Ransom_Room)
- ~160 İspanyol; teklif ve Pizarro'nun kabulü; altın ve gümüş iki ay boyunca parça parça geldi; idam 1533 (makale 29 Ağustos der; WHE zaman çizelgesi 26 Temmuz) — [World History Encyclopedia: Pizarro and Atahualpa](https://www.worldhistory.org/article/704/)
- Fidye dokuz büyük ocakta eritildi, 6.000 kg'dan fazla altın; Coricancha'nın 700'den fazla altın levhası; kutsal heykel ve tabaklar eritildi — [WHE: The Gold of the Conquistadors](https://www.worldhistory.org/article/2045/the-gold-of-the-conquistadors/)
- Eritme yaklaşık bir ay sürdü; bir oda altın, iki oda gümüş; oda ölçülerinde kaynaklar ayrışıyor — [PBS Conquistadors](https://www.pbs.org/conquistadors/pizarro/pizarro_h02.html)
- Cümle kontrolü: "Bir avuç İspanyol" ✓ (160–180); "elini duvara uzattı" ✓ (çizgi uzanabildiği yüksekliğe çekildi); "Altın aylarca aktı" ✓ (Kasım 1532 → Haziran 1533); "Tapınak levhaları bile eritildi" ✓ (Coricancha levhaları Cuzco'dan söküldü, Prescott/Hemming; WHE kutsal eserlerin eritildiğini yazıyor); "1533'te idam" ✓; "bir sözü satın alamadı": Pizarro teklifi kabul etmişti, serbest bırakılmadı (WHE).
- Yaygın efsane anlatılmadı: Cajamarca'daki bugünkü "Cuarto del Rescate"nin fidye odasının kendisi olduğu iddiası (tartışmalı) ve sayıların kesinliği.

## Eleştiri günlüğü

### 01-atahualpa-fidye-odasi — Tur 1 (yazar)
- `bt_atahualpa.js` yazıldı: `bt_goldroom` (full/reach/measure/line), `bt_andes` (lit/fade), `bt_captive`, `bt_road`, `bt_furnace`, `bt_ingot`, `bt_fringe` (deterministik `rng`, sadece tema token'ları, titreşim yok).
- lint OK (SEO 100/100). preview ~28–29 sn tahmin, 11 sahne, 378 karakter, tüm cue'lar eşleşti.
- Düzeltilen: "1532." tek başına 0,7 sn'ydi → "Peru, 1532."; teberler altyazı şeridini kesiyordu → kısaltıldı, kapı önünde zemine oturtuldu; kraliyet saçağı yüzde maske gibi duruyordu → ince püsküller; yığın düzgün bir çan eğrisiydi → engebeli, sık nesneli yığın; "uzattı" cue'su sahne sonuna düşüp çizgi görünmüyordu → cue `duvara`; saçak sahnesi küçük kırmızı çubuklar gibiydi → büyütüldü, 21 ince püskül.
- Bilinen: sahne 0 `motion=0.1 STATIC?` — ilk cümle boyunca kapak kancası ekranda (kural gereği). Alt yarı (y>1400) birçok sahnede koyu zemin + silik döşeme çizgileri.

### 01-atahualpa-fidye-odasi — Eleştirmen — Tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 9 | 6 | 7 | 8 | 8 | 8 | 9 | 6 | 7 |

lint OK (SEO 100/100). Ton belgesel, devrik cümle yok, "-yor" 0/11. Kanca 7 kelime ve kapakla ("ALTIN YETMEDİ") aynı fikir. Bilgiler doğru (esir alma Kasım 1532, fidye, Coricancha levhalarının eritilmesi, 26 Temmuz 1533 garotla idam; ihanet/komplo suçlaması). Kapak tek özne, telefonda okunuyor (8); başlığın vaadi videoda karşılanmadığı için Kapak+SEO 7.

1. **"Neden" yok → başlık vaadi boşta, punchline bulanık (Senaryo, Kapanış, SEO).** Başlık "Bir Oda Dolusu Altın Neden Yetmedi?" diye soruyor, anlatım cevabı hiç vermiyor ("Fidye toplandı. Ama … yine de idam edildi."). Metin madde listesi gibi ("Altın aylarca aktı. … Fidye toplandı."), "Altın, bir sözü satın alamadı" soyut ve sesli dinlenince anlaşılmıyor (hangi söz?). Düzeltme: "Fidye toplandı."yı çıkar, yerine nedeni koy; punchline'ı sahne 9'un görüntüsüne (boş oda, duvardaki çizgi) bağla. Önerilen anlatım (≈385 karakter; 380 için "bile"yi çıkar):
   "Bir oda dolusu altın, bir canı kurtaramadı. 1532'de bir avuç İspanyol, İnka imparatorunu esir aldı. Atahualpa elini duvara uzattı. Odayı o çizgiye kadar altınla dolduracaktı. Altın aylarca aktı. Tapınak levhaları bile eritildi. Ama İspanyollar serbest bir imparatordan korktu. 1533'te Atahualpa idam edildi. Duvardaki çizgi kaldı. İmparator kalmadı. Böyle sessiz hikâyeler için abone olun."
   ("Peru, 1532." sahnesi kalkar, tarih esir sahnesine geçer; `bt_ingot` sahnesi "korktu" cümlesine bırakılabilir ya da yerine yaklaşan teber/mızrak gölgeleri. `idam` cue'su kalır, sahne 9 cue `kalmadı`.)
2. **Sahne 2 ve 3: kırmızı kraliyet bandı yüzün ortasında, 360 px'te göz bağı/haydut maskesi gibi okunuyor; sahne 2'de "bir avuç İspanyol" hiç görünmüyor, teberler figürün başının üstünde tek bir balta/X süsü gibi duruyor.** Düzeltme: bandı alnın üstüne (başın tepesine) taşı, saçak alına doğru kısa insin, yüz bölgesi boş siyah kalsın; teberleri figürün iki yanında, omuz hizasında daha büyük ve kapının dışından içeri uzanan iki ayrı uzun sap olarak çiz (uçlar baş yüksekliğinin altında çaprazlansın), ya da kapı önüne iki küçük miğferli siluet koy.
3. **Sahne 8 (`bt_fringe`, "idam"): taş kutunun üstündeki kırmızı püsküller kırmızı bir tarak/fırça gibi okunuyor; izleyici bunun kraliyet saçağı olduğunu anlamaz, idam anı görsel olarak boş geçiyor.** Düzeltme: sahne 2'deki kapıyı tekrar kullan: aynı aydınlık kapı, içi boş, eşikte yere düşmüş tek kırmızı saçak (bant + püsküller, figürün başında görülen şekille aynı, böylece tanınır); "idam"da kapının içindeki ışık yavaşça söner. Ayrıca `bt_road` sahnesinde karenin altında eğik bir kenar görünüyor (sheet satır 2, sağ: y≈850'de yamuk alt sınır) → zemin dolgusunu kadrajın altına kadar düz uzat.

### 01-atahualpa-fidye-odasi — Tur 2 (yazar)
- Anlatım eleştirmenin metnine geçti (374 kr): "neden" eklendi ("Ama İspanyollar serbest bir imparatordan korktu."), punchline "Duvardaki çizgi kaldı. İmparator kalmadı." (sahne 8 görüntüsüyle aynı). "Peru, 1532." birleşti → sahne 1 "1532'de …". "Fidye toplandı" ve `bt_ingot`/`bt_fringe` sahneleri çıktı.
- Başlık: "Atahualpa: Oda Dolusu Altın Onu Neden Kurtaramadı?" (50 kr); açıklamaya cevap eklendi (İspanyollar serbest kalacak imparatorun ordularından korktu).
- Figür: altın bant başın tepesine, kırmızı saçak kısa ve alın çizgisinde; yüz boş siyah. Sahne 1'de kapının iki yanında arkası dönük, miğferli (morion) iki İspanyol askeri; teberler ellerinden kapı önüne çaprazlanıyor (baş yüksekliğinin altında). Askerler alt yarıyı dolduruyor.
- "korktu" sahnesi yeni: `bt_andes` fires — sırtlarda kamp ateşleri, sol altta (altyazının altında) miğferli asker silueti.
- İdam sahnesi: aynı kapı boş, eşikte düşmüş saçak (bant + püsküller, figürdekiyle aynı renkler), "idam"da ışık söner.
- `bt_road`: alt sınır düz; kadrajı boydan boya kesen çokgen taşlı taraça duvarı (y 1360–1500) + düz koyu zemin.
- Kapak yığını sadeleşti: 34 ayrık, opak nesne (üst üste binmiyor, arkadan öne sıralı), opak altın zemin.
- lint OK (SEO 100/100); preview ~27–28 sn tahmin, 10 sahne, 374 kr, cue'lar eşleşti. Bilinen: sahne 0 STATIC? (kapak kancası).

### 01-atahualpa-fidye-odasi — Eleştirmen — Tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 7 | 7 | 8 | 8 | 9 | 8 | 8 |

lint OK (SEO 100/100), 374 karakter, devrik cümle yok, "-yor" 0. **Tüm kriterler ≥ 7, kapak 8 → geçti.** Tur 1'in üç sorunu giderildi: "neden" cümlesi eklendi ve başlık ("…Onu Neden Kurtaramadı?") artık videoda cevaplanıyor; punchline "Duvardaki çizgi kaldı. İmparator kalmadı." sahne 8 görüntüsüyle birebir ve akılda kalıyor; bant başın tepesinde (taç gibi okunuyor), morionlu iki İspanyol askeri "bir avuç İspanyol"u gösteriyor; kapak yığını sade ve telefonda okunuyor; `bt_road` alt kenarı düz. Kalan sorunlar (isteğe bağlı 3. tur):

1. **Sahne 6 ("…korktu"): neden korktukları görünmüyor ve asker silueti yanlış yerde.** Sırtlardaki ateşler küçük, anlatım bunların İnka orduları olduğunu söylemiyor; tek miğferli asker sol altta y ≈ 1300–1920'de, yani altyazının altında ve YouTube arayüzü bölgesinde. Düzeltme: askeri y ≈ 700–1150'ye, sol üçte bir çizgisine, sırtı bize dönük ve ateşlere bakar şekilde taşı; ateşleri büyüt ve sırtlara yay. Metni daha somut yap: "Ama İspanyollar onun ordularından korktu." (41 kr, mevcut cümleden 7 kr kısa; cue `ordularından`). Tarihsel olarak doğru: Rumiñahui ve İnka generallerinin saldıracağı söylentisi idamı hızlandırdı.
2. **Sahne 1 ("esir"): teberlerin ağızları Atahualpa'nın başının iki yanında, saplar gövdesinin üstünden geçiyor; yaralanıyormuş gibi okunuyor** (yazar notu "baş yüksekliğinin altında" diyor, karede öyle değil). Düzeltme: saplar kapı eşiğinin önünde, bel/diz hizasında çaprazlansın; ağızlar figürün gövdesinin dışında ve başın en az 150 px altında kalsın.
3. **Sahne 7 ("idam"): eşikteki saçak çok küçük (~120 px), 360 px'te kırmızı bir tarak gibi.** Düzeltme: saçağı yaklaşık 2 kat büyüt, altın bandı belirgin çiz, ışık havuzunun ortasına koy; `"camera": {"focus": [540, 1180], "zoom": 1.6}` ile yavaş yaklaş, böylece sahne 1'deki taçla bağlantı kurulsun.

### 01-atahualpa-fidye-odasi — Tur 3 (yazar)
- Sahne 6: "Ama İspanyollar onun ordularından korktu." (cue `ordularından`) → toplam 367 kr. Asker sol üçte birde, y≈700–1150, sırtı dönük, ateşlerin önünde (askerin arkasında ateş yok); ateşler büyüdü (çekirdek r 9–15 + hale).
- Sahne 1: teberler 900 px'e uzadı, hedef açı 33,5°; saplar figürün bel/diz hizasında (y≈950) çaprazlanıyor, ağızlar omuzların dışında kalıyor; dönüş `esir`den 0,7 sn önce başlıyor (önceki turda sahne sonunda yarım kalıyordu).
- Sahne 7: saçak 2x (`fringeObj` `k` ölçeği), ışık havuzunun ortasında (eşik, y≈1060–1150); `camera` focus [540,1180] zoom 1.6 push.
- lint OK (SEO 100/100); preview ~27–28 sn tahmin, 10 sahne, 367 kr, cue'lar eşleşti. Bilinen: sahne 0 STATIC? (kapak kancası); sahne 1'de çapraz teber sapları altyazı satırının üstünden geçiyor (ince çizgi, yazı okunuyor).

### 01-atahualpa-fidye-odasi — Eleştirmen — Tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 7 | 7 | 8 | 8 | 8 | 9 | 8 | 8 |

lint OK (SEO 100/100), 367 karakter. **Tüm kriterler ≥ 7, kapak 8 → geçti; kritik sorun yok.** Sahne 6 artık net: asker sol üçte birde, sırtı dönük, ateşlerin önünde; "ordularından" cümlesi görüntüyle örtüşüyor ve tarihsel olarak doğru. Kalan küçük sorunlar (yayını engellemez):
1. Sahne 1 ("esir"): çapraz teber sapları altyazı satırının, tam da altın "esir" kelimesinin üstünden geçiyor ve X figürün gövdesini "üstü çizilmiş" gibi kapatıyor → sapları y ≈ 1150'de bitir (altyazı şeridine girmesin), kesişmeyi diz hizasına (y ≈ 1050) indir.
2. Sahne 7 ("idam"): zoom 1.6'da kapı üstten kesiliyor, saçak düz altın çubuk + kırmızı dişlerle büyük bir tarağa benziyor → zoom'u 1.3'e indir (kapının tamamı görünsün), bandı hafif kavisli ve örgü dokulu çiz, püskülleri farklı uzunlukta ve hafif dağınık bırak.

### Yönetmen — son kapı
- Tur 3 sonrası küçük düzeltme (yönetmen): sahne 7 kamera zoom 1.6 → 1.3 (kapı kesilmesin).
- lint OK (SEO 100/100); sheet.png ve cover.jpg yönetmen tarafından gözle incelendi: sol üst boş, taşan yazı yok, tek özne.
