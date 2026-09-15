import type { ArtDirectionRequest, ArtDirectorAgent } from "@/domain/agents";
import type { AgentContext, AgentResult } from "@/domain/agents";
import { artDirectionDecisionSchema, type ArtDirectionDecision } from "@/domain/schemas";

export class MockArtDirectorAgent implements ArtDirectorAgent {
  async createDecisions(request: ArtDirectionRequest, context: AgentContext): Promise<AgentResult<ArtDirectionDecision[]>> {
    const decisions = (request.existingDecisions ?? []).map((decision) => artDirectionDecisionSchema.parse(decision));
    if (decisions.length === 0) {
      throw new Error(`MockArtDirectorAgent requires existing decisions for subject ${request.subjectId}.`);
    }

    const goalIds = new Set(request.availableVisualGoals.map((goal) => goal.id));
    const techniqueIds = new Set(request.availableTechniques.map((technique) => technique.id));
    const missingReferences = decisions.flatMap((decision) => [
      ...decision.selectedVisualGoalIds.filter((id) => !goalIds.has(id)),
      ...decision.selectedTechniqueIds.filter((id) => !techniqueIds.has(id)),
    ]);

    return {
      data: decisions,
      reasoning: {
        explanation: "Returned existing mock art-direction decisions after checking their selected goals and techniques against the supplied knowledge library.",
        assumptions: ["The supplied research report and existing decisions describe the same demonstration subject."],
        uncertainties: ["The decisions inherit the mock/sample confidence of their research inputs."],
        evidenceIds: request.researchReport.claims.map((claim) => claim.id),
      },
      confidence: { level: "needs-review", score: 0.5, rationale: "Mock decisions are fixture data, not new visual reasoning." },
      warnings: missingReferences.length > 0 ? [`Mock decisions contain ${missingReferences.length} reference(s) absent from the supplied knowledge library.`] : ["MockArtDirectorAgent uses fixture decisions only and does not make new selections."],
      metadata: { implementation: "mock", requestId: context.requestId ?? "not-provided", decisionCount: decisions.length, missingReferenceCount: missingReferences.length },
    };
  }
}
