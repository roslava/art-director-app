import { runChrysoberylMockPipeline } from "./example";

export interface MockPipelineDemoSummary {
  input: string;
  researchClaimCount: number;
  decisionCount: number;
  shotCount: number;
  confidenceSummary: string[];
}

export const runMockPipelineDemo = async (): Promise<MockPipelineDemoSummary> => {
  const result = await runChrysoberylMockPipeline();
  return {
    input: "Chrysoberyl",
    researchClaimCount: result.outputs.researchReport?.claims.length ?? 0,
    decisionCount: result.outputs.decisions?.length ?? 0,
    shotCount: result.outputs.shotPlan?.shots.length ?? 0,
    confidenceSummary: Object.entries(result.confidence).map(([agent, confidence]) => `${agent}: ${confidence.level}`),
  };
};
