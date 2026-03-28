interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="검색..."
      style={{
        width: "100%",
        padding: "10px 16px",
        fontSize: "14px",
        border: "1px solid #3a3a4a",
        borderRadius: "8px",
        background: "#1e1e2a",
        color: "#fff",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}
