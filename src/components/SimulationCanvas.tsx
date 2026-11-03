"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import { formatLength, type Furniture, type Layout, type Unit } from "@/lib/geometry";

const PAD = 16;

const COLORS = {
  floor: "#f1f5f9",
  room: "#e0f2fe",
  wall: "#334155",
  wallHit: "#dc2626",
  door: "#22c55e",
  furniture: "#6366f1",
  furnitureHit: "#ef4444",
  furnitureDone: "#16a34a",
  buffer: "#94a3b8",
  label: "#0f172a",
};

interface Props {
  layout: Layout;
  furniture: Furniture;
  label: string;
  hits: Set<string>;
  inRoom: boolean;
  buffer: number;
  unit: Unit;
  onMove: (x: number, y: number) => void;
}

export default function SimulationCanvas({ layout, furniture, label, hits, inRoom, buffer, unit, onMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { bounds, walls, room, hallway, door } = layout;
  const scale = width > 0 ? (width - PAD * 2) / bounds.w : 1;
  const height = bounds.h * scale + PAD * 2;
  const fontSize = 12 / scale;
  const collided = hits.size > 0;
  const fill = collided ? COLORS.furnitureHit : inRoom ? COLORS.furnitureDone : COLORS.furniture;

  return (
    <div ref={containerRef} className="w-full touch-none select-none">
      {width > 0 && (
        <Stage width={width} height={height} scaleX={scale} scaleY={scale} x={PAD - bounds.x * scale} y={PAD}>
          <Layer>
            <Rect {...bounds} fill={COLORS.floor} />
            <Rect {...hallway} fill="#fff" />
            <Rect {...room} fill={COLORS.room} />
            <Text x={room.x + 4 / scale} y={room.y + 4 / scale} text="ROOM" fontSize={fontSize} fill={COLORS.label} />
            <Text
              x={hallway.x + 4 / scale}
              y={hallway.y + 4 / scale}
              text={`HALLWAY · ${formatLength(hallway.h, unit)} wide`}
              fontSize={fontSize}
              fill={COLORS.label}
            />
            <Text x={bounds.x + 4 / scale} y={hallway.y - fontSize * 1.4} text="START →" fontSize={fontSize} fill={COLORS.label} />

            {walls.map((w) => (
              <Rect key={w.id} x={w.x} y={w.y} width={w.w} height={w.h} fill={hits.has(w.id) ? COLORS.wallHit : COLORS.wall} />
            ))}

            <Line
              points={[door.x, door.y + door.h / 2, door.x + door.w, door.y + door.h / 2]}
              stroke={COLORS.door}
              strokeWidth={2 / scale}
              dash={[6 / scale, 4 / scale]}
            />
            <Text
              x={door.x + door.w / 2 - fontSize * 4}
              y={door.y - fontSize * 1.4}
              width={fontSize * 8}
              align="center"
              wrap="none"
              text={`door ${formatLength(door.w, unit)}`}
              fontSize={fontSize}
              fill={COLORS.door}
            />

            <Group
              x={furniture.x}
              y={furniture.y}
              rotation={furniture.rotationDeg}
              draggable
              onDragMove={(e) => onMove(e.target.x(), e.target.y())}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "grab";
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "default";
              }}
            >
              {buffer > 0 && (
                <Rect
                  x={-furniture.length / 2 - buffer}
                  y={-furniture.width / 2 - buffer}
                  width={furniture.length + buffer * 2}
                  height={furniture.width + buffer * 2}
                  stroke={COLORS.buffer}
                  strokeWidth={1 / scale}
                  dash={[4 / scale, 3 / scale]}
                />
              )}
              <Rect
                x={-furniture.length / 2}
                y={-furniture.width / 2}
                width={furniture.length}
                height={furniture.width}
                fill={fill}
                opacity={0.85}
                cornerRadius={2}
              />
              <Text
                x={-furniture.length / 2}
                y={-fontSize / 2}
                width={furniture.length}
                align="center"
                text={label}
                fontSize={fontSize}
                fill="#fff"
              />
            </Group>
          </Layer>
        </Stage>
      )}
    </div>
  );
}
