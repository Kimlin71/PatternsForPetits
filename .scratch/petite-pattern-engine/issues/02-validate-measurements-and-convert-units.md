# 02: Validate measurement inputs and convert supported units

**What to build:** A user can supply raw measurement data and see which values are accepted, why others block generation, and how accepted values become traceable canonical millimetres.

**Blocked by:** 01: Start the web app with a synthetic reference example.

**Status:** ready-for-agent

- [ ] Raw label, value, explicitly supplied unit, source, and notes remain available alongside any canonical measurement.
- [ ] Only unambiguous values with a known code, test-only method identifier/version, supported unit, finite numeric value, and positive value are admitted to canonical measurements.
- [ ] `mm` remains unchanged and `cm` converts at exactly 10 mm per cm at the validated input boundary; conversion details are traceable and raw values/units are preserved.
- [ ] Missing, unknown, unsupported, ambiguous, invalid, or duplicate active inputs produce structured blocking validation results and do not enter canonical measurements or geometry; inches are rejected and units are never inferred from magnitude.
- [ ] The app shows validation results and accepted canonical values through the public generation boundary.
- [ ] Tests cover accepted and rejected inputs, conversion, provenance, and the absence of estimation or substitution; no anthropometric deviation classification is generated automatically.