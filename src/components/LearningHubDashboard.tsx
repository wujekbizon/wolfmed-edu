"use client";

import { useState } from "react";
import PDFViewer from "./reader/PDFViewer";
import CategoryGrid from "./CategoryGrid";
import NotesSection from "./NotesSection";
import CellList from "./cells/CellList";
import UploadMaterialForm from "./UploadMaterialForm";
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
  const [selectedPdf, setSelectedPdf] = useState<{ src: string; title?: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ src: string; title?: string } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const resolveSrc = (m: any) => {
    const url = m.fileUrl ?? m.url;
    if (typeof url === "string") {
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      return url.startsWith("/") ? url : `/${url}`;
    }
    if (m.key) return `/uploads/${m.key}`;
    if (m.title) return `/${m.title}`;
    return "";
  };

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
            className="bg-slate-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
            onClick={() => setIsUploadModalOpen(true)}
          >
            + Dodaj Materiał
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 hover:border-zinc-300/80 transition-all duration-300"
            >
              <div className="flex items-center mb-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center mr-3 rounded-full ${
                    material.type === "application/pdf"
                      ? "bg-red-500"
                      : material.type === "video/mp4"
                      ? "bg-purple-500"
                      : "bg-green-500"
                  }`}
                >
                  {material.type === "application/pdf"
                    ? "📄"
                    : material.type === "video/mp4"
                    ? "🎥"
                    : "📝"}
                </div>
                <div className="flex-1 min-w-0">
                  {/* title */}
                  <h4 className="text-zinc-800 font-semibold truncate">{material.title || "Brak tytułu"}</h4>
                  <div className="text-zinc-600 text-sm">
                    <span className="bg-zinc-100 px-2 py-1 text-xs rounded-full">
                      {material.category}
                    </span>
                    <span className="ml-2 text-zinc-500">{material.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {material.type === "application/pdf" && (
                  <button
                    onClick={() => openPdfPreview(resolveSrc(material), material.title)}
                    className="text-blue-600 hover:text-blue-700 text-xs bg-zinc-100 px-3 py-1 rounded-full transition-colors hover:bg-zinc-200"
                  >
                    Podgląd PDF
                  </button>
                )}
                {material.type === "video/mp4" && (
                  <button
                    onClick={() => openVideoPreview(resolveSrc(material), material.title)}
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
              <h3 className="text-xl font-bold text-zinc-800">
                Podgląd: {selectedPdf.title ?? (selectedPdf.src ?? "")}
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
                Podgląd: {selectedVideo.title ?? (selectedVideo.src ?? "")}
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
                <video controls width="100%" height="auto" className="rounded-xl">
                  <source src={selectedVideo.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => selectedVideo?.src && window.open(selectedVideo.src, "_blank")}
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
