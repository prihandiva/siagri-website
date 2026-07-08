import React from 'react';
import ProvinsiClient from './ProvinsiClient';
import { getProvinsi } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Provinsi | SIAGRI',
  description: 'Kelola data master provinsi',
};

export default async function ProvinsiPage() {
  const data = await getProvinsi();

  return <ProvinsiClient initialData={data} />;
}
