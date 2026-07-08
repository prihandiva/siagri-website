import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatLuas(luas: number): string {
  return `${formatNumber(luas)} Ha`;
}

export function formatTon(ton: number): string {
  return `${formatNumber(ton)} Ton`;
}

export type UserRole =
  | "R001" // Super Admin
  | "R002" // Admin Provinsi
  | "R003" // Admin Kabupaten
  | "R004" // Admin Kecamatan
  | "R005" // Admin Desa
  | "R006" // Penyuluh
  | "R007" // Ketua Gapoktan
  | "R008" // Ketua Poktan
  | "R009" // Petani
  | "R010" // Pimpinan (Read Only)
  | "R011"; // Auditor

export function canEdit(role: UserRole): boolean {
  return ["R001", "R002", "R003", "R004", "R005", "R006", "R007", "R008"].includes(role);
}

export function canDelete(role: UserRole): boolean {
  return ["R001", "R005"].includes(role);
}

export function canVerify(role: UserRole): boolean {
  return ["R001", "R002", "R003", "R004"].includes(role);
}
