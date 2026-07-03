"use client";

import React, { useEffect, useState, startTransition } from "react";
import dynamic from "next/dynamic";
import {
    Pencil, ScanLine, Hexagon, Square, Circle as CircleIcon,
    ImageIcon, Layers, MousePointer, Sparkles, Upload,
    Crosshair, BookImage, Info,
} from "lucide-react";
import { AnnotationImage, Point, Polygon } from "@/types";
import { ImageUploader } from "@/components/annotate/ImageUploader";
import { ImageFilmstrip } from "@/components/annotate/ImageFilmstrip";
import { AnnotationSidebar } from "@/components/annotate/AnnotationSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/api";

// Dynamically load the Konva Canvas to bypass Next.js SSR issues
const AnnotationCanvas = dynamic(
    () => import("@/components/annotate/AnnotationCanvas").then((m) => m.AnnotationCanvas),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[400px] bg-bg-secondary flex items-center justify-center border border-border rounded-2xl">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span className="text-xs text-text-secondary">Loading Annotation Canvas...</span>
                </div>
            </div>
        ),
    }
);

/* ─── Quick-access tool badge ───────────────────────────────────────────────── */
interface ToolBadgeProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    shortcut: string;
    glow: string;
    active?: boolean;
}
function ToolBadge({ icon, label, description, shortcut, glow, active }: ToolBadgeProps) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 group relative overflow-hidden"
            style={{
                background: active ? `${glow}14` : "rgba(255,255,255,0.025)",
                borderColor: active ? `${glow}35` : "rgba(255,255,255,0.07)",
                boxShadow: active ? `0 0 20px ${glow}18` : "none",
            }}
        >
            {/* Icon */}
            <div
                className="h-9 w-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                    background: `${glow}1A`,
                    border: `1px solid ${glow}30`,
                    color: glow,
                }}
            >
                {icon}
            </div>
            {/* Labels */}
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-text-primary leading-none">{label}</span>
                <span className="text-[10px] text-text-secondary mt-0.5 leading-tight">{description}</span>
            </div>
            {/* Shortcut key */}
            <kbd
                className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                }}
            >
                {shortcut}
            </kbd>
        </div>
    );
}

/* ─── Annotate Header Section ───────────────────────────────────────────────── */
interface AnnotateHeaderProps {
    imageCount: number;
    annotationCount: number;
    mode: "select" | "draw";
    drawType: "polygon" | "rectangle" | "circle";
}

