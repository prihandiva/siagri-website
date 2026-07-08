"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const user = session?.user as any;
  const wilayah = [user?.namaDesa, user?.namaKecamatan, user?.namaKabupaten]
    .filter(Boolean)
    .join(", ");

  return (
    <header className="topbar">
      {/* Search */}
      <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
        <Search className="search-icon" />
        <input
          type="text"
          className="form-input"
          placeholder="Cari data petani, lahan, komoditas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="topbar-search"
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {/* Filter Wilayah Global */}
      <div style={{ marginLeft: "1rem" }}>
        <select 
          className="form-select" 
          style={{ 
            padding: "0.5rem 1rem", 
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-color)",
            backgroundColor: "white",
            fontSize: "0.875rem",
            color: "var(--gray-700)",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="">Semua Wilayah</option>
          {user?.namaDesa && <option value={user?.namaDesa}>{user?.namaDesa}</option>}
          {user?.namaKecamatan && <option value={user?.namaKecamatan}>{user?.namaKecamatan}</option>}
          {user?.namaKabupaten && <option value={user?.namaKabupaten}>{user?.namaKabupaten}</option>}
        </select>
      </div>

      <div style={{ flex: 1 }} />

      {/* Wilayah badge */}
      {wilayah && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            background: "#E8F5E9", borderRadius: "var(--radius-full)",
            padding: "0.375rem 0.875rem",
            fontSize: "0.75rem", fontWeight: 500, color: "#1B5E20",
          }}
        >
          <MapPin size={12} />
          <span>{wilayah}</span>
        </div>
      )}

      {/* Notification */}
      <button
        id="btn-notification"
        style={{
          position: "relative", background: "none", border: "none",
          cursor: "pointer", padding: "0.5rem",
          borderRadius: "var(--radius-md)", color: "var(--gray-500)",
          display: "flex", alignItems: "center",
          transition: "var(--transition)",
        }}
        aria-label="Notifikasi"
      >
        <Bell size={20} />
        <span
          style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8,
            background: "#EF4444", borderRadius: "50%",
            border: "2px solid white",
          }}
        />
      </button>

      {/* User info */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: "0.625rem",
          padding: "0.375rem 0.75rem",
          borderRadius: "var(--radius-md)",
          cursor: "pointer", transition: "var(--transition)",
          border: "1px solid var(--border-color)",
          background: "white",
        }}
        id="topbar-user"
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--primary-900)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: 600, color: "white",
            flexShrink: 0,
          }}
        >
          {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-900)" }}>
            {session?.user?.name ?? "Pengguna"}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--gray-500)", marginTop: 2 }}>
            {user?.roleName ?? "—"}
          </div>
        </div>
        <ChevronDown size={14} style={{ color: "var(--gray-400)" }} />
      </div>
    </header>
  );
}
