import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Play, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { GraphLine, GraphPanel } from "../../components/GraphPanel";
import { LabLayout } from "../../components/LabLayout";
import { LabReport } from "../../components/LabReport";
import { getModeLabel } from "../../components/ModeSelector";
import { QuestionCard } from "../../components/QuestionCard";
import { CourseMode, LabQuestion, ProgressStep, QuestionResponse } from "../../types/labTypes";
import { configuredLabMap } from "./configuredLabData";
import { ConfiguredInvestigation, ConfiguredLab, ExperimentRow, ExperimentResult } from "./configuredLabTypes";

interface ConfiguredPhysicsLabProps {
  labId: string;
  mode: CourseMode;
  onBackToLibrary: () => void;
  onChangeMode: () => void;
}

const lineColors = ["#2563eb", "#0f766e", "#d97706"];

export function ConfiguredPhysicsLab({
  labId,
  mode,
  onBackToLibrary,
  onChangeMode,
}: ConfiguredPhysicsLabProps) {
  const lab = configuredLabMap.get(labId) ?? configuredLabMap.get("projectile-motion")!;
  const [activeSectionId, setActiveSectionId] = useState("intro");
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [results, setResults] = useState<Record<string, ExperimentResult>>({});

  const sections = [
    { id: "intro", title: "Introduction" },
    ...lab.investigations.map((investigation, index) => ({
      id: investigation.id,
      title: `Investigation ${index + 1}`,
    })),
    { id: "reflection", title: "Reflection" },
    { id: "report", title: "Report" },
  ];

  const handleSubmitResponse = (response: QuestionResponse) => {
    setResponses((current) => ({
      ...current,
      [response.questionId]: response,
    }));
  };

  const sectionQuestions = useMemo(() => {
    const entries = lab.investigations.map((investigation) => [
      investigation.id,
      investigation.questions[mode],
    ]);
    entries.push(["reflection", lab.reflectionQuestions[mode]]);
    return Object.fromEntries(entries) as Record<string, LabQuestion[]>;
  }, [lab, mode]);

  const isSectionComplete = (sectionId: string) => {
    if (sectionId === "intro") {
      return activeSectionId !== "intro";
    }
    if (sectionId === "report") {
      return activeSectionId === "report";
    }
    const questions = sectionQuestions[sectionId] ?? [];
    return questions.length > 0 && questions.every((question) => responses[question.id]?.isComplete);
  };

  const steps: ProgressStep[] = sections.map((section) => ({
    id: section.id,
    title: section.title,
    status:
      activeSectionId === section.id
        ? "in-progress"
        : isSectionComplete(section.id)
          ? "complete"
          : "not-started",
  }));

  const goToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    const index = sections.findIndex((section) => section.id === activeSectionId);
    goToSection(sections[Math.min(sections.length - 1, index + 1)].id);
  };

  const goPrevious = () => {
    const index = sections.findIndex((section) => section.id === activeSectionId);
    goToSection(sections[Math.max(0, index - 1)].id);
  };

  const allQuestions = [
    ...lab.investigations.flatMap((investigation) => investigation.questions[mode]),
    ...lab.reflectionQuestions[mode],
  ];
  const completedSections = sections
    .filter((section) => isSectionComplete(section.id))
    .map((section) => section.title);
  const responseList = Object.values(responses);

  const activeContent = () => {
    if (activeSectionId === "intro") {
      return <IntroSection lab={lab} mode={mode} onContinue={goNext} />;
    }

    if (activeSectionId === "reflection") {
      return (
        <section className="space-y-4">
          <div className="lab-panel rounded-lg p-5">
            <p className="text-sm font-black uppercase tracking-wide text-marine">Final Reflection</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Synthesize the Evidence</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Use your predictions, graphs, readouts, and data tables from the investigations to write complete
              responses.
            </p>
          </div>
          {lab.reflectionQuestions[mode].map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              response={responses[question.id]}
              onSubmit={handleSubmitResponse}
            />
          ))}
        </section>
      );
    }

    if (activeSectionId === "report") {
      return (
        <LabReport
          labTitle={lab.title}
          modeLabel={getModeLabel(mode)}
          completedSections={completedSections}
          questions={allQuestions}
          responses={responseList}
          tables={lab.investigations.map((investigation) => ({
            title: `${investigation.title} Data`,
            rows: results[investigation.id]?.rows ?? [],
          }))}
          conclusionScaffold={lab.conclusionScaffold}
        />
      );
    }

    const investigation = lab.investigations.find((item) => item.id === activeSectionId) ?? lab.investigations[0];
    return (
      <InvestigationSection
        key={investigation.id}
        investigation={investigation}
        mode={mode}
        result={results[investigation.id]}
        responses={responses}
        onSubmitResponse={handleSubmitResponse}
        onRun={(nextResult) =>
          setResults((current) => ({
            ...current,
            [investigation.id]: nextResult,
          }))
        }
      />
    );
  };

  return (
    <LabLayout
      title={lab.title}
      mode={mode}
      steps={steps}
      activeStepId={activeSectionId}
      onSelectStep={goToSection}
      onBackToLibrary={onBackToLibrary}
      onChangeMode={onChangeMode}
      onOpenReport={() => goToSection("report")}
    >
      {activeContent()}
      {activeSectionId !== "intro" && activeSectionId !== "report" ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goPrevious}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-marine"
          >
            Next Section
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </LabLayout>
  );
}

