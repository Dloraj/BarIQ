"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, ArrowLeft, Award, CheckCircle2, ChevronRight, FileText, RefreshCw, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";

interface QuestionObj {
  _id: string;
  subject: string;
  topic?: string;
  type: string;
  scenario: string;
  suggestedAnswer?: string;
}

interface Scorecard {
  score: number;
  legalKnowledgeScore: number;
  applicationScore: number;
  logicPresentationScore: number;
  detailedCritique: string;
  suggestedImprovements: string;
}

export default function EssayPracticePage() {
  const [questions, setQuestions] = useState<QuestionObj[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [editorText, setEditorText] = useState<string>("");

  // ALAC Helper Sidebar Toggle & Inputs
  const [showAlacHelper, setShowAlacHelper] = useState<boolean>(false);
  const [alacAnswer, setAlacAnswer] = useState<string>("");
  const [alacBasis, setAlacBasis] = useState<string>("");
  const [alacApplication, setAlacApplication] = useState<string>("");
  const [alacConclusion, setAlacConclusion] = useState<string>("");

  // Timer
  const [seconds, setSeconds] = useState<number>(0);

  // Grade Results State
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [suggestedAnswer, setSuggestedAnswer] = useState<string>("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/questions?type=Essay");
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

  // Sync ALAC components to the editor text
  const applyAlacToEditor = () => {
    const formatted = `1. ANSWER:\n${alacAnswer}\n\n2. LEGAL BASIS:\n${alacBasis}\n\n3. APPLICATION:\n${alacApplication}\n\n4. CONCLUSION:\n${alacConclusion}`;
    setEditorText(formatted);
  };

  const handleSubmit = async () => {
    if (!editorText.trim() || submitting) return;
    const currentQ = questions[currentIndex];

    try {
      setSubmitting(true);
      const res = await axios.post("/api/submit", {
        userId,
        questionId: currentQ._id,
        userAnswer: editorText,
        timeSpentSeconds: seconds,
      });

      if (res.data.success) {
        setScorecard({
          score: res.data.score,
          legalKnowledgeScore: res.data.response.aiFeedback.legalKnowledgeScore,
          applicationScore: res.data.response.aiFeedback.applicationScore,
          logicPresentationScore: res.data.response.aiFeedback.logicPresentationScore,
          detailedCritique: res.data.response.aiFeedback.detailedCritique,
          suggestedImprovements: res.data.response.aiFeedback.suggestedImprovements,
        });
        setSuggestedAnswer(res.data.suggestedAnswer);
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Essay submission grading error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setEditorText("");
    setSubmitted(false);
    setScorecard(null);
    setSuggestedAnswer("");
    setAlacAnswer("");
    setAlacBasis("");
    setAlacApplication("");
    setAlacConclusion("");
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
      {/* Header and Timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/home/practice"
            className="p-2 border border-gray-200 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Essay Practice (ALAC)</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Draft your legal essay response. AI evaluates writing based on actual Bar rubrics.
            </p>
          </div>
        </div>

        {!loading && activeQuestion && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-500">
              Question {currentIndex + 1} of {questions.length}
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
          <span className="text-xs text-gray-400">Loading Essay case prompts...</span>
        </div>
      ) : !activeQuestion ? (
        /* End / Empty state */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto gap-4">
          <div className="bg-indigo-500/10 p-4 rounded-full border border-indigo-500/20 text-indigo-600">
            <FileText className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Essay Practice Completed!</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            You have responded to all mock essay scenarios in this module. Seed additional questions or check your Readiness Tracker stats.
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
              <span>Restart Essays</span>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Active Essay Simulator Layout */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left/Middle Workspace Column: Scenario, Editor, and ALAC guide */}
          <div className="xl:col-span-2 space-y-6">
            {/* Case problem statement card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-500/10">
                  {activeQuestion.subject}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {activeQuestion.topic || "Case Problem"}
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed font-serif">
                {activeQuestion.scenario}
              </p>
            </div>

            {/* Essay editor workspace */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Examplify-Simulated Workspace</span>
                </h3>
                {!submitted && (
                  <button
                    onClick={() => setShowAlacHelper(!showAlacHelper)}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-500/20 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{showAlacHelper ? "Hide ALAC Guide" : "Use ALAC Guide"}</span>
                  </button>
                )}
              </div>

              {/* ALAC sidebar helper inside workspace */}
              {showAlacHelper && !submitted && (
                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 space-y-3">
                  <h4 className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ALAC Draft Assistant</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Answer (Direct conclusion - Yes/No)
                      </label>
                      <input
                        type="text"
                        value={alacAnswer}
                        onChange={(e) => setAlacAnswer(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
                        placeholder="e.g. Yes, I would rule in favor of Betty..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Legal Basis (Article number or SC Case)
                      </label>
                      <input
                        type="text"
                        value={alacBasis}
                        onChange={(e) => setAlacBasis(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
                        placeholder="e.g. According to Article 1174 of the Civil Code..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Application (Apply rules to facts)
                      </label>
                      <textarea
                        rows={2}
                        value={alacApplication}
                        onChange={(e) => setAlacApplication(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
                        placeholder="e.g. In this case, the strike of truck drivers does not excuse Arthur..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Conclusion (Wrap up ruling summary)
                      </label>
                      <input
                        type="text"
                        value={alacConclusion}
                        onChange={(e) => setAlacConclusion(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
                        placeholder="e.g. Hence, Arthur remains liable for delay damages."
                      />
                    </div>
                  </div>

                  <button
                    onClick={applyAlacToEditor}
                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg transition"
                  >
                    Merge to Main Editor
                  </button>
                </div>
              )}

              {/* Textarea editor */}
              <textarea
                disabled={submitted}
                rows={12}
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-serif leading-relaxed"
                placeholder="Type your structured essay response here..."
              />

              {!submitted && (
                <button
                  onClick={handleSubmit}
                  disabled={!editorText.trim() || submitting}
                  className="w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  {submitting ? "Analyzing and grading essay..." : "Submit Essay for Grading"}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: AI scorecard evaluation */}
          <div className="xl:col-span-1">
            {submitted && scorecard ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6 sticky top-24 max-h-[80vh] overflow-y-auto">
                {/* Score badge header */}
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-600">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{scorecard.score}/100</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      AI Grader evaluation Score
                    </p>
                  </div>
                </div>

                {/* Score metrics breakdown */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                      <span>Legal Knowledge (40%)</span>
                      <span className="font-semibold text-gray-900">{scorecard.legalKnowledgeScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${scorecard.legalKnowledgeScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                      <span>Legal Application (35%)</span>
                      <span className="font-semibold text-gray-900">{scorecard.applicationScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full" style={{ width: `${scorecard.applicationScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                      <span>Logic & Expression (25%)</span>
                      <span className="font-semibold text-gray-900">{scorecard.logicPresentationScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${scorecard.logicPresentationScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Critique detail */}
                <div className="space-y-4 text-xs leading-relaxed text-gray-600">
                  <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-indigo-500">
                    <span className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                      Detailed Critique:
                    </span>
                    <p className="text-slate-700 mt-1 leading-relaxed">{scorecard.detailedCritique}</p>
                  </div>

                  <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                    <span className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Suggested Improvements:</span>
                    </span>
                    <p className="text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                      {scorecard.suggestedImprovements}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Suggested Model Answer:
                    </span>
                    <p className="p-4 bg-emerald-50 text-emerald-900 rounded-xl font-serif whitespace-pre-wrap border border-emerald-100">
                      {suggestedAnswer}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  <span>Next Essay Scenario</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-slate-100/60 rounded-3xl border border-dashed border-slate-300 p-6 text-center text-gray-500 sticky top-24">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-400 mb-3" />
                <h4 className="text-xs font-bold text-slate-700">AI Evaluation Ready</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Draft your response and select submit. We will check it against standard ALAC templates and return scoring graphs.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
