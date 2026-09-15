import type { EvaluationCriterion, EvaluationResult } from "@/domain/evaluation";
import type { ResearchReport } from "@/domain/research";
import type { ArtDirectionDecision, GeneratedAsset, Shot } from "@/domain/schemas";
import type { AgentContext, AgentResult } from "./types";

export interface CriticRequest {
  subjectId: string;
  shot: Shot;
  generatedAssets: GeneratedAsset[];
  decisions: ArtDirectionDecision[];
  researchReport?: ResearchReport;
  evaluationCriteria?: EvaluationCriterion[];
  reviewConstraints?: string[];
}

export interface CriticAgent {
  critique(request: CriticRequest, context: AgentContext): Promise<AgentResult<EvaluationResult[]>>;
}
