import OpenAI from "openai";
import { getSupabaseAdmin } from "./supabase";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CHAT_MODEL = process.env.OPENAI_MODEL || "your_chat_model_here";
const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

export type Memory = {
  id: string;
  content: string;
  memory_type: string;
  importance: number;
  confidence: number;
  similarity?: number;
};

export async function createEmbedding(text: string) {
  const result = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, " "),
  });

  return result.data[0].embedding;
}

export async function retrieveMemories(
  userId: string,
  query: string,
  limit = 6
): Promise<Memory[]> {
  const embedding = await createEmbedding(query);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("match_memories", {
    query_embedding: embedding,
    match_user_id: userId,
    match_threshold: 0.55,
    match_count: limit,
  });

  if (error) throw error;
  return (data || []) as Memory[];
}

export async function extractAndSaveMemories(
  userId: string,
  recentMessages: Array<{ role: string; content: string }>
) {
  const transcript = recentMessages
    .slice(-12)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const extraction = await openai.responses.create({
    model: CHAT_MODEL,
    instructions: `You are a memory extractor for an AI companion named Apinya.
Extract only durable facts explicitly stated by the user that could improve future conversations.
Do NOT infer facts. Do NOT save temporary moods, passwords, secrets, medical details, exact addresses,
financial account details, or other highly sensitive information.
Return ONLY valid JSON: {"memories":[{"content":"...","memory_type":"INTEREST|PREFERENCE|GOAL|HABIT|PERSONAL_HISTORY|CONTEXT","importance":0.0,"confidence":0.0}]}
If there is nothing worth remembering, return {"memories":[]}.`,
    input: transcript,
  });

  let parsed: any;
  try {
    parsed = JSON.parse(extraction.output_text);
  } catch {
    return;
  }

  const memories = Array.isArray(parsed?.memories) ? parsed.memories : [];
  const supabase = getSupabaseAdmin();

  for (const item of memories.slice(0, 5)) {
    if (
      typeof item.content !== "string" ||
      item.content.length < 8 ||
      item.content.length > 500
    ) continue;

    const importance = Math.max(0, Math.min(1, Number(item.importance) || 0));
    const confidence = Math.max(0, Math.min(1, Number(item.confidence) || 0));

    if (importance < 0.5 || confidence < 0.7) continue;

    const embedding = await createEmbedding(item.content);

    // Avoid obvious duplicates by semantic similarity.
    const { data: similar, error: searchError } = await supabase.rpc(
      "match_memories",
      {
        query_embedding: embedding,
        match_user_id: userId,
        match_threshold: 0.92,
        match_count: 1,
      }
    );

    if (searchError) throw searchError;
    if (similar?.length) continue;

    const { error } = await supabase.from("memories").insert({
      user_id: userId,
      content: item.content,
      memory_type: item.memory_type || "CONTEXT",
      importance,
      confidence,
      embedding,
    });

    if (error) throw error;
  }
}
