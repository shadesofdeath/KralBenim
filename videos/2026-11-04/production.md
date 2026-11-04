# Düşün Bakalım — 2026-11-04 (belgesel tarzı)

Manşet: `tools/news.py --channel db` bu ortamdan erişilemedi (proxy 403) → iki video için konu havuzdan seçildi.
Uzun video yine de bugünün yıl dönümüne bağlı (4 Kasım 1922: Tutankamon mezarının ilk basamağı).

## 01 — Short · büyük kararlar ve savaşlar · Türkiye/Osmanlı
- Konu: Zigetvar 1566 — Kanuni Sultan Süleyman kuşatma sırasında çadırında ölür; Sadrazam Sokullu Mehmed Paşa
  ölümü haftalarca gizler (ordu dağılmasın, II. Selim tahta güvenle çıksın). Ordu ölü bir padişahla yürür.
- İzleyici sonunda ne hisseder: ürpertiyle karışık hayranlık — bir imparatorluğu bir sır ayakta tuttu.
- Kanca/kapak: "Ordu, ölü bir padişahı izledi." / kapak "SULTAN ÇOKTAN ÖLMÜŞTÜ" (2–4 kelime, yazar kesinleştirir).
- Palet: obsidyen (önceki Düşün Bakalım short: derin). `publish_at`: 2026-11-04T19:00:00+03:00. Dosya: `01-zigetvar-sirri.json`.
- related: `videos/2026-11-04/02-tutankamon-mezari.json` değil (konu bağı yok) → boş bırak.

### Anlatım
Ordunun sultanı çoktan ölmüştü. Eylül 1566. Zigetvar. Kanuni, zaferi göremeden çadırında son nefesini verdi.
Sadrazam Sokullu bu ölümü sakladı. Çünkü bir söylenti orduyu dağıtabilirdi. Sonra kale düştü. Gizli bir mektup,
Kütahya'daki Şehzade Selim'e gitti. Ordu, haftalarca ölü bir sultanla yürüdü. O haftalarda imparatorluğu bir ordu
değil, bir sır ayakta tuttu. Böyle sessiz hikâyeler için abone olun.

(403 karakter, tahmini ~29 sn; "-yor" yok, devrik cümle yok.) Doğrulama: ölüm 6/7 Eylül 1566 gecesi, otağda (TDV
"Sokullu Mehmed Paşa"; Afyoncu/Sabah); ölüm kaleye yapılan son hücumdan biraz önce (TDV "Sigetvar") → "zaferi
göremeden". Somut gizleme ayrıntısı TDV Sokullu maddesinden: Sokullu fetihnameyle birlikte babasının öldüğünü
bildiren bir mektubu Kütahya'daki Şehzade Selim'e gönderdi, padişah hayattaymış gibi işler yürütüldü; sır Selim
gelene kadar saklandı, ölüm ordu Belgrad'a yaklaşınca açıklandı. Gizleme süresi kaynağa göre değişiyor (TDV ~3 hafta,
Daily Sabah 42 gün) → metinde sadece "haftalarca". Doktorun öldürülmesi, dublör, cesedin dik oturtulması gibi
efsaneler anlatılmadı.
Kapak (tur 3): ["SULTAN", "ÖLMÜŞTÜ"] (vurgu: ölmüştü), sahne 0, kavuk focus [540,700] zoom 1,35. Ç'siz iki kelime
en büyük ve dengeli yazıyı verdi, yazı–kavuk boşluğu azaldı. Denenenler: ["SULTAN","ÇOKTAN ÖLMÜŞTÜ"] (küçük yazı),
["SULTAN ÇOKTAN","ÖLMÜŞTÜ"] (Ç çengeli Ü noktalarına biniyor → elendi), 3 satır (aynı çakışma), otağ / sadrazam+kapı /
"ÖLÜ SULTANIN ORDUSU" adayları (uzak plan, iki özne, zayıf metin).

