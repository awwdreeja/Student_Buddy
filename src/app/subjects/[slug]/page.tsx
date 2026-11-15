import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getSubjectBySlug, SUBJECTS } from "@/data/subjects";
import PdfUploader from "@/components/PdfUploader";
import RagChatPanel from "@/components/RagChatPanel";
import QuizGenerator from "@/components/QuizGenerator";

export function generateStaticParams() {
  return SUBJECTS.map((subject) => ({
    slug: subject.slug,
  }));
}

export default function SubjectWorkspacePage({
  params,
}: {
  params: { slug: string };
}) {
  const subject = getSubjectBySlug(params.slug);

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Subject Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <span className={`h-3.5 w-3.5 rounded-full ${subject.color}`} />
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{subject.title}</h1>
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              {subject.code}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">{subject.description}</p>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: PDF Uploader + Syllabus Modules */}
        <div className="space-y-6 lg:col-span-4">
          <PdfUploader subjectSlug={subject.slug} />

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Syllabus Modules
            </h3>
            <ul className="mt-3 space-y-2.5">
              {subject.modules.map((mod, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-950/60 px-3.5 py-2.5 text-xs text-slate-200"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>{mod}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: RAG Chat + Active Recall Quiz Studio */}
        <div className="space-y-6 lg:col-span-8">
          <RagChatPanel subjectSlug={subject.slug} subjectTitle={subject.title} />
          <QuizGenerator subjectSlug={subject.slug} modules={subject.modules} />
        </div>
      </div>
    </div>
  );
}