import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FlaskConical } from "lucide-react";
import { LabMetadata } from "../types/labTypes";

interface LabDetailsProps {
  lab: LabMetadata;
  onBack: () => void;
  onChooseMode: () => void;
}

const labPaths: Record<string, string[]> = {
  "newtons-laws": [
    "1. Introduction and learning objectives",
    "2. Newton's First Law: inertia and net force",
    "3. Newton's Second Law: force, mass, and acceleration",
    "4. Newton's Third Law: action and reaction",
    "5. Final reflection and lab report",
  ],
  "one-dimensional-kinematics": [
    "1. Introduction and learning objectives",
    "2. Constant velocity: position-time slope and displacement",
    "3. Constant acceleration: velocity-time slope and changing position",
    "4. Graph analysis: signs, slopes, areas, and turn-around motion",
    "5. Final reflection and lab report",
  ],
};

export function LabDetails({ lab, onBack, onChooseMode }: LabDetailsProps) {
  const pathItems = labPaths[lab.id] ?? [
    "1. Introduction",
    "2. Guided simulation",
    "3. Data and graphs",
    "4. Reflection",
    "5. Lab report",
  ];

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Lab Library
        </button>

        <section className="lab-panel overflow-hidden rounded-lg">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Available Now
              </div>
              <h1 className="mt-5 text-4xl font-black text-ink">{lab.title}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">{lab.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {lab.topics.map((topic) => (
                  <span key={topic} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-field">
                    {topic}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onChooseMode}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-marine"
                >
                  Choose Course Level <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Estimated time: {lab.estimatedTimeMinutes} minutes
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0">
              <div className="rounded-lg bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-md bg-amber-100 p-2 text-ember">
                    <FlaskConical className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-black text-ink">Lab Path</h2>
                </div>
                <ol className="space-y-3 text-sm leading-6 text-slate-600">
                  {pathItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
