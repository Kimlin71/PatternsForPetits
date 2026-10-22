import { validateMeasurements } from './measurements';
import {
  REFERENCE_GEOMETRY_WARNING,
  SYNTHETIC_DATA_WARNING,
} from './model';
import type {
  CanonicalMeasurement,
  GenerationResult,
  GeometryQaResult,
  PatternPiece,
  RawMeasurementInput,
  RuleDependencyResult,
  RuleEvaluationResult,
  RuleId,
  SemanticPoint,
} from './model';
import { renderInspectionSvg } from './svg-export';

export const DEFAULT_EXAMPLE_INPUTS: readonly RawMeasurementInput[] = [
  {
    id: 'synthetic-torso-length',
    label: 'Synthetic torso length',
    rawValue: 12.5,
    rawUnit: 'cm',
    source: 'Synthetic example fixture',
    notes: SYNTHETIC_DATA_WARNING,
    measurementCode: 'TORSO_LENGTH',
    methodId: 'TEST_ONLY_TORSO_LENGTH',
    methodVersion: '0.1-test',
  },
];

export const DEFAULT_REFERENCE_RULES: readonly RuleId[] = [
  'CF_NECK_REFERENCE',
  'CB_NECK_REFERENCE',
  'CF_WAIST_REFERENCE',
  'CB_WAIST_REFERENCE',
];

const RULE_VERSIONS: Readonly<Record<RuleId, string>> = {
  CF_NECK_REFERENCE: '0.1.0',
  CB_NECK_REFERENCE: '0.1.0',
  CF_WAIST_REFERENCE: '0.1.0',
  CB_WAIST_REFERENCE: '0.1.0',
  BUST_POINT_REFERENCE: '0.1.0',
  SHOULDER_REFERENCE: '0.1.0',
};

const NOT_IMPLEMENTED_RULES = new Set<RuleId>([
  'BUST_POINT_REFERENCE',
  'SHOULDER_REFERENCE',
]);

function dependencyResult(
  status: RuleDependencyResult['status'],
): RuleDependencyResult {
  const message = {
    SATISFIED: 'An explicit validated torso-length measurement is available.',
    MISSING: 'A torso-length measurement is required and was not supplied.',
    INVALID: 'The supplied torso-length measurement did not pass structural validation.',
  }[status];

  return { measurementCode: 'TORSO_LENGTH', status, message };
}

function evaluateRule(
  ruleId: RuleId,
  torsoDependency: 'SATISFIED' | 'MISSING' | 'INVALID',
): RuleEvaluationResult {
  if (NOT_IMPLEMENTED_RULES.has(ruleId)) {
    return {
      ruleId,
      implementationStatus: 'NOT_IMPLEMENTED',
      executionStatus: 'NOT_IMPLEMENTED',
      truthStatus: 'PROVISIONAL',
      ruleVersion: RULE_VERSIONS[ruleId],
      dependencyResults: [],
    };
  }

  const requiresTorsoLength = ruleId.endsWith('WAIST_REFERENCE');
  const dependencyResults = requiresTorsoLength
    ? [dependencyResult(torsoDependency)]
    : [];
  const executionStatus = requiresTorsoLength && torsoDependency !== 'SATISFIED'
    ? 'BLOCKED'
    : 'GENERATED';

  return {
    ruleId,
    implementationStatus: 'IMPLEMENTED',
    executionStatus,
    truthStatus: 'PROVISIONAL',
    ruleVersion: RULE_VERSIONS[ruleId],
    dependencyResults,
  };
}

function semanticPoint(ruleId: RuleId, valueMm: number): SemanticPoint {
  const x = 0;
  const y = ruleId.endsWith('NECK_REFERENCE') ? 0 : -valueMm;
  return {
    semantic: ruleId,
    point: { x, y },
    metadata: {
      coordinateUnit: 'mm',
      geometryKind: 'reference-point',
      truthStatus: 'PROVISIONAL',
    },
  };
}

function buildPatternPieces(
  rules: readonly RuleEvaluationResult[],
  canonicalMeasurements: readonly CanonicalMeasurement[],
): PatternPiece[] {
  const torsoLength = canonicalMeasurements.find(
    (measurement) => measurement.measurementCode === 'TORSO_LENGTH',
  );
  const generatedRules = rules.filter((rule) => rule.executionStatus === 'GENERATED');
  const frontElements = generatedRules
    .filter((rule) => rule.ruleId.startsWith('CF_'))
    .map((rule) => semanticPoint(
      rule.ruleId,
      rule.ruleId.endsWith('WAIST_REFERENCE') ? torsoLength?.valueMm ?? 0 : 0,
    ));
  const backElements = generatedRules
    .filter((rule) => rule.ruleId.startsWith('CB_'))
    .map((rule) => semanticPoint(
      rule.ruleId,
      rule.ruleId.endsWith('WAIST_REFERENCE') ? torsoLength?.valueMm ?? 0 : 0,
    ));
  const pieces: PatternPiece[] = [];

  if (frontElements.length > 0) {
    pieces.push({
      id: 'FRONT_REFERENCE',
      label: REFERENCE_GEOMETRY_WARNING,
      kind: 'REFERENCE',
      coordinateSystem: 'LOCAL_RIGHT_HANDED_CARTESIAN_MM',
      elements: frontElements,
      mirrorPair: false,
    });
  }
  if (backElements.length > 0) {
    pieces.push({
      id: 'BACK_REFERENCE',
      label: REFERENCE_GEOMETRY_WARNING,
      kind: 'REFERENCE',
      coordinateSystem: 'LOCAL_RIGHT_HANDED_CARTESIAN_MM',
      elements: backElements,
      mirrorPair: false,
    });
  }

  return pieces;
}

function buildGeometryQa(pieces: readonly PatternPiece[]): GeometryQaResult[] {
  return pieces.map((piece) => ({
    pieceId: piece.id,
    pieceKind: 'REFERENCE',
    checks: [
      { name: 'seam geometry', status: 'NOT_IMPLEMENTED' },
      { name: 'cut geometry', status: 'NOT_IMPLEMENTED' },
      { name: 'fabric/grainline placement', status: 'NOT_IMPLEMENTED' },
    ],
  }));
}

export function generateReferenceGeometry(
  rawMeasurements: readonly RawMeasurementInput[],
  requestedRules: readonly RuleId[],
): GenerationResult {
  const validation = validateMeasurements(rawMeasurements, requestedRules);
  const ruleResults = requestedRules.map((ruleId) =>
    evaluateRule(ruleId, validation.torsoDependency),
  );
  const patternPieces = buildPatternPieces(ruleResults, validation.canonicalMeasurements);

  return {
    inputValidation: {
      issues: validation.issues,
      isValid: validation.issues.length === 0,
    },
    ruleResults,
    canonicalMeasurements: validation.canonicalMeasurements,
    patternPieces,
    traceability: {
      engineVersion: '0.1.0',
      ruleSetVersion: '0.1.0',
      coordinateConvention: 'RIGHT_HANDED_X_RIGHT_Y_UP_CCW',
    },
    geometryQa: buildGeometryQa(patternPieces),
    svg: renderInspectionSvg(patternPieces),
  };
}
