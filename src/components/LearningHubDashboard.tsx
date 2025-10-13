"use client"

import { useState } from "react"
import PDFViewer from "./reader/PDFViewer"
import CategoryGrid from "./CategoryGrid"
import NotesSection from "./NotesSection"
import CellList from "./cells/CellList"
import type { PopulatedCategories } from "@/types/categoryType"
import type { NotesType } from "@/types/notesTypes"
import { UserCellsList } from "@/types/cellTypes"

const combinedMaterials = [
    { id: 1, title: "file2.pdf", type: "pdf", category: "test-category", date: "2025-10-05", isUser: true },
    { id: 2, title: "file3.pdf", type: "pdf", category: "test-category", date: "2025-10-05", isUser: true },
    { id: 3, title: "Procedury Medyczne", type: "note", category: "pielęgniarstwo", date: "2025-10-03", isUser: true },
    { id: 5, title: "video.mp4", type: "video", category: "pielęgniarstwo", date: "2025-09-25", isUser: false },
]

export default function LearningHubDashboard({ categories, notes, cells}: {
    categories: PopulatedCategories[]
    notes:NotesType[]
    cells: UserCellsList
}) {

    const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

    const openPdfPreview = (title: string) => {
        setSelectedPdf(title)
    }

    const closePdfPreview = () => {
        setSelectedPdf(null)
    }

    const handleDownloadPdf = () => {
        if (selectedPdf) {
            const link = document.createElement('a')
            link.href = `/${selectedPdf}`
            link.download = selectedPdf
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleOpenFullPdf = () => {
        if (selectedPdf) {
            window.open(`/${selectedPdf}`, '_blank')
        }
    }

    const openVideoPreview = (title: string) => {
        setSelectedVideo(title)
    }

    const closeVideoPreview = () => {
        setSelectedVideo(null)
    }

    return (
        <div className="w-full space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-800 mb-2">Centrum Nauki</h1>
                <p className="text-zinc-600">Twoje osobiste środowisko do nauki i rozwoju</p>
            </div>
           <CellList cells={cells}/>
            <NotesSection notes={notes} />
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
                <h2 className="text-xl font-bold text-zinc-800 mb-6">Dostępne Testy</h2>
                <CategoryGrid categories={categories} />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-zinc-800">Materiały i Zasoby</h2>
                    <div className="flex gap-2">
                        <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors">
                            + Dodaj Materiał
                        </button>
                        <button className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
                            Przeglądaj Zasoby
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {combinedMaterials.map((material) => (
                        <div key={material.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 hover:border-zinc-300/80 transition-all duration-300">
                            <div className="flex items-center mb-3">
                                <div className={`w-8 h-8 flex items-center justify-center mr-3 rounded-full ${material.type === 'pdf' ? 'bg-red-500' :
                                    material.type === 'video' ? 'bg-purple-500' : 'bg-green-500'
                                    }`}>
                                    {material.type === 'pdf' ? '📄' :
                                        material.type === 'video' ? '🎥' : '📝'}
                                </div>
                                <div>
                                    <h3 className="text-zinc-800 font-medium">{material.title}</h3>
                                    {material.isUser && (
                                        <span className="text-red-500 text-xs">Twoje</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-zinc-600 text-sm">
                                <span className="bg-zinc-100 px-2 py-1 text-xs rounded-full">{material.category}</span>
                                <span className="ml-2 text-zinc-500">{material.date}</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                {material.type === 'pdf' && (
                                    <button
                                        onClick={() => openPdfPreview(material.title)}
                                        className="text-blue-600 hover:text-blue-700 text-xs bg-zinc-100 px-3 py-1 rounded-full transition-colors hover:bg-zinc-200"
                                    >
                                        Podgląd PDF
                                    </button>
                                )}
                                {material.type === 'video' && (
                                    <button
                                        onClick={() => openVideoPreview(material.title)}
                                        className="text-blue-600 hover:text-blue-700 text-xs bg-zinc-100 px-3 py-1 rounded-full transition-colors hover:bg-zinc-200"
                                    >
                                        Podgląd Video
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {selectedPdf && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-md shadow-xl border border-zinc-200/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-webkit">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-zinc-800">Podgląd: {selectedPdf}</h3>
                            <button
                                onClick={closePdfPreview}
                                className="text-zinc-500 hover:text-zinc-800 text-2xl transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="bg-zinc-50 min-h-[500px] flex items-center justify-center rounded-xl border border-zinc-200/60">
                            {selectedPdf && <PDFViewer file={`/${selectedPdf}`} />}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={handleDownloadPdf}
                                className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200"
                            >
                                Pobierz
                            </button>
                            <button
                                onClick={handleOpenFullPdf}
                                className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700"
                            >
                                Otwórz pełny
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-md shadow-xl border border-zinc-200/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-webkit">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-zinc-800">Podgląd: {selectedVideo}</h3>
                            <button
                                onClick={closeVideoPreview}
                                className="text-zinc-500 hover:text-zinc-800 text-2xl transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="bg-zinc-50 min-h-[300px] flex items-center justify-center rounded-xl border border-zinc-200/60">
                            <video controls width="100%" height="auto" className="rounded-xl">
                                <source src={`/${selectedVideo}`} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => window.open(`/${selectedVideo}`, '_blank')}
                                className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700"
                            >
                                Otwórz pełny
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
