import { ArrowLeft, ArrowRight, CheckCircle2, Pause, Play, RotateCcw } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { GraphPanel } from "../../components/GraphPanel";
import { LabLayout } from "../../components/LabLayout";
import { LabReport } from "../../components/LabReport";
import { getModeLabel } from "../../components/ModeSelector";
import { QuestionCard } from "../../components/QuestionCard";
import { SimulationCanvas } from "../../components/SimulationCanvas";
import { CourseMode, LabQuestion, ProgressStep, QuestionResponse } from "../../types/labTypes";
import {
  accelerationQuestions,
  constantVelocityQuestions,
  finalReflectionQuestions,
  graphAnalysisQuestions,
  questionsForMode,
} from "./kinematicsQuestions";
import {
  generateMotionSamples,
  makeTrial,
  normalizePosition,
  round,
  sampleAt,
  scenarioParameters,
} from "./kinematicsPhysics";
import { GraphScenario, KinematicsTrial, MotionSample } from "./kinematicsTypes";

interface OneDimensionalKinematicsLabProps {
  mode: CourseMode;
  onBackToLibrary: () => void;
  onChangeMode: () => void;
}

interface SectionProps {
  mode: CourseMode;
  questions: LabQuestion[];
  responses: Record<string, QuestionResponse>;
  onSubmitResponse: (response: QuestionResponse) => void;
  data: MotionSample[];
  setData: Dispatch<SetStateAction<MotionSample[]>>;
  setTrials: Dispatch<SetStateAction<KinematicsTrial[]>>;
}

const sections = [
  { id: "intro", title: "Introduction" },
  { id: "constant-velocity", title: "Constant Velocity" },
  { id: "acceleration", title: "Acceleration" },
  { id: "graph-analysis", title: "Graph Analysis" },
  { id: "reflection", title: "Reflection" },
  { id: "report", title: "Report" },
];

