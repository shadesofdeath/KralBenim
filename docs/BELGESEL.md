# Düşün Bakalım — belgesel tarzı (anayasa)

**Kanal sahibinin kararı (2026-10-29, "Bu tarza bayıldım… artık bütün video üretimleri böyle olsun"):** Düşün Bakalım'ın
**bütün videoları**, uzun ve Shorts, bu tarzda ve bu sesle üretilir. Senaryoda `"theme": "belgesel"` (lint ister;
`tools/channels.py` → `theme`). Parşömen + Kaşif tarzı (`brand/kit/BRAND.md`) artık sadece **Stickstory**'nindir.
Düşün Bakalım için BRAND.md'den hâlâ geçerli olanlar: §1 kimlik/niş/konu havuzu, §6.1 selam yok, §6.3–3b (-yor
oranı, devrik cümle yok), §6.6 doğruluk, §6.7 kapanış, §6.12 kaynaklar listesi. Çelişkide bu dosya kazanır.
Referans video: `videos/2026-10-29/04-ilk-kasik.json` (uzun, obsidyen tema).

## 1. Kanal sahibinin 6 maddesi (değişmez)

1. **Sabit ve net:** ekrandaki hiçbir şey eski çizgi film gibi sağa sola oynamaz. Çizgiler titreşmez (boil yok),
   kâğıt kaymaz, kamera sağa sola gezmez; sahne boyunca tek, çok yavaş bir yaklaşma (%3–4). Vurguda zıplama/punch yok.
   Hareket sadece doğal ve yavaş: alev, buhar, su, yıldız, kendini çizen çizgi, yavaş batan/yükselen bir şey.
2. **Yavaş, hafif ürkütücü, merak uyandıran anlatım** (uzay belgeselleri gibi). Bkz. §3.
3. **Ses işlenmez:** nefes kısma (`debreath`), kırpma, sessizlik ekleme/kesme yok. Ses ElevenLabs'tan nasıl gelirse öyle.
4. **Sol üst boş:** başlık (kicker), kanal adı, ekranda kaynak notu, ilerleme çubuğu yok.
5. **Gereksiz süs yok:** sahne başına tek nesne ya da tek mekân, bol boşluk, ince çizgi, tek vurgu rengi.
   Kaşif, dekorlar (`set`), lekeler, el yazısı notlar, emoji yok. İzleyici anlatıma odaklanır.
6. **Her video farklı görünür:** tema (renk) videodan videoya değişir, sahne kompozisyonları konuya göre yeniden çizilir.

## 2. Ses ve teknik alanlar

- Ses `mF7tIc9VLrznhGooGjaT` (eleven_v3), hiç değişmez; `tts.settings`, `pacing`, `max_pause`, `tone` yok.
- Senaryo: `"engine": "studio"`, `"theme": "belgesel"`, `"palette": "<tema>"`, `"format"`, `"fps": 30`,
  `"subtitles": true`, `"channel": "Düşün Bakalım"`, `"narrator": "kasif"` (sadece kanal anahtarı; ekranda Kaşif yok),
  `"lang": "tr"`, `"tts": {"provider": "elevenlabs", "voice_id": "mF7tIc9VLrznhGooGjaT", "model": "eleven_v3"}`.
- Ambiyans: koyu, yavaş bir drone (`tools/sfx.py` `drone`), çok kısık. Efekt sesi yok. `"sfx": false` kapatır.
- Altyazı: tek satır, kutusuz, sakin (bütün cümle parçası birlikte yumuşakça belirir); cue kelimeleri vurgu renginde.
- Geçişler otomatik: sahneler arası yavaş çözülme (`dissolve`), bölüm başında karanlıktan geçiş (`dip`).

## 3. Anlatım (BRAND §6.0'daki "heyecanlı YouTuber" yerine)

Anlatıcı bir belgesel sesidir: sakin, alçak, emin, biraz gizemli. Acele etmez; izleyiciyi bir sırrın içine çeker.

- **Ritim:** kısa, ağır cümleler + arada bir akan uzun cümle. Noktalama tonlamayı ve sessizliği taşır: nokta bolca,
  "…" sadece bir açıklamadan hemen önce (sahne başına en fazla bir). Ünlem neredeyse hiç yok.
- **Ton:** karanlık, zaman, sessizlik, ölçek imgeleri ("Yüz bin yıl önce. Karanlık bir kıyı."). Ürkütücülük abartı ya da
  korku değil; derin zamanın ve bilinmeyenin ağırlığı. "Peki", "inanılmaz", "hemen anlatayım", "hadi" gibi enerjik
  YouTuber kalıpları yok. İzleyiciye "siz" diye arada bir, sakin hitap ("Bir an düşünün.").
- **Yapı:** cevap bekletilir, ipuçları sırayla açılır; her 45–60 saniyede yeni bir soru ya da sessiz bir dönüş
  ("Ama asıl kanıt toprağın altındaydı."). Görüntüyü tarif etme; görüntünün söyleyemediğini söyle.
