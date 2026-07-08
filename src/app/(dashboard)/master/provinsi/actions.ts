'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Helper to serialize BigInt
const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getProvinsi() {
  const data = await db.mst_provinsi.findMany({
    where: { is_deleted: false },
    orderBy: { kode_provinsi: 'asc' },
  });
  return serialize(data);
}

export async function createProvinsi(data: {
  kode_provinsi: string;
  nama_provinsi: string;
  singkatan?: string;
}) {
  try {
    await db.mst_provinsi.create({
      data: {
        kode_provinsi: data.kode_provinsi,
        nama_provinsi: data.nama_provinsi,
        singkatan: data.singkatan || null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/provinsi');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode atau Nama Provinsi sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updateProvinsi(
  id: string,
  data: {
    kode_provinsi: string;
    nama_provinsi: string;
    singkatan?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_provinsi.update({
      where: { id_provinsi: BigInt(id) },
      data: {
        kode_provinsi: data.kode_provinsi,
        nama_provinsi: data.nama_provinsi,
        singkatan: data.singkatan || null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/provinsi');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode atau Nama Provinsi sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteProvinsi(id: string) {
  try {
    await db.mst_provinsi.update({
      where: { id_provinsi: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/provinsi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
