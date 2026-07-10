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
  id_ketua?: string;
  ketua_gapoktan?: string;
  id_sekretaris?: string;
  sekretaris_gapoktan?: string;
  id_bendahara?: string;
  bendahara_gapoktan?: string;
  no_sk?: string;
  tahun_berdiri?: string;
}) {
  try {
    await db.mst_gapoktan.create({
      data: {
        id_desa: BigInt(data.id_desa),
        kode_gapoktan: data.kode_gapoktan,
        nama_gapoktan: data.nama_gapoktan,
        id_ketua: data.id_ketua ? BigInt(data.id_ketua) : null,
        ketua: data.ketua_gapoktan || null,
        id_sekretaris: data.id_sekretaris ? BigInt(data.id_sekretaris) : null,
        sekretaris: data.sekretaris_gapoktan || null,
        id_bendahara: data.id_bendahara ? BigInt(data.id_bendahara) : null,
        bendahara: data.bendahara_gapoktan || null,
        nomor_registrasi: data.no_sk || null,
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
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
    id_ketua?: string;
    ketua_gapoktan?: string;
    id_sekretaris?: string;
    sekretaris_gapoktan?: string;
    id_bendahara?: string;
    bendahara_gapoktan?: string;
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
        id_ketua: data.id_ketua ? BigInt(data.id_ketua) : null,
        ketua: data.ketua_gapoktan || null,
        id_sekretaris: data.id_sekretaris ? BigInt(data.id_sekretaris) : null,
        sekretaris: data.sekretaris_gapoktan || null,
        id_bendahara: data.id_bendahara ? BigInt(data.id_bendahara) : null,
        bendahara: data.bendahara_gapoktan || null,
        nomor_registrasi: data.no_sk || null,
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
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
