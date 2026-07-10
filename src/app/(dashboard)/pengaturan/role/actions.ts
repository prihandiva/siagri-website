'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const serialize = (obj: any) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));

export async function getRole() {
  const data = await db.mst_role.findMany({
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { id_role: 'asc' },
  });
  return serialize(data);
}

export async function createRole(data: {
  nama_role: string;
  kode_role: string;
  deskripsi?: string;
}) {
  try {
    await db.mst_role.create({
      data: {
        nama_role: data.nama_role,
        kode_role: data.kode_role,
        deskripsi: data.deskripsi || null,
      },
    });
    revalidatePath('/pengaturan/role');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode atau nama role sudah ada.' };
    return { success: false, error: error.message };
  }
}

export async function updateRole(
  id: string,
  data: { nama_role: string; kode_role: string; deskripsi?: string }
) {
  try {
    await db.mst_role.update({
      where: { id_role: BigInt(id) },
      data: {
        nama_role: data.nama_role,
        kode_role: data.kode_role,
        deskripsi: data.deskripsi || null,
      },
    });
    revalidatePath('/pengaturan/role');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Kode atau nama role sudah digunakan.' };
    return { success: false, error: error.message };
  }
}

export async function deleteRole(id: string) {
  try {
    // Cek apakah role masih dipakai oleh pengguna
    const count = await db.users.count({ where: { id_role: BigInt(id) } });
    if (count > 0) {
      return { success: false, error: `Role ini masih digunakan oleh ${count} pengguna dan tidak dapat dihapus.` };
    }
    await db.mst_role.delete({ where: { id_role: BigInt(id) } });
    revalidatePath('/pengaturan/role');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
