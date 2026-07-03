"use client";

import React, { useState } from "react";
import { 
    MousePointer, 
    Hexagon, 
    Square, 
    Circle as CircleIcon, 
    Trash2, 
    Eraser, 
    Loader2, 
    Tag, 
    Layers 
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Polygon } from "@/types";

interface AnnotationSidebarProps {
    mode: "select" | "draw";
    onModeChange: (mode: "select" | "draw") => void;
    drawType: "polygon" | "rectangle" | "circle";
    onDrawTypeChange: (type: "polygon" | "rectangle" | "circle") => void;
    polygons: Polygon[];
    selectedPolygonId: number | null;
    onSelectPolygon: (id: number | null) => void;
    onDeletePolygon: (id: number) => void;
    onClearCanvas: () => void;
    isSaving: boolean;
    color: string;
    onColorChange: (color: string) => void;
}

export const AnnotationSidebar: React.FC<AnnotationSidebarProps> = ({
    mode,
    onModeChange,
    drawType,
    onDrawTypeChange,
    polygons,
    selectedPolygonId,
    onSelectPolygon,
    onDeletePolygon,
    onClearCanvas,
    isSaving,
    color,
    onColorChange,
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Identify shape representation helper
    const getShapeTypeLabel = (pointsLength: number) => {
        if (pointsLength === 4) return "Bounding Box";
        if (pointsLength === 16) return "Pinpoint Circle";
        return "Polygon Area";
    };

    const getShapeIcon = (pointsLength: number) => {
        if (pointsLength === 4) return <Square className="h-3 w-3" />;
        if (pointsLength === 16) return <CircleIcon className="h-3 w-3" />;
        return <Hexagon className="h-3 w-3" />;
    };

    return (
        <div className="w-full h-full glass-panel border border-white/10 rounded-[28px] p-5 flex flex-col gap-5 shadow-2xl select-none">
            {/* Session Info & Auto-Save HUD */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-accent" />
                    <span className="text-xs font-display font-extrabold text-text-primary tracking-wide">
                        Annotation Controls
                    </span>
                </div>

                {isSaving && (
                    <div className="flex items-center gap-1 text-[8px] font-semibold text-accent bg-accent/5 border border-accent/15 px-2 py-0.5 rounded-full animate-pulse">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        Saving...
                    </div>
                )}
            </div>

            {/* Mode Selectors (Select vs Draw Mode) */}
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    Interaction Mode
                </span>
                <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/5 shadow-inner">
                    <button
                        onClick={() => onModeChange("select")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            mode === "select"
                                ? "bg-white/[0.04] border border-white/5 text-text-primary shadow-md"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.01]"
                        }`}
                        title="Select and Hover Shapes (V)"
                    >
                        <MousePointer className="h-3.5 w-3.5" />
                        Select
                    </button>
                    <button
                        onClick={() => onModeChange("draw")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            mode === "draw"
                                ? "bg-white/[0.04] border border-white/5 text-text-primary shadow-md"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.01]"
                        }`}
                        title="Draw Shapes (D)"
                    >
                        <Hexagon className="h-3.5 w-3.5" />
                        Draw Mode
                    </button>
                </div>
            </div>

            {/* Shape Drawing Tool Selector (Only active when mode === "draw") */}
            {mode === "draw" && (
                <div className="flex flex-col gap-1.5 animate-modal-entry">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                        Drawing Shape Type
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-black/40 p-0.5 rounded-xl border border-white/5 shadow-inner">
                        <button
                            onClick={() => onDrawTypeChange("polygon")}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[9px] font-bold transition-all duration-200 cursor-pointer ${
                                drawType === "polygon"
                                    ? "bg-gradient-to-br from-indigo-950/90 via-purple-900/50 to-pink-950/30 border-[1.2px] border-accent/90 text-white shadow-md glow-violet"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.01]"
                            }`}
                            title="Trace Polygon (Vertices)"
                        >
                            <Hexagon className="h-4 w-4" />
                            Polygon
                        </button>
                        <button
                            onClick={() => onDrawTypeChange("rectangle")}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[9px] font-bold transition-all duration-200 cursor-pointer ${
                                drawType === "rectangle"
                                    ? "bg-gradient-to-br from-indigo-950/90 via-purple-900/50 to-pink-950/30 border-[1.2px] border-accent/90 text-white shadow-md glow-violet"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.01]"
                            }`}
                            title="Drag Bounding Box (Rectangle)"
                        >
                            <Square className="h-4 w-4" />
                            Box
                        </button>
                        <button
                            onClick={() => onDrawTypeChange("circle")}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[9px] font-bold transition-all duration-200 cursor-pointer ${
                                drawType === "circle"
                                    ? "bg-gradient-to-br from-indigo-950/90 via-purple-900/50 to-pink-950/30 border-[1.2px] border-accent/90 text-white shadow-md glow-violet"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.01]"
                            }`}
                            title="Pinpoint Center Circle"
                        >
                            <CircleIcon className="h-4 w-4" />
                            Circle
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Color Selector swatch */}
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    Active Layer Color
                </span>
                <div className="relative">
                    <button
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 text-xs font-semibold text-text-primary transition-all cursor-pointer shadow-inner"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: color }}
                            />
                            <span className="font-mono uppercase text-[10px] text-text-secondary">{color}</span>
                        </div>
                        <Tag className="h-3.5 w-3.5 text-text-secondary" />
                    </button>

                    {isPickerOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsPickerOpen(false)} />
                            <div className="absolute right-0 top-11 z-50 p-3 bg-surface border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-2">
                                <HexColorPicker color={color} onChange={onColorChange} />
                                <div className="flex items-center justify-between mt-1 select-all">
                                    <span className="text-[9px] text-text-secondary font-mono uppercase">{color}</span>
                                    <button
                                        onClick={() => setIsPickerOpen(false)}
                                        className="text-[9px] text-accent hover:underline font-bold cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Shapes list manager panel (References List layout) */}
            <div className="flex-1 flex flex-col gap-1.5 min-h-[150px] overflow-hidden">
                <div className="flex items-center justify-between pb-1 select-none">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                        Image Shapes Log ({polygons.length})
                    </span>
                    <button
                        onClick={onClearCanvas}
                        className="text-[9px] font-bold text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                        title="Reset current markings"
                    >
                        <Eraser className="h-3 w-3" />
                        Reset
                    </button>
                </div>

                {/* Scrollable list item feed */}
                <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-2.5 scrollbar-none">
                    {polygons.length > 0 ? (
                        polygons.map((poly) => {
                            const isSelected = poly.id === selectedPolygonId;
                            const strokeColor = poly.label || "#6366F1";
                            return (
                                <div
                                    key={poly.id}
                                    onClick={() => onSelectPolygon(isSelected ? null : poly.id)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 border cursor-pointer ${
                                        isSelected
                                            ? "bg-white/[0.04] border-accent/40 shadow-inner"
                                            : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <div 
                                            className="h-3 w-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: strokeColor, boxShadow: `0 0 6px ${strokeColor}44` }}
                                        />
                                        <div className="flex items-center gap-1 text-[10px] text-text-primary font-bold">
                                            {getShapeIcon(poly.points.length)}
                                            <span className="truncate max-w-[110px]">
                                                {getShapeTypeLabel(poly.points.length)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeletePolygon(poly.id);
                                        }}
                                        className="p-1 text-text-secondary hover:text-priority-high hover:bg-red-950/20 border border-transparent rounded-lg transition-all cursor-pointer"
                                        title="Delete Shape"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl text-text-secondary/40 select-none">
                            <Layers className="h-6 w-6 mb-2 opacity-50" />
                            <span className="text-[10px] font-bold">No shapes traced yet</span>
                            <span className="text-[8px] mt-0.5">Toggle Draw Mode to begin tagging.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
