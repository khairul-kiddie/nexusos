import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GrantsResult } from "@/types/ecosystem";
import { MOCK_GRANTS } from "@/data/mock/grants";
import { GRANTS_AGENT_SYSTEM, buildGrantsUserPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runGrantsAgent(query: string): Promise<GrantsResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: GRANTS_AGENT_SYSTEM,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildGrantsUserPrompt(query, MOCK_GRANTS);
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as GrantsResult;
}
