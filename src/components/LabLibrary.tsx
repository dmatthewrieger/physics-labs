import { Atom, Github } from "lucide-react";
import { labs } from "../data/labs";
import { LabCard } from "./LabCard";

interface LabLibraryProps {
  onSelectLab: (labId: string) => void;
}

export function LabLibrary({ onSelectLab }: LabLibraryProps) {
  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-marine">
              <Atom className="h-4 w-4" aria-hidden="true" />
              College Physics Virtual Labs
            </div>
            <h1 className="text-4xl font-black text-ink sm:text-5xl">Physics Lab Library</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Interactive simulations and guided virtual labs for online college physics courses
            </p>
          </div>
          <div className="flex w-full max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Github className="h-6 w-6 text-ink" aria-hidden="true" />
            <p className="text-sm leading-6 text-slate-600">
              Registry-driven React app configured for GitHub Pages deployment.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {labs.map((lab) => (
            <LabCard key={lab.id} lab={lab} onSelect={onSelectLab} />
          ))}
        </div>
      </section>
    </main>
  );
}
