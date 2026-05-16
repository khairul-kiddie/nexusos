"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertCircle, Info, TrendingDown, BarChart3, RefreshCw, Sparkles, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { severityColor } from "@/lib/utils";
import { api } from "@/lib/api";
import type { EcosystemHealth, EcosystemGovernanceAlert } from "@/types/ecosystem";

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

function AlertIcon({ severity }: { severity: string }) {
  if (severity === "high") return <AlertTriangle className="w-4 h-4" style={{ color: severityColor(severity) }} />;
  if (severity === "medium") return <AlertCircle className="w-4 h-4" style={{ color: severityColor(severity) }} />;
  return <Info className="w-4 h-4" style={{ color: severityColor(severity) }} />;
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="relative w-32 h-16 mx-auto">
      <svg viewBox="0 0 100 50" className="w-full">
        <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
        <motion.path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="141"
          initial={{ strokeDashoffset: 141 }}
          animate={{ strokeDashoffset: 141 - (score / 100) * 141 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          style={{ transformOrigin: "50px 50px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <line x1="50" y1="50" x2="50" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3" fill={color} />
        </motion.g>
      </svg>
    </div>
  );
}

export default function GovernancePage() {
  const [health, setHealth] = useState<EcosystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHealth = useCallback(async () => {
    setError(false);
    try {
      const data = await api.getEcosystemHealth();
      setHealth(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const highAlerts = health?.alerts.filter((a: EcosystemGovernanceAlert) => a.severity === "high").length ?? 0;
  const mediumAlerts = health?.alerts.filter((a: EcosystemGovernanceAlert) => a.severity === "medium").length ?? 0;
  const healthBreakdown = health
    ? Object.fromEntries(health.dimensions.map(d => [d.name, d.score]))
    : {};

  // Error state
  if (!loading && error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-red-500/20 p-8 max-w-md text-center"
        >
          <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Could Not Load Governance Data</h2>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            The Governance Intelligence Agent could not be reached. Check that the backend is running and GEMINI_API_KEY is configured.
          </p>
          <button
            onClick={fetchHealth}
            className="flex items-center gap-2 px-4 py-2 bg-accent-amber/10 border border-accent-amber/30 text-accent-amber rounded-xl hover:bg-accent-amber/20 transition-colors mx-auto text-sm font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-accent-amber" />
          <h1 className="text-xl font-bold text-white">Governance Intelligence</h1>
          {highAlerts > 0 && <Badge variant="red">{highAlerts} critical</Badge>}
          {mediumAlerts > 0 && <Badge variant="amber">{mediumAlerts} warnings</Badge>}
          {health && <AiBadge generatedAt={health.aiGeneratedAt} />}
          <button
            onClick={fetchHealth}
            className="ml-auto p-1.5 text-slate-600 hover:text-slate-400 transition-colors rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Real-time ecosystem health monitoring. Detect imbalances, mentor overload, and underserved sectors.
        </p>
        {health?.narrative && (
          <p className="text-xs text-slate-600 mt-2 italic max-w-3xl">{health.narrative}</p>
        )}
      </motion.div>

      {/* Health Overview */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} className="h-48" />)}
        </div>
      ) : health && (
        <div className="grid grid-cols-4 gap-4">
          {/* Main Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 glass rounded-2xl border border-accent-amber/20 p-6 flex flex-col items-center justify-center"
          >
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Ecosystem Health</div>
            <HealthGauge score={health.overallScore} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-4xl font-bold font-mono text-accent-amber mt-2"
            >
              {health.overallScore.toFixed(1)}
            </motion.div>
            <div className="text-xs text-slate-500 mt-1">out of 100</div>
          </motion.div>

          {/* Dimension Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 glass rounded-2xl border border-white/[0.06] p-5"
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Health Dimensions
            </div>
            <div className="space-y-3">
              {Object.entries(healthBreakdown).map(([key, value], i) => {
                const color = value >= 80 ? "#10B981" : value >= 65 ? "#F59E0B" : "#EF4444";
                const dim = health.dimensions.find(d => d.name === key);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{key}</span>
                      <div className="flex items-center gap-2">
                        {dim && (
                          <span className={`text-[10px] ${dim.trend === "improving" ? "text-accent-green" : dim.trend === "declining" ? "text-red-400" : "text-slate-600"}`}>
                            {dim.trend === "improving" ? "↑" : dim.trend === "declining" ? "↓" : "→"}
                          </span>
                        )}
                        <span className="text-xs font-mono font-semibold" style={{ color }}>{value}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                      />
                    </div>
                    {dim?.insight && (
                      <p className="text-[10px] text-slate-600 mt-0.5">{dim.insight}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-white/[0.06] p-5"
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Monthly Activity</div>
            <div className="space-y-3">
              {Object.entries(health.monthlyTrends).map(([key, value], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-slate-500">{key}</span>
                  <span className="text-sm font-bold font-mono text-accent-cyan">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Alerts Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-slate-200">Governance Alerts</h2>
          {loading ? (
            <SkeletonBlock className="w-24 h-5" />
          ) : health && (
            <Badge variant="red" dot>{health.alerts.length} Active</Badge>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} className="h-48" />)}
          </div>
        ) : health && (
          <div className="grid grid-cols-2 gap-4">
            {health.alerts.map((alert: EcosystemGovernanceAlert, i: number) => {
              const color = severityColor(alert.severity);
              const severityVariant = alert.severity === "high" ? "red" : alert.severity === "medium" ? "amber" : "green";
              return (
                <motion.div
                  key={alert.alertId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass rounded-2xl border p-5 relative overflow-hidden"
                  style={{ borderColor: `${color}30` }}
                >
                  <div className="absolute inset-0 opacity-[0.03]" style={{ background: color }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertIcon severity={alert.severity} />
                        <Badge variant={severityVariant} className="capitalize">{alert.severity}</Badge>
                      </div>
                      <span className="text-xs font-mono text-slate-600">
                        Impact: {Math.round(alert.impactScore * 100)}%
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white mb-2">{alert.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{alert.description}</p>

                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Affected</div>
                        <div className="flex flex-wrap gap-1">
                          {alert.affectedEntities.map((e: string) => (
                            <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-400">{e}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Recommendation</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{alert.recommendation}</p>
                      </div>
                    </div>

                    <div className="mt-3 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${alert.impactScore * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sector Coverage */}
      {!loading && health && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl border border-white/[0.06] p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown className="w-4 h-4 text-accent-pink" />
            <h2 className="text-sm font-semibold text-slate-200">Sector Coverage Heatmap</h2>
            <span className="text-xs text-slate-600 ml-2">% of optimal ecosystem support</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(health.sectorCoverage).map(([sector, coverage], i) => {
              const color = coverage >= 0.8 ? "#10B981" : coverage >= 0.6 ? "#F59E0B" : "#EF4444";
              return (
                <motion.div
                  key={sector}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="rounded-xl p-3 border text-center relative overflow-hidden"
                  style={{ borderColor: `${color}30`, background: `${color}08` }}
                >
                  <div className="text-xs font-semibold text-slate-300 mb-1">{sector}</div>
                  <div className="text-xl font-bold font-mono" style={{ color }}>
                    {Math.round(coverage * 100)}%
                  </div>
                  {coverage < 0.5 && (
                    <div className="mt-1 text-[10px] text-red-400 font-medium">⚠ Critical Gap</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
