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
        border: "1px solid #333",
        borderRadius: "8px",
        background: "#1a1a1a",
        color: "#fff",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}
