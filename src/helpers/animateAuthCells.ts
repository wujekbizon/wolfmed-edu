import { MathUtils } from 'three'
import { authCells } from '@/constants/authCells'
import type { AuthCellMesh } from '@/types/authTypes'

export function animateAuthCells(meshes: AuthCellMesh[], elapsed: number, delta: number, pointerX: number) {
  meshes.forEach((mesh, index) => {
    const cell = authCells[index]!
    const time = elapsed * 0.22 + cell.phase
    mesh.position.y = cell.position[1] + Math.sin(time) * 0.14
    mesh.rotation.x = cell.rotation[0] + Math.sin(time * 0.7) * 0.14
    mesh.rotation.z = cell.rotation[2] + Math.cos(time * 0.8) * 0.1
    mesh.rotation.y = MathUtils.damp(mesh.rotation.y, cell.rotation[1] + pointerX * 0.18, 2, delta)
  })
}
