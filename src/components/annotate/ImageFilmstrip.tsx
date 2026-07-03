"use client";

import React, { useRef } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { AnnotationImage } from "@/types";
import { apiRequest } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface ImageFilmstripProps {
    images: AnnotationImage[];
    activeImage: AnnotationImage | null;
    onSelectImage: (image: AnnotationImage) => void;
    onUploadSuccess: (image: AnnotationImage) => void;
}

export const ImageFilmstrip: React.FC<ImageFilmstripProps> = ({
    images,
    activeImage,
    onSelectImage,
    onUploadSuccess,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    const getAbsoluteUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        return `${backendUrl}${url}`;
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file");
                return;
            }

            setIsUploading(true);
            const formData = new FormData();
            formData.append("image", file);

            try {
                const newImage = await apiRequest<AnnotationImage>("/images/", {
                    method: "POST",
                    body: formData,
                });
                toast.success("Image uploaded!");
                onUploadSuccess(newImage);
            } catch (error: any) {
                toast.error(error.message || "Upload failed");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="flex flex-col gap-2 bg-bg-secondary/40 border border-border p-4 rounded-lg">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary select-none">
                Image Filmstrip ({images.length})
            </span>
            
            <div className="flex gap-4 overflow-x-auto py-1 items-center scrollbar-none">
                {/* Image List */}
                {images.map((img) => {
                    const isActive = activeImage?.id === img.id;
                    return (
                        <button
                            key={img.id}
                            onClick={() => onSelectImage(img)}
                            className={`relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border transition-all duration-150 cursor-pointer ${
                                isActive
                                    ? "border-accent ring-2 ring-accent/30 shadow-md shadow-accent/15"
                                    : "border-border hover:border-border-focus"
                            }`}
                        >
                            <img
                                src={getAbsoluteUrl(img.url)}
                                alt={`Uploaded Thumbnail ${img.id}`}
                                className="w-full h-full object-cover"
                            />
                            {isActive && (
                                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
                            )}
                        </button>
                    );
                })}

                {/* Direct Upload button inside Filmstrip */}
                <button
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="flex-shrink-0 w-20 h-14 rounded-md border border-dashed border-border hover:border-border-focus bg-surface/10 hover:bg-surface/20 flex flex-col items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {isUploading ? (
                        <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            <span className="text-[8px] mt-0.5 font-medium tracking-wide">Upload</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
