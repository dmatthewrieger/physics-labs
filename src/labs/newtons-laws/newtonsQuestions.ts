import { CourseMode, LabQuestion } from "../../types/labTypes";

type QuestionSet = Record<CourseMode, LabQuestion[]>;

const mc = (
  id: string,
  sectionId: string,
  prompt: string,
  correctOptionId: string,
  options: string[],
  feedback: LabQuestion["feedback"],
): LabQuestion => ({
  id,
  sectionId,
  type: "multiple-choice",
  prompt,
  correctOptionId,
  options: options.map((label, index) => ({ id: String.fromCharCode(97 + index), label })),
  feedback,
});

const sa = (
  id: string,
  sectionId: string,
  prompt: string,
  keywords: string[],
  feedback: LabQuestion["feedback"],
  type: LabQuestion["type"] = "short-answer",
): LabQuestion => ({
  id,
  sectionId,
  type,
  prompt,
  keywords,
  feedback,
});

const algebraFeedback = {
  force:
    "Good. Your answer connects the observation to net force, acceleration, and the evidence from the graph or table.",
  partial:
    "You are close. Make the connection to net force, acceleration, slope, or the free-body diagram more explicit.",
  revisit:
    "Revisit the trial evidence and use net force, acceleration, velocity, or graph slope in your explanation.",
};

const calculusFeedback = {
  force:
    "Good. Your answer connects the observation to a rate of change, derivative, integral, impulse, or momentum.",
  partial:
    "You are close. Add the relevant derivative, integral, impulse, or momentum relationship to strengthen the explanation.",
  revisit:
    "Revisit the graph and connect the evidence to dv/dt, dx/dt, integral area, impulse, or dp/dt.",
};

