# 05: Export inspection SVG and report QA limitations

**What to build:** A user can export supported reference geometry as a derived SVG for inspection and see clearly which geometry QA checks are unavailable.

**Blocked by:** 03: Generate reference geometry and report independent rule results; 04: Place reference geometry without mutating its source.

**Status:** ready-for-agent

- [ ] SVG is derived from canonical geometry and is clearly an inspection export, not canonical geometry, a print-scale guarantee, or a production artifact.
- [ ] Any side-by-side presentation offset is an explicit SVG rendering transform and leaves canonical coordinates unchanged.
- [ ] Geometry QA distinguishes inspection/reference pieces from production pieces; unsupported production checks are reported as unimplemented, never as passing.
- [ ] Exported reference pieces retain the required non-production label and any relevant synthetic-data warning.
- [ ] Automated tests verify derived output, rendering-offset isolation, and explicit unimplemented QA results through the public generation boundary where practical.
- [x] SVG point labels use concise visible names, retain full semantic identifiers in metadata/titles, and are automatically positioned without text overlap in both the preview and exported SVG.