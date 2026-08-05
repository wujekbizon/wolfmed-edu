import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Excalidraw as Draw, useHandleLibrary } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import ResizableComponent from '../Resizable';
import { Cell } from '@/types/cellTypes';
import { useCellsStore } from '@/store/useCellsStore';
import { useCellFullscreen } from '@/context/CellFullscreenContext';
import { useMermaidScene } from '@/hooks/useMermaidScene';
import { useDiagramCamera } from '@/hooks/useDiagramCamera';
import { useDiagramViewport } from '@/hooks/useDiagramViewport';
import { useDiagramSelection } from '@/hooks/useDiagramSelection';
import { useDiagramFocus } from '@/hooks/useDiagramFocus';
import ExcalidrawMenu from './ExcalidrawMenu';
import DiagramControls from './DiagramControls';
import DiagramNodeToolbar from './DiagramNodeToolbar';
import DiagramConvertingState from './DiagramConvertingState';
import DiagramErrorState from './DiagramErrorState';

const Excalidraw = ({cell}:{cell:Cell}) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const cellContent = useCellsStore((s) => s.data[cell.id]?.content);

    useHandleLibrary({ excalidrawAPI });

    const isFullscreen = useCellFullscreen();
    const { isAuto, fitAuto, focus, resume, armAuto, notifyScroll } = useDiagramCamera(excalidrawAPI);
    const { selection, sync } = useDiagramSelection();
    const { focusNode, focusGroup } = useDiagramFocus(excalidrawAPI, focus);
    const { scene, isConverting, hasFailed, retry, onChange, onPointerUp } = useMermaidScene(
        cell.id,
        cellContent,
        excalidrawAPI,
        fitAuto
    );
    useDiagramViewport(wrapperRef, excalidrawAPI, fitAuto);

    // Expanding a cell is an explicit request to see the whole diagram, so it
    // overrides a camera the student had taken over. Resizing by hand does not:
    // there they are adjusting the frame around a view they chose, and the
    // "Dopasuj widok" button is how they ask for it back.
    const didMountRef = useRef(false);
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }
        armAuto();
    }, [isFullscreen, armAuto]);

    // Excalidraw also calls onChange when the host re-renders, so an inline
    // closure here feeds a loop back into anything that sets state from it.
    const handleChange = useCallback(
        (elements: readonly never[], appState: never, files: never) => {
            onChange(elements, appState, files);
            sync(elements, appState);
        },
        [onChange, sync]
    );

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
                        onChange={handleChange as never}
                        onPointerUp={onPointerUp}
                        onScrollChange={notifyScroll}
                        initialData={initialData}
                        renderTopRightUI={() => <DiagramControls isAuto={isAuto} onFit={resume} />}
                    >
                        <ExcalidrawMenu theme={theme} onThemeChange={setTheme} />
                    </Draw>
                    {selection && (
                        <DiagramNodeToolbar
                            selection={selection}
                            onFocusNode={() => focusNode(selection)}
                            onFocusGroup={() => focusGroup(selection)}
                        />
                    )}
                </div>
            </ResizableComponent>
        </div>
    );
};

export default Excalidraw;
