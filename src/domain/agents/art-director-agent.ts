import type { ResearchReport } from "@/domain/research";
import type { ArtDirectionDecision, ProductionTechnique, VisualGoal } from "@/domain/schemas";
import type { AgentContext, AgentResult } from "./types";

export interface ArtDirectionRequest {
  subjectId: string;
  researchReport: ResearchReport;
  availableVisualGoals: VisualGoal[];
  availableTechniques: ProductionTechnique[];
  existingDecisions?: ArtDirectionDecision[];
  directionConstraints?: string[];
}

export interface ArtDirectorAgent {
  createDecisions(request: ArtDirectionRequest, context: AgentContext): Promise<AgentResult<ArtDirectionDecision[]>>;
}
