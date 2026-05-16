import { NextRequest, NextResponse } from "next/server";
import { runGrantsAgent } from "@/agents/grants-agent";
import { getCache, setCache } from "@/lib/cache";
import type { GrantsResult } from "@/types/ecosystem";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const cacheKey = `grants:${query.toLowerCase().slice(0, 80)}`;
  const cached = getCache<GrantsResult>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const result = await runGrantsAgent(query);
    setCache(cacheKey, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (err) {
    console.error("[grants/recommend]", err);
    return NextResponse.json(
      { error: "Failed to run grants agent" },
      { status: 500 },
    );
  }
}
