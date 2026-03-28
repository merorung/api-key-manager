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

  // Show recovery code after first setup
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
        <h1 style={{ color: "#fff", marginBottom: "8px", fontSize: "24px" }}>
          복구 코드
        </h1>
        <p
          style={{
            color: "#ef4444",
            marginBottom: "24px",
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "360px",
          }}
        >
          이 코드는 다시 볼 수 없습니다. 안전한 곳에 적어두세요.
          <br />
          비밀번호를 잊었을 때 이 코드로 복구할 수 있습니다.
        </p>
        <div
          style={{
            background: "#1e1e2a",
            border: "2px solid #2563eb",
            borderRadius: "12px",
            padding: "24px 32px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "24px",
              fontFamily: "monospace",
              letterSpacing: "3px",
              fontWeight: "bold",
            }}
          >
            {recoveryCode}
          </span>
        </div>
        <button
          onClick={onUnlocked}
          style={{
            padding: "12px 40px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#fff",
            background: "#2563eb",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          코드를 저장했습니다
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
      <h1 style={{ color: "#fff", marginBottom: "8px", fontSize: "24px" }}>
        Key Manager
      </h1>
      <p style={{ color: "#aaa", marginBottom: "32px", fontSize: "14px" }}>
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
          showToggle={isFirstRun}
        />
        {isFirstRun && (
          <>
            <div style={{ marginTop: "12px" }}>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="비밀번호 확인"
                showToggle
              />
            </div>
            {confirmPassword && (
              <div
                style={{
                  fontSize: "13px",
                  marginTop: "8px",
                  color: password === confirmPassword ? "#22c55e" : "#ef4444",
                }}
              >
                {password === confirmPassword
                  ? "비밀번호가 일치합니다"
                  : "비밀번호가 일치하지 않습니다"}
              </div>
            )}
            <div
              style={{
                fontSize: "13px",
                color: "#f0c040",
                marginTop: "14px",
                lineHeight: "1.6",
                background: "rgba(240, 192, 64, 0.08)",
                border: "1px solid rgba(240, 192, 64, 0.2)",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              비밀번호는 한 번 설정하면 복구 코드로만 변경할 수 있습니다.
              <br />
              설정 후 표시되는 복구 코드를 반드시 안전한 곳에 보관하세요.
            </div>
          </>
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
            cursor: loading || !password ? "not-allowed" : "pointer",
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
      {!isFirstRun && (
        <button
          onClick={() => setShowRecovery(true)}
          style={{
            marginTop: "16px",
            background: "none",
            border: "none",
            color: "#999",
            fontSize: "13px",
            cursor: "pointer",
            textDecoration: "underline",
          }}
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
