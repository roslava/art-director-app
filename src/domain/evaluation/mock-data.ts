import { evaluationCriterionSchema, evaluationResultSchema } from "./schemas";
import type { EvaluationCriterion, EvaluationResult } from "./types";

export const chrysoberylTranslucencyCriteria: EvaluationCriterion[] = [
  evaluationCriterionSchema.parse({
    id: "criterion-chrysoberyl-edge-transmission",
    title: "Localized edge transmission",
    description: "Thin or fractured areas should show limited, readable transmission while preserving the visual solidity of the bulk.",
    relatedVisualGoalIds: ["reveal_translucency"],
    relatedTechniqueIds: ["transmitted_backlight", "edge_detail"],
    severity: "high",
  }),
  evaluationCriterionSchema.parse({
    id: "criterion-chrysoberyl-natural-material-reading",
    title: "Natural material reading",
    description: "Backlight should not make the mock/sample specimen appear uniformly glass-like or excessively luminous.",
    relatedVisualGoalIds: ["reveal_translucency"],
    relatedTechniqueIds: ["transmitted_backlight", "dark_studio"],
    severity: "high",
  }),
];

// Demonstration-only evaluation of a fictional mock asset; no image was generated or inspected.
export const mockChrysoberylTranslucencyEvaluation: EvaluationResult = evaluationResultSchema.parse({
  id: "evaluation-chrysoberyl-translucency-mock",
  assetId: "asset-chrysoberyl-translucency-mock",
  shotId: "shot-translucency",
  decisionIds: ["decision-reveal-edge-translucency"],
  criteriaResults: [
    { criterionId: "criterion-chrysoberyl-edge-transmission", status: "partially-achieved", score: 0.6, findings: ["Mock evaluation: thin-edge transmission is visible.", "Mock evaluation: transition remains readable but is brighter than intended."] },
    { criterionId: "criterion-chrysoberyl-natural-material-reading", status: "needs-revision", score: 0.4, findings: ["Mock evaluation: excessive glow makes part of the specimen read as more transparent than intended."] },
  ],
  overallScore: 0.5,
  issues: ["Excessive glow reduces the intended distinction between localized transmission and a visually solid bulk."],
  recommendations: [{
    id: "revision-chrysoberyl-reduce-transmitted-light",
    issue: "Excessive glow from transmitted backlight.",
    suggestedChange: "Reduce transmitted-light intensity and preserve a restrained frontal fill so only plausible thin edges transmit visibly.",
    affectedShotFields: ["lighting", "generationPrompt", "productionNotes"],
    affectedTechniqueIds: ["transmitted_backlight"],
  }],
  confidence: { level: "needs-review", score: 0.5, rationale: "This is a fixture-only evaluation of a fictional mock asset, not an image-analysis result." },
});
