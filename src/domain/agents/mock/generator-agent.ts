import type { GeneratorAgent } from "@/domain/agents";
import type { AgentContext, AgentResult } from "@/domain/agents";
import { generatedAssetSchema, generationAttemptSchema, generationRequestSchema, promptArtifactSchema, type GenerationOutput, type GenerationRequest } from "@/domain/generation";

export class MockGenerationAgent implements GeneratorAgent {
  async generate(request: GenerationRequest, context: AgentContext): Promise<AgentResult<GenerationOutput>> {
    const generationRequest = generationRequestSchema.parse(request);
    const attempt = generationAttemptSchema.parse({
      id: `mock-attempt-${generationRequest.id}-1`,
      generationRequestId: generationRequest.id,
      attemptNumber: 1,
      changesFromPrevious: "Initial mock attempt from the supplied generation request.",
      createdAt: generationRequest.createdAt,
    });
    const promptArtifact = promptArtifactSchema.parse({
      id: `mock-prompt-${generationRequest.id}-1`,
      shotId: generationRequest.shotId,
      version: 1,
      prompt: generationRequest.prompt,
      reason: "Mock prompt artifact preserved from the supplied generation request.",
      createdAt: generationRequest.createdAt,
    });
    const asset = generatedAssetSchema.parse({
      id: `mock-asset-${generationRequest.id}-1`,
      shotId: generationRequest.shotId,
      generationRequestId: generationRequest.id,
      attemptId: attempt.id,
      uri: `mock://generated/${generationRequest.id}/1`,
      metadata: { implementation: "mock", provider: generationRequest.provider, promptVersion: promptArtifact.version },
      status: "draft",
      evaluationIds: [],
    });

    return {
      data: { attempt, asset, promptArtifact },
      reasoning: {
        explanation: "Created a validated mock generation attempt, prompt artifact, and draft asset without contacting an external provider.",
        assumptions: ["The supplied prompt is an approved artifact for this mock attempt."],
        uncertainties: ["The mock URI does not represent a real generated image."],
        evidenceIds: [generationRequest.shotId, generationRequest.id],
      },
      confidence: { level: "mock", score: 1, rationale: "The output is deterministically derived from the supplied request." },
      warnings: ["MockGenerationAgent does not generate, upload, or inspect an image."],
      metadata: { implementation: "mock", requestId: context.requestId ?? "not-provided", attemptNumber: attempt.attemptNumber },
    };
  }
}
