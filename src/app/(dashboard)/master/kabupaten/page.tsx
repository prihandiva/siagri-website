import React from 'react';
import KabupatenClient from './KabupatenClient';
import { getKabupaten, getProvinsiOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Kabupaten | SIAGRI',
  description: 'Kelola data master kabupaten dan kota',
};

export default async function KabupatenPage() {
  const data = await getKabupaten();
  const provinsiOptions = await getProvinsiOptions();

  return <KabupatenClient initialData={data} provinsiOptions={provinsiOptions} />;
}
