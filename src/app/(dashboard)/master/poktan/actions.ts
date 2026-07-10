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
      },
      pengurus: {
        where: { jabatan: 'Ketua', is_deleted: false, aktif: true }
      }
    },
    orderBy: { nama_poktan: 'asc' },
  });

  const formattedData = data.map(item => ({
    ...item,
    id_ketua: item.pengurus[0]?.id_petani || '',
    ketua_poktan: item.pengurus[0]?.nama || ''
  }));

  return serialize(formattedData);
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
  id_ketua?: string;
  ketua_poktan?: string;
  kelas_kemampuan?: string;
  tahun_berdiri?: string;
}) {
  try {
    const newPoktan = await db.mst_poktan.create({
      data: {
        id_desa: BigInt(data.id_desa),
        id_gapoktan: data.id_gapoktan ? BigInt(data.id_gapoktan) : null,
        kode_poktan: data.kode_poktan,
        nama_poktan: data.nama_poktan,
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
        status_aktif: true,
      },
    });

    if (data.id_ketua || data.ketua_poktan) {
      await db.mst_pengurus_poktan.create({
        data: {
          id_poktan: newPoktan.id_poktan,
          id_petani: data.id_ketua ? BigInt(data.id_ketua) : null,
          nama: data.ketua_poktan || '',
          jabatan: 'Ketua',
        }
      });
    }

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
    id_ketua?: string;
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

    // Update or create Ketua
    const existingKetua = await db.mst_pengurus_poktan.findFirst({
      where: { id_poktan: BigInt(id), jabatan: 'Ketua', is_deleted: false }
    });

    if (existingKetua) {
      await db.mst_pengurus_poktan.update({
        where: { id_pengurus: existingKetua.id_pengurus },
        data: {
          id_petani: data.id_ketua ? BigInt(data.id_ketua) : null,
          nama: data.ketua_poktan || '',
        }
      });
    } else if (data.id_ketua || data.ketua_poktan) {
      await db.mst_pengurus_poktan.create({
        data: {
          id_poktan: BigInt(id),
          id_petani: data.id_ketua ? BigInt(data.id_ketua) : null,
          nama: data.ketua_poktan || '',
          jabatan: 'Ketua',
        }
      });
    }

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
