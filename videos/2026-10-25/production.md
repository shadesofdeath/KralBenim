# Prodüksiyon — 2026-10-25 (Pazar)

Plan (`tools/plan.py`): 1 Shorts + 1 uzun video (Düşün Bakalım). ElevenLabs: bu ay 72.054 / 231.442 karakter,
**uyarı: true** (yenilemeye kadar tahmini 377.554) → karakterler aralığın alt ucunda: Short ~400–430, uzun ~4.300–4.450.
Görseller sadece kodla (Higgsfield ve diğer yapay zekâ araçları yasak). Dünün (24.10) iki videosu yüklenmiş (`*.youtube.json` var).

| Dosya | Konu | Havuz | Dönem | Yayın (İstanbul) |
|---|---|---|---|---|
| 01-halifax-patlamasi | 1917 Halifax Patlaması: iki geminin çarpışması bir şehri yıktı | felaketler ve kazalar | 1917, Kanada | 25.10 19:00 |
| 02-derinkuyu-yeralti-sehri (uzun) | Derinkuyu Yeraltı Şehri: 1963'te bir duvarın arkasından çıkan şehir, kim kazdı, neden saklandılar | kayıp şehirler ve gizemler + Türkiye tarihi | Frig → Bizans → Osmanlı → 1923 → 1963 | 25.10 20:30 |

Geçmişte işlenmedi (iki kanalın tüm başlıkları tarandı: Halifax, Derinkuyu, Kapadokya yok). İki video farklı kıta,
farklı dönem; Short bir anlık felaket, uzun video bin yıllara yayılan bir gizem. Bu haftanın Türkiye/Osmanlı sayısı
Derinkuyu ile birlikte ≥ 2 (Ankara 1402 dün).

---

## 01-halifax-patlamasi (Shorts, 19:00)

- **Hissedilen:** "Bir liman kazası, atom bombasından önceki en büyük insan yapımı patlamaya dönüştü; en çok can alan
  şey ise insanların merakıydı: yangını izlemek için pencerelere koştular."
- **Kanca + kapak fikri:** ilk cümle ör. "Bu yangını izlemek ölümcüldü." ↔ kapak `YANGINI / İZLEMEK / ÖLDÜRDÜ`
  (vurgu `İZLEMEK`) ya da `BİR GEMİ / ŞEHRİ / SİLDİ` (vurgu `ŞEHRİ`). Kapak karesi: limanda alev alan gemi + pencereden
  bakan kalabalık, büyük şok/korku Kaşif.
- **Doğrulanacak bilgiler (web'den kontrol):** 6 Aralık 1917 sabahı, Halifax (Kanada) limanının dar boğazında Fransız
  yük gemisi Mont-Blanc ile Norveç gemisi Imo çarpıştı. Mont-Blanc savaş için patlayıcı taşıyordu (pikrik asit, TNT,
  güverte üstünde benzol varilleri). Yangın çıktı, mürettebat gemiyi terk etti; yanan gemi iskeleye sürüklendi,
  insanlar izlemeye toplandı, pencerelere çıktı. Yaklaşık 20 dakika sonra (saat 9:04 civarı) patladı: yaklaşık 2.000
  ölü, yaklaşık 9.000 yaralı; camlar yüzünden çok sayıda göz yaralanması. Geminin çapası kilometrelerce uzağa savruldu
  (mesafeyi doğrula). Tren dispeçeri Vince Coleman telgrafla gelen treni durdurdu ve öldü (Short'a sığmazsa kullanma).
  Sayılarda "yaklaşık" de; emin olmadığın sayıyı yazma.
- **Görsel omurga önerisi:** `map` (Halifax limanı, dar boğaz, iki gemi rotası), yeni konuya özel tip (çarpışma + duman
  + pencerelerde yüzler; cue'da şok dalgası camları kırar), `stage` (Kaşif + pencerede izleyen insanlar), `photo`
  (gerçek 1917 Halifax yıkım fotoğrafı, kamu malı), `board`/`title`.
- **Kapanış örneği (yazar kendi cümlesini kursun):** "O sabah Halifax'ta en tehlikeli şey yangın değil, ona bakan
  pencerelerdi."

## 02-derinkuyu-yeralti-sehri (uzun video, 20:30)

- **Hissedilen:** "Ayaklarımızın altında binlerce kişiyi saklayabilen bir şehir varmış ve onu bir ev tadilatı bulmuş;
  insanlar yüzyıllar boyunca tehlike gelince yerin altına inmiş."
- **Kanca + kapak fikri:** kanca: 1963'te Derinkuyu'da evini tadil eden bir adam bir duvarı yıkıyor, arkasından bir
  tünel çıkıyor ve tünel aşağı, daha aşağı iniyor. Kapak `DUVARIN / ARKASINDA / ŞEHİR` (vurgu `ŞEHİR`) ya da
  `YERİN ALTINDA / BİR ŞEHİR` (vurgu `ALTINDA`). Kapak karesi: yıkılan duvardan karanlık tünele bakan, fenerli, şok
  olmuş büyük Kaşif + kesit halinde katlar.
- **Perdeler (öneri):** 1) Bir duvar, bir tünel (1963 keşfi, sıradan dünya: Kapadokya köyü) → 2) Aşağı inmek: katlar,
  havalandırma bacaları, kuyular, ahırlar, şarap/yağ işlikleri, şapel; içeriden kapanan dev yuvarlak taş kapılar →
  3) Kim kazdı? (yumuşak tüf kaya; ilk kazılar Frigler'e atfedilir, tarih kesin değil; Bizans döneminde genişleme;
  akınlar sırasında sığınak) → 4) Peki neden aşağıda yaşadılar? (tehlike gelince günlerce/haftalarca saklanma, ateş ve
  dumanın sorunları, savunma mantığı: dar, eğik koridorlar) → 5) Sonrası ve bugün (bölgenin Rum halkı 1923 nüfus
  mübadelesine kadar kullandı, sonra unutuldu; 1963 keşfi, 1969 ziyarete açılış; 2010'larda Nevşehir'de daha büyük bir
  yeraltı şehri bulundu) → tek yorum sorusu.
- **Doğrulanacak bilgiler (web'den kontrol):** derinlik (yaklaşık 85 m civarı söylenir, doğrula), kat sayısı (ziyarete
  açık kısım ve toplam), kapasite (yaygın tahmin binlerce kişi, "20 bine kadar" bir tahmindir, öyle söyle), taş
  kapıların ölçüsü/ağırlığı, Kaymaklı'ya tünel iddiası (kanıtı zayıfsa "anlatılır" de ya da hiç söyleme), keşif yılı ve
  hikâyesi, 1965/1969 açılış, Nevşehir keşfi (2013–2014). Yaygın efsaneleri (uzaylılar, "100 bin kişi" vb.) anlatma.
- **Görsel omurga önerisi:** yeni konuya özel tipler (kat kat kesit görünümü: kamera aşağı iner; yuvarlak taş kapının
  yuvarlanıp kapanması; havalandırma bacasından hava akışı), `map` (Kapadokya, Derinkuyu–Kaymaklı–Nevşehir),
  `timeline` (Frig → Bizans → Osmanlı → 1923 → 1963), `photo` (gerçek Derinkuyu tünel/taş kapı fotoğrafı, telifsiz),
  `stage` (Kaşif + köylüler, tek aksesuar fener), `chapter`, `board`.

---

## Anlatım ve çekim listeleri

# 01-halifax-patlamasi — yazar notları (Shorts, 25.10 19:00)

## Doğrulanan bilgiler
- 6 Aralık 1917, Halifax (Kanada). Fransız yük gemisi Mont-Blanc ile Norveç gemisi Imo, limanın dar boğazında (the Narrows) çarpıştı. Çarpışma saat 8.45 civarı, patlama 9.04.35. Aradaki süre yaklaşık 20 dakika.
- Mont-Blanc'ın yükü: yaklaşık 2.300 ton pikrik asit, 500 ton TNT, 10 ton pamuk barutu, güvertede benzol varilleri, yani toplam ≈2.800 ton. Çarpışmadaki kıvılcımlar benzolü tutuşturdu.
- Mürettebat filikalarla kaçtı ve uyarı diye bağırdı ama kimse anlamadı (Fransızca). Canadian Encyclopedia: "shouting warnings that no one understood". Mürettebattan sadece bir kişi öldü.
- Halk sokaklara toplandı, ev ve iş yerlerinin pencerelerinden yangını izledi (Wikipedia).
- Ölü sayısı: resmî kayıt 1.963 (Canadian Encyclopedia), doğrulanmış 1.782 (Wikipedia), yaygın ifade "yaklaşık 2.000". Ölü sayısı anlatımda geçmiyor, açıklamada da sayı yazılmadı. En az 9.000 yaralı var.
- Göz yaralanmaları: 592 göz yaralısı tedavi edildi, 249 göz alındı, 16 kişi iki gözünü de kaybetti. Pencereden bakanlar şok dalgasının kırdığı camlarla yaralandı. "Yüzlerce kişi görme kaybı yaşadı" (CNIB makalesi).
- Kaynaklar arasında "Hiroşima'dan önceki dünyanın en büyük insan yapımı patlaması" ifadesi geçiyor. Açıklamada bunu "en büyüklerinden biri" diye yumuşattım.
- Kaynaklar:
  - https://thecanadianencyclopedia.ca/en/article/the-halifax-explosion-feature
  - https://thecanadianencyclopedia.ca/en/article/the-halifax-explosion-and-the-cnib
  - https://en.wikipedia.org/wiki/Halifax_Explosion
  - https://en.wikipedia.org/wiki/SS_Mont-Blanc
- Kullanılmayan bilgiler: Vince Coleman (sığmadı), çapanın savrulma mesafesi (3,2 km) ve tsunami.
- Fotoğraf yok: commons.wikimedia.org bu ortamda proxy tarafından engelli (403). Bu yüzden her sahne kodla çizildi (yeni dosya `scenes/studio/shots/hx_halifax.js`).

## Tek parça anlatım (429 karakter, ~31 sn)
Bu yangını izlemek insanları kör etti. 1917, Kanada'nın Halifax limanı. Dar boğazda iki gemi çarpıştı ve biri alev aldı. Peki ne taşıyordu? Tonlarca patlayıcı! Mürettebat Fransızca bağırarak kaçtı, ama kimse anlamadı. Düşünün, halk kaçmadı, pencerelere koştu. Yirmi dakika sonra gemi patladı. Şok dalgası camları izleyenlerin yüzüne savurdu. Yüzlerce kişi gözünü kaybetti. Yani o sabah insanları kör eden şey ateş değil, meraktı.

Hiçbir cümle "-yor" ile bitmiyor ve devrik cümle yok. Son cümle tam bir punchline, soru ya da döngü yok.

## Çekim listesi
| # | Cümle | Tip | Görsel | Kaşif | Cue | Kamera |
|---|---|---|---|---|---|---|
| 0 | Bu yangını izlemek insanları kör etti. | hx_harbor watch | Limanda yanan gemi ve dumanı; sağ önde ahşap evin pencerelerinde bakan yüzler | Büyük, şaşkın, "kör"de şok | hit=kör | scale 1.12, yavaş itme |
| 1 | 1917, Kanada'nın Halifax limanı. | map | Bedford Havzası, dar boğaz, Halifax (kırmızı), Dartmouth; denizden boğaza kırmızı rota; not "6 Aralık 1917" | — | route, city, note | boğaza zoom 1.18 |
| 2 | Dar boğazda iki gemi çarpıştı ve biri alev aldı. | hx_harbor collide | Mont-Blanc (kırmızı bant) ve Imo (mavi bant) yaklaşıyor, çarpışıyor, kıvılcımlar çıkıyor, pruvada alev | Gösteriyor, sonra şok | hit=çarpıştı, fire=alev | scale 1.25, sarsıntı |
| 3 | Peki ne taşıyordu? Tonlarca patlayıcı! | hx_hold | Kesit: ambarlar varil ve "TNT" sandıklarıyla doluyor, güvertede benzol varilleri; "≈2.800 ton"; "PATLAYICI!" damgası, yükler kırmızı yanıp sönüyor | Pruvada ambarı gösteriyor, sonra şok | fill, ton, hit | punch |
| 4 | Mürettebat Fransızca bağırarak kaçtı, ama kimse anlamadı. | hx_harbor flee | Yanan gemi; bereli denizcilerle filika kürek çekiyor, bağırış dalgaları ve "Fransızca!"; rıhtımdaki iki kişinin başında "?" | Dürbünle bakıyor, sonra omuz silkiyor | shout, hit | itme |
| 5 | Düşünün, halk kaçmadı, pencerelere koştu. | hx_street windows | Ahşap evler, arkada duman sütunu; pencerelere tek tek yüzler doluyor; sokakta iki kişi bakıyor | Anlatıyor, sonra pencereleri gösteriyor | faces=halk, hit=pencerelere | itme |
| 6 | Yirmi dakika sonra gemi patladı. | hx_harbor blast | Saat 8.45'ten 9.04'e ilerliyor, "20 dakika"; parlama, ateş topu, şok halkaları, mantar bulutu, enkaz, su sütunu | Dürbünle bakıyor, sonra şok | min, boom | scale 1.15, sert sarsıntı |
| 7 | Şok dalgası camları izleyenlerin yüzüne savurdu. | hx_street shatter | Şok cephesi soldan geliyor, pencereler dışarı doğru cam kırıklarıyla patlıyor, yüzler kayboluyor, toz çıkıyor | Şok | hit=camları | zoom 1.1, sarsıntı |
| 8 | Yüzlerce kişi gözünü kaybetti. | hx_street after | Kırık ve tahtayla kapatılmış pencereler, kül; gözleri sargılı üç kişi; "Yüzlerce kişi" | Üzgün, düşünüyor | lab, hit | yavaş itme |
| 9 | Yani o sabah insanları kör eden şey ateş değil, meraktı. | title | "KÖR EDEN / ATEŞ DEĞİL, / MERAK" (MERAK kırmızı kutuda) | Şaşkın, yazıyı gösteriyor | w0..w4 | hafif itme |

