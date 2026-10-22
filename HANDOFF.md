# Handoff: Petite Pattern Engine v0.1

## Recommended next agent

The specification has been consolidated, published, and confirmed by the user. The next role should be **Implement Spec** when the user is ready to begin implementation. The authoritative requirements are in `.scratch/petite-pattern-engine/spec.md`; this handoff is only an orientation summary. No implementation language or runtime has been selected yet, so the implementation agent should not silently assume a stack.

## Assignment

When implementation is requested, follow the published spec and preserve its scope and domain boundaries. Do not invent missing domain definitions, mappings, formulas, anthropometric criteria, or measurement methods. Treat unresolved stack/project setup choices explicitly rather than guessing.

The original prompt and addenda were provided in the conversation, not saved as source files in the repository. Use the conversation history as the source material; do not infer missing requirements.

## User intent and current state

- The user confirmed the proposed single public reference-geometry generation boundary as the primary public/test seam.
- The user confirmed v0.1 input units: `mm` and `cm`, with `1 cm = 10 mm` and `1 mm = 1 mm`; inches are excluded.
- The published spec is labelled `ready-for-agent`. No application code or tests exist yet.
- `CONTEXT.md` is the domain glossary and terminology authority. Review it before changing domain language.
- No personal measurement values may be repeated, stored, or used in test data.

## Decisions to preserve in the consolidated prompt

### Scope and evidence

- v0.1 is a technical proof of concept, not a production pattern, fit-verified system, or validated petite drafting method.
- Use synthetic test values only, with the exact warning `SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD` near relevant fixtures.
- Synthetic data is not anthropometric evidence, a petite average, reference range, size chart, or fit guidance.
- Keep software validity, measurement-method validation, and fit validation distinct. Passing software tests does not validate a measurement method or fit.
- Exclude categorical body descriptors from v0.1's active model and generation pipeline.
- Structural validation is active. Anthropometric/deviation classification statuses may exist, but classification rules are `NOT_IMPLEMENTED` until documented, validated criteria exist.

### Measurement definitions and provenance

- Separate measurement codes, physical measurement methods, measurement values, and pattern-drafting rules.
- v0.1 methods/definitions are test-only; no measurement definition is suitable for real customer use without an explicitly documented and domain-validated physical method.
- Test-only method identifiers are fixture provenance identifiers, not physical measurement instructions or anthropometric standards. Their `PROVISIONAL` status, where used, describes an unvalidated domain definition/mapping, not a software test result.
- Preserve raw source label, raw value, explicit raw unit, source, and notes. Never guess mappings or units. Keep ambiguous values unresolved.
- Missing, unknown, unsupported, invalid, or ambiguous required inputs produce structured blocking validation results; do not estimate or substitute values.
- Use millimetres as the canonical unit for accepted measurements and all geometry. The only v0.1 raw units are `mm` and `cm`; convert once at the validated input boundary, preserve raw value/unit and conversion traceability, and never infer a unit from magnitude. Missing, unsupported, unknown, or ambiguous units block canonicalization. Test this through the public generation boundary.

### Geometry and reference builder

- Canonical geometry is millimetre-based, right-handed 2D Cartesian: origin `(0, 0)`, positive X right, positive Y up, counter-clockwise positive rotation.
- Each piece has local coordinates. For the supported proof of concept, front and back reference geometry have separate local coordinate systems.
- `CF_NECK_REFERENCE` and `CB_NECK_REFERENCE` are each at `(0, 0)`. The corresponding waist reference has `x = 0` and `y` equal to the negative explicit torso-length measurement.
- Generate only explicitly supported front/back geometry in the default example SVG. Any side-by-side presentation offset is an explicit SVG-only rendering transform; do not mutate canonical coordinates.
- Bust-point and shoulder reference rules remain registered and traceable but are `NOT_IMPLEMENTED`; do not create placeholder coordinates or infer mappings.
- Each requested rule is evaluated independently. A `NOT_IMPLEMENTED` result and missing/invalid dependency results may be reported separately; one rule must not suppress or determine another rule's status.
- Separate `RuleImplementationStatus` (`IMPLEMENTED`, `NOT_IMPLEMENTED`, optionally `PARTIALLY_IMPLEMENTED` if needed) from `TruthStatus`. An implemented rule may still be provisional; implementation is not verification.
- Pattern-piece reference geometry is separate from semantic sewing lines (`seam_line`) and cutting lines (`cut_line`). Missing production lines are valid for an inspection/reference piece, which must retain `REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN`.

### Placement transform

- Do not mutate source geometry when placing an instance.
- The fixed order is local geometry -> optional mirror around local Y-axis `(x, y) -> (-x, y)` -> counter-clockwise rotation -> translation.
- Public rotation API uses degrees, converted to radians only at one explicit math boundary.
- Apply transforms consistently to spatial semantic elements and preserve metadata.
- Geometric transformation is separate from fabric/grainline placement validation and separate from `mirror_pair` cutting semantics.

### Rules, validation, testing, and outputs

- Keep deterministic rules versioned and traceable. Do not invent pattern-drafting formulas, anthropometric ranges, ease, or fabric behavior.
- Structural checks (missing/finite/positive values, known code, supported unit, duplicate active values) may be implemented; do not activate outlier/unusual classification rules.
- For `UNUSUAL_BUT_POSSIBLE`, `RECHECK_RECOMMENDED`, and `CONFIRMED_OUTLIER`, retain model statuses but do not generate them automatically in v0.1. Outlier confirmation requires a future documented workflow.
- Geometry QA must distinguish inspection/reference pieces from production pieces; unimplemented QA checks must be explicit rather than reported as passing.
- SVG is an inspection export, not the domain source of truth or a print-scale guarantee. The default example must not request bust-point or shoulder geometry.
- Preserve tests for the unit boundary, raw provenance, input-vs-domain validation, immutable deterministic transforms, rule-status orthogonality, and the petite-first independence of explicit torso measurements.
- Keep all generated repository content in English.

## Implementation guardrails

1. Use the one public generation boundary to expose structured input validation, per-rule results, canonical measurements, reference `PatternPiece`s, traceability, and applicable inspection output. Prefer external behavior tests at this boundary; retain lower-level tests for geometry primitives and strict domain invariants.
2. The default example generates only supported front/back reference geometry. Bust-point and shoulder rules remain `NOT_IMPLEMENTED`; never invent placeholder coordinates.
3. Keep `RuleImplementationStatus`, `TruthStatus`, and software test results distinct. `NOT_IMPLEMENTED` is not a truth status.
4. Preserve all synthetic-data warnings and do not use personal measurement values or imply physical-method, anthropometric, or fit validation.
5. No codebase or test conventions exist yet. Select or confirm the implementation stack before scaffolding; do not infer a language from the domain specification.
