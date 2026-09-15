export type ProviderMetadataValue = string | number | boolean | string[];

export interface ProviderContext {
  requestId?: string;
  metadata?: Record<string, ProviderMetadataValue>;
}

export interface ProviderUsage {
  inputUnits?: number;
  outputUnits?: number;
  totalUnits?: number;
}

export interface ProviderImageReference {
  id: string;
  uri: string;
  mediaType?: string;
}

export interface ProviderResearchReference {
  id: string;
  title: string;
  url?: string;
  citation?: string;
}
