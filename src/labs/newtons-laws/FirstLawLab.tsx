import { Pause, Play, RotateCcw, Send } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { GraphPanel } from "../../components/GraphPanel";
import { QuestionCard } from "../../components/QuestionCard";
import { SimulationCanvas } from "../../components/SimulationCanvas";
import { CourseMode, LabQuestion, QuestionResponse } from "../../types/labTypes";
import { firstLawStep, round } from "./newtonsPhysics";
import { FirstLawSample, FirstLawState } from "./newtonsTypes";

interface FirstLawLabProps {
  mode: CourseMode;
  questions: LabQuestion[];
  responses: Record<string, QuestionResponse>;
  onSubmitResponse: (response: QuestionResponse) => void;
  data: FirstLawSample[];
  setData: Dispatch<SetStateAction<FirstLawSample[]>>;
}

const initialState: FirstLawState = {
  time: 0,
  position: 0,
  velocity: 1.5,
  netForce: 0,
};

export function FirstLawLab({ mode, questions, responses, onSubmitResponse, data, setData }: FirstLawLabProps) {
  const [running, setRunning] = useState(false);
  const [initialVelocity, setInitialVelocity] = useState(1.5);
  const [frictionEnabled, setFrictionEnabled] = useState(false);
  const [frictionStrength, setFrictionStrength] = useState(0.5);
  const [sim, setSim] = useState<FirstLawState>(initialState);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const pushRemainingRef = useRef(0);
  const sampleAtRef = useRef(0);

  useEffect(() => {
    if (!running) {
      setSim((current) => ({ ...current, velocity: initialVelocity }));
    }
  }, [initialVelocity, running]);

  useEffect(() => {
    if (!running) {
      lastFrameRef.current = null;
      return undefined;
    }

    const step = (now: number) => {
      const previousFrame = lastFrameRef.current ?? now;
      const dt = Math.min(0.035, (now - previousFrame) / 1000);
      lastFrameRef.current = now;
      pushRemainingRef.current = Math.max(0, pushRemainingRef.current - dt);
      const pushForce = pushRemainingRef.current > 0 ? 8 : 0;

      setSim((current) => {
        const nextMotion = firstLawStep(
          current.position,
          current.velocity,
          dt,
          frictionEnabled,
          frictionStrength,
          pushForce,
        );
        const next: FirstLawState = {
          time: current.time + dt,
          position: nextMotion.position,
          velocity: nextMotion.velocity,
          netForce: nextMotion.netForce,
        };

        if (next.time >= sampleAtRef.current) {
          sampleAtRef.current = next.time + 0.2;
          setData((rows) => [
            ...rows.slice(-79),
            {
              time: round(next.time, 2),
              position: round(next.position, 3),
              velocity: round(next.velocity, 3),
              netForce: round(next.netForce, 3),
            },
          ]);
        }

        return next;
      });

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [frictionEnabled, frictionStrength, running, setData]);

  const reset = () => {
    setRunning(false);
    pushRemainingRef.current = 0;
    sampleAtRef.current = 0;
    setSim({ ...initialState, velocity: initialVelocity });
    setData([]);
  };

  const applyPush = () => {
    pushRemainingRef.current = 0.25;
  };

  const displayedPosition = useMemo(() => {
    const wrapped = ((sim.position % 12) + 12) % 12;
    return wrapped / 12;
  }, [sim.position]);

  const predictionQuestions = questions.filter((question) => question.type === "prediction");
  const analysisQuestions = questions.filter((question) => question.type !== "prediction");

  const modeCopy =
    mode === "algebra-trig"
      ? {
          background:
            "This experiment tests whether a force is needed to keep an object moving. Watch the velocity graph after the push ends and compare zero-friction motion with friction-on motion.",
          prediction:
            "Predict whether the cart's velocity will stay constant, increase, or decrease after the push ends.",
        }
      : {
          background:
            "This experiment treats velocity as dx/dt and acceleration as dv/dt. After the push ends, the slope of the velocity-time graph reveals whether a net force remains.",
          prediction:
            "Predict the value of dv/dt after the push interval when friction is off.",
        };

  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="lab-panel rounded-lg p-5">
          <p className="text-sm font-black uppercase tracking-wide text-marine">Lab 1: Newton's First Law</p>
          <h2 className="mt-2 text-2xl font-black text-ink">Inertia</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              <strong>Purpose:</strong> Determine how a cart moves when the net force is zero and compare that behavior
              with motion under friction.
            </p>
            <p>
              <strong>Background:</strong> {modeCopy.background}
            </p>
            <p>
              <strong>Procedure:</strong> Set an initial velocity, choose friction settings, start the cart, apply a
              short push, and compare the motion graphs and data table.
            </p>
            <p>
              <strong>Prediction:</strong> {modeCopy.prediction}
            </p>
          </div>
        </article>

        <div className="space-y-3">
          <div className="lab-panel rounded-lg p-5">
            <p className="text-sm font-black uppercase tracking-wide text-ember">Before You Experiment</p>
            <h3 className="mt-2 text-xl font-black text-ink">Prediction</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Submit your prediction before starting the cart or applying the push.
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
      </div>

      <div className="lab-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="control-label">Initial velocity: {initialVelocity.toFixed(1)} m/s</span>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={initialVelocity}
              onChange={(event) => setInitialVelocity(Number(event.target.value))}
              className="range-field mt-2"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
            <span className="control-label">Friction</span>
            <input
              type="checkbox"
              checked={frictionEnabled}
              onChange={(event) => setFrictionEnabled(event.target.checked)}
              className="h-5 w-5 accent-marine"
            />
          </label>

          <label className={frictionEnabled ? "" : "opacity-45"}>
            <span className="control-label">Friction strength: {frictionStrength.toFixed(1)} N</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={frictionStrength}
              disabled={!frictionEnabled}
              onChange={(event) => setFrictionStrength(Number(event.target.value))}
              className="range-field mt-2"
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-marine"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={applyPush}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-ember hover:text-ember"
            >
              <Send className="h-4 w-4" />
              Push
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Readout label="Position" value={`${sim.position.toFixed(2)} m`} />
          <Readout label="Velocity" value={`${sim.velocity.toFixed(2)} m/s`} />
          <Readout label="Net force" value={`${sim.netForce.toFixed(2)} N`} />
        </div>
      </div>

      <SimulationCanvas
        title="Cart on a Horizontal Track"
        carts={[{ id: "cart", label: "Cart", position: displayedPosition, color: "#2563eb" }]}
        arrows={[
          ...(Math.abs(sim.velocity) > 0.05
            ? [
                {
                  id: "velocity",
                  label: "v",
                  start: displayedPosition,
                  direction: sim.velocity >= 0 ? (1 as const) : (-1 as const),
                  magnitude: Math.abs(sim.velocity),
                  color: "#0f766e",
                  y: 82,
                },
              ]
            : []),
          ...(Math.abs(sim.netForce) > 0.05
            ? [
                {
                  id: "net-force",
                  label: "F_net",
                  start: displayedPosition,
                  direction: sim.netForce >= 0 ? (1 as const) : (-1 as const),
                  magnitude: Math.abs(sim.netForce),
                  color: "#d97706",
                  y: 52,
                },
              ]
            : []),
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-2">
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
      </div>

      <DataTable
        caption="First Law Data"
        columns={[
          { key: "time", label: "Time", unit: "s", precision: 2 },
          { key: "position", label: "Position", unit: "m", precision: 3 },
          { key: "velocity", label: "Velocity", unit: "m/s", precision: 3 },
          { key: "netForce", label: "Net Force", unit: "N", precision: 3 },
        ]}
        rows={data}
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

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}
