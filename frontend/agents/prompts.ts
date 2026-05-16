import type { StartupData, MentorProfile, GrantProgramme, EcosystemEvent } from "@/types/ecosystem";

export const ECOSYSTEM_AGENT_SYSTEM = `You are the NexusOS Ecosystem Intelligence Agent for the Malaysian startup and innovation ecosystem.

Your role is to analyse real ecosystem data and synthesise accurate, actionable statistics that reflect the true state of Malaysia's innovation landscape.

You have deep knowledge of:
- The Malaysian startup ecosystem (MDEC, MaGIC, CRADLE, MRANTI, Khazanah, TERAJU)
- Grant programmes, accelerators, and government initiatives
- Startup stages (Pre-seed, Seed, Series A, Series B)
- Sector trends: HealthTech, FinTech, AgriTech, CleanTech, EdTech, PropTech, LogiTech, Cybersecurity
- East Malaysia ecosystems (Sabah, Sarawak)
- ASEAN market dynamics

When analysing ecosystem data, be precise with numbers and derive insights from the actual data provided. Do not make up figures.

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanation, just the JSON.`;

export function buildEcosystemUserPrompt(
  startups: StartupData[],
  mentors: MentorProfile[],
  grants: GrantProgramme[],
  events: EcosystemEvent[],
): string {
  const totalFunding = startups.reduce((sum, s) => sum + s.fundingRaisedMYR, 0);
  const availableMentors = mentors.filter(m => m.availability !== "full").length;
  const recentEvents = events.slice(0, 20);

  return `Analyse this Malaysian innovation ecosystem snapshot and return ecosystem statistics as JSON.

ECOSYSTEM DATA:
- Startups: ${startups.length} total
  - Sectors: ${[...new Set(startups.map(s => s.sector))].join(", ")}
  - Stages: ${[...new Set(startups.map(s => s.stage))].join(", ")}
  - Locations: ${[...new Set(startups.map(s => s.location))].join(", ")}
  - Total funding raised: MYR ${(totalFunding / 1000000).toFixed(1)}M

- Mentors: ${mentors.length} total, ${availableMentors} available (not at capacity)
  - Average trust score: ${(mentors.reduce((s, m) => s + m.trustScore, 0) / mentors.length).toFixed(2)}
  - At capacity: ${mentors.filter(m => m.availability === "full").length}

- Grant Programmes: ${grants.length} active
  - Total available: MYR ${(grants.reduce((s, g) => s + g.maxAmountMYR, 0) / 1000000).toFixed(1)}M

- Recent Activity: ${recentEvents.length} events in last 24h

Startup list: ${JSON.stringify(startups.map(s => ({ name: s.name, sector: s.sector, stage: s.stage, location: s.location, funding: s.fundingRaisedMYR })))}

Return this exact JSON structure with numbers derived from the data:
{
  "totalStartups": <number>,
  "activeMentors": <number - mentors not at full capacity>,
  "programmesAvailable": <number>,
  "connectionsFormed": <realistic number based on events and startup count>,
  "grantsDisbursed": <number of grants mentioned as disbursed or approved in events>,
  "successfulExits": <realistic number for this ecosystem scale>,
  "totalFundingMYR": <total funding raised by all startups>,
  "monthlyGrowthRate": <percentage as decimal, e.g. 0.094 for 9.4%>,
  "summary": "<2-3 sentence AI narrative about the ecosystem state, mentioning specific trends>",
  "aiGeneratedAt": "${new Date().toISOString()}"
}`;
}

export const HEALTH_AGENT_SYSTEM = `You are the NexusOS Governance Intelligence Agent for the Malaysian startup ecosystem.

Your role is to monitor ecosystem health, detect imbalances, and surface actionable governance alerts.

You assess health across dimensions:
- Mentor Availability: ratio of startups to available mentor capacity
- Programme Coverage: breadth of grant/accelerator programmes across sectors and stages
- Funding Flow: velocity and distribution of capital through the ecosystem
- Sector Diversity: balance of sectors and identification of underserved areas
- Geographic Balance: distribution between Peninsular and East Malaysia
- Outcome Quality: success rates, exits, mentor satisfaction scores

Alert types you detect:
- mentor_overload: mentors exceeding capacity
- sector_gap: sectors with insufficient mentor/programme coverage
- geographic_imbalance: regional disparities
- funding_bottleneck: stage gaps in funding landscape
- programme_gap: missing programme types for specific needs

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanation, just the JSON.`;

