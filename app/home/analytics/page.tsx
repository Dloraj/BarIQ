"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, Layers, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface SubjectMastery {
  name: string;
  masteryScore: number;
  mcqCount: number;
  essayCount: number;
}

interface Metrics {
  barReadiness: number;
  streak: number;
  totalMcqs: number;
  mcqAccuracy: number;
  totalEssays: number;
  averageEssayScore: number;
  totalFlashcards: number;
  dueFlashcards: number;
  srsCompletionRate: number;
  boxDistribution: {
    box1: number;
    box2: number;
    box3: number;
    box4: number;
    box5: number;
  };
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [subjects, setSubjects] = useState<SubjectMastery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");

  const fetchAnalytics = async (uid: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/analytics?userId=${uid}`);
      if (res.data.success) {
        setMetrics(res.data.metrics);
        setSubjects(res.data.subjectMastery);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
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
          if (parsed._id) {
            setUserId(parsed._id);
            fetchAnalytics(parsed._id);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Readiness Tracker</h1>
          <p className="text-gray-500 text-xs mt-1">
            Aggregated diagnostics showing subject masteries, MCQ accuracy, and flashcard retention.
          </p>
        </div>
        <button
          onClick={() => userId && fetchAnalytics(userId)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="text-xs text-gray-400">Computing diagnostics analytics...</span>
        </div>
      ) : !metrics ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <h3 className="text-sm font-bold text-gray-900">No Activity Logs Found</h3>
          <p className="text-xs text-gray-500">
            Start taking practice tests or swiping flashcards to build your diagnostic mastery heatmap.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Overall readiness & sub scores */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              {/* Readiness Circular gauge */}
              <div className="text-center space-y-3 py-4 border-b border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Overall Bar Readiness
                </span>
                <div className="relative inline-flex items-center justify-center">
                  {/* Gauge display */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="314"
                      strokeDashoffset={314 - (314 * metrics.barReadiness) / 100}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-slate-900">
                    {metrics.barReadiness}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 max-w-[200px] mx-auto leading-relaxed">
                  Composite score weighing MCQs (40%), Essays (40%), and active SRS retention (20%).
                </p>
              </div>

              {/* Sub-components stats details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">MCQ Accuracy Rate</span>
                  <span className="font-semibold text-gray-900">{metrics.mcqAccuracy}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Essay Average Grade</span>
                  <span className="font-semibold text-gray-900">{metrics.averageEssayScore}/100</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Flashcard Memorized Ratio</span>
                  <span className="font-semibold text-gray-900">{metrics.srsCompletionRate}%</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-gray-50 pt-3">
                  <span className="text-gray-500">Active Study Streak</span>
                  <span className="font-semibold text-orange-600">{metrics.streak} Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right/Center panel: Subject Mastery & Flashcards Box distribution */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Masteries card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span>Core Subject Mastery Heatmap</span>
              </h3>

              {subjects.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">
                  Take mock quizzes to map your topic-by-topic mastery levels.
                </p>
              ) : (
                <div className="space-y-4">
                  {subjects.map((sub) => (
                    <div key={sub.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span className="truncate max-w-[250px]">{sub.name}</span>
                        <span>{sub.masteryScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${sub.masteryScore}%` }}
                        />
                      </div>
                      <span className="block text-[10px] text-gray-400">
                        Evaluated from {sub.mcqCount} MCQs and {sub.essayCount} Essays
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Flashcard box distribution card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Leitner SRS Memorization progress</span>
              </h3>

              <div className="grid grid-cols-5 gap-3 pt-2 text-center">
                {[
                  { label: "Box 1", val: metrics.boxDistribution.box1, desc: "Daily" },
                  { label: "Box 2", val: metrics.boxDistribution.box2, desc: "3 Days" },
                  { label: "Box 3", val: metrics.boxDistribution.box3, desc: "7 Days" },
                  { label: "Box 4", val: metrics.boxDistribution.box4, desc: "14 Days" },
                  { label: "Box 5", val: metrics.boxDistribution.box5, desc: "30 Days" },
                ].map((b) => (
                  <div key={b.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] text-gray-400 font-bold block">{b.label}</span>
                    <span className="text-lg font-extrabold text-slate-900 block my-1">{b.val}</span>
                    <span className="text-[9px] text-slate-500">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
