# 04: Place reference geometry without mutating its source

**What to build:** A user can inspect a placed instance of reference geometry while the canonical local `PatternPiece` remains unchanged and spatial meaning stays attached to the transformed geometry.

**Blocked by:** 01: Start the web app with a synthetic reference example.

**Status:** ready-for-agent

- [ ] Placement applies optional reflection around the local Y-axis, then counter-clockwise rotation, then translation, with public rotation values in degrees converted to radians at one explicit math boundary.
- [ ] Placement returns deterministic instance geometry and does not mutate canonical local geometry.
- [ ] Spatial semantic elements are transformed consistently and retain their metadata.
- [ ] Geometric reflection remains distinct from `mirror_pair` and does not claim fabric/grainline or cutting validation.
- [ ] The user can inspect the placed example in the app, and automated tests cover transform order, degree-based rotation, determinism, source immutability, and metadata preservation.