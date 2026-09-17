import { productionTechniques, visualGoals } from "@/domain/knowledge";
import { evaluationResultSchema, type EvaluationCriterion, type RevisionSuggestion } from "@/domain/evaluation";
import type { ResearchReport } from "@/domain/research";
import type { ArtDirectionDecision, GeneratedAsset, Shot, Subject } from "@/domain/schemas";
import { z } from "zod";
import type { ArtDirectorPreset } from "@/domain/presets";

const value = (input: unknown) => JSON.stringify(input);
const confidence = (input: { level: string; score?: number; rationale?: string }) =>
  [input.level, input.score === undefined ? undefined : `score ${input.score}`, input.rationale].filter(Boolean).join("; ");

function currentResearch(report: ResearchReport) {
  return [
    "CURRENT RESEARCH",
    `Summary: ${report.summary}`,
    "Claims:",
    ...report.claims.map((claim) => `- [${claim.id}] ${claim.statement} (category: ${claim.category}; confidence: ${confidence(claim.confidence)}; source IDs: ${value(claim.sourceIds)}; tags: ${value(claim.tags)})`),
    "Visual properties:",
    ...report.visualProperties.map((property) => `- [${property.id}] ${property.name}: ${property.description} (value: ${value(property.value)}; importance: ${property.importance}; confidence: ${property.confidence ? confidence(property.confidence) : "not specified"}; source IDs: ${value(property.sourceIds)}; related visual goal IDs: ${value(property.relatedVisualGoalIds)})`),
    "Opportunities:",
    ...report.opportunities.map((opportunity) => `- [${opportunity.id}] ${opportunity.description} (claim IDs: ${value(opportunity.basedOnClaimIds)}; suggested visual goal IDs: ${value(opportunity.suggestedGoalIds)})`),
    "Risks:",
    ...report.risks.map((risk) => `- [${risk.id}] ${risk.description} (reason: ${risk.reason}; related visual goal IDs: ${value(risk.relatedGoalIds)}${risk.avoidanceNotes ? `; avoidance: ${risk.avoidanceNotes}` : ""})`),
    "Uncertainties:",
    ...report.uncertainties.map((uncertainty) => `- [${uncertainty.id}] ${uncertainty.statement} (confidence: ${confidence(uncertainty.confidence)}; source IDs: ${value(uncertainty.sourceIds)})`),
    `Overall confidence: ${confidence(report.overallConfidence)}`,
  ].join("\n");
}

function subjectSection(subject: Subject) {
  return ["SUBJECT", `ID: ${subject.id}`, `Name: ${subject.name}`, subject.description ? `Description: ${subject.description}` : undefined].filter(Boolean).join("\n");
}

/** Manual-first brief: it requests factual visual research, never art-direction choices. */
export function researchBrief(subject: Subject, preset?: ArtDirectorPreset) {
  const methodology = preset ? ["PRESET", `Name: ${preset.name}`, `Version: ${preset.version}`, `Description: ${preset.description}`, "RESEARCH METHODOLOGY", `Include: ${preset.research.scope.include.join("; ")}`, `Exclude: ${preset.research.scope.exclude.join("; ")}`, ...preset.research.sections.flatMap((section) => [`${section.title}: ${section.description}`, ...section.questions.map((question) => `- ${question.question} (${question.applicability}; ${question.importance})`)])] : [];
  return [
    "RESEARCH REPORT MANUAL HANDOFF",
    "Research the subject below for visual art direction. Report only physical, material, observable, and source-backed information. Do not choose composition, photographic style, mood, background, lens, framing, lighting setup, or shot design.",
    subjectSection(subject),
    ...methodology,
    "OUTPUT CONTRACT",
    "Return one raw JSON ResearchReport object. Do not wrap it in Markdown or add commentary.",
    "Required fields: id, subjectId, summary, claims, visualProperties, opportunities, risks, uncertainties, sources, overallConfidence.",
    `subjectId must be exactly \"${subject.id}\". Each claim has id, statement, category, confidence, sourceIds, tags. Each visual property has id, name, description, value, importance, confidence, sourceIds. Each uncertainty has id, statement, sourceIds, confidence. Every source ID in a claim, visual property, or uncertainty must occur in sources[].id.`,
  ].join("\n\n");
}

