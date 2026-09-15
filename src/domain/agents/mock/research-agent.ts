import type { ResearchAgent, ResearchRequest } from "@/domain/agents";
import type { AgentContext, AgentResult } from "@/domain/agents";
import { researchReportSchema, type ResearchReport } from "@/domain/research";

export class MockResearchAgent implements ResearchAgent {
  async research(request: ResearchRequest, context: AgentContext): Promise<AgentResult<ResearchReport>> {
    const report = request.existingReports?.find((candidate) => candidate.subjectId === request.subject.id);
    if (!report) {
      throw new Error(`MockResearchAgent requires an existing report for subject ${request.subject.id}.`);
    }

    const data = researchReportSchema.parse(report);
    return {
      data,
      reasoning: {
        explanation: "Returned the existing mock research report after validating its domain shape; no external research or AI inference was performed.",
        assumptions: ["The supplied existing report is the approved fixture for this demonstration."],
        uncertainties: ["All fixture claims and sources remain mock/sample content."],
        evidenceIds: data.sources.map((source) => source.id),
      },
      confidence: data.overallConfidence,
      warnings: ["MockResearchAgent uses fixture data only and does not verify claims."],
      metadata: { implementation: "mock", requestId: context.requestId ?? "not-provided", claimCount: data.claims.length, sourceCount: data.sources.length },
    };
  }
}
