import React from 'react';
import PemasaranClient from './PemasaranClient';
import { getPemasaran, getPemasaranOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaksi Pemasaran | SIAGRI',
  description: 'Kelola data transaksi penjualan',
};

export default async function PemasaranPage() {
  const data = await getPemasaran();
  const options = await getPemasaranOptions();

  return <PemasaranClient initialData={data} options={options} />;
}
