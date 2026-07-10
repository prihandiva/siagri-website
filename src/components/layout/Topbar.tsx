"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, ChevronDown, MapPin, LogOut, Clock, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

// Daftar wilayah dummy (nanti bisa di-fetch dari API/DB)
const DESA_OPTIONS = [
  { value: "", label: "Semua Wilayah" },
  { value: "desa-makmur", label: "Desa Makmur" },
  { value: "desa-sejahtera", label: "Desa Sejahtera" },
  { value: "desa-maju", label: "Desa Maju" },
];

function useWaktuIndonesia() {
  const [waktu, setWaktu] = useState<string>("");
  const [tanggal, setTanggal] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tgl = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(now);
      const jam = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }).format(now);
      setTanggal(tgl);
      setWaktu(jam + " WIB");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return { waktu, tanggal };
}

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const [selectedDesa, setSelectedDesa] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { waktu, tanggal } = useWaktuIndonesia();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    toast.success("Berhasil keluar dari sistem.");
    await signOut({ callbackUrl: "/login" });
  };

  const user = session?.user as any;

  return (
    <header className="topbar">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100 text-gray-500"
      >
        <Menu size={20} />
      </button>

      {/* Filter Wilayah / Desa */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <MapPin size={15} style={{ color: "var(--primary-700)", flexShrink: 0 }} />
        <select
          id="topbar-filter-desa"
          value={selectedDesa}
          onChange={(e) => setSelectedDesa(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-full)",
            border: "1.5px solid var(--primary-200)",
            backgroundColor: "var(--primary-50)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--primary-800)",
            cursor: "pointer",
            outline: "none",
            minWidth: "160px",
          }}
        >
          {DESA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Timestamp Waktu Indonesia */}
      {tanggal && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "1px",
          }}
        >
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--gray-500)",
              fontWeight: 500,
            }}
          >
            {tanggal}
          </span>
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--gray-800)",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Clock size={13} style={{ color: "var(--primary-600)" }} />
            {waktu}
          </span>
        </div>
      )}

      {/* Separator */}
      <div style={{ width: 1, height: 28, background: "var(--border-color)", margin: "0 0.25rem" }} />

      {/* Notification */}
      <button
        id="btn-notification"
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem",
          borderRadius: "var(--radius-md)",
          color: "var(--gray-500)",
          display: "flex",
          alignItems: "center",
          transition: "var(--transition)",
        }}
        aria-label="Notifikasi"
      >
        <Bell size={20} />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            background: "#EF4444",
            borderRadius: "50%",
            border: "2px solid white",
          }}
        />
      </button>

      {/* User info & Dropdown */}
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.375rem 0.75rem",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "var(--transition)",
            border: "1px solid var(--border-color)",
            background: "white",
          }}
          id="topbar-user"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--primary-900)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "white",
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
          <ChevronDown
            size={14}
            style={{
              color: "var(--gray-400)",
              transform: isDropdownOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </div>

        {isDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              right: 0,
              width: "200px",
              background: "white",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "0.5rem",
              zIndex: 50,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#DC2626",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: "var(--radius-sm)",
                textAlign: "left",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#FEE2E2")}
              onMouseOut={(e) => (e.currentTarget.style.background = "none")}
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
