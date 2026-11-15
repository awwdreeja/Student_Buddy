import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { generateEmbedding } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

/**
 * Splits text into overlapping chunks for optimal RAG retrieval.
 */
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    chunks.push(cleaned.slice(start, end));
    if (end === cleaned.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subjectSlug = formData.get("subjectSlug") as string | null;

    if (!file || !subjectSlug) {
      return NextResponse.json(
        { error: "Both file and subjectSlug are required." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await pdf(buffer);
    const rawText = parsed.text;

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract readable text from this PDF." },
        { status: 400 }
      );
    }

    const chunks = chunkText(rawText);

    const rowsToInsert = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      rowsToInsert.push({
        subject_slug: subjectSlug,
        file_name: file.name,
        content: chunk,
        embedding,
      });
    }

    const { error } = await supabase.from("document_chunks").insert(rowsToInsert);

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      chunksStored: rowsToInsert.length,
    });
  } catch (err: unknown) {
    console.error("Ingest error:", err);
    const message = err instanceof Error ? err.message : "Failed to process PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}