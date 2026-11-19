# 2026-11-19 — Düşün Bakalım

**Manşet:** `tools/news.py --channel db` bu oturumda çalışmadı (proxy 403: Google News'e erişim yok); web aramasında
havuza uyan güncel bir Türkiye manşeti bulunamadı → **havuzdan** (plan kategorisi: büyük kararlar ve savaşlar).
Kanca olarak bugünün yıl dönümü kullanıldı: **19 Kasım 1942, Uranüs Harekâtı** (bugün 84. yıl dönümü).
ElevenLabs uyarısı (`warning: true`, yenilenme 2026-11-20) → anlatım alt uçta (330–380).

## 01 — Uranüs Harekâtı (Shorts) · `01-uranus-harekati.json` · yayın 19.11 19:00 (İstanbul)
- **Konu:** Stalingrad, 19 Kasım 1942 sabahı. Alman 6. Ordusu aylardır şehrin yıkıntılarında savaşırken kanatlarını
  daha zayıf donanımlı Romen 3. ve 4. Orduları tutuyordu. Sabah sisinde Sovyet topçusu ateş açtı (kuzeyden 19 Kasım,
  güneyden 20 Kasım), iki kol 23 Kasım'da Kalaç (Sovetski) yakınında buluştu. ~250.000–300.000 Mihver askeri çemberde
  kaldı. Şubat 1943 başında teslim; ~91.000 esir, savaştan sonra ancak ~5.000–6.000'i eve döndü.
- **Havuz:** büyük kararlar ve savaşlar. Geçmişte Stalingrad işlenmedi.
- **İzleyici sonunda ne hisseder:** avcının bir sabah av olmasının ürpertisi; karın içindeki sessizlik.
- **Kanca + kapak:** "Kuşatanlar, bir sabah kuşatıldı." ↔ kapak `KUŞATANLAR / KUŞATILDI` (vurgu: kuşatıldı).
  Tek özne: karın içinde ışık havuzunda tek bir miğfer; çevresinde iki ince kırmızı yay kapanır (çember).
- **Tema:** `derin` (kış gecesi, soğuk; önceki DB videosu `fildisi`).

### Anlatım (taslak, tur 0)
Kuşatanlar, bir sabah kuşatıldı. 19 Kasım 1942, Stalingrad. Alman ordusu aylardır şehrin yıkıntılarında savaşıyordu.
Ama kanatlarını daha zayıf birlikler tutuyordu. O sabah sis vardı. Sisin içinden binlerce top aynı anda ateş açtı.
Dört gün sonra iki Sovyet kolu buluştu. Çemberin içinde üç yüz bine yakın asker kaldı. Esir düşenlerin çok azı eve
döndü. Böyle sessiz hikâyeler için abone olun.

### Çekim listesi (taslak; yazar ajan bt_uranus.js ile kesinleştirir)
1. Hook — karda tek miğfer, ışık havuzu; iki ince yay kapanır (kapak karesi). Kamera: yavaş yaklaşma.
2. "19 Kasım 1942, Stalingrad." — Volga kıyısında yıkık şehir silueti, kar yağar; yer + tarih tek satır.
3. "…yıkıntılarında savaşıyordu." — yıkık fabrika iskeleti, boş pencereler, uzak duman.
4. "Ama kanatlarını…" — sade harita: Volga, şehir noktası, iki yanda ince kesik çizgili kanatlar; "zayıf"ta kanatlar solar.
5. "O sabah sis vardı." — düz bozkır, sis bandı yerde kayar, tek telgraf direği.
6. "…binlerce top…" — sisin içinde ufukta art arda yanan namlu ağızları (ışık noktaları).
7. "Dört gün sonra…" — harita: kuzey ve güneyden iki ok, Kalaç'ta birleşir, çember kapanır.
8. "…üç yüz bine yakın…" — sayı kartı ~300.000, altta karın içinde küçük siluet sıraları.
9. "Esir düşenlerin çok azı…" — karda uzaklaşan iz sırası, sonu yok.
10. Abone — kar yağar, miğfer karın altında kaybolur.

### Kaynaklar (yazar doğrular)
- Encyclopaedia Britannica — Battle of Stalingrad
- National WWII Museum — Stalingrad
- Wikipedia — Operation Uranus

### Anlatım (tur 1) — 380 karakter
Kuşatanlar, bir sabah kuşatıldı. 19 Kasım 1942, Stalingrad. Alman ordusu aylardır şehirde savaşıyordu. Kanatlarını
ise silahı az Romen birlikleri tutuyordu. O sabah donmuş bir sis vardı. Binlerce top sisin içinden tam oraya ateş
açtı. Dört gün sonra yüz binlerce asker çemberde kaldı. Doksan bir bin esirden, ancak beş bin kadarı eve döndü.
Böyle sessiz hikâyeler için abone olun.

("-yor": 2/9 cümle; devrik cümle yok. "Peki neden": darbe kentin kendisine değil, zayıf Romen kanatlarına indi.
Çemberdeki sayı tahminleri 250–330 bin arasında değiştiği için kesin sayı yerine "yüz binlerce".)

### Çekim listesi (kesin; `scenes/studio/shots/bt_uranus.js`, tema `derin`)
| # | Metin | Tip | Görüntü | Cue |
|---|---|---|---|---|
| 0 | Kuşatanlar, bir sabah kuşatıldı. | `bt_uranus_helmet` (hook) | karda yarı gömülü miğfer, ışık havuzu; karın üstünde iki altın yay doğudan çıkıp batıda çemberi kapatır (kapak karesi) | kuşatıldı |
| 1 | 19 Kasım 1942, Stalingrad. | `bt_uranus_city` | Volga'nın karşısından yıkık şehir silueti, tahıl silosu, iki duman, kar; "Stalingrad" + altın "19 Kasım 1942" | Stalingrad |
| 2 | Alman ordusu aylardır şehirde savaşıyordu. | `bt_uranus_ruin` | yakın plan yıkık fabrika duvarı, kırık çatı makasları, top deliği, pervazlarda kar; arkada ateş ışığı | aylardır |
| 3 | Kanatlarını ise silahı az Romen birlikleri tutuyordu. | `bt_uranus_map` (flanks) | Don–Volga haritası, Alman ordusu lekesi; iki kanattaki kesik çizgiler altın olup incelir, "Romenler" | Romen |
| 4 | O sabah donmuş bir sis vardı. | `bt_uranus_steppe` | şafakta donmuş bozkır, tek telgraf direği, çit kazıkları, yerde kayan sis | donmuş |
| 5 | Binlerce top sisin içinden tam oraya ateş açtı. | `bt_uranus_guns` | sisli ufukta birbiri ardına yanan namlu ışıkları; "ateş"te bütün ufuk yanar | ateş |
| 6 | Dört gün sonra yüz binlerce asker çemberde kaldı. | `bt_uranus_map` (ring) | kuzey ve güneyden iki altın ok Kalaç'ta buluşur ("23 Kasım"), halka lekenin çevresinde kapanır | çemberde |
| 7 | Doksan bir bin esirden, | `bt_uranus_march` | karda ufka doğru uzaklaşan siluet kolu; "91.000 / esir" | esir |
| 8 | ancak beş bin kadarı eve döndü. | `bt_uranus_return` | 91 küçük siluet (her biri bin kişi); beşi dışında hepsi solar, beşi altın; "5.000 / eve döndü" | beş |
| 9 | Böyle sessiz hikâyeler için abone olun. | `bt_uranus_helmet` (end) | aynı miğfer, çember solar, kar birikintisi yükselip miğferi örter | — |

Kapak: `KUŞATANLAR / KUŞATILDI` (vurgu: kuşatıldı), sahne 0, t 2.2, focus [540, 900], zoom 1.3. 3 aday denendi
(A: t 2.2 zoom 1.3, çember solda henüz kapanmamış; B: t 2.6 zoom 1.1, miğfer küçük; C: sahne 9, kapalı çember,
kar yükselmiş). A seçildi: "kapanmak üzere" olan çember kancayı en iyi taşıyor, miğfer telefonda okunuyor.

### Anlatım (tur 2) — 394 karakter
Kuşatanlar, bir sabah kuşatıldı. 19 Kasım 1942, Stalingrad. Alman ordusu aylardır şehirde savaşıyordu. Kanatlarını
silahı az Romenler tutuyordu. O sabah donmuş bir sis vardı. Binlerce top, sisin içinden Romen hattına ateş açtı.
Dört gün sonra yüz binlerce asker çemberde kaldı. Şubat'ta teslim olan doksan bir bin esirden, ancak beş bin kadarı
eve döndü. Böyle sessiz hikâyeler için abone olun.

Tur 1 eleştirisine göre yapılanlar:
- **Miğfer (sahne 0, 9, kapak):** dolu koyu Stahlhelm M35 silueti (alın siperi, dışa açılan ense koruması,
  havalandırma perçini), daha yüksek kubbe; kar birikintisine gömülü, siper ve ense ucu karın üstünde; ışık havuzu
  y≈1000; alt yarı ön plan kar dalgaları ve yerde kayan sis. Halka artık yatay "Satürn" elipsi değil: miğferi
  saran dik bir elips, iki yay önden başlayıp iki yandan dolanır ve miğferin arkasında/üstünde buluşur; kapak anında
  (t 2.4) tam kapalı. Kapak 3 aday: A zoom 1.0, B zoom 1.15, C son sahne; **B seçildi** (miğfer büyük, halka
  kadrajın içinde, yazı ile özne arası dengeli).
- **Sahne 7:** zaman köprüsü ("Şubat'ta teslim olan…"); kol ve iz y≈640–1110 bandında, altı ön plan kar dalgaları;
  "Şubat 1943 / 91.000 / esir" ilk karede görünür.
- **Sahne 6:** iki ayrı kavisli altın kol + ok başları (kuzey: Don'un kuzeybatısından güneydoğuya; güney:
  Stalingrad'ın güneyinden batıya/kuzeybatıya), Don kıvrımında Kalaç'ta buluşma ve yumuşak ışık, sonra halka.
- **Doğruluk:** "tam oraya" → "Romen hattına" (19 Kasım saldırısı kuzeydeki Romen 3. Ordusu'na; güney 20 Kasım,
  açıklamaya eklendi). Sahne 3: kanat çizgileri kalın ve ink renginde, "Romenler" etiketleri büyük, haleli, baştan
  görünür; "Romen"de altın olur.

### Doğrulanmış kaynaklar
- Britannica, Timeline of the Battle of Stalingrad — 19 Kasım taarruzu kanatlara, "under-equipped Romanian troops";
  23 Kasım kıskaçların Kalaç'ta buluşması; 2 Şubat 1943'te kalan 91.000 kişinin teslimi; esaretten "yalnızca
  yaklaşık yüzde beşi" sağ çıktı. https://www.britannica.com/list/timeline-of-the-battle-of-stalingrad
- Britannica, Battle of Stalingrad (özet) — Şubat 1943'te 91.000 askerle teslim. https://www.britannica.com/summary/Battle-of-Stalingrad
- HISTORY, Battle of Stalingrad ends — ~90.000 esir, yalnızca ~5.000'i Sovyet esir kamplarından sağ dönebildi.
  https://www.history.com/this-day-in-history/battle-of-stalingrad-ends
- HistoryNet, The Romanian Nightmare at Stalingrad — 18/19 Kasım gecesi kar, sabah "kalın, donmuş sis"; 07:30'da
  Katyuşalar ve 3.500 top/havan, 90 dk; Romen 3. Ordusu'nun tanksavar ve kışlık donanım eksikliği.
  https://historynet.com/romanian-nightmare-stalingrad/
- Ek kontrol (listede yok): Wikiwand/Wikipedia "Operation Uranus" — çemberde ~290.000 Mihver askeri; buluşmayı
  22 Kasım akşamı Kalaç diye verir (Britannica ve HISTORY 23 Kasım). Ekranda "23 Kasım" Britannica'ya göre.

## Eleştiri günlüğü
- **Tur 1** (eleştirmen ≠ yazar): Senaryo 7 · Kanca 8 · Okunabilirlik 6 · Görsel=anlatım 6 · Hareket 7 · Kompozisyon 7 · Tema 8 · Tempo 8 · Doğruluk 7 · Kapanış 8 · Kapak 7.
  Sorunlar: miğfer melon şapka gibi, yüzüyor, kapakta halka açık; sahne 7 esir kolu altyazı arkasında; sahne 6 kıskaç tek çizgi, Kalaç yanlış yerde; "tam oraya" havada (19 Kasım'da sadece kuzey kanat).
  Düzeltme: dolu Stahlhelm silueti kara gömülü, dik kapalı halka, kapak t 2.4 zoom 1.15 (3 aday); esir kolu y 640–1110 + "Şubat 1943 / 91.000 / esir"; iki kavisli ok Kalaç'ta buluşur; metin "Romen hattına ateş açtı", "Şubat'ta teslim olan…".
- **Tur 2**: Senaryo 8 · Kanca 8 · Okunabilirlik 8 · Görsel=anlatım 8 · Hareket 7 · Kompozisyon 7 · Tema 8 · Tempo 8 · Doğruluk 9 · Kapanış 8 · Kapak 8. Tüm kriterler ≥ 7, kapak 8 → geçti.
  Yönetmen cilası: sahne 3 "Kanatlarını silahı az Romenler tutuyordu." → "Kanatlarda ise silahı az Romenler vardı." (özne belirsizliği; 393 karakter). 3. tur atlandı (hedefler tuttu).
