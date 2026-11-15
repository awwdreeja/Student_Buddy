import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { ai, CHAT_MODEL } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { getSubjectBySlug } from "@/data/subjects";

export async function POST(req: NextRequest) {
  try {
    const { subjectSlug, topic } = await req.json();

    if (!subjectSlug) {
      return NextResponse.json({ error: "subjectSlug is required." }, { status: 400 });
    }

    const subject = getSubjectBySlug(subjectSlug);
    const subjectTitle = subject ? subject.title : subjectSlug;

    // Fetch up to 6 recent chunks from uploaded notes for this subject
    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("content, file_name")
      .eq("subject_slug", subjectSlug)
      .limit(6);

    const notesContext =
      chunks && chunks.length > 0
        ? `Base the questions primarily on these student notes:\n${chunks.map((c) => c.content).join("\n---\n")}`
        : `Base the questions on standard university syllabus topics for ${subjectTitle}: ${subject?.modules.join(", ")}.`;

    const prompt = `Generate 4 challenging exam-style multiple-choice questions (MCQs) and 4 concise revision flashcards for "${subjectTitle}"${
      topic ? ` focusing on "${topic}"` : ""
    }.\n\n${notesContext}`;

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ["question", "options", "correctIndex", "explanation"],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ["front", "back"],
              },
            },
          },
          required: ["mcqs", "flashcards"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return NextResponse.json(parsedJson);
  } catch (err: unknown) {
    console.error("Quiz generation error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate quiz.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}