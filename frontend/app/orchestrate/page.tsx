"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send, RotateCcw, Clock, CheckCircle2, Cpu } from "lucide-react";
import { AgentCard } from "@/components/orchestration/AgentCard";
import { ActivityFeed } from "@/components/orchestration/ActivityFeed";
import { ReasoningPanel } from "@/components/orchestration/ReasoningPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { DEMO_RESULT, DEMO_QUERY, ACTIVITY_FEED } from "@/lib/mock-data";
import { formatMs } from "@/lib/utils";
import type { OrchestrationResult, AgentStatus } from "@/lib/types";

const AGENTS = [
  "Relationship Memory Agent",
  "Startup Intelligence Agent",
  "Governance Agent",
  "Mentor Intelligence Agent",
  "Programme Intelligence Agent",
];

type AgentState = { status: AgentStatus; output?: OrchestrationResult["agent_outputs"][0] };

const ORCHESTRATION_PHASES = [
  { label: "Initializing", duration: 400 },
  { label: "Retrieving Ecosystem Memory", duration: 600 },
  { label: "Analyzing Startup Profile", duration: 900 },
  { label: "Assessing Governance Health", duration: 700 },
  { label: "Matching Mentors", duration: 800 },
  { label: "Discovering Programmes", duration: 700 },
  { label: "Synthesizing Master Report", duration: 600 },
  { label: "Complete", duration: 0 },
];

export default function OrchestratePage() {
  const [query, setQuery] = useState(DEMO_QUERY);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(
    Object.fromEntries(AGENTS.map((a) => [a, { status: "pending" as AgentStatus }]))
  );
  const [phase, setPhase] = useState(0);
  const [feedItems, setFeedItems] = useState(ACTIVITY_FEED.slice(0, 2));
  const [elapsedMs, setElapsedMs] = useState(0);

  const resetState = () => {
    setResult(null);
    setPhase(0);
    setFeedItems(ACTIVITY_FEED.slice(0, 2));
    setElapsedMs(0);
    setAgentStates(Object.fromEntries(AGENTS.map((a) => [a, { status: "pending" as AgentStatus }])));
  };

  const runOrchestration = async () => {
    resetState();
    setIsRunning(true);
    const startTime = Date.now();

    const timer = setInterval(() => setElapsedMs(Date.now() - startTime), 100);

    try {
      // Animate phases
      for (let i = 0; i < ORCHESTRATION_PHASES.length - 1; i++) {
        setPhase(i);

        // Update agent states based on phase
        if (i === 1) {
          setAgentStates((s) => ({ ...s, "Relationship Memory Agent": { status: "running" } }));
        } else if (i === 2) {
          setAgentStates((s) => ({
            ...s,
            "Relationship Memory Agent": { status: "completed", output: DEMO_RESULT.agent_outputs[0] },
            "Startup Intelligence Agent": { status: "running" },
          }));
          setFeedItems((f) => [...f, ACTIVITY_FEED[2]]);
        } else if (i === 3) {
          setAgentStates((s) => ({
            ...s,
            "Startup Intelligence Agent": { status: "completed", output: DEMO_RESULT.agent_outputs[1] },
            "Governance Agent": { status: "running" },
          }));
          setFeedItems((f) => [...f, ACTIVITY_FEED[3]]);
        } else if (i === 4) {
          setAgentStates((s) => ({
            ...s,
            "Governance Agent": { status: "completed", output: DEMO_RESULT.agent_outputs[2] },
            "Mentor Intelligence Agent": { status: "running" },
          }));
          setFeedItems((f) => [...f, ACTIVITY_FEED[4]]);
        } else if (i === 5) {
          setAgentStates((s) => ({
            ...s,
            "Mentor Intelligence Agent": { status: "completed", output: DEMO_RESULT.agent_outputs[3] },
            "Programme Intelligence Agent": { status: "running" },
          }));
          setFeedItems((f) => [...f, ACTIVITY_FEED[5]]);
        } else if (i === 6) {
          setAgentStates((s) => ({
            ...s,
            "Programme Intelligence Agent": { status: "completed", output: DEMO_RESULT.agent_outputs[4] },
          }));
          setFeedItems((f) => [...f, ACTIVITY_FEED[6], ACTIVITY_FEED[7]]);
        }

        await new Promise((r) => setTimeout(r, ORCHESTRATION_PHASES[i].duration));
      }

      // Try real API first, fall back to demo
      let apiResult: OrchestrationResult;
      try {
        apiResult = await api.orchestrate({ query });
      } catch {
        apiResult = { ...DEMO_RESULT, query };
      }

      setResult(apiResult);
      setPhase(ORCHESTRATION_PHASES.length - 1);
    } finally {
      clearInterval(timer);
      setIsRunning(false);
    }
  };

  const completedCount = Object.values(agentStates).filter((s) => s.status === "completed").length;

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
              onChange={(e) => setQuery(e.target.value)}
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
            >
              {isRunning ? "Orchestrating..." : "Run"}
            </Button>
            {result && (
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
              <span className="text-xs text-accent-cyan font-medium">{ORCHESTRATION_PHASES[phase]?.label}</span>
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
            status={result ? "completed" : isRunning && phase >= 6 ? "running" : "pending"}
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
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Startup Readiness", value: "78.5 / 100", color: "text-accent-cyan", sub: "AI Healthcare · Seed Stage" },
                { label: "Mentor Matches", value: "3 matched", color: "text-accent-purple", sub: "Avg 91.7% compatibility" },
                { label: "Funding Available", value: "MYR 1.15M", color: "text-accent-amber", sub: "4 programmes · non-dilutive" },
                { label: "Ecosystem Health", value: `${result.ecosystem_health_score}%`, color: "text-accent-green", sub: "4 governance alerts" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-4 border border-white/[0.06]"
                >
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{item.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Reasoning Panel */}
            <ReasoningPanel
              reasoning={result.master_reasoning}
              executionTime={result.total_execution_time_ms}
              confidenceScore={87.3}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
