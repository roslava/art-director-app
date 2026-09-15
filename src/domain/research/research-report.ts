import { z } from "zod";
import { researchClaimSchema, researchConfidenceSchema } from "./research-claims";
import { researchSourceSchema } from "./sources";
import { visualOpportunitySchema, visualPropertySchema, visualRiskSchema } from "./visual-properties";

const idSchema = z.string().min(1);

export const researchReportSchema = z.object({
  id: idSchema,
  subjectId: idSchema,
  summary: z.string().min(1),
  claims: z.array(researchClaimSchema).default([]),
  visualProperties: z.array(visualPropertySchema).default([]),
  opportunities: z.array(visualOpportunitySchema).default([]),
  risks: z.array(visualRiskSchema).default([]),
  sources: z.array(researchSourceSchema).default([]),
  overallConfidence: researchConfidenceSchema,
});

export type ResearchReport = z.infer<typeof researchReportSchema>;
