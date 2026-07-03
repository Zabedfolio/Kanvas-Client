"use client";

import React, { useState, useEffect } from "react";
import {
    Kanban, Calendar as CalendarIcon, BarChart3,
    CheckCircle2, Clock3, ListTodo, Layers2,
    ArrowUpRight, Sparkles, TrendingUp, Zap,
} from "lucide-react";
import { DateSelector } from "@/components/shared/DateSelector";
import { Board } from "@/components/tasks/Board";
import { CalendarView } from "@/components/tasks/CalendarView";
import { AnalyticsView } from "@/components/tasks/AnalyticsView";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Task } from "@/types";
import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { format } from "date-fns";

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accent: string;        // tailwind color name e.g. "indigo"
    glow: string;          // hex for box-shadow
    trend?: string;
}

function StatCard({ label, value, icon, accent, glow, trend }: StatCardProps) {
    return (
        <div
            className="relative flex-1 min-w-[120px] rounded-2xl p-4 flex flex-col gap-3 border overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
            style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.07)",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
        >
            {/* Hover glow fill */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 30% 50%, ${glow}10 0%, transparent 70%)` }}
            />

            <div className="flex items-start justify-between">
                <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${glow}18`, border: `1px solid ${glow}30`, color: glow }}
                >
                    {icon}
                </div>
                {trend && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                        <ArrowUpRight className="h-3 w-3" />
                        {trend}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-display font-black text-text-primary leading-none">
                    {value}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                    {label}
                </span>
            </div>
        </div>
    );
}

/* ─── Tasks Header Section ──────────────────────────────────────────────────── */
interface TasksHeaderProps {
    view: "board" | "calendar" | "analytics";
    onViewChange: (v: "board" | "calendar" | "analytics") => void;
    stats: { total: number; todo: number; inProgress: number; done: number };
    userName: string;
}

function TasksHeader({ view, onViewChange, stats, userName }: TasksHeaderProps) {
    const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
    const today = format(new Date(), "EEEE, MMMM d");
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return (
        <div className="relative rounded-[28px] overflow-hidden border border-white/8 flex-shrink-0"
            style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(12,12,20,0.9) 40%, rgba(168,85,247,0.08) 100%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px rgba(0,0,0,0.4)",
            }}
        >
            {/* Decorative top-left glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)" }} />
            {/* Decorative bottom-right glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%)" }} />

            {/* Grid texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative z-10 p-6 flex flex-col gap-6">
                {/* Top row: greeting + view toggles */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Greeting block */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
                                <Sparkles className="h-3.5 w-3.5 text-accent" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                                {today}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-text-primary tracking-tight leading-tight">
                            {greeting}{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
                        </h1>
                        <p className="text-xs text-text-secondary max-w-[340px] leading-relaxed">
                            You have{" "}
                            <span className="text-accent font-bold">{stats.inProgress} task{stats.inProgress !== 1 ? "s" : ""}</span>
                            {" "}in progress and{" "}
                            <span className="text-amber-400 font-bold">{stats.todo} planned</span>
                            {" "}for your sprint. Keep it up.
                        </p>
                    </div>

                    {/* View toggle — pill style */}
                    <div className="flex items-center rounded-xl p-0.5 self-start sm:self-auto flex-shrink-0"
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {([
                            { id: "board",     label: "Board",     Icon: Kanban },
                            { id: "calendar",  label: "Calendar",  Icon: CalendarIcon },
                            { id: "analytics", label: "Analytics", Icon: BarChart3 },
                        ] as const).map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                onClick={() => onViewChange(id)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer"
                                style={view === id ? {
                                    background: "rgba(99,102,241,0.25)",
                                    border: "1px solid rgba(99,102,241,0.4)",
                                    color: "#c4b5fd",
                                    boxShadow: "0 0 12px rgba(99,102,241,0.2)",
                                } : {
                                    color: "rgba(255,255,255,0.4)",
                                    border: "1px solid transparent",
                                }}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 flex-wrap">
                    <StatCard
                        label="Total Tasks"
                        value={stats.total}
                        icon={<Layers2 className="h-4 w-4" />}
                        accent="indigo"
                        glow="#6366F1"
                        trend="+12%"
                    />
                    <StatCard
                        label="To Do"
                        value={stats.todo}
                        icon={<ListTodo className="h-4 w-4" />}
                        accent="slate"
                        glow="#94a3b8"
                    />
                    <StatCard
                        label="In Progress"
                        value={stats.inProgress}
                        icon={<Clock3 className="h-4 w-4" />}
                        accent="blue"
                        glow="#3b82f6"
                    />
                    <StatCard
                        label="Completed"
                        value={stats.done}
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        accent="emerald"
                        glow="#10b981"
                        trend={completionPct > 0 ? `${completionPct}%` : undefined}
                    />

                    {/* Completion progress bar card */}
                    <div className="relative flex-1 min-w-[180px] rounded-2xl p-4 flex flex-col gap-3 border overflow-hidden"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            borderColor: "rgba(255,255,255,0.07)",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Sprint Progress</span>
                            </div>
                            <span className="text-sm font-display font-black text-emerald-400">{completionPct}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${completionPct}%`,
                                    background: "linear-gradient(90deg, #10b981, #6366F1)",
                                    boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-1 mt-auto">
                            <Zap className="h-3 w-3 text-amber-400" />
                            <span className="text-[10px] text-text-secondary">
                                {stats.done} of {stats.total} tasks resolved
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function TasksPage() {
    const [view, setView] = useState<"board" | "calendar" | "analytics">("board");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [modalDate, setModalDate] = useState("");

    const { data: session } = authClient.useSession();
    const userName = session?.user?.name || "";

    useEffect(() => {
        apiRequest<Task[]>("/tasks/")
            .then((data) => {
                setStats({
                    total: data.length,
                    todo: data.filter((t) => t.status === "todo").length,
                    inProgress: data.filter((t) => t.status === "in_progress").length,
                    done: data.filter((t) => t.status === "done").length,
                });
            })
            .catch(() => {});
    }, [refreshTrigger]);

    const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

    const handleAddCalendarTask = (dateStr: string) => {
        setActiveTask(null);
        setModalDate(dateStr);
        setIsModalOpen(true);
    };

    const handleEditCalendarTask = (task: Task) => {
        setActiveTask(task);
        setModalDate(task.due_date || "");
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto min-h-0 select-none relative">
            {/* Ambient background — clean, not cluttered */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full opacity-50"
                    style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full opacity-40"
                    style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
            </div>

            {/* ── Header section ── */}
            <div className="relative z-10">
                <TasksHeader
                    view={view}
                    onViewChange={setView}
                    stats={stats}
                    userName={userName}
                />
            </div>

            {/* ── View content ── */}
            <div className="relative z-10 flex flex-col flex-1 gap-5 min-h-0">
                {view === "board" && (
                    <>
                        <DateSelector />
                        <Board />
                    </>
                )}
                {view === "calendar" && (
                    <CalendarView
                        onAddTask={handleAddCalendarTask}
                        onEditTask={handleEditCalendarTask}
                        refreshTrigger={refreshTrigger}
                    />
                )}
                {view === "analytics" && (
                    <AnalyticsView refreshTrigger={refreshTrigger} />
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={activeTask}
                defaultDate={modalDate}
                onSuccess={triggerRefresh}
            />
        </div>
    );
}
