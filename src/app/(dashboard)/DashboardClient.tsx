"use client";

import React, { useState } from "react";
import {
  Users, Map as MapIcon, Wheat, DollarSign, Gift, Activity, CheckCircle2,
  UsersRound, ArrowUpRight, ArrowDownRight, Clock, MapPin, 
  ChevronRight, Calendar
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import dynamic from "next/dynamic";

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

// ─── DUMMY DATA ───
const kpiData = [
  { label: "Total Petani",     value: "1.248",   unit: "Orang",  trend: 5.2,  trendDesc: "dari bulan lalu", color: "green", icon: Users },
  { label: "Luas Lahan",       value: "1.634,5", unit: "Ha",     trend: 3.1,  trendDesc: "dari bulan lalu", color: "green", icon: MapIcon },
  { label: "Total Produksi",   value: "2.456,7", unit: "Ton",    trend: 8.7,  trendDesc: "dari bulan lalu", color: "yellow", icon: Wheat },
  { label: "Nilai Produksi",   value: "Rp 12,45 M", unit: "",      trend: 12.4, trendDesc: "dari bulan lalu", color: "blue", icon: DollarSign },
  { label: "Total Bantuan",    value: "Rp 1,24 M",  unit: "",      trend: 6.3,  trendDesc: "dari bulan lalu", color: "purple", icon: Gift },
];

const barData = [
  { name: "Padi", value: 1120 },
  { name: "Jagung", value: 650 },
  { name: "Cabai", value: 320 },
  { name: "Kopi", value: 180 },
  { name: "Kedelai", value: 120 },
  { name: "Ubi Kayu", value: 66 },
];

const pieData = [
  { name: "Padi", value: 45, color: "#2E7D32" },
  { name: "Jagung", value: 26, color: "#F59E0B" },
  { name: "Cabai", value: 13, color: "#EF4444" },
  { name: "Kopi", value: 8, color: "#8B5CF6" },
  { name: "Lainnya", value: 8, color: "#9CA3AF" },
];

// Kalender Tanam Dummy
const kalenderTanam = [
  { 
    komoditas: "Padi", 
    schedule: [
      { start: 0, end: 1, type: "persiapan" }, // Jan-Feb
      { start: 1, end: 4, type: "tanam" },     // Feb-May
      { start: 4, end: 5, type: "panen" },     // May-Jun
      { start: 6, end: 7, type: "persiapan" }, // Jul-Aug
      { start: 7, end: 10, type: "tanam" },    // Aug-Nov
      { start: 10, end: 11, type: "panen" },   // Nov-Dec
    ]
  },
  { 
    komoditas: "Jagung", 
    schedule: [
      { start: 2, end: 3, type: "persiapan" }, 
      { start: 3, end: 6, type: "tanam" },     
      { start: 6, end: 7, type: "panen" },     
    ]
  },
  { 
    komoditas: "Cabai", 
    schedule: [
      { start: 0, end: 3, type: "tanam" },     
      { start: 3, end: 6, type: "panen" },     
    ]
  },
];

const mapMarkers = [
  { id: 1, position: [-7.9666, 112.6326], nama: "Lahan Padi - Blok A" }, // Malang area
  { id: 2, position: [-8.0, 112.7], nama: "Lahan Jagung - Blok B" },
  { id: 3, position: [-7.9, 112.5], nama: "Lahan Cabai - Blok C" },
];

const ringkasanHariIni = [
  { label: "Pendataan Petani", value: 5, icon: Users, color: "#2E7D32" },
  { label: "Input Produksi", value: 8, icon: Wheat, color: "#3B82F6" },
  { label: "Verifikasi Bantuan", value: 3, icon: CheckCircle2, color: "#F59E0B" },
];

const aktivitasTerbaru = [
  { title: "Pendataan petani baru", desc: "oleh Petugas Desa", time: "2 jam yang lalu", icon: Users, color: "#2E7D32" },
  { title: "Input produksi Padi", desc: "oleh Petugas Desa", time: "4 jam yang lalu", icon: Wheat, color: "#3B82F6" },
  { title: "Verifikasi bantuan pupuk", desc: "oleh Admin Kecamatan", time: "1 hari yang lalu", icon: CheckCircle2, color: "#F59E0B" },
  { title: "Input pemasaran komoditas", desc: "oleh Petugas Desa", time: "1 hari yang lalu", icon: Activity, color: "#8B5CF6" },
];

const bantuanTerbaru = [
  { title: "Pupuk Subsidi", desc: "120 Petani", amount: "Rp 240.000.000", icon: Gift, color: "#10B981" },
  { title: "Alsintan (Traktor)", desc: "5 Kelompok Tani", amount: "Rp 375.000.000", icon: Gift, color: "#3B82F6" },
  { title: "Benih Unggul", desc: "80 Petani", amount: "Rp 80.000.000", icon: Gift, color: "#F59E0B" },
];

// ─── COMPONENTS ───
function KPICard({ data }: { data: any }) {
  const Icon = data.icon;
  const isUp = data.trend >= 0;
  
  // Custom colors based on the provided design
  const bgColors: any = {
    green: "#E8F5E9",
    yellow: "#FFF8E1",
    blue: "#E3F2FD",
    purple: "#F3E5F5",
  };
  const textColors: any = {
    green: "#2E7D32",
    yellow: "#F57F17",
    blue: "#1565C0",
    purple: "#6A1B9A",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColors[data.color] }}>
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
          <span className={`text-xs font-semibold flex items-center ${isUp ? 'text-green-600' : 'text-red-600'}`}>
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(data.trend)}%
          </span>
          <span className="text-xs text-gray-400">{data.trendDesc}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ user }: { user: any }) {
  // Fix leaflet icon issue in Next.js
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* ─── 1. KPI CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, idx) => (
          <KPICard key={idx} data={kpi} />
        ))}
      </div>

      {/* ─── 2. CHARTS & MAP ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Produksi Komoditas (Bar Chart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Produksi Komoditas (Ton)</h3>
            <select className="text-xs border-gray-300 rounded text-gray-600 p-1">
              <option>Tahun 2024</option>
              <option>Tahun 2023</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peta Sebaran Komoditas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Peta Sebaran Komoditas</h3>
            <select className="text-xs border-gray-300 rounded text-gray-600 p-1">
              <option>Semua Komoditas</option>
              <option>Padi</option>
              <option>Jagung</option>
            </select>
          </div>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
            {typeof window !== 'undefined' && (
              <MapContainer center={[-7.98, 112.63] as any} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {mapMarkers.map((marker) => (
                  <Marker key={marker.id} position={marker.position as any}>
                    <Popup>{marker.nama}</Popup>
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
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any) => [`${value}%`, 'Persentase']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend di bawah chart, tidak overlap */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full px-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 font-medium flex-1 truncate">{item.name}</span>
                  <span className="text-gray-900 font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. CALENDAR & LISTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kalender Tanam */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-1">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            Kalender Tanam
          </h3>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[400px]">
              <div className="flex text-[10px] text-gray-400 mb-2 border-b border-gray-100 pb-1">
                <div className="w-20">Komoditas</div>
                <div className="flex-1 flex justify-between">
                  {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'].map(m => (
                    <div key={m} className="flex-1 text-center">{m}</div>
                  ))}
                </div>
              </div>
              
              {kalenderTanam.map((item, i) => (
                <div key={i} className="flex items-center mb-3">
                  <div className="w-20 text-xs font-medium text-gray-700">{item.komoditas}</div>
                  <div className="flex-1 relative h-4 bg-gray-50 rounded-sm">
                    {item.schedule.map((sch, j) => {
                      const left = `${(sch.start / 12) * 100}%`;
                      const width = `${((sch.end - sch.start) / 12) * 100}%`;
                      let bg = "";
                      if (sch.type === "tanam") bg = "#4CAF50";
                      else if (sch.type === "panen") bg = "#FBC02D";
                      else if (sch.type === "persiapan") bg = "#90CAF9";
                      
                      return (
                        <div 
                          key={j} 
                          className="absolute h-full rounded-sm opacity-80"
                          style={{ left, width, backgroundColor: bg }}
                          title={`${sch.type} - ${item.komoditas}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 mt-4 text-[10px] text-gray-500 font-medium">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#4CAF50]"></div> Tanam</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#FBC02D]"></div> Panen</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#90CAF9]"></div> Persiapan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Aktivitas Terbaru</h3>
          </div>
          <div className="flex-1 space-y-4">
            {aktivitasTerbaru.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg mt-1 flex-shrink-0" style={{ backgroundColor: `${act.color}15` }}>
                    <Icon size={16} color={act.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{act.title}</p>
                    <p className="text-xs text-gray-500 truncate">{act.desc}</p>
                  </div>
                  <div className="text-[10px] text-gray-400 whitespace-nowrap">{act.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan & Bantuan */}
        <div className="flex flex-col gap-4">
          
          {/* Ringkasan Hari Ini */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Ringkasan Hari Ini</h3>
            <div className="space-y-3">
              {ringkasanHariIni.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} color={r.color} />
                      <span className="text-sm text-gray-600">{r.label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{r.value}</span>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              + Input Data
            </button>
          </div>

          {/* Bantuan Terbaru */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800">Bantuan Terbaru</h3>
              <a href="#" className="text-xs text-blue-600 hover:underline">Lihat Semua</a>
            </div>
            <div className="space-y-3">
              {bantuanTerbaru.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${b.color}15` }}>
                      <Icon size={16} color={b.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{b.title}</p>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                    <div className="text-xs font-bold text-green-700">{b.amount}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
