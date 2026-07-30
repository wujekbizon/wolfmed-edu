"use client";

import { useEffect, useState } from "react";
import { Resizable } from "re-resizable";
import BottomResizableHandle from "./BottomResizableHandle";
import RightResizableHandle from "./RightResizableHandle";
import { useCellFullscreen } from "@/context/CellFullscreenContext";

interface ResizableProps {
    direction: "horizontal" | "vertical";
    children?: React.ReactNode;
    constraint?: number;
}

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

    // When the enclosing cell is expanded to fullscreen, fill the container
    // instead of constraining to the resizable width/height.
    if (isFullscreen) {
        return <div className="h-full w-full">{children}</div>;
    }

    // On mobile a side-by-side (horizontal) split doesn't fit: drop the fixed
    // pixel width and let the content go full width so it can stack vertically,
    // growing into whatever height the stacked siblings leave behind.
    if (direction === "horizontal" && innerWidth < 768) {
        return <div className="flex w-full flex-1 flex-col">{children}</div>;
    }

    const resizableProps =
        direction === "horizontal"
            ? {
                size: { width, height: "100%" },
                handleComponent: {
                    right: <RightResizableHandle />
                },
                minWidth: innerWidth * 0.2,
                maxWidth: innerWidth * 0.60,
                minHeight: "100%",
                maxHeight: "100%",
                enable: {
                    right: true,
                    bottom: false,
                    bottomRight: false,
                },
                onResizeStop: (
                    e: MouseEvent | TouchEvent,
                    dir: any,
                    ref: HTMLElement
                ) => {
                    setWidth(ref.offsetWidth);
                },
                style: { display: "flex" },
            }
            : {
                size: { width: "100%", height },
                handleComponent: { bottom: <BottomResizableHandle />},
                minHeight: constraint || 480,
                maxHeight: innerHeight * 0.7,
                minWidth: "100%",
                maxWidth: "100%",
                enable: {
                    bottom: true,
                    right: false,
                    bottomRight: false,
                },
                onResizeStop: (
                    e: MouseEvent | TouchEvent,
                    dir: any,
                    ref: HTMLElement
                ) => {
                    setHeight(ref.offsetHeight);
                },
                style: { width: "100%" },
            };

    return <Resizable {...resizableProps}>{children}</Resizable>;
};


