'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getBantuan() {
  // trx_bantuan hanya punya relasi ke petani (opsional), tidak ada relasi desa/gapoktan langsung
  const data = await db.trx_bantuan.findMany({
    where: { is_deleted: false },
    include: {
      petani: {
        select: {
          nama_lengkap: true,
          nik: true,
          desa: { select: { nama_desa: true } }
        }
      },
    },
    orderBy: { created_at: 'desc' },
  });
  return serialize(data);
}

export async function getBantuanOptions() {
  const petaniData = await db.mst_petani.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_petani: true, nama_lengkap: true, nik: true, id_desa: true },
    orderBy: { nama_lengkap: 'asc' },
  });

  const poktanData = await db.mst_poktan.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_poktan: true, nama_poktan: true, id_desa: true },
    orderBy: { nama_poktan: 'asc' },
  });

  return serialize({ petani: petaniData, poktan: poktanData });
}

export async function createBantuan(data: any) {
  try {
    await db.trx_bantuan.create({
      data: {
        id_petani: data.id_petani ? BigInt(data.id_petani) : null,
        id_poktan: data.id_poktan ? BigInt(data.id_poktan) : null,
        kode_bantuan: `BNT-${Date.now()}`,
        jenis_bantuan: data.jenis_bantuan,
        nama_bantuan: data.nama_bantuan,
        sumber_dana: data.sumber_dana || null,
        nilai_bantuan: data.nilai_bantuan ? parseFloat(data.nilai_bantuan) : null,
        volume: data.volume ? parseFloat(data.volume) : null,
        satuan: data.satuan || null,
        tanggal_pengajuan: data.tanggal_pengajuan ? new Date(data.tanggal_pengajuan) : null,
        tanggal_distribusi: data.tanggal_distribusi ? new Date(data.tanggal_distribusi) : null,
        status_distribusi: data.status_distribusi || 'DIAJUKAN',
        catatan: data.catatan || null,
      },
    });
    revalidatePath('/transaksi/bantuan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBantuan(id: string, data: any) {
  try {
    await db.trx_bantuan.update({
      where: { id_bantuan: BigInt(id) },
      data: {
        id_petani: data.id_petani ? BigInt(data.id_petani) : null,
        id_poktan: data.id_poktan ? BigInt(data.id_poktan) : null,
        jenis_bantuan: data.jenis_bantuan,
        nama_bantuan: data.nama_bantuan,
        sumber_dana: data.sumber_dana || null,
        nilai_bantuan: data.nilai_bantuan ? parseFloat(data.nilai_bantuan) : null,
        volume: data.volume ? parseFloat(data.volume) : null,
        satuan: data.satuan || null,
        tanggal_pengajuan: data.tanggal_pengajuan ? new Date(data.tanggal_pengajuan) : null,
        tanggal_distribusi: data.tanggal_distribusi ? new Date(data.tanggal_distribusi) : null,
        status_distribusi: data.status_distribusi || 'DIAJUKAN',
        catatan: data.catatan || null,
      },
    });
    revalidatePath('/transaksi/bantuan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBantuan(id: string) {
  try {
    await db.trx_bantuan.update({
      where: { id_bantuan: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/transaksi/bantuan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
