# Provider Architecture v1

Provider Layer separates external capabilities from domain reasoning. It lives in `src/domain/providers/` and defines vendor-neutral contracts for image generation and research retrieval.

## Responsibilities

Agents transform domain objects and preserve their reasoning. Providers execute a narrow external capability.

`ResearchProvider → raw research + references → ResearchAgent → validated ResearchReport`

`GeneratorAgent → GenerationRequest + PromptArtifact → ImageProvider → provider image references → GeneratedAsset`

A provider never creates an authoritative `ResearchReport`, art-direction decision, or shot plan. The relevant agent owns that domain transformation and validates the resulting domain objects.

## Provider contracts

`ResearchProvider` accepts a subject, instructions, and optional execution context. It returns raw research strings, references, metadata, and optional usage values. Raw provider output is input to a `ResearchAgent`, not a research fact by itself.

`ImageProvider` accepts a prompt, optional negative prompt, generation parameters, metadata, and optional context. It returns a provider request identifier, image references, provider metadata, and optional usage. A `GeneratorAgent` is responsible for preparing the request and prompt artifact, then mapping a provider result to a validated generation attempt and generated asset.

The contracts deliberately do not mention a vendor, SDK, model, credential, or transport. Future adapters can be introduced without changing `ResearchReport`, `GenerationRequest`, `GeneratedAsset`, or the pipeline.

## Mock implementations

`MockResearchProvider` and `MockImageProvider` are offline implementations. They return explicit sample data and `mock://` image references, so the provider boundary can be tested without network access or external APIs. They do not research, generate, upload, or verify anything.

## Extensibility and safety

Future provider adapters may call a hosted model, a search service, a local system, or a human-operated workflow. They should keep credentials and transport concerns outside the domain model, preserve provider metadata for observability, and treat all provider output as untrusted. Agents must validate transformed data with the domain Zod schemas before it enters a report, decision, shot, or asset workflow.

