"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/api";
import { AnnotationImage } from "@/types";

interface ImageUploaderProps {
    onUploadSuccess: (image: AnnotationImage) => void;
    className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onUploadSuccess,
    className = "",
}) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const processFile = async (file: File) => {
        // Validate it is an image
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (PNG, JPG, etc.)");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            // Send multipart upload to the backend proxy
            const newImage = await apiRequest<AnnotationImage>("/images/", {
                method: "POST",
                body: formData,
            });
            toast.success("Image uploaded successfully!");
            onUploadSuccess(newImage);
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload image. Please verify Django and ImgBB keys.");
        } finally {
            setIsUploading(false);
            setIsDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 text-center cursor-pointer select-none transition-all duration-150 min-h-[360px] ${
                isDragActive
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border bg-surface/10 hover:bg-surface/20 hover:border-border-focus"
            } ${className}`}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
            />

            {isUploading ? (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="relative flex items-center justify-center">
                        {/* Loading progress spinner track */}
                        <div className="h-14 w-14 rounded-full border-2 border-border" />
                        <div className="absolute h-14 w-14 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                        <ImageIcon className="absolute h-6 w-6 text-accent" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-text-primary">
                            Uploading image...
                        </span>
                        <p className="text-[10px] text-text-secondary">
                            Processing filters and uploading to host node.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-surface border border-border/60 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors">
                        <UploadCloud className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-text-primary">
                            Drag & drop image, or <span className="text-accent hover:underline">browse</span>
                        </span>
                        <p className="text-[10px] text-text-secondary leading-relaxed max-w-[280px]">
                            Supports PNG, JPEG, WEBP files. Image data will be uploaded and stored securely.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