export function OneDimensionalKinematicsLab({
  mode,
  onBackToLibrary,
  onChangeMode,
}: OneDimensionalKinematicsLabProps) {
  const [activeSectionId, setActiveSectionId] = useState("intro");
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [constantVelocityData, setConstantVelocityData] = useState<MotionSample[]>([]);
  const [accelerationData, setAccelerationData] = useState<MotionSample[]>([]);
  const [graphData, setGraphData] = useState<MotionSample[]>([]);
  const [trials, setTrials] = useState<KinematicsTrial[]>([]);

  const responseList = useMemo(() => Object.values(responses), [responses]);

  const handleSubmitResponse = (response: QuestionResponse) => {
    setResponses((current) => ({
      ...current,
      [response.questionId]: response,
    }));
  };

  const sectionQuestions = useMemo(
    () => ({
      "constant-velocity": constantVelocityQuestions[mode],
      acceleration: accelerationQuestions[mode],
      "graph-analysis": graphAnalysisQuestions[mode],
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

    if (activeSectionId === "constant-velocity") {
      return (
        <ConstantVelocitySection
          mode={mode}
          questions={constantVelocityQuestions[mode]}
          responses={responses}
          onSubmitResponse={handleSubmitResponse}
          data={constantVelocityData}
          setData={setConstantVelocityData}
          setTrials={setTrials}
        />
      );
    }

    if (activeSectionId === "acceleration") {
      return (
        <AccelerationSection
          mode={mode}
          questions={accelerationQuestions[mode]}
          responses={responses}
          onSubmitResponse={handleSubmitResponse}
          data={accelerationData}
          setData={setAccelerationData}
          setTrials={setTrials}
        />
      );
    }

    if (activeSectionId === "graph-analysis") {
      return (
        <GraphAnalysisSection
          mode={mode}
          questions={graphAnalysisQuestions[mode]}
          responses={responses}
          onSubmitResponse={handleSubmitResponse}
          data={graphData}
          setData={setGraphData}
          setTrials={setTrials}
        />
      );
    }

    if (activeSectionId === "reflection") {
      return (
        <section className="space-y-4">
          <div className="lab-panel rounded-lg p-5">
            <p className="text-sm font-black uppercase tracking-wide text-marine">Final Reflection</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Connect the Representations</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Use your data tables, motion animations, and graph evidence to connect position, velocity, and
              acceleration.
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
        labTitle="One-Dimensional Kinematics Lab"
        modeLabel={getModeLabel(mode)}
        completedSections={completedSections}
        questions={allQuestions}
        responses={responseList}
        tables={[
          { title: "Constant Velocity Samples", rows: constantVelocityData },
          { title: "Constant Acceleration Samples", rows: accelerationData },
          { title: "Graph Analysis Samples", rows: graphData },
          { title: "Kinematics Trial Summary", rows: trials },
        ]}
        conclusionScaffold="The student investigated one-dimensional motion by comparing position-time, velocity-time, and acceleration-time graphs. The evidence shows that velocity is the slope of position versus time, acceleration is the slope of velocity versus time, and graph areas can be used to determine displacement and change in velocity."
      />
    );
  };

  return (
    <LabLayout
      title="One-Dimensional Kinematics Lab"
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
          "Relate velocity to dx/dt.",
          "Relate acceleration to dv/dt.",
          "Use integrals of v(t) and a(t) to determine displacement and change in velocity.",
        ]
      : [];

  return (
    <section className="space-y-5">
      <div className="lab-panel rounded-lg p-6">
        <p className="text-sm font-black uppercase tracking-wide text-marine">One-Dimensional Kinematics Lab</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Motion Along a Line</h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
          In this lab, you will study objects moving along a straight track. You will manipulate initial position,
          velocity, acceleration, and duration, then compare motion animations with position-time, velocity-time, and
          acceleration-time graphs.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="lab-panel rounded-lg p-5">
          <h3 className="text-xl font-black text-ink">Learning Objectives</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {[
              "Describe motion using position, displacement, velocity, and acceleration.",
              "Interpret the slope of a position-time graph as velocity.",
              "Interpret the slope of a velocity-time graph as acceleration.",
              "Use velocity-time graph area to determine displacement.",
              "Identify turn-around points from motion graphs.",
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
          <h3 className="text-xl font-black text-ink">Lab Path</h3>
          <div className="mt-4 grid gap-3">
            {[
              ["Investigation 1", "Constant velocity motion and position-time slope."],
              ["Investigation 2", "Constant acceleration and changing velocity."],
              ["Investigation 3", "Graph interpretation and turn-around motion."],
              ["Report", "A completion summary with trial data, responses, feedback, and conclusion scaffold."],
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
            Begin Investigation 1 <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>
  );
}

function ConstantVelocitySection({
  mode,
  questions,
  responses,
  onSubmitResponse,
  data,
  setData,
  setTrials,
}: SectionProps) {
  const [initialPosition, setInitialPosition] = useState(-6);
  const [velocity, setVelocity] = useState(2);
  const [duration, setDuration] = useState(6);
  const [simTime, setSimTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const predictionQuestions = questions.filter((question) => question.type === "prediction");
  const analysisQuestions = questions.filter((question) => question.type !== "prediction");

  useAnimationClock(playing, duration, setPlaying, setSimTime);

  const current = data.length > 0 ? sampleAt(data, simTime) : sampleAt(generateMotionSamples(initialPosition, velocity, 0, 0.25), 0);
  const modeCopy =
    mode === "algebra-trig"
      ? "Use slope and data-table ratios to connect position changes with velocity."
      : "Use v = dx/dt and the integral of v(t) to connect the graphs.";

  const runTrial = () => {
    const samples = generateMotionSamples(initialPosition, velocity, 0, duration);
    setData(samples);
    setTrials((currentTrials) => [
      ...currentTrials,
      makeTrial(currentTrials.length + 1, "Constant velocity", initialPosition, velocity, 0, duration),
    ]);
    setSimTime(0);
    setPlaying(true);
  };

  return (
    <section className="space-y-5">
      <InvestigationHeader
        eyebrow="Investigation 1"
        title="Constant Velocity"
        purpose="Measure how position changes when velocity is constant."
        procedure="Choose an initial position and velocity, submit a prediction, run a trial, then compare the animation with x-t and v-t graphs."
        analysis={modeCopy}
      />

      <PredictionBlock
        note="Submit your prediction before running the constant-velocity trial."
        questions={predictionQuestions}
        responses={responses}
        onSubmitResponse={onSubmitResponse}
      />

      <div className="lab-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Slider label={`Initial position: ${initialPosition.toFixed(1)} m`} min={-10} max={10} step={0.5} value={initialPosition} onChange={setInitialPosition} />
          <Slider label={`Velocity: ${velocity.toFixed(1)} m/s`} min={-5} max={5} step={0.25} value={velocity} onChange={setVelocity} />
          <Slider label={`Duration: ${duration.toFixed(1)} s`} min={2} max={10} step={0.5} value={duration} onChange={setDuration} />
        </div>
        <ControlButtons playing={playing} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onRun={runTrial} onReset={() => {
          setPlaying(false);
          setSimTime(0);
          setData([]);
        }} />
        <Readouts sample={current} />
      </div>

      <MotionVisualization sample={current} showAcceleration={false} />
      <GraphsAndTable data={data} includeAccelerationGraph={false} />
      <QuestionList questions={analysisQuestions} responses={responses} onSubmitResponse={onSubmitResponse} />
    </section>
  );
}

function AccelerationSection({
  mode,
  questions,
  responses,
  onSubmitResponse,
  data,
  setData,
  setTrials,
}: SectionProps) {
  const [initialVelocity, setInitialVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(1);
  const [duration, setDuration] = useState(6);
  const [simTime, setSimTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const predictionQuestions = questions.filter((question) => question.type === "prediction");
  const analysisQuestions = questions.filter((question) => question.type !== "prediction");

  useAnimationClock(playing, duration, setPlaying, setSimTime);

  const previewData = generateMotionSamples(0, initialVelocity, acceleration, 0.25);
  const current = data.length > 0 ? sampleAt(data, simTime) : sampleAt(previewData, 0);
  const modeCopy =
    mode === "algebra-trig"
      ? "Use slopes of v-t graphs and curved x-t graphs to identify acceleration."
      : "Use a = dv/dt and Delta v = integral a(t) dt to interpret the graphs.";

  const runTrial = () => {
    const samples = generateMotionSamples(0, initialVelocity, acceleration, duration);
    setData(samples);
    setTrials((currentTrials) => [
      ...currentTrials,
      makeTrial(currentTrials.length + 1, "Constant acceleration", 0, initialVelocity, acceleration, duration),
    ]);
    setSimTime(0);
    setPlaying(true);
  };

  return (
    <section className="space-y-5">
      <InvestigationHeader
        eyebrow="Investigation 2"
        title="Constant Acceleration"
        purpose="Measure how velocity and position change when acceleration is constant."
        procedure="Choose an initial velocity and acceleration, submit a prediction, run a trial, then compare x-t, v-t, and a-t graphs."
        analysis={modeCopy}
      />

      <PredictionBlock
        note="Submit your prediction before running the acceleration trial."
        questions={predictionQuestions}
        responses={responses}
        onSubmitResponse={onSubmitResponse}
      />

      <div className="lab-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Slider label={`Initial velocity: ${initialVelocity.toFixed(1)} m/s`} min={-5} max={5} step={0.25} value={initialVelocity} onChange={setInitialVelocity} />
          <Slider label={`Acceleration: ${acceleration.toFixed(1)} m/s^2`} min={-3} max={3} step={0.25} value={acceleration} onChange={setAcceleration} />
          <Slider label={`Duration: ${duration.toFixed(1)} s`} min={2} max={10} step={0.5} value={duration} onChange={setDuration} />
        </div>
        <ControlButtons playing={playing} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onRun={runTrial} onReset={() => {
          setPlaying(false);
          setSimTime(0);
          setData([]);
        }} />
        <Readouts sample={current} />
      </div>

      <MotionVisualization sample={current} showAcceleration />
      <GraphsAndTable data={data} includeAccelerationGraph />
      <QuestionList questions={analysisQuestions} responses={responses} onSubmitResponse={onSubmitResponse} />
    </section>
  );
}

function GraphAnalysisSection({
  mode,
  questions,
  responses,
  onSubmitResponse,
  data,
  setData,
  setTrials,
}: SectionProps) {
  const [scenario, setScenario] = useState<GraphScenario>("slowing-down");
  const [simTime, setSimTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const params = scenarioParameters(scenario);
  const predictionQuestions = questions.filter((question) => question.type === "prediction");
  const analysisQuestions = questions.filter((question) => question.type !== "prediction");

  useAnimationClock(playing, params.duration, setPlaying, setSimTime);

  const current = data.length > 0 ? sampleAt(data, simTime) : sampleAt(generateMotionSamples(params.initialPosition, params.initialVelocity, params.acceleration, 0.25), 0);
  const modeCopy =
    mode === "algebra-trig"
      ? "Compare graph shapes, slopes, signs, and values at the same time."
      : "Use slopes, derivatives, and graph areas to describe the selected motion.";

  const runScenario = () => {
    const nextParams = scenarioParameters(scenario);
    const samples = generateMotionSamples(
      nextParams.initialPosition,
      nextParams.initialVelocity,
      nextParams.acceleration,
      nextParams.duration,
    );
    setData(samples);
    setTrials((currentTrials) => [
      ...currentTrials,
      makeTrial(
        currentTrials.length + 1,
        `Graph analysis: ${nextParams.label}`,
        nextParams.initialPosition,
        nextParams.initialVelocity,
        nextParams.acceleration,
        nextParams.duration,
      ),
    ]);
    setSimTime(0);
    setPlaying(true);
  };

  return (
    <section className="space-y-5">
      <InvestigationHeader
        eyebrow="Investigation 3"
        title="Graph Analysis"
        purpose="Use graphs to identify motion patterns, including slowing down and turning around."
        procedure="Choose a scenario, submit a prediction, run it, and explain the motion using x-t, v-t, and a-t graphs."
        analysis={modeCopy}
      />

      <PredictionBlock
        note="Submit your prediction before running the graph-analysis scenario."
        questions={predictionQuestions}
        responses={responses}
        onSubmitResponse={onSubmitResponse}
      />

      <div className="lab-panel rounded-lg p-5">
        <label className="block">
          <span className="control-label">Scenario</span>
          <select
            value={scenario}
            onChange={(event) => setScenario(event.target.value as GraphScenario)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="constant-positive">Constant positive velocity</option>
            <option value="speeding-up">Speeding up in the positive direction</option>
            <option value="slowing-down">Slowing down while moving positive</option>
            <option value="turnaround">Turns around</option>
          </select>
        </label>
        <ControlButtons playing={playing} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onRun={runScenario} onReset={() => {
          setPlaying(false);
          setSimTime(0);
          setData([]);
        }} />
        <Readouts sample={current} />
      </div>

      <MotionVisualization sample={current} showAcceleration />
      <GraphsAndTable data={data} includeAccelerationGraph />
      <QuestionList questions={analysisQuestions} responses={responses} onSubmitResponse={onSubmitResponse} />
    </section>
  );
}

function useAnimationClock(
  playing: boolean,
  duration: number,
  setPlaying: Dispatch<SetStateAction<boolean>>,
  setSimTime: Dispatch<SetStateAction<number>>,
) {
  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setSimTime((current) => {
        const next = Math.min(duration, round(current + 0.1, 2));
        if (next >= duration) {
          setPlaying(false);
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [duration, playing, setPlaying, setSimTime]);
}

function InvestigationHeader({
  eyebrow,
  title,
  purpose,
  procedure,
  analysis,
}: {
  eyebrow: string;
  title: string;
  purpose: string;
  procedure: string;
  analysis: string;
}) {
  return (
    <article className="lab-panel rounded-lg p-5">
      <p className="text-sm font-black uppercase tracking-wide text-marine">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
        <p>
          <strong>Purpose:</strong> {purpose}
        </p>
        <p>
          <strong>Procedure:</strong> {procedure}
        </p>
        <p>
          <strong>Analysis:</strong> {analysis}
        </p>
      </div>
    </article>
  );
}

function PredictionBlock({
  note,
  questions,
  responses,
  onSubmitResponse,
}: {
  note: string;
  questions: LabQuestion[];
  responses: Record<string, QuestionResponse>;
  onSubmitResponse: (response: QuestionResponse) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="lab-panel rounded-lg p-5">
        <p className="text-sm font-black uppercase tracking-wide text-ember">Before You Experiment</p>
        <h3 className="mt-2 text-xl font-black text-ink">Prediction</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
      </div>
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          response={responses[question.id]}
          onSubmit={onSubmitResponse}
        />
      ))}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="control-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-field mt-2"
      />
    </label>
  );
}

function ControlButtons({
  playing,
  onPlay,
  onPause,
  onRun,
  onReset,
}: {
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRun: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-3">
      <button
        type="button"
        onClick={onRun}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-marine"
      >
        <Play className="h-4 w-4" aria-hidden="true" />
        Run Trial
      </button>
      <button
        type="button"
        onClick={playing ? onPause : onPlay}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        {playing ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-ember hover:text-ember"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset
      </button>
    </div>
  );
}

function Readouts({ sample }: { sample: MotionSample }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-4">
      <Readout label="Time" value={`${sample.time.toFixed(2)} s`} />
      <Readout label="Position" value={`${sample.position.toFixed(2)} m`} />
      <Readout label="Velocity" value={`${sample.velocity.toFixed(2)} m/s`} />
      <Readout label="Acceleration" value={`${sample.acceleration.toFixed(2)} m/s^2`} />
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function MotionVisualization({ sample, showAcceleration }: { sample: MotionSample; showAcceleration: boolean }) {
  const position = normalizePosition(sample.position);
  const arrows = [
    ...(Math.abs(sample.velocity) > 0.05
      ? [
          {
            id: "velocity",
            label: "v",
            start: position,
            direction: sample.velocity >= 0 ? (1 as const) : (-1 as const),
            magnitude: Math.abs(sample.velocity) * 2.5,
            color: "#0f766e",
            y: 58,
            labelDy: -2,
          },
        ]
      : []),
    ...(showAcceleration && Math.abs(sample.acceleration) > 0.05
      ? [
          {
            id: "acceleration",
            label: "a",
            start: position,
            direction: sample.acceleration >= 0 ? (1 as const) : (-1 as const),
            magnitude: Math.abs(sample.acceleration) * 4,
            color: "#d97706",
            y: 92,
            labelDy: 2,
          },
        ]
      : []),
  ];

  return (
    <SimulationCanvas
      title="One-Dimensional Motion Track"
      carts={[{ id: "cart", label: "cart", position, color: "#2563eb" }]}
      arrows={arrows}
    />
  );
}

function GraphsAndTable({ data, includeAccelerationGraph }: { data: MotionSample[]; includeAccelerationGraph: boolean }) {
  return (
    <>
      <div className={includeAccelerationGraph ? "grid gap-5 xl:grid-cols-3" : "grid gap-5 xl:grid-cols-2"}>
        <GraphPanel
          title="Position vs. Time"
          data={data}
          xKey="time"
          xLabel="time (s)"
          yLabel="position (m)"
          lines={[{ key: "position", label: "position", color: "#2563eb" }]}
        />
        <GraphPanel
          title="Velocity vs. Time"
          data={data}
          xKey="time"
          xLabel="time (s)"
          yLabel="velocity (m/s)"
          lines={[{ key: "velocity", label: "velocity", color: "#0f766e" }]}
        />
        {includeAccelerationGraph ? (
          <GraphPanel
            title="Acceleration vs. Time"
            data={data}
            xKey="time"
            xLabel="time (s)"
            yLabel="acceleration (m/s^2)"
            lines={[{ key: "acceleration", label: "acceleration", color: "#d97706" }]}
          />
        ) : null}
      </div>
      <DataTable
        caption="Motion Data"
        columns={[
          { key: "time", label: "Time", unit: "s", precision: 2 },
          { key: "position", label: "Position", unit: "m", precision: 3 },
          { key: "velocity", label: "Velocity", unit: "m/s", precision: 3 },
          { key: "acceleration", label: "Acceleration", unit: "m/s^2", precision: 3 },
        ]}
        rows={data}
      />
    </>
  );
}

function QuestionList({
  questions,
  responses,
  onSubmitResponse,
}: {
  questions: LabQuestion[];
  responses: Record<string, QuestionResponse>;
  onSubmitResponse: (response: QuestionResponse) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-black text-ink">Analysis Questions</h3>
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          response={responses[question.id]}
          onSubmit={onSubmitResponse}
        />
      ))}
    </div>
  );
}
