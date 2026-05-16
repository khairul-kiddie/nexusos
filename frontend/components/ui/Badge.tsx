import { cn } from "@/lib/utils";

type BadgeVariant = "cyan" | "purple" | "green" | "amber" | "pink" | "red" | "slate";

const VARIANTS: Record<BadgeVariant, string> = {
  cyan: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
  purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
  green: "bg-accent-green/10 text-accent-green border-accent-green/20",
  amber: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
  pink: "bg-accent-pink/10 text-accent-pink border-accent-pink/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = "slate", className, dot }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
      VARIANTS[variant], className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-accent-cyan": variant === "cyan",
        "bg-accent-green": variant === "green",
        "bg-accent-amber": variant === "amber",
        "bg-accent-purple": variant === "purple",
        "bg-red-400": variant === "red",
      })} />}
      {children}
    </span>
  );
}
