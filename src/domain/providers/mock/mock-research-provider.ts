import type { ResearchProvider, ResearchProviderRequest, ResearchProviderResult } from "@/domain/providers";

export class MockResearchProvider implements ResearchProvider {
  async research(request: ResearchProviderRequest): Promise<ResearchProviderResult> {
    return {
      rawResearch: [`Mock/sample provider input for ${request.subject.name}; no external research was requested or performed.`],
      references: [{ id: `mock-provider-source-${request.subject.id}`, title: "Mock provider reference", url: "https://example.com/mock-provider-reference", citation: "Placeholder reference for provider-contract demonstration only." }],
      metadata: { implementation: "mock", subjectId: request.subject.id, instructionCount: request.instructions?.length ?? 0 },
      usage: { totalUnits: 0 },
    };
  }
}
