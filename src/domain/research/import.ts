import { researchReportSchema, type ResearchReport } from "./research-report";

export type ResearchImportResult =
  | { success: true; data: ResearchReport }
  | { success: false; errors: string[] };

export function validateImportedResearchReport(input: unknown, subjectId: string): ResearchImportResult {
  const parsed = researchReportSchema.safeParse(input);
  if (!parsed.success) return { success: false, errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "Value"}: ${issue.message}`) };
  if (parsed.data.subjectId !== subjectId) return { success: false, errors: [`subjectId must be “${subjectId}” for this subject.`] };
  const sourceIds = new Set(parsed.data.sources.map((source) => source.id));
  const errors = [
    ...parsed.data.claims.flatMap((claim) => claim.sourceIds.filter((id) => !sourceIds.has(id)).map((id) => `claims.${claim.id}.sourceIds: “${id}” is not listed in sources.`)),
    ...parsed.data.visualProperties.flatMap((property) => property.sourceIds.filter((id) => !sourceIds.has(id)).map((id) => `visualProperties.${property.id}.sourceIds: “${id}” is not listed in sources.`)),
    ...parsed.data.uncertainties.flatMap((uncertainty) => uncertainty.sourceIds.filter((id) => !sourceIds.has(id)).map((id) => `uncertainties.${uncertainty.id}.sourceIds: “${id}” is not listed in sources.`)),
  ];
  return errors.length ? { success: false, errors } : { success: true, data: parsed.data };
}
