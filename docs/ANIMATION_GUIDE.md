# Animasyon rehberi (parşömen + Kaşif)

Kanalın **tek** görsel tarzı: sepya parşömen üstüne elle çizilmiş mürekkep ve çöp adam anlatıcı **Kaşif**
(`brand/kit/BRAND.md`). Her ajan, yeni sahne tipi yazmadan ya da senaryo kurmadan önce BRAND.md'yi ve bunu
okur. Amaç: farklı ajanların yazdığı sahneler aynı defterden çıkmış gibi görünsün. Eski "Studio" tarzı
(renk paletleri, 3D gezegen/küre/kafes, maskot ampul, Anton dev yazı, neon ışık) kaldırıldı; geri getirme.

## Görsel dil

- **Kâğıt + mürekkep.** Zemini motor çizer (parşömen dokusu, lekeler, vinyet: `parchment-theme.js`);
  sahneler şeffaftır, üstüne mürekkep çizer. Düz renk/gradyan zemin, parlak 3D, neon, emoji ikon yasak.
- **Renk:** sadece BRAND §3 token'ları: `THEME_PARCHMENT` (`paper`, `paperLight`, `paperDark`, `stain`,
  `ink`, `inkSoft`, `blue`, `red`, `gold`, `green`, `hat`, `hatBand`) ya da `_ink.js`'teki `INK`. Elle hex yazma.
- **Çizgi:** 5–7 px `ink`, yuvarlak uç; dolgu yok ya da `paperLight`. Her çizgi saniyede 8 kez "kaynar"
  (`boil()`, `inkPath()`, `inkLoop()`, `inkCircle()` — `shots/_ink.js`); sabit vektör görünümü yok.
- **Yazı:** başlık/dev yazı Fraunces 800–900, altyazı Lora 700 (motor), el yazısı etiket Patrick Hand
  (`INK_FONT`). En küçük yazı 1080 genişlikte 44 px. Bir sahnede en fazla 5 kelime sahne yazısı (altyazı hariç).
- **Kaşif** (`shots/kasif.js`, `KASIF.create()`): sahnelerin en az yarısında ve her seferinde bir eylem yapar
  (yürür, işaret eder, şaşırır, dürbünle bakar). Şapkasını asla çıkarmaz, ağzı sabittir. Dönem karakterleri
  aynı çöp adam stilinde ama şapkasız, tek aksesuarla (`accessory`).
- **Derinlik:** uzak plan (tepeler, şehir silüeti, `backdrop`), orta plan (karakterler, nesneler), ön plan
  (kırpılmış direk/halat, `depth.near`); yavaş kamera itmesi (`cam`) sırasında katmanlar farklı hızda kayar.
- **Gerçek fotoğraf/klip** (`photo`): sadece sepya, kâğıda basılmış gibi (kenarlar sayfaya karışır).

## Sahne tipleri

