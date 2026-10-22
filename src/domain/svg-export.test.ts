import { describe, expect, it } from 'vitest';
import type { PatternPiece } from './model';
import { renderInspectionSvg } from './svg-export';

const piece: PatternPiece = {
  id: 'FRONT_REFERENCE',
  label: 'REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN',
  kind: 'REFERENCE',
  coordinateSystem: 'LOCAL_RIGHT_HANDED_CARTESIAN_MM',
  mirrorPair: false,
  elements: [{
    semantic: 'CF_NECK_REFERENCE',
    point: { x: 0, y: 0 },
    metadata: { coordinateUnit: 'mm' },
  }],
};

describe('inspection SVG export', () => {
  it('exports labelled inspection SVG without promising print-scale or production use', () => {
    const svg = renderInspectionSvg([piece]);

    expect(svg).toContain('<svg');
    expect(svg).toContain('REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN');
    expect(svg).toContain('SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD');
    expect(svg).toContain('no print-scale guarantee');
    expect(svg).toContain('CF_NECK_REFERENCE');
  });

  it('applies side-by-side offsets only in rendered SVG', () => {
    const second: PatternPiece = { ...piece, id: 'BACK_REFERENCE' };
    const originalCoordinate = second.elements[0]?.point;
    const svg = renderInspectionSvg([piece, second], { sideBySideOffsetMm: 280 });

    expect(svg).toContain('cx="280"');
    expect(second.elements[0]?.point).toBe(originalCoordinate);
    expect(originalCoordinate).toEqual({ x: 0, y: 0 });
  });
});