function productionKnowledge() {
  return [
    "AVAILABLE VISUAL GOALS",
    ...visualGoals.map((goal) => `- [${goal.id}] ${goal.title}: ${goal.description} Purpose: ${goal.purpose}. Applicable when: ${value(goal.applicableWhen)}. Success criteria: ${value(goal.successCriteria)}. Risks: ${value(goal.risks)}.`),
    "",
    "AVAILABLE PRODUCTION TECHNIQUES",
    ...productionTechniques.map((technique) => `- [${technique.id}] ${technique.title} (category: ${technique.category})\n  What it solves: ${technique.description} Goal IDs: ${value(technique.solvesGoals)}.\n  Useful when: ${value(technique.usefulWhen)}\n  Avoid when: ${value(technique.avoidWhen)}\n  Risks: ${value(technique.risks)}`),
  ].join("\n");
}

const artDirectionOutputContract = [
  "OUTPUT CONTRACT",
  "Return only a raw JSON ArtDirectionDecision[] array. Do not wrap it in Markdown or add commentary.",
  "Every decision object must contain: id (non-empty string), title (non-empty string), inputResearchFactIds (string[]), selectedVisualGoalIds (string[]), selectedTechniqueIds (string[]), rejectedTechniqueIds (string[]), reasoning (non-empty string), expectedOutcome (non-empty string), risks (string[]), and confidence.",
  "confidence must be an object with level (non-empty string); it may also contain score (number from 0 through 1) and rationale (non-empty string). notes is optional and, if present, must be a non-empty string.",
].join("\n");

const artDirectionReferenceRules = [
  "REFERENCE RULES",
  "- inputResearchFactIds may only use claim IDs from CURRENT RESEARCH.",
  "- selectedVisualGoalIds may only use IDs listed in AVAILABLE VISUAL GOALS.",
  "- selectedTechniqueIds and rejectedTechniqueIds may only use technique IDs listed in AVAILABLE PRODUCTION TECHNIQUES.",
  "- Do not invent IDs.",
].join("\n");

export function artDirectionBrief(subject: Subject, report: ResearchReport) {
  return [
    "ART DIRECTION EXTERNAL-AI HANDOFF BRIEF",
    "Create ArtDirectionDecision[] for this subject using only the current workspace information below.",
    subjectSection(subject),
    currentResearch(report),
    productionKnowledge(),
    artDirectionOutputContract,
    artDirectionReferenceRules,
  ].join("\n\n");
}

