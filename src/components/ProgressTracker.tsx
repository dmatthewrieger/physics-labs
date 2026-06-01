import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { ProgressStep } from "../types/labTypes";

interface ProgressTrackerProps {
  steps: ProgressStep[];
  activeStepId: string;
  onSelectStep: (stepId: string) => void;
}

export function ProgressTracker({ steps, activeStepId, onSelectStep }: ProgressTrackerProps) {
  return (
    <nav aria-label="Lab progress" className="lab-panel rounded-lg p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((step) => {
          const isActive = step.id === activeStepId;
          const Icon =
            step.status === "complete" ? CheckCircle2 : step.status === "in-progress" ? PlayCircle : Circle;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              className={`flex min-w-[150px] items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold transition ${
                isActive ? "bg-ink text-white" : "bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-marine"
              }`}
            >
              <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="leading-5">{step.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
