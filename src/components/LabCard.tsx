import { ArrowRight, Clock, FlaskConical, Lock } from "lucide-react";
import { LabMetadata } from "../types/labTypes";

interface LabCardProps {
  lab: LabMetadata;
  onSelect: (labId: string) => void;
}

export function LabCard({ lab, onSelect }: LabCardProps) {
  const isAvailable = lab.status === "available";

  return (
    <article className="lab-panel flex min-h-[270px] flex-col justify-between rounded-lg p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-lg bg-teal-50 p-3 text-marine">
            <FlaskConical className="h-6 w-6" aria-hidden="true" />
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isAvailable ? "Available" : "Coming Soon"}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-ink">{lab.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{lab.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {lab.topics.map((topic) => (
            <span key={topic} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-field">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {lab.estimatedTimeMinutes ? `${lab.estimatedTimeMinutes} min` : "Planned"}
        </div>
        <button
          type="button"
          onClick={() => isAvailable && onSelect(lab.id)}
          disabled={!isAvailable}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition ${
            isAvailable
              ? "bg-ink text-white hover:bg-marine"
              : "cursor-not-allowed bg-slate-100 text-slate-500"
          }`}
        >
          {isAvailable ? (
            <>
              Start Lab <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Coming Soon <Lock className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
