import { REFERENCE_GEOMETRY_WARNING, SYNTHETIC_DATA_WARNING } from './model';
import type { PatternPiece } from './model';

export interface SvgRenderOptions {
  readonly sideBySideOffsetMm?: number;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
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
  const xCoordinates = positionedElements.map(({ element, offsetX }) => element.point.x + offsetX);
  const yCoordinates = positionedElements.map(({ element }) => element.point.y);
  const minX = Math.min(0, ...xCoordinates) - 32;
  const maxX = Math.max(0, ...xCoordinates) + 32;
  const minScreenY = -Math.max(0, ...yCoordinates) - 42;
  const maxScreenY = -Math.min(0, ...yCoordinates) + 42;
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxScreenY - minScreenY);
  const markers = positionedElements.map(({ piece, element, offsetX }) => {
    const x = element.point.x + offsetX;
    const y = -element.point.y;
    const isBackPiece = piece.id === 'BACK_REFERENCE';
    const labelX = x + (isBackPiece ? -8 : 8);
    const labelAnchor = isBackPiece ? 'end' : 'start';
    const label = escapeXml(element.semantic.replaceAll('_', ' '));

    return `<g class="reference-point" data-piece="${piece.id}" data-semantic="${element.semantic}"><circle class="${isBackPiece ? 'back-point' : 'front-point'}" cx="${x}" cy="${y}" r="3.5"/><text class="semantic-label" fill="#4d5048" stroke="none" stroke-width="0" text-anchor="${labelAnchor}" x="${labelX}" y="${y - 8}">${label}</text></g>`;
  });
  const pieceLabels = pieces.map((piece, pieceIndex) => {
    const offsetX = pieceIndex === 0 ? 0 : sideBySideOffsetMm;
    return `<text class="piece-label" x="${offsetX}" y="${minScreenY + 18}">${piece.id.replaceAll('_', ' ')}</text>`;
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
