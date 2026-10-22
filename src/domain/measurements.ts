import type {
  CanonicalMeasurement,
  InputValidationIssue,
  RawMeasurementInput,
  RuleId,
  ValidationIssueCode,
} from './model';

const SUPPORTED_UNITS = new Set(['mm', 'cm']);
const UNSUPPORTED_KNOWN_UNITS = new Set(['in', 'inch', 'inches']);
const TORSO_METHOD_ID = 'TEST_ONLY_TORSO_LENGTH';
const TORSO_METHOD_VERSION = '0.1-test';

interface MeasurementValidation {
  readonly issues: readonly InputValidationIssue[];
  readonly canonicalMeasurements: readonly CanonicalMeasurement[];
  readonly torsoDependency: 'SATISFIED' | 'MISSING' | 'INVALID';
}

function issue(
  code: ValidationIssueCode,
  message: string,
  inputId: string | undefined,
  measurementCode?: string,
): InputValidationIssue {
  return { code, message, inputId, measurementCode, blocking: true };
}

function validateOne(
  input: RawMeasurementInput,
  inputId: string,
): InputValidationIssue[] {
  const issues: InputValidationIssue[] = [];
  const measurementCode = input.measurementCode;

  if (!input.label?.trim()) {
    issues.push(issue('MISSING_LABEL', 'A source label is required.', inputId, measurementCode));
  }
  if (input.rawValue === undefined || input.rawValue === null || input.rawValue === '') {
    issues.push(issue('MISSING_VALUE', 'A raw numeric value is required.', inputId, measurementCode));
  } else if (typeof input.rawValue !== 'number') {
    issues.push(issue('INVALID_NUMERIC_VALUE', 'The raw value must be a number.', inputId, measurementCode));
  } else if (!Number.isFinite(input.rawValue)) {
    issues.push(issue('NON_FINITE_VALUE', 'The raw value must be finite.', inputId, measurementCode));
  } else if (input.rawValue <= 0) {
    issues.push(issue('NON_POSITIVE_VALUE', 'The raw value must be greater than zero.', inputId, measurementCode));
  }

  if (!input.rawUnit?.trim()) {
    issues.push(issue('MISSING_UNIT', 'An explicit source unit is required.', inputId, measurementCode));
  } else if (UNSUPPORTED_KNOWN_UNITS.has(input.rawUnit.toLowerCase())) {
    issues.push(issue('UNSUPPORTED_UNIT', 'Inches are not supported in v0.1.', inputId, measurementCode));
  } else if (!SUPPORTED_UNITS.has(input.rawUnit)) {
    issues.push(issue('UNKNOWN_UNIT', 'The supplied unit is not recognized.', inputId, measurementCode));
  }
  if (
    typeof input.rawValue === 'number'
    && Number.isFinite(input.rawValue)
    && (input.rawUnit === 'mm' || input.rawUnit === 'cm')
    && !Number.isFinite(input.rawValue * (input.rawUnit === 'cm' ? 10 : 1))
  ) {
    issues.push(issue(
      'NON_FINITE_CANONICAL_VALUE',
      'The converted millimetre value must remain finite.',
      inputId,
      measurementCode,
    ));
  }

  if (!input.source?.trim()) {
    issues.push(issue('MISSING_SOURCE', 'A source description is required.', inputId, measurementCode));
  }
  if (!measurementCode?.trim()) {
    issues.push(issue('MISSING_MEASUREMENT_CODE', 'A measurement code is required.', inputId));
  } else if (measurementCode !== 'TORSO_LENGTH') {
    issues.push(issue('UNKNOWN_MEASUREMENT_CODE', 'The measurement code is not defined in v0.1.', inputId, measurementCode));
  }

  if (!input.methodId?.trim()) {
    issues.push(issue('MISSING_METHOD_ID', 'A test-only method identifier is required.', inputId, measurementCode));
  } else if (input.methodId !== TORSO_METHOD_ID) {
    issues.push(issue('UNKNOWN_METHOD_ID', 'The test-only method identifier is not defined in v0.1.', inputId, measurementCode));
  }
  if (!input.methodVersion?.trim()) {
    issues.push(issue('MISSING_METHOD_VERSION', 'A method version is required.', inputId, measurementCode));
  } else if (input.methodVersion !== TORSO_METHOD_VERSION) {
    issues.push(issue('UNKNOWN_METHOD_VERSION', 'The method version is not defined in v0.1.', inputId, measurementCode));
  }
  if (input.ambiguous) {
    issues.push(issue('AMBIGUOUS_INPUT', 'Ambiguous measurements cannot be canonicalized.', inputId, measurementCode));
  }

  return issues;
}

