# Suluboya (watercolor) tarzı — iki kanalın anayasası

**Kanal sahibinin kararı (2026-11-23):** "Tüm videolar https://github.com/lemomo-ai/lemo-opuscar reposu kullanılarak
üretilecek. Styles olarak watercolor stili kullan." **Düşün Bakalım** (Türkçe) ve **Stickstory** (İngilizce) artık aynı
tarzdadır: **belgesel ve tarih**, elle boyanmış bir suluboya defter sayfası. Konular **özgündür** (haber/manşetten konu
seçme kaldırıldı). **Kapaklar büyük, dikkat çeken yazılıdır. Altyazı her videoda kesin vardır.**

Senaryoda `"theme": "watercolor"` (lint ister; `tools/channels.py` → `theme`). Çelişkide bu dosya kazanır. Eski tarzlar
(`docs/BELGESEL.md`, `brand/kit/BRAND.md` parşömen + Kaşif) sadece geçmiş videolar içindir; onlardan hâlâ geçerli olanlar
§3'te yazılı. Eski `bt_*`, `stage`, `map`, `board`… sahne tipleri yeni videolarda kullanılmaz.

**Referans:** `docs/ornek/01-rumeli-hisari.json` (Düşün Bakalım Short, `sepya`) ve
`docs/ornek/ag-01-pharos-of-alexandria.json` (Stickstory Short, `yaz`): bütün sahne tiplerinin, ölçeklerin, cue'ların ve
kapağın çalışan örnekleri (yayınlanmaz).

## 1. Kaynak ve lisans

- Görsel dil Lemo-Opuscar'ın **Watercolor Brush** stilinden (`styles/watercolor/`) gelir. Fırça motoru (şerit + kuru
  fırça kılları, "flying white"), bitki şekilleri ve suluboya yıkama tekniği `scenes/studio/shots/wc__lib.js`'e taşındı
  (kod MIT lisanslı; dosyanın başında atıf var). Lemo-Opuscar'ın `.md` dokümanları CC BY-NC'dir: **kopyalanmaz**, bu
  dosya kendi sözlerimizle yazıldı. Lemo-Opuscar ile yaptığımız filmler bizimdir (ticari kullanım dahil, kredi gerekmez).
- Ekrandaki her şey **kodla boyanır**: yapay zekâ görsel/video aracı yok (Higgsfield vb. yasak, lint engeller). Gerçek
  belge/yer/eser için telifsiz fotoğraf (`photo`, `tools/media.py`) kullanılabilir.

## 2. Görsel dil

- **Kâğıt her şeyin altında:** sıcak, lifli pamuk kâğıdı (motor bir kez boyar: ton, yumuşak gürültü, lifler, gren,
  kenar gölgesi; `scenes/studio/watercolor-theme.js`). **Kâğıt beyazdır:** saf beyaz boya yok, ışık boyanmamış kâğıttır.
- **Her şey fırça darbesi:** değişken genişlikte yarı saydam şerit + kuruyan kıllar (flying white). Darbeler üst üste
  binince koyulaşır. Düz vektör kontur yok; bir formun kenarındaki koyu darbe tek "çizgi"dir. Geniş alanlar yıkamadır
  (birkaç geçişli, kenarı biriken suluboya lekesi).
- **Kendini boyar:** bir nesne ekrana girerken darbe darbe boyanır, önce yapı sonra ayrıntı (gövde → dal → yaprak; duvar
  → çatı → pencere). Ana hareket budur.
- **Not katmanı:** el yazısı notlar (Caveat), konuya uzanan ince kalem çizgisi (leader), küçük ölçü/tarih notları.
- **Renk:** sahne başına 3–5 pigment + mürekkep; **tek vurgu** (kırmızı/vermilyon) tekrar eden tek öğeye ayrılır
  (bir mühür, bir rota, kilit nesne). Renkler sadece token'lardan: `WC.C.*` / `THEME_PARCHMENT.*` (sabit hex yok).