function IntroSection({
  lab,
  mode,
  onContinue,
}: {
  lab: ConfiguredLab;
  mode: CourseMode;
  onContinue: () => void;
}) {
  return (
    <section className="space-y-5">
      <div className="lab-panel rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-wide text-marine">{lab.title}</p>
        <h2 className="mt-2 text-3xl font-black text-ink">{lab.introTitle}</h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">{lab.intro}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="lab-panel rounded-lg p-5">
          <h3 className="text-xl font-black text-ink">Learning Objectives</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {lab.objectives[mode].map((objective) => (
              <li key={objective} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-marine" aria-hidden="true" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="lab-panel rounded-lg p-5">
          <h3 className="text-xl font-black text-ink">Lab Path</h3>
          <div className="mt-4 grid gap-3">
            {lab.investigations.map((investigation, index) => (
              <div key={investigation.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-ink">Investigation {index + 1}</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{investigation.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{investigation.purpose}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-marine"
          >
            Begin Investigation 1 <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>
  );
}

function InvestigationSection({
  investigation,
  mode,
  result,
  responses,
  onSubmitResponse,
  onRun,
}: {
  investigation: ConfiguredInvestigation;
  mode: CourseMode;
  result?: ExperimentResult;
  responses: Record<string, QuestionResponse>;
  onSubmitResponse: (response: QuestionResponse) => void;
  onRun: (result: ExperimentResult) => void;
}) {
  const [controlValues, setControlValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(investigation.controls.map((control) => [control.key, control.defaultValue])),
  );
  const questions = investigation.questions[mode];
  const predictionQuestions = questions.filter((question) => question.type === "prediction");
  const analysisQuestions = questions.filter((question) => question.type !== "prediction");

  const runExperiment = () => {
    onRun(investigation.run(controlValues));
  };

  const graphLines: GraphLine[] = result
    ? [
        { key: "y", label: result.yLineLabel, color: lineColors[0] },
        ...(result.secondaryLineLabel ? [{ key: "secondary", label: result.secondaryLineLabel, color: lineColors[1] }] : []),
        ...(result.tertiaryLineLabel ? [{ key: "tertiary", label: result.tertiaryLineLabel, color: lineColors[2] }] : []),
      ]
    : [{ key: "y", label: "result", color: lineColors[0] }];

  return (
    <section className="space-y-5">
      <article className="lab-panel rounded-lg p-5">
        <p className="text-sm font-black uppercase tracking-wide text-marine">{investigation.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black text-ink">{investigation.title}</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
          <p>
            <strong>Purpose:</strong> {investigation.purpose}
          </p>
          <p>
            <strong>Procedure:</strong> {investigation.procedure}
          </p>
          <p>
            <strong>Analysis:</strong> {investigation.analysis[mode]}
          </p>
        </div>
      </article>

      <div className="space-y-3">
        <div className="lab-panel rounded-lg p-5">
          <p className="text-sm font-black uppercase tracking-wide text-ember">Before You Experiment</p>
          <h3 className="mt-2 text-xl font-black text-ink">Prediction</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Submit your prediction first, then run the virtual trial and compare it with the results.
          </p>
        </div>
        {predictionQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            response={responses[question.id]}
            onSubmit={onSubmitResponse}
          />
        ))}
      </div>

      <div className="lab-panel rounded-lg p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-md bg-blue-50 p-2 text-field">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-black text-ink">Experiment Controls</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {investigation.controls.map((control) => (
            <label key={control.key}>
              <span className="control-label">
                {control.label}: {formatControlValue(controlValues[control.key], control.unit)}
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={controlValues[control.key]}
                onChange={(event) =>
                  setControlValues((current) => ({
                    ...current,
                    [control.key]: Number(event.target.value),
                  }))
                }
                className="range-field mt-2"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={runExperiment}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-marine"
        >
          {result ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {result ? "Run Updated Trial" : "Run Trial"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md bg-emerald-50 p-2 text-marine">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">{investigation.diagramTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{investigation.diagramCaption}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(result?.metrics ?? []).map((metric) => (
              <div key={`${metric.label}-${metric.unit}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{metric.label}</p>
                <p className="mt-1 text-lg font-black text-ink">
                  {formatMetricValue(metric.value, metric.precision)} {metric.unit}
                </p>
              </div>
            ))}
            {!result ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500 sm:col-span-2">
                Run the trial to collect readouts, graph data, and a data table.
              </div>
            ) : null}
          </div>
        </article>

        <GraphPanel
          title={result?.graphTitle ?? "Experiment graph"}
          data={result?.rows ?? []}
          xKey="x"
          xLabel={result?.xLabel ?? "input"}
          yLabel={result?.yLabel ?? "output"}
          lines={graphLines}
        />
      </div>

      <DataTable<ExperimentRow>
        caption={`${investigation.title} Data`}
        columns={[
          { key: "step", label: "Step", precision: 0 },
          { key: "label", label: "Trial" },
          { key: "x", label: "Input", precision: 3 },
          { key: "y", label: "Primary", precision: 4 },
          { key: "secondary", label: "Secondary", precision: 4 },
          { key: "tertiary", label: "Tertiary", precision: 4 },
        ]}
        rows={result?.rows ?? []}
      />

      <div className="space-y-3">
        <h3 className="text-xl font-black text-ink">Analysis Questions</h3>
        {analysisQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            response={responses[question.id]}
            onSubmit={onSubmitResponse}
          />
        ))}
      </div>
    </section>
  );
}

function formatControlValue(value: number, unit: string) {
  const formatted = Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)
    ? value.toExponential(2)
    : Number.isInteger(value)
      ? value.toFixed(0)
      : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatMetricValue(value: number, precision = 3) {
  if (Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(3);
  }
  return value.toFixed(precision).replace(/0+$/, "").replace(/\.$/, "");
}
