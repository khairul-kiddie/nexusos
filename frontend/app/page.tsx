"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap, Users, BookOpen, TrendingUp, Activity, Globe,
  ArrowRight, Cpu, Share2, ShieldCheck, Network, RefreshCw, Sparkles
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { EcosystemStats, ActivityItem } from "@/types/ecosystem";
import { DEMO_METRICS, ACTIVITY_FEED } from "@/lib/mock-data";

const HERO_WORDS = ["Startups", "Mentors", "Investors", "Agencies", "Universities"];
const REFRESH_INTERVAL_MS = 30_000;

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

function AiBadge({ generatedAt }: { generatedAt: string }) {
  const mins = Math.round((Date.now() - new Date(generatedAt).getTime()) / 60000);
  const label = mins < 1 ? "just now" : `${mins}m ago`;
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-purple/10 border border-accent-purple/20">
      <Sparkles className="w-2.5 h-2.5 text-accent-purple" />
      <span className="text-[10px] text-accent-purple font-medium">AI Generated · {label}</span>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.getEcosystemStats(),
        api.getLiveActivity(),
      ]);
      setStats(statsRes);
      setActivity(activityRes.items ?? []);
      setLastRefresh(new Date());
    } catch {
      // Silently fall back to demo data already in state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const metrics = stats
    ? {
        total_startups: stats.totalStartups,
        active_mentors: stats.activeMentors,
        programmes_available: stats.programmesAvailable,
        connections_formed: stats.connectionsFormed,
        grants_disbursed: stats.grantsDisbursed,
        successful_exits: stats.successfulExits,
      }
    : DEMO_METRICS;

  const feedItems = activity.length > 0
    ? activity.map((a, i) => ({ id: i, type: a.type, message: a.message, time: a.time, icon: a.icon }))
    : ACTIVITY_FEED;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="cyan" dot>AI Operating System</Badge>
            <Badge variant="green" dot>6 Agents Online</Badge>
            <Badge variant="purple">Malaysia Ecosystem</Badge>
            {stats && <AiBadge generatedAt={stats.aiGeneratedAt} />}
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-3">
            Automating Innovation
            <br />
            <span className="text-accent-cyan text-glow-cyan">Ecosystem Intelligence</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            NexusOS orchestrates{" "}
            {HERO_WORDS.map((word, i) => (
              <span key={word}>
                <span className="text-slate-200 font-medium">{word}</span>
                {i < HERO_WORDS.length - 1 ? ", " : ""}
              </span>
            ))}{" "}
            through multi-agent AI — replacing months of manual coordination with seconds of intelligent orchestration.
          </p>
          {stats?.summary && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-sm text-slate-500 max-w-2xl italic"
            >
              {stats.summary}
            </motion.p>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 mt-6">
          <Link href="/orchestrate">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-accent-cyan text-bg-primary font-semibold rounded-xl shadow-[0_0_30px_rgba(0,217,255,0.4)] hover:shadow-[0_0_40px_rgba(0,217,255,0.6)] transition-all"
            >
              <Zap className="w-4 h-4" />
              Launch Orchestration
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <Link href="/graph">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 glass border border-white/10 text-slate-200 font-medium rounded-xl hover:border-accent-purple/30 transition-all"
            >
              <Network className="w-4 h-4" />
              View Ecosystem Graph
            </motion.button>
          </Link>
          {lastRefresh && (
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-xs">Refresh</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      {loading ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(i => <SkeletonBlock key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(i => <SkeletonBlock key={i} className="h-28" />)}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Registered Startups"
              value={metrics.total_startups}
              color="cyan"
              icon={<TrendingUp className="w-4 h-4" />}
              description="AI, HealthTech, FinTech & more"
              trend={stats ? `+${Math.round(metrics.total_startups * (stats.monthlyGrowthRate ?? 0.09))} this month` : "+23 this month"}
              delay={0.1}
            />
            <MetricCard
              label="Active Mentors"
              value={metrics.active_mentors}
              color="purple"
              icon={<Users className="w-4 h-4" />}
              description="Trust-scored, expertise-mapped"
              trend="+5 recruited"
              delay={0.2}
            />
            <MetricCard
              label="Programmes Available"
              value={metrics.programmes_available}
              color="amber"
              icon={<BookOpen className="w-4 h-4" />}
              description="Grants, accelerators & initiatives"
              delay={0.3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Ecosystem Connections"
              value={metrics.connections_formed}
              color="green"
              icon={<Globe className="w-4 h-4" />}
              description="AI-generated relationship edges"
              trend="+89 today"
              delay={0.4}
            />
            <MetricCard
              label="Grants Disbursed"
              value={metrics.grants_disbursed}
              color="pink"
              icon={<Activity className="w-4 h-4" />}
              description={stats ? `Total: MYR ${(stats.totalFundingMYR / 1000000).toFixed(1)}M raised` : "Total value: MYR 18.4M"}
              delay={0.5}
            />
            <MetricCard
              label="Successful Exits"
              value={metrics.successful_exits}
              color="cyan"
              icon={<TrendingUp className="w-4 h-4" />}
              description="Acquisitions & IPOs"
              delay={0.6}
            />
          </div>
        </>
      )}

      {/* Quick Navigation + Activity */}
      <div className="grid grid-cols-3 gap-4">
        {/* Navigation Cards */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[
            {
              href: "/orchestrate",
              icon: Cpu,
              title: "AI Orchestration",
              description: "Run multi-agent analysis. Match startups with mentors, grants, and programmes in real-time.",
              color: "from-accent-cyan/10 to-accent-purple/5",
              borderColor: "border-accent-cyan/20",
              textColor: "text-accent-cyan",
              badge: "Core Feature",
            },
            {
              href: "/graph",
              icon: Share2,
              title: "Ecosystem Graph",
              description: `Visualize the full innovation network. ${metrics.total_startups} nodes, ${metrics.connections_formed} relationship edges, live and interactive.`,
              color: "from-accent-purple/10 to-accent-cyan/5",
              borderColor: "border-accent-purple/20",
              textColor: "text-accent-purple",
              badge: "Neo4j-Ready",
            },
            {
              href: "/governance",
              icon: ShieldCheck,
              title: "Governance Intelligence",
              description: "Monitor ecosystem health, detect mentor overload, surface underserved sectors.",
              color: "from-accent-amber/10 to-accent-green/5",
              borderColor: "border-accent-amber/20",
              textColor: "text-accent-amber",
              badge: "AI Monitored",
            },
            {
              href: "/orchestrate",
              icon: Network,
              title: "Relationship Memory",
              description: "24 months of ecosystem history. Trust-weighted, collaboration-scored, always learning.",
              color: "from-accent-green/10 to-accent-cyan/5",
              borderColor: "border-accent-green/20",
              textColor: "text-accent-green",
              badge: "Key Innovation",
            },
          ].map((card, i) => (
            <Link key={card.href + i} href={card.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className={`glass rounded-2xl p-5 border ${card.borderColor} bg-gradient-to-br ${card.color} cursor-pointer h-full`}
              >
                <div className="flex items-start justify-between mb-3">
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                  <Badge variant={
                    card.textColor.includes("cyan") ? "cyan" :
                    card.textColor.includes("purple") ? "purple" :
                    card.textColor.includes("amber") ? "amber" : "green"
                  }>
                    {card.badge}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
                <div className="flex items-center gap-1 mt-3">
                  <span className={`text-xs font-medium ${card.textColor}`}>Explore</span>
                  <ArrowRight className={`w-3 h-3 ${card.textColor}`} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm font-semibold text-slate-200">Live Activity</span>
            <motion.div
              className="flex items-center gap-1.5"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <span className="text-xs text-accent-green font-medium">LIVE</span>
            </motion.div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2 px-2 py-2">
                  <SkeletonBlock className="w-5 h-5 shrink-0 rounded" />
                  <SkeletonBlock className="flex-1 h-8" />
                </div>
              ))
            ) : (
              feedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-600 font-mono">{item.time}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Demo Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative overflow-hidden rounded-2xl border border-accent-cyan/20 bg-gradient-to-r from-accent-cyan/5 via-accent-purple/5 to-accent-cyan/5 p-6"
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="cyan" dot>Demo Scenario</Badge>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              "Find ecosystem support for an AI healthcare startup expanding into Indonesia."
            </h3>
            <p className="text-sm text-slate-500">
              6 agents · 3.8s execution · MYR 1.15M funding identified · 3 mentor matches · 4 governance insights
            </p>
          </div>
          <Link href="/orchestrate">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-bg-primary font-semibold rounded-xl shadow-[0_0_20px_rgba(0,217,255,0.3)] whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              Run Demo
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
