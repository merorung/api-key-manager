import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import type { MaskedKeyEntry } from "../types";
import { SearchBar } from "./SearchBar";
import { KeyCard } from "./KeyCard";
import { KeyModal } from "./KeyModal";

interface Props {
  onOpenSettings: () => void;
  onLock: () => void;
}

export function KeyList({ onOpenSettings, onLock }: Props) {
  const [keys, setKeys] = useState<MaskedKeyEntry[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MaskedKeyEntry | null>(
    null
  );

  const loadKeys = useCallback(async () => {
    const result = search
      ? await api.searchKeys(search)
      : await api.listKeys();
    setKeys(result);
  }, [search]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCopy = async (id: string) => {
    await api.copyKey(id);
  };

  const handleEdit = (entry: MaskedKeyEntry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await api.deleteKey(id);
    await loadKeys();
  };

  const handleAdd = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEntry(null);
    loadKeys();
  };

  const handleLock = async () => {
    await api.lock();
    onLock();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0a0a0a",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h1 style={{ color: "#fff", fontSize: "20px", margin: 0 }}>
          Key Manager
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onOpenSettings}
            style={{
              padding: "8px 12px",
              fontSize: "13px",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            설정
          </button>
          <button
            onClick={handleLock}
            style={{
              padding: "8px 12px",
              fontSize: "13px",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            잠금
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "600",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          +
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {keys.length === 0 ? (
          <div
            style={{
              color: "#666",
              textAlign: "center",
              marginTop: "40px",
            }}
          >
            {search ? "검색 결과가 없습니다" : "등록된 키가 없습니다"}
          </div>
        ) : (
          keys.map((entry) => (
            <KeyCard
              key={entry.id}
              entry={entry}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {modalOpen && (
        <KeyModal entry={editingEntry} onClose={handleModalClose} />
      )}
    </div>
  );
}
