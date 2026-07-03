// components/auth/AuthTabs.tsx
"use client";

import { useState, useEffect } from "react";
import SignInForm from "@/components/auth/sign-in";
import SignUpForm from "@/components/auth/sign-up";
import { Scale } from "lucide-react";

type AuthTabType = "signin" | "signup";

interface AuthTabsProps {
  defaultTab?: AuthTabType;
  className?: string;
}

export default function AuthTabs({
  defaultTab = "signin",
  className = "",
}: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<AuthTabType>(defaultTab);

  // Sync state with standard custom events triggered internally (e.g. by success screens)
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent<AuthTabType>;
      if (customEvent.detail === "signin" || customEvent.detail === "signup") {
        setActiveTab(customEvent.detail);
      }
    };

    window.addEventListener("changeAuthTab", handleTabChange);
    return () => {
      window.removeEventListener("changeAuthTab", handleTabChange);
    };
  }, []);

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row bg-[#fafaf6] overflow-hidden ${className}`}>
      
      {/* Left Panel: Branding & Law Theme (Visible on md+) */}
      <div className={`relative hidden md:flex md:w-1/2 bg-slate-950 flex-col justify-between p-12 overflow-visible select-none z-20 transition-transform duration-700 ease-in-out transform ${
        activeTab === "signup"
          ? "md:translate-x-full border-l border-slate-900"
          : "md:translate-x-0 border-r border-slate-900"
      }`}>
          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
          
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          {/* Overlapping Leaf SVGs (Bleeding onto the right panel to mimic Snout Scouts layout) */}
          <div className={`absolute top-1/4 w-8 h-16 pointer-events-none z-30 hidden md:block text-amber-500 transition-all duration-700 ease-in-out transform ${
            activeTab === "signup"
              ? "left-[-16px] -scale-x-100"
              : "right-[-16px] scale-x-100"
          }`}>
            <svg className="w-full h-full drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]" viewBox="0 0 32 64" fill="currentColor">
              {/* Top leaf node */}
              <path d="M0 16 C16 16, 24 8, 32 0 C24 16, 16 20, 0 16 Z" />
              {/* Bottom leaf node */}
              <path d="M0 32 C16 32, 28 28, 24 48 C16 44, 8 40, 0 32 Z" />
            </svg>
          </div>
          <div className={`absolute bottom-1/4 w-6 h-12 pointer-events-none z-30 hidden md:block text-amber-600/80 transition-all duration-700 ease-in-out transform ${
            activeTab === "signup"
              ? "left-[-12px] -scale-x-100"
              : "right-[-12px] scale-x-100"
          }`}>
            <svg className="w-full h-full drop-shadow-[0_2px_4px_rgba(217,119,6,0.15)]" viewBox="0 0 24 48" fill="currentColor">
              <path d="M0 24 C12 24, 16 16, 24 32 C16 36, 12 32, 0 24 Z" />
            </svg>
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide leading-none">BarIQ</h2>
              <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold mt-1">PH Bar Prep</p>
            </div>
          </div>

          {/* Central illustration & slogan */}
          <div className="relative z-10 my-auto flex flex-col items-center text-center px-4">
            {/* CSS Animation Injector */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
              }
              @keyframes balance {
                0%, 100% { transform: rotate(-1.5deg); }
                50% { transform: rotate(1.5deg); }
              }
              @keyframes pan-left {
                0%, 100% { transform: rotate(1.5deg); }
                50% { transform: rotate(-1.5deg); }
              }
              @keyframes pan-right {
                0%, 100% { transform: rotate(1.5deg); }
                50% { transform: rotate(-1.5deg); }
              }
              @keyframes node-pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.3); opacity: 1; }
              }
              .animate-float {
                animation: float 6s ease-in-out infinite;
              }
              .animate-balance {
                animation: balance 6s ease-in-out infinite;
                transform-origin: 60px 42px;
              }
              .animate-pan-left {
                animation: pan-left 6s ease-in-out infinite;
                transform-origin: 30px 42px;
              }
              .animate-pan-right {
                animation: pan-right 6s ease-in-out infinite;
                transform-origin: 90px 42px;
              }
              .animate-node {
                animation: node-pulse 3s ease-in-out infinite;
                transform-origin: center;
              }
            `}} />

            {/* Custom Layered Vector Illustration Container */}
            <div className="mb-6 p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800/50 backdrop-blur-md shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <svg 
                className="w-48 h-48 text-amber-500/90 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-float" 
                viewBox="0 0 120 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 1. Neoclassical Temple Outline in Background */}
                <g opacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  {/* Roof Pediment */}
                  <polygon points="15,35 105,35 60,10" strokeLinejoin="round"/>
                  {/* Architrave Beam */}
                  <rect x="20" y="35" width="80" height="5" />
                  {/* Columns */}
                  <line x1="28" y1="40" x2="28" y2="90" />
                  <line x1="44" y1="40" x2="44" y2="90" />
                  <line x1="76" y1="40" x2="76" y2="90" />
                  <line x1="92" y1="40" x2="92" y2="90" />
                  {/* Steps */}
                  <rect x="15" y="90" width="90" height="5" />
                  <rect x="10" y="95" width="100" height="6" />
                </g>

                {/* 2. Stack of Law Books / Codals */}
                <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Bottom Book */}
                  <rect x="35" y="96" width="50" height="8" rx="1.5" fill="#0f172a" />
                  <line x1="40" y1="100" x2="75" y2="100" opacity="0.3" strokeWidth="1" />
                  
                  {/* Middle Book */}
                  <rect x="39" y="89" width="42" height="7" rx="1.2" fill="#1e293b" />
                  <line x1="44" y1="92.5" x2="72" y2="92.5" opacity="0.3" strokeWidth="1" />
                  
                  {/* Top Book */}
                  <rect x="43" y="83" width="34" height="6" rx="1" fill="#334155" />
                  <line x1="48" y1="86" x2="68" y2="86" opacity="0.3" strokeWidth="1" />
                </g>

                {/* 3. Scales of Justice centered on the books */}
                <g transform="translate(10, 10)">
                  {/* Base Stand & Neoclassical Pillar */}
                  <path d="M47 73H53V35H47V73Z" fill="#0f172a" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M36 73H64" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M50 30H50.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Balance Beam (Oscillates) */}
                  <g className="animate-balance">
                    <path d="M20 42H80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="50" cy="42" r="2" fill="currentColor"/>
                    
                    {/* Left Pan */}
                    <g className="animate-pan-left">
                      <path d="M20 42L12 62H28L20 42Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.25"/>
                      <path d="M10 62H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M12 62C12 68 15.5 71 20 71C24.5 71 28 68 28 62" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.08"/>
                    </g>

                    {/* Right Pan */}
                    <g className="animate-pan-right">
                      <path d="M80 42L72 62H88L80 42Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.25"/>
                      <path d="M70 62H90" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M72 62C72 68 75.5 71 80 71C84.5 71 88 68 88 62" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.08"/>
                    </g>
                  </g>
                </g>

                {/* 4. Glowing Digital Intelligence Nodes (representing IQ) */}
                <g className="animate-node" opacity="0.8">
                  {/* Connecting dashed lines */}
                  <path d="M22 25 L42 12 L78 12 L98 25" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2.5 2.5" />
                  
                  {/* Node points */}
                  <circle cx="22" cy="25" r="2.5" fill="#f59e0b" />
                  <circle cx="42" cy="12" r="2.5" fill="#f59e0b" />
                  <circle cx="78" cy="12" r="2.5" fill="#f59e0b" />
                  <circle cx="98" cy="25" r="2.5" fill="#f59e0b" />
                </g>
              </svg>
            </div>

            <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight mb-2">
              Elevate Your Bar Prep
            </h1>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed mb-4">
              Master the Philippine Bar Exam using digital codals, spaced repetition flashcards, and interactive mock exams.
            </p>

            {/* Trust Badges */}
            <div className="flex gap-2">
              <span className="text-[9px] font-semibold px-2.5 py-1 bg-slate-900 border border-slate-800 text-amber-500 rounded-full">
                Juris Doctor Standard
              </span>
              <span className="text-[9px] font-semibold px-2.5 py-1 bg-slate-900 border border-slate-800 text-amber-500 rounded-full">
                Spaced Repetition
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between text-[10px] text-slate-500">
            <span>© 2026 BarIQ. All rights reserved.</span>
            <span className="text-amber-500/60 font-medium">PH Legal Framework</span>
          </div>
        </div>

        {/* Right Panel: Authentication Forms (Cream-colored full screen panel) */}
        <div className={`flex-1 bg-[#fafaf6] flex flex-col justify-center p-8 md:p-12 overflow-y-auto relative z-10 transition-transform duration-700 ease-in-out transform ${
          activeTab === "signup" ? "md:-translate-x-full" : "md:translate-x-0"
        }`}>
          
          {/* Branding for Mobile (Hidden on Desktop) */}
          <div className="flex md:hidden items-center gap-3 mb-6">
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-amber-600">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">BarIQ</h1>
              <p className="text-[9px] text-amber-600 uppercase tracking-wider font-bold mt-1">PH Bar Prep</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md mx-auto relative z-10 transition-all duration-300 transform opacity-100 scale-100">
            {activeTab === "signin" ? <SignInForm /> : <SignUpForm />}
          </div>
        </div>
      </div>
  );
}

