import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-surface/40 border border-border/30 ${className}`}
            {...props}
        />
    );
};
