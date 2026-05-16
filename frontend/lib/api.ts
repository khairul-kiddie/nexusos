import type { OrchestrationRequest, OrchestrationResult, StartupProfile } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  health: () => apiFetch<{ status: string; version: string; agents: string[] }>("/api/health"),

  orchestrate: (request: OrchestrationRequest) =>
    apiFetch<OrchestrationResult>("/api/orchestrate", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  runDemo: () =>
    apiFetch<OrchestrationResult>("/api/demo", { method: "POST" }),

  getDemoStartup: () =>
    apiFetch<StartupProfile>("/api/demo/startup"),

  getDemoQuery: () =>
    apiFetch<{ query: string }>("/api/demo/query"),
};
