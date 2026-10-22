import { describe, expect, it } from 'vitest';
import type { PatternPiece } from './model';
import { placePatternPiece } from './placement';

const sourcePiece: PatternPiece = {
  id: 'FRONT_REFERENCE',
  label: 'REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN',
  kind: 'REFERENCE',
  coordinateSystem: 'LOCAL_RIGHT_HANDED_CARTESIAN_MM',
  mirrorPair: false,
  elements: [{
    semantic: 'CF_WAIST_REFERENCE',
    point: { x: 2, y: -3 },
    metadata: { coordinateUnit: 'mm', geometryKind: 'reference-point' },
  }],
};

describe('pattern-piece instance placement', () => {
  it('reflects, rotates counter-clockwise by degrees, then translates without mutating source', () => {
    const placed = placePatternPiece(sourcePiece, {
      mirrored: true,
      rotationDegrees: 90,
      translation: { x: 10, y: 20 },
    });

    expect(placed.elements[0]?.point.x).toBeCloseTo(13);
    expect(placed.elements[0]?.point.y).toBeCloseTo(18);
    expect(placed.elements[0]?.metadata).toEqual(sourcePiece.elements[0]?.metadata);
    expect(sourcePiece.elements[0]?.point).toEqual({ x: 2, y: -3 });
    expect(sourcePiece.mirrorPair).toBe(false);
  });

  it('is deterministic for identical inputs', () => {
    const transform = { rotationDegrees: 30, translation: { x: 4, y: -7 } };
    expect(placePatternPiece(sourcePiece, transform)).toEqual(
      placePatternPiece(sourcePiece, transform),
    );
  });

  it('rejects non-finite placement values rather than returning invalid geometry', () => {
    expect(() => placePatternPiece(sourcePiece, {
      rotationDegrees: Number.POSITIVE_INFINITY,
      translation: { x: 0, y: 0 },
    })).toThrow(RangeError);
  });
});