- **Kâğıt setleri** (`scenes/studio/watercolor-themes.json`; `"palette"` ile seçilir, her video bir öncekinden farklı):
  `pamuk` (sıcak pamuk, genel), `keten` (soğuk keten: kuzey, kış, deniz), `sepya` (eskimiş: antik çağ, çöl, Osmanlı),
  `yaz` (parlak: Akdeniz, keşif), `gurub` (gül/mor alacakaranlık: trajedi, son).
- **Derinlik katmanla:** uzak (küçük, açık, soluk) → orta → ana → ön plan; katmanlar arasında kâğıt renginde sis.
- Hedef his: bir tarihçinin/doğabilimcinin suluboya defteri ya da resimli tarih kitabı. Çocuk kitabı değil, çizgi film
  değil, klip art değil.

## 3. Anlatım (iki kanal da belgesel)

- **Düşün Bakalım:** yavaş, alçak, merak uyandıran belgesel sesi; `docs/BELGESEL.md` §3 aynen geçerli (kısa ağır
  cümleler, sessizlik bırakan noktalama, enerjik YouTuber kalıbı yok, "-yor" ≤ 1/3, devrik cümle yok, kısaltma yok).
  Karakter: Shorts **330–420**, uzun **3.900–4.500** (ses yavaş; `"pace": "slow"`).
- **Stickstory:** sıcak, meraklı, net bir İngilizce **belgesel anlatıcısı** (BRAND.md §11'in dil kuralları geçerli:
  kısa cümleler, aktif fiiller, kısaltma yok, dolgu yok). İzleyiciye "you" diye seyrek ve doğal hitap edilebilir; aşırı
  heyecanlı YouTuber kalıpları ("guys", "insane", "smash that") yok. Karakter: Shorts **400–500**, uzun **4.300–5.000**.
- İki kanalda da: konu gerçek ve doğrulanabilir; selam/giriş yok; Shorts ilk cümlesi 3–8 kelime ve kapakla aynı fikir;
  uzun videoda soğuk açılış, 4–5 bölüm, her 45–60 sn'de bir kanca; Shorts sonunda punchline + tek doğal abone cümlesi.
  BRAND.md §1 (konu havuzu ve niş), §6.1, §6.3–3b, §6.6, §6.7, §6.12 geçerli.
- **Önce senaryo, sonra görüntü:** metin sahne düşünmeden tek parça yazılır, sesli okunur gibi kontrol edilir, sonra
  sahnelere bölünür.

## 4. Sahne tipleri (sadece `wc_*` ve `photo`)

| Tip | Ne için | Ana parametreler |
|---|---|---|
| `wc_scene` | Genel boyanmış sahne: bir yer, bir an, bir olay | `sky`, `land`, `items`, `notes`, `fire`, `smoke`, `weather`, `birds`, `mist` |
| `wc_map` | Yer, rota, imparatorluk sınırı, yayılma | `region`, `places`, `routes`, `areas`, `labels`, `seas`, `zoom` |
| `wc_specimen` | Tek nesne büyük: kanıt, eser, silah, alet (müze levhası) | `g`, `o`, `notes`, `title` |
| `wc_number` | Tek büyük sayı/tarih | `value`, `label`, `unit` |
| `wc_timeline` | Sıra, tarihler | `items`, `highlight` |
| `wc_letter` | Mektup, ferman, kitabe, günlük, alıntı | `lines`, `sign`, `style` |
| `wc_chapter` | Uzun videoda bölüm kartı (ilk sahne olamaz) | `num`, `title`, `sub`, `g` |
| `wc_title` | Açılış/kapanış başlık kartı | `text`, `sub` |
| `photo` | Gerçek belge, harita, eser, yer fotoğrafı (sıcak baskı, el yazısı not) | `src`, `credit`, `kb` |
| `wc_<konu>` | Hiçbiri olmuyorsa: konuya özel yeni tip (kendi dosyasında, §9) | — |

Her tipin parametreleri dosyasının başındaki yorumda yazılıdır (`scenes/studio/shots/wc_*.js`). `wc_scene` parametreleri
`wc__lib.js`'in sonunda.

