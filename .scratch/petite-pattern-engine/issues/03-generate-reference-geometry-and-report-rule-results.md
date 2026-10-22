# 03: Generate reference geometry and report independent rule results

**What to build:** For valid explicit measurements, a user can inspect deterministic front/back reference coordinates and see the independent status and dependency results for each requested geometry rule.

**Blocked by:** 02: Validate measurement inputs and convert supported units.

**Status:** ready-for-agent

- [ ] `CF_NECK_REFERENCE` and `CB_NECK_REFERENCE` map to `(0, 0)` in separate local coordinate systems; corresponding waist references use `x = 0` and negative explicit torso length in millimetres, independently of stature.
- [ ] Bust-point and shoulder reference rules are registered and traceable as `NOT_IMPLEMENTED`, without placeholder coordinates; the default example does not request them.
- [ ] Each requested rule reports its implementation status independently from dependency failures and `TruthStatus`; an unimplemented rule does not suppress another rule's result.
- [ ] Reference-only `PatternPiece`s carry `REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN`, remain distinct from `seam_line` and `cut_line`, and are not accepted as production patterns.
- [ ] Deterministic rule versions and applicable traceability metadata are exposed through the public generation boundary.
- [ ] Automated tests verify the public behavior, explicit torso-length mapping, independence from stature, and rule-status orthogonality using synthetic test data only.