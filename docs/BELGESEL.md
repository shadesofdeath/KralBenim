# Belgesel tarzı (deneme, kanal sahibinin isteği 2026-10-29)

Düşün Bakalım için yeni anlatım ve görüntü dili. Senaryoda `"theme": "belgesel"` ile açılır; parşömen tarzı
(`"theme": "parchment"`, BRAND.md) olduğu gibi durur, Stickstory hiç etkilenmez. Kanal sahibi beğenirse varsayılan olur.

## Kanal sahibinin 6 maddesi ve karşılığı

| İstek | Uygulama |
|---|---|
| 1. Öğeler eski çizgi film gibi sağa sola oynamasın, sabit ve net olsun | Çizgi titreşimi (boil) yok (`window.INK_STILL`), kâğıt kayması yok, kamera sadece çok yavaş tek bir itme (%3–4), vurguda zıplama/punch yok, geçişler yumuşak çözülme (`dissolve`), bölüm başında karanlıktan geçiş (`dip`). Hareket sadece doğal ve yavaş: alev, buhar, su, yıldız, yavaş çizilen çizgi. |
| 2. Yavaş, hafif ürkütücü, merak uyandıran anlatım (uzay belgeselleri gibi) | Ses `mF7tIc9VLrznhGooGjaT` (eleven_v3). Metin: kısa ve uzun cümleler, sessizlik bırakan noktalama, karanlık/sessizlik/zaman imgeleri, "siz" seyrek ve sakin. Ambiyans: koyu, yavaş bir drone (`tools/sfx.py drone`). |
| 3. Ses kırpması ve nefes efekti olmasın | `debreath` (aralardaki sesi kısma) bu tarzda kapalı; ses ElevenLabs'tan nasıl gelirse öyle. |
| 4. Sol üstte başlık ve kanal adı olmasın | Kicker, kaynak notu, kanal adı ve ilerleme çubuğu çizilmez. Kaynaklar açıklamada kalır. |
| 5. Gereksiz süsleme yok, izleyici anlatıma odaklansın | Sahne başına tek nesne ya da tek mekân; ince çizgi, bol boşluk, tek vurgu rengi. Kaşif, dekorlar (`set`), lekeler, el yazısı notlar yok. Altyazı tek satır, sakin, kutusuz. |
| 6. Hep aynı tasarım/renk/tema olmasın | `scenes/studio/belgesel-themes.json`: koyu (obsidyen, derin, grafit) ve açık (fildişi, kum) temalar; `build.py` her videoya dosya adına göre birini seçer, `"palette"` ile elle seçilir. Konuya göre: tarih öncesi → obsidyen (ateş ışığı), deniz/uzay → derin, müze/eser → fildişi. |

## Sahne tipleri (`scenes/studio/shots/bt_*.js`)

`bt__lib.js` ortak çizim seti (`BTL.OBJ`: bonespoon, hands, shell, snail, woodspoon, steelspoon, pot, bowl, legbone,
antlerspoon, egyptspoon, romanspoon, egg, diamond, stone; `BTL.person` siluetler). Tipler: `bt_chapter`, `bt_text`,
`bt_word`, `bt_clock`, `bt_count`, `bt_map` (tipografi/veri), `bt_object`, `bt_relic` (müze kaidesi), `bt_compare`,
`bt_trade`, `bt_lineup`, `bt_grid`, `bt_egg` (nesne), `bt_grave`, `bt_shore`, `bt_dive`, `bt_figure`, `bt_fire`,
`bt_stones`, `bt_dip`, `bt_field`, `bt_village` (mekân). Parametreler dosya başlarında. Yeni konu için yeni nesne
`BTL.OBJ`'a, yeni mekân kendi dosyasına eklenir. Renkler sadece token'lardan (`THEME_PARCHMENT.*`).

## Lint farkları

`theme: belgesel` → Kaşif, `set`, yakın plan sayısı, ekran kaynak notu kuralları uygulanmaz; ses `mF7tIc9VLrznhGooGjaT`.
Diğer her şey (SEO, kaynak listesi, bölümler, soğuk açılış, -yor oranı, kapak) aynen geçerli.
