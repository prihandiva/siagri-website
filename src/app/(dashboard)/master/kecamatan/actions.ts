'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getKecamatan() {
  const data = await db.mst_kecamatan.findMany({
    where: { is_deleted: false },
    include: {
      kabupaten: {
        select: { 
          nama_kabupaten: true,
          provinsi: { select: { nama_provinsi: true } }
        }
      }
    },
    orderBy: { kode_kecamatan: 'asc' },
  });
  return serialize(data);
}

export async function getKabupatenOptions() {
  const data = await db.mst_kabupaten.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_kabupaten: true, nama_kabupaten: true, jenis: true },
    orderBy: { nama_kabupaten: 'asc' },
  });
  return serialize(data);
}

export async function createKecamatan(data: {
  id_kabupaten: string;
  kode_kecamatan: string;
  nama_kecamatan: string;
  ibukota?: string;
  luas_wilayah?: string;
  jumlah_desa?: string;
}) {
  try {
    await db.mst_kecamatan.create({
      data: {
        id_kabupaten: BigInt(data.id_kabupaten),
        kode_kecamatan: data.kode_kecamatan,
        nama_kecamatan: data.nama_kecamatan,
        ibukota: data.ibukota || null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        jumlah_desa: data.jumlah_desa ? parseInt(data.jumlah_desa, 10) : null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/kecamatan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Kecamatan sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updateKecamatan(
  id: string,
  data: {
    id_kabupaten: string;
    kode_kecamatan: string;
    nama_kecamatan: string;
    ibukota?: string;
    luas_wilayah?: string;
    jumlah_desa?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_kecamatan.update({
      where: { id_kecamatan: BigInt(id) },
      data: {
        id_kabupaten: BigInt(data.id_kabupaten),
        kode_kecamatan: data.kode_kecamatan,
        nama_kecamatan: data.nama_kecamatan,
        ibukota: data.ibukota || null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        jumlah_desa: data.jumlah_desa ? parseInt(data.jumlah_desa, 10) : null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/kecamatan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Kecamatan sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteKecamatan(id: string) {
  try {
    await db.mst_kecamatan.update({
      where: { id_kecamatan: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/kecamatan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
