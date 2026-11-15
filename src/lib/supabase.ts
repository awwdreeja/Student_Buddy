import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MatchedChunk {
  id: string;
  file_name: string;
  content: string;
  similarity: number;
}

/**
 * Searches Supabase pgvector for chunks matching the query embedding within a subject.
 */
export async function searchSubjectChunks(
  queryEmbedding: number[],
  subjectSlug: string,
  matchCount = 5,
  matchThreshold = 0.45
): Promise<MatchedChunk[]> {
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_subject: subjectSlug,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error("Supabase vector search error:", error);
    throw new Error(error.message);
  }

  return (data as MatchedChunk[]) || [];
}