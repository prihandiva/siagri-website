'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function getPengguna() {
  const data = await db.sys_user.findMany({
    where: { is_deleted: false },
    include: {
      role: { select: { nama_role: true } },
      desa: { select: { nama_desa: true, kecamatan: { select: { nama_kecamatan: true } } } },
    },
    orderBy: { created_at: 'desc' },
  });
  return serialize(data);
}

export async function getRoleDesaOptions() {
  const roleData = await db.sys_role.findMany({
    select: { id_role: true, nama_role: true },
    orderBy: { id_role: 'asc' },
  });
  
  const desaData = await db.mst_desa.findMany({
    where: { is_deleted: false, status_aktif: true },
    select: { id_desa: true, nama_desa: true },
    orderBy: { nama_desa: 'asc' },
  });

  return serialize({ roles: roleData, desa: desaData });
}

export async function createPengguna(data: any) {
  try {
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    await db.sys_user.create({
      data: {
        id_role: parseInt(data.id_role, 10),
        id_desa: data.id_desa ? BigInt(data.id_desa) : null,
        username: data.username,
        password: hashedPassword,
        nama_lengkap: data.nama_lengkap,
        email: data.email || null,
        no_hp: data.no_hp || null,
        status: data.status_aktif === false ? 'NONAKTIF' : 'AKTIF',
      },
    });
    revalidatePath('/pengaturan/pengguna');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Username atau Email sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function updatePengguna(id: string, data: any) {
  try {
    const updateData: any = {
      id_role: parseInt(data.id_role, 10),
      id_desa: data.id_desa ? BigInt(data.id_desa) : null,
      username: data.username,
      nama_lengkap: data.nama_lengkap,
      email: data.email || null,
      no_hp: data.no_hp || null,
      status: data.status_aktif === false ? 'NONAKTIF' : 'AKTIF',
    };

    if (data.password) {
      updateData.password = bcrypt.hashSync(data.password, 10);
    }

    await db.sys_user.update({
      where: { id_user: BigInt(id) },
      data: updateData,
    });
    revalidatePath('/pengaturan/pengguna');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Username atau Email sudah digunakan.' };
    }
    return { success: false, error: error.message };
  }
}

export async function deletePengguna(id: string) {
  try {
    await db.sys_user.update({
      where: { id_user: BigInt(id) },
      data: { is_deleted: true },
    });
    revalidatePath('/pengaturan/pengguna');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
