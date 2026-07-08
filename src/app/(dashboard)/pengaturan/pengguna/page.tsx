import React from 'react';
import PenggunaClient from './PenggunaClient';
import { getPengguna, getRoleDesaOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manajemen Pengguna | SIAGRI',
  description: 'Kelola data pengguna sistem',
};

export default async function PenggunaPage() {
  const data = await getPengguna();
  const options = await getRoleDesaOptions();

  return <PenggunaClient initialData={data} options={options} />;
}
