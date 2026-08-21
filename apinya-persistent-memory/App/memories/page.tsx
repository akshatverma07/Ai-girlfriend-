 "use client";

import { useEffect, useState } from "react";

type Memory = {
  id: string;
  content: string;
  memory_type: string;
  importance: number;
  confidence: number;
  created_at: string;
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/memories");
    const data = await res.json();
    setMemories(data.memories || []);
    setLoading(false);
  }

  async function remove(id: string) {
    await fetch("/api/memories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMemories((current) => current.filter((m) => m.id !== id));
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 20 }}>
      <h1>Apinya — Memory Center</h1>
      <p>These are the long-term memories Apinya has saved for this MVP.</p>
      {loading ? <p>Loading…</p> : memories.length === 0 ? (
        <p>No memories yet. Chat with Apinya and important preferences or goals may be saved.</p>
      ) : (
        memories.map((m) => (
          <article key={m.id} style={{
            border: "1px solid #ddd", borderRadius: 12, padding: 16,
            marginTop: 12
          }}>
            <strong>{m.memory_type}</strong>
            <p>{m.content}</p>
            <small>Confidence: {(m.confidence * 100).toFixed(0)}%</small>
            <br />
            <button onClick={() => remove(m.id)} style={{ marginTop: 10 }}>
              Forget this
            </button>
          </article>
        ))
      )}
    </main>
  );
}