import { useState } from "react";
import { api } from "../api";
import { PasswordInput } from "./PasswordInput";

interface Props {
  onRecovered: () => void;
  onClose: () => void;
}

export function RecoveryModal({ onRecovered, onClose }: Props) {
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다");
      return;
    }

    setLoading(true);
    try {
      await api.recoverVault(recoveryCode.trim(), newPassword);
      onRecovered();
    } catch (err) {
      setError(
        typeof err === "string" ? err : "복구에 실패했습니다. 복구 코드를 확인하세요."
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
            marginBottom: "8px",
          }}
        >
          비밀번호 복구
        </h2>
        <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "20px" }}>
          설정 시 받은 복구 코드를 입력하세요
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "16px",
                fontFamily: "monospace",
                letterSpacing: "2px",
                border: "1px solid #3a3a4a",
                borderRadius: "8px",
                background: "#121218",
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="새 마스터 비밀번호"
              showStrength
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="새 비밀번호 확인"
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
              disabled={loading || !recoveryCode || !newPassword}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor:
                  loading || !recoveryCode || !newPassword
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  loading || !recoveryCode || !newPassword ? 0.5 : 1,
              }}
            >
              {loading ? "복구 중..." : "복구"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
