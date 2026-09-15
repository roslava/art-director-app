import { z } from "zod";

const idSchema = z.string().min(1);

export const visualPropertyValueSchema = z.union([
  z.string().min(1),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().min(1)).min(1),
]);

export const visualPropertySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  value: visualPropertyValueSchema,
  importance: z.string().min(1),
  relatedVisualGoalIds: z.array(idSchema).default([]),
});

export const visualOpportunitySchema = z.object({
  id: idSchema,
  description: z.string().min(1),
  basedOnClaimIds: z.array(idSchema).default([]),
  suggestedGoalIds: z.array(idSchema).default([]),
});

export const visualRiskSchema = z.object({
  id: idSchema,
  description: z.string().min(1),
  reason: z.string().min(1),
  relatedGoalIds: z.array(idSchema).default([]),
  avoidanceNotes: z.string().min(1).optional(),
});

export type VisualProperty = z.infer<typeof visualPropertySchema>;
export type VisualOpportunity = z.infer<typeof visualOpportunitySchema>;
export type VisualRisk = z.infer<typeof visualRiskSchema>;
