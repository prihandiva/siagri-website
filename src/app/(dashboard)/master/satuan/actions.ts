'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getSatuan() {
  const data = await db.mst_satuan.findMany({
    include: { _count: { select: { komoditas: true } } },
    orderBy: { kode_satuan: 'asc' },
  });
  return serialize(data);
}

export async function createSatuan(data: { kode_satuan: string; nama_satuan: string; simbol: string }) {
  try {
    await db.mst_satuan.create({ data });
    revalidatePath('/master/satuan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Satuan sudah ada.' };
    return { success: false, error: error.message };
  }
}

export async function updateSatuan(
  id: number,
  data: { kode_satuan: string; nama_satuan: string; simbol: string }
) {
  try {
    await db.mst_satuan.update({ where: { id_satuan: id }, data });
    revalidatePath('/master/satuan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Satuan sudah digunakan.' };
    return { success: false, error: error.message };
  }
}

export async function deleteSatuan(id: number) {
  try {
    const count = await db.mst_komoditas.count({ where: { id_satuan: id, is_deleted: false } });
    if (count > 0) return { success: false, error: `Tidak dapat dihapus karena digunakan oleh ${count} komoditas.` };
    await db.mst_satuan.delete({ where: { id_satuan: id } });
    revalidatePath('/master/satuan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
