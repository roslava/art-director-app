# Art Director architecture

## Product concept

Art Director is an AI-assisted workspace for planning, producing, reviewing, and exporting visual work. It keeps factual subject research distinct from creative direction so the work can be expressive and faithful. The first project is the Samotsvety mineral catalog; the model is intentionally subject-agnostic for future products, objects, places, and campaigns.

## Domain model

`Project → Subject → Research + ShotPlan → Shot → GeneratedAsset → Review`

A project groups subjects and export targets. Each subject has research and one or more shot plans. A shot plan contains explicit shots, each of which can produce generated assets. Reviews attach to generated assets. The model is defined in `src/domain/schemas.ts` and uses free-form `shotType` strings so shot types can be proposed per project instead of being constrained to mineral terminology.

Production Knowledge Model v1 adds reusable `VisualGoal` and `ProductionTechnique` contracts. Decision Layer v1 makes the subject-specific rationale explicit:

`SOURCE → CLAIM → RESEARCH REPORT → ART DIRECTION DECISION → GOAL → METHOD → SHOT → IMAGE → CRITIQUE`

`Research Knowledge`

`↓`

`Research Agent`

`↓`

`Research Report`

`↓`

`Decision Layer`

`↓`

`Shot Planner Agent`

`↓`

`Shot Planning`

Research Knowledge Model v1 adds structured `ResearchSource`, `ResearchClaim`, `VisualProperty`, `VisualOpportunity`, `VisualRisk`, and `ResearchReport` contracts in `src/domain/research/`. A Subject can hold multiple `researchReports`, separating traceable claims and observable properties from art-direction interpretation. An `ArtDirectionDecision` records why those facts warrant selected goals and techniques, along with rejected techniques, expected outcomes, risks, and confidence. Visual goals explain why an image is required; techniques are generic problem-solving methods grouped by flexible string categories such as lighting, optics, environment, composition, and capture. A Shot references the decision(s) that produced it as well as its research facts, goals, and techniques, while retaining its existing human-readable lighting, composition, background, camera, and prompt fields. It also has shot-level success criteria, risks, overrides, and production notes. The initial knowledge records live in `src/domain/knowledge/`; sample decisions live in `src/domain/decisions.ts`; all validate through the domain schemas.

Mock Agent Pipeline v1 lives in `src/domain/pipeline/`. It injects agents through the domain interfaces, passes a research report to the Art Director Agent and decisions to the Shot Planner Agent, and captures observable per-step results. Mock agents use only existing validated fixture data. The runtime can pause at optional approval checkpoints without coupling agents to UI, authentication, persistence, or a provider.

Human Review Model v1 lives in `src/domain/review/`. `ReviewRecord` targets research, decisions, shots, or generated assets without mutating them; corrections retain old and proposed values with a reason. Agent and pipeline contracts can carry review references and continuation metadata so a future application layer can resume an approved workflow after persistence is introduced.

Evaluation and Critic Model v1 lives in `src/domain/evaluation/`. It evaluates an asset against the visual intent encoded by linked decisions and shots: `Decision → Shot → Asset → Evaluation → Revision`. The Critic Agent returns structured `EvaluationResult` records with criterion scores, issues, confidence, and revision suggestions instead of a free-form critique.

Generation Model v1 lives in `src/domain/generation/`. It separates versioned prompts, generation requests, iterative attempts, and generated assets. The pipeline can optionally continue from `ShotPlan → Generation → Evaluation` through injected GeneratorAgent and CriticAgent contracts.

Provider Abstraction v1 lives in `src/domain/providers/`. Agents remain the reasoning and domain-transformation layer; providers are vendor-neutral execution contracts. A `ResearchAgent` may transform raw `ResearchProvider` output into a validated `ResearchReport`. A `GeneratorAgent` prepares a `GenerationRequest` and `PromptArtifact`, delegates execution to an `ImageProvider`, and maps its result into domain generation records. This creates an explicit boundary:

`Domain Agent → Provider Layer → External System`

## Application layers

- `src/app`: App Router routes, metadata, and presentation.
- `src/domain`: Zod schemas, inferred TypeScript types, and mock data.
- `src/domain/providers`: vendor-neutral image and research execution contracts plus offline mock implementations.
- Future `src/services`: use cases such as research synthesis, prompt construction, generation, critique, and export coordination.
- Future provider adapters: external AI, research, and media-generation integrations that implement the domain provider contracts.

The current page is server-rendered from local mock data. There is no database, auth flow, API route, or browser-side API integration.

## Provider boundary

External-service payloads are not domain objects. Provider adapters return only raw research or image references with execution metadata; agents translate that data into domain-shaped records and validate it before it reaches a report, decision, shot, asset, or UI. This lets a future external, local, human-operated, or test provider be replaced without coupling the domain model to a vendor.

## Future persistence layer

Repositories should be introduced at the application-service boundary, with interfaces for projects, subjects, shot plans, assets, and reviews. The UI and domain schemas should not depend on a particular database. The mock-data module can be replaced by a repository implementation without changing the rendering model.

## Zod validation for AI outputs

AI output is untrusted input. Zod schemas provide a single runtime contract for tool responses, imported data, and future persisted records. Validate model output before it affects prompt execution, status transitions, exports, or user-visible facts; preserve validation failures for repair rather than silently accepting malformed content.

## Facts versus art direction

Research records observable or sourced facts, including confidence and source information. Art direction turns approved facts into decisions about framing, lighting, mood, and emphasis. Creative instructions may interpret facts, but must not overwrite them: visual risks from research remain constraints on the shot plan and critique process.

Production knowledge sits between fact and shot: it does not assert that a subject always needs a given treatment. Instead it records reusable relationships, for example that raking side light can help reveal surface relief and can also exaggerate shadows. The Decision Layer applies those relationships to subject-specific facts without overwriting the facts themselves. Future selection services may create decisions from approved facts and visual goals, while the future Critic evaluates generated assets against the linked decisions and a Shot's success criteria and risks.
