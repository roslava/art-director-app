import assert from "node:assert/strict";
import test from "node:test";
import { samotsvetyProject } from "@/domain/mock-data";
import { validateImportedResearchReport } from "@/domain/research";
import { artDirectionBrief, researchBrief } from "@/app/handoff-brief";
import { createSubject, emptyShotPlan, removeWorkspace, subjectIdFor } from "@/domain/workspace";
import { artDirectorPresetSchema, installPreset } from "@/domain/presets";
import objectPreset from "./fixtures/simple-physical-object.json";
import mineralPreset from "../presets/minerals-gemstones.json";

const subject = samotsvetyProject.subjects[0];
const report = {
  id: "report-real-chrysoberyl",
  subjectId: subject.id,
  summary: "A source-backed description of the material's visible characteristics.",
  sources: [{ id: "source-mineralogy", title: "Mineralogy reference", type: "reference", citation: "Curated mineralogical reference.", reliability: "reviewed" }],
  claims: [{ id: "claim-identity", statement: "The subject has a documented mineral identity.", category: "identity", confidence: { level: "high", score: 0.9 }, sourceIds: ["source-mineralogy"], tags: ["identity"] }],
  visualProperties: [{ id: "property-luster", name: "Luster", description: "Documented surface reflectance.", value: "vitreous", importance: "high", confidence: { level: "high" }, sourceIds: ["source-mineralogy"] }],
  opportunities: [],
  risks: [],
  uncertainties: [{ id: "uncertainty-variation", statement: "Appearance varies between specimens.", sourceIds: ["source-mineralogy"], confidence: { level: "medium" } }],
  overallConfidence: { level: "high", score: 0.9 },
};

test("subjects start with no Research Report and no mock fallback", () => {
  assert.deepEqual(subject.researchReports, []);
});

test("Research Brief asks for factual visual research and excludes art direction", () => {
  const brief = researchBrief(subject, artDirectorPresetSchema.parse(mineralPreset));
  assert.match(brief, /crystal habit/i);
  assert.match(brief, /transmitted, back, raking and diffuse light/i);
  assert.match(brief, /Do not choose composition, photographic style, mood, background, lens, framing/i);
});

test("a valid imported report is retained as a validated value", () => {
  const result = validateImportedResearchReport(report, subject.id);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.claims[0].sourceIds[0], "source-mineralogy");
});

test("invalid reports are rejected with source-reference errors", () => {
  const result = validateImportedResearchReport({ ...report, claims: [{ ...report.claims[0], sourceIds: ["missing-source"] }] }, subject.id);
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.errors.join("\n"), /missing-source/);
});

test("Art Direction handoff receives only the imported report", () => {
  const result = validateImportedResearchReport(report, subject.id);
  assert.equal(result.success, true);
  if (!result.success) return;
  const brief = artDirectionBrief(subject, result.data);
  assert.match(brief, /report-real-chrysoberyl|CURRENT RESEARCH/);
  assert.match(brief, /documented mineral identity/i);
  assert.doesNotMatch(brief, /Demonstration-only|Mock\/sample/);
});

test("a new subject has a valid generated ID and an empty pipeline workspace", () => {
  const created = createSubject("  Vintage mechanical watch  ", []);
  assert.equal(created.id, "subject-vintage-mechanical-watch");
  assert.equal(created.name, "Vintage mechanical watch");
  assert.deepEqual(created.researchReports, []);
  assert.deepEqual(created.artDirectionDecisions, []);
  assert.deepEqual(emptyShotPlan(created).shots, []);
});

test("simple lowercase subjects gain a readable display name without changing their slug", () => {
  const created = createSubject("demantoid", []);
  assert.equal(created.name, "Demantoid");
  assert.equal(created.id, "subject-demantoid");
  assert.equal(created.description, undefined);
});

test("intentional capitalization is preserved", () => {
  assert.equal(createSubject("iPhone 15 Pro", []).name, "iPhone 15 Pro");
});

test("subject IDs are unique and fixture IDs are never chosen automatically", () => {
  assert.equal(subjectIdFor("Chrysoberyl", ["subject-chrysoberyl"]), "subject-chrysoberyl-2");
});

test("empty subject names are rejected", () => {
  assert.throws(() => createSubject("   ", []), /Subject name is required/);
});

test("confirmed deletion removes only the selected workspace and all of its state", () => {
  const first = createSubject("Demantoid", []);
  const second = createSubject("Ceramic vase", [first.id]);
  const state = { [first.id]: { report: "first", attempts: [1] }, [second.id]: { report: "second", attempts: [2] } };
  const next = removeWorkspace(first.id, [first, second], state);
  assert.deepEqual(next.subjects.map((subject) => subject.id), [second.id]);
  assert.equal(next.workspaces[first.id], undefined);
  assert.deepEqual(next.workspaces[second.id], { report: "second", attempts: [2] });
});

test("built-in and imported presets validate and produce domain-specific briefs", () => {
  const minerals = artDirectorPresetSchema.parse(mineralPreset);
  const object = artDirectorPresetSchema.parse(objectPreset);
  assert.match(researchBrief(createSubject("Vintage mechanical watch", []), object), /moving parts/);
  assert.doesNotMatch(researchBrief(createSubject("Vintage mechanical watch", []), object), /crystal habit/i);
  assert.equal(minerals.id, "minerals-gemstones");
});

test("preset import validates and refuses silent duplicate overwrite", () => {
  const object = artDirectorPresetSchema.parse(objectPreset);
  assert.equal(installPreset(object, []).status, "installed");
  assert.equal(installPreset({ ...object, version: "1.1.0" }, [object]).status, "conflict");
  assert.equal(installPreset({ ...object, schemaVersion: 2 }, []).status, "invalid");
});
