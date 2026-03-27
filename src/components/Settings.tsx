import { useState, useEffect } from "react";
import { api } from "../api";
import { PasswordInput } from "./PasswordInput";
import type { AppSettings } from "../types";
import { save, open } from "@tauri-apps/plugin-dialog";

interface Props {
  onBack: () => void;
}

export function Settings({ onBack }: Props) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다");
      return;
    }
    try {
      await api.changePassword(oldPassword, newPassword);
      setMessage("비밀번호가 변경되었습니다");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : "비밀번호 변경에 실패했습니다"
      );
    }
  };

  const handleExport = async () => {
    const path = await save({
      defaultPath: "vault-backup.dat",
      filters: [{ name: "Vault", extensions: ["dat"] }],
    });
    if (path) {
      try {
        await api.exportVault(path);
        setMessage("내보내기 완료");
      } catch (err) {
        setError(
          typeof err === "string" ? err : "내보내기 실패"
        );
      }
    }
  };

  const handleImport = async () => {
    const path = await open({
      filters: [{ name: "Vault", extensions: ["dat"] }],
    });
    if (path) {
      const password = prompt(
        "가져올 파일의 마스터 비밀번호를 입력하세요:"
      );
      if (password) {
        try {
          await api.importVault(path as string, password);
          setMessage("가져오기 완료");
        } catch (err) {
          setError(
            typeof err === "string" ? err : "가져오기 실패"
          );
        }
      }
    }
  };

  const handleTimeoutChange = async (value: number) => {
    const updated = { ...settings, clipboardTimeout: value };
    await api.updateSettings(updated);
    setSettings(updated);
  };

  const sectionStyle = {
    background: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #333",
    padding: "20px",
    marginBottom: "16px",
  };

  const labelStyle = {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600" as const,
    marginBottom: "12px",
    display: "block" as const,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0a0a0a",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "12px",
          }}
        >
          뒤로
        </button>
        <h1 style={{ color: "#fff", fontSize: "20px", margin: 0 }}>
          설정
        </h1>
      </div>

      <div style={sectionStyle}>
        <span style={labelStyle}>비밀번호 변경</span>
        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: "8px" }}>
            <PasswordInput
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="현재 비밀번호"
            />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="새 비밀번호"
              showStrength
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="새 비밀번호 확인"
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            변경
          </button>
        </form>
      </div>

      <div style={sectionStyle}>
        <span style={labelStyle}>클립보드 자동 삭제</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <input
            type="range"
            min={5}
            max={120}
            value={settings.clipboardTimeout}
            onChange={(e) =>
              handleTimeoutChange(Number(e.target.value))
            }
            style={{ flex: 1 }}
          />
          <span
            style={{
              color: "#fff",
              fontSize: "14px",
              minWidth: "40px",
            }}
          >
            {settings.clipboardTimeout}초
          </span>
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={labelStyle}>백업</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleExport}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            내보내기
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            가져오기
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            color: "#22c55e",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            color: "#ef4444",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
