import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewerClient({ file }: { file: string }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const [containerWidth, setContainerWidth] = useState<number>(800);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
               setContainerWidth(entries[0].contentRect.width);
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const goToPrevPage = () =>
        setPageNumber(prev => Math.max(prev - 1, 1));

    const goToNextPage = () =>
        setPageNumber(prev => Math.min(prev + 1, numPages ?? prev + 1));

    return (
        <div className="p-4 w-full" ref={containerRef}>
            {!isLoading && (
                <nav className="mb-4 flex gap-3 items-center">
                    <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                        className="px-4 py-2 text-zinc-200 border-none rounded-full text-sm font-medium transition-colors cursor-pointer bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= (numPages ?? Infinity)}
                        className="px-4 py-2 text-zinc-200 border-none rounded-full text-sm font-medium transition-colors cursor-pointer bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                    <p className="m-0 font-medium text-zinc-400 text-sm">
                        Strona {pageNumber} z {numPages ?? "..."}
                    </p>
                </nav>
            )}

            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                    <div className="flex flex-col items-center justify-center gap-4 min-h-[60dvh] sm:min-h-[400px] w-full">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-zinc-300 animate-spin" />
                        <p className="text-zinc-400 text-sm">Ładowanie PDF...</p>
                    </div>
                }
                error={
                    <div className="flex flex-col items-center justify-center gap-2 min-h-[200px] text-zinc-400">
                        <p className="text-sm">Nie udało się załadować pliku PDF.</p>
                    </div>
                }
            >
                {!isLoading && (
                    <div className="border border-white/10 rounded overflow-hidden flex justify-center">
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={Math.min(containerWidth, 800)}
                        />
                    </div>
                )}
            </Document>
        </div>
    );
}
