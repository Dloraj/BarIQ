"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, BookOpen, Scale, Plus, AlertCircle, Sparkles } from "lucide-react";

interface CodalArticle {
  _id: string;
  subject: string;
  book?: string;
  title?: string;
  chapter?: string;
  articleNumber: string;
  content: string;
  notes?: string;
}

export default function CodalsPage() {
  const [codals, setCodals] = useState<CodalArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeSubject, setActiveSubject] = useState<string>("Civil Law");

  // Custom flashcard creation state
  const [showCardCreator, setShowCardCreator] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [cardBack, setCardBack] = useState<string>("");
  const [sourceRef, setSourceRef] = useState<string>("");
  const [creatorMsg, setCreatorMsg] = useState<string>("");
  const [creatorLoading, setCreatorLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  const fetchCodals = async (sub: string, query: string = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/codals?subject=${sub}&search=${query}`);
      if (res.data.success) {
        setCodals(res.data.codals);
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
    fetchCodals(activeSubject, search);
  }, [activeSubject]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCodals(activeSubject, search);
  };

  const handleTextSelection = () => {
    if (typeof window !== "undefined") {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";
      if (text.length > 3) {
        setSelectedText(text);
        setSourceRef(`Article, ${activeSubject}`);
        setShowCardCreator(true);
      }
    }
  };

  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setCreatorMsg("Please login to create flashcards.");
      return;
    }
    try {
      setCreatorLoading(true);
      setCreatorMsg("");
      const res = await axios.put("/api/flashcards", {
        userId,
        subject: activeSubject,
        front: selectedText,
        back: cardBack,
        sourceArticle: sourceRef,
      });
      if (res.data.success) {
        setCreatorMsg("Flashcard added to your Leitner queue!");
        setSelectedText("");
        setCardBack("");
        setTimeout(() => {
          setShowCardCreator(false);
          setCreatorMsg("");
        }, 2000);
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setCreatorMsg("Error saving card: " + (error.response?.data?.error || error.message));
    } finally {
      setCreatorLoading(false);
    }
  };

  const subjectsList = [
    "Civil Law",
    "Criminal Law",
    "Political and International Law",
    "Commercial and Taxation Laws",
    "Labor Law and Social Legislation",
    "Remedial Law & Legal Ethics",
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Codal & Jurisprudence Database</h1>
          <p className="text-gray-500 text-xs mt-1">
            Read codals, select text to auto-convert into flashcards, and search keywords.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Article No. or Keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Subject Picker */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">
            Core Subjects
          </p>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0">
            {subjectsList.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`whitespace-nowrap text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all w-full ${
                  activeSubject === sub
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Center/Right Panel: Codal Content & Split Creator */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* List of articles */}
          <div className="md:col-span-2 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 bg-white rounded-2xl border border-gray-100 p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                <span className="text-xs text-gray-400">Loading statutory texts...</span>
              </div>
            ) : codals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">No Codal Provisions Found</h3>
                <p className="text-xs text-gray-500">
                  Try seeding the database from the Dashboard page or perform a different search.
                </p>
              </div>
            ) : (
              <div className="space-y-4" onMouseUp={handleTextSelection}>
                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 mb-4 text-[11px] text-amber-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>
                    💡 **Pro Tip:** Highlight any portion of the codal text below with your mouse to instantly extract it into a custom flashcard.
                  </span>
                </div>
                {codals.map((art) => (
                  <div
                    key={art._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow transition"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3 border-b border-gray-50 pb-3">
                      <div>
                        <span className="text-xs font-bold text-amber-600">
                          Article {art.articleNumber}
                        </span>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                          {art.book || "General Provisions"}
                        </p>
                      </div>
                      <BookOpen className="w-4 h-4 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed font-serif">
                      {art.content}
                    </p>
                    {art.notes && (
                      <div className="mt-4 bg-slate-50 rounded-xl p-4 border-l-4 border-slate-300">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Commentary & Doctrines:
                        </span>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {art.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flashcard Side panel Creator */}
          <div className="md:col-span-1">
            {showCardCreator ? (
              <div className="bg-white rounded-2xl border border-amber-500/30 p-5 shadow-lg sticky top-24 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Create Flashcard</span>
                  </h3>
                  <button
                    onClick={() => setShowCardCreator(false)}
                    className="text-xs text-gray-400 hover:text-gray-900 font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateFlashcard} className="space-y-4">
                  {/* Front card prompt */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Front (Question / Prompt)
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={selectedText}
                      onChange={(e) => setSelectedText(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-serif"
                      placeholder="Enter front card details..."
                    />
                  </div>

                  {/* Back card answer */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Back (Definition / Answer / Law basis)
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={cardBack}
                      onChange={(e) => setCardBack(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-serif"
                      placeholder="Type the answer key or corresponding legal doctrines..."
                    />
                  </div>

                  {/* Source reference */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Source Reference
                    </label>
                    <input
                      type="text"
                      value={sourceRef}
                      onChange={(e) => setSourceRef(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      placeholder="e.g. Article 1156, Civil Code"
                    />
                  </div>

                  {creatorMsg && (
                    <p className={`text-[11px] font-medium text-center ${creatorMsg.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>
                      {creatorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={creatorLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{creatorLoading ? "Saving card..." : "Add to Leitner Deck"}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-100/60 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-gray-500 sticky top-24">
                <Scale className="w-8 h-8 mx-auto text-slate-400 mb-3" />
                <h4 className="text-xs font-bold text-slate-700">Active Recall Extractor</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Select text within any article to automatically draft custom flashcards for study sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
