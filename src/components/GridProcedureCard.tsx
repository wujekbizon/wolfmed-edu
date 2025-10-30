import { useState } from 'react'
import { MoreVertical, Check, AlertCircle, ArrowRight, Circle } from 'lucide-react'
import { Procedure, ProcedureStatus } from "@/types/dataTypes"
import Image from 'next/image'

export default function GridProcedureCard({
    procedure,
    status,
    onStatusChange,
    onOpenModal
}: {
    procedure: Procedure
    status: ProcedureStatus
    onStatusChange: (status: ProcedureStatus) => void
    onOpenModal: () => void
}) {
    const [showMenu, setShowMenu] = useState(false)
    const { name, procedure: procedureText, image } = procedure.data

    const truncatedDescription = procedureText.slice(0, 120) + (procedureText.length > 120 ? '...' : '')

    const statusConfig = {
        normal: {
            border: 'border-zinc-400/60',
            bg: 'bg-white',
            badge: null
        },
        ukończone: {
            border: 'border-emerald-700/20',
            bg: 'bg-white',
            badge: <div className="absolute top-3 left-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-md z-10">
                <Check className="w-4 h-4" />
            </div>
        },
        trudne: {
            border: 'border-[#ffa5a5]/30',
            bg: 'bg-white',
            badge: <div className="absolute top-3 left-3 bg-[#ffa5a5] text-white rounded-full p-1.5 shadow-md z-10">
                <AlertCircle className="w-4 h-4" />
            </div>
        }
    }

    const config = statusConfig[status]

    return (
        <div className={`relative group border ${config.border} ${config.bg} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}>
            {config.badge}
            <div className="absolute top-3 right-3 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(!showMenu)
                    }}
                    className="p-1.5 bg-white/80 hover:bg-white rounded-full border border-transparent hover:border-zinc-200 transition-colors shadow-md backdrop-blur-sm"
                >
                    <MoreVertical className="w-5 h-5 text-zinc-600" />
                </button>

                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowMenu(false)
                            }}
                        />
                        <div className="absolute right-0 top-10 bg-white border border-zinc-200 rounded-lg shadow-xl py-1 min-w-[150px] z-30">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onStatusChange('normal')
                                    setShowMenu(false)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-2"
                            >
                                <Circle className="w-4 h-4 text-zinc-400" />
                                Normalne
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onStatusChange('ukończone')
                                    setShowMenu(false)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Ukończone
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onStatusChange('trudne')
                                    setShowMenu(false)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                                style={{ color: '#ffa5a5' }}
                            >
                                <AlertCircle className="w-4 h-4" />
                                Trudne
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="aspect-square w-full h-[300px] relative overflow-hidden">
                <Image
                    src={image}
                    alt={name}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="flex flex-col grow p-5">
                <h3 className="text-lg font-bold text-zinc-800 mb-2 line-clamp-2 leading-tight">{name}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed mb-4 line-clamp-3 grow">{truncatedDescription}</p>
                <div className="mt-auto flex justify-end">
                    <button
                        onClick={onOpenModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all hover:gap-2"
                    >
                        Rozpocznij procedurę
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}