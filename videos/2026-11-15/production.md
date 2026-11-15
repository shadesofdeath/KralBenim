# 2026-11-15 — Düşün Bakalım üretim notu

Plan (`tools/plan.py`): 1 Shorts (`01-…`, 19:00 İstanbul). Bugün uzun video yok; sonraki uzun video: 2026-11-16.
ElevenLabs: `warning: true` (ay içi 242.868 / bütçe 231.442, yenileme 2026-11-20) → karakter alt uçta (~330–370).

## Manşet
`tools/news.py --channel db` çalışmadı (bulut ağından Google News'e erişim yok: 403). Web aramasında havuza uyan belirli
bir güncel manşet bulunamadı → konu havuzdan (plan önerisi: felaketler ve kazalar).

## 01 — Nyos Gölü (Shorts) · `01-nyos-golu.json`
- **Konu:** Kamerun, Nyos Gölü, 21 Ağustos 1986 gecesi. Göl derinliklerinde birikmiş karbondioksit bir anda yüzeye çıktı
  (limnik patlama); havadan ağır, görünmeyen gaz bulutu vadilerden aşağı aktı (saatte 70 km'ye kadar), 26 km uzağa kadar
  1.700'den fazla insan (Britannica: 1.746) ve binlerce hayvan öldü. Su 80–100 m sıçradı; berrak mavi göl çamurlu
  kırmızıya döndü. 2001'den beri gölün dibinden yüzeye uzanan borular gazı yavaşça boşaltıyor. İki yıl önce Monoun Gölü (37 kişi).
- **Havuz:** felaketler ve kazalar (geçmişte Nyos/Monoun yok; Krakatoa, Tambora, Tunguska farklı).
- **İzleyici sonunda ne hisseder:** ürperti — sakin bir göl, sessiz bir gece, görünmeyen bir ölüm; ve gölün hâlâ "nefes aldığı" fikri.
- **Kanca + kapak:** "Bu göl bir gece nefes verdi." ↔ kapak `GÖL / NEFES VERDİ` (vurgu: nefes). Tek özne: gece, ay ışığı
  havuzunda dağlar arasında kapkara, düz bir göl; yüzeyinden yükselen soluk, ağır gaz örtüsü.
- **Tema:** `derin` (gece, derin su; bir önceki DB videosu `obsidyen`, ondan önceki `kum`).

### Anlatım (tek parça, son hâli)
Bu göl bir gece nefes verdi. Kamerun, 21 Ağustos 1986. Gölün dibinde yıllarca karbondioksit birikmişti.
Kimse bilmiyordu. O gece gaz bir anda yüzeye çıktı. Görünmeyen, ağır bir bulut vadilerden aşağı aktı. Sabah, bin yedi yüzden fazla insan
uyanmadı. Mavi göl kırmızıya dönmüştü. Bugün göl, borulardan her gün biraz nefes veriyor. Böyle sessiz hikâyeler için abone olun.

(370 karakter: tur 1'de "Kimse bilmiyordu." eklendi, tur 2'de 3. cümle kısaltıldı; preview tahmini ~27–28 sn, 9 sahne.)

### Çekim listesi (son hâli) — tema `derin`, yeni tipler `scenes/studio/shots/bt_nyos.js`
| # | Cümle | Görüntü | Tip | Cue | Kamera |
|---|---|---|---|---|---|
| 1 | Bu göl bir gece nefes verdi. | Gece, ay, yüksek açı: geniş kara göl kadrajın ortasını doldurur (y≈920–1490), ay suda parlak yol; ay solda, ayın parlak yolu gazdan ayrı; su çizgisine oturan, farklı boylarda yumuşak kümelerden tek gaz kütlesi (dibi parlak, yukarı silinir, dış çizgi yok) sağa kayar; "nefes"te sağ yanı kabarır, bir dil sağ kıyıyı aşıp yamaçtan iner; önde kamışlar (kapak karesi) | `bt_ny_lake` hook | nefes | varsayılan yavaş itme |
| 2 | Kamerun, 21 Ağustos 1986. | Tek başına Afrika (Madagaskar ile), Nyos'ta altın nabız noktası + "Kamerun"; "Ağustos"ta altın italik "21 Ağustos 1986" | `bt_ny_map` | Ağustos | yavaş itme |
| 3 | Gölün dibinde yıllarca karbondioksit birikmişti. Kimse bilmiyordu. | Göl kesiti: krater duvarları, koyu su, dipte kabarcıklı soluk katman yavaşça kalınlaşır, derinden ince sızıntı; "CO₂" belirir | `bt_ny_section` still | karbondioksit | yavaş itme |
| 4 | O gece gaz bir anda yüzeye çıktı. | Aynı kesit: kabarcık sütunu fırlar, yüzey kubbe gibi kabarır, damlalar, üstte soluk bulut | `bt_ny_section` burst | yüzeye | yavaş itme |
| 5 | Görünmeyen, ağır bir bulut vadilerden aşağı aktı. | Yukarıdan eş yükselti haritası: yukarıyı gösteren V çizgileri aşağı açılan vadi; tepede göl; aşağı doğru genişleyen soluk gaz dili; üç köyde 3–4 küçük konik kulübe, sıcak ışıklar gaz geçtikçe birer birer söner, sonuncusu "aşağı"da | `bt_ny_valley` | aşağı | yavaş itme |
| 6 | Sabah, bin yedi yüzden fazla insan uyanmadı. | Şafak, tek sazdan çatılı kulübe, karanlık kapı, üç taş üstünde tencere; kapıdan inen patika, otlar, taşlar; ocağın son dumanı ve közü "uyanmadı"dan önce tamamen söner; yerde alçak sis (kurban gösterilmez) | `bt_ny_hut` | uyanmadı | yavaş itme |
| 7 | Mavi göl kırmızıya dönmüştü. | Aynı göl soğuk şafakta, yüksek açı, mavi su kadrajı doldurur; ortadan çamurlu kırmızı-kahverengi girdaplar yayılıp sonunda bütün yüzeyi kaplar; önde kamışlar | `bt_ny_lake` red | kırmızıya | yavaş itme |
| 8 | Bugün göl, borulardan her gün biraz nefes veriyor. | Gölün ortasında sal, derindeki gaz katmanına inen boru (içinde yükselen kabarcıklar), saldan ince fıskiye; "nefes"te yükselir | `bt_ny_pipe` | nefes | yavaş itme |
| 9 | Böyle sessiz hikâyeler için abone olun. | Gece, geniş durgun göl, ayın parlak yolu, ortada küçük sal + ince fıskiye ve halkalar; önde kamışlar | `bt_ny_lake` calm | — | yavaş itme |

Tip dağılımı: 6 farklı tip; `bt_ny_lake` 3/9 (%33), üst üste en fazla 2 (`bt_ny_section`).

### Kapak adayları
- **A — seçildi:** sahne 0, t 2.0, odaksız: GÖL / NEFES VERDİ (vurgu "nefes"), altta ay + gaz örtüsüyle kaplı gece gölü. Kanca karesiyle aynı, tek özne, telefonda okunuyor.
- B: sahne 0, focus [540, 960] zoom 1.3: göl büyüyor ama ay kadraj dışında kalıyor, örtü sırt gibi okunuyor → elendi.
- C: sahne 3 (kesit, su kubbesi), focus [540, 700] zoom 1.2: dramatik ama gece gölü kancası değil, kesit grafiği küçükte karışık → elendi.
- D: "BU GÖL / NEFES VERDİ", sahne 0 zoom 1.45: ay yok, yazı üç kelimeye çıkıyor, fark yok → elendi.
- E: sahne 0, focus [620, 900] zoom 1.2: ay üstte kesiliyor → elendi. F: sahne 8 (sakin göl + fıskiye): sakin, gizem yok → elendi.

### Kaynaklar
- Britannica — Lake Nyos disaster: https://www.britannica.com/event/Lake-Nyos-disaster (21 Ağu 1986, 1.746 ölü, ~3.000 sığır, koyu kahverengi göl)
- EARTH Magazine — Benchmarks: August 15, 1984 & August 21, 1986: African killer lakes erupt:
  https://www.earthmagazine.org/article/benchmarks-august-15-1984-august-21-1986-african-killer-lakes-erupt/ (26 km, 70 km/sa,
  ~1 km³ CO2, 80–100 m su, mavi → çamurlu kırmızı, ilk boru 2001)

### Eleştiri günlüğü (01)

### 01-nyos-golu — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 6 | 8 | 6 | 7 | 5 | 7 | 7 | 9 | 8 | 6 |
1. Kanca/kapak (sahne 0): göl ~100 px'lik şerit, gaz örtüsü tepe gibi okunuyor, gökyüzü ve alt kısım boş; kapak yazısı ile başlık aynı fikir.
2. Kırmızı göl (sahne 6) ve göl kadrajı (0/8): ince şerit, kırmızı düz elips, "şafak" gece gibi; alt üçte bir boş.
3. Vadi (sahne 4): köyler bisiklet tekerleği/dişli gibi; eş yükselti çizgileri gerçek vadi gibi değil. Küçük: kulübede duman/köz cue'da hâlâ var, alt %40 boş; süre ~27 sn < 28.

**Düzeltmeler (yazar):**
- Göl sahneleri baştan çizildi: yüksek açı, ufuk y≈760–900, göl y≈920–1490 kadrajın ortasını dolduruyor, ayın suda parlak yolu, alt üçte bir koyu kıyı yamacı + yavaşça salınan kamış siluetleri (her üç modda). Hook: tepe gibi okunan şeritler yerine tek, yuvarlak, parlak bir gaz kubbesi (4 katman, yumuşak sarkık taban, sert çizgi yok) sudan kabarıyor, ince bir örtü yakın kıyıdan yamaca taşıyor.
- Kırmızı: soğuk şafak gradyanı (gece değil); ortadan 9 düzensiz, yavaş dönen kırmızı-kahverengi girdap yayılıp sahne sonunda bütün yüzeyi kaplıyor. Sahne 6'nın son karesindeki ince dikey çizgi, sonraki sahneye (`bt_ny_pipe`) çözülme geçişinden geliyor; sahnenin içinde artık sal/boru çizgisi yok.
- Vadi: yukarıyı gösteren V eş yükselti çizgileri, aşağı doğru açılıyor; gaz dili aşağı doğru genişliyor; köyler 3–4 küçük konik kulübe + kapıda parlak sıcak ışık; ışıklar gaz önü geçtikçe tek tek sönüyor, sonuncusu "aşağı"da.
- Kulübe: duman ve köz cue'dan ~0,1 sn önce tamamen sönmüş; kapıdan inen patika, ot tutamları, taşlar alt kısmı dolduruyor.
- Metin: "Kimse bilmiyordu." eklendi (386 karakter, ~29 sn). Başlık "Nyos Gölü: 1.700 Kişi Neden Bir Gecede Uyanmadı?" oldu (kapak GÖL / NEFES VERDİ ilk cümleyle aynı, başlığı tekrar etmiyor); etiket "1986 felaketi" → "kamerun gölü faciası". Lint hatasız, SEO 100.
- Kapak adayları (tur 1): **A — seçildi** (sahne 0, t 2.0: ay + suyun üstünde kabaran parlak gaz kubbesi, tek özne); B (sahne 0, focus [560, 1050] zoom 1.15: ay kadraj dışında kalıyor); C (sahne 3 patlama karesi, su kubbesi + kabarcık sütunu, focus [540, 700] zoom 1.2: güçlü ama bir şema, kanca karesi değil); D (sahne 0, t 2.6: A ile neredeyse aynı).

### 01-nyos-golu — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 7 | 7 | 7 | 8 | 8 | 9 | 8 | 7 |
1. Hook gazı: 4 iç içe simetrik, düz tabanlı mercek istiridye/dudak gibi okunuyor.
2. Kapak: y480–1030 boş gökyüzü, özne alt %40'ta.
3. Bütçe: 3. cümle uzun. Küçük: sahne 2'nin ilk karesinde altyazı gri.

**Düzeltmeler (yazar):**
- Hook gazı baştan: 5 farklı boyda kümenin birleşiminden tek, loblu bir kütle; tabanı su çizgisinde (y 1170), su çizgisinin altına hiçbir şey çizilmiyor; tek dikey gradyan (dipte en parlak, yukarı doğru siliniyor), 7 yumuşak iç içe katman, dış çizgi ve parlak çekirdek yok, iki yanı sıfıra inceliyor; kütle yavaşça sağa kayıyor. "nefes"te sağ kümeler kabarıyor ve bir gaz dili sağdaki sırt omzunu aşıp yamaçtan aşağı iniyor. Ay ve sudaki yolu sola alındı, buluttan ayrı.
- Kapak: gaz kütlesi uzatıldı (sırtın üstüne yükseliyor) + `focus` [620, 900] `zoom` 1,2; bulut yazının hemen altında (~y 700–800) başlıyor, ay solda kadrajda. Adaylar: **H — seçildi** (sahne 0 t 2.0 + focus/zoom: tek özne, ay + yükselen gaz); C (sahne 3 patlama, t 1.5: kabarcık sütunu + su kubbesi; net ama bir şema, kanca karesiyle uyuşmuyor); R (sahne 6 kırmızı göl: renkli ama "nefes verdi" fikrini göstermiyor, girdap okunmuyor).
- Metin: "Nyos Gölü'nün derinliklerinde…" → "Gölün dibinde yıllarca karbondioksit birikmişti." (370 karakter).
- Sahne 2'deki gri altyazı hata değil: kare, harita → kesit çözülme geçişinin içine düşüyor ve altyazı orada normal olarak beliriyor (4,8 sn'de tam beyaz, `--times` ile kontrol edildi).
- Lint hatasız, SEO 100; preview ~27 sn, STATIC? uyarısı yok (hook hareketi 2,2).


