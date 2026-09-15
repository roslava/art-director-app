import { MockArtDirectorAgent, MockResearchAgent, MockShotPlannerAgent } from "@/domain/agents/mock";
import { productionTechniques, visualGoals } from "@/domain/knowledge";
import { samotsvetyProject } from "@/domain/mock-data";
import { AgentPipeline } from "./pipeline";
import type { PipelineRunResult } from "./pipeline-types";

export const runChrysoberylMockPipeline = async (): Promise<PipelineRunResult> => {
  const subject = samotsvetyProject.subjects.find((candidate) => candidate.id === "subject-chrysoberyl");
  if (!subject) {
    throw new Error("The Chrysoberyl mock subject is unavailable.");
  }

  const pipeline = new AgentPipeline({
    research: { name: "MockResearchAgent", agent: new MockResearchAgent() },
    artDirector: { name: "MockArtDirectorAgent", agent: new MockArtDirectorAgent() },
    shotPlanner: { name: "MockShotPlannerAgent", agent: new MockShotPlannerAgent() },
  }, { visualGoals, productionTechniques });

  return pipeline.run({
    agentContext: {
      requestId: "mock-pipeline-chrysoberyl",
      projectId: samotsvetyProject.id,
      subjectId: subject.id,
      instructions: ["Run the fixture-only agent pipeline without external research or generation."],
      metadata: { executionMode: "mock" },
    },
    subject,
    project: { id: samotsvetyProject.id, name: samotsvetyProject.name, description: samotsvetyProject.description },
    execution: {
      id: "pipeline-run-chrysoberyl-mock",
      metadata: { executionMode: "mock", fixture: "chrysoberyl" },
    },
    approvalCheckpoints: {
      research: { approvalRequired: false },
      decisions: { approvalRequired: false },
    },
  });
};
