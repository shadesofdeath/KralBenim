# ag-01-velcro — Stickstory Short (origins of everyday things)

- **File:** `videos/2026-11-03/ag-01-velcro.json` · format short · publish_at `2026-11-03T13:00:00-05:00` (Istanbul 03.11 21:00)
- **Category:** origins of everyday things (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403/502 on all 7 countries); web searches returned no usable current front page
  (3 Nov 2026 is also US election day — politics excluded) → **category pool** (report says so).
- **Topic:** Velcro. 1941 (often given as 1941; verify), Swiss engineer George de Mestral comes home from a hunting walk in the Alps,
  his dog covered in burdock burrs; under a microscope he sees tiny hooks catching loops in fur and cloth. Years of failure (cotton too
  soft); nylon hooks made by cutting loops, patent 1955 (Swiss) / US patent 1958–1961 — verify; name = velours + crochet. Mocked by
  the fashion world, rescued by NASA/ski suits (verify claims, no myths: NASA did NOT invent it).
- **Viewer should feel:** "A weed stuck on a dog became something I touch every day."
- **Hook (3–8 words, same idea as cover):** e.g. "A weed on a dog invented this." ↔ cover "A WEED / INVENTED THIS" (highlight "weed").
- **Cover idea:** big Kaşif in shock holding a giant burr with tiny hooks; one subject.
- **Punchline:** complete standalone line + one short subscribe line with reason.
- **Related long video:** none.
- **Budget warning (ElevenLabs warning: true):** narration 400–440 chars.
- **Palette:** `ag-dusk` (differs from the previous Stickstory video, ag-newsprint); sets: `hills`/`snow` (Alps walk) → `interior` (lab).

## Narration, shot list, cover candidates — writer fills below (narration first, one flowing text)

### Narration (one flowing text, 438 chars; round 1 revision)
A weed on a dog invented this. George de Mestral came home from a walk in the Swiss mountains. His dog was covered in
burrs. Most of us pull them off. Under a microscope, George saw tiny hooks, grabbing every loop of fur. He copied it: hooks
on one strip, loops on another. It took years. Cotton wore out. Nylon held. The name Velcro? Velvet and hook, in French.
That rip on your shoes? A Swiss weed. Subscribe for a true story every day.

### Shot list (11 scenes; new shot file `scenes/studio/shots/vc_velcro.js`)
| # | Text | Type / mode | Set · camera | Kaşif |
|---|---|---|---|---|
| 0 | A weed on a dog invented this. | `vc_field` hook | hills · push | big, shocked "O" mouth, holds a giant hooked burr; burr-covered dog |
| 1 | In the Swiss Alps, George de Mestral came home, | `vc_walk` home | hills · pan right | — (George at chalet door, dog runs in collecting burrs; "SWISS ALPS") |
| 2 | with his dog covered in burrs. | `vc_walk` dog | hills · **close-up** zoom 1.6 | — (burrs pop onto the dog) |
| 3 | Most of us just pull them off. | `vc_field` pluck | hills · left | annoyed, burrs fly off his legs |
| 4 | George put one under a microscope and saw tiny hooks, | `vc_scope` desk | interior · push | — (magnified bubble, red ring on a hook, "TINY HOOKS") |
| 5 | grabbing every loop it touched. | `vc_scope` zoom | eyepiece view · push | — (hooks drop and catch loops; HOOKS / LOOPS) |
| 6 | He copied it: hooks on one strip, loops on another. | `vc_strip` copy | interior · pull | — (strips press together, rip apart) |
| 7 | Cotton wore out. Nylon held. | `vc_strip` test | interior · push | — (cotton drops its weight, red X; nylon holds, green tick) |
| 8 | He named it Velcro: velvet hook, in French. | `vc_name` | interior · push | — (VELOURS + CROCHET → VELCRO) |
| 9 | That rip on your shoes? A Swiss weed. | `vc_shoe` | interior · push | — (straps peel "RIIIP!", burr pops in) |
| 10 | Subscribe for a true story like this every day. | `vc_field` end | hills · pull | waves, then points at viewer; dog wags |

Kaşif 3/11 (27%, lint warns >25%, allowed ≤35).

