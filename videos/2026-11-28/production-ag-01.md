# ag-01 — Pyrrhic Victory: How Did Winning Ruin a King? (Stickstory Short)

- **File:** `videos/2026-11-28/ag-01-pyrrhic-victory.json` · `publish_at` `2026-11-28T13:00:00-05:00` (Istanbul 28.11 21:00)
  · paper `gurub` (rose/violet dusk: a tragedy, an ending; previous Stickstory paper was `yaz`)
- **Category:** empires and battles · **Topic:** Pyrrhus of Epirus, Heraclea (280 BC) and Asculum (279 BC), the origin of
  "Pyrrhic victory". Never covered on either channel (checked `videos/*/`).
- **Viewer should feel:** the cold irony that winning can be what destroys you, and an everyday phrase suddenly has a face.
- **Hook:** first line "He won, and it ruined him." ↔ cover "HE WON. / HE **LOST**." (same idea, the paradox).
- **Coda (roof tile in Argos, 272 BC):** left out. It does not fit the 400–500 character budget, and the punchline
  (the word that carries his name) is stronger as the last line.

## Narration (497 characters, after round 1)

He won, and it ruined him. In 280 BC, Pyrrhus of Epirus crossed to Italy to fight Rome. He brought war elephants, beasts no Roman had ever faced. At Heraclea, Rome's horses panicked, and he won. Then, at Asculum, he won again. But most of his generals were dead, and he had no others. Rome just raised new legions. When a man congratulated him, he said: “One more victory over the Romans, and we are ruined.” His name became a word: Pyrrhic victory. Subscribe for a true story like this every day.

Read-aloud check: no inverted sentences; past tense; sentences linked by contrast (won / ruined; dead / no others; Rome
just raised new legions). No hype phrasing, no filler. "BC" is the only short form (used in earlier Stickstory scripts too;
lint does not flag it).

## Shot list

| # | Text | Type | Visual / objects | Cue | Camera |
|---|---|---|---|---|---|
| 0 | He won, and it ruined him. | `wc_scene` | dusk plain, one war elephant (`pyr_elephant`, red caparison, driver, no tower so the cover text stays clear) walking slowly right; low smoke; dropped bronze shield (`pyr_aspis`) in the fg; birds. Already painted at frame 0 (hook + cover) | — | slow move x .42 → .50 |
| 1 | In 280 BC, King Pyrrhus … to fight Rome. | `wc_map` | southern Italy + western Greece; Epirus, red route with a ship to Tarentum on "Italy", red star Rome | italy, rome | map paint-in |
| 2 | He brought war elephants, beasts no Roman had ever faced. | `wc_specimen` (plate, close-up) | the elephant large with its fighting tower, shields and spear points, the driver; notes "war elephant", "fighting tower" (red, on "beasts") | beasts | plate |
| 3 | At Heraclea, Rome's horses panicked, and he won. | `wc_scene` | day plain: the elephant charging with trunk raised (`pose: charge`); a Roman rider's horse bolts right on "panicked"; dust | panic | wide |
| 4 | Then, at Asculum, he won again. | `wc_number` | big painted "2" on a gold swatch under a war elephant vignette; "wins: Heraclea, Asculum" | asc | — |
| 5 | But most of his generals were dead, and he had no others. | `wc_scene` | dusk hills: empty crested Corinthian helmet, dropped shield, spear upright, smoke; note "no one to replace them" | dead | medium close |
| 6 | Rome just raised new legions. | `wc_scene` | dawn hills: fresh Roman ranks with red banners marching right | new | wide |
| 7 | When a man congratulated him, he said: | `wc_scene` | night camp, fire before a tent; an officer (`pyr_hoplite` side, arm raised) greets the king (`pyr_hoplite` back view, red cloak, tall crest) | — | medium |
| 8 | “One more victory over the Romans, and we are ruined.” | `wc_letter` | aged sheet, the quotation written line by line + "— Pyrrhus, in Plutarch" (no seal, no signature) | ruin | — |
| 9 | His name became the word for it: Pyrrhic victory. | `wc_scene` | sunset: the king alone, back to us, spear upright, dropped shield; red note "Pyrrhic victory"; mist washes it to paper | word | — |
| 10 | Subscribe for a true story like this every day. | `wc_title` | "The Pyrrhic victory" / "Heraclea 280 BC · Asculum 279 BC", small elephant | — | — |

