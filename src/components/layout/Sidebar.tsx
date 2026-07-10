"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Users, Map, Sprout, Wheat, ShoppingCart,
  Gift, GraduationCap, FileBarChart, Settings, LogOut,
  ChevronDown, Leaf, UsersRound, ClipboardList, MapPin,
  Building2, UserCog, Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// ─── Type Definitions ───────────────────────────────────────
type MenuItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type MenuGroup =
  | {
      type: "item";
      href: string;
      label: string;
      icon: React.ElementType;
    }
  | {
      type: "group";
      label: string;
      icon: React.ElementType;
      key: string;
      children: MenuItem[];
    };

type MenuSection = {
  section: string;
  items: MenuGroup[];
};

// ─── Menu Structure ──────────────────────────────────────────
const menuSections: MenuSection[] = [
  {
    section: "UTAMA",
    items: [
      { type: "item", href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "MASTER DATA",
    items: [
      {
        type: "group",
        key: "wilayah",
        label: "Wilayah",
        icon: MapPin,
        children: [
          { href: "/master/provinsi",  label: "Provinsi",         icon: Map },
          { href: "/master/kabupaten", label: "Kabupaten / Kota", icon: Building2 },
          { href: "/master/kecamatan", label: "Kecamatan",        icon: Map },
          { href: "/master/desa",      label: "Desa / Kelurahan", icon: Map },
          { href: "/master/dusun",     label: "Dusun",            icon: Map },
          { href: "/master/rw",        label: "RW",               icon: Map },
          { href: "/master/rt",        label: "RT",               icon: Map },
        ],
      },
      { type: "item", href: "/master/komoditas", label: "Komoditas",    icon: Sprout },
      {
        type: "group",
        key: "kelompok-tani",
        label: "Kelompok Tani",
        icon: UsersRound,
        children: [
          { href: "/master/gapoktan", label: "Gapoktan",      icon: UsersRound },
          { href: "/master/poktan",   label: "Poktan",         icon: UsersRound },
        ],
      },
      { type: "item", href: "/master/petani",    label: "Petani",        icon: Users },
      { type: "item", href: "/master/lahan",     label: "Lahan",         icon: Map },
    ],
  },
  {
    section: "TRANSAKSI",
    items: [
      { type: "item", href: "/transaksi/produksi",   label: "Produksi",    icon: Wheat },
      { type: "item", href: "/transaksi/pemasaran",  label: "Pemasaran",   icon: ShoppingCart },
      { type: "item", href: "/transaksi/bantuan",    label: "Bantuan",     icon: Gift },
      { type: "item", href: "#",                     label: "Pembiayaan",  icon: ClipboardList },
    ],
  },
  {
    section: "LAYANAN",
    items: [
      { type: "item", href: "/master/penyuluh",      label: "Penyuluh",    icon: GraduationCap },
      { type: "item", href: "/laporan/produksi",     label: "Laporan",     icon: FileBarChart },
    ],
  },
  {
    section: "SISTEM",
    items: [
      {
        type: "group",
        key: "pengaturan",
        label: "Pengaturan",
        icon: Settings,
        children: [
          { href: "/pengaturan/pengguna", label: "Manajemen Pengguna", icon: UserCog },
          { href: "/pengaturan/role",     label: "Manajemen Role",     icon: Shield },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────
function getGroupKeys(pathname: string): string[] {
  const active: string[] = [];
  for (const section of menuSections) {
    for (const item of section.items) {
      if (item.type === "group") {
        const isChildActive = item.children.some((c) =>
          c.href === "/" ? pathname === "/" : pathname.startsWith(c.href)
        );
        if (isChildActive) active.push(item.key);
      }
    }
  }
  return active;
}

// ─── Sub-menu Group Component ────────────────────────────────
function SidebarGroup({
  group,
  pathname,
  defaultOpen,
}: {
  group: Extract<MenuGroup, { type: "group" }>;
  pathname: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = group.icon;

  const isAnyChildActive = group.children.some((c) =>
    c.href === "/" ? pathname === "/" : pathname.startsWith(c.href)
  );

  return (
    <div>
      {/* Group header button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`sidebar-item w-full text-left ${isAnyChildActive ? "active" : ""}`}
        style={{ justifyContent: "space-between" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Icon size={18} className="icon" />
          <span>{group.label}</span>
        </span>
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.25s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.7,
            flexShrink: 0,
          }}
        />
      </button>

      {/* Children */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? `${group.children.length * 44}px` : "0px",
          transition: "max-height 0.3s ease",
        }}
      >
        {group.children.map((child) => {
          const ChildIcon = child.icon;
          const isActive =
            child.href === "/" ? pathname === "/" : pathname.startsWith(child.href);
          return (
            <Link
              key={child.href}
              href={child.href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              style={{ paddingLeft: "2.75rem" }}
            >
              {/* Indent dot */}
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isActive ? "#A5D6A7" : "rgba(255,255,255,0.35)",
                  flexShrink: 0,
                  marginLeft: -4,
                  transition: "background 0.2s",
                }}
              />
              <span style={{ fontSize: "0.8rem" }}>{child.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(() => getGroupKeys(pathname));

  // Auto-open group when navigating
  useEffect(() => {
    setOpenGroups(getGroupKeys(pathname));
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    toast.success("Berhasil keluar dari sistem.");
    await signOut({ callbackUrl: "/login" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

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
        {menuSections.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => {
              if (item.type === "item") {
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
              }

              if (item.type === "group") {
                return (
                  <SidebarGroup
                    key={item.key}
                    group={item}
                    pathname={pathname}
                    defaultOpen={openGroups.includes(item.key)}
                  />
                );
              }

              return null;
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
          <div className="sidebar-user-name">{session?.user?.name ?? "Pengguna"}</div>
          <div className="sidebar-user-role">{(session?.user as any)?.roleName ?? "—"}</div>
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
