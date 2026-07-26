import * as THREE from 'three'

const HIGHLIGHT_COLOR = new THREE.Color('#cfe8ff')

/**
 * Clones the model's skin material and injects the highlight as emissive
 * radiance driven by the per-vertex aHighlight attribute.
 *
 * Emissive rather than a vertex-colour tint: vertex colours multiply the base
 * map, so they can only darken a brown body, and pushing them above 1 to
 * brighten it revealed the palette atlas as coloured blocks.
 */
export function createMannequinMaterial(
  source: THREE.MeshStandardMaterial
): THREE.MeshStandardMaterial {
  const material = source.clone()

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHighlightColor = { value: HIGHLIGHT_COLOR }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float aHighlight;\nvarying float vHighlight;'
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvHighlight = aHighlight;'
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 uHighlightColor;\nvarying float vHighlight;'
      )
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uHighlightColor * vHighlight;'
      )
  }

  // Without this the injected program is shared with the untouched material.
  material.customProgramCacheKey = () => 'mannequin-highlight'

  return material
}