Types: wc_scene ×6, wc_map, wc_specimen, wc_number, wc_letter, wc_title (6 types, wc_scene 55%, max 3 in a row).
Close-ups/plates: scene 2 (plate), scene 5 (helmet close).

## New code

`scenes/studio/shots/wc_pyrrhus.js` (own file, auto-loaded; no shared file touched):
- `pyr_elephant` — Indian war elephant in profile (domed head, small ear, arched back, tusks), poses stand/walk/charge,
  optional fighting tower (planks, crenellations, two shields, spear points, two crested heads), red caparison with gold
  fringe (`rug`), driver; opaque paper underlay; live: ear fans and trunk swings slowly; `still: true` for cards.
- `pyr_hoplite` — Greek hoplite, `view: back` (red cloak, tall crest, round shield edge-on, spear) or `side`
  (cuirass, pleated skirt, greaves, crest, `pose: raise`); `king: true`; live crest in back view.
- `pyr_aspis` — round bronze shield lying in the grass.
Library `elephant` was too blocky for the hero, and `person` `soldier` reads as a modern uniform, so both were replaced.

## Cover candidates

- **A (chosen):** "HE WON. / HE **LOST**." scene 0, t 2.0, focus [560, 860] ×1.15: one elephant, big text clear of the
  subject, the paradox of the first sentence. (First try with the fighting tower: the tower sat behind the text → tower
  removed from scene 0; first try with highlight "lost." did not highlight → "lost".)
- B: "WINNING / **RUINED** HIM", scene 9 (king alone at sunset, back view): moving, but the second line is long so the
  letters are smaller, and the red "Pyrrhic victory" note peeked behind the text.
- C: "TOO MANY / **WINS**", scene 3 (charging elephant): the fleeing horse is cut at the frame edge, two subjects, weakest.

## Facts and sources

