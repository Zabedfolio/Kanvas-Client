"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle } from "react-konva";
import { AnnotationImage, Point, Polygon } from "@/types";

interface AnnotationCanvasProps {
    activeImage: AnnotationImage;
    polygons: Polygon[];
    onPolygonCreate: (points: Point[]) => void;
    mode: "select" | "draw";
    selectedPolygonId: number | null;
    onSelectPolygon: (id: number | null) => void;
    newPoints: Point[];
    onNewPointsChange: (points: Point[]) => void;
    currentColor: string;
    drawType: "polygon" | "rectangle" | "circle";
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
    activeImage,
    polygons,
    onPolygonCreate,
    mode,
    selectedPolygonId,
    onSelectPolygon,
    newPoints,
    onNewPointsChange,
    currentColor,
    drawType,
}) => {
    const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 750, height: 480 });
    const [hoveredPolygonId, setHoveredPolygonId] = useState<number | null>(null);
    const [hoveredFirstPoint, setHoveredFirstPoint] = useState(false);
    
    // Drag-to-draw states for Box and Circle
    const [isDrawingShape, setIsDrawingShape] = useState(false);
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    // Resolve media url prefixes
    const getAbsoluteUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        return `${backendUrl}${url}`;
    };

    // Load active image element
    useEffect(() => {
        if (!activeImage) return;
        const img = new window.Image();
        img.src = getAbsoluteUrl(activeImage.url);
        img.crossOrigin = "anonymous";
        img.onload = () => {
            setImageElement(img);
        };
    }, [activeImage]);

    // Handle container resizing
    useEffect(() => {
        if (!containerRef.current) return;
        
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width } = entry.contentRect;
                setCanvasSize({
                    width: width,
                    height: Math.max(380, Math.min(500, width * 0.6)),
                });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    let scale = 1;
    let imageWidth = 0;
    let imageHeight = 0;
    let offsetX = 0;
    let offsetY = 0;

    if (imageElement) {
        const wScale = canvasSize.width / imageElement.width;
        const hScale = canvasSize.height / imageElement.height;
        scale = Math.min(wScale, hScale, 1);

        imageWidth = imageElement.width * scale;
        imageHeight = imageElement.height * scale;
        
        offsetX = (canvasSize.width - imageWidth) / 2;
        offsetY = (canvasSize.height - imageHeight) / 2;
    }

    const screenToImageCoord = (screenX: number, screenY: number): Point => {
        return {
            x: Math.round((screenX - offsetX) / scale),
            y: Math.round((screenY - offsetY) / scale),
        };
    };

    const imageToScreenCoord = (imgPt: Point): Point => {
        return {
            x: imgPt.x * scale + offsetX,
            y: imgPt.y * scale + offsetY,
        };
    };

    // Handle stage clicks
    const handleStageClick = (e: any) => {
        if (mode === "select") {
            const clickedOnEmpty = e.target === e.target.getStage() || e.target.className === "Image";
            if (clickedOnEmpty) {
                onSelectPolygon(null);
            }
            return;
        }

        // Polygon drawing clicks
        if (mode === "draw" && drawType === "polygon" && imageElement) {
            const stage = e.target.getStage();
            const pointerPos = stage.getPointerPosition();
            if (!pointerPos) return;

            if (
                pointerPos.x < offsetX ||
                pointerPos.x > offsetX + imageWidth ||
                pointerPos.y < offsetY ||
                pointerPos.y > offsetY + imageHeight
            ) {
                return;
            }

            if (newPoints.length >= 3) {
                const firstPtScreen = imageToScreenCoord(newPoints[0]);
                const dist = Math.hypot(pointerPos.x - firstPtScreen.x, pointerPos.y - firstPtScreen.y);
                if (dist < 12) {
                    handleClosePolygon();
                    return;
                }
            }

            const imgPt = screenToImageCoord(pointerPos.x, pointerPos.y);
            onNewPointsChange([...newPoints, imgPt]);
        }
    };

    // Drag-to-draw Mouse Event Handlers for Box and Circle
    const handleMouseDown = (e: any) => {
        if (mode !== "draw" || drawType === "polygon" || !imageElement) return;

        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        if (
            pointerPos.x < offsetX ||
            pointerPos.x > offsetX + imageWidth ||
            pointerPos.y < offsetY ||
            pointerPos.y > offsetY + imageHeight
        ) {
            return;
        }

        const imgPt = screenToImageCoord(pointerPos.x, pointerPos.y);
        setStartPoint(imgPt);
        setCurrentPoint(imgPt);
        setIsDrawingShape(true);
    };

    const handleMouseMove = (e: any) => {
        if (mode !== "draw" || drawType === "polygon" || !isDrawingShape || !startPoint) return;

        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        // Clamp inside image bounds
        const clampedX = Math.max(offsetX, Math.min(offsetX + imageWidth, pointerPos.x));
        const clampedY = Math.max(offsetY, Math.min(offsetY + imageHeight, pointerPos.y));

        const imgPt = screenToImageCoord(clampedX, clampedY);
        setCurrentPoint(imgPt);
    };

    const handleMouseUp = () => {
        if (mode !== "draw" || drawType === "polygon" || !isDrawingShape || !startPoint || !currentPoint) {
            setIsDrawingShape(false);
            setStartPoint(null);
            setCurrentPoint(null);
            return;
        }

        const dx = Math.abs(currentPoint.x - startPoint.x);
        const dy = Math.abs(currentPoint.y - startPoint.y);
        if (dx < 3 && dy < 3) {
            setIsDrawingShape(false);
            setStartPoint(null);
            setCurrentPoint(null);
            return;
        }

        let generatedPoints: Point[] = [];

        if (drawType === "rectangle") {
            generatedPoints = [
                { x: startPoint.x, y: startPoint.y },
                { x: currentPoint.x, y: startPoint.y },
                { x: currentPoint.x, y: currentPoint.y },
                { x: startPoint.x, y: currentPoint.y },
            ];
        } else if (drawType === "circle") {
            const centerX = startPoint.x;
            const centerY = startPoint.y;
            const radius = Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y);
            
            const numSegments = 16;
            for (let i = 0; i < numSegments; i++) {
                const angle = (i * 2 * Math.PI) / numSegments;
                generatedPoints.push({
                    x: Math.round(centerX + radius * Math.cos(angle)),
                    y: Math.round(centerY + radius * Math.sin(angle)),
                });
            }
        }

        if (generatedPoints.length > 0) {
            onPolygonCreate(generatedPoints);
        }

        setIsDrawingShape(false);
        setStartPoint(null);
        setCurrentPoint(null);
    };

    const handleStageDblClick = () => {
        if (mode === "draw" && drawType === "polygon" && newPoints.length >= 3) {
            handleClosePolygon();
        }
    };

    const handleClosePolygon = () => {
        if (newPoints.length >= 3) {
            onPolygonCreate(newPoints);
        }
    };

    const getStageCursor = () => {
        if (mode === "draw") {
            if (drawType === "polygon") return hoveredFirstPoint ? "pointer" : "crosshair";
            return "crosshair";
        }
        return "default";
    };

    return (
        <div ref={containerRef} className="w-full flex justify-center relative bg-bg-secondary rounded-2xl border border-border overflow-hidden select-none">
            {/* Guide overlay */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none bg-black/75 px-3 py-1.5 rounded-lg text-[10px] text-text-secondary leading-relaxed border border-white/5 shadow-md">
                {mode === "draw" ? (
                    drawType === "polygon" ? (
                        <span>
                            <strong className="text-accent">Draw Polygon:</strong> Click image to add vertices. Double-click or click start point to close.
                        </span>
                    ) : drawType === "rectangle" ? (
                        <span>
                            <strong className="text-accent">Draw Box:</strong> Click and drag bounding box across the image.
                        </span>
                    ) : (
                        <span>
                            <strong className="text-accent">Draw Circle:</strong> Click center and drag outward to pinpoint radius.
                        </span>
                    )
                ) : (
                    <span>
                        <strong className="text-accent">Select Mode:</strong> Click any shape outline to highlight. Press <kbd className="bg-surface px-1 py-0.5 rounded text-[9px]">Del</kbd> to delete.
                    </span>
                )}
            </div>

            {/* Canvas Stage */}
            <Stage
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleStageClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDblClick={handleStageDblClick}
                style={{ cursor: getStageCursor() }}
            >
                <Layer>
                    {/* Background image component */}
                    {imageElement && (
                        <KonvaImage
                            image={imageElement}
                            x={offsetX}
                            y={offsetY}
                            width={imageWidth}
                            height={imageHeight}
                        />
                    )}

                    {/* Render saved shapes */}
                    {polygons.map((poly) => {
                        const isSelected = poly.id === selectedPolygonId;
                        const isHovered = poly.id === hoveredPolygonId;
                        
                        const ptsArray = poly.points.flatMap((p) => {
                            const sPt = imageToScreenCoord(p);
                            return [sPt.x, sPt.y];
                        });

                        const isHexColor = /^#[0-9A-F]{6}$/i.test(poly.label || "");
                        const strokeColor = isSelected 
                            ? "#E11D48" 
                            : isHovered 
                            ? (isHexColor ? poly.label : "#818CF8") 
                            : (isHexColor ? poly.label : "#6366F1");

                        const fillColor = isSelected
                            ? "rgba(225, 29, 72, 0.25)"
                            : isHovered
                            ? (isHexColor ? `${poly.label}40` : "rgba(99, 102, 241, 0.25)")
                            : (isHexColor ? `${poly.label}25` : "rgba(99, 102, 241, 0.15)");

                        return (
                            <React.Fragment key={poly.id}>
                                <Line
                                    points={ptsArray}
                                    closed={true}
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth={isHovered || isSelected ? 3 : 1.8}
                                    onClick={(e) => {
                                        if (mode === "select") {
                                            e.cancelBubble = true;
                                            onSelectPolygon(poly.id);
                                        }
                                    }}
                                    onMouseEnter={() => {
                                        if (mode === "select") setHoveredPolygonId(poly.id);
                                    }}
                                    onMouseLeave={() => {
                                        if (mode === "select") setHoveredPolygonId(null);
                                    }}
                                />

                                {/* Render vertex dots for selected shapes */}
                                {isSelected &&
                                    poly.points.map((pt, idx) => {
                                        const sPt = imageToScreenCoord(pt);
                                        return (
                                            <Circle
                                                key={idx}
                                                x={sPt.x}
                                                y={sPt.y}
                                                radius={3.5}
                                                fill="#FFFFFF"
                                                stroke="#E11D48"
                                                strokeWidth={1.5}
                                            />
                                        );
                                    })}
                            </React.Fragment>
                        );
                    })}

                    {/* Rendering the active polygon drawing path in progress */}
                    {mode === "draw" && drawType === "polygon" && newPoints.length > 0 && (
                        <>
                            <Line
                                points={newPoints.flatMap((p) => {
                                    const sPt = imageToScreenCoord(p);
                                    return [sPt.x, sPt.y];
                                })}
                                closed={false}
                                stroke={currentColor}
                                strokeWidth={2}
                                dash={[4, 3]}
                            />

                            {newPoints.map((pt, idx) => {
                                const sPt = imageToScreenCoord(pt);
                                const isFirstPoint = idx === 0;
                                return (
                                    <Circle
                                        key={idx}
                                        x={sPt.x}
                                        y={sPt.y}
                                        radius={isFirstPoint ? 6 : 3.5}
                                        fill={isFirstPoint && hoveredFirstPoint ? currentColor : isFirstPoint ? `${currentColor}66` : "#FFFFFF"}
                                        stroke={currentColor}
                                        strokeWidth={1.5}
                                        onMouseEnter={() => {
                                            if (isFirstPoint && newPoints.length >= 3) {
                                                setHoveredFirstPoint(true);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (isFirstPoint) {
                                                setHoveredFirstPoint(false);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (isFirstPoint && newPoints.length >= 3) {
                                                e.cancelBubble = true;
                                                handleClosePolygon();
                                            }
                                        }}
                                    />
                                );
                            })}
                        </>
                    )}

                    {/* Drag Previews for Box / Circle */}
                    {mode === "draw" && isDrawingShape && startPoint && currentPoint && (
                        <>
                            {drawType === "rectangle" && (
                                <Line
                                    points={[
                                        imageToScreenCoord(startPoint).x, imageToScreenCoord(startPoint).y,
                                        imageToScreenCoord(currentPoint).x, imageToScreenCoord(startPoint).y,
                                        imageToScreenCoord(currentPoint).x, imageToScreenCoord(currentPoint).y,
                                        imageToScreenCoord(startPoint).x, imageToScreenCoord(currentPoint).y,
                                        imageToScreenCoord(startPoint).x, imageToScreenCoord(startPoint).y
                                    ]}
                                    closed={true}
                                    stroke={currentColor}
                                    strokeWidth={2}
                                    dash={[4, 3]}
                                    fill={`${currentColor}20`}
                                />
                            )}

                            {drawType === "circle" && (
                                <Circle
                                    x={imageToScreenCoord(startPoint).x}
                                    y={imageToScreenCoord(startPoint).y}
                                    radius={Math.hypot(
                                        imageToScreenCoord(currentPoint).x - imageToScreenCoord(startPoint).x,
                                        imageToScreenCoord(currentPoint).y - imageToScreenCoord(startPoint).y
                                    )}
                                    stroke={currentColor}
                                    strokeWidth={2}
                                    dash={[4, 3]}
                                    fill={`${currentColor}20`}
                                />
                            )}
                        </>
                    )}
                </Layer>
            </Stage>
        </div>
    );
};
