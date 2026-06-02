import { GraphScenario, KinematicsTrial, MotionSample } from "./kinematicsTypes";

export function round(value: number, places = 2) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

export function positionAt(initialPosition: number, initialVelocity: number, acceleration: number, time: number) {
  return initialPosition + initialVelocity * time + 0.5 * acceleration * time * time;
}

export function velocityAt(initialVelocity: number, acceleration: number, time: number) {
  return initialVelocity + acceleration * time;
}

export function generateMotionSamples(
  initialPosition: number,
  initialVelocity: number,
  acceleration: number,
  duration: number,
  step = 0.25,
): MotionSample[] {
  const samples: MotionSample[] = [];
  for (let time = 0; time <= duration + 0.001; time += step) {
    samples.push({
      time: round(time, 2),
      position: round(positionAt(initialPosition, initialVelocity, acceleration, time), 3),
      velocity: round(velocityAt(initialVelocity, acceleration, time), 3),
      acceleration: round(acceleration, 3),
    });
  }
  return samples;
}

export function makeTrial(
  trial: number,
  experiment: string,
  initialPosition: number,
  initialVelocity: number,
  acceleration: number,
  duration: number,
): KinematicsTrial {
  const finalPosition = positionAt(initialPosition, initialVelocity, acceleration, duration);
  return {
    trial,
    experiment,
    initialPosition: round(initialPosition, 2),
    initialVelocity: round(initialVelocity, 2),
    acceleration: round(acceleration, 2),
    duration: round(duration, 2),
    displacement: round(finalPosition - initialPosition, 3),
    finalVelocity: round(velocityAt(initialVelocity, acceleration, duration), 3),
  };
}

export function scenarioParameters(scenario: GraphScenario) {
  switch (scenario) {
    case "constant-positive":
      return {
        label: "Constant positive velocity",
        initialPosition: -8,
        initialVelocity: 2,
        acceleration: 0,
        duration: 6,
      };
    case "speeding-up":
      return {
        label: "Speeding up in the positive direction",
        initialPosition: -7,
        initialVelocity: 0.5,
        acceleration: 0.75,
        duration: 6,
      };
    case "slowing-down":
      return {
        label: "Slowing down while moving positive",
        initialPosition: -6,
        initialVelocity: 4,
        acceleration: -0.55,
        duration: 6,
      };
    case "turnaround":
      return {
        label: "Turns around",
        initialPosition: 6,
        initialVelocity: -3,
        acceleration: 0.8,
        duration: 7,
      };
    default:
      return {
        label: "Constant positive velocity",
        initialPosition: -8,
        initialVelocity: 2,
        acceleration: 0,
        duration: 6,
      };
  }
}

export function sampleAt(samples: MotionSample[], time: number) {
  if (samples.length === 0) {
    return { time: 0, position: 0, velocity: 0, acceleration: 0 };
  }
  return samples.reduce((closest, sample) =>
    Math.abs(sample.time - time) < Math.abs(closest.time - time) ? sample : closest,
  );
}

export function normalizePosition(position: number) {
  const min = -16;
  const max = 16;
  return Math.max(0.05, Math.min(0.95, (position - min) / (max - min)));
}
