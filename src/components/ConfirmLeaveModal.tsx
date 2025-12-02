export default function ConfirmLeaveModal({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm text-center">
                <p className="mb-4 text-lg font-semibold text-white">
                   Czy na pewno chcesz zakończyć test?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                    >
                        Zostań
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                        Zakończ test
                    </button>
                </div>
            </div>
        </div>
    )
}