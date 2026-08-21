import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// Hugging Face Free Embedding Function
async function getHuggingFaceEmbedding(text: string) {
  try {
      const response = await fetch(
            "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
                  {
                          method: "POST",
                                  headers: {
                                            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                                                      "Content-Type": "application/json",
                                                              },
                                                                      body: JSON.stringify({ inputs: text }),
                                                                            }
                                                                                );

                                                                                    const result = await response.json();
                                                                                        return result;
                                                                                          } catch (err) {
                                                                                              console.error("HF Embedding fetch error:", err);
                                                                                                  return null;
                                                                                                    }
                                                                                                    }

                                                                                                    export async function retrieveMemories(userId: string, query: string, limit = 5) {
                                                                                                      try {
                                                                                                          const embedding = await getHuggingFaceEmbedding(query);
                                                                                                              if (!Array.isArray(embedding)) {
                                                                                                                    console.error("HF Embedding error or invalid format:", embedding);
                                                                                                                          return [];
                                                                                                                              }

                                                                                                                                  const { data, error } = await supabase.rpc("match_memories", {
                                                                                                                                        query_embedding: embedding,
                                                                                                                                              match_user_id: userId,
                                                                                                                                                    match_threshold: 0.3,
                                                                                                                                                          match_count: limit,
                                                                                                                                                              });

                                                                                                                                                                  if (error) {
                                                                                                                                                                        console.error("Supabase RPC error:", error);
                                                                                                                                                                              return [];
                                                                                                                                                                                  }

                                                                                                                                                                                      return data || [];
                                                                                                                                                                                        } catch (err) {
                                                                                                                                                                                            console.error("Error retrieving memories:", err);
                                                                                                                                                                                                return [];
                                                                                                                                                                                                  }
                                                                                                                                                                                                  }

                                                                                                                                                                                                  // Added back to fix the export error in route.ts
                                                                                                                                                                                                  export async function extractAndSaveMemories(userId: string, userMessage: string, aiResponse: string) {
                                                                                                                                                                                                    try {
                                                                                                                                                                                                        const textToEmbed = `User: ${userMessage}\nAI: ${aiResponse}`;
                                                                                                                                                                                                            const embedding = await getHuggingFaceEmbedding(textToEmbed);
                                                                                                                                                                                                                
                                                                                                                                                                                                                    if (!Array.isArray(embedding)) {
                                                                                                                                                                                                                          console.error("Failed to generate embedding for saving memory");
                                                                                                                                                                                                                                return;
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                        const { error } = await supabase.from("memories").insert([
                                                                                                                                                                                                                                              {
                                                                                                                                                                                                                                                      user_id: userId,
                                                                                                                                                                                                                                                              content: textToEmbed,
                                                                                                                                                                                                                                                                      embedding: embedding,
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                ]);

                                                                                                                                                                                                                                                                                    if (error) {
                                                                                                                                                                                                                                                                                          console.error("Error saving memory to Supabase:", error);
                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                } catch (err) {
                                                                                                                                                                                                                                                                                                    console.error("Error in extractAndSaveMemories:", err);
                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                      