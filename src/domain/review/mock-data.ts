import { reviewRecordSchema } from "./schemas";
import type { ReviewRecord } from "./types";

// Demonstration-only human correction. It records expertise without mutating the source fixture.
export const mockHumanReviewRecords: ReviewRecord[] = [
  reviewRecordSchema.parse({
    id: "review-mookaite-pattern-description",
    subjectId: "subject-mookaite",
    targetType: "visual_property",
    targetId: "property-mookaite-pattern",
    status: "edited",
    reviewerType: "human",
    notes: "Mock human review: clarify that the property is a documentation concern, not a geological assertion.",
    corrections: [{
      field: "description",
      oldValue: "Mock/sample visual property: pattern boundaries need broad, even coverage rather than dramatic surface modeling.",
      newValue: "Mock/sample visual property: broad pattern boundaries should remain readable for documentation; this does not assert geological significance.",
      reason: "The reviewer preserves a clearer distinction between visual observation and unsupported factual interpretation.",
    }],
    createdAt: "2026-09-15T10:00:00.000Z",
  }),
];
