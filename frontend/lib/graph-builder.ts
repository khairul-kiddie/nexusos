import type { EcosystemGraph, GraphNode, GraphEdge } from "@/lib/types";
import { MOCK_STARTUPS } from "@/data/mock/startups";
import { MOCK_MENTORS } from "@/data/mock/mentors";
import { MOCK_GRANTS } from "@/data/mock/grants";

const BROAD_ELIGIBILITY = [
  "All tech sectors",
  "All sectors with social impact potential",
  "All sectors",
];

export function buildEcosystemGraph(): EcosystemGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let counter = 0;
  const nextId = () => `e-${String(++counter).padStart(3, "0")}`;

  for (const s of MOCK_STARTUPS) {
    nodes.push({
      id: s.id,
      type: "startup",
      label: s.name,
      data: { sector: s.sector, stage: s.stage, location: s.location, teamSize: s.teamSize },
    });
  }

  for (const m of MOCK_MENTORS) {
    nodes.push({
      id: m.id,
      type: "mentor",
      label: m.name,
      data: { sectors: m.sectors, trustScore: m.trustScore, availability: m.availability, location: m.location },
    });
  }

  const providerToAgencyId = new Map<string, string>();
  for (const g of MOCK_GRANTS) {
    nodes.push({
      id: g.id,
      type: "programme",
      label: g.name,
      data: { provider: g.provider, maxAmountMYR: g.maxAmountMYR, eligibleStages: g.eligibleStages, successRate: g.successRate },
    });

    if (!providerToAgencyId.has(g.provider)) {
      const agencyId = `agency-${g.id}`;
      providerToAgencyId.set(g.provider, agencyId);
      const shortName = g.provider.replace(/\s*\([^)]+\)\s*$/, "").replace(/\s*\/.*$/, "").trim();
      nodes.push({
        id: agencyId,
        type: "agency",
        label: shortName,
        data: { fullName: g.provider },
      });
    }
  }

  // Startup → Mentor: sector overlap and mentor not at full capacity
  for (const s of MOCK_STARTUPS) {
    for (const m of MOCK_MENTORS) {
      if (m.sectors.includes(s.sector) && m.availability !== "full") {
        edges.push({
          id: nextId(),
          source: s.id,
          target: m.id,
          type: "MATCHED_WITH",
          label: `${(m.trustScore * 100).toFixed(0)}% trust`,
          weight: m.trustScore,
        });
      }
    }
  }

  // Startup → Grant: stage and sector eligibility
  for (const s of MOCK_STARTUPS) {
    for (const g of MOCK_GRANTS) {
      const stageMatch = g.eligibleStages.includes(s.stage);
      const sectorMatch = g.eligibleSectors.some(
        sec => BROAD_ELIGIBILITY.includes(sec) || sec === s.sector || sec.includes(s.sector),
      );
      if (stageMatch && sectorMatch) {
        edges.push({
          id: nextId(),
          source: s.id,
          target: g.id,
          type: "ELIGIBLE_FOR",
          label: `MYR ${(g.maxAmountMYR / 1_000).toFixed(0)}K`,
          weight: g.successRate,
        });
      }
    }
  }

  // Programme → Agency: administered-by relationship
  for (const g of MOCK_GRANTS) {
    const agencyId = providerToAgencyId.get(g.provider);
    if (agencyId) {
      edges.push({
        id: nextId(),
        source: g.id,
        target: agencyId,
        type: "SUPPORTED_BY",
        label: "administered by",
        weight: 1,
      });
    }
  }

  return { nodes, edges };
}

export interface GraphInsights {
  strongestEdge: { label: string; score: string };
  bestGrant: { label: string; score: string };
  keyBridgeNode: { label: string; detail: string };
}

export function deriveGraphInsights(graph: EcosystemGraph): GraphInsights {
  const nodeById = new Map(graph.nodes.map(n => [n.id, n]));

  const topMatch = graph.edges
    .filter(e => e.type === "MATCHED_WITH")
    .sort((a, b) => b.weight - a.weight)[0];

  const strongestEdge = topMatch
    ? {
        label: `${nodeById.get(topMatch.source)?.label ?? "?"} → ${nodeById.get(topMatch.target)?.label ?? "?"}`,
        score: `${(topMatch.weight * 100).toFixed(0)}%`,
      }
    : { label: "—", score: "—" };

  const topGrantEdge = graph.edges
    .filter(e => e.type === "ELIGIBLE_FOR")
    .sort((a, b) => b.weight - a.weight)[0];

  const bestGrant = topGrantEdge
    ? {
        label: nodeById.get(topGrantEdge.target)?.label ?? "—",
        score: `${(topGrantEdge.weight * 100).toFixed(0)}%`,
      }
    : { label: "—", score: "—" };

  const mentorNodes = graph.nodes.filter(n => n.type === "mentor");
  const topMentor = mentorNodes
    .map(n => ({ node: n, degree: graph.edges.filter(e => e.source === n.id || e.target === n.id).length }))
    .sort((a, b) => b.degree - a.degree)[0];

  const keyBridgeNode = topMentor
    ? { label: topMentor.node.label, detail: `${topMentor.degree} connections` }
    : { label: "—", detail: "—" };

  return { strongestEdge, bestGrant, keyBridgeNode };
}
