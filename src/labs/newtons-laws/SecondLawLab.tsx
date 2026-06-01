import { Pause, Play, Plus, RotateCcw } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { GraphPanel } from "../../components/GraphPanel";
import { QuestionCard } from "../../components/QuestionCard";
import { SimulationCanvas } from "../../components/SimulationCanvas";
import { CourseMode, LabQuestion, QuestionResponse } from "../../types/labTypes";
import { integrateOneDimensional, round, secondLawNetForce } from "./newtonsPhysics";
import { SecondLawSample, SecondLawState, SecondLawTrial } from "./newtonsTypes";

interface SecondLawLabProps {
  mode: CourseMode;
  questions: LabQuestion[];
  responses: Record<string, QuestionResponse>;
  onSubmitResponse: (response: QuestionResponse) => void;
  history: SecondLawSample[];
  setHistory: Dispatch<SetStateAction<SecondLawSample[]>>;
  trials: SecondLawTrial[];
  setTrials: Dispatch<SetStateAction<SecondLawTrial[]>>;
}

const initialState: SecondLawState = {
  time: 0,
  position: 0,
  velocity: 0,
  acceleration: 0,
  netForce: 0,
  frictionForce: 0,
};

export function SecondLawLab({
  mode,
  questions,
  responses,
  onSubmitResponse,
  history,
  setHistory,
  trials,
  setTrials,
}: SecondLawLabProps) {
  const [mass, setMass] = useState(2);
  const [appliedForce, setAppliedForce] = useState(12);
  const [frictionEnabled, setFrictionEnabled] = useState(false);
  const [mu, setMu] = useState(0.12);
  const [running, setRunning] = useState(false);
  const [sim, setSim] = useState<SecondLawState>(initialState);
  const frameRef = useRef<number>();
  const lastFrameRef = useRef<number>();
  const sampleAtRef = useRef(0);

  const currentPhysics = useMemo(
    () => secondLawNetForce(appliedForce, mass, frictionEnabled, mu),
    [appliedForce, frictionEnabled, mass, mu],
  );

  useEffect(() => {
    if (!running) {
      lastFrameRef.current = undefined;
      setSim((current) => ({
        ...current,
        acceleration: currentPhysics.acceleration,
        netForce: currentPhysics.netForce,
        frictionForce: currentPhysics.frictionForce,
      }));
      return undefined;
    }

    const step = (now: number) => {
      const previousFrame = lastFrameRef.current ?? now;
      const dt = Math.min(0.035, (now - previousFrame) / 1000);
      lastFrameRef.current = now;

      setSim((current) => {
        const motion = integrateOneDimensional(current.position, current.velocity, currentPhysics.acceleration, dt);
        const next: SecondLawState = {
          time: current.time + dt,
          position: motion.nextPosition,
          velocity: motion.nextVelocity,
          acceleration: currentPhysics.acceleration,
          netForce: currentPhysics.netForce,
          frictionForce: currentPhysics.frictionForce,
        };

        if (next.time >= sampleAtRef.current) {
          sampleAtRef.current = next.time + 0.2;
          setHistory((rows) => [
            ...rows.slice(-79),
            {
              time: round(next.time, 2),
              position: round(next.position, 3),
              velocity: round(next.velocity, 3),
              acceleration: round(next.acceleration, 3),
            },
          ]);
        }

        if (next.time >= 5) {
          setRunning(false);
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
  }, [currentPhysics, running, setHistory]);

  const resetTrial = () => {
    setRunning(false);
    sampleAtRef.current = 0;
    setSim({
      ...initialState,
      acceleration: currentPhysics.acceleration,
      netForce: currentPhysics.netForce,
      frictionForce: currentPhysics.frictionForce,
    });
    setHistory([]);
  };

  const runTrial = () => {
    resetTrial();
    setRunning(true);
  };

  const addTrial = () => {
    setTrials((rows) => [
      ...rows,
      {
        trial: rows.length + 1,
        mass: round(mass, 2),
        appliedForce: round(appliedForce, 2),
        frictionForce: round(currentPhysics.frictionForce, 3),
        netForce: round(currentPhysics.netForce, 3),
        acceleration: round(currentPhysics.acceleration, 3),
        inverseMass: round(1 / mass, 3),
      },
    ]);
  };

  const displayPosition = Math.max(0.04, Math.min(0.94, sim.position / 22 + 0.06));

  const modeCopy =
    mode === "algebra-trig"
      ? {
          background:
            "Use a = F_net / m to compare direct proportionality with net force and inverse proportionality with mass.",
          analysis:
            "Collect at least four trials while varying force, then at least four trials while varying mass. Turn friction on for a comparison trial.",
        }
      : {
          background:
            "Use Sigma F = m dv/dt for constant mass and interpret velocity changes through slope and area relationships.",
          analysis:
            "Use the trial table to connect net force to dv/dt, then compare acceleration-time and velocity-time graph areas.",
        };

  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="lab-panel rounded-lg p-5">
          <p className="text-sm font-black uppercase tracking-wide text-marine">Lab 2: Newton's Second Law</p>
          <h2 className="mt-2 text-2xl font-black text-ink">Force, Mass, and Acceleration</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              <strong>Purpose:</strong> Measure how cart acceleration changes when net force or mass changes.
            </p>
            <p>
              <strong>Background:</strong> {modeCopy.background}
            </p>
            <p>
              <strong>Procedure:</strong> Run a trial, inspect the motion graphs, then add the trial to the data table.
            </p>
            <p>
              <strong>Analysis:</strong> {modeCopy.analysis}
            </p>
          </div>
        </article>

        <div className="lab-panel rounded-lg p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="control-label">Cart mass: {mass.toFixed(1)} kg</span>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={mass}
                onChange={(event) => setMass(Number(event.target.value))}
                className="range-field mt-2"
              />
            </label>
            <label>
              <span className="control-label">Applied force: {appliedForce.toFixed(1)} N</span>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={appliedForce}
                onChange={(event) => setAppliedForce(Number(event.target.value))}
                className="range-field mt-2"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
              <span className="control-label">Kinetic friction</span>
              <input
                type="checkbox"
                checked={frictionEnabled}
                onChange={(event) => setFrictionEnabled(event.target.checked)}
                className="h-5 w-5 accent-marine"
              />
            </label>
            <label className={frictionEnabled ? "" : "opacity-45"}>
              <span className="control-label">Coefficient: {mu.toFixed(2)}</span>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.01"
                value={mu}
                disabled={!frictionEnabled}
                onChange={(event) => setMu(Number(event.target.value))}
                className="range-field mt-2"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => (running ? setRunning(false) : runTrial())}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-marine"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Run Trial"}
            </button>
            <button
              type="button"
              onClick={resetTrial}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={addTrial}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-ember hover:text-ember"
            >
              <Plus className="h-4 w-4" />
              Add Trial
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Readout label="Net force" value={`${currentPhysics.netForce.toFixed(2)} N`} />
            <Readout label="Acceleration" value={`${currentPhysics.acceleration.toFixed(2)} m/s^2`} />
            <Readout label="Friction" value={`${currentPhysics.frictionForce.toFixed(2)} N`} />
          </div>
        </div>
      </div>

      <SimulationCanvas
        title="Pulled Cart Simulation"
        carts={[{ id: "cart", label: `${mass.toFixed(1)} kg`, position: displayPosition, color: "#0f766e" }]}
        arrows={[
          ...(appliedForce > 0.1
            ? [
                {
                  id: "applied",
                  label: "F_applied",
                  start: displayPosition,
                  direction: 1 as const,
                  magnitude: appliedForce / 5,
                  color: "#2563eb",
                  y: 52,
                },
              ]
            : []),
          ...(frictionEnabled && currentPhysics.frictionForce > 0.1
            ? [
                {
                  id: "friction",
                  label: "f_k",
                  start: displayPosition,
                  direction: -1 as const,
                  magnitude: currentPhysics.frictionForce / 5,
                  color: "#be123c",
                  y: 82,
                },
              ]
            : []),
          ...(Math.abs(currentPhysics.netForce) > 0.1
            ? [
                {
                  id: "net",
                  label: "F_net",
                  start: displayPosition,
                  direction: currentPhysics.netForce >= 0 ? (1 as const) : (-1 as const),
                  magnitude: Math.abs(currentPhysics.netForce) / 5,
                  color: "#d97706",
                  y: 112,
                },
              ]
            : []),
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <GraphPanel
          title="Position"
          data={history}
          xKey="time"
          xLabel="time (s)"
          yLabel="position (m)"
          lines={[{ key: "position", label: "position", color: "#2563eb" }]}
        />
        <GraphPanel
          title="Velocity"
          data={history}
          xKey="time"
          xLabel="time (s)"
          yLabel="velocity (m/s)"
          lines={[{ key: "velocity", label: "velocity", color: "#0f766e" }]}
        />
        <GraphPanel
          title="Acceleration"
          data={history}
          xKey="time"
          xLabel="time (s)"
          yLabel="acceleration (m/s^2)"
          lines={[{ key: "acceleration", label: "acceleration", color: "#d97706" }]}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <DataTable
          caption="Second Law Trial Data"
          columns={[
            { key: "trial", label: "Trial", precision: 0 },
            { key: "mass", label: "Mass", unit: "kg", precision: 2 },
            { key: "appliedForce", label: "Applied Force", unit: "N", precision: 2 },
            { key: "frictionForce", label: "Friction", unit: "N", precision: 3 },
            { key: "netForce", label: "Net Force", unit: "N", precision: 3 },
            { key: "acceleration", label: "Acceleration", unit: "m/s^2", precision: 3 },
          ]}
          rows={trials}
        />
        <div className="grid gap-5">
          <GraphPanel
            title="Acceleration vs. Net Force"
            data={trials}
            xKey="netForce"
            xLabel="net force (N)"
            yLabel="acceleration (m/s^2)"
            lines={[{ key: "acceleration", label: "acceleration", color: "#2563eb" }]}
          />
          <GraphPanel
            title="Acceleration vs. Inverse Mass"
            data={trials}
            xKey="inverseMass"
            xLabel="1/mass (1/kg)"
            yLabel="acceleration (m/s^2)"
            lines={[{ key: "acceleration", label: "acceleration", color: "#0f766e" }]}
          />
        </div>
      </div>

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
