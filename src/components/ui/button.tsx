import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center font-display font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.97]";
        
        const variants = {
            primary: "bg-gradient-to-r from-accent via-purple-500 to-pink-500 hover:opacity-95 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] shadow-md shadow-accent/15 border border-white/5 text-white",
            secondary: "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 text-text-primary",
            outline: "bg-transparent text-text-primary border border-white/10 hover:bg-white/5 hover:border-white/15",
            ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5",
            danger: "bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-95 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] shadow-md shadow-rose-950/20 border border-white/5 text-white",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-4 py-2 text-sm",
            lg: "px-5 py-2.5 text-base",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = "Button";
