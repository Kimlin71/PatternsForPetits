import type {
  PatternPiece,
  PlacedPatternPiece,
  PlacementTransform,
  SemanticPoint,
} from './model';

export function placePatternPiece(
  piece: PatternPiece,
  transform: PlacementTransform,
): PlacedPatternPiece {
  if (![transform.rotationDegrees, transform.translation.x, transform.translation.y].every(Number.isFinite)) {
    throw new RangeError('Placement rotation and translation values must be finite numbers.');
  }

  const radians = (transform.rotationDegrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const elements: SemanticPoint[] = piece.elements.map((element) => {
    const reflectedX = transform.mirrored ? -element.point.x : element.point.x;
    const rotatedX = reflectedX * cosine - element.point.y * sine;
    const rotatedY = reflectedX * sine + element.point.y * cosine;

    return {
      ...element,
      point: {
        x: rotatedX + transform.translation.x,
        y: rotatedY + transform.translation.y,
      },
    };
  });

  return { sourcePieceId: piece.id, elements };
}
