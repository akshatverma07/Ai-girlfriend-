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

    // 1. Memory uthao
    const userMemories = await retrieveMemories(DEFAULT_USER_ID, latestMessage);git add .
    git commit -m "fix retrieveMemories arguments"
    git push
    

    // 2. System prompt jismein AI ki identity aur memory di gayi hai
    const systemPrompt = `You are Apinya, a sharp, witty, and secure terminal AI assistant. 
You communicate like a hacker/terminal interface. 
Here is what you already know about the user from past interactions:
${userMemories.length > 0 ? userMemories.join("\n") : "No specific memories saved yet."}

Pay close attention to what the user tells you (like their name or preferences) so you can remember it.`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    let reply = "";
    let success = false;

    // 3. Models ke sath try karo response lene ka
    for (const model of WORKING_MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          model: model,
          messages: apiMessages,
          temperature: 0.7,
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
      reply = "Connection unstable. Secure stream interrupted.";
    }

    // 4. Nayi memory extract karke save karo background mein
    extractAndSaveMemories(DEFAULT_USER_ID, latestMessage, reply).catch(console.error);

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
