export type CourseMode = "algebra-trig" | "calculus";

export type LabStatus = "available" | "coming-soon";

export interface LabMetadata {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  topics: string[];
  status: LabStatus;
  estimatedTimeMinutes?: number;
  modes: CourseMode[];
}

export type QuestionType = "multiple-choice" | "short-answer" | "reflection" | "prediction";

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface LabQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  prompt: string;
  options?: ChoiceOption[];
  correctOptionId?: string;
  keywords?: string[];
  feedback: {
    correct: string;
    partial: string;
    revisit: string;
  };
}

export interface QuestionResponse {
  questionId: string;
  answer: string;
  isComplete: boolean;
  feedback: string;
  attempts: number;
}

export interface DataColumn<T> {
  key: keyof T;
  label: string;
  unit?: string;
  precision?: number;
}

export interface ProgressStep {
  id: string;
  title: string;
  status: "not-started" | "in-progress" | "complete";
}
