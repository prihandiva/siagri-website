'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getPetani() {
  const data = await db.mst_petani.findMany({
    where: { is_deleted: false },
    include: {
      desa: {
        select: { 
          nama_desa: true, 
          kecamatan: { select: { nama_kecamatan: true, kabupaten: { select: { nama_kabupaten: true, provinsi: { select: { nama_provinsi: true } } } } } } 
        }
      },
      lahan: {
        where: { is_deleted: false },
        select: { id_lahan: true, luas_lahan: true }
      },
      keanggotaan_poktan: {
        where: { status: 'AKTIF' },
        select: {
          poktan: { select: { id_poktan: true, nama_poktan: true } }
        }
      },
      pendidikan: true,
      pekerjaan: true
    },
    orderBy: { nama_lengkap: 'asc' },
  });
  return serialize(data);
}

export async function getDesaPoktanOptions() {
  const desaData = await db.mst_desa.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { 
      id_desa: true, 
      nama_desa: true,
      kecamatan: { select: { nama_kecamatan: true } }
    },
    orderBy: { nama_desa: 'asc' },
  });
  
  const poktanData = await db.mst_poktan.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { 
      id_poktan: true, 
      nama_poktan: true,
      id_desa: true
    },
    orderBy: { nama_poktan: 'asc' },
  });

  const pendidikanData = await db.mst_pendidikan.findMany({
    orderBy: { urutan: 'asc' },
  });

  const pekerjaanData = await db.mst_pekerjaan.findMany({
    orderBy: { nama_pekerjaan: 'asc' },
  });

  return serialize({ desa: desaData, poktan: poktanData, pendidikan: pendidikanData, pekerjaan: pekerjaanData });
}

export async function createPetani(data: any) {
  try {
    const newData = { ...data };
    delete newData.id_poktan;
    delete newData.rt;
    delete newData.rw;

    await db.mst_petani.create({
      data: {
        id_desa: BigInt(newData.id_desa),
        nik: newData.nik,
        nama_lengkap: newData.nama_lengkap,
        tempat_lahir: newData.tempat_lahir || null,
        tanggal_lahir: newData.tanggal_lahir ? new Date(newData.tanggal_lahir) : null,
        jenis_kelamin: newData.jenis_kelamin || null,
        alamat: newData.alamat || null,
        no_hp: newData.no_hp || null,
        status_perkawinan: newData.status_perkawinan || null,
        id_pendidikan: newData.id_pendidikan ? parseInt(newData.id_pendidikan, 10) : null,
        id_pekerjaan: newData.id_pekerjaan ? parseInt(newData.id_pekerjaan, 10) : null,
        pengalaman_tani_tahun: newData.pengalaman_tani_tahun ? parseInt(newData.pengalaman_tani_tahun, 10) : null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/petani');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'NIK Petani sudah terdaftar.' };
    return { success: false, error: error.message };
  }
}

export async function updatePetani(id: string, data: any) {
  try {
    const newData = { ...data };
    delete newData.id_poktan;
    delete newData.rt;
    delete newData.rw;

    await db.mst_petani.update({
      where: { id_petani: BigInt(id) },
      data: {
        id_desa: BigInt(newData.id_desa),
        nik: newData.nik,
        nama_lengkap: newData.nama_lengkap,
        tempat_lahir: newData.tempat_lahir || null,
        tanggal_lahir: newData.tanggal_lahir ? new Date(newData.tanggal_lahir) : null,
        jenis_kelamin: newData.jenis_kelamin || null,
        alamat: newData.alamat || null,
        no_hp: newData.no_hp || null,
        status_perkawinan: newData.status_perkawinan || null,
        id_pendidikan: newData.id_pendidikan ? parseInt(newData.id_pendidikan, 10) : null,
        id_pekerjaan: newData.id_pekerjaan ? parseInt(newData.id_pekerjaan, 10) : null,
        pengalaman_tani_tahun: newData.pengalaman_tani_tahun ? parseInt(newData.pengalaman_tani_tahun, 10) : null,
        status_aktif: newData.status_aktif,
      },
    });
    revalidatePath('/master/petani');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'NIK Petani sudah digunakan.' };
    return { success: false, error: error.message };
  }
}

export async function deletePetani(id: string) {
  try {
    await db.mst_petani.update({
      where: { id_petani: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/petani');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function gabungkanPetaniKePoktan(id_petani: string, id_poktan: string) {
  try {
    // Nonaktifkan keanggotaan lama
    await db.mst_anggota_poktan.updateMany({
      where: { id_petani: BigInt(id_petani), status: 'AKTIF' },
      data: { status: 'KELUAR' },
    });
    // Insert atau update
    const existing = await db.mst_anggota_poktan.findFirst({
      where: { id_poktan: BigInt(id_poktan), id_petani: BigInt(id_petani) }
    });
    if (existing) {
      await db.mst_anggota_poktan.update({
        where: { id_anggota: existing.id_anggota },
        data: { status: 'AKTIF' }
      });
    } else {
      await db.mst_anggota_poktan.create({
        data: {
          id_poktan: BigInt(id_poktan),
          id_petani: BigInt(id_petani),
          status: 'AKTIF',
        }
      });
    }
    revalidatePath('/master/petani');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function keluarkanPetaniDariPoktan(id_petani: string) {
  try {
    await db.mst_anggota_poktan.updateMany({
      where: { id_petani: BigInt(id_petani), status: 'AKTIF' },
      data: { status: 'KELUAR' },
    });
    revalidatePath('/master/petani');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
