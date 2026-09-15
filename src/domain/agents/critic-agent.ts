import type { ResearchReport } from "@/domain/research";
import type { ArtDirectionDecision, GeneratedAsset, Review, Shot } from "@/domain/schemas";
import type { AgentContext, AgentResult } from "./types";

export interface CriticRequest {
  subjectId: string;
  shot: Shot;
  generatedAssets: GeneratedAsset[];
  decisions: ArtDirectionDecision[];
  researchReport?: ResearchReport;
  reviewConstraints?: string[];
}

export interface CriticAgent {
  critique(request: CriticRequest, context: AgentContext): Promise<AgentResult<Review[]>>;
}