### Çekim listesi
| # | Cümle | Visual | Tip | Cue | Kamera |
|---|---|---|---|---|---|
| 0 | Ordunun sultanı çoktan ölmüştü. | Otağın içi, kemerli paneller; sedirde ışık havuzunda fildişi, katları belirgin büyük kavuk (sorguç, mücevher), sarkan kandil, toz, nefes alan ışık; "ölmüştü"de kavuk bandı altın yanar | `bt_zg_kavuk` hook | ölmüştü | yavaş itme |
| 1 | Eylül 1566. Zigetvar. | Yakın plan (×2,05): bataklıktaki adada kale kadrajın yarısından fazlası, büyük yansıma, sazlar, ince dumanlar; üstte "1566" + "Zigetvar" | `bt_zg_fort` siege | — | yavaş itme |
| 2 | Kanuni, zaferi göremeden çadırında son nefesini verdi. | Yıldızlı gecede tepedeki otağ, kapı içeriden yanıyor; "nefesini"de ışık köze iner | `bt_zg_otag` night | nefesini | yavaş itme |
| 3 | Sadrazam Sokullu bu ölümü sakladı. | Otağ kapısı yakından, yüzsüz sadrazam silueti; "sakladı"da perdeler kapanır | `bt_zg_door` | sakladı | yavaş itme |
| 4 | Çünkü bir söylenti orduyu dağıtabilirdi. | Önde üç büyük konik çadır, ortada tek ateş, arkada sisli seyrek sıralar; "söylenti"den sonra ateş söner, uzak ateşler kararır | `bt_zg_camp` | söylenti | yavaş itme |
| 5 | Sonra kale düştü. | Aynı kale geniş planda (×1,35), gedik, ağır duman; tuğ sahnenin başından yükselir | `bt_zg_fort` fallen | düştü | yavaş itme |
| 6 | Gizli bir mektup, Kütahya'daki Şehzade Selim'e gitti. | Fetihnamenin altın tuğrası kendini çizer; "mektup"ta kırmızı mühürlü katlı mektup öne kayar, "Şehzade Selim'e" | `bt_zg_ferman` | mektup | yavaş itme |
| 7 | Ordu, haftalarca ölü bir sultanla yürüdü. | Alçak, düz çatılı, saçaklı, perdeli Osmanlı arabası, iki at, fener; asker kolu; bütün kol 10 px/sn sağa kayar, bacaklar adım atar | `bt_zg_march` | haftalarca | yavaş itme |
| 8 | O haftalarda imparatorluğu bir ordu değil, bir sır ayakta tuttu. | Açılıştaki kavuk; ışık havuzu daralır, alev küçülür ama sönmez | `bt_zg_kavuk` end | sır | yavaş itme |
| 9 | Böyle sessiz hikâyeler için abone olun. | Şafak: ortada genişliğin ~yarısı kadar karanlık otağ, arkasından güneş yükselir, gök ağarır; yol yok | `bt_zg_otag` dawn | — | yavaş itme |

## 02 — Uzun · keşifler ve icatlar
- Konu: Tutankamon mezarının bulunuşu (4 Kasım 1922 – Şubat 1923): Carter'ın yıllarca boş kazısı, Carnarvon'un son
  sezonu, merdivenin ilk basamağı, mühürlü kapı, mum ışığında "harika şeyler", mühürlü mezar odası, unutulmuş bir
  firavunun neden bu kadar sağlam kaldığı (sonraki mezarın molozu girişi gömdü), "lanet" efsanesinin nereden çıktığı
  (yaygın efsane olarak çürütülür, doğrulanmış bilgiyle).
- İzleyici sonunda ne hisseder: 3.300 yıl karanlıkta bekleyen bir odaya ilk ışığın girişini yaşamış gibi.
- Soğuk açılış: delikten içeri uzatılan mum, titreyen alev, "Bir şey görebiliyor musun?" anı. Açık döngü: "Bu mezar
  neden 3.000 yıl kimse tarafından bulunamadı?"
- Palet: kum (önceki uzun: grafit). `publish_at`: 2026-11-04T20:30:00+03:00. Dosya: `02-tutankamon-mezari.json`.

