'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getKabupaten() {
  const data = await db.mst_kabupaten.findMany({
    where: { is_deleted: false },
    include: {
      provinsi: {
        select: { nama_provinsi: true }
      }
    },
    orderBy: { kode_kabupaten: 'asc' },
  });
  return serialize(data);
}

export async function getProvinsiOptions() {
  const data = await db.mst_provinsi.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_provinsi: true, nama_provinsi: true },
    orderBy: { nama_provinsi: 'asc' },
  });
  return serialize(data);
}

export async function createKabupaten(data: {
  id_provinsi: string;
  kode_kabupaten: string;
  nama_kabupaten: string;
  jenis: string;
  ibukota?: string;
  luas_wilayah?: string;
}) {
  try {
    await db.mst_kabupaten.create({
      data: {
        id_provinsi: BigInt(data.id_provinsi),
        kode_kabupaten: data.kode_kabupaten,
        nama_kabupaten: data.nama_kabupaten,
        jenis: data.jenis,
        ibukota: data.ibukota || null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/kabupaten');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Kabupaten sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updateKabupaten(
  id: string,
  data: {
    id_provinsi: string;
    kode_kabupaten: string;
    nama_kabupaten: string;
    jenis: string;
    ibukota?: string;
    luas_wilayah?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_kabupaten.update({
      where: { id_kabupaten: BigInt(id) },
      data: {
        id_provinsi: BigInt(data.id_provinsi),
        kode_kabupaten: data.kode_kabupaten,
        nama_kabupaten: data.nama_kabupaten,
        jenis: data.jenis,
        ibukota: data.ibukota || null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/kabupaten');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Kabupaten sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteKabupaten(id: string) {
  try {
    await db.mst_kabupaten.update({
      where: { id_kabupaten: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/kabupaten');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