Kaşif 9/10 sahnede. Sahne tipleri: hx_harbor 4, hx_street 3, map, hx_hold, title. Ard arda en fazla 2 aynı tip var.

## Kapak adayları
- **A (seçildi):** "BU YANGINI / İZLEMEK / KÖR ETTİ" (vurgu İZLEMEK), sahne 0, t 2.5. Yanan gemi, pencerelerdeki şaşkın yüzler ve büyük şok olmuş Kaşif aynı karede. Telefonda en net okunan aday.
- B: aynı metin, vurgu KÖR, sahne 7 (cam kırılması), t 1.0. Kırıklar karede seçilmiyordu, Kaşif küçük kaldı. Zayıf.
- C: "YANGINI / İZLEYENLER / KÖR OLDU", sahne 6 (patlama), t 2.2. Patlama lekesi okunmuyordu, ilk cümleyle de birebir aynı değil. Zayıf.

## Tur 1 düzeltmeleri (eleştirmen: Senaryo 7, Görsel=anlatım 6, Kompozisyon 6, Kapak 7)
- **Yeni doğrulanan bilgi:** cephane gemileri genelde kırmızı tehlike bayrağı çekerdi, Mont-Blanc çekmemişti. Gemide patlayıcı olduğunu liman görevlilerinden çok az kişi biliyordu. Kaynak: USNI Naval History, "Havoc in Halifax" (2024), https://www.usni.org/magazines/naval-history-magazine/2024/february/havoc-halifax
- **Yeni anlatım (466 karakter, 11 sahne, ~33 sn):**
  Bu yangını izlemek insanları kör etti. 1917'de Halifax limanında, iki gemi çarpıştı ve biri alev aldı. İçinde tonlarca patlayıcı vardı! Ama tehlike bayrağı yoktu, yani izleyenler bilmiyordu. Mürettebat Fransızca bağırıp kaçtı, kimse anlamadı. Düşünün, halk pencerelere koştu. Ve yirmi dakika sonra gemi patladı. Şok dalgası camları izleyenlerin yüzüne savurdu. Doktorlar yaklaşık iki yüz elli göz almak zorunda kaldı. Yani insanları kör eden şey ateş değil, meraktı.
  "Peki neden kaçmadılar?" sorusunun cevabı (bayrak yoktu, bilmiyorlardı) eklendi. Kopuk cümleler bağlandı. "Yüzlerce kişi gözünü kaybetti" yerine kayıtlı sayı kullanıldı (249 göz → "yaklaşık iki yüz elli").
- **Sahne değişiklikleri:**
  - **Yeni sahne 4:** yanan geminin ön direğinde kesik çizgili "olması gereken" kırmızı bayrak beliriyor, "yoktu"da kırmızı X ile siliniyor; "Bayrak yok!" yazısı ve önde sırtı dönük izleyen kalabalık var.
  - **Sahne 2:** ölçek 1.0. Imo uzaktan küçük gelip büyüyor (`far`), pruvalar x≈0.57'de buluşuyor; altın kıvılcım, punch ve sarsıntı var. Kaşif tam kadrajda.
  - **Sahne 5:** filika büyüdü (w 380), dört denizci teknenin içinde ve gövde bacaklarını örtüyor; üç kürek suya giriyor.
  - **Sahne 7:** patlama hızlandı. Mantar bulutu, iri enkaz parçaları ve geniş su sütunu artık karede görünüyor.
  - **Sahne 6, 8, 9:** Kaşif sağa alındı, liman alevi ve duman solda kaldı (kafasının arkasında alev yok). Sahne 9'da duman kapatıldı.
  - **Sahne 10:** yeni `hx_end` tipi. "KÖR EDEN / ATEŞ DEĞİL, / MERAK" (MERAK kırmızı kutuda); altında camları kırık büyük bir pencere ve içinden uzakta yanan gemi görünüyor. Kaşif kutuya değmiyor, ilk karede pencere zaten ekranda.
- **Kapak:** dört aday denendi.
  - **A (seçildi):** sahne 0'ın yeni yerleşimi. Büyük gemi ve alev kadrajın ortasında (y≈900–1220), sağda büyütülmüş pencerelerde bakan yüzler, altta sırtı dönük kalabalık boşluğu dolduruyor. Kaşif tam görünüyor ve simgeyi kesmiyor.
  - **B:** A ile aynı kare, vurgu KÖR'de. Daha az çekici.
  - **C:** bayrak sahnesi. Kaşif küçük kalıyor, "Bayrak yok" soluk.
  - **D:** cam kırılması. Kaşif küçük, simge zayıf.

## Tur 2 düzeltmeleri
- **Senaryo (480 karakter):**
  - Sahne 9 artık "Doktorlar yaklaşık iki yüz elli gözü ameliyatla çıkarmak zorunda kaldı." (cue: çıkarmak).
  - Sınırda kalmak için sahne 3 "İçi tonlarca patlayıcı doluydu!" oldu.
- **Kicker'lar:** sahne 2 "Dar boğaz / iki gemi", sahne 4 "Bayrak yok", sahne 9 "Sonrası / göz yaraları". Artık tek satıra sığıyorlar.
- **Sahne 2:** ölçek 1.18 ve kamera 1.04 ile gemiler büyüdü. Mont-Blanc x .38'den .46'ya gidiyor, Imo uzaktan büyüyerek x .8'e geliyor. Kaşif x .24'te, ölçeği .85; tam kadrajda ve gövdeye binmiyor.
  - Kalan sorun: üst bölüm hâlâ büyük ölçüde gökyüzü, alevden sonra duman o boşluğu dolduruyor.
- **Altyazının soluk görünmesi:** sahne kodundan değil. Draft zamanlamada 5.82 sn, "iki gemi çarpıştı" öbeğinin sonundaki 80 ms'lik sönme anına denk geliyor (parchment-theme.js:172). 5.34 ve 5.45 sn'de altyazı tam opak.
- **Sahne 4:** sırtı dönük kalabalık y .715'e indi (başlar ≥ 1340), altyazı şeridinin dışında.
- **Sahne 6 ve 8:** evlerin yer çizgisi .55'e çekildi. Kaşif ve kasabalılar önlerindeki sokakta duruyor (y .61–.63, Kaşif scale .75). Sahne 8'de Kaşif x .78, sağ kenarda kesilmiyor.
- **Sahne 9:** önde gözleri sargılı iki büyük figür var (scale .7, biri oturuyor), evler geride (ground .52), Kaşif yanlarında üzgün.
- **Kapak:** aday A korundu (tur 1). Kaşif x .18 → .22 alındı; şok pozunda şapkası artık sol kenardan taşmıyor.

---

# Notlar — 02-derinkuyu-yeralti-sehri (uzun video, 25.10 20:30)

