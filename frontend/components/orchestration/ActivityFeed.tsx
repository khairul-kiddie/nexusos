"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface FeedItem {
  id: number;
  type: string;
  message: string;
  time: string;
  icon: string;
}

const TYPE_COLORS: Record<string, string> = {
  match: "text-accent-purple",
  grant: "text-accent-amber",
  memory: "text-accent-cyan",
  alert: "text-red-400",
  connection: "text-accent-green",
  programme: "text-accent-pink",
  insight: "text-accent-cyan",
  graph: "text-accent-purple",
};

interface ActivityFeedProps {
  items: FeedItem[];
  isLive?: boolean;
}

export function ActivityFeed({ items, isLive = false }: ActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Activity Feed</span>
          {isLive && (
            <motion.div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-green/10 border border-accent-green/20"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <span className="text-[10px] font-medium text-accent-green">LIVE</span>
            </motion.div>
          )}
        </div>
        <span className="text-xs text-slate-600 font-mono">{items.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors group"
            >
              <span className="text-base mt-0.5 shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${TYPE_COLORS[item.type] || "text-slate-400"}`}>
                  {item.message}
                </p>
                <span className="text-[10px] text-slate-600 font-mono">{item.time}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
