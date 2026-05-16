"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import type { EcosystemGraph as EcosystemGraphType, NodeType } from "@/lib/types";
import { NODE_COLORS } from "@/lib/utils";

const NODE_LABELS: Record<NodeType, string> = {
  startup: "Startup",
  mentor: "Mentor",
  investor: "Investor",
  programme: "Programme",
  agency: "Agency",
  university: "University",
};

const NODE_EMOJIS: Record<NodeType, string> = {
  startup: "🚀",
  mentor: "🧠",
  investor: "💎",
  programme: "🎯",
  agency: "🏛️",
  university: "🎓",
};

function EcosystemNode({ data }: { data: { label: string; type: NodeType; weight?: number } }) {
  const colors = NODE_COLORS[data.type] || NODE_COLORS.startup;
  const emoji = NODE_EMOJIS[data.type] || "⬡";

  return (
    <div
      style={{
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        boxShadow: `0 0 12px ${colors.glow}, 0 0 30px ${colors.glow}40`,
      }}
      className="rounded-xl px-3 py-2 min-w-[120px] max-w-[180px] cursor-pointer hover:scale-105 transition-transform"
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.border, width: 8, height: 8, border: "none" }} />
      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: colors.text }}>
            {NODE_LABELS[data.type]}
          </div>
          <div className="text-xs font-semibold text-white leading-tight truncate">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: colors.border, width: 8, height: 8, border: "none" }} />
    </div>
  );
}

const EDGE_COLORS: Record<string, string> = {
  MATCHED_WITH: "#7C3AED",
  ELIGIBLE_FOR: "#F59E0B",
  FUNDED_BY: "#10B981",
  CONNECTED_TO: "#00D9FF",
  SUPPORTED_BY: "#EC4899",
  MENTORED_BY: "#7C3AED",
};

function graphDataToFlow(graphData: EcosystemGraphType): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = graphData.nodes.map((n) => ({
    id: n.id,
    type: "ecosystemNode",
    position: n.position || { x: Math.random() * 800, y: Math.random() * 500 },
    data: { label: n.label, type: n.type, ...n.data },
  }));

  const edges: Edge[] = graphData.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "smoothstep",
    animated: e.weight > 0.8,
    style: {
      stroke: EDGE_COLORS[e.type] || "#64748B",
      strokeWidth: Math.max(1, Math.round(e.weight * 2.5)),
      opacity: 0.7,
    },
    labelStyle: {
      fill: "#64748B",
      fontSize: 9,
      fontFamily: "JetBrains Mono, monospace",
    },
    labelBgStyle: {
      fill: "rgba(8,11,20,0.8)",
      stroke: "rgba(255,255,255,0.06)",
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: EDGE_COLORS[e.type] || "#64748B",
      width: 12,
      height: 12,
    },
  }));

  return { nodes, edges };
}

const NODE_TYPES = { ecosystemNode: EcosystemNode };

interface EcosystemGraphProps {
  graphData: EcosystemGraphType;
}

export default function EcosystemGraph({ graphData }: EcosystemGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = graphDataToFlow(graphData);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = graphDataToFlow(graphData);
    setNodes(n);
    setEdges(e);
  }, [graphData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full" style={{ background: "#080B14" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors = NODE_COLORS[(node.data?.type as NodeType) || "startup"];
            return colors?.border || "#64748B";
          }}
          maskColor="rgba(8,11,20,0.85)"
        />
      </ReactFlow>
    </div>
  );
}
