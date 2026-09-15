import type { ResearchAgent, ResearchRequest } from "@/domain/agents";
import type { AgentContext, AgentResult } from "@/domain/agents";
import { MockResearchProvider, type ResearchProvider } from "@/domain/providers";
import { researchReportSchema, type ResearchReport } from "@/domain/research";

export class MockResearchAgent implements ResearchAgent {
  constructor(private readonly researchProvider: ResearchProvider = new MockResearchProvider()) {}

  async research(request: ResearchRequest, context: AgentContext): Promise<AgentResult<ResearchReport>> {
    const report = request.existingReports?.find((candidate) => candidate.subjectId === request.subject.id);
    if (!report) {
      throw new Error(`MockResearchAgent requires an existing report for subject ${request.subject.id}.`);
    }

    const providerResult = await this.researchProvider.research({
      subject: request.subject,
      instructions: request.scope,
      context: { requestId: context.requestId, metadata: context.metadata },
    });
    const data = researchReportSchema.parse(report);
    return {
      data,
      reasoning: {
        explanation: "Obtained raw mock provider input, then returned the existing validated mock research report; no external research or AI inference was performed.",
        assumptions: ["The supplied existing report is the approved fixture for this demonstration."],
        uncertainties: ["All fixture claims and sources remain mock/sample content."],
        evidenceIds: [...data.sources.map((source) => source.id), ...providerResult.references.map((reference) => reference.id)],
      },
      confidence: data.overallConfidence,
      warnings: ["MockResearchAgent uses fixture data only and does not verify claims."],
      metadata: { implementation: "mock", requestId: context.requestId ?? "not-provided", claimCount: data.claims.length, sourceCount: data.sources.length, providerReferenceCount: providerResult.references.length },
    };
  }
}
