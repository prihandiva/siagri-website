import React from 'react';
import KomoditasClient from './KomoditasClient';
import { getKomoditas, getSubsektorOptions, getSatuanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Komoditas | SIAGRI',
  description: 'Kelola data master komoditas',
};

export default async function KomoditasPage() {
  const data = await getKomoditas();
  const subsektorOpts = await getSubsektorOptions();
  const satuanOpts = await getSatuanOptions();

  return <KomoditasClient initialData={data} options={{ subsektor: subsektorOpts, satuan: satuanOpts }} />;
}
