import React from 'react';
import SubsektorClient from './SubsektorClient';
import { getSubsektor } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Subsektor | SIAGRI',
  description: 'Kelola data master subsektor komoditas pertanian',
};

export default async function SubsektorPage() {
  const data = await getSubsektor();
  return <SubsektorClient initialData={data} />;
}
