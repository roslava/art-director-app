import type { GenerationOutput, GenerationRequest } from "@/domain/generation";
import type { AgentContext, AgentResult } from "./types";

export interface GeneratorAgent {
  generate(request: GenerationRequest, context: AgentContext): Promise<AgentResult<GenerationOutput>>;
}
