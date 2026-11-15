import { NextRequest, NextResponse } from "next/server";
import { ai, CHAT_MODEL, generateEmbedding } from "@/lib/gemini";
import { searchSubjectChunks } from "@/lib/supabase";
import { getSubjectBySlug } from "@/data/subjects";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
}

async function getAvailableFlashModels(): Promise<string[]> {
  try {
    const pager = await ai.models.list();
    const models: string[] = [];
    for await (const m of pager) {
      const name = (m.name || "").replace("models/", "");
      const methods = m.supportedActions || [];
      if (
        name.includes("flash") &&
        !name.includes("tts") &&
        !name.includes("image") &&
        (methods.length === 0 || methods.includes("generateContent"))
      ) {
        models.push(name);
      }
    }
    console.log("[Chat API] Discovered available flash models:", models);
    return models;
  } catch (e) {
    console.warn("[Chat API] Failed to list models:", e);
    return [];
  }
}

async function generateWithFallback(prompt: string, systemInstruction: string) {
  // Build candidate list: primary CHAT_MODEL first, then any active flash models on your key
  const discovered = await getAvailableFlashModels();
  const candidates = Array.from(
    new Set([CHAT_MODEL, ...discovered, "gemini-2.5-flash-lite", "gemini-2.0-flash"])
  );

  let lastError: unknown;

  for (const model of candidates) {
    try {
      console.log(`[Chat API] Trying model: ${model}`);
      return await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        }),
        12000
      );
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : "";
      console.warn(`[Chat API] ${model} failed:`, msg);

      const shouldFallback =
        msg.includes("TIMEOUT") ||
        msg.includes("503") ||
        msg.includes("429") ||
        msg.includes("404") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("NOT_FOUND");

      if (!shouldFallback) throw err;
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const { message, subjectSlug, history = [] } = await req.json();

    if (!message || !subjectSlug) {
      return NextResponse.json(
        { error: "Message and subjectSlug are required." },
        { status: 400 }
      );
    }

    const subject = getSubjectBySlug(subjectSlug);
    const subjectTitle = subject ? subject.title : subjectSlug;

    console.log("[Chat API] 1. Generating embedding...");
    const queryEmbedding = await generateEmbedding(message);

    console.log("[Chat API] 2. Searching Supabase chunks...");
    const matchedChunks = await searchSubjectChunks(queryEmbedding, subjectSlug, 5, 0.4);

    const contextBlock =
      matchedChunks.length > 0
        ? matchedChunks
            .map(
              (c, idx) =>
                `[Source ${idx + 1}: ${c.file_name} (Similarity: ${(c.similarity * 100).toFixed(0)}%)]\n${c.content}`
            )
            .join("\n\n---\n\n")
        : "No uploaded lecture notes matched this query yet.";

    const systemInstruction = `You are Student Buddy 2.0, an expert university tutor for "${subjectTitle}".
Answer the student's question clearly, concisely, and accurately.
- Prioritize information from the PROVIDED COURSE NOTES below. When referencing them, cite the source filename inline (e.g., [lecture1.pdf]).
- If the notes do not contain the answer, clearly state that it wasn't found in their uploaded notes, and then provide an accurate foundational explanation for ${subjectTitle}.
- Use clean Markdown, bullet points, and code blocks where helpful.

PROVIDED COURSE NOTES:
${contextBlock}`;

    const formattedHistory = history
      .slice(-6)
      .map((h: { role: string; content: string }) => `${h.role === "user" ? "Student" : "Tutor"}: ${h.content}`)
      .join("\n");

    const prompt = formattedHistory
      ? `Previous conversation:\n${formattedHistory}\n\nStudent: ${message}`
      : message;

    console.log("[Chat API] 3. Generating response...");
    const response = await generateWithFallback(prompt, systemInstruction);

    const uniqueSources = Array.from(new Set(matchedChunks.map((c) => c.file_name)));

    return NextResponse.json({
      reply: response.text || "I could not generate a response.",
      sources: uniqueSources,
    });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    const rawMsg = err instanceof Error ? err.message : "";
    const friendlyMessage =
      rawMsg.includes("TIMEOUT") || rawMsg.includes("503") || rawMsg.includes("UNAVAILABLE")
        ? "All Gemini models are temporarily busy. Please try again in a few seconds."
        : rawMsg || "Failed to generate answer.";

    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}