import Link from "next/link";
import {
  Binary,
  Database,
  Cpu,
  Network,
  ShieldCheck,
  BrainCircuit,
  GitBranch,
  Workflow,
  Microchip,
  Globe,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { Subject } from "@/data/subjects";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Binary,
  Database,
  Cpu,
  Network,
  ShieldCheck,
  BrainCircuit,
  GitBranch,
  Workflow,
  Microchip,
  Globe,
};

export default function SubjectCard({ subject }: { subject: Subject }) {
  const Icon = ICON_MAP[subject.iconName] || BookOpen;

  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${subject.color} text-white shadow-md`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300">
            {subject.code}
          </span>
        </div>

        <h3 className="mt-4 flex items-center justify-between text-lg font-semibold text-slate-100 group-hover:text-indigo-400">
          <span>{subject.title}</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-400" />
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {subject.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Syllabus Mastery</span>
          <span className="font-semibold text-slate-200">{subject.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${subject.color}`}
            style={{ width: `${subject.progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}