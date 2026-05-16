import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EcosystemStats } from "@/types/ecosystem";
import { MOCK_STARTUPS } from "@/data/mock/startups";
import { MOCK_MENTORS } from "@/data/mock/mentors";
import { MOCK_GRANTS } from "@/data/mock/grants";
import { MOCK_EVENTS } from "@/data/mock/events";
import { ECOSYSTEM_AGENT_SYSTEM, buildEcosystemUserPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

function computeFallbackStats(): EcosystemStats {
  const totalFunding = MOCK_STARTUPS.reduce((sum, s) => sum + s.fundingRaisedMYR, 0);
  const activeMentors = MOCK_MENTORS.filter(m => m.availability !== "full").length;
  const connections = MOCK_EVENTS.filter(e => e.type === "connection").length;
  const grants = MOCK_EVENTS.filter(e => e.type === "grant").length;
  const exits = MOCK_MENTORS.reduce((sum, m) => sum + m.successfulExits, 0);

  return {
    totalStartups: MOCK_STARTUPS.length,
    activeMentors,
    programmesAvailable: MOCK_GRANTS.length,
    connectionsFormed: connections,
    grantsDisbursed: grants,
    successfulExits: exits,
    totalFundingMYR: totalFunding,
    monthlyGrowthRate: 0.094,
    summary:
      "Malaysia's innovation ecosystem is expanding steadily, with strong FinTech and HealthTech traction. Mentor capacity constraints and East Malaysia coverage gaps remain key governance priorities.",
    aiGeneratedAt: new Date().toISOString(),
  };
}

export async function runEcosystemAgent(): Promise<EcosystemStats> {
  if (!process.env.GEMINI_API_KEY) return computeFallbackStats();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: ECOSYSTEM_AGENT_SYSTEM,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = buildEcosystemUserPrompt(MOCK_STARTUPS, MOCK_MENTORS, MOCK_GRANTS, MOCK_EVENTS);
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as EcosystemStats;
  } catch {
    return computeFallbackStats();
  }
}