(Anlatım metni ve çekim listesi yazar ajanlar tarafından aşağıya eklenir.)

### Anlatım

Karakter: 4097. Tema: kum (karanlık lokal: delik/oda/mezar odası şekilleri). Kapak: "KARANLIKTA / HARİKA ŞEYLER" (sahne 47, koyu odada altın maske). Başlık: Tutankamon'un Mezarı: 3.000 Yıl Kimse Neden Bulamadı?

Doğrulama notları: 4 Kasım 1922 ilk basamak, 5 Kasım mühürlü kapı, telgraf ("At last have made wonderful discovery in Valley… seals intact"), Carnarvon 23 Kasım Luksor, 26 Kasım mum/"wonderful things" (Griffith Institute, worldhistory.org); 16 Şubat 1923 mezar odası (Griffith); 4 türbe sandığı, 3 tabut, iç tabut 110,4 kg, 5.398 eser, iki antik soygun + yeniden mühürleme, Ramses V/VI (KV9) molozu ve işçi kulübeleri (Wikipedia KV62); Carnarvon 5 Nisan 1923, sivrisinek ısırığı/kan zehirlenmesi, Marie Corelli uyarısı, böyle bir yazıt yok (Manchester Üni.). Carter 1939'da öldü (+16 yıl), Lady Evelyn 1980 (+57), BMJ 2002 (Nelson). Su taşıyan çocuk "rivayet"; Carter'ın sözlerinin farklı aktarıldığı notu açıklamada. Davis: 1912 tarihli 'The Tombs of Harmhabi and Touatânkhamanou' ('I fear that the Valley of the Tombs is now exhausted'), KV54 Tutankamon mumyalama malzemesi çukuru (Davis ekibi, 1907).

Kayaya oyulmuş bir koridorun dibinde, mühürlü bir kapı. Kasım 1922. Mısır. Kapının üst köşesinde küçük bir delik açıldı. İçeri bir mum uzatıldı. Alev yana eğildi. İçeriden, binlerce yıldır kapalı kalmış sıcak hava kaçıyordu. Sonra karanlığın içinde bir şey parladı. Altın. Arkadan bir ses sordu: Bir şey görebiliyor musunuz? Ve cevap geldi: Evet. Harika şeyler. Bu mezar, herkesin kazdığı bir vadide, üç bin yıl nasıl gizli kalmıştı?

Bu hikâye, bugünden tam yüz dört yıl önce başladı. Ama önce, uzun bir hayal kırıklığı vardı. Howard Carter, İngiliz bir arkeologdu. Yıllarca, Krallar Vadisi'nde kazmıştı. Ondan önce burada kazan Theodore Davis, 1912'de vadinin artık tükendiğinden korktuğunu yazmıştı. Kazının parasını Lord Carnarvon ödüyordu. 1922 yazında, onun da sabrı tükenmişti. Carter ondan son bir kış istedi. Carnarvon kabul etti. Bu, son şanstı. Davis, Tutankamon adını taşıyan küçük bir çukur da bulmuştu. Carter'a göre bu unutulmuş firavun hâlâ buradaydı. Ama nerede?

Kasımın ilk günü, büyük bir firavun mezarının hemen önünde kazı başladı. Orada, eski mezar işçilerinin taş kulübeleri vardı. Carter, bu kez onları da kaldırttı. Dört Kasım sabahı, kulübelerin altından kayaya oyulmuş bir basamak çıktı. Rivayete göre onu su taşıyan bir çocuk buldu. Carter'ın günlüğü ise kısadır: İlk basamaklar bulundu. Basamaklar aşağı indi. On ikincisinde, mühürlü bir kapının üst kısmı göründü. Sıvanın üstünde, dokuz tutsağın üzerinde yatan bir çakal vardı. Krallar mezarlığının mührü. Carter kapıyı açmadı. Merdiveni yeniden doldurdu ve İngiltere'ye telgraf çekti: Sonunda harika bir keşif. Mühürleri sağlam. Üç hafta bekledi. Kapının ardında ne olduğunu, henüz kimse bilmiyordu.

