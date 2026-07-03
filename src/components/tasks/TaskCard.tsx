"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Tag as TagIcon } from "lucide-react";
import { Task } from "@/types";

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    // Transform styling for dragging (adds scale and rotative tilt during drag)
    const style = {
        transform: transform
            ? `${CSS.Transform.toString(transform)} ${isDragging ? "scale(1.03) rotate(2.5deg)" : ""}`
            : undefined,
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.3 : 1,
    };

    // Format due date safely
    const formattedDate = task.due_date
        ? format(parseISO(task.due_date), "MMM d")
        : null;

    // Custom priority colors and dots with glows
    const priorityDot = {
        low: "bg-slate-400 shadow-[0_0_8px_#94a3b8]",
        medium: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
        high: "bg-rose-400 shadow-[0_0_8px_#f43f5e]",
    };

    const priorityBadge = {
        low: "bg-slate-500/10 border-slate-500/20 text-slate-400",
        medium: "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.05)]",
        high: "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.05)]",
    };

    const priorityLabels = {
        low: "Low",
        medium: "Medium",
        high: "High",
    };

    // Ambient hover glows mapping to priority levels
    const hoverGlows = {
        low: "hover:shadow-[0_0_15px_rgba(148,163,184,0.1)] hover:border-slate-500/30",
        medium: "hover:shadow-[0_0_20px_rgba(245,158,11,0.14)] hover:border-amber-500/30",
        high: "hover:shadow-[0_0_20px_rgba(244,63,94,0.18)] hover:border-rose-500/30",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group glass-panel rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 ${
                hoverGlows[task.priority]
            } ${
                isDragging ? "shadow-2xl ring-1 ring-accent/30 border-accent/40 bg-surface/80" : ""
            }`}
        >
            {/* Draggable Card Header/Title Area */}
            <div className="flex flex-col gap-2.5" {...attributes} {...listeners}>
                {/* Priority Indicator Pill */}
                <div className="flex items-center justify-between">
                    <span className={`text-[9px] border px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${priorityBadge[task.priority]}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${priorityDot[task.priority]}`} />
                        {priorityLabels[task.priority]}
                    </span>
                </div>

                {/* Title and Description */}
                <div className="flex flex-col gap-1">
                    <h4 className="font-display font-semibold text-sm text-text-primary group-hover:text-accent transition-colors duration-150 leading-tight">
                        {task.title}
                    </h4>
                    {task.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Tags and Due Date Row */}
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px] text-text-secondary mt-1 cursor-pointer hover:text-text-primary transition-colors"
            >
                {/* Custom Gradient Tags */}
                <div className="flex flex-wrap gap-1 items-center max-w-[65%]">
                    {task.tags.length > 0 ? (
                        task.tags.slice(0, 2).map((t) => (
                            <span
                                key={t.id}
                                className="bg-gradient-to-r from-accent/[0.08] to-accent/[0.03] border border-accent/15 px-2 py-0.5 rounded-full text-[9px] font-semibold text-accent/90 truncate shadow-[0_0_8px_rgba(99,102,241,0.06)]"
                            >
                                {t.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-[9px] text-text-secondary/35 italic flex items-center gap-1">
                            <TagIcon className="h-2.5 w-2.5" /> No tags
                        </span>
                    )}
                    {task.tags.length > 2 && (
                        <span className="text-[9px] text-accent font-bold">
                            +{task.tags.length - 2}
                        </span>
                    )}
                </div>

                {/* Due Date Indicator */}
                {formattedDate && (
                    <span className="flex items-center gap-1 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/5 shadow-inner">
                        <CalendarIcon className="h-3 w-3 text-accent" />
                        {formattedDate}
                    </span>
                )}
            </div>
        </div>
    );
};