function AnnotateHeader({ imageCount, annotationCount, mode, drawType }: AnnotateHeaderProps) {
    return (
        <div
            className="relative rounded-[28px] overflow-hidden border flex-shrink-0"
            style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(12,12,20,0.92) 45%, rgba(6,182,212,0.07) 100%)",
                borderColor: "rgba(255,255,255,0.08)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px rgba(0,0,0,0.4)",
            }}
        >
            {/* Decorative glows */}
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 65%)" }} />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)" }} />

            {/* Fine blueprint grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />
            {/* Diagonal slash accent */}
            <div className="absolute top-0 right-0 w-48 h-full pointer-events-none overflow-hidden opacity-[0.04]"
                style={{
                    backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 14px)",
                }}
            />

            <div className="relative z-10 p-6 flex flex-col gap-6">

                {/* Top row: title block + status pills */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-6 w-6 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)" }}
                            >
                                <Crosshair className="h-3.5 w-3.5 text-purple-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                Vector Annotation Workspace
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight leading-tight">
                            <span className="text-text-primary">Annotate &</span>{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: "linear-gradient(90deg, #a78bfa, #38bdf8)" }}
                            >
                                Label Regions
                            </span>
                        </h1>
                        <p className="text-xs text-text-secondary leading-relaxed max-w-[380px]">
                            Trace polygon masks, bounding boxes, and pinpoint circles over your uploaded reference images.
                        </p>
                    </div>

                    {/* Live session status pills */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Images stat */}
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                            >
                                <BookImage className="h-3.5 w-3.5 text-indigo-400" />
                                <span className="text-xs font-bold text-indigo-300">
                                    {imageCount} Image{imageCount !== 1 ? "s" : ""}
                                </span>
                            </div>
                            {/* Annotations stat */}
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                            >
                                <Layers className="h-3.5 w-3.5 text-purple-400" />
                                <span className="text-xs font-bold text-purple-300">
                                    {annotationCount} Shape{annotationCount !== 1 ? "s" : ""}
                                </span>
                            </div>
                            {/* Mode badge */}
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                style={{
                                    background: mode === "draw" ? "rgba(16,185,129,0.12)" : "rgba(99,102,241,0.1)",
                                    border: `1px solid ${mode === "draw" ? "rgba(16,185,129,0.25)" : "rgba(99,102,241,0.2)"}`,
                                }}
                            >
                                <div
                                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                                    style={{ background: mode === "draw" ? "#10b981" : "#6366F1" }}
                                />
                                <span className="text-xs font-bold" style={{ color: mode === "draw" ? "#6ee7b7" : "#a5b4fc" }}>
                                    {mode === "draw" ? "Draw Mode" : "Select Mode"}
                                </span>
                            </div>
                        </div>

                        {/* Keyboard shortcut hint */}
                        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                            <Info className="h-3 w-3 flex-shrink-0" />
                            Press <kbd className="px-1 py-0.5 rounded text-[9px] bg-white/6 border border-white/10">D</kbd> to draw,{" "}
                            <kbd className="px-1 py-0.5 rounded text-[9px] bg-white/6 border border-white/10">V</kbd> to select,{" "}
                            <kbd className="px-1 py-0.5 rounded text-[9px] bg-white/6 border border-white/10">Del</kbd> to remove
                        </div>
                    </div>
                </div>

                {/* Tool quick-reference row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ToolBadge
                        icon={<MousePointer className="h-4 w-4" />}
                        label="Select"
                        description="Click & highlight shapes"
                        shortcut="V"
                        glow="#6366F1"
                        active={mode === "select"}
                    />
                    <ToolBadge
                        icon={<Hexagon className="h-4 w-4" />}
                        label="Polygon"
                        description="Trace multi-vertex regions"
                        shortcut="D"
                        glow="#a78bfa"
                        active={mode === "draw" && drawType === "polygon"}
                    />
                    <ToolBadge
                        icon={<Square className="h-4 w-4" />}
                        label="Bounding Box"
                        description="Drag-draw rectangles"
                        shortcut="D"
                        glow="#38bdf8"
                        active={mode === "draw" && drawType === "rectangle"}
                    />
                    <ToolBadge
                        icon={<CircleIcon className="h-4 w-4" />}
                        label="Pinpoint Circle"
                        description="Click center, drag radius"
                        shortcut="D"
                        glow="#c084fc"
                        active={mode === "draw" && drawType === "circle"}
                    />
                </div>
            </div>
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function AnnotatePage() {
    const [images, setImages] = useState<AnnotationImage[]>([]);
    const [activeImage, setActiveImage] = useState<AnnotationImage | null>(null);
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(true);

    const [mode, setMode] = useState<"select" | "draw">("select");
    const [drawType, setDrawType] = useState<"polygon" | "rectangle" | "circle">("polygon");
    const [selectedPolygonId, setSelectedPolygonId] = useState<number | null>(null);
    const [newPoints, setNewPoints] = useState<Point[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [currentColor, setCurrentColor] = useState("#6366F1");

    const fetchImages = async (autoSelectLatest = false) => {
        setIsLoadingImages(true);
        try {
            const data = await apiRequest<AnnotationImage[]>("/images/");
            startTransition(() => {
                setImages(data);
                if (data.length > 0) {
                    if (autoSelectLatest) setActiveImage(data[0]);
                    else if (!activeImage) setActiveImage(data[0]);
                }
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to load images");
        } finally {
            setIsLoadingImages(false);
        }
    };

    const fetchPolygons = async (imageId: number) => {
        try {
            const data = await apiRequest<Polygon[]>(`/images/${imageId}/polygons/`);
            startTransition(() => { setPolygons(data); });
        } catch (error: any) {
            toast.error(error.message || "Failed to load polygons");
        }
    };

    useEffect(() => { fetchImages(); }, []);

    useEffect(() => {
        if (activeImage) {
            setNewPoints([]);
            setSelectedPolygonId(null);
            fetchPolygons(activeImage.id);
        } else {
            setPolygons([]);
        }
    }, [activeImage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
            if ((e.key === "Delete" || e.key === "Backspace") && selectedPolygonId !== null) {
                e.preventDefault();
                handleDeleteSelectedPolygon();
            } else if (e.key.toLowerCase() === "d") {
                setMode("draw");
            } else if (e.key.toLowerCase() === "v") {
                setMode("select");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedPolygonId]);

    const handlePolygonCreate = async (points: Point[]) => {
        if (!activeImage) return;
        setIsSaving(true);
        try {
            const created = await apiRequest<Polygon>(`/images/${activeImage.id}/polygons/`, {
                method: "POST",
                body: JSON.stringify({ points, label: currentColor }),
            });
            toast.success("Shape saved!");
            setPolygons((prev) => [...prev, created]);
            setNewPoints([]);
        } catch (error: any) {
            toast.error(error.message || "Failed to save polygon");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePolygon = async (id: number) => {
        try {
            await apiRequest(`/polygons/${id}/`, { method: "DELETE" });
            toast.success("Shape removed");
            setPolygons((prev) => prev.filter((p) => p.id !== id));
            if (selectedPolygonId === id) setSelectedPolygonId(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to remove shape");
        }
    };

    const handleDeleteSelectedPolygon = () => {
        if (selectedPolygonId !== null) handleDeletePolygon(selectedPolygonId);
    };

    const handleClearCanvas = () => {
        if (newPoints.length > 0) {
            setNewPoints([]);
            toast.info("Cleared unfinished drawing.");
        } else {
            toast.info("Select a shape and press Delete to remove it.");
        }
    };

    const handleUploadSuccess = (_img: AnnotationImage) => { fetchImages(true); };

    return (
        <div className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto w-full min-h-0 select-none relative">
            {/* Clean ambient glow — no cluttered ghost elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-1/3 w-[450px] h-[280px] rounded-full opacity-40"
                    style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)", filter: "blur(70px)" }} />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[250px] rounded-full opacity-35"
                    style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)", filter: "blur(65px)" }} />
            </div>

            {/* ── Header section ── */}
            <div className="relative z-10">
                <AnnotateHeader
                    imageCount={images.length}
                    annotationCount={polygons.length}
                    mode={mode}
                    drawType={drawType}
                />
            </div>

            {/* ── Workspace ── */}
            <div className="flex flex-col gap-5 flex-1 relative z-10">
                {isLoadingImages ? (
                    <div className="flex-1 flex flex-col gap-4 min-h-[380px]">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="flex-1 w-full rounded-2xl" />
                    </div>
                ) : images.length === 0 ? (
                    <ImageUploader onUploadSuccess={handleUploadSuccess} />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-5 items-stretch flex-1">
                        {/* Canvas + Filmstrip */}
                        <div className="flex-1 flex flex-col gap-5">
                            {activeImage && (
                                <AnnotationCanvas
                                    activeImage={activeImage}
                                    polygons={polygons}
                                    onPolygonCreate={handlePolygonCreate}
                                    mode={mode}
                                    selectedPolygonId={selectedPolygonId}
                                    onSelectPolygon={setSelectedPolygonId}
                                    newPoints={newPoints}
                                    onNewPointsChange={setNewPoints}
                                    currentColor={currentColor}
                                    drawType={drawType}
                                />
                            )}
                            <ImageFilmstrip
                                images={images}
                                activeImage={activeImage}
                                onSelectImage={setActiveImage}
                                onUploadSuccess={handleUploadSuccess}
                            />
                        </div>

                        {/* Right-Hand Sidebar */}
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <AnnotationSidebar
                                mode={mode}
                                onModeChange={setMode}
                                drawType={drawType}
                                onDrawTypeChange={setDrawType}
                                polygons={polygons}
                                selectedPolygonId={selectedPolygonId}
                                onSelectPolygon={setSelectedPolygonId}
                                onDeletePolygon={handleDeletePolygon}
                                onClearCanvas={handleClearCanvas}
                                isSaving={isSaving}
                                color={currentColor}
                                onColorChange={setCurrentColor}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
