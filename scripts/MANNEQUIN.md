# 3D Mannequin — how it works and how to change it

The "Wykonanie na fantomie" step of the diagnozy exam: the student picks an
intervention, then clicks where on the patient it is performed. This file covers
the whole flow, from the model file to how an answer is graded.

---

## Where everything comes from

```
public/models/mannequin.glb          the model (546 KB, CC-BY-4.0 — see CREDITS.md)
public/models/mannequin-zones.json   vertex → body zone map            ← GENERATED
data/diagnozy.json                   exam.bodyZone — the correct answer
src/types/diagnozyTypes.ts           BODY_ZONES — the 12 zone names
scripts/lib/mannequinZoneParts.mjs   zone volumes (build-time only, never rendered)
```

Only `mannequin-zones.json` is generated. Everything else is a source file.

---

## What happens in the browser

1. `MannequinBody.tsx` fetches the `.glb` **and** `mannequin-zones.json`.
2. `buildMannequinGeometry` scales the model to height 2.4 and centres it on the
   origin, so the zone map lines up regardless of how the model was exported.
3. A click raycasts the real geometry → reads the vertex index off the hit
   triangle → looks up the zone. **There are no invisible hit shapes.**
4. Highlighting: an `aHighlight` attribute (0–1 per vertex) is added to
   `totalEmissiveRadiance` via `onBeforeCompile`.

> **Why emissive rather than vertex colours?** Vertex colours *multiply* the base
> texture, so on a brown body they can only darken it. Pushing them above 1
> brightens, but it also amplifies the texture until the model's palette atlas
> shows through as coloured blocks. Emissive adds light and never touches the map.

---

## Task 1 — fix a zone's reach

Symptom: you click the forearm and the torso highlights.

```bash
# 1. Turn on the zone preview
#    /panel/diagnozy/egzamin → "Pokaż strefy" (dev builds only)
#    The body recolours by zone, so the boundaries are visible directly.

# 2. Adjust the volume in scripts/lib/mannequinZoneParts.mjs
#    Space: y -1.2 = feet, y +1.2 = crown, positive x = the patient's LEFT

# 3. Re-bake the map
node scripts/bake-mannequin-zones.mjs

# 4. Reload and check the preview again
```

The script prints the share of vertices per zone. If `brzuch` is 2% while
`klatka-piersiowa` is 8%, the chest box is reaching too far down.

**The `PRIORITY` order in `bake-mannequin-zones.mjs` matters.** The eye spheres
sit inside the head sphere and the back box overlaps the chest, so volumes are
tested smallest-first — otherwise the larger one swallows the smaller.

---

## Task 2 — replace the model

```bash
# 1. Swap public/models/mannequin.glb (update CREDITS.md — it's a licence term)

# 2. Measure the new model
node scripts/measure-mannequin.mjs
#    Prints x/z extents per height band and separates limbs from torso:
#     0.40..0.50 | [-0.46,-0.31] [-0.22,0.22] [0.31,0.46]
#                      arm            torso        arm

# 3. Use those numbers to refit scripts/lib/mannequinZoneParts.mjs
# 4. node scripts/bake-mannequin-zones.mjs
# 5. Verify with the zone preview
```

Files in `public/` are served unhashed, so browsers cache the `.glb` by path.
When replacing it, rename the file (e.g. `mannequin-v2.glb`) rather than
overwriting — otherwise returning users may keep the stale model.

---

## Task 3 — correct the answers (`exam.bodyZone`)

The mannequin step only grades interventions that carry `exam.bodyZone` in
`data/diagnozy.json`. Without it, the intervention is skipped at grading time.

```bash
node scripts/suggest-body-zones.mjs --resuggest   # → data/body-zones-review.csv
#   Correct the finalZone column in Excel.
#   Blank = no body site (education, emotional support) — that's expected.

node scripts/apply-body-zones.mjs --dry-run       # reports counts, writes nothing
node scripts/apply-body-zones.mjs                 # → data/diagnozy.json
npx tsx scripts/seed-diagnozy.ts                  # validates, then loads the table
```

- Without `--resuggest` the script **keeps** values already in `diagnozy.json`.
  After changing the rules in `lib/bodyZoneRules.mjs` you want `--resuggest`, or
  the old values stay put. The `previousZone` column shows what each row replaces.
- `apply` matches rows on `slug` + `index` **and verifies the intervention text**,
  so a stale CSV aborts instead of writing zones onto the wrong interventions.
- The CSV is gitignored — it's a working file, regenerated in a second.
- `seed-diagnozy.ts` runs `TRUNCATE` and re-inserts. Ids and slugs are preserved,
  so user progress and attempt history (keyed on `diagnozaSlug`) survive.

---

## The scripts

| File | When to run it |
|---|---|
| `bake-mannequin-zones.mjs` | after any change to a volume or the model |
| `measure-mannequin.mjs` | only when replacing the model |
| `suggest-body-zones.mjs` | when changing the rules or reviewing the answers |
| `apply-body-zones.mjs` | after reviewing the CSV |
| `lib/mannequinZoneParts.mjs` | zone volumes — edited, not run |
| `lib/bodyZoneRules.mjs` | keyword rules — edited, not run |

All run under plain `node` with no `tsx` step, hence the `.mjs` extension.

---

## Things worth knowing

**Sides are the patient's, not the screen's.** A figure facing the camera has its
left side toward positive x — screen-right. The "Lewy bok" / "Prawy bok" buttons
show the *patient's* sides, matching how nursing notes are written.

**Keyword rules need a leading `\b` on the stem.** `ran(a|y|ę|ie)` without one
matches inside "Pobie-ranie", which filed every blood draw under `skora`. When
adding a pattern, check the stem doesn't live inside an unrelated word.

**Known gaps:** `timeSpent` is asserted by the client and not verified on the
server; an exam in progress does not survive a page refresh.
