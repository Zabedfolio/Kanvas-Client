"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash, Check, X, AlertTriangle } from "lucide-react";
import { Task } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/api";

const taskSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["todo", "in_progress", "done"]),
    due_date: z.string().nullable().refine((val) => val === null || val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "Date must be in YYYY-MM-DD format",
    }),
    tags: z.string().optional(), // Comma-separated
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task | null; // If null, we are in CREATE mode. If present, EDIT mode.
    defaultDate: string;
    onSuccess: () => void; // Triggered when task is created/edited/deleted to refresh board
}

export const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    task,
    defaultDate,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const isEditMode = !!task;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            status: "todo",
            due_date: defaultDate,
            tags: "",
        },
    });

    // Populate form values when task changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setShowConfirmDelete(false);
            if (task) {
                reset({
                    title: task.title,
                    description: task.description || "",
                    priority: task.priority,
                    status: task.status,
                    due_date: task.due_date || "",
                    tags: task.tags.map((t) => t.name).join(", "),
                });
            } else {
                reset({
                    title: "",
                    description: "",
                    priority: "medium",
                    status: "todo",
                    due_date: defaultDate,
                    tags: "",
                });
            }
        }
    }, [isOpen, task, defaultDate, reset]);

    const handleFormSubmit = async (values: TaskFormValues) => {
        setIsLoading(true);
        
        // Parse comma-separated tags into array of strings
        const tagNames = values.tags
            ? values.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
            : [];

        const payload = {
            title: values.title,
            description: values.description || "",
            priority: values.priority,
            status: values.status,
            due_date: values.due_date || null,
            tag_names: tagNames,
        };

        try {
            if (isEditMode && task) {
                // Update
                await apiRequest(`/tasks/${task.id}/`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
                toast.success("Task updated successfully!");
            } else {
                // Create
                await apiRequest("/tasks/", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                toast.success("Task created successfully!");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save task.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTask = async () => {
        if (!task) return;
        setIsLoading(true);
        try {
            await apiRequest(`/tasks/${task.id}/`, {
                method: "DELETE",
            });
            toast.success("Task deleted successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete task.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? "Edit Task" : "Create New Task"}
        >
            {showConfirmDelete ? (
                /* Destructive Deletion Confirmation Card Overlay */
                <div className="flex flex-col gap-4 py-2 text-center items-center">
                    <div className="h-12 w-12 rounded-full bg-red-950/30 border border-priority-high/30 flex items-center justify-center text-priority-high mb-1">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h4 className="font-display font-semibold text-text-primary text-sm tracking-wide">
                        Delete this task?
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed max-w-[280px]">
                        Are you sure you want to permanently remove <span className="text-text-primary font-semibold">"{task?.title}"</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full mt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowConfirmDelete(false)}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteTask}
                            className="flex-1"
                            isLoading={isLoading}
                        >
                            Yes, Delete
                        </Button>
                    </div>
                </div>
            ) : (
                /* Task Form */
                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
                    <Input
                        {...register("title")}
                        label="Task Title"
                        placeholder="Define milestones..."
                        error={errors.title?.message}
                    />

                    <div className="w-full flex flex-col gap-1.5">
                        <label className="text-xs font-display font-medium text-text-secondary tracking-wide">
                            Description
                        </label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            placeholder="Write description or context..."
                            className="w-full bg-bg-primary/40 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            {...register("priority")}
                            label="Priority"
                            options={[
                                { value: "low", label: "Low" },
                                { value: "medium", label: "Medium" },
                                { value: "high", label: "High" },
                            ]}
                        />

                        <Select
                            {...register("status")}
                            label="Status"
                            options={[
                                { value: "todo", label: "To Do" },
                                { value: "in_progress", label: "In Progress" },
                                { value: "done", label: "Done" },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            {...register("due_date")}
                            label="Due Date (YYYY-MM-DD)"
                            type="date"
                            error={errors.due_date?.message}
                        />

                        <Input
                            {...register("tags")}
                            label="Tags (comma separated)"
                            placeholder="design, dev, urgent"
                            error={errors.tags?.message}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-4 border-t border-border pt-4">
                        {isEditMode ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowConfirmDelete(true)}
                                className="text-text-secondary hover:text-priority-high"
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        ) : (
                            <div />
                        )}

                        <div className="flex gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Save Task
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </Dialog>
    );
};
