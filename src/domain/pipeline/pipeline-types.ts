import type { ArtDirectorAgent, ResearchAgent, ShotPlannerAgent } from "@/domain/agents";
import type { AgentApproval, AgentConfidence, AgentContext, AgentMetadataValue, AgentReasoning } from "@/domain/agents";
import type { ResearchReport } from "@/domain/research";
import type { ArtDirectionDecision, ProductionTechnique, Project, ShotPlan, Subject, VisualGoal } from "@/domain/schemas";

export type PipelineCheckpoint = "research" | "decisions";

export interface PipelineApprovalCheckpoint {
  approvalRequired: boolean;
  approval?: AgentApproval;
  reviewRecordIds?: string[];
}

export interface PipelineContinuation {
  previousExecutionId: string;
  approvedCheckpoint: PipelineCheckpoint;
  reviewRecordIds?: string[];
}

export interface PipelineExecutionMetadata {
  id: string;
  startedAt?: string;
  metadata?: Record<string, AgentMetadataValue>;
}

export interface PipelineContext {
  agentContext: AgentContext;
  subject: Subject;
  project?: Pick<Project, "id" | "name" | "description">;
  execution: PipelineExecutionMetadata;
  approvalCheckpoints?: Partial<Record<PipelineCheckpoint, PipelineApprovalCheckpoint>>;
  continuation?: PipelineContinuation;
}

export interface PipelineAgents {
  research: { name: string; agent: ResearchAgent };
  artDirector: { name: string; agent: ArtDirectorAgent };
  shotPlanner: { name: string; agent: ShotPlannerAgent };
}

export interface PipelineKnowledge {
  visualGoals: VisualGoal[];
  productionTechniques: ProductionTechnique[];
}

export interface PipelineStep {
  agentName: string;
  inputSummary: string;
  outputSummary: string;
  reasoning: AgentReasoning;
  confidence: AgentConfidence;
  warnings: string[];
  approvalRequired: boolean;
  approval?: AgentApproval;
  reviewReferences?: string[];
  resultMetadata?: Record<string, AgentMetadataValue>;
}

export interface PipelineOutputs {
  researchReport?: ResearchReport;
  decisions?: ArtDirectionDecision[];
  shotPlan?: ShotPlan;
}

export interface PipelineApprovalState {
  status: string;
  pendingCheckpoint?: PipelineCheckpoint;
  checkpoints: Partial<Record<PipelineCheckpoint, PipelineApprovalCheckpoint>>;
  continuation?: PipelineContinuation;
}

export interface PipelineRunResult {
  executionId: string;
  subjectId: string;
  status: "completed" | "awaiting-approval";
  steps: PipelineStep[];
  outputs: PipelineOutputs;
  agentReasoning: Array<{ agentName: string; reasoning: AgentReasoning }>;
  confidence: Record<string, AgentConfidence>;
  warnings: string[];
  approval: PipelineApprovalState;
  continuation?: PipelineContinuation;
  executionMetadata?: Record<string, AgentMetadataValue>;
}
