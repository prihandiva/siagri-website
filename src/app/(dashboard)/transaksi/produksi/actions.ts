'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getProduksi() {
  const data = await db.trx_produksi.findMany({
    where: { is_deleted: false },
    include: {
      lahan: {
        select: {
          kode_lahan: true,
          nama_lahan: true,
          latitude: true,
          longitude: true,
          luas_lahan: true,
          petani: {
            select: {
              nama_lengkap: true,
              desa: {
                select: {
                  nama_desa: true,
                  kecamatan: { select: { nama_kecamatan: true } }
                }
              }
            }
          },
        }
      },
      komoditas: {
        select: {
          nama_komoditas: true,
          satuan_rel: { select: { nama_satuan: true, simbol: true } },
          subsektor_rel: { select: { nama_subsektor: true } },
        }
      },
      petani: { select: { nama_lengkap: true, nik: true } },
      satuan_produksi: { select: { nama_satuan: true, simbol: true } },
      satuan_harga: { select: { nama_satuan: true, simbol: true } },
      foto_berkala: { orderBy: { tanggal_foto: 'asc' } },
    },
    orderBy: { created_at: 'desc' },
  });
  return serialize(data);
}

export async function getLahanKomoditasOptions(userSession?: any) {
  let lahanWhereClause: any = { is_deleted: false };

  // Jika user yang login adalah petani, filter berdasarkan relasi nik
  if (userSession && userSession.role === 'R009' && userSession.nik) {
    lahanWhereClause = {
      is_deleted: false,
      petani: { nik: userSession.nik }
    };
  }

  const lahanData = await db.trx_lahan.findMany({
    where: lahanWhereClause,
    select: {
      id_lahan: true,
      kode_lahan: true,
      nama_lahan: true,
      latitude: true,
      longitude: true,
      luas_lahan: true,
      petani: { select: { id_petani: true, nama_lengkap: true } },
    },
    orderBy: { kode_lahan: 'asc' },
  });

  const komoditasData = await db.mst_komoditas.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: {
      id_komoditas: true,
      nama_komoditas: true,
      satuan_rel: { select: { nama_satuan: true, simbol: true } },
    },
    orderBy: { nama_komoditas: 'asc' },
  });

  const satuanData = await db.mst_satuan.findMany({
    orderBy: { nama_satuan: 'asc' }
  });

  return serialize({ lahan: lahanData, komoditas: komoditasData, satuan: satuanData });
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

    const lahan = await db.trx_lahan.findUnique({
      where: { id_lahan: BigInt(data.id_lahan) },
      select: { id_petani: true }
    });

    const produksi = await db.trx_produksi.create({
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
        id_satuan_produksi: data.id_satuan_produksi ? parseInt(data.id_satuan_produksi) : null,
        id_satuan_harga: data.id_satuan_harga ? parseInt(data.id_satuan_harga) : null,
        nilai_produksi: nilaiProduksi,
        keterangan: data.keterangan || null,
        status_verifikasi: 'DRAFT',
      },
    });

    // Update koordinat lahan jika disediakan
    if (data.latitude && data.longitude) {
      await db.trx_lahan.update({
        where: { id_lahan: BigInt(data.id_lahan) },
        data: { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) },
      });
    }

    revalidatePath('/transaksi/produksi');
    return { success: true, id_produksi: produksi.id_produksi.toString() };
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
        id_satuan_produksi: data.id_satuan_produksi ? parseInt(data.id_satuan_produksi) : null,
        id_satuan_harga: data.id_satuan_harga ? parseInt(data.id_satuan_harga) : null,
        nilai_produksi: nilaiProduksi,
        keterangan: data.keterangan || null,
        status_verifikasi: data.status_verifikasi || 'DRAFT',
      },
    });

    // Update koordinat lahan jika disediakan
    if (data.latitude && data.longitude) {
      await db.trx_lahan.update({
        where: { id_lahan: BigInt(data.id_lahan) },
        data: { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) },
      });
    }

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

/** Simpan foto berkala ke trx_produksi_foto */
export async function uploadFotoProduksi(data: {
  id_produksi: string;
  foto_path: string;
  keterangan?: string;
  tanggal_foto: string;
  periode?: string;
}) {
  try {
    await db.trx_produksi_foto.create({
      data: {
        id_produksi: BigInt(data.id_produksi),
        foto_path: data.foto_path,
        keterangan: data.keterangan || null,
        tanggal_foto: new Date(data.tanggal_foto),
        periode: data.periode || null,
      },
    });
    revalidatePath('/transaksi/produksi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Hapus foto berkala */
export async function deleteFotoProduksi(id_foto: string) {
  try {
    await db.trx_produksi_foto.delete({
      where: { id_foto: BigInt(id_foto) },
    });
    revalidatePath('/transaksi/produksi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
