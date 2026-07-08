import React from 'react';
import LaporanProduksiClient from './LaporanProduksiClient';
import { getLaporanProduksi, getLaporanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Laporan Produksi | SIAGRI',
  description: 'Laporan rekapitulasi data produksi komoditas',
};

export default async function LaporanProduksiPage() {
  const currentYear = new Date().getFullYear().toString();
  // Default filter: tahun ini
  const initialData = await getLaporanProduksi({ tahun: currentYear });
  const options = await getLaporanOptions();

  return (
    <LaporanProduksiClient 
      initialData={initialData} 
      options={options} 
      fetchDataAction={getLaporanProduksi} 
    />
  );
}
