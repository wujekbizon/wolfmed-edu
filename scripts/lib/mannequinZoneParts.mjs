/**
 * Click-hotspot volumes overlaying the GLB body, in the normalized space
 * MannequinGLTF produces: height 2.4 centered at the origin, so feet sit at
 * y -1.2 and the crown at y +1.2.
 *
 * These are a BUILD-TIME input only. bake-mannequin-zones.mjs uses them to
 * assign each vertex of the model to a zone; nothing renders them at runtime.
 *
 * Fitted to the mesh rather than estimated — run `node scripts/measure-mannequin.mjs`
 * to re-derive the per-band extents if the model is ever replaced, then re-bake.
 */
export const ZONE_PARTS = {
  glowa: [{ geometry: 'sphere', position: [0, 1.05, 0], args: [0.15, 20, 20] }],
  oczy: [
    { geometry: 'sphere', position: [-0.055, 1.09, 0.13], args: [0.05, 12, 12] },
    { geometry: 'sphere', position: [0.055, 1.09, 0.13], args: [0.05, 12, 12] },
  ],
  uszy: [
    { geometry: 'sphere', position: [-0.13, 1.06, -0.01], args: [0.05, 12, 12] },
    { geometry: 'sphere', position: [0.13, 1.06, -0.01], args: [0.05, 12, 12] },
  ],
  'usta-drogi-oddechowe': [
    { geometry: 'sphere', position: [0, 0.99, 0.13], args: [0.05, 12, 12] },
  ],
  'klatka-piersiowa': [
    { geometry: 'box', position: [0, 0.565, -0.04], args: [0.46, 0.43, 0.32] },
  ],
  brzuch: [{ geometry: 'box', position: [0, 0.2, -0.035], args: [0.46, 0.3, 0.31] }],
  miednica: [{ geometry: 'box', position: [0, -0.125, -0.03], args: [0.5, 0.35, 0.22] }],
  'konczyny-gorne': [
    {
      geometry: 'capsule',
      position: [-0.51, 0.175, 0],
      args: [0.08, 0.54, 8, 16],
      rotation: [0, 0, -0.38],
    },
    {
      geometry: 'capsule',
      position: [0.51, 0.175, 0],
      args: [0.08, 0.54, 8, 16],
      rotation: [0, 0, 0.38],
    },
  ],
  'konczyny-dolne': [
    {
      geometry: 'capsule',
      position: [-0.205, -0.675, 0],
      args: [0.09, 0.675, 8, 16],
      rotation: [0, 0, -0.11],
    },
    {
      geometry: 'capsule',
      position: [0.205, -0.675, 0],
      args: [0.09, 0.675, 8, 16],
      rotation: [0, 0, 0.11],
    },
  ],
  // Sits behind the torso so the chest and abdomen boxes still win from the
  // front; it only becomes the nearest hit once the camera swings around.
  plecy: [{ geometry: 'box', position: [0, 0.3, -0.17], args: [0.46, 1.0, 0.14] }],
}
