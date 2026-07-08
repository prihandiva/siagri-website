'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getKomoditas() {
  const data = await db.mst_komoditas.findMany({
    where: { is_deleted: false },
    orderBy: [{ subsektor: 'asc' }, { nama_komoditas: 'asc' }],
  });
  return serialize(data);
}

export async function createKomoditas(data: {
  kode_komoditas: string;
  nama_komoditas: string;
  subsektor: string;
  satuan?: string;
  deskripsi?: string;
  gambar?: string;
}) {
  try {
    await db.mst_komoditas.create({
      data: {
        kode_komoditas: data.kode_komoditas,
        nama_komoditas: data.nama_komoditas,
        subsektor: data.subsektor,
        satuan: data.satuan || null,
        deskripsi: data.deskripsi || null,
        gambar: data.gambar || null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/komoditas');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Komoditas sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updateKomoditas(
  id: string,
  data: {
    kode_komoditas: string;
    nama_komoditas: string;
    subsektor: string;
    satuan?: string;
    deskripsi?: string;
    gambar?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_komoditas.update({
      where: { id_komoditas: BigInt(id) },
      data: {
        kode_komoditas: data.kode_komoditas,
        nama_komoditas: data.nama_komoditas,
        subsektor: data.subsektor,
        satuan: data.satuan || null,
        deskripsi: data.deskripsi || null,
        gambar: data.gambar || null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/komoditas');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Komoditas sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteKomoditas(id: string) {
  try {
    await db.mst_komoditas.update({
      where: { id_komoditas: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/komoditas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