| Tip | Dosya | Ne için |
|---|---|---|
| `stage` | `shots/kasif.js` | Kaşif + dönem karakterleri + mürekkep nesneler (karar, eylem, şaşkınlık) |
| `map` | `shots/parchment2d.js` | eski harita: kıyılar (hazır `preset` ya da özel), şehir, kesikli rota, pusula |
| `timeline` | `shots/parchment2d.js` | tarih sırası (Shorts'ta dikey, uzunda yatay) |
| `board` | `shots/parchment2d.js` | karşılaştırma, kanıtlar, ✓/✗ listesi, çubuklar + hap rozet |
| `title` | `shots/parchment2d.js` | tek güçlü cümle/sayı, kelime kelime, vurgulu kelime kırmızı kutuda |
| `chapter` | `shots/parchment2d.js` | uzun videoda "BÖLÜM 2 / 5" kartı |
| `photo` | `shots/photo.js` | gerçek telifsiz fotoğraf/klip (yapay zekâ klibi yasak) |
| konuya özel | `shots/<tip>.js` | ör. `emu`, `petri`/`labbench`, `halic`, `portage`, `pirimap` |

Parametreler her dosyanın başındaki yorumda yazılıdır (`P: {...}`, `cues: ...`); oradan oku.

## Ekran düzeni (dikey 1080×1920)

| Bölge | y aralığı | Kullanım |
|---|---|---|
| Marka + kicker | 0–260, sol | `title` etiketi — sahne nesnesi koyma |
| Ana sahne | 260–1150 | asıl çizim, Kaşif, dev yazı |
| Altyazı şeridi | 1170–1320 | önemli detay koyma |
| Alt boşluk | 1320–1500 | zemin, ön plan dokusu (buğday, su, duvar) |
| YouTube arayüzü | > 1500 | hiçbir şey okunması gerekmesin |

Yatay (1920×1080, uzun video): altyazı altta (bottom ≈ 92 px), ana sahne 120–840.

## Hareket dili

- **Sürekli hareket:** her sahne her karede bir şeyi hareket ettirir (kaynayan çizgi tek başına yetmez:
  yürüyüş, nefes, kamera itmesi, rota çizimi, sayaç). `tools/preview.py` hareket ölçer; `motion < 1.5` →
  "STATIC?" uyarısı, düzelt.
- **Giriş:** `spring(lt, a, d)` ya da çizginin çizilerek belirmesi (`draw()`). Çıkış yok — geçişleri motor
  yapar (kâğıt kayması `slide`, yumuşak `fade`; elle `"transition": "slide|fade|cut"`).
- **Vurgu:** cue anında `punch(lt, cue(cues, 'hit'))` (≈ %6–12 büyüme) ya da Kaşif'in poz değişimi (`then`).
- **Zamanlama:** sahne başında 0–0,3 sn içinde ilk hareket; ana olay cue kelimesine bağlanır, süreye değil.
  Her 3–5 saniyede yeni bir görsel ödül.
- **Determinizm:** `Math.random`, `Date`, `performance.now` yasak. `rng(seed)`; her şey `lt`'nin saf
  fonksiyonu (geri sarınca aynı kare).

## Yeni sahne tipi yazma

Konuya özel tip gerekiyorsa **kendi dosyasında** yaz: `scenes/studio/shots/<tip>.js` (build.py bu
klasördeki tüm dosyaları otomatik yükler; böylece paralel ajanlar aynı dosyayı düzenlemez). Başka
ajanın tipini, `_ink.js`, `kasif.js`, `parchment2d.js`'i sadece genel bir yardımcıyı düzeltmek için değiştir.

```js
// <tip>: tek satırda ne gösterdiği (parşömen mürekkep stili, BRAND.md §5).
// P: {...parametreler ve varsayılanları}   cues: hit, ...
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.<tip> = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;          // ayrıca: defs, root, pal (THEME_PARCHMENT.pal)
      const C = THEME_PARCHMENT, portrait = H > W;
      const g = el(svg, 'g');
      // ... nesneleri bir kez kur; Kaşif: const k = KASIF.create(el(g, 'g'), {scale: 0.9, seed})
      return {
        update(lt, dur, cues) {
          const hit = punch(lt, cue(cues, 'hit', dur * 0.4));
          // ... çizgileri inkFrame(lt) ile kaynat, her şey lt'ye bağlı
          // k.update(lt, 'point', {x: W * 0.7, y: H * 0.6, face: -1, since: lt})
        },
      };
    },
  };
})();
```

Kurallar: parametrik yaz (aynı tip başka bir tarih anında da işe yarasın), varsayılanlar mantıklı olsun,
dikey ve yatayda düzeni ayrı ayarla (`H > W`), Türkçe sayıları `fmtNum()` ile bas, global isim sızdırma
(IIFE içinde yaz). Performans: tam ekran yarı saydam katman, `mix-blend-mode`, büyük `filter: blur` yok;
grup `opacity` yerine yol başına `fill-opacity` kullan (yazılım raster'ında şerit artefaktı).
Motor `kind: '3d'` (Three.js, sepya filtreli WebGL katmanı) desteğini hâlâ taşır ama hiçbir tip bunu
kullanmıyor; BRAND "parlak 3D" görünümü yasaklar, yeni tipi 2D mürekkep olarak yaz.

**Bitti sayılması için:** `tools/preview.py` ile en az 3 farklı anda (`--times`) kare al, bak; boş kare yok,
ekran dışına taşma yok, palet dışı renk yok, hareket ölçümü > 1.5, konsolda `page error` yok.
