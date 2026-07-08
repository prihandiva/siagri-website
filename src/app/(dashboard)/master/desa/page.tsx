import React from 'react';
import DesaClient from './DesaClient';
import { getDesa, getKecamatanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Desa | SIAGRI',
  description: 'Kelola data master desa dan kelurahan',
};

export default async function DesaPage() {
  const data = await getDesa();
  const kecamatanOptions = await getKecamatanOptions();

  return <DesaClient initialData={data} kecamatanOptions={kecamatanOptions} />;
}
