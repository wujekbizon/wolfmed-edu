import React, { useState } from 'react';
import {
    Excalidraw as Draw,
    useHandleLibrary,
} from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { MainMenu } from '@excalidraw/excalidraw';
import DarkModeIcon from '../icons/DarkModeIcon';
import LightModeIcon from '../icons/LightModeIcon';
import ResizableComponent from '../Resizable';

const Excalidraw = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
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

    return (
        <div className="relative h-full w-full">
            <ResizableComponent direction="vertical">
                <div className="h-full  pb-2 rounded">
                    <Draw
                        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
                        theme={theme}
                    >
                        {renderMenu()}
                    </Draw>
                </div>
            </ResizableComponent>
        </div>
    );
};

export default Excalidraw;