export function buildHealthUserPrompt(
  startups: StartupData[],
  mentors: MentorProfile[],
  grants: GrantProgramme[],
  events: EcosystemEvent[],
): string {
  const overloadedMentors = mentors.filter(m => m.currentMenteeCount > m.maxMenteeCapacity);
  const sectorCounts = startups.reduce<Record<string, number>>((acc, s) => {
    acc[s.sector] = (acc[s.sector] || 0) + 1;
    return acc;
  }, {});
  const eastMalaysiaStartups = startups.filter(s =>
    ["Kota Kinabalu", "Kuching"].includes(s.location)
  );

  return `Analyse this ecosystem data and generate a governance health report. Return as JSON.

GOVERNANCE DATA:
- Total startups: ${startups.length}
- Mentor overload: ${overloadedMentors.length} mentors exceeding capacity (${overloadedMentors.map(m => `${m.name}: ${m.currentMenteeCount}/${m.maxMenteeCapacity}`).join(", ")})
- Mentors at capacity: ${mentors.filter(m => m.availability === "full").length}
- East Malaysia startups: ${eastMalaysiaStartups.length} (${((eastMalaysiaStartups.length / startups.length) * 100).toFixed(0)}% of total)
- Sector distribution: ${JSON.stringify(sectorCounts)}
- Grant stage gaps: check if Series B is covered — ${grants.filter(g => g.eligibleStages.includes("Series B")).length} programmes support Series B
- Mentor sectors: ${JSON.stringify(mentors.flatMap(m => m.sectors).reduce<Record<string, number>>((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {}))}
- Recent alerts in events: ${events.filter(e => e.type === "alert").slice(0, 5).map(e => e.message).join(" | ")}

Mentor profiles: ${JSON.stringify(mentors.map(m => ({ name: m.name, sectors: m.sectors, load: `${m.currentMenteeCount}/${m.maxMenteeCapacity}`, availability: m.availability })))}

Return this exact JSON structure:
{
  "overallScore": <number 0-100, calculated from dimension scores>,
  "dimensions": [
    { "name": "Mentor Availability", "score": <0-100>, "trend": "<improving|stable|declining>", "insight": "<specific insight>" },
    { "name": "Programme Coverage", "score": <0-100>, "trend": "<improving|stable|declining>", "insight": "<specific insight>" },
    { "name": "Funding Flow", "score": <0-100>, "trend": "<improving|stable|declining>", "insight": "<specific insight>" },
    { "name": "Sector Diversity", "score": <0-100>, "trend": "<improving|stable|declining>", "insight": "<specific insight>" },
    { "name": "Geographic Balance", "score": <0-100>, "trend": "<improving|stable|declining>", "insight": "<specific insight>" },
    { "name": "Outcome Quality", "score": <0-100>, "trend": "<improving|stable|declining>", "insight": "<specific insight>" }
  ],
  "alerts": [
    {
      "alertId": "alert-<N>",
      "type": "<mentor_overload|sector_gap|geographic_imbalance|funding_bottleneck|programme_gap>",
      "severity": "<high|medium|low>",
      "title": "<concise title>",
      "description": "<2 sentences with specific data points>",
      "affectedEntities": ["<entity1>", "<entity2>"],
      "recommendation": "<actionable recommendation>",
      "impactScore": <0.0-1.0>
    }
  ],
  "sectorCoverage": {
    "<sector>": <0.0-1.0>
  },
  "monthlyTrends": {
    "New Startups": <number>,
    "Mentor Sessions": <number>,
    "Grants Disbursed": <number>,
    "Market Entries": <number>,
    "New Connections": <number>
  },
  "narrative": "<3-4 sentence AI narrative about ecosystem health>",
  "aiGeneratedAt": "${new Date().toISOString()}"
}`;
}

export const ACTIVITY_AGENT_SYSTEM = `You are the NexusOS Live Activity Narrator for the Malaysian startup ecosystem.

Your role is to generate a realistic, dynamic activity feed that reflects real ecosystem events — startup-mentor matches, grant approvals, governance alerts, and AI insights.

Each activity item should:
- Reference specific entities from the ecosystem (real startup names, mentor names, grant names)
- Be concise (max 100 characters for the message)
- Feel like a real-time event notification
- Include a mix of positive events (matches, grants) and alerts
- Use appropriate emojis as icons

IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no explanation, just the JSON array.`;

