"use client";

import React, { useState, useEffect, startTransition } from "react";
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    parseISO, 
    addMonths, 
    subMonths,
    isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Task } from "@/types";
import { apiRequest } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface CalendarViewProps {
    onAddTask: (dateStr: string) => void;
    onEditTask: (task: Task) => void;
    refreshTrigger: number;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
    onAddTask, 
    onEditTask,
    refreshTrigger 
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllTasks = async () => {
        setIsLoading(true);
        try {
            // Fetch all tasks for the user (omitting date param returns all user tasks)
            const data = await apiRequest<Task[]>("/tasks/");
            startTransition(() => {
                setTasks(data);
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to load tasks for calendar");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTasks();
    }, [refreshTrigger, currentMonth]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    // Generate month grid coordinates
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Task priority dot styles
    const priorityDots = {
        low: "bg-slate-400 shadow-[0_0_6px_#94a3b8]",
        medium: "bg-amber-400 shadow-[0_0_6px_#f59e0b]",
        high: "bg-rose-400 shadow-[0_0_6px_#f43f5e]",
    };

    const priorityPills = {
        low: "bg-slate-500/10 border-slate-500/10 hover:border-slate-500/30 text-slate-300",
        medium: "bg-amber-500/10 border-amber-500/10 hover:border-amber-500/30 text-amber-300",
        high: "bg-rose-500/10 border-rose-500/10 hover:border-rose-500/30 text-rose-300",
    };

    return (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Calendar Control Header */}
            <div className="flex items-center justify-between bg-black/30 border border-white/5 p-4 rounded-2xl glass-panel select-none">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                        <CalendarIcon className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-display font-bold text-lg text-text-primary">
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 border border-white/5 rounded-xl transition-all cursor-pointer"
                        title="Previous Month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <button
                        onClick={handleToday}
                        className="text-xs px-3.5 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-text-primary font-bold rounded-xl transition-all cursor-pointer"
                    >
                        Today
                    </button>

                    <button
                        onClick={handleNextMonth}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 border border-white/5 rounded-xl transition-all cursor-pointer"
                        title="Next Month"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="flex-1 glass-panel border border-white/10 rounded-[28px] overflow-hidden flex flex-col min-h-[450px]">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01] py-2 text-center text-[10px] font-bold uppercase tracking-widest text-text-secondary select-none">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>

                {/* Monthly Cells Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr min-h-[400px]">
                    {days.map((day) => {
                        const dayStr = format(day, "yyyy-MM-dd");
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isDayToday = isToday(day);

                        // Filter tasks matching this date
                        const dayTasks = tasks.filter((task) => {
                            if (!task.due_date) return false;
                            try {
                                return isSameDay(parseISO(task.due_date), day);
                            } catch {
                                return false;
                            }
                        });

                        return (
                            <div
                                key={dayStr}
                                className={`border-r border-b border-white/5 p-2 flex flex-col gap-1.5 transition-all relative overflow-hidden group min-h-[70px] ${
                                    isCurrentMonth ? "bg-transparent" : "bg-black/20 opacity-30"
                                }`}
                            >
                                {/* Date Number and Add Button */}
                                <div className="flex items-center justify-between select-none">
                                    <span 
                                        className={`text-xs font-display font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                                            isDayToday 
                                                ? "bg-accent text-white shadow-md shadow-accent/20 font-extrabold" 
                                                : "text-text-secondary group-hover:text-text-primary"
                                        }`}
                                    >
                                        {format(day, "d")}
                                    </span>

                                    {isCurrentMonth && (
                                        <button
                                            onClick={() => onAddTask(dayStr)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 text-text-secondary hover:text-accent hover:bg-white/5 border border-transparent hover:border-white/10 rounded-md transition-all cursor-pointer"
                                            title="Add Task for this date"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Task Pills List */}
                                <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-none">
                                    {dayTasks.map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditTask(task);
                                            }}
                                            className={`w-full text-[10px] font-semibold text-left px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all truncate cursor-pointer ${
                                                priorityPills[task.priority]
                                            }`}
                                            title={task.title}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${priorityDots[task.priority]}`} />
                                            <span className="truncate">{task.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
