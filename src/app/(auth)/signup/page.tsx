"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, ArrowRight, UserPlus } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "@/components/ui/toast";

const signupSchema = z
    .object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters" })
            .max(60, { message: "Name must be under 60 characters" }),
        email: z.string().email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" }),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignupFormValues = z.infer<typeof signupSchema>;

/* ─── Drifting background blobs (same as login) ─── */
const blobVariants: Variants = {
    animate1: {
        x: [0, 90, -50, 0],
        y: [0, -100, 60, 0],
        transition: { duration: 25, repeat: Infinity, ease: "easeInOut" },
    },
    animate2: {
        x: [0, -80, 70, 0],
        y: [0, 90, -70, 0],
        transition: { duration: 22, repeat: Infinity, ease: "easeInOut" },
    },
    animate3: {
        x: [0, 60, -60, 0],
        y: [0, 80, -80, 0],
        transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
    },
};

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const handleSignup = async (data: SignupFormValues) => {
        setIsLoading(true);
        try {
            await authClient.signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
                callbackURL: "/tasks",
            });
            toast.success("Account created! Welcome to Kanvas 🎉");
            router.push("/tasks");
        } catch (error: any) {
            toast.error(error.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
            {/* Drifting blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    variants={blobVariants}
                    animate="animate1"
                    className="absolute top-[10%] left-[8%] w-[380px] h-[380px] rounded-full bg-accent/15 blur-[120px]"
                />
                <motion.div
                    variants={blobVariants}
                    animate="animate2"
                    className="absolute bottom-[10%] right-[8%] w-[320px] h-[320px] rounded-full bg-cyan-500/15 blur-[110px]"
                />
                <motion.div
                    variants={blobVariants}
                    animate="animate3"
                    className="absolute top-[45%] left-[40%] w-[260px] h-[260px] rounded-full bg-rose-500/10 blur-[100px]"
                />
            </div>

            <ToastContainer />

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md flex flex-col gap-6 z-10"
            >
                {/* Brand header */}
                <div className="flex flex-col items-center gap-2">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-accent via-purple-500 to-pink-500 text-white shadow-lg shadow-accent/25 cursor-pointer glow-violet"
                    >
                        <Sparkles className="h-6 w-6" />
                    </motion.div>
                    <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight mt-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-text-primary to-text-secondary">
                        Create your account
                    </h1>
                    <p className="text-xs text-text-secondary text-center max-w-[300px] leading-relaxed">
                        Join Kanvas — plan your tasks and annotate images in one workspace.
                    </p>
                </div>

                {/* Signup form card */}
                <div className="glass-panel rounded-2xl p-8 flex flex-col gap-5 relative overflow-hidden">
                    {/* Glowing top stripe */}
                    <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-accent via-purple-500 to-pink-500 shadow-[0_1px_10px_rgba(139,92,246,0.3)]" />

                    <form onSubmit={handleSubmit(handleSignup)} className="flex flex-col gap-4">
                        {/* Full Name */}
                        <Input
                            {...register("name")}
                            label="Full Name"
                            type="text"
                            placeholder="Jane Smith"
                            error={errors.name?.message}
                            autoComplete="name"
                            className="bg-bg-primary/50 border-border/80 focus:border-accent focus:ring-1 focus:ring-accent/30 rounded-lg text-sm"
                        />

                        {/* Email */}
                        <Input
                            {...register("email")}
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            autoComplete="email"
                            className="bg-bg-primary/50 border-border/80 focus:border-accent focus:ring-1 focus:ring-accent/30 rounded-lg text-sm"
                        />

                        {/* Password */}
                        <Input
                            {...register("password")}
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            autoComplete="new-password"
                            className="bg-bg-primary/50 border-border/80 focus:border-accent focus:ring-1 focus:ring-accent/30 rounded-lg text-sm"
                        />

                        {/* Confirm password */}
                        <Input
                            {...register("confirmPassword")}
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            autoComplete="new-password"
                            className="bg-bg-primary/50 border-border/80 focus:border-accent focus:ring-1 focus:ring-accent/30 rounded-lg text-sm"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500 hover:opacity-95 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-accent/15 cursor-pointer flex items-center justify-center gap-2"
                            isLoading={isLoading}
                        >
                            Create Account
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center select-none">
                        <div className="flex-1 border-t border-border/50" />
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest px-3 font-semibold">
                            Already have an account?
                        </span>
                        <div className="flex-1 border-t border-border/50" />
                    </div>

                    {/* Link to login */}
                    <Link
                        href="/login"
                        className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 text-text-primary rounded-lg text-xs font-semibold transition-all shadow-inner cursor-pointer flex items-center justify-center gap-2"
                    >
                        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                        Sign in instead
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
