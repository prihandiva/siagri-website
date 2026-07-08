"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Users, Map, Sprout, Wheat, ShoppingCart,
  Gift, GraduationCap, FileBarChart, Settings, LogOut,
  ChevronDown, Leaf, UsersRound, ClipboardList,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    section: "UTAMA",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "MASTER DATA",
    items: [
      { href: "/master/wilayah", label: "Wilayah", icon: Map },
      { href: "/master/komoditas", label: "Komoditas", icon: Sprout },
      { href: "/master/petani", label: "Petani", icon: Users },
      { href: "/master/poktan", label: "Kelompok Tani", icon: UsersRound },
      { href: "/master/lahan", label: "Lahan", icon: Map },
    ],
  },
  {
    section: "TRANSAKSI",
    items: [
      { href: "/transaksi/budidaya", label: "Budidaya", icon: Leaf },
      { href: "/transaksi/produksi", label: "Produksi", icon: Wheat },
      { href: "/transaksi/pemasaran", label: "Pemasaran", icon: ShoppingCart },
      { href: "/transaksi/bantuan", label: "Bantuan", icon: Gift },
      { href: "/transaksi/pembiayaan", label: "Pembiayaan", icon: ClipboardList },
    ],
  },
  {
    section: "LAYANAN",
    items: [
      { href: "/master/penyuluh", label: "Penyuluh", icon: GraduationCap },
      { href: "/laporan/produksi", label: "Laporan", icon: FileBarChart },
    ],
  },
  {
    section: "SISTEM",
    items: [
      { href: "/pengaturan/pengguna", label: "Pengaturan", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar animate-slide-left">
      {/* Logo */}
      <Link href="/" className="sidebar-logo">
        <div
          style={{
            width: 36, height: 36,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Leaf size={20} strokeWidth={1.5} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">SIAGRI</span>
          <span className="sidebar-logo-subtitle">Sistem Informasi Agribisnis</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-item ${active ? "active" : ""}`}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon size={18} className="icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {session?.user?.name ? getInitials(session.user.name) : "?"}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {session?.user?.name ?? "Pengguna"}
          </div>
          <div className="sidebar-user-role">
            {(session?.user as any)?.roleName ?? "—"}
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.5)", padding: 4, borderRadius: 6,
            display: "flex", alignItems: "center",
            transition: "color 0.2s",
          }}
          title="Keluar"
          aria-label="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
