import { useState, useEffect } from "react";
import { api } from "../api";
import { PasswordInput } from "./PasswordInput";
import { RecoveryModal } from "./RecoveryModal";

interface Props {
  onUnlocked: () => void;
}

export function LockScreen({ onUnlocked }: Props) {
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    api.checkVaultExists().then((exists) => setIsFirstRun(!exists));
  }, []);

  if (isFirstRun === null) return null;

  if (recoveryCode) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#121218",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "13px", color: "#ef4444", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: "16px" }}>
          중요
        </div>
        <h1 style={{ color: "#e8e8ee", marginBottom: "12px", fontSize: "22px", fontWeight: 600 }}>
          복구 코드를 저장하세요
        </h1>
        <p style={{ color: "#9a9aaa", marginBottom: "28px", fontSize: "14px", textAlign: "center", maxWidth: "340px", lineHeight: "1.6" }}>
          이 코드는 다시 볼 수 없습니다.
          <br />
          비밀번호를 잊었을 때 유일한 복구 수단입니다.
        </p>
        <div
          style={{
            background: "#1a1a24",
            border: "1px solid #2a2a3a",
            borderRadius: "10px",
            padding: "20px 28px",
            marginBottom: "28px",
          }}
        >
          <span style={{ color: "#e8e8ee", fontSize: "22px", fontFamily: "'Consolas', 'SF Mono', monospace", letterSpacing: "2px", fontWeight: 600 }}>
            {recoveryCode}
          </span>
        </div>
        <button
          onClick={onUnlocked}
          style={{
            padding: "13px 36px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#fff",
            background: "#2563eb",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          저장했습니다. 계속하기
        </button>
      </div>
    );
  }

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
        const code = await api.setupVaultWithRecovery(password);
        setRecoveryCode(code);
      } else {
        await api.unlock(password);
        onUnlocked();
      }
    } catch (err) {
      setError(
        typeof err === "string" ? err : "잠금 해제에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#121218",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ color: "#e8e8ee", marginBottom: "6px", fontSize: "22px", fontWeight: 600 }}>
          Key Manager
        </h1>
        <p style={{ color: "#8888a0", fontSize: "14px" }}>
          {isFirstRun
            ? "마스터 비밀번호를 설정하세요"
            : "마스터 비밀번호를 입력하세요"}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: "340px" }}
      >
        {/* Password fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <PasswordInput
            value={password}
            onChange={setPassword}
            showStrength={isFirstRun}
            showToggle={isFirstRun}
          />
          {isFirstRun && (
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="비밀번호 확인"
              showToggle
            />
          )}
        </div>

        {/* Match indicator */}
        {passwordsMatch && (
          <div style={{ fontSize: "13px", marginTop: "8px", color: "#22c55e" }}>
            비밀번호가 일치합니다
          </div>
        )}
        {passwordsMismatch && (
          <div style={{ fontSize: "13px", marginTop: "8px", color: "#ef4444" }}>
            비밀번호가 일치하지 않습니다
          </div>
        )}

        {/* Notice */}
        {isFirstRun && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              background: "rgba(59, 130, 246, 0.06)",
              borderRadius: "6px",
            }}
          >
            <p style={{ fontSize: "13px", color: "#c8c8d8", lineHeight: "1.7", margin: 0 }}>
              비밀번호 변경은 <span style={{ color: "#e8e8ee", fontWeight: 500 }}>복구 코드로만</span> 가능합니다. 다음 화면에서 제공되는 복구 코드를 꼭 보관하세요.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "12px" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "20px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#fff",
            background: "#2563eb",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !password ? "not-allowed" : "pointer",
            opacity: loading || !password ? 0.4 : 1,
            transition: "opacity 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => { if (!loading && password) e.currentTarget.style.background = "#1d4ed8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; }}
        >
          {loading
            ? "처리 중..."
            : isFirstRun
              ? "설정 완료"
              : "잠금 해제"}
        </button>
      </form>

      {/* Recovery link */}
      {!isFirstRun && (
        <button
          onClick={() => setShowRecovery(true)}
          style={{
            marginTop: "16px",
            background: "none",
            border: "none",
            color: "#6a6a80",
            fontSize: "13px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#9a9ab0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6a6a80")}
        >
          비밀번호를 잊으셨나요?
        </button>
      )}
      {showRecovery && (
        <RecoveryModal
          onRecovered={onUnlocked}
          onClose={() => setShowRecovery(false)}
        />
      )}
    </div>
  );
}
