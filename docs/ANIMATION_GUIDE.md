# Animasyon rehberi (Studio motoru)

Her ajan, yeni sahne tipi yazmadan ya da senaryo kurmadan önce bunu okur. Amaç: farklı ajanların
yazdığı sahneler aynı filmden çıkmış gibi görünsün.

## Görsel dil

- **Tam ekran sahne, kart değil.** Arka plan her zaman dolu: palet gradyanı + `backdrop()` (2D) ya da
  `starfield()`/ışık (3D). Düz renk zemin, boş beyaz alan, "slayt" görünümü yasak.
- **Tek odak.** Her karede gözün gideceği tek bir ana nesne/sayı/kelime var; geri kalanı ona hizmet eder.
- **Renk:** sadece `ctx.pal` (`accent`, `accent2`, `glow`, `ink`, `bg`) ve `RED`/`GREEN`. Elle hex yazma
  (fiziksel renkler hariç: lav, buz, ten). Vurgu = `accent`, ikincil = `accent2`.
- **Yazı:** dev başlıklar Anton, diğer her şey Inter 700–900. Ekranda en küçük yazı 1080 genişlikte 44 px
  (360 px küçük ekranda okunabilsin). Bir karede en fazla ~6 kelime sahne yazısı (altyazı hariç).
- **Derinlik:** 3–4 katman: arka plan (yavaş) → orta plan (nesne) → ön plan (parçacık, ışık, etiket).
  Katmanlar farklı hızda hareket etsin (paralaks). 3D'de `glowSprite`, sis ve kenar ışığı kullan.
- **Yasak görünümler:** clipart / emoji ikon yığını, metin paragrafı, ekran ortasında küçük nesne,
  sabit kamera, siyah boş kare, kenarlıklı "kutu" kartlar, yanıp sönen neon.

## Ekran düzeni (dikey 1080×1920)

| Bölge | y aralığı | Kullanım |
|---|---|---|
| Kicker + marka | 0–260, sol | `title` etiketi — sahne nesnesi koyma |
| Maskot | 0–420, sağ | `mascot` varsa boş bırak |
| Ana sahne | 260–1150 | asıl görsel ve dev yazı |
| Altyazı bandı | 1170–1320 | önemli detay koyma |
| Alt boşluk | 1320–1500 | yansıma, zemin, ikincil süs |
| YouTube arayüzü | > 1500 | hiçbir şey okunması gerekmesin |

Yatay (1920×1080, uzun video): altyazı y ≈ 860–980; ana sahne 120–840.

## Hareket dili

- **Sürekli hareket:** her sahne her karede bir şeyi hareket ettirir (kamera süzülmesi, akış, parçacık,
  nabız). `tools/preview.py` hareket ölçer; `motion < 1.5` → "STATIC?" uyarısı, düzelt.
- **Giriş:** `spring(lt, a, d)` (hafif taşma). Çıkış yok — geçişleri motor yapar.
- **Vurgu:** cue anında `punch(lt, cue(cues,'hit'))` ile ölçek/parlama darbesi (≈ %6–12 büyüme).
- **Zamanlama:** sahne başında 0–0,3 sn içinde ilk hareket başlar; ana olay cue kelimesine bağlanır,
  süreye değil. Her 3–5 saniyede yeni bir görsel ödül (yeni nesne, sayaç, kamera dönüşü, renk değişimi).
- **Kamera (3D):** `shotCam(P, env, lt, dur)` kullan, `camAt` döndür ki art arda sahneler kesintisiz
  bağlansın (match cut). Yaklaşma = önem; uzaklaşma = ölçek/şaşkınlık.
- **Determinizm:** `Math.random`, `Date`, `performance.now` yasak. `rng(seed)`; her şey `lt`'nin saf
  fonksiyonu (geri sarınca aynı kare).

## Yeni sahne tipi yazma

Konuya özel tip gerekiyorsa **kendi dosyasında** yaz: `scenes/studio/shots/<tip>.js` (build.py bu
klasördeki tüm dosyaları otomatik yükler; böylece paralel ajanlar aynı dosyayı düzenlemez).
`shots2d.js` / `shots3d.js`'i sadece genel bir yardımcıyı düzeltmek için değiştir.

```js
// <tip>: tek satırda ne gösterdiği.
// P: {...parametreler ve varsayılanları}   cues: hit, ...
SHOTS.<tip> = {
  kind: '3d',                       // ya da '2d'
  build(ctx) {
    const { P, pal, W, H, scene, camera, labels } = ctx;   // 2D: { P, pal, W, H, svg, defs, root, seed }
    // ... nesneleri bir kez kur (dokuları bake()/surfaceMaps()/noiseMap() ile pişir)
    const camAt = (lt, dur, env) => shotCam(P, env, lt, dur);
    return {
      camAt,
      update(lt, dur, cues, env) {
        applyCam(camera, camAt(lt, dur, env), W, H);
        const hit = punch(lt, cue(cues, 'hit', dur * 0.4));
        // ... her şey lt'ye bağlı
      },
    };
  },
};
```

Kurallar: parametrik yaz (aynı tip başka konuda da işe yarasın), varsayılanlar mantıklı olsun, dikey ve
yatayda düzeni ayrı ayarla (`H > W`), yazıları `fitText()` ile sığdır, Türkçe sayıları `fmtNum()` ile bas.
Performans: shader'da kare başına `fbm`/`snoise` yok; tam ekran yarı saydam katman, `mix-blend-mode`,
büyük `filter: blur` yok.

**Bitti sayılması için:** `tools/preview.py` ile en az 3 farklı anda (`--times`) kare al, bak; boş/siyah
kare yok, ekran dışına taşma yok, hareket ölçümü > 1.5, konsolda `page error` yok.
