import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ActivityItem } from "@/types/ecosystem";
import { MOCK_EVENTS } from "@/data/mock/events";
import { ACTIVITY_AGENT_SYSTEM, buildActivityUserPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const ICON_MAP: Record<string, string> = {
  match: "🧠", grant: "💰", alert: "⚠️", connection: "🔗",
  programme: "🎯", insight: "✨", memory: "💾", graph: "🕸️",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function computeFallbackActivity(): ActivityItem[] {
  return MOCK_EVENTS.slice(0, 10).map((e, i) => ({
    id: `act-${i + 1}`,
    type: e.type,
    message: e.message.length > 90 ? e.message.slice(0, 87) + "…" : e.message,
    time: relativeTime(e.timestamp),
    icon: ICON_MAP[e.type] ?? "📌",
  }));
}

export async function runActivityAgent(): Promise<ActivityItem[]> {
  if (!process.env.GEMINI_API_KEY) return computeFallbackActivity();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: ACTIVITY_AGENT_SYSTEM,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = buildActivityUserPrompt(MOCK_EVENTS);
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as ActivityItem[];
  } catch {
    return computeFallbackActivity();
  }
}