export const firstLawQuestions: QuestionSet = {
  "algebra-trig": [
    sa("first-a0", "first-law", "Prediction: With friction off, what will happen to the cart after the push ends?", [
      "constant",
      "velocity",
      "net force",
    ], {
      correct: "Good prediction. The key idea is that the cart keeps constant velocity when net force is zero.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "prediction"),
    mc(
      "first-a1",
      "first-law",
      "When friction is off, what happens to the cart's velocity after the push ends?",
      "b",
      ["It immediately becomes zero.", "It remains constant.", "It keeps increasing.", "It changes direction."],
      {
        correct: "Correct. With zero net force after the push, the velocity remains constant.",
        partial: algebraFeedback.partial,
        revisit: "Check the velocity-time graph after the push. A horizontal line means constant velocity.",
      },
    ),
    mc(
      "first-a2",
      "first-law",
      "What is the net force on the cart after the push ends when friction is off?",
      "a",
      ["Zero newtons.", "Equal to the cart's velocity.", "Equal to the cart's mass.", "Increasing with time."],
      {
        correct: "Correct. After the push ends and friction is off, the net force is zero.",
        partial: algebraFeedback.partial,
        revisit: "Look at the net force readout after the push interval ends.",
      },
    ),
    sa("first-a3", "first-law", "Does an object need a continuing force to keep moving at constant velocity? Explain.", [
      "no",
      "constant velocity",
      "net force",
      "zero",
    ], {
      correct: "Good. A continuing force is not required for constant velocity; zero net force is the key condition.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("first-a4", "first-law", "How does the velocity-time graph show constant velocity?", [
      "horizontal",
      "slope",
      "constant",
    ], {
      correct: "Good. A horizontal velocity-time graph indicates the velocity is not changing.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("first-a5", "first-law", "How does the position-time graph change when velocity is constant?", [
      "straight",
      "line",
      "slope",
    ], {
      correct: "Good. Constant velocity produces a straight position-time graph with constant slope.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
  ],
  calculus: [
    sa("first-c0", "first-law", "Prediction: With friction off, what should dv/dt be after the push ends?", [
      "zero",
      "dv/dt",
      "constant",
    ], {
      correct: "Good prediction. When the velocity is constant, dv/dt is zero.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "prediction"),
    mc(
      "first-c1",
      "first-law",
      "When friction is off, what is dv/dt after the push ends?",
      "a",
      ["0", "v", "x/t", "mg"],
      {
        correct: "Correct. A constant velocity means dv/dt = 0.",
        partial: calculusFeedback.partial,
        revisit: "Check the velocity-time graph after the push. Its slope is dv/dt.",
      },
    ),
    sa("first-c2", "first-law", "If dv/dt = 0, what does that imply about acceleration?", [
      "zero",
      "acceleration",
    ], {
      correct: "Good. Acceleration is dv/dt, so it is zero when velocity is constant.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("first-c3", "first-law", "If acceleration is zero, what does Newton's Second Law imply about net force?", [
      "zero",
      "net force",
      "ma",
    ], {
      correct: "Good. For constant mass, Sigma F = ma, so zero acceleration means zero net force.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("first-c4", "first-law", "How is velocity related to the derivative of position?", ["dx/dt", "derivative", "position"], {
      correct: "Good. Velocity is the time derivative of position, v = dx/dt.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("first-c5", "first-law", "How would you determine velocity from a position-time graph?", ["slope", "derivative"], {
      correct: "Good. Velocity is the slope, or derivative, of the position-time graph.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
  ],
};

export const secondLawQuestions: QuestionSet = {
  "algebra-trig": [
    sa("second-a0", "second-law", "Prediction: If mass is fixed and net force increases, what should happen to acceleration?", [
      "increases",
      "force",
      "acceleration",
    ], {
      correct: "Good prediction. With mass fixed, acceleration increases with net force.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "prediction"),
    sa("second-a1", "second-law", "Experiment 2A: What happens to acceleration as applied force increases?", [
      "increases",
      "force",
      "acceleration",
    ], {
      correct: "Good. With mass fixed, greater net force produces greater acceleration.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    mc(
      "second-a2",
      "second-law",
      "Experiment 2A: If net force doubles while mass stays constant, what happens to acceleration?",
      "c",
      ["It is unchanged.", "It is cut in half.", "It doubles.", "It becomes zero."],
      {
        correct: "Correct. Acceleration is directly proportional to net force when mass is constant.",
        partial: algebraFeedback.partial,
        revisit: "Use a = F_net / m. Keep m fixed and double F_net.",
      },
    ),
    sa("second-a3", "second-law", "Experiment 2A: What does the slope of acceleration vs. net force represent?", [
      "1/m",
      "inverse",
      "mass",
    ], {
      correct: "Good. The slope of a versus F_net is 1/m.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("second-a4", "second-law", "Experiment 2B: What happens to acceleration as mass increases?", [
      "decreases",
      "mass",
      "inversely",
    ], {
      correct: "Good. With net force fixed, acceleration decreases as mass increases.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    mc(
      "second-a5",
      "second-law",
      "Experiment 2B: If mass doubles while net force stays constant, what happens to acceleration?",
      "b",
      ["It doubles.", "It is cut in half.", "It becomes negative.", "It is unchanged."],
      {
        correct: "Correct. Doubling mass halves acceleration when net force is constant.",
        partial: algebraFeedback.partial,
        revisit: "Use a = F_net / m and keep F_net fixed.",
      },
    ),
    sa("second-a6", "second-law", "Experiment 2C: How does friction affect the net force and acceleration?", [
      "reduces",
      "net force",
      "acceleration",
    ], {
      correct: "Good. Friction opposes motion, reducing net force and therefore acceleration.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("second-a7", "second-law", "Can an object have an applied force but zero acceleration? Explain.", [
      "yes",
      "balanced",
      "net force",
      "zero",
    ], {
      correct: "Good. If applied force is balanced by friction or another force, net force and acceleration can be zero.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
  ],
  calculus: [
    sa("second-c0", "second-law", "Prediction: For fixed mass, how should a larger net force change dv/dt?", [
      "larger",
      "dv/dt",
      "force",
    ], {
      correct: "Good prediction. For constant mass, Sigma F = m dv/dt, so larger net force gives larger dv/dt.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "prediction"),
    sa("second-c1", "second-law", "For constant mass, how does Sigma F = ma relate to the slope of the velocity-time graph?", [
      "slope",
      "velocity",
      "acceleration",
      "dv/dt",
    ], {
      correct: "Good. The slope of v(t) is acceleration, and Sigma F = m dv/dt.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("second-c2", "second-law", "If force changes with time, why would acceleration also be time-dependent?", [
      "f(t)",
      "a(t)",
      "mass",
    ], {
      correct: "Good. For constant mass, a(t) = F_net(t)/m.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("second-c3", "second-law", "How could you determine velocity from an acceleration-time graph?", [
      "integral",
      "area",
      "acceleration",
    ], {
      correct: "Good. The area under the acceleration-time graph gives the change in velocity.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("second-c4", "second-law", "How could you determine displacement from a velocity-time graph?", [
      "integral",
      "area",
      "velocity",
    ], {
      correct: "Good. The area under v(t) gives displacement.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("second-c5", "second-law", "With constant net force, how does mass affect dv/dt?", [
      "larger",
      "smaller",
      "dv/dt",
      "mass",
    ], {
      correct: "Good. Larger mass produces a smaller dv/dt for the same net force.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("second-c6", "second-law", "If applied force and friction balance, what is dv/dt?", ["zero", "dv/dt"], {
      correct: "Good. Balanced forces produce dv/dt = 0.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("second-c7", "second-law", "How does friction appear in the differential equation for the cart's motion?", [
      "opposing",
      "force",
      "ma",
    ], {
      correct: "Good. Friction enters as a force term opposing motion in m dv/dt = F_applied - f_k.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
  ],
};

export const thirdLawQuestions: QuestionSet = {
  "algebra-trig": [
    sa("third-a0", "third-law", "Prediction: When the carts push apart, how should the two interaction forces compare?", [
      "equal",
      "opposite",
      "forces",
    ], {
      correct: "Good prediction. Newton's Third Law predicts equal-magnitude, opposite-direction forces.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "prediction"),
    mc(
      "third-a1",
      "third-law",
      "Experiment 3A: How do the forces on equal-mass carts compare during the push-off?",
      "d",
      ["They point the same way.", "The faster cart has the larger force.", "The heavier cart has the larger force.", "They are equal in magnitude and opposite in direction."],
      {
        correct: "Correct. The interaction forces are equal and opposite.",
        partial: algebraFeedback.partial,
        revisit: "Compare the two force arrows and force-time graph signs.",
      },
    ),
    sa("third-a2", "third-law", "Experiment 3A: Why do equal-mass carts move apart symmetrically?", [
      "equal",
      "mass",
      "acceleration",
    ], {
      correct: "Good. Equal masses experiencing equal-magnitude forces have equal-magnitude accelerations.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("third-a3", "third-law", "Experiment 3B: If the forces are equal in magnitude, why are the accelerations different?", [
      "mass",
      "acceleration",
      "a =",
    ], {
      correct: "Good. Acceleration depends on both force and mass.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("third-a4", "third-law", "Experiment 3B: Which cart has the greater final speed?", [
      "less",
      "mass",
      "speed",
    ], {
      correct: "Good. The less massive cart reaches the greater final speed.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("third-a5", "third-law", "Why don't action-reaction forces cancel each other on one cart?", [
      "different objects",
      "same object",
      "free-body",
    ], {
      correct: "Good. Action-reaction forces act on different objects; forces cancel only when they act on the same object.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
  ],
  calculus: [
    sa("third-c0", "third-law", "Prediction: How should the impulses on the two carts compare during the interaction?", [
      "equal",
      "opposite",
      "impulse",
    ], {
      correct: "Good prediction. Equal and opposite force-time areas produce equal and opposite impulses.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "prediction"),
    sa("third-c1", "third-law", "Experiment 3A: How do the force-time graphs compare?", [
      "equal",
      "opposite",
      "force",
    ], {
      correct: "Good. The force-time graphs have equal magnitudes and opposite signs.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("third-c2", "third-law", "How do the impulses on the two carts compare?", [
      "equal",
      "opposite",
      "impulse",
    ], {
      correct: "Good. Equal and opposite forces over the same time produce equal and opposite impulses.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("third-c3", "third-law", "How does impulse relate to change in momentum?", ["integral", "momentum", "change"], {
      correct: "Good. J = integral F dt = Delta p.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("third-c4", "third-law", "Why does the lower-mass cart have a larger change in velocity?", [
      "momentum",
      "mass",
      "velocity",
    ], {
      correct: "Good. For the same magnitude momentum change, smaller mass means a larger velocity change.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("third-c5", "third-law", "Why can internal forces cancel for the system but not for an individual cart?", [
      "system",
      "internal",
      "individual",
    ], {
      correct: "Good. The internal forces sum to zero for the two-cart system, but each cart still has one interaction force acting on it.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
  ],
};

export const finalReflectionQuestions: QuestionSet = {
  "algebra-trig": [
    sa("final-a1", "reflection", "Describe Newton's First Law in your own words using evidence from Lab 1.", [
      "constant velocity",
      "net force",
      "inertia",
    ], {
      correct: "Good reflection. You used Lab 1 evidence to connect inertia and zero net force.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
    sa("final-a2", "reflection", "Use your data from Lab 2 to explain the relationship between net force, mass, and acceleration.", [
      "force",
      "mass",
      "acceleration",
    ], {
      correct: "Good. Your response connects the data to a = F_net / m.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
    sa("final-a3", "reflection", "Explain Newton's Third Law using the two-cart experiment.", [
      "equal",
      "opposite",
      "different objects",
    ], {
      correct: "Good. Your response identifies equal and opposite forces on different carts.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
    sa("final-a4", "reflection", "Why do action-reaction forces not cancel each other?", [
      "different objects",
      "same object",
    ], {
      correct: "Good. Cancellation requires forces on the same object.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
    sa("final-a5", "reflection", "Give one real-world example of each of Newton's three laws.", [
      "first",
      "second",
      "third",
    ], {
      correct: "Good. Your examples address all three laws.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
  ],
  calculus: [
    sa("final-c1", "reflection", "Describe Newton's First Law using the relationship between net force and dv/dt.", [
      "net force",
      "dv/dt",
      "zero",
    ], {
      correct: "Good. You connected zero net force to zero rate of change of velocity.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
    sa("final-c2", "reflection", "Use your data from Lab 2 to explain how force affects the time rate of change of velocity.", [
      "force",
      "dv/dt",
      "acceleration",
    ], {
      correct: "Good. Your response connects net force to m dv/dt.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
    sa("final-c3", "reflection", "Explain how the velocity-time and acceleration-time graphs are related.", [
      "slope",
      "integral",
      "acceleration",
    ], {
      correct: "Good. You identified derivative and integral relationships between v(t) and a(t).",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
    sa("final-c4", "reflection", "Explain Newton's Third Law using impulse and momentum.", [
      "impulse",
      "momentum",
      "equal",
    ], {
      correct: "Good. Equal and opposite impulses produce equal and opposite momentum changes.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
    sa("final-c5", "reflection", "Why can internal action-reaction forces cancel for a system but not for an individual object?", [
      "system",
      "individual",
      "internal",
    ], {
      correct: "Good. You distinguished the system force sum from forces on one object.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
    sa("final-c6", "reflection", "Give one real-world example of each law and describe the relevant differential or integral relationship.", [
      "first",
      "second",
      "third",
      "integral",
    ], {
      correct: "Good. Your examples connect the laws to rate or area relationships.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
  ],
};

export function questionsForMode(mode: CourseMode) {
  return [
    ...firstLawQuestions[mode],
    ...secondLawQuestions[mode],
    ...thirdLawQuestions[mode],
    ...finalReflectionQuestions[mode],
  ];
}
