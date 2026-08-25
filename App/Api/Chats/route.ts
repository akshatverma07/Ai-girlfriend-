import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
      const { messages } = await req.json();

          const systemPrompt = {
                role: "system",
                      content: "You are Apinya, a sharp, witty, and secure terminal AI. Pay close attention if the user tells you their name, nickname, or any personal detail during the conversation, and remember it to make the experience real and personal."
                          };

                              const fullMessages = [systemPrompt, ...messages];

                                  // Yahan par aap apna real AI API call code daal sakte hain (jaise OpenAI ya Google Gemini SDK)
                                      
                                          const lastUserMsg = messages[messages.length - 1]?.content || "";
                                              const reply = `Received your transmission: "${lastUserMsg}". Memory stream updated, I am tracking our conversation.`;

                                                  return NextResponse.json({ reply });

                                                    } catch (error) {
                                                        console.error("API Error:", error);
                                                            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
                                                              }
                                                              }
                                                              