### Cover candidates
- **A (chosen):** scene 0 t 1.3 — "A WEED / INVENTED THIS", Kaşif with "O" mouth + shock ticks holding a giant hooked burr, burr-covered dog. One clear subject, face readable.
- B: scene 2 t 1.9 — dog close-up with burrs + overlay Kaşif; dog fills frame but the overlay Kaşif clashes with a plant, burrs read small.
- C: scene 9 t 2.6 — "THIS RIP / IS A WEED" over the sneaker; the strap/burr link is not readable small, the RIIIP fades under the text block.

### Facts (verified)
- George de Mestral, Swiss engineer; burrs (burdock) stuck to his clothes and his dog's fur after a hunting trip **in the Alps**; he saw hundreds of hooks under a microscope. Year varies by source (1941 Wikipedia/Velcro.com, 1948 Live Science) → **no year in narration**. https://en.wikipedia.org/wiki/George_de_Mestral · https://www.velcro.com/?p=7429
- Cotton strips worked but wore out quickly; nylon worked (hooks formed when sewn under hot infrared light). https://en.wikipedia.org/wiki/George_de_Mestral
- Name = French *velours* (velvet) + *crochet* (hook). https://www.velcro.com/?p=7429
- Swiss patent applied 1951, granted 1955 (Velcro.com says first Swiss patent 1954) → no patent date in narration.
- NASA did not invent it; Apollo-era use made it famous (only in the description). https://livescience.com/34572-velcro.html
- Place conflict: Wikipedia/Velcro.com say "Alps", WIPO says "Jura mountains" (both Swiss) → narration says "Swiss
  mountains", on-screen label "SWITZERLAND". WIPO: nearly eight years of R&D with a weaver; cotton then nylon; Swiss
  patent filed 1951. https://www.wipo.int/en/web/ip-advantage/w/stories/the-velcro-ip-story
- Sources now: WIPO, Wikipedia, Live Science (velcro.com/?p=7429 removed).

## Eleştiri günlüğü

### ag-01-velcro — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 6 | 7 | 6 | 7 | 7 | 8 | 8 | 7 | 7 | 6 |
1. Hook/cover never showed "this" → scene 0 rebuilt: Kaşif in shock pose holds the giant burr in one hand and a red Velcro
   strap (hooks along its edge) in the other, bold red dashed arrow burr → strap; cover uses focus [500, 700] zoom 1.2
   (Kaşif ≈1.6 effective). Note: the cover band y≈500–800 is covered by the engine's own paper shade (#covershade solid to
   36% of the height, transparent at 50%, index.html, shared file), so nothing drawn there can show; the subjects sit right
   under it instead.
2. Scene 8 rebuilt: a cork pinboard covers the wall (no window behind cards); VELCRO pops in a red box on "Velcro", then
   arrows to cards VELOURS / CROCHET with red notes "velvet" / "hook" (80 px) on those words. Narration: "The name
   Velcro? Velvet and hook, in French."
3. Scene 3: dog removed, five burrs r 32 fly off. Scene 6: strips lie on a workbench top (y≈580–1190), 180 px tall, bigger
   hooks/loops, serif cards HOOKS / LOOPS 88 px on the bench, burr between them. Scene 9: burr r 90 pops on "Swiss" just
   above the strap hooks with a bold red arrow; RIIIP moved top left.
Also: scenes 1→2 split into two sentences, "It took years." added (scene 6), source URL replaced, green tick = INK.green
token, SWITZERLAND label moved inside the frame. Kaşif stays 3/11 (27%): hook, "most of us", subscribe; dropping one
would cost the hook or the closing.

### ag-01-velcro — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 7 | 8 | 7 | 8 | 8 | 8 | 8 | 8 | 8 |
Passed. Final polish:
1. Scene 1: George's raised hand moved to the back of his head (no sleeve across the face); kicker now "1940s"
   (card stays "SWITZERLAND").
2. Scene 0 / cover: the strap is now a pair, a red hook strip (thicker hooks) with a blue loop strip half peeled off it,
   hung ~60 px lower/right of the hand; Kaşif moved to x 0.5, focus [530, 700], everything inside the frame.
3. Scene 8: "velvet"/"hook" notes (80 px) are fully grown when their word is spoken (spring starts 0.45 s earlier).

## Yönetmen — son kapı
Round 2 (final) scores: script 8, hook 8, readability 7, visual 8, motion 7, composition 8, depth 8, pace 8, accuracy 8, closing 8, cover 8. Lint OK (warn: Kaşif 27%, within 35%). Cover and sheet checked by director.
