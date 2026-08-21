 "use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! 😊 I'm Apinya. I'm an AI companion, and I'm ready to chat with you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "I couldn't connect to the AI right now. Check your API setup and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="chat">
        <header>
          <div>
            <h1>Apinya</h1>
            <p>AI companion • Hinglish friendly</p>
          </div>
          <span className="status">● online</span>
        </header>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.content}
            </div>
          ))}
          {loading && <div className="message assistant">Thinking…</div>}
        </div>

        <div className="composer">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message…"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </section>
    </main>
  );
}