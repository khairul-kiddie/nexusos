"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS = {
  primary: "bg-accent-cyan text-bg-primary font-semibold hover:bg-accent-cyan/90 shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)]",
  secondary: "glass border border-white/10 text-slate-200 hover:border-accent-cyan/30 hover:text-accent-cyan",
  ghost: "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]",
  danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

export function Button({
  variant = "secondary", size = "md", loading, icon, children, className, disabled, ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200",
        VARIANTS[variant], SIZES[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
