'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getSubsektor() {
  const data = await db.mst_subsektor.findMany({
    include: { _count: { select: { komoditas: true } } },
    orderBy: { kode_subsektor: 'asc' },
  });
  return serialize(data);
}

export async function createSubsektor(data: { kode_subsektor: string; nama_subsektor: string }) {
  try {
    await db.mst_subsektor.create({ data });
    revalidatePath('/master/subsektor');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Subsektor sudah ada.' };
    return { success: false, error: error.message };
  }
}

export async function updateSubsektor(id: number, data: { kode_subsektor: string; nama_subsektor: string }) {
  try {
    await db.mst_subsektor.update({ where: { id_subsektor: id }, data });
    revalidatePath('/master/subsektor');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Subsektor sudah digunakan.' };
    return { success: false, error: error.message };
  }
}

export async function deleteSubsektor(id: number) {
  try {
    // Check if there are komoditas using this subsektor
    const count = await db.mst_komoditas.count({ where: { id_subsektor: id, is_deleted: false } });
    if (count > 0) return { success: false, error: `Tidak dapat dihapus karena digunakan oleh ${count} komoditas.` };
    await db.mst_subsektor.delete({ where: { id_subsektor: id } });
    revalidatePath('/master/subsektor');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
