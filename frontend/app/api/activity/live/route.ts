import { NextResponse } from "next/server";
import { runActivityAgent } from "@/agents/activity-agent";
import { getCache, setCache } from "@/lib/cache";
import type { ActivityItem } from "@/types/ecosystem";

const CACHE_KEY = "activity:live";

export async function GET() {
  const cached = getCache<ActivityItem[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({ items: cached, cached: true });
  }

  try {
    const items = await runActivityAgent();
    setCache(CACHE_KEY, items);
    return NextResponse.json({ items, cached: false });
  } catch (err) {
    console.error("[activity/live]", err);
    return NextResponse.json(
      { error: "Failed to generate activity feed" },
      { status: 500 },
    );
  }
}
