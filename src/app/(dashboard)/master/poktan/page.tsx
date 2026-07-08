import React from 'react';
import PoktanClient from './PoktanClient';
import { getPoktan, getDesaGapoktanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Poktan | SIAGRI',
  description: 'Kelola data Kelompok Tani (Poktan)',
};

export default async function PoktanPage() {
  const data = await getPoktan();
  const options = await getDesaGapoktanOptions();

  return <PoktanClient initialData={data} options={options} />;
}
