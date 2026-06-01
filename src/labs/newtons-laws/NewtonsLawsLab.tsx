import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { LabLayout } from "../../components/LabLayout";
import { LabReport } from "../../components/LabReport";
import { getModeLabel } from "../../components/ModeSelector";
import { QuestionCard } from "../../components/QuestionCard";
import { CourseMode, ProgressStep, QuestionResponse } from "../../types/labTypes";
import { FirstLawLab } from "./FirstLawLab";
import { SecondLawLab } from "./SecondLawLab";
import { ThirdLawLab } from "./ThirdLawLab";
import {
  finalReflectionQuestions,
  firstLawQuestions,
  questionsForMode,
  secondLawQuestions,
  thirdLawQuestions,
} from "./newtonsQuestions";
import { FirstLawSample, SecondLawSample, SecondLawTrial, ThirdLawSample } from "./newtonsTypes";

interface NewtonsLawsLabProps {
  mode: CourseMode;
  onBackToLibrary: () => void;
  onChangeMode: () => void;
}

const sections = [
  { id: "intro", title: "Introduction" },
  { id: "first-law", title: "First Law" },
  { id: "second-law", title: "Second Law" },
  { id: "third-law", title: "Third Law" },
  { id: "reflection", title: "Reflection" },
  { id: "report", title: "Report" },
];

const sectionTitles = new Map(sections.map((section) => [section.id, section.title]));

export function NewtonsLawsLab({ mode, onBackToLibrary, onChangeMode }: NewtonsLawsLabProps) {
  const [activeSectionId, setActiveSectionId] = useState("intro");
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [firstLawData, setFirstLawData] = useState<FirstLawSample[]>([]);
  const [secondLawHistory, setSecondLawHistory] = useState<SecondLawSample[]>([]);
  const [secondLawTrials, setSecondLawTrials] = useState<SecondLawTrial[]>([]);
  const [thirdLawData, setThirdLawData] = useState<ThirdLawSample[]>([]);

  const responseList = useMemo(() => Object.values(responses), [responses]);

  const handleSubmitResponse = (response: QuestionResponse) => {
    setResponses((current) => ({
      ...current,
      [response.questionId]: response,
    }));
  };

  const sectionQuestions = useMemo(
    () => ({
      "first-law": firstLawQuestions[mode],
      "second-law": secondLawQuestions[mode],
      "third-law": thirdLawQuestions[mode],
      reflection: finalReflectionQuestions[mode],
    }),
    [mode],
  );

  const isSectionComplete = (sectionId: string) => {
    if (sectionId === "intro") {
      return activeSectionId !== "intro";
    }
    if (sectionId === "report") {
      return activeSectionId === "report";
    }
    const questions = sectionQuestions[sectionId as keyof typeof sectionQuestions] ?? [];
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

  const goNext = () => {
    const index = sections.findIndex((section) => section.id === activeSectionId);
    setActiveSectionId(sections[Math.min(sections.length - 1, index + 1)].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrevious = () => {
    const index = sections.findIndex((section) => section.id === activeSectionId);
    setActiveSectionId(sections[Math.max(0, index - 1)].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allQuestions = questionsForMode(mode);
  const completedSections = sections
    .filter((section) => isSectionComplete(section.id))
    .map((section) => section.title);

  const activeContent = () => {
    if (activeSectionId === "intro") {
      return <IntroSection mode={mode} onContinue={goNext} />;
    }

    if (activeSectionId === "first-law") {
      return (
        <FirstLawLab
          mode={mode}
          questions={firstLawQuestions[mode]}
          responses={responses}
          onSubmitResponse={handleSubmitResponse}
          data={firstLawData}
          setData={setFirstLawData}
        />
      );
    }

    if (activeSectionId === "second-law") {
      return (
        <SecondLawLab
          mode={mode}
          questions={secondLawQuestions[mode]}
          responses={responses}
          onSubmitResponse={handleSubmitResponse}
          history={secondLawHistory}
          setHistory={setSecondLawHistory}
          trials={secondLawTrials}
          setTrials={setSecondLawTrials}
        />
      );
    }

    if (activeSectionId === "third-law") {
      return (
        <ThirdLawLab
          mode={mode}
          questions={thirdLawQuestions[mode]}
          responses={responses}
          onSubmitResponse={handleSubmitResponse}
          data={thirdLawData}
          setData={setThirdLawData}
        />
      );
    }

    if (activeSectionId === "reflection") {
      return (
        <section className="space-y-4">
          <div className="lab-panel rounded-lg p-5">
            <p className="text-sm font-black uppercase tracking-wide text-marine">Final Reflection</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Synthesize the Evidence</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Use the simulations, graphs, data tables, and feedback from the three experiments to write complete
              responses.
            </p>
          </div>
          {finalReflectionQuestions[mode].map((question) => (
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

    return (
      <LabReport
        labTitle="Newton's Laws Virtual Lab"
        modeLabel={getModeLabel(mode)}
        completedSections={completedSections}
        questions={allQuestions}
        responses={responseList}
        tables={[
          { title: "First Law Motion Samples", rows: firstLawData },
          { title: "Second Law Motion Samples", rows: secondLawHistory },
          { title: "Second Law Trial Table", rows: secondLawTrials },
          { title: "Third Law Motion Samples", rows: thirdLawData },
        ]}
      />
    );
  };

  return (
    <LabLayout
      title="Newton's Laws Virtual Lab"
      mode={mode}
      steps={steps}
      activeStepId={activeSectionId}
      onSelectStep={(stepId) => {
        setActiveSectionId(stepId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      onBackToLibrary={onBackToLibrary}
      onChangeMode={onChangeMode}
      onOpenReport={() => setActiveSectionId("report")}
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

function IntroSection({ mode, onContinue }: { mode: CourseMode; onContinue: () => void }) {
  const calculusObjectives =
    mode === "calculus"
      ? [
          "Relate acceleration to the derivative of velocity.",
          "Relate velocity to the derivative of position.",
          "Interpret impulse as the integral of force over time.",
          "Connect Newton's Second Law to Sigma F = dp/dt.",
        ]
      : [];

  return (
    <section className="space-y-5">
      <div className="lab-panel rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-wide text-marine">Newton's Laws Virtual Lab</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Introduction</h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
          In this lab, you will investigate Newton's three laws through virtual experiments. You will manipulate
          variables, collect data, interpret graphs, answer embedded questions, and generate a completion summary.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="lab-panel rounded-lg p-5">
          <h3 className="text-xl font-black text-ink">Learning Objectives</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {[
              "Explain Newton's First Law in terms of inertia and net force.",
              "Predict motion when the net force on an object is zero.",
              "Determine how acceleration depends on net force and mass.",
              "Interpret force, mass, and acceleration data.",
              "Explain why action-reaction forces do not cancel each other.",
              "Apply Newton's Laws to real physical situations.",
              ...calculusObjectives,
            ].map((objective) => (
              <li key={objective} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-marine" aria-hidden="true" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="lab-panel rounded-lg p-5">
          <h3 className="text-xl font-black text-ink">Lab Structure</h3>
          <div className="mt-4 grid gap-3">
            {[
              ["Lab 1", "Newton's First Law: inertia and zero net force."],
              ["Lab 2", "Newton's Second Law: force, mass, acceleration, and friction."],
              ["Lab 3", "Newton's Third Law: force pairs, free-body diagrams, and momentum."],
              ["Report", "A client-side summary with data, responses, feedback, and conclusion scaffold."],
            ].map(([label, text]) => (
              <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-ink">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-marine"
          >
            Begin Lab 1 <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>
  );
}
