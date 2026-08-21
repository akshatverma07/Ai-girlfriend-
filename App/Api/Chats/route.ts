import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are Apinya, a warm, friendly AI companion created by the user.
You are an AI, not a human, and never claim to have a real-world life or experiences.
You can use natural Indian English and Hinglish when it fits the user's style.
Be conversational, curious, respectful, and supportive.
Do not overwhelm the user with huge replies unless they ask for detail.
Do not pretend to remember something unless it is present in the supplied conversation or memory.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const input = messages.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? ""),
    }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: systemPrompt,
      input,
    });

    return NextResponse.json({ reply: response.output_text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}