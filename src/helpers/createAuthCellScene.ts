import {
  ACESFilmicToneMapping, AmbientLight, DirectionalLight, Mesh,
  MeshPhysicalMaterial, PerspectiveCamera, Scene, Timer, WebGLRenderer,
} from 'three'
import { authCells } from '@/constants/authCells'
import { createBloodCellGeometry } from './createBloodCellGeometry'
import { animateAuthCells } from './animateAuthCells'

export function createAuthCellScene(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = ACESFilmicToneMapping
  const scene = new Scene()
  const camera = new PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.z = 8.4
  const geometry = createBloodCellGeometry()
  const meshes = authCells.map((cell) => {
    const material = new MeshPhysicalMaterial({
      color: cell.color, vertexColors: true, roughness: 0.36,
      metalness: 0.08, clearcoat: 0.3, clearcoatRoughness: 0.4,
    })
    const mesh = new Mesh(geometry, material)
    mesh.position.set(...cell.position)
    mesh.rotation.set(...cell.rotation)
    mesh.scale.setScalar(cell.scale)
    scene.add(mesh)
    return mesh
  })
  const key = new DirectionalLight('#ffe2c8', 3.5)
  key.position.set(-3, 4, 5)
  const fill = new DirectionalLight('#ff6e73', 1.6)
  fill.position.set(4, -1, 2)
  const rim = new DirectionalLight('#ffc4ac', 3)
  rim.position.set(0, 2, -4)
  scene.add(new AmbientLight('#fbe4df', 0.8), key, fill, rim)
  const timer = new Timer()
  timer.connect(document)
  let elapsed = 0
  let pointerX = 0
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
  const move = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect()
    pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  }
  const leave = () => { pointerX = 0 }
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerleave', leave)

  return {
    setPaused(paused: boolean) {
      timer.reset()
      renderer.setAnimationLoop(paused ? null : (timestamp) => {
        timer.update(timestamp)
        const delta = Math.min(timer.getDelta(), 0.05)
        elapsed += delta
        animateAuthCells(meshes, elapsed, delta, pointerX)
        renderer.render(scene, camera)
      })
    },
    dispose() {
      renderer.setAnimationLoop(null)
      observer.disconnect()
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
      timer.dispose()
      geometry.dispose()
      meshes.forEach((mesh) => mesh.material.dispose())
      renderer.dispose()
    },
  }
}
