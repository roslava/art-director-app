import { z } from "zod";

const idSchema = z.string().min(1);
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
  notes: z.string().min(1).optional(),
  corrections: z.array(reviewCorrectionSchema).default([]),
  createdAt: z.string().datetime(),
});