### 01-nyos-golu — tur 3
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+sadelik | Tema | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 7 | 7 | 8 | 8 | 9 | 8 | 7 |
1. Hook: sağdaki koyu, açık çizgili yarım elips (x≈920–1080) delik/kapı gibi okunuyor.
2. Hook: gaz kütlesinin tabanında y≈1475'te sert yatay kesik; göl sert bir basamakla iki banda ayrılıyor.

**Düzeltmeler (yazar, sadece sahne 0 + ortak göl yüzeyi):**
- Sağ kıyı: koyu yarım elips yerine sırt tonunda alçak bir dudak; üstü su çizgisinden hafifçe yükselip sağ kenara doğru yumuşakça iniyor, iç kenarı kıvrık bir kıyı çizgisi; dış çizgi yok. Gaz dili bu alçak dudağın üstünden aşıp yamaçtan iniyor.
- Gaz tabanı: clip kaldırıldı; kütle su çizgisinin altında sığ, yuvarlak bir "ayak"la kapanıyor ve gradyanla ~120 px içinde suya karışıp kayboluyor (sert kesik yok).
- Göl: üstteki ay ışığı bandının sert basamağı kaldırıldı; tek yüzey, yukarıdan aşağı yumuşak bir gradyan + ayın sudaki yolu (üç göl modunda da).
- Lint hatasız, SEO 100; preview ~27 sn, hook hareketi 2,4; cover.jpg kontrol edildi (yazı altında yükselen gaz, solda ay, sağda alçak kıyıdan taşan dil).
