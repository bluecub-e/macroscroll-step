"use client";

import React, { useState, useEffect, useRef } from "react";

interface WindowProps {
    title: string;
    children: React.ReactNode;
    initialX?: number;
    initialY?: number;
    isActive?: boolean;
    onClose?: (e: React.MouseEvent) => void;
    onFocus?: () => void;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
}

export default function Window({
    title,
    children,
    initialX = 50,
    initialY = 50,
    isActive = false,
    onClose,
    onFocus,
    width = 400,
    height = 300,
    minWidth = 200,
    minHeight = 150,
}: WindowProps) {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [size, setSize] = useState({ width, height });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const resizeDirection = useRef<string | null>(null);

    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

    // Move Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (onFocus) onFocus();
        if (e.button !== 0) return; // Only left click

        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    // Resize Logic
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation(); // Prevent drag start
        if (onFocus) onFocus();

        setIsResizing(true);
        resizeDirection.current = direction;
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            width: size.width,
            height: size.height,
            posX: position.x,
            posY: position.y,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStartPos.current.x,
                    y: e.clientY - dragStartPos.current.y,
                });
            } else if (isResizing && resizeDirection.current) {
                const dx = e.clientX - resizeStart.current.x;
                const dy = e.clientY - resizeStart.current.y;

                let newWidth = resizeStart.current.width;
                let newHeight = resizeStart.current.height;
                let newX = resizeStart.current.posX;
                let newY = resizeStart.current.posY;

                if (resizeDirection.current.includes("e")) newWidth += dx;
                if (resizeDirection.current.includes("w")) {
                    newWidth -= dx;
                    newX += dx;
                }
                if (resizeDirection.current.includes("s")) newHeight += dy;
                if (resizeDirection.current.includes("n")) {
                    newHeight -= dy;
                    newY += dy;
                }

                if (newWidth < minWidth) {
                    if (resizeDirection.current.includes("w")) newX += (newWidth - minWidth); // Adjust pos back
                    newWidth = minWidth;
                }
                if (newHeight < minHeight) {
                    if (resizeDirection.current.includes("n")) newY += (newHeight - minHeight); // Adjust pos back
                    newHeight = minHeight;
                }

                setSize({ width: newWidth, height: newHeight });
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            resizeDirection.current = null;
        };

        if (isDragging || isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, isResizing, minWidth, minHeight]);

    // Resize Handles
    const handles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

    return (
        <div
            className="window-frame"
            style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                backgroundColor: "var(--window-frame)",
                border: "2px solid var(--window-frame)",
                boxShadow: "2px 2px 0px #000, -1px -1px 0px #fff inset",
                padding: "4px", // Increased padding for resize handles
                zIndex: isActive ? 100 : 1,
                boxSizing: "border-box",
            }}
            onMouseDown={onFocus}
        >
            {/* Search Handles */}
            {handles.map((dir) => (
                <div
                    key={dir}
                    onMouseDown={(e) => handleResizeStart(e, dir)}
                    style={{
                        position: "absolute",
                        width: dir.match(/w|e/) ? "5px" : "100%",
                        height: dir.match(/n|s/) ? "5px" : "100%",
                        top: dir.includes("n") ? 0 : dir.includes("s") ? "auto" : 0,
                        bottom: dir.includes("s") ? 0 : "auto",
                        left: dir.includes("w") ? 0 : dir.includes("e") ? "auto" : 0,
                        right: dir.includes("e") ? 0 : "auto",
                        cursor: `${dir}-resize`,
                        zIndex: 10,
                        // backgroundColor: "rgba(255, 0, 0, 0.2)", // Debug
                    }}
                />
            ))}
            <div
                style={{
                    position: "absolute",
                    width: "10px", height: "10px",
                    top: 0, left: 0, cursor: "nw-resize", zIndex: 20
                }}
                onMouseDown={(e) => handleResizeStart(e, "nw")}
            />
            <div
                style={{
                    position: "absolute",
                    width: "10px", height: "10px",
                    top: 0, right: 0, cursor: "ne-resize", zIndex: 20
                }}
                onMouseDown={(e) => handleResizeStart(e, "ne")}
            />
            <div
                style={{
                    position: "absolute",
                    width: "10px", height: "10px",
                    bottom: 0, left: 0, cursor: "sw-resize", zIndex: 20
                }}
                onMouseDown={(e) => handleResizeStart(e, "sw")}
            />
            <div
                style={{
                    position: "absolute",
                    width: "10px", height: "10px",
                    bottom: 0, right: 0, cursor: "se-resize", zIndex: 20
                }}
                onMouseDown={(e) => handleResizeStart(e, "se")}
            />

            {/* Title Bar */}
            <div
                className="title-bar"
                style={{
                    backgroundColor: isActive ? "var(--title-bar-active-bg)" : "var(--title-bar-inactive-bg)",
                    color: isActive ? "var(--title-bar-active-text)" : "var(--title-bar-inactive-text)",
                    padding: "2px 4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "default",
                    marginBottom: "2px",
                    userSelect: "none",
                    height: "24px",
                }}
                onMouseDown={handleMouseDown}
            >
                <span style={{ fontWeight: "bold", fontSize: "16px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{title}</span>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onClose) onClose(e);
                    }}
                    style={{
                        width: "20px",
                        height: "18px",
                        backgroundColor: "var(--button-face)",
                        border: "1px solid #000",
                        borderLeftColor: "#fff",
                        borderTopColor: "#fff",
                        boxShadow: "1px 1px 0px #000",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        lineHeight: "1",
                        padding: 0,
                        marginLeft: "8px",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ width: "10px", height: "2px", backgroundColor: "#000", boxShadow: "0 1px 0 #fff" }}></div>
                </button>
            </div>

            {/* Content Area */}
            <div
                className="window-content"
                style={{
                    backgroundColor: "var(--window-bg)",
                    border: "1px solid #000",
                    width: "100%",
                    height: "calc(100% - 26px)",
                    overflow: "auto",
                    color: "#000",
                    padding: "8px",
                    boxSizing: "border-box",
                }}
            >
                {children}
            </div>
        </div>
    );
}