**`wc_scene` hızlı rehber:**
- `sky`: `day` · `dawn` · `dusk` · `night` (ay boyanmamış kâğıt, yıldızlar) · `storm` · `fog` · `none`.
- `land`: `hills` · `mountains` (`snowcaps`) · `plain` · `desert` · `sea` · `coast` (`coast: "left"|"right"` denizin
  yeri) · `snow` · `river` · `city` · `interior` (`wall`, `floor`) · `none`. `horizon`: ufuk çizgisi (0–1).
- `items`: `{"g": "<nesne>", "x": 0..1, "layer": "far|mid|main|fg", "s": ölçek, "o": {seçenekler}, "flip": true,
  "at": saniye|cue|-1, "move": {"to": [x, y], "at", "dur"}}`. Dikey videoda nesneler otomatik büyür (`scale`, 1,45).
- `notes`: `{"text", "x", "y", "ax", "ay", "at"}` (`ax/ay` verilirse kalem çizgisiyle işaret eder; `"color": "red"`).
- Canlı öğeler: `fire`, `smoke`, `birds`, `weather` (`rain`, `storm`, `snow`, `fog`), denizde ışıltı ve sallanan gemiler.
- `paint: true` sahnenin arka planını fırça kenarıyla boyayarak açar (bölüm başı, yeni yer); `mist` sahneyi kâğıda geri
  yıkar (bir şeyin yok oluşu, zaman geçişi, son).

**Nesne kütüphanesi (`WC.G`, 125 nesne; seçenekleri `python tools/wc_catalog.py [ad]` gösterir):**
- **Doğa** (`wc__lib.js`): tree, cypress, pine, palm, shrub, grass, reeds, rock, cloud.
- **Mimari** (`wc_g_places.js`): house (`style` ottoman/anatolian/european/ancient/modern), tower, wall, castle
  (medieval / ottoman = Rumeli Hisarı benzeri), dome (türbe), mosque (`minarets` 0–6), minaret, church (byzantine =
  Ayasofya benzeri / gothic / chapel), temple, column, ruin, pyramid, ziggurat, arch, bridge (roman/ottoman/wood),
  lighthouse (stone / pharos), windmill, tent (military/yurt/bedouin), hut, palace (ottoman = Topkapı benzeri / european),
  factory, skyline (ottoman/medieval/ancient/modern: uzak katmanda bütün bir şehir) ve iç mekân: window, door, table,
  chair, throne, shelf.
- **İnsanlar ve hayvanlar** (`wc_g_people.js`): person (`pose` 13 duruş, `dress` peasant/robe/ottoman/janissary/soldier/
  roman/knight/sailor/noble/modern/worker/woman/child, `hold` spear/sword/flag/staff/torch/lantern/book/oar/rifle),
  crowd, army (`dress`, `banner`, `weapon`), rider, horse, camel, ox, cart (kağnı/araba), dog, elephant, eagle, cattle, sheep.
- **Deniz, hava, felaket** (`wc_g_sea.js`): galley (ottoman kadırga / venetian), carrack, caravel, frigate, steamship
  (liner/cargo/paddle/warship), rowboat, raft, sailboat, submarine — hepsinde `damage`, `burning`, `sink` (batma), `flag`;
  wave, iceberg, island, whale, volcano (`erupt`), lightning, explosion, cannon_smoke, burning (yangın şeridi),
  tornado, flood (yükselen sel), quake_crack (deprem yarığı).
- **Eşyalar** (`wc_g_objects.js`; `wc_specimen` için kahraman, `wc_scene`'de dekor): sword (kilij/scimitar/gladius/
  longsword/katana), shield, helmet (ottoman/corinthian/roman/viking/knight), crown, coin, scroll, book, letter, quill,
  hourglass, candle, oil_lamp, lantern, key, chest, amphora, vase (iznik/greek), jar, cup (goblet / tulip çay bardağı),
  bread (loaf/simit), skull, bone, cannon (field/bombard), cannonball, musket, pistol, bow, arrow, spear, flag, compass,
  telescope, astrolabe, clock, pocket_watch, map_scroll, anchor, bell, tablet (clay/stone), statue, shard, gold_bar,
  gem, medal, rope, barrel, crate, wheel, bottle, apple, egg, feather, mask, ring. Her eşyanın `parts` noktaları var
  (`wc_specimen` notları `"part": "yelman"` ile o noktayı gösterir).

