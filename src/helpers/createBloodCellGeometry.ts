import { Color, Float32BufferAttribute, LatheGeometry, Vector2 } from 'three'

export function createBloodCellGeometry() {
  const points = Array.from({ length: 65 }, (_, index) => {
    const angle = (index / 64) * Math.PI
    const radius = Math.sin(angle)
    const height = -Math.cos(angle) * (0.12 + 0.48 * radius * radius)
    return new Vector2(radius, height)
  })
  const geometry = new LatheGeometry(points, 64)
  const positions = geometry.getAttribute('position')
  const colors: number[] = []
  const color = new Color()
  for (let index = 0; index < positions.count; index++) {
    const radius = Math.hypot(positions.getX(index), positions.getZ(index))
    const shade = 0.62 + 0.38 * Math.min(radius / 0.7, 1)
    color.setRGB(shade, shade, shade)
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geometry
}
