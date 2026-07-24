# 3D model attribution

`mannequin.glb` — the patient body used in the Egzamin (Diagnozy i Interwencje)
mannequin step.

This work is based on **"Human Models Set - Male/Female (Rigged)"**
(https://sketchfab.com/3d-models/human-models-set-malefemale-rigged-7311fcfdc03e4234900eeced42a1e669)
by **lzyassoul** (https://sketchfab.com/lzyassoul), licensed under
**CC-BY-4.0** (http://creativecommons.org/licenses/by/4.0/).

Commercial use is allowed; attribution is required — keep this credit wherever
the model is used or shared.

## Processing applied
The original set (two figures × rig/highpoly variants, ~6.5 MB) was pruned to the
single low-poly non-rigged male figure and re-welded/deduped with `gltf-transform`
(see `scripts/prune-mannequin.mjs`), yielding a ~0.5 MB `mannequin.glb`.
