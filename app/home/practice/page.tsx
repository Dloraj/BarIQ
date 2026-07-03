import Link from "next/link";
import { Award, FileText, CheckCircle2, ChevronRight, Scale } from "lucide-react";

export default function PracticeHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Mock Exam Center</h1>
        <p className="text-gray-500 text-xs mt-1">
          Prepare for the Philippine Bar Exam format with targeted Multiple Choice and Essay problems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        {/* MCQ practice sheet card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col justify-between group hover:border-amber-500/50 hover:shadow-md transition duration-200">
          <div>
            <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
              Multiple Choice Questions (MCQ)
            </h2>
            <p className="text-gray-500 text-xs mt-3 leading-relaxed">
              Drill single-concept legal problems covering core syllabus items. High-fidelity feedback with instant statutory citations and rationales.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Timed or untimed sessions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Covers Civil, Criminal, and special laws</span>
              </li>
            </ul>
          </div>
          <Link
            href="/home/practice/mcq"
            className="mt-8 w-full flex items-center justify-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
          >
            <span>Start MCQ Practice</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Essay practice workspace card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col justify-between group hover:border-indigo-500/50 hover:shadow-md transition duration-200">
          <div>
            <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              Essay Problems (ALAC Method)
            </h2>
            <p className="text-gray-500 text-xs mt-3 leading-relaxed">
              Write responses for past bar case scenarios using the strict ALAC structure. Submissions are graded instantly by our AI evaluating legal knowledge, application, and expression.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Simulated Examplify text editor</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Rubric scores and suggested improvements</span>
              </li>
            </ul>
          </div>
          <Link
            href="/home/practice/essay"
            className="mt-8 w-full flex items-center justify-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
          >
            <span>Start Essay Practice</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
