export interface FirstLawSample {
  time: number;
  position: number;
  velocity: number;
  netForce: number;
}

export interface SecondLawSample {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
}

export interface SecondLawTrial {
  trial: number;
  mass: number;
  appliedForce: number;
  frictionForce: number;
  netForce: number;
  acceleration: number;
  inverseMass: number;
}

export interface ThirdLawSample {
  time: number;
  forceOnA: number;
  forceOnB: number;
  velocityA: number;
  velocityB: number;
  momentumA: number;
  momentumB: number;
  totalMomentum: number;
}

export interface FirstLawState {
  time: number;
  position: number;
  velocity: number;
  netForce: number;
}

export interface SecondLawState {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
  netForce: number;
  frictionForce: number;
}

export interface ThirdLawState {
  time: number;
  positionA: number;
  positionB: number;
  velocityA: number;
  velocityB: number;
  force: number;
}
