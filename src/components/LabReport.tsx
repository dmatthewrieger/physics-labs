import { ClipboardCopy, Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { LabQuestion, QuestionResponse } from "../types/labTypes";

interface ReportTable {
  title: string;
  rows: object[];
}

interface LabReportProps {
  labTitle: string;
  modeLabel: string;
  completedSections: string[];
  questions: LabQuestion[];
  responses: QuestionResponse[];
  tables: ReportTable[];
}

function buildReportText(
  studentName: string,
  labTitle: string,
  modeLabel: string,
  completedSections: string[],
  questions: LabQuestion[],
  responses: QuestionResponse[],
  tables: ReportTable[],
) {
  const responseMap = new Map(responses.map((response) => [response.questionId, response]));
  const lines = [
    labTitle,
    `Student: ${studentName || "Not entered"}`,
    `Course level: ${modeLabel}`,
    `Date: ${new Date().toLocaleDateString()}`,
    "",
    "Completed sections:",
    ...completedSections.map((section) => `- ${section}`),
    "",
    "Collected data:",
  ];

  tables.forEach((table) => {
    lines.push("", table.title);
    if (table.rows.length === 0) {
      lines.push("No rows collected.");
    } else {
      table.rows.forEach((row, index) => {
        lines.push(`${index + 1}. ${JSON.stringify(row)}`);
      });
    }
  });

  lines.push("", "Student responses:");
  questions.forEach((question) => {
    const response = responseMap.get(question.id);
    lines.push("", question.prompt, `Response: ${response?.answer ?? "Not answered"}`);
    if (response?.feedback) {
      lines.push(`Feedback: ${response.feedback}`);
    }
  });

  lines.push(
    "",
    "Conclusion scaffold:",
    `${studentName || "The student"} investigated Newton's Laws by comparing motion when net force was zero, measuring how acceleration changed with net force and mass, and analyzing equal-and-opposite interaction forces. The collected evidence supports the conclusion that net force changes motion, acceleration depends on both force and mass, and action-reaction forces act on different objects.`,
  );

  return lines.join("\n");
}

export function LabReport({
  labTitle,
  modeLabel,
  completedSections,
  questions,
  responses,
  tables,
}: LabReportProps) {
  const [studentName, setStudentName] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const reportText = useMemo(
    () => buildReportText(studentName, labTitle, modeLabel, completedSections, questions, responses, tables),
    [studentName, labTitle, modeLabel, completedSections, questions, responses, tables],
  );

  const download = (type: "txt" | "html") => {
    const body =
      type === "html"
        ? `<!doctype html><html><head><meta charset="utf-8"><title>${labTitle}</title></head><body><pre>${reportText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")}</pre></body></html>`
        : reportText;
    const blob = new Blob([body], { type: type === "html" ? "text/html" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newtons-laws-lab-report.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopyStatus("Copied");
    window.setTimeout(() => setCopyStatus(""), 1600);
  };

  return (
    <section className="space-y-5">
      <div className="lab-panel rounded-lg p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">Lab Report / Completion Summary</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {modeLabel} | {new Date().toLocaleDateString()}
            </p>
          </div>
          <label className="block min-w-[260px]">
            <span className="control-label">Student name</span>
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Enter name"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white hover:bg-marine"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print
        </button>
        <button
          type="button"
          onClick={() => download("txt")}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download Text
        </button>
        <button
          type="button"
          onClick={() => download("html")}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download HTML
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-marine hover:text-marine"
        >
          <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
          {copyStatus || "Copy Responses"}
        </button>
      </div>

      <pre className="lab-panel max-h-[720px] overflow-auto whitespace-pre-wrap rounded-lg p-5 text-sm leading-6 text-slate-800">
        {reportText}
      </pre>
    </section>
  );
}
