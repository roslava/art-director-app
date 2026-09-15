# Decision Layer v1

The Decision Layer records why a visual approach was selected before that approach becomes one or more production shots. It makes the deliberate link between subject-specific research and reusable production knowledge explicit.

## The reasoning chain

`FACT → ART DIRECTION DECISION → VISUAL GOAL → PRODUCTION TECHNIQUES → SHOT → IMAGE → CRITIQUE`

- A **fact** is research information about a specific subject, with its own source and confidence.
- An **art direction decision** explains why a fact calls for a particular visual approach.
- A **visual goal** defines the outcome the resulting image must achieve.
- **Production techniques** are reusable methods that may achieve that goal.
- A **shot** is the human-readable, production-ready result of one or more decisions.
- An **image** is a future captured or generated output.
- A **critique** evaluates the image against the decision and shot rather than treating visual preference as evidence.

For example, a mock/sample fact that thin fractured areas may transmit light does not itself prescribe backlighting. A decision can select `reveal_translucency`, choose transmitted backlight, macro framing, edge detail, and a dark studio, reject bright-field illumination for this purpose, and record the risk of a glass-like result.

## Why decisions exist

Facts and reusable techniques have different responsibilities. A fact records what is known or needs review; a technique records what visual problem it can solve and its risks. Neither, alone, tells us why a particular selection was appropriate for this subject and this intended image.

`ArtDirectionDecision` stores that context: its input fact IDs, selected and rejected goal/technique IDs, reasoning, expected outcome, risks, confidence, and optional notes. Decisions live on a Subject because they interpret that subject's research. Shots hold `artDirectionDecisionIds`, so a decision can inform multiple shots and a shot can combine decisions when necessary.

The Shot retains its readable lighting, composition, background, camera notes, prompt, criteria, and risks. A decision is not a replacement for this production direction; it is its traceable rationale.

## Storing AI reasoning

Future AI explanations are useful only when they are reviewable. Persisting decision reasoning means a human can inspect why a technique was selected, revise it without editing factual research, and compare later outputs to the intended outcome. It also lets the system surface rejected techniques and their risks instead of silently treating all possible methods as equally appropriate.

The decision contract validates AI-generated text before it enters a shot plan. It does not make AI reasoning authoritative: the reasoning must remain distinguishable from source-backed facts and subject to human review.

## Future Art Director and Critic behavior

A future Art Director Agent can take approved research facts, project constraints, and the production knowledge library, then create a proposed decision before creating shots. It should select visual goals first, select compatible techniques second, explain rejected alternatives where relevant, and state an expected outcome plus risks.

The future Critic can begin with the Shot's success criteria and risks, then use the linked decision to understand the intended visual trade-off. For a translucency decision, it can check both that thin edges transmit light and that the whole subject has not become implausibly transparent. Critique evaluates the result against the decision; it does not promote a mock decision into a research fact.

## Confidence and uncertainty

Decision confidence is an open-ended object with a qualitative `level` plus optional numeric `score` and explanatory `rationale`. This allows a future agent to communicate uncertainty without restricting the product to a fixed vocabulary or pretending that a score is authoritative. A human workflow can require review at chosen levels, display the rationale, or downgrade confidence when an input fact is uncertain.

The current Chrysoberyl decisions are explicitly mock/sample examples and use `needs-review`; they do not claim authoritative mineral knowledge.
