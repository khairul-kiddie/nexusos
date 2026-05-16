import { NextResponse } from "next/server";
import { runEcosystemAgent } from "@/agents/ecosystem-agent";
import { getCache, setCache } from "@/lib/cache";
import type { EcosystemStats } from "@/types/ecosystem";

const CACHE_KEY = "ecosystem:stats";

export async function GET() {
  const cached = getCache<EcosystemStats>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const stats = await runEcosystemAgent();
    setCache(CACHE_KEY, stats);
    return NextResponse.json({ ...stats, cached: false });
  } catch (err) {
    console.error("[ecosystem/stats]", err);
    return NextResponse.json(
      { error: "Failed to generate ecosystem stats" },
      { status: 500 },
    );
  }
}