- Geçmiş zaman ağırlıklı (-dı, -mış, -ecekti); cümlelerin en fazla üçte biri "-yor" ile biter, devrik cümle yok (lint).
- Tartışmalı bilgi "büyük olasılıkla", "rivayete göre" ile verilir; doğrulanmamış sayı/iddia yazılmaz.
- **Shorts:** ilk cümle 3–8 kelime, en çarpıcı an, kapak yazısıyla aynı fikir (ör. "Bu kaşık bir mezardan çıktı."), sakin
  ama kesin. Sonda tam bir punchline + tek kısa, doğal abone cümlesi nedeniyle ("Böyle sessiz hikâyeler için abone
  olun."). 28–35 sn, 8–11 sahne. Shorts da yavaş tondadır ama boşluk bırakmaz: 2–4 sn'de bir yeni görüntü.
- **Uzun:** soğuk açılış (olayın en dramatik/ürkütücü anı + videonun cevaplayacağı soru), 4–5 bölüm, her bölüm bir
  sonrakine çeken bir cümleyle biter, sonda tek yorum sorusu + abone çağrısı. 5–6 dk.
- **Karakter:** yavaş ses dakikada daha az karakter okur. Uzunda **3.900–4.500** karakter (≈ 5–6 dk), Shorts'ta
  **330–420** karakter (≈ 30 sn). Ölçü: 4.355 karakter = 5:23 (04-ilk-kasik).

## 4. Görüntü dili

- **Zemin:** temanın düz, temiz zemini + yumuşak orta ışık + kenar karartması + ince durağan film greni (motor çizer,
  `scenes/studio/belgesel-theme.js`). Sahneler bunun üstüne çizer.
- **Çizgi:** 2–4 px, yuvarlak uç, temanın `ink` rengi; yüzeyler `paperLight`; ikincil çizgi `inkSoft`; tek vurgu `gold`;
  ışık havuzu `stain` (`BTL.glow`). Renkler sadece token'lardan (`THEME_PARCHMENT.*` / `BTL.C`), sabit hex yok.
  Koyu temada parlak şeyler (ay, yıldız, alev çekirdeği) `ink` ile çizilir, `paperLight` ile değil.
- **Kompozisyon:** tek özne, merkezde ya da üçte bir çizgisinde, etrafında boşluk. Nesne sahneleri müze/belgesel
  grafiği gibi temiz; mekân sahneleri siluet + ışık. İnsanlar yüzsüz siluet (`BTL.person`); kanlı/ürkütücü görüntü yok,
  ölüm saygıyla ve soyut (ör. mezar kesitinde ince kemik çizgileri).
- **Yazı:** Fraunces (başlık, sayı, kelime; 300–700), Lora italik (etiket, açıklama). Patrick Hand yok. Sahnede en
  fazla 5 kelime; en küçük yazı 40 px (yatay) / 44 px (dikey).
- **Hareket:** girişte çizginin kendini çizmesi (`D.reveal`), yavaş solma; cue anında yeni öğe belirir. Her sahnede
  sürekli ama yavaş bir şey olur; preview `motion` eşiği 0,3 (donmuş kare uyarısı).
- **Kamera:** varsayılan sahne boyunca yavaş itme. Yakın plan gerekiyorsa `"camera": {"focus": [x, y], "zoom": 1.6–2}`
  (sadece yaklaşma; sağa sola kayma yok). `"camera": false` tamamen sabit.
- **Gerçek fotoğraf** (`photo`): müzedeki gerçek eser/belge/yer için; motor siyah-beyaz, yumuşak kenarlı basar.

## 5. Temalar (`scenes/studio/belgesel-themes.json`)

| Tema | Görünüm | Konu |
|---|---|---|
| `obsidyen` | sıcak siyah, kemik beyazı, ateş ışığı | tarih öncesi, mağara, ateş, gece, mezar |
| `derin` | lacivert-siyah, buz beyazı, soğuk mavi | deniz, gemi, uzay, kutup, kayıp keşif |
| `grafit` | gri-siyah, gümüş, soluk altın | savaş, sanayi, şehir, modern tarih |
| `fildisi` | açık fildişi, grafit mürekkep, kiremit | müze eseri, belge, saray, sanat |
| `kum` | açık kum, kahve mürekkep, pas | çöl, antik kent, Anadolu, ticaret yolları |

Yazar konuya uyan temayı `"palette"` ile seçer; **bir önceki Düşün Bakalım videosuyla aynı tema olmaz** (lint `palette`
yoksa uyarır). Yeni tema eklenebilir: aynı token rolleri, aynı kontrast, `"dark": true|false`.

## 6. Sahne tipleri (`scenes/studio/shots/bt_*.js`)

Ortak kit `bt__lib.js` (`BTL`): `drawing()` (strok + dolgu, `reveal(p)` ile çizilir), `glow()`, `stars()`, `person()`
(stand, bend, kneel, sit, dive), `stage()` (mekânı dikey Short'a çerçeveler), `fit()` (yazıyı sığdırır) ve nesne
kütüphanesi `BTL.OBJ` (bonespoon, hands, shell, snail, woodspoon, steelspoon, pot, bowl, legbone, antlerspoon,
egyptspoon, romanspoon, egg, diamond, stone). Parametreler dosya başındaki yorumlarda.

| Ne anlatılıyor | Tip |
|---|---|
| Bölüm açılışı (uzun) | `bt_chapter` (Roma rakamı, ince çizgi, başlık, alt yazı) |
| Tek güçlü kelime/soru | `bt_text` |
| Kelimenin kökü | `bt_word` |
| Süre, sayı, oran | `bt_clock`, `bt_count` |
| Yer | `bt_map` (sade kıyı çizgileri, yanıp sönen nokta, rota) |
| Tek nesne | `bt_object` (yüzen çizim + etiket), `bt_relic` (müze kaidesi + spot + etiket) |
| İki çeşit / takas / dizi | `bt_compare`, `bt_trade`, `bt_lineup`, `bt_grid` |
| Mekân / atmosfer | `bt_grave`, `bt_shore`, `bt_dive`, `bt_figure`, `bt_fire`, `bt_stones`, `bt_dip`, `bt_field`, `bt_village`, `bt_egg` |
| Gerçek eser/belge | `photo` |

Belgesel videoda sadece `bt_*` ve `photo` kullanılır (lint). Konunun ihtiyacı olan nesne ya da mekân yoksa **yazar ajan
yeni tip yazar**: yeni nesne `BTL.OBJ`'a değil, kendi dosyasına (`scenes/studio/shots/bt_<konu>.js`, paralel ajanlar ortak
dosyaya dokunmaz); kendi `BTL.drawing` çizimini ya da yeni `SH.bt_<ad>` tipini tanımlar. Kurallar:

```js
// bt_<ad>: tek satırda ne gösterdiği. P: {...}  cues: ...
(() => {
  const SH = window.SHOTS || (window.SHOTS = {}), C = THEME_PARCHMENT;
  SH.bt_<ad> = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });   // mekân: 1920x1080 sahnede çiz, Short'ta fx etrafında büyür
      // nesne/tipografi sahnesi: const portrait = H > W; yerleşimi dikey için ayrıca kur (alt alta, y ≈ 300–1000)
      const D = BTL.drawing(el(g, 'g', { transform: 'translate(960 480)' }));
      D.f('M…Z', C.paperLight, 1); D.s('M…Z', { w: 4 });   // önce dolgular, sonra çizgiler
      return { update(lt, dur, cues) { D.reveal(BTL.ease(lt, 0, 2)); } };
    },
  };
})();
```

- Deterministik: `Math.random`/`Date` yok, her şey `lt`'nin fonksiyonu. Titreşim yok (`boil` belgeselde kapalıdır).
- Yatay 1920×1080: özne y ≈ 300–800, altyazı y ≈ 960–1040'ta; dikey 1080×1920: özne y ≈ 250–1100, altyazı y ≈ 1190–1300,
  y > 1500 YouTube arayüzü. Zemin dolguları 1080'in altına (y 1800'e) uzatılır ki dikeyde alt boş kalmasın.
