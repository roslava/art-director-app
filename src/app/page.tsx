"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { samotsvetyProject } from "@/domain/mock-data";
import { productionTechniques, visualGoals } from "@/domain/knowledge";
import { researchReportSchema, type ResearchReport } from "@/domain/research";
import { evaluationResultSchema, type EvaluationResult } from "@/domain/evaluation";
import { type GeneratedAsset, type GenerationAttempt, type PromptArtifact } from "@/domain/generation";
import { type ReviewRecord } from "@/domain/review";
import { artDirectionDecisionSchema, shotPlanSchema, type ArtDirectionDecision, type Shot, type ShotPlan, type Subject } from "@/domain/schemas";
import { artDirectionBrief, criticBrief, evaluationCriteriaForShot, revisionBrief, shotPlanBrief } from "./handoff-brief";

const stages = ["Research", "Art Direction", "Shot Plan", "Generate", "Review", "Export"] as const;
type Stage = (typeof stages)[number];
type Verdict = "approved" | "revise" | "rejected";
type Result = { url: string; name: string };
type GenerationAttemptRecord = { attempt: GenerationAttempt; promptArtifact: PromptArtifact; asset: GeneratedAsset; result: Result; evaluation?: EvaluationResult; acceptedRevisionIds?: string[]; revisedPrompt?: string; revisionBriefPrepared?: boolean };
type PreparedGenerationAttempt = { attempt: GenerationAttempt; promptArtifact: PromptArtifact; acceptedRevisionIds: string[]; sourceAttemptId?: string };
type ReviewState = { verdict?: Verdict; notes: string; revision: string; record?: ReviewRecord };
type ImportKind = "research" | "decisions" | "plan" | "evaluation";
type Workspace = {
  report: ResearchReport; decisions: ArtDirectionDecision[]; plan: ShotPlan;
  prompts: Record<string, string>; results: Record<string, Result>; attempts: Record<string, GenerationAttemptRecord[]>; preparedAttempts: Record<string, PreparedGenerationAttempt>; reviews: Record<string, ReviewState>; selectedShotId?: string;
  imported: { research: boolean; decisions: boolean; plan: boolean };
  stale: { decisions: boolean; plan: boolean; evaluations: boolean };
};
type ShotStatus = "approved" | "in-progress" | "not-started";
const nice = (value: string) => value.replaceAll(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const issueText = (issues: { path: PropertyKey[]; message: string }[]) => issues.map((issue) => `${issue.path.join(".") || "Value"}: ${issue.message}`);
const shotStatus = (workspace: Workspace, shotId: string): ShotStatus => {
  if (workspace.reviews[shotId]?.verdict === "approved") return "approved";
  return (workspace.attempts[shotId]?.length ?? 0) > 0 ? "in-progress" : "not-started";
};
const workspaceSeed = (): Record<string, Workspace> => Object.fromEntries(samotsvetyProject.subjects.map((subject) => [subject.id, {
  report: subject.researchReports[0], decisions: subject.artDirectionDecisions, plan: subject.shotPlans[0],
  prompts: {}, results: {}, attempts: {}, preparedAttempts: {}, reviews: {}, selectedShotId: subject.shotPlans[0]?.shots[0]?.id,
  imported: { research: false, decisions: false, plan: false }, stale: { decisions: false, plan: false, evaluations: false },
}]));
const copy = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back for insecure origins and browsers that deny clipboard access.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
};

