import React from 'react';
import BantuanClient from './BantuanClient';
import { getBantuan, getBantuanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaksi Bantuan | SIAGRI',
  description: 'Kelola data bantuan pertanian',
};

export default async function BantuanPage() {
  const data = await getBantuan();
  const options = await getBantuanOptions();

  return <BantuanClient initialData={data} options={options} />;
}
