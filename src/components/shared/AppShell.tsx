"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Kanban, Image as ImageIcon, LogOut, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const navItems = [
        {
            name: "Kanban Board",
            path: "/tasks",
            icon: <Kanban className="h-4.5 w-4.5" />,
        },
        {
            name: "Image Annotations",
            path: "/annotate",
            icon: <ImageIcon className="h-4.5 w-4.5" />,
        },
    ];

    const handleLogout = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Logged out successfully");
                        router.push("/login");
                    },
                },
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to log out");
        }
    };

    // Extract initials for the avatar placeholder
    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : "DU";

    return (
        <div className="flex h-screen w-screen bg-bg-primary overflow-hidden relative items-center justify-center p-4 sm:p-6 md:p-8 z-10 select-none">
            {/* Ambient Background Gradient Lights (Reference 2 matching) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-black">
                {/* Cyan-blue glow behind the left-mid region of the screen */}
                <div 
                    className="absolute -left-[200px] top-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/40 via-cyan-500/15 to-transparent blur-[130px] opacity-90 animate-pulse" 
                    style={{ animationDuration: "10s" }} 
                />
                
                {/* Soft purple-violet glow in the top-left area */}
                <div className="absolute -left-[50px] -top-[50px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-600/25 via-pink-500/5 to-transparent blur-[110px] opacity-80" />
                
                {/* Indigo ambient light in the top-right corner */}
                <div className="absolute -right-[100px] -top-[100px] w-[500px] h-[500px] rounded-full bg-indigo-950/15 blur-[120px] opacity-60" />
            </div>

            {/* Rounded Application Shell card (Reference 2 matching container outline) */}
            <div className="w-full h-full glass-panel border border-white/10 rounded-[28px] sm:rounded-[32px] overflow-hidden flex shadow-[0_24px_80px_rgba(0,0,0,0.7)] relative z-10">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-black/45 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-10 relative">
                    {/* Brand Logo & Header */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/5">
                            <motion.div 
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-r from-accent via-purple-500 to-pink-500 text-white shadow-md shadow-accent/25"
                            >
                                <Sparkles className="h-4.5 w-4.5" />
                            </motion.div>
                            <span className="font-display font-extrabold text-lg tracking-tight text-text-primary bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
                                Kanvas
                            </span>
                        </div>

                        {/* Nav Links */}
                        <nav className="flex flex-col gap-2 px-4 py-6">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative z-10 ${
                                            isActive
                                                ? "text-text-primary"
                                                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.02]"
                                        }`}
                                    >
                                        {/* Bounding Box Corner resize handles for Kanvas concept */}
                                        {isActive && (
                                            <>
                                                <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rounded-sm border border-accent bg-bg-primary shadow-[0_0_4px_#6366F1] z-20" />
                                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-sm border border-accent bg-bg-primary shadow-[0_0_4px_#6366F1] z-20" />
                                                <span className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 rounded-sm border border-accent bg-bg-primary shadow-[0_0_4px_#6366F1] z-20" />
                                                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-sm border border-accent bg-bg-primary shadow-[0_0_4px_#6366F1] z-20" />
                                                <motion.div
                                                    layoutId="sidebarActiveIndicator"
                                                    className="absolute inset-0 bg-white/[0.04] border border-accent/30 rounded-xl -z-10 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                                />
                                            </>
                                        )}
                                        <div className={`${isActive ? "text-accent drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "text-text-secondary"}`}>
                                            {item.icon}
                                        </div>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User HUD Profile info */}
                    <div className="p-4 border-t border-white/5 flex flex-col gap-3">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 shadow-inner">
                            {/* Avatar */}
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt="User Avatar"
                                    className="h-9 w-9 rounded-full object-cover border border-white/10"
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-xs font-bold text-accent shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                    {initials}
                                </div>
                            )}
                            
                            {/* Details */}
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-bold text-text-primary truncate">
                                    {user?.name || "Demo User"}
                                </span>
                                <span className="text-[10px] text-text-secondary truncate">
                                    {user?.email || "demo@example.com"}
                                </span>
                            </div>
                        </div>

                        {/* Log Out Trigger */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-priority-high hover:bg-red-950/20 border border-transparent transition-all duration-150 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Pane */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-bg-primary/20 backdrop-blur-md">
                    {children}
                </main>
            </div>
        </div>
    );
};
