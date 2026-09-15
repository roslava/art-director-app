# Art Director architecture

## Product concept

Art Director is an AI-assisted workspace for planning, producing, reviewing, and exporting visual work. It keeps factual subject research distinct from creative direction so the work can be expressive and faithful. The first project is the Samotsvety mineral catalog; the model is intentionally subject-agnostic for future products, objects, places, and campaigns.

## Domain model

`Project → Subject → Research + ShotPlan → Shot → GeneratedAsset → Review`

A project groups subjects and export targets. Each subject has research and one or more shot plans. A shot plan contains explicit shots, each of which can produce generated assets. Reviews attach to generated assets. The model is defined in `src/domain/schemas.ts` and uses free-form `shotType` strings so shot types can be proposed per project instead of being constrained to mineral terminology.

## Application layers

- `src/app`: App Router routes, metadata, and presentation.
- `src/domain`: Zod schemas, inferred TypeScript types, and mock data.
- Future `src/services`: use cases such as research synthesis, prompt construction, generation, critique, and export coordination.
- Future `src/providers`: adapters for AI and media-generation vendors.

The current page is server-rendered from local mock data. There is no database, auth flow, API route, or browser-side API integration.

## Future AI provider abstraction

When generation is introduced, application services should depend on a small provider interface rather than a specific SDK. An OpenAI adapter can live behind that interface and read `OPENAI_API_KEY` only on the server. Provider payloads should be translated into domain-shaped data before being exposed to the UI.

## Future persistence layer

Repositories should be introduced at the application-service boundary, with interfaces for projects, subjects, shot plans, assets, and reviews. The UI and domain schemas should not depend on a particular database. The mock-data module can be replaced by a repository implementation without changing the rendering model.

## Zod validation for AI outputs

AI output is untrusted input. Zod schemas provide a single runtime contract for tool responses, imported data, and future persisted records. Validate model output before it affects prompt execution, status transitions, exports, or user-visible facts; preserve validation failures for repair rather than silently accepting malformed content.

## Facts versus art direction

Research records observable or sourced facts, including confidence and source information. Art direction turns approved facts into decisions about framing, lighting, mood, and emphasis. Creative instructions may interpret facts, but must not overwrite them: visual risks from research remain constraints on the shot plan and critique process.
