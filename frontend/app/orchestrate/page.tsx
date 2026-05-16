"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RotateCcw, Clock, CheckCircle2, Cpu, AlertCircle } from "lucide-react";
import { AgentCard } from "@/components/orchestration/AgentCard";
import { ActivityFeed } from "@/components/orchestration/ActivityFeed";
import { ReasoningPanel } from "@/components/orchestration/ReasoningPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { DEMO_QUERY } from "@/lib/mock-data";
import { formatMs } from "@/lib/utils";
import type { OrchestrationResult, AgentOutput, AgentStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGENTS = [
  "Relationship Memory Agent",
  "Startup Intelligence Agent",
  "Governance Agent",
  "Mentor Intelligence Agent",
  "Programme Intelligence Agent",
] as const;

type AgentName = (typeof AGENTS)[number] | "Master Orchestrator";

const PHASES: { label: string; delay: number; agent?: AgentName; feedType: string; feedMessage: string; feedIcon: string }[] = [
  { label: "Initializing",                  delay: 300,  feedType: "insight",    feedMessage: "Initialising NexusOS multi-agent pipeline...",                       feedIcon: "⚡" },
  { label: "Retrieving Ecosystem Memory",   delay: 500,  agent: "Relationship Memory Agent",   feedType: "memory",    feedMessage: "Querying 24 months of ecosystem relationship memory...",              feedIcon: "💾" },
  { label: "Analyzing Startup Profile",     delay: 800,  agent: "Startup Intelligence Agent",  feedType: "insight",   feedMessage: "Analysing startup profile and target market readiness...",            feedIcon: "🧠" },
  { label: "Assessing Governance Health",   delay: 600,  agent: "Governance Agent",            feedType: "alert",     feedMessage: "Running governance health and risk assessment...",                    feedIcon: "🛡️" },
  { label: "Matching Mentors",              delay: 700,  agent: "Mentor Intelligence Agent",   feedType: "match",     feedMessage: "Computing mentor compatibility with trust-weighted scoring...",       feedIcon: "🔗" },
  { label: "Discovering Programmes",        delay: 600,  agent: "Programme Intelligence Agent",feedType: "grant",     feedMessage: "Scanning programme eligibility and funding matrix...",                feedIcon: "💰" },
  { label: "Synthesizing Master Report",    delay: 500,  feedType: "graph",     feedMessage: "Synthesising master intelligence report across all agent outputs...",  feedIcon: "✨" },
];

type AgentState = { status: AgentStatus; output?: AgentOutput };

// ---------------------------------------------------------------------------
// Helpers — extract real values from agent outputs
// ---------------------------------------------------------------------------

function buildSummaryCards(result: OrchestrationResult) {
  const byName = Object.fromEntries(result.agent_outputs.map(o => [o.agent_name, o.output]));

  const sa = byName["Startup Intelligence Agent"] ?? {};
  const ma = byName["Mentor Intelligence Agent"] ?? {};
  const pa = byName["Programme Intelligence Agent"] ?? {};
  const ga = byName["Governance Agent"] ?? {};

  const mentors = Array.isArray(ma.ranked_mentors) ? (ma.ranked_mentors as Record<string, unknown>[]) : [];
  const avgCompat = mentors.length > 0
    ? (mentors.reduce((s, m) => s + (typeof m.compatibility_score === "number" ? m.compatibility_score : 0), 0) / mentors.length * 100).toFixed(0)
    : null;

  const fundingRaw = typeof pa.total_available_funding === "number" ? pa.total_available_funding : null;
  const programmes = Array.isArray(pa.recommended_programmes) ? pa.recommended_programmes as unknown[] : [];
  const alerts = Array.isArray(ga.governance_alerts) ? ga.governance_alerts as unknown[] : [];

  const readinessScore = typeof sa.readiness_score === "number" ? sa.readiness_score : null;
  const industrySub = [sa.industry_classification, sa.maturity_level]
    .filter(v => typeof v === "string")
    .join(" · ") || "Analysis complete";

  return [
    {
      label: "Startup Readiness",
      value: readinessScore != null ? `${readinessScore.toFixed(1)} / 100` : "—",
      color: "text-accent-cyan",
      sub: industrySub,
    },
    {
      label: "Mentor Matches",
      value: mentors.length > 0 ? `${mentors.length} matched` : "—",
      color: "text-accent-purple",
      sub: avgCompat ? `Avg ${avgCompat}% compatibility` : "Matching complete",
    },
    {
      label: "Funding Available",
      value: fundingRaw != null
        ? `MYR ${(fundingRaw / 1_000_000).toFixed(2)}M`
        : programmes.length > 0 ? `${programmes.length} programmes` : "—",
      color: "text-accent-amber",
      sub: programmes.length > 0 ? `${programmes.length} programmes identified` : "Programmes scanned",
    },
    {
      label: "Ecosystem Health",
      value: `${result.ecosystem_health_score.toFixed(1)}%`,
      color: "text-accent-green",
      sub: alerts.length > 0 ? `${alerts.length} governance alerts` : "Health monitored",
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OrchestratePage() {
  const [query, setQuery] = useState(DEMO_QUERY);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(
    Object.fromEntries(AGENTS.map(a => [a, { status: "pending" as AgentStatus }])),
  );
  const [phase, setPhase] = useState(0);
  const [feedItems, setFeedItems] = useState<{ id: number; type: string; message: string; time: string; icon: string }[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const feedIdRef = useRef(0);

  const addFeedItem = useCallback((type: string, message: string, icon: string) => {
    setFeedItems(prev => [...prev, { id: ++feedIdRef.current, type, message, time: "just now", icon }]);
  }, []);

  const resetState = () => {
    setResult(null);
    setError(null);
    setPhase(0);
    setFeedItems([]);
    setElapsedMs(0);
    feedIdRef.current = 0;
    setAgentStates(Object.fromEntries(AGENTS.map(a => [a, { status: "pending" as AgentStatus }])));
  };

  const runOrchestration = async () => {
    if (!query.trim()) return;
    resetState();
    setIsRunning(true);
    const startTime = Date.now();
    const timer = setInterval(() => setElapsedMs(Date.now() - startTime), 100);

    // Start the real API call immediately — runs in parallel with the animation
    const apiPromise = api.orchestrate({ query });

    try {
      // Cosmetic animation — sets running states only, no hardcoded output data
      for (let i = 0; i < PHASES.length; i++) {
        const p = PHASES[i];
        setPhase(i);
        addFeedItem(p.feedType, p.feedMessage, p.feedIcon);
        if (p.agent) {
          setAgentStates(s => ({ ...s, [p.agent!]: { status: "running" } }));
        }
        await new Promise(r => setTimeout(r, p.delay));
      }

      // Wait for the real API response (may have already resolved during animation)
      const apiResult = await apiPromise;

      // Map real agent outputs by name
      const outputMap = Object.fromEntries(apiResult.agent_outputs.map(o => [o.agent_name, o]));

      setAgentStates(
        Object.fromEntries(
          AGENTS.map(name => [
            name,
            outputMap[name]
              ? { status: "completed" as AgentStatus, output: outputMap[name] }
              : { status: "completed" as AgentStatus },
          ]),
        ),
      );

      const execMs = apiResult.total_execution_time_ms;
      addFeedItem("graph", `Orchestration complete — ${apiResult.agent_outputs.length} agents · ${formatMs(execMs)}`, "✅");

      setResult(apiResult);
      setPhase(PHASES.length);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Orchestration failed.";
      setError(`${msg} Check that the backend is running and GEMINI_API_KEY is set.`);
      setAgentStates(prev =>
        Object.fromEntries(Object.keys(prev).map(name => [name, { status: "failed" as AgentStatus }])),
      );
      addFeedItem("alert", "Orchestration failed — see error message above.", "⚠️");
    } finally {
      clearInterval(timer);
      setIsRunning(false);
    }
  };

  const completedCount = Object.values(agentStates).filter(s => s.status === "completed").length;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-accent-cyan" />
            <h1 className="text-xl font-bold text-white">Orchestration Command Center</h1>
            <Badge variant="cyan" dot>Multi-Agent AI</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Coordinate 6 AI agents to analyze, match, and synthesize ecosystem intelligence in real-time.
          </p>
        </div>
        {result && (
          <div className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-accent-green/20">
            <CheckCircle2 className="w-4 h-4 text-accent-green" />
            <span className="text-xs font-medium text-accent-green">Orchestration Complete</span>
            <span className="text-xs text-slate-500 font-mono ml-2">{formatMs(result.total_execution_time_ms)}</span>
          </div>
        )}
      </div>

      {/* Query Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/[0.06] p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
              Orchestration Query
            </label>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-slate-200 text-sm resize-none outline-none placeholder-slate-600 leading-relaxed"
              placeholder="Describe the ecosystem intelligence you need..."
              disabled={isRunning}
            />
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant="primary"
              onClick={runOrchestration}
              loading={isRunning}
              icon={<Zap className="w-4 h-4" />}
              disabled={!query.trim()}
            >
              {isRunning ? "Orchestrating..." : "Run"}
            </Button>
            {(result || error) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetState}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Phase indicator */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-accent-cyan"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-xs text-accent-cyan font-medium">
                {PHASES[phase]?.label ?? "Processing with AI..."}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-600" />
                <span className="text-xs text-slate-500 font-mono">{formatMs(elapsedMs)}</span>
              </div>
              <span className="text-xs text-slate-500">{completedCount}/{AGENTS.length} agents</span>
            </div>
          </motion.div>
        )}

        {/* Progress bar */}
        {isRunning && (
          <div className="mt-2 h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full"
              animate={{ width: `${(completedCount / AGENTS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </motion.div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 glass rounded-xl border border-red-500/30 bg-red-500/5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Grid + Activity Feed */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {AGENTS.map((agentName, i) => (
            <AgentCard
              key={agentName}
              agentName={agentName}
              status={agentStates[agentName]?.status || "pending"}
              output={agentStates[agentName]?.output}
              index={i}
            />
          ))}
          {/* Master Orchestrator Card */}
          <AgentCard
            agentName="Master Orchestrator"
            status={result ? "completed" : isRunning && phase >= PHASES.length - 1 ? "running" : "pending"}
            index={5}
          />
        </div>

        <ActivityFeed items={feedItems} isLive={isRunning} />
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Cards — all values derived from real agent outputs */}
            <div className="grid grid-cols-4 gap-3">
              {buildSummaryCards(result).map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-4 border border-white/[0.06]"
                >
                  <div className="text-xs text-slate-500 mb-1">{card.label}</div>
                  <div className={`text-lg font-bold font-mono ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{card.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Reasoning Panel */}
            <ReasoningPanel
              reasoning={result.master_reasoning}
              executionTime={result.total_execution_time_ms}
              confidenceScore={result.ecosystem_health_score}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
