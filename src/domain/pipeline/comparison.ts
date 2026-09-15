import type { PipelineRunResult } from "./pipeline-types";
import { runChrysoberylMockPipeline, runMookaiteMockPipeline } from "./example";

export interface DomainIntelligenceSubjectSummary {
  subject: string;
  selectedGoals: string[];
  selectedTechniques: string[];
  shotCount: number;
  majorRisks: string[];
}

export interface DomainIntelligenceComparison {
  subjects: DomainIntelligenceSubjectSummary[];
}

const unique = (values: string[]) => [...new Set(values)];

const summarize = (subject: string, result: PipelineRunResult): DomainIntelligenceSubjectSummary => ({
  subject,
  selectedGoals: unique(result.outputs.decisions?.flatMap((decision) => decision.selectedVisualGoalIds) ?? []),
  selectedTechniques: unique(result.outputs.decisions?.flatMap((decision) => decision.selectedTechniqueIds) ?? []),
  shotCount: result.outputs.shotPlan?.shots.length ?? 0,
  majorRisks: unique(result.outputs.decisions?.flatMap((decision) => decision.risks) ?? []),
});

export const runDomainIntelligenceComparison = async (): Promise<DomainIntelligenceComparison> => {
  const [chrysoberyl, mookaite] = await Promise.all([runChrysoberylMockPipeline(), runMookaiteMockPipeline()]);
  return { subjects: [summarize("Chrysoberyl", chrysoberyl), summarize("Mookaite", mookaite)] };
};
