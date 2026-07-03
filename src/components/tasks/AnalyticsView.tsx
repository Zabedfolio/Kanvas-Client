"use client";

import React, { useState, useEffect, startTransition } from "react";
import { BarChart3, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Task } from "@/types";
import { apiRequest } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface AnalyticsViewProps {
    refreshTrigger: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ refreshTrigger }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllTasks = async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest<Task[]>("/tasks/");
            startTransition(() => {
                setTasks(data);
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to load tasks for analytics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTasks();
    }, [refreshTrigger]);

    // Data summaries
    const totalCount = tasks.length;
    const todoCount = tasks.filter((t) => t.status === "todo").length;
    const progressCount = tasks.filter((t) => t.status === "in_progress").length;
    const doneCount = tasks.filter((t) => t.status === "done").length;

    // Calculate completion percentage
    const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    // Recent tasks logger feed
    const recentTasks = [...tasks]
        .sort((a, b) => b.id - a.id) // Get latest tasks
        .slice(0, 4);

    // ─── DYNAMIC METRICS: Card 1 Sparkline (Last 5 days activity) ───
    const sparkData: number[] = [];
    for (let i = 4; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - i);
        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
        const dd = String(targetDate.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const count = tasks.filter(
            (t) => t.due_date === dateStr || t.created_at.startsWith(dateStr)
        ).length;
        sparkData.push(count);
    }
    const maxSpark = Math.max(...sparkData, 2);
    const sparkPoints = sparkData.map((val, idx) => ({
        x: idx * 25, // space across viewBox width 100
        y: 35 - (val / maxSpark) * 28 // map height across viewBox 40
    }));

    const getSparklinePath = (pts: { x: number; y: number }[]) => {
        if (pts.length === 0) return "";
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cpX = (p0.x + p1.x) / 2;
            path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        return path;
    };
    const sparklinePath = getSparklinePath(sparkPoints);
    const sparklineFillPath = sparkPoints.length > 0 
        ? `${sparklinePath} L ${sparkPoints[sparkPoints.length - 1].x} 40 L 0 40 Z` 
        : "";

    // ─── DYNAMIC METRICS: Card 2 Mini Bars (Priority distribution + Todo + Done) ───
    const barValues = [
        tasks.filter((t) => t.priority === "low").length,
        tasks.filter((t) => t.priority === "medium").length,
        tasks.filter((t) => t.priority === "high").length,
        todoCount,
        progressCount
    ];
    const maxBarVal = Math.max(...barValues, 2);
    // Heights mapping from 4px to 38px
    const barHeights = barValues.map((val) => Math.max(4, Math.round((val / maxBarVal) * 38)));

    // ─── DYNAMIC METRICS: Large Chart (Last 6 months velocity) ───
    const monthsLabels: string[] = [];
    const addedCounts: number[] = [];
    const completedCounts: number[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString("default", { month: "short" });
        monthsLabels.push(monthName);

        const monthNum = d.getMonth();
        const yearNum = d.getFullYear();

        const addedInMonth = tasks.filter((t) => {
            const createdDate = new Date(t.created_at);
            return createdDate.getMonth() === monthNum && createdDate.getFullYear() === yearNum;
        }).length;

        const completedInMonth = tasks.filter((t) => {
            if (t.status !== "done") return false;
            const updatedDate = t.updated_at ? new Date(t.updated_at) : new Date(t.created_at);
            return updatedDate.getMonth() === monthNum && updatedDate.getFullYear() === yearNum;
        }).length;

        addedCounts.push(addedInMonth);
        completedCounts.push(completedInMonth);
    }

    const maxChartVal = Math.max(...addedCounts, ...completedCounts, 4);
    // Spacing points evenly across width 500 (6 points: 0, 100, 200, 300, 400, 500)
    const addedPoints = addedCounts.map((val, idx) => ({
        x: idx * 100,
        y: 175 - (val / maxChartVal) * 140
    }));

    const completedPoints = completedCounts.map((val, idx) => ({
        x: idx * 100,
        y: 175 - (val / maxChartVal) * 140
    }));

    const getBezierPath = (pts: { x: number; y: number }[]) => {
        if (pts.length === 0) return "";
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cpX = (p0.x + p1.x) / 2;
            path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        return path;
    };

    const addedLinePath = getBezierPath(addedPoints);
    const completedLinePath = getBezierPath(completedPoints);

    const addedAreaPath = addedPoints.length > 0 
        ? `${addedLinePath} L ${addedPoints[addedPoints.length - 1].x} 200 L 0 200 Z` 
        : "";

    const completedAreaPath = completedPoints.length > 0 
        ? `${completedLinePath} L ${completedPoints[completedPoints.length - 1].x} 200 L 0 200 Z` 
        : "";

    return (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 select-none">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metric Card 1: Total Tasks with Sparkline */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                            Total Planned Tasks
                        </span>
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-2">
                        <div>
                            <span className="text-3xl font-display font-black text-text-primary">
                                {totalCount}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold ml-2">
                                +{tasks.filter(t => {
                                    const created = new Date(t.created_at);
                                    const now = new Date();
                                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                }).length} this month
                            </span>
                        </div>

                        {/* Dynamic Sparkline curve drawing */}
                        <div className="w-24 h-10 overflow-visible opacity-80">
                            {sparklinePath ? (
                                <svg className="w-full h-full" viewBox="0 0 100 40">
                                    <defs>
                                        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={sparklinePath}
                                        fill="none"
                                        stroke="#6366F1"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d={sparklineFillPath}
                                        fill="url(#sparkGrad)"
                                    />
                                </svg>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[8px] text-text-secondary">No data</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metric Card 2: Active In-Progress with Bar Chart */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                            Running Milestones
                        </span>
                        <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-2">
                        <div>
                            <span className="text-3xl font-display font-black text-text-primary">
                                {progressCount}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-bold ml-2">
                                Active Now
                            </span>
                        </div>

                        {/* Miniature vertical bar charts mapping priority distributions */}
                        <div className="flex gap-1.5 items-end h-10 w-20">
                            <div className="w-2 bg-cyan-500/20 rounded-t transition-all duration-300" style={{ height: `${barHeights[0]}px` }} title="Low Priority" />
                            <div className="w-2 bg-cyan-500/35 rounded-t transition-all duration-300" style={{ height: `${barHeights[1]}px` }} title="Medium Priority" />
                            <div className="w-2 bg-cyan-500/50 rounded-t transition-all duration-300" style={{ height: `${barHeights[2]}px` }} title="High Priority" />
                            <div className="w-2 bg-cyan-500/70 rounded-t transition-all duration-300" style={{ height: `${barHeights[3]}px` }} title="To Do Tasks" />
                            <div className="w-2 bg-cyan-500 rounded-t shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-300" style={{ height: `${barHeights[4]}px` }} title="In Progress Tasks" />
                        </div>
                    </div>
                </div>

                {/* Metric Card 3: Completion Rate with Radial Progress */}
                <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                            Task Completion Rate
                        </span>
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-2">
                        <div>
                            <span className="text-3xl font-display font-black text-text-primary">
                                {completionRate}%
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold ml-2">
                                {doneCount} of {totalCount} done
                            </span>
                        </div>

                        {/* Circular Radial Indicator ring */}
                        <div className="relative h-11 w-11 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-white/5"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-emerald-400 drop-shadow-[0_0_6px_#10B981] transition-all duration-500"
                                    strokeWidth="3.5"
                                    strokeDasharray={`${completionRate}, 100`}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute text-[8px] font-bold text-text-primary">{doneCount}D</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Row - Large Line Chart & Recent Activity logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-1">
                
                {/* Large Line Chart Container */}
                <div className="lg:col-span-2 glass-panel border border-white/10 rounded-[28px] p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="font-display font-bold text-sm text-text-primary tracking-wide">
                                Workspace Velocity
                            </h3>
                            <span className="text-[10px] text-text-secondary">Task additions vs completions</span>
                        </div>

                        <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider text-text-secondary select-none">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_#6366F1]" />
                                Added Tasks
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                                Completed
                            </div>
                        </div>
                    </div>

                    {/* Custom SVG Line Chart */}
                    <div className="flex-1 min-h-[220px] relative mt-2">
                        {addedLinePath ? (
                            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="addedLineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                                    </linearGradient>
                                    <linearGradient id="doneLineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Horizontal grid lines */}
                                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                {/* Area below curves */}
                                <path
                                    d={addedAreaPath}
                                    fill="url(#addedLineGrad)"
                                />
                                <path
                                    d={completedAreaPath}
                                    fill="url(#doneLineGrad)"
                                />

                                {/* Added Tasks Curve */}
                                <path
                                    d={addedLinePath}
                                    fill="none"
                                    stroke="#6366F1"
                                    strokeWidth="2.8"
                                    strokeLinecap="round"
                                />

                                {/* Completed Tasks Curve */}
                                <path
                                    d={completedLinePath}
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="2.8"
                                    strokeLinecap="round"
                                />

                                {/* Anchor Point Highlights at the latest month values */}
                                {addedPoints.length > 0 && (
                                    <circle
                                        cx={addedPoints[addedPoints.length - 1].x}
                                        cy={addedPoints[addedPoints.length - 1].y}
                                        r="4.5"
                                        fill="#6366F1"
                                        stroke="#FFFFFF"
                                        strokeWidth="1.5"
                                        className="drop-shadow-[0_0_6px_#6366F1]"
                                    />
                                )}
                                {completedPoints.length > 0 && (
                                    <circle
                                        cx={completedPoints[completedPoints.length - 1].x}
                                        cy={completedPoints[completedPoints.length - 1].y}
                                        r="4.5"
                                        fill="#10B981"
                                        stroke="#FFFFFF"
                                        strokeWidth="1.5"
                                        className="drop-shadow-[0_0_6px_#10B981]"
                                    />
                                )}
                            </svg>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-text-secondary">No chart data found</div>
                        )}

                        {/* Chart Months Axis Grid labels */}
                        <div className="flex justify-between text-[9px] font-bold text-text-secondary select-none px-1 pt-2">
                            {monthsLabels.map((month, idx) => (
                                <span key={idx}>{month}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Metric Card 4: Recent Tasks Logs */}
                <div className="glass-panel border border-white/10 rounded-[28px] p-5 flex flex-col gap-4 shadow-xl">
                    <div className="flex flex-col pb-1">
                        <h3 className="font-display font-bold text-sm text-text-primary tracking-wide">
                            Worklog Feed
                        </h3>
                        <span className="text-[10px] text-text-secondary">Recent additions and completions</span>
                    </div>

                    <div className="flex flex-col gap-3.5 overflow-y-auto pr-0.5 flex-1 max-h-[220px] scrollbar-none">
                        {recentTasks.length > 0 ? (
                            recentTasks.map((t) => {
                                const priorityColors = {
                                    low: "bg-slate-400 text-slate-950",
                                    medium: "bg-amber-400 text-amber-950",
                                    high: "bg-rose-500 text-white shadow-[0_0_6px_rgba(244,63,94,0.3)]",
                                };

                                return (
                                    <div key={t.id} className="flex gap-3 px-3 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner items-start">
                                        <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center text-[10px] font-bold text-accent">
                                            {t.title.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 flex flex-col overflow-hidden gap-0.5">
                                            <span className="text-xs font-bold text-text-primary truncate">
                                                {t.title}
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                                    priorityColors[t.priority]
                                                }`}>
                                                    {t.priority}
                                                </span>
                                                <span className="text-[9px] text-text-secondary">
                                                    {t.status === "done" ? "Completed" : t.status === "in_progress" ? "In Progress" : "To Do"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-secondary/40 select-none">
                                <BarChart3 className="h-8 w-8 mb-2" />
                                <span className="text-xs font-bold">No tasks logged</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
