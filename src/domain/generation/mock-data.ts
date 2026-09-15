import { generatedAssetSchema, generationAttemptSchema, generationRequestSchema, promptArtifactSchema } from "./schemas";
import type { GeneratedAsset, GenerationAttempt, GenerationRequest, PromptArtifact } from "./types";

const createdAt = "2026-09-15T11:00:00.000Z";

export const mockChrysoberylTranslucencyGenerationRequest: GenerationRequest = generationRequestSchema.parse({
  id: "generation-request-chrysoberyl-translucency-mock",
  shotId: "shot-translucency",
  provider: "mock-generator",
  prompt: "Mock/sample backlit translucency study with restrained edge transmission and readable opaque bulk.",
  negativePrompt: "uniform glass-like transparency, excessive glow, clipped highlights",
  parameters: { aspectRatio: "3:2", guidance: "restrained", transmittedLight: "moderate" },
  status: "completed",
  createdAt,
});

export const mockChrysoberylTranslucencyAttempt: GenerationAttempt = generationAttemptSchema.parse({
  id: "generation-attempt-chrysoberyl-translucency-mock-1",
  generationRequestId: mockChrysoberylTranslucencyGenerationRequest.id,
  attemptNumber: 1,
  changesFromPrevious: "Initial mock attempt from the shot's current prompt and transmitted-light direction.",
  createdAt,
});

export const mockChrysoberylTranslucencyPromptArtifact: PromptArtifact = promptArtifactSchema.parse({
  id: "prompt-artifact-chrysoberyl-translucency-mock-1",
  shotId: "shot-translucency",
  version: 1,
  prompt: mockChrysoberylTranslucencyGenerationRequest.prompt,
  reason: "Mock/sample prompt artifact created from the existing translucency shot.",
  createdAt,
});

export const mockChrysoberylTranslucencyAsset: GeneratedAsset = generatedAssetSchema.parse({
  id: "asset-chrysoberyl-translucency-mock",
  shotId: "shot-translucency",
  generationRequestId: mockChrysoberylTranslucencyGenerationRequest.id,
  attemptId: mockChrysoberylTranslucencyAttempt.id,
  uri: "mock://generated/chrysoberyl-translucency-1",
  metadata: { implementation: "mock", width: 2400, height: 1600, colorSpace: "sRGB" },
  status: "draft",
  evaluationIds: ["evaluation-chrysoberyl-translucency-mock"],
});