- Performans: tam ekran yarı saydam katman, `mix-blend-mode`, büyük blur yok; ışık için tek `BTL.glow`.
- Bitti sayılması: `tools/preview.py` ile kontak sayfası + en az 3 an (`--times`), kendi gözünle bak.

## 7. Kapak

- Belgesel kapağı: temanın zemini, solda (uzun) / üstte (Shorts) Fraunces 700 büyük harf yazı, **2–4 kelime**, tek kelime
  `highlight` ile vurgu renginde (kutu yok); sağda (uzun) / altta (Shorts) **tek özne** ışık havuzunun içinde. Kaşif yok,
  çerçeve yok (motor bu tarzda koymaz). `"kasif": false` yazılır.
- En dramatik ve gizemli an: mezar kesiti, karanlıkta parlayan nesne, tek siluet. Kalabalık sahne değil. Uzunda `focus`
  zorunlu (lint), `zoom` 1,1–1,4. Yazı başlığı tekrar etmez, merak bırakır ("MEZARDAKİ KAŞIK").
- Her video için en az 3 aday, `cover.jpg`'leri karşılaştır, telefonda küçükken okunanı seç.

## 8. Kontrol listesi

- [ ] `"theme": "belgesel"`, konuya uyan ve bir öncekinden farklı `"palette"`, ses `mF7tIc9VLrznhGooGjaT`
- [ ] Sol üst boş, Kaşif yok, titreyen/sallanan öğe yok, sahneler sadece `bt_*`/`photo`
- [ ] Anlatım yavaş ve gizemli, enerjik YouTuber kalıbı yok, devrik cümle yok, -yor ≤ 1/3
- [ ] Her sahnede tek özne, yazı altyazıya ve kadraj dışına taşmıyor (dikeyde de)
- [ ] Bilgiler doğrulanmış, `sources` ≥ 2 (Shorts) / ≥ 3 (uzun)
- [ ] `lint` hatasız, `sheet.png` ve `cover.jpg` kendi gözünle görüldü
