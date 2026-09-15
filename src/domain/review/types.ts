import type { z } from "zod";
import type { reviewCorrectionSchema, reviewRecordSchema } from "./schemas";

export type ReviewCorrection = z.infer<typeof reviewCorrectionSchema>;
export type ReviewRecord = z.infer<typeof reviewRecordSchema>;
