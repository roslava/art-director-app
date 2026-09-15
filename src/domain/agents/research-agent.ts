import type { ResearchReport, ResearchSource } from "@/domain/research";
import type { Subject } from "@/domain/schemas";
import type { AgentContext, AgentResult } from "./types";

export interface ResearchRequest {
  subject: Pick<Subject, "id" | "name" | "description">;
  sourceCandidates?: ResearchSource[];
  existingReports?: ResearchReport[];
  scope?: string[];
}

export interface ResearchAgent {
  research(request: ResearchRequest, context: AgentContext): Promise<AgentResult<ResearchReport>>;
}
