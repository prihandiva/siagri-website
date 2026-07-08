import React from 'react';
import DusunClient from './DusunClient';
import { getDusun, getDesaOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Dusun | SIAGRI',
  description: 'Kelola data master dusun',
};

export default async function DusunPage() {
  const data = await getDusun();
  const desaOptions = await getDesaOptions();

  return <DusunClient initialData={data} desaOptions={desaOptions} />;
}
