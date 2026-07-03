import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, type = "text", ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-display font-medium text-text-secondary tracking-wide">
                        {label}
                    </label>
                ) }
                <input
                    ref={ref}
                    type={type}
                    className={`w-full bg-bg-primary/40 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 ${
                        error ? "border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500" : ""
                    } ${className}`}
                    {...props}
                />
                {error && (
                    <span className="text-xs font-medium text-priority-high mt-0.5">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
