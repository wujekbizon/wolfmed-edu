import { syncCellsAction } from "@/actions/cells";
import { useCellsStore } from "@/store/useCellsStore";
import { useTransition } from "react";
import SyncIcon from "../icons/SyncIcon";
import LoadingIcon from "../icons/LoadingIcon";

export function SyncCellsButton() {
  const [isPending, startTransition] = useTransition();
  const {setCells} = useCellsStore();

  const handleSync = () => {
    startTransition(async () => {
      const result = await syncCellsAction();
      if (result.success && result.data) {
        setCells(result.data.order,result.data.cells);
      } else {
        console.error(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className="flex items-center justify-center bg-slate-700 hover:bg-slate-800 transition-colors cursor-pointer w-8 h-8 rounded"
    >
      {isPending ? <LoadingIcon color="#9d1c0d" /> : <SyncIcon color="white"/>}
    </button>
  );
}