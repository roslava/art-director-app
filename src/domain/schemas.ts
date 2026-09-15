import { z } from "zod";

const idSchema = z.string().min(1);
const timestampSchema = z.string().datetime();

export const visualFactSchema = z.object({ id: idSchema, label: z.string().min(1), detail: z.string().min(1), confidence: z.enum(["verified", "likely", "needs-review"]), source: z.string().min(1).optional() });
export const researchSchema = z.object({ id: idSchema, subjectId: idSchema, summary: z.string().min(1), identity: z.string().min(1), materialType: z.string().min(1), dominantColors: z.array(z.string().min(1)), transparency: z.string().min(1), crystalHabit: z.string().min(1), opticalCharacteristics: z.array(z.string().min(1)), structuralCharacteristics: z.array(z.string().min(1)), visualRisks: z.array(z.string().min(1)), visualFacts: z.array(visualFactSchema), createdAt: timestampSchema, updatedAt: timestampSchema });
export const generatedAssetSchema = z.object({ id: idSchema, shotId: idSchema, provider: z.string().min(1), url: z.string().url(), prompt: z.string().min(1), status: z.enum(["queued", "generating", "ready", "failed"]), createdAt: timestampSchema });
export const reviewSchema = z.object({ id: idSchema, generatedAssetId: idSchema, verdict: z.enum(["approved", "revise", "rejected"]), summary: z.string().min(1), strengths: z.array(z.string().min(1)), issues: z.array(z.string().min(1)), revisionDirection: z.string().min(1).optional(), createdAt: timestampSchema });
export const shotSchema = z.object({ id: idSchema, shotPlanId: idSchema, title: z.string().min(1), purpose: z.string().min(1), shotType: z.string().min(1), subjectState: z.string().min(1), composition: z.string().min(1), lighting: z.string().min(1), background: z.string().min(1), cameraNotes: z.string().min(1), emphasize: z.array(z.string().min(1)), avoid: z.array(z.string().min(1)), generationPrompt: z.string().min(1), status: z.enum(["draft", "ready", "generating", "review", "approved"]), generatedAssets: z.array(generatedAssetSchema).default([]) });
export const shotPlanSchema = z.object({ id: idSchema, subjectId: idSchema, title: z.string().min(1), creativeDirection: z.string().min(1), shots: z.array(shotSchema), createdAt: timestampSchema, updatedAt: timestampSchema });
export const subjectSchema = z.object({ id: idSchema, projectId: idSchema, name: z.string().min(1), description: z.string().min(1), research: researchSchema.optional(), shotPlans: z.array(shotPlanSchema).default([]), createdAt: timestampSchema, updatedAt: timestampSchema });
export const exportTargetSchema = z.object({ id: idSchema, projectId: idSchema, name: z.string().min(1), format: z.string().min(1), dimensions: z.string().min(1), colorSpace: z.string().min(1), status: z.enum(["draft", "ready", "exported"]) });
export const projectSchema = z.object({ id: idSchema, name: z.string().min(1), description: z.string().min(1), subjects: z.array(subjectSchema).default([]), exportTargets: z.array(exportTargetSchema).default([]), createdAt: timestampSchema, updatedAt: timestampSchema });

export type VisualFact = z.infer<typeof visualFactSchema>;
export type Research = z.infer<typeof researchSchema>;
export type GeneratedAsset = z.infer<typeof generatedAssetSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type ShotPlan = z.infer<typeof shotPlanSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type ExportTarget = z.infer<typeof exportTargetSchema>;
export type Project = z.infer<typeof projectSchema>;
