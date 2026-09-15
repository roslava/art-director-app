import { z } from "zod";

const idSchema = z.string().min(1);

export const researchSourceSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  type: z.string().min(1),
  url: z.string().url().optional(),
  citation: z.string().min(1),
  reliability: z.string().min(1),
  notes: z.string().min(1).optional(),
});

export type ResearchSource = z.infer<typeof researchSourceSchema>;
