import type { ShotPlannerAgent, ShotPlanningRequest } from "@/domain/agents";
import type { AgentContext, AgentResult } from "@/domain/agents";
import { shotPlanSchema, type ShotPlan } from "@/domain/schemas";

export class MockShotPlannerAgent implements ShotPlannerAgent {
  async createShotPlan(request: ShotPlanningRequest, context: AgentContext): Promise<AgentResult<ShotPlan>> {
    if (!request.existingShotPlan) {
      throw new Error(`MockShotPlannerAgent requires an existing shot plan for subject ${request.subject.id}.`);
    }

    const data = shotPlanSchema.parse(request.existingShotPlan);
    const decisionIds = new Set(request.decisions.map((decision) => decision.id));
    const unlinkedShots = data.shots.filter((shot) => !shot.artDirectionDecisionIds.some((id) => decisionIds.has(id)));

    return {
      data,
      reasoning: {
        explanation: "Returned the existing mock shot plan after validating that shots can trace back to the supplied mock decisions.",
        assumptions: ["The existing shot plan is the intended fixture output for this subject."],
        uncertainties: ["No new shots, prompts, or production choices were generated."],
        evidenceIds: request.decisions.map((decision) => decision.id),
      },
      confidence: { level: "needs-review", score: 0.5, rationale: "Mock shot planning preserves fixture content only." },
      warnings: unlinkedShots.length > 0 ? [`${unlinkedShots.length} shot(s) are not linked to supplied decisions.`] : ["MockShotPlannerAgent uses fixture shots only and does not create new plans."],
      metadata: { implementation: "mock", requestId: context.requestId ?? "not-provided", shotCount: data.shots.length, unlinkedShotCount: unlinkedShots.length },
    };
  }
}
