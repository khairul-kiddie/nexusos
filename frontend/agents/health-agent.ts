import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EcosystemHealth } from "@/types/ecosystem";
import { MOCK_STARTUPS } from "@/data/mock/startups";
import { MOCK_MENTORS } from "@/data/mock/mentors";
import { MOCK_GRANTS } from "@/data/mock/grants";
import { MOCK_EVENTS } from "@/data/mock/events";
import { HEALTH_AGENT_SYSTEM, buildHealthUserPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runHealthAgent(): Promise<EcosystemHealth> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: HEALTH_AGENT_SYSTEM,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildHealthUserPrompt(MOCK_STARTUPS, MOCK_MENTORS, MOCK_GRANTS, MOCK_EVENTS);
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as EcosystemHealth;
}
