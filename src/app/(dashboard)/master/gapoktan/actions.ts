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
        select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } }
      },
      poktan: {
        where: { is_deleted: false },
        select: { id_poktan: true, nama_poktan: true, kode_poktan: true, jumlah_anggota: true }
      }
    },
    orderBy: { nama_gapoktan: 'asc' },
  });

  const formattedData = data.map(item => ({
    ...item,
    ketua_gapoktan: item.ketua || '',
    list_poktan: item.poktan || []
  }));

  return serialize(formattedData);
}

export async function createGapoktan(data: {
  id_desa: string;
  kode_gapoktan: string;
  nama_gapoktan: string;
  id_ketua?: string;
  ketua_gapoktan?: string;
  nomor_sk?: string;
  tahun_berdiri?: string;
}) {
  try {
    const newGapoktan = await db.mst_gapoktan.create({
      data: {
        id_desa: BigInt(data.id_desa),
        kode_gapoktan: data.kode_gapoktan,
        nama_gapoktan: data.nama_gapoktan,
        ketua: data.ketua_gapoktan || null,
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
        status_aktif: true,
      },
    });
    void newGapoktan; // suppress unused var

    // Ketua langsung disimpan di kolom gapoktan — tidak perlu tabel pengurus terpisah

    revalidatePath('/master/gapoktan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Gapoktan sudah ada.' };
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
    nomor_sk?: string;
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
        ketua: data.ketua_gapoktan || null,
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
        status_aktif: data.status_aktif,
      },
    });

    // Ketua disimpan langsung di kolom tabel gapoktan

    revalidatePath('/master/gapoktan');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode Gapoktan sudah digunakan.' };
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

export async function getDesaPetaniOptions() {
  const desaData = await db.mst_desa.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_desa: true, nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } },
    orderBy: { nama_desa: 'asc' }
  });
  
  const petaniData = await db.mst_petani.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_petani: true, nama_lengkap: true, nik: true, id_desa: true },
    orderBy: { nama_lengkap: 'asc' }
  });

  return serialize({ desa: desaData, petani: petaniData });
}
