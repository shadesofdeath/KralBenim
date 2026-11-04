# ag-01-wood-frog — Stickstory Short (animal superpowers)

- **File:** `videos/2026-11-04/ag-01-wood-frog.json` · format short · publish_at `2026-11-04T13:00:00-05:00` (Istanbul 04.11 21:00)
- **Category:** animal superpowers (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries). Web search: seasonal coverage of wood frogs freezing for
  winter (e.g. PJ Media 21 Oct 2026 "No Pulse, No Breath, No Problem: The Incredible Wood Frog"; recurring US local-news
  "frogsicle" stories as the first frosts arrive). No usable hard-news front page → seasonal hook (winter is arriving in the
  US/Canada/Alaska right now). Report says so.
- **Topic:** the wood frog (*Lithobates sylvaticus*) freezes solid every winter: heart stops, no breath, ice in the body cavity
  and under the skin, liver floods cells with glucose as antifreeze; in Alaska they survive months frozen and very low
  temperatures (Larson et al. 2014, J. Exp. Biol. — verify exact numbers: ~ −16 °C / 3 °F?, up to ~7 months?). In spring they
  thaw and the heart restarts. Only state numbers you verify.
- **Viewer should feel:** "A frog dies every winter on purpose and comes back."
- **Hook (3–8 words, same idea as cover):** e.g. "This frog's heart stops every winter." ↔ cover "ITS HEART / STOPS" (highlight "stops")
  or "FROZEN / NOT DEAD" (highlight "frozen"). Writer picks after 3 candidates.
- **Cover idea:** big Kaşif in shock holding / looking at a frog frozen inside an ice block on the forest floor; one subject.
- **Punchline:** complete standalone line (spring thaw — the heart beats again) + one short natural subscribe line with reason.
- **Related long video:** `videos/2026-11-03/ag-03-bat-echolocation.json` (animal superpowers) if nothing closer.
- **Budget warning (ElevenLabs warning: true):** narration at the low end, **400–440 chars**.
- **Palette:** `ag-newsprint` (previous Stickstory video used ag-sage); sets: `snow` (winter forest floor, leaf litter) →
  `interior` (a lab / microscope look at ice crystals or glucose) → `field`/`hills` (spring pond).
- **Must avoid myths:** don't say "dead" literally without framing; don't claim humans can do this.

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration (one flowing text, 430 chars; round 1 revision)
This frog's heart stops every winter. In Alaska, the wood frog freezes solid. No heartbeat. No breath. You'd swear it
was dead. So what's the trick? As ice forms, its liver floods every cell with sugar. Sugar works like antifreeze and keeps the
ice out of its cells. Up to 70 percent of its body water turns to ice, for more than six months. Then spring comes,
and its heart beats again. Subscribe for a wild true story every day.

### Shot list (10 scenes; new shot file `scenes/studio/shots/wf_frog.js`)
| # | Text | Type / mode | Set · camera | Kaşif |
|---|---|---|---|---|
| 0 | This frog's heart stops every winter. | `wf_forest` hook | snow · push | big, shock pose as the cover overlay (drawn over the cover shade) next to the frog in a cracked, frosted ice block; red heart beats, then greys, cracks and flatlines on "stops" |
| 1 | In Alaska, the wood frog freezes solid. | `wf_forest` wide | snow · pull | — (frost spreads over the frog, ice ring; card ALASKA) |
| 2 | No heartbeat. No breath. | `wf_freeze` close | snow · **close-up** zoom 1.6 | — (ECG goes flat on "heartbeat", breath puffs stop; NO HEARTBEAT) |
| 3 | You'd swear it was dead. | `wf_freeze` poke | snow · right | prods the stiff frog with a long twig, jumps back in shock when it tips belly-up on "was"; DEAD? |
| 4 | So what's the trick? As ice forms, its liver floods every cell with sugar. | `wf_body` | interior lab · push | — (cut-away frog on a tray: skin ice, liver glows, gold sugar streams; LIVER / SUGAR) |
| 5 | Sugar works like antifreeze and keeps the ice out of its cells. | `wf_cells` | eyepiece · push | — (cells fill with sugar, ice crystals grow only in the gaps; SUGAR / ICE) |
| 6 | Up to 70 percent of its body water turns to ice, | `wf_meter` | snow · push | — (frog-shaped glass fills with ice to a 70 % mark, counter 0→70%) |
| 7 | for more than six months. | `wf_forest` months | snow · left | — (snow mound grows over the frog, calendar on a trunk flips NOV→MAY; 6+ MONTHS) |
| 8 | Then spring comes, and its heart beats again. | `wf_pond` thaw | field · push | — (frost melts, drips, eyes clear and blink, red heart pops and beats with rays) |
| 9 | Subscribe for a wild true story every day. | `wf_pond` end | field · pull | waves, then points at the viewer on "story"; frog croaks on the bank |

