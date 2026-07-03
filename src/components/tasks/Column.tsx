"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, ListTodo, FileText, CheckCircle2 } from "lucide-react";
import { Task } from "@/types";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
    status: "todo" | "in_progress" | "done";
    title: string;
    tasks: Task[];
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({
    status,
    title,
    tasks,
    onAddTask,
    onEditTask,
}) => {
    // Make this column a drop target
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    const taskIds = tasks.map((t) => t.id);

    // Color-coded borders and soft glows per column state
    const columnAccentStyles = {
        todo: "border-l-indigo-500/80 shadow-[0_4px_24px_rgba(99,102,241,0.02)]",
        in_progress: "border-l-cyan-500/80 shadow-[0_4px_24px_rgba(6,182,212,0.02)]",
        done: "border-l-emerald-500/80 shadow-[0_4px_24px_rgba(16,185,129,0.02)]",
    };

    // Glowing badge configuration for task count
    const countGlowClasses = {
        todo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.12)]",
        in_progress: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.12)]",
        done: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.12)]",
    };

    const statusIcons = {
        todo: <ListTodo className="h-4 w-4 text-indigo-400" />,
        in_progress: <FileText className="h-4 w-4 text-cyan-400 animate-pulse" />,
        done: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    };

    // Pulse effects when dragging cards hover over this column
    const dropZonePulse = {
        todo: "bg-indigo-500/[0.03] ring-1 ring-dashed ring-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.05)]",
        in_progress: "bg-cyan-500/[0.03] ring-1 ring-dashed ring-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.05)]",
        done: "bg-emerald-500/[0.03] ring-1 ring-dashed ring-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.05)]",
    };

    // Designed empty states
    const emptyStates = {
        todo: {
            title: "Plan your day",
            desc: "Add tasks that you need to start working on soon.",
        },
        in_progress: {
            title: "Focus on progress",
            desc: "Drag tasks here to signal they are actively being worked on.",
        },
        done: {
            title: "Celebrate completions",
            desc: "Finish items and drag them here to review your wins.",
        },
    };

    return (
        <div className={`flex-1 flex flex-col gap-4 glass-panel rounded-2xl p-4 min-w-[285px] border-l-[3.5px] ${columnAccentStyles[status]} transition-all duration-200`}>
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 select-none">
                <div className="flex items-center gap-2">
                    {statusIcons[status]}
                    <h3 className="font-display font-semibold text-sm text-text-primary tracking-tight">
                        {title}
                    </h3>
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${countGlowClasses[status]}`}>
                        {tasks.length}
                    </span>
                </div>

                <button
                    onClick={onAddTask}
                    className="p-1 text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer"
                    title="Add Task to this column"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {/* Droppable Card Container */}
            <div
                ref={setNodeRef}
                className={`flex-1 flex flex-col gap-3 rounded-xl transition-all duration-300 py-1.5 px-1 ${
                    isOver ? dropZonePulse[status] : ""
                }`}
            >
                {tasks.length > 0 ? (
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => onEditTask(task)}
                            />
                        ))}
                    </SortableContext>
                ) : (
                    // Designed empty state
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01] mt-1 select-none">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 border border-white/10 text-text-secondary/50 shadow-inner">
                            {statusIcons[status]}
                        </div>
                        <span className="text-xs font-semibold text-text-primary tracking-wide mb-1 font-display">
                            {emptyStates[status].title}
                        </span>
                        <p className="text-[10px] text-text-secondary leading-relaxed max-w-[200px]">
                            {emptyStates[status].desc}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
