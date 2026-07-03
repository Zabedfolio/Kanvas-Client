"use client";

import React, { useRef, useEffect } from "react";
import { format, addDays, isToday, parseISO, startOfDay } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useDateStore } from "@/lib/store";

export const DateSelector: React.FC = () => {
    const { selectedDate, setSelectedDate } = useDateStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Format current selected date as Date object
    const selectedParsed = parseISO(selectedDate);

    // Generate a 15-day strip: 7 days before today to 7 days after today
    const today = startOfDay(new Date());
    const daysRange: Date[] = [];
    for (let i = -7; i <= 7; i++) {
        daysRange.push(addDays(today, i));
    }

    // Scroll to the selected date cell on mount/selection
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Find active cell element
        const activeCell = container.querySelector("[data-active='true']");
        if (activeCell) {
            const containerWidth = container.clientWidth;
            const cellOffset = (activeCell as HTMLElement).offsetLeft;
            const cellWidth = (activeCell as HTMLElement).clientWidth;
            
            // Scroll to center the active cell
            container.scrollTo({
                left: cellOffset - containerWidth / 2 + cellWidth / 2,
                behavior: "smooth",
            });
        }
    }, [selectedDate]);

    // Handle shift week back/forward
    const handleShiftWeek = (direction: "prev" | "next") => {
        const amount = direction === "prev" ? -7 : 7;
        const newDateObj = addDays(selectedParsed, amount);
        setSelectedDate(format(newDateObj, "yyyy-MM-dd"));
    };

    // Handle hidden input picker change
    const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setSelectedDate(e.target.value);
        }
    };

    // Truncate day name (e.g. Wednesday -> Wed)
    const getDayName = (date: Date) => format(date, "EEE");

    return (
        <div className="flex flex-col gap-3 w-full glass-panel p-4 rounded-2xl">
            {/* Header controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm text-text-primary">
                        {format(selectedParsed, "MMMM yyyy")}
                    </span>
                    {isToday(selectedParsed) && (
                        <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.15)] animate-pulse">
                            Today
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => handleShiftWeek("prev")}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 border border-white/5 rounded-lg transition-all cursor-pointer"
                        title="Previous Week"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <button
                        onClick={() => setSelectedDate(format(today, "yyyy-MM-dd"))}
                        className="text-xs px-3 py-1.5 bg-white/5 border border-white/5 text-text-primary hover:bg-white/10 rounded-lg font-medium transition-all cursor-pointer"
                    >
                        Today
                    </button>

                    <button
                        onClick={() => handleShiftWeek("next")}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 border border-white/5 rounded-lg transition-all cursor-pointer"
                        title="Next Week"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Arbitrary Calendar Picker Trigger */}
                    <label className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 border border-white/5 rounded-lg transition-all cursor-pointer relative">
                        <Calendar className="h-4 w-4" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDatePickerChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        />
                    </label>
                </div>
            </div>

            {/* Horizontal Scrollable Day Strip */}
            <div
                ref={scrollContainerRef}
                className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none snap-x snap-mandatory relative"
            >
                {daysRange.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isSelected = dateStr === selectedDate;
                    const isDateToday = isToday(date);
                    
                    return (
                        <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            data-active={isSelected}
                            className={`flex flex-col items-center justify-center min-w-[50px] h-[64px] rounded-lg border transition-all duration-250 cursor-pointer snap-start relative overflow-hidden z-10 ${
                                isSelected
                                    ? "border-transparent text-white"
                                    : "bg-surface/40 border-white/5 text-text-secondary hover:text-text-primary hover:border-border-focus hover:bg-surface-hover/60"
                            }`}
                        >
                            {/* Shared Layout Slide Indicator (Reference 1 matching neon capsule + scanlines) */}
                            {isSelected && (
                                <motion.div
                                    layoutId="activeDateGlow"
                                    className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-purple-900/50 to-pink-950/30 -z-10 border-[1.5px] border-accent/90 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.5)] glow-violet before:absolute before:inset-0 before:bg-[linear-gradient(45deg,rgba(139,92,246,0.1)_25%,transparent_25%,transparent_50%,rgba(139,92,246,0.1)_50%,rgba(139,92,246,0.1)_75%,transparent_75%,transparent)] before:bg-[length:6px_6px]"
                                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                />
                            )}
                            
                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                                {getDayName(date)}
                            </span>
                            <span className="text-base font-display font-bold mt-0.5">
                                {format(date, "dd")}
                            </span>
                            
                            {/* Today Indicator Dot */}
                            {isDateToday && (
                                <span className={`h-1.5 w-1.5 rounded-full mt-0.5 animate-pulse ${
                                    isSelected 
                                        ? "bg-white shadow-[0_0_8px_white]" 
                                        : "bg-accent shadow-[0_0_8px_#6366F1]"
                                }`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
