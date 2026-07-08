'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getLahan() {
  // trx_lahan tidak punya relasi langsung ke desa, hanya ke dusun (mst_dusun)
  // Ambil via petani->desa
  const data = await db.trx_lahan.findMany({
    where: { is_deleted: false },
    include: {
      petani: {
        select: {
          nama_lengkap: true,
          nik: true,
          desa: { select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } } }
        }
      },
      dusun: { select: { nama_dusun: true } }
    },
    orderBy: { id_lahan: 'desc' },
  });
  return serialize(data);
}

export async function getPetaniDesaOptions() {
  const petaniData = await db.mst_petani.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: {
      id_petani: true,
      nama_lengkap: true,
      nik: true,
      id_desa: true,
      desa: { select: { nama_desa: true } }
    },
    orderBy: { nama_lengkap: 'asc' },
  });

  const dusunData = await db.mst_dusun.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: {
      id_dusun: true,
      nama_dusun: true,
      id_desa: true
    },
    orderBy: { nama_dusun: 'asc' },
  });

  return serialize({ petani: petaniData, dusun: dusunData });
}

export async function createLahan(data: any) {
  try {
    await db.trx_lahan.create({
      data: {
        id_petani: BigInt(data.id_petani),
        id_dusun: data.id_dusun ? BigInt(data.id_dusun) : null,
        kode_lahan: data.kode_lahan,
        nama_lahan: data.nama_lahan || null,
        luas_lahan: parseFloat(data.luas_lahan),
        status_lahan: data.status_lahan || 'MILIK',
        jenis_irigasi: data.jenis_irigasi || null,
        jenis_tanah: data.jenis_tanah || null,
        keterangan: data.keterangan || null,
      },
    });
    revalidatePath('/master/lahan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Lahan sudah ada.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updateLahan(id: string, data: any) {
  try {
    await db.trx_lahan.update({
      where: { id_lahan: BigInt(id) },
      data: {
        id_petani: BigInt(data.id_petani),
        id_dusun: data.id_dusun ? BigInt(data.id_dusun) : null,
        kode_lahan: data.kode_lahan,
        nama_lahan: data.nama_lahan || null,
        luas_lahan: parseFloat(data.luas_lahan),
        status_lahan: data.status_lahan || 'MILIK',
        jenis_irigasi: data.jenis_irigasi || null,
        jenis_tanah: data.jenis_tanah || null,
        keterangan: data.keterangan || null,
      },
    });
    revalidatePath('/master/lahan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Kode Lahan sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteLahan(id: string) {
  try {
    await db.trx_lahan.update({
      where: { id_lahan: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/lahan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
