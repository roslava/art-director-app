import type { z } from "zod";
import type { criterionResultSchema, evaluationConfidenceSchema, evaluationCriterionSchema, evaluationResultSchema, revisionSuggestionSchema } from "./schemas";

export type EvaluationConfidence = z.infer<typeof evaluationConfidenceSchema>;
export type EvaluationCriterion = z.infer<typeof evaluationCriterionSchema>;
export type CriterionResult = z.infer<typeof criterionResultSchema>;
export type RevisionSuggestion = z.infer<typeof revisionSuggestionSchema>;
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;
