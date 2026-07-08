import React from 'react';
import KecamatanClient from './KecamatanClient';
import { getKecamatan, getKabupatenOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Kecamatan | SIAGRI',
  description: 'Kelola data master kecamatan',
};

export default async function KecamatanPage() {
  const data = await getKecamatan();
  const kabupatenOptions = await getKabupatenOptions();

  return <KecamatanClient initialData={data} kabupatenOptions={kabupatenOptions} />;
}
