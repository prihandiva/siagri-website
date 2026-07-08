'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getPenyuluh() {
  // mst_penyuluh: field nama (bukan nama_penyuluh), wilayah_binaan ke mst_poktan_penyuluh
  // mst_poktan_penyuluh tidak punya relasi desa, hanya ke penyuluh dan poktan
  const data = await db.mst_penyuluh.findMany({
    where: { is_deleted: false },
    include: {
      poktan_binaan: {
        include: {
          poktan: {
            select: {
              nama_poktan: true,
              desa: { select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } } }
            }
          }
        }
      }
    },
    orderBy: { nama: 'asc' },
  });
  return serialize(data);
}

export async function getKecamatanOptions() {
  const data = await db.mst_kecamatan.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: {
      id_kecamatan: true,
      nama_kecamatan: true,
    },
    orderBy: { nama_kecamatan: 'asc' },
  });
  return serialize(data);
}

export async function createPenyuluh(data: any) {
  try {
    await db.mst_penyuluh.create({
      data: {
        nip: data.nip || null,
        nama: data.nama,
        id_kecamatan: data.id_kecamatan ? BigInt(data.id_kecamatan) : null,
        no_hp: data.no_hp || null,
        instansi: data.instansi || null,
        jabatan: data.jabatan || null,
        email: data.email || null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/penyuluh');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'NIP Penyuluh sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updatePenyuluh(id: string, data: any) {
  try {
    await db.mst_penyuluh.update({
      where: { id_penyuluh: BigInt(id) },
      data: {
        nip: data.nip || null,
        nama: data.nama,
        id_kecamatan: data.id_kecamatan ? BigInt(data.id_kecamatan) : null,
        no_hp: data.no_hp || null,
        instansi: data.instansi || null,
        jabatan: data.jabatan || null,
        email: data.email || null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/penyuluh');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'NIP Penyuluh sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deletePenyuluh(id: string) {
  try {
    await db.mst_penyuluh.update({
      where: { id_penyuluh: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/penyuluh');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
