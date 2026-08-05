import React, { useState, useMemo, useRef } from 'react';
import { Excalidraw as Draw, useHandleLibrary } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import ResizableComponent from '../Resizable';
import { Cell } from '@/types/cellTypes';
import { useCellsStore } from '@/store/useCellsStore';
import { useMermaidScene } from '@/hooks/useMermaidScene';
import { useDiagramCamera } from '@/hooks/useDiagramCamera';
import { useDiagramViewport } from '@/hooks/useDiagramViewport';
import ExcalidrawMenu from './ExcalidrawMenu';
import DiagramControls from './DiagramControls';
import DiagramConvertingState from './DiagramConvertingState';
import DiagramErrorState from './DiagramErrorState';

const Excalidraw = ({cell}:{cell:Cell}) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const cellContent = useCellsStore((s) => s.data[cell.id]?.content);

    useHandleLibrary({ excalidrawAPI });

    const { isAuto, fitAuto, resume, notifyScroll } = useDiagramCamera(excalidrawAPI);
    const { scene, isConverting, hasFailed, retry, onChange, onPointerUp } = useMermaidScene(
        cell.id,
        cellContent,
        excalidrawAPI,
        fitAuto
    );
    useDiagramViewport(wrapperRef, excalidrawAPI, fitAuto);

    // Only what the canvas mounts with. A scene that arrives later is pushed
    // through updateScene, because Excalidraw reads this once.
    const initialData = useMemo(() => scene ?? {}, [scene]);

    return (
        <div className="relative h-full w-full">
            <ResizableComponent direction="vertical">
                <div ref={wrapperRef} className="relative h-full pb-2 rounded">
                    {isConverting && <DiagramConvertingState />}
                    {hasFailed && !isConverting && <DiagramErrorState onRetry={retry} />}
                    <Draw
                        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
                        theme={theme}
                        onChange={(elements, appState, files) => onChange(elements, appState as never, files)}
                        onPointerUp={onPointerUp}
                        onScrollChange={notifyScroll}
                        initialData={initialData}
                        renderTopRightUI={() => <DiagramControls isAuto={isAuto} onFit={resume} />}
                    >
                        <ExcalidrawMenu theme={theme} onThemeChange={setTheme} />
                    </Draw>
                </div>
            </ResizableComponent>
        </div>
    );
};

export default Excalidraw;
