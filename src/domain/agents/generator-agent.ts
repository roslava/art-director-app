import type { GenerationOutput, GenerationRequest, PromptArtifact } from "@/domain/generation";
import type { AgentContext, AgentResult } from "./types";

export interface GenerationPreparationRequest {
  id: string;
  shotId: string;
  provider: string;
  prompt: string;
  negativePrompt?: string;
  parameters?: GenerationRequest["parameters"];
  createdAt: string;
  reason: string;
}

export interface GenerationPreparationOutput {
  request: GenerationRequest;
  promptArtifact: PromptArtifact;
}

/**
 * A GeneratorAgent owns domain request and prompt-artifact preparation.
 * A concrete implementation delegates image execution to an ImageProvider.
 */
export interface GeneratorAgent {
  prepare(request: GenerationPreparationRequest, context: AgentContext): Promise<AgentResult<GenerationPreparationOutput>>;
  generate(request: GenerationRequest, context: AgentContext): Promise<AgentResult<GenerationOutput>>;
}
