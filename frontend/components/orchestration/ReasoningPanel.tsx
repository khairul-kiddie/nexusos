"use client";

import { motion } from "framer-motion";
import { Brain, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

interface ReasoningPanelProps {
  reasoning: string;
  title?: string;
  executionTime?: number;
  confidenceScore?: number;
}

export function ReasoningPanel({
  reasoning, title = "Master Intelligence Report", executionTime, confidenceScore
}: ReasoningPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reasoning);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = reasoning.split("\n").filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/[0.06] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-accent-purple" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">{title}</div>
            {executionTime && (
              <div className="text-xs text-slate-500 font-mono">{(executionTime / 1000).toFixed(2)}s execution</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {confidenceScore && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-green/10 border border-accent-green/20">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <span className="text-xs font-semibold text-accent-green">{confidenceScore}% confidence</span>
            </div>
          )}
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-200 transition-colors"
          >
            {copied ? <CheckCheck className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-5 max-h-96 overflow-y-auto space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <motion.h2
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="text-base font-bold text-white mt-4 first:mt-0"
              >
                {line.replace("## ", "")}
              </motion.h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <motion.h3
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="text-sm font-semibold text-accent-cyan mt-3"
              >
                {line.replace("### ", "")}
              </motion.h3>
            );
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="text-sm font-semibold text-slate-200"
              >
                {line.replace(/\*\*/g, "")}
              </motion.p>
            );
          }
          return (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="text-sm text-slate-400 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="text-slate-200 font-medium">$1</span>')
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
