'use server';

import { db } from '@/lib/db';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getLaporanProduksi(filters: { id_desa?: string, tahun?: string, id_komoditas?: string }) {
  const where: any = { is_deleted: false };

  if (filters.id_komoditas) {
    where.id_komoditas = BigInt(filters.id_komoditas);
  }

  if (filters.tahun) {
    where.tahun = parseInt(filters.tahun);
  }

  if (filters.id_desa) {
    where.petani = { id_desa: BigInt(filters.id_desa) };
  }

  const data = await db.trx_produksi.findMany({
    where,
    include: {
      petani: {
        select: {
          nama_lengkap: true,
          nik: true,
          desa: { select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } } }
        }
      },
      lahan: {
        select: {
          kode_lahan: true,
          nama_lahan: true,
        }
      },
      komoditas: {
        select: { nama_komoditas: true, satuan: true, subsektor: true }
      }
    },
    orderBy: { created_at: 'desc' },
  });

  return serialize(data);
}

export async function getLaporanOptions() {
  const desaData = await db.mst_desa.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_desa: true, nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } },
    orderBy: { nama_desa: 'asc' },
  });

  const komoditasData = await db.mst_komoditas.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_komoditas: true, nama_komoditas: true },
    orderBy: { nama_komoditas: 'asc' },
  });

  return serialize({ desa: desaData, komoditas: komoditasData });
}
