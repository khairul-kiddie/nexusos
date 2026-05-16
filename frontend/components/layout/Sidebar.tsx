"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Cpu, Share2, ShieldCheck, Activity, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", shortLabel: "Dash" },
  { href: "/orchestrate", icon: Cpu, label: "Orchestrate", shortLabel: "AI" },
  { href: "/graph", icon: Share2, label: "Ecosystem Graph", shortLabel: "Graph" },
  { href: "/governance", icon: ShieldCheck, label: "Governance", shortLabel: "Gov" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col glass border-r border-white/[0.06] shrink-0 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center glow-cyan">
              <Zap className="w-5 h-5 text-accent-cyan" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-xl bg-accent-cyan/10"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white">NexusOS</div>
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">AI Ecosystem</div>
          </div>
        </Link>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green/5 border border-accent-green/20">
          <motion.div
            className="w-2 h-2 rounded-full bg-accent-green"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-accent-green font-medium">6 Agents Active</span>
          <span className="ml-auto text-xs text-slate-500">v1.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 mb-2">
          <span className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase">Navigation</span>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan glow-cyan"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                )}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-accent-cyan")} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-cyan"
                    layoutId="nav-indicator"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Ecosystem Stats */}
      <div className="p-4 border-t border-white/[0.06] space-y-3">
        <div className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase px-1 mb-1">Live Metrics</div>
        {[
          { label: "Startups", value: "247", color: "text-accent-cyan" },
          { label: "Mentors", value: "89", color: "text-accent-purple" },
          { label: "Programmes", value: "34", color: "text-accent-amber" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-500">{stat.label}</span>
            <span className={cn("text-xs font-mono font-semibold", stat.color)}>{stat.value}</span>
          </div>
        ))}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Ecosystem Health</span>
            <span className="text-xs font-mono text-accent-amber">72.4%</span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-amber to-accent-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "72.4%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Activity Indicator */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs text-slate-600">89 connections formed today</span>
        </div>
      </div>
    </aside>
  );
}
