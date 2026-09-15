# Generation Model v1

Generation is a distinct production stage. An art-direction decision explains why an approach is selected; a shot expresses that approach; generation records an attempt to create an asset from that shot. Neither a prompt nor an asset replaces the decision that justified the work.

## Generation records

`GenerationRequest` records the provider label, prompt, optional negative prompt, typed parameters, status, and creation time for one shot. It is provider-neutral: a future adapter can translate it to a vendor payload without putting SDK-specific fields in the domain model.

`GenerationAttempt` records that generation is iterative. It belongs to a request, has an attempt number, and explains what changed from the previous attempt. The first attempt still records its starting point.

`PromptArtifact` stores the prompt as a versioned artifact with a reason. Prompts are production inputs that can change after evaluation; retaining versions makes revision traceable instead of treating a prompt as disposable text.

`GeneratedAsset` links the resulting draft, approved, or rejected asset to its shot, request, attempt, URI, metadata, and evaluation IDs.

## Workflow

`Decision → Shot → Generation Request → Attempt → Asset → Evaluation → Revision`

The pipeline supports optional injected generator and critic stages after a ShotPlan. It receives explicit `GenerationRequest` records; it does not invent prompts, choose a provider, or call an API. A GeneratorAgent returns a request's attempt, prompt artifact, and asset. If a CriticAgent is injected, its structured evaluations attach to the generated stage.

## Multiple attempts and revision

Multiple attempts are expected. Evaluation can identify a mismatch—for example, excessive glow in a translucency study—and create a revision suggestion that names affected shot fields and techniques. A future application service can use that suggestion to create a revised prompt artifact and a subsequent `GenerationAttempt`, retaining the history rather than overwriting the first attempt.

## Mock example

The Chrysoberyl translucency fixture contains a mock request, first attempt, prompt artifact, and draft mock URI. It shares the mock evaluation's asset ID and demonstrates the connection to an evaluation that recommends reducing transmitted light. No asset is generated, uploaded, or externally inspected.
