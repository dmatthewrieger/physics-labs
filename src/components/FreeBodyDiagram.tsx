export interface ForceVector {
  label: string;
  direction: "left" | "right" | "up" | "down";
  magnitude: number;
  color: string;
}

interface FreeBodyDiagramProps {
  title: string;
  objectLabel: string;
  forces: ForceVector[];
}

const vectorEndpoint = (direction: ForceVector["direction"], length: number) => {
  switch (direction) {
    case "left":
      return { x: 120 - length, y: 100 };
    case "right":
      return { x: 120 + length, y: 100 };
    case "up":
      return { x: 120, y: 100 - length };
    case "down":
      return { x: 120, y: 100 + length };
  }
};

const arrowHead = (direction: ForceVector["direction"], tip: { x: number; y: number }) => {
  const headLength = 18;
  const headHalfWidth = 7;

  switch (direction) {
    case "left": {
      const base = { x: tip.x + headLength, y: tip.y };
      return {
        base,
        points: `${tip.x},${tip.y} ${base.x},${base.y - headHalfWidth} ${base.x},${base.y + headHalfWidth}`,
      };
    }
    case "right": {
      const base = { x: tip.x - headLength, y: tip.y };
      return {
        base,
        points: `${tip.x},${tip.y} ${base.x},${base.y - headHalfWidth} ${base.x},${base.y + headHalfWidth}`,
      };
    }
    case "up": {
      const base = { x: tip.x, y: tip.y + headLength };
      return {
        base,
        points: `${tip.x},${tip.y} ${base.x - headHalfWidth},${base.y} ${base.x + headHalfWidth},${base.y}`,
      };
    }
    case "down": {
      const base = { x: tip.x, y: tip.y - headLength };
      return {
        base,
        points: `${tip.x},${tip.y} ${base.x - headHalfWidth},${base.y} ${base.x + headHalfWidth},${base.y}`,
      };
    }
    default:
      return {
        base: tip,
        points: `${tip.x},${tip.y}`,
      };
  }
};

export function FreeBodyDiagram({ title, objectLabel, forces }: FreeBodyDiagramProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-700">{title}</h3>
      <svg viewBox="0 0 240 200" className="h-auto w-full max-w-sm" role="img" aria-label={title}>
        <rect x="92" y="72" width="56" height="56" rx="8" fill="#e2e8f0" stroke="#172026" strokeWidth="3" />
        <text x="120" y="105" textAnchor="middle" fill="#172026" fontSize="16" fontWeight="800">
          {objectLabel}
        </text>
        {forces.map((force, index) => {
          const length = Math.max(38, Math.min(76, force.magnitude * 9));
          const end = vectorEndpoint(force.direction, length);
          const head = arrowHead(force.direction, end);
          const labelX = force.direction === "left" ? end.x - 10 : force.direction === "right" ? end.x + 10 : end.x;
          const labelY = force.direction === "up" ? end.y - 8 : force.direction === "down" ? end.y + 18 : end.y - 8;
          return (
            <g key={`${force.label}-${index}`}>
              <line
                x1="120"
                y1="100"
                x2={head.base.x}
                y2={head.base.y}
                stroke={force.color}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <polygon points={head.points} fill={force.color} />
              <text
                x={labelX}
                y={labelY}
                textAnchor={force.direction === "left" ? "end" : force.direction === "right" ? "start" : "middle"}
                fill={force.color}
                fontSize="13"
                fontWeight="800"
              >
                {force.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
