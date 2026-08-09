"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, ChevronDown, MapPin, LogOut, Clock, Menu, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useDashboardFilter, FilterType } from "@/context/DashboardFilterContext";

interface WilayahOption {
  id: string;
  label: string;
}

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
  const { filter, setFilter } = useDashboardFilter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { waktu, tanggal } = useWaktuIndonesia();

  // Wilayah dropdown state
  const [wilayahOptions, setWilayahOptions] = useState<WilayahOption[]>([]);
  const [dropdownType, setDropdownType] = useState<string>("");
  const [isLoadingWilayah, setIsLoadingWilayah] = useState(true);
  const [selectedWilayah, setSelectedWilayah] = useState<string>("");

  const user = session?.user as any;
  const role: string = user?.role ?? "";

  // ── Fetch wilayah options based on role ──
  useEffect(() => {
    if (!session) return;
    setIsLoadingWilayah(true);
    fetch("/api/dashboard/wilayah-options")
      .then((r) => r.json())
      .then((data) => {
        setDropdownType(data.dropdownType ?? "");
        setWilayahOptions(data.options ?? []);

        // Auto-select for Admin Desa (R005) — disabled dropdown
        if (role === "R005" && data.options?.length === 1) {
          const opt = data.options[0];
          setSelectedWilayah(opt.id);
          setFilter({ filterId: opt.id, filterType: "desa", filterLabel: opt.label });
        }
      })
      .catch(() => toast.error("Gagal memuat opsi wilayah"))
      .finally(() => setIsLoadingWilayah(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    toast.success("Berhasil keluar dari sistem.");
    await signOut({ callbackUrl: "/login" });
  };

  const handleWilayahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedWilayah(val);

    if (val === "") {
      // "Semua" option selected
      setFilter({ filterId: null, filterType: "nasional", filterLabel: "Semua Wilayah" });
    } else {
      const opt = wilayahOptions.find((o) => o.id === val);
      setFilter({
        filterId: val,
        filterType: dropdownType as FilterType,
        filterLabel: opt?.label ?? val,
      });
    }
  };

  // Label for the dropdown placeholder/all option
  const allLabel = (() => {
    switch (dropdownType) {
      case "provinsi":   return "Semua Provinsi";
      case "kabupaten":  return "Semua Kabupaten";
      case "kecamatan":  return "Semua Kecamatan";
      case "desa":       return "Semua Desa";
      default:           return "Semua Wilayah";
    }
  })();

  // Whether the dropdown should be disabled (Admin Desa or unknown role)
  const isDisabled = role === "R005" || wilayahOptions.length === 0;

  return (
    <header className="topbar">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100 text-gray-500"
      >
        <Menu size={20} />
      </button>

      {/* ── Filter Wilayah Dropdown ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {isLoadingWilayah ? (
          <Loader2 size={15} style={{ color: "var(--primary-700)", animation: "spin 1s linear infinite" }} />
        ) : (
          <MapPin size={15} style={{ color: "var(--primary-700)", flexShrink: 0 }} />
        )}
        <select
          id="topbar-filter-wilayah"
          value={selectedWilayah}
          onChange={handleWilayahChange}
          disabled={isDisabled || isLoadingWilayah}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-full)",
            border: "1.5px solid var(--primary-200)",
            backgroundColor: "var(--primary-50)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--primary-800)",
            cursor: isDisabled ? "not-allowed" : "pointer",
            outline: "none",
            minWidth: "180px",
            opacity: isDisabled ? 0.7 : 1,
          }}
        >
          {/* "Semua" option — hidden for Admin Desa */}
          {role !== "R005" && (
            <option value="">{allLabel}</option>
          )}
          {wilayahOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
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
