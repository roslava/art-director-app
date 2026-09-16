# Manual Intelligence Handoff

This browser-local workspace makes no API or provider request. There is no database or authentication. All imported data, prompts, uploaded image URLs, evaluations, revisions, and review records exist only in the current browser session and disappear on refresh.

The complete workflow is:

Research → external AI → Art Direction → external AI → Shot Plan → external image generation → upload image → external AI Critic → import Evaluation → human decision → revision → next generation attempt.

Import a `ResearchReport` for the selected subject. It is validated before it replaces current Research. Use **Prepare Art Direction** to copy a current-state brief to an external AI and import its `ArtDirectionDecision[]`. Claims, visual goals, and techniques are checked against the current report and local Production Knowledge Library. Use **Prepare Shot Plan** the same way; its `ShotPlan` must match the selected subject and all research, decision, goal, and technique references are checked.

In **Generate**, copy the editable prompt to an external image generator and upload its image. Each upload creates a new in-memory generation attempt with its own generated-asset identifier and an immutable copy of the exact prompt used. Editing the next prompt never changes a prior attempt’s prompt.

In **Review**, the human can always select Approved, Revise, or Rejected and write Notes. This remains the authoritative review. It is not changed automatically by a Critic import.

Use **Prepare Critic Brief** (or **Copy Critic Brief**) to copy a brief created only from the current workspace: selected subject research, the current shot’s referenced Art Direction decisions, shot intent and risks, the exact attempt prompt, asset identifiers, and shot-specific evaluation criteria. Upload/supply the image separately to the external AI; local image data is never copied. The brief requires JSON-only output and includes the runtime `EvaluationResult` JSON Schema.

Use **Import Evaluation** to paste the Critic JSON. It is Zod-validated as an `EvaluationResult`. The asset and shot must match the displayed attempt; decision IDs must belong to the current shot; criterion IDs must be among the supplied shot criteria; and affected technique IDs must belong to the shot. Invalid or cross-shot/asset results are rejected with validation errors. A successful import is marked **Imported ✓** and rendered as a readable score, confidence, criteria findings, issues, and revision suggestions.

Critic output is advisory. It never approves or rejects the image, overwrites human Notes, or mutates Research, Art Direction, or Shot Plan. Suggestions begin unselected: the human explicitly selects only the suggestions to accept.

Use **Prepare Revised Prompt** to prepare the **Manual Revision Handoff**. Its brief contains the original attempt prompt, current Shot intent and success criteria, only the human-accepted suggestions, and relevant Research, Art Direction, and production constraints. It instructs the external writing tool to return one complete coherent generation prompt, without commentary. Unselected or rejected Critic suggestions are never included in this brief.

Use **Copy Revision Brief**, obtain the external rewrite, and paste or edit it in **Externally rewritten prompt**. The human must explicitly choose **Apply revised prompt for Attempt N**. Applying creates an in-memory prepared `GenerationAttempt` and versioned `PromptArtifact` for the next attempt; it does not alter Attempt 1. In **Generate**, the prepared prompt is displayed as the fixed prompt for the next compact attempt indicator (for example, Attempt 2). Generate externally and upload the next image to complete that attempt.

Attempt history retains the exact prompt artifact, uploaded asset, and imported evaluation for every completed attempt. The source attempt also retains its human-accepted suggestion IDs and imported rewrite, so Attempt 1 and Attempt 2 can be reviewed together without overwriting either prompt or asset.

If Research, Art Direction, or the Shot Plan is imported after a Critic evaluation, the evaluation is visibly marked **Needs refresh**. It remains preserved as historical evidence rather than silently appearing current.
