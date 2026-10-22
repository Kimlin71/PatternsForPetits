import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EXAMPLE_INPUTS,
  DEFAULT_REFERENCE_RULES,
  generateReferenceGeometry,
} from './reference-geometry';
import type { RawMeasurementInput, RuleId } from './model';

function torsoInput(overrides: Partial<RawMeasurementInput> = {}): RawMeasurementInput {
  return {
    id: 'synthetic-torso-length',
    label: 'Synthetic torso length',
    rawValue: 12.5,
    rawUnit: 'cm',
    source: 'Synthetic example fixture',
    notes: 'SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD',
    measurementCode: 'TORSO_LENGTH',
    methodId: 'TEST_ONLY_TORSO_LENGTH',
    methodVersion: '0.1-test',
    ...overrides,
  };
}

describe('reference geometry generation boundary', () => {
  it('generates the labelled synthetic front and back reference example', () => {
    const result = generateReferenceGeometry(
      DEFAULT_EXAMPLE_INPUTS,
      DEFAULT_REFERENCE_RULES,
    );

    expect(result.inputValidation.isValid).toBe(true);
    expect(result.canonicalMeasurements).toHaveLength(1);
    expect(result.canonicalMeasurements[0]).toMatchObject({
      measurementCode: 'TORSO_LENGTH',
      valueMm: 125,
      rawValue: 12.5,
      rawUnit: 'cm',
      conversionFactorToMm: 10,
    });
    expect(result.patternPieces.map((piece) => piece.id)).toEqual([
      'FRONT_REFERENCE',
      'BACK_REFERENCE',
    ]);
    expect(result.patternPieces[0]?.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ semantic: 'CF_NECK_REFERENCE', point: { x: 0, y: 0 } }),
        expect.objectContaining({ semantic: 'CF_WAIST_REFERENCE', point: { x: 0, y: -125 } }),
      ]),
    );
    expect(result.patternPieces[1]?.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ semantic: 'CB_NECK_REFERENCE', point: { x: 0, y: 0 } }),
        expect.objectContaining({ semantic: 'CB_WAIST_REFERENCE', point: { x: 0, y: -125 } }),
      ]),
    );
    expect(result.patternPieces.every((piece) => piece.label.includes('REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN'))).toBe(true);
    expect(result.svg).toContain('SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD');
  });

  it('canonicalizes explicit millimetres without changing the value', () => {
    const result = generateReferenceGeometry(
      [torsoInput({ rawValue: 125, rawUnit: 'mm' })],
      DEFAULT_REFERENCE_RULES,
    );

    expect(result.canonicalMeasurements[0]).toMatchObject({
      rawValue: 125,
      rawUnit: 'mm',
      valueMm: 125,
      conversionFactorToMm: 1,
    });
  });

  it.each([
    { rawUnit: undefined, expected: 'MISSING_UNIT' },
    { rawUnit: 'in', expected: 'UNSUPPORTED_UNIT' },
    { rawUnit: 'yards', expected: 'UNKNOWN_UNIT' },
  ])('blocks units that are missing or unsupported: $expected', ({ rawUnit, expected }) => {
    const result = generateReferenceGeometry(
      [torsoInput({ rawUnit })],
      DEFAULT_REFERENCE_RULES,
    );

    expect(result.canonicalMeasurements).toHaveLength(0);
    expect(result.inputValidation.issues.map((issue) => issue.code)).toContain(expected);
    expect(result.ruleResults.find((rule) => rule.ruleId === 'CF_WAIST_REFERENCE'))
      .toMatchObject({ executionStatus: 'BLOCKED' });
    expect(result.patternPieces.flatMap((piece) => piece.elements).map((element) => element.semantic))
      .not.toContain('CF_WAIST_REFERENCE');
  });

  it.each([
    { rawValue: Number.NaN, expected: 'NON_FINITE_VALUE' },
    { rawValue: Number.MAX_VALUE, expected: 'NON_FINITE_CANONICAL_VALUE', rawUnit: 'cm' },
    { rawValue: 0, expected: 'NON_POSITIVE_VALUE' },
    { rawValue: -1, expected: 'NON_POSITIVE_VALUE' },
    { rawValue: '12.5', expected: 'INVALID_NUMERIC_VALUE' },
  ])('blocks invalid numeric values: $expected', ({ rawValue, expected }) => {
    const result = generateReferenceGeometry(
      [torsoInput({ rawValue })],
      DEFAULT_REFERENCE_RULES,
    );

    expect(result.canonicalMeasurements).toHaveLength(0);
    expect(result.inputValidation.issues.map((issue) => issue.code)).toContain(expected);
  });

  it('rejects ambiguous, unknown-code, and incomplete measurement provenance', () => {
    const result = generateReferenceGeometry([
      torsoInput({ ambiguous: true }),
      torsoInput({ id: 'unknown-code', measurementCode: 'HEIGHT' }),
      torsoInput({ id: 'missing-method', methodId: undefined }),
    ], []);

    expect(result.canonicalMeasurements).toHaveLength(0);
    expect(result.inputValidation.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['AMBIGUOUS_INPUT', 'UNKNOWN_MEASUREMENT_CODE', 'MISSING_METHOD_ID', 'DUPLICATE_ACTIVE_VALUE']),
    );
  });

  it('blocks duplicate active codes but ignores explicitly inactive inputs', () => {
    const duplicate = generateReferenceGeometry(
      [torsoInput(), torsoInput({ id: 'second-torso' })],
      DEFAULT_REFERENCE_RULES,
    );
    const inactive = generateReferenceGeometry(
      [torsoInput(), torsoInput({ id: 'inactive-torso', rawValue: 900, active: false })],
      DEFAULT_REFERENCE_RULES,
    );

    expect(duplicate.canonicalMeasurements).toHaveLength(0);
    expect(duplicate.inputValidation.issues.map((issue) => issue.code))
      .toContain('DUPLICATE_ACTIVE_VALUE');
    expect(inactive.canonicalMeasurements).toHaveLength(1);
    expect(inactive.inputValidation.isValid).toBe(true);
  });

  it('reports an unimplemented requested rule independently of its missing dependency', () => {
    const result = generateReferenceGeometry([], [
      'BUST_POINT_REFERENCE',
      'CF_WAIST_REFERENCE',
      'CF_NECK_REFERENCE',
    ]);

    expect(result.ruleResults).toEqual(expect.arrayContaining([
      expect.objectContaining({
        ruleId: 'BUST_POINT_REFERENCE',
        implementationStatus: 'NOT_IMPLEMENTED',
        executionStatus: 'NOT_IMPLEMENTED',
      }),
      expect.objectContaining({
        ruleId: 'CF_WAIST_REFERENCE',
        implementationStatus: 'IMPLEMENTED',
        executionStatus: 'BLOCKED',
        dependencyResults: [expect.objectContaining({ status: 'MISSING' })],
      }),
      expect.objectContaining({ ruleId: 'CF_NECK_REFERENCE', executionStatus: 'GENERATED' }),
    ]));
    expect(result.patternPieces[0]?.elements.map((element) => element.semantic))
      .toEqual(['CF_NECK_REFERENCE']);
  });

  it('keeps explicit torso geometry independent of other measurements', () => {
    const first = generateReferenceGeometry(
      [torsoInput({ rawValue: 12.5, rawUnit: 'cm' })],
      ['CF_WAIST_REFERENCE'],
    );
    const second = generateReferenceGeometry(
      [torsoInput({ rawValue: 130, rawUnit: 'mm' })],
      ['CF_WAIST_REFERENCE'],
    );

    expect(first.patternPieces[0]?.elements[0]?.point).toEqual({ x: 0, y: -125 });
    expect(second.patternPieces[0]?.elements[0]?.point).toEqual({ x: 0, y: -130 });
  });

  it('reports reference QA checks as unimplemented, not passing', () => {
    const result = generateReferenceGeometry(DEFAULT_EXAMPLE_INPUTS, DEFAULT_REFERENCE_RULES);

    expect(result.geometryQa.every((piece) => piece.pieceKind === 'REFERENCE')).toBe(true);
    expect(result.geometryQa.flatMap((piece) => piece.checks).every((check) => check.status === 'NOT_IMPLEMENTED')).toBe(true);
  });

  it('does not add an unimplemented optional rule unless explicitly requested', () => {
    const result = generateReferenceGeometry(DEFAULT_EXAMPLE_INPUTS, DEFAULT_REFERENCE_RULES);

    expect(result.ruleResults.map((rule) => rule.ruleId)).not.toContain('SHOULDER_REFERENCE');
  });
});

describe('reference geometry rule types', () => {
  it('keeps requested geometry rule identifiers within the declared rule set', () => {
    const rules: readonly RuleId[] = DEFAULT_REFERENCE_RULES;
    expect(rules).not.toContain('SHOULDER_REFERENCE');
  });
});
