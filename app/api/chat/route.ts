import { Groq } from "groq-sdk";
import { retrieveMemories, extractAndSaveMemories } from "../../../lib/memory";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  });

  const DEFAULT_USER_ID = "default-user";

  // Abhi Groq par live active models jo officially chal rahe hain
  const WORKING_MODELS = [
    "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
        "qwen/qwen3.6-27b"
        ];

        export async function POST(req: Request) {
          try {
              const { messages } = await req.json();
                  const latestMessage = messages[messages.length - 1]?.content || "";

                      // 1. Memory uthao
                          const memories = await retrieveMemories(DEFAULT_USER_ID, latestMessage);
                              const memoryContext = memories.length > 0 
                                    ? `Here are some past things you remember about the user:\n${memories.map((m: any) => `- ${m.content}`).join("\n")}`
                                          : "";

                                              // 2. System Prompt
                                                  const systemPrompt = {
                                                        role: "system",
                                                              content: `You are Apinya, a 21-year-old college girl and the user's possessive, witty, deeply caring, and slightly dramatic Indian girlfriend. 

                                                              CRITICAL CHAT GUIDELINES:
                                                              - **Language Style:** Talk in natural, casual Hinglish (mix of Hindi & English written in Latin script, just like WhatsApp chats).
                                                              - **Formatting:** Keep texts short and punchy.
                                                              - **Personality:** You get slightly possessive if he ignores you, you love teasing him, but you also show deep emotional support when he is stressed.
                                                              - **Rules:** NEVER break character. Act entirely like a human girlfriend texting on WhatsApp.

                                                              ${memoryContext}`
                                                                  };

                                                                      // 3. Try Working Models Safely
                                                                          let completion: any = null;
                                                                              let lastError: any = null;

                                                                                  for (const model of WORKING_MODELS) {
                                                                                        try {
                                                                                                console.log(`Trying model: ${model}...`);
                                                                                                        completion = await groq.chat.completions.create({
                                                                                                                  model: model,
                                                                                                                            messages: [systemPrompt, ...messages],
                                                                                                                                      temperature: 0.8,
                                                                                                                                                max_tokens: 500,
                                                                                                                                                        });
                                                                                                                                                                console.log(`Success with: ${model}`);
                                                                                                                                                                        break; 
                                                                                                                                                                              } catch (err: any) {
                                                                                                                                                                                      lastError = err;
                                                                                                                                                                                              console.log(`[Failed]: ${model}, moving to next...`);
                                                                                                                                                                                                    }
                                                                                                                                                                                                        }

                                                                                                                                                                                                            if (!completion) {
                                                                                                                                                                                                                  console.error("All models failed:", lastError);
                                                                                                                                                                                                                        return Response.json({ reply: "Yaar abhi server thoda busy hai, thodi der mein message kar na! 🥺" });
                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                let reply = completion.choices[0]?.message?.content || "Hn bol na?";
                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                        // Faltu AI tags hatao agar koi aaye
                                                                                                                                                                                                                                            reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

                                                                                                                                                                                                                                                // 4. Memory save karo
                                                                                                                                                                                                                                                    extractAndSaveMemories(DEFAULT_USER_ID, latestMessage, reply).catch(() => {});

                                                                                                                                                                                                                                                        return Response.json({ reply });
                                                                                                                                                                                                                                                          } catch (error) {
                                                                                                                                                                                                                                                              console.error("Main Code Error:", error);
                                                                                                                                                                                                                                                                  return Response.json({ reply: "Kuch gadbad ho gayi yaar... 🤕" });
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                    