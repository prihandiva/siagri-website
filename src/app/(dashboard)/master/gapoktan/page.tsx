import React from 'react';
import GapoktanClient from './GapoktanClient';
import { getGapoktan, getDesaOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Gapoktan | SIAGRI',
  description: 'Kelola data Gabungan Kelompok Tani (Gapoktan)',
};

export default async function GapoktanPage() {
  const data = await getGapoktan();
  const desaOptions = await getDesaOptions();

  return <GapoktanClient initialData={data} desaOptions={desaOptions} />;
}
