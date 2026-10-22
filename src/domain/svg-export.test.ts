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

  it('uses concise visible labels while preserving the full semantic identifier', () => {
    const svg = renderInspectionSvg([piece]);

    expect(svg).toContain('data-semantic="CF_NECK_REFERENCE"');
    expect(svg).toContain('<title>CF_NECK_REFERENCE</title>');
    expect(svg).toContain('>CF NECK</text>');
    expect(svg).toContain('<title>FRONT_REFERENCE</title>');
    expect(svg).toContain('>FRONT</text>');
    expect(svg).not.toContain('>CF NECK REFERENCE</text>');

    const viewBox = svg.match(/viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/);
    expect(viewBox).not.toBeNull();
    expect(Number(viewBox?.[1]) + Number(viewBox?.[3])).toBeGreaterThan(38);
  });

  it('automatically moves labels when their positions would overlap', () => {
    const overlappingPiece: PatternPiece = {
      ...piece,
      elements: [
        piece.elements[0]!,
        {
          semantic: 'CB_NECK_REFERENCE',
          point: { x: 0, y: 0 },
          metadata: { coordinateUnit: 'mm' },
        },
      ],
    };
    const svg = renderInspectionSvg([overlappingPiece]);

    expect(svg).toContain('class="semantic-label" fill="#4d5048" font-size="7" text-anchor="start" x="8" y="-8"');
    expect(svg).toContain('class="semantic-label" fill="#4d5048" font-size="7" text-anchor="end" x="-8" y="-8"');
  });
});
