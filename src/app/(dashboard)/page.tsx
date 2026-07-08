import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard Executive | SIAGRI",
  description: "Executive Dashboard Sistem Informasi Agribisnis",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  return (
    <div>
      <div className="page-header mb-0">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Selamat datang, <strong>{user?.name ?? "Pengguna"}</strong> —{" "}
            {user?.namaDesa
              ? `${user.namaDesa}, ${user.namaKecamatan}`
              : user?.namaKecamatan
              ? `${user.namaKecamatan}`
              : "Semua Wilayah"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-secondary btn-sm" id="btn-export-dashboard">
            Export PDF
          </button>
        </div>
      </div>

      <DashboardClient user={user} />
    </div>
  );
}
