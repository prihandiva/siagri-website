'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getLahan(userSession?: any) {
  let whereClause: any = { is_deleted: false };
  if (userSession && userSession.role === 'R009' && userSession.nik) {
    whereClause = { is_deleted: false, petani: { nik: userSession.nik } };
  }

  const data = await db.trx_lahan.findMany({
    where: whereClause,
    include: {
      petani: {
        select: {
          nama_lengkap: true,
          nik: true,
          desa: { select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } } }
        }
      },
      desa: { select: { nama_desa: true } },
      provinsi: { select: { nama_provinsi: true } },
      kabupaten: { select: { nama_kabupaten: true } },
      kecamatan: { select: { nama_kecamatan: true } },
      status_lahan_rel: { select: { nama_status: true } }
    },
    orderBy: { id_lahan: 'desc' },
  });
  return serialize(data);
}

export async function getPetaniDesaOptions(userSession?: any) {
  let whereClause: any = { is_deleted: false, status_aktif: true };
  if (userSession && userSession.role === 'R009' && userSession.nik) {
    whereClause = { is_deleted: false, status_aktif: true, nik: userSession.nik };
  }

  const petaniData = await db.mst_petani.findMany({
    where: whereClause,
    select: {
      id_petani: true,
      nama_lengkap: true,
      nik: true,
      id_desa: true,
      desa: { select: { nama_desa: true } }
    },
    orderBy: { nama_lengkap: 'asc' },
  });

  const desaData = await db.mst_desa.findMany({
    select: { id_desa: true, kode_desa: true, nama_desa: true }
  });

  return serialize({ petani: petaniData, desa: desaData, dusun: [] });
}

export async function getStatusLahanOptions() {
  const data = await db.mst_status_lahan.findMany({
    orderBy: { nama_status: 'asc' }
  });
  return serialize(data);
}

async function resolveWilayahHierarchy(id_desa?: string | number | null) {
  if (!id_desa) return { id_kecamatan: null, id_kabupaten: null, id_provinsi: null };
  const desa = await db.mst_desa.findUnique({
    where: { id_desa: BigInt(id_desa) },
    include: { kecamatan: { include: { kabupaten: true } } }
  });
  return {
    id_kecamatan: desa?.id_kecamatan || null,
    id_kabupaten: desa?.kecamatan?.id_kabupaten || null,
    id_provinsi: desa?.kecamatan?.kabupaten?.id_provinsi || null,
  };
}

export async function createLahan(data: any) {
  try {
    const wilayah = await resolveWilayahHierarchy(data.id_desa);
    await db.trx_lahan.create({
      data: {
        id_petani: BigInt(data.id_petani),
        id_desa: data.id_desa ? BigInt(data.id_desa) : null,
        id_kecamatan: wilayah.id_kecamatan,
        id_kabupaten: wilayah.id_kabupaten,
        id_provinsi: wilayah.id_provinsi,
        kode_lahan: data.kode_lahan,
        nama_lahan: data.nama_lahan || null,
        luas_lahan: parseFloat(data.luas_lahan),
        id_status_lahan: data.id_status_lahan ? parseInt(data.id_status_lahan) : null,
        jenis_irigasi: data.jenis_irigasi || null,
        jenis_tanah: data.jenis_tanah || null,
        sumber_air: data.sumber_air || null,
        ketinggian: data.ketinggian ? parseInt(data.ketinggian) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        keterangan: data.keterangan || null,
      },
    });
    revalidatePath('/master/lahan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Lahan sudah ada.' };
    return { success: false, error: error.message };
  }
}

export async function updateLahan(id: string, data: any) {
  try {
    const wilayah = await resolveWilayahHierarchy(data.id_desa);
    await db.trx_lahan.update({
      where: { id_lahan: BigInt(id) },
      data: {
        id_petani: BigInt(data.id_petani),
        id_desa: data.id_desa ? BigInt(data.id_desa) : null,
        id_kecamatan: wilayah.id_kecamatan,
        id_kabupaten: wilayah.id_kabupaten,
        id_provinsi: wilayah.id_provinsi,
        kode_lahan: data.kode_lahan,
        nama_lahan: data.nama_lahan || null,
        luas_lahan: parseFloat(data.luas_lahan),
        id_status_lahan: data.id_status_lahan ? parseInt(data.id_status_lahan) : null,
        jenis_irigasi: data.jenis_irigasi || null,
        jenis_tanah: data.jenis_tanah || null,
        sumber_air: data.sumber_air || null,
        ketinggian: data.ketinggian ? parseInt(data.ketinggian) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        keterangan: data.keterangan || null,
      },
    });
    revalidatePath('/master/lahan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Lahan sudah digunakan.' };
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
