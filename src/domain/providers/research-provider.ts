import type { Subject } from "@/domain/schemas";
import type { ProviderContext, ProviderMetadataValue, ProviderResearchReference, ProviderUsage } from "./types";

export interface ResearchProviderRequest {
  subject: Pick<Subject, "id" | "name" | "description">;
  instructions?: string[];
  context?: ProviderContext;
}

export interface ResearchProviderResult {
  rawResearch: string[];
  references: ProviderResearchReference[];
  metadata: Record<string, ProviderMetadataValue>;
  usage?: ProviderUsage;
}

export interface ResearchProvider {
  research(request: ResearchProviderRequest): Promise<ResearchProviderResult>;
}
