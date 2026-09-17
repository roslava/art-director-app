# ArtDirectorPreset v1

Subject is the concrete thing under investigation. A Preset is declarative domain-specific research methodology. A Research Brief is produced from Subject plus a preset snapshot. Research Report is the generic source-backed result consumed by Art Director Core.

A preset is JSON with `schemaVersion: 1`, a stable kebab-case `id`, human `name`, semantic `version`, `description`, `research.scope`, non-empty `research.sections`, and `outputContract` `{ "type": "ResearchReport", "schemaVersion": 1 }`. Each section has a unique ID, title, description, and questions. Question IDs are globally unique; each has text, applicability (`always`, `when-crystalline`, `when-aggregate`, `when-transparent-or-translucent`, `when-facetable`, `when-phenomenon-present`, or `when-treated-material-is-relevant`) and importance (`required`, `important`, `optional`).

Imported JSON is parsed as data only and Zod-validated; no code, HTML, templates, or expressions are executed. Duplicate installed IDs require explicit replacement; built-ins are not replaced. A workspace stores its validated preset snapshot, so later installed-preset updates affect only future workspaces.
