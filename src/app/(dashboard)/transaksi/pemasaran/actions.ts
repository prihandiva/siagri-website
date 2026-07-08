'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getPemasaran() {
  // trx_pemasaran tidak punya relasi desa dan produksi langsung, hanya ke petani dan komoditas
  const data = await db.trx_pemasaran.findMany({
    where: { is_deleted: false },
    include: {
      petani: {
        select: {
          nama_lengkap: true,
          nik: true,
          desa: { select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } } }
        }
      },
      komoditas: { select: { nama_komoditas: true, satuan: true } }
    },
    orderBy: { tanggal: 'desc' },
  });
  return serialize(data);
}

export async function getPemasaranOptions() {
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

  const komoditasData = await db.mst_komoditas.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_komoditas: true, nama_komoditas: true, satuan: true },
    orderBy: { nama_komoditas: 'asc' },
  });

  return serialize({ petani: petaniData, komoditas: komoditasData });
}

export async function createPemasaran(data: any) {
  try {
    const vol = data.volume ? parseFloat(data.volume) : null;
    const harga = data.harga_jual ? parseFloat(data.harga_jual) : null;
    const total = vol && harga ? vol * harga : null;

    await db.trx_pemasaran.create({
      data: {
        id_petani: BigInt(data.id_petani),
        id_komoditas: BigInt(data.id_komoditas),
        kode_pemasaran: `PMS-${Date.now()}`,
        tujuan_pasar: data.tujuan_pasar || null,
        nama_pembeli: data.nama_pembeli || null,
        volume: vol,
        satuan: data.satuan || null,
        harga_jual: harga,
        nilai_total: total,
        tanggal: data.tanggal ? new Date(data.tanggal) : null,
        keterangan: data.keterangan || null,
      },
    });
    revalidatePath('/transaksi/pemasaran');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePemasaran(id: string, data: any) {
  try {
    const vol = data.volume ? parseFloat(data.volume) : null;
    const harga = data.harga_jual ? parseFloat(data.harga_jual) : null;
    const total = vol && harga ? vol * harga : null;

    await db.trx_pemasaran.update({
      where: { id_pemasaran: BigInt(id) },
      data: {
        id_petani: BigInt(data.id_petani),
        id_komoditas: BigInt(data.id_komoditas),
        tujuan_pasar: data.tujuan_pasar || null,
        nama_pembeli: data.nama_pembeli || null,
        volume: vol,
        satuan: data.satuan || null,
        harga_jual: harga,
        nilai_total: total,
        tanggal: data.tanggal ? new Date(data.tanggal) : null,
        keterangan: data.keterangan || null,
      },
    });
    revalidatePath('/transaksi/pemasaran');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePemasaran(id: string) {
  try {
    await db.trx_pemasaran.update({
      where: { id_pemasaran: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/transaksi/pemasaran');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
