'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getDusun() {
  const data = await db.mst_dusun.findMany({
    where: { is_deleted: false },
    include: {
      desa: {
        select: { 
          nama_desa: true,
          kecamatan: { select: { nama_kecamatan: true } }
        }
      }
    },
    orderBy: { id_dusun: 'asc' },
  });
  return serialize(data);
}

export async function getDesaOptions() {
  const data = await db.mst_desa.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { 
      id_desa: true, 
      nama_desa: true,
      kecamatan: { select: { nama_kecamatan: true } }
    },
    orderBy: { nama_desa: 'asc' },
  });
  return serialize(data);
}

export async function createDusun(data: {
  id_desa: string;
  kode_dusun?: string;
  nama_dusun: string;
  kepala_dusun?: string;
  jumlah_rt?: string;
  jumlah_rw?: string;
  jumlah_penduduk?: string;
  luas_wilayah?: string;
}) {
  try {
    await db.mst_dusun.create({
      data: {
        id_desa: BigInt(data.id_desa),
        kode_dusun: data.kode_dusun || null,
        nama_dusun: data.nama_dusun,
        kepala_dusun: data.kepala_dusun || null,
        jumlah_rt: data.jumlah_rt ? parseInt(data.jumlah_rt, 10) : null,
        jumlah_rw: data.jumlah_rw ? parseInt(data.jumlah_rw, 10) : null,
        jumlah_penduduk: data.jumlah_penduduk ? parseInt(data.jumlah_penduduk, 10) : null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/dusun');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDusun(
  id: string,
  data: {
    id_desa: string;
    kode_dusun?: string;
    nama_dusun: string;
    kepala_dusun?: string;
    jumlah_rt?: string;
    jumlah_rw?: string;
    jumlah_penduduk?: string;
    luas_wilayah?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_dusun.update({
      where: { id_dusun: BigInt(id) },
      data: {
        id_desa: BigInt(data.id_desa),
        kode_dusun: data.kode_dusun || null,
        nama_dusun: data.nama_dusun,
        kepala_dusun: data.kepala_dusun || null,
        jumlah_rt: data.jumlah_rt ? parseInt(data.jumlah_rt, 10) : null,
        jumlah_rw: data.jumlah_rw ? parseInt(data.jumlah_rw, 10) : null,
        jumlah_penduduk: data.jumlah_penduduk ? parseInt(data.jumlah_penduduk, 10) : null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/dusun');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDusun(id: string) {
  try {
    await db.mst_dusun.update({
      where: { id_dusun: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/dusun');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
