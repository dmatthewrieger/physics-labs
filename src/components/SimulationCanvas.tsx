export interface CartVisual {
  id: string;
  label: string;
  position: number;
  color: string;
  width?: number;
}

export interface ArrowVisual {
  id: string;
  label: string;
  start: number;
  direction: -1 | 1;
  magnitude: number;
  color: string;
  y?: number;
  labelDx?: number;
  labelDy?: number;
}

interface SimulationCanvasProps {
  title: string;
  carts: CartVisual[];
  arrows?: ArrowVisual[];
}

function clamp01(value: number) {
  return Math.max(0.04, Math.min(0.96, value));
}

export function SimulationCanvas({ title, carts, arrows = [] }: SimulationCanvasProps) {
  const width = 720;
  const height = 240;
  const trackLeft = 64;
  const trackRight = 656;
  const trackY = 158;
  const arrowHeadLength = 24;
  const arrowHeadHalfHeight = 10;

  const mapX = (position: number) => trackLeft + clamp01(position) * (trackRight - trackLeft);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-slate-700">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <rect x="0" y="0" width={width} height={height} rx="12" fill="#f8fafc" />
        <line x1={trackLeft} x2={trackRight} y1={trackY} y2={trackY} stroke="#334155" strokeWidth="8" />
        <line x1={trackLeft} x2={trackRight} y1={trackY + 22} y2={trackY + 22} stroke="#cbd5e1" strokeWidth="5" />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line
              x1={trackLeft + tick * (trackRight - trackLeft)}
              x2={trackLeft + tick * (trackRight - trackLeft)}
              y1={trackY + 9}
              y2={trackY + 34}
              stroke="#94a3b8"
              strokeWidth="2"
            />
          </g>
        ))}

        {arrows.map((arrow) => {
          const x1 = mapX(arrow.start);
          const length = Math.max(48, Math.min(135, Math.abs(arrow.magnitude) * 10));
          const tipX = x1 + arrow.direction * length;
          const baseX = tipX - arrow.direction * arrowHeadLength;
          const y = arrow.y ?? 78;
          const labelX = (x1 + baseX) / 2 + (arrow.labelDx ?? 0);
          const labelY = y - 18 + (arrow.labelDy ?? 0);
          const headPoints = `${tipX},${y} ${baseX},${y - arrowHeadHalfHeight} ${baseX},${y + arrowHeadHalfHeight}`;

          return (
            <g key={arrow.id}>
              <line
                x1={x1}
                x2={baseX}
                y1={y}
                y2={y}
                stroke={arrow.color}
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <polygon points={headPoints} fill={arrow.color} />
              <text x={labelX} y={labelY} textAnchor="middle" fill={arrow.color} fontSize="15" fontWeight="700">
                {arrow.label}
              </text>
            </g>
          );
        })}

        {carts.map((cart) => {
          const cartWidth = cart.width ?? 74;
          const x = mapX(cart.position) - cartWidth / 2;
          return (
            <g key={cart.id}>
              <rect x={x} y={trackY - 48} width={cartWidth} height="38" rx="8" fill={cart.color} />
              <rect x={x + 8} y={trackY - 43} width={cartWidth - 16} height="10" rx="4" fill="rgba(255,255,255,0.35)" />
              <circle cx={x + 18} cy={trackY - 4} r="10" fill="#172026" />
              <circle cx={x + cartWidth - 18} cy={trackY - 4} r="10" fill="#172026" />
              <text x={x + cartWidth / 2} y={trackY - 23} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="800">
                {cart.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
