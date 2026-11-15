# ag-01-kentucky-meat-shower — Stickstory Short (history's strangest moments)

- **File:** `videos/2026-11-15/ag-01-kentucky-meat-shower.json` · format short · publish_at `2026-11-15T13:00:00-05:00` (Istanbul 15.11 21:00)
- **Category:** history's strangest moments (plan suggestion kept)
- **Headline:** `tools/news.py` failed (proxy 403 on all 7 countries); web search gave no usable, verifiable front-page story for
  this category → **category pool** (reported).
- **Topic:** The Kentucky Meat Shower, 3 March 1876, near Olympia Springs, Bath County, Kentucky. Mrs. Crouch was making soap
  outside when flakes of red meat fell from a clear sky for a few minutes over a strip of land. Locals tasted it (thought
  mutton / venison). Samples went to scientists: first "Nostoc" (cyanobacteria) claim, later microscopists found lung,
  muscle, cartilage tissue. Leading explanation (Dr. L. D. Kastenbine, 1876): a flock of vultures vomiting in flight.
  VERIFY every name/number on ≥ 2 sources (Scientific American 1876, NYT 1876 report, Smithsonian / Mental Floss / Wikipedia).
  No invented quotes. Don't present the vulture theory as certain.
- **Viewer should feel:** "Meat really fell from a clear sky — and the best explanation is even grosser."
- **Hook (3–8 words, same idea as cover):** e.g. "In 1876, it rained meat." → no, date not first: "It rained meat in Kentucky."
  ↔ cover "IT RAINED / MEAT". ≥ 3 cover candidates.
- **Structure:** hook → date/place 2nd sentence → tension (from a clear sky; flakes the size of… ; two men tasted it) →
  scientists' answer (lung tissue) → punchline (vultures) standalone → one short subscribe line with reason.
- **Related long video:** none.
- **Budget:** `elevenlabs_chars.warning: true` (243,238 used / budget 231,442) → narration **400–425 chars** (hard max 550).
- **Look:** sets `field`/`hills` (farm yard, soap kettle, clear sky), `interior` (1876 lab, microscope). New types in own file
  `scenes/studio/shots/km_*.js` (farmhouse yard with kettle + falling red flakes; magnified tissue under microscope lens;
  vultures circling). Kaşif host 15–25 %. Close-up ≥ 1 (zoom ≥ 1.6). On-screen `source` ≥ 1 (e.g. "Scientific American").
  Pattern must differ from recent shorts (Apollo 12 launch, Myeongnyang ships, bombardier beetle, Leonids).

## Writer — narration, fact check, shot list, cover

**Narration (442 chars after round 2 polish, 9 scenes, ~34 s preview estimate):**
> It rained meat in Kentucky. On March 3, 1876, Mrs. Crouch was making soap in her yard, under a clear sky. Then red
> flakes of meat fell all around her! Two men even tasted it and guessed mutton or venison. But under the microscope,
> scientists found lung tissue and cartilage. So where did it come from? The best guess is even grosser: a flock of
> vultures, throwing up their lunch to fly away faster. Subscribe for one strange true story a day.