Kaşif in scenes 3 and 9 (2/10 = 20 %), plus the cover/hook overlay over scene 0. Types: 6 different, no type more than 2 in a row.

### Cover candidates, round 1 (all rendered and compared; cover focus [500, 1000], zoom 1.3, overlay Kaşif x 815 y 1310 scale 1.3)
- **A (chosen):** "ITS HEART / STOPS", Kaşif in shock — the first spoken line, cracked grey heart + flatline as the payoff.
- B: "FROZEN, / NOT DEAD", same frame — good, weaker link to the first sentence.
- C: "HEART STOPS / EVERY WINTER", Kaşif pointing, worried — four words read smaller, less punch.

### Cover candidates, first draft
- **A (chosen):** scene 0 t 1.6 — "ITS HEART / STOPS" (highlight STOPS) = first sentence; frog in the ice block + paused pale heart, big shocked Kaşif; one subject.
- B: same frame, "FROZEN, / NOT DEAD" (highlight FROZEN) — reads well but does not match the first spoken line as closely.
- C: scene 2 t 1.8 — "NO HEARTBEAT / ALL WINTER" + overlay Kaşif; frog small and pale, overlay Kaşif cramped in the corner, weakest.

### Facts (verified)
- Heart slows and stops while frozen; the frog uses no oxygen; Layne & Lee: "as much as 70 percent" of body water can freeze; within minutes of ice forming in the skin the liver converts glycogen to glucose, which protects the cells. Live Science: https://www.livescience.com/32175-can-frogs-survive-being-frozen.html
- Larson, Middle, Vu, Barnes 2014, J. Exp. Biol. 217:2193: Alaska wood frogs in natural hibernacula stayed frozen 193±11 consecutive days (range up to 218), average minimum −14.6 °C (down to −18.1 °C), 100 % survival (N=18) → narration "more than six months". https://pubmed.ncbi.nlm.nih.gov/24737762/ (abstract read via the JEB PDF)
- UAF news: frogs survived −18 °C for up to 218 days; outdoor frogs had 13× more glucose in muscle, 10× in heart, 3.3× in liver than lab-frozen frogs; Eastern US/Canada frogs only survive a few weeks to about −7 °C. https://uaf.edu/news/archives/news-archives-2010-2021/alaska-frogs.php
- Not claimed: humans can do this; "the frog is dead" (framed as "you'd swear it was dead").

## Eleştiri günlüğü

### ag-01-wood-frog — round 1 (critic's scores)
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 6 | 7 | 6 | 7 | 8 | 9 | 8 | 7 |
1. Frog behind the subtitle strip and empty bottoms → every snow/pond scene now has ground y 1120 (frog body ≈ 880–1120) and a
   big foreground down to the bottom: snow bank, a fallen snow-capped log with a cut end, a low snow lip, big leaves, twigs, twinkles.
2. Frog didn't read as a frog → redrawn: banded folded thigh, shin, long foot with four toe pads, front leg with splayed toes, dark mask
   stripe from the snout through the eye, eardrum, light lip line, brow ridge. Scene 4: "LIVER" serif card (70) + red arrow to the liver,
   thick bright gold sugar dots flowing along the veins from "sugar". Scene 6: the real frog with ice rising inside its own body to the 70 %
   mark (no more glass blob). Scene 1: big two-tone ice-crystal ring.
3. Cover → zoom 1.3 on [500, 1000], Kaşif as the cover overlay (full-colour red fez, over the fade, no tree lines), red heart that greys,
   cracks and flatlines on "stops", frosted crust and cracks on the ice block; 3 new candidates, A kept.
Also: scene 3 hiker replaced by Kaşif (prods with a twig, shock on "was"), "keeps the ice out of its cells" (430 chars).


### ag-01-wood-frog — round 2 (passed: every criterion ≥ 7, cover 8) + polish
1. Cover/scene 0: the background trees are moved (x 0.06 / 0.42 / 1.05), so no pine outlines cross Kaşif any more (checked in cover.jpg).
2. `wf_pond` (scenes 8–9) ground raised 60 px (gy 0.552, set ground 1060) → frog clear of the subtitle strip;
   scene 2 camera.focus y 870 → 820 → the frog's feet clear the strip.
3. Kaşif stays in scene 9 (wave → point at the viewer). Lint OK, preview without STATIC warnings.
