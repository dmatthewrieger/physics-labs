import { Play, RotateCcw } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { ForceVector, FreeBodyDiagram } from "../../components/FreeBodyDiagram";
import { GraphPanel } from "../../components/GraphPanel";
import { QuestionCard } from "../../components/QuestionCard";
import { SimulationCanvas } from "../../components/SimulationCanvas";
import { CourseMode, LabQuestion, QuestionResponse } from "../../types/labTypes";
import { round, thirdLawForceProfile } from "./newtonsPhysics";
import { ThirdLawSample, ThirdLawState } from "./newtonsTypes";

interface ThirdLawLabProps {
  mode: CourseMode;
  questions: LabQuestion[];
  responses: Record<string, QuestionResponse>;
  onSubmitResponse: (response: QuestionResponse) => void;
  data: ThirdLawSample[];
  setData: Dispatch<SetStateAction<ThirdLawSample[]>>;
}

const initialState: ThirdLawState = {
  time: 0,
  positionA: -1,
  positionB: 1,
  velocityA: 0,
  velocityB: 0,
  force: 0,
};

export function ThirdLawLab({ mode, questions, responses, onSubmitResponse, data, setData }: ThirdLawLabProps) {
  const [massA, setMassA] = useState(1.5);
  const [massB, setMassB] = useState(1.5);
  const [compression, setCompression] = useState(0.8);
  const [running, setRunning] = useState(false);
  const [sim, setSim] = useState<ThirdLawState>(initialState);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const sampleAtRef = useRef(0);

  useEffect(() => {
    if (!running) {
      lastFrameRef.current = null;
      return undefined;
    }

    const step = (now: number) => {
      const previousFrame = lastFrameRef.current ?? now;
      const dt = Math.min(0.035, (now - previousFrame) / 1000);
      lastFrameRef.current = now;

      setSim((current) => {
        const nextTime = current.time + dt;
        const force = thirdLawForceProfile(nextTime, compression);
        const accelerationA = -force / massA;
        const accelerationB = force / massB;
        const velocityA = current.velocityA + accelerationA * dt;
        const velocityB = current.velocityB + accelerationB * dt;
        const positionA = current.positionA + velocityA * dt;
        const positionB = current.positionB + velocityB * dt;
        const momentumA = massA * velocityA;
        const momentumB = massB * velocityB;

        const next: ThirdLawState = {
          time: nextTime,
          positionA,
          positionB,
          velocityA,
          velocityB,
          force,
        };

        if (next.time >= sampleAtRef.current) {
          sampleAtRef.current = next.time + 0.12;
          setData((rows) => [
            ...rows.slice(-99),
            {
              time: round(nextTime, 2),
              forceOnA: round(-force, 3),
              forceOnB: round(force, 3),
              velocityA: round(velocityA, 3),
              velocityB: round(velocityB, 3),
              momentumA: round(momentumA, 3),
              momentumB: round(momentumB, 3),
              totalMomentum: round(momentumA + momentumB, 3),
            },
          ]);
        }

        if (nextTime >= 4.5) {
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
  }, [compression, massA, massB, running, setData]);

  const reset = () => {
    setRunning(false);
    sampleAtRef.current = 0;
    setSim(initialState);
    setData([]);
  };

  const release = () => {
    reset();
    setRunning(true);
  };

  const positionA = Math.max(0.05, Math.min(0.48, 0.5 + sim.positionA / 8));
  const positionB = Math.max(0.52, Math.min(0.95, 0.5 + sim.positionB / 8));
  const forceMagnitude = Math.abs(sim.force);
  const accelerationA = -sim.force / massA;
  const accelerationB = sim.force / massB;
  const totalMomentum = massA * sim.velocityA + massB * sim.velocityB;

  const fbdA: ForceVector[] = [
    { label: "B on A", direction: "left", magnitude: forceMagnitude / 4, color: "#be123c" },
    { label: "N", direction: "up", magnitude: 4, color: "#0f766e" },
    { label: "mg", direction: "down", magnitude: 4, color: "#2563eb" },
  ];
  const fbdB: ForceVector[] = [
    { label: "A on B", direction: "right", magnitude: forceMagnitude / 4, color: "#be123c" },
    { label: "N", direction: "up", magnitude: 4, color: "#0f766e" },
    { label: "mg", direction: "down", magnitude: 4, color: "#2563eb" },
  ];

  const modeCopy =
    mode === "algebra-trig"
      ? "Compare the force arrows, accelerations, and final speeds for equal-mass and unequal-mass carts."
      : "Compare the force-time areas, impulses, momentum changes, and total momentum of the two-cart system.";

  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="lab-panel rounded-lg p-5">
          <p className="text-sm font-black uppercase tracking-wide text-marine">Lab 3: Newton's Third Law</p>
          <h2 className="mt-2 text-2xl font-black text-ink">Action and Reaction</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              <strong>Purpose:</strong> Show that interaction forces are equal in magnitude, opposite in direction, and
              applied to different objects.
            </p>
            <p>
              <strong>Procedure:</strong> Choose cart masses and spring compression, release the carts, then compare the
              force, velocity, and momentum graphs.
            </p>
            <p>
              <strong>Analysis:</strong> {modeCopy}
            </p>
          </div>
        </article>

        <div className="lab-panel rounded-lg p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="control-label">Mass A: {massA.toFixed(1)} kg</span>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={massA}
                onChange={(event) => setMassA(Number(event.target.value))}
                className="range-field mt-2"
              />
            </label>
            <label>
              <span className="control-label">Mass B: {massB.toFixed(1)} kg</span>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={massB}
                onChange={(event) => setMassB(Number(event.target.value))}
                className="range-field mt-2"
              />
            </label>
            <label>
              <span className="control-label">Compression: {compression.toFixed(2)}</span>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.05"
                value={compression}
                onChange={(event) => setCompression(Number(event.target.value))}
                className="range-field mt-2"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={release}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-marine"
            >
              <Play className="h-4 w-4" />
              Release
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

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Readout label="Force pair" value={`${forceMagnitude.toFixed(2)} N`} />
            <Readout label="a_A / a_B" value={`${accelerationA.toFixed(2)} / ${accelerationB.toFixed(2)} m/s^2`} />
            <Readout label="v_A / v_B" value={`${sim.velocityA.toFixed(2)} / ${sim.velocityB.toFixed(2)} m/s`} />
            <Readout label="Total p" value={`${totalMomentum.toFixed(3)} kg m/s`} />
          </div>
        </div>
      </div>

      <SimulationCanvas
        title="Two Carts with Spring Interaction"
        carts={[
          { id: "a", label: `A: ${massA.toFixed(1)} kg`, position: positionA, color: "#2563eb" },
          { id: "b", label: `B: ${massB.toFixed(1)} kg`, position: positionB, color: "#0f766e" },
        ]}
        arrows={[
          ...(forceMagnitude > 0.1
            ? [
                {
                  id: "force-a",
                  label: "B on A",
                  start: positionA,
                  direction: -1 as const,
                  magnitude: forceMagnitude / 4,
                  color: "#be123c",
                  y: 62,
                },
                {
                  id: "force-b",
                  label: "A on B",
                  start: positionB,
                  direction: 1 as const,
                  magnitude: forceMagnitude / 4,
                  color: "#be123c",
                  y: 62,
                },
              ]
            : []),
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <FreeBodyDiagram title="Free-Body Diagram: Cart A" objectLabel="A" forces={fbdA} />
        <FreeBodyDiagram title="Free-Body Diagram: Cart B" objectLabel="B" forces={fbdB} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <GraphPanel
          title="Interaction Forces"
          data={data}
          xKey="time"
          xLabel="time (s)"
          yLabel="force (N)"
          lines={[
            { key: "forceOnA", label: "force on A", color: "#be123c" },
            { key: "forceOnB", label: "force on B", color: "#2563eb" },
          ]}
        />
        <GraphPanel
          title="Velocities"
          data={data}
          xKey="time"
          xLabel="time (s)"
          yLabel="velocity (m/s)"
          lines={[
            { key: "velocityA", label: "v_A", color: "#2563eb" },
            { key: "velocityB", label: "v_B", color: "#0f766e" },
          ]}
        />
        <GraphPanel
          title="Momentum"
          data={data}
          xKey="time"
          xLabel="time (s)"
          yLabel="momentum (kg m/s)"
          lines={[
            { key: "momentumA", label: "p_A", color: "#2563eb" },
            { key: "momentumB", label: "p_B", color: "#0f766e" },
            { key: "totalMomentum", label: "total p", color: "#d97706" },
          ]}
        />
      </div>

      <DataTable
        caption="Third Law Data"
        columns={[
          { key: "time", label: "Time", unit: "s", precision: 2 },
          { key: "forceOnA", label: "Force on A", unit: "N", precision: 3 },
          { key: "forceOnB", label: "Force on B", unit: "N", precision: 3 },
          { key: "velocityA", label: "Velocity A", unit: "m/s", precision: 3 },
          { key: "velocityB", label: "Velocity B", unit: "m/s", precision: 3 },
          { key: "totalMomentum", label: "Total Momentum", unit: "kg m/s", precision: 3 },
        ]}
        rows={data}
      />

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
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}
