# Düşün Bakalım — 2026-11-06 (belgesel tarzı)

Manşet: `tools/news.py --channel db` bu ortamdan erişilemedi (proxy 403: Google News tüneli reddedildi).
Web aramasında güncel bir Türkiye manşeti olarak Gordion'da "Midas'ın ailesine ait olabilecek" yeni tümülüs
(47. tümülüs) kazısı haberleri çıktı (gzt.com, posta.com.tr, sabah.com.tr; haberin günü doğrulanamadı) → uzun
video bu manşetin arkasındaki tarih: Gordion ve Büyük Tümülüs. Short için havuza uyan ikinci bir manşet
bulunamadı → konu havuzdan (felaketler ve kazalar).
ElevenLabs uyarısı (warning: true): karakterler aralığın alt ucunda (Short ~330–360, uzun ~3.900–4.050).

## 01 — Short · felaketler ve kazalar
- Konu: Ertuğrul Fırkateyni faciası (16 Eylül 1890, Japonya, Kii Oshima / Kashinozaki fenerinin önü). Japonya'dan
  dönen Osmanlı fırkateyni tayfunda kayalara çarpar; yüzlerce denizci ölür, 69 kişi kurtulur (sayıları yazar
  doğrular). Köylüler yaralıları taşır, son tavuklarını keser, giysilerini verir. 95 yıl sonra, 1985'te Tahran'da
  mahsur kalan Japonları Türk Hava Yolları uçağı çıkarır; Japonya bunu Ertuğrul'un borcunun ödenmesi olarak anar.
- İzleyici sonunda ne hisseder: bir iyiliğin bir asır sonra karşılık bulmasının sessiz ürpertisi.
- Kanca/kapak fikri: ilk cümle ~"Fırtına bir gemiyi kayalara attı." ya da en çarpıcı an; kapak 2–4 kelime (ör.
  "95 YIL SONRA" / "BORÇ ÖDENDİ"); yazar en az 3 aday dener. Kapak: karanlık deniz, kayalar, tek fener ışığı.
- Palet: **derin** (önceki Düşün Bakalım videosu: fildisi). Dosya `01-ertugrul-firkateyni.json`,
  `publish_at` 2026-11-06T19:00:00+03:00. related: yok.

### Anlatım (son, tur 2 düzeltmesi)
Bir iyilik 95 yıl bekledi. 1890, Japonya. Tayfun, Osmanlı gemisi Ertuğrul'u kayalara attı. Beş yüzü aşkın denizci
öldü. Kurtulanlar fenerin ışığına tırmandı. Köylüler kıt erzaklarını paylaştı. 1985. Saddam İran üstündeki her uçağı
vuracağını ilan etti. Japon uçağı gelmedi. 215 Japonu son anda iki Türk uçağı çıkardı. Çünkü Türkler Ertuğrul'u unutmamıştı.
Böyle sessiz hikâyeler için abone olun. *(395 karakter, 11 sahne, taslak süre ~30 sn; -yor yok, devrik cümle yok)*