**Ölçek (önemli):** `s` 1 doğal boydur (insan ≈ 170 px, ev ≈ 220 px, gemi ≈ 320 px). Dikey Short'ta `wc_scene` nesneleri
zaten 1,45 kat büyütür ama **kahraman özne için `s` 1,4–2,5** verilir (telefonda tek net özne); 16:9'da kahraman gemi/bina
`s` 1,3–1,8. Uzak plan (`layer: "far"`) küçük kalır. Nesneler y'ye göre sıralanır; birini öne almak için `dy`.
`cues` bir sözlüktür (`"cues": {"hit": "battı"}`), liste değil.

**Ritim:** mekân (`wc_scene`) → ayrıntı (`wc_specimen` ya da yakın plan) → bilgi (`wc_map`/`wc_number`/`wc_timeline`)
dönüşümlü. `wc_scene` üst üste en fazla 3; ardışık iki sahne aynı gökyüzü + zemin + nesnelerle tekrar etmez (lint).
Shorts'ta en az 3 farklı tip; tek tip ≤ %70.

## 5. Hareket, kamera, geçiş

- Hareket yavaş ve doğaldır: kendini boyayan darbeler, rüzgârda hafif salınan ağaç/çimen, alev, duman, yağmur, kar,
  dalgada sallanan gemi, ilerleyen bir ordu, büyüyen bir rota. Zıplama, titreşim, punch yok.
- Kamera: sahne boyunca tek, çok yavaş yaklaşma (motor). Yakın plan: `"camera": {"focus": [x, y], "zoom": 1.6–2.2}`
  ya da nesneyi büyük boyamak (`s`, `wc_specimen`). Zoom 2,4'ü geçmez (fırça dokusu bulanıklaşır).
- Geçiş otomatik: sahneler arası **fırça kenarlı silme** (`wipe`: yeni resim soldan sağa dalgalı bir kenarla eskinin
  üstüne boyanır); bölüm başında kâğıda yıkanıp yeniden açılma (`dip`). Elle `"transition": "dissolve"|"cut"` olur.

## 6. Kadraj

- Sahne başına **tek kahraman özne** + notu; bol kâğıt boşluğu; notlar özneyi kapatmaz.
- **Dikey (Shorts 1080×1920):** özne y ≈ 200–1150; altyazı bandı y ≈ 1170–1320; y > 1500 ve sağ kenar YouTube
  arayüzünün altında kalır (önemli ayrıntı yok; zemin ve ön plan devam eder, boş bırakılmaz).
- **Yatay (uzun 1920×1080):** altyazı altta (y > 960); sol üstte sadece bölümün ilk saniyelerinde bölüm etiketi
  ("02 / 05" + bölüm adı) görünür, sonra boş.
- Ekranda yazı az: sahne başına en fazla 5 kelime not/etiket; asıl bilgiyi ses taşır.

## 7. Kapak (tıklanma oranını belirler)

Örnek: büyük, kalın, yuvarlak büyük harfler, açık kâğıt renginde dolgu, kalın mürekkep kontur ve sert gölge; **tek
kelime kehribar sarısında** ("**5** TÜR VARDI"). Yazı üstte, altında tek net özne. Çerçeve yok, sunucu yok.

```json
"cover": {"lines": ["5 tür", "vardı"], "highlight": ["5"], "scene": 3, "t": 2.2, "focus": [960, 600], "zoom": 1.4}
```
- `lines` 1–3 satır, toplam **2–4 kelime**; başlığı tekrar etmeyen, merak patlatan iddia. `highlight` tek kelime.
- `scene` + `t`: en dramatik, **tam boyanmış** an (yarım boyanmış kare değil). `focus` [x, y] (sahne pikseli): kapağın
  gösterdiği tek özne, yazının altına büyütülür (`zoom`, varsayılan uzun 1,6 / Shorts 1,25); `"side": "left"|"right"`
  özneyi yana kaydırır. Uzun videoda `focus` önerilir (lint uyarır).
