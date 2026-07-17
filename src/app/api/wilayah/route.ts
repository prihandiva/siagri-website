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

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(serialize(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
