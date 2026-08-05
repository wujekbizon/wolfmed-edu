import React, { useState, useMemo } from 'react';
import { Excalidraw as Draw, useHandleLibrary } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import ResizableComponent from '../Resizable';
import { Cell } from '@/types/cellTypes';
import { useCellsStore } from '@/store/useCellsStore';
import { useMermaidScene } from '@/hooks/useMermaidScene';
import ExcalidrawMenu from './ExcalidrawMenu';
import DiagramConvertingState from './DiagramConvertingState';

const Excalidraw = ({cell}:{cell:Cell}) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const cellContent = useCellsStore((s) => s.data[cell.id]?.content);

    useHandleLibrary({ excalidrawAPI });

    const { scene, isConverting, persist } = useMermaidScene(cell.id, cellContent, excalidrawAPI);

    // Only what the canvas mounts with. A scene that arrives later is pushed
    // through updateScene, because Excalidraw reads this once.
    const initialData = useMemo(() => scene ?? {}, [scene]);

    return (
        <div className="relative h-full w-full">
            <ResizableComponent direction="vertical">
                <div className="h-full pb-2 rounded">
                    {isConverting && <DiagramConvertingState />}
                    <Draw
                        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
                        theme={theme}
                        onChange={(elements, appState, files) => persist(elements, appState as never, files)}
                        initialData={initialData}
                    >
                        <ExcalidrawMenu theme={theme} onThemeChange={setTheme} />
                    </Draw>
                </div>
            </ResizableComponent>
        </div>
    );
};

export default Excalidraw;
