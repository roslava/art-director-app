# Research Knowledge Model v1

The Research Knowledge Model stores structured evidence about a subject before art direction interprets it. It is intentionally not a mineralogical database and does not turn a visual preference into a claim.

## Distinct concepts

`FACT ≠ VISUAL PROPERTY ≠ VISUAL DECISION`

- A **fact** is a `ResearchClaim`: a scoped statement with source references, category, tags, and confidence.
- A **visual property** describes an observable or relevant aspect of the subject derived from research, such as a readable outline or localized light behavior. It can point to visual goals, but does not select a method.
- A **visual decision** is an `ArtDirectionDecision`: it explains why selected goals and techniques are appropriate for this subject and intended outcome.

This separation avoids rules such as “a material with feature X always uses method Y.” Claims and properties describe the subject; decisions make reviewable production choices.

## Research flow

`Source → Claim → Research Report → Art Direction Decision → Shot`

- `ResearchSource` records a source title, flexible type, URL when available, citation, reliability, and notes.
- `ResearchClaim` records a statement and its source IDs, rather than embedding an untraceable conclusion in a prompt.
- `ResearchReport` gathers claims, visual properties, opportunities, risks, sources, and an overall confidence for one subject.
- `ArtDirectionDecision` can interpret those claims into selected goals and techniques, with reasoning, expected outcome, rejected methods, risks, and confidence.
- A `Shot` is the human-readable production result of one or more decisions.

The current implementation keeps `researchReports` on `Subject`. The earlier lightweight `research` field remains during the MVP transition, so the existing presentation and decision fixtures remain intact.

## Opportunities and risks

`VisualOpportunity` identifies a possible image objective grounded in one or more claim IDs and suggests visual goals. It does not decide that the goal must be used.

`VisualRisk` records a possible misleading interpretation, why it could happen, relevant goals, and avoidance notes. Risks travel from research into decisions and shots so a future Critic can test for known failure modes.

## Confidence and sample data

Claims and reports use an open-ended confidence object: a qualitative `level`, optional `score`, and optional `rationale`. This makes uncertainty reviewable without declaring a fixed vocabulary or treating a score as proof.

The Chrysoberyl report is demonstration-only. Its sources are `example.com` placeholders, every claim is marked mock/sample and `needs-review`, and it makes no new scientific or mineralogical assertion.

## Future use

A future research service can collect and validate source records, create claims, derive reviewable visual properties, and assemble a report. A future Art Director Agent should consume reviewed claims and report risks, then create a separate decision. A future Critic can compare an image to the Shot's criteria and linked decision while using report risks as explicit failure modes.
