import type { z } from "zod";
import type { generatedAssetSchema, generationAttemptSchema, generationRequestSchema, promptArtifactSchema } from "./schemas";

export type GenerationRequest = z.infer<typeof generationRequestSchema>;
export type GenerationAttempt = z.infer<typeof generationAttemptSchema>;
export type GeneratedAsset = z.infer<typeof generatedAssetSchema>;
export type PromptArtifact = z.infer<typeof promptArtifactSchema>;

export interface GenerationOutput {
  attempt: GenerationAttempt;
  asset: GeneratedAsset;
  promptArtifact: PromptArtifact;
}
