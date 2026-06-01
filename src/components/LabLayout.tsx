import { ArrowLeft, BookOpen, FileText, RotateCcw } from "lucide-react";
import { ReactNode } from "react";
import { CourseMode, ProgressStep } from "../types/labTypes";
import { getModeLabel } from "./ModeSelector";
import { ProgressTracker } from "./ProgressTracker";

interface LabLayoutProps {
  title: string;
  mode: CourseMode;
  steps: ProgressStep[];
  activeStepId: string;
  onSelectStep: (stepId: string) => void;
  onBackToLibrary: () => void;
  onChangeMode: () => void;
  onOpenReport: () => void;
  children: ReactNode;
}

export function LabLayout({
  title,
  mode,
  steps,
  activeStepId,
  onSelectStep,
  onBackToLibrary,
  onChangeMode,
  onOpenReport,
  children,
}: LabLayoutProps) {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={onBackToLibrary}
                className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-marine"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Lab Library
              </button>
              <div className="flex items-center gap-3">
                <BookOpen className="h-7 w-7 text-marine" aria-hidden="true" />
                <h1 className="text-3xl font-black text-ink">{title}</h1>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">Current mode: {getModeLabel(mode)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onChangeMode}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Change Mode
              </button>
              <button
                type="button"
                onClick={onOpenReport}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-marine"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Lab Report
              </button>
            </div>
          </div>
          <div className="mt-5">
            <ProgressTracker steps={steps} activeStepId={activeStepId} onSelectStep={onSelectStep} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
    </main>
  );
}
