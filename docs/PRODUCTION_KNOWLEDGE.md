# Production knowledge model v1

Production knowledge records explain why a photographic choice is appropriate. They are reusable: a technique does not belong to a mineral, product, person, or campaign. It expresses a relationship between a visual problem and a method that may help solve it.

## The production chain

`FACT → ART DIRECTION DECISION → GOAL → METHOD → SHOT → IMAGE → CRITIQUE`

- A **fact** is research-backed or explicitly marked sample/uncertain information about a subject.
- An **art direction decision** explains why a fact leads to a selected visual approach.
- A **visual goal** says why an image needs to exist, such as revealing surface relief or providing scale.
- A **method** is one or more production techniques selected because they help achieve that goal.
- A **shot** combines those structured references with human-readable art direction and any shot-specific adjustments.
- An **image** is a future generated or captured result. Production knowledge does not call a provider.
- A **critique** will later test the result against the shot's success criteria and risks.

The implication is deliberate: the model never encodes a rule such as “mineral X always uses lighting Y.” A research fact about meaningful surface relief can inform a decision that selects the goal `reveal_surface_relief`; raking side light is then a reusable possible method.

## Visual goals and techniques

A visual goal is an outcome, not a camera setting or a style. `reveal_translucency`, for example, asks for believable light transmission in relevant areas. `transmitted_backlight` is a technique that may help solve that problem; it also records when it is inappropriate and the risk that an opaque subject may look glass-like.

`VisualGoal` carries applicability, success criteria, risks, and recommended or conflicting technique IDs. Its IDs are strings rather than a closed enum, so a project or future user library can add goals without a domain-model migration.

`ProductionTechnique` is equally generic. Its string `category` supports lighting, optics, environment, composition, capture, and future categories. Every record documents:

- what visual goals it can solve;
- when it is useful and when it should be avoided;
- its strengths and visual risks; and
- typed parameters and tags.

This makes familiar recipes such as Rembrandt or clamshell light available without treating them as decoration. They are low-relevance portrait recipes for the current specimen example and explicitly document why they may be unsuitable for neutral material documentation.

## Combining methods

A shot usually needs more than one method. For a thin-edge translucency study, the goal may be `reveal_translucency`; a possible combination is `transmitted_backlight` (lighting), `macro_90_105mm` (optics), `edge_detail` (composition), and `dark_studio` (environment). Each contributes a distinct functional capability.

Techniques are references, not a rigid recipe. A Shot keeps its existing readable fields—lighting, composition, background, camera notes, prompt, and constraints—because they remain the final human-readable art direction. It also has:

- `researchFactIds`, `visualGoalIds`, and `techniqueIds` for the reasoning chain;
- shot-specific `successCriteria` and `risks`;
- `techniqueOverrides` for a selected technique's notes or parameter changes; and
- `productionNotes` for decisions that do not belong in a reusable library record.

## Parameters and presets

Technique parameters are typed, optional values for common physical or functional controls: light direction, size, hardness, polarization, focal-length range, depth of field, working distance, camera angle, background tone, and environment type. The `custom` map allows future parameter names while restricting values to strings, finite numbers, booleans, or non-empty string arrays. This permits extension without an unmaintainable arbitrary object.

A preset is a reusable functional starting point, not a style label. `scientific_neutral` is useful for repeatable color and shape documentation; `dark_studio` supports transmitted light and silhouettes; `in_situ` supports context and scale. A future UI can offer styles separately, but a style must not silently override a technique's factual risks.

## Future Art Director and Critic

A future AI Art Director should receive approved research facts, project constraints, visual goals, and the knowledge library. It can propose techniques by matching a goal to `solvesGoals`, then explain the selection with `usefulWhen`, `avoidWhen`, and risks. Its output must still be validated against the Zod contracts before becoming a Shot.

The future Critic can use the Shot's success criteria as concrete checks and its risks as failure modes. For example, a translucency shot can be checked for visible transmission at a thin edge while rejecting an image where the whole specimen has become uniformly glass-like. The Critic does not establish research truth; it evaluates whether an image meets the specified production intent.

## Future custom presets

Custom goals and techniques can later live in project, organization, or user libraries. They should keep stable IDs, validate with the same schemas, and be distinguished from shared defaults. Actual equipment profiles—such as a camera body plus macro lens—can be modeled later as optional profiles that reference functional techniques; brands are intentionally not fundamental to this v1 model.
