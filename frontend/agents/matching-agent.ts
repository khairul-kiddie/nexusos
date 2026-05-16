import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MatchingResult } from "@/types/ecosystem";
import { MOCK_MENTORS } from "@/data/mock/mentors";
import { MATCHING_AGENT_SYSTEM, buildMatchingUserPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runMatchingAgent(query: string): Promise<MatchingResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: MATCHING_AGENT_SYSTEM,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildMatchingUserPrompt(query, MOCK_MENTORS);
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as MatchingResult;
}
