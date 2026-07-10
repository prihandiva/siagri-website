'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));

export async function getRw() {
  const data = await db.mst_rw.findMany({
    where: { is_deleted: false },
    include: {
      dusun: {
        include: {
          desa: {
            include: {
              kecamatan: {
                include: { kabupaten: true },
              },
            },
          },
        },
      },
    },
    orderBy: [{ id_dusun: 'asc' }, { kode_rw: 'asc' }],
  });
  return serialize(data);
}

export async function getDusunList() {
  const data = await db.mst_dusun.findMany({
    where: { is_deleted: false },
    include: { desa: true },
    orderBy: { nama_dusun: 'asc' },
  });
  return serialize(data);
}

export async function createRw(data: {
  id_dusun: string;
  kode_rw: string;
  nama_rw: string;
  ketua_rw?: string;
  no_hp?: string;
  jumlah_rt?: number;
}) {
  try {
    await db.mst_rw.create({
      data: {
        id_dusun: BigInt(data.id_dusun),
        kode_rw: data.kode_rw,
        nama_rw: data.nama_rw,
        ketua_rw: data.ketua_rw || null,
        no_hp: data.no_hp || null,
        jumlah_rt: data.jumlah_rt || null,
        status_aktif: true,
      },
    });
    revalidatePath('/master/rw');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode RW sudah ada di dusun ini.' };
    return { success: false, error: error.message };
  }
}

export async function updateRw(
  id: string,
  data: {
    id_dusun: string;
    kode_rw: string;
    nama_rw: string;
    ketua_rw?: string;
    no_hp?: string;
    jumlah_rt?: number;
    status_aktif: boolean;
  }
) {
  try {
    await db.mst_rw.update({
      where: { id_rw: BigInt(id) },
      data: {
        id_dusun: BigInt(data.id_dusun),
        kode_rw: data.kode_rw,
        nama_rw: data.nama_rw,
        ketua_rw: data.ketua_rw || null,
        no_hp: data.no_hp || null,
        jumlah_rt: data.jumlah_rt || null,
        status_aktif: data.status_aktif,
      },
    });
    revalidatePath('/master/rw');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode RW sudah digunakan di dusun ini.' };
    return { success: false, error: error.message };
  }
}

export async function deleteRw(id: string) {
  try {
    await db.mst_rw.update({
      where: { id_rw: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/master/rw');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
