import { CheckCircle2, MessageSquareText, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LabQuestion, QuestionResponse } from "../types/labTypes";

interface QuestionCardProps {
  question: LabQuestion;
  response?: QuestionResponse;
  onSubmit: (response: QuestionResponse) => void;
}

function scoreShortAnswer(answer: string, keywords: string[] = []) {
  const normalized = answer.toLowerCase();
  const matches = keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;
  if (answer.trim().length < 8) {
    return "revisit";
  }
  if (keywords.length === 0) {
    return answer.trim().length >= 24 ? "correct" : "partial";
  }
  if (matches >= Math.min(2, keywords.length)) {
    return "correct";
  }
  if (matches >= 1 || answer.trim().length >= 40) {
    return "partial";
  }
  return "revisit";
}

export function QuestionCard({ question, response, onSubmit }: QuestionCardProps) {
  const [draft, setDraft] = useState(response?.answer ?? "");
  const hasSubmitted = Boolean(response);

  useEffect(() => {
    setDraft(response?.answer ?? "");
  }, [response?.answer, question.id]);

  const selectedOptionLabel = useMemo(
    () => question.options?.find((option) => option.id === draft)?.label ?? "",
    [draft, question.options],
  );

  const handleSubmit = () => {
    if (!draft.trim()) {
      return;
    }

    let result: "correct" | "partial" | "revisit";
    if (question.type === "multiple-choice") {
      result = draft === question.correctOptionId ? "correct" : "revisit";
    } else {
      result = scoreShortAnswer(draft, question.keywords);
    }

    onSubmit({
      questionId: question.id,
      answer: question.type === "multiple-choice" ? selectedOptionLabel : draft.trim(),
      isComplete: result !== "revisit",
      feedback: question.feedback[result],
      attempts: (response?.attempts ?? 0) + 1,
    });
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-md bg-amber-100 p-2 text-ember">
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-6 text-ink">{question.prompt}</p>

          {question.options ? (
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm leading-6 ${
                    draft === option.id ? "border-marine bg-teal-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={draft === option.id}
                    onChange={(event) => setDraft(event.target.value)}
                    className="mt-1 accent-marine"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              className="mt-3 w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-ink"
              placeholder="Enter your response"
            />
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-marine"
            >
              {hasSubmitted ? (
                <>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Revise Response
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Submit
                </>
              )}
            </button>
            {response?.isComplete && (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Complete
              </span>
            )}
          </div>

          {response && (
            <div
              className={`mt-3 rounded-md border p-3 text-sm leading-6 ${
                response.isComplete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {response.feedback}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
