export interface MotionSample {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
}

export interface KinematicsTrial {
  trial: number;
  experiment: string;
  initialPosition: number;
  initialVelocity: number;
  acceleration: number;
  duration: number;
  displacement: number;
  finalVelocity: number;
}

export type GraphScenario = "constant-positive" | "speeding-up" | "slowing-down" | "turnaround";
