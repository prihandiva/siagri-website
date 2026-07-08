'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getPoktan() {
  const data = await db.mst_poktan.findMany({
    where: { is_deleted: false },
    include: {
      desa: {
        select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } }
      },
      gapoktan: {
        select: { nama_gapoktan: true }
      }
    },
    orderBy: { nama_poktan: 'asc' },
  });
  return serialize(data);
}

export async function getDesaGapoktanOptions() {
  const desaData = await db.mst_desa.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { 
      id_desa: true, 
      nama_desa: true,
      kecamatan: { select: { nama_kecamatan: true } }
    },
    orderBy: { nama_desa: 'asc' },
  });
  
  const gapoktanData = await db.mst_gapoktan.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { 
      id_gapoktan: true, 
      nama_gapoktan: true,
      id_desa: true
    },
    orderBy: { nama_gapoktan: 'asc' },
  });

  return serialize({ desa: desaData, gapoktan: gapoktanData });
}

export async function createPoktan(data: {
  id_desa: string;
  id_gapoktan?: string;
  kode_poktan: string;
  nama_poktan: string;
  ketua_poktan?: string;
  kelas_kemampuan?: string;
  tahun_berdiri?: string;
}) {
  try {
    await db.mst_poktan.create({
      data: {
        id_desa: BigInt(data.id_desa),
        id_gapoktan: data.id_gapoktan ? BigInt(data.id_gapoktan) : null,
        kode_poktan: data.kode_poktan,
        nama_poktan: data.nama_poktan,
        // TODO: Simpan ketua_poktan ke mst_pengurus_poktan
        // TODO: Map kelas_kemampuan (string) ke id_kelas (int) jika perlu
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/poktan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Poktan sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updatePoktan(
  id: string,
  data: {
    id_desa: string;
    id_gapoktan?: string;
    kode_poktan: string;
    nama_poktan: string;
    ketua_poktan?: string;
    kelas_kemampuan?: string;
    tahun_berdiri?: string;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_poktan.update({
      where: { id_poktan: BigInt(id) },
      data: {
        id_desa: BigInt(data.id_desa),
        id_gapoktan: data.id_gapoktan ? BigInt(data.id_gapoktan) : null,
        kode_poktan: data.kode_poktan,
        nama_poktan: data.nama_poktan,
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/poktan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Poktan sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deletePoktan(id: string) {
  try {
    await db.mst_poktan.update({
      where: { id_poktan: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/poktan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
