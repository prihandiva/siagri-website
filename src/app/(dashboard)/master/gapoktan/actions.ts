'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getGapoktan() {
  const data = await db.mst_gapoktan.findMany({
    where: { is_deleted: false },
    include: {
      desa: {
        select: { 
          nama_desa: true,
          kecamatan: { select: { nama_kecamatan: true } }
        }
      }
    },
    orderBy: { nama_gapoktan: 'asc' },
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

export async function createGapoktan(data: {
  id_desa: string;
  kode_gapoktan: string;
  nama_gapoktan: string;
  ketua_gapoktan?: string;
  no_sk?: string;
  tahun_berdiri?: string;
}) {
  try {
    await db.mst_gapoktan.create({
      data: {
        id_desa: BigInt(data.id_desa),
        kode_gapoktan: data.kode_gapoktan,
        nama_gapoktan: data.nama_gapoktan,
        ketua_gapoktan: data.ketua_gapoktan || null,
        no_sk: data.no_sk || null,
        tahun_berdiri: data.tahun_berdiri ? parseInt(data.tahun_berdiri, 10) : null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/gapoktan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Gapoktan sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updateGapoktan(
  id: string,
  data: {
    id_desa: string;
    kode_gapoktan: string;
    nama_gapoktan: string;
    ketua_gapoktan?: string;
    no_sk?: string;
    tahun_berdiri?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_gapoktan.update({
      where: { id_gapoktan: BigInt(id) },
      data: {
        id_desa: BigInt(data.id_desa),
        kode_gapoktan: data.kode_gapoktan,
        nama_gapoktan: data.nama_gapoktan,
        ketua_gapoktan: data.ketua_gapoktan || null,
        no_sk: data.no_sk || null,
        tahun_berdiri: data.tahun_berdiri ? parseInt(data.tahun_berdiri, 10) : null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/gapoktan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Gapoktan sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteGapoktan(id: string) {
  try {
    await db.mst_gapoktan.update({
      where: { id_gapoktan: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/gapoktan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
