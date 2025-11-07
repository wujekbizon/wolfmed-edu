"use client";

import { useState } from "react";
import PDFViewer from "./reader/PDFViewer";
import CategoryGrid from "./CategoryGrid";
import NotesSection from "./NotesSection";
import CellList from "./cells/CellList";
import UploadMaterialForm from "./UploadMaterialForm";
import MaterialCard from "./MaterialCard";
import type { PopulatedCategories } from "@/types/categoryType";
import type { NotesType } from "@/types/notesTypes";
import type { MaterialsType } from "@/types/materialsTypes";
import CloseIcon from "./icons/Close";

export default function LearningHubDashboard({
  categories,
  notes,
  materials,
}: {
  categories: PopulatedCategories[];
  notes: NotesType[];
  materials: MaterialsType[];
}) {
  const [selectedPdf, setSelectedPdf] = useState<{
    src: string;
    title?: string;
  } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    src: string;
    title?: string;
  } | null>(null);
  const [selectedText, setSelectedText] = useState<{
    src?: string;
    content: string;
    title?: string;
  } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const openPdfPreview = (src: string, title?: string) => {
    setSelectedPdf(title === undefined ? { src } : { src, title });
  };

  const closePdfPreview = () => {
    setSelectedPdf(null);
  };

  const handleDownloadPdf = () => {
    if (selectedPdf?.src) {
      const link = document.createElement("a");
      link.href = selectedPdf.src;
      link.download = selectedPdf.src.split("/").pop() ?? "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenFullPdf = () => {
    if (selectedPdf?.src) {
      window.open(selectedPdf.src, "_blank");
    }
  };

  const openVideoPreview = (src: string, title?: string) => {
    setSelectedVideo(title === undefined ? { src } : { src, title });
  };

  const closeVideoPreview = () => {
    setSelectedVideo(null);
  };

  const openTextPreview = async (src: string, title?: string) => {
    try {
      const res = await fetch(src);
      const content = await res.text();
      setSelectedText(title ? { src, content, title } : { src, content });
    } catch (err) {
      const errorContent = "Błąd wczytywania pliku.";
      setSelectedText(title ? { src, content: errorContent, title } : { src, content: errorContent });
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-800 mb-2">Centrum Nauki</h1>
        <p className="text-zinc-600">
          Twoje osobiste środowisko do nauki i rozwoju
        </p>
      </div>
      <CellList />
      <NotesSection notes={notes} />
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
        <h2 className="text-xl font-bold text-zinc-800 mb-6">Dostępne Testy</h2>
        <CategoryGrid categories={categories} />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-zinc-800">
            Materiały i Zasoby
          </h2>
          <button
            className="bg-slate-600 text-white px-4 py-2 cursor-pointer rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Dodaj Materiał
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onOpenPdf={openPdfPreview}
              onOpenVideo={openVideoPreview}
              onOpenText={openTextPreview}
            />
          ))}
        </div>
        {materials.length === 0 && (
          <div className="flex w-full flex-col items-center justify-center">
            <div className="text-5xl mb-4 text-zinc-300">📝</div>
            <h3 className="text-xl text-zinc-500 mb-2 font-medium">
              Brak dostepnych materiałów
            </h3>
            <p className="text-zinc-400">Dodaj swój pierwszy materiał!</p>
          </div>
        )}
      </div>
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-md shadow-xl border border-zinc-200/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-webkit">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-zinc-800">
                Podgląd: {selectedPdf.title ?? selectedPdf.src ?? ""}
              </h3>
              <button
                onClick={closePdfPreview}
                className="text-zinc-500 hover:text-zinc-800 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="bg-zinc-50 min-h-[500px] flex items-center justify-center rounded-xl border border-zinc-200/60">
              {selectedPdf?.src && <PDFViewer file={selectedPdf.src} />}
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
              <h3 className="text-xl font-bold text-zinc-800">
                Podgląd: {selectedVideo.title ?? selectedVideo.src ?? ""}
              </h3>
              <button
                onClick={closeVideoPreview}
                className="text-zinc-500 hover:text-zinc-800 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="bg-zinc-50 min-h-[300px] flex items-center justify-center rounded-xl border border-zinc-200/60">
              {selectedVideo?.src && (
                <video
                  controls
                  width="100%"
                  height="auto"
                  className="rounded-xl"
                >
                  <source src={selectedVideo.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() =>
                  selectedVideo?.src && window.open(selectedVideo.src, "_blank")
                }
                className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700"
              >
                Otwórz pełny
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedText && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-md shadow-xl border border-zinc-200/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-zinc-800">
                Podgląd: {selectedText.title ?? ""}
              </h3>
              <button
                onClick={() => setSelectedText(null)}
                className="text-zinc-500 hover:text-zinc-800 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 overflow-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-zinc-800">
                {selectedText.content}
              </pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  if (selectedText?.src) {
                    window.open(selectedText.src, "_blank");
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700"
              >
                Otwórz pełny
              </button>
            </div>
          </div>
        </div>
      )}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-3xl p-6 relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-1 right-1"
            >
              <CloseIcon />
            </button>
            <UploadMaterialForm onSuccess={() => setIsUploadModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
