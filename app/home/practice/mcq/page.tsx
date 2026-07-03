"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";

interface QuestionOption {
  text: string;
}

interface QuestionObj {
  _id: string;
  subject: string;
  topic?: string;
  type: string;
  scenario: string;
  options: QuestionOption[];
}

export default function MCQPracticePage() {
  const [questions, setQuestions] = useState<QuestionObj[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");

  // Grade state
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [legalBasis, setLegalBasis] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Timer
  const [seconds, setSeconds] = useState<number>(0);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/questions?type=MCQ");
      if (res.data.success) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed._id) setUserId(parsed._id);
        } catch (e) {
          // ignore
        }
      }
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (!submitted && !loading && questions.length > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [submitted, loading, currentIndex, questions]);

  const handleSubmit = async () => {
    if (!selectedOption || submitting) return;
    const currentQ = questions[currentIndex];

    try {
      setSubmitting(true);
      const res = await axios.post("/api/submit", {
        userId,
        questionId: currentQ._id,
        userAnswer: selectedOption,
        timeSpentSeconds: seconds,
      });

      if (res.data.success) {
        setIsCorrect(res.data.isCorrect);
        setCorrectAnswer(res.data.correctAnswer);
        setExplanation(res.data.explanation);
        setLegalBasis(res.data.legalBasis);
        setSubmitted(true);
      }
    } catch (err) {
      console.error("MCQ grading submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelectedOption("");
    setSubmitted(false);
    setCorrectAnswer("");
    setExplanation("");
    setLegalBasis("");
    setSeconds(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeQuestion = questions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Header with timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">MCQ Simulator</h1>
          <p className="text-gray-500 text-xs mt-1">
            Answer the situational problem below. Timer simulates bar pacing constraints.
          </p>
        </div>

        {!loading && activeQuestion && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-500">
              Q: {currentIndex + 1} of {questions.length}
            </span>
            <div className="bg-slate-900 text-amber-500 font-mono font-bold text-sm px-4 py-2 rounded-xl shadow-inner border border-slate-800">
              {formatTime(seconds)}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="text-xs text-gray-400">Loading MCQ problems database...</span>
        </div>
      ) : !activeQuestion ? (
        /* End / Empty state */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto gap-4">
          <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/20 text-amber-600">
            <HelpCircle className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Practice Set Completed!</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            All loaded questions have been evaluated. Head back to the dashboard to seed more or review your analytics.
          </p>
          <div className="flex gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition shadow"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setCurrentIndex(0);
                fetchQuestions();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              <span>Restart Quiz</span>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* MCQ Question Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Scenario and Options */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
              {/* Question metadata badge */}
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-500/10">
                  {activeQuestion.subject}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {activeQuestion.topic || "Case Scenario"}
                </span>
              </div>

              {/* Legal case scenario */}
              <p className="text-sm text-gray-800 leading-relaxed font-serif">
                {activeQuestion.scenario}
              </p>

              {/* List of answers */}
              <div className="space-y-3">
                {activeQuestion.options.map((opt) => (
                  <button
                    key={opt.text}
                    disabled={submitted}
                    onClick={() => setSelectedOption(opt.text)}
                    className={`w-full text-left p-4 rounded-xl text-xs font-medium border transition-all flex items-start justify-between ${
                      selectedOption === opt.text
                        ? "border-amber-500 bg-amber-500/5 text-slate-900"
                        : "border-gray-100 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{opt.text}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 ${
                        selectedOption === opt.text
                          ? "border-amber-500 bg-amber-500"
                          : "border-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Submit triggers */}
              {!submitted && (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption || submitting}
                  className="w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  {submitting ? "Grading answer..." : "Submit Answer"}
                </button>
              )}
            </div>
          </div>

          {/* Right panel: Evaluation Feedback & Rationales */}
          <div className="lg:col-span-1">
            {submitted ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-5 sticky top-24">
                {/* Correct/Incorrect Header status */}
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  {isCorrect ? (
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 text-red-600">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {isCorrect ? "Correct Choice" : "Incorrect Choice"}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                      Graded under PH Law
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 text-xs leading-relaxed text-gray-600">
                  {!isCorrect && (
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Your Selection:
                      </span>
                      <p className="p-3 bg-red-50 text-red-800 rounded-xl font-medium border border-red-100">
                        {selectedOption}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Correct Answer:
                    </span>
                    <p className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-medium border border-emerald-100">
                      {correctAnswer}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Statutory Basis:
                    </span>
                    <p className="font-semibold text-gray-800">{legalBasis}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-slate-300">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Legal Rationale:
                    </span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{explanation}</p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-slate-100/60 rounded-3xl border border-dashed border-slate-300 p-6 text-center text-gray-500 sticky top-24">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-400 mb-3" />
                <h4 className="text-xs font-bold text-slate-700">Practice Mode Active</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Make your selection and press submit. We will check it against the Civil Code or Penal statutes and display the detailed legal rationale.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
