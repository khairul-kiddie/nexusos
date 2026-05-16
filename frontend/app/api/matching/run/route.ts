import { NextRequest, NextResponse } from "next/server";
import { runMatchingAgent } from "@/agents/matching-agent";
import { getCache, setCache } from "@/lib/cache";
import type { MatchingResult } from "@/types/ecosystem";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const cacheKey = `matching:${query.toLowerCase().slice(0, 80)}`;
  const cached = getCache<MatchingResult>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const result = await runMatchingAgent(query);
    setCache(cacheKey, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (err) {
    console.error("[matching/run]", err);
    return NextResponse.json(
      { error: "Failed to run matching agent" },
      { status: 500 },
    );
  }
}
