"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  buildLayout,
  collidingWalls,
  formatLength,
  fromInches,
  isInside,
  toInches,
  type SpaceDims,
  type Unit,
} from "@/lib/geometry";

// Konva touches `window`, so it can only render on the client.
const SimulationCanvas = dynamic(() => import("./SimulationCanvas"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-slate-100" />,
});

const CATEGORIES: { name: string; length: number; width: number }[] = [
  { name: "Sofa", length: 84, width: 34 },
  { name: "Loveseat", length: 60, width: 34 },
  { name: "Queen mattress", length: 80, width: 60 },
  { name: "Twin XL mattress", length: 80, width: 39 },
  { name: "Dresser", length: 60, width: 20 },
  { name: "Desk", length: 48, width: 24 },
  { name: "Dining table", length: 72, width: 36 },
  { name: "Bookshelf", length: 36, width: 12 },
];

const DEFAULT_SPACE: SpaceDims = {
  hallwayWidth: 40,
  hallwayLength: 180,
  doorWidth: 36,
  doorOffset: 12,
  roomWidth: 144,
  roomDepth: 120,
  wallThickness: 5,
};

const SPACE_FIELDS: { key: keyof SpaceDims; label: string }[] = [
  { key: "doorWidth", label: "Doorway width" },
  { key: "hallwayWidth", label: "Hallway width" },
  { key: "hallwayLength", label: "Hallway length" },
  { key: "doorOffset", label: "Door to hallway end" },
  { key: "roomWidth", label: "Room width" },
  { key: "roomDepth", label: "Room depth" },
];

const UNITS: Unit[] = ["in", "cm", "ft"];

function LengthInput({
  label,
  inches,
  unit,
  onChange,
}: {
  label: string;
  inches: number;
  unit: Unit;
  onChange: (inches: number) => void;
}) {
  const shown = Math.round(fromInches(inches, unit) * 100) / 100;
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center rounded-md border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-400">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={Number.isFinite(shown) ? shown : ""}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) && v >= 0 ? toInches(v, unit) : 0);
          }}
          className="w-full min-w-0 rounded-md bg-transparent px-2 py-1.5 outline-none"
        />
        <span className="pr-2 text-xs text-slate-400">{unit}</span>
      </div>
    </label>
  );
}

export default function MoveSimulator({ initialUnit = "in" }: { initialUnit?: Unit }) {
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [length, setLength] = useState(CATEGORIES[0].length);
  const [width, setWidth] = useState(CATEGORIES[0].width);
  const [space, setSpace] = useState<SpaceDims>(DEFAULT_SPACE);
  const [buffer, setBuffer] = useState(0);
  const [rotation, setRotation] = useState(0);

  const layout = useMemo(() => buildLayout(space, Math.max(length, width)), [space, length, width]);
  const [pos, setPos] = useState(layout.start);

  const furniture = { x: pos.x, y: pos.y, length, width, rotationDeg: rotation };
  const hits = collidingWalls(furniture, layout.walls, buffer);
  const inRoom = hits.size === 0 && isInside(furniture, layout.room);

  const resetPosition = () => {
    setPos(layout.start);
    setRotation(0);
  };

  // Keyboard: arrows nudge (shift = 6in), R / shift+R rotates 15°.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      const step = e.shiftKey ? 6 : 1;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      if (moves[e.key]) {
        e.preventDefault();
        const [dx, dy] = moves[e.key];
        setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      } else if (e.key.toLowerCase() === "r") {
        setRotation((r) => (((r + (e.shiftKey ? -15 : 15)) % 360) + 360) % 360);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Quick 2D sanity checks: the narrow side of the item has to clear each opening.
  const narrowSide = Math.min(length, width) + buffer * 2;
  const blockers = [
    narrowSide > space.doorWidth && `the ${formatLength(space.doorWidth, unit)} doorway`,
    narrowSide > space.hallwayWidth && `the ${formatLength(space.hallwayWidth, unit)} hallway`,
  ].filter(Boolean) as string[];

  const status = inRoom
    ? { tone: "bg-green-50 text-green-800 border-green-200", text: "It made it into the room with no collisions." }
    : hits.size > 0
      ? { tone: "bg-red-50 text-red-800 border-red-200", text: `Collision! Touching ${hits.size} wall${hits.size > 1 ? "s" : ""}. Rotate or reposition.` }
      : { tone: "bg-slate-50 text-slate-700 border-slate-200", text: "Clear. Drag the item through the hallway and doorway into the room." };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Furniture</h2>
            <div className="flex overflow-hidden rounded-md border border-slate-300 text-xs">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-2 py-1 ${unit === u ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Type</span>
            <select
              value={category}
              onChange={(e) => {
                const c = CATEGORIES.find((c) => c.name === e.target.value);
                setCategory(e.target.value);
                if (c) {
                  setLength(c.length);
                  setWidth(c.width);
                }
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5"
            >
              {CATEGORIES.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
              <option>Custom</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <LengthInput label="Length" inches={length} unit={unit} onChange={(v) => { setLength(v); setCategory("Custom"); }} />
            <LengthInput label="Depth" inches={width} unit={unit} onChange={(v) => { setWidth(v); setCategory("Custom"); }} />
          </div>
          <LengthInput label="Safety buffer (each side)" inches={buffer} unit={unit} onChange={setBuffer} />
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Route</h2>
          <div className="grid grid-cols-2 gap-3">
            {SPACE_FIELDS.map((f) => (
              <LengthInput
                key={f.key}
                label={f.label}
                inches={space[f.key]}
                unit={unit}
                onChange={(v) => setSpace((s) => ({ ...s, [f.key]: v }))}
              />
            ))}
          </div>
        </section>
      </aside>

      <section className="flex min-w-0 flex-col gap-4">
        <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${status.tone}`}>{status.text}</div>

        {blockers.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Even its narrow side ({formatLength(narrowSide, unit)}) is wider than {blockers.join(" and ")}, so it
            won&apos;t fit lying flat at any angle. You may need to tilt it on end or take it apart.
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <SimulationCanvas
            layout={layout}
            furniture={furniture}
            label={category === "Custom" ? "Item" : category}
            hits={hits}
            inRoom={inRoom}
            buffer={buffer}
            unit={unit}
            onMove={(x, y) => setPos({ x, y })}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <span className="text-sm font-medium">Rotation</span>
          <input
            type="range"
            min={0}
            max={359}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="flex-1 accent-indigo-600"
            aria-label="Rotation in degrees"
          />
          <div className="flex items-center gap-2">
            <button onClick={() => setRotation((r) => (r + 345) % 360)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              −15°
            </button>
            <span className="w-10 text-center text-sm tabular-nums">{rotation}°</span>
            <button onClick={() => setRotation((r) => (r + 15) % 360)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              +15°
            </button>
            <button onClick={resetPosition} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700">
              Reset
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Drag the item to move it. Keyboard: arrow keys nudge (Shift for bigger steps), R / Shift+R rotates. Walls turn
          red when the item (plus its safety buffer) overlaps them. This is a 2D overhead view, so tilting isn&apos;t modeled.
        </p>
      </section>
    </div>
  );
}
