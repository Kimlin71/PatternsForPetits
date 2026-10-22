export const SYNTHETIC_DATA_WARNING =
  'SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD';
export const REFERENCE_GEOMETRY_WARNING =
  'REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN';

export type Point2D = Readonly<{ x: number; y: number }>;

export type MeasurementUnit = 'mm' | 'cm';

export interface RawMeasurementInput {
  readonly id?: string;
  readonly label?: string;
  readonly rawValue?: number | string;
  readonly rawUnit?: string;
  readonly source?: string;
  readonly notes?: string;
  readonly measurementCode?: string;
  readonly methodId?: string;
  readonly methodVersion?: string;
  readonly ambiguous?: boolean;
  readonly active?: boolean;
}

export interface CanonicalMeasurement {
  readonly inputId: string;
  readonly label: string;
  readonly measurementCode: 'TORSO_LENGTH';
  readonly rawValue: number;
  readonly rawUnit: MeasurementUnit;
  readonly valueMm: number;
  readonly conversionFactorToMm: 1 | 10;
  readonly source: string;
  readonly notes?: string;
  readonly methodId: 'TEST_ONLY_TORSO_LENGTH';
  readonly methodVersion: '0.1-test';
  readonly truthStatus: 'PROVISIONAL';
}

export type ValidationIssueCode =
  | 'MISSING_LABEL'
  | 'MISSING_VALUE'
  | 'INVALID_NUMERIC_VALUE'
  | 'NON_FINITE_VALUE'
  | 'NON_FINITE_CANONICAL_VALUE'
  | 'NON_POSITIVE_VALUE'
  | 'MISSING_UNIT'
  | 'UNKNOWN_UNIT'
  | 'UNSUPPORTED_UNIT'
  | 'MISSING_SOURCE'
  | 'MISSING_MEASUREMENT_CODE'
  | 'UNKNOWN_MEASUREMENT_CODE'
  | 'MISSING_METHOD_ID'
  | 'UNKNOWN_METHOD_ID'
  | 'MISSING_METHOD_VERSION'
  | 'UNKNOWN_METHOD_VERSION'
  | 'AMBIGUOUS_INPUT'
  | 'DUPLICATE_ACTIVE_VALUE'
  | 'MISSING_REQUIRED_MEASUREMENT';

export interface InputValidationIssue {
  readonly code: ValidationIssueCode;
  readonly message: string;
  readonly inputId?: string;
  readonly measurementCode?: string;
  readonly blocking: true;
}

export type RuleId =
  | 'CF_NECK_REFERENCE'
  | 'CB_NECK_REFERENCE'
  | 'CF_WAIST_REFERENCE'
  | 'CB_WAIST_REFERENCE'
  | 'BUST_POINT_REFERENCE'
  | 'SHOULDER_REFERENCE';

export type RuleImplementationStatus = 'IMPLEMENTED' | 'NOT_IMPLEMENTED';
export type TruthStatus = 'PROVISIONAL' | 'UNASSESSED';

export interface RuleDependencyResult {
  readonly measurementCode: 'TORSO_LENGTH';
  readonly status: 'SATISFIED' | 'MISSING' | 'INVALID';
  readonly message: string;
}

export interface RuleEvaluationResult {
  readonly ruleId: RuleId;
  readonly implementationStatus: RuleImplementationStatus;
  readonly executionStatus: 'GENERATED' | 'BLOCKED' | 'NOT_IMPLEMENTED';
  readonly truthStatus: TruthStatus;
  readonly ruleVersion: string;
  readonly dependencyResults: readonly RuleDependencyResult[];
}

export interface SemanticPoint {
  readonly semantic: RuleId;
  readonly point: Point2D;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface PatternPiece {
  readonly id: 'FRONT_REFERENCE' | 'BACK_REFERENCE';
  readonly label: string;
  readonly kind: 'REFERENCE';
  readonly coordinateSystem: 'LOCAL_RIGHT_HANDED_CARTESIAN_MM';
  readonly elements: readonly SemanticPoint[];
  readonly mirrorPair: false;
}

export interface GeometryQaResult {
  readonly pieceId: PatternPiece['id'];
  readonly pieceKind: 'REFERENCE';
  readonly checks: readonly {
    readonly name: 'seam geometry' | 'cut geometry' | 'fabric/grainline placement';
    readonly status: 'NOT_IMPLEMENTED';
  }[];
}

export interface GenerationResult {
  readonly inputValidation: {
    readonly issues: readonly InputValidationIssue[];
    readonly isValid: boolean;
  };
  readonly ruleResults: readonly RuleEvaluationResult[];
  readonly canonicalMeasurements: readonly CanonicalMeasurement[];
  readonly patternPieces: readonly PatternPiece[];
  readonly traceability: {
    readonly engineVersion: '0.1.0';
    readonly ruleSetVersion: '0.1.0';
    readonly coordinateConvention: 'RIGHT_HANDED_X_RIGHT_Y_UP_CCW';
  };
  readonly geometryQa: readonly GeometryQaResult[];
  readonly svg: string;
}

export interface PlacementTransform {
  readonly translation: Point2D;
  readonly rotationDegrees: number;
  readonly mirrored?: boolean;
}

export interface PlacedPatternPiece {
  readonly sourcePieceId: PatternPiece['id'];
  readonly elements: readonly SemanticPoint[];
}
