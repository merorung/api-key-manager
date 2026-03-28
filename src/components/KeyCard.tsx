import { useState } from "react";
import type { MaskedKeyEntry } from "../types";

interface Props {
  entry: MaskedKeyEntry;
  onCopy: (id: string) => void;
  onEdit: (entry: MaskedKeyEntry) => void;
  onDelete: (id: string) => void;
}

export function KeyCard({ entry, onCopy, onEdit, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(entry.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "#1e1e2a",
        borderRadius: "8px",
        border: "1px solid #3a3a4a",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}
        >
          {entry.name}
        </div>
        <div
          style={{
            color: "#999",
            fontSize: "13px",
            fontFamily: "monospace",
            marginTop: "4px",
          }}
        >
          {entry.maskedKey}
        </div>
        {entry.memo && (
          <div
            style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}
          >
            {entry.memo}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginLeft: "12px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleCopy}
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            background: copied ? "#22c55e" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {copied ? "복사됨" : "복사"}
        </button>
        <button
          onClick={() => onEdit(entry)}
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            background: "#2a2a3a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          편집
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            background: "#2a2a3a",
            color: "#ef4444",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
