import { useState, useEffect } from "react";
import { api } from "../api";
import type { PasswordValidation } from "../types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  placeholder?: string;
}

export function PasswordInput({
  value,
  onChange,
  showStrength = false,
  placeholder = "마스터 비밀번호",
}: Props) {
  const [validation, setValidation] = useState<PasswordValidation | null>(
    null
  );

  useEffect(() => {
    if (!showStrength || !value) {
      setValidation(null);
      return;
    }
    const timer = setTimeout(async () => {
      const result = await api.validatePassword(value);
      setValidation(result);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, showStrength]);

  const strengthColor =
    validation?.strength === "Strong"
      ? "#22c55e"
      : validation?.strength === "Medium"
        ? "#eab308"
        : "#ef4444";

  const strengthLabel =
    validation?.strength === "Strong"
      ? "강함"
      : validation?.strength === "Medium"
        ? "보통"
        : "약함";

  return (
    <div style={{ width: "100%" }}>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "16px",
          border: "1px solid #333",
          borderRadius: "8px",
          background: "#1a1a1a",
          color: "#fff",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {showStrength && validation && (
        <div style={{ marginTop: "8px" }}>
          <div
            style={{
              height: "4px",
              borderRadius: "2px",
              background: "#333",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width:
                  validation.strength === "Strong"
                    ? "100%"
                    : validation.strength === "Medium"
                      ? "66%"
                      : "33%",
                background: strengthColor,
                transition: "width 0.3s, background 0.3s",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "12px",
              color: strengthColor,
              marginTop: "4px",
              display: "block",
            }}
          >
            {strengthLabel}
          </span>
          {validation.errors.map((err, i) => (
            <div
              key={i}
              style={{ fontSize: "12px", color: "#ef4444", marginTop: "2px" }}
            >
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
