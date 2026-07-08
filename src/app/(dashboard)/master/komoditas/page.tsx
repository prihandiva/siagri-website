import React from 'react';
import KomoditasClient from './KomoditasClient';
import { getKomoditas } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Komoditas | SIAGRI',
  description: 'Kelola data master komoditas',
};

export default async function KomoditasPage() {
  const data = await getKomoditas();

  return <KomoditasClient initialData={data} />;
}
