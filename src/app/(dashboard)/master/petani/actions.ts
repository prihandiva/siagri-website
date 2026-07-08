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
        select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } }
      },
      poktan: {
        select: { nama_poktan: true }
      }
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

  return serialize({ desa: desaData, poktan: poktanData });
}

export async function createPetani(data: any) {
  try {
    await db.mst_petani.create({
      data: {
        id_desa: BigInt(data.id_desa),
        id_poktan: data.id_poktan ? BigInt(data.id_poktan) : null,
        nik: data.nik,
        nama_lengkap: data.nama_lengkap,
        tempat_lahir: data.tempat_lahir || null,
        tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
        jenis_kelamin: data.jenis_kelamin || null,
        alamat: data.alamat || null,
        rt: data.rt || null,
        rw: data.rw || null,
        no_hp: data.no_hp || null,
        pendidikan_terakhir: data.pendidikan_terakhir || null,
        status_perkawinan: data.status_perkawinan || null,
        nama_ibu_kandung: data.nama_ibu_kandung || null,
        pekerjaan_utama: data.pekerjaan_utama || null,
        pengalaman_tani_tahun: data.pengalaman_tani_tahun ? parseInt(data.pengalaman_tani_tahun, 10) : null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/petani');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'NIK Petani sudah terdaftar.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updatePetani(id: string, data: any) {
  try {
    await db.mst_petani.update({
      where: { id_petani: BigInt(id) },
      data: {
        id_desa: BigInt(data.id_desa),
        id_poktan: data.id_poktan ? BigInt(data.id_poktan) : null,
        nik: data.nik,
        nama_lengkap: data.nama_lengkap,
        tempat_lahir: data.tempat_lahir || null,
        tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
        jenis_kelamin: data.jenis_kelamin || null,
        alamat: data.alamat || null,
        rt: data.rt || null,
        rw: data.rw || null,
        no_hp: data.no_hp || null,
        pendidikan_terakhir: data.pendidikan_terakhir || null,
        status_perkawinan: data.status_perkawinan || null,
        nama_ibu_kandung: data.nama_ibu_kandung || null,
        pekerjaan_utama: data.pekerjaan_utama || null,
        pengalaman_tani_tahun: data.pengalaman_tani_tahun ? parseInt(data.pengalaman_tani_tahun, 10) : null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/petani');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'NIK Petani sudah digunakan.' };
    }
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
