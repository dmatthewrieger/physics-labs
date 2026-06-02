import { CourseMode, LabQuestion } from "../../types/labTypes";

export interface ControlSpec {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface MetricValue {
  label: string;
  value: number;
  unit: string;
  precision?: number;
}

export interface ExperimentRow {
  step: number;
  label: string;
  x: number;
  y: number;
  secondary: number;
  tertiary: number;
}

export interface ExperimentResult {
  rows: ExperimentRow[];
  metrics: MetricValue[];
  graphTitle: string;
  xLabel: string;
  yLabel: string;
  yLineLabel: string;
  secondaryLineLabel?: string;
  tertiaryLineLabel?: string;
}

export interface ConfiguredInvestigation {
  id: string;
  title: string;
  eyebrow: string;
  purpose: string;
  procedure: string;
  diagramTitle: string;
  diagramCaption: string;
  controls: ControlSpec[];
  analysis: Record<CourseMode, string>;
  questions: Record<CourseMode, LabQuestion[]>;
  run: (values: Record<string, number>) => ExperimentResult;
}

export interface ConfiguredLab {
  id: string;
  title: string;
  introTitle: string;
  intro: string;
  objectives: Record<CourseMode, string[]>;
  investigations: ConfiguredInvestigation[];
  reflectionQuestions: Record<CourseMode, LabQuestion[]>;
  conclusionScaffold: string;
}
