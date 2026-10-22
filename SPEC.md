# Petite Pattern Engine v0.1 — Technical Proof-of-Concept Specification

## Problem Statement

A petite-first pattern geometry foundation must represent individually supplied body measurements without treating stature as a proxy for other proportions. The current project has domain boundaries and clarified v0.1 requirements, but no implementation or authoritative consolidated specification. Without that specification, software behavior could be mistaken for a validated physical measurement method, anthropometric standard, fit-verified system, or production pattern.

## Solution

Define v0.1 as a technical proof of concept for structurally validating explicitly supplied measurement inputs, converting accepted measurements to canonical millimetres, evaluating requested geometry rules independently, and producing limited front/back reference geometry for inspection. Keep raw provenance, canonical geometry, rule implementation status, truth status, and software test results distinct. Clearly label synthetic fixtures and reference outputs so they cannot be mistaken for anthropometric evidence or production patterns.

## User Stories

1. As a pattern-engine developer, I want each raw measurement input to retain its original label, raw value, explicitly supplied unit, source, and notes, so that provenance is not lost during processing.
2. As a pattern-engine developer, I want a raw measurement to remain unresolved when its meaning or unit is ambiguous, so that the system never guesses a measurement mapping or unit.
3. As a pattern-engine developer, I want accepted measurements to be associated with a defined measurement code, anatomical method, known source unit, and applicable method version, so that canonical measurements have explicit meaning and provenance.
4. As a pattern-engine developer, I want accepted measurements and canonical geometry expressed in millimetres, so that downstream geometry uses one consistent unit.
5. As a pattern-engine developer, I want unit conversion to happen once at the validated input boundary with traceable conversion details, so that later geometry operations do not repeat or obscure conversions.
6. As a maintainer, I want supported input units and conversion constants documented and tested, so that unit handling is deterministic and reviewable.
7. As a pattern-engine developer, I want v0.1 to accept only millimetres (`mm`) and centimetres (`cm`), with centimetres converted at 10 mm per cm and millimetres unchanged, so that canonical measurements always use millimetres.
8. As a user of the engine, I want missing, unknown, unsupported, invalid, or ambiguous required inputs to produce structured blocking validation results, so that the engine does not estimate or silently substitute values.
9. As a pattern-engine developer, I want structural validation to check data integrity such as presence, finite numeric values, positivity, known measurement codes, supported units, and duplicate active values, so that malformed inputs are rejected without making anthropometric judgments.
10. As a pattern-engine developer, I want anthropometric deviation statuses to be representable without automatically classifying measurements in v0.1, so that unvalidated criteria are not presented as established norms.
11. As a pattern-engine developer, I want test-only measurement method identifiers to describe fixture provenance rather than physical instructions, so that they cannot be used as customer measurement guidance.
12. As a maintainer, I want synthetic values and fixtures clearly marked with `SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD`, so that tests cannot be mistaken for anthropometric evidence, petite averages, reference ranges, size-chart values, or fit guidance.
13. As a pattern-engine developer, I want software rule implementation status to be independent from evidential truth status, so that implementing a rule does not imply that its domain definition or result is verified.
14. As a pattern-engine developer, I want each requested geometry rule evaluated independently, so that one rule's implementation state or dependency results do not suppress or determine another rule's result.
15. As a pattern-engine developer, I want a requested unimplemented rule to report its own `NOT_IMPLEMENTED` result and report dependency failures separately where applicable, so that blockers are explicit and orthogonal.
16. As a pattern-engine developer, I want front and back reference geometry represented in separate local coordinate systems, so that their canonical source geometry remains unambiguous.
17. As a pattern-engine developer, I want `CF_NECK_REFERENCE` and `CB_NECK_REFERENCE` anchored at `(0, 0)`, so that the supported front/back reference construction has deterministic origins.
18. As a pattern-engine developer, I want each corresponding waist reference to use `x = 0` and `y` equal to the negative explicit torso-length measurement, so that waist placement follows the supplied individual's torso measurement rather than an estimate based on stature.
19. As a petite person represented by the engine, I want an explicitly supplied torso measurement to determine its corresponding reference coordinates independently of stature, so that petite-first behavior does not infer body proportions from height.
20. As a pattern-engine developer, I want bust-point and shoulder reference rules registered and traceable as `NOT_IMPLEMENTED`, so that their absence is visible without inventing coordinates or mappings.
21. As a user of the default example, I want only explicitly supported front/back reference geometry generated, so that the example does not request unimplemented bust-point or shoulder geometry.
22. As a pattern-engine developer, I want canonical geometry to use millimetres, full floating-point precision, and a right-handed 2D Cartesian coordinate system with positive X right, positive Y up, and positive rotation counter-clockwise, so that geometry operations have consistent semantics.
23. As a pattern-engine developer, I want local pattern-piece geometry to remain unchanged when an instance is placed, so that placements do not mutate the canonical source.
24. As a pattern-engine developer, I want placement to apply optional reflection around the local Y-axis, then counter-clockwise rotation, then translation, so that every instance uses a deterministic transform order.
25. As a caller of the placement API, I want public rotation values expressed in degrees and converted to radians at one explicit math boundary, so that callers use a clear and consistent unit.
26. As a pattern-engine developer, I want transforms applied consistently to spatial semantic elements while preserving their metadata, so that placement does not detach meaning from geometry.
27. As a pattern-engine developer, I want geometric reflection to remain distinct from `mirror_pair`, so that an instance transform is not confused with a pattern or cutting requirement.
28. As a pattern-engine developer, I want reference geometry kept distinct from `seam_line` sewing geometry and `cut_line` cutting geometry, so that inspection geometry cannot be mistaken for production geometry.
29. As an inspector, I want reference-only pieces to be labelled `REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN`, so that their non-production status is unmistakable.
30. As a pattern-engine developer, I want deterministic rules to be versioned and traceable, so that outputs can be related to the rule definitions that produced them.
31. As a quality reviewer, I want geometry QA to distinguish inspection/reference pieces from production pieces and explicitly identify unimplemented checks, so that unavailable production validation is never reported as passing.
32. As an inspector, I want SVG to be available as a derived inspection export, so that supported reference geometry can be viewed without treating SVG as the canonical geometry source.
33. As an inspector, I want any side-by-side layout offset to be applied only as an explicit SVG rendering transform, so that presentation does not mutate canonical coordinates.
34. As an inspector, I want SVG output not to imply a print-scale guarantee, so that a visual export is not mistaken for a validated production or printing artifact.
35. As a developer, I want software tests to verify structural behavior and geometry invariants separately from measurement-method validation and garment-fit validation, so that passing tests are not misrepresented as domain evidence.
36. As a maintainer, I want all generated repository content in English, so that project artifacts remain consistent and reviewable.

