import { z } from "zod";

const importance = z.enum(["required", "important", "optional"]);
const applicability = z.enum(["always", "when-crystalline", "when-aggregate", "when-transparent-or-translucent", "when-facetable", "when-phenomenon-present", "when-treated-material-is-relevant"]);
export const artDirectorPresetSchema = z.object({ schemaVersion: z.literal(1), id: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1), version: z.string().regex(/^\d+\.\d+\.\d+$/), description: z.string().min(1), research: z.object({ scope: z.object({ include: z.array(z.string().min(1)).min(1), exclude: z.array(z.string().min(1)).min(1) }), sections: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), title: z.string().min(1), description: z.string().min(1), questions: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), question: z.string().min(1), applicability, importance })) })).min(1) }), outputContract: z.object({ type: z.literal("ResearchReport"), schemaVersion: z.literal(1) }) }).superRefine((preset, ctx) => { const ids = new Set<string>(); for (const section of preset.research.sections) { if (ids.has(section.id)) ctx.addIssue({ code: "custom", message: `Duplicate section id: ${section.id}` }); ids.add(section.id); for (const question of section.questions) { if (ids.has(question.id)) ctx.addIssue({ code: "custom", message: `Duplicate question id: ${question.id}` }); ids.add(question.id); } } });
export type ArtDirectorPreset = z.infer<typeof artDirectorPresetSchema>;

export type PresetInstallResult = { status: "installed"; presets: ArtDirectorPreset[] } | { status: "conflict"; installed: ArtDirectorPreset; imported: ArtDirectorPreset } | { status: "invalid"; errors: string[] };
export function installPreset(input: unknown, installed: ArtDirectorPreset[]): PresetInstallResult {
  const parsed = artDirectorPresetSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", errors: parsed.error.issues.map((issue) => issue.message) };
  if (parsed.data.id === "minerals-gemstones") return { status: "invalid", errors: ["The built-in Minerals & Gemstones preset cannot be replaced."] };
  const current = installed.find((preset) => preset.id === parsed.data.id);
  return current ? { status: "conflict", installed: current, imported: parsed.data } : { status: "installed", presets: [...installed, parsed.data] };
}
export function replaceInstalledPreset(input: ArtDirectorPreset, installed: ArtDirectorPreset[]) { return installed.map((preset) => preset.id === input.id ? input : preset); }
