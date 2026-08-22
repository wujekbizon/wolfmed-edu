import { Network, ListTree, UnfoldVertical, FoldVertical, LocateFixed } from "lucide-react"
import { DownloadIcon } from "@/components/mindmap/icons"
import type { MindMapControlsProps } from "@/types/mindmapControlsTypes"

const ICON_SIZE = 15

const layoutButton = (active: boolean) =>
  `flex items-center justify-center rounded-md p-1.5 transition-colors ${
    active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
  }`

const actionButton =
  "flex items-center justify-center rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100"

export default function MindMapControls({
  layout,
  onLayoutChange,
  onExport,
  onExpandAll,
  onCollapseAll,
  onResetView,
}: MindMapControlsProps) {
  return (
    <div className="flex max-w-[calc(100vw-1rem)] flex-wrap items-center justify-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 p-1 backdrop-blur-sm md:justify-end">
      <button type="button" onClick={() => onLayoutChange("radial")} title="Układ promienisty" className={layoutButton(layout === "radial")}>
        <Network size={ICON_SIZE} />
      </button>
      <button type="button" onClick={() => onLayoutChange("tree")} title="Układ drzewo" className={layoutButton(layout === "tree")}>
        <ListTree size={ICON_SIZE} />
      </button>
      <span className="mx-0.5 h-4 w-px bg-white/10" />
      <button type="button" onClick={onExpandAll} title="Rozwiń wszystkie gałęzie" className={actionButton}>
        <UnfoldVertical size={ICON_SIZE} />
      </button>
      <button type="button" onClick={onCollapseAll} title="Zwiń wszystkie gałęzie" className={actionButton}>
        <FoldVertical size={ICON_SIZE} />
      </button>
      <button type="button" onClick={onResetView} title="Wyśrodkuj widok" className={actionButton}>
        <LocateFixed size={ICON_SIZE} />
      </button>
      <span className="mx-0.5 h-4 w-px bg-white/10" />
      <button
        type="button"
        onClick={onExport}
        title="Pobierz PNG"
        className={`gap-1 text-[11px] font-medium ${actionButton}`}
      >
        <DownloadIcon />
        PNG
      </button>
    </div>
  )
}
