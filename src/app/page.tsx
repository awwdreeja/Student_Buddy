"use client";

import { useState } from "react";
import { Search, Sparkles, BookMarked, Trophy, Layers } from "lucide-react";
import { SUBJECTS } from "@/data/subjects";
import SubjectCard from "@/components/SubjectCard";

export default function DashboardPage() {
  const [search, setSearch] = useState("");

  const filteredSubjects = SUBJECTS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.modules.some((m) => m.toLowerCase().includes(search.toLowerCase()))
  );

  const avgProgress = Math.round(
    SUBJECTS.reduce((acc, s) => acc + s.progress, 0) / SUBJECTS.length
  );

  return (
    <div className="space-y-8">
      {/* Hero & Quick Filter */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-7 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI Study Workspace
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Welcome back to Student Buddy 2.0
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Select any of your 10 subjects to upload lecture PDFs, chat with your notes via RAG, or generate exam MCQs.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter subjects or syllabus topics..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950/90 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <BookMarked className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Active Courses</p>
            <p className="text-xl font-bold text-white">{SUBJECTS.length} Subjects</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Average Syllabus Mastery</p>
            <p className="text-xl font-bold text-white">{avgProgress}%</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Syllabus Modules</p>
            <p className="text-xl font-bold text-white">
              {SUBJECTS.reduce((acc, s) => acc + s.modules.length, 0)} Units
            </p>
          </div>
        </div>
      </div>

      {/* Subject Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Your Subjects</h2>
        {filteredSubjects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <SubjectCard key={subject.slug} subject={subject} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
            No subjects or modules matched &ldquo;{search}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}