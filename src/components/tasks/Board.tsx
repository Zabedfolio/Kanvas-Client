"use client";

import React, { useEffect, useState, startTransition } from "react";
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDateStore } from "@/lib/store";
import { Task } from "@/types";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/api";

export const Board: React.FC = () => {
    const { selectedDate } = useDateStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state controllers
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [defaultStatus, setDefaultStatus] = useState<"todo" | "in_progress" | "done">("todo");

    // Configure sensors for drag sensitivity
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement starts drag, allowing clicks to pass through safely
            },
        })
    );

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest<Task[]>(`/tasks/?date=${selectedDate}`);
            startTransition(() => {
                setTasks(data);
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to load tasks");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [selectedDate]);

    // Handle Drag End event
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as number;
        const overId = over.id as string; // Can be a status string ("todo", "in_progress", "done") or card ID

        // Find current task
        const draggedTask = tasks.find((t) => t.id === taskId);
        if (!draggedTask) return;

        // Determine destination status
        let targetStatus: "todo" | "in_progress" | "done" = draggedTask.status;

        if (overId === "todo" || overId === "in_progress" || overId === "done") {
            targetStatus = overId;
        } else {
            // Dragged over another task card, extract its status
            const targetTask = tasks.find((t) => t.id === Number(overId));
            if (targetTask) {
                targetStatus = targetTask.status;
            }
        }

        // If status is identical, no change required
        if (draggedTask.status === targetStatus) return;

        // 1. Optimistic UI update
        const originalStatus = draggedTask.status;
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
        );

        // 2. REST API update
        try {
            await apiRequest(`/tasks/${taskId}/`, {
                method: "PATCH",
                body: JSON.stringify({ status: targetStatus }),
            });
            const statusLabel = targetStatus === "in_progress" ? "In Progress" : targetStatus === "todo" ? "To Do" : "Done";
            toast.success(`Moved to ${statusLabel}`);
        } catch (error: any) {
            // 3. Rollback state upon network/auth failure
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status: originalStatus } : t))
            );
            toast.error(error.message || "Failed to save drag position. Rolled back.");
        }
    };

    const handleOpenCreateModal = (status: "todo" | "in_progress" | "done") => {
        setActiveTask(null);
        setDefaultStatus(status);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task: Task) => {
        setActiveTask(task);
        setIsModalOpen(true);
    };

    // Filter tasks by status columns
    const todoTasks = tasks.filter((t) => t.status === "todo");
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
    const doneTasks = tasks.filter((t) => t.status === "done");

    // Skeletons during load
    if (isLoading && tasks.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 mt-2">
                {[1, 2, 3].map((colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-4 bg-bg-secondary/15 border border-border p-4 rounded-lg">
                        <div className="flex items-center gap-2 pb-2 border-b border-border/40 justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-6 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-3 mt-2">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* DndContext wrapping Columns */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-stretch">
                    <Column
                        status="todo"
                        title="To Do"
                        tasks={todoTasks}
                        onAddTask={() => handleOpenCreateModal("todo")}
                        onEditTask={handleOpenEditModal}
                    />
                    <Column
                        status="in_progress"
                        title="In Progress"
                        tasks={inProgressTasks}
                        onAddTask={() => handleOpenCreateModal("in_progress")}
                        onEditTask={handleOpenEditModal}
                    />
                    <Column
                        status="done"
                        title="Done"
                        tasks={doneTasks}
                        onAddTask={() => handleOpenCreateModal("done")}
                        onEditTask={handleOpenEditModal}
                    />
                </div>
            </DndContext>

            {/* Combined Add/Edit Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={activeTask}
                defaultDate={selectedDate}
                onSuccess={fetchTasks}
            />
        </div>
    );
};
