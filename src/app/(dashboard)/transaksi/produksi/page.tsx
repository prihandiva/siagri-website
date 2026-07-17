import React from 'react';
import ProduksiClient from './ProduksiClient';
import { getProduksi, getLahanKomoditasOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaksi Produksi | SIAGRI',
  description: 'Kelola data tanam, panen, foto berkala dan verifikasi produksi pertanian',
};

import { auth } from '@/lib/auth';

export default async function ProduksiPage() {
  const session = await auth();
  const user = session?.user;
  
  const data = await getProduksi();
  const options = await getLahanKomoditasOptions(user);

  return <ProduksiClient initialData={data} options={options} />;
}
