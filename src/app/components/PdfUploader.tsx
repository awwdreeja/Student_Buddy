"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface PdfUploaderProps {
  subjectSlug: string;
  onUploadSuccess?: (fileName: string, chunks: number) => void;
}

export default function PdfUploader({ subjectSlug, onUploadSuccess }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; chunks: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (file.type !== "application/pdf") {
      setStatus("error");
      setFeedback("Please upload a valid PDF file.");
      return;
    }

    setStatus("uploading");
    setFeedback(`Parsing & embedding "${file.name}"...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subjectSlug", subjectSlug);

      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setStatus("success");
      setFeedback(`Indexed ${data.chunksStored} vector chunks from ${data.fileName}`);
      setUploadedFiles((prev) => [{ name: data.fileName, chunks: data.chunksStored }, ...prev]);
      onUploadSuccess?.(data.fileName, data.chunksStored);
    } catch (err: unknown) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to index PDF.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Knowledge Base (PDF Notes)
        </h3>
        <span className="text-xs text-indigo-400">pgvector RAG</span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileUpload(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />

        {status === "uploading" ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />
        ) : (
          <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
        )}

        <p className="mt-2 text-sm font-medium text-slate-200">
          Drop syllabus or lecture PDF here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Auto-chunked & embedded via Gemini text-embedding-004
        </p>
      </div>

      {status !== "idle" && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
            status === "uploading"
              ? "bg-indigo-950/60 text-indigo-300"
              : status === "success"
              ? "bg-emerald-950/60 text-emerald-300"
              : "bg-rose-950/60 text-rose-300"
          }`}
        >
          {status === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {status === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-slate-400">Indexed this session:</p>
          {uploadedFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-200"
            >
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{f.name}</span>
              </span>
              <span className="text-slate-400 shrink-0">{f.chunks} chunks</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}