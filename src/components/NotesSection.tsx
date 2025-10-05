"use client"

import { useState } from "react"

// Dummy data for prototyping - will be replaced with real data from DB
const dummyNotes = [
    { id: 1, title: "Anatomia - Układ nerwowy", content: "Notatki o budowie układu nerwowego...", category: "anatomia", date: "2025-10-05", lastEdited: "2 godziny temu" },
    { id: 2, title: "Farmakologia - Leki przeciwbólowe", content: "Działanie i zastosowanie popularnych leków...", category: "farmakologia", date: "2025-10-04", lastEdited: "1 dzień temu" },
    { id: 3, title: "Pielęgniarstwo - Procedury", content: "Standardowe procedury medyczne...", category: "pielęgniarstwo", date: "2025-10-03", lastEdited: "2 dni temu" },
    { id: 4, title: "Biochemia - Metabolizm", content: "Procesy metaboliczne w organizmie...", category: "biochemia", date: "2025-10-02", lastEdited: "3 dni temu" },
    { id: 5, title: "Mikrobiologia - Bakterie", content: "Charakterystyka głównych grup bakterii...", category: "mikrobiologia", date: "2025-10-01", lastEdited: "4 dni temu" },
    { id: 6, title: "Genetyka - Dziedziczenie", content: "Podstawy dziedziczenia cech...", category: "genetyka", date: "2025-09-30", lastEdited: "5 dni temu" }
]

export default function NotesSection() {
    const [filter, setFilter] = useState<"recent" | "all">("recent")
    const [selectedNote, setSelectedNote] = useState<number | null>(null)

    const filteredNotes = filter === "recent"
        ? dummyNotes.slice(0, 5)
        : dummyNotes

    const openNote = (id: number) => {
        setSelectedNote(id)
    }

    const closeNote = () => {
        setSelectedNote(null)
    }

    const getSelectedNote = () => {
        return dummyNotes.find(note => note.id === selectedNote)
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-800">Moje Notatki</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("recent")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "recent"
                                ? "bg-red-500 text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800"
                            }`}
                    >
                        Ostatnie 5
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all"
                                ? "bg-red-500 text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800"
                            }`}
                    >
                        Wszystkie
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors">
                        + Nowa Notatka
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => (
                    <div key={note.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 hover:border-zinc-300/80 transition-all duration-300 cursor-pointer">
                        <div onClick={() => openNote(note.id)}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-zinc-800 font-medium text-base">{note.title}</h3>
                                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                                    {note.category}
                                </span>
                            </div>
                            <p className="text-zinc-600 text-sm mb-3 line-clamp-3 leading-relaxed">
                                {note.content}
                            </p>
                            <div className="flex justify-between items-center text-zinc-500 text-xs">
                                <span>{note.date}</span>
                                <span>{note.lastEdited}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button className="text-blue-600 hover:text-blue-700 text-xs bg-zinc-100 px-3 py-1 rounded-full transition-colors hover:bg-zinc-200">
                                Edytuj
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-xs bg-zinc-100 px-3 py-1 rounded-full transition-colors hover:bg-zinc-200">
                                Usuń
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {selectedNote && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60 w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-zinc-800">{getSelectedNote()?.title}</h3>
                            <button
                                onClick={closeNote}
                                className="text-zinc-500 hover:text-zinc-800 text-2xl transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                                    {getSelectedNote()?.category}
                                </span>
                                <span className="text-zinc-500 text-sm">{getSelectedNote()?.date}</span>
                                <span className="text-zinc-500 text-sm">{getSelectedNote()?.lastEdited}</span>
                            </div>
                            <div className="text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                {getSelectedNote()?.content}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
                                Edytuj
                            </button>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors">
                                Eksportuj
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {filteredNotes.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4 text-zinc-300">📝</div>
                    <h3 className="text-xl text-zinc-500 mb-2 font-medium">Brak notatek</h3>
                    <p className="text-zinc-400">Stwórz swoją pierwszą notatkę!</p>
                </div>
            )}
        </div>
    )
}
