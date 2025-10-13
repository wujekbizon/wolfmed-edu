"use client";

import { useEffect, useState } from "react";
import { Resizable } from "re-resizable";
import BottomResizableHandle from "./BottomResizableHandle";
import RightResizableHandle from "./RightResizableHandle";

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
                minHeight: constraint || 350,
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


