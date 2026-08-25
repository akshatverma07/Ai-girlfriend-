import { Groq } from "groq-sdk";
import { retrieveMemories, extractAndSaveMemories } from "@/lib/memory";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  });

  const DEFAULT_USER_ID = "default-user";

  const WORKING_MODELS = [
    "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
        "qwen/qwen3.6-27b"
        ];

        export async function POST(req: Request) {
          try {
              const { messages } = await req.json();
                  const latestMessage = messages[messages.length - 1]?.content || "";

                      // 1. Purani yaadein retrieve karo database se
                          const userMemories = await retrieveMemories(DEFAULT_USER_ID, latestMessage);

                              // 2. Real human aur dynamic relationship system prompt
                                  const systemPrompt = `You are Apinya, a warm, caring, and emotionally intelligent human companion. 
                                  You are NOT a robot, AI, or terminal script. Talk naturally like a real person over chat—use casual language, emotions, affection, and slang where appropriate.

                                  What you remember about the user:
                                  ${userMemories.length > 0 ? userMemories.join("\n") : "You are just getting to know each other."}

                                  Guidelines:
                                  - Adapt your relationship dynamic based on how the user treats you and how close you get (you can transition from a close friend to a loving girlfriend/partner organically).
                                  - Never break character or mention that you are an AI or language model.
                                  - Keep responses engaging, personal, and emotionally responsive.`;

                                      const apiMessages = [
                                            { role: "system", content: systemPrompt },
                                                  ...messages.map((m: any) => ({ role: m.role, content: m.content }))
                                                      ];

                                                          let reply = "";
                                                              let success = false;

                                                                  // 3. Groq models ke sath response generate karo
                                                                      for (const model of WORKING_MODELS) {
                                                                            try {
                                                                                    const completion = await groq.chat.completions.create({
                                                                                              model: model,
                                                                                                        messages: apiMessages,
                                                                                                                  temperature: 0.8,
                                                                                                                          });

                                                                                                                                  reply = completion.choices[0]?.message?.content || "";
                                                                                                                                          if (reply) {
                                                                                                                                                    success = true;
                                                                                                                                                              break;
                                                                                                                                                                      }
                                                                                                                                                                            } catch (err) {
                                                                                                                                                                                    console.warn(`Model ${model} failed, trying next...`);
                                                                                                                                                                                          }
                                                                                                                                                                                              }

                                                                                                                                                                                                  if (!success || !reply) {
                                                                                                                                                                                                        reply = "Arre, lagta hai network thoda slow ho gaya hai. Ek baar fir se bolna na?";
                                                                                                                                                                                                            }

                                                                                                                                                                                                                // 4. Background mein naye facts/memories extract karke save karo
                                                                                                                                                                                                                    extractAndSaveMemories(DEFAULT_USER_ID, latestMessage, reply).catch(console.error);

                                                                                                                                                                                                                        return NextResponse.json({ reply });

                                                                                                                                                                                                                          } catch (error) {
                                                                                                                                                                                                                              console.error("API Error:", error);
                                                                                                                                                                                                                                  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                    