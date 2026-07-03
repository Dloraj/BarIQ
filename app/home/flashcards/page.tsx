"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layers, AlertCircle, CheckCircle, RefreshCw, XCircle, ArrowRight } from "lucide-react";

interface FlashcardObj {
  _id: string;
  subject: string;
  front: string;
  back: string;
  sourceArticle?: string;
  box: number;
  nextReviewDate: string;
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<FlashcardObj[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  const fetchCards = async (uid: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/flashcards?userId=${uid}`);
      if (res.data.success) {
        setFlashcards(res.data.flashcards);
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
          if (parsed._id) {
            setUserId(parsed._id);
            fetchCards(parsed._id);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSrsReview = async (wasCorrect: boolean) => {
    if (flashcards.length === 0) return;
    const activeCard = flashcards[currentIndex];
    
    try {
      setFeedbackMsg(wasCorrect ? "Got it! Box upgraded." : "Wrong answer. Reset to Box 1.");
      // Send review data to update Leitner status
      await axios.post("/api/flashcards", {
        cardId: activeCard._id,
        wasCorrect,
      });

      // Simple delay to show toast feedback before shifting
      setTimeout(() => {
        setIsFlipped(false);
        setFeedbackMsg("");
        setCurrentIndex((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Failed to update flashcard SRS:", err);
      setFeedbackMsg("Error updating card.");
    }
  };

  const now = new Date();
  // Filter for due cards in the active session
  const dueCards = flashcards.filter((_, idx) => idx >= currentIndex && new Date(_.nextReviewDate) <= now);
  const activeCard = dueCards[0];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Spaced Repetition Review</h1>
          <p className="text-gray-500 text-xs mt-1">
            Drill key legal definitions and codal references. Ratings dictate future intervals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-500/10 text-blue-700 rounded-full border border-blue-500/20">
            Due Cards: {dueCards.length}
          </span>
          <button
            onClick={() => userId && fetchCards(userId)}
            className="p-2 border border-gray-200 hover:bg-gray-100 rounded-xl transition"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="text-xs text-gray-400">Loading your flashcards queue...</span>
        </div>
      ) : !activeCard ? (
        /* Empty/Finished Queue State */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 text-emerald-600">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Review Queue Completed!</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            All caught up! You have reviewed all cards currently scheduled. Check back tomorrow or add more flashcards from the Codals reader.
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              if (userId) fetchCards(userId);
            }}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition shadow"
          >
            <span>Restart Session</span>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Active flashcard simulator layout */
        <div className="max-w-xl mx-auto space-y-6">
          {/* Card visual wrapper */}
          <div
            onClick={handleFlip}
            className={`min-h-[300px] w-full bg-white rounded-3xl border border-gray-100 shadow-lg cursor-pointer p-8 flex flex-col justify-between transition-all duration-300 relative group hover:border-blue-500/50 ${
              isFlipped ? "ring-2 ring-blue-500/20 bg-slate-50/50" : ""
            }`}
          >
            {/* Top Bar inside card */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                {activeCard.subject}
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                Box {activeCard.box} / 5
              </span>
            </div>

            {/* Main card center content */}
            <div className="flex-1 flex items-center justify-center py-6 text-center">
              {!isFlipped ? (
                <p className="text-lg font-bold text-slate-800 leading-relaxed font-serif">
                  {activeCard.front}
                </p>
              ) : (
                <p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
                  {activeCard.back}
                </p>
              )}
            </div>

            {/* Bottom Bar inside card */}
            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>{activeCard.sourceArticle || "Syllabus definition"}</span>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-blue-500 transition-colors">
                {!isFlipped ? "Click to flip answer" : "Click to flip front"}
              </span>
            </div>
          </div>

          {/* Action rating buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSrsReview(false)}
              className="flex items-center justify-center gap-2 py-3 px-5 border border-red-200 hover:bg-red-50 text-red-700 rounded-xl text-xs font-bold transition duration-200 shadow-sm"
            >
              <XCircle className="w-4 h-4" />
              <span>Incorrect (Retry)</span>
            </button>
            <button
              onClick={() => handleSrsReview(true)}
              className="flex items-center justify-center gap-2 py-3 px-5 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold transition duration-200 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Correct (Easy)</span>
            </button>
          </div>

          {feedbackMsg && (
            <div className="bg-slate-900/90 text-white text-xs py-2 px-4 rounded-xl text-center shadow-lg font-semibold animate-pulse">
              {feedbackMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
