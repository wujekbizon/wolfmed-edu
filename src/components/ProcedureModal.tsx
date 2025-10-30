import { Procedure } from "@/types/dataTypes"
import ProcedureContent from "./ProcedureContent"

export default function ProcedureModal({
    procedure,
    onClose
}: {
    procedure: Procedure
    onClose: () => void
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center animate-fadeInUp">
            <div className="w-full max-w-7xl h-[95vh] md:h-[90vh] rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-slideInUp">
                <ProcedureContent procedure={procedure} onClose={onClose} />
            </div>
        </div>
    )
}