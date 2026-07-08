import React from 'react';
import LahanClient from './LahanClient';
import { getLahan, getPetaniDesaOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Lahan | SIAGRI',
  description: 'Kelola data lahan milik petani',
};

export default async function LahanPage() {
  const data = await getLahan();
  const options = await getPetaniDesaOptions();

  return <LahanClient initialData={data} options={options} />;
}