export function shotPlanBrief(subject: Subject, report: ResearchReport, decisions: ArtDirectionDecision[]) {
  return [
    "SHOT PLAN EXTERNAL-AI HANDOFF BRIEF",
    "Create one ShotPlan from the current workspace information below. Do not use or reproduce an existing ShotPlan.",
    subjectSection(subject),
    currentResearch(report),
    "CURRENT ART DIRECTION",
    ...decisions.map((decision) => `- [${decision.id}] ${decision.title}\n  Research fact IDs: ${value(decision.inputResearchFactIds)}\n  Visual goal IDs: ${value(decision.selectedVisualGoalIds)}\n  Selected technique IDs: ${value(decision.selectedTechniqueIds)}\n  Rejected technique IDs: ${value(decision.rejectedTechniqueIds)}\n  Reasoning: ${decision.reasoning}\n  Expected outcome: ${decision.expectedOutcome}\n  Risks: ${value(decision.risks)}\n  Confidence: ${confidence(decision.confidence)}`),
    "OUTPUT CONTRACT",
    "Return only one raw JSON ShotPlan object. Do not wrap it in Markdown or add commentary.",
    "Required ShotPlan fields: id, subjectId, title, creativeDirection, shots, createdAt, updatedAt. subjectId must equal the SUBJECT ID. createdAt and updatedAt must be ISO-8601 datetime strings.",
    "Every shot requires: id, shotPlanId, title, purpose, shotType, subjectState, composition, lighting, background, cameraNotes, emphasize, avoid, generationPrompt, status, researchFactIds, artDirectionDecisionIds, visualGoalIds, techniqueIds, successCriteria, risks, techniqueOverrides. status must be one of draft, ready, generating, review, approved.",
    "REFERENCE RULES",
    "- researchFactIds may only use claim IDs from CURRENT RESEARCH.",
    "- artDirectionDecisionIds may only use IDs from CURRENT ART DIRECTION.",
    "- visualGoalIds and techniqueIds may only use IDs referenced by CURRENT ART DIRECTION; do not invent IDs.",
  ].join("\n\n");
}

/** Deterministic, shot-specific criteria provide valid criterion IDs for a manual Critic result. */
export function evaluationCriteriaForShot(shot: Shot): EvaluationCriterion[] {
  return shot.successCriteria.map((description, index) => ({
    id: `${shot.id}-success-${index + 1}`,
    title: `Success criterion ${index + 1}`,
    description,
    relatedVisualGoalIds: shot.visualGoalIds,
    relatedTechniqueIds: shot.techniqueIds,
    severity: "required",
  }));
}

function selectedDecisions(shot: Shot, decisions: ArtDirectionDecision[]) {
  const selected = new Set(shot.artDirectionDecisionIds);
  return decisions.filter((decision) => selected.has(decision.id));
}

/**
 * A deliberately bounded handoff for rewriting, rather than extending, a prompt.
 * Suggestions are supplied by the human selection in the UI; no Critic suggestion
 * is included merely because it was returned by an evaluation.
 */
export function revisionBrief({ subject, report, decisions, shot, prompt, acceptedSuggestions }: {
  subject: Subject; report: ResearchReport; decisions: ArtDirectionDecision[]; shot: Shot; prompt: string; acceptedSuggestions: RevisionSuggestion[];
}) {
  const relevantClaims = new Set(shot.researchFactIds);
  const claims = report.claims.filter((claim) => relevantClaims.has(claim.id));
  const selected = selectedDecisions(shot, decisions);
  return [
    "MANUAL REVISION HANDOFF — REWRITE GENERATION PROMPT",
    "Rewrite the original prompt below as one complete, coherent generation prompt for the next attempt. Incorporate the current shot intent, constraints, and only the human-accepted suggestions. Return the rewritten prompt only, with no commentary, headings, explanation, JSON, or revision notes.",
    subjectSection(subject),
    "ORIGINAL GENERATION PROMPT",
    prompt,
    "CURRENT SHOT INTENT AND SUCCESS CRITERIA",
    `Title: ${shot.title}\nPurpose: ${shot.purpose}\nSubject state: ${shot.subjectState}\nComposition: ${shot.composition}\nLighting: ${shot.lighting}\nBackground: ${shot.background}\nCamera / optics: ${shot.cameraNotes}\nEmphasize: ${value(shot.emphasize)}\nAvoid: ${value(shot.avoid)}\nSuccess criteria: ${value(shot.successCriteria)}\nKnown risks: ${value(shot.risks)}`,
    "HUMAN-ACCEPTED REVISION SUGGESTIONS ONLY",
    acceptedSuggestions.length ? acceptedSuggestions.map((suggestion) => `- [${suggestion.id}] Issue: ${suggestion.issue}\n  Requested change: ${suggestion.suggestedChange}\n  Affected shot fields: ${value(suggestion.affectedShotFields)}\n  Affected techniques: ${value(suggestion.affectedTechniqueIds)}`).join("\n") : "No Critic suggestion was accepted. Preserve the current production intent.",
    "RELEVANT RESEARCH CONSTRAINTS",
    claims.length ? claims.map((claim) => `- [${claim.id}] ${claim.statement}`).join("\n") : "No shot-specific research claims are linked.",
    "RELEVANT ART DIRECTION CONSTRAINTS",
    selected.length ? selected.map((decision) => `- [${decision.id}] ${decision.title}\n  Expected outcome: ${decision.expectedOutcome}\n  Selected visual goals: ${value(decision.selectedVisualGoalIds)}\n  Selected techniques: ${value(decision.selectedTechniqueIds)}\n  Risks: ${value(decision.risks)}`).join("\n") : "No Art Direction decisions are linked to this shot.",
    "SHOT PRODUCTION CONSTRAINTS",
    `Technique IDs: ${value(shot.techniqueIds)}\nTechnique overrides: ${value(shot.techniqueOverrides)}\nProduction notes: ${shot.productionNotes ?? "None"}`,
  ].join("\n\n");
}

