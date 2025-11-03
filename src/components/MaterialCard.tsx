'use client'

import React from "react";
import type { MaterialsType } from "@/types/materialsTypes";
import { formatDate } from "@/helpers/formatDate";
import { resolveSrc } from "@/helpers/resolveSource";
import { useDashboardStore } from '@/store/useDashboardStore'
import MaterialDeleteButton from './MaterialDeleteButton'
import MaterialDeleteModal from './MaterialDeleteModal'
import { formatBytes } from '@/helpers/formatBytes'

type Props = {
  material: MaterialsType;
  onOpenPdf: (src: string, title?: string) => void;
  onOpenVideo: (src: string, title?: string) => void;
  onOpenText: (src: string, title?: string) => void;
};

export default function MaterialCard({ material, onOpenPdf, onOpenVideo, onOpenText }: Props) {
  const { isDeleteModalOpen, materialIdToDelete } = useDashboardStore()
  const src = resolveSrc(material);

  const isPdf = material.type === "application/pdf";
  const isVideo = material.type === "video/mp4";
  const isText = material.type === "text/plain";

  const accent =
    isPdf ? "bg-rose-500/5 text-rose-100" : isVideo ? "bg-violet-500/5 text-violet-100" : "bg-emerald-500/5 text-emerald-100";

  const filename = src?.split("/").pop()?.split("?")[0] ?? "";

  return (
    <>
      {isDeleteModalOpen && materialIdToDelete === material.id && (
        <MaterialDeleteModal
          materialId={material.id}
          materialTitle={material.title}
        />
      )}
      <article
        className="flex flex-col justify-between relative bg-zinc-50 border border-zinc-300/50 rounded-xl hover:border-slate-300 transition-all duration-200 p-3"
        aria-labelledby={`material-${material.id}-title`}
      >
      <header className="flex item-center gap-4">
        <div className={`w-11 h-11 flex items-center justify-center rounded-full shrink-0 ${accent} border border-zinc-900/10 flex-none`}>
          <span className="text-2xl">
            {isPdf ? "📝" : isVideo ? "🎥" : "📄"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4
              id={`material-${material.id}-title`}
              className="text-zinc-900 font-semibold text-base md:text-lg truncate leading-tight"
            >
              {material.title || filename || "Brak tytułu"}
            </h4>
            {material.category && (
              <span className="absolute top-1 right-1 hidden md:inline-block font-semibold bg-zinc-800/80 text-zinc-100 px-2 py-0.5 rounded-full border border-zinc-700 text-[11px]">
                {material.category}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-zinc-500">{material.type}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-700 font-semibold">{formatBytes(material.size)}</span>
          </div>
        </div>
      </header>
      <div className="mt-4 border-t border-zinc-300/50 pt-1">
        <div className="h-full flex items-center justify-between">
          <div className="text-zinc-800/70 text-[11px]">
            {material.updatedAt && (
                <time
                  dateTime={new Date(material.updatedAt).toISOString()}
                  className="font-medium text-zinc-800"
                >
                  {formatDate(material.updatedAt)}
                </time>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <MaterialDeleteButton materialId={material.id} />
            {isPdf && (
              <button
                onClick={() => onOpenPdf(src, material.title)}
                className="bg-zinc-800 cursor-pointer text-amber-400 hover:text-amber-100 px-3 py-1 rounded-full text-xs transition-colors"
                aria-label={`Podgląd PDF ${material.title ?? ""}`}
              >
                Podgląd PDF
              </button>
            )}
            {isVideo && (
              <button
                onClick={() => onOpenVideo(src, material.title)}
                className="bg-zinc-800 cursor-pointer text-amber-400 hover:text-amber-100 px-3 py-1 rounded-full text-xs transition-colors"
                aria-label={`Podgląd Video ${material.title ?? ""}`}
              >
                Odtwórz
              </button>
            )}

            {isText && (
              <button
                onClick={() => onOpenText(src, material.title)}
                className="bg-zinc-800 cursor-pointer text-amber-400 hover:text-amber-100 px-3 py-1 rounded-full text-xs transition-colors"
                aria-label={`Podgląd Tekst ${material.title ?? ""}`}
              >
                Otwórz
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
    </>
  );
}
