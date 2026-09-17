import { z } from "zod";

const idSchema = z.string().min(1);
export const reviewDecisionSchema = z.enum(["accepted", "revise", "regenerate"]);
const reviewValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
]);

export const reviewCorrectionSchema = z.object({
  field: z.string().min(1),
  oldValue: reviewValueSchema,
  newValue: reviewValueSchema,
  reason: z.string().min(1),
});

export const reviewRecordSchema = z.object({
  id: idSchema,
  subjectId: idSchema,
  targetType: z.enum(["research_report", "research_claim", "visual_property", "decision", "shot", "generated_asset"]),
  targetId: idSchema,
  status: z.enum(["pending", "approved", "rejected", "edited"]),
  reviewerType: z.enum(["human", "ai"]),
  /** Present for a human decision about a generated image; other review targets do not need it. */
  decision: reviewDecisionSchema.optional(),
  preserve: z.string().min(1).optional(),
  fix: z.string().min(1).optional(),
  rejectionReasons: z.string().min(1).optional(),
  nextGenerationConstraints: z.string().min(1).optional(),
  feedbackCategories: z.array(z.string().min(1)).optional(),
  generatedPrompt: z.string().min(1).optional(),
  previousAttemptId: idSchema.optional(),
  notes: z.string().min(1).optional(),
  corrections: z.array(reviewCorrectionSchema).default([]),
  createdAt: z.string().datetime(),
});
