import { ArrowLeft, Calculator, Sigma } from "lucide-react";
import { CourseMode } from "../types/labTypes";

interface ModeSelectorProps {
  onBack: () => void;
  onSelectMode: (mode: CourseMode) => void;
}

const modes: Array<{
  id: CourseMode;
  title: string;
  icon: typeof Calculator;
  description: string;
  bullets: string[];
}> = [
  {
    id: "algebra-trig",
    title: "Algebra/Trig-Based Physics",
    icon: Calculator,
    description:
      "For algebra-based or trigonometry-based introductory physics courses. Uses equations, proportional reasoning, graphs, and conceptual reasoning without derivatives or integrals.",
    bullets: ["Net force equations", "Graph slopes", "Free-body diagrams"],
  },
  {
    id: "calculus",
    title: "Calculus-Based Physics",
    icon: Sigma,
    description:
      "For calculus-based university physics courses. Includes derivatives, integrals, differential relationships, impulse, momentum, and more advanced graph analysis.",
    bullets: ["dv/dt and dx/dt", "Impulse integrals", "Momentum models"],
  },
];

export function getModeLabel(mode: CourseMode) {
  return mode === "algebra-trig" ? "Algebra/Trig-Based Physics" : "Calculus-Based Physics";
}

export function ModeSelector({ onBack, onSelectMode }: ModeSelectorProps) {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Lab Details
        </button>

        <header className="mb-6">
          <h1 className="text-4xl font-black text-ink">Choose Your Course Level</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
            The same simulations adapt their explanations, questions, feedback, and report language to the course mode.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <article key={mode.id} className="lab-panel rounded-lg p-6">
                <div className="mb-5 inline-flex rounded-lg bg-blue-50 p-3 text-field">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-black text-ink">{mode.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{mode.description}</p>
                <ul className="mt-5 space-y-2 text-sm font-semibold text-slate-700">
                  {mode.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onSelectMode(mode.id)}
                  className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-marine"
                >
                  Start in this mode
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
