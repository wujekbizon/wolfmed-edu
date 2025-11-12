import React, { useState, useMemo } from 'react';
import {
    Excalidraw as Draw,
    useHandleLibrary,
} from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { MainMenu } from '@excalidraw/excalidraw';
import DarkModeIcon from '../icons/DarkModeIcon';
import LightModeIcon from '../icons/LightModeIcon';
import ResizableComponent from '../Resizable';
import { Cell } from '@/types/cellTypes';
import { useCellsStore } from '@/store/useCellsStore';

const Excalidraw = ({cell}:{cell:Cell}) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const {  data } = useCellsStore()
    const updateCell = useCellsStore((s) => s.updateCell);
    const cellContent = useCellsStore((s) => s.data[cell.id]?.content);

    useHandleLibrary({ excalidrawAPI });

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
        if (!cellContent) return {};
        const parsed = JSON.parse(cellContent);
        return {
          ...parsed,
          appState: {
            ...(parsed.appState || {}),
            collaborators: [],
          },
        };
      }, [cellContent]);

    return (
        <div className="relative h-full w-full">
            <ResizableComponent direction="vertical">
                <div className="h-full  pb-2 rounded">
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
