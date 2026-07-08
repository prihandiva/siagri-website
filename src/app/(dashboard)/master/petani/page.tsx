import React from 'react';
import PetaniClient from './PetaniClient';
import { getPetani, getDesaPoktanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Petani | SIAGRI',
  description: 'Kelola data registrasi petani',
};

export default async function PetaniPage() {
  const data = await getPetani();
  const options = await getDesaPoktanOptions();

  return <PetaniClient initialData={data} options={options} />;
}
