import React from 'react';
import ProduksiClient from './ProduksiClient';
import { getProduksi, getLahanKomoditasOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaksi Produksi | SIAGRI',
  description: 'Kelola data tanam, panen, dan verifikasi produksi',
};

export default async function ProduksiPage() {
  const data = await getProduksi();
  const options = await getLahanKomoditasOptions();

  return <ProduksiClient initialData={data} options={options} />;
}
