import { getRw, getDusunList } from './actions';
import RwClient from './RwClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master RW | SIAGRI',
  description: 'Kelola data Rukun Warga (RW)',
};

export default async function RwPage() {
  const [data, dusunList] = await Promise.all([getRw(), getDusunList()]);
  return <RwClient initialData={data} dusunList={dusunList} />;
}
