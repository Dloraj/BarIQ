"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  BookOpen,
  Layers,
  Award,
  Zap,
  TrendingUp,
  ArrowRight,
  Database,
  RefreshCw,
} from "lucide-react";

interface AnalyticsMetrics {
  barReadiness: number;
  streak: number;
  totalMcqs: number;
  mcqAccuracy: number;
  totalEssays: number;
  averageEssayScore: number;
  totalFlashcards: number;
  dueFlashcards: number;
  srsCompletionRate: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedMessage, setSeedMessage] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const fetchMetrics = async (uid: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/analytics?userId=${uid}`);
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error("Failed to load metrics:", err);
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
            fetchMetrics(parsed._id);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setSeedMessage("");
      const res = await axios.get("/api/seed");
      if (res.data.success) {
        setSeedMessage("Database populated with Civil Law codals, flashcards, & MCQs!");
        if (userId) fetchMetrics(userId);
      } else {
        setSeedMessage("Seeding completed with issues.");
      }
    } catch (err) {
      console.error(err);
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setSeedMessage("Error seeding database: " + (error.response?.data?.error || error.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-2xl border border-slate-800 shadow-lg text-white">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">BarIQ Practice Hub</h1>
          <p className="text-slate-400 mt-2 max-w-xl text-sm">
            Active recall, codals search, and AI-evaluated mock bar exams tailored for Philippine legal studies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow"
          >
            {seeding ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span>Seed Sample Laws</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="bg-emerald-50 text-emerald-800 text-sm py-3 px-4 rounded-xl border border-emerald-200 flex items-center justify-between">
          <span>{seedMessage}</span>
          <button onClick={() => setSeedMessage("")} className="font-bold hover:text-emerald-950">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="text-sm text-gray-500 font-medium">Loading study dashboard statistics...</p>
        </div>
      ) : (
        <>
          {/* Core Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bar Readiness</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                  {metrics?.barReadiness || 0}%
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
              <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-orange-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Study Streak</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                  {metrics?.streak || 0} Days
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Cards</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                  {metrics?.dueFlashcards || 0} / {metrics?.totalFlashcards || 0}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">MCQ Accuracy</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                  {metrics?.mcqAccuracy || 0}%
                </h2>
              </div>
            </div>
          </div>

          {/* Quick study pathways */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Codal card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between p-6 group hover:border-amber-500/50 transition-all">
              <div>
                <div className="bg-amber-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  Interactive Codals
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Browse Civil Code and Penal statutes. Annotate clauses and save highlights as study flashcards.
                </p>
              </div>
              <Link
                href="/home/codals"
                className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-600 group-hover:gap-3 transition-all"
              >
                <span>Browse Codals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Flashcard card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between p-6 group hover:border-blue-500/50 transition-all">
              <div>
                <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-5">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Spaced Repetition Cards
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Re-evaluate legal doctrines and definitions using Leitner card queues tailored to your memory rating.
                </p>
              </div>
              <Link
                href="/home/flashcards"
                className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:gap-3 transition-all"
              >
                <span>Swipe Cards</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mock Exams */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between p-6 group hover:border-indigo-500/50 transition-all">
              <div>
                <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Mock Bar Simulator
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Practice timed MCQs and write essay responses evaluated by AI under the standard Bar grading rubrics.
                </p>
              </div>
              <Link
                href="/home/practice"
                className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-600 group-hover:gap-3 transition-all"
              >
                <span>Take Mock Exam</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
