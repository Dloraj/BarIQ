// components/auth/AuthTabs.tsx
"use client";

import { useState } from "react";
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

  const renderContent = () => {
    switch (activeTab) {
      case "signin":
        return <SignInForm />;
      case "signup":
        return <SignUpForm />;
      default:
        return <SignInForm />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4 ${className}`}
    >
      {/* Compact Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header with Logo */}
        <div className="text-center py-6 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">BarIQ</h1>
              <p className="text-xs text-blue-100">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "signin"
                  ? "text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "signup"
                  ? "text-green-600 bg-white border-b-2 border-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
