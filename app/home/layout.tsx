"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Award,
  BarChart3,
  LogOut,
  Scale,
  User as UserIcon,
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function SidebarLink({ href, icon, label, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        active
          ? "bg-amber-500/10 text-amber-500 border-l-4 border-amber-500"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Law Scholar");

  useEffect(() => {
    // Attempt to pull user name from localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.fullName) setUserName(parsed.fullName);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    router.push("/");
  };

  const navLinks = [
    { href: "/home", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { href: "/home/codals", icon: <BookOpen className="w-5 h-5" />, label: "Codal Library" },
    { href: "/home/flashcards", icon: <Layers className="w-5 h-5" />, label: "SRS Flashcards" },
    { href: "/home/practice", icon: <Award className="w-5 h-5" />, label: "Mock Exam Center" },
    { href: "/home/analytics", icon: <BarChart3 className="w-5 h-5" />, label: "Readiness Tracker" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-slate-950">
          <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <Scale className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">BarIQ</h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-wider font-semibold">PH Bar Prep</p>
          </div>
        </div>

        {/* Links Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={
                link.href === "/home"
                  ? pathname === "/home"
                  : pathname.startsWith(link.href)
              }
            />
          ))}
        </nav>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center border border-slate-700 text-amber-500 font-semibold uppercase">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{userName}</p>
              <p className="text-[11px] text-slate-500 truncate">JD Reviewee</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-slate-800 hover:border-red-500/30 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-700 rounded-full border border-amber-500/20">
              Bar Exam Review Module
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Philippine Legal Framework (Juris Doctor)</span>
          </div>
        </header>

        {/* Page Content Workspace */}
        <main className="flex-1 p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
