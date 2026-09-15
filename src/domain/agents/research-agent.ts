import type { ResearchReport, ResearchSource } from "@/domain/research";
import type { Subject } from "@/domain/schemas";
import type { AgentContext, AgentResult } from "./types";

export interface ResearchRequest {
  subject: Pick<Subject, "id" | "name" | "description">;
  sourceCandidates?: ResearchSource[];
  existingReports?: ResearchReport[];
  scope?: string[];
}

/** A concrete implementation may obtain raw input from a ResearchProvider, then validates and creates the ResearchReport itself. */
export interface ResearchAgent {
  research(request: ResearchRequest, context: AgentContext): Promise<AgentResult<ResearchReport>>;
}
