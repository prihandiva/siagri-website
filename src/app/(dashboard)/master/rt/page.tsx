import { getRt, getRwList } from './actions';
import RtClient from './RtClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master RT | SIAGRI',
  description: 'Kelola data Rukun Tetangga (RT)',
};

export default async function RtPage() {
  const [data, rwList] = await Promise.all([getRt(), getRwList()]);
  return <RtClient initialData={data} rwList={rwList} />;
}
