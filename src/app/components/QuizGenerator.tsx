"use client";

import { useState } from "react";
import { Brain, RotateCw, CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";

interface MCQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
}

export default function QuizGenerator({
  subjectSlug,
  modules,
}: {
  subjectSlug: string;
  modules: string[];
}) {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"mcqs" | "flashcards">("mcqs");
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  async function handleGenerate() {
    setLoading(true);
    setSelectedAnswers({});
    setFlippedCards({});

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectSlug, topic: selectedTopic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setMcqs(data.mcqs || []);
      setFlashcards(data.flashcards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Active Recall Studio</h3>
            <p className="text-xs text-slate-400">Generate structured MCQs & flashcards from notes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Syllabus Modules</option>
            {modules.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {mcqs.length > 0 ? "Regenerate" : "Generate Practice Set"}
          </button>
        </div>
      </div>

      {mcqs.length === 0 && !loading && (
        <div className="py-12 text-center text-sm text-slate-400">
          Click <span className="font-semibold text-indigo-400">Generate Practice Set</span> to test yourself on uploaded PDFs and syllabus topics.
        </div>
      )}

      {mcqs.length > 0 && (
        <div className="mt-4">
          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveTab("mcqs")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "mcqs"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              MCQs ({mcqs.length})
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "flashcards"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Flashcards ({flashcards.length})
            </button>
          </div>

          {/* MCQs Tab */}
          {activeTab === "mcqs" && (
            <div className="space-y-5">
              {mcqs.map((q, qIdx) => {
                const chosen = selectedAnswers[qIdx];
                const answered = chosen !== undefined;

                return (
                  <div key={qIdx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-sm font-medium text-slate-100">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctIndex;
                        const isChosen = oIdx === chosen;

                        let style = "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700";
                        if (answered) {
                          if (isCorrect) style = "border-emerald-500/60 bg-emerald-950/40 text-emerald-200";
                          else if (isChosen) style = "border-rose-500/60 bg-rose-950/40 text-rose-200";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={answered}
                            onClick={() => setSelectedAnswers((p) => ({ ...p, [qIdx]: oIdx }))}
                            className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs transition ${style}`}
                          >
                            <span>{opt}</span>
                            {answered && isCorrect && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
                            {answered && isChosen && !isCorrect && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <p className="mt-3 rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
                        <span className="font-semibold text-indigo-400">Explanation: </span>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === "flashcards" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {flashcards.map((card, idx) => {
                const isFlipped = !!flippedCards[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => setFlippedCards((p) => ({ ...p, [idx]: !p[idx] }))}
                    className="flex min-h-[160px] cursor-pointer flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-5 transition hover:border-indigo-500/50"
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
                      <span>{isFlipped ? "Answer" : "Concept"}</span>
                      <RotateCw className="h-3.5 w-3.5" />
                    </div>
                    <p className="my-3 text-sm font-medium text-slate-100">
                      {isFlipped ? card.back : card.front}
                    </p>
                    <span className="text-[11px] text-indigo-400">Click to flip</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}