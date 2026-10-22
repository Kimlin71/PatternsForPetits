# Petite Pattern Engine

This context defines the domain language for a petite-first pattern geometry foundation. It distinguishes individual body data, inspection geometry, semantic pattern geometry, and placement without treating stature as a proxy for body proportions.

## Body data

**Petite-first**:
An approach that treats petite people as individually proportioned; stature alone does not determine other body measurements or pattern geometry.

**Raw measurement input**:
A source observation containing its original label and raw value, with any explicitly supplied unit, source, and notes. It is not a canonical body measurement until its meaning and unit are unambiguously mapped.

**Canonical measurement**:
A quantitative body measurement identified by a defined measurement code, anatomical method, known source unit, and applicable method version, admitted only after structured validation and stored in millimetres.

**Structural validation**:
Checks for data integrity such as presence, finite numeric values, positivity, known measurement codes, and supported units. These checks do not classify a person against anthropometric norms.

**Anthropometric deviation classification**:
An evidence-based interpretation of a measurement relative to documented criteria. It is outside v0.1; deviation statuses may exist, but classification rules remain unimplemented until criteria are validated.

**Test-only measurement method**:
A test-only identifier associated with synthetic values used to exercise software behaviour; it is not a physical measurement protocol, anthropometric standard, or customer instruction. Any `PROVISIONAL` status describes the unvalidated domain definition or mapping, not the software tests that exercise it.

**Rule implementation status**:
The software lifecycle state of a rule, such as implemented or not implemented. It is independent of the rule's evidence or domain-validation status.

**Rule evaluation result**:
The independent outcome of evaluating one requested geometry rule, including its implementation state and any blocking dependency results. One rule's result does not determine or suppress another rule's result.

**Truth status**:
The evidential or verification state of a value, result, or domain claim. Software implementation status does not make a rule or result verified.

**Software test result**:
The pass/fail outcome of a test of software behaviour, such as geometry operations, unit conversion, or domain invariants. It is not a domain truth status and does not validate a measurement method or garment fit.

**Categorical body observation**:
A qualitative descriptor distinct from a quantitative body measurement. Categorical observations are outside the v0.1 pattern-generation pipeline and do not determine geometry.

**Synthetic test data**:
Artificial values created solely to test software behaviour. They are not anthropometric evidence, petite averages, reference ranges, size-chart values, or fit guidance.

## Geometry and pattern semantics

**Canonical geometry**:
The semantic geometry model, expressed in millimetres with full floating-point precision. SVG and other file formats are derived exports, not the geometry source of truth.

**Local pattern-piece geometry**:
Geometry defined in the coordinate system owned by one `PatternPiece`; placement does not mutate this source geometry.

**Reference geometry**:
Inspection-only construction geometry, separate from actual sewing (`seam_line`) and cutting (`cut_line`) semantics. It is labelled `REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN` and is not a production pattern.

**Reference coordinate mapping**:
An explicitly defined mapping from a canonical measurement to a reference coordinate. A measurement does not determine coordinates unless the relevant mapping rule specifies how; unresolved mappings remain unimplemented.

**Pattern-piece instance placement**:
A deterministic transformation of local geometry: optional reflection around the local Y-axis, then counter-clockwise rotation, then translation into global space. Instance placement does not alter the source piece or establish fabric/cutting validity.

**Mirror pair**:
A pattern/cutting requirement represented by `mirror_pair`; it is distinct from the `mirrored` geometric operation applied to a particular placed instance.

**Production pattern**:
A semantic pattern whose required sewing and cutting geometry and production validation are present. Reference geometry alone does not qualify.