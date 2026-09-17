import type { z } from "zod";
import type { reviewCorrectionSchema, reviewDecisionSchema, reviewRecordSchema } from "./schemas";

export type ReviewCorrection = z.infer<typeof reviewCorrectionSchema>;
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;
export type ReviewRecord = z.infer<typeof reviewRecordSchema>;
