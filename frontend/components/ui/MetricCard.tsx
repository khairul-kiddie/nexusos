"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description?: string;
  color?: "cyan" | "purple" | "green" | "amber" | "pink";
  icon?: React.ReactNode;
  delay?: number;
  trend?: string;
}

const COLOR_MAP = {
  cyan: { text: "text-accent-cyan", border: "border-accent-cyan/20", bg: "bg-accent-cyan/5", glow: "shadow-[0_0_20px_rgba(0,217,255,0.1)]" },
  purple: { text: "text-accent-purple", border: "border-accent-purple/20", bg: "bg-accent-purple/5", glow: "shadow-[0_0_20px_rgba(124,58,237,0.1)]" },
  green: { text: "text-accent-green", border: "border-accent-green/20", bg: "bg-accent-green/5", glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]" },
  amber: { text: "text-accent-amber", border: "border-accent-amber/20", bg: "bg-accent-amber/5", glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]" },
  pink: { text: "text-accent-pink", border: "border-accent-pink/20", bg: "bg-accent-pink/5", glow: "shadow-[0_0_20px_rgba(236,72,153,0.1)]" },
};

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);

  return (
    <span>
      {prefix}
      <motion.span ref={ref}>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function MetricCard({
  label, value, suffix = "", prefix = "", description, color = "cyan", icon, delay = 0, trend,
}: MetricCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "glass rounded-2xl p-5 border group hover:border-opacity-40 transition-all duration-300 relative overflow-hidden",
        colors.border, colors.glow
      )}
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", colors.bg)} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
          {icon && <div className={cn("opacity-60", colors.text)}>{icon}</div>}
        </div>

        <div className={cn("text-3xl font-bold font-mono mb-1", colors.text)}>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        </div>

        {trend && (
          <div className="text-xs text-accent-green font-medium mb-1">{trend}</div>
        )}

        {description && (
          <div className="text-xs text-slate-600">{description}</div>
        )}
      </div>
    </motion.div>
  );
}
