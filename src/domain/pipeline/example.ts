import { MockArtDirectorAgent, MockResearchAgent, MockShotPlannerAgent } from "@/domain/agents/mock";
import { productionTechniques, visualGoals } from "@/domain/knowledge";
import { samotsvetyProject } from "@/domain/mock-data";
import { AgentPipeline } from "./pipeline";
import type { PipelineRunResult } from "./pipeline-types";

const createMockPipeline = () => new AgentPipeline({
  research: { name: "MockResearchAgent", agent: new MockResearchAgent() },
  artDirector: { name: "MockArtDirectorAgent", agent: new MockArtDirectorAgent() },
  shotPlanner: { name: "MockShotPlannerAgent", agent: new MockShotPlannerAgent() },
}, { visualGoals, productionTechniques });

export const runMockPipelineForSubject = async (subjectId: string, executionId: string): Promise<PipelineRunResult> => {
  const subject = samotsvetyProject.subjects.find((candidate) => candidate.id === subjectId);
  if (!subject) {
    throw new Error(`The mock subject ${subjectId} is unavailable.`);
  }

  const pipeline = createMockPipeline();

  return pipeline.run({
    agentContext: {
      requestId: executionId,
      projectId: samotsvetyProject.id,
      subjectId: subject.id,
      instructions: ["Run the fixture-only agent pipeline without external research or generation."],
      metadata: { executionMode: "mock" },
    },
    subject,
    project: { id: samotsvetyProject.id, name: samotsvetyProject.name, description: samotsvetyProject.description },
    execution: {
      id: executionId,
      metadata: { executionMode: "mock", fixture: subject.id },
    },
    approvalCheckpoints: {
      research: { approvalRequired: false },
      decisions: { approvalRequired: false },
    },
  });
};

export const runChrysoberylMockPipeline = (): Promise<PipelineRunResult> => runMockPipelineForSubject("subject-chrysoberyl", "pipeline-run-chrysoberyl-mock");
export const runMookaiteMockPipeline = (): Promise<PipelineRunResult> => runMockPipelineForSubject("subject-mookaite", "pipeline-run-mookaite-mock");
