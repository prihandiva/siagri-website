'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getProduksi() {
  // trx_lahan tidak punya relasi desa langsung; ambil wilayah via petani->desa
  const data = await db.trx_produksi.findMany({
    where: { is_deleted: false },
    include: {
      lahan: {
        select: {
          kode_lahan: true,
          nama_lahan: true,
          petani: {
            select: {
              nama_lengkap: true,
              desa: { select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } } }
            }
          },
        }
      },
      komoditas: { select: { nama_komoditas: true, satuan: true, subsektor: true } },
      petani: { select: { nama_lengkap: true, nik: true } }
    },
    orderBy: { created_at: 'desc' },
  });
  return serialize(data);
}

export async function getLahanKomoditasOptions() {
  const lahanData = await db.trx_lahan.findMany({
    where: { is_deleted: false },
    select: {
      id_lahan: true,
      kode_lahan: true,
      nama_lahan: true,
      petani: { select: { id_petani: true, nama_lengkap: true } },
    },
    orderBy: { kode_lahan: 'asc' },
  });

  const komoditasData = await db.mst_komoditas.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: {
      id_komoditas: true,
      nama_komoditas: true,
      satuan: true
    },
    orderBy: { nama_komoditas: 'asc' },
  });

  const petaniData = await db.mst_petani.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_petani: true, nama_lengkap: true, nik: true },
    orderBy: { nama_lengkap: 'asc' },
  });

  return serialize({ lahan: lahanData, komoditas: komoditasData, petani: petaniData });
}

export async function createProduksi(data: any) {
  try {
    const luasPanen = data.luas_panen ? parseFloat(data.luas_panen) : null;
    const produksiVal = data.produksi ? parseFloat(data.produksi) : null;
    const hargaJual = data.harga_jual ? parseFloat(data.harga_jual) : null;
    let produktivitas = null;
    let nilaiProduksi = null;
    if (luasPanen && luasPanen > 0 && produksiVal) {
      produktivitas = produksiVal / luasPanen;
    }
    if (produksiVal && hargaJual) {
      nilaiProduksi = produksiVal * hargaJual;
    }

    // Ambil id_petani dari lahan
    const lahan = await db.trx_lahan.findUnique({
      where: { id_lahan: BigInt(data.id_lahan) },
      select: { id_petani: true }
    });

    await db.trx_produksi.create({
      data: {
        id_petani: lahan!.id_petani,
        id_lahan: BigInt(data.id_lahan),
        id_komoditas: BigInt(data.id_komoditas),
        kode_produksi: `PRD-${Date.now()}`,
        tahun: data.tanggal_tanam ? new Date(data.tanggal_tanam).getFullYear() : new Date().getFullYear(),
        musim_tanam: data.musim_tanam || null,
        tanggal_tanam: data.tanggal_tanam ? new Date(data.tanggal_tanam) : null,
        tanggal_panen: data.tanggal_panen ? new Date(data.tanggal_panen) : null,
        luas_tanam: data.luas_tanam ? parseFloat(data.luas_tanam) : null,
        luas_panen: luasPanen,
        produksi: produksiVal,
        produktivitas: produktivitas,
        harga_jual: hargaJual,
        nilai_produksi: nilaiProduksi,
        keterangan: data.keterangan || null,
        status_verifikasi: 'DRAFT',
      },
    });
    revalidatePath('/transaksi/produksi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProduksi(id: string, data: any) {
  try {
    const luasPanen = data.luas_panen ? parseFloat(data.luas_panen) : null;
    const produksiVal = data.produksi ? parseFloat(data.produksi) : null;
    const hargaJual = data.harga_jual ? parseFloat(data.harga_jual) : null;
    let produktivitas = null;
    let nilaiProduksi = null;
    if (luasPanen && luasPanen > 0 && produksiVal) {
      produktivitas = produksiVal / luasPanen;
    }
    if (produksiVal && hargaJual) {
      nilaiProduksi = produksiVal * hargaJual;
    }

    await db.trx_produksi.update({
      where: { id_produksi: BigInt(id) },
      data: {
        id_lahan: BigInt(data.id_lahan),
        id_komoditas: BigInt(data.id_komoditas),
        tahun: data.tanggal_tanam ? new Date(data.tanggal_tanam).getFullYear() : new Date().getFullYear(),
        musim_tanam: data.musim_tanam || null,
        tanggal_tanam: data.tanggal_tanam ? new Date(data.tanggal_tanam) : null,
        tanggal_panen: data.tanggal_panen ? new Date(data.tanggal_panen) : null,
        luas_tanam: data.luas_tanam ? parseFloat(data.luas_tanam) : null,
        luas_panen: luasPanen,
        produksi: produksiVal,
        produktivitas: produktivitas,
        harga_jual: hargaJual,
        nilai_produksi: nilaiProduksi,
        keterangan: data.keterangan || null,
        status_verifikasi: data.status_verifikasi || 'DRAFT',
      },
    });
    revalidatePath('/transaksi/produksi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduksi(id: string) {
  try {
    await db.trx_produksi.update({
      where: { id_produksi: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/transaksi/produksi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyProduksi(id: string, status: string, catatan?: string) {
  try {
    await db.trx_produksi.update({
      where: { id_produksi: BigInt(id) },
      data: {
        status_verifikasi: status,
        catatan_verifikasi: catatan || null,
      },
    });
    revalidatePath('/transaksi/produksi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
