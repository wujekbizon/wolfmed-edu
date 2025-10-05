import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

export default function PDFViewerClient({file}:{file: string}) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const goToPrevPage = () =>
        setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);

    const goToNextPage = () =>
        setPageNumber(numPages === null ? pageNumber + 1 : Math.min(pageNumber + 1, numPages));

    return (
        <div className="p-8">
            <nav
                className="mb-4 flex gap-4 items-center"
            >
                <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="px-4 py-2 text-zinc-700 border-none rounded-full text-sm font-medium transition-colors cursor-pointer bg-zinc-200 hover:bg-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed"
                >
                    Prev
                </button>
                <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= (numPages ?? Infinity)}
                    className="px-4 py-2 text-zinc-700 border-none rounded-full text-sm font-medium transition-colors cursor-pointer bg-zinc-200 hover:bg-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed"
                >
                    Next
                </button>
                <p className="m-0 font-bold text-gray-700">
                    Page {pageNumber} of {numPages || "..."}
                </p>
            </nav>

            <div
                className="border border-gray-300 rounded overflow-hidden flex justify-center"
            >
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="p-8 text-center">
                            Loading PDF...
                        </div>
                    }
                    error={
                        <div
                            className="p-8 text-center text-red-600"
                        >
                            Failed to load PDF. Please make sure the file exists in the public
                            folder.
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        width={800}
                    />
                </Document>
            </div>
        </div>
    );
}