function reviewConstraints(subject: Subject, report: ResearchReport | undefined, decisions: ArtDirectionDecision[], shot: Shot) {
  const claims = report?.claims.filter((claim) => shot.researchFactIds.includes(claim.id)) ?? [];
  const selected = selectedDecisions(shot, decisions);
  return [
    subjectSection(subject),
    "SHOT GOAL",
    `Title: ${shot.title}\nPurpose: ${shot.purpose}\nComposition: ${shot.composition}\nLighting: ${shot.lighting}\nBackground: ${shot.background}\nSuccess criteria: ${value(shot.successCriteria)}\nKnown risks: ${value(shot.risks)}`,
    "SCIENTIFIC AND VISUAL CONSTRAINTS",
    claims.length ? claims.map((claim) => `- ${claim.statement}`).join("\n") : "- Use the shot's stated intent and avoid unsupported material claims.",
    selected.length ? selected.map((decision) => `- ${decision.expectedOutcome} Risks: ${value(decision.risks)}`).join("\n") : "- Keep the shot's stated production constraints.",
  ];
}

/** A copy-ready prompt for a new version that deliberately uses the current result as its reference. */
export function revisionPrompt({ subject, report, decisions, shot, currentPrompt, preserve, fix, categories }: {
  subject: Subject; report?: ResearchReport; decisions: ArtDirectionDecision[]; shot: Shot; currentPrompt: string; preserve: string; fix: string; categories: string[];
}) {
  return [
    "CREATE A NEW VERSION BASED ON THE CURRENT IMAGE",
    "Use the current image as the visual reference. Do not overwrite it; create the next version of this shot.",
    "ORIGINAL PROMPT", currentPrompt,
    "PRESERVE", preserve,
    "FIX", fix,
    categories.length ? `FEEDBACK AREAS: ${categories.join(", ")}` : "",
    ...reviewConstraints(subject, report, decisions, shot),
    "Return one new image that retains the requested strengths while correcting the listed problems.",
  ].filter(Boolean).join("\n\n");
}

/** A copy-ready replacement prompt that intentionally does not inherit visual directions from a rejected result. */
export function regenerationPrompt({ subject, report, decisions, shot, currentPrompt, rejectionReasons, constraints, categories }: {
  subject: Subject; report?: ResearchReport; decisions: ArtDirectionDecision[]; shot: Shot; currentPrompt: string; rejectionReasons: string; constraints: string; categories: string[];
}) {
  return [
    "CREATE A NEW VERSION FROM THE SHOT BRIEF",
    "The current image is rejected and must not be used as a visual basis. Create a replacement image for the next version of this shot.",
    "ORIGINAL SHOT PROMPT", currentPrompt,
    "WHY THE RESULT IS UNSUITABLE", rejectionReasons,
    "ERRORS THAT MUST NOT RECUR", constraints,
    categories.length ? `FEEDBACK AREAS: ${categories.join(", ")}` : "",
    ...reviewConstraints(subject, report, decisions, shot),
    "Do not preserve visual choices from the rejected image. Produce a new image that satisfies the brief and all listed constraints.",
  ].filter(Boolean).join("\n\n");
}