Doğrulama: Nippon.com (16 Eylül 1890 gecesi, Kii Ōshima; 600'den fazla kişi, 587 ölü, 69 kurtulan; Kashinozaki
fenerinin ışığını izlediler, bir kısmı 40 m'lik kayalığı tırmandı; adalılar kıt erzaklarını paylaştı; Irak'ın 48 saatlik
uyarısı 17 Mart 1985; Japonya askerî uçak göndermedi, ticari şirketler riskten kaçındı; Türkiye iki uçakla 215 Japonu
çıkardı; Türk yetkililer Ertuğrul'a duyulan minnet borcunu andı). Sabah (M. Övür): Saddam'ın son tarihi 19 Mart 20.30,
THY DC-10, 215 Japon. Wikipedia: 69 kurtulan, ölü "500'den fazla" → metinde "beş yüzü aşkın". Uçak sayısı: THY
bülteni tek uçak gibi anlatıyor, Nippon.com iki diyor → "iki". "Son tavuklarını kestiler" anlatısı yerine doğrulanan
"kıt erzaklarını paylaştılar".

### Çekim listesi
| # | Cümle | Visual | Tip | Cue | Kamera |
|---|---|---|---|---|---|
| 0 | Bir iyilik 95 yıl bekledi. | Tayfun gecesi, 40 m kayalık üstünde Kashinozaki feneri, geniş huzme denizi tarar, ufukta belirgin yalpalayan fırkateyn, büyük dalgalar, yağmur (kapak karesi; `dy: 380`) | bt_er_light hook | – | yavaş itme |
| 1 | 1890, Japonya. | Fırtınalı deniz + yağmur, "1890", italik "Kii Oshima" | bt_er_date sea | – | yavaş itme |
| 2 | Tayfun, Osmanlı gemisi Ertuğrul'u kayalara attı. | Yandan üç direkli, bacalı fırkateyn yalpalar; sağda gövdenin ilerisinde su hizasında kara kayalar (y < 1150); "kayalara"da kıç kayaya dayanır, altın temas çizgisi, köpük | bt_er_ship | kayalara | yavaş itme |
| 3 | Beş yüzü aşkın denizci öldü. | Karanlık suda tek kırık direk yavaşça batar, halkalar, tahta parçaları | bt_er_sea lost | – | yavaş itme |
| 4 | Kurtulanlar fenerin ışığına tırmandı. | Yakın: siluetler kayalık patikasından fenere tırmanır; "ışığına"da lamba altın | bt_er_light climb | ışığına | yakın (1,3) + itme |
| 5 | Köylüler kıt erzaklarını paylaştı. | Kulübe içi, asılı yağ lambası, pencerede yağmur; dik diz çökmüş köylü kollarını uzatır, arada ayrı duran buharlı kâse, battaniyeli denizci; "paylaştı"da kâse kenarı altın | bt_er_village | paylaştı | yavaş itme |
| 6 | 1985. Saddam İran üstündeki her uçağı vuracağını ilan etti. | Gece Azadi Kulesi, Elburz, şehir ışıkları, gökyüzünü tarayan iki projektör; "1985", italik "Tahran"; "ilan"da altın "48 saat" (son tarih) | bt_er_date city | ilan | yavaş itme |
| 7 | Japon uçağı gelmedi. | Boş gece pisti ve boş gökyüzü; solda terminal, ışıklı pencereler, önünde uzun bir sıra bekleyen siluet (sayı yok); işaret ışığı yavaşça döner | bt_er_plane empty | – | yavaş itme |
| 8 | 215 Japonu son anda iki Türk uçağı çıkardı. | Gece pist, üç motorlu uçak yükselir, ileride ikinci uçak; üstte altın sayı 0→215, italik "Japon"; "çıkardı"da pencereler altın | bt_er_plane | çıkardı | yavaş itme |
| 9 | Çünkü Türkler Ertuğrul'u unutmamıştı. | Sakin yıldızlı gece, aynı fener; üstünden uçak geçer, pencereleri altın | bt_er_light end | unutmamıştı | yavaş itme |
| 10 | Böyle sessiz hikâyeler için abone olun. | Şafak, durgun deniz, yükselen güneş, altın yansımalar | bt_er_sea calm | – | yavaş itme |

### Kapak
"İYİLİK / 95 YIL BEKLEDİ" (vurgu: İYİLİK), sahne 0, t 1,6, `focus` [540, 1152] zoom 1,0 (kayma yok), Kaşif yok.
Adaylar: (A) sahne 0 varsayılan kaydırma: başlık panelinin altında sahnenin üst kenarı ve fener tepesi kesik görünüyordu;
(B) sahne 4 tırmanış, zoom 1,15: fener kadrajın üstünde kesik, sahne kenarı görünür; (C) sahne 0 fenere zoom 1,35:
sağda sahne kenarı görünür; (D/E) sahne 0, yer `dy` ile aşağı alınmış, huzme denize: **E seçildi** (tek özne fener,
parlayan lamba, huzme ufuktaki fırkateyne doğru; küçükken okunuyor).

## 02 — Uzun · kayıp şehirler ve gizemler
- Manşet: Gordion'da yeni tümülüs keşfi ("Midas'ın ailesi"). Haber ilk cümlelerde kanca, gerisi kalıcı tarih.
- Konu: Gordion ve Büyük Tümülüs (MM, "Midas Höyüğü"). 1957'de Rodney Young'ın ekibi höyüğün içine tünel kazar,
  ardıç ve çam kütüklerinden yapılmış, 2.700 yıldır kapalı mezar odasına ulaşır: çökmüş bir yatakta 60'lı yaşlarında
  bir adam, kazanlar, fibulalar, ahşap mobilya… ama **tek bir altın yok**. Altına dokunan kral efsanesinin
  mezarında neden altın yok? Ağaç halkaları mezarı ~MÖ 740'a tarihler: büyük olasılıkla Midas değil, babası
  (Gordias?). Mezar ziyafetinin kalıntıları (kuzu/keçi güveci; şarap, bira, bal şerbeti karışımı içki — Penn
  Museum / McGovern analizi). Asur kayıtlarındaki Muşkili Mita. Gordion düğümü ve İskender (MÖ 333). Şehrin yangın
  tabakası ve yeniden tarihlenmesi. Bugün: UNESCO 2023, yeni tümülüs kazıları.
- Açık döngü sorusu (soğuk açılış): "Altına dokunan kralın mezarında neden altın yoktu?" — cevap sonda (ahşap,
  bronz, yemek; asıl hazine bunlardı; mezar Midas'ın değil; efsane sonradan Yunanlılarca yazıldı).
- İzleyici sonunda ne hisseder: efsanenin arkasındaki gerçek insanın sessizliği; toprağın hâlâ cevap verdiği hissi.
- Kapak fikri: tümülüs kesitinde ışık havuzundaki ahşap mezar odası ya da tabut/yatak; metin ör. "ALTIN YOKTU"
  (vurgu ALTIN). `focus` zorunlu. En az 3 aday.
- Palet: **grafit** (Short'tan ve son uzun videodan — Panipat fildisi, Tutankamon kum — farklı).
  Dosya `02-gordion-buyuk-tumulus.json`, `publish_at` 2026-11-06T20:30:00+03:00.

### Anlatım (son)
Gordion'da toprak yine bir kraliyet mezarı verdi. Ama en büyüğü, 1957'de açılmıştı. Elli metrelik bir tepenin altında, kütüklerden bir duvar. Duvarda küçük bir pencere açıldı. İçeri bir baş, bir kol ve bir el feneri uzandı. Rodney Young o anı şöyle yazdı: Mezar büyüktü, hava ağırdı, fener zayıftı. Işık karanlıkta gezindi. Bronz kazanlar, ahşap masalar. Ve bir tabutun içinde, bir adamın kemikleri. Bu odaya iki bin yedi yüz yıldır kimse girmemişti. Ama ışık nereye dönse, altın yoktu. Burası, dokunduğu her şeyi altına çeviren kralın adını taşıyordu: Midas Höyüğü. Bu mezarda neden altın yoktu? Cevap, Ankara'nın batısındaki sessiz bir bozkırda yatıyordu. Sakarya ile Porsuk'un birleştiği yerde, bir zamanlar Frigyalıların başkenti vardı. Adı Gordion'du. Eski şehrin çevresinde yüzü aşkın höyük yükselir. Hepsi birer mezardır. Rivayete göre bir tanrı Midas'a bir dilek hakkı verdi: dokunduğu her şey altına dönecekti. Ekmek altına döndü. Su altına döndü. Kral, altınının ortasında aç kaldı. Ama Midas sadece bir efsane değildi. Ama o kralın adını taşıyan odaya ulaşmak, yıllar sürecekti. Bu höyük elli üç metre yüksekliğinde, üç yüz metre genişliğindedir. Mezarın nerede olduğunu kimse bilmiyordu. Young bu yüzden önce delmeyi seçti. İki mevsim boyunca, küçük bir sondaj makinesi höyüğü defalarca deldi. Sonunda matkap taşa çarptı. Merkezin biraz yanında, otuz metre genişliğinde bir taş yığını vardı. 1957'de Zonguldaklı madenciler, höyüğün içine yetmiş metrelik bir tünel kazdı. Tünelin ucunda kaba bir taş duvar belirdi. Delik açılınca, taşlar bir hafta boyunca tünele döküldü. Taşların ardında kütükten bir duvar, onun da ardında ikinci bir ahşap duvar vardı. Burgu bu kez taşa değil… boşluğa saplandı. İçeride, hiç çökmemiş bir oda vardı. Oda, yaklaşık beş metreye altı metreydi. Duvarları çam ve ardıç kütükleriydi. Kuzey duvarın önünde, açık bir kütük tabutta bir adam yatıyordu. Kemiklere göre altmış ile altmış beş yaşları arasındaydı. Tabutun yanında, bir torba dolusu bronz iğne vardı. Mezardan toplam yüz seksen iki tane çıktı. Demir ayaklar üstünde üç dev bronz kazan. Yanlarında, tam yüz içki kâsesi. Dokuz ahşap masa vardı. Biri, ince kakmalarla işlenmiş bir şaheserdi. Ama altın yoktu. Ne bir taç, ne bir yüzük, ne bir altın kâse. Bu adam gerçekten Midas mıydı? Cevabı, odanın kütükleri verecekti. Her ağaç, her yıl gövdesine bir halka ekler. Kurak yıllar ince, yağışlı yıllar kalın. Halkalar, bir ağaç takvimiyle karşılaştırıldı. Kütükler, milattan önce 740 dolaylarında kesilmişti. Oysa Asur kayıtları, milattan önce 709'da bile Muşkili Mita adında yaşayan bir kraldan söz eder. Yani mezar Midas'ın değildi. Büyük olasılıkla babasının, belki de Gordias'ın mezarıydı. Yıllar sonra, Patrick McGovern kapların dibindeki kalıntıları inceledi. Cenazede baharatlı bir güveç pişirilmişti. Bal, şarap ve zeytinyağıyla koyun ya da keçi eti, yanında mercimek. Kâselerdeki içki ise tuhaftı: üzüm şarabı, arpa birası ve bal şarabı, tek bir karışımda. Yaklaşık yüz kişi, kral için son kez içmişti. Ama o kral kimdi? Cevabın bir ucu, ünlü bir düğümde saklıydı. Milattan önce 333. Genç bir komutan Gordion'a geldi. Adı İskender'di. Kalede eski bir araba duruyordu. Rivayete göre Gordias'ındı ve oğlu Midas onu tanrılara adamıştı. Kehanete göre bu düğümü çözen, Asya'ya hükmedecekti. İskender onu kılıcıyla kesti. Bazı yazarlara göre ise çiviyi çekti. Yani efsane bile bir baba ile oğlu anlatıyordu. Höyükteki adam, büyük olasılıkla o babaydı. Ya altın? Cevap, tabutun içindeydi. Adamın üstündeki örtü, götit adlı bir toprak boyasıyla boyanmıştı. Işıkta, altın gibi parlıyordu. Kral altın takmamıştı. Altın renkli bir örtünün altında yatıyordu. Belki efsane buradan doğdu. Parlayan kumaşlardan ve yüzyıllar sonra yazılan hikâyelerden. Asıl hazine altın değildi. Bir ziyafet, sessiz bir oda ve iki bin yedi yüz yıl dayanan ahşaptı. Gordion, 2023'te UNESCO Dünya Mirası oldu. Yeni açılan kraliyet mezarı ise belki bir gün, Midas'ın kendisine götürecek. Sizce bu höyükler, Midas'ın kendi mezarını hâlâ saklıyor mu? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun.
*(4072 karakter, 48 sahne, soğuk açılış + I–V; tahmini süre ~5:02 (4.355 kar. = 5:23 oranıyla; preview ~4:50); -yor ≤ 1/3, devrik cümle yok, lint OK)*

Doğrulama (web): Penn Museum Expedition 57-3 "Tumulus MM" (53 m yükseklik, 300 m çap, oda ~MÖ 740, çam/ardıç duvar,
182 fibula = 145 + 37, 3 kazan demir ayaklı, 100 omphalos kâse, 9 masa); Rodney Young, "The Gordion Tomb" (Expedition
1958: 1955 sonbaharı ve 1956 yazı sondaj, ~30 m taş yığını merkezin güneybatısında, ~70 m tünel, Zonguldaklı madenciler 3
vardiya / 25 gün, taş duvar delinince moloz bir hafta aktı, kütük duvar + ikinci kalas duvar, burgu boşluğa saplandı,
oda ~5,2 × 6,1 m, "the tomb was large, the atmosphere dense, the flashlight weak", Şenyürek: erkek, 60–65 yaş, kuzey
duvarda, başı doğuda); Anatolian Studies "Reconstructing King Midas" (60–65 yaş); Penn Museum "The Myth of Midas' Golden
Touch" (MM'de hiç altın yok; örtü götit pigmentiyle altın parıltılı; efsane Aristoteles ve Ovidius'ta); Penn Gazette +
Biblical Archaeology (McGovern, Nature 1999: koyun/keçi eti, mercimek, zeytinyağı, bal, şarap; içki şarap + arpa birası +
bal şarabı; ~100 kişi); Wikipedia Gordion (Asur kayıtlarında Mita MÖ ~718–709, İskender MÖ 333, kılıç ya da çivi rivayeti; UNESCO 2023); Penn Museum basın bülteni
(UNESCO 45. oturum, Eylül 2023); HeritageDaily (Tümülüs 47, "Midas'ın ailesinden biri olabilir" — haberin tarihi metinde
yok, "toprak hâlâ mezar veriyor" diye zamansız kuruldu).
Emin olunmayan/kaçınılanlar: Young'ın "timsah/araba" esprisi kullanılmadı; tünel uzunluğu yuvarlak "yetmiş metre"; boy
(1,57/1,59 m) yazılmadı; "kırk yıl sonra" yerine "yıllar sonra" (analiz 1999). Fotoğraf: `tools/media.py` proxy 403
verdi → tüm görseller kodla (`scenes/studio/shots/bt_gordion.js`, tipler `bt_gd_*`).

Tur 1 düzeltmeleri (eleştirmen): manşet kancası ilk sahneye alındı; sahne 13'teki tekrar kaldırıldı; yangın tabakası
sahneleri çıkarıldı; Bölüm V soruya bağlandı (Gordias'ın arabası, Midas'ın adağı → höyükteki adam büyük olasılıkla
baba); götit boyalı örtü iki sahnelik kilit sürpriz oldu; UNESCO kapanışta tek cümle; "Ama hikâye burada bitmedi" → "Ama o
kral kimdi?"; "mezar nadiren ortadadır" → "Mezarın nerede olduğunu kimse bilmiyordu."; "yüz seksen iki bronz iğne";
güveç McGovern'a göre (baharatlı; bal, şarap, zeytinyağı). Görsel: iskelet (kafatası, kaburga, leğen, uzun kemikler),
açık tonlu kesik küp + belirgin kalıntı kabuğu, kral artık pelerinli sakallı profil büst ve 3 sahnede (sahne 28 → höyük
üstünde soru işareti), tünel taşları ve "70 metre" altyazı şeridinin üstünde, örtü parıltısı örtüye kırpıldı.

Tur 2 düzeltmeleri: soğuk açılış tek sahne (haber tek kısa cümle, kütük duvar ilk karede); "Tabutun yanında, bir torba
dolusu bronz iğne vardı. Mezardan toplam yüz seksen iki tane çıktı." (Penn Expedition: 145'i tabutun yanındaki kumaş
torbada, 37'si kumaşlar arasında; kaynak "başının yanında" değil "tabutun yanında" diyor); UNESCO sahnesi açılıştaki yeni
mezara bağlandı; örtü yeniden çizildi (vücudun şeklini alıyor, baş ucu sağda belli, ön kenardan sarkıyor, altından tabut
gövdesi ve iki uçtaki kütük kesitleri görünüyor); sahne 43 kompakt tabut (s 0,65) + 1,6 yakın plan.

### Çekim listesi
| # | Cümle | Visual | Tip | Cue | Kamera |
|---|---|---|---|---|---|
| 0 | Gordion'da toprak yine bir kraliyet mezarı verdi. Ama en büyüğü, 1957'de açılmıştı. Elli metrelik bir tepenin altında, kütüklerden bir duvar. **[Kütük duvar]** | Karanlık bir tünelin sonunda, kadrajı dolduran üst üste dizilmiş yatay kütüklerden bir duvar kendini çizer; sol altta küçük bir kandil yanar, sıcak ışık kütüklere vurur | bt_gd_wall logs | – | yavaş itme |
| 1 | Duvarda küçük bir pencere açıldı. İçeri bir baş, bir kol ve bir el feneri uzandı. | Aynı kütük duvar; 'pencere'de ortada dikdörtgen karanlık bir açıklık belirir, sağ alttan bir kol elindeki el fenerini açıklığa uzatır, fenerin ışık konisi karanlıkta yavaşça gezinir | bt_gd_wall window | hole=pencere | yavaş itme |
| 2 | Rodney Young o anı şöyle yazdı: Mezar büyüktü, hava ağırdı, fener zayıftı. | Işık havuzunda önce italik 'mezar büyüktü', sonra altın renkte italik 'fener zayıftı' | bt_text | c1=büyüktü, c2=zayıftı | yavaş itme |
| 3 | Işık karanlıkta gezindi. Bronz kazanlar, ahşap masalar. Ve bir tabutun içinde, bir adamın kemikleri. | Kapkaranlık oda; alttan gelen fener ışığı soldan sağa gezinir: önce bir bronz kazan, sonra bir ahşap masa, en sonda içinde ince kemik çizgileri olan açık bir kütük tabut ışığa girer | bt_gd_scan reveal | a=kazanlar, b=masalar, c=tabutun | yavaş itme |
| 4 | Bu odaya iki bin yedi yüz yıldır kimse girmemişti. Ama ışık nereye dönse, altın yoktu. | Karanlık oda; fener ışığı zemin çizgisi boyunca yavaşça bir sağa bir sola tarar, ışıkta sadece toz zerreleri, hiçbir parıltı yok | bt_gd_scan empty | – | yavaş itme |
| 5 | Burası, dokunduğu her şeyi altına çeviren kralın adını taşıyordu: Midas Höyüğü. Bu mezarda neden altın yoktu? | Alacakaranlıkta bozkırda tek, dev, yumuşak kubbeli bir toprak höyük kendini çizer; 'Midas'ta altında 'Midas Höyüğü', italik 'Gordion, 1957' | bt_gd_mound dusk | hit=Midas | yavaş itme |
| 6 | Cevap, Ankara'nın batısındaki sessiz bir bozkırda yatıyordu. **[Altına dokunan kral]** | Bölüm kartı: altın 'I', ince çizgi, büyük ince 'Altına dokunan kral', altında italik 'Gordion' | bt_chapter | – | yavaş itme |
| 7 | Sakarya ile Porsuk'un birleştiği yerde, bir zamanlar Frigyalıların başkenti vardı. Adı Gordion'du. | Sade Anadolu haritası: kıyı çizgileri; 'Gordion'da Ankara'nın batısında altın nokta yanar, altında italik 'Frigya başkenti' | bt_map | p2=Gordion | yavaş itme |
| 8 | Eski şehrin çevresinde yüzü aşkın höyük yükselir. Hepsi birer mezardır. | Bozkırın ufkunda soldan sağa irili ufaklı höyükler birer birer belirir; sağda biri ötekilerden çok büyük | bt_gd_mound field | hit=mezardır | yavaş itme |
| 9 | Rivayete göre bir tanrı Midas'a bir dilek hakkı verdi: dokunduğu her şey altına dönecekti. | Yukarıdan inen ışıkta pelerinli, sakallı, altın taçlı yüzsüz bir kral büstü (profil); 'altına'da başının ardında altın bir hale ve ışık belirir | bt_gd_king wish | hit=altına | yavaş itme |
| 10 | Ekmek altına döndü. Su altına döndü. Kral, altınının ortasında aç kaldı. | Bir masa çizgisi üstünde bir somun ekmek ve bir kupa; 'Ekmek'te somun, 'Su'da kupa altın rengine döner ve yanar | bt_gd_touch | a=Ekmek, b=Su | yavaş itme |
| 11 | Ama Midas sadece bir efsane değildi. | Aynı pelerinli kral büstü; altın hale ve ışık söner, yanından yere uzun, gerçek bir gölge düşer | bt_gd_king real | hit=efsane | yavaş itme |
| 12 | Ama o kralın adını taşıyan odaya ulaşmak, yıllar sürecekti. **[Tünel]** | Bölüm kartı: altın 'II', ince çizgi, büyük ince 'Tünel', altında italik '1955–1957' | bt_chapter | – | yavaş itme |
| 13 | Bu höyük elli üç metre yüksekliğinde, üç yüz metre genişliğindedir. Mezarın nerede olduğunu kimse bilmiyordu. | Gece, yıldızlar altında dev höyük; 'elli'de tepeden zemine altın bir yükseklik çizgisi ve '53 m', 'yüz'de tabanında altın genişlik çizgisi ve '300 m', 'nerede'de höyüğün üstünde büyük altın bir '?' | bt_gd_mound dims | h=elli, w=genişliğindedir, c=nerede | yavaş itme |
| 14 | Young bu yüzden önce delmeyi seçti. İki mevsim boyunca, küçük bir sondaj makinesi höyüğü defalarca deldi. | Höyüğün kesiti (toprak katmanları); tepede küçük bir sondaj kulesi yer değiştirir, her yerde aşağı doğru ince bir delme çizgisi iner, beş delik birer birer | bt_gd_section drill | – | yavaş itme |
| 15 | Sonunda matkap taşa çarptı. Merkezin biraz yanında, otuz metre genişliğinde bir taş yığını vardı. | Aynı kesit, eski delikler kesikli; merkezin biraz solunda altın bir delme çizgisi iner, 'taşa'da tabanda taş yığını belirir, altında altın '30 m' çizgisi | bt_gd_section stone | hit=taşa | yavaş itme |
| 16 | 1957'de Zonguldaklı madenciler, höyüğün içine yetmiş metrelik bir tünel kazdı. | Tek kaçış noktalı perspektifte ahşap destekli bir tünel; destek çerçeveleri önden arkaya birer birer çizilir, tavanda bir kandil yanar; 'yetmiş'te altta altın '70 metre' | bt_gd_tunnel dig | hit=yetmiş | yavaş itme |
| 17 | Tünelin ucunda kaba bir taş duvar belirdi. Delik açılınca, taşlar bir hafta boyunca tünele döküldü. | Aynı tünel; sonunda kaba taşlardan bir duvar; 'Delik'te ortasında karanlık bir delik açılır, içinden küçük taşlar yavaşça yuvarlanıp önde yığılır | bt_gd_tunnel stones | hit=Delik | yavaş itme |
| 18 | Taşların ardında kütükten bir duvar, onun da ardında ikinci bir ahşap duvar vardı. | Kütük duvarda kesilmiş dikdörtgen bir pencere; 'ikinci'de pencerenin ardında altın çizgili, dikey düzgün kalaslardan ikinci bir duvar görünür | bt_gd_wall double | hit=ikinci | yavaş itme |
| 19 | Burgu bu kez taşa değil… boşluğa saplandı. | Yandan kesit: solda taş moloz, ortada kütük duvar ve kalas duvar, sağda karanlık boşluk; uzun bir burgu soldan iki duvarı deler, 'boşluğa'da ucu karanlığa girer ve italik 'boşluk' belirir | bt_gd_wall auger | hit=boşluğa | yavaş itme |
| 20 | İçeride, hiç çökmemiş bir oda vardı. **[Kütük oda]** | Bölüm kartı: altın 'III', ince çizgi, büyük ince 'Kütük oda', altında italik '2.700 yıl kapalı' | bt_chapter | – | yavaş itme |
| 21 | Oda, yaklaşık beş metreye altı metreydi. Duvarları çam ve ardıç kütükleriydi. | Önden açılmış mezar odası: arkada üst üste kütüklerden duvar, iki yanda perspektif yan duvarlar, üstte alçak çift eğimli çatı kendini çizer | bt_gd_room build | – | yavaş itme |
| 22 | Kuzey duvarın önünde, açık bir kütük tabutta bir adam yatıyordu. Kemiklere göre altmış ile altmış beş yaşları arasındaydı. | Işık havuzunda yandan açık bir kütük tabut, dört köşe ayağı; içinde ince, sakin kemik çizgileri, kafatası doğu (sağ) ucunda; arkada soluk kütük duvar; 'altmış'ta altta altın '60–65 yaş' | bt_gd_room coffin | hit=altmış | yavaş itme |
| 23 | Tabutun yanında, bir torba dolusu bronz iğne vardı. Mezardan toplam yüz seksen iki tane çıktı. | Solda ışık havuzunda tek, büyük kemerli bir Frig fibulası (bronz çengelli iğne, altın boğumlar) kendini çizer; 'seksen'de sağda altın sayı 0'dan 182'ye sayar, altında italik 'fibula' | bt_gd_fibula | hit=seksen | yavaş itme |
| 24 | Demir ayaklar üstünde üç dev bronz kazan. Yanlarında, tam yüz içki kâsesi. | Ortada demir üç ayak üstünde boğa başı tutamaklı dev bir bronz kazan çizilir; 'üç'te iki yanında soluk iki kazan daha belirir; altta italik '3 kazan · 100 kâse' | bt_gd_cauldron still | hit=kazan | yavaş itme |
| 25 | Dokuz ahşap masa vardı. Biri, ince kakmalarla işlenmiş bir şaheserdi. | Önden kakmalı ahşap bir masa: kalın tabla, iki sıra kare panel, içlerinde altın eşkenar dörtgen kakmalar yavaşça çizilir, kıvrık ayaklar; altta italik 'kakmalı masa' | bt_gd_table | – | yavaş itme |
| 26 | Ama altın yoktu. Ne bir taç, ne bir yüzük, ne bir altın kâse. | Işık havuzunda önce ince 'taç · yüzük · kâse', sonra altın renkte italik 'altın yok' | bt_text | c1=taç, c2=kâse | yavaş itme |
| 27 | Bu adam gerçekten Midas mıydı? | Gece, yıldızlar altında dev höyük; 'Midas'ta üstünde büyük, ince, altın bir soru işareti belirir | bt_gd_mound ask | hit=Midas | yavaş itme |
| 28 | Cevabı, odanın kütükleri verecekti. **[Ağaç halkaları]** | Bölüm kartı: altın 'IV', ince çizgi, büyük ince 'Ağaç halkaları', altında italik 'Kütüklerin tanıklığı' | bt_chapter | – | yavaş itme |
| 29 | Her ağaç, her yıl gövdesine bir halka ekler. Kurak yıllar ince, yağışlı yıllar kalın. | Işık havuzunda büyük bir kütük kesiti; yıllık halkalar merkezden dışarı doğru birer birer belirir, kimi ince kimi kalın | bt_gd_rings grow | – | yavaş itme |
| 30 | Halkalar, bir ağaç takvimiyle karşılaştırıldı. Kütükler, milattan önce 740 dolaylarında kesilmişti. | Aynı kütük kesiti; merkezden kabuğa altın bir ölçüm şeridi çizilir; '740'ta en dış halka altına döner, sağda büyük altın 'MÖ 740', altında italik 'kütükler kesildi' | bt_gd_rings date | hit=740 | yavaş itme |
| 31 | Oysa Asur kayıtları, milattan önce 709'da bile Muşkili Mita adında yaşayan bir kraldan söz eder. | Işık havuzunda çivi yazılı bir kil tablet; işaret sıraları çizilir, 'Mita'da ortadaki bir grup işaret altına döner, altta altın italik 'Muşkili Mita · MÖ 709' | bt_gd_tablet | hit=Mita | yavaş itme |
| 32 | Yani mezar Midas'ın değildi. Büyük olasılıkla babasının, belki de Gordias'ın mezarıydı. | Yatay zaman çizgisi (MÖ 760 → 690); sağda 'Mita / MÖ 709' işareti; 'mezar'da solda altın 'mezar / MÖ 740' işareti ve aralarında kesikli bir çizgi; 'Gordias'ta altında altın italik 'babası?' | bt_gd_years | a=mezar, b=Gordias | yavaş itme |
| 33 | Yıllar sonra, Patrick McGovern kapların dibindeki kalıntıları inceledi. | Ortadan kesilmiş bir küp: açık tonlu iç çeper, kalın dış çeper, dipte belirgin bir kalıntı kabuğu; 'kalıntıları'nda kabuktaki zerreler altın renkte yanar; altta italik 'kalıntı' | bt_gd_vessel | hit=kalıntıları | yavaş itme |
| 34 | Cenazede baharatlı bir güveç pişirilmişti. Bal, şarap ve zeytinyağıyla koyun ya da keçi eti, yanında mercimek. | Işık havuzunda tek bronz kazan, içinde altın renkli güveç yüzeyi; üstünden yavaş buhar telleri yükselir; altta italik 'güveç' | bt_gd_cauldron stew | hit=güveç | yavaş itme |
| 35 | Kâselerdeki içki ise tuhaftı: üzüm şarabı, arpa birası ve bal şarabı, tek bir karışımda. | Altta göbekli bir içki kâsesi; üstünde 'üzüm'de üzüm salkımı, 'arpa'da arpa başağı, 'bal'da petek belirir (italik 'şarap', 'bira', 'bal'), her birinden kâseye altın bir akış çizgisi iner | bt_gd_bowl mix | a=üzüm, b=arpa, c=bal | yavaş itme |
| 36 | Yaklaşık yüz kişi, kral için son kez içmişti. Ama o kral kimdi? | Solda on sıra onar küçük kâse birer birer belirip altına döner; sağda büyük altın sayı 0'dan 100'e, altında italik 'kâse' | bt_gd_bowl many | hit=kişi | yavaş itme |
| 37 | Cevabın bir ucu, ünlü bir düğümde saklıydı. **[Gordias'ın düğümü]** | Bölüm kartı: altın 'V', ince çizgi, büyük ince 'Gordias'ın düğümü', altında italik 'MÖ 333' | bt_chapter | – | yavaş itme |
| 38 | Milattan önce 333. Genç bir komutan Gordion'a geldi. Adı İskender'di. | Işık havuzunda büyük ince 'MÖ 333', sonra altın renkte italik 'İskender' | bt_text | c1=333, c2=İskender | yavaş itme |
| 39 | Kalede eski bir araba duruyordu. Rivayete göre Gordias'ındı ve oğlu Midas onu tanrılara adamıştı. | Soldan uzanan bir araba oku ile dikey boyunduruğun birleştiği yerde, iç içe dolanmış ilmeklerden bir düğüm yavaşça kendini çizer | bt_gd_knot knot | – | yavaş itme |
| 40 | Kehanete göre bu düğümü çözen, Asya'ya hükmedecekti. İskender onu kılıcıyla kesti. Bazı yazarlara göre ise çiviyi çekti. | Aynı düğüm; 'kesti'de çapraz bir kılıç çizgisi geçer, düğüm iki yarıya ayrılıp açılır; 'çiviyi'de okun ucundan altın bir çivi yavaşça dışarı kayar | bt_gd_knot cut | hit=kesti, pin=çiviyi | yavaş itme |
| 41 | Yani efsane bile bir baba ile oğlu anlatıyordu. Höyükteki adam, büyük olasılıkla o babaydı. | Işık havuzunda büyük ince 'Gordias', altında altın renkte italik 've oğlu Midas' | bt_text | c1=baba, c2=babaydı | yavaş itme |
| 42 | Ya altın? Cevap, tabutun içindeydi. Adamın üstündeki örtü, götit adlı bir toprak boyasıyla boyanmıştı. | Açık kütük tabut; üstüne serilmiş örtü vücudun şeklini alır (ayaklar alçak, göğüs, sağ uçta baş), ön kenardan sarkar, altından tabutun gövdesi ve iki ucundaki kütük kesitleri görünür; 'götit'te örtünün üstünde soldan sağa yavaş bir altın parıltı geçer, ince altın iplik çizgileri belirir; altta altın italik 'götit' | bt_gd_cloth | hit=götit | yavaş itme |
| 43 | Işıkta, altın gibi parlıyordu. Kral altın takmamıştı. Altın renkli bir örtünün altında yatıyordu. | Yakın plan: aynı örtülü tabut, örtünün altında baş ucu belli; altın parıltı yavaşça üstünden geçer, iplikler parlar | bt_gd_cloth | hit=altın | yakın (1.6) |
| 44 | Belki efsane buradan doğdu. Parlayan kumaşlardan ve yüzyıllar sonra yazılan hikâyelerden. | Altın kenar çizgili pelerinli kral büstü, üstünde ışık; 'kumaşlardan'da pelerininin üstünde altın kumaş kıvrımı çizgileri belirir | bt_gd_king gold | hit=kumaşlardan | yavaş itme |
| 45 | Asıl hazine altın değildi. Bir ziyafet, sessiz bir oda ve iki bin yedi yüz yıl dayanan ahşaptı. | Höyüğün kesiti: tabanda taş yığını, içinde küçük çatılı mezar odası ve minik açık tabut altın çizgiyle yavaşça yanar, yandan gelen kesikli tünel izi | bt_gd_section glow | – | yavaş itme |
| 46 | Gordion, 2023'te UNESCO Dünya Mirası oldu. Yeni açılan kraliyet mezarı ise belki bir gün, Midas'ın kendisine götürecek. | Şafakta bozkırda dev höyük; sağdan altın bir şafak ışığı yavaşça büyür; 'UNESCO'da altında 'UNESCO Dünya Mirası', italik '2023' | bt_gd_mound dawn | hit=UNESCO | yavaş itme |
| 47 | Sizce bu höyükler, Midas'ın kendi mezarını hâlâ saklıyor mu? Yorumlara yazın. Böyle sessiz hikâyeler için abone olun. | Gece, yavaşça nefes alan yıldızlar altında bozkırda dev höyük; sessiz | bt_gd_mound night | – | yavaş itme |

### Kapak
"MEZARDA / ALTIN YOKTU" (vurgu: ALTIN), sahne 43 (`bt_gd_cloth`, kompakt), t 5,5, `focus` [960, 590], zoom 1,3, Kaşif yok.
Tur 2 adayları: (a) götit örtülü tabut zoom 1,8 (ve "ALTIN DEĞİL / ALTIN ÖRTÜ" metni): tabut yatay, yazının üstüne biniyor;
(a') aynı tabut zoom 1,1 ve **1,3 — seçildi**: örtünün altındaki beden ve baş ucu, üstünden geçen altın parıltı ışık
havuzunda, küçükken net okunuyor, "altın yoktu" ile çelişen parıltı merak bırakıyor; (b) kafatası okunan tabut, baş ucuna
zoom 1,8: kafatası büyük ama kaburgalar tırtıl gibi, tabut yazıya biniyor; (c) büyütülmüş kesit odası zoom 1,6: hâlâ
"kulübe" gibi okunuyor. Not: motorun kapak büyütmesinde 1,8 yatay tabutu sağ yarıya sığdırmıyor, bu yüzden 1,3.

## Eleştiri günlüğü
### 01 — Ertuğrul Short
- Tur 1: Senaryo 6, Kanca 7, Okunabilirlik 9, Görsel 8, Hareket 6, Kompozisyon 7, Tema 8, Tempo 7, Doğruluk 7, Kapanış 7, Kapak+SEO 8.
  Sorunlar: kopuk altyazı cümleleri / 1985 gerilimi yok; sahne 0 neredeyse statik (0.8); sahne 2 kaya-gövde, sahne 5 köylü lekesi.
- Tur 2: Senaryo 8, Kanca 7, Okunabilirlik 8, Görsel 6, Hareket 7, Kompozisyon 8, Tema 8, Tempo 8, Doğruluk 8, Kapanış 8, Kapak 8.
  Sorunlar: sahne 7 görüntüsü cümleyle uyuşmuyor (215 erken); sahne 6 tehdit olmuş gibi anlatılıyor; sahne 2 kaya altyazıya giriyor.
- Tur 3 (son): Senaryo 8, Kanca 7, Okunabilirlik 8, Görsel 8, Hareket 7, Kompozisyon 8, Tema 8, Tempo 8, Doğruluk 8, Kapanış 8, Kapak+SEO 8. Kritik sorun yok.

### 02 — Gordion uzun
- Tur 1: Senaryo 8, Kanca 9, Okunabilirlik 8, Görsel 6, Hareket 8, Kompozisyon 7, Tema 8, Tempo 6, Doğruluk 8, Kapanış 8, Kapak 7.
  Sorunlar: Bölüm V konudan sapıyor (yangın tabakası); iskelet/küp/çöp adam kral okunmuyor; kapakta oda küçük.
- Tur 2: Senaryo 8, Kanca 8, Okunabilirlik 8, Görsel 7, Hareket 8, Kompozisyon 8, Tema 8, Tempo 7, Doğruluk 8, Kapanış 8, Kapak 7.
  Sorunlar: kapak aynı; soğuk açılış yumuşadı; örtü sahnesi ve iki metin kusuru.
- Tur 3 (son): Senaryo 8, Kanca 9, Okunabilirlik 8, Görsel 7, Hareket 8, Kompozisyon 8, Tema 8, Tempo 7, Doğruluk 8, Kapanış 8, Kapak 8.
- Yönetmen: kapak için ek olarak kazan (sahne 24) ve fener taraması (sahne 3) adayları denendi; kazan ızgara gibi, tarama
  boş okunuyor → götit örtülü tabut kapağı korundu.
