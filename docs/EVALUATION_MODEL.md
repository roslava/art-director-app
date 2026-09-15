# Evaluation and Critic Model v1

Evaluation checks a generated asset against the visual intent already expressed by decisions and shots. It is not a free-form opinion about whether an image looks attractive.

## Critique versus evaluation

A critique can be an open-ended explanation, conversation, or reviewer impression. An `EvaluationResult` is a structured assessment: it identifies the asset, shot, and decision IDs under review; scores named criteria; records issues; and proposes concrete revision suggestions.

`EvaluationCriterion` connects a check to visual goals and techniques. For example, a translucency criterion can require visible edge transmission while a companion criterion rejects a uniformly glass-like material reading. This lets a future Critic explain not just that something is wrong, but which intended outcome or method is failing.

## Intent chain

`Decision → Shot → Asset → Evaluation → Revision`

- A **decision** selects goals and methods for a subject-specific reason.
- A **shot** expresses that decision in readable production direction, criteria, and risks.
- An **asset** is a future generated or captured image.
- An **evaluation** measures the asset against the selected visual intent.
- A **revision** is a `RevisionSuggestion` with the issue, suggested change, affected Shot fields, and affected techniques.

The Critic Agent now returns `EvaluationResult[]`, wrapped in `AgentResult`, rather than the earlier free-form `Review[]` contract. Human `ReviewRecord` remains separate: it can approve, reject, or correct an evaluation or its downstream target in a future workflow.

## Mock example

The Chrysoberyl translucency fixture evaluates a fictional mock asset for the existing backlit-translucency shot. It records that localized transmission is partially achieved, but excessive glow weakens the intended solid-bulk reading. Its revision suggestion reduces `transmitted_backlight` and identifies `lighting`, `generationPrompt`, and `productionNotes` as affected shot fields.

No image is generated or analyzed by this fixture. It exists only to validate the evaluation schema and the Decision → Shot → Asset → Evaluation → Revision relationship.

## Future implementation

A future Critic implementation should receive the Shot, linked decisions, generated asset, and relevant criteria. It should validate the returned evaluation with the Zod schema, preserve uncertainty in `confidence`, and keep evidence separate from unsupported claims. A later review/persistence layer can version evaluations, attach human approvals, and apply accepted revision suggestions through a new shot version rather than destructive mutation.