export function criticBrief({ subject, report, decisions, shot, asset, prompt }: {
  subject: Subject; report: ResearchReport; decisions: ArtDirectionDecision[]; shot: Shot; asset: GeneratedAsset; prompt: string;
}) {
  const criteria = evaluationCriteriaForShot(shot);
  return [
    "MANUAL CRITIC HANDOFF — AI CRITIC REVIEW",
    "Evaluate the image supplied separately by the human together with this brief. The local image is not encoded in this clipboard payload.",
    subjectSection(subject),
    currentResearch(report),
    "CURRENT ART DIRECTION (only decisions referenced by CURRENT SHOT)",
    ...selectedDecisions(shot, decisions).map((decision) => `- [${decision.id}] ${decision.title}\n  Reasoning: ${decision.reasoning}\n  Expected outcome: ${decision.expectedOutcome}\n  Selected visual goals: ${value(decision.selectedVisualGoalIds)}\n  Selected production techniques: ${value(decision.selectedTechniqueIds)}\n  Risks: ${value(decision.risks)}`),
    "CURRENT SHOT",
    `ID: ${shot.id}\nTitle: ${shot.title}\nPurpose: ${shot.purpose}\nLighting: ${shot.lighting}\nCamera / optics: ${shot.cameraNotes}\nEnvironment: ${shot.background}\nComposition: ${shot.composition}\nSuccess criteria: ${value(shot.successCriteria)}\nRisks: ${value(shot.risks)}\nTechnique overrides: ${value(shot.techniqueOverrides)}\nProduction notes: ${shot.productionNotes ?? "None"}`,
    "GENERATION",
    `Asset ID: ${asset.id}\nAttempt ID: ${asset.attemptId}\nGeneration request ID: ${asset.generationRequestId}\nExact generation prompt used for this attempt:\n${prompt}`,
    "EVALUATION CRITERIA",
    ...criteria.map((criterion) => `- [${criterion.id}] ${criterion.title}: ${criterion.description} (visual goals: ${value(criterion.relatedVisualGoalIds)}; techniques: ${value(criterion.relatedTechniqueIds)}; severity: ${criterion.severity})`),
    "CRITIC INSTRUCTIONS",
    "Evaluate against the supplied evidence and production intent, never generic aesthetic preference. Specifically assess factual/material plausibility; achievement of visual goals; shot success criteria; known-risk violations; lighting correctness; optics/perspective plausibility; color plausibility; material/surface behaviour; over-stylization; unwanted product/luxury/advertising appearance; AI-generation artifacts; and unsupported geological/material implications.",
    "Do not invent research facts. When evidence is insufficient, express uncertainty rather than claim failure.",
    "OUTPUT CONTRACT",
    "Return JSON only: one EvaluationResult object, with no Markdown or commentary. This is the runtime JSON Schema used for validation:",
    JSON.stringify(z.toJSONSchema(evaluationResultSchema), null, 2),
    "REFERENCE RULES",
    `- assetId must be exactly \"${asset.id}\" and shotId must be exactly \"${shot.id}\".`,
    `- decisionIds may only contain current-shot decision IDs: ${value(shot.artDirectionDecisionIds)}.`,
    `- Each criteriaResults[].criterionId may only contain an ID in EVALUATION CRITERIA: ${value(criteria.map((criterion) => criterion.id))}.`,
    `- recommendations[].affectedTechniqueIds may only contain current-shot technique IDs: ${value(shot.techniqueIds)}.`,
  ].join("\n\n");
}
