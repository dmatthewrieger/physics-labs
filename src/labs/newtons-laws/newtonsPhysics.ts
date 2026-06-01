const GRAVITY = 9.8;

export function kineticFriction(mu: number, mass: number) {
  return Math.max(0, mu) * mass * GRAVITY;
}

export function secondLawNetForce(appliedForce: number, mass: number, frictionEnabled: boolean, mu: number) {
  const frictionForce = frictionEnabled ? kineticFriction(mu, mass) : 0;
  const netForce = appliedForce - frictionForce;
  return {
    frictionForce,
    netForce,
    acceleration: netForce / mass,
  };
}

export function integrateOneDimensional(position: number, velocity: number, acceleration: number, dt: number) {
  const nextVelocity = velocity + acceleration * dt;
  const nextPosition = position + nextVelocity * dt;
  return { nextPosition, nextVelocity };
}

export function firstLawStep(
  position: number,
  velocity: number,
  dt: number,
  frictionEnabled: boolean,
  frictionStrength: number,
  pushForce: number,
) {
  const frictionForce =
    frictionEnabled && Math.abs(velocity) > 0.02 ? -Math.sign(velocity) * Math.abs(frictionStrength) : 0;
  const netForce = pushForce + frictionForce;
  const acceleration = netForce;
  const next = integrateOneDimensional(position, velocity, acceleration, dt);
  const stoppedByFriction = frictionEnabled && Math.sign(velocity) !== Math.sign(next.nextVelocity) && pushForce === 0;

  return {
    position: next.nextPosition,
    velocity: stoppedByFriction ? 0 : next.nextVelocity,
    netForce: stoppedByFriction ? 0 : netForce,
  };
}

export function thirdLawForceProfile(time: number, compression: number, duration = 0.75) {
  if (time < 0 || time > duration) {
    return 0;
  }
  return compression * 28 * Math.sin((Math.PI * time) / duration);
}

export function round(value: number, places = 2) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}
