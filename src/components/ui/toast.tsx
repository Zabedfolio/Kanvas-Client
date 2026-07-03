"use client";

import React, { useEffect } from "react";
import { create } from "zustand";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = "info") => {
        const id = Math.random().toString(36).slice(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    },
    removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },
}));

export const toast = {
    success: (msg: string) => useToastStore.getState().addToast(msg, "success"),
    error: (msg: string) => useToastStore.getState().addToast(msg, "error"),
    warning: (msg: string) => useToastStore.getState().addToast(msg, "warning"),
    info: (msg: string) => useToastStore.getState().addToast(msg, "info"),
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
            <AnimatePresence>
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle2 className="h-4 w-4 text-status-done" />,
        error: <AlertCircle className="h-4 w-4 text-priority-high" />,
        warning: <AlertTriangle className="h-4 w-4 text-priority-medium" />,
        info: <Info className="h-4 w-4 text-accent" />,
    };

    const borders = {
        success: "border-status-done/20",
        error: "border-priority-high/20",
        warning: "border-priority-medium/20",
        info: "border-accent/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-start justify-between bg-surface border ${borders[toast.type]} rounded-md p-3.5 shadow-xl`}
        >
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
                <span className="text-sm font-medium text-text-primary">
                    {toast.message}
                </span>
            </div>
            <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary ml-4 transition-colors cursor-pointer"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
};
