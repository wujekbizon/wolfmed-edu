// Axis ticks need a fixed, narrow width; formatMinutes would render "37 h 30 min"
// for a single tick and push the axis wide enough to squeeze the plot area.
export function formatCompactMinutes(minutes: number): string {
  if (minutes < 1000) return String(minutes)
  return `${(minutes / 1000).toFixed(1).replace('.0', '').replace('.', ',')}k`
}
