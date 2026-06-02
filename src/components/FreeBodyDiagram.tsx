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

export function FreeBodyDiagram({ title, objectLabel, forces }: FreeBodyDiagramProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-700">{title}</h3>
      <svg viewBox="0 0 240 200" className="h-auto w-full max-w-sm" role="img" aria-label={title}>
        <defs>
          {forces.map((force, index) => (
            <marker
              key={`${force.label}-${index}`}
              id={`${title.replace(/\s+/g, "-")}-${index}`}
              markerUnits="userSpaceOnUse"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M1,1 L7,4 L1,7 Z" fill={force.color} />
            </marker>
          ))}
        </defs>
        <rect x="92" y="72" width="56" height="56" rx="8" fill="#e2e8f0" stroke="#172026" strokeWidth="3" />
        <text x="120" y="105" textAnchor="middle" fill="#172026" fontSize="16" fontWeight="800">
          {objectLabel}
        </text>
        {forces.map((force, index) => {
          const length = Math.max(32, Math.min(76, force.magnitude * 9));
          const end = vectorEndpoint(force.direction, length);
          const labelX = force.direction === "left" ? end.x - 10 : force.direction === "right" ? end.x + 10 : end.x;
          const labelY = force.direction === "up" ? end.y - 8 : force.direction === "down" ? end.y + 18 : end.y - 8;
          return (
            <g key={`${force.label}-${index}`}>
              <line
                x1="120"
                y1="100"
                x2={end.x}
                y2={end.y}
                stroke={force.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd={`url(#${title.replace(/\s+/g, "-")}-${index})`}
              />
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
