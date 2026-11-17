import { create } from 'zustand'

import type { MaterialModalState } from '@/types/materialsTypes'

export const useMaterialModalStore = create<MaterialModalState>((set, get) => ({
  pdfModal: { isOpen: false, src: '' },
  openPdfModal: (src, title) => set({
    pdfModal: { isOpen: true, src, ...(title !== undefined && { title }) },
    videoModal: { isOpen: false, src: '' },
    textModal: { isOpen: false, content: '' },
    uploadModal: { isOpen: false }
  }),
  closePdfModal: () => set({ pdfModal: { isOpen: false, src: '' } }),
  downloadPdf: () => {
    const { pdfModal } = get()
    if (pdfModal.src) {
      const link = document.createElement("a")
      link.href = pdfModal.src
      link.download = pdfModal.src.split("/").pop() ?? "file"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  },
  openFullPdf: () => {
    const { pdfModal } = get()
    if (pdfModal.src) window.open(pdfModal.src, "_blank")
  },

  videoModal: { isOpen: false, src: '' },
  openVideoModal: (src, title) => set({
    videoModal: { isOpen: true, src, ...(title !== undefined && { title }) },
    pdfModal: { isOpen: false, src: '' },
    textModal: { isOpen: false, content: '' },
    uploadModal: { isOpen: false }
  }),
  closeVideoModal: () => set({ videoModal: { isOpen: false, src: '' } }),

  textModal: { isOpen: false, content: '' },
  openTextModal: async (src, title) => {
    try {
      const res = await fetch(src)
      const content = await res.text()
      set({
        textModal: { isOpen: true, content, ...(src !== undefined && { src }), ...(title !== undefined && { title }) },
        pdfModal: { isOpen: false, src: '' },
        videoModal: { isOpen: false, src: '' },
        uploadModal: { isOpen: false }
      })
    } catch (err) {
      set({
        textModal: { isOpen: true, content: "Błąd wczytywania pliku.", ...(src !== undefined && { src }), ...(title !== undefined && { title }) },
        pdfModal: { isOpen: false, src: '' },
        videoModal: { isOpen: false, src: '' },
        uploadModal: { isOpen: false }
      })
    }
  },
  closeTextModal: () => set({ textModal: { isOpen: false, content: '' } }),

  uploadModal: { isOpen: false },
  openEssayUploadModal: (cellId) => set({
    uploadModal: { isOpen: true, cellId },
    pdfModal: { isOpen: false, src: '' },
    videoModal: { isOpen: false, src: '' },
    textModal: { isOpen: false, content: '' },
  }),
  openUploadModal: () => set({
    uploadModal: { isOpen: true },
    pdfModal: { isOpen: false, src: '' },
    videoModal: { isOpen: false, src: '' },
    textModal: { isOpen: false, content: '' }
  }),
  closeUploadModal: () => set({ uploadModal: { isOpen: false } })
}))
