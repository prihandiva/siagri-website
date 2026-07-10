import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let data = [];

    switch (type) {
      case 'provinsi':
        data = await db.mst_provinsi.findMany({
          where: { is_deleted: false, status_aktif: true },
          orderBy: { nama_provinsi: 'asc' },
        });
        break;

      case 'kabupaten':
        const id_provinsi = searchParams.get('id_provinsi');
        if (!id_provinsi) return NextResponse.json({ error: 'id_provinsi required' }, { status: 400 });
        data = await db.mst_kabupaten.findMany({
          where: { is_deleted: false, status_aktif: true, id_provinsi: BigInt(id_provinsi) },
          orderBy: { nama_kabupaten: 'asc' },
        });
        break;

      case 'kecamatan':
        const id_kabupaten = searchParams.get('id_kabupaten');
        if (!id_kabupaten) return NextResponse.json({ error: 'id_kabupaten required' }, { status: 400 });
        data = await db.mst_kecamatan.findMany({
          where: { is_deleted: false, status_aktif: true, id_kabupaten: BigInt(id_kabupaten) },
          orderBy: { nama_kecamatan: 'asc' },
        });
        break;

      case 'desa':
        const id_kecamatan = searchParams.get('id_kecamatan');
        if (!id_kecamatan) return NextResponse.json({ error: 'id_kecamatan required' }, { status: 400 });
        data = await db.mst_desa.findMany({
          where: { is_deleted: false, status_aktif: true, id_kecamatan: BigInt(id_kecamatan) },
          orderBy: { nama_desa: 'asc' },
        });
        break;

      case 'dusun':
        const id_desa = searchParams.get('id_desa');
        if (!id_desa) return NextResponse.json({ error: 'id_desa required' }, { status: 400 });
        data = await db.mst_dusun.findMany({
          where: { is_deleted: false, status_aktif: true, id_desa: BigInt(id_desa) },
          orderBy: { nama_dusun: 'asc' },
        });
        break;

      case 'rw':
        const id_dusun = searchParams.get('id_dusun');
        if (!id_dusun) return NextResponse.json({ error: 'id_dusun required' }, { status: 400 });
        data = await db.mst_rw.findMany({
          where: { is_deleted: false, status_aktif: true, id_dusun: BigInt(id_dusun) },
          orderBy: { nama_rw: 'asc' },
        });
        break;

      case 'rt':
        const id_rw = searchParams.get('id_rw');
        if (!id_rw) return NextResponse.json({ error: 'id_rw required' }, { status: 400 });
        data = await db.mst_rt.findMany({
          where: { is_deleted: false, status_aktif: true, id_rw: BigInt(id_rw) },
          orderBy: { nama_rt: 'asc' },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(serialize(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
