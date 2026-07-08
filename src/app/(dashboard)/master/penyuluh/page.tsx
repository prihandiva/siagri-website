import React from 'react';
import PenyuluhClient from './PenyuluhClient';
import { getPenyuluh, getKecamatanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Penyuluh | SIAGRI',
  description: 'Kelola data Penyuluh Pertanian (PPL)',
};

export default async function PenyuluhPage() {
  const data = await getPenyuluh();
  const kecamatanOptions = await getKecamatanOptions();

  return <PenyuluhClient initialData={data} kecamatanOptions={kecamatanOptions} />;
}
