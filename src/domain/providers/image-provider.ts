import type { ProviderContext, ProviderImageReference, ProviderMetadataValue, ProviderUsage } from "./types";

export interface ImageProviderRequest {
  prompt: string;
  negativePrompt?: string;
  parameters: Record<string, ProviderMetadataValue>;
  metadata: Record<string, ProviderMetadataValue>;
  context?: ProviderContext;
}

export interface ImageProviderResult {
  providerRequestId: string;
  images: ProviderImageReference[];
  metadata: Record<string, ProviderMetadataValue>;
  usage?: ProviderUsage;
}

export interface ImageProvider {
  generate(request: ImageProviderRequest): Promise<ImageProviderResult>;
}