Carnarvon, yirmi üç Kasım'da kızı Evelyn'le birlikte Luksor'a geldi. Merdiven sonuna kadar açıldı. On altı basamak. Kapının altında, artık okunabilen bir isim vardı. Ama bir şey tuhaftı. Kapının bir köşesi açılıp yeniden kapatılmıştı. Biri, onlardan önce girmişti. Ardında taş parçalarıyla dolu bir koridor, sonunda ise ikinci bir mühürlü kapı vardı. Yirmi altı Kasım. Carter bu kapıda da küçük bir delik açtı ve mumu içeri uzattı. Gözleri karanlığa alışınca, şekiller belirdi. Hayvan başlı, yaldızlı yataklar. Sökülmüş savaş arabaları. Üst üste sandıklar. Ve her yerde, altının parıltısı. Bir duvarın önünde iki siyah heykel nöbet tutuyordu. Aralarında mühürlü bir kapı daha vardı. Ardında ne vardı?

On altı Şubat 1923. O son kapı da açıldı. İçeride, odayı neredeyse dolduran altın kaplı dev bir sandık vardı. İçinden ikinci bir sandık çıktı. Sonra üçüncüsü. Sonra dördüncüsü. En içte taş bir lahit, onun da içinde iç içe üç tabut vardı. Sonuna ulaşmak yıllar sürdü. En içteki tabut, yüz on kilo som altındı. Kralın yüzünde altın bir maske vardı. Gözleri, üç bin yılı aşkın süre aynı karanlığa bakmıştı. Mezardan beş bin üç yüzü aşkın eser çıktı. Ama asıl soru hâlâ cevapsızdı.

Soyguncular bu mezarı nasıl kaçırmıştı? Cevap, işçi kulübelerinin altındaydı. Tutankamon, büyük olasılıkla on dokuz yaşında öldü ve küçük bir mezara aceleyle gömüldü. Kısa süre sonra hırsızlar iki kez girdi. Görevliler kapıları her seferinde yeniden mühürledi. Yüz elli yılı aşkın süre sonra, hemen yukarıda başka bir firavuna mezar kazıldı. Moloz aşağı döküldü, üstüne işçi kulübeleri kuruldu. Adı da sonraki kralların listelerinden silindi. Kapısı toprağın, adı unutuluşun altında kaldı. Unutulmak onu korumuştu. Ama mezar açıldıktan haftalar sonra, karanlık bir hikâye doğdu. Beş Nisan 1923. Lord Carnarvon, Kahire'de öldü. Tıraş olurken bir sivrisinek ısırığını kesmişti. Yara mikrop kaptı. Kan zehirlenmesi onu götürdü. Ama gazeteler başka bir şey yazdı. Bir romancı, mezara girenleri ölümün beklediğini ilan etmişti. Böyle bir yazı, mezarda hiç bulunmadı. Gerçek daha sessizdi. Howard Carter on altı yıl, Lady Evelyn ise elli yedi yıl daha yaşadı. 2002'deki bir araştırma da laneti doğrulamadı. Bugün Tutankamon hâlâ kendi mezarında yatıyor. Üç bin yıldan fazla kimse onu bulamadı, çünkü herkes onu unutmuştu. Sizce bu vadinin altında, bulunmayı bekleyen bir oda daha var mı? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun.

### Çekim listesi

