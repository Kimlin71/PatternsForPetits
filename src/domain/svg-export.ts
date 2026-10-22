import { REFERENCE_GEOMETRY_WARNING, SYNTHETIC_DATA_WARNING } from './model';
import type { PatternPiece } from './model';

export interface SvgRenderOptions {
  readonly sideBySideOffsetMm?: number;
}

type TextAnchor = 'start' | 'middle' | 'end';

interface LabelBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

interface LabelPlacement {
  readonly x: number;
  readonly y: number;
  readonly anchor: TextAnchor;
  readonly bounds: LabelBounds;
}

const LABEL_FONT_SIZE = 7;
const LABEL_GAP = 2;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function toDisplayLabel(identifier: string): string {
  return identifier.replace(/_REFERENCE$/, '').replaceAll('_', ' ');
}

function getLabelBounds(label: string, x: number, y: number, anchor: TextAnchor): LabelBounds {
  const width = label.length * LABEL_FONT_SIZE * 0.62;
  const left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;

  return {
    left,
    right: left + width,
    top: y - LABEL_FONT_SIZE,
    bottom: y + LABEL_FONT_SIZE * 0.25,
  };
}

function overlaps(first: LabelBounds, second: LabelBounds): boolean {
  return first.left < second.right + LABEL_GAP
    && first.right + LABEL_GAP > second.left
    && first.top < second.bottom + LABEL_GAP
    && first.bottom + LABEL_GAP > second.top;
}

function findLabelPlacement(
  label: string,
  pointX: number,
  pointY: number,
  preferredDirection: 1 | -1,
  occupiedBounds: readonly LabelBounds[],
): LabelPlacement {
  const preferredAnchor = preferredDirection === 1 ? 'start' : 'end';
  const oppositeAnchor = preferredDirection === 1 ? 'end' : 'start';
  const candidates: { x: number; y: number; anchor: TextAnchor }[] = [
    { x: pointX + preferredDirection * 8, y: pointY - 8, anchor: preferredAnchor },
    { x: pointX - preferredDirection * 8, y: pointY - 8, anchor: oppositeAnchor },
    { x: pointX, y: pointY - 13, anchor: 'middle' },
    { x: pointX, y: pointY + 15, anchor: 'middle' },
    { x: pointX + preferredDirection * 12, y: pointY - 2, anchor: preferredAnchor },
    { x: pointX - preferredDirection * 12, y: pointY - 2, anchor: oppositeAnchor },
  ];

  for (const candidate of candidates) {
    const bounds = getLabelBounds(label, candidate.x, candidate.y, candidate.anchor);
    if (!occupiedBounds.some((occupied) => overlaps(bounds, occupied))) {
      return { ...candidate, bounds };
    }
  }

  for (let row = 0; ; row += 1) {
    const distance = 22 + row * LABEL_FONT_SIZE * 1.4;
    for (const candidate of [
      { x: pointX, y: pointY - distance, anchor: 'middle' as const },
      { x: pointX, y: pointY + distance, anchor: 'middle' as const },
    ]) {
      const bounds = getLabelBounds(label, candidate.x, candidate.y, candidate.anchor);
      if (!occupiedBounds.some((occupied) => overlaps(bounds, occupied))) {
        return { ...candidate, bounds };
      }
    }
  }
}

export function renderInspectionSvg(
  pieces: readonly PatternPiece[],
  options: SvgRenderOptions = {},
): string {
  const sideBySideOffsetMm = options.sideBySideOffsetMm ?? 280;
  const positionedElements = pieces.flatMap((piece, pieceIndex) =>
    piece.elements.map((element) => ({
      piece,
      element,
      offsetX: pieceIndex === 0 ? 0 : sideBySideOffsetMm,
    })),
  );
  const occupiedLabelBounds: LabelBounds[] = [];
  const renderedElements = positionedElements.map(({ piece, element, offsetX }) => {
    const x = element.point.x + offsetX;
    const y = -element.point.y;
    const isBackPiece = piece.id === 'BACK_REFERENCE';
    const labelText = toDisplayLabel(element.semantic);
    const label = escapeXml(labelText);
    const placement = findLabelPlacement(
      labelText,
      x,
      y,
      isBackPiece ? -1 : 1,
      occupiedLabelBounds,
    );
    occupiedLabelBounds.push(placement.bounds);

    return { piece, element, x, y, isBackPiece, label, placement };
  });
  const xCoordinates = renderedElements.map(({ x }) => x);
  const yCoordinates = renderedElements.map(({ element }) => element.point.y);
  const labelBounds = renderedElements.map(({ placement }) => placement.bounds);
  const minX = Math.min(0, ...xCoordinates, ...labelBounds.map(({ left }) => left)) - 8;
  const maxX = Math.max(0, ...xCoordinates, ...labelBounds.map(({ right }) => right)) + 8;
  const minScreenY = Math.min(
    -Math.max(0, ...yCoordinates) - 42,
    ...labelBounds.map(({ top }) => top - 8),
  );
  const maxScreenY = Math.max(
    -Math.min(0, ...yCoordinates) + 42,
    ...labelBounds.map(({ bottom }) => bottom + 8),
  );
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxScreenY - minScreenY);
  const markers = renderedElements.map(({ piece, element, x, y, isBackPiece, label, placement }) =>
    `<g class="reference-point" data-piece="${piece.id}" data-semantic="${element.semantic}"><circle class="${isBackPiece ? 'back-point' : 'front-point'}" cx="${x}" cy="${y}" r="3.5"/><text class="semantic-label" fill="#4d5048" font-size="${LABEL_FONT_SIZE}" text-anchor="${placement.anchor}" x="${placement.x}" y="${placement.y}" stroke="none"><title>${escapeXml(element.semantic)}</title>${label}</text></g>`,
  );
  const pieceLabels = pieces.map((piece, pieceIndex) => {
    const offsetX = pieceIndex === 0 ? 0 : sideBySideOffsetMm;
    return `<text class="piece-label" x="${offsetX}" y="${minScreenY + 18}"><title>${escapeXml(piece.id)}</title>${escapeXml(toDisplayLabel(piece.id))}</text>`;
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minScreenY} ${width} ${height}" role="img" aria-label="Derived reference geometry inspection; not a production pattern or print-scale guarantee">`,
    '<title>Reference geometry inspection</title>',
    `<desc>${REFERENCE_GEOMETRY_WARNING}. ${SYNTHETIC_DATA_WARNING}. SVG is a derived inspection export and has no print-scale guarantee.</desc>`,
    '<g class="axes" stroke="#8b8a82" stroke-width="0.6">',
    `<path d="M ${minX} 0 H ${maxX}"/><path d="M 0 ${minScreenY} V ${maxScreenY}"/>`,
    '</g>',
    '<g class="reference-points" fill="#a4452d" stroke="#fff" stroke-width="1">',
    markers.join(''),
    '</g>',
    '<g class="labels" fill="#32352f" font-family="sans-serif" font-size="7" stroke="none">',
    pieceLabels.join(''),
    '</g>',
    '</svg>',
  ].join('');
}
