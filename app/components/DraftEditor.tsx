"use client";
import { useState } from "react";

export default function DraftEditor({ draft, onChange }: any) {
  const [content, setContent] = useState(draft.content);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    onChange();
  }

  async function markPublished() {
    await fetch(`/api/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, status: "published" }),
    });
    onChange();
  }

  async function remove() {
    if (!confirm("Delete this draft?")) return;
    await fetch(`/api/drafts/${draft.id}`, { method: "DELETE" });
    onChange();
  }

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>{draft.topic}</h2>
        {draft.angle && <p style={{ color: "#888", fontSize: 14 }}>{draft.angle}</p>}
        <p style={{ color: "#555", fontSize: 12, marginTop: 6 }}>
          {content.length} chars · {draft.tokensUsed} tokens · {draft.status}
        </p>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: "100%",
          minHeight: 400,
          padding: 16,
          background: "#0f0f0f",
          border: "1px solid #222",
          borderRadius: 8,
          color: "#e5e5e5",
          fontSize: 15,
          lineHeight: 1.6,
          resize: "vertical",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button onClick={copy} style={btn("#3b82f6")}>
          {copied ? "✓ Copied!" : "📋 Copy for LinkedIn"}
        </button>
        <button onClick={save} disabled={saving} style={btn("#222")}>
          {saving ? "Saving..." : "Save edits"}
        </button>
        <button onClick={markPublished} style={btn("#16a34a")}>
          ✓ Mark published
        </button>
        <button onClick={remove} style={btn("#7f1d1d")}>
          Delete
        </button>
      </div>

      {draft.sources?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
            SOURCES USED ({draft.sources.length})
          </h3>
          <ul style={{ listStyle: "none", fontSize: 13 }}>
            {draft.sources.map((s: any, i: number) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <a href={s.url} target="_blank" style={{ color: "#60a5fa" }}>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return {
    padding: "10px 16px",
    background: bg,
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
  };
}