import {
  CatmullRomCurve3, CylinderGeometry, Group, Mesh, MeshStandardMaterial,
  SphereGeometry, TubeGeometry, Vector3,
  type BufferGeometry,
} from 'three'

export function createDnaModel() {
  const model = new Group()
  const sphere = new SphereGeometry(0.12, 16, 12)
  const cylinder = new CylinderGeometry(0.045, 0.045, 1, 10)
  const materials = ['#eb967c', '#c46980'].map((color) => new MeshStandardMaterial({
    color, roughness: 0.32, metalness: 0.12,
  }))
  const geometries: BufferGeometry[] = [sphere, cylinder]
  const up = new Vector3(0, 1, 0)

  for (const range of [[0, 7], [10, 17]]) {
    const first = range[0]!
    const last = range[1]!
    for (let strand = 0; strand < 2; strand++) {
      const points: Vector3[] = []
      for (let step = first * 8; step <= last * 8; step++) {
        const index = step / 8
        const angle = index * 0.48 + strand * Math.PI
        points.push(new Vector3(Math.cos(angle) * 0.78, (index - 8.5) * 0.29, Math.sin(angle) * 0.78))
      }
      const backbone = new TubeGeometry(new CatmullRomCurve3(points), 72, 0.065, 8, false)
      geometries.push(backbone)
      model.add(new Mesh(backbone, materials[strand]))
      for (let index = first; index <= last; index++) {
        const angle = index * 0.48 + strand * Math.PI
        const point = new Vector3(Math.cos(angle) * 0.78, (index - 8.5) * 0.29, Math.sin(angle) * 0.78)
        const bead = new Mesh(sphere, materials[strand])
        bead.position.copy(point)
        model.add(bead)
        const center = new Vector3(0, point.y, 0)
        const direction = point.clone().sub(center)
        const bond = new Mesh(cylinder, materials[strand])
        bond.position.copy(center).addScaledVector(direction, 0.5)
        bond.scale.y = direction.length()
        bond.quaternion.setFromUnitVectors(up, direction.normalize())
        model.add(bond)
      }
    }
  }

  return {
    model,
    dispose() {
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
    },
  }
}
