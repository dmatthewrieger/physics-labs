import { CourseMode, LabQuestion } from "../../types/labTypes";
import { ConfiguredInvestigation, ConfiguredLab, ControlSpec, ExperimentResult } from "./configuredLabTypes";

const g = 9.8;
const kC = 8.99e9;
const mu0 = 4 * Math.PI * 1e-7;
const h = 6.626e-34;
const c = 3e8;
const eV = 1.602e-19;

const round = (value: number, places = 3) => {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const degToRad = (degrees: number) => (degrees * Math.PI) / 180;

const thinLensImageDistance = (focalLength: number, objectDistance: number) => {
  const denominator = 1 / focalLength - 1 / objectDistance;
  return Math.abs(denominator) < 1e-6 ? 0 : 1 / denominator;
};

const control = (
  key: string,
  label: string,
  unit: string,
  min: number,
  max: number,
  step: number,
  defaultValue: number,
): ControlSpec => ({ key, label, unit, min, max, step, defaultValue });

const metric = (label: string, value: number, unit: string, precision = 3) => ({
  label,
  value: round(value, precision),
  unit,
  precision,
});

const rowsFromFunction = (
  count: number,
  xLabel: (index: number) => string,
  xValue: (index: number) => number,
  yValue: (index: number) => number,
  secondaryValue: (index: number) => number = () => 0,
  tertiaryValue: (index: number) => number = () => 0,
) =>
  Array.from({ length: count }, (_, index) => ({
    step: index + 1,
    label: xLabel(index),
    x: round(xValue(index), 4),
    y: round(yValue(index), 4),
    secondary: round(secondaryValue(index), 4),
    tertiary: round(tertiaryValue(index), 4),
  }));

const result = (
  rows: ReturnType<typeof rowsFromFunction>,
  metrics: ReturnType<typeof metric>[],
  graphTitle: string,
  xLabel: string,
  yLabel: string,
  yLineLabel: string,
  secondaryLineLabel?: string,
  tertiaryLineLabel?: string,
): ExperimentResult => ({
  rows,
  metrics,
  graphTitle,
  xLabel,
  yLabel,
  yLineLabel,
  secondaryLineLabel,
  tertiaryLineLabel,
});

const q = (
  id: string,
  sectionId: string,
  prompt: string,
  keywords: string[],
  correct: string,
  type: LabQuestion["type"] = "short-answer",
): LabQuestion => ({
  id,
  sectionId,
  type,
  prompt,
  keywords,
  feedback: {
    correct,
    partial: "You are close. Add a specific connection to the equation, graph, or data table.",
    revisit: "Revisit the data and use the relevant physics relationship in your answer.",
  },
});

const questionSet = (labId: string, sectionId: string, topic: string, algebraKeywords: string[], calculusKeywords: string[]) => ({
  "algebra-trig": [
    q(
      `${labId}-${sectionId}-a-predict`,
      sectionId,
      `Prediction: Before running the trial, how do you expect changing the main control to affect ${topic}?`,
      algebraKeywords,
      `Good prediction. Your answer connects the control variable to ${topic}.`,
      "prediction",
    ),
    q(
      `${labId}-${sectionId}-a-graph`,
      sectionId,
      `Use the graph and data table to describe the pattern in ${topic}.`,
      algebraKeywords,
      `Good. Your explanation uses the graph or data pattern for ${topic}.`,
    ),
    q(
      `${labId}-${sectionId}-a-equation`,
      sectionId,
      "Which equation or proportional relationship best explains your result?",
      algebraKeywords,
      "Good. Your answer names the relationship that explains the result.",
    ),
  ],
  calculus: [
    q(
      `${labId}-${sectionId}-c-predict`,
      sectionId,
      `Prediction: Before running the trial, how should the rate, slope, integral, or field relationship affect ${topic}?`,
      calculusKeywords,
      `Good prediction. Your response connects ${topic} to a rate, slope, integral, or field relationship.`,
      "prediction",
    ),
    q(
      `${labId}-${sectionId}-c-graph`,
      sectionId,
      `Use the graph to interpret ${topic} with a calculus-based relationship.`,
      calculusKeywords,
      `Good. Your explanation connects ${topic} to the calculus-based representation.`,
    ),
    q(
      `${labId}-${sectionId}-c-equation`,
      sectionId,
      "Which differential, integral, or field equation best explains your result?",
      calculusKeywords,
      "Good. Your answer names the calculus-based relationship that explains the result.",
    ),
  ],
});

const reflectionQuestions = (labId: string, labTitle: string, algebraTerms: string[], calculusTerms: string[]) => ({
  "algebra-trig": [
    q(
      `${labId}-reflect-a-1`,
      "reflection",
      `Summarize the main physics idea from the ${labTitle} using evidence from at least two investigations.`,
      algebraTerms,
      "Good reflection. Your answer uses evidence from multiple investigations.",
      "reflection",
    ),
    q(
      `${labId}-reflect-a-2`,
      "reflection",
      "Give a real-world example where this relationship matters.",
      algebraTerms,
      "Good. Your example connects the lab model to a real physical situation.",
      "reflection",
    ),
  ],
  calculus: [
    q(
      `${labId}-reflect-c-1`,
      "reflection",
      `Summarize the ${labTitle} using a rate, integral, field, or conservation relationship.`,
      calculusTerms,
      "Good reflection. Your answer connects the lab model to a more advanced relationship.",
      "reflection",
    ),
    q(
      `${labId}-reflect-c-2`,
      "reflection",
      "Give a real-world example and identify the mathematical relationship that models it.",
      calculusTerms,
      "Good. Your example includes the relevant mathematical relationship.",
      "reflection",
    ),
  ],
});

const investigation = (
  labId: string,
  id: string,
  title: string,
  purpose: string,
  controls: ControlSpec[],
  run: (values: Record<string, number>) => ExperimentResult,
  topic: string,
  algebraKeywords: string[],
  calculusKeywords: string[],
  diagramCaption: string,
): ConfiguredInvestigation => ({
  id,
  title,
  eyebrow: "Investigation",
  purpose,
  procedure: "Set the variables, submit the prediction question, run the virtual trial, then interpret the graph and data table.",
  diagramTitle: title,
  diagramCaption,
  controls,
  analysis: {
    "algebra-trig": `Focus on proportional reasoning, units, graph shape, and the equation that predicts ${topic}.`,
    calculus: `Focus on rates, areas, field models, conservation laws, and the equation that predicts ${topic}.`,
  },
  questions: questionSet(labId, id, topic, algebraKeywords, calculusKeywords),
  run,
});

const projectileLab: ConfiguredLab = {
  id: "projectile-motion",
  title: "Projectile Motion Lab",
  introTitle: "Motion in Two Dimensions",
  intro:
    "Launch a projectile and compare horizontal motion, vertical motion, range, time of flight, and maximum height.",
  objectives: {
    "algebra-trig": [
      "Resolve initial velocity into horizontal and vertical components.",
      "Predict range and maximum height for a launched projectile.",
      "Explain why horizontal velocity is constant when air resistance is neglected.",
    ],
    calculus: [
      "Interpret horizontal and vertical motion with component functions.",
      "Connect acceleration to the derivative of velocity in the vertical direction.",
      "Use parametric position functions to predict range and height.",
    ],
  },
  investigations: [
    investigation(
      "projectile",
      "launch-angle",
      "Launch Angle and Range",
      "Determine how launch angle affects range for a fixed launch speed.",
      [control("speed", "Launch speed", "m/s", 5, 40, 1, 24), control("angle", "Launch angle", "deg", 10, 80, 1, 45)],
      ({ speed, angle }) => {
        const theta = degToRad(angle);
        const time = (2 * speed * Math.sin(theta)) / g;
        const range = speed * Math.cos(theta) * time;
        const maxHeight = (speed * speed * Math.sin(theta) ** 2) / (2 * g);
        const rows = rowsFromFunction(
          9,
          (i) => `${10 + i * 10} deg`,
          (i) => 10 + i * 10,
          (i) => {
            const a = degToRad(10 + i * 10);
            return (speed * speed * Math.sin(2 * a)) / g;
          },
        );
        return result(rows, [metric("Time of flight", time, "s"), metric("Range", range, "m"), metric("Max height", maxHeight, "m")], "Range vs. launch angle", "angle (deg)", "range (m)", "range");
      },
      "range",
      ["angle", "range", "components"],
      ["parametric", "component", "derivative"],
      "The projectile follows a curved path because vertical velocity changes while horizontal velocity remains constant.",
    ),
    investigation(
      "projectile",
      "launch-speed",
      "Launch Speed and Height",
      "Determine how launch speed affects maximum height and time of flight.",
      [control("speed", "Launch speed", "m/s", 5, 40, 1, 22), control("angle", "Launch angle", "deg", 15, 75, 1, 55)],
      ({ speed, angle }) => {
        const theta = degToRad(angle);
        const rows = rowsFromFunction(
          8,
          (i) => `${8 + i * 4} m/s`,
          (i) => 8 + i * 4,
          (i) => ((8 + i * 4) ** 2 * Math.sin(theta) ** 2) / (2 * g),
          (i) => (2 * (8 + i * 4) * Math.sin(theta)) / g,
        );
        return result(rows, [metric("Vertical speed", speed * Math.sin(theta), "m/s"), metric("Max height", (speed ** 2 * Math.sin(theta) ** 2) / (2 * g), "m"), metric("Time of flight", (2 * speed * Math.sin(theta)) / g, "s")], "Height and time vs. speed", "speed (m/s)", "height (m)", "max height", "time");
      },
      "maximum height",
      ["speed", "height", "velocity"],
      ["velocity function", "integral", "acceleration"],
      "Increasing vertical launch speed increases the time spent rising and the peak height.",
    ),
    investigation(
      "projectile",
      "launch-height",
      "Launch Height",
      "Compare projectiles launched from different heights.",
      [control("speed", "Horizontal speed", "m/s", 2, 30, 1, 14), control("height", "Launch height", "m", 1, 40, 1, 12)],
      ({ speed, height }) => {
        const time = Math.sqrt((2 * height) / g);
        const range = speed * time;
        const rows = rowsFromFunction(
          8,
          (i) => `${2 + i * 4} m`,
          (i) => 2 + i * 4,
          (i) => speed * Math.sqrt((2 * (2 + i * 4)) / g),
          (i) => Math.sqrt((2 * (2 + i * 4)) / g),
        );
        return result(rows, [metric("Fall time", time, "s"), metric("Horizontal range", range, "m"), metric("Impact speed", Math.sqrt(speed ** 2 + (g * time) ** 2), "m/s")], "Range vs. launch height", "height (m)", "range (m)", "range", "time");
      },
      "range from height",
      ["height", "time", "range"],
      ["position function", "square root", "parametric"],
      "A horizontal launch from a greater height stays in the air longer and travels farther.",
    ),
  ],
  reflectionQuestions: reflectionQuestions("projectile", "Projectile Motion Lab", ["range", "height", "components"], ["parametric", "derivative", "integral"]),
  conclusionScaffold:
    "The student investigated projectile motion by separating horizontal and vertical components. The evidence shows that horizontal velocity remains constant while vertical velocity changes due to gravitational acceleration.",
};

const workEnergyLab: ConfiguredLab = {
  id: "work-energy",
  title: "Work and Energy Lab",
  introTitle: "Forces, Distance, and Energy Transfer",
  intro: "Explore how work transfers energy and how kinetic, gravitational, and spring energy are related.",
  objectives: {
    "algebra-trig": ["Calculate work from force and displacement.", "Connect net work to change in kinetic energy.", "Compare gravitational and spring energy."],
    calculus: ["Interpret work as an integral of force over displacement.", "Connect conservative-force work to potential energy.", "Use energy conservation to predict speed."],
  },
  investigations: [
    investigation(
      "work-energy",
      "constant-work",
      "Constant Force Work",
      "Measure how force and displacement determine work.",
      [control("force", "Applied force", "N", 2, 80, 1, 30), control("distance", "Displacement", "m", 0.5, 12, 0.5, 5), control("angle", "Force angle", "deg", 0, 80, 5, 20)],
      ({ force, distance, angle }) => {
        const work = force * distance * Math.cos(degToRad(angle));
        const rows = rowsFromFunction(8, (i) => `${1 + i} m`, (i) => 1 + i, (i) => force * (1 + i) * Math.cos(degToRad(angle)));
        return result(rows, [metric("Work", work, "J"), metric("Force component", force * Math.cos(degToRad(angle)), "N"), metric("Displacement", distance, "m")], "Work vs. displacement", "displacement (m)", "work (J)", "work");
      },
      "work",
      ["force", "distance", "cosine"],
      ["integral", "force", "displacement"],
      "Only the component of force parallel to displacement does work.",
    ),
    investigation(
      "work-energy",
      "kinetic-energy",
      "Work-Kinetic Energy",
      "Predict final speed from net work.",
      [control("mass", "Mass", "kg", 0.5, 10, 0.5, 3), control("initialSpeed", "Initial speed", "m/s", 0, 12, 0.5, 2), control("work", "Net work", "J", 0, 300, 5, 90)],
      ({ mass, initialSpeed, work }) => {
        const initialKe = 0.5 * mass * initialSpeed ** 2;
        const finalKe = initialKe + work;
        const finalSpeed = Math.sqrt((2 * finalKe) / mass);
        const rows = rowsFromFunction(8, (i) => `${i * 40} J`, (i) => i * 40, (i) => Math.sqrt((2 * (initialKe + i * 40)) / mass));
        return result(rows, [metric("Initial KE", initialKe, "J"), metric("Final KE", finalKe, "J"), metric("Final speed", finalSpeed, "m/s")], "Final speed vs. net work", "work (J)", "speed (m/s)", "final speed");
      },
      "change in kinetic energy",
      ["work", "kinetic energy", "speed"],
      ["integral", "work", "kinetic energy"],
      "Net work changes kinetic energy, so more work produces a greater final speed.",
    ),
    investigation(
      "work-energy",
      "spring-energy",
      "Spring and Gravitational Energy",
      "Compare stored spring energy with gravitational potential energy.",
      [control("springConstant", "Spring constant", "N/m", 20, 500, 10, 180), control("compression", "Compression", "m", 0.05, 1, 0.05, 0.4), control("mass", "Mass", "kg", 0.2, 8, 0.2, 2)],
      ({ springConstant, compression, mass }) => {
        const energy = 0.5 * springConstant * compression ** 2;
        const equivalentHeight = energy / (mass * g);
        const rows = rowsFromFunction(8, (i) => `${round(0.1 + i * 0.1, 2)} m`, (i) => 0.1 + i * 0.1, (i) => 0.5 * springConstant * (0.1 + i * 0.1) ** 2);
        return result(rows, [metric("Spring energy", energy, "J"), metric("Equivalent height", equivalentHeight, "m"), metric("Launch speed", Math.sqrt((2 * energy) / mass), "m/s")], "Spring energy vs. compression", "compression (m)", "energy (J)", "spring energy");
      },
      "stored energy",
      ["spring", "energy", "compression"],
      ["potential energy", "integral", "force"],
      "Spring energy increases with the square of compression.",
    ),
  ],
  reflectionQuestions: reflectionQuestions("work-energy", "Work and Energy Lab", ["work", "energy", "speed"], ["integral", "potential", "kinetic"]),
  conclusionScaffold:
    "The student investigated work and energy by comparing force-displacement work, kinetic energy changes, and stored potential energy. The evidence supports the work-energy theorem and conservation of mechanical energy in ideal systems.",
};

const momentumLab: ConfiguredLab = {
  id: "momentum",
  title: "Conservation of Momentum Lab",
  introTitle: "Collisions, Impulse, and Momentum",
  intro: "Model one-dimensional interactions and compare impulse, momentum change, and conservation of total momentum.",
  objectives: {
    "algebra-trig": ["Calculate momentum from mass and velocity.", "Compare elastic and inelastic collisions.", "Relate impulse to momentum change."],
    calculus: ["Interpret force-time area as impulse.", "Connect net external force to dp/dt.", "Analyze system momentum conservation."],
  },
  investigations: [
    investigation(
      "momentum",
      "inelastic",
      "Perfectly Inelastic Collision",
      "Predict the shared final velocity after carts stick together.",
      [control("massA", "Mass A", "kg", 0.5, 10, 0.5, 2), control("velocityA", "Velocity A", "m/s", -8, 8, 0.5, 5), control("massB", "Mass B", "kg", 0.5, 10, 0.5, 4), control("velocityB", "Velocity B", "m/s", -8, 8, 0.5, -1)],
      ({ massA, velocityA, massB, velocityB }) => {
        const initialP = massA * velocityA + massB * velocityB;
        const finalV = initialP / (massA + massB);
        const rows = rowsFromFunction(8, (i) => `${1 + i} kg`, (i) => 1 + i, (i) => (massA * velocityA + (1 + i) * velocityB) / (massA + 1 + i));
        return result(rows, [metric("Initial momentum", initialP, "kg m/s"), metric("Shared final velocity", finalV, "m/s"), metric("Kinetic energy lost", 0.5 * massA * velocityA ** 2 + 0.5 * massB * velocityB ** 2 - 0.5 * (massA + massB) * finalV ** 2, "J")], "Final velocity vs. Mass B", "mass B (kg)", "final velocity (m/s)", "final velocity");
      },
      "final velocity",
      ["momentum", "mass", "velocity"],
      ["momentum", "system", "dp/dt"],
      "When carts stick together, total momentum is conserved but kinetic energy may decrease.",
    ),
    investigation(
      "momentum",
      "elastic",
      "Elastic Collision",
      "Compare final velocities for an ideal elastic collision.",
      [control("massA", "Mass A", "kg", 0.5, 8, 0.5, 2), control("velocityA", "Velocity A", "m/s", -8, 8, 0.5, 5), control("massB", "Mass B", "kg", 0.5, 8, 0.5, 2), control("velocityB", "Velocity B", "m/s", -8, 8, 0.5, 0)],
      ({ massA, velocityA, massB, velocityB }) => {
        const finalA = ((massA - massB) / (massA + massB)) * velocityA + ((2 * massB) / (massA + massB)) * velocityB;
        const finalB = ((2 * massA) / (massA + massB)) * velocityA + ((massB - massA) / (massA + massB)) * velocityB;
        const rows = rowsFromFunction(8, (i) => `${0.5 + i} kg`, (i) => 0.5 + i, (i) => ((massA - (0.5 + i)) / (massA + 0.5 + i)) * velocityA + ((2 * (0.5 + i)) / (massA + 0.5 + i)) * velocityB, (i) => ((2 * massA) / (massA + 0.5 + i)) * velocityA + (((0.5 + i) - massA) / (massA + 0.5 + i)) * velocityB);
        return result(rows, [metric("Final velocity A", finalA, "m/s"), metric("Final velocity B", finalB, "m/s"), metric("Total momentum", massA * velocityA + massB * velocityB, "kg m/s")], "Elastic final velocities", "mass B (kg)", "velocity (m/s)", "vA final", "vB final");
      },
      "elastic final velocity",
      ["elastic", "momentum", "kinetic"],
      ["conservation", "momentum", "energy"],
      "In an ideal elastic collision, momentum and kinetic energy are both conserved.",
    ),
    investigation(
      "momentum",
      "impulse",
      "Impulse",
      "Relate average force and interaction time to momentum change.",
      [control("force", "Average force", "N", 5, 200, 5, 80), control("time", "Interaction time", "s", 0.05, 2, 0.05, 0.5), control("mass", "Mass", "kg", 0.5, 10, 0.5, 2)],
      ({ force, time, mass }) => {
        const impulse = force * time;
        const deltaV = impulse / mass;
        const rows = rowsFromFunction(8, (i) => `${round(0.1 + i * 0.2, 2)} s`, (i) => 0.1 + i * 0.2, (i) => force * (0.1 + i * 0.2), (i) => (force * (0.1 + i * 0.2)) / mass);
        return result(rows, [metric("Impulse", impulse, "N s"), metric("Change in velocity", deltaV, "m/s"), metric("Momentum change", impulse, "kg m/s")], "Impulse vs. time", "time (s)", "impulse (N s)", "impulse", "Delta v");
      },
      "impulse",
      ["force", "time", "momentum"],
      ["integral", "force-time", "momentum"],
      "Impulse is the area under a force-time graph and equals change in momentum.",
    ),
  ],
  reflectionQuestions: reflectionQuestions("momentum", "Conservation of Momentum Lab", ["momentum", "collision", "impulse"], ["dp/dt", "impulse", "system"]),
  conclusionScaffold:
    "The student investigated conservation of momentum in collisions and impulse interactions. The evidence shows that total momentum is conserved when external impulse is negligible, while impulse changes an object's momentum.",
};

const rotationalLab: ConfiguredLab = {
  id: "rotational-motion",
  title: "Rotational Motion Lab",
  introTitle: "Angular Motion and Torque",
  intro: "Explore angular kinematics, torque, moment of inertia, and rolling relationships.",
  objectives: {
    "algebra-trig": ["Use angular kinematics equations.", "Relate torque to angular acceleration.", "Connect angular and linear speed."],
    calculus: ["Connect angular velocity to dtheta/dt.", "Connect angular acceleration to domega/dt.", "Interpret torque as dL/dt."],
  },
  investigations: [
    investigation(
      "rotation",
      "angular-kinematics",
      "Angular Kinematics",
      "Predict angular displacement for constant angular acceleration.",
      [control("omega0", "Initial angular velocity", "rad/s", -10, 10, 0.5, 2), control("alpha", "Angular acceleration", "rad/s^2", -5, 5, 0.25, 1.5), control("time", "Time", "s", 1, 12, 0.5, 5)],
      ({ omega0, alpha, time }) => {
        const theta = omega0 * time + 0.5 * alpha * time ** 2;
        const omega = omega0 + alpha * time;
        const rows = rowsFromFunction(8, (i) => `${i + 1} s`, (i) => i + 1, (i) => omega0 * (i + 1) + 0.5 * alpha * (i + 1) ** 2, (i) => omega0 + alpha * (i + 1));
        return result(rows, [metric("Angular displacement", theta, "rad"), metric("Final angular velocity", omega, "rad/s"), metric("Revolutions", theta / (2 * Math.PI), "rev")], "Angular displacement vs. time", "time (s)", "theta (rad)", "theta", "omega");
      },
      "angular displacement",
      ["angular", "time", "acceleration"],
      ["dtheta/dt", "domega/dt", "integral"],
      "Angular kinematics mirror linear kinematics with angular variables.",
    ),
    investigation(
      "rotation",
      "torque",
      "Torque and Angular Acceleration",
      "Measure how torque and moment of inertia affect angular acceleration.",
      [control("force", "Tangential force", "N", 1, 80, 1, 20), control("radius", "Lever arm", "m", 0.1, 2, 0.1, 0.6), control("inertia", "Moment of inertia", "kg m^2", 0.1, 12, 0.1, 2)],
      ({ force, radius, inertia }) => {
        const torque = force * radius;
        const alpha = torque / inertia;
        const rows = rowsFromFunction(8, (i) => `${round(0.2 + i * 0.2, 2)} m`, (i) => 0.2 + i * 0.2, (i) => (force * (0.2 + i * 0.2)) / inertia);
        return result(rows, [metric("Torque", torque, "N m"), metric("Angular acceleration", alpha, "rad/s^2"), metric("Moment of inertia", inertia, "kg m^2")], "Angular acceleration vs. radius", "lever arm (m)", "alpha (rad/s^2)", "angular acceleration");
      },
      "angular acceleration",
      ["torque", "inertia", "acceleration"],
      ["torque", "dL/dt", "inertia"],
      "Greater torque produces greater angular acceleration for the same moment of inertia.",
    ),
    investigation(
      "rotation",
      "rolling",
      "Rolling Without Slipping",
      "Connect wheel radius, angular velocity, and linear speed.",
      [control("radius", "Wheel radius", "m", 0.05, 1.5, 0.05, 0.35), control("omega", "Angular velocity", "rad/s", 1, 40, 1, 12), control("time", "Time", "s", 1, 10, 0.5, 4)],
      ({ radius, omega, time }) => {
        const speed = radius * omega;
        const distance = speed * time;
        const rows = rowsFromFunction(8, (i) => `${round(0.1 + i * 0.1, 2)} m`, (i) => 0.1 + i * 0.1, (i) => (0.1 + i * 0.1) * omega);
        return result(rows, [metric("Linear speed", speed, "m/s"), metric("Distance", distance, "m"), metric("Angular displacement", omega * time, "rad")], "Linear speed vs. radius", "radius (m)", "speed (m/s)", "linear speed");
      },
      "linear speed",
      ["radius", "angular", "speed"],
      ["omega", "dtheta/dt", "velocity"],
      "Rolling without slipping connects linear speed and angular speed by v = omega r.",
    ),
  ],
  reflectionQuestions: reflectionQuestions("rotation", "Rotational Motion Lab", ["torque", "angular", "inertia"], ["dtheta/dt", "dL/dt", "integral"]),
  conclusionScaffold:
    "The student investigated rotational motion by comparing angular kinematics, torque, and rolling relationships. The evidence shows that angular quantities follow patterns similar to linear motion while torque controls angular acceleration.",
};

const staticEquilibriumLab: ConfiguredLab = {
  id: "static-equilibrium",
  title: "Static Equilibrium Lab",
  introTitle: "Balanced Forces and Torques",
  intro: "Analyze objects at rest by balancing forces and torques.",
  objectives: {
    "algebra-trig": ["Apply net force equals zero.", "Apply net torque equals zero.", "Use lever arms to solve equilibrium problems."],
    calculus: ["Analyze continuous balance using torque sums.", "Connect equilibrium to zero acceleration.", "Interpret stability from torque direction."],
  },
  investigations: [
    investigation(
      "equilibrium",
      "beam",
      "Balanced Beam",
      "Find the support force needed to balance torques.",
      [control("load", "Load force", "N", 10, 500, 10, 160), control("loadDistance", "Load distance", "m", 0.2, 5, 0.1, 2), control("supportDistance", "Support distance", "m", 0.2, 5, 0.1, 1.2)],
      ({ load, loadDistance, supportDistance }) => {
        const support = (load * loadDistance) / supportDistance;
        const rows = rowsFromFunction(8, (i) => `${round(0.5 + i * 0.5, 2)} m`, (i) => 0.5 + i * 0.5, (i) => (load * loadDistance) / (0.5 + i * 0.5));
        return result(rows, [metric("Load torque", load * loadDistance, "N m"), metric("Support force", support, "N"), metric("Net torque", support * supportDistance - load * loadDistance, "N m")], "Support force vs. support distance", "support distance (m)", "support force (N)", "support force");
      },
      "support force",
      ["torque", "force", "distance"],
      ["torque sum", "equilibrium", "moment"],
      "A beam balances when clockwise and counterclockwise torques are equal.",
    ),
    investigation(
      "equilibrium",
      "ladder",
      "Wall and Floor Forces",
      "Estimate wall force for a leaning ladder model.",
      [control("weight", "Ladder weight", "N", 50, 800, 10, 220), control("angle", "Angle", "deg", 20, 80, 1, 55), control("length", "Length", "m", 1, 10, 0.5, 4)],
      ({ weight, angle, length }) => {
        const wallForce = (weight * (length / 2) * Math.cos(degToRad(angle))) / (length * Math.sin(degToRad(angle)));
        const rows = rowsFromFunction(8, (i) => `${25 + i * 7} deg`, (i) => 25 + i * 7, (i) => (weight * 0.5 * Math.cos(degToRad(25 + i * 7))) / Math.sin(degToRad(25 + i * 7)));
        return result(rows, [metric("Wall force", wallForce, "N"), metric("Floor normal", weight, "N"), metric("Weight torque arm", (length / 2) * Math.cos(degToRad(angle)), "m")], "Wall force vs. ladder angle", "angle (deg)", "wall force (N)", "wall force");
      },
      "wall force",
      ["torque", "angle", "force"],
      ["equilibrium", "torque", "static"],
      "Changing the ladder angle changes the lever arm for the ladder's weight.",
    ),
    investigation(
      "equilibrium",
      "hanging-sign",
      "Hanging Sign",
      "Calculate cable tension for a hanging sign.",
      [control("weight", "Sign weight", "N", 20, 800, 10, 180), control("angle", "Cable angle", "deg", 10, 80, 1, 35)],
      ({ weight, angle }) => {
        const tension = weight / (2 * Math.sin(degToRad(angle)));
        const rows = rowsFromFunction(8, (i) => `${15 + i * 8} deg`, (i) => 15 + i * 8, (i) => weight / (2 * Math.sin(degToRad(15 + i * 8))));
        return result(rows, [metric("Cable tension", tension, "N"), metric("Vertical component", tension * Math.sin(degToRad(angle)), "N"), metric("Horizontal component", tension * Math.cos(degToRad(angle)), "N")], "Cable tension vs. angle", "angle (deg)", "tension (N)", "tension");
      },
      "tension",
      ["force", "component", "balance"],
      ["component", "equilibrium", "force sum"],
      "Two cable tensions support the sign when their vertical components add to the weight.",
    ),
  ],
  reflectionQuestions: reflectionQuestions("equilibrium", "Static Equilibrium Lab", ["force", "torque", "balance"], ["equilibrium", "torque", "components"]),
  conclusionScaffold:
    "The student investigated static equilibrium by balancing forces and torques. The evidence shows that an object at rest must have zero net force and zero net torque.",
};

const shmLab: ConfiguredLab = {
  id: "simple-harmonic-motion",
  title: "Simple Harmonic Motion Lab",
  introTitle: "Oscillations and Restoring Forces",
  intro: "Study mass-spring oscillations, period, amplitude, frequency, and energy.",
  objectives: {
    "algebra-trig": ["Calculate spring period.", "Relate amplitude to energy.", "Interpret sinusoidal motion graphs."],
    calculus: ["Connect SHM to a second-order differential equation.", "Interpret velocity and acceleration as derivatives.", "Analyze oscillator energy."],
  },
  investigations: [
    investigation("shm", "period", "Mass-Spring Period", "Measure how mass and spring constant affect period.", [control("mass", "Mass", "kg", 0.1, 10, 0.1, 1), control("springConstant", "Spring constant", "N/m", 5, 300, 5, 40)], ({ mass, springConstant }) => {
      const period = 2 * Math.PI * Math.sqrt(mass / springConstant);
      const rows = rowsFromFunction(8, (i) => `${round(0.2 + i * 0.4, 2)} kg`, (i) => 0.2 + i * 0.4, (i) => 2 * Math.PI * Math.sqrt((0.2 + i * 0.4) / springConstant));
      return result(rows, [metric("Period", period, "s"), metric("Frequency", 1 / period, "Hz"), metric("Angular frequency", Math.sqrt(springConstant / mass), "rad/s")], "Period vs. mass", "mass (kg)", "period (s)", "period");
    }, "period", ["mass", "spring", "period"], ["differential equation", "omega", "period"], "A larger mass oscillates more slowly on the same spring."),
    investigation("shm", "amplitude", "Amplitude and Energy", "Compare amplitude with stored spring energy.", [control("springConstant", "Spring constant", "N/m", 5, 300, 5, 60), control("amplitude", "Amplitude", "m", 0.05, 1.5, 0.05, 0.4)], ({ springConstant, amplitude }) => {
      const energy = 0.5 * springConstant * amplitude ** 2;
      const rows = rowsFromFunction(8, (i) => `${round(0.1 + i * 0.1, 2)} m`, (i) => 0.1 + i * 0.1, (i) => 0.5 * springConstant * (0.1 + i * 0.1) ** 2);
      return result(rows, [metric("Total energy", energy, "J"), metric("Max force", springConstant * amplitude, "N"), metric("Amplitude", amplitude, "m")], "Energy vs. amplitude", "amplitude (m)", "energy (J)", "energy");
    }, "energy", ["amplitude", "energy", "spring"], ["potential energy", "amplitude", "integral"], "Oscillator energy increases with amplitude squared."),
    investigation("shm", "motion", "Position-Time Motion", "Model sinusoidal position, velocity, and acceleration.", [control("amplitude", "Amplitude", "m", 0.1, 2, 0.1, 1), control("frequency", "Frequency", "Hz", 0.1, 5, 0.1, 1.2)], ({ amplitude, frequency }) => {
      const omega = 2 * Math.PI * frequency;
      const rows = rowsFromFunction(16, (i) => `${round(i / 8, 2)} s`, (i) => i / 8, (i) => amplitude * Math.cos(omega * (i / 8)), (i) => -amplitude * omega * Math.sin(omega * (i / 8)), (i) => -amplitude * omega ** 2 * Math.cos(omega * (i / 8)));
      return result(rows, [metric("Max speed", amplitude * omega, "m/s"), metric("Max acceleration", amplitude * omega ** 2, "m/s^2"), metric("Period", 1 / frequency, "s")], "SHM position over time", "time (s)", "position (m)", "position", "velocity", "acceleration");
    }, "sinusoidal motion", ["position", "velocity", "acceleration"], ["derivative", "second derivative", "sinusoidal"], "Velocity and acceleration are tied to the changing slope and curvature of position."),
  ],
  reflectionQuestions: reflectionQuestions("shm", "Simple Harmonic Motion Lab", ["period", "amplitude", "spring"], ["differential", "omega", "energy"]),
  conclusionScaffold:
    "The student investigated simple harmonic motion by comparing period, amplitude, energy, and sinusoidal graphs. The evidence shows that restoring forces produce repeating motion whose period depends on mass and spring constant.",
};

const fluidsLab: ConfiguredLab = {
  id: "fluids",
  title: "Fluids Lab",
  introTitle: "Pressure, Buoyancy, and Flow",
  intro: "Investigate hydrostatic pressure, buoyant force, and continuity in fluid systems.",
  objectives: {
    "algebra-trig": ["Calculate pressure from depth.", "Apply Archimedes' principle.", "Use continuity for fluid flow."],
    calculus: ["Interpret pressure variation with depth.", "Connect buoyancy to displaced fluid.", "Analyze flow rate conservation."],
  },
  investigations: [
    investigation("fluids", "pressure", "Hydrostatic Pressure", "Measure pressure change with depth.", [control("density", "Fluid density", "kg/m^3", 500, 1400, 50, 1000), control("depth", "Depth", "m", 0.1, 20, 0.1, 4)], ({ density, depth }) => {
      const pressure = density * g * depth;
      const rows = rowsFromFunction(8, (i) => `${i + 1} m`, (i) => i + 1, (i) => density * g * (i + 1));
      return result(rows, [metric("Gauge pressure", pressure, "Pa"), metric("Pressure in kPa", pressure / 1000, "kPa"), metric("Depth", depth, "m")], "Pressure vs. depth", "depth (m)", "pressure (Pa)", "pressure");
    }, "pressure", ["density", "depth", "pressure"], ["gradient", "pressure", "depth"], "Pressure increases linearly with depth in a fluid."),
    investigation("fluids", "buoyancy", "Buoyant Force", "Compare buoyant force with object weight.", [control("fluidDensity", "Fluid density", "kg/m^3", 500, 1400, 50, 1000), control("volume", "Displaced volume", "m^3", 0.001, 0.2, 0.001, 0.04), control("objectMass", "Object mass", "kg", 0.1, 80, 0.5, 25)], ({ fluidDensity, volume, objectMass }) => {
      const buoyancy = fluidDensity * volume * g;
      const weight = objectMass * g;
      const rows = rowsFromFunction(8, (i) => `${round(0.01 + i * 0.02, 3)} m^3`, (i) => 0.01 + i * 0.02, (i) => fluidDensity * (0.01 + i * 0.02) * g);
      return result(rows, [metric("Buoyant force", buoyancy, "N"), metric("Object weight", weight, "N"), metric("Net upward force", buoyancy - weight, "N")], "Buoyant force vs. volume", "volume (m^3)", "force (N)", "buoyant force");
    }, "buoyant force", ["density", "volume", "weight"], ["displaced fluid", "force", "volume"], "An object floats when buoyant force can balance its weight."),
    investigation("fluids", "continuity", "Continuity Equation", "Relate pipe area and fluid speed.", [control("area1", "Area 1", "m^2", 0.01, 2, 0.01, 0.5), control("speed1", "Speed 1", "m/s", 0.1, 20, 0.1, 3), control("area2", "Area 2", "m^2", 0.01, 2, 0.01, 0.2)], ({ area1, speed1, area2 }) => {
      const flow = area1 * speed1;
      const speed2 = flow / area2;
      const rows = rowsFromFunction(8, (i) => `${round(0.1 + i * 0.2, 2)} m^2`, (i) => 0.1 + i * 0.2, (i) => flow / (0.1 + i * 0.2));
      return result(rows, [metric("Flow rate", flow, "m^3/s"), metric("Speed 2", speed2, "m/s"), metric("Area ratio", area1 / area2, "")], "Outlet speed vs. outlet area", "area 2 (m^2)", "speed 2 (m/s)", "speed");
    }, "flow speed", ["area", "speed", "flow"], ["continuity", "flux", "flow rate"], "For incompressible flow, smaller area produces greater speed."),
  ],
  reflectionQuestions: reflectionQuestions("fluids", "Fluids Lab", ["pressure", "buoyancy", "flow"], ["gradient", "flux", "displaced"]),
  conclusionScaffold:
    "The student investigated fluids by comparing pressure with depth, buoyant force with displaced volume, and speed with pipe area. The evidence supports hydrostatic pressure, Archimedes' principle, and continuity.",
};

const electricFieldsLab: ConfiguredLab = {
  id: "electric-fields",
  title: "Electric Fields Lab",
  introTitle: "Charges, Fields, and Potential",
  intro: "Map electric field strength and electric potential for point charges and simple charge arrangements.",
  objectives: {
    "algebra-trig": ["Calculate electric field from charge and distance.", "Interpret field direction.", "Compare electric potential at different locations."],
    calculus: ["Connect electric field to potential gradient.", "Apply inverse-square field relationships.", "Analyze superposition."],
  },
  investigations: [
    investigation("electric-fields", "point-field", "Point Charge Field", "Measure how electric field changes with distance.", [control("charge", "Charge", "nC", -20, 20, 1, 8), control("distance", "Distance", "m", 0.1, 5, 0.1, 1.2)], ({ charge, distance }) => {
      const qC = charge * 1e-9;
      const field = kC * qC / distance ** 2;
      const rows = rowsFromFunction(8, (i) => `${round(0.5 + i * 0.5, 2)} m`, (i) => 0.5 + i * 0.5, (i) => kC * qC / (0.5 + i * 0.5) ** 2);
      return result(rows, [metric("Electric field", field, "N/C"), metric("Field magnitude", Math.abs(field), "N/C"), metric("Charge", charge, "nC")], "Electric field vs. distance", "distance (m)", "field (N/C)", "electric field");
    }, "electric field", ["charge", "distance", "inverse square"], ["field", "gradient", "inverse square"], "Electric field from a point charge follows an inverse-square relationship."),
    investigation("electric-fields", "potential", "Electric Potential", "Compare electric potential with distance.", [control("charge", "Charge", "nC", -20, 20, 1, 10), control("distance", "Distance", "m", 0.1, 5, 0.1, 1.5)], ({ charge, distance }) => {
      const qC = charge * 1e-9;
      const potential = kC * qC / distance;
      const rows = rowsFromFunction(8, (i) => `${round(0.5 + i * 0.5, 2)} m`, (i) => 0.5 + i * 0.5, (i) => kC * qC / (0.5 + i * 0.5));
      return result(rows, [metric("Potential", potential, "V"), metric("Potential magnitude", Math.abs(potential), "V"), metric("Distance", distance, "m")], "Potential vs. distance", "distance (m)", "potential (V)", "potential");
    }, "electric potential", ["charge", "distance", "potential"], ["potential", "gradient", "field"], "Electric potential from a point charge decreases as distance increases."),
    investigation("electric-fields", "superposition", "Superposition", "Add electric fields from two charges along a line.", [control("chargeA", "Charge A", "nC", -20, 20, 1, 8), control("chargeB", "Charge B", "nC", -20, 20, 1, -6), control("point", "Point from A", "m", 0.2, 4.8, 0.1, 2)], ({ chargeA, chargeB, point }) => {
      const separation = 5;
      const eA = kC * chargeA * 1e-9 / point ** 2;
      const eB = -kC * chargeB * 1e-9 / (separation - point) ** 2;
      const rows = rowsFromFunction(8, (i) => `${round(0.5 + i * 0.5, 2)} m`, (i) => 0.5 + i * 0.5, (i) => kC * chargeA * 1e-9 / (0.5 + i * 0.5) ** 2 - kC * chargeB * 1e-9 / (separation - (0.5 + i * 0.5)) ** 2);
      return result(rows, [metric("Field from A", eA, "N/C"), metric("Field from B", eB, "N/C"), metric("Net field", eA + eB, "N/C")], "Net field along line", "position (m)", "net field (N/C)", "net field");
    }, "net field", ["superposition", "charge", "field"], ["superposition", "vector", "field"], "Electric fields add by superposition, including direction signs."),
  ],
  reflectionQuestions: reflectionQuestions("electric-fields", "Electric Fields Lab", ["charge", "field", "potential"], ["gradient", "superposition", "field"]),
  conclusionScaffold:
    "The student investigated electric fields by comparing charge, distance, potential, and superposition. The evidence shows that electric fields follow inverse-square behavior and add as vectors.",
};

const circuitsLab: ConfiguredLab = {
  id: "dc-circuits",
  title: "DC Circuits Lab",
  introTitle: "Voltage, Current, Resistance, and Power",
  intro: "Build simple DC circuit models and compare Ohm's law, series circuits, parallel circuits, and power.",
  objectives: {
    "algebra-trig": ["Apply Ohm's law.", "Analyze series and parallel resistance.", "Calculate electrical power."],
    calculus: ["Interpret circuit relationships as linear models.", "Analyze power transfer.", "Connect current to charge flow rate."],
  },
  investigations: [
    investigation("circuits", "ohms-law", "Ohm's Law", "Measure current from voltage and resistance.", [control("voltage", "Voltage", "V", 1, 24, 0.5, 12), control("resistance", "Resistance", "ohm", 1, 200, 1, 50)], ({ voltage, resistance }) => {
      const current = voltage / resistance;
      const rows = rowsFromFunction(8, (i) => `${2 + i * 3} V`, (i) => 2 + i * 3, (i) => (2 + i * 3) / resistance);
      return result(rows, [metric("Current", current, "A"), metric("Power", voltage * current, "W"), metric("Resistance", resistance, "ohm")], "Current vs. voltage", "voltage (V)", "current (A)", "current");
    }, "current", ["voltage", "resistance", "current"], ["linear", "charge flow", "current"], "Current is proportional to voltage for fixed resistance."),
    investigation("circuits", "series", "Series Resistance", "Calculate total resistance and current in series.", [control("voltage", "Voltage", "V", 1, 24, 0.5, 12), control("r1", "R1", "ohm", 1, 200, 1, 30), control("r2", "R2", "ohm", 1, 200, 1, 60)], ({ voltage, r1, r2 }) => {
      const total = r1 + r2;
      const current = voltage / total;
      const rows = rowsFromFunction(8, (i) => `${10 + i * 20} ohm`, (i) => 10 + i * 20, (i) => voltage / (r1 + 10 + i * 20));
      return result(rows, [metric("Total resistance", total, "ohm"), metric("Current", current, "A"), metric("Voltage across R2", current * r2, "V")], "Series current vs. R2", "R2 (ohm)", "current (A)", "current");
    }, "series current", ["series", "resistance", "current"], ["linear circuit", "current", "voltage"], "Series resistances add, reducing current for a fixed voltage."),
    investigation("circuits", "parallel", "Parallel Resistance and Power", "Calculate equivalent resistance and power.", [control("voltage", "Voltage", "V", 1, 24, 0.5, 12), control("r1", "R1", "ohm", 1, 200, 1, 40), control("r2", "R2", "ohm", 1, 200, 1, 80)], ({ voltage, r1, r2 }) => {
      const equivalent = 1 / (1 / r1 + 1 / r2);
      const current = voltage / equivalent;
      const rows = rowsFromFunction(8, (i) => `${10 + i * 20} ohm`, (i) => 10 + i * 20, (i) => 1 / (1 / r1 + 1 / (10 + i * 20)), (i) => voltage / (1 / (1 / r1 + 1 / (10 + i * 20))));
      return result(rows, [metric("Equivalent resistance", equivalent, "ohm"), metric("Total current", current, "A"), metric("Power", voltage * current, "W")], "Equivalent resistance vs. R2", "R2 (ohm)", "equivalent resistance (ohm)", "equivalent R", "current");
    }, "parallel resistance", ["parallel", "resistance", "power"], ["reciprocal", "current", "power"], "Parallel branches lower equivalent resistance and increase current for a fixed voltage."),
  ],
  reflectionQuestions: reflectionQuestions("circuits", "DC Circuits Lab", ["voltage", "current", "resistance"], ["current", "power", "linear"]),
  conclusionScaffold:
    "The student investigated DC circuits by comparing Ohm's law, series resistance, and parallel resistance. The evidence shows how voltage, current, resistance, and power are related.",
};

const magnetismLab: ConfiguredLab = {
  id: "magnetism",
  title: "Magnetism Lab",
  introTitle: "Magnetic Forces and Fields",
  intro: "Explore magnetic forces on moving charges and current-carrying wires, plus solenoid fields.",
  objectives: {
    "algebra-trig": ["Calculate magnetic force.", "Apply right-hand-rule direction ideas.", "Estimate solenoid field strength."],
    calculus: ["Connect force to vector products.", "Analyze field strength from current density models.", "Relate magnetic force to circular motion."],
  },
  investigations: [
    investigation("magnetism", "charge-force", "Force on a Moving Charge", "Measure magnetic force from charge, speed, field, and angle.", [control("charge", "Charge", "microC", 1, 50, 1, 8), control("speed", "Speed", "m/s", 100, 5000, 100, 1500), control("field", "Magnetic field", "T", 0.01, 2, 0.01, 0.4), control("angle", "Angle", "deg", 0, 90, 5, 90)], ({ charge, speed, field, angle }) => {
      const force = charge * 1e-6 * speed * field * Math.sin(degToRad(angle));
      const rows = rowsFromFunction(8, (i) => `${i * 15} deg`, (i) => i * 15, (i) => charge * 1e-6 * speed * field * Math.sin(degToRad(i * 15)));
      return result(rows, [metric("Magnetic force", force, "N"), metric("qvB", charge * 1e-6 * speed * field, "N"), metric("Angle factor", Math.sin(degToRad(angle)), "")], "Force vs. angle", "angle (deg)", "force (N)", "force");
    }, "magnetic force", ["charge", "speed", "field"], ["cross product", "Lorentz", "force"], "Magnetic force depends on the perpendicular component of velocity."),
    investigation("magnetism", "wire-force", "Force on a Current-Carrying Wire", "Measure force on a wire in a magnetic field.", [control("current", "Current", "A", 0.5, 40, 0.5, 8), control("length", "Wire length", "m", 0.05, 5, 0.05, 1.2), control("field", "Magnetic field", "T", 0.01, 2, 0.01, 0.5)], ({ current, length, field }) => {
      const force = current * length * field;
      const rows = rowsFromFunction(8, (i) => `${1 + i * 4} A`, (i) => 1 + i * 4, (i) => (1 + i * 4) * length * field);
      return result(rows, [metric("Wire force", force, "N"), metric("Current", current, "A"), metric("Field", field, "T")], "Wire force vs. current", "current (A)", "force (N)", "force");
    }, "wire force", ["current", "length", "field"], ["current", "field", "cross product"], "A current-carrying wire feels a magnetic force when current is perpendicular to the field."),
    investigation("magnetism", "solenoid", "Solenoid Field", "Estimate magnetic field inside a solenoid.", [control("turnDensity", "Turns per meter", "1/m", 50, 2000, 50, 600), control("current", "Current", "A", 0.1, 20, 0.1, 4)], ({ turnDensity, current }) => {
      const field = mu0 * turnDensity * current;
      const rows = rowsFromFunction(8, (i) => `${1 + i * 2} A`, (i) => 1 + i * 2, (i) => mu0 * turnDensity * (1 + i * 2));
      return result(rows, [metric("Solenoid field", field, "T"), metric("Field in mT", field * 1000, "mT"), metric("Turn density", turnDensity, "1/m")], "Solenoid field vs. current", "current (A)", "field (T)", "field");
    }, "solenoid field", ["current", "turns", "field"], ["Ampere", "field", "current"], "The ideal solenoid field is proportional to current and turns per meter."),
  ],
  reflectionQuestions: reflectionQuestions("magnetism", "Magnetism Lab", ["force", "field", "current"], ["cross product", "field", "current"]),
  conclusionScaffold:
    "The student investigated magnetism by comparing forces on charges and wires with magnetic fields. The evidence shows that magnetic effects depend on current, field strength, motion, and orientation.",
};

const wavesLab: ConfiguredLab = {
  id: "waves-sound",
  title: "Waves and Sound Lab",
  introTitle: "Frequency, Wavelength, and Wave Behavior",
  intro: "Explore wave speed, standing waves, sound intensity, and resonance.",
  objectives: {
    "algebra-trig": ["Apply v = f lambda.", "Predict standing-wave frequencies.", "Compare sound intensity levels."],
    calculus: ["Connect wave functions to frequency and wavelength.", "Analyze standing-wave boundary conditions.", "Interpret logarithmic sound level."],
  },
  investigations: [
    investigation("waves", "wave-speed", "Wave Speed", "Relate frequency, wavelength, and speed.", [control("frequency", "Frequency", "Hz", 0.5, 1000, 0.5, 60), control("wavelength", "Wavelength", "m", 0.05, 10, 0.05, 2)], ({ frequency, wavelength }) => {
      const speed = frequency * wavelength;
      const rows = rowsFromFunction(8, (i) => `${10 + i * 40} Hz`, (i) => 10 + i * 40, (i) => (10 + i * 40) * wavelength);
      return result(rows, [metric("Wave speed", speed, "m/s"), metric("Frequency", frequency, "Hz"), metric("Wavelength", wavelength, "m")], "Wave speed vs. frequency", "frequency (Hz)", "speed (m/s)", "speed");
    }, "wave speed", ["frequency", "wavelength", "speed"], ["wave function", "frequency", "wavelength"], "Wave speed equals frequency times wavelength."),
    investigation("waves", "standing-wave", "Standing Waves", "Predict resonant frequencies on a string.", [control("waveSpeed", "Wave speed", "m/s", 10, 500, 5, 120), control("length", "String length", "m", 0.2, 5, 0.1, 1.5), control("harmonic", "Harmonic number", "", 1, 8, 1, 2)], ({ waveSpeed, length, harmonic }) => {
      const frequency = (harmonic * waveSpeed) / (2 * length);
      const rows = rowsFromFunction(8, (i) => `${i + 1}`, (i) => i + 1, (i) => ((i + 1) * waveSpeed) / (2 * length));
      return result(rows, [metric("Resonant frequency", frequency, "Hz"), metric("Wavelength", (2 * length) / harmonic, "m"), metric("Harmonic", harmonic, "")], "Frequency vs. harmonic", "harmonic", "frequency (Hz)", "frequency");
    }, "resonant frequency", ["harmonic", "length", "frequency"], ["boundary", "mode", "frequency"], "Standing waves occur at frequencies that fit the boundary conditions."),
    investigation("waves", "sound-level", "Sound Intensity Level", "Compare intensity and decibel level.", [control("intensityExponent", "log10 intensity", "log10(W/m^2)", -12, -3, 0.1, -6), control("multiplier", "Intensity multiplier", "", 1, 1000, 1, 10)], ({ intensityExponent, multiplier }) => {
      const intensity = 10 ** intensityExponent;
      const beta = 10 * Math.log10(intensity / 1e-12);
      const beta2 = 10 * Math.log10((intensity * multiplier) / 1e-12);
      const rows = rowsFromFunction(8, (i) => `${10 ** i}`, (i) => 10 ** i, (i) => 10 * Math.log10((intensity * 10 ** i) / 1e-12));
      return result(rows, [metric("Sound level", beta, "dB"), metric("Changed level", beta2, "dB"), metric("Level change", beta2 - beta, "dB")], "Sound level vs. multiplier", "intensity multiplier", "sound level (dB)", "sound level");
    }, "sound level", ["intensity", "decibel", "log"], ["logarithm", "intensity", "level"], "Decibel level is logarithmic, so multiplying intensity adds decibels."),
  ],
  reflectionQuestions: reflectionQuestions("waves", "Waves and Sound Lab", ["frequency", "wavelength", "intensity"], ["wave function", "logarithm", "mode"]),
  conclusionScaffold:
    "The student investigated waves and sound by comparing speed, wavelength, frequency, resonance, and intensity level. The evidence shows how wave relationships and boundary conditions determine observable behavior.",
};

const opticsLab: ConfiguredLab = {
  id: "optics",
  title: "Optics Lab",
  introTitle: "Lenses, Mirrors, and Refraction",
  intro: "Model image formation and refraction using thin lenses, magnification, and Snell's law.",
  objectives: {
    "algebra-trig": ["Apply the thin-lens equation.", "Calculate magnification.", "Use Snell's law for refraction."],
    calculus: ["Interpret optical sign conventions.", "Analyze angle relationships through refraction.", "Connect image geometry to linear approximations."],
  },
  investigations: [
    investigation("optics", "lens", "Thin Lens", "Predict image distance from object distance and focal length.", [control("focalLength", "Focal length", "cm", 2, 50, 1, 12), control("objectDistance", "Object distance", "cm", 5, 100, 1, 30)], ({ focalLength, objectDistance }) => {
      const imageDistance = thinLensImageDistance(focalLength, objectDistance);
      const rows = rowsFromFunction(8, (i) => `${10 + i * 10} cm`, (i) => 10 + i * 10, (i) => thinLensImageDistance(focalLength, 10 + i * 10));
      return result(rows, [metric("Image distance", imageDistance, "cm"), metric("Focal length", focalLength, "cm"), metric("Object distance", objectDistance, "cm")], "Image distance vs. object distance", "object distance (cm)", "image distance (cm)", "image distance");
    }, "image distance", ["lens", "focal", "distance"], ["thin lens", "sign", "geometry"], "The thin-lens equation links object distance, image distance, and focal length."),
    investigation("optics", "magnification", "Magnification", "Calculate image size and orientation.", [control("objectHeight", "Object height", "cm", 1, 20, 0.5, 6), control("objectDistance", "Object distance", "cm", 5, 100, 1, 40), control("imageDistance", "Image distance", "cm", -100, 100, 1, 24)], ({ objectHeight, objectDistance, imageDistance }) => {
      const magnification = -imageDistance / objectDistance;
      const imageHeight = magnification * objectHeight;
      const rows = rowsFromFunction(8, (i) => `${10 + i * 10} cm`, (i) => 10 + i * 10, (i) => -(imageDistance / (10 + i * 10)) * objectHeight);
      return result(rows, [metric("Magnification", magnification, ""), metric("Image height", imageHeight, "cm"), metric("Object height", objectHeight, "cm")], "Image height vs. object distance", "object distance (cm)", "image height (cm)", "image height");
    }, "magnification", ["image", "object", "height"], ["geometry", "sign", "ratio"], "Magnification compares image height with object height and includes orientation sign."),
    investigation("optics", "snell", "Refraction", "Use Snell's law to predict refracted angle.", [control("n1", "Index n1", "", 1, 2.5, 0.01, 1), control("n2", "Index n2", "", 1, 2.5, 0.01, 1.5), control("angle1", "Incident angle", "deg", 0, 80, 1, 35)], ({ n1, n2, angle1 }) => {
      const ratio = (n1 / n2) * Math.sin(degToRad(angle1));
      const angle2 = Math.asin(clamp(ratio, -1, 1)) * 180 / Math.PI;
      const rows = rowsFromFunction(8, (i) => `${10 + i * 10} deg`, (i) => 10 + i * 10, (i) => Math.asin(clamp((n1 / n2) * Math.sin(degToRad(10 + i * 10)), -1, 1)) * 180 / Math.PI);
      return result(rows, [metric("Refracted angle", angle2, "deg"), metric("n1 sin(theta1)", n1 * Math.sin(degToRad(angle1)), ""), metric("n2 sin(theta2)", n2 * Math.sin(degToRad(angle2)), "")], "Refracted angle vs. incident angle", "incident angle (deg)", "refracted angle (deg)", "refracted angle");
    }, "refracted angle", ["index", "angle", "Snell"], ["Snell", "sine", "boundary"], "Light bends when it crosses into a material with a different refractive index."),
  ],
  reflectionQuestions: reflectionQuestions("optics", "Optics Lab", ["lens", "image", "refraction"], ["geometry", "sign", "boundary"]),
  conclusionScaffold:
    "The student investigated optics by comparing lens image formation, magnification, and refraction. The evidence shows that image properties and light bending follow geometric relationships.",
};

const modernLab: ConfiguredLab = {
  id: "modern-physics",
  title: "Modern Physics Lab",
  introTitle: "Photons, Matter Waves, and Decay",
  intro: "Explore photon energy, matter waves, and radioactive decay models.",
  objectives: {
    "algebra-trig": ["Calculate photon energy.", "Estimate de Broglie wavelength.", "Model radioactive decay."],
    calculus: ["Connect energy to frequency.", "Interpret exponential decay rates.", "Relate momentum and wavelength."],
  },
  investigations: [
    investigation("modern", "photon", "Photon Energy", "Relate light frequency and wavelength to photon energy.", [control("wavelength", "Wavelength", "nm", 100, 1000, 10, 500)], ({ wavelength }) => {
      const lambda = wavelength * 1e-9;
      const energyJ = (h * c) / lambda;
      const energyEv = energyJ / eV;
      const rows = rowsFromFunction(8, (i) => `${200 + i * 100} nm`, (i) => 200 + i * 100, (i) => ((h * c) / ((200 + i * 100) * 1e-9)) / eV);
      return result(rows, [metric("Photon energy", energyEv, "eV"), metric("Frequency", c / lambda, "Hz"), metric("Energy", energyJ, "J")], "Photon energy vs. wavelength", "wavelength (nm)", "energy (eV)", "energy");
    }, "photon energy", ["wavelength", "frequency", "energy"], ["Planck", "frequency", "energy"], "Shorter-wavelength photons have greater energy."),
    investigation("modern", "debroglie", "Matter Waves", "Estimate de Broglie wavelength from mass and speed.", [control("mass", "Mass", "kg", 1e-31, 1e-26, 1e-31, 9.11e-31), control("speed", "Speed", "m/s", 1e3, 1e7, 1e3, 1e6)], ({ mass, speed }) => {
      const wavelength = h / (mass * speed);
      const rows = rowsFromFunction(8, (i) => `${(1e5 + i * 1e6).toExponential(1)} m/s`, (i) => 1e5 + i * 1e6, (i) => h / (mass * (1e5 + i * 1e6)));
      return result(rows, [metric("de Broglie wavelength", wavelength, "m"), metric("Momentum", mass * speed, "kg m/s"), metric("Speed", speed, "m/s")], "Wavelength vs. speed", "speed (m/s)", "wavelength (m)", "wavelength");
    }, "matter wavelength", ["momentum", "wavelength", "speed"], ["de Broglie", "momentum", "wavelength"], "Matter wavelength decreases as momentum increases."),
    investigation("modern", "decay", "Radioactive Decay", "Model remaining nuclei over time.", [control("initial", "Initial nuclei", "", 100, 10000, 100, 5000), control("halfLife", "Half-life", "days", 0.5, 30, 0.5, 8), control("time", "Elapsed time", "days", 0, 80, 1, 24)], ({ initial, halfLife, time }) => {
      const remaining = initial * 0.5 ** (time / halfLife);
      const lambda = Math.log(2) / halfLife;
      const rows = rowsFromFunction(8, (i) => `${i * halfLife} d`, (i) => i * halfLife, (i) => initial * 0.5 ** i);
      return result(rows, [metric("Remaining nuclei", remaining, ""), metric("Decay constant", lambda, "1/day"), metric("Fraction remaining", remaining / initial, "")], "Remaining nuclei vs. time", "time (days)", "remaining nuclei", "remaining");
    }, "radioactive decay", ["half-life", "remaining", "exponential"], ["exponential", "decay constant", "rate"], "Radioactive decay is exponential, with half the sample remaining each half-life."),
  ],
  reflectionQuestions: reflectionQuestions("modern", "Modern Physics Lab", ["energy", "wavelength", "decay"], ["Planck", "de Broglie", "exponential"]),
  conclusionScaffold:
    "The student investigated modern physics by comparing photon energy, matter waves, and radioactive decay. The evidence shows that quantum and nuclear models use frequency, momentum, and exponential relationships.",
};

export const configuredLabs: ConfiguredLab[] = [
  projectileLab,
  workEnergyLab,
  momentumLab,
  rotationalLab,
  staticEquilibriumLab,
  shmLab,
  fluidsLab,
  electricFieldsLab,
  circuitsLab,
  magnetismLab,
  wavesLab,
  opticsLab,
  modernLab,
];

export const configuredLabMap = new Map(configuredLabs.map((lab) => [lab.id, lab]));
