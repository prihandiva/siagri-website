import { getRole } from './actions';
import RoleClient from './RoleClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manajemen Role | SIAGRI',
  description: 'Kelola role dan hak akses pengguna',
};

export default async function RolePage() {
  const data = await getRole();
  return <RoleClient initialData={data} />;
}
