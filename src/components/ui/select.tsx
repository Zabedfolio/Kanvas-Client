import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = "", label, error, options, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-display font-medium text-text-secondary tracking-wide">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`w-full bg-bg-primary/40 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 appearance-none cursor-pointer ${
                            error ? "border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500" : ""
                        } ${className}`}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <span className="text-xs font-medium text-priority-high mt-0.5">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
