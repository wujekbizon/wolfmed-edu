"use client";
import dynamic from "next/dynamic";

const PDFViewerClient = dynamic<PDFViewerProps>(() => import("./PDFViewerClient"), {
    ssr: false,
    loading: () => (
        <div
            className="p-8 text-center text-lg text-gray-700"
        >
            Loading PDF Viewer...
        </div>
    ),
});

interface PDFViewerProps {
    file: string;
}

const PDFViewer = ({ file }: PDFViewerProps) => {
    return <PDFViewerClient file={file} />;
};
export default PDFViewer;