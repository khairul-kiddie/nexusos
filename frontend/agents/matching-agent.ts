import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MatchingResult } from "@/types/ecosystem";
import { MOCK_MENTORS } from "@/data/mock/mentors";
import { MATCHING_AGENT_SYSTEM, buildMatchingUserPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

function computeFallbackMatching(query: string): MatchingResult {
  const available = MOCK_MENTORS.filter(m => m.availability !== "full").slice(0, 3);
  return {
    query,
    matches: available.map((m, i) => ({
      mentorId: m.id,
      mentorName: m.name,
      compatibilityScore: parseFloat((0.88 - i * 0.04).toFixed(2)),
      matchReason: `${m.name} has ${m.yearsExperience} years of experience in ${m.sectors.slice(0, 2).join(" and ")}. Current load: ${m.currentMenteeCount}/${m.maxMenteeCapacity} mentees.`,
      keyStrengths: m.expertise.slice(0, 3),
      availability: m.availability,
    })),
    summary: `${available.length} mentors matched from the available pool. Top match: ${available[0]?.name} (${available[0]?.sectors.slice(0, 2).join(", ")}).`,
    aiGeneratedAt: new Date().toISOString(),
  };
}

export async function runMatchingAgent(query: string): Promise<MatchingResult> {
  if (!process.env.GEMINI_API_KEY) return computeFallbackMatching(query);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: MATCHING_AGENT_SYSTEM,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = buildMatchingUserPrompt(query, MOCK_MENTORS);
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as MatchingResult;
  } catch {
    return computeFallbackMatching(query);
  }
}
