// All internal measurements are in inches. Convert at the UI boundary.

export type Unit = "in" | "cm" | "ft";

const INCHES_PER_UNIT: Record<Unit, number> = { in: 1, cm: 1 / 2.54, ft: 12 };

export const toInches = (value: number, unit: Unit) => value * INCHES_PER_UNIT[unit];
export const fromInches = (inches: number, unit: Unit) => inches / INCHES_PER_UNIT[unit];

export function formatLength(inches: number, unit: Unit) {
  const v = fromInches(inches, unit);
  return `${Number.isInteger(v) ? v : v.toFixed(1)} ${unit}`;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Wall extends Rect {
  id: string;
}

export interface SpaceDims {
  hallwayWidth: number;
  hallwayLength: number;
  doorWidth: number;
  /** Distance from the far end of the hallway to the edge of the door opening. */
  doorOffset: number;
  roomWidth: number;
  roomDepth: number;
  wallThickness: number;
}

export interface Layout {
  walls: Wall[];
  room: Rect;
  hallway: Rect;
  door: Rect;
  /** Bounding box of everything drawn, including an entry area left of the hallway. */
  bounds: Rect;
  /** Suggested starting center for the furniture, outside the hallway entrance. */
  start: { x: number; y: number };
}

/**
 * Builds an L-shaped route: a hallway running left to right, with a door in its
 * top wall near the far end that opens into a room. The furniture starts outside
 * the hallway's open left end and has to make the turn through the door.
 */
export function buildLayout(d: SpaceDims, furnitureLength: number): Layout {
  const t = d.wallThickness;
  const end = d.hallwayLength; // shared right edge of hallway and room interiors
  const roomX = Math.max(0, end - d.roomWidth);
  const roomTop = t;
  const sharedWallY = roomTop + d.roomDepth;
  const hallTop = sharedWallY + t;
  const hallBottom = hallTop + d.hallwayWidth;
  const doorX = Math.max(0, Math.min(end - d.doorWidth, end - d.doorOffset - d.doorWidth));
  const left = Math.min(0, roomX - t);

  const walls: Wall[] = [
    { id: "room-top", x: roomX - t, y: 0, w: end - roomX + 2 * t, h: t },
    { id: "room-left", x: roomX - t, y: 0, w: t, h: hallTop },
    { id: "far-end", x: end, y: 0, w: t, h: hallBottom + t },
    { id: "door-left", x: left, y: sharedWallY, w: doorX - left, h: t },
    { id: "door-right", x: doorX + d.doorWidth, y: sharedWallY, w: end - doorX - d.doorWidth, h: t },
    { id: "hall-bottom", x: left, y: hallBottom, w: end + t - left, h: t },
  ].filter((w) => w.w > 0 && w.h > 0);

  const entry = furnitureLength + 24;
  return {
    walls,
    room: { x: roomX, y: roomTop, w: end - roomX, h: d.roomDepth },
    hallway: { x: 0, y: hallTop, w: end, h: d.hallwayWidth },
    door: { x: doorX, y: sharedWallY, w: d.doorWidth, h: t },
    bounds: { x: left - entry, y: 0, w: end + t - left + entry, h: hallBottom + t },
    start: { x: left - entry / 2, y: hallTop + d.hallwayWidth / 2 },
  };
}

export interface Furniture {
  /** Center position. */
  x: number;
  y: number;
  length: number;
  width: number;
  rotationDeg: number;
}

type Point = { x: number; y: number };

export function furnitureCorners(f: Furniture, buffer = 0): Point[] {
  const hl = f.length / 2 + buffer;
  const hw = f.width / 2 + buffer;
  const a = (f.rotationDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return [
    [-hl, -hw],
    [hl, -hw],
    [hl, hw],
    [-hl, hw],
  ].map(([px, py]) => ({ x: f.x + px * cos - py * sin, y: f.y + px * sin + py * cos }));
}

const rectCorners = (r: Rect): Point[] => [
  { x: r.x, y: r.y },
  { x: r.x + r.w, y: r.y },
  { x: r.x + r.w, y: r.y + r.h },
  { x: r.x, y: r.y + r.h },
];

function project(points: Point[], axis: Point) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of points) {
    const d = p.x * axis.x + p.y * axis.y;
    min = Math.min(min, d);
    max = Math.max(max, d);
  }
  return { min, max };
}

/** Separating Axis Theorem test for two convex quads. Touching edges don't count as overlap. */
function polygonsOverlap(a: Point[], b: Point[]) {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i];
      const p2 = poly[(i + 1) % poly.length];
      const axis = { x: p1.y - p2.y, y: p2.x - p1.x };
      const pa = project(a, axis);
      const pb = project(b, axis);
      if (pa.max <= pb.min + 1e-9 || pb.max <= pa.min + 1e-9) return false;
    }
  }
  return true;
}

export function collidingWalls(f: Furniture, walls: Wall[], buffer = 0): Set<string> {
  const corners = furnitureCorners(f, buffer);
  return new Set(walls.filter((w) => polygonsOverlap(corners, rectCorners(w))).map((w) => w.id));
}

export function isInside(f: Furniture, r: Rect) {
  return furnitureCorners(f).every(
    (p) => p.x >= r.x - 1e-6 && p.x <= r.x + r.w + 1e-6 && p.y >= r.y - 1e-6 && p.y <= r.y + r.h + 1e-6,
  );
}
