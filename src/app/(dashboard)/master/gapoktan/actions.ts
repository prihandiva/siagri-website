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
      pengurus: {
        where: { jabatan: 'Ketua', is_deleted: false, aktif: true }
      },
      poktan: {
        where: { is_deleted: false },
        select: { id_poktan: true, nama_poktan: true, ketua_poktan: true, kode_poktan: true, anggota: { select: { _count: true } } }
      }
    },
    orderBy: { nama_gapoktan: 'asc' },
  });

  // Karena schema gapoktan berbeda, kita attach list_poktan & ketua
  const formattedData = data.map(item => ({
    ...item,
    id_ketua: item.pengurus[0]?.id_petani || '',
    ketua_gapoktan: item.pengurus[0]?.nama || '',
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
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
        status_aktif: true,
      },
    });

    if (data.id_ketua || data.ketua_gapoktan) {
      await db.mst_pengurus_gapoktan.create({
        data: {
          id_gapoktan: newGapoktan.id_gapoktan,
          id_petani: data.id_ketua ? BigInt(data.id_ketua) : null,
          nama: data.ketua_gapoktan || '',
          jabatan: 'Ketua',
        }
      });
    }

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
        tanggal_berdiri: data.tahun_berdiri ? new Date(`${data.tahun_berdiri}-01-01`) : null,
        status_aktif: data.status_aktif,
      },
    });

    const existingKetua = await db.mst_pengurus_gapoktan.findFirst({
      where: { id_gapoktan: BigInt(id), jabatan: 'Ketua', is_deleted: false }
    });

    if (existingKetua) {
      await db.mst_pengurus_gapoktan.update({
        where: { id_pengurus: existingKetua.id_pengurus },
        data: {
          id_petani: data.id_ketua ? BigInt(data.id_ketua) : null,
          nama: data.ketua_gapoktan || '',
        }
      });
    } else if (data.id_ketua || data.ketua_gapoktan) {
      await db.mst_pengurus_gapoktan.create({
        data: {
          id_gapoktan: BigInt(id),
          id_petani: data.id_ketua ? BigInt(data.id_ketua) : null,
          nama: data.ketua_gapoktan || '',
          jabatan: 'Ketua',
        }
      });
    }

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

export async function getDesaOptions() {
  const data = await db.mst_desa.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_desa: true, nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } },
    orderBy: { nama_desa: 'asc' }
  });
  return serialize(data);
}
