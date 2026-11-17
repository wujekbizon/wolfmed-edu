export type MaterialsType = {
    createdAt: string;
    updatedAt: string;
    id: string;
    category: string;
    userId: string;
    title: string;
    key: string;
    url: string;
    type: string;
    size: number;
}

export type MaterialUploadFile = { key: string; url: string; type: string; name: string; size: number }
export type MaterialUploadFormProps = { onSuccess: (materialId?: string) => void; essay?: boolean }
export type MaterialUploadButtonProps = { onUploaded: (file: MaterialUploadFile) => void; essay?: boolean }

export interface MaterialModalState {
  pdfModal: { isOpen: boolean; src: string; title?: string }
  openPdfModal: (src: string, title?: string) => void
  closePdfModal: () => void
  downloadPdf: () => void
  openFullPdf: () => void
  videoModal: { isOpen: boolean; src: string; title?: string }
  openVideoModal: (src: string, title?: string) => void
  closeVideoModal: () => void
  textModal: { isOpen: boolean; content: string; src?: string; title?: string }
  openTextModal: (src: string, title?: string) => Promise<void>
  closeTextModal: () => void
  uploadModal: { isOpen: boolean; cellId?: string }
  openUploadModal: () => void
  openEssayUploadModal: (cellId: string) => void
  closeUploadModal: () => void
}
