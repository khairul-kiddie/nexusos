"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState } from "react";
import { Share2, Filter, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { NODE_COLORS } from "@/lib/utils";
import { DEMO_RESULT } from "@/lib/mock-data";
import type { NodeType } from "@/lib/types";

const EcosystemGraph = dynamic(
  () => import("@/components/graph/EcosystemGraph"),
  { ssr: false, loading: () => <GraphSkeleton /> }
);

function GraphSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="text-center space-y-3">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-accent-cyan border-t-transparent mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm text-slate-500">Rendering ecosystem graph...</p>
      </div>
    </div>
  );
}

const NODE_TYPES: { type: NodeType; label: string }[] = [
  { type: "startup", label: "Startups" },
  { type: "mentor", label: "Mentors" },
  { type: "investor", label: "Investors" },
  { type: "programme", label: "Programmes" },
  { type: "agency", label: "Agencies" },
  { type: "university", label: "Universities" },
];

export default function GraphPage() {
  const graphData = DEMO_RESULT.ecosystem_graph!;
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set());

  const toggleFilter = (type: NodeType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredGraph = activeFilters.size === 0 ? graphData : {
    nodes: graphData.nodes.filter((n) => !activeFilters.has(n.type as NodeType)),
    edges: graphData.edges.filter((e) => {
      const sourceNode = graphData.nodes.find((n) => n.id === e.source);
      const targetNode = graphData.nodes.find((n) => n.id === e.target);
      return sourceNode && targetNode &&
        !activeFilters.has(sourceNode.type as NodeType) &&
        !activeFilters.has(targetNode.type as NodeType);
    }),
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] glass shrink-0"
      >
        <div className="flex items-center gap-3">
          <Share2 className="w-5 h-5 text-accent-purple" />
          <div>
            <h1 className="text-base font-bold text-white">Ecosystem Graph</h1>
            <p className="text-xs text-slate-500">
              {filteredGraph.nodes.length} nodes · {filteredGraph.edges.length} edges · Neo4j-ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Legend */}
          <div className="flex items-center gap-3">
            {NODE_TYPES.map(({ type, label }) => {
              const colors = NODE_COLORS[type];
              const isFiltered = activeFilters.has(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      backgroundColor: isFiltered ? "transparent" : colors.border,
                      border: `1.5px solid ${colors.border}`,
                      boxShadow: isFiltered ? "none" : `0 0 6px ${colors.glow}`,
                    }}
                  />
                  <span className={`text-xs ${isFiltered ? "text-slate-600 line-through" : "text-slate-400"}`}>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="purple">HealthAI Demo</Badge>
            <Badge variant="cyan" dot>Live Graph</Badge>
          </div>
        </div>
      </motion.div>

      {/* Graph */}
      <div className="flex-1 relative">
        <EcosystemGraph graphData={filteredGraph} />

        {/* Info Overlay */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 glass rounded-xl border border-white/[0.06] p-4 w-64 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs font-semibold text-slate-200">Graph Intelligence</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Strongest Edge", value: "HealthAI → Dr. Chen", score: "96%", color: "text-accent-purple" },
              { label: "Best Grant Match", value: "MDEC GAIN Grant", score: "95%", color: "text-accent-amber" },
              { label: "Key Bridge Node", value: "Ahmad Fauzi", score: "Kemenkes link", color: "text-accent-green" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-600">{item.label}</div>
                  <div className="text-xs text-slate-300">{item.value}</div>
                </div>
                <span className={`text-xs font-mono font-semibold ${item.color}`}>{item.score}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="text-[10px] text-slate-600 mb-1">Edge Types</div>
            {[
              { type: "MATCHED_WITH", color: "#7C3AED" },
              { type: "ELIGIBLE_FOR", color: "#F59E0B" },
              { type: "SUPPORTED_BY", color: "#EC4899" },
              { type: "CONNECTED_TO", color: "#00D9FF" },
            ].map((e) => (
              <div key={e.type} className="flex items-center gap-2 mb-1">
                <div className="w-4 h-0.5 rounded" style={{ backgroundColor: e.color }} />
                <span className="text-[10px] text-slate-500 font-mono">{e.type}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
