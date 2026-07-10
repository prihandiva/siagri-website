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

  const wilayahLabel = user?.namaDesa
    ? `${user.namaDesa}, ${user.namaKecamatan}`
    : user?.namaKecamatan
    ? user.namaKecamatan
    : "Semua Wilayah";

  const jamSapaan = () => {
    const jam = new Date().getHours();
    if (jam < 11) return "Selamat Pagi";
    if (jam < 15) return "Selamat Siang";
    if (jam < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div>
      {/* ─── HERO WELCOME CARD ─── */}
      <div
        style={{
          margin: "0 0 1.5rem 0",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 45%, #33691E 100%)",
          minHeight: "160px",
          display: "flex",
          alignItems: "stretch",
          boxShadow: "0 4px 24px rgba(27, 94, 32, 0.25)",
        }}
      >
        {/* Background pattern dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "200px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            right: "350px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        {/* Left: Text Content */}
        <div
          style={{
            flex: 1,
            padding: "2rem 2.5rem",
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "99px",
              padding: "0.25rem 0.875rem",
              marginBottom: "0.875rem",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: "0.875rem" }}>🌾</span>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Dashboard Executive SIAGRI
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.25,
              margin: "0 0 0.5rem 0",
            }}
          >
            {jamSapaan()},{" "}
            <span style={{ color: "#A5D6A7" }}>{user?.name ?? "Pengguna"}</span>{" "}
            <span style={{ fontSize: "1.5rem" }}>👋</span>
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.875rem",
              margin: "0 0 1.25rem 0",
              lineHeight: 1.6,
              maxWidth: "480px",
            }}
          >
            Pantau dan kelola data agribisnis wilayah{" "}
            <strong style={{ color: "#C8E6C9" }}>{wilayahLabel}</strong>{" "}
            secara real-time. Data terpercaya untuk kebijakan pertanian yang lebih baik.
          </p>

          {/* Quick badges */}
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
            {[
              { emoji: "📊", label: "Data Real-Time" },
              { emoji: "🗺️", label: "Peta Interaktif" },
              { emoji: "✅", label: "Terverifikasi" },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 500,
                }}
              >
                <span>{b.emoji}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Illustration */}
        <div
          style={{
            width: "380px",
            position: "relative",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          {/* Gradient overlay to blend image into card */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(27,94,32,0.9) 0%, rgba(27,94,32,0.2) 40%, transparent 100%)",
              zIndex: 1,
            }}
          />
          {/* High-quality Unsplash rice/agriculture photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&auto=format&fit=crop"
            alt="Pertanian Indonesia"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              position: "absolute",
              inset: 0,
            }}
          />
        </div>
      </div>

      <DashboardClient user={user} />
    </div>
  );
}
