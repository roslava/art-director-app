import type { ArtDirectionDecision, ProductionTechnique, ShotPlan, Subject, VisualGoal } from "@/domain/schemas";
import type { AgentContext, AgentResult } from "./types";

export interface ShotPlanningRequest {
  subject: Pick<Subject, "id" | "name" | "description">;
  decisions: ArtDirectionDecision[];
  availableVisualGoals: VisualGoal[];
  availableTechniques: ProductionTechnique[];
  existingShotPlan?: ShotPlan;
  planningConstraints?: string[];
}

export interface ShotPlannerAgent {
  createShotPlan(request: ShotPlanningRequest, context: AgentContext): Promise<AgentResult<ShotPlan>>;
}
