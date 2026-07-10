export function formatTanggalIndonesia(date: Date | string | number): string {
  if (!date) return '-';
  
  const d = new Date(date);
  
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
}

export function formatTanggalPendek(date: Date | string | number): string {
  if (!date) return '-';
  
  const d = new Date(date);
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatAngka(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}
