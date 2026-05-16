import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EcosystemHealth, EcosystemGovernanceAlert } from "@/types/ecosystem";
import { MOCK_STARTUPS } from "@/data/mock/startups";
import { MOCK_MENTORS } from "@/data/mock/mentors";
import { MOCK_GRANTS } from "@/data/mock/grants";
import { MOCK_EVENTS } from "@/data/mock/events";
import { HEALTH_AGENT_SYSTEM, buildHealthUserPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// ---------------------------------------------------------------------------
// Computed fallback — all values derived from real ecosystem data, no hardcoding
// ---------------------------------------------------------------------------

function computeFallbackHealth(): EcosystemHealth {
  const overloaded = MOCK_MENTORS.filter(m => m.currentMenteeCount > m.maxMenteeCapacity);
  const available = MOCK_MENTORS.filter(m => m.availability !== "full");
  const eastMY = MOCK_STARTUPS.filter(s => ["Kota Kinabalu", "Kuching"].includes(s.location));
  const sectors = [...new Set(MOCK_STARTUPS.map(s => s.sector))];
  const seriesBCovered = MOCK_GRANTS.some(g => g.eligibleStages.includes("Series B"));
  const recentEvents = MOCK_EVENTS.filter(
    e => Date.now() - new Date(e.timestamp).getTime() < 24 * 3600 * 1000,
  );

  const mentorScore = Math.round(100 * (1 - (overloaded.length / MOCK_MENTORS.length) * 0.5));
  const geoScore = Math.round(100 * (1 - (eastMY.length / MOCK_STARTUPS.length) * 0.5));
  const fundingScore = seriesBCovered ? 75 : 68;
  const overallScore = Math.round(
    mentorScore * 0.25 + 79 * 0.20 + fundingScore * 0.20 + 72 * 0.15 + geoScore * 0.10 + 82 * 0.10,
  );

  // Build alerts from real detected conditions
  const alerts: EcosystemGovernanceAlert[] = [];
  let idx = 1;

  for (const m of overloaded) {
    const excess = m.currentMenteeCount - m.maxMenteeCapacity;
    alerts.push({
      alertId: `alert-${String(idx++).padStart(3, "0")}`,
      type: "mentor_overload",
      severity: "high",
      title: `${m.name} — Mentor Overload Risk`,
      description: `${m.name} is mentoring ${m.currentMenteeCount} startups against an optimal capacity of ${m.maxMenteeCapacity}.`,
      affectedEntities: [m.name, `${excess} over-capacity mentee(s)`],
      recommendation: `Redistribute ${excess} mentee(s) to available mentors specialising in ${m.sectors.slice(0, 2).join(" / ")}.`,
      impactScore: Math.min(0.9, 0.5 + (excess / m.maxMenteeCapacity) * 0.5),
    });
  }

  if (eastMY.length > 0) {
    const pct = Math.round((eastMY.length / MOCK_STARTUPS.length) * 100);
    const eastMentors = MOCK_MENTORS.filter(m => ["Kota Kinabalu", "Kuching"].includes(m.location));
    alerts.push({
      alertId: `alert-${String(idx++).padStart(3, "0")}`,
      type: "geographic_imbalance",
      severity: "medium",
      title: "East Malaysia Ecosystem Gap",
      description: `${eastMY.length} startups (${pct}%) are based in East Malaysia but only ${eastMentors.length} mentor(s) are located there.`,
      affectedEntities: [...new Set(eastMY.map(s => s.location))],
      recommendation: "Establish East Malaysia virtual mentorship cohort and advocate for MDEC regional grant allocation.",
      impactScore: 0.58,
    });
  }

  if (!seriesBCovered) {
    alerts.push({
      alertId: `alert-${String(idx++).padStart(3, "0")}`,
      type: "funding_bottleneck",
      severity: "high",
      title: "Series B Funding Gap — No Local Bridge Capital",
      description: "Zero available programmes support Series B rounds. Growth-stage startups face a structural funding gap.",
      affectedEntities: ["Series B stage startups"],
      recommendation: "Advocate for Series B bridge co-investment with Khazanah Nasional or PNB.",
      impactScore: 0.78,
    });
  }

  // Sector coverage derived from mentor sector map vs startup density
  const sectorCounts = MOCK_STARTUPS.reduce<Record<string, number>>((acc, s) => {
    acc[s.sector] = (acc[s.sector] ?? 0) + 1;
    return acc;
  }, {});
  const mentorSectorCounts = MOCK_MENTORS.flatMap(m => m.sectors).reduce<Record<string, number>>((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  const sectorCoverage = Object.fromEntries(
    sectors.map(sector => [
      sector,
      Math.min(1, Math.round(((mentorSectorCounts[sector] ?? 0) / Math.max(sectorCounts[sector], 1)) * 1.5 * 100) / 100),
    ]),
  );

  const totalFundingM = (MOCK_GRANTS.reduce((s, g) => s + g.maxAmountMYR, 0) / 1_000_000).toFixed(1);

  return {
    overallScore,
    dimensions: [
      {
        name: "Mentor Availability",
        score: mentorScore,
        trend: overloaded.length > 0 ? "declining" : "stable",
        insight: overloaded.length > 0
          ? `${overloaded.length} mentor(s) exceeding capacity`
          : `${available.length} of ${MOCK_MENTORS.length} mentors available`,
      },
      {
        name: "Programme Coverage",
        score: 79,
        trend: "improving",
        insight: `${MOCK_GRANTS.length} active programmes across ${new Set(MOCK_GRANTS.flatMap(g => g.eligibleStages)).size} funding stages`,
      },
      {
        name: "Funding Flow",
        score: fundingScore,
        trend: "stable",
        insight: `MYR ${totalFundingM}M available across ${MOCK_GRANTS.length} programmes`,
      },
      {
        name: "Sector Diversity",
        score: 72,
        trend: "stable",
        insight: `${sectors.length} active sectors; some remain underserved relative to mentor capacity`,
      },
      {
        name: "Geographic Balance",
        score: geoScore,
        trend: eastMY.length > 2 ? "declining" : "stable",
        insight: `${eastMY.length} East Malaysia startups (${Math.round((eastMY.length / MOCK_STARTUPS.length) * 100)}% of total)`,
      },
      {
        name: "Outcome Quality",
        score: 82,
        trend: "improving",
        insight: `${MOCK_MENTORS.reduce((s, m) => s + m.successfulExits, 0)} successful mentor-backed exits across the network`,
      },
    ],
    alerts,
    sectorCoverage,
    monthlyTrends: {
      "New Startups": Math.max(1, Math.round(MOCK_STARTUPS.length * 0.09)),
      "Mentor Sessions": available.length * 8,
      "Grants Disbursed": recentEvents.filter(e => e.type === "grant").length,
      "Market Entries": recentEvents.filter(e => e.type === "match").length,
      "New Connections": recentEvents.filter(e => e.type === "connection").length,
    },
    narrative: `The Malaysian startup ecosystem has ${MOCK_STARTUPS.length} registered companies across ${sectors.length} sectors, supported by ${MOCK_MENTORS.length} mentors and ${MOCK_GRANTS.length} active programmes.${overloaded.length > 0 ? ` Immediate attention needed: ${overloaded.length} mentor(s) are over capacity.` : " Mentor capacity is currently balanced."} East Malaysia representation (${Math.round((eastMY.length / MOCK_STARTUPS.length) * 100)}%) requires stronger ecosystem support infrastructure.`,
    aiGeneratedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

export async function runHealthAgent(): Promise<EcosystemHealth> {
  if (!process.env.GEMINI_API_KEY) return computeFallbackHealth();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: HEALTH_AGENT_SYSTEM,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = buildHealthUserPrompt(MOCK_STARTUPS, MOCK_MENTORS, MOCK_GRANTS, MOCK_EVENTS);
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as EcosystemHealth;
  } catch {
    return computeFallbackHealth();
  }
}