| # | Tip | Cümle | Görüntü | Cue |
|---|---|---|---|---|
| 0 | `bt_tut_hole` **[Mum ışığı]** | Kayaya oyulmuş bir koridorun dibinde, mühürlü bir kapı. Kasım 1922. Mısır. | Kaya duvarın ortasında sıvalı, mühür baskılarıyla dolu bir kapı; üstte taş lento, önde zemin, kapının önünde yumuşak ışık havuzu |  |
| 1 | `bt_tut_hole` | Kapının üst köşesinde küçük bir delik açıldı. İçeri bir mum uzatıldı. | Aynı kapı; sol üst köşesinde karanlık bir delik açılır, sağ alttan bir kol elindeki mumu yavaşça deliğe uzatır | hole=delik |
| 2 | `bt_tut_breach` | Alev yana eğildi. İçeriden, binlerce yıldır kapalı kalmış sıcak hava kaçıyordu. | Yakın plan: sıvadaki karanlık deliğin önünde mum; alev deliğin dışına doğru yavaşça eğilip doğrulur, etrafında altın ışık |  |
| 3 | `bt_tut_breach` | Sonra karanlığın içinde bir şey parladı. Altın. | Deliğin içi: kapkaranlık bir boşluk; 'Altın'da içinden altın çizgiler (hayvan başlı bir yatak ucu, bir tekerlek, bir sandık kenarı) ve yavaş parıltılar belirir | hit=parladı |
| 4 | `bt_text` | Arkadan bir ses sordu: Bir şey görebiliyor musunuz? | Boş kum zeminde ışık havuzu; önce ince 'bir şey', sonra 'görebiliyor musunuz?' | c1=Arkadan, c2=görebiliyor |
| 5 | `bt_text` | Ve cevap geldi: Evet. Harika şeyler. | Işık havuzunda önce 'Evet.', sonra altın renkte 'harika şeyler' | c1=Evet, c2=Harika |
| 6 | `bt_tut_valley` | Bu mezar, herkesin kazdığı bir vadide, üç bin yıl nasıl gizli kalmıştı? | Krallar Vadisi geniş plan: iki yanda kayalıklar, arkada piramit biçimli zirve, vadi tabanı boş ve sessiz, üstte soluk güneş ışığı |  |
| 7 | `bt_chapter` **[Boş vadi]** | Bu hikâye, bugünden tam yüz dört yıl önce başladı. Ama önce, uzun bir hayal kırıklığı vardı. | Bölüm kartı: altın 'I', ince çizgi, büyük ince 'Boş vadi', altında italik '1917–1922' |  |
| 8 | `bt_tut_nile` | Howard Carter, İngiliz bir arkeologdu. Yıllarca, Krallar Vadisi'nde kazmıştı. | Sade Mısır haritası: Akdeniz ve Kızıldeniz kıyıları, mavi Nil kendini çizer, deltası açılır; Luksor'un batısında altın nokta yanar: 'Krallar Vadisi / Luksor' | hit=Vadisi |
| 9 | `bt_tut_valley` | Ondan önce burada kazan Theodore Davis, 1912'de vadinin artık tükendiğinden korktuğunu yazmıştı. | Vadi tabanında moloz yığınları, başlarında sepet taşıyan yedi küçük yüzsüz siluet yavaşça yürür, toz yükselir |  |
| 10 | `bt_tut_lamp` | Kazının parasını Lord Carnarvon ödüyordu. 1922 yazında, onun da sabrı tükenmişti. | Gece, bir odada pencere (yıldızlar ve hilal), önünde küçük masada yanan bir kandil; alev sakin yanar |  |
| 11 | `bt_tut_hourglass` | Carter ondan son bir kış istedi. Carnarvon kabul etti. Bu, son şanstı. | Işık havuzunda tek bir kum saati; üst hazne boşalır, kum ince bir iple alta akar; altında italik 'son sezon' |  |
| 12 | `bt_tut_cartouche` | Davis, Tutankamon adını taşıyan küçük bir çukur da bulmuştu. Carter'a göre bu unutulmuş firavun hâlâ buradaydı. Ama nerede? | Dikey bir kral adı halkası (kartuş); içindeki işaretler birer birer çizilir; 'Tutankamon'da altında italik 'Tutankamon' | hit=Tutankamon |
| 13 | `bt_chapter` **[İlk basamak]** | Kasımın ilk günü, büyük bir firavun mezarının hemen önünde kazı başladı. | Bölüm kartı: altın 'II', ince çizgi, büyük ince 'İlk basamak', altında italik '4 Kasım 1922' |  |
| 14 | `bt_tut_valley` | Orada, eski mezar işçilerinin taş kulübeleri vardı. Carter, bu kez onları da kaldırttı. | Sağda kayalığa oyulmuş büyük, karanlık bir mezar kapısı; önündeki moloz yamacında dört yıkık taş kulübe; 'kaldırttı'da bir kulübenin altında soluk altın bir basamak çizgisi belirir | hit=kaldırttı |
| 15 | `bt_tut_stairs` | Dört Kasım sabahı, kulübelerin altından kayaya oyulmuş bir basamak çıktı. | Kesit: yüzeyde iki kulübe, altında moloz dolu bir merdiven kuyusu; sadece en üstteki basamak açığa çıkar, 'basamak'ta altınla çizilir | hit=basamak |
| 16 | `bt_tut_diary` | Rivayete göre onu su taşıyan bir çocuk buldu. Carter'ın günlüğü ise kısadır: İlk basamaklar bulundu. | Açık bir defter; sol sayfada '4 Kasım 1922', sağ sayfada kalemle kendini yazan italik satır 'ilk basamaklar bulundu' |  |
| 17 | `bt_tut_stairs` | Basamaklar aşağı indi. On ikincisinde, mühürlü bir kapının üst kısmı göründü. | Aynı kesit: moloz geri çekildikçe basamaklar birer birer açılır, en altta mühürlü kapının üst kısmı görünür |  |
| 18 | `bt_tut_seal` | Sıvanın üstünde, dokuz tutsağın üzerinde yatan bir çakal vardı. Krallar mezarlığının mührü. | Sıva parçası üstünde oval mühür baskısı: tepede yatan bir çakal, altında üç sıra halinde dokuz bağlı tutsak; ışık soldan sağa yavaşça geçer; altta italik 'krallar mezarlığının mührü' |  |
| 19 | `bt_tut_telegram` | Carter kapıyı açmadı. Merdiveni yeniden doldurdu ve İngiltere'ye telgraf çekti: Sonunda harika bir keşif. Mühürleri sağlam. | Bir telgraf kâğıdı, başlığı 'TELGRAF'; üstüne iki yapıştırma şerit belirir: 'HARİKA KEŞİF', 'MÜHÜRLER SAĞLAM' | k1=harika, k2=Mühürleri |
| 20 | `bt_tut_valley` | Üç hafta bekledi. Kapının ardında ne olduğunu, henüz kimse bilmiyordu. | Gece Krallar Vadisi: kayalıklar, arkada zirve, gökte yavaşça nefes alan yıldızlar ve hilal; vadi boş |  |
| 21 | `bt_chapter` **[Harika şeyler]** | Carnarvon, yirmi üç Kasım'da kızı Evelyn'le birlikte Luksor'a geldi. | Bölüm kartı: altın 'III', ince çizgi, büyük ince 'Harika şeyler', altında italik '26 Kasım 1922' |  |
| 22 | `bt_tut_stairs` | Merdiven sonuna kadar açıldı. On altı basamak. Kapının altında, artık okunabilen bir isim vardı. | Kesit: on altı basamak tamamen açık, en altta mühürlü kapı; 'isim'de kapının alt kısmında altın bir kartuş parlar, yanında italik 'Tutankamon' | hit=isim |
| 23 | `bt_tut_door` | Ama bir şey tuhaftı. Kapının bir köşesi açılıp yeniden kapatılmıştı. Biri, onlardan önce girmişti. | Önden mühürlü sıvalı kapı; 'yeniden'de sol üst köşede farklı mühürlü, yeniden sıvanmış bir parça kırmızı çizgiyle belirir | hit=yeniden |
| 24 | `bt_tut_hole` | Ardında taş parçalarıyla dolu bir koridor, sonunda ise ikinci bir mühürlü kapı vardı. | Perspektif koridor: duvarlar sona doğru daralır; koridoru dolduran taş parçaları önden arkaya temizlenir, sonda ikinci mühürlü kapı belirir ve ışık alır | hit=ikinci |
| 25 | `bt_tut_hole` | Yirmi altı Kasım. Carter bu kapıda da küçük bir delik açtı ve mumu içeri uzattı. | Mühürlü kapının sol üst köşesinde delik açılır; elinde mum tutan bir kol yavaşça deliğe uzanır | hole=delik |
| 26 | `bt_tut_room` | Gözleri karanlığa alışınca, şekiller belirdi. Hayvan başlı, yaldızlı yataklar. | Karanlık bir oda, soldan mum ışığı; karanlıktan altın çizgilerle hayvan başlı uzun bir yatak yavaşça belirir |  |
| 27 | `bt_tut_room` | Sökülmüş savaş arabaları. Üst üste sandıklar. Ve her yerde, altının parıltısı. | Aynı karanlık oda: yatağın yanında önce iki savaş arabası tekerleği, sonra üst üste sandıklar altın çizgilerle belirir; 'parıltısı'nda her yerde altın parıltılar | a=arabaları, b=sandıklar, hit=parıltısı |
| 28 | `bt_tut_door` | Bir duvarın önünde iki siyah heykel nöbet tutuyordu. Aralarında mühürlü bir kapı daha vardı. Ardında ne vardı? | Mühürlü kapının iki yanında altın etekli, altın başlıklı, ellerinde asa tutan iki siyah nöbetçi heykel; soldan mum ışığı |  |
| 29 | `bt_chapter` **[Mühürlü oda]** | On altı Şubat 1923. O son kapı da açıldı. | Bölüm kartı: altın 'IV', ince çizgi, büyük ince 'Mühürlü oda', altında italik '16 Şubat 1923' |  |
| 30 | `bt_tut_shrine` | İçeride, odayı neredeyse dolduran altın kaplı dev bir sandık vardı. | İki duvar arasına zor sığan altın kaplı dev bir türbe sandığı (kornişli çatı, çift kapı); yanında ölçek için küçük yüzsüz bir siluet |  |
| 31 | `bt_tut_shrine` | İçinden ikinci bir sandık çıktı. Sonra üçüncüsü. Sonra dördüncüsü. | Altın türbenin çizgisi; içinde 'ikinci', 'üçüncüsü', 'dördüncüsü'nde birer birer daha küçük türbe çizgileri belirir | n2=ikinci, n3=üçüncüsü, n4=dördüncüsü |
| 32 | `bt_tut_coffin` | En içte taş bir lahit, onun da içinde iç içe üç tabut vardı. Sonuna ulaşmak yıllar sürdü. | Yukarıdan bakış: taş lahit; içinde iç içe üç insan biçimli tabut çizgisi; 'tabut'ta en içteki altına döner | hit=tabut |
| 33 | `bt_tut_coffin` | En içteki tabut, yüz on kilo som altındı. | Yukarıdan, ışık havuzunda tek bir altın tabut: göğsünde çapraz kollar, asa ve kırbaç; 'kilo'da altında büyük '110 kg' | hit=kilo |
| 34 | `bt_tut_mask` | Kralın yüzünde altın bir maske vardı. Gözleri, üç bin yılı aşkın süre aynı karanlığa bakmıştı. | Ön cepheden altın maske: çizgili başlık, sakin yüz, sürmeli gözler, örgülü sakal, geniş gerdanlık; ışık havuzu yavaşça büyür |  |
| 35 | `bt_text` | Mezardan beş bin üç yüzü aşkın eser çıktı. Ama asıl soru hâlâ cevapsızdı. | Işık havuzunda büyük ince '5.398 eser', sonra altın renkte italik 'asıl soru' | c1=eser, c2=soru |
| 36 | `bt_chapter` **[Unutulmuş kral]** | Soyguncular bu mezarı nasıl kaçırmıştı? Cevap, işçi kulübelerinin altındaydı. | Bölüm kartı: altın 'V', ince çizgi, büyük ince 'Unutulmuş kral', altında italik 'Neden bozulmadı?' |  |
| 37 | `bt_tut_plans` | Tutankamon, büyük olasılıkla on dokuz yaşında öldü ve küçük bir mezara aceleyle gömüldü. | İki yer planı yan yana: solda uzun koridorlu, sütunlu salonlu büyük bir kraliyet mezarı (italik 'büyük kraliyet mezarı'); sağda merdiven, koridor ve dört küçük odadan oluşan KV62 planı, 'aceleyle'de altına boyanır (italik 'Tutankamon') | hit=aceleyle |
| 38 | `bt_tut_section` | Kısa süre sonra hırsızlar iki kez girdi. Görevliler kapıları her seferinde yeniden mühürledi. | Vadi tabanının kesiti: küçük mezar (merdiven, koridor, ön oda, mezar odası) karanlık; iki altın kesikli tünel birer birer koridora uzanır; sonra kapılarda altın mühürler belirir | t1=hırsızlar, t2=kez, seal=mühürledi |
| 39 | `bt_tut_section` | Yüz elli yılı aşkın süre sonra, hemen yukarıda başka bir firavuna mezar kazıldı. Moloz aşağı döküldü, üstüne işçi kulübeleri kuruldu. | Aynı kesit; sağdaki kayalıkta büyük yeni bir mezarın karanlık koridoru, yanında italik 'yeni büyük mezar'; 'Moloz'da yamaçtan dökülen moloz küçük mezarın merdiveninin üstünü örter, 'kulübeleri'nde üstünde küçük taş kulübeler belirir | hit=Moloz, huts=kulübeleri |
| 40 | `bt_tut_cartouche` | Adı da sonraki kralların listelerinden silindi. Kapısı toprağın, adı unutuluşun altında kaldı. | Kral adı halkası; 'silindi'de içindeki işaretler birer birer silinir, boş halka kalır | hit=silindi |
| 41 | `bt_text` | Unutulmak onu korumuştu. Ama mezar açıldıktan haftalar sonra, karanlık bir hikâye doğdu. | Işık havuzunda ince italik 'Unutulmak' ve altın renkte 'onu korumuştu' | c1=Unutulmak, c2=korumuştu |
| 42 | `bt_tut_nile` | Beş Nisan 1923. Lord Carnarvon, Kahire'de öldü. | Aynı sade Mısır haritası; Nil kendini çizer, deltanın başında altın nokta yanar: 'Kahire' | hit=Kahire |
| 43 | `bt_tut_lamp` | Tıraş olurken bir sivrisinek ısırığını kesmişti. Yara mikrop kaptı. Kan zehirlenmesi onu götürdü. | Gece penceresi önünde küçük masada kandil; alev yavaş yavaş küçülür ve söner, ışık çekilir |  |
| 44 | `bt_tut_paper` | Ama gazeteler başka bir şey yazdı. Bir romancı, mezara girenleri ölümün beklediğini ilan etmişti. Böyle bir yazı, mezarda hiç bulunmadı. | Tek bir gazete ön sayfası; büyük manşet 'FİRAVUNUN LANETİ', altında italik 'mezara girenleri ölüm bekler' |  |
| 45 | `bt_text` | Gerçek daha sessizdi. Howard Carter on altı yıl, Lady Evelyn ise elli yedi yıl daha yaşadı. 2002'deki bir araştırma da laneti doğrulamadı. | Işık havuzunda ince italik 'Carter +16 · Evelyn +57', altında altın 'lanet yok' | c1=Carter, c2=araştırma |
| 46 | `bt_tut_section` | Bugün Tutankamon hâlâ kendi mezarında yatıyor. Üç bin yıldan fazla kimse onu bulamadı, çünkü herkes onu unutmuştu. | Vadi kesiti: karanlık küçük mezar odasında altın bir ışık yavaşça yanar, yüzeyde hiçbir iz yok |  |
| 47 | `bt_tut_mask` | Sizce bu vadinin altında, bulunmayı bekleyen bir oda daha var mı? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun. | Altın maske ışık havuzunda, sakin; ışık yavaşça nefes alır |  |
