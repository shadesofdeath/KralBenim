# 2026-11-18 — Düşün Bakalım üretim notu

Plan (`tools/plan.py`): 1 Shorts (`01-…`, 19:00 İstanbul) + 1 uzun video (`02-…`, 20:30 İstanbul). Sonraki uzun video: 2026-11-20.
ElevenLabs: `warning: true` (ay içi 259.362 / bütçe 231.442, yenileme 2026-11-20) → karakterler aralığın alt ucunda
(Shorts ~330–350, uzun ~3.900–4.050).

## Manşetler
`tools/news.py --channel db` çalışmadı (bulut ağından Google News'e erişim yok: 403). Web aramasıyla tarandı.
- **02 (uzun):** Euronews Türkçe, 22 Eylül 2026 — "Troya'da arkeoloji: 2.800 yıllık agora bulundu, kent savaş sonrası terk
  edilmedi" (Hisarlık, Kültür ve Turizm Bakanlığı + Çanakkale Onsekiz Mart Üniversitesi kazısı; Reyhan Körpe).
  https://tr.euronews.com/kultur/2026/09/22/troyada-arkeoloji-2800-yillik-agora-bulundu-kent-savas-sonrasi-terk-edilmedi
  Bugünün manşeti değil ama bulunabilen en yakın, havuza uyan Türkiye manşeti.
- **01 (Shorts):** felaketler ve kazalar havuzuna uyan güncel Türkiye manşeti bulunamadı (hava kirliliği haberleri eski
  tarihli çıktı) → **havuzdan**: 1952 Londra Büyük Sisi.

## Videolar
- **01 — Londra Büyük Sisi (Shorts, 19:00, palette grafit)** · `01-londra-buyuk-sisi.json` · ayrıntı, anlatım, çekim listesi,
  kaynaklar ve eleştiri günlüğü: `production-01.md`. Kapak: BU SİS / ÖLDÜRDÜ. Son tur: tümü ≥ 7, kapak 8.
- **02 — Troya katmanları (uzun, 20:30, palette fildisi)** · `02-troya-katmanlari.json` · ayrıntı: `production-02.md`.
  Kapak: ALTIN PRİAMOS'UN DEĞİLDİ. Son tur: tümü ≥ 8, kapak 8.

## Yönetmen son kapısı
Lint iki dosyada OK (SEO 100). İki kapak ve iki kontak sayfası gözle incelendi: sol üst boş, taşan yazı yok, tek özne.
Konular birbirinden (1952 Londra / Tunç Çağı Troya + 1873–1994) ve geçmişten farklı.

---

# 2026-11-18 — Stickstory production note

Plan (`tools/plan.py --channel ag`): 2 Shorts (13:00 and 19:00 New York). No long video today; next one 2026-11-19.
ElevenLabs: `warning: true` (263,758 used / 231,442 budget, renews 2026-11-20), so narration stays near the low end (423 + 438 chars).
`tools/news.py` failed (proxy 403 on all 7 countries), so headlines came from web search.
- **ag-01 — Cosmic microwave background / the pigeons (13:00 NY):** ScienceDaily (US), 17 Nov 2026, "A Mysterious Twist in the
  Universe's Oldest Light Could Reveal New Physics". The first pick, Voyager 1 one light-day, was dropped because Düşün
  Bakalım already covered it on 2026-10-17. Details: `production-ag-01.md`. Final round: all ≥ 7, cover 8.
- **ag-02 — Duff children, Victoria 1864 (19:00 NY):** Australia (CBS News / AU press, 12–13 Nov 2026), "Boy found alive after
  6 days lost in Australian wilderness" (Walhalla, Victoria). Details: `production-ag-02.md`. Final round: all ≥ 7, cover 8.
