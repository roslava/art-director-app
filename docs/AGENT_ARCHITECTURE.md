# Agent Architecture v1

Agent Architecture v1 defines domain contracts only. It does not select an AI provider, make network calls, add a UI, or persist data.

## Agents transform domain objects

Each agent receives a typed request plus an `AgentContext` and returns `Promise<AgentResult<T>>`. The agent contracts describe transformations between existing domain models:

`ResearchAgent: subject + source candidates → ResearchReport`

`ArtDirectorAgent: ResearchReport + knowledge library → ArtDirectionDecision[]`

`ShotPlannerAgent: decisions + knowledge library → ShotPlan`

`CriticAgent: shot + generated assets + decisions → Review[]`

The request carries the inputs required for one transformation. It does not expose a database, HTTP client, SDK, API key, or provider-specific prompt type.

## Provider independence

`ResearchAgent`, `ArtDirectorAgent`, `ShotPlannerAgent`, and `CriticAgent` are interfaces. Future implementations can include `OpenAIResearchAgent`, `ClaudeResearchAgent`, `HumanResearchAgent`, or `MockResearchAgent` without changing `ResearchReport`, decisions, shots, or reviews.

An implementation belongs in a future service/provider layer. It can translate its provider payload into the domain output, validate that output with the existing Zod schemas, and then return the same `AgentResult<T>` required by the interface. Provider choice is therefore an implementation detail rather than a dependency of the domain model.

## Reasoning metadata

`AgentResult<T>` wraps the final `data` with reasoning metadata: an explanation, assumptions, uncertainties, evidence IDs, confidence, warnings, optional approval state, and typed metadata. The final value alone is insufficient for a reviewable production workflow. This metadata lets a later user understand what the agent used, what it inferred, and where it remains uncertain.

Reasoning is not automatically a fact. Research claims remain source-linked domain records; visual decisions remain separate from claims; a result's explanation is reviewable process metadata.

## Human approval between agents

`AgentContext` and `AgentResult` both support an optional `AgentApproval`. A future orchestration service can stop after research, submit the report for approval, then pass an approved context to the Art Director Agent. The same pattern can gate decisions before shot planning or critique before revision.

This allows a human to insert review without changing an agent interface or tightly coupling agents to authentication, UI state, or persistence. Approval policy remains a future application concern.
