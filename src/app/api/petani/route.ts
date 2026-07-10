import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const serialize = (obj: any) => JSON.parse(
  JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id_desa = searchParams.get('id_desa');
  const id_poktan = searchParams.get('id_poktan');

  try {
    const whereClause: any = {
      is_deleted: false,
      status_aktif: true,
    };

    if (id_desa) {
      whereClause.id_desa = BigInt(id_desa);
    }
    
    if (id_poktan) {
      whereClause.id_poktan = BigInt(id_poktan);
    }

    const data = await db.mst_petani.findMany({
      where: whereClause,
      select: {
        id_petani: true,
        nik: true,
        nama_lengkap: true,
        id_desa: true,
        desa: { select: { nama_desa: true } }
      },
      orderBy: { nama_lengkap: 'asc' },
    });

    return NextResponse.json(serialize(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
