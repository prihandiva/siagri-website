import React from 'react';
import SatuanClient from './SatuanClient';
import { getSatuan } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Satuan | SIAGRI',
  description: 'Kelola data master satuan pengukuran komoditas',
};

export default async function SatuanPage() {
  const data = await getSatuan();
  return <SatuanClient initialData={data} />;
}
