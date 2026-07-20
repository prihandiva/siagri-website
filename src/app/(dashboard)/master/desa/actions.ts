'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getDesa() {
  const data = await db.mst_desa.findMany({
    where: { is_deleted: false },
    include: {
      kecamatan: {
        select: {
          nama_kecamatan: true,
          kode_kecamatan: true,
          kabupaten: {
            select: {
              nama_kabupaten: true,
              provinsi: { select: { nama_provinsi: true } }
            }
          }
        }
      }
    },
    orderBy: { kode_desa: 'asc' },
  });
  return serialize(data);
}

export async function getKecamatanOptions() {
  const data = await db.mst_kecamatan.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: {
      id_kecamatan: true,
      kode_kecamatan: true,
      nama_kecamatan: true,
      kabupaten: { select: { nama_kabupaten: true } }
    },
    orderBy: { nama_kecamatan: 'asc' },
  });
  return serialize(data);
}

export async function createDesa(data: {
  id_kecamatan: string;
  kode_desa: string;
  nama_desa: string;
  status_desa: string;
  klasifikasi?: string;
  kepala_desa?: string;
  luas_wilayah?: string;
  jumlah_penduduk?: string;
  jumlah_kk?: string;
  alamat_kantor?: string;
}) {
  try {
    await db.mst_desa.create({
      data: {
        id_kecamatan: BigInt(data.id_kecamatan),
        kode_desa: data.kode_desa,
        nama_desa: data.nama_desa,
        status_desa: data.status_desa,
        klasifikasi: data.klasifikasi || null,
        kepala_desa: data.kepala_desa || null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        jumlah_penduduk: data.jumlah_penduduk ? parseInt(data.jumlah_penduduk, 10) : null,
        jumlah_kk: data.jumlah_kk ? parseInt(data.jumlah_kk, 10) : null,
        alamat_kantor: data.alamat_kantor || null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/desa');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Desa sudah ada.' };
    return { success: false, error: error.message };
  }
}

export async function updateDesa(
  id: string,
  data: {
    id_kecamatan: string;
    kode_desa: string;
    nama_desa: string;
    status_desa: string;
    klasifikasi?: string;
    kepala_desa?: string;
    luas_wilayah?: string;
    jumlah_penduduk?: string;
    jumlah_kk?: string;
    alamat_kantor?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_desa.update({
      where: { id_desa: BigInt(id) },
      data: {
        id_kecamatan: BigInt(data.id_kecamatan),
        kode_desa: data.kode_desa,
        nama_desa: data.nama_desa,
        status_desa: data.status_desa,
        klasifikasi: data.klasifikasi || null,
        kepala_desa: data.kepala_desa || null,
        luas_wilayah: data.luas_wilayah ? parseFloat(data.luas_wilayah) : null,
        jumlah_penduduk: data.jumlah_penduduk ? parseInt(data.jumlah_penduduk, 10) : null,
        jumlah_kk: data.jumlah_kk ? parseInt(data.jumlah_kk, 10) : null,
        alamat_kantor: data.alamat_kantor || null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/desa');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Desa sudah digunakan.' };
    return { success: false, error: error.message };
  }
}

export async function deleteDesa(id: string) {
  try {
    await db.mst_desa.update({
      where: { id_desa: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/desa');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
