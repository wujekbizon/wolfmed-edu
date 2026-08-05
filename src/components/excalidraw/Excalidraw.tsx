import React, { useState, useMemo } from 'react';
import { Excalidraw as Draw, useHandleLibrary } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import ResizableComponent from '../Resizable';
import { Cell } from '@/types/cellTypes';
import { useCellsStore } from '@/store/useCellsStore';
import { useMermaidScene } from '@/hooks/useMermaidScene';
import { isMermaidSyntax } from '@/helpers/isMermaidSyntax';
import ExcalidrawMenu from './ExcalidrawMenu';
import DiagramConvertingState from './DiagramConvertingState';

const Excalidraw = ({cell}:{cell:Cell}) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const updateCell = useCellsStore((s) => s.updateCell);
    const cellContent = useCellsStore((s) => s.data[cell.id]?.content);

    useHandleLibrary({ excalidrawAPI });

    const { scene, isConverting } = useMermaidScene(cell.id, cellContent);

    const initialData = useMemo(() => {
        if (scene) return scene;
        if (!cellContent || isMermaidSyntax(cellContent)) return {};

        try {
            const parsed = JSON.parse(cellContent);
            return {
              ...parsed,
              appState: {
                ...(parsed.appState || {}),
                collaborators: [],
              },
            };
        } catch {
            return {};
        }
      }, [cellContent, scene]);

    if (isConverting) return <DiagramConvertingState />;

    return (
        <div className="relative h-full w-full">
            <ResizableComponent direction="vertical">
                <div className="h-full pb-2 rounded">
                    <Draw
                        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
                        theme={theme}
                        onChange={(_elements, appState) => updateCell(cell.id, JSON.stringify({ elements: _elements, appState }))}
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