function canonicalize(
  input: RawMeasurementInput,
  inputId: string,
): CanonicalMeasurement {
  const rawValue = input.rawValue as number;
  const rawUnit = input.rawUnit as 'mm' | 'cm';
  const conversionFactorToMm = rawUnit === 'cm' ? 10 : 1;

  return {
    inputId,
    label: input.label as string,
    measurementCode: 'TORSO_LENGTH',
    rawValue,
    rawUnit,
    valueMm: rawValue * conversionFactorToMm,
    conversionFactorToMm,
    source: input.source as string,
    ...(input.notes === undefined ? {} : { notes: input.notes }),
    methodId: TORSO_METHOD_ID,
    methodVersion: TORSO_METHOD_VERSION,
    truthStatus: 'PROVISIONAL',
  };
}

export function validateMeasurements(
  inputs: readonly RawMeasurementInput[],
  requestedRules: readonly RuleId[],
): MeasurementValidation {
  const activeInputs = inputs
    .map((input, index) => ({ input, inputId: input.id?.trim() || `input-${index + 1}` }))
    .filter(({ input }) => input.active !== false);
  const candidateCounts = new Map<string, number>();

  for (const { input } of activeInputs) {
    if (input.measurementCode) {
      candidateCounts.set(
        input.measurementCode,
        (candidateCounts.get(input.measurementCode) ?? 0) + 1,
      );
    }
  }

  const issues: InputValidationIssue[] = [];
  const canonicalMeasurements: CanonicalMeasurement[] = [];
  const duplicateCodes = new Set(
    [...candidateCounts].filter(([, count]) => count > 1).map(([code]) => code),
  );

  for (const { input, inputId } of activeInputs) {
    const inputIssues = validateOne(input, inputId);
    if (input.measurementCode && duplicateCodes.has(input.measurementCode)) {
      inputIssues.push(
        issue(
          'DUPLICATE_ACTIVE_VALUE',
          'Only one active value per measurement code is permitted.',
          inputId,
          input.measurementCode,
        ),
      );
    }
    issues.push(...inputIssues);
    if (inputIssues.length === 0) {
      canonicalMeasurements.push(canonicalize(input, inputId));
    }
  }

  const requiresTorso = requestedRules.some(
    (rule) => rule === 'CF_WAIST_REFERENCE' || rule === 'CB_WAIST_REFERENCE',
  );
  const torsoInputs = activeInputs.filter(({ input }) => input.measurementCode === 'TORSO_LENGTH');
  let torsoDependency: MeasurementValidation['torsoDependency'] = 'SATISFIED';

  if (requiresTorso && torsoInputs.length === 0) {
    issues.push(
      issue(
        'MISSING_REQUIRED_MEASUREMENT',
        'A torso-length input is required by the requested waist reference rule.',
        undefined,
        'TORSO_LENGTH',
      ),
    );
    torsoDependency = 'MISSING';
  } else if (requiresTorso && !canonicalMeasurements.some((measurement) => measurement.measurementCode === 'TORSO_LENGTH')) {
    torsoDependency = 'INVALID';
  }

  return { issues, canonicalMeasurements, torsoDependency };
}
