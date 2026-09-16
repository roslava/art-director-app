# OpenAI Research v1

This first real integration collects web-backed material for a visual art director. It focuses on subject appearance and production-relevant observations—such as colour, translucency, surface, pattern, reflectance, finish state, lighting changes, geological context when useful, and misleading depictions—rather than producing an encyclopedia entry. It does not add UI, persistence, image generation, or a new domain model.

## Boundary and validation

`OpenAIResearchProvider → raw provider research → OpenAIResearchAgent → ResearchReport`

The provider uses the OpenAI Responses API and its web-search tool. It returns unstructured research text, web citations when present, provider metadata, and usage; it does not create domain claims or reports.

The OpenAI implementation modules are server-only runtime code: no app component imports them and the API key is read solely from `process.env.OPENAI_API_KEY` when the real provider/agent is constructed. The CLI is the only current entry point.

The agent receives that raw material, instructs OpenAI to create a report using only the provider's supplied source IDs, and validates the result with the existing `researchReportSchema`. It also rejects a subject-ID mismatch and source IDs not supplied by the provider. A malformed or invalid output throws `ResearchReportValidationError` with code `RESEARCH_REPORT_VALIDATION_FAILED` and an `issues` array; it is never silently accepted.

Each provider citation becomes a `ResearchSource` with title, URL when available, citation text, and a reliability note. Claims retain their `sourceIds` and confidence. The agent is told to omit unsupported claims and preserve conflicts or uncertainty in confidence rationale or the report summary. URLs and citations are taken from OpenAI web-search output; the flow does not invent them.

## Run the demo

Create a local server-only environment file (it is ignored by Next.js conventions):

```bash
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY=...
npm run research:openai -- Mookaite
```

Pass another subject as additional arguments, for example `npm run research:openai -- Labradorite`. The demo prints counts plus concise visual-property, opportunity, and risk sections rather than full JSON. It fails clearly when `OPENAI_API_KEY` is absent; build, lint, and type checks do not require it.

## Current limitations

This is a first vertical slice. Web-search sources are captured as returned and are not independently retrieved or quality-scored beyond the report's explicit reliability note. The report still needs human review for scientific accuracy, source suitability, and creative fit. The provider and agent use two OpenAI calls so the provider-to-agent boundary stays explicit.
