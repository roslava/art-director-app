import { z } from "zod";
import { researchReportSchema, type ResearchReport } from "@/domain/research";

const idSchema = z.string().min(1);
const timestampSchema = z.string().datetime();

export const visualFactSchema = z.object({ id: idSchema, label: z.string().min(1), detail: z.string().min(1), confidence: z.enum(["verified", "likely", "needs-review"]), source: z.string().min(1).optional() });
export const visualGoalSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  purpose: z.string().min(1),
  applicableWhen: z.array(z.string().min(1)),
  successCriteria: z.array(z.string().min(1)),
  risks: z.array(z.string().min(1)),
  recommendedTechniqueIds: z.array(idSchema),
  conflictingTechniqueIds: z.array(idSchema),
  tags: z.array(z.string().min(1)),
});

const techniqueParameterValueSchema = z.union([
  z.string().min(1),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().min(1)).min(1),
]);

export const productionTechniqueParametersSchema = z.object({
  lightDirection: z.string().min(1).optional(),
  lightSize: z.string().min(1).optional(),
  lightHardness: z.string().min(1).optional(),
  polarization: z.string().min(1).optional(),
  focalLengthRange: z.string().min(1).optional(),
  depthOfField: z.string().min(1).optional(),
  workingDistance: z.string().min(1).optional(),
  cameraAngle: z.string().min(1).optional(),
  backgroundTone: z.string().min(1).optional(),
  environmentType: z.string().min(1).optional(),
  custom: z.record(z.string().min(1), techniqueParameterValueSchema).default({}),
});

export const productionTechniqueSchema = z.object({
  id: idSchema,
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  solvesGoals: z.array(idSchema),
  usefulWhen: z.array(z.string().min(1)),
  avoidWhen: z.array(z.string().min(1)),
  strengths: z.array(z.string().min(1)),
  risks: z.array(z.string().min(1)),
  parameters: productionTechniqueParametersSchema,
  tags: z.array(z.string().min(1)),
});

export const shotTechniqueOverrideSchema = z.object({
  techniqueId: idSchema,
  notes: z.string().min(1).optional(),
  parameters: productionTechniqueParametersSchema.partial().optional(),
});
export const artDirectionDecisionConfidenceSchema = z.object({
  level: z.string().min(1),
  score: z.number().min(0).max(1).optional(),
  rationale: z.string().min(1).optional(),
});
export const artDirectionDecisionSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  inputResearchFactIds: z.array(idSchema).default([]),
  selectedVisualGoalIds: z.array(idSchema).default([]),
  selectedTechniqueIds: z.array(idSchema).default([]),
  rejectedTechniqueIds: z.array(idSchema).default([]),
  reasoning: z.string().min(1),
  expectedOutcome: z.string().min(1),
  risks: z.array(z.string().min(1)).default([]),
  confidence: artDirectionDecisionConfidenceSchema,
  notes: z.string().min(1).optional(),
});
export const researchSchema = z.object({ id: idSchema, subjectId: idSchema, summary: z.string().min(1), identity: z.string().min(1), materialType: z.string().min(1), dominantColors: z.array(z.string().min(1)), transparency: z.string().min(1), crystalHabit: z.string().min(1), opticalCharacteristics: z.array(z.string().min(1)), structuralCharacteristics: z.array(z.string().min(1)), visualRisks: z.array(z.string().min(1)), visualFacts: z.array(visualFactSchema), createdAt: timestampSchema, updatedAt: timestampSchema });
export const generatedAssetSchema = z.object({ id: idSchema, shotId: idSchema, provider: z.string().min(1), url: z.string().url(), prompt: z.string().min(1), status: z.enum(["queued", "generating", "ready", "failed"]), createdAt: timestampSchema });
export const reviewSchema = z.object({ id: idSchema, generatedAssetId: idSchema, verdict: z.enum(["approved", "revise", "rejected"]), summary: z.string().min(1), strengths: z.array(z.string().min(1)), issues: z.array(z.string().min(1)), revisionDirection: z.string().min(1).optional(), createdAt: timestampSchema });
export const shotSchema = z.object({ id: idSchema, shotPlanId: idSchema, title: z.string().min(1), purpose: z.string().min(1), shotType: z.string().min(1), subjectState: z.string().min(1), composition: z.string().min(1), lighting: z.string().min(1), background: z.string().min(1), cameraNotes: z.string().min(1), emphasize: z.array(z.string().min(1)), avoid: z.array(z.string().min(1)), generationPrompt: z.string().min(1), status: z.enum(["draft", "ready", "generating", "review", "approved"]), researchFactIds: z.array(idSchema).default([]), artDirectionDecisionIds: z.array(idSchema).default([]), visualGoalIds: z.array(idSchema).default([]), techniqueIds: z.array(idSchema).default([]), successCriteria: z.array(z.string().min(1)).default([]), risks: z.array(z.string().min(1)).default([]), techniqueOverrides: z.array(shotTechniqueOverrideSchema).default([]), productionNotes: z.string().min(1).optional(), generatedAssets: z.array(generatedAssetSchema).default([]) });
export const shotPlanSchema = z.object({ id: idSchema, subjectId: idSchema, title: z.string().min(1), creativeDirection: z.string().min(1), shots: z.array(shotSchema), createdAt: timestampSchema, updatedAt: timestampSchema });
export const subjectSchema = z.object({ id: idSchema, projectId: idSchema, name: z.string().min(1), description: z.string().min(1), research: researchSchema.optional(), researchReports: z.array(researchReportSchema).default([]), artDirectionDecisions: z.array(artDirectionDecisionSchema).default([]), shotPlans: z.array(shotPlanSchema).default([]), createdAt: timestampSchema, updatedAt: timestampSchema });
export const exportTargetSchema = z.object({ id: idSchema, projectId: idSchema, name: z.string().min(1), format: z.string().min(1), dimensions: z.string().min(1), colorSpace: z.string().min(1), status: z.enum(["draft", "ready", "exported"]) });
export const projectSchema = z.object({ id: idSchema, name: z.string().min(1), description: z.string().min(1), subjects: z.array(subjectSchema).default([]), exportTargets: z.array(exportTargetSchema).default([]), createdAt: timestampSchema, updatedAt: timestampSchema });

export type VisualFact = z.infer<typeof visualFactSchema>;
export type VisualGoal = z.infer<typeof visualGoalSchema>;
export type ProductionTechniqueParameters = z.infer<typeof productionTechniqueParametersSchema>;
export type ProductionTechnique = z.infer<typeof productionTechniqueSchema>;
export type ShotTechniqueOverride = z.infer<typeof shotTechniqueOverrideSchema>;
export type ArtDirectionDecisionConfidence = z.infer<typeof artDirectionDecisionConfidenceSchema>;
export type ArtDirectionDecision = z.infer<typeof artDirectionDecisionSchema>;
export type Research = z.infer<typeof researchSchema>;
export type { ResearchReport };
export type GeneratedAsset = z.infer<typeof generatedAssetSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type ShotPlan = z.infer<typeof shotPlanSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type ExportTarget = z.infer<typeof exportTargetSchema>;
export type Project = z.infer<typeof projectSchema>;
