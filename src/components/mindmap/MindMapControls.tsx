import { DownloadIcon } from "@/components/mindmap/icons"
import type { LayoutMode } from "@/lib/mindmap/buildFlowGraph"

const layoutButton = (active: boolean) =>
  `rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
    active ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-100"
  }`

export default function MindMapControls({
  layout,
  onLayoutChange,
  onExport,
}: {
  layout: LayoutMode
  onLayoutChange: (layout: LayoutMode) => void
  onExport: () => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 p-1 backdrop-blur-sm">
      <button type="button" onClick={() => onLayoutChange("radial")} className={layoutButton(layout === "radial")}>
        Promienisty
      </button>
      <button type="button" onClick={() => onLayoutChange("tree")} className={layoutButton(layout === "tree")}>
        Drzewo
      </button>
      <span className="mx-0.5 h-4 w-px bg-white/10" />
      <button
        type="button"
        onClick={onExport}
        title="Pobierz PNG"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <DownloadIcon />
        PNG
      </button>
    </div>
  )
}
