import { Groq } from "groq-sdk";
import { retrieveMemories, extractAndSaveMemories } from "../../lib/memory";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  });

  const DEFAULT_USER_ID = "default-user";

  // Sabse reliable models ka list (Yeh hamesha chalte hain)
  const MODELS_TO_TRY = [
    "gemma2-9b-it",
      "llama3-70b-8192",
        "llama-3.1-70b-versatile",
          "mixtral-8x7b-32768"
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

                                                // 2. Apinya ka text persona (Sirf Chat, Koi Audio/Speech nahi)
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

                                                                        // 3. Smart Fallback: Ek model fail hua toh doosra try karega
                                                                            let completion: any = null;
                                                                                let lastError: any = null;

                                                                                    for (const model of MODELS_TO_TRY) {
                                                                                          try {
                                                                                                  completion = await groq.chat.completions.create({
                                                                                                            model: model,
                                                                                                                      messages: [systemPrompt, ...messages],
                                                                                                                                temperature: 0.8,
                                                                                                                                          max_tokens: 500,
                                                                                                                                                  });
                                                                                                                                                          break; // Jaise hi success mile, loop rok do
                                                                                                                                                                } catch (err: any) {
                                                                                                                                                                        lastError = err;
                                                                                                                                                                                console.log(`[Model Failed]: ${model}, trying next...`);
                                                                                                                                                                                      }
                                                                                                                                                                                          }

                                                                                                                                                                                              // Agar saare models fail ho jayein (Toh natural reply dega, error nahi)
                                                                                                                                                                                                  if (!completion) {
                                                                                                                                                                                                        console.error("All fallback models failed:", lastError);
                                                                                                                                                                                                              return Response.json({ reply: "Yaar mera network thoda issue kar raha hai, thodi der mein baat karu? 🥺" });
                                                                                                                                                                                                                  }

                                                                                                                                                                                                                      let reply = completion.choices[0]?.message?.content || "Hn bol na?";

                                                                                                                                                                                                                          // 4. Faltu AI tags hatao
                                                                                                                                                                                                                              reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

                                                                                                                                                                                                                                  // 5. Memory save karo (Background mein)
                                                                                                                                                                                                                                      extractAndSaveMemories(DEFAULT_USER_ID, latestMessage, reply).catch(() => {});

                                                                                                                                                                                                                                          return Response.json({ reply });
                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                console.error("Main Code Error:", error);
                                                                                                                                                                                                                                                    // Crash hone ke bajaye safe text bhejega
                                                                                                                                                                                                                                                        return Response.json({ reply: "Kuch gadbad ho gayi yaar, phir se bolna kya kaha? 🤕" });
                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                          }
