import { z } from "zod";

const idSchema = z.string().min(1);

export const researchConfidenceSchema = z.object({
  level: z.string().min(1),
  score: z.number().min(0).max(1).optional(),
  rationale: z.string().min(1).optional(),
});

export const researchClaimSchema = z.object({
  id: idSchema,
  statement: z.string().min(1),
  category: z.string().min(1),
  confidence: researchConfidenceSchema,
  sourceIds: z.array(idSchema).default([]),
  tags: z.array(z.string().min(1)).default([]),
});

export type ResearchConfidence = z.infer<typeof researchConfidenceSchema>;
export type ResearchClaim = z.infer<typeof researchClaimSchema>;
