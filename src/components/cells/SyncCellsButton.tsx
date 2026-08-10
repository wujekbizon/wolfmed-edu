import { syncCellsAction } from "@/actions/cells";
import { useCellsStore } from "@/store/useCellsStore";
import { useConfirmModalStore } from "@/store/useConfirmModalStore";
import { useTransition } from "react";
import SyncIcon from "../icons/SyncIcon";
import LoadingIcon from "../icons/LoadingIcon";

export function SyncCellsButton() {
  const [isPending, startTransition] = useTransition();
  const { dirty, saving, initialized, setCellsFromServer } = useCellsStore();
  const openConfirmModal = useConfirmModalStore((state) => state.openConfirmModal);

  const syncFromServer = () => {
    startTransition(async () => {
      const result = await syncCellsAction();
      if (result.success && result.data) {
        setCellsFromServer({
          order: result.data.order,
          cells: result.data.cells,
          version: result.data.version,
        });
      } else {
        console.error(result.error);
      }
    });
  };

  const handleSync = () => {
    if (dirty) {
      openConfirmModal({
        title: "Wczytać wersję serwera?",
        message: "Niezapisane zmiany lokalne zostaną odrzucone. Tej operacji nie można cofnąć.",
        confirmLabel: "Wczytaj z serwera",
        onConfirm: syncFromServer,
      });
      return;
    }
    syncFromServer();
  };

  return (
    <button
      onClick={handleSync}
      disabled={!initialized || isPending || saving}
      aria-label="Wczytaj planszę z serwera"
      className="flex items-center justify-center bg-slate-700 hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 w-8 h-8 rounded"
    >
      {isPending ? <LoadingIcon color="#9d1c0d" /> : <SyncIcon color="white"/>}
    </button>
  );
}
