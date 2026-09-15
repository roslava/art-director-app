import { z } from "zod";

const idSchema = z.string().min(1);

export const evaluationConfidenceSchema = z.object({
  level: z.string().min(1),
  score: z.number().min(0).max(1).optional(),
  rationale: z.string().min(1).optional(),
});

export const evaluationCriterionSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  relatedVisualGoalIds: z.array(idSchema).default([]),
  relatedTechniqueIds: z.array(idSchema).default([]),
  severity: z.string().min(1),
});

export const criterionResultSchema = z.object({
  criterionId: idSchema,
  status: z.string().min(1),
  score: z.number().min(0).max(1),
  findings: z.array(z.string().min(1)).default([]),
});

export const revisionSuggestionSchema = z.object({
  id: idSchema,
  issue: z.string().min(1),
  suggestedChange: z.string().min(1),
  affectedShotFields: z.array(z.string().min(1)).default([]),
  affectedTechniqueIds: z.array(idSchema).default([]),
});

export const evaluationResultSchema = z.object({
  id: idSchema,
  assetId: idSchema,
  shotId: idSchema,
  decisionIds: z.array(idSchema).default([]),
  criteriaResults: z.array(criterionResultSchema).default([]),
  overallScore: z.number().min(0).max(1),
  issues: z.array(z.string().min(1)).default([]),
  recommendations: z.array(revisionSuggestionSchema).default([]),
  confidence: evaluationConfidenceSchema,
});
