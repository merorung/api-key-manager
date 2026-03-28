import { useState } from "react";
import { api } from "../api";
import type { MaskedKeyEntry } from "../types";

interface Props {
  entry: MaskedKeyEntry | null;
  onClose: () => void;
}

export function KeyModal({ entry, onClose }: Props) {
  const isEdit = entry !== null;
  const [name, setName] = useState(entry?.name ?? "");
  const [key, setKey] = useState("");
  const [memo, setMemo] = useState(entry?.memo ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("이름을 입력하세요");
      return;
    }
    if (!isEdit && !key.trim()) {
      setError("API 키를 입력하세요");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.updateKey(
          entry.id,
          name !== entry.name ? name : undefined,
          key || undefined,
          memo !== (entry.memo ?? "") ? memo || null : undefined
        );
      } else {
        await api.addKey(name, key, memo || undefined);
      }
      onClose();
    } catch (err) {
      setError(
        typeof err === "string" ? err : "저장에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e1e2a",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "400px",
          border: "1px solid #3a3a4a",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontSize: "18px",
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          {isEdit ? "키 수정" : "키 추가"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 (예: OpenAI)"
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid #3a3a4a",
                borderRadius: "8px",
                background: "#121218",
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={
                isEdit ? "새 API 키 (변경 시에만)" : "API 키"
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid #3a3a4a",
                borderRadius: "8px",
                background: "#121218",
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택)"
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid #3a3a4a",
                borderRadius: "8px",
                background: "#121218",
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {error && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                background: "#2a2a3a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
