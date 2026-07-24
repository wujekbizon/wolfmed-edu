# Professional 3D mannequin — sourcing & integration plan

Goal: replace the procedural placeholder patient with a professional model
**without rebuilding the interaction or grading**. That's viable because the
interaction layer is already model-agnostic — `MannequinModel` maps the 12-region
`BodyZone` enum to geometry, and everything downstream (`WykonanieStep`,
`gradeWykonanie`, the exam payload, the zone-button rail) speaks only in region
enums. A new model is a **visual swap behind that contract**, not a rewrite.

We do not need to model from scratch — reuse an existing asset.

## Decision criteria

1. **License fit for a paid product** (Wolfmed sells courses):
   - ✅ **CC0** (public domain) — ideal, no attribution needed.
   - ✅ **CC-BY** — fine, requires visible attribution (author + source + license).
   - ⚠️ **CC-BY-SA** — share-alike is "viral"; risky for a commercial app. Avoid.
   - ❌ **CC-BY-NC** — non-commercial forbids our use. Never.
   - For AI-generated assets, read the generator's ownership/commercial terms.
2. **Format**: glTF/GLB (three.js native, what drei's `useGLTF` loads).
3. **Weight**: web-friendly — target **< 2–3 MB**, Draco/meshopt compressed.
4. **Pose**: supine (lying, like the real exam dummy) is ideal; a neutral
   standing/T-pose is acceptable and easier to source.

## Options (ranked)

### Option A — CC0/CC-BY body + our own invisible hotspots (recommended first)
Take a clean low-poly human and **do not rely on it being pre-segmented**. Keep
our region logic by overlaying **invisible proxy meshes** (simple boxes/spheres)
at each body region as the click targets, positioned over the visible model.
Clicks are decoupled from the model's mesh topology, so *any* model works and
swapping models never breaks zones. This is essentially what the current
placeholder already does — the primitives just become invisible colliders.
- Sources: Meshy CC0 anatomy/medical, Open Source 3D Assets (CC0),
  Quaternius (CC0 low-poly humans), Sketchfab filtered to CC0/CC-BY.
- Pros: license-safe, model-agnostic, least rework. Cons: hotspots placed by
  hand once (we already have the coordinates from the placeholder).

### Option B — Segmented model with named meshes + gltfjsx
Use a model already split into named meshes (`head`, `chest`, `arm_l`…). Run it
through **gltfjsx** (https://gltf.pmnd.rs/) to generate a typed component exposing
`nodes`, then attach `onClick` per mesh mapped to our `BodyZone` enum with
`e.stopPropagation()`.
- Pros: clicks hit real anatomy precisely. Cons: needs a well-named segmented
  model; a mesh→region remap is required whenever the model changes.

### Option C — Generate a bespoke supine patient
- **MakeHuman** (open-source, CC0 output): parametric human → pose supine →
  export GLB. Full control, clean license.
- **AI text-to-3D** (Meshy / Luma Genie / Tripo): "patient lying on hospital
  bed" → GLB. Fast; quality/topology varies and may need retopo; verify terms.
- Pros: exactly the "patient on a bed" asset. Cons: a modeling/cleanup pass.

## Recommended path

1. **Now**: Option A — source one CC0/CC-BY low-poly human, drop it behind the
   existing region proxies. Immediate "real body" look, zero interaction rework,
   clean licensing.
2. **Later**: Option B if precise anatomical clicks are wanted.
3. **When there's a modeling pass**: Option C (MakeHuman supine) for the ideal
   exam-dummy look.

## Integration steps (any option)

- **No new deps** — `@react-three/fiber` + `@react-three/drei` are already
  installed; `useGLTF` loads GLB.
- Place the asset at `public/models/mannequin.glb` (served statically — **not**
  an npm/module import). Preload: `useGLTF.preload('/models/mannequin.glb')`.
- **Compress** with `gltf-transform` (Draco or meshopt) to hit the size target.
- In `MannequinModel`:
  - Option A: render `<primitive object={scene} />` for the visible body +
    keep the current region groups but as **invisible** (`material transparent,
    opacity 0`, or `visible={false}` with a raycast-only material) click proxies.
  - Option B: render the gltfjsx component, `onClick` per named node → region.
- **Unchanged**: `MannequinScene` (Canvas, lights, OrbitControls),
  `WykonanieStep`, `gradeWykonanie`, exam payload, zone-button rail. They already
  speak in region enums.
- Keep `next/dynamic` + `ssr:false` so three.js stays off the server bundle and
  off every non-exam route.
- Self-hosting the GLB means no external fetch — safe under any CSP.

## Licensing checklist (before shipping any asset)

- [ ] License permits commercial use **and** redistribution inside a web app.
- [ ] CC-BY → add attribution (author, source URL, license) on a credits page or
      a comment beside the asset.
- [ ] Not CC-BY-NC; ideally not CC-BY-SA.
- [ ] AI-generated → generator's terms grant commercial ownership.
- [ ] Record chosen asset's source + license in `docs/INDEX.md` (repo convention).

## The contract that must not change

`BodyZone` taxonomy · `WykonanieStep` · `gradeWykonanie` · exam payload · zone
buttons. Any professional model plugs in behind these — swap the geometry,
keep the logic.

## References
- Sketchfab rigged human set (CC-BY): https://sketchfab.com/3d-models/human-models-set-malefemale-rigged-7311fcfdc03e4234900eeced42a1e669
- Meshy free anatomy/medical (CC0): https://www.meshy.ai/tags/anatomy · https://www.meshy.ai/tags/medical
- Open Source 3D Assets (CC0 GLB): https://www.opensource3dassets.com/en
- AnatomyTOOL open 3D (CC-BY-SA — commercial-risky): https://anatomytool.org/open3dmodel
- r3f "clickable body areas" discussion: https://github.com/pmndrs/react-three-fiber/discussions/2629
- gltfjsx (GLB → typed R3F component): https://gltf.pmnd.rs/
- drei loading-models docs: https://r3f.docs.pmnd.rs/tutorials/loading-models