- Shorts kapağı aynı zamanda ilk 2 saniyenin kancasıdır (ilk cümle bitene kadar ekranda).
- Her video için **en az 3 kapak adayı** (farklı sahne/an/metin) dene, telefonda küçükken en iyi okunanı seç.

## 8. Altyazı (her videoda, kesin)

- `"subtitles": true` zorunlu (lint). Motor kelime zamanlamasıyla bir seferde tek ifade gösterir: kalın serif
  (Cormorant Garamond 700), mürekkep renginde, kâğıt renginde yumuşak hale ile; kutusuz ama her zeminde okunur.
  Dikeyde 72 px (y ≈ 1176), yatayda 58 px (altta). En fazla iki dengeli satır.
- Cue kelimeleri vurgu renginde (kırmızı) yanar. Sayılar seste yazıyla okunur, ekranda rakamla yazılır.

## 9. Yeni sahne tipi (`wc_<konu>.js`)

Hiçbir tip ve nesne bir anı birebir gösteremiyorsa yazar kendi dosyasına yeni tip ya da nesne yazar:

```js
// wc_<konu>: <ne gösterir>. params: {...}
SHOTS.wc_konu_an = { kind: '2d', build(ctx) {
  const X = WC.canvas(ctx), { W, H, P } = ctx;
  const ship = WC.make('galley', 1.4, { style: 'ottoman' }, 3);          // kütüphane nesnesi (önbellekli sprite)
  const back = WC.withSeed(ctx.seed, () => WC.backdrop(W, H, H * .7, { sky: 'dusk', land: 'sea' }));
  return { update(lt, dur, cues) {
    X.clear(); X.drawImage(back, 0, 0);
    WC.drawObj(X, ship, W * WC.mix(.2, .6, WC.eio(lt / dur)), H * .7, WC.seg(lt, .2, 1.4));   // boyanarak girer, ilerler
    WC.note(X, lt, WC.timeOf('hit', cues, 1.5), W * .5, H * .6, W * .6, H * .4, 'kadırga');
  } };
} };
// yeni nesne: WC.G.<ad> = (sc, o = {}) => ({ S: [WC.mk(...), WC.washShape(...), ...] })
```
Kurallar: deterministik (`Math.random` yok; `WC.withSeed`/`WC.rnd`/`WC.hash`), renkler token'dan, pahalı şeyler bir kez
(`WC.make`, `WC.backdrop` sprite/tuval önbelleği), ortak dosyalara (`wc__lib.js`, `engine.js`, `watercolor-theme.js`,
`wc_g_*.js`, `wc_map.js`, `wc_cards.js`, `wc_specimen.js`) paralel ajan dokunmaz.

## 10. Ses

- Sesler değişmez (Düşün Bakalım `mF7tIc9VLrznhGooGjaT`, Stickstory `2t85BBUECtLLKQzxLD95`, `eleven_v3`); `tts.settings`,
  `pacing`, `max_pause`, `tone` yok. **Ses işlenmez** (nefes kısma/kırpma yok).
- Ambiyans: sıcak, yavaş bir ped + seyrek yumuşak piyano notaları (`tools/sfx.py` `paper_bed`), çok kısık. Efekt sesi
  (whoosh, pop) yok. `"sfx": false` kapatır.

## 11. Kontrol listesi

- [ ] `"theme": "watercolor"`, `"palette"` bir önceki videodan farklı, sadece `wc_*`/`photo`, `"subtitles": true`.
- [ ] Her sahnenin görseli o an söyleneni birebir gösteriyor; tek kahraman özne; kadraj güvenli bölgelerde.
- [ ] `sheet.png`: yarım boyanmış/boş kare yok (ikinci kare tam boyanmış), yazı taşması yok, altyazı her karede okunuyor.
- [ ] Ardışık sahneler farklı görünüyor (yer, gün saati, plan büyüklüğü, tip).
- [ ] `cover.jpg`: 2–4 kelime, tek kelime kehribar, yazı kontura değmeden okunuyor, altında tek net özne; 3 aday denendi.
- [ ] `tools/lint.py` hatasız; kaynaklar (`sources`) gerçek sayfalar.