**Fact check (≥ 2 sources each):**
- 3 March 1876, Bath County (near Olympia Springs), Kentucky — Wikipedia, Mental Floss, Today I Found Out.
- Mrs. Crouch outside making soap; clear sky — Mental Floss (her account: sky clear, sun shining), TIFO ("sky was
  perfectly clear"), Wikipedia (NYT 1876 headline "…From a Clear Sky"). Pieces fell around her / stuck to fences — TIFO, Wikipedia.
- Two men tasted it: "either mutton or venison" — Mental Floss, TIFO; Wikipedia: first Scientific American report, lamb or deer.
- Lung tissue (Hamilton, Medical Record; Edwards/Arnold) and cartilage (Edwards) — Wikipedia, Mental Floss, TIFO.
- Vulture vomit = leading explanation (Kastenbine, Louisville Medical News 1876; vultures vomit when startled /
  to lighten for take-off) — Wikipedia, Mental Floss, TIFO. Stated as "the best guess", not as certain. The "why"
  ("to fly away faster") rests on TIFO's note that vultures vomit to lighten their load and take off when a threat is near.
- Not used: Nostoc claim, "cosmic meat", exact piece sizes (sources differ slightly).
- On-screen sources: scene 1 "New York Times, 1876" (clear-sky report), scene 3 "Scientific American, 1876" (taste test).

**Shot list** (palette `ag-sage`; sets field → field → field(low) → field → interior → interior → hills → hills → field):

| # | Text | Type | Visual | Cue | Camera | Kaşif |
|---|---|---|---|---|---|---|
| 0 | It rained meat in Kentucky. | km_yard rain | 1876 farm yard, cabin, fence, soap kettle; flakes everywhere, one big chunk tumbling down | hit=meat | push 1.03 | (cover/hook Kaşif in shock) |
| 1 | On March 3, 1876, Mrs. Crouch was making soap in her yard, | km_yard soap | Mrs. Crouch (bun, blue dress, apron) stirs the kettle with a paddle; stamp "MARCH 3, 1876" | d=March | right | — |
| 2 | under a clear sky. Then red flakes of meat fell all around her! | km_sky fall | low angle, empty sky + sun; flakes start on "Then" and grow toward the viewer; she recoils, "MEAT!" | f0=Then, hit=fell | push | — |
| 3 | Two men even tasted it and guessed mutton or venison. | km_yard taste | two bearded farmers, one chewing a flake; bubbles sheep / deer, "MUTTON?" "VENISON?" | mut, ven | push | — |
| 4 | But under the microscope, | km_scope | 1876 lab, brass microscope, scientist bends to the eyepiece, jar "SAMPLE" | m | left | — |
| 5 | scientists found lung tissue and cartilage. | km_lens | eyepiece close-up: lung air sacs / cartilage cells, stamps LUNG, CARTILAGE | lung, cart | **close-up 1.7** | — |
| 6 | So where did it come from? The best guess is even grosser: | km_sky circle | ring of vultures over the treetops; stamp "BEST GUESS" | guess | up | binoculars at the birds, then points up |
| 7 | a flock of vultures, throwing up their lunch to fly away faster. | km_sky vomit | big turkey vulture over the yard throws up meat chunks that land in the yard, then flaps hard and climbs away | throw=throwing, fly=fly | **close-up 1.6** | — |
| 8 | Subscribe for one strange true story a day. | km_yard end | yard covered in flakes, last ones drifting | p=true | pull | waves, then points at the viewer |

Kaşif 2/9 scenes (22 %) + big shocked Kaşif in the cover/hook. New shot file: `scenes/studio/shots/km_meat.js`
(km_yard, km_sky, km_scope, km_lens; uses BBL.cast/labels and LH.kasif/person read-only).

**Round 1 fixes (critic):** scene 2 is now Mrs. Crouch waist-up behind a near fence (sky in the top third,
kettle and back fence behind her); 64 big flakes fall toward the camera and stay on her shoulders, apron, the rails and
the ground. Scene 5 has a brass stage, a slide under two clips and a notebook below the eyepiece. Scenes 6–7 have a
meat-strewn yard (fence, kettle) in the bottom band and a lower, bigger ring of clearer vultures (red heads, pale
flight feathers, fingered tips). Scene 7: the vomited meat lands in the yard and the vulture climbs away on "fly".
Scene 3: the farmer holds up a bitten flake in front of his face instead of at his mouth. Big pieces of meat are
drawn as a steak with a fat rim and marbling.
Cover, round 1, three new candidates (same text "IT RAINED / MEAT"): (1) Kaşif pointing (read as a wave), (2) Kaşif
shocked, (3) zoom 1.6 + pointing. Kaşif floated above the ground in all three, so the final cover moves the focus down
to the ground. **Final:** scene 0 t 1.27, focus [598, 931], zoom 1.35. The steak sits under the title at y ≈ 870–1110,
and Kaşif stands shocked on the ground (feet y 1450) with his face clear. The pale band under the title is the
engine's `#covershade` (shared CSS: solid paper to 36% of the height, fading out by 50%); a shot cannot remove it.

**Round 2 polish:** "even grosser" is back (442 chars). Scene 7: the big vulture stays centred (screen y ≈ 700–900) in
front of the fence; one continuous stream of 34 chunks falls from its beak, clamped to the middle of the frame, down
past the fence into the yard. Scene 6: Kaşif is higher (head clear of the subtitle bar), and the circling birds have
wider wings with spread fingertips. Scene 0 and the cover: 100 bigger flakes, falling and lying in the foreground
(motion 4.0); the cover Kaşif is at x 760.

**Cover candidates, round 0** (rendered and compared side by side):
- A — scene 0 t 1.5, "IT RAINED / MEAT" (MEAT boxed), focus on the big falling chunk, Kaşif in shock bottom right. **Chosen:** one clear
  object, matches the first sentence, readable small.
- B — scene 2, "MEAT FROM / A CLEAR SKY": mostly empty sky, Mrs. Crouch's head cropped; weak focal point.
- C — scene 7, "IT RAINED / RAW MEAT" over the vomiting vulture: gives away the punchline and mixes up the hook.

## Eleştiri günlüğü

### ag-01-kentucky-meat-shower — tur 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 6 | 8 | 6 | 8 | 8 | 9 | 7 | 7 |
1. Sahne 2 (km_sky, "Then red flakes of meat fell all around her!"): the frame is about 75% empty sky with a sun, Mrs. Crouch is cut off to just a head at the bottom, and only about 6 tiny flakes are visible. The key line, "all around her", is not shown, and the sky takes up far more than the 1/3 limit. Fix: lower the horizon (sky ≤ 1/3) and frame her waist-up in the middle third. Make the flakes dense (n ≥ 60) and large (r 30–60 px) so they come toward the camera and land on her apron and shoulders and around her feet. Fill the lower band with ground or fence.
2. Sahne 5 (km_lens) and sahneler 6–7 (km_sky): in km_lens, everything below the eyepiece circle (y ≈ 1350–1920) is flat dark, so the area under the subtitle is empty. In 6–7, sky fills about 2/3 of the frame, and the vultures in 6 read as black crosses or planes. Fix: in km_lens, put the brass microscope stage, the slide clip, or the notebook in the foreground under the circle. In 6, use a lower and larger vulture ring with clear turkey-vulture silhouettes (red head, fingered wingtips). Put a foreground of the meat-strewn yard or field in the bottom band of both 6 and 7.
3. Kapanış + kapak. The punchline stops at "throwing up their lunch" and never says *why* vultures would do this. Kastenbine's point was that vultures vomit to get lighter and flee when startled, and without it the payoff feels like half an answer. Add a short clause, e.g. "…throwing up their lunch to fly away faster.", and stay under 480 characters. Cover: Kaşif sits at the bottom-right edge with his legs cut off by the frame, his body runs into the YouTube UI zone (y > 1500), and one arm crosses his face. A ~250 px empty fog band separates the title from the scene, and the falling chunk reads as a red teardrop or leaf rather than meat. Fix: move Kaşif up and left (y ≈ 1350, face fully clear), push focus or zoom so the chunk (with a fat marbling stripe and a few flakes) sits right under "MEAT", remove the empty band, and make at least 3 cover candidates as CLAUDE.md requires.

### ag-01-kentucky-meat-shower — tur 2
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon+Kaşif | Derinlik+marka | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 9 | 8 | 8 |
Fixed since round 1: sahne 2 now has her full figure plus meat on the fence and ground, sahne 5 has the slide and notes in the foreground, sahneler 6–7 have the yard in the foreground, the punchline explains why ("to fly away faster"), and the cover chunk reads as a steak.
1. Sahne 7 (km_sky vomit): at the 'fly' sample, the vulture is a small blob at the top right. The pile of chunks sits in the bottom-right corner, cut off by the frame edge and no longer joined to the beak, so the payoff image breaks up. Sahne 6: the ring birds still read as black crosses, and Kaşif's torso sits right behind the subtitle bar (y ≈ 1170–1320). Fix: in 7, keep the big vulture centered (y ≈ 700–900) for the whole scene. Draw one continuous stream from the beak down past the fence and keep the chunks inside x 150–930. In 6, move Kaşif lower so his head clears the bar, and give the ring birds wider, fingered wings.
2. Sahne 0 / cover (hook frame): motion is 2.6, below the preferred 4. On the cover, the bottom quarter (y ≈ 1450–1880) is empty ground with about 6 flakes, so "rained" doesn't come across. The fez is about 30 px from the right frame line (the rule is no contact). Fix: add 25–40 mid-size flakes falling through the air and lying in the foreground band (grass, meat on the fence rail), shift Kaşif to x ≈ 760, and keep the steak as the single big focal object.
3. Senaryo: dropping "even" left "The best guess is grosser:", which sounds clipped when read aloud. The narration still never speaks to the viewer ("you") as BRAND §11 asks. Fix: e.g. "So where did it come from? You won't like the answer:" (stay ≤ 480 chars), or restore "even grosser".