export default function Home() {
  const [subjectId, setSubjectId] = useState(samotsvetyProject.subjects[0].id);
  const [stage, setStage] = useState<Stage>("Research");
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>(workspaceSeed);
  const [importKind, setImportKind] = useState<ImportKind>();
  const [json, setJson] = useState(""); const [errors, setErrors] = useState<string[]>([]);
  const subject = samotsvetyProject.subjects.find((candidate) => candidate.id === subjectId)!;
  const workspace = workspaces[subject.id];
  const shot = workspace.plan.shots.find((candidate) => candidate.id === workspace.selectedShotId) ?? workspace.plan.shots[0];
  const update = (fn: (current: Workspace) => Workspace) => setWorkspaces((all) => ({ ...all, [subject.id]: fn(all[subject.id]) }));
  const open = (kind: ImportKind) => {
    setImportKind(kind); setErrors([]);
    setJson(kind === "evaluation" ? "" : JSON.stringify(kind === "research" ? workspace.report : kind === "decisions" ? workspace.decisions : workspace.plan, null, 2));
  };
  const close = () => { setImportKind(undefined); setErrors([]); };
  const importResearch = () => {
    try {
      const parsed = researchReportSchema.safeParse(JSON.parse(json));
      if (!parsed.success) return setErrors(issueText(parsed.error.issues));
      if (parsed.data.subjectId !== subject.id) return setErrors([`subjectId must be “${subject.id}” for this subject.`]);
      update((current) => ({ ...current, report: parsed.data, imported: { ...current.imported, research: true }, stale: { decisions: true, plan: true, evaluations: true } })); close();
    } catch { setErrors(["Enter valid JSON before importing."]); }
  };
  const importDecisions = () => {
    try {
      const parsed = artDirectionDecisionSchema.array().safeParse(JSON.parse(json));
      if (!parsed.success) return setErrors(issueText(parsed.error.issues));
      const claims = new Set(workspace.report.claims.map((claim) => claim.id));
      const goals = new Set(visualGoals.map((goal) => goal.id));
      const techniques = new Set(productionTechniques.map((technique) => technique.id));
      const references = parsed.data.flatMap((decision) => [
        ...decision.inputResearchFactIds.filter((id) => !claims.has(id)).map((id) => `${decision.id}.inputResearchFactIds: “${id}” is not in the current Research Report.`),
        ...decision.selectedVisualGoalIds.filter((id) => !goals.has(id)).map((id) => `${decision.id}.selectedVisualGoalIds: “${id}” is not in the Production Knowledge Library.`),
        ...decision.selectedTechniqueIds.filter((id) => !techniques.has(id)).map((id) => `${decision.id}.selectedTechniqueIds: “${id}” is not in the Production Knowledge Library.`),
        ...decision.rejectedTechniqueIds.filter((id) => !techniques.has(id)).map((id) => `${decision.id}.rejectedTechniqueIds: “${id}” is not in the Production Knowledge Library.`),
      ]);
      if (references.length) return setErrors(references);
      update((current) => ({ ...current, decisions: parsed.data, imported: { ...current.imported, decisions: true }, stale: { decisions: false, plan: true, evaluations: true } })); close();
    } catch { setErrors(["Enter valid JSON before importing."]); }
  };
  const importPlan = () => {
    try {
      const parsed = shotPlanSchema.safeParse(JSON.parse(json));
      if (!parsed.success) return setErrors(issueText(parsed.error.issues));
      if (parsed.data.subjectId !== subject.id) return setErrors([`subjectId must be “${subject.id}” for this subject.`]);
      const claims = new Set(workspace.report.claims.map((claim) => claim.id));
      const decisions = new Set(workspace.decisions.map((decision) => decision.id));
      const goals = new Set(visualGoals.map((goal) => goal.id));
      const techniques = new Set(productionTechniques.map((technique) => technique.id));
      const references = parsed.data.shots.flatMap((candidate) => [
        ...candidate.researchFactIds.filter((id) => !claims.has(id)).map((id) => `${candidate.id}.researchFactIds: “${id}” is not in the current Research Report.`),
        ...candidate.artDirectionDecisionIds.filter((id) => !decisions.has(id)).map((id) => `${candidate.id}.artDirectionDecisionIds: “${id}” is not in current Art Direction.`),
        ...candidate.visualGoalIds.filter((id) => !goals.has(id)).map((id) => `${candidate.id}.visualGoalIds: “${id}” is not in the Production Knowledge Library.`),
        ...candidate.techniqueIds.filter((id) => !techniques.has(id)).map((id) => `${candidate.id}.techniqueIds: “${id}” is not in the Production Knowledge Library.`),
      ]);
      if (references.length) return setErrors(references);
      update((current) => ({ ...current, plan: parsed.data, selectedShotId: parsed.data.shots[0]?.id, imported: { ...current.imported, plan: true }, stale: { ...current.stale, plan: false, evaluations: true } })); close();
    } catch { setErrors(["Enter valid JSON before importing."]); }
  };
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!shot || !event.target.files?.[0]) return;
    const file = event.target.files[0];
    const result = { url: URL.createObjectURL(file), name: file.name };
    const previous = workspace.attempts[shot.id] ?? [];
    const prepared = workspace.preparedAttempts[shot.id];
    const attemptNumber = prepared?.attempt.attemptNumber ?? previous.length + 1;
    const assetId = `${shot.id}-asset-${attemptNumber}`;
    const prompt = prepared?.promptArtifact.prompt ?? workspace.prompts[shot.id] ?? shot.generationPrompt;
    const now = new Date().toISOString();
    const generationAttempt = prepared?.attempt ?? { id: `${shot.id}-attempt-${attemptNumber}`, generationRequestId: `${shot.id}-request-${attemptNumber}`, attemptNumber, changesFromPrevious: attemptNumber === 1 ? "Initial manual generation prompt." : "Manually prepared prompt for this generation attempt.", createdAt: now };
    const promptArtifact = prepared?.promptArtifact ?? { id: `${shot.id}-prompt-${attemptNumber}`, shotId: shot.id, version: attemptNumber, prompt, reason: attemptNumber === 1 ? "Initial manual generation prompt." : "Manually prepared prompt for this generation attempt.", createdAt: now };
    const attempt: GenerationAttemptRecord = {
      attempt: generationAttempt, promptArtifact,
      asset: { id: assetId, shotId: shot.id, generationRequestId: generationAttempt.generationRequestId, attemptId: generationAttempt.id, uri: result.url, metadata: { fileName: file.name }, status: "draft", evaluationIds: [] },
      result,
    };
    update((current) => {
      const preparedAttempts = { ...current.preparedAttempts };
      delete preparedAttempts[shot.id];
      return { ...current, prompts: { ...current.prompts, [shot.id]: prompt }, results: { ...current.results, [shot.id]: result }, attempts: { ...current.attempts, [shot.id]: [...(current.attempts[shot.id] ?? []), attempt] }, preparedAttempts };
    });
    setStage("Review");
  };
  const preparedAttempt = shot ? workspace.preparedAttempts[shot.id] : undefined;
  const prompt = shot ? preparedAttempt?.promptArtifact.prompt ?? workspace.prompts[shot.id] ?? shot.generationPrompt : "";
  const review = shot ? workspace.reviews[shot.id] ?? { notes: "", revision: "" } : { notes: "", revision: "" };
  const attempts = shot ? workspace.attempts[shot.id] ?? [] : [];
  const attempt = attempts.at(-1);
  const importEvaluation = () => {
    if (!shot || !attempt) return setErrors(["Upload a generated image before importing an evaluation."]);
    try {
      const parsed = evaluationResultSchema.safeParse(JSON.parse(json));
      if (!parsed.success) return setErrors(issueText(parsed.error.issues));
      const validCriteria = new Set(evaluationCriteriaForShot(shot).map((criterion) => criterion.id));
      const decisionIds = new Set(shot.artDirectionDecisionIds);
      const techniqueIds = new Set(shot.techniqueIds);
      const references = [
        ...(parsed.data.assetId !== attempt.asset.id ? [`assetId must be “${attempt.asset.id}” for the current generated asset.`] : []),
        ...(parsed.data.shotId !== shot.id ? [`shotId must be “${shot.id}” for the current shot.`] : []),
        ...parsed.data.decisionIds.filter((id) => !decisionIds.has(id)).map((id) => `decisionIds: “${id}” is not referenced by the current shot.`),
        ...parsed.data.criteriaResults.filter((item) => !validCriteria.has(item.criterionId)).map((item) => `criteriaResults.criterionId: “${item.criterionId}” is not in the current shot criteria.`),
        ...parsed.data.recommendations.flatMap((item) => item.affectedTechniqueIds.filter((id) => !techniqueIds.has(id)).map((id) => `${item.id}.affectedTechniqueIds: “${id}” is not referenced by the current shot.`)),
      ];
      if (references.length) return setErrors(references);
      update((current) => ({ ...current, attempts: { ...current.attempts, [shot.id]: (current.attempts[shot.id] ?? []).map((item) => item.asset.id === attempt.asset.id ? { ...item, asset: { ...item.asset, evaluationIds: [...item.asset.evaluationIds, parsed.data.id] }, evaluation: parsed.data } : item) }, stale: { ...current.stale, evaluations: false } }));
      close();
    } catch { setErrors(["Enter valid JSON before importing."]); }
  };
  const content = stage === "Research" ? <Research subject={subject} report={workspace.report} imported={workspace.imported.research} open={importKind === "research"} json={json} errors={errors} onOpen={() => open("research")} onClose={close} onJson={setJson} onImport={importResearch} onPrepare={() => setStage("Art Direction")} /> :
    stage === "Art Direction" ? <Direction subject={subject} decisions={workspace.decisions} brief={artDirectionBrief(subject, workspace.report)} imported={workspace.imported.decisions} stale={workspace.stale.decisions} open={importKind === "decisions"} json={json} errors={errors} onOpen={() => open("decisions")} onClose={close} onJson={setJson} onImport={importDecisions} onCopy={() => copy(artDirectionBrief(subject, workspace.report))} onPrepare={() => setStage("Shot Plan")} /> :
    stage === "Shot Plan" ? <ShotPlanning plan={workspace.plan} selected={shot?.id} statuses={Object.fromEntries(workspace.plan.shots.map((candidate) => [candidate.id, shotStatus(workspace, candidate.id)]))} imported={workspace.imported.plan} stale={workspace.stale.plan} open={importKind === "plan"} json={json} errors={errors} onOpen={() => open("plan")} onClose={close} onJson={setJson} onImport={importPlan} onCopy={() => copy(shotPlanBrief(subject, workspace.report, workspace.decisions))} onWork={(id) => { update((current) => ({ ...current, selectedShotId: id })); setStage("Generate"); }} /> :
    !shot ? <Empty /> : stage === "Generate" ? <Generate subject={subject} shot={shot} prompt={prompt} preparedAttempt={preparedAttempt} result={preparedAttempt ? undefined : workspace.results[shot.id]} attempts={attempts} stale={workspace.stale.plan} onPrompt={(value) => update((current) => ({ ...current, prompts: { ...current.prompts, [shot.id]: value } }))} onUpload={upload} /> :
    stage === "Review" ? <Review subject={subject} report={workspace.report} decisions={workspace.decisions} shot={shot} attempt={attempt} attempts={attempts} review={review} stale={workspace.stale.evaluations} open={importKind === "evaluation"} json={json} errors={errors} onOpen={() => open("evaluation")} onClose={close} onJson={setJson} onImport={importEvaluation} onReview={(patch) => update((current) => ({ ...current, reviews: { ...current.reviews, [shot.id]: { ...review, ...patch } } }))} onAcceptedRevisions={(acceptedRevisionIds) => update((current) => ({ ...current, attempts: { ...current.attempts, [shot.id]: (current.attempts[shot.id] ?? []).map((item) => item.asset.id === attempt?.asset.id ? { ...item, acceptedRevisionIds } : item) } }))} onPrepareRevision={() => update((current) => ({ ...current, attempts: { ...current.attempts, [shot.id]: (current.attempts[shot.id] ?? []).map((item) => item.asset.id === attempt?.asset.id ? { ...item, revisionBriefPrepared: true } : item) } }))} onRevisedPrompt={(value) => update((current) => ({ ...current, attempts: { ...current.attempts, [shot.id]: (current.attempts[shot.id] ?? []).map((item) => item.asset.id === attempt?.asset.id ? { ...item, revisedPrompt: value } : item) } }))} onApplyRevisedPrompt={(revisedPrompt, acceptedRevisionIds) => { const attemptNumber = attempts.length + 1; const now = new Date().toISOString(); const accepted = acceptedRevisionIds.join(", ") || "none"; update((current) => ({ ...current, prompts: { ...current.prompts, [shot.id]: revisedPrompt }, preparedAttempts: { ...current.preparedAttempts, [shot.id]: { attempt: { id: `${shot.id}-attempt-${attemptNumber}`, generationRequestId: `${shot.id}-request-${attemptNumber}`, attemptNumber, changesFromPrevious: `Manual rewrite from Attempt ${attempt?.attempt.attemptNumber}; accepted Critic suggestions: ${accepted}.`, createdAt: now }, promptArtifact: { id: `${shot.id}-prompt-${attemptNumber}`, shotId: shot.id, version: attemptNumber, prompt: revisedPrompt, reason: `Human-applied manual rewrite from Attempt ${attempt?.attempt.attemptNumber}.`, createdAt: now }, acceptedRevisionIds, sourceAttemptId: attempt?.attempt.id } } })); setStage("Generate"); }} onGenerate={() => setStage("Generate")} /> :
    <Export plan={workspace.plan} shot={shot} result={workspace.results[shot.id]} review={review} onSelect={(id) => update((current) => ({ ...current, selectedShotId: id }))} />;
  return <main className="min-h-screen bg-[#f8f7f4]"><div className="mx-auto flex min-h-screen max-w-[1600px]">
    <aside className="hidden w-72 shrink-0 border-r border-[#dedbd5] bg-[#f1efeb] p-6 lg:block"><Brand /><p className="eyebrow mt-12 mb-3">Subjects</p>{samotsvetyProject.subjects.map((candidate) => <button key={candidate.id} onClick={() => { setSubjectId(candidate.id); setStage("Research"); close(); }} className={`mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${candidate.id === subject.id ? "border border-[#d7d2ca] bg-[#e9e5df] font-medium" : "text-stone-500 hover:bg-white"}`}>{candidate.name}</button>)}</aside>
    <div className="min-w-0 flex-1"><header className="flex justify-between border-b border-[#e1ddd7] bg-[#fbfaf8] px-5 py-4 md:px-9"><span className="text-sm text-stone-500">Samotsvety / {subject.name}</span><span className="badge">Local workspace</span></header><div className="mx-auto max-w-6xl px-5 py-9 md:px-9 md:py-12"><p className="eyebrow">Subject workspace</p><h1 className="mt-2 font-serif text-4xl">{subject.name}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{subject.description}</p><nav className="mt-7 overflow-x-auto"><div className="flex min-w-max gap-1 rounded-xl bg-[#ece9e3] p-1.5">{stages.map((item, index) => <button onClick={() => setStage(item)} key={item} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${stage === item ? "bg-white font-semibold shadow-sm" : "text-stone-500"}`}><span className={`grid size-5 place-items-center rounded-full text-[10px] ${stage === item ? "bg-[#b7873e] text-white" : "bg-[#ded9d1]"}`}>{index + 1}</span>{item}</button>)}</div></nav><div className="mt-9">{content}</div></div></div>
  </div></main>;
}

function Brand() { return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#262422] text-lg font-semibold text-[#f6c77b]">A</div><div><p className="text-sm font-semibold">Art Director</p><p className="text-xs text-stone-500">Visual production studio</p></div></div>; }
function Header({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <section className="mb-7 flex flex-col justify-between gap-4 border-b border-[#dedad3] pb-7 md:flex-row md:items-end"><div><p className="eyebrow">{eyebrow}</p><h2 className="mt-1 font-serif text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p></div>{action}</section>; }
function Panel({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`panel ${className}`}>{children}</section>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="detail-label">{label}</p><p className="mt-2 text-sm leading-6 text-stone-600">{value}</p></div>; }
function Bullets({ items }: { items: string[] }) { return <ul className="mt-2 space-y-2 text-sm leading-6 text-stone-600">{items.map((item, index) => <li className="flex gap-2" key={`${item}-${index}`}><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#b7873e]" />{item}</li>)}</ul>; }
function Status({ imported, stale }: { imported: boolean; stale?: boolean }) { return <span className={`badge ${stale ? "border-[#d6a695] bg-[#fff0ed] text-[#814537]" : ""}`}>{stale ? "Needs refresh" : imported ? "Imported ✓" : "Fixture starting point"}</span>; }
function Notice({ children }: { children: ReactNode }) { return <Panel className="mb-6 border-[#d6a695] bg-[#fff8f5]"><p className="text-sm font-semibold text-[#814537]">Needs refresh</p><p className="mt-1 text-sm leading-6 text-stone-600">{children}</p></Panel>; }
function ImportPanel({ title, description, json, errors, onJson, onImport }: { title: string; description: string; json: string; errors: string[]; onJson: (value: string) => void; onImport: () => void }) { return <Panel className="mb-6 border-[#d6c39d] bg-[#fffcf5]"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-1 text-sm text-stone-600">{description}</p><textarea className="input mt-5 min-h-64 font-mono text-xs" value={json} onChange={(event) => onJson(event.target.value)} spellCheck={false} />{errors.length > 0 && <div role="alert" className="mt-4 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#8b4a3d]"><b>This content cannot be applied yet.</b><Bullets items={errors} /></div>}<div className="mt-4 text-right"><button className="button-primary" onClick={onImport}>Validate & apply</button></div></Panel>; }

function Research({ subject, report, imported, open, json, errors, onOpen, onClose, onJson, onImport, onPrepare }: { subject: Subject; report: ResearchReport; imported: boolean; open: boolean; json: string; errors: string[]; onOpen: () => void; onClose: () => void; onJson: (value: string) => void; onImport: () => void; onPrepare: () => void }) { return <><Header eyebrow="Research" title="Material reference" description="Factual inputs and visual implications for this subject." action={<div className="flex gap-2"><Status imported={imported} /><button className="button-secondary" onClick={open ? onClose : onOpen}>{open ? "Close import" : "Import Research Report"}</button></div>} />{open && <ImportPanel title="Import Research Report" description={`Paste a report for ${subject.name}. It is validated before replacing current research.`} json={json} errors={errors} onJson={onJson} onImport={onImport} />}<Panel className="mb-6 border-[#d6c39d] bg-[#fffcf5]"><p className="eyebrow">Next step</p><h3 className="mt-1 text-xl font-semibold">Prepare Art Direction</h3><p className="mt-2 text-sm text-stone-600">Open the Art Direction handoff. No decision is generated here.</p><button className="button-primary mt-5" onClick={onPrepare}>Prepare Art Direction</button></Panel><Panel><p className="eyebrow">Summary</p><p className="mt-3 text-lg leading-8 text-stone-700">{report.summary}</p><p className="mt-4 text-sm text-stone-600">Overall confidence: {nice(report.overallConfidence.level)}</p></Panel><div className="mt-6 grid gap-6 xl:grid-cols-2"><List title="Claims" items={report.claims.map((claim) => claim.statement)} /><List title="Visual properties" items={report.visualProperties.map((property) => `${property.name}: ${property.description}`)} /><List title="Visual opportunities" items={report.opportunities.map((opportunity) => opportunity.description)} /><List title="Risks" items={report.risks.map((risk) => `${risk.description}: ${risk.reason}`)} /></div></>; }
function Direction({ subject, decisions, brief, imported, stale, open, json, errors, onOpen, onClose, onJson, onImport, onCopy, onPrepare }: { subject: Subject; decisions: ArtDirectionDecision[]; brief: string; imported: boolean; stale: boolean; open: boolean; json: string; errors: string[]; onOpen: () => void; onClose: () => void; onJson: (value: string) => void; onImport: () => void; onCopy: () => void; onPrepare: () => void }) { return <><Header eyebrow="Art Direction" title="Deliberate visual choices" description="Bring externally prepared decisions into the workspace." action={<div className="flex gap-2"><Status imported={imported} stale={stale} /><button className="button-secondary" onClick={open ? onClose : onOpen}>{open ? "Close import" : "Import Art Direction"}</button></div>} />{stale && <Notice>Research changed after these decisions were created. Previous decisions are preserved for comparison; import refreshed Art Direction before relying on them.</Notice>}<Panel className="mb-6 border-[#d6c39d] bg-[#fffcf5]"><p className="eyebrow">Manual handoff</p><h3 className="mt-1 text-xl font-semibold">Prepare Art Direction</h3><p className="mt-2 text-sm text-stone-600">Copy the current research and Production Knowledge Library brief, use an external AI tool, then paste its JSON result here.</p><div className="mt-5 flex gap-2"><button className="button-primary" onClick={onCopy}>Copy Art Direction Brief</button><button className="button-secondary" onClick={onOpen}>Import Art Direction</button></div><label className="detail-label mt-6 block">Brief preview<textarea className="input mt-2 min-h-80 font-mono text-xs" value={brief} readOnly spellCheck={false} /></label></Panel>{open && <ImportPanel title="Import Art Direction" description={`Paste ArtDirectionDecision[] for ${subject.name}. References are checked against current research and knowledge.`} json={json} errors={errors} onJson={onJson} onImport={onImport} />}<Panel className="mb-6 border-[#d6c39d] bg-[#fffcf5]"><p className="eyebrow">Next step</p><h3 className="mt-1 text-xl font-semibold">Prepare Shot Plan</h3><button className="button-primary mt-5" onClick={onPrepare}>Prepare Shot Plan</button></Panel><div className="space-y-5">{decisions.map((decision) => <Panel key={decision.id}><h3 className="font-serif text-2xl">{decision.title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{decision.reasoning}</p><div className="mt-5 grid gap-5 md:grid-cols-3"><Detail label="Expected outcome" value={decision.expectedOutcome} /><Detail label="Visual goals" value={decision.selectedVisualGoalIds.map(nice).join(" · ")} /><Detail label="Techniques" value={decision.selectedTechniqueIds.map(nice).join(" · ")} /></div></Panel>)}</div></>; }
function ShotPlanning({ plan, selected, statuses, imported, stale, open, json, errors, onOpen, onClose, onJson, onImport, onCopy, onWork }: { plan: ShotPlan; selected?: string; statuses: Record<string, ShotStatus>; imported: boolean; stale: boolean; open: boolean; json: string; errors: string[]; onOpen: () => void; onClose: () => void; onJson: (value: string) => void; onImport: () => void; onCopy: () => void; onWork: (id: string) => void }) {
  return <><Header eyebrow="Shot Plan" title="Production cards" description="Bring externally prepared shot planning into the workspace." action={<div className="flex gap-2"><Status imported={imported} stale={stale} /><button className="button-secondary" onClick={open ? onClose : onOpen}>{open ? "Close import" : "Import Shot Plan"}</button></div>} />{stale && <Notice>Research or Art Direction changed after this plan was created. The previous plan is preserved, but needs a refreshed import.</Notice>}<Panel className="mb-6 border-[#d6c39d] bg-[#fffcf5]"><p className="eyebrow">Manual handoff</p><h3 className="mt-1 text-xl font-semibold">Prepare Shot Plan</h3><p className="mt-2 text-sm text-stone-600">Copy current research, decisions, and relevant production techniques for an external AI tool.</p><div className="mt-5 flex gap-2"><button className="button-primary" onClick={onCopy}>Copy Shot Plan Brief</button><button className="button-secondary" onClick={onOpen}>Import Shot Plan</button></div></Panel>{open && <ImportPanel title="Import Shot Plan" description="Paste one ShotPlan object. References are checked against current workspace data." json={json} errors={errors} onJson={onJson} onImport={onImport} />}<div className="grid gap-5 xl:grid-cols-2">{plan.shots.map((candidate) => {
    const isCurrent = candidate.id === selected;
    const status = statuses[candidate.id] ?? "not-started";
    return <article key={candidate.id} className={`panel ${isCurrent ? "border-[#b7873e] ring-1 ring-[#d6bd8e]" : ""}`}><div className="flex flex-wrap items-center justify-between gap-2"><p className="eyebrow">{candidate.shotType}</p><div className="flex flex-wrap gap-2">{isCurrent && <span className="badge">Current shot</span>}<span className={`badge shot-status-${status}`}>{nice(status)}</span></div></div><h3 className="mt-1 text-xl font-semibold">{candidate.title}</h3><p className="mt-3 text-sm text-stone-600">{candidate.purpose}</p><p className="mt-3 text-sm text-stone-600">{candidate.lighting}</p><button className={`${isCurrent ? "button-secondary" : "button-primary"} mt-5`} onClick={() => onWork(candidate.id)}>{isCurrent ? "Continue working" : "Work on this shot"}</button></article>;
  })}</div></>;
}
function Generate({ subject, shot, prompt, preparedAttempt, result, attempts, stale, onPrompt, onUpload }: { subject: Subject; shot: Shot; prompt: string; preparedAttempt?: PreparedGenerationAttempt; result?: Result; attempts: GenerationAttemptRecord[]; stale: boolean; onPrompt: (value: string) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) { const nextAttemptNumber = preparedAttempt?.attempt.attemptNumber ?? attempts.length + 1; return <>{stale && <Notice>This Shot Plan needs refresh. Its prompt is retained for comparison but is stale.</Notice>}<Header eyebrow="Generate" title={shot.title} description="Copy the prompt, generate externally, then return with the image." action={<span className="badge">Attempt {nextAttemptNumber}</span>} /><div className="grid gap-6 xl:grid-cols-2"><Panel><Detail label="Subject" value={`${subject.name} — ${shot.subjectState}`} /><Detail label="Purpose" value={shot.purpose} /><Detail label="Lighting" value={shot.lighting} /></Panel><Panel><button className="button-secondary float-right" onClick={() => copy(prompt)}>Copy prompt</button><p className="eyebrow">Generation prompt for Attempt {nextAttemptNumber}</p><textarea className="input mt-5 min-h-64" value={prompt} readOnly={Boolean(preparedAttempt)} onChange={(event) => onPrompt(event.target.value)} /><p className="mt-3 text-xs text-stone-500">{preparedAttempt ? "This human-applied revised prompt is fixed for this prepared attempt." : "No provider request is made by this workspace."}</p><label className="button-primary mt-5 inline-flex cursor-pointer">Choose image for Attempt {nextAttemptNumber}<input className="sr-only" type="file" accept="image/*" onChange={onUpload} /></label>{result && <img className="mt-5 max-h-80 w-full object-contain" src={result.url} alt={result.name} />}</Panel></div><AttemptHistory attempts={attempts} /></>; }
function Review({ subject, report, decisions, shot, attempt, attempts, review, stale, open, json, errors, onOpen, onClose, onJson, onImport, onReview, onAcceptedRevisions, onPrepareRevision, onRevisedPrompt, onApplyRevisedPrompt, onGenerate }: { subject: Subject; report: ResearchReport; decisions: ArtDirectionDecision[]; shot: Shot; attempt?: GenerationAttemptRecord; attempts: GenerationAttemptRecord[]; review: ReviewState; stale: boolean; open: boolean; json: string; errors: string[]; onOpen: () => void; onClose: () => void; onJson: (value: string) => void; onImport: () => void; onReview: (patch: Partial<ReviewState>) => void; onAcceptedRevisions: (ids: string[]) => void; onPrepareRevision: () => void; onRevisedPrompt: (value: string) => void; onApplyRevisedPrompt: (value: string, ids: string[]) => void; onGenerate: () => void }) {
  if (!attempt) return <><Header eyebrow="Review" title="Awaiting a generated result" description="Upload an externally generated image first." /><Panel><button className="button-primary" onClick={onGenerate}>Go to Generate</button></Panel></>;
  const brief = criticBrief({ subject, report, decisions, shot, asset: attempt.asset, prompt: attempt.promptArtifact.prompt });
  const evaluation = attempt.evaluation;
  const acceptedRevisionIds = attempt.acceptedRevisionIds ?? [];
  const acceptedSuggestions = evaluation?.recommendations.filter((suggestion) => acceptedRevisionIds.includes(suggestion.id)) ?? [];
  const handoff = revisionBrief({ subject, report, decisions, shot, prompt: attempt.promptArtifact.prompt, acceptedSuggestions });
  const revisedPrompt = attempt.revisedPrompt ?? "";
  const recordFor = (verdict: Verdict): ReviewRecord => ({ id: `${attempt.asset.id}-human-review`, subjectId: subject.id, targetType: "generated_asset", targetId: attempt.asset.id, status: verdict === "approved" ? "approved" : "rejected", reviewerType: "human", notes: review.notes || undefined, corrections: [], createdAt: new Date().toISOString() });
  return <><Header eyebrow="Review" title={`Review — ${shot.title}`} description="Human review remains authoritative; Critic output is advisory." action={<div className="flex gap-2"><span className="badge">Attempt {attempt.attempt.attemptNumber}</span><Status imported={Boolean(evaluation)} stale={stale && Boolean(evaluation)} /></div>} />
    {stale && evaluation && <Notice>Research, Art Direction, or Shot Plan changed after this evaluation was imported. It is preserved as history but is stale.</Notice>}
    <div className="grid gap-6 xl:grid-cols-2"><Panel><img className="max-h-[600px] w-full object-contain" src={attempt.result.url} alt={attempt.result.name} /></Panel><Panel><p className="eyebrow">Human review</p><div className="mt-3 flex gap-2">{(["approved", "revise", "rejected"] as Verdict[]).map((verdict) => <button key={verdict} className="button-secondary" onClick={() => onReview({ verdict, record: recordFor(verdict) })}>{nice(verdict)}</button>)}</div><label className="detail-label mt-5 block">Notes<textarea className="input mt-2 min-h-24 font-normal" value={review.notes} onChange={(event) => onReview({ notes: event.target.value })} /></label></Panel></div>
    <Panel className="mt-6 border-[#d6c39d] bg-[#fffcf5]"><p className="eyebrow">Manual Critic Handoff</p><h3 className="mt-1 text-xl font-semibold">Prepare AI Critic Review</h3><p className="mt-2 text-sm text-stone-600">Supply this attempt’s image to the external AI alongside the copied brief. No local image data is copied.</p><div className="mt-5 flex flex-wrap gap-2"><button className="button-primary" onClick={() => copy(brief)}>Prepare Critic Brief</button><button className="button-secondary" onClick={() => copy(brief)}>Copy Critic Brief</button><button className="button-secondary" onClick={open ? onClose : onOpen}>{open ? "Close import" : "Import Evaluation"}</button></div><label className="detail-label mt-6 block">Critic brief preview<textarea className="input mt-2 min-h-96 font-mono text-xs" value={brief} readOnly spellCheck={false} /></label></Panel>
    {open && <ImportPanel title="Import Evaluation" description={`Paste one EvaluationResult for asset ${attempt.asset.id}. Asset, shot, decision, criterion, and technique references are validated.`} json={json} errors={errors} onJson={onJson} onImport={onImport} />}
    {evaluation && <EvaluationDisplay evaluation={evaluation} criteria={evaluationCriteriaForShot(shot)} />}
    {evaluation && evaluation.recommendations.length > 0 && <Panel className="mt-6 border-[#d6c39d] bg-[#fffcf5]"><p className="eyebrow">Manual Revision Handoff</p><h3 className="mt-1 text-xl font-semibold">Prepare revised generation</h3><p className="mt-2 text-sm text-stone-600">Select only the Critic suggestions the human accepts. The external rewrite must be a complete prompt, not an appended requirements block.</p><div className="mt-4 space-y-4">{evaluation.recommendations.map((suggestion) => <div key={suggestion.id} className="rounded-lg border border-[#dedad3] p-4"><label className="mb-3 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={acceptedRevisionIds.includes(suggestion.id)} onChange={(event) => onAcceptedRevisions(event.target.checked ? [...acceptedRevisionIds, suggestion.id] : acceptedRevisionIds.filter((id) => id !== suggestion.id))} /> Accept this suggestion</label><Detail label="Reason" value={suggestion.issue} /><Detail label="Affected shot fields" value={suggestion.affectedShotFields.join(" · ") || "None specified"} /><Detail label="Requested change" value={suggestion.suggestedChange} /></div>)}</div><button className="button-secondary mt-5" onClick={onPrepareRevision}>Prepare Revised Prompt</button>{attempt.revisionBriefPrepared && <><p className="mt-5 text-sm text-stone-600">Copy this brief to an external writing tool, then paste its prompt-only rewrite below. Rejected or unselected suggestions are excluded.</p><div className="mt-4 flex flex-wrap gap-2"><button className="button-primary" onClick={() => copy(handoff)}>Copy Revision Brief</button></div><label className="detail-label mt-5 block">Revision brief preview<textarea className="input mt-2 min-h-96 font-mono text-xs" value={handoff} readOnly spellCheck={false} /></label><label className="detail-label mt-5 block">Externally rewritten prompt<textarea className="input mt-2 min-h-48" value={revisedPrompt} onChange={(event) => onRevisedPrompt(event.target.value)} placeholder="Paste or edit one complete rewritten generation prompt." /></label><button className="button-primary mt-4" disabled={!revisedPrompt.trim()} onClick={() => onApplyRevisedPrompt(revisedPrompt.trim(), acceptedRevisionIds)}>Apply revised prompt for Attempt {attempt.attempt.attemptNumber + 1}</button></>}</Panel>}
    <AttemptHistory attempts={attempts} />
  </>;
}
function AttemptHistory({ attempts }: { attempts: GenerationAttemptRecord[] }) {
  if (!attempts.length) return null;
  return <Panel className="mt-6"><p className="eyebrow">Attempt history</p><div className="mt-4 space-y-5">{attempts.map((item) => <article className="rounded-lg border border-[#dedad3] p-4" key={item.attempt.id}><div className="flex flex-wrap items-center gap-2"><span className="badge">Attempt {item.attempt.attemptNumber}</span><span className="text-sm text-stone-600">{item.result.name} · {item.asset.id}</span></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Detail label="Prompt artifact" value={`Version ${item.promptArtifact.version} · ${item.promptArtifact.reason}`} /><Detail label="Evaluation" value={item.evaluation ? `Imported · score ${item.evaluation.overallScore}` : "Not imported"} /></div><label className="detail-label mt-4 block">Exact prompt used<textarea className="input mt-2 min-h-24 text-sm" value={item.promptArtifact.prompt} readOnly /></label>{item.acceptedRevisionIds !== undefined && <Detail label="Human-accepted Critic suggestions" value={item.acceptedRevisionIds.length ? item.acceptedRevisionIds.join(" · ") : "None"} />}{item.revisedPrompt && <label className="detail-label mt-4 block">Imported rewrite retained on source attempt<textarea className="input mt-2 min-h-24 text-sm" value={item.revisedPrompt} readOnly /></label>}<img className="mt-4 max-h-64 w-full object-contain" src={item.result.url} alt={`Attempt ${item.attempt.attemptNumber}: ${item.result.name}`} /></article>)}</div></Panel>;
}
function EvaluationDisplay({ evaluation, criteria }: { evaluation: EvaluationResult; criteria: ReturnType<typeof evaluationCriteriaForShot> }) { const criterionMap = new Map(criteria.map((criterion) => [criterion.id, criterion])); return <Panel className="mt-6"><p className="eyebrow">Imported Critic evaluation</p><div className="mt-4 grid gap-5 md:grid-cols-2"><Detail label="Overall score" value={String(evaluation.overallScore)} /><Detail label="Confidence" value={[evaluation.confidence.level, evaluation.confidence.score === undefined ? undefined : `score ${evaluation.confidence.score}`, evaluation.confidence.rationale].filter(Boolean).join(" · ")} /></div><List title="Issues found" items={evaluation.issues} /><div className="mt-5 space-y-4">{evaluation.criteriaResults.map((result) => <div className="rounded-lg border border-[#dedad3] p-4" key={result.criterionId}><p className="font-medium">{criterionMap.get(result.criterionId)?.title ?? result.criterionId} — {nice(result.status)} ({result.score})</p><p className="mt-2 text-sm text-stone-600">{criterionMap.get(result.criterionId)?.description}</p><List title="Evidence / observations" items={result.findings} /></div>)}</div>{evaluation.recommendations.length > 0 && <List title="Revision suggestions" items={evaluation.recommendations.map((suggestion) => `${suggestion.issue}: ${suggestion.suggestedChange}`)} />}</Panel>; }
function Export({ plan, shot, result, review, onSelect }: { plan: ShotPlan; shot: Shot; result?: Result; review: ReviewState; onSelect: (id: string) => void }) { return <><Header eyebrow="Export" title="Production handoff" description="Export files are not persisted in this MVP." /><Panel><p>Selected shot: <b>{shot.title}</b></p><p className="mt-2 text-sm text-stone-600">Result: {result ? "attached" : "none"} · Review: {review.verdict ? nice(review.verdict) : "not reviewed"}</p><div className="mt-5 flex flex-wrap gap-2">{plan.shots.map((candidate) => <button className="button-secondary" onClick={() => onSelect(candidate.id)} key={candidate.id}>{candidate.title}</button>)}</div></Panel></>; }
function List({ title, items }: { title: string; items: string[] }) { return <Panel><p className="eyebrow">{title}</p><Bullets items={items} /></Panel>; }
function Empty() { return <><Header eyebrow="Shot Plan" title="No shot selected" description="Import a Shot Plan containing at least one shot before continuing." /><Panel><p className="text-sm text-stone-600">There is no current shot available for this stage.</p></Panel></>; }
