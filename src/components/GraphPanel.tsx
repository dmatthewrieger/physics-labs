import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface GraphLine {
  key: string;
  label: string;
  color: string;
}

interface GraphPanelProps {
  title: string;
  data: object[];
  xKey: string;
  xLabel: string;
  yLabel: string;
  lines: GraphLine[];
}

export function GraphPanel({ title, data, xKey, xLabel, yLabel, lines }: GraphPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">{title}</h3>
        <span className="text-xs font-semibold text-slate-500">
          {xLabel} | {yLabel}
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 24, bottom: 12, left: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: "#475569", fontSize: 12 }}
              label={{ value: xLabel, position: "insideBottom", offset: -6, fill: "#475569" }}
            />
            <YAxis
              tick={{ fill: "#475569", fontSize: 12 }}
              label={{
                value: yLabel,
                angle: -90,
                position: "insideLeft",
                fill: "#475569",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
              }}
            />
            <Legend verticalAlign="top" height={28} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
