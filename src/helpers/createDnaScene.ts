import {
  ACESFilmicToneMapping, AmbientLight, DirectionalLight,
  PerspectiveCamera, Scene, WebGLRenderer,
} from 'three'
import { createDnaModel } from './createDnaModel'

export function createDnaScene(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = ACESFilmicToneMapping
  const scene = new Scene()
  const camera = new PerspectiveCamera(38, 1, 0.1, 50)
  camera.position.z = 9
  const dna = createDnaModel()
  dna.model.rotation.set(0.12, 0.45, -0.42)
  scene.add(dna.model)
  const key = new DirectionalLight('#ffe3cb', 3.6)
  key.position.set(-3, 4, 5)
  const rim = new DirectionalLight('#ff879a', 2.4)
  rim.position.set(4, 1, -2)
  scene.add(new AmbientLight('#f5d7de', 1.3), key, rim)
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect()
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    renderer.render(scene, camera)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  let elapsed = 0
  let previous = 0

  return {
    setPaused(paused: boolean) {
      previous = 0
      renderer.setAnimationLoop(paused ? null : (timestamp) => {
        if (previous && timestamp - previous < 1000 / 30) return
        elapsed += previous ? Math.min((timestamp - previous) / 1000, 0.1) : 0
        previous = timestamp
        dna.model.rotation.y = 0.45 + Math.sin(elapsed * 0.24) * 0.3
        dna.model.rotation.z = -0.42 + Math.sin(elapsed * 0.18) * 0.035
        dna.model.position.y = Math.sin(elapsed * 0.35) * 0.07
        renderer.render(scene, camera)
      })
    },
    dispose() {
      renderer.setAnimationLoop(null)
      observer.disconnect()
      dna.dispose()
      renderer.dispose()
    },
  }
}
