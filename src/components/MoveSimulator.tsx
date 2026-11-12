"use client";

import { CircleAlert, CircleCheck, Info, RotateCcw, RotateCw, TriangleAlert } from "lucide-react";
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
import { icon, iconLg } from "./icon";

// Konva touches `window`, so it can only render on the client.
const SimulationCanvas = dynamic(() => import("./SimulationCanvas"), {
  ssr: false,
  loading: () => <div className="skeleton aspect-[16/9] w-full" aria-label="Loading floor plan" />,
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
      <div className="flex items-center rounded-md border border-line bg-surface transition-colors focus-within:border-navy focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-navy/25">
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
          className="measure w-full min-w-0 bg-transparent px-3 py-2 outline-none"
        />
        <span className="measure pr-3 text-xs text-ink-muted">{unit}</span>
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
    ? { tone: "border-success/25 bg-success-tint", color: "text-success", Icon: CircleCheck, title: "It fits.", text: "It's fully in the room and isn't touching any wall." }
    : hits.size > 0
      ? {
          tone: "border-danger/25 bg-danger-tint",
          color: "text-danger",
          Icon: CircleAlert,
          title: "Collision.",
          text: `It's touching ${hits.size} wall${hits.size > 1 ? "s" : ""}. Rotate it or move it back.`,
        }
      : { tone: "border-navy/20 bg-navy-tint", color: "text-navy", Icon: Info, title: "Not touching any walls.", text: "Drag it along the hallway and through the door into the room." };

  const rotateBtn = "measure inline-flex h-9 items-center gap-1.5 rounded-md border border-ink/20 px-2.5 text-sm hover:border-ink/40 hover:bg-sand";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5">
        <Panel
          title="Furniture"
          action={
            <div className="flex rounded-md border border-line bg-sand p-0.5 text-xs" role="group" aria-label="Units">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  aria-pressed={unit === u}
                  className={`measure rounded-sm px-2.5 py-1 font-medium transition-colors ${unit === u ? "bg-ink text-white" : "text-ink-muted hover:text-ink"}`}
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
        <div role="status" className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${status.tone}`}>
          <status.Icon {...iconLg} className={`shrink-0 ${status.color}`} />
          <span className={status.color}>
            <span className="font-semibold">{status.title}</span> <span className="text-ink">{status.text}</span>
          </span>
        </div>

        {blockers.length > 0 && (
          <div role="alert" className="flex gap-3 rounded-md border border-accent/30 bg-warning-tint px-4 py-3 text-sm text-ink">
            <TriangleAlert {...iconLg} className="shrink-0 text-accent-strong" />
            <span>
              <span className="font-semibold">It won&apos;t fit lying flat.</span> Its narrow side is{" "}
              <span className="measure">{formatLength(narrowSide, unit)}</span>, wider than {blockers.join(" and ")}. Try
              standing it on end or taking it apart.
            </span>
          </div>
        )}

        <div className="card overflow-hidden p-2">
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
              <RotateCcw {...icon} />
              15°
            </button>
            <output className="measure w-11 text-center text-sm" aria-label="Current rotation">{rotation}°</output>
            <button onClick={() => setRotation((r) => (r + 15) % 360)} className={rotateBtn} aria-label="Rotate 15 degrees clockwise">
              <RotateCw {...icon} />
              15°
            </button>
            <button onClick={resetPosition} className="btn-dark ml-1 px-3.5 py-2">
              Reset
            </button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">
          Drag the piece to move it. On a keyboard, arrow keys nudge it (hold Shift for bigger steps) and R or Shift+R
          rotates it. A wall turns red when the piece, plus its safety buffer, overlaps it. This is an overhead 2D view,
          so tilting isn&apos;t modeled.
        </p>
      </section>
    </div>
  );
}
