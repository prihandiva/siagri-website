"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Map as MapIcon, Wheat, DollarSign, Gift, Activity, CheckCircle2,
  ArrowUpRight, Calendar, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import dynamic from "next/dynamic";
import { useDashboardFilter } from "@/context/DashboardFilterContext";

// Dynamic import for Leaflet (client side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
import "leaflet/dist/leaflet.css";

// ─── TYPE DEFINITIONS ───
interface KPIItem {
  label: string;
  value: string;
  unit: string;
  color: "green" | "yellow" | "blue" | "purple";
  icon: React.ElementType;
}

interface DashboardData {
  kpi: {
    totalPetani: number;
    luasLahan: number;
    totalProduksiTon: number;
    nilaiProduksi: number;
    totalBantuan: number;
  };
  produksiKomoditas: { name: string; value: number }[];
  komoditasUnggulan: { name: string; value: number; color: string }[];
  mapMarkers: { lat: number; lng: number; nama: string; komoditas: string }[];
  bantuanTerbaru: { title: string; desc: string; amount: string }[];
  ringkasanHariIni: {
    pendataanPetani: number;
    inputProduksi: number;
    verifikasiBantuan: number;
  };
}

// ─── HELPER FORMATTERS ───
function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} M`;
  if (num >= 1_000_000)     return `${(num / 1_000_000).toFixed(2)} Jt`;
  if (num >= 1_000)         return num.toLocaleString("id-ID");
  return num.toString();
}

function formatRupiah(num: number): string {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
  if (num >= 1_000_000)     return `Rp ${(num / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${num.toLocaleString("id-ID")}`;
}

// ─── SKELETON ───
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-28 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-20" />
    </div>
  );
}

// ─── KPI CARD ───
function KPICard({ data }: { data: KPIItem }) {
  const Icon = data.icon;
  const bgColors: Record<string, string> = {
    green: "#E8F5E9", yellow: "#FFF8E1", blue: "#E3F2FD", purple: "#F3E5F5",
  };
  const textColors: Record<string, string> = {
    green: "#2E7D32", yellow: "#F57F17", blue: "#1565C0", purple: "#6A1B9A",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bgColors[data.color] }}
          >
            <Icon size={16} style={{ color: textColors[data.color] }} />
          </div>
          <span className="text-sm font-medium text-gray-600">{data.label}</span>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{data.value}</span>
          {data.unit && <span className="text-sm text-gray-500 font-normal">{data.unit}</span>}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs font-semibold flex items-center text-green-600">
            <ArrowUpRight size={14} />
            Live
          </span>
          <span className="text-xs text-gray-400">data terkini</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function DashboardClient({ user }: { user: any }) {
  const { filter } = useDashboardFilter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKomoditasTahun, setSelectedKomoditasTahun] = useState<string>("");

  // Fix leaflet icon issue in Next.js
  if (typeof window !== "undefined") {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }

  // Fetch dashboard data whenever filter changes
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter.filterId)   params.set("filter_id",   filter.filterId);
      if (filter.filterType) params.set("filter_type", filter.filterType);

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter.filterId, filter.filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived KPI cards ──
  const kpiCards: KPIItem[] = data
    ? [
        { label: "Total Petani",    value: formatNumber(data.kpi.totalPetani),     unit: "Orang", color: "green",  icon: Users    },
        { label: "Luas Lahan",      value: formatNumber(data.kpi.luasLahan),       unit: "Ha",    color: "green",  icon: MapIcon  },
        { label: "Total Produksi",  value: formatNumber(data.kpi.totalProduksiTon),unit: "Ton",   color: "yellow", icon: Wheat    },
        { label: "Nilai Produksi",  value: formatRupiah(data.kpi.nilaiProduksi),   unit: "",      color: "blue",   icon: DollarSign },
        { label: "Total Bantuan",   value: formatRupiah(data.kpi.totalBantuan),    unit: "",      color: "purple", icon: Gift     },
      ]
    : [];

  // ── Map center ──
  const mapCenter: [number, number] = (() => {
    const markers = data?.mapMarkers ?? [];
    if (markers.length === 0) return [-2.5, 118];
    const avgLat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;
    return [avgLat, avgLng];
  })();

  const mapZoom = (data?.mapMarkers?.length ?? 0) > 0 ? 12 : 5;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* ─── FILTER INFO BADGE ─── */}
      {filter.filterType !== "nasional" && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#E8F5E9",
            border: "1px solid #A5D6A7",
            borderRadius: "99px",
            padding: "0.25rem 0.875rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#1B5E20",
          }}
        >
          <span>🗺️</span>
          <span>Menampilkan data: <strong>{filter.filterLabel}</strong></span>
        </div>
      )}

      {/* ─── 1. KPI CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((kpi, idx) => <KPICard key={idx} data={kpi} />)}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          ⚠️ Gagal memuat data: {error}. Coba refresh halaman.
        </div>
      )}

      {/* ─── 2. CHARTS & MAP ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Produksi Komoditas (Bar Chart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Produksi Komoditas (Ton)</h3>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 size={32} className="text-gray-300 animate-spin" />
              </div>
            ) : (data?.produksiKomoditas ?? []).length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Belum ada data produksi
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data!.produksiKomoditas}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <RechartsTooltip
                    cursor={{ fill: "#F3F4F6" }}
                    formatter={(v: any) => [`${v} ton`, "Produksi"]}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Peta Sebaran Komoditas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Peta Sebaran Lahan</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {data?.mapMarkers?.length ?? 0} titik
            </span>
          </div>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <Loader2 size={32} className="text-gray-300 animate-spin" />
              </div>
            ) : typeof window !== "undefined" && (
              <MapContainer
                key={`${mapCenter[0]}-${mapCenter[1]}`}
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {(data?.mapMarkers ?? []).map((marker, i) => (
                  <Marker key={i} position={[marker.lat, marker.lng]}>
                    <Popup>
                      <div style={{ minWidth: 120 }}>
                        <strong>{marker.nama}</strong>
                        <br />
                        <span style={{ fontSize: 12, color: "#555" }}>🌾 {marker.komoditas}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Komoditas Unggulan (Pie Chart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Komoditas Unggulan</h3>
          </div>
          <div className="flex flex-col items-center gap-4">
            {loading ? (
              <div className="w-full h-44 flex items-center justify-center">
                <Loader2 size={32} className="text-gray-300 animate-spin" />
              </div>
            ) : (data?.komoditasUnggulan ?? []).length === 0 ? (
              <div className="w-full h-44 flex items-center justify-center text-gray-400 text-sm">
                Belum ada data komoditas
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={data!.komoditasUnggulan}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {data!.komoditasUnggulan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any) => [`${value}%`, "Persentase"]}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full px-2">
                  {data!.komoditasUnggulan.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 font-medium flex-1 truncate">{item.name}</span>
                      <span className="text-gray-900 font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3. CALENDAR & LISTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ringkasan Hari Ini */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            Ringkasan Hari Ini
          </h3>
          <div className="space-y-3">
            {[
              { label: "Pendataan Petani",    value: data?.ringkasanHariIni.pendataanPetani   ?? "—", icon: Users,         color: "#2E7D32" },
              { label: "Input Produksi",      value: data?.ringkasanHariIni.inputProduksi     ?? "—", icon: Wheat,         color: "#3B82F6" },
              { label: "Verifikasi Bantuan",  value: data?.ringkasanHariIni.verifikasiBantuan ?? "—", icon: CheckCircle2,  color: "#F59E0B" },
            ].map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={14} color={r.color} />
                    <span className="text-sm text-gray-600">{r.label}</span>
                  </div>
                  {loading ? (
                    <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="font-bold text-gray-900">{r.value}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bantuan Terbaru */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Bantuan Terbaru</h3>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-32 mb-1" />
                    <div className="h-2 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              ))
            ) : (data?.bantuanTerbaru ?? []).length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-4">
                Belum ada data bantuan
              </div>
            ) : (
              (data?.bantuanTerbaru ?? []).map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "#10B98115" }}>
                    <Gift size={16} color="#10B981" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{b.title}</p>
                    <p className="text-xs text-gray-500">{b.desc}</p>
                  </div>
                  <div className="text-xs font-bold text-green-700 whitespace-nowrap">{b.amount}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Wilayah Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-gray-800">Scope Data</h3>
          <div className="space-y-2">
            {[
              { label: "Total Petani",   value: data ? `${data.kpi.totalPetani.toLocaleString("id-ID")} orang`        : "—" },
              { label: "Total Lahan",    value: data ? `${data.kpi.luasLahan.toLocaleString("id-ID")} Ha`             : "—" },
              { label: "Titik Peta",     value: data ? `${(data.mapMarkers ?? []).length} koordinat`                  : "—" },
              { label: "Jenis Komoditas",value: data ? `${(data.produksiKomoditas ?? []).length} komoditas`           : "—" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{item.label}</span>
                {loading ? (
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <span className="font-semibold text-gray-800">{item.value}</span>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "auto",
              padding: "0.75rem",
              background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)",
              borderRadius: "8px",
              border: "1px solid #C8E6C9",
            }}
          >
            <p className="text-xs text-green-800 font-medium">
              🗺️ Filter aktif: <strong>{filter.filterLabel}</strong>
            </p>
            <p className="text-xs text-green-700 mt-1">
              Semua data ditampilkan berdasarkan wilayah yang dipilih di atas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
