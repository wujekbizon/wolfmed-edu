"use client";

import { useEffect, useState } from "react";
import { Resizable, type ResizeCallback } from "re-resizable";
import BottomResizableHandle from "./BottomResizableHandle";
import RightResizableHandle from "./RightResizableHandle";
import { useCellFullscreen } from "@/context/CellFullscreenContext";
import { buildResizableProps } from "@/helpers/buildResizableProps";

interface ResizableProps {
    direction: "horizontal" | "vertical";
    children?: React.ReactNode;
    constraint?: number;
}

const handleComponent = {
    right: <RightResizableHandle />,
    bottom: <BottomResizableHandle />,
};

export default function ResizableComponent({
    direction,
    children,
    constraint,
}: ResizableProps) {
    const isFullscreen = useCellFullscreen();
    const [innerHeight, setInnerHeight] = useState(0);
    const [innerWidth, setInnerWidth] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(300);

    useEffect(() => {
        const initialHeight = window.innerHeight;
        const initialWidth = window.innerWidth;
        setInnerHeight(initialHeight);
        setInnerWidth(initialWidth);
        if (width === 0) setWidth(initialWidth * 0.75);

        let timer: NodeJS.Timeout;
        const handleResize = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                setInnerHeight(window.innerHeight);
                setInnerWidth(window.innerWidth);

                if (width > window.innerHeight) {
                    setWidth(window.innerWidth);
                }
            }, 50);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [width]);

    if (innerWidth === 0 && innerHeight === 0) {
        return null;
    }

    const handleResizeStop: ResizeCallback = (_event, _dir, ref) => {
        if (direction === "horizontal") {
            setWidth(ref.offsetWidth);
        } else {
            setHeight(ref.offsetHeight);
        }
    };

    return (
        <Resizable
            {...buildResizableProps({
                direction,
                isFullscreen,
                innerWidth,
                innerHeight,
                width,
                height,
                constraint,
            })}
            handleComponent={handleComponent}
            onResizeStop={handleResizeStop}
        >
            {children}
        </Resizable>
    );
};
