import { useState, useEffect } from "react";
import { api } from "../api";
import { PasswordInput } from "./PasswordInput";

interface Props {
  onUnlocked: () => void;
}

export function LockScreen({ onUnlocked }: Props) {
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.checkVaultExists().then((exists) => setIsFirstRun(!exists));
  }, []);

  if (isFirstRun === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isFirstRun) {
        if (password !== confirmPassword) {
          setError("비밀번호가 일치하지 않습니다");
          setLoading(false);
          return;
        }
        await api.setupVault(password);
      } else {
        await api.unlock(password);
      }
      onUnlocked();
    } catch (err) {
      setError(
        typeof err === "string" ? err : "잠금 해제에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0a0a",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: "8px", fontSize: "24px" }}>
        Key Manager
      </h1>
      <p
        style={{ color: "#888", marginBottom: "32px", fontSize: "14px" }}
      >
        {isFirstRun
          ? "마스터 비밀번호를 설정하세요"
          : "마스터 비밀번호를 입력하세요"}
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: "360px" }}
      >
        <PasswordInput
          value={password}
          onChange={setPassword}
          showStrength={isFirstRun}
        />
        {isFirstRun && (
          <div style={{ marginTop: "12px" }}>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="비밀번호 확인"
            />
          </div>
        )}
        {error && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "14px",
              marginTop: "12px",
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#fff",
            background: "#2563eb",
            border: "none",
            borderRadius: "8px",
            cursor:
              loading || !password ? "not-allowed" : "pointer",
            opacity: loading || !password ? 0.5 : 1,
          }}
        >
          {loading
            ? "처리 중..."
            : isFirstRun
              ? "설정 완료"
              : "잠금 해제"}
        </button>
      </form>
    </div>
  );
}
