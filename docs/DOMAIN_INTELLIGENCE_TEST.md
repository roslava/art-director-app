# Domain Intelligence Test v1

This test adds Mookaite as a second mock/sample fixture and runs it through the same injected mock-agent pipeline as Chrysoberyl. It tests whether the domain model can preserve a different visual strategy without adding subject-specific conditions to the pipeline.

## Why strategy must differ by subject

The fixtures deliberately select different goals, methods, risks, and shot purposes:

- Chrysoberyl emphasizes mock/sample translucency, crystal geometry, and surface relief. Its strategy includes transmitted backlight, macro coverage, edge detail, raking side light, and focus-stack capture. Its risks include glass-like appearance, glow, and exaggerated relief.
- Mookaite emphasizes mock/sample pattern/zoning, restrained color, collection scale, and documentary context. Its strategy includes neutral diffuse light, controlled top-down composition, deep focus, normal perspective, scale reference, and wide environmental context. Its risks include oversaturation, decorative abstraction, and unsupported provenance implications.

These records are demonstration-only. They do not establish mineralogical or geological facts about either subject.

## Comparison runner

`runDomainIntelligenceComparison` executes the unchanged pipeline twice through `runMockPipelineForSubject`. It returns a compact summary for each fixture:

- subject;
- selected visual-goal IDs;
- selected technique IDs;
- shot count; and
- major decision risks.

The runner does not inspect a subject name to decide a strategy. The differing outputs come from each Subject's `ResearchReport`, `ArtDirectionDecision[]`, and `ShotPlan` fixtures.

## What this validates

The test validates the intended separation of concerns:

`Research report → Decisions → Shot plan → Pipeline observability`

Reusable rules live in `src/domain/knowledge/`; subject-specific interpretation lives in research reports and decisions. `AgentPipeline` only orchestrates agent interfaces and records their outputs. If a future provider implementation introduced conditions such as “if subject is Mookaite, choose top-down,” it would bypass this architecture and make reasoning non-reusable and difficult to review.
