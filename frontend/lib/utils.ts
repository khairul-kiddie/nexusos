import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NodeType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NODE_COLORS: Record<NodeType, { bg: string; border: string; glow: string; text: string }> = {
  startup: {
    bg: "rgba(0,217,255,0.1)",
    border: "rgba(0,217,255,0.6)",
    glow: "rgba(0,217,255,0.4)",
    text: "#00D9FF",
  },
  mentor: {
    bg: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.6)",
    glow: "rgba(124,58,237,0.4)",
    text: "#7C3AED",
  },
  investor: {
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.6)",
    glow: "rgba(16,185,129,0.4)",
    text: "#10B981",
  },
  programme: {
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.6)",
    glow: "rgba(245,158,11,0.4)",
    text: "#F59E0B",
  },
  agency: {
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.6)",
    glow: "rgba(236,72,153,0.4)",
    text: "#EC4899",
  },
  university: {
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.6)",
    glow: "rgba(99,102,241,0.4)",
    text: "#6366F1",
  },
};

export const AGENT_ICONS: Record<string, string> = {
  "Startup Intelligence Agent": "🚀",
  "Mentor Intelligence Agent": "🧠",
  "Programme Intelligence Agent": "🎯",
  "Relationship Memory Agent": "💾",
  "Governance Agent": "⚖️",
  "Master Orchestrator": "🌐",
};

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatCurrency(amount: number, currency = "MYR"): string {
  if (amount >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${currency} ${(amount / 1_000).toFixed(0)}K`;
  return `${currency} ${amount}`;
}

export function scoreToColor(score: number): string {
  if (score >= 0.85) return "#10B981";
  if (score >= 0.65) return "#F59E0B";
  return "#EF4444";
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "high": return "#EF4444";
    case "medium": return "#F59E0B";
    case "low": return "#10B981";
    default: return "#64748B";
  }
}
