import { z } from "zod";

const idSchema = z.string().min(1);
const timestampSchema = z.string().datetime();
const structuredValueSchema = z.union([
  z.string().min(1),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().min(1)).min(1),
]);

export const generationRequestSchema = z.object({
  id: idSchema,
  shotId: idSchema,
  provider: z.string().min(1),
  prompt: z.string().min(1),
  negativePrompt: z.string().min(1).optional(),
  parameters: z.record(z.string().min(1), structuredValueSchema).default({}),
  status: z.string().min(1),
  createdAt: timestampSchema,
});

export const generationAttemptSchema = z.object({
  id: idSchema,
  generationRequestId: idSchema,
  attemptNumber: z.number().int().positive(),
  changesFromPrevious: z.string().min(1),
  previousAttemptId: idSchema.optional(),
  createdAt: timestampSchema,
});

export const generatedAssetSchema = z.object({
  id: idSchema,
  shotId: idSchema,
  generationRequestId: idSchema,
  attemptId: idSchema,
  uri: z.string().min(1),
  metadata: z.record(z.string().min(1), structuredValueSchema).default({}),
  status: z.enum(["draft", "approved", "rejected"]),
  evaluationIds: z.array(idSchema).default([]),
});

export const promptArtifactSchema = z.object({
  id: idSchema,
  shotId: idSchema,
  version: z.number().int().positive(),
  prompt: z.string().min(1),
  reason: z.string().min(1),
  createdAt: timestampSchema,
});
