import { ROOT_COLOR, CATEGORY_COLORS } from "@/lib/mindmap/design"

const LEGEND: { label: string; color: string; dashed?: boolean }[] = [
  { label: "Główny", color: ROOT_COLOR },
  { label: "Gałąź", color: CATEGORY_COLORS.anatomy },
  { label: "Liść", color: CATEGORY_COLORS.pathology },
  { label: "Zwinięty", color: CATEGORY_COLORS.treatment, dashed: true },
]

export default function MindMapLegend() {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 backdrop-blur-sm">
      {LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-[11px] text-zinc-300">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: item.color,
              outline: item.dashed ? `1.5px dashed ${item.color}` : undefined,
              outlineOffset: item.dashed ? 1 : undefined,
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  )
}
