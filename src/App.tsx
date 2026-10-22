import { useMemo, useState } from 'react';
import {
  DEFAULT_EXAMPLE_INPUTS,
  DEFAULT_REFERENCE_RULES,
  generateReferenceGeometry,
} from './domain/reference-geometry';
import { placePatternPiece } from './domain/placement';
import { renderInspectionSvg } from './domain/svg-export';
import { REFERENCE_GEOMETRY_WARNING, SYNTHETIC_DATA_WARNING } from './domain/model';
import type { RuleId } from './domain/model';
import './styles.css';

const OPTIONAL_RULES: readonly RuleId[] = ['BUST_POINT_REFERENCE', 'SHOULDER_REFERENCE'];

function formatPlacedCoordinate(value: number): string {
  return (Math.abs(value) < 0.005 ? 0 : value).toFixed(2);
}

export default function App() {
  const [torsoLength, setTorsoLength] = useState(String(DEFAULT_EXAMPLE_INPUTS[0]?.rawValue ?? 12.5));
  const [unit, setUnit] = useState<'cm' | 'mm'>('cm');
  const [measurementLabel, setMeasurementLabel] = useState(DEFAULT_EXAMPLE_INPUTS[0]?.label ?? 'Synthetic torso length');
  const [measurementSource, setMeasurementSource] = useState(DEFAULT_EXAMPLE_INPUTS[0]?.source ?? 'Synthetic example fixture');
  const [measurementNotes, setMeasurementNotes] = useState(DEFAULT_EXAMPLE_INPUTS[0]?.notes ?? '');
  const [requestedOptionalRules, setRequestedOptionalRules] = useState<RuleId[]>([]);
  const [rotationDegrees, setRotationDegrees] = useState('0');
  const [translationX, setTranslationX] = useState('0');
  const [translationY, setTranslationY] = useState('0');
  const [mirrored, setMirrored] = useState(false);
  const rawMeasurements = useMemo(() => [{
    ...DEFAULT_EXAMPLE_INPUTS[0],
    label: measurementLabel,
    rawValue: torsoLength.trim() === '' ? undefined : Number(torsoLength),
    rawUnit: unit,
    source: measurementSource,
    notes: measurementNotes,
  }], [measurementLabel, torsoLength, unit, measurementSource, measurementNotes]);
  const requestedRules = [...DEFAULT_REFERENCE_RULES, ...requestedOptionalRules];
  const result = useMemo(
    () => generateReferenceGeometry(rawMeasurements, requestedRules),
    [rawMeasurements, requestedRules.join('|')],
  );
  const placement = {
    rotationDegrees: Number(rotationDegrees) || 0,
    translation: { x: Number(translationX) || 0, y: Number(translationY) || 0 },
    mirrored,
  };
  const placedPieces = result.patternPieces.map((piece) => ({
    ...piece,
    elements: placePatternPiece(piece, placement).elements,
  }));
  const placedSvg = renderInspectionSvg(placedPieces);

  function toggleOptionalRule(rule: RuleId) {
    setRequestedOptionalRules((current) => current.includes(rule)
      ? current.filter((item) => item !== rule)
      : [...current, rule]);
  }

  function downloadSvg() {
    const blob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reference-geometry-inspection.svg';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Petite Pattern Engine home">
          <span className="brand-mark" aria-hidden="true">P<span>·</span></span>
          <span className="brand-copy"><strong>petite pattern</strong><small>ENGINE / GEOMETRY LAB</small></span>
        </a>
        <div className="topbar-meta"><span className="status-dot" /> TECHNICAL PROOF OF CONCEPT <span className="version-pill">v0.1</span></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>01</span> INDIVIDUAL MEASUREMENTS, EXPLICITLY</p>
          <h1>Pattern geometry,<br /><em>grounded in your measurements.</em></h1>
          <p className="hero-description">Explore a small, traceable geometry foundation. Supplied proportions shape the reference points — stature is never used as a substitute.</p>
        </div>
        <div className="hero-stamp" aria-label="Not a production pattern">
          <span className="stamp-line">BUILT FOR</span><strong>inspection</strong><span className="stamp-rule" /><span className="stamp-line">NOT FOR PRODUCTION</span>
        </div>
      </section>

      <div className="notice-strip" role="note">
        <span className="notice-icon" aria-hidden="true">i</span>
        <p><strong>Proof of concept only.</strong> No physical measurement method, anthropometric norm, fit, or production pattern is validated here.</p>
        <span className="notice-code">POC / 0.1</span>
      </div>

      <section className="workspace-grid" aria-label="Reference geometry workspace">
        <aside className="input-panel panel">
          <div className="panel-heading">
            <div><p className="eyebrow">INPUT / 01</p><h2>Start with a measurement</h2></div>
            <span className="step-number">A</span>
          </div>
          <p className="panel-intro">Edit this synthetic fixture to see how an explicit torso length informs the waist reference.</p>
          <div className="synthetic-tag"><span aria-hidden="true">✳</span>{SYNTHETIC_DATA_WARNING}</div>

          <label className="field-label" htmlFor="torso-length">TORSO LENGTH <span>TEST-ONLY DEFINITION</span></label>
          <div className="measurement-field">
            <input id="torso-length" type="number" min="0" step="any" value={torsoLength} onChange={(event) => setTorsoLength(event.target.value)} aria-label="Torso length value" aria-describedby="measurement-help" />
            <select value={unit} onChange={(event) => setUnit(event.target.value as 'cm' | 'mm')} aria-label="Measurement unit">
              <option value="cm">cm</option><option value="mm">mm</option>
            </select>
          </div>
          <p className="field-help" id="measurement-help">Explicit unit required · accepted units: mm, cm</p>

          <details className="provenance-details">
            <summary>RAW INPUT PROVENANCE</summary>
            <label htmlFor="measurement-label">Original label</label>
            <input id="measurement-label" value={measurementLabel} onChange={(event) => setMeasurementLabel(event.target.value)} />
            <label htmlFor="measurement-source">Source</label>
            <input id="measurement-source" value={measurementSource} onChange={(event) => setMeasurementSource(event.target.value)} />
            <label htmlFor="measurement-notes">Notes</label>
            <textarea id="measurement-notes" rows={2} value={measurementNotes} onChange={(event) => setMeasurementNotes(event.target.value)} />
          </details>

          <div className="field-divider" />
          <fieldset className="optional-rules">
            <legend>OPTIONAL RULES</legend>
            <p>Requesting these shows their current implementation status.</p>
            {OPTIONAL_RULES.map((rule) => (
              <label className="check-row" key={rule}>
                <input type="checkbox" checked={requestedOptionalRules.includes(rule)} onChange={() => toggleOptionalRule(rule)} />
                <span>{rule.replaceAll('_', ' ')}</span><b>NOT IMPLEMENTED</b>
              </label>
            ))}
          </fieldset>
          <div className="source-note"><span className="source-icon" aria-hidden="true">↳</span><p><strong>Fixture provenance</strong><br />Synthetic example · TEST_ONLY_TORSO_LENGTH / 0.1-test</p></div>
        </aside>

        <section className="preview-panel panel" aria-label="Generated reference preview">
          <div className="panel-heading preview-heading">
            <div><p className="eyebrow">OUTPUT / 02</p><h2>Reference geometry</h2></div>
            <button className="download-button" onClick={downloadSvg} type="button" aria-label="Download inspection SVG"><span aria-hidden="true">↓</span> EXPORT SVG</button>
          </div>
          <div className="reference-label">{REFERENCE_GEOMETRY_WARNING}</div>
          <div className="svg-preview" dangerouslySetInnerHTML={{ __html: result.svg }} />
          <div className="preview-legend"><span><i className="legend-dot" /> FRONT / LOCAL COORDINATES</span><span><i className="legend-dot back-dot" /> BACK / LOCAL COORDINATES</span></div>
          <div className="coordinate-summary">
            {result.patternPieces.map((piece) => (
              <div className="coordinate-card" key={piece.id}>
                <strong>{piece.id.replaceAll('_', ' ')}</strong>
                {piece.elements.map((element) => (
                  <span key={element.semantic}><small>{element.semantic.replaceAll('_', ' ')}</small><b>({element.point.x}, {element.point.y}) mm</b></span>
                ))}
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="placement-panel panel" aria-label="Pattern-piece instance placement">
        <div className="panel-heading">
          <div><p className="eyebrow">INSTANCE / 03</p><h2>Place without changing the source</h2></div>
          <span className="step-number">B</span>
        </div>
        <p className="panel-intro">Transform a placed instance in the specified order. The local pattern-piece geometry above remains the canonical source.</p>
        <div className="placement-workspace">
          <div className="placement-controls">
            <label className="placement-field">ROTATION <span>DEGREES CCW</span><input type="number" step="any" value={rotationDegrees} onChange={(event) => setRotationDegrees(event.target.value)} aria-label="Rotation degrees counter-clockwise" /></label>
            <label className="placement-field">TRANSLATE X <span>MM</span><input type="number" step="any" value={translationX} onChange={(event) => setTranslationX(event.target.value)} aria-label="Translation X millimetres" /></label>
            <label className="placement-field">TRANSLATE Y <span>MM</span><input type="number" step="any" value={translationY} onChange={(event) => setTranslationY(event.target.value)} aria-label="Translation Y millimetres" /></label>
            <label className="mirror-control"><input type="checkbox" checked={mirrored} onChange={(event) => setMirrored(event.target.checked)} /> REFLECT ABOUT LOCAL Y-AXIS</label>
            <p className="transform-order">OPTIONAL REFLECTION → CCW ROTATION → TRANSLATION</p>
          </div>
          <div className="placed-instance">
            <div className="reference-label">PLACED INSTANCE / DERIVED INSPECTION VIEW</div>
            <div className="svg-preview placement-svg" dangerouslySetInnerHTML={{ __html: placedSvg }} />
            <div className="placed-coordinates">
              {placedPieces.map((piece) => (
                <div className="coordinate-card" key={piece.id}>
                  <strong>{piece.id.replaceAll('_', ' ')} / PLACED</strong>
                  {piece.elements.map((element) => (
                    <span key={element.semantic}><small>{element.semantic.replaceAll('_', ' ')}</small><b>({formatPlacedCoordinate(element.point.x)}, {formatPlacedCoordinate(element.point.y)}) mm</b></span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="results-grid" aria-label="Validation and rule results">
        <article className="result-card panel" aria-live="polite">
          <div className="result-heading"><p className="eyebrow">INPUT VALIDATION</p><span className={result.inputValidation.isValid ? 'result-status valid' : 'result-status blocked'}>{result.inputValidation.isValid ? 'STRUCTURALLY VALID' : 'BLOCKED'}</span></div>
          {result.inputValidation.issues.length === 0
            ? <p className="result-copy">No structural issues. The value is retained in its source unit and converted once at the input boundary.</p>
            : <ul className="issue-list">{result.inputValidation.issues.map((issue, index) => <li key={`${issue.code}-${index}`}><strong>{issue.code.replaceAll('_', ' ')}</strong>{issue.message}</li>)}</ul>}
          {result.canonicalMeasurements.map((measurement) => <div className="canonical-value" key={measurement.inputId}><span>{measurement.rawValue} {measurement.rawUnit} <i>→</i></span><strong>{measurement.valueMm} mm</strong><small>factor ×{measurement.conversionFactorToMm} · {measurement.truthStatus}</small></div>)}
        </article>
        <article className="result-card panel" aria-live="polite">
          <div className="result-heading"><p className="eyebrow">RULE TRACEABILITY</p><span className="result-status provisional">PROVISIONAL</span></div>
          <ul className="rule-list">{result.ruleResults.map((rule) => (
            <li key={rule.ruleId}><span className="rule-indicator" data-status={rule.executionStatus} />
              <span className="rule-name">{rule.ruleId.replaceAll('_', ' ')}</span>
              <span className={`rule-state ${rule.executionStatus.toLowerCase().replaceAll('_', '-')}`}>{rule.executionStatus.replaceAll('_', ' ')}</span>
            </li>
          ))}</ul>
          {result.ruleResults.flatMap((rule) => rule.dependencyResults.map((dependency) => (
            <div className="dependency-result" key={`${rule.ruleId}-${dependency.measurementCode}`}>
              <strong>{rule.ruleId.replaceAll('_', ' ')}</strong>
              <span>{dependency.status}</span>
              <small>{dependency.message}</small>
            </div>
          )))}
          <div className="qa-results">
            <p className="eyebrow">REFERENCE GEOMETRY QA</p>
            {result.geometryQa.flatMap((piece) => piece.checks.map((check) => (
              <span key={`${piece.pieceId}-${check.name}`}><b>{piece.pieceId.replaceAll('_', ' ')}</b> · {check.name} <strong>NOT IMPLEMENTED</strong></span>
            )))}
          </div>
          <p className="result-copy">Rule implementation status is separate from evidence status. Software tests do not validate measurement methods or fit.</p>
        </article>
      </section>

      <footer className="app-footer"><span>PETITE PATTERN ENGINE <b>·</b> TECHNICAL PROOF OF CONCEPT</span><span>CANONICAL GEOMETRY / MM <b>·</b> X → RIGHT <b>·</b> Y ↑ UP</span></footer>
    </main>
  );
}