## Doğrulanan bilgiler (kaynaklar)
- 1963'te Derinkuyu'da bir sakin evini tadil ederken bodrum duvarını yıktı, arkasında bir oda ve tünel ağı çıktı — [Wikipedia](https://en.wikipedia.org/wiki/Derinkuyu_underground_city)
- Derinlik yaklaşık 85 m; ad "derin kuyu" demek; yaklaşık 55 m'lik merkezi baca kuyu olarak da kullanıldı; ahırlar, şarap ve yağ işlikleri, ambarlar, şapeller; en alt katta kilise; dev yuvarlak taş kapılar içeriden kapanır, her kat ayrı kapatılabilir — Wikipedia
- İlk tüneller büyük olasılıkla Frigler (MÖ 8.–7. yy), tarih kesin değil; Bizans'ta genişletildi; Arap–Bizans savaşları (yaklaşık 780–1180) sırasında büyük ölçüde büyütüldü; sonraki yüzyıllarda da kullanıldı — Wikipedia
- Dawkins 1909'da Adana olayları haberi gelince bir köy (Axo) halkının yeraltına sığındığını kaydetti — Wikipedia (Dawkins alıntısı)
- 1923 Türk–Yunan nüfus mübadelesiyle bölgenin Rum (Hristiyan) halkı ayrıldı, şehir terk edildi — Wikipedia
- Yaklaşık 52 havalandırma bacası; ahırlar üst katlarda; kilise alt katlarda; ziyaret edilen kısım şehrin küçük bir bölümü (Küre: yaklaşık %10) — [Küre Ansiklopedi](https://kureansiklopedi.com/tr/detay/derinkuyu-yeralti-sehri-e7e55)
- "20.000 kişiye kadar" bir tahmin — Wikipedia, [National Geographic](https://www.nationalgeographic.com/news/2015/03/150325-underground-city-cappadocia-turkey-archaeology/)
- Nevşehir: 2013'te kentsel dönüşüm yıkımlarında girişler bulundu; ilk tahminler Derinkuyu'dan büyük olabileceğini söylüyor — National Geographic, [HNN](https://historynewsnetwork.org/article/158005)

**Bilerek söylenmeyenler:** ziyarete açılış yılı (kaynaklar 1965/1967/1969 diye çelişiyor → sadece "bugün ziyarete açık"), toplam kat sayısı (8/12/18 çelişkili), taş kapıların kesin ağırlığı ("yüzlerce kilo" + "neredeyse insan boyunda" dendi), Kaymaklı'ya 8–9 km tünel iddiası, adamın kaybolan tavukları hikâyesi, hava akımını fark etme ayrıntısı, uzaylı/abartılı nüfus efsaneleri, "aylarca" kalma iddiası.

**Fotoğraf:** `tools/media.py` çalışmadı (commons.wikimedia.org proxy'de 403). Tüm görseller kodla çizildi; `photo` sahnesi yok.

## Tek parça anlatım (4443 karakter, 46 sahne, tahmini ~309 sn ≈ 5:09)

1963'te Kapadokya'da bir adam, evinin bodrumundaki bir duvarı yıktı. Duvarın arkasında bilmediği bir oda vardı. O odadan da karanlık bir geçit aşağıya iniyordu. Aşağı, daha da aşağı. Adam farkında olmadan yüzyıllardır unutulmuş bir şehrin kapısını açmıştı! Peki bu şehri kim kazdı? İnsanlar neden güneşi bırakıp yerin altına indi? Gelin, anlatayım. Önce yeri tanıyalım. Nevşehir'in güneyinde Derinkuyu diye bir kasaba var. Adı bile bir ipucu: derin kuyu. Milyonlarca yıl önce bu bölgedeki yanardağlar her yeri küle boğdu. O kül zamanla sertleşti ve tüf denen bir kayaya dönüştü. Tüf ilk kazıldığında yumuşaktır, basit bir demir aletle oyabilirsiniz. Ama havayla buluştukça sertleşir. Kapadokyalılar bunu çok iyi biliyordu. Evlerini, ambarlarını, hatta kiliselerini kayaya oydular. Yani bir bodrumu biraz genişletmek burada sıradan bir işti. 1963'teki adamın yaptığı da tam buydu. Ama duvarın arkasından bir ambar çıkmadı. Çıkan şey, kat kat aşağı inen koca bir dünyaydı. Gelin, birlikte aşağı inelim. Bugün bu şehrin yaklaşık 85 metre derinliğe indiği biliniyor. Yani yirmi katlı bir apartmandan bile derin! Üstelik burası rastgele kazılmış bir mağara değildi. Her katı bir işe göre düşünülmüş, planlı bir şehirdi. En üst katlarda ahırlar vardı, çünkü hayvanları derine indirmek zordu. Biraz aşağıda şarap ve yağ işlikleri, mutfaklar, ambarlar vardı. En derinde ise bir kilise bile vardı. Peki bu kadar derinde insanlar nasıl nefes aldı? İşte işin dahiyane kısmı burada. Yüzeyden aşağıya yaklaşık elli baca iniyordu. Bu bacalar temiz havayı en alt katlara kadar taşıdı. Bazı bacalar ise kuyuydu. Yani dışarıya hiç çıkmadan su çekebiliyordunuz. Ama asıl şaşırtıcı ayrıntı kapılardaydı. Koridorlarda değirmen taşı gibi, neredeyse insan boyunda yuvarlak taşlar vardı. Her biri yüzlerce kilo ağırlığındaydı. Tehlike gelince içeridekiler taşı yuvarlayıp geçidi kapattı. Dışarıdan onu yerinden oynatmak ise neredeyse imkânsızdı. Yani burası bir saklanma yeri değil, bir kaleydi. Ama kime karşı? Dürüst cevap şu: kesin olarak bilmiyoruz. Çünkü kayaya oyulmuş bir odanın yaşını ölçmek çok zor. Taşın üstünde ne bir yazı var ne de kazıyanın imzası. Bazı tarihçilere göre ilk tüneller Frigler zamanında, yani milattan önce sekizinci ya da yedinci yüzyılda kazıldı. Ama bu bir tahmin. Daha iyi bildiğimiz kısım sonrası. Bizans döneminde bölgenin Hristiyan halkı tünelleri genişletti ve kat kat derinleştirdi. Yedinci yüzyıldan itibaren Arap orduları Anadolu'ya yüzyıllar boyunca akınlar düzenledi. Kapadokya da tam bu yolun üstündeydi. Şimdi kendinizi o köylülerin yerine koyun. Bir sabah ufukta bir toz bulutu görüyorsunuz. Yakında sığınacak bir kale yok, dağlar da çok uzak. Siz ne yapardınız? Kapadokyalılar kaçmadı, aşağı indiler. Peki bu gerçekten işe yaradı mı? Şimdi de bir akıncının yerine geçin. Köye giriyorsunuz ama evler boş, ambarlar boş, hayvanlar yok. Sonra yerde bir delik buluyorsunuz. Koridor dar ve alçak, belinizi bükerek tek sıra yürümek zorundasınız. Kılıcınızı savuramıyorsunuz bile. Karanlık bir dönemeçten sonra da karşınıza yuvarlak bir taş çıkıyor. İşte savunmanın sırrı buydu. Dışarıdaki ordu ne kadar kalabalık olursa olsun, dar geçitte hep bir kişiye karşı bir kişi vardı. Ama aşağıda hayat hiç kolay değildi. Kandillerin isi, hayvanların kokusu ve bitmeyen bir karanlık vardı. İnsanlar büyük olasılıkla tehlike geçene kadar orada kaldı. Belki günlerce, belki haftalarca. Şehrin kaç kişi aldığı ise tartışmalı. Binlerce kişi alabildiği düşünülüyor. Yirmi bin diyenler de var, ama bu sadece bir tahmin. Peki böyle bir şehir nasıl unutuldu? Tüneller yüzyıllar boyunca kullanıldı. 1909'da bile bir İngiliz araştırmacı, kötü haberler gelince bir köyün halkının yeraltına sığındığını not etmişti. Sonra 1923 geldi. Türkiye ile Yunanistan arasındaki nüfus mübadelesiyle Derinkuyu'nun Rum halkı bölgeden ayrıldı. Tünellerin sırrını bilen nesil de onlarla gitti. Girişler kapandı, bodruma ve ahıra dönüştü. Ve tam kırk yıl sonra, o bodrumda bir duvar yıkıldı. Bugün Derinkuyu ziyarete açık. Ama gezebildiğiniz yer, şehrin sadece küçük bir bölümü. Üstelik hikâye bitmedi. 2013'te Nevşehir'de eski evler yıkılırken başka bir yeraltı şehrinin girişleri bulundu. İlk tahminlere göre o şehir Derinkuyu'dan bile büyük olabilir. Yani Kapadokya'da yürüyen biri, şu an kimsenin görmediği bir şehrin üstünden geçiyor olabilir. Peki siz olsaydınız, yerin altına inip o taş kapıyı kapatır mıydınız, yoksa kaçmayı mı denerdiniz? Yorumlara yazın!

## Bölümler
0 Bodrumdaki duvar (giriş, sahne 0–3) · 1 Yumuşak taş (4–10) · 2 Aşağı inmek (11–21) · 3 Kim kazdı? (22–28) · 4 Taşın arkası (29–36) · 5 Unutulan şehir (37–45, tek yorum sorusu)

## Çekim listesi (cümle · tip · visual · cue)

0. **dr_wall** — "1963'te Kapadokya'da bir adam, evinin bodrumundaki bir duvarı yıktı."  
   visual: Taş bloklu bodrum duvarı, rafta küpler, tavanda kandil; bereli köylü balyozu kaldırıp indirir, duvarda çatlaklar yayılır; 'yıktı'da taş parçaları düşer, toz bulutu kalkar, duvarda karanlık bir delik açılır; solda Kaşif fenerle bakar, 'yıktı'da şok olur  
   cues: {"hit": "yıktı"} · kicker: {"white": "1963", "gray": "Derinkuyu"}
1. **dr_wall** — "Duvarın arkasında bilmediği bir oda vardı. O odadan da karanlık bir geçit aşağıya iniyordu."  
   visual: Aynı bodrum, delik açık: içinde aşağıya doğru küçülen tünel kemerleri ve basamaklar, delikten toz zerreleri süzülür; Kaşif fenerle deliğe yürür, 'aşağıya'da aşağıyı gösterir; köylü şaşkın geri çekilir  
   cues: {"room": "oda", "down": "aşağıya"} · kicker: {"white": "Gizli geçit"}
2. **dr_section** — "Aşağı, daha da aşağı. Adam farkında olmadan yüzyıllardır unutulmuş bir şehrin kapısını açmıştı!"  
   visual: Kesit görünümü: yüzeyde köy evleri ve peri bacası; kamera yerin altına iner, kat kat oyulmuş odalar, eğimli tüneller ve bacalar görünür; soldaki derinlik cetveli kayar; Kaşif fenerle bir kattan yürür; 'şehrin'de 'ŞEHİR' damgası  
   cues: {"hit": "şehrin"} · kicker: {"white": "Yerin altında"}
3. **title** — "Peki bu şehri kim kazdı? İnsanlar neden güneşi bırakıp yerin altına indi? Gelin, anlatayım."  
   visual: Dev yazı kelime kelime: 'KİM KAZDI?', 'kazdı' kırmızı kutuda; el yazısı not 've neden?'; sağda Kaşif önce düşünür, 'anlatayım'da izleyiciyi gösterir  
   cues: {"w0": "kim", "w1": "kazdı", "note": "neden", "go": "anlatayım"} · kicker: {"white": "Soru"}
4. **chapter** — "Önce yeri tanıyalım."  
   visual: BÖLÜM 1 / 5 kartı: mavi dairede 1, altında 'Yumuşak taş'  
   cues: {"n": "Önce", "title": "tanıyalım"} · kicker: {}
5. **ag03a_map** — "Nevşehir'in güneyinde Derinkuyu diye bir kasaba var. Adı bile bir ipucu: derin kuyu."  
   visual: Kapadokya haritası: 'Nevşehir'de şehir halkası, 'Derinkuyu'da kırmızı halka ve kuyu ikonu yerine kale ikonu; 'derin kuyu' notu kırmızı belirir; solda Kaşif önce işaret eder, 'ipucu'nda parmağını kaldırır  
   cues: {"nev": "Nevşehir'in", "der": "Derinkuyu", "hit": "ipucu", "note": "kuyu"} · kicker: {"white": "Derinkuyu"}
6. **stage** — "Milyonlarca yıl önce bu bölgedeki yanardağlar her yeri küle boğdu. O kül zamanla sertleşti ve tüf denen bir kayaya dönüştü."  
   visual: Uzakta tepeler; ortada duman çıkaran yanardağ; Kaşif soldan yürüyüp gelir, 'küle'de şok olur; 'tüf'te önüne bir kaya düşer, Kaşif kayayı gösterir; 'TÜF' etiketi  
   cues: {"ash": "küle", "hit": "tüf"} · kicker: {"white": "Tüf"}
7. **dr_wall** — "Tüf ilk kazıldığında yumuşaktır, basit bir demir aletle oyabilirsiniz. Ama havayla buluştukça sertleşir."  
   visual: Açık havada peri bacaları; sağda açık renk tüf kaya yüzü; köylü kazmayla vurur, taş parçacıkları uçar, kayada kapı biçimli oyuk adım adım büyür; 'sertleşir'de 'sertleşir' notu ve Kaşif parmak kaldırır  
   cues: {"go": "kazıldığında", "hit": "sertleşir"} · kicker: {"white": "Yumuşak taş"}
8. **stage** — "Kapadokyalılar bunu çok iyi biliyordu. Evlerini, ambarlarını, hatta kiliselerini kayaya oydular."  
   visual: Tepeli kırda kayaya oyulmuş ev (kapı + pencere), yanında kule; Kaşif soldan gelir, 'Evlerini'de evi, 'kiliselerini'de kuleyi gösterir; köylü kapıdan çıkıp el sallar  
   cues: {"home": "Evlerini", "hit": "kiliselerini"} · kicker: {"white": "Kaya evler"}
9. **dr_wall** — "Yani bir bodrumu biraz genişletmek burada sıradan bir işti. 1963'teki adamın yaptığı da tam buydu."  
   visual: Bodrum: bereli köylü balyozla duvara vurur, çatlaklar yayılır (delik daha açılmadı); solda Kaşif omuz silker, '1963'te parmağıyla duvarı gösterir; '1963' notu  
   cues: {"sh": "sıradan", "yr": "1963'teki"} · kicker: {"white": "Sıradan iş"}
10. **dr_door** — "Ama duvarın arkasından bir ambar çıkmadı. Çıkan şey, kat kat aşağı inen koca bir dünyaydı."  
   visual: Kaya yüzünde alçak kemerli geçit; içinde karanlığa küçülen kemerler; yanında oyukta dev yuvarlak taş; Kaşif fenerle geçide girer, içerde küçülerek uzaklaşır; 'dünyaydı'da kamera vurgu  
   cues: {"go": "Çıkan", "hit": "dünyaydı"} · kicker: {"white": "Aşağıda"}
11. **chapter** — "Gelin, birlikte aşağı inelim."  
   visual: BÖLÜM 2 / 5 kartı: mavi dairede 2, altında 'Aşağı inmek'  
   cues: {"n": "Gelin", "title": "inelim"} · kicker: {}
12. **dr_section** — "Bugün bu şehrin yaklaşık 85 metre derinliğe indiği biliniyor. Yani yirmi katlı bir apartmandan bile derin!"  
   visual: Kesitin tamamı: kamera yüzeyden en alt kata iner; soldaki cetvelde '85 m' kırmızı kutuda belirir; 'apartmandan'da sağda kesik çizgili bir apartman yerin altına kat kat sarkar, '20 KAT' yazar; Kaşif en alt katta şok olur  
   cues: {"m": "85", "tw": "apartmandan", "hit": "derin"} · kicker: {"white": "85 metre"}
13. **stage** — "Üstelik burası rastgele kazılmış bir mağara değildi. Her katı bir işe göre düşünülmüş, planlı bir şehirdi."  
   visual: Kaşif bir parşömen planı tutar; yanında köylü düşünür; 'planlı'da Kaşif 'PLANLI' tabelası kaldırır  
   cues: {"no": "mağara", "hit": "planlı"} · kicker: {"white": "Plan"}
14. **dr_section** — "En üst katlarda ahırlar vardı, çünkü hayvanları derine indirmek zordu."  
   visual: Kesitin üst katı yakın: yüzey ve en üst kat; ahırda eşek ve yemlik; 'ahırlar'da kırmızı halka ve 'Ahır' etiketi; Kaşif fenerle eşeği gösterir  
   cues: {"hit": "ahırlar", "deep": "derine"} · kicker: {"white": "1. kat"}
15. **dr_section** — "Biraz aşağıda şarap ve yağ işlikleri, mutfaklar, ambarlar vardı. En derinde ise bir kilise bile vardı."  
   visual: Kamera iner: işlik katında akan oluk, mutfakta kaynayan tencere, ambarda küpler; 'işlikleri'nde halka 'İşlik'; kamera en alt kata kayar, 'kilise'de haç planlı kilise halkalanır 'Kilise'; Kaşif kilisede şaşırır  
   cues: {"pr": "işlikleri", "ch": "kilise"} · kicker: {"white": "Katlar"}
16. **stage** — "Peki bu kadar derinde insanlar nasıl nefes aldı? İşte işin dahiyane kısmı burada."  
   visual: Kaşif boğazını tutar gibi düşünür (endişeli), sonra 'dahiyane'de parmağını kaldırır; yanında köylü nefes nefese omuz silker; 'nefes?' etiketi  
   cues: {"q": "nefes", "hit": "dahiyane"} · kicker: {"white": "Hava?"}
17. **dr_section** — "Yüzeyden aşağıya yaklaşık elli baca iniyordu. Bu bacalar temiz havayı en alt katlara kadar taşıdı."  
   visual: Kesit: dikey bacalar yüzeyden aşağıya iner; 'temiz'de bacalarda mavi oklar aşağı akar; kamera bacaları izleyerek iner; Kaşif bir katta bacayı gösterir; '~50 baca' etiketi  
   cues: {"n": "elli", "air": "temiz", "hit": "alt"} · kicker: {"white": "Bacalar"}
18. **dr_section** — "Bazı bacalar ise kuyuydu. Yani dışarıya hiç çıkmadan su çekebiliyordunuz."  
   visual: Kesitte kuyu bacası yakın: dipte dalgalanan su; 'su'da kova iple yukarı çıkar; yüzeyde kuyu ağzı; 'Kuyu' etiketi; Kaşif kuyunun yanında şaşırır  
   cues: {"w": "kuyuydu", "pull": "çekebiliyordunuz"} · kicker: {"white": "Kuyu"}
19. **dr_door** — "Ama asıl şaşırtıcı ayrıntı kapılardaydı. Koridorlarda değirmen taşı gibi, neredeyse insan boyunda yuvarlak taşlar vardı."  
   visual: Kemerli geçidin yanında oyukta dev yuvarlak taş (ortası delik, keski izleri); Kaşif fenerle gelir, 'insan boyunda'da taşın yanında durup boyunu ölçer gibi elini kaldırır; 'taş kapı' etiketi  
   cues: {"door": "kapılardaydı", "hit": "insan"} · kicker: {"white": "Taş kapı"}
20. **dr_door** — "Her biri yüzlerce kilo ağırlığındaydı. Tehlike gelince içeridekiler taşı yuvarlayıp geçidi kapattı. Dışarıdan onu yerinden oynatmak ise neredeyse imkânsızdı."  
   visual: Aynı kapı: Kaşif ve köylü taşı iter; 'yuvarlayıp'ta taş dönerek geçidin önüne yuvarlanır, tozu kalkar, kamera sarsılır; 'imkânsızdı'da 'İÇERİDEN' damgası; Kaşif şaşırır  
   cues: {"roll": "yuvarlayıp", "hit": "imkânsızdı"} · kicker: {"white": "Kapandı"}
21. **title** — "Yani burası bir saklanma yeri değil, bir kaleydi. Ama kime karşı?"  
   visual: Dev yazı: 'YERALTI KALESİ', 'kalesi' kırmızı kutuda; not 'kime karşı?'; Kaşif 'kaleydi'de şaşırır, 'kime'de düşünür  
   cues: {"w0": "Yani", "w1": "kaleydi", "note": "kime"} · kicker: {"white": "Kale"}
22. **chapter** — "Dürüst cevap şu: kesin olarak bilmiyoruz."  
   visual: BÖLÜM 3 / 5 kartı: mavi dairede 3, altında 'Kim kazdı?'  
   cues: {"n": "Dürüst", "title": "bilmiyoruz"} · kicker: {}
23. **stage** — "Çünkü kayaya oyulmuş bir odanın yaşını ölçmek çok zor. Taşın üstünde ne bir yazı var ne de kazıyanın imzası."  
   visual: Kaşif büyük bir kayanın önünde dürbünle bakar, 'imzası'nda omuz silker; kayanın yanında boş tabela; '? yıl' etiketi  
   cues: {"age": "yaşını", "hit": "imzası"} · kicker: {"white": "Kaç yaşında?"}
24. **timeline** — "Bazı tarihçilere göre ilk tüneller Frigler zamanında, yani milattan önce sekizinci ya da yedinci yüzyılda kazıldı. Ama bu bir tahmin."  
   visual: Yatay zaman çizgisi: 'MÖ 8.-7. yy Frigler' belirir ve kırmızıyla vurgulanır, yanında 'tahmin' notu; sonra 'Bizans', '1923', '1963' soluk; sağda Kaşif 'tahmin'de omuz silker  
   cues: {"a": "Frigler", "b": "milattan", "c": "tahmin"} · kicker: {"white": "Frigler"}
25. **timeline** — "Daha iyi bildiğimiz kısım sonrası. Bizans döneminde bölgenin Hristiyan halkı tünelleri genişletti ve kat kat derinleştirdi."  
   visual: Aynı zaman çizgisi: 'Bizans' kırmızıyla vurgulanır; Kaşif 'derinleştirdi'de aşağıyı gösterir  
   cues: {"a": "iyi", "b": "Bizans", "c": "derinleştirdi"} · kicker: {"white": "Bizans"}
26. **ag03a_map** — "Yedinci yüzyıldan itibaren Arap orduları Anadolu'ya yüzyıllar boyunca akınlar düzenledi. Kapadokya da tam bu yolun üstündeydi."  
   visual: Anadolu haritası: güneydoğudan kırmızı kesikli oklar atlılarla Toroslar'ı aşıp Kapadokya'ya uzanır; 'Kapadokya'da Derinkuyu kırmızı halkaya alınır; solda Kaşif önce okları izler, sonra şok olur  
   cues: {"go": "Arap", "hit": "Kapadokya"} · kicker: {"white": "Akınlar"}
27. **ag03a_field** — "Şimdi kendinizi o köylülerin yerine koyun. Bir sabah ufukta bir toz bulutu görüyorsunuz."  
   visual: Sabah kırı, uzakta tepeler; ufukta kırmızı sancaklı atlılar dörtnala yaklaşır, arkalarında toz izi; solda Kaşif dürbünle bakar, 'toz'da şok olur; yanında köylü işaret eder  
   cues: {"look": "sabah", "hit": "toz"} · kicker: {"white": "Ufukta"}
28. **stage** — "Yakında sığınacak bir kale yok, dağlar da çok uzak. Siz ne yapardınız? Kapadokyalılar kaçmadı, aşağı indiler."  
   visual: Kaşif omuz silker, köylüler bir evin kapısına koşar; 'Aşağı'da Kaşif aşağıyı gösterir, 'AŞAĞI' tabelası  
   cues: {"q": "yapardınız", "hit": "aşağı"} · kicker: {"white": "Ne yapmalı?"}
29. **chapter** — "Peki bu gerçekten işe yaradı mı?"  
   visual: BÖLÜM 4 / 5 kartı: mavi dairede 4, altında 'Taşın arkası'  
   cues: {"n": "Peki", "title": "yaradı"} · kicker: {}
30. **ag03a_field** — "Şimdi de bir akıncının yerine geçin. Köye giriyorsunuz ama evler boş, ambarlar boş, hayvanlar yok."  
   visual: Köy meydanı: boş taş evler ve ambar; kırmızı sancaklı miğferli atlı soldan girer, durup etrafına bakar; 'boş'ta evlerin yanında 'BOŞ' etiketleri; sağda Kaşif omuz silker  
   cues: {"in": "giriyorsunuz", "hit": "boş"} · kicker: {"white": "Boş köy"}
31. **dr_door** — "Sonra yerde bir delik buluyorsunuz. Koridor dar ve alçak, belinizi bükerek tek sıra yürümek zorundasınız."  
   visual: Alçak kemerli geçit (taş oyukta açık); miğferli akıncı belini bükerek geçide girer ve içeride küçülerek uzaklaşır; Kaşif geçidin yanında eğilerek bakar; 'tek sıra' etiketi  
   cues: {"go": "delik", "hit": "tek"} · kicker: {"white": "Dar geçit"}
32. **dr_door** — "Kılıcınızı savuramıyorsunuz bile. Karanlık bir dönemeçten sonra da karşınıza yuvarlak bir taş çıkıyor."  
   visual: Geçidin içi: akıncı uzakta, yavaşça yaklaşır; 'taş'ta dev yuvarlak taş dönerek geçidin önüne yuvarlanır ve onu dışarıda bırakır; Kaşif içeride şok olur  
   cues: {"dark": "Karanlık", "roll": "taş"} · kicker: {"white": "Taş kapı"}
33. **title** — "İşte savunmanın sırrı buydu. Dışarıdaki ordu ne kadar kalabalık olursa olsun, dar geçitte hep bir kişiye karşı bir kişi vardı."  
   visual: Dev yazı: 'BİRE BİR', 'bir' kırmızı kutuda; not 'ordu işe yaramaz'; Kaşif 'kişiye'de parmağını kaldırır  
   cues: {"w0": "sırrı", "w1": "kalabalık", "note": "kişiye"} · kicker: {"white": "Sır"}
34. **dr_section** — "Ama aşağıda hayat hiç kolay değildi. Kandillerin isi, hayvanların kokusu ve bitmeyen bir karanlık vardı."  
   visual: Kesit, orta katlar yakın: kandillerden is dumanı kıvrılarak tavana çıkar, tavanlar kararır; odalarda oturan köylüler; Kaşif fenerle durur, 'kokusu'nda endişelenir  
   cues: {"smoke": "isi", "smell": "kokusu"} · kicker: {"white": "Aşağıda hayat"}
35. **stage** — "İnsanlar büyük olasılıkla tehlike geçene kadar orada kaldı. Belki günlerce, belki haftalarca."  
   visual: Kaşif fenerle oturur, yanında köylü ailesi oturur; 'günlerce'de 'GÜN?' tabelası, 'haftalarca'da Kaşif parmak kaldırır  
   cues: {"d": "günlerce", "w": "haftalarca"} · kicker: {"white": "Ne kadar?"}
36. **board** — "Şehrin kaç kişi aldığı ise tartışmalı. Binlerce kişi alabildiği düşünülüyor. Yirmi bin diyenler de var, ama bu sadece bir tahmin."  
   visual: Pano: başlık 'Kaç kişi?'; kartta 'Binlerce' yeşil onay, '20.000?' soru işaretiyle; altta mavi hap 'Tahmin'  
   cues: {"a": "Binlerce", "b": "Yirmi", "pill": "tahmin"} · kicker: {"white": "Kapasite"}
37. **chapter** — "Peki böyle bir şehir nasıl unutuldu?"  
   visual: BÖLÜM 5 / 5 kartı: mavi dairede 5, altında 'Unutulan şehir'  
   cues: {"n": "Peki", "title": "unutuldu"} · kicker: {}
38. **stage** — "Tüneller yüzyıllar boyunca kullanıldı. 1909'da bile bir İngiliz araştırmacı, kötü haberler gelince bir köyün halkının yeraltına sığındığını not etmişti."  
   visual: Bereli araştırmacı parşömene not alır; '1909' tabelası; Kaşif yanına yürür ve şaşırır  
   cues: {"y": "1909'da", "hit": "sığındığını"} · kicker: {"white": "1909"}
39. **ag03a_map** — "Sonra 1923 geldi. Türkiye ile Yunanistan arasındaki nüfus mübadelesiyle Derinkuyu'nun Rum halkı bölgeden ayrıldı."  
   visual: Ege ve Anadolu haritası: '1923' notu; 'mübadelesiyle'de Derinkuyu'dan batıya, Yunanistan'a kesikli mavi ok uzanır; Yunanistan ve Derinkuyu halkalanır; solda Kaşif oku izler  
   cues: {"yr": "1923", "go": "mübadelesiyle", "hit": "ayrıldı"} · kicker: {"white": "1923"}
40. **dr_section** — "Tünellerin sırrını bilen nesil de onlarla gitti. Girişler kapandı, bodruma ve ahıra dönüştü."  
   visual: Kesit, yüzey ve üst katlar: 'kapandı'da yüzeydeki girişlere moloz yığılır; odalar soluk; Kaşif yüzeyde yürür, aşağıyı göremez, omuz silker  
   cues: {"hit": "kapandı"} · kicker: {"white": "Unutuldu"}
41. **dr_wall** — "Ve tam kırk yıl sonra, o bodrumda bir duvar yıkıldı."  
   visual: Bodrum yine: köylü balyozla vurur, 'yıkıldı'da duvar çöker, karanlık delik açılır; Kaşif fenerle şok olur; '1963' damgası  
   cues: {"hit": "yıkıldı"} · kicker: {"white": "1963"}
42. **dr_section** — "Bugün Derinkuyu ziyarete açık. Ama gezebildiğiniz yer, şehrin sadece küçük bir bölümü."  
   visual: Kesit: üst katlar mavi halkayla 'Gezilen' diye işaretlenir; kamera aşağı iner, alt katlar karanlık; Kaşif fenerle üst katta yürür ve aşağıyı gösterir  
   cues: {"open": "açık", "hit": "küçük"} · kicker: {"white": "Bugün"}
43. **ag03a_map** — "Üstelik hikâye bitmedi. 2013'te Nevşehir'de eski evler yıkılırken başka bir yeraltı şehrinin girişleri bulundu."  
   visual: Kapadokya haritası: Derinkuyu soluk; 'Nevşehir'de kırmızı halka ve kale ikonu; '2013' notu; solda Kaşif şok olur, Nevşehir'i gösterir  
   cues: {"y": "2013'te", "nev": "Nevşehir'de", "hit": "girişleri"} · kicker: {"white": "2013", "gray": "Nevşehir"}
44. **dr_section** — "İlk tahminlere göre o şehir Derinkuyu'dan bile büyük olabilir. Yani Kapadokya'da yürüyen biri, şu an kimsenin görmediği bir şehrin üstünden geçiyor olabilir."  
   visual: Kesit: yüzeyde Kaşif yürür; altında soluk, hayalet gibi odalar ve tüneller; 'görmediği'nde Kaşif durup ayaklarının altını gösterir; 'BÜYÜK?' damgası  
   cues: {"big": "büyük", "hit": "görmediği"} · kicker: {"white": "Ayağınızın altı"}
45. **stage** — "Peki siz olsaydınız, yerin altına inip o taş kapıyı kapatır mıydınız, yoksa kaçmayı mı denerdiniz? Yorumlara yazın!"  
   visual: Kaşif iki tabela arasında: solda 'İN', sağda 'KAÇ'; önce düşünür, 'kapatır'da sol tabelayı, 'Yorumlara'da izleyiciyi gösterir  
   cues: {"q": "olsaydınız", "in": "kapatır", "hit": "Yorumlara"} · kicker: {"white": "Sizce?"}

Kaşif 40/46 sahnede (chapter ve board hariç). Kamera: dr_* tiplerinde yavaş itme/iniş (`cam`), kesitte derinlik cetveli kayar.

## Yeni sahne tipleri (scenes/studio/shots/)
- `dr__lib.js` — ortak yardımcılar (window.DRL): Kaşif/köylü cast'ı (fener, balyoz/kazma sallama, eğilme `tilt`, derinliğe küçülme `shrink`), kaya dokusu, tünel bandı, fener. `mcB__lib.js`'teki `MCB.labels`/`MCB.camPush` kullanılır (değiştirilmedi).
- `dr_section.js` — yeraltı şehri kesiti: yüzey köyü + peri bacası, 9 oda (ahır/işlik/mutfak/ambar/oda/kilise), tüneller, hava bacaları (`air` oklar), kuyu (`well` kova), is (`smoke`), moloz (`sealed`), hayalet mod (`ghost`), derinlik cetveli + `85 m` işareti, yere sarkan kesik çizgili apartman (`tower`), halka + etiket (`highlight`), kamera derinlik inişi.
- `dr_wall.js` — bodrum duvarı (çatlak → kırılma, düşen taşlar, toz, aşağı inen tünel) ve `cliff` modu (tüf kayaya kazmayla oyuk açma, taş parçacıkları).
- `dr_door.js` — önden yuvarlak taş kapı: kemerli geçit + perspektif tünel, oyukta taş; `roll`'da dönerek kapanır, toz + sarsıntı; geçit içinde yürüyen/küçülen figürler.

## Kapak adayları (1280×720)
- A ✅ seçildi: sahne 1 (açık delik, aşağı inen tünel) + büyük şok Kaşif sağda; "DUVARIN / ARKASINDA / BİR **ŞEHİR**". En net tek simge (karanlık delik), küçükte okunuyor.
- B: sahne 2 kesit + "YERİN / **ALTINDA** / BİR ŞEHİR" — kesit küçükken kalabalık, ŞEHİR damgası kenarda kesiliyor.
- C: sahne 20 kapanmış taş kapı + "BU KAPI / **İÇERİDEN** / KAPANIR" — Kaşif'in duygusu zayıf, simge daha az merak uyandırıyor.

## SEO
- Başlık: "Derinkuyu Yeraltı Şehri: Bir Duvarın Arkasından Çıktı!" · tags[0] "derinkuyu yeraltı şehri" · 16 etiket · kategori 27 · publish_at 2026-10-25T20:30:00+03:00. Lint hatasız (SEO 100).

## Tur 1 düzeltmeleri (eleştirmen: Sen 8 · Kan 8 · Oku 5 · Gör 5 · Har 6 · Komp 6 · Der 7 · Tem 7 · Doğ 8 · Kap 8 · Kapak+SEO 7)
- **Doğruluk/metin:** 85 m → "neredeyse otuz katlı bir apartman boyu" (apartman 28 kat, "~30 KAT"); sahne 40 "Büyük olasılıkla tünellerin sırrını bilenler de gitti. Girişler kapandı, bodrum ya da ahır oldu."; sahne 33'te "hep" çıkarıldı. Karakter 4.443.
- **Görsel = anlatım:** 8 kayaya oyulan kapı/pencere/ambar ve haçlı kilise cephesi (dr_wall `openings`); 9 artık 3. duvar yıkma değil: evin altındaki bodrum + soluk gizli odalar kesiti (seviye başına `ghost`); 10 kat kat inen kesit; 18 kuyuya yakın çekim (kova + su); 20 Kaşif ve köylü taşa omuz verip taşla birlikte yürür; 32 içeriden görüş: akıncı derinden yaklaşır, Kaşif taşı iter, taş geçidi kapatır; 24 zaman çizelgesi yerine kayayı oyan Frig kazıcı + "MÖ 700?"; 27 atlılar büyük ve kadrajda, toz izi; 30 surlar kaldırıldı, "boş" halkaları evlerde; 36 pano yerine dev "Binlerce / 20.000?" (kırmızı kutu) + "sadece tahmin" + Kaşif; 40 koyu, büyük moloz yığınları.
- **Okunabilirlik:** 5 cue "ipucu"ya bağlandı, not haritanın sağ altına; 5 ve 43 haritalarına Erciyes Dağı, Hasandağ, Kızılırmak yazıları; 43 kicker "2013"; 12 cue'lar "otuz"/"apartman"; 31 "tek sıra" sağa, kicker'dan uzak; 35 tabela kadraja alındı; 44 damga içeri çekildi; duvar tuğlaları 215 px'ten başlıyor (kicker temiz); 3 ve 36'da vurgu kutusu artık çalışıyor (highlight noktalama olmadan yazılmalı).
- **Kompozisyon/hareket:** dr_section'a ekranda büyük anlatıcı (`front`) eklendi (10, 12, 17); 14, 15, 18, 34, 42 kamera Kaşif'in katına 1,3–1,9 kat yakın; 9, 40, 44 Kaşif yüzeyde büyük; dr_door kapı 400×500, taş r 285 (üst boşluk azaldı); 13, 16, 23, 35, 45 Kaşif yürüyerek girer ve cue'da poz değiştirir; 25 timeline'da Kaşif büyük (ölçek 1.0).
- **Kapak:** yeni 3 aday (sahne 1 "85 METRE / AŞAĞIDA / BİR ŞEHİR"; sahne 1 "BODRUMUN / ALTINDA / BİR ŞEHİR" + işaret eden Kaşif; sahne 20 "İÇERİDEN / KİLİTLENEN / ŞEHİR"). Seçilen: **85 METRE / AŞAĞIDA / BİR ŞEHİR** (vurgu AŞAĞIDA): başlığı tekrarlamıyor, Kaşif 1.6 ölçek tam kadrajda, yüzü şokta okunuyor, karanlık delik tek simge. Duvar zemini sola uzatıldı (dikiş azaldı; kalan yumuşak geçiş motorun kapak gölgesi).
- Lint hatasız, preview'da STATIC? yok, tahmini süre ~309 sn.

## Tur 2 düzeltmeleri (eleştirmen: 8·8·7·7·7·7·7·7·9·8·8 — geçti, son tur)
- **Haritalar (5, 43):** Kızılırmak etiketi kuzeye alındı (lat 39.08), altında Avanos'tan geçen mavi kesikli nehir çizgisi; Nevşehir etiketi şehrin soluna (çakışma yok). Yanardağ simgesi eklenmedi: ag03a_map (başka ajanın tipi) dağ/yanardağ ikonu desteklemiyor, ortak dosyaya dokunulmadı.
- **dr_section:** sol üst marka + kicker için kâğıt renkli maske (560×275, `kicker_mask: false` ile kapatılır); derinlik cetveli 260 px'ten başlıyor; sahne 12 "~30 KAT" apartmanın solunda paper-light kartta; halka etiketleri odası ekrandan çıkınca gizleniyor (15 "İşlik" kopmuyor), etiketler kicker alanına inmiyor; 42 "Gezilen" halkanın solunda; 10 öndeki Kaşif x 0.18 (kesik değil).
- **Sahne 18 kuyu:** kamera 2.9→3.2 kat yakın, kova sadece dipteki 7 m'de ipiyle iner çıkar (`well_span`), su dalgalanıyor, Kaşif bacanın yanında kolunu ipe uzatıyor.
- **Sahne 32:** dışarıdan görüş: akıncı eğilerek geçide yürür, fenerli Kaşif geçidin içinde; taş akıncının önünde geçidi kapatır, Kaşif içeride kalır; "İÇERİDEN" damgası kapanışta.
- Atlanan (zaman/risk): 13 parşömen planının açılması, 16 kandil, 23 kayaya dokunma, 38 defterde yazı, 28/30 kaya evler.
- Lint hatasız, preview'da STATIC? ve sayfa hatası yok; 4.443 karakter, ~309 sn. Kapak değişmedi (85 METRE / AŞAĞIDA / BİR ŞEHİR).

## Eleştiri günlüğü

### 01-halifax-patlamasi — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 6 | 7 | 6 | 8 | 8 | 8 | 8 | 7 |

1. Sahne 4 filika boş/denizciler gövdede, sahne 2 gemiler paralel ve kesik, sahne 6 mantar bulutu yok. 2. Alev Kaşif'in kafasının arkasında (5, 7), kenar kesikleri, sahne 9 boş; kapakta simge küçük. 3. Kronik dili, "peki neden?" eksik → tehlike bayrağı çekilmemişti (USNI) eklendi; "yüzlerce kişi gözünü kaybetti" → kayıtlı 249 göz.

### 01-halifax-patlamasi — tur 2
| 8 | 8 | 7 | 7 | 7 | 6 | 8 | 8 | 9 | 9 | 8 |
|---|---|---|---|---|---|---|---|---|---|---|

1. Kaşif kenardan kırpılıyor (2, 8), evin cephesine yapışık (6, 9). 2. Sahne 4 kalabalık altyazı şeridinde, kicker'lar iki satır. 3. "Göz almak" belirsiz → "gözü ameliyatla çıkarmak", büyük sargılı figürler.

### 01-halifax-patlamasi — tur 3 (son)
| 8 | 8 | 7 | 8 | 7 | 7 | 8 | 8 | 9 | 9 | 8 |
|---|---|---|---|---|---|---|---|---|---|---|

Geçti. Kalan küçükler: sahne 2'de üst gök boş, sahne 9 figür ayakları şeride değiyor (önemli ayrıntı değil). Final 480 karakter, 11 sahne, ~34 sn.

### 02-derinkuyu-yeralti-sehri — tur 1
| 8 | 8 | 5 | 5 | 6 | 6 | 7 | 7 | 8 | 8 | 7 |
|---|---|---|---|---|---|---|---|---|---|---|

1. Görüntü anlatıyı göstermiyor (8 kayaya oyma yerine kırmızı çatılı ev, 30 "kale yok" ama surlar, 18 kuyu, 20/32/36/40/27). 2. Altyazıda kelimeler birleşiyordu (motor hatası: vurgulanan kelimenin 1.06 ölçeği .15em boşluğu yutuyordu → yönetmen `parchment-theme.js`'de boşluk .2em, ölçek 1.04 yaptı; tüm videoları etkiliyordu), erken yanan cue'lar (5, 12), üst üste binen notlar, boş haritalar. 3. Kesitlerde Kaşif ~40 px, taş kapı sahneleri hep aynı, duran sahneler; kapak başlığı tekrar ediyordu → "85 METRE / AŞAĞIDA / BİR ŞEHİR".

### 02-derinkuyu-yeralti-sehri — tur 2
| 8 | 8 | 7 | 7 | 7 | 7 | 7 | 7 | 9 | 8 | 8 |
|---|---|---|---|---|---|---|---|---|---|---|

Geçti (sınırda). 1. Haritada Kızılırmak/Nevşehir çakışması. 2. Kesitler sol üst marka alanına biniyor, "~30 KAT" okunmuyor, 15/42 etiketler. 3. Sahne 18 kuyu küçük, 32 savunan/saldıran ters okunuyor.

### 02-derinkuyu-yeralti-sehri — tur 3 (son)
| 8 | 8 | 8 | 7 | 7 | 7 | 7 | 7 | 9 | 8 | 8 |
|---|---|---|---|---|---|---|---|---|---|---|

Geçti. Kalan küçükler: 18'de "Kuyu" etiketi uzak, 32'de taş kemeri tam kapatmıyor, 13/16/23/38 ek hareket yok, 28/30 kırmızı çatılı evler, haritada yanardağ simgesi yok. Yönetmen son kapıda sahne 3'teki dolgu "Gelin, anlatayım." cümlesini çıkardı. Final 4.425 karakter, 46 sahne, ~5:05.


# Stickstory — 2026-10-25 (ayrı oturum; Düşün Bakalım dosyalarına dokunulmadı)

Plan (`tools/plan.py --channel ag`): 3 Shorts + 1 uzun video. ElevenLabs: bu ay 76.959 / 231.442, **uyarı: true**
(projeksiyon 383.459) → tüm karakterler aralığın alt ucunda (hedef toplam ≈ 5.750 / günlük üst sınır 6.500).
Dünün (2026-10-24) dört Stickstory videosunun da `*.youtube.json`'u var (hepsi yüklendi).

| Dosya | Konu | Kategori | Dönem | Yayın (NY / İstanbul) |
|---|---|---|---|---|
| ag-01-bubble-wrap | Balonlu naylon: duvar kâğıdı olarak doğdu (1957–1960'lar) | origins of everyday things | 20. yy, New Jersey | 09:00 / 25.10 16:00 |
| ag-02-barry-marshall | Barry Marshall bakteri içti, ülserin sebebi (1984 → Nobel 2005) | the human body | 20. yy, Avustralya | 13:00 / 25.10 20:00 |
| ag-03-tardigrades-space | Su ayıları çıplak uzayda (FOTON-M3, 2007) | animal superpowers | 21. yy, yörünge | 19:00 / 26.10 02:00 |
| ag-04-tambora-1816 (uzun) | Tambora 1815 ve yazsız yıl 1816 | space and planet earth | 19. yy, Endonezya → dünya | 14:00 / 25.10 21:00 |

Geçmişte işlenmedi (Tunguska, Pompeii, Lizbon, Penisilin, İlk Röntgen, Phineas Gage ile komşu ama farklı);
aynı günün Düşün Bakalım konuları (Halifax Patlaması, Derinkuyu) ile çakışmıyor. Dört video dört farklı kategori.

## ag-01-bubble-wrap (Short)
- **Hissedilen:** "Herkesin patlattığı o şey, kimsenin istemediği bir duvar kâğıdıydı."
- **Kanca + kapak:** ilk cümle "Bubble wrap was supposed to be wallpaper." ↔ kapak `IT WAS / WALLPAPER` (vurgu `WALLPAPER`). Kare: duvarda balonlu kâğıt, şaşkın fesli anlatıcı parmağıyla balon patlatıyor.
- **Doğrulanacak:** 1957, Hawthorne (New Jersey), Alfred Fielding ve Marc Chavannes; iki plastik duş perdesini ısıyla birleştirip hava kabarcığı hapsettiler; amaç dokulu duvar kâğıdı; tutmadı; sera yalıtımı denendi, tutmadı; 1960 Sealed Air şirketi; IBM 1401 (1959) bilgisayarının sevkiyatında kullanıldı.
- **Tek parça anlatım (468 karakter):**

> Bubble wrap was supposed to be wallpaper. In 1957, two inventors in New Jersey sealed two plastic shower curtains together, and trapped tiny bubbles of air inside. Their dream? Fancy textured wallpaper for modern homes. Nobody wanted it. So they tried selling it to greenhouses, as insulation. That flopped too. Then IBM launched a new computer, and needed a way to ship it without breaking it. And the wallpaper nobody wanted ended up protecting the world's packages.

- **Çekim fikri (yazar kesinleştirir):** 1 kanca: balonlu duvar kâğıdı + anlatıcı · 2 `stage` garajda iki mucit, perde tabakaları · 3 yeni tip `bw_seal`: iki tabaka birleşir, balonlar kabarır · 4 şık oda, duvar kâğıdı, müşteri burun kıvırıyor · 5 `board` ✗ wallpaper · 6 sera, ✗ insulation · 7 1959 dev bilgisayar dolabı, sarsılan kasa · 8 balonlu naylonla sarılı bilgisayar · 9 dünya, kutular, anlatıcı balon patlatıyor.

### Çekim listesi (yazar) — tur 2 sonrası
Son metin 459 karakter (~34,7 sn): "Bubble wrap was supposed to be wallpaper. In 1957, two inventors sealed two shower curtains together, and trapped tiny bubbles of air inside. Their dream? Textured wallpaper for modern homes. Nobody wanted it. So they pitched it to greenhouses, as insulation. Another flop. But here's the crazy part: IBM had a new computer, and it had to travel without breaking. So they wrapped it in the wallpaper nobody wanted. Now it protects almost everything you order."
1. `bw_room` "Bubble wrap was supposed to be wallpaper." Anlatıcı parmağıyla balon patlatır (parmak ucunda büyük POP), zincirleme patlamalar, şok; kamera itmesi (kapak anı).
2. `bw_seal` (curtains) "In 1957, two inventors sealed two shower curtains together," İki duş perdesi birleşir, ütü dikişten geçer; iki şapkasız mucit (ölçek 0.85).
3. `bw_seal` (sheet) "and trapped tiny bubbles of air inside." Balonlar dalga hâlinde kabarır, "AIR" oku tabakaya.
4. `bw_room` (reveal) "Their dream? …" Rulo duvar kâğıdı açılır, koltuk/lamba/çerçeve, "TEXTURED!".
5. `bw_room` "Nobody wanted it." Müşteriler omuz silker, "NO THANKS" damgası.
6. `bw_green` "So they pitched it to greenhouses, as insulation." Sera camları balonlu naylonla kaplanır, "INSULATION?".
7. `ag03c_strike` "Another flop." "Wallpaper" ve "Greenhouses" kırmızı çizilir.
8. `bw_ship` (lab) "But here's the crazy part: IBM had a new computer," IBM 1401 dolapları, anlatıcı yürüyerek gelir, "IBM 1401", "NEW!".
9. `bw_ship` (truck) "and it had to travel without breaking." Kamyonda sarsılan dolap, "FRAGILE", çatlak.
10. `bw_pack` "So they wrapped it in the wallpaper nobody wanted." Dolap balonlu naylonla sarılır, "OLD WALLPAPER!".
11. `bw_world` "Now it protects almost everything you order." Sağda bant (x ≥ 0.3) üstünde balonlu koliler, üstünde serbest dönen küre; bandın solunda zeminde anlatıcı iki eli arasındaki küçük opak tabakayı patlatır.
Kapak: `THIS WAS / WALLPAPER`, sahne 0, t 2.8 (şok pozu oturmuş, zincirleme POP'lar). Adaylar: t 1.45 parmak ucunda POP (yüz şaşkın değil), "IT WAS" t 1.75 işaret anı, sahne 3 şık oda; şok + zincir en güçlüsü.

## ag-02-barry-marshall (Short)
- **Hissedilen:** "Herkes yanılıyordu; bir doktor kanıtlamak için mikrobu kendisi içti."
- **Kanca + kapak:** "This doctor drank a glass of bacteria on purpose." ↔ kapak `HE DRANK / THE GERMS` (vurgu `DRANK`). Kare: bardaktaki bulanık sıvı, bakteri çizimleri, korkmuş fesli anlatıcı.
- **Doğrulanacak:** Perth, Robin Warren ile 1982'de mide biyopsilerinde bakteri; dönemin görüşü stres/asit; domuz yavrularını enfekte etme denemeleri başarısız; 1984'te kültürü içti; birkaç gün içinde kusma; endoskopi + biyopsi gastrit gösterdi; antibiyotikle iyileşti; Nobel 2005 (Warren ile). "Ülser oldu" denmez, iltihap/gastrit.
- **Tek parça anlatım (469 karakter):**

> This doctor drank a glass of bacteria on purpose. In 1984, almost every doctor believed stomach ulcers came from stress and acid. But Barry Marshall, a young doctor in Australia, kept finding a strange bacterium in sick stomachs. Nobody believed him, and his tests on pigs had failed. So he mixed the germs into a broth, and drank it. Days later, he was vomiting, and a camera showed his stomach was inflamed. Twenty-one years later, that drink won him the Nobel Prize.

- **Çekim fikri:** 1 kanca: bardak + korkmuş anlatıcı · 2 `board` STRESS + ACID (1984 inancı) · 3 `stage` Marshall mikroskopta, spiral bakteri · 4 doktorlar kafa sallıyor · 5 domuz ✗ · 6 `bm_drink`: bakteri et suyuna dökülüyor, içiyor · 7 mide kesiti kızarıyor · 8 `timeline` 1984 → 2005 · 9 Nobel madalyası.

### Çekim listesi (yazar)
**Düzeltme turu 2 sonrası (güncel):** 454 karakter (~33.6 sn tahmini), 10 sahne. Metin: "This doctor drank a glass of bacteria on purpose. If you had an ulcer in 1984, doctors blamed stress. But Barry Marshall kept finding strange germs in sick stomachs. Nobody believed him. His pig tests failed. To prove it, he did the unthinkable. He mixed the germs into a broth, and drank it. Days later, he was vomiting, and a camera showed his stomach was inflamed. That drink helped win him a Nobel Prize, and today, ulcers are cured with antibiotics." Doğrulandı (Wikipedia/Lasker): 1984 domuz denemeleri başarısız → kültür et suyunda içildi; 5–8. günler kusma; 8. gün endoskopi + biyopsi: gastrit (metin ülser demiyor); Nobel 2005 Warren ile (açıklamada).
Yeni tip dosyası: `scenes/studio/shots/bm_marshall.js` (`bm_drink`, `bm_clinic`, `bm_scope`, `bm_pig`, `bm_sick`, `bm_stomach`, `bm_nobel`).
0 `bm_drink` kanca/kapak: yakın plan, büyük gözlüklü Marshall bardağı kafaya dikiyor (içinde 4 ayrı büyük spiral bakteri), büyük fesli anlatıcı şok, "BACTERIA!" kırmızı damga · 1 `bm_clinic` muayenehane: tablo "ULCER?" → kırmızı "STRESS!", doktor gösteriyor, anlatıcı hasta · 2 `bm_scope` (2+3 birleşti; Perth kicker'da) Marshall mikroskopta, "MARSHALL" etiketi, büyüteç dairesinde spiral bakteriler, anlatıcı dürbün → şok · 3 `bm_pig` domuzlar sol-orta bölgede, doktor 0.62 omuz silkiyor, anlatıcı 0.8, "FAILED" · 4 `bm_drink` parlayan dolu bardak, Marshall yürüyüp duruyor, anlatıcı şok + "DON'T!" · 5 `bm_drink` petri kabı dökülüyor, "drank"te içiyor · 6 `bm_sick` "DAY 5", halsiz Marshall, kova, bulantı sarmalı · 7 `bm_stomach` endoskop, kızaran yamalar, "INFLAMED" oku yamalara (0.5, 0.48), anlatıcı ölçek 0.75 midenin dışında · 8 `bm_nobel` 1984 → 2005, altın madalya · 9 `bm_stomach` (heal) kapsüller iniyor, lekenin yanındaki "ULCER" lekeler silinirken çiziliyor, yeşil "ANTIBIOTICS" + yeşil tik, anlatıcı (0.75) tike işaret ediyor.
Kapak (tur 2, 3 aday denendi): A sahne 0 t=2.4 "HE DRANK / THE GERMS", içme anı + şok anlatıcı + damga, kare dolu (seçildi) · B sahne 4 t=2.5 parlayan bardak + "DON'T!": içme anı yok, karakterler küçük, ilk cümleyle zayıf bağ · C sahne 0 "HE DRANK / THIS" (vurgu THIS): merak var ama "BACTERIA!" damgasına yaslanıyor, A daha net.

## ag-03-tardigrades-space (Short)
- **Hissedilen:** "Yarım milimetrelik bir hayvan, insanın skafandrsız bir saniye dayanamayacağı yerde hayatta kaldı."
- **Kanca + kapak:** "In 2007, scientists sent a tiny animal into open space." ↔ kapak `IT SURVIVED / SPACE` (vurgu `SPACE`). Kare: uydunun dışında tombul su ayısı, yıldızlar, hayret anlatıcı büyüteçle.
- **Doğrulanacak:** ESA, FOTON-M3, Eylül 2007, TARDIS deneyi, ~10 gün alçak yörünge; kurutulmuş (tun) hayvanlar; sadece vakum: çoğu yaşadı; vakum + tam güneş UV: çoğu öldü, birkaçı yaşadı; dönüşte su eklendi; yumurta bıraktılar, yumurtalar açıldı; açık uzayda yaşadığı bilinen ilk hayvan (Jönsson ve ark. 2008). Boy ~0,5 mm.
- **Tek parça anlatım (501 → yazar ≤ 470'e indirir, ör. UV cümlesini birleştirerek):**

> In 2007, scientists sent a tiny animal into open space. It's called a tardigrade, a water bear about half a millimeter long. Researchers dried a batch of them out, and strapped them to the outside of a satellite. For ten days, they faced the vacuum of space. Some even faced the Sun's raw ultraviolet light. Here's the crazy part. Back on Earth, the scientists added water, and many of them woke up. They even laid eggs that hatched. That speck became the first animal known to survive naked in space.

- **Çekim fikri:** 1 kanca: uzayda su ayısı + anlatıcı · 2 büyüteç altında su ayısı · 3 `td_tun`: kuruyup fıçıya dönüşüyor · 4 uydu, dış yüzeyde kutu · 5 yörünge, 10 gün sayacı · 6 Güneş ışınları · 7 laboratuvar, damla su · 8 su ayısı uyanıp yürüyor, yumurtalar · 9 kapanış: "FIRST" damgası, anlatıcı şapka çıkarıyor.

### Çekim listesi (yazar) — tur 2 sonrası
**Anlatım (son cila: 458 karakter, ~35 sn tahmini; eleştiri tur 1: tutanak dili → YouTuber sesi, asıl "neden" = tun, UV doğruluğu, "neden"e bağlanan kapanış):**

> This tiny animal survived open space. Meet the tardigrade, the water bear. In 2007, scientists dried some and strapped them to a satellite. Back on Earth, they added water. Here's the crazy part: many woke up! Raw sunlight killed most, but a few made it. So why did they live? Dried out, it pulls in its legs and becomes a tiny barrel. Its body nearly stops, like pausing your life. It didn't beat space by being tough. It beat space by switching itself off.

Doğrulama: National Geographic (Ed Yong, 2008), Jönsson ve ark. 2008: FOTON-M3, Eylül 2007, 10 gün; tun hâlinde; sadece vakum: kontrol grubuyla aynı oranda yaşadı; vakum + tam UV: çoğu öldü, birkaçı yaşadı; su damlasıyla canlandılar. Anlatıcı fesini çıkarmaz (BRAND §2).
Kapak: `THIS ANIMAL / SURVIVED / SPACE` (vurgu SPACE), sahne 0, t 2.5: büyük şoklu anlatıcı (scale 1.25) + dev su ayısı, Dünya ufku aşağıda, uydu hayaleti yok. Adaylar: IT SURVIVED / OPEN SPACE (sahne 0), DRIED OUT. / THEN IT / WOKE UP (sahne 3, tunun canlandığı an; yakın plan küçük kaldı).
1. `td_space` "This tiny animal survived open space." Dev su ayısı yıldızlar arasında süzülüyor; büyük anlatıcı alçak ufukta dürbünle bakıyor → "space"te şok (kanca = kapak).
2. `td_lens` "Meet the tardigrade, the water bear." Anlatıcı dev büyüteç tutuyor; yosunda yürüyen su ayısı, "0.5 mm" ölçeği, "WATER BEAR".
3. `td_space` "In 2007, scientists dried some and strapped them to a satellite." FOTON kapsülü yakın plan (kicker "2007 FOTON-M3", etiket tekrarı yok); tun tepsisi, "strapped"te kayışlar, sağ üstte "10 DAYS" notu.
4. `td_lab` "Back on Earth, they added water. Here's the crazy part: many woke up!" Damlalıktan damla; büyük yuvarlak yakın planda tun tamamen canlanıp yürüyor; "woke"ta yeşil "ALIVE!", anlatıcı geri sıçrıyor.
5. `td_space` "Raw sunlight killed most, but a few made it." Güneş'ten tepsiye kırmızı UV ışınları, tunlar kırmızı yanıyor; "MOST DIED", "few"da yeşil kutulu "A FEW LIVED".
6. `title` "So why did they live?" WHY DID THEY / [LIVE?] (kutu ayrı satırda, "they"de tam görünür); anlatıcı sağ altta düşünüyor.
7. `td_lens` "Dried out, it pulls in its legs and becomes a tiny barrel." Büyüteçte su ayısı bacaklarını ve başını çekip buruşuk fıçıya dönüşüyor; "barrel"da kırmızı "TUN", anlatıcı şok.
8. `td_pause` "Its body nearly stops, like pausing your life." Kalp monitörü yavaşlayıp düzleşiyor, tunun üstünden "z"ler; "pausing"de anlatıcı dev kırmızı duraklat düğmesine basıyor, mavi "PAUSED".
9. `td_space` "It didn't beat space by being tough." Uzayda süzülen su ayısı; "TOUGH" yazısı "tough"ta kırmızı çizgiyle üstü çiziliyor; anlatıcı önce yazıyı işaret ediyor, üstü çizilince omuz silkiyor.
10. `td_space` "It beat space by switching itself off." Su ayısı "switching"te uzayda tuna dönüşüyor, "off"ta kırmızı "OFF" damgası; anlatıcı aşağı uzanıp "off"ta kırmızı güç düğmesine basıyor (düğme çöküyor).
Tipler: `td_space` ×5, `td_lens` ×2, `td_lab`, `td_pause`, `title`; anlatıcı 8/10 sahnede. Yeni dosyalar: `scenes/studio/shots/td__lib.js`, `td_space.js` (`td_space`, `td_orbit`), `td_lens.js` (`td_lens`, `td_lab`), `td_pause.js`.
Tur 2: Dünya diski artık dolgusuz (palet dışı #E3DDCD yok): sadece ince ufuk kavsi + ink-soft tarama; sahne 0'da kapak bloğu sırasında su ayısı belirgin süzülüyor (drift_k 3).

## ag-04-tambora-1816 (uzun video)
- **Hissedilen:** "Dünyanın öbür ucundaki tek bir dağ, bir yıl boyunca bütün gezegenin yazını çaldı; kimse sebebini bilmiyordu."
- **Kanca + kapak:** kapak `SNOW / IN JUNE` ya da `IT STOLE / SUMMER` (vurgu `JUNE` / `SUMMER`). Kare: patlayan dağ, ön planda karlı yaz tarlası, üşüyen şok anlatıcı. 3 aday.
- **Doğrulanacak:** Tambora, Sumbawa; ~4.300 m → ~2.850 m; faaliyet 5 Nisan 1815, doruk 10–11 Nisan; Java'da İngiliz askerleri top sesi sandı (Raffles), tekne gönderildi; Sanggar racası: üç alev sütunu birleşti, "liquid fire"; piroklastik akıntılar köyleri denize sürükledi; ~2.600 km'den duyuldu (metinde "more than 2,500"); pomza salları; birkaç gün karanlık; doğrudan ~10.000 ölüm, açlık/hastalıkla onbinler (metin sayı vermiyor); kükürt aerosolü stratosferde; 1816 Haziran New England/Quebec kar, Temmuz/Ağustos don; "Eighteen Hundred and Froze to Death"; Vermont'tan batıya göç; Avrupa'da kıtlık, ekmek isyanları; Villa Diodati, Byron'ın hayalet hikâyesi yarışması, Mary Shelley (18) → Frankenstein; Karl Drais 1817 (bağlantı tartışmalı, metin öyle diyor); ~100 yıl sonra bağ kuruldu (Humphreys, 1920); Grönland/Antarktika buz çekirdeklerinde sülfat; küresel soğuma ~0,4–0,7 °C ("less than one degree").
- **Bölümler:** 1 "A Quiet Mountain" · 2 "The Loudest Sound" · 3 "The Invisible Veil" · 4 "The Year Without a Summer" · 5 "The Answer in the Ice". Toplam 4.383 karakter.
- **Tek parça anlatım (bölüm bölüm):**

**CHAPTER 1 / 5 — A Quiet Mountain**
> In June 1816, it snowed in New England. Frost killed the crops, rain drowned the harvests of Europe, and hungry people wondered if the world was ending. Nobody knew why. The answer was on the other side of the planet, inside a mountain most of them had never heard of. This is the story of Mount Tambora, and the year without a summer.
> In 1815, Tambora stood on the island of Sumbawa, in what is now Indonesia. It was more than four thousand meters tall, and for as long as anyone could remember, it had been quiet. Villages, rice fields and small kingdoms lived on its slopes. People didn't even think of it as a volcano. Then, on April 5, the mountain began to rumble.

**CHAPTER 2 / 5 — The Loudest Sound**
> The first blasts were so loud that, on the island of Java, hundreds of kilometers away, British soldiers thought they heard cannon fire. They marched out to fight an enemy. Boats were sent to look for a ship in trouble. There was no enemy, and there was no ship.
> And that was only the warning. On the evening of April 10, the real eruption began. A local ruler later said that three columns of fire shot out of the summit, and joined into one. The whole mountain, he said, looked like flowing liquid fire. Then avalanches of burning ash and gas raced down the slopes, faster than anyone could run, and swept entire villages into the sea.
> The explosions were heard more than 2,500 kilometers away. When it was over, Tambora was about 1,300 meters shorter. Its whole top had been blown into the sky. Weeks later, ships far out at sea were still sailing through huge rafts of floating stone.

**CHAPTER 3 / 5 — The Invisible Veil**
> For days, the islands nearby lived in total darkness, even at noon. Ash buried the fields and poisoned the water. The eruption itself killed around ten thousand people. But the hunger and disease that came after killed many more. Most estimates say that tens of thousands died across Sumbawa and the island next to it.
> But here's the thing. Tambora wasn't finished. The blast had shot millions of tons of sulfur gas high into the sky, far above the clouds and the rain. Up there, the gas turned into a thin haze of tiny droplets, and the winds slowly spread it around the entire planet.
> You couldn't see it like a cloud. But it did something sneaky. It bounced part of the sunlight back into space, before it could warm the ground. So the whole Earth got a little colder. And a year later, people far away from Indonesia began to feel it.

**CHAPTER 4 / 5 — The Year Without a Summer**
> In June 1816, snow fell in New England and Canada. Frost came back in July, and again in August, and killed the corn in the fields. Farmers gave that year a grim nickname: Eighteen Hundred and Froze to Death. Thousands of people in Vermont and Maine gave up, sold their farms, and headed west.
> In Europe, it rained for weeks. Harvests rotted, the price of bread exploded, and hungry crowds rioted in the streets. Some families left their homes and walked away to find food.
> Now here's the strangest part. In Switzerland, beside Lake Geneva, a group of young writers was stuck indoors by the endless storms. So the poet Lord Byron gave his friends a challenge: let's each write a ghost story. One of them was an eighteen-year-old named Mary Shelley. And out of that dark, cold summer came Frankenstein.
> Some historians even go one step further. Oats were so expensive that horses became hard to feed. And in 1817, a German inventor named Karl Drais showed off a running machine with two wheels and no horse, an early ancestor of the bicycle. That link is still debated. But the timing is hard to ignore.

**CHAPTER 5 / 5 — The Answer in the Ice**
> So why did nobody blame the volcano? Because in 1816, nobody imagined that one mountain could change the weather of the whole world. News traveled slowly, and Tambora was very far away. It took about a hundred years before scientists connected the dots.
> And today, we can even see the proof. Deep in the ice of Greenland and Antarctica, the layers from those years hold a spike of volcanic sulfur. It's like a fingerprint frozen in time.
> Tambora is the most powerful eruption in recorded history. And it cooled the planet by less than one degree Celsius. That sounds tiny. But it was enough to bring snow in June, hunger to millions, and a monster to literature.
> And volcanoes like Tambora are still out there. So here's my question for you. If the summer disappeared next year, do you think our modern world would handle it better than they did in 1816? Tell me in the comments.


- **Çekim fikri:** 3 sahne yazarı (A: bölüm 1–2, B: bölüm 3, C: bölüm 4–5). Konuya özel tipler önek `tbA_`, `tbB_`, `tbC_` (ör. uyuyan/patlayan dağ ve alev sütunları; Java'da top sesi sanan askerler; stratosferde yayılan perde ve geri yansıyan güneş ışınları; haziranda karlı tarla; fırtınalı villa, mum, yazanlar; buz çekirdeği katmanları + sülfat çizgisi). Haritalar: Endonezya (Sumbawa, Java), dünya (New England, İsviçre), Grönland/Antarktika.

## Stickstory eleştiri günlüğü

Puan sırası: Senaryo · Kanca · Okunabilirlik · Görsel=anlatım · Hareket · Kompozisyon+Kaşif · Derinlik+marka · Tempo · Doğruluk · Kapanış · Kapak+SEO

### ag-01-bubble-wrap
- Tur 1: 6·8·7·7·7·6·7·8·8·6·8 → metne YouTuber sesi + "crazy part" kancası, ironik kapanış; son sahne kompozisyonu; kapakta fes hayaleti, sahne 1 hareket.
- Tur 2: 7·9·7·6·8·5·7·6·8·7·9 → son sahne yeniden kuruldu, "in New Jersey" çıktı (süre), FANCY→TEXTURED.
- Tur 3 (geçti): 7·9·8·7·8·7·7·8·8·7·9. Son cila: Kaşif 1.1, SAFE! damgası, etiket/ok konumları. 459 karakter, ~34,7 sn.

### ag-02-barry-marshall
- Tur 1: 6·8·7·7·7·7·7·8·9·6·7 → izleyiciye hitap, "he did the unthinkable" kancası, kapanış antibiyotik; kapak yeniden; endoskop/PERTH çakışmaları.
- Tur 2: 7·8·8·8·8·7·7·7·9·8·8 → süre 37,5 sn: kısaltma ("millions" çıktı); kenarda kesik Kaşif'ler; 4 ayrı spiral bakteri.
- Tur 3 (geçti): 7·8·8·8·8·7·7·8·9·8·8. Son cila: MARSHALL etiketi, Nobel/antibiyotik sahnelerinde Kaşif. 454 karakter, ~33,6 sn.

### ag-03-tardigrades-space
- Tur 1: 5·6·8·8·8·7·7·7·7·6·7 → metin yeniden yazıldı (tun = "kendini kapatma"), kanca kapakla eşlendi, UV doğruluğu ("çoğu öldü, birkaçı yaşadı").
- Tur 2: 7·8·7·8·8·7·7·6·9·9·8 → süre kısaltıldı, palet dışı Dünya diski kaldırıldı, Kaşif eylemleri.
- Tur 3 (geçti): 8·8·7·8·8·8·8·8·9·9·8. Son cila: "Back on Earth", live? kutusu, düğmeye basma. 458 karakter, ~35 sn.

### ag-04-tambora-1816 (uzun)
- Tur 1: 7·7·6·6·7·5·7·7·8·8·5 → kapak başlığı tekrar ediyordu (IT STOLE SUMMER) → SNOW / IN JUNE (sahne 28, büyük Kaşif); Kaşif ölçeği tüm parçalarda 0.8; sol üst marka alanı temizlendi; kül akıntısı köyleri denize sürüklüyor; askerler fes gibi değil; 50→48 sahne (tekrarlar birleşti); "Mary Godwin, the future Mary Shelley"; bölüm başlarına kısa hitaplar; tepe kaybı 1.400 m (≈4.300→2.851 m).
- Tur 2 (geçti): 8·8·7·7·7·7·7·7·9·8·8. Son cila: harita çerçeveleri kicker'ın altına, 1815 etiketi altyazının üstüne, kesik Kaşif/etiketler.
- Son: 48 sahne, 4.551 karakter, ~5:29.

**Yönetmen son kapısı:** dört videonun `sheet.png` ve `cover.jpg`'si gözle kontrol edildi; konular birbirinden, geçmişten ve bugünün Düşün Bakalım videolarından farklı; lint hatasız, SEO 100/100. Toplam ≈ 5.922 karakter (günlük sınır 6.500).

# Stickstory ek video — ag-05-oldest-shipwreck (Short, extra, 25.10 16:20 İstanbul)

İstek sohbetten geldi: "Google News'te İngilizce gündemde olan, kanala uyan bir haber seç, Shorts'unu yap."

## Konu seçimi (Google News, İngilizce, son 7–14 gün)
Taranan aramalar: history discovery, archaeology, shipwreck found, ancient discovery, historic.
Seçilen: **"World's oldest shipwreck found off Turkey"** (14 Ekim'den beri BBC, CNN, NYT, CBS, ABC, Euronews,
New Scientist, Phys.org; 19–24 Ekim'de hâlâ yeni haberler). Neden: gerçek ve doğrulanabilir, global ilgi, tek
şaşırtıcı fikir ("en eski gemi enkazında gemi yok"), parşömen + Kaşif'e çok uygun, iki kanalın geçmişinde yok.
Elenen: San José kalyonu hazinesi (iddialar belirsiz), Hegseth / Eisenhower küresi (siyasi), Troy kemik flütü (zayıf kanca).

- Havuz: weird history / unsolved mysteries (kayıp şehirler ve gizemler).
- İzleyici sonunda ne hisseder: "Bir testinin şeklinden 4.500 yıl okunabiliyor, inanılmaz."
- Kanca + kapak: "The world's oldest shipwreck has no ship." ↔ OLDEST WRECK / HAS NO **SHIP**; su altında
  testilerin üstünde kesik çizgili hayalet gemi, kırmızı X ve şoktaki fesli anlatıcı.

## Doğrulanan bilgiler
Kekova Adası açıkları (Antalya), ~30 m derinlik; 30'dan fazla seramik depolama küpü + 3 taş çapa; ahşap gövde
hiç kalmamış; tarih çömlek biçiminden: yaklaşık MÖ 2700–2400 (≈4.400–4.700 yıl; ön tahmin, radyokarbon yok →
metinde "If that holds"); Hakan Öniz (Akdeniz Üniversitesi), 2024'te belgelendi, 2026'da kazı; önceki rekor Dokos
(Yunanistan) ~4.200 yıl. Giza piramitleri ~MÖ 2600–2500: aynı dönem. Kaynak: Phys.org, Euronews, Baird Maritime,
BBC/CNN başlıkları.

## Tek parça anlatım (453 karakter, ~34 sn)
The world's oldest shipwreck has no ship. Divers found it off Turkey, thirty meters down: more than thirty clay jars
and three stone anchors. But the wooden hull? Gone, rotted away long ago. So how do you date a ship that isn't there?
You read the jars. This shape of jar dates to about 4,500 years ago, when Egypt was building the pyramids. If that
holds, it beats the old record from Greece by centuries. The wood forgot this ship. The clay never did.

## Çekim listesi
| # | Cümle | Tip | Görüntü / Kaşif | Cue |
|---|---|---|---|---|
| 0 | The world's oldest shipwreck has no ship. | kk_sea | testiler + çapalar, hayalet gemi çizilir, kırmızı X; Kaşif dürbün → şok | hit=no |
| 1 | Divers found it off Turkey, thirty meters down: | rm_plus/map | Anadolu haritası, Kekova kırmızı, "30 m down"; Kaşif düşünür → gösterir | Turkey, thirty |
| 2 | more than thirty clay jars and three stone anchors. | kk_sea | testiler sırayla belirir, sayaç "30+ JARS", 3 çapa; Kaşif yukarıdan yüzerek iner | more, clay, stone, anchors |
| 3 | But the wooden hull? Gone, rotted away long ago. | kk_hull | ahşap gövde kalaslara ayrılıp toz olur, testiler kuma düşer, "GONE" damgası; Kaşif omuz silker | Gone, rotted |
| 4 | So how do you date a ship that isn't there? | stage | sahilde Kaşif yürür, düşünür, "AGE = ?" tabelası | date, there |
| 5 | You read the jars. | kk_jar | dev kuşaklı testi, kil kuşağa kırmızı halka + "clay belt"; Kaşif dürbün → gösterir | read, jars |
| 6 | This shape of jar dates to about 4,500 years ago, | timeline | 2500 BC jar made → 2026 found; Kaşif gösterir | shape, years |
| 7 | when Egypt was building the pyramids. | kk_egypt | yapımı süren piramit, rampa, blok çeken işçiler, önde aynı testi, "SAME ERA" | Egypt, pyramids |
| 8 | If that holds, it beats the old record from Greece by centuries. | rm_plus/board | Turkey ~4,500 / Greece ~4,200 çubukları, "NEW RECORD" | beats, Greece, centuries |
| 9 | The wood forgot this ship. The clay never did. | title | THE **CLAY** / NEVER FORGOT; Kaşif gösterir | clay, never |

Yeni sahne dosyası: `scenes/studio/shots/kk_kekova.js` (`kk_sea`, `kk_hull`, `kk_jar`, `kk_egypt`).

## Kapak adayları
1. Sahne 0, t 2.4, büyük kapak Kaşif'i: sahnedeki Kaşif'le üst üste bindi, X henüz çizilmemiş → elendi.
2. Sahne 0, t 2.4, kapak Kaşif'i yok: X yarım, Kaşif dürbünle bakıyor, duygu yok → elendi.
3. **Sahne 0, t 2.95** (seçilen): X tam, Kaşif ellerini başına koymuş şokta, testiler + hayalet gemi tek simge.

## Önizleme düzeltmeleri (yönetmen)
Harita: Kaşif YouTube arayüzü bölgesindeydi, "Kekova" etiketi deniz adına biniyordu → ölçek 1.15, Kaşif haritanın
doğusunda, not iç Anadolu'da. Mısır: Kaşif ve testi altyazının arkasındaydı → ufuk 0.45, ikisi 0.6'ya. Pano: Kaşif
kartın içine. Testi: "clay belt" notu kicker'a biniyordu → y 0.3. Derinlik çizgisi kicker'ın altından başlar.

## Eleştiri günlüğü
### ag-05-oldest-shipwreck — tur 1 (ek video: en az 1 tur)
Puanlar: Senaryo 7 · Kanca 9 · Okunurluk 8 · Görsel=anlatım 6 · Hareket 8 · Kompozisyon+Kaşif 6 · Derinlik 8 · Tempo 8 ·
Doğruluk 7 · Kapanış 9 · Kapak+SEO 8. En büyük 3 sorun: (1) sahne 4'te "orada olmayan gemi" derken sağlam bir tekne
görünüyordu, tabela son kelimede çıkıyordu; (2) Kaşif küçük, zaman çizelgesi/pano boş; (3) anlatım biraz haber dili.
Doğruluk: kicker "2026 find" yanlış (bulundu 2024, duyuruldu 2026), "just turned up" → "was just announced", "c. 2500 BC".
Düzeltmeler (yönetmen): sahne 4 tekne kaldırıldı, "AGE = ?" "date"te; Kaşif 0.68–0.75; zaman çizelgesine "c. 2200 BC
Greek wreck"; "Here's the clever part:" ve "And what was left?" eklendi (496 karakter); kicker "found 2024"; açıklama
düzeltildi. Pano çubukları (1.0 / 0.93) gerçek oranı gösterdiği için bilerek bozulmadı. Lint OK, preview'de STATIC yok.

# Stickstory ek video — ag-06-earhart-taraia-object (Short, extra, 25.10 17:55 İstanbul)

İstek: "Bir video daha, Türkiye'den olmasın, ABD olabilir; Google News'te viral olan bir haber." Kanal sahibine
3 aday sunuldu (Earhart / Taraia Object, Alaska'daki 13.800 yıllık ev, 82 yıl sonra bulunan U-boat); **Earhart seçildi**.

- Haber: Purdue + Archaeological Legacy Institute'un 17 kişilik ekibi Nikumaroro lagünündeki "Taraia Object"i inceledi
  (Purdue, National Geographic, ExplorersWeb, 19–21 Ekim 2026): uçak değil, kum dilinde devrilmiş ağaçlar; metal parıltısı
  odunu kaplayan sertleşmiş mercan kumu; dev hindistancevizi yengeçleri yüzünden ekip her gece gemiye döndü.
  Arka plan: Earhart ve Fred Noonan 2 Temmuz 1937'de Howland Adası'nı ararken Lockheed Electra ile kayboldu.
- Kanca/kapak: "Was this blur Amelia Earhart's lost plane?" ↔ WAS THIS / EARHART'S / **PLANE?** (uydu fotoğrafı, kırmızı halka, şoktaki Kaşif).
- Anlatım (495 karakter, 9 sahne): Was this blur Amelia Earhart's lost plane? In 1937, Earhart vanished over the Pacific.
  One theory says she landed on Nikumaroro instead. In 2020, satellite photos caught a strange shape there. It even glinted
  like metal! This year, seventeen people finally went to check. What did they find? Fallen trees on a sandbar. That metal
  shine? Wood crusted with coral sand. Giant coconut crabs were so bad, the team slept on their ship every night. The plane
  is still out there, and the search goes on.
- Sahneler: ea_sat · ea_plane · rm_plus/map · ea_sat · stage · ea_lagoon · ea_log · ea_crabs · title.
  Yeni dosya: `scenes/studio/shots/ea_earhart.js`.

### ag-06-earhart-taraia-object — tur 1
Puanlar: 7 · 8 · 7 · 7 · 7 · 6 · 7 · 8 · 7 · Kapanış 5 · Kapak+SEO 7. Sorunlar: şakacı kapanış; hayalet uçak kicker'a biniyor,
yengeç sahnesinde Kaşif kadraj dışına koşuyor, haritada etiketin üstünde; "?" altyazı şeridinde; "This fall/October" doğrulanmamış.
Düzeltmeler: kapanış "The plane is still out there, and the search goes on." (THE SEARCH / GOES ON, Kaşif dürbünle bakar);
hayalet Electra kum dilinin üstüne; Kaşif to 0.85; harita Kaşif'i solda; "?" kaldırıldı, kapak yakınlaşması 1.75;
"This year" + kicker "2026"; başlık "…That Fooled Searchers". Kapak: t 2.6 / 3.0 ve zoom 1.5 / 1.75 karşılaştırıldı, 3.0 + 1.75 seçildi.
