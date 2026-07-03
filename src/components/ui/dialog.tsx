"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className = "",
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Synchronize open state
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            if (dialog.open) {
                dialog.close();
            }
        }
    }, [isOpen]);

    // Handle Esc key natively via the 'cancel' event
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleCancel = (e: Event) => {
            e.preventDefault();
            onClose();
        };

        dialog.addEventListener("cancel", handleCancel);
        return () => {
            dialog.removeEventListener("cancel", handleCancel);
        };
    }, [onClose]);

    // Fallback for browsers that do not support declarative light-dismiss
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleBackdropClick = (event: MouseEvent) => {
            // Only trigger if click is on the dialog element itself (the backdrop)
            if (event.target !== dialog) return;

            const rect = dialog.getBoundingClientRect();
            const isClickInside = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );

            if (!isClickInside) {
                onClose();
            }
        };

        dialog.addEventListener("click", handleBackdropClick);
        return () => {
            dialog.removeEventListener("click", handleBackdropClick);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <dialog
            ref={dialogRef}
            // Declarative backdrop close for supporting browsers (Chrome 134+)
            // @ts-ignore
            closedby="any"
            className={`fixed inset-0 m-auto glass-panel border border-white/5 rounded-2xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] p-6 text-text-primary focus:outline-none w-[90%] max-w-md animate-modal-entry backdrop:bg-black/75 backdrop:backdrop-blur-md ${className}`}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 select-none">
                    {title ? (
                        <h3 className="text-base font-display font-bold tracking-tight text-text-primary">
                            {title}
                        </h3>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary p-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all duration-150 cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="pt-1">{children}</div>
            </div>
        </dialog>
    );
};