- Tarentum, at war with Rome, invited Pyrrhus (Plutarch, Pyrrhus 13; Britannica: "In 281 Tarentum … asked for Pyrrhus's
  assistance against Rome"); he crossed to Italy in 280 BC (Britannica; World History Encyclopedia).
- He brought war elephants (Plutarch 15: twenty elephants embarked; WHE: "20 war elephants") — no number in narration.
- Heraclea 280 BC: the Roman horses were terrified of the elephants and bolted with their riders (Plutarch 17); the Romans
  had never seen elephants before ("Lucanian oxen", Wikipedia, Battle of Heraclea) — "beasts no Roman had ever faced".
- Asculum 279 BC, a second costly victory (Britannica).
- Plutarch 21: he had lost a great part of his army and nearly all his friends and generals, had no others to summon from
  home, while the Roman army "was easily and speedily filled up again" → "most of his generals were dead, and he had no
  others. Rome just raised new legions."
- The quote (Plutarch 21, Loeb 1920): "If we are victorious in one more battle with the Romans, we shall be utterly
  ruined." The narration uses a shortened faithful rendering (WHE renders it "One more victory like that over the Romans
  will destroy us completely!"). Spoken to one who congratulated him on the victory.
- "Pyrrhic victory" = a victory won at too great a cost, named after him (WHE; Britannica).
- Not used: casualty figures (sources disagree: Dionysius vs Hieronymus vs Pyrrhus' own memoirs); Beneventum 275 BC;
  death at Argos 272 BC (old woman's roof tile, Plutarch 34).
- Sources in the JSON: Plutarch Loeb (LacusCurtius), Britannica "Pyrrhus", World History Encyclopedia "Pyrrhus".

## Critique log

### ag-01 — round 1
| Senaryo | Kanca | Okunabilirlik | Görsel=anlatım | Hareket | Kompozisyon | Suluboya | Tempo | Doğruluk | Kapanış | Kapak+SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 6 | 7 | 7 | 6 | 8 | 8 | 8 | 7 |
1. Scene 6 read as a pike phalanx / red blob; scene 3 horse rode alongside the elephant.
2. Hero elephant quality (washes, legs, tusks, mahout); cover 7 (tail cut, dark smoke smudge); build a scene-9 alternative.
3. Scene 4 "Then he won again." weak; scene 8 letter signed + sealed implied Pyrrhus wrote it; shields at the frame edge.

**Writer fixes after round 1:**
1. Scene 6: `army` roman, 2 rows × 6, s 1.9: separate legionaries with rectangular scuta and one banner (library spears are
   still long; no shorter weapon in `army`). Scene 3: elephant x .26 → .34, rider starts at x .78 with a clear gap and bolts
   off to the right on "panicked" (1.6 s); dust now rises in front of the elephant on the cue. (Library rider has no rear pose.)
2. `pyr_elephant` rebuilt: tapered jointed legs (wide thigh, knee, narrow ankle, flared foot) as layered washes with a
   dark wet edge on the shadow side, a light edge, dry-brush grain, knee/ankle creases; shoulder and haunch masses so the
   legs grow out of the body; a pooled dark wet edge along belly and rump, granulation dabs; longer ivory tusks drawn in
   front of the trunk (they were hidden behind it); a real mahout (tunic, red sash, head cloth, arm forward with a goad,
   leg hanging). Cover: whole elephant in frame (x .44, focus [540, 880] ×1.25), smoke removed.
   Cover candidates compared: A "HE WON. / HE **LOST**." on the elephant (scene 0) · D the same text on the lone king at
   sunset (scene 9, t 0.4, note now writes at 1.0 so it is not under the text) · B "WINNING / **RUINED** HIM" on the king.
   Kept A: the elephant is the unusual, specific image (Pyrrhus = elephants), whole and clear under big text; D is clean
   but a generic soldier from behind; B's long second line makes smaller letters.
3. Scene 4 → "Then, at Asculum, he won again." as `wc_number` "2" under an elephant vignette, label "wins: Heraclea,
   Asculum". Scene 1 → "In 280 BC, Pyrrhus of Epirus crossed to Italy to fight Rome." (kept "crossed": he was invited
   by Tarentum, "invaded" is less exact). Scene 9 → "His name became a word: Pyrrhic victory." Scene 8: no seal, no
   signature; the last line reads "— Pyrrhus, in Plutarch". Shields in scenes 0 and 9 at x .2, y .78.
Lint OK (no warnings), 497 chars, no STATIC.

### ag-01 — round 2
PASS (all ≥ 7, cover 8 borderline). Polish requested: scene 6 banner off the top and ghostly rear rank; fallen aspis in
scenes 0/9 on the fg layer at y ≈ .93 (edge + UI zone); cover needs a sign of cost; optional: scene 8 sheet half empty.

**Writer polish after round 2:**
1. Scene 6: one opaque rank of 7 legionaries (rectangular scuta), s 1.6, banner dropped (its pole always ran off the top).
2. Scenes 0 and 9: the aspis is on the main layer at x .28/.30, y .60, by the elephant's feet / the king, above the
   subtitle band (y .62–.65 put it behind the subtitles, so .60 was used) and clear of the cover text.
3. Cover / scene 0: a thin low smoke wisp behind the elephant (x .82, base y .62, alpha .24) + the shield at its feet:
   it reads as the field after the fight.
4. Scene 8 (optional) not changed: `wc_letter` has no line-size parameter (the sheet keeps its minimum height); the
   quotation is fully legible.
Lint OK (no warnings), 497 chars, no STATIC; sheet and cover checked.
