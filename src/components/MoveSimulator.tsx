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
    <label className="flex flex-col gap-1.5">
      <span className="field-label">{label}</span>
      <div className="flex items-center rounded-xl border border-line bg-surface transition-colors focus-within:border-navy focus-within:ring-4 focus-within:ring-navy/10">
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
          className="w-full min-w-0 bg-transparent px-3 py-2 tabular-nums outline-none"
        />
        <span className="pr-3 font-mono text-xs text-ink-muted">{unit}</span>
      </div>
    </label>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
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
    ? { tone: "bg-success-tint text-success", dot: "bg-success", title: "It fits.", text: "Fully in the room with no collisions." }
    : hits.size > 0
      ? {
          tone: "bg-danger-tint text-danger",
          dot: "bg-danger",
          title: "Collision.",
          text: `Touching ${hits.size} wall${hits.size > 1 ? "s" : ""}. Rotate or reposition it.`,
        }
      : { tone: "bg-navy-tint text-navy", dot: "bg-navy", title: "All clear.", text: "Drag it through the hallway and doorway into the room." };

  const rotateBtn = "grid h-9 min-w-12 place-items-center rounded-full border border-line px-3 text-sm tabular-nums hover:bg-sand";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5">
        <Panel
          title="Furniture"
          action={
            <div className="flex rounded-full bg-sand p-0.5 text-xs" role="group" aria-label="Units">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  aria-pressed={unit === u}
                  className={`rounded-full px-3 py-1 font-medium transition-colors ${unit === u ? "bg-ink text-white" : "text-ink-muted hover:text-ink"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          }
        >
          <label className="flex flex-col gap-1.5">
            <span className="field-label">Type</span>
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
              className="input py-2"
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
        </Panel>

        <Panel title="Route">
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
        </Panel>
      </aside>

      <section className="flex min-w-0 flex-col gap-4">
        <div role="status" className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm ${status.tone}`}>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dot}`} aria-hidden />
          <span>
            <span className="font-semibold">{status.title}</span> <span className="text-ink">{status.text}</span>
          </span>
        </div>

        {blockers.length > 0 && (
          <div className="rounded-2xl bg-warning-tint px-5 py-3.5 text-sm text-ink">
            <span className="font-semibold">Heads up:</span> even its narrow side ({formatLength(narrowSide, unit)}) is
            wider than {blockers.join(" and ")}, so it won&apos;t fit lying flat at any angle. You may need to stand it
            on end or take it apart.
          </div>
        )}

        <div className="card overflow-hidden p-3">
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

        <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
          <span className="text-[15px] font-semibold">Rotation</span>
          <input
            type="range"
            min={0}
            max={359}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="flex-1 accent-navy"
            aria-label="Rotation in degrees"
          />
          <div className="flex items-center gap-2">
            <button onClick={() => setRotation((r) => (r + 345) % 360)} className={rotateBtn} aria-label="Rotate 15 degrees counter-clockwise">
              −15°
            </button>
            <span className="w-11 text-center font-mono text-sm tabular-nums">{rotation}°</span>
            <button onClick={() => setRotation((r) => (r + 15) % 360)} className={rotateBtn} aria-label="Rotate 15 degrees clockwise">
              +15°
            </button>
            <button onClick={resetPosition} className="btn-dark ml-1 px-4 py-2">
              Reset
            </button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">
          Drag to move. Keyboard: arrow keys nudge (Shift for bigger steps), R / Shift+R rotates. Walls turn red when the
          item, plus its safety buffer, overlaps them. This is a 2D overhead view, so tilting isn&apos;t modeled.
        </p>
      </section>
    </div>
  );
}
