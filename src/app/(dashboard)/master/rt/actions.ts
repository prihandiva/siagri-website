'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));

export async function getRt() {
  const data = await db.mst_rt.findMany({
    where: { is_deleted: false },
    include: {
      rw: {
        include: {
          dusun: {
            include: {
              desa: {
                include: { kecamatan: true },
              },
            },
          },
        },
      },
    },
    orderBy: [{ id_rw: 'asc' }, { kode_rt: 'asc' }],
  });
  return serialize(data);
}

export async function getRwList() {
  const data = await db.mst_rw.findMany({
    where: { is_deleted: false },
    include: {
      dusun: { include: { desa: true } },
    },
    orderBy: { nama_rw: 'asc' },
  });
  return serialize(data);
}

export async function createRt(data: {
  id_rw: string;
  kode_rt: string;
  nama_rt: string;
  ketua_rt?: string;
  no_hp?: string;
  jumlah_kk?: number;
  jumlah_jiwa?: number;
}) {
  try {
    await db.mst_rt.create({
      data: {
        id_rw: BigInt(data.id_rw),
        kode_rt: data.kode_rt,
        nama_rt: data.nama_rt,
        ketua_rt: data.ketua_rt || null,
        no_hp: data.no_hp || null,
        jumlah_kk: data.jumlah_kk || null,
        jumlah_jiwa: data.jumlah_jiwa || null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/rt');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode RT sudah ada di RW ini.' };
    return { success: false, error: error.message };
  }
}

export async function updateRt(
  id: string,
  data: {
    id_rw: string;
    kode_rt: string;
    nama_rt: string;
    ketua_rt?: string;
    no_hp?: string;
    jumlah_kk?: number;
    jumlah_jiwa?: number;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_rt.update({
      where: { id_rt: BigInt(id) },
      data: {
        id_rw: BigInt(data.id_rw),
        kode_rt: data.kode_rt,
        nama_rt: data.nama_rt,
        ketua_rt: data.ketua_rt || null,
        no_hp: data.no_hp || null,
        jumlah_kk: data.jumlah_kk || null,
        jumlah_jiwa: data.jumlah_jiwa || null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/rt');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode RT sudah digunakan di RW ini.' };
    return { success: false, error: error.message };
  }
}

export async function deleteRt(id: string) {
  try {
    await db.mst_rt.update({
      where: { id_rt: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/rt');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
