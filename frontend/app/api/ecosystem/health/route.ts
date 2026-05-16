import { NextResponse } from "next/server";
import { runHealthAgent } from "@/agents/health-agent";
import { getCache, setCache } from "@/lib/cache";
import type { EcosystemHealth } from "@/types/ecosystem";

const CACHE_KEY = "ecosystem:health";

export async function GET() {
  const cached = getCache<EcosystemHealth>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const health = await runHealthAgent();
    setCache(CACHE_KEY, health);
    return NextResponse.json({ ...health, cached: false });
  } catch (err) {
    console.error("[ecosystem/health]", err);
    return NextResponse.json(
      { error: "Failed to generate ecosystem health" },
      { status: 500 },
    );
  }
}