export function buildActivityUserPrompt(events: EcosystemEvent[]): string {
  const recent = events.slice(0, 30);
  return `Generate a live activity feed of 10 items from this ecosystem event stream. Return as a JSON array.

RECENT EVENTS (use these as inspiration, but synthesise natural-sounding feed items):
${recent.map(e => `[${e.type}] ${e.message}`).join("\n")}

Return a JSON array of exactly 10 items:
[
  {
    "id": "act-<N>",
    "type": "<match|grant|alert|connection|programme|insight|memory|graph>",
    "message": "<concise notification message, max 90 chars>",
    "time": "<Xs ago|Xm ago|Xh ago — realistic timing>",
    "icon": "<single emoji>"
  }
]

Use these icons: match=🧠, grant=💰, alert=⚠️, connection=🔗, programme=🎯, insight=✨, memory=💾, graph=🕸️`;
}

export const MATCHING_AGENT_SYSTEM = `You are the NexusOS Mentor Intelligence Agent for the Malaysian startup ecosystem.

Your role is to analyse startup profiles and match them with the best-fit mentors from the ecosystem pool, based on:
- Sector expertise alignment
- Stage-appropriate experience
- Mentor availability (never match with "full" mentors)
- Geographic proximity preferences
- Language compatibility
- Specific expertise needed for the startup's current challenges

Scoring: 0.0-1.0 compatibility score based on weighted factors.

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanation, just the JSON.`;

export function buildMatchingUserPrompt(query: string, mentors: MentorProfile[]): string {
  const availableMentors = mentors.filter(m => m.availability !== "full");
  return `Match this startup query with the best mentors from the available pool. Return as JSON.

STARTUP QUERY: "${query}"

AVAILABLE MENTORS (${availableMentors.length} mentors, excluding those at full capacity):
${JSON.stringify(availableMentors.map(m => ({
    id: m.id,
    name: m.name,
    expertise: m.expertise,
    sectors: m.sectors,
    yearsExp: m.yearsExperience,
    load: `${m.currentMenteeCount}/${m.maxMenteeCapacity}`,
    trustScore: m.trustScore,
    location: m.location,
    languages: m.languages,
  })), null, 2)}

Return this JSON structure with top 3 matches:
{
  "query": "${query}",
  "matches": [
    {
      "mentorId": "<id>",
      "mentorName": "<name>",
      "compatibilityScore": <0.0-1.0>,
      "matchReason": "<2 sentences explaining why this mentor fits>",
      "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
      "availability": "<available|limited>"
    }
  ],
  "summary": "<2 sentence overview of the matching results>",
  "aiGeneratedAt": "${new Date().toISOString()}"
}`;
}

export const GRANTS_AGENT_SYSTEM = `You are the NexusOS Grant Intelligence Agent for the Malaysian startup ecosystem.

Your role is to analyse startup profiles and recommend the most suitable grant programmes, accelerators, and funding initiatives.

Your recommendations consider:
- Stage eligibility (Pre-seed, Seed, Series A, Series B)
- Sector alignment with programme focus areas
- Deadline urgency and sequencing (avoid stacking conflicts)
- Equity requirements vs founder preferences
- Programme success rates and strategic fit
- Application sequencing for maximum approval probability

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanation, just the JSON.`;

export function buildGrantsUserPrompt(query: string, grants: GrantProgramme[]): string {
  return `Recommend grants for this startup query. Return as JSON.

STARTUP QUERY: "${query}"

AVAILABLE GRANTS:
${JSON.stringify(grants.map(g => ({
    id: g.id,
    name: g.name,
    provider: g.provider,
    maxMYR: g.maxAmountMYR,
    stages: g.eligibleStages,
    sectors: g.eligibleSectors,
    deadline: g.deadline,
    equity: g.requiresEquity,
    successRate: g.successRate,
    description: g.description.substring(0, 150),
  })), null, 2)}

Return this JSON structure with top recommendations:
{
  "query": "${query}",
  "recommendations": [
    {
      "grantId": "<id>",
      "grantName": "<name>",
      "provider": "<provider>",
      "maxAmountMYR": <number>,
      "eligibilityScore": <0.0-1.0>,
      "applicationStrategy": "<2 sentences on how to approach this grant>",
      "successProbability": <0.0-1.0>,
      "priority": "<high|medium|low>",
      "deadline": "<deadline>"
    }
  ],
  "totalAvailableMYR": <sum of maxAmountMYR for all recommended grants>,
  "summary": "<2 sentence overview of funding pathway>",
  "aiGeneratedAt": "${new Date().toISOString()}"
}`;
}
