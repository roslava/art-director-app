# Mock Agent Pipeline v1

The pipeline runtime orchestrates typed agent interfaces. It does not reason about the subject, select a provider, construct provider prompts, or make network calls.

## Flow

`ResearchAgent → ResearchReport → ArtDirectorAgent → ArtDirectionDecision[] → ShotPlannerAgent → ShotPlan`

`AgentPipeline` receives injected `ResearchAgent`, `ArtDirectorAgent`, and `ShotPlannerAgent` implementations, a subject, optional project context, and the production knowledge library. It passes the output domain object from one agent to the next and records the process in a `PipelineRunResult`.

## Observability

Each run retains an execution ID, subject ID, execution metadata, partial or complete outputs, warnings, confidence by agent, human-approval state, and per-step records. Each step stores the agent name, concise input and output summaries, reasoning, confidence, warnings, approval requirement, and result metadata. The runtime intentionally summarizes inputs and outputs rather than retaining a large provider payload.

## Mock implementations

`MockResearchAgent`, `MockArtDirectorAgent`, and `MockShotPlannerAgent` validate and return the existing Chrysoberyl fixture report, decisions, and shot plan. They do not call AI, browse, create facts, or create new shots. Their value is architectural: they demonstrate that the contracts can execute end-to-end and that outputs preserve reasoning and traceability.

`runChrysoberylMockPipeline` is the fixture example. `runMockPipelineDemo` is a small callable demonstration that returns only the subject name, counts for research claims, decisions, and shots, plus concise confidence levels.

## Approval checkpoints

`PipelineContext.approvalCheckpoints` supports optional checkpoints after research and after decisions. A checkpoint is inactive unless `approvalRequired` is true. If required approval is absent or not `approved`, the pipeline returns a partial `PipelineRunResult` with status `awaiting-approval`; it does not invoke the next agent. A future application service can collect human approval and resume with an approved context, without changing agent interfaces or adding approval concerns to an AI provider.

## Future providers

The runtime depends only on `ResearchAgent`, `ArtDirectorAgent`, and `ShotPlannerAgent` interfaces. A future OpenAI, Claude, human, or test implementation can replace a mock agent through injection. That implementation must validate provider output against the existing domain Zod schemas before it returns an `AgentResult<T>`.
