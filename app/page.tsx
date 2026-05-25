"use client";
import { useEffect, useState } from "react";
import DraftList from "./components/DraftList";
import DraftEditor from "./components/DraftEditor";

export default function Dashboard() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [generating, setGenerating] = useState(false);

  async function refresh() {
    const res = await fetch("/api/drafts");
    setDrafts(await res.json());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, angle: angle || undefined }),
      });
      const draft = await res.json();
      setTopic("");
      setAngle("");
      await refresh();
      setSelected(draft);
    } catch (e) {
      alert("Generation failed. Check console.");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 380, borderRight: "1px solid #222", padding: 20, overflowY: "auto" }}>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>🧠 RN Blog Agent</h1>

        <div style={{ background: "#141414", padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, marginBottom: 12, color: "#888" }}>NEW POST</h2>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g. FlatList performance pitfalls)"
            style={{
              width: "100%", padding: 10, background: "#0a0a0a",
              border: "1px solid #333", color: "#e5e5e5", borderRadius: 6, marginBottom: 8,
            }}
          />
          <input
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            placeholder="Angle (optional)"
            style={{
              width: "100%", padding: 10, background: "#0a0a0a",
              border: "1px solid #333", color: "#e5e5e5", borderRadius: 6, marginBottom: 12,
            }}
          />
          <button
            onClick={generate}
            disabled={generating || !topic.trim()}
            style={{
              width: "100%", padding: 10, background: generating ? "#333" : "#3b82f6",
              color: "white", border: "none", borderRadius: 6, fontWeight: 600,
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? "Agent is researching & writing..." : "Generate draft"}
          </button>
        </div>

        <h2 style={{ fontSize: 14, marginBottom: 12, color: "#888" }}>
          DRAFTS ({drafts.length})
        </h2>
        <DraftList drafts={drafts} selected={selected} onSelect={setSelected} />
      </aside>

      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {selected ? (
          <DraftEditor key={selected.id} draft={selected} onChange={refresh} />
        ) : (
          <div style={{ color: "#555", textAlign: "center", marginTop: 120 }}>
            <p style={{ fontSize: 18 }}>Select a draft to review</p>
            <p style={{ marginTop: 8, fontSize: 14 }}>or generate a new one</p>
          </div>
        )}
      </main>
    </div>
  );
}