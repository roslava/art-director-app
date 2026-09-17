import type { ShotPlan, Subject } from "./schemas";
import type { ArtDirectorPreset } from "./presets";

const compact = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function subjectIdFor(name: string, existingIds: Iterable<string>): string {
  const base = compact(name) || "subject";
  const used = new Set(existingIds);
  let id = `subject-${base}`;
  let suffix = 2;
  while (used.has(id)) id = `subject-${base}-${suffix++}`;
  return id;
}

export function createSubject(name: string, existingIds: Iterable<string>, now = new Date().toISOString()): Subject {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Subject name is required.");
  const displayName = /^[a-z]+$/.test(trimmed) ? `${trimmed[0].toUpperCase()}${trimmed.slice(1)}` : trimmed;
  return { id: subjectIdFor(trimmed, existingIds), projectId: "local-workspaces", name: displayName, researchReports: [], artDirectionDecisions: [], shotPlans: [], createdAt: now, updatedAt: now };
}

export function emptyShotPlan(subject: Subject): ShotPlan {
  return { id: `${subject.id}-plan`, subjectId: subject.id, title: `${subject.name} workspace`, creativeDirection: "", shots: [], createdAt: subject.createdAt, updatedAt: subject.updatedAt };
}

export type WorkspacePresetSnapshot = Pick<ArtDirectorPreset, "schemaVersion" | "id" | "name" | "version" | "description" | "research" | "outputContract">;

/** Removes one user workspace by identifier without touching any other workspace. */
export function removeWorkspace<T>(subjectId: string, subjects: Subject[], workspaces: Record<string, T>) {
  const remainingWorkspaces = Object.fromEntries(Object.entries(workspaces).filter(([id]) => id !== subjectId)) as Record<string, T>;
  return { subjects: subjects.filter((subject) => subject.id !== subjectId), workspaces: remainingWorkspaces };
}
