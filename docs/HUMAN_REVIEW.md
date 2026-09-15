# Human Review Model v1

Human review is a first-class part of a creative AI workflow. Research, visual decisions, shots, and generated assets can be plausible while still being inaccurate, misleading, or unsuitable for a project's intended interpretation. A `ReviewRecord` makes that intervention traceable without overwriting the original domain object.

## Review targets and status

A review can target a research report, research claim, visual property, art-direction decision, shot, or generated asset. Its status distinguishes:

- **pending**: review is requested but no conclusion has been recorded;
- **approved**: the target is accepted as-is for the current workflow stage;
- **rejected**: the target should not proceed in its current form;
- **edited**: a reviewer proposes a concrete correction while retaining the original value for audit.

Both human and AI reviewers are representable, but an AI review is not a replacement for human authority or source-backed research.

## Rejection versus correction

Rejection stops a target from being used as-is. Correction is more precise: `ReviewCorrection` records a field, its old value, proposed new value, and the reason for the change. It preserves the reviewer’s expertise in a reusable form—for example, a reviewer can clarify that a visual property is an observational aid rather than a geological assertion.

The current mock record corrects a Mookaite visual-property description. It is demonstration-only and does not mutate the mock report. A future application service can apply approved corrections into a new version of a report or decision, preserving both the original and review history.

## Agents, approval, and continuation

`AgentResult` and `AgentContext` can carry review-reference IDs. Pipeline checkpoints can carry `reviewRecordIds`, and `PipelineContext` can declare a `PipelineContinuation` with a previous execution ID, approved checkpoint, and review references. This gives a future orchestration layer the information required to resume after approval without making review a provider-specific concern.

The current in-memory pipeline still returns a partial result when approval is pending; it does not persist or resume executions. Those are intentionally future application responsibilities.

## Future persistence requirements

A persistent workflow should store immutable review records, target versions, reviewer identity and authorization, timestamps, correction application history, and the execution/checkpoint being approved. It should validate that target IDs belong to the reviewed subject and that only authorized reviewers can approve or reject a stage. The v1 domain model defines the data shape but does not add a database or authentication system.
