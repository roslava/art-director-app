import type { GeneratorAgent } from "@/domain/agents";
import type { GenerationPreparationOutput, GenerationPreparationRequest } from "@/domain/agents";
import type { AgentContext, AgentResult } from "@/domain/agents";
import { generatedAssetSchema, generationAttemptSchema, generationRequestSchema, promptArtifactSchema, type GenerationOutput, type GenerationRequest } from "@/domain/generation";
import { MockImageProvider, type ImageProvider } from "@/domain/providers";

export class MockGenerationAgent implements GeneratorAgent {
  constructor(private readonly imageProvider: ImageProvider = new MockImageProvider()) {}

  async prepare(request: GenerationPreparationRequest, context: AgentContext): Promise<AgentResult<GenerationPreparationOutput>> {
    const generationRequest = generationRequestSchema.parse({
      id: request.id,
      shotId: request.shotId,
      provider: request.provider,
      prompt: request.prompt,
      negativePrompt: request.negativePrompt,
      parameters: request.parameters ?? {},
      status: "prepared",
      createdAt: request.createdAt,
    });
    const promptArtifact = promptArtifactSchema.parse({
      id: `mock-prompt-${generationRequest.id}-1`,
      shotId: generationRequest.shotId,
      version: 1,
      prompt: generationRequest.prompt,
      reason: request.reason,
      createdAt: generationRequest.createdAt,
    });
    return {
      data: { request: generationRequest, promptArtifact },
      reasoning: {
        explanation: "Prepared a validated generation request and versioned prompt artifact without executing image generation.",
        assumptions: ["The supplied prompt is appropriate for preparation in this mock workflow."],
        uncertainties: ["No external provider has been invoked during preparation."],
        evidenceIds: [generationRequest.shotId, generationRequest.id],
      },
      confidence: { level: "mock", score: 1, rationale: "Preparation is deterministically derived from the supplied input." },
      warnings: ["MockGenerationAgent preparation does not create an image."],
      metadata: { implementation: "mock", requestId: context.requestId ?? "not-provided", promptVersion: promptArtifact.version },
    };
  }

  async generate(request: GenerationRequest, context: AgentContext): Promise<AgentResult<GenerationOutput>> {
    const generationRequest = generationRequestSchema.parse(request);
    const providerResult = await this.imageProvider.generate({
      prompt: generationRequest.prompt,
      negativePrompt: generationRequest.negativePrompt,
      parameters: generationRequest.parameters,
      metadata: { generationRequestId: generationRequest.id, shotId: generationRequest.shotId },
      context: { requestId: context.requestId, metadata: context.metadata },
    });
    const image = providerResult.images[0];
    if (!image) {
      throw new Error(`Image provider returned no image reference for generation request ${generationRequest.id}.`);
    }
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
      uri: image.uri,
      metadata: { implementation: "mock", provider: generationRequest.provider, providerRequestId: providerResult.providerRequestId, providerImageId: image.id, promptVersion: promptArtifact.version },
      status: "draft",
      evaluationIds: [],
    });

    return {
      data: { attempt, asset, promptArtifact },
      reasoning: {
        explanation: "Created a validated mock generation attempt, prompt artifact, and draft asset by delegating to the injected ImageProvider contract.",
        assumptions: ["The supplied prompt is an approved artifact for this mock attempt."],
        uncertainties: ["The mock provider URI does not represent a real generated image."],
        evidenceIds: [generationRequest.shotId, generationRequest.id, providerResult.providerRequestId],
      },
      confidence: { level: "mock", score: 1, rationale: "The output is deterministically derived from the supplied request." },
      warnings: ["MockGenerationAgent delegates only to an offline mock provider; no image is generated, uploaded, or inspected."],
      metadata: { implementation: "mock", requestId: context.requestId ?? "not-provided", providerRequestId: providerResult.providerRequestId, attemptNumber: attempt.attemptNumber },
    };
  }
}
