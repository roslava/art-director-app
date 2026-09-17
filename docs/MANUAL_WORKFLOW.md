# Manual Intelligence Handoff

This browser-local workspace makes no API or provider request. There is no database or authentication. Imported data, prompts, uploaded image URLs, review decisions, and version history exist only in the current browser session and disappear on refresh.

The production path is `Create Subject → Research → Art Direction → Shot Plan → external image generation → upload image → Result review → Export`.

## Start a workspace

The application opens at Home, not in a fixture. Enter one **Subject** name and choose **Create workspace**. A Subject is the thing being visually investigated or art-directed; it can be a mineral, an object, a product, or another visual subject. A Workspace is the browser-local pipeline state associated with that Subject.

New workspaces begin at Research with no Research Report, Art Direction decisions, shot plan, prompts, or generated assets. Recent subjects on Home reopen their saved browser-local workspace. Fixture subjects remain development-only and are never shown as recent user work.

The basic local lifecycle is `Create workspace → Resume workspace → Delete workspace`. The secondary actions menu beside a Recent subject contains **Delete workspace**. Deletion requires a confirmation naming the Subject, then permanently removes that Subject and all of its locally stored pipeline state. There is no undo or recovery in the current local-first version.

## Manual-first Research

Research starts empty for every subject. The workspace never treats fixture, placeholder, or sample material as subject research.

Choose **Create Research Brief** to copy a structured request for factual visual research. It asks for material identity, morphology, colour, transparency, luster, surface behaviour, inclusions and optical effects, raw/broken/cut/polished/faceted states, material behaviour under relevant light, scale, diagnostic features, misconceptions, uncertainty, and sources. It explicitly excludes composition, mood, background, lens, framing, lighting setup, and shot design.

Use **Import Research Report** to paste one `ResearchReport` JSON object. It must have the selected `subjectId`, a summary, claims, visual properties, opportunities, risks, uncertainties, sources, and overall confidence. The importer rejects malformed JSON, schema errors, subject mismatches, and claim/property/uncertainty source IDs that are missing from `sources[]`. A valid report is retained in the browser-local subject workspace for the current session and rendered as the factual Research record.

**Prepare Art Direction** is unavailable until a valid report exists. Its copied handoff is constructed from that persisted report only; it never falls back to sample research.

## Result review and new versions

After an image is uploaded, **Result review** is the only required evaluation step. The screen keeps the image large, shows the short shot goal, and asks: **Can this image be used?**

`Result → Accept`

The asset is marked accepted. No extra form is required.

`Result → Revise → revision prompt → new version → result review`

Enter **What to preserve** and **What to fix**. Optional quick categories (mineral plausibility, form and structure, color, light, background, composition, stone processing, and generation artifacts) only organize the note; they are never ratings or required fields. The workspace builds a copy-ready prompt that separates the preserved features, fixes, shot goal, linked scientific and visual constraints, and the instruction to create a new version from the current image.

`Result → Create again → new prompt → new version → result review`

Enter why the result is unsuitable and which errors must not recur. The prompt starts from the original shot goal and constraints, explicitly rejects the current image as a visual basis, and does not carry forward preservation instructions.

For either non-accept outcome, copy the prepared prompt on **Generate**, use an external image generator, and upload the result. Uploading completes the prepared next version. The preceding image, its exact prompt, its decision, and its link to the next version remain in the attempt history; no result or prompt is overwritten.

## Earlier manual handoffs

Use **Prepare Art Direction** to copy the persisted Research Report and Production Knowledge Library to an external decision-making process, then import its `ArtDirectionDecision[]`. Claims, visual goals, and techniques are checked against the current report and local Production Knowledge Library. Use **Prepare Shot Plan** the same way; its `ShotPlan` must match the selected subject and all research, decision, goal, and technique references are checked.

In **Generate**, copy the editable prompt to an external image generator and upload its image. Each upload creates a new in-memory generation attempt with an immutable copy of the exact prompt used. Editing a future prompt never changes a prior attempt’s prompt.

The domain still contains the optional structured `EvaluationResult` contract for future AI analysis. It is not part of the everyday decision flow and does not approve, reject, rewrite, or overwrite a human result decision.
