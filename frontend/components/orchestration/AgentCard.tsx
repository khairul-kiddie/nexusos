"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { cn, AGENT_ICONS, formatMs } from "@/lib/utils";
import type { AgentOutput, AgentStatus } from "@/lib/types";

interface AgentCardProps {
  agentName: string;
  status: AgentStatus;
  output?: AgentOutput;
  index?: number;
}

const STATUS_CONFIG: Record<AgentStatus, { color: string; borderColor: string; label: string; bgColor: string }> = {
  pending: { color: "text-slate-500", borderColor: "border-slate-700", label: "Waiting", bgColor: "bg-slate-500/5" },
  running: { color: "text-accent-cyan", borderColor: "border-accent-cyan/40", label: "Processing", bgColor: "bg-accent-cyan/5" },
  completed: { color: "text-accent-green", borderColor: "border-accent-green/40", label: "Complete", bgColor: "bg-accent-green/5" },
  failed: { color: "text-red-400", borderColor: "border-red-500/40", label: "Failed", bgColor: "bg-red-500/5" },
};

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === "completed") return <CheckCircle className="w-4 h-4 text-accent-green" />;
  if (status === "failed") return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === "running") {
    return (
      <motion.div
        className="w-4 h-4 rounded-full border-2 border-accent-cyan border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  return <Clock className="w-4 h-4 text-slate-600" />;
}

export function AgentCard({ agentName, status, output, index = 0 }: AgentCardProps) {
  const config = STATUS_CONFIG[status];
  const icon = AGENT_ICONS[agentName] || "🤖";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "glass rounded-xl p-4 border transition-all duration-500 relative overflow-hidden",
        config.borderColor, config.bgColor
      )}
    >
      {status === "running" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-cyan/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <div className="text-xs font-semibold text-slate-200">{agentName}</div>
              <div className={cn("text-xs font-medium", config.color)}>{config.label}</div>
            </div>
          </div>
          <StatusIcon status={status} />
        </div>

        <AnimatePresence>
          {output && status === "completed" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/[0.06] pt-2 mt-1"
            >
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{output.reasoning}</p>
              <div className="flex items-center gap-1 mt-2">
                <Zap className="w-3 h-3 text-slate-600" />
                <span className="text-xs text-slate-600 font-mono">{formatMs(output.execution_time_ms)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {status === "running" && (
          <div className="mt-2 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  className="h-full bg-accent-cyan/40 rounded-full"
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
