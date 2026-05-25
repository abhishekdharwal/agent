"use client";

export default function DraftList({ drafts, selected, onSelect }: any) {
  if (drafts.length === 0) {
    return <p style={{ color: "#555", fontSize: 14 }}>No drafts yet. Generate one above.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {drafts.map((d: any) => (
        <button
          key={d.id}
          onClick={() => onSelect(d)}
          style={{
            textAlign: "left",
            padding: 12,
            background: selected?.id === d.id ? "#1e293b" : "#141414",
            border: "1px solid #222",
            borderRadius: 6,
            color: "#e5e5e5",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            {d.topic}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {d.status} · {d.content.length} chars · {new Date(d.createdAt).toLocaleString()}
          </div>
        </button>
      ))}
    </div>
  );
}