## Implementation Decisions

- v0.1 is a technical proof of concept only. It is not a production pattern, fit-verified system, or validated petite drafting method.
- Keep raw measurement input, canonical measurement, measurement code, physical measurement method, and pattern-drafting rule as distinct concepts.
- Preserve raw label, raw value, explicitly supplied raw unit, source, and notes. Do not guess mappings, units, or missing values.
- Admit a canonical measurement only after structural validation and unambiguous mapping to a defined code, anatomical method, known source unit, and applicable method version. Store canonical measurements in millimetres and preserve conversion traceability.
- The v0.1 raw input units are exactly millimetres (`mm`) and centimetres (`cm`), with `1 mm = 1 mm` and `1 cm = 10 mm`. Do not support inches. Convert once at the validated input boundary, preserve the original raw value and raw unit for provenance, and store the canonical converted value separately in millimetres. Missing, unknown, unsupported, or ambiguous units produce structured blocking validation results and never enter canonical measurements or geometry. Never infer a unit from value magnitude.
- Structural validation may cover presence, finite numeric values, positivity, known codes, supported units, and duplicate active values. It must not classify anthropometric deviation.
- Deviation-related statuses such as `UNUSUAL_BUT_POSSIBLE`, `RECHECK_RECOMMENDED`, and `CONFIRMED_OUTLIER` may exist in the model but must not be generated automatically in v0.1. Outlier confirmation requires a future documented workflow.
- Test-only method identifiers and synthetic fixture values are not physical measurement protocols, anthropometric standards, or customer instructions. Any `PROVISIONAL` status describes an unvalidated domain definition or mapping, not software test quality.
- Keep `RuleImplementationStatus` (for example, `IMPLEMENTED`, `NOT_IMPLEMENTED`, and optionally `PARTIALLY_IMPLEMENTED`) separate from `TruthStatus`. `NOT_IMPLEMENTED` is not a truth status. Software test pass/fail is also separate from truth status.
- Evaluate each requested rule independently. Report an unimplemented rule and any missing or invalid dependencies as separate results; no one result determines or suppresses another.
- Use canonical geometry in millimetres with full floating-point precision and a right-handed 2D Cartesian convention: origin `(0, 0)`, positive X right, positive Y up, and counter-clockwise positive rotation.
- For the supported proof of concept, front and back reference pieces have separate local coordinate systems. `CF_NECK_REFERENCE` and `CB_NECK_REFERENCE` each map to `(0, 0)`. Their corresponding waist references use `x = 0` and `y` equal to the negative explicit torso-length measurement.
- Do not infer body proportions from stature. Do not invent reference mappings, drafting formulas, anthropometric ranges, ease, or fabric behavior.
- Keep bust-point and shoulder reference rules registered and traceable but `NOT_IMPLEMENTED`. Do not create placeholder coordinates. The default example requests only supported front/back geometry.
- Keep `PatternPiece` local geometry as the canonical source. A placed instance is a deterministic transformation in this order: optional reflection around the local Y-axis, counter-clockwise rotation, then translation. Reflection maps `(x, y)` to `(-x, y)`. The public rotation API uses degrees, with conversion to radians at one explicit math boundary.
- Transform spatial semantic elements consistently and preserve metadata. Keep geometric placement separate from fabric/grainline validation and from `mirror_pair` cutting semantics.
- Keep reference geometry separate from sewing (`seam_line`) and cutting (`cut_line`) semantics. Reference-only pieces are explicitly labelled `REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN`; missing production lines are valid for such pieces but do not qualify them as production patterns.
- SVG is a derived inspection export, not the domain source of truth and not a print-scale guarantee. A side-by-side presentation offset is an SVG-only rendering transform and must not alter canonical coordinates.
- SVG point labels use concise display text with the `_REFERENCE` suffix omitted; full semantic identifiers remain available in SVG metadata and title elements. Labels are placed deterministically to avoid text-box collisions, and the viewBox includes their rendered extents. These presentation choices do not change canonical geometry or semantics.
- Geometry QA must distinguish inspection/reference pieces from production pieces. Checks not implemented in v0.1 must be identified as unimplemented rather than reported as passing.
- Keep deterministic rules versioned and traceable.
- The primary public and test seam is one reference-geometry generation boundary. It accepts raw measurement inputs and requested rules and exposes structured input-validation results, per-rule implementation and execution results, canonical measurements, canonical reference geometry/reference `PatternPiece`s, traceability metadata, and derived inspection output where applicable. Tests primarily assert externally observable behaviour through this boundary rather than internal implementation details. Lower-level unit tests remain appropriate for geometry primitives and strict domain invariants. This is a contract for the new implementation; there is currently no existing code seam to reuse.

