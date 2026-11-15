import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in .env.local");
}

export const ai = new GoogleGenAI({ apiKey });

export const CHAT_MODEL = "gemini-3.8-flash";
export const EMBEDDING_MODEL = "gemini-embedding-001";

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  if (!response.embeddings?.[0]?.values) {
    throw new Error("Failed to generate embedding vector.");
  }

  return response.embeddings[0].values;
}