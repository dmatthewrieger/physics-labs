import { CourseMode, LabQuestion } from "../../types/labTypes";

type QuestionSet = Record<CourseMode, LabQuestion[]>;

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

const algebraFeedback = {
  correct: "Good. Your response uses graph shape, slope, velocity, acceleration, or displacement evidence.",
  partial: "You are close. Add a specific connection to slope, area, velocity, acceleration, or displacement.",
  revisit: "Revisit the graph and data table, then use slope, velocity, acceleration, or displacement in your answer.",
};

const calculusFeedback = {
  correct: "Good. Your response connects the evidence to derivatives, integrals, slope, area, or rate of change.",
  partial: "You are close. Add the relevant derivative, integral, slope, or area relationship.",
  revisit: "Revisit the graphs and connect x(t), v(t), and a(t) through derivative or integral relationships.",
};

export const constantVelocityQuestions: QuestionSet = {
  "algebra-trig": [
    sa(
      "cv-a0",
      "constant-velocity",
      "Prediction: If velocity is constant and positive, what shape should the position-time graph have?",
      ["straight", "line", "slope"],
      {
        correct: "Good prediction. Constant positive velocity should make a straight position-time graph with positive slope.",
        partial: algebraFeedback.partial,
        revisit: algebraFeedback.revisit,
      },
      "prediction",
    ),
    mc(
      "cv-a1",
      "constant-velocity",
      "For constant velocity, what does the slope of the position-time graph represent?",
      "b",
      ["Acceleration", "Velocity", "Displacement only", "Elapsed time"],
      {
        correct: "Correct. The slope of a position-time graph gives velocity.",
        partial: algebraFeedback.partial,
        revisit: "Compare the position change to the elapsed time in your table.",
      },
    ),
    sa("cv-a2", "constant-velocity", "How does the velocity-time graph show constant velocity?", ["horizontal", "constant"], {
      correct: "Good. A horizontal velocity-time graph shows that velocity is not changing.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("cv-a3", "constant-velocity", "How can you determine displacement from the velocity-time graph?", ["area", "rectangle"], {
      correct: "Good. For constant velocity, the rectangular area under the velocity-time graph gives displacement.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
  ],
  calculus: [
    sa(
      "cv-c0",
      "constant-velocity",
      "Prediction: If v = dx/dt is constant and positive, what should x(t) look like?",
      ["linear", "slope", "constant"],
      {
        correct: "Good prediction. Constant positive dx/dt produces a linear x(t) graph with positive slope.",
        partial: calculusFeedback.partial,
        revisit: calculusFeedback.revisit,
      },
      "prediction",
    ),
    sa("cv-c1", "constant-velocity", "How is velocity related to x(t) in this trial?", ["derivative", "dx/dt", "slope"], {
      correct: "Good. Velocity is dx/dt, the slope of the position-time graph.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("cv-c2", "constant-velocity", "What is dv/dt when velocity is constant?", ["zero", "dv/dt"], {
      correct: "Good. Constant velocity means dv/dt = 0, so acceleration is zero.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("cv-c3", "constant-velocity", "How does the integral of velocity relate to displacement?", ["integral", "area", "displacement"], {
      correct: "Good. The integral of v(t) over time gives displacement.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
  ],
};

export const accelerationQuestions: QuestionSet = {
  "algebra-trig": [
    sa(
      "acc-a0",
      "acceleration",
      "Prediction: If acceleration is positive, what should happen to velocity each second?",
      ["increase", "velocity", "each second"],
      {
        correct: "Good prediction. Positive acceleration means velocity increases by the same amount each second.",
        partial: algebraFeedback.partial,
        revisit: algebraFeedback.revisit,
      },
      "prediction",
    ),
    mc(
      "acc-a1",
      "acceleration",
      "For constant acceleration, what shape does the velocity-time graph have?",
      "a",
      ["A straight line", "A horizontal line only", "A circle", "A random curve"],
      {
        correct: "Correct. Constant acceleration produces a linear velocity-time graph.",
        partial: algebraFeedback.partial,
        revisit: "Look at whether velocity changes by equal amounts in equal time intervals.",
      },
    ),
    sa("acc-a2", "acceleration", "What does the slope of the velocity-time graph represent?", ["acceleration", "slope"], {
      correct: "Good. The slope of v versus t is acceleration.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("acc-a3", "acceleration", "Why is the position-time graph curved when acceleration is not zero?", ["velocity", "changing", "slope"], {
      correct: "Good. The slope of x(t) is velocity, so a changing velocity makes the position graph curve.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
  ],
  calculus: [
    sa(
      "acc-c0",
      "acceleration",
      "Prediction: If a = dv/dt is positive and constant, how should v(t) change?",
      ["linear", "increase", "dv/dt"],
      {
        correct: "Good prediction. Constant positive dv/dt makes v(t) increase linearly.",
        partial: calculusFeedback.partial,
        revisit: calculusFeedback.revisit,
      },
      "prediction",
    ),
    sa("acc-c1", "acceleration", "How is acceleration related to v(t)?", ["derivative", "dv/dt", "slope"], {
      correct: "Good. Acceleration is dv/dt, the slope of the velocity-time graph.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("acc-c2", "acceleration", "How can you determine change in velocity from an acceleration-time graph?", ["integral", "area"], {
      correct: "Good. The area under a(t) gives Delta v.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("acc-c3", "acceleration", "Why does nonzero acceleration make x(t) nonlinear?", ["derivative", "velocity", "changing"], {
      correct: "Good. Since dx/dt = v(t), a changing v(t) creates a nonlinear x(t).",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
  ],
};

export const graphAnalysisQuestions: QuestionSet = {
  "algebra-trig": [
    sa(
      "graph-a0",
      "graph-analysis",
      "Prediction: If an object slows down while moving in the positive direction, what signs should velocity and acceleration have?",
      ["positive", "negative", "acceleration"],
      {
        correct: "Good prediction. Velocity is positive while acceleration is negative when the object slows down moving positive.",
        partial: algebraFeedback.partial,
        revisit: algebraFeedback.revisit,
      },
      "prediction",
    ),
    sa("graph-a1", "graph-analysis", "How can a graph show that an object turned around?", ["velocity", "zero", "sign"], {
      correct: "Good. A turn-around occurs when velocity passes through zero and changes sign.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
    sa("graph-a2", "graph-analysis", "How do you compare two motions using position-time graphs?", ["slope", "position", "time"], {
      correct: "Good. Compare slopes for velocity and positions at the same times.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }),
  ],
  calculus: [
    sa(
      "graph-c0",
      "graph-analysis",
      "Prediction: In a turn-around, what happens to v(t), and how is that visible in x(t)?",
      ["zero", "slope", "changes sign"],
      {
        correct: "Good prediction. v(t) reaches zero and changes sign; x(t) has a horizontal tangent at that instant.",
        partial: calculusFeedback.partial,
        revisit: calculusFeedback.revisit,
      },
      "prediction",
    ),
    sa("graph-c1", "graph-analysis", "How can a derivative identify the instant an object changes direction?", ["v(t)", "zero", "derivative"], {
      correct: "Good. The object changes direction when v(t) = dx/dt crosses zero.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
    sa("graph-c2", "graph-analysis", "How can integrals compare displacement in two different trials?", ["integral", "area", "velocity"], {
      correct: "Good. The integral of v(t) over each interval gives displacement for each trial.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }),
  ],
};

export const finalReflectionQuestions: QuestionSet = {
  "algebra-trig": [
    sa("kin-final-a1", "reflection", "Use evidence from the lab to explain the difference between position, velocity, and acceleration.", ["position", "velocity", "acceleration"], {
      correct: "Good. Your response distinguishes location, rate of position change, and rate of velocity change.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
    sa("kin-final-a2", "reflection", "How did slopes help you interpret the motion graphs?", ["slope", "position", "velocity"], {
      correct: "Good. Slopes connect position-time graphs to velocity and velocity-time graphs to acceleration.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
    sa("kin-final-a3", "reflection", "Give a real example of constant velocity and a real example of constant acceleration.", ["constant velocity", "acceleration"], {
      correct: "Good. Your examples identify two distinct motion types.",
      partial: algebraFeedback.partial,
      revisit: algebraFeedback.revisit,
    }, "reflection"),
  ],
  calculus: [
    sa("kin-final-c1", "reflection", "Use derivative relationships to explain the difference between x(t), v(t), and a(t).", ["dx/dt", "dv/dt", "derivative"], {
      correct: "Good. Your response connects velocity to dx/dt and acceleration to dv/dt.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
    sa("kin-final-c2", "reflection", "Use integral relationships to explain how displacement and change in velocity are found.", ["integral", "displacement", "velocity"], {
      correct: "Good. Your response connects integral of v(t) to displacement and integral of a(t) to Delta v.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
    sa("kin-final-c3", "reflection", "Describe a real motion that includes a turn-around and explain what happens to v(t).", ["zero", "changes sign", "turn"], {
      correct: "Good. A turn-around occurs when velocity reaches zero and changes sign.",
      partial: calculusFeedback.partial,
      revisit: calculusFeedback.revisit,
    }, "reflection"),
  ],
};

export function questionsForMode(mode: CourseMode) {
  return [
    ...constantVelocityQuestions[mode],
    ...accelerationQuestions[mode],
    ...graphAnalysisQuestions[mode],
    ...finalReflectionQuestions[mode],
  ];
}