## Testing Decisions

- Tests should assert externally observable behavior and domain invariants, not private implementation details or internal call sequences.
- Prefer one high-level contract seam at the public reference-geometry generation boundary. Cover accepted and rejected input behavior, raw provenance and conversion traceability, independent rule outcomes, canonical geometry, immutable deterministic placement, metadata preservation, and derived SVG behavior through that boundary where practical.
- Test the input-validation boundary for missing, non-finite, non-positive, unknown-code, unsupported-unit, ambiguous, and duplicate active inputs. Verify structured blocking results and verify that inputs are not estimated or substituted.
- Test unit conversion against the explicitly documented supported units and conversion constants. Preserve raw source value/unit and verify canonical millimetre values and traceability.
- Through the public generation boundary, verify `mm` is unchanged, `cm` converts by a factor of 10, inches are rejected, and missing, unknown, unsupported, or ambiguous units produce structured blocking results and do not enter canonical measurements or geometry. Verify raw values and units are preserved separately from the canonical millimetre value, and that no magnitude-based unit inference occurs.
- Test that synthetic fixture markers appear near relevant fixtures and that tests do not claim physical-method or fit validation.
- Test rule-status orthogonality: requested unimplemented rules report `NOT_IMPLEMENTED`; dependency failures remain separately visible; default generation is not blocked by rules it does not request; `NOT_IMPLEMENTED` is not represented as `TruthStatus`.
- Test the explicit front/back anchor and torso-length mapping, including that explicit torso input controls the corresponding reference independently of stature. Use synthetic values only; do not include personal measurements.
- Test placement's exact reflection/rotation/translation order, degree-based public input, deterministic output, source immutability, spatial metadata preservation, and distinction from `mirror_pair`.
- Test that inspection/reference pieces can omit production sewing/cutting geometry, retain the required non-production label, and are not accepted as production patterns.
- Test that unsupported geometry QA checks are reported as unimplemented, not passing. Test that SVG is derived from canonical geometry and that presentation offsets do not change canonical coordinates.
- No implementation or test suite currently exists in the repository, so there is no prior test style or module-level test precedent to follow. Apply the project's established test conventions when implementation is introduced.

## Out of Scope

- Production patterns, production cutting layouts, fabric/grainline placement validation, print-scale guarantees, and manufacturing readiness.
- Fit verification, garment-fit claims, validated petite drafting methods, or customer-facing measurement instructions.
- Anthropometric norms, petite averages, size charts, reference ranges, deviation/outlier classification criteria, automatic outlier detection, or outlier-confirmation workflows.
- Categorical body observations in the v0.1 model or generation pipeline.
- Inferred or guessed measurement mappings, units, missing values, coordinates, drafting formulas, ease, or fabric behavior.
- Generation of bust-point or shoulder reference coordinates.
- Treating SVG as canonical geometry or as a print-ready artifact.

## Further Notes

- `CONTEXT.md` is the domain glossary and should remain the terminology authority for this work.
- The original prompt and addenda are not present as source files in the repository; this specification consolidates the decisions recorded in the project handoff. Any missing requirements must be identified rather than guessed.
- Personal measurement values must not be repeated, stored, or used in fixtures. Fixtures must be synthetic and carry the exact warning `SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD` near relevant data.
- The confirmed high-level test seam is a single public end-to-end reference-geometry generation boundary exposing structured validation, per-rule results, canonical measurements and geometry, traceability metadata, and derived inspection output where applicable. Lower-level tests may cover geometry primitives and strict domain invariants.
- The published issue-tracker specification is `.scratch/petite-pattern-engine/spec.md` and is labelled `ready-for-agent`. Keep that tracker copy authoritative if the specification changes.
- The supported v0.1 raw input unit set is confirmed as `mm` and `cm`; inches are excluded. The conversion boundary and exact factors are specified above.
