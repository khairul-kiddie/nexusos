export interface StartupData {
  id: string;
  name: string;
  sector: string;
  stage: string;
  description: string;
  location: string;
  teamSize: number;
  foundedYear: number;
  fundingRaisedMYR: number;
  targetMarkets: string[];
  techStack: string[];
  revenue?: string;
}

export interface MentorProfile {
  id: string;
  name: string;
  expertise: string[];
  sectors: string[];
  yearsExperience: number;
  currentMenteeCount: number;
  maxMenteeCapacity: number;
  trustScore: number;
  successfulExits: number;
  languages: string[];
  location: string;
  availability: "available" | "limited" | "full";
}

export interface GrantProgramme {
  id: string;
  name: string;
  provider: string;
  maxAmountMYR: number;
  eligibleStages: string[];
  eligibleSectors: string[];
  deadline: string;
  requiresEquity: boolean;
  description: string;
  successRate: number;
}

export interface EcosystemEvent {
  id: string;
  type: "match" | "grant" | "alert" | "connection" | "programme" | "insight" | "memory" | "graph";
  message: string;
  entityId?: string;
  timestamp: string;
}

export interface EcosystemStats {
  totalStartups: number;
  activeMentors: number;
  programmesAvailable: number;
  connectionsFormed: number;
  grantsDisbursed: number;
  successfulExits: number;
  totalFundingMYR: number;
  monthlyGrowthRate: number;
  summary: string;
  aiGeneratedAt: string;
}

export interface MentorMatch {
  mentorId: string;
  mentorName: string;
  compatibilityScore: number;
  matchReason: string;
  keyStrengths: string[];
  availability: string;
}

export interface GrantRecommendation {
  grantId: string;
  grantName: string;
  provider: string;
  maxAmountMYR: number;
  eligibilityScore: number;
  applicationStrategy: string;
  successProbability: number;
  priority: "high" | "medium" | "low";
  deadline: string;
}

export interface HealthDimension {
  name: string;
  score: number;
  trend: "improving" | "stable" | "declining";
  insight: string;
}

export interface EcosystemGovernanceAlert {
  alertId: string;
  type: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affectedEntities: string[];
  recommendation: string;
  impactScore: number;
}

export interface EcosystemHealth {
  overallScore: number;
  dimensions: HealthDimension[];
  alerts: EcosystemGovernanceAlert[];
  sectorCoverage: Record<string, number>;
  monthlyTrends: Record<string, number>;
  narrative: string;
  aiGeneratedAt: string;
}

export interface ActivityItem {
  id: string;
  type: "match" | "grant" | "alert" | "connection" | "programme" | "insight" | "memory" | "graph";
  message: string;
  time: string;
  icon: string;
}

export interface MatchingResult {
  query: string;
  matches: MentorMatch[];
  summary: string;
  aiGeneratedAt: string;
}

export interface GrantsResult {
  query: string;
  recommendations: GrantRecommendation[];
  totalAvailableMYR: number;
  summary: string;
  aiGeneratedAt: string;
}
