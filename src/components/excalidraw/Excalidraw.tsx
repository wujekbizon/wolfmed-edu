import React, { useState, useMemo, useEffect } from 'react';
import {
    Excalidraw as Draw,
    useHandleLibrary,
    convertToExcalidrawElements,
} from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { MainMenu } from '@excalidraw/excalidraw';
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';
import DarkModeIcon from '../icons/DarkModeIcon';
import LightModeIcon from '../icons/LightModeIcon';
import ResizableComponent from '../Resizable';
import { Cell } from '@/types/cellTypes';
import { useCellsStore } from '@/store/useCellsStore';

function isMermaidSyntax(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.startsWith('flowchart') ||
           trimmed.startsWith('graph') ||
           trimmed.startsWith('sequenceDiagram') ||
           trimmed.startsWith('classDiagram') ||
           trimmed.startsWith('stateDiagram') ||
           trimmed.startsWith('erDiagram') ||
           trimmed.startsWith('pie') ||
           trimmed.startsWith('gantt');
}

const Excalidraw = ({cell}:{cell:Cell}) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [convertedData, setConvertedData] = useState<any>(null);
    const [isConverting, setIsConverting] = useState(false);

    const updateCell = useCellsStore((s) => s.updateCell);
    const cellContent = useCellsStore((s) => s.data[cell.id]?.content);

    useHandleLibrary({ excalidrawAPI });

    // Convert Mermaid to Excalidraw if needed
    useEffect(() => {
        async function convertMermaid() {
            if (!cellContent) return;

            if (isMermaidSyntax(cellContent)) {
                setIsConverting(true);
                try {
                    const { elements: skeletonElements, files } = await parseMermaidToExcalidraw(cellContent);
                    const elements = convertToExcalidrawElements(skeletonElements);
                    const excalidrawData = {
                        elements,
                        files,
                        appState: { collaborators: [] }
                    };
                    setConvertedData(excalidrawData);
                    // Update cell with converted Excalidraw JSON so it's saved properly
                    updateCell(cell.id, JSON.stringify(excalidrawData));
                } catch (error) {
                    console.error('[Excalidraw] Failed to convert Mermaid to Excalidraw:', error);
                    setConvertedData({ elements: [], appState: { collaborators: [] } });
                } finally {
                    setIsConverting(false);
                }
            } else {
                setConvertedData(null);
            }
        }
        convertMermaid();
    }, [cellContent, cell.id, updateCell]);

    const renderMenu = () => {
        return (
            <MainMenu>
                <MainMenu.DefaultItems.LoadScene />
                <MainMenu.DefaultItems.SaveToActiveFile />
                <MainMenu.DefaultItems.SaveAsImage />
                <MainMenu.DefaultItems.Export />
                <MainMenu.DefaultItems.ClearCanvas />
                <MainMenu.DefaultItems.Help />
                <MainMenu.Separator />
                <MainMenu.ItemCustom>
                    {theme === 'light' ? (
                        <div
                            className="w-full h-8 flex items-center mt-0 p-0 gap-2"
                            onClick={() => setTheme('dark')}
                        >
                            <DarkModeIcon color="black" width={16} height={16} />
                            Dark mode
                        </div>
                    ) : (
                        <div
                            className="w-full h-8 flex items-center mt-0 p-0 gap-2 hover:bg-inherit"
                            onClick={() => setTheme('light')}
                        >
                            <LightModeIcon color='white' width={16} height={16} />
                            Light mode
                        </div>
                    )}
                </MainMenu.ItemCustom>
                <MainMenu.Separator />
                <MainMenu.DefaultItems.ChangeCanvasBackground />
            </MainMenu>
        );
    };

    const initialData = useMemo(() => {
        // If we have converted Mermaid data, use it
        if (convertedData) return convertedData;

        if (!cellContent) return {};

        // If it's Mermaid syntax, return empty (will be converted by useEffect)
        if (isMermaidSyntax(cellContent)) return {};

        // Otherwise parse as JSON
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
      }, [cellContent, convertedData]);

    if (isConverting) {
        return (
            <div className="relative h-full w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600 mx-auto mb-2"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Konwertowanie diagramu...</p>
                </div>
            </div>
        );
    }

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
                        {renderMenu()}
                    </Draw>
                </div>
            </ResizableComponent>
        </div>
    );
};

export default Excalidraw;
