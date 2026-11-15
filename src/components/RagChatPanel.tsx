"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, FileCheck2, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function RagChatPanel({
  subjectSlug,
  subjectTitle,
}: {
  subjectSlug: string;
  subjectTitle: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm your **${subjectTitle}** AI Study Assistant. Upload your lecture PDFs on the left or ask me any concept question—I'll cite your notes automatically.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          subjectSlug,
          history: nextMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat request failed");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          sources: data.sources,
        },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-slate-800 bg-slate-900/70">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">RAG Study Assistant</h3>
            <p className="text-xs text-slate-400">Grounded in {subjectTitle} notes</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-800/80 text-slate-200"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-700/80 pt-2">
                  <span className="text-[11px] font-medium text-slate-400">Sources:</span>
                  {msg.sources.map((src, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-[11px] text-indigo-300"
                    >
                      <FileCheck2 className="h-3 w-3" />
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-200">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            <span>Searching vector index & synthesizing answer...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-slate-800 p-3.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about ${subjectTitle}...`}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}