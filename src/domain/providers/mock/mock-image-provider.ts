import type { ImageProvider, ImageProviderRequest, ImageProviderResult } from "@/domain/providers";

export class MockImageProvider implements ImageProvider {
  async generate(request: ImageProviderRequest): Promise<ImageProviderResult> {
    const requestId = typeof request.metadata.generationRequestId === "string" ? request.metadata.generationRequestId : "mock-image-request";
    return {
      providerRequestId: `mock-provider-request-${requestId}`,
      images: [{ id: `mock-provider-image-${requestId}`, uri: `mock://provider/images/${requestId}`, mediaType: "image/mock" }],
      metadata: { implementation: "mock", promptLength: request.prompt.length, negativePromptProvided: Boolean(request.negativePrompt) },
      usage: { totalUnits: 0 },
    };
  }
}
