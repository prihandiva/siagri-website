import React from 'react';
import LahanClient from './LahanClient';
import { getLahan, getPetaniDesaOptions, getStatusLahanOptions } from './actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Lahan | SIAGRI',
  description: 'Kelola data lahan milik petani',
};

import { auth } from '@/lib/auth';

export default async function LahanPage() {
  const session = await auth();
  const user = session?.user;

  const data = await getLahan(user);
  const options = await getPetaniDesaOptions(user);
  const statusOptions = await getStatusLahanOptions();

  return <LahanClient initialData={data} options={{ ...options, status_lahan: statusOptions }} userRole={user?.role} userNik={user?.nik} />;
}
