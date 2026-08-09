import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const serialize = (obj: any) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

/**
 * Builds a Prisma WHERE clause for trx_lahan based on the territory filter.
 * The filter chain:
 *   id_provinsi → id_kabupaten → id_kecamatan → id_desa
 */
function lahanWhere(filterId: string | null, filterType: string | null) {
  if (!filterId || !filterType) return {};
  const id = BigInt(filterId);
  switch (filterType) {
    case "provinsi":   return { id_provinsi: id };
    case "kabupaten":  return { id_kabupaten: id };
    case "kecamatan":  return { id_kecamatan: id };
    case "desa":       return { id_desa: id };
    default:           return {};
  }
}

/**
 * GET /api/dashboard?filter_id=<id>&filter_type=<type>
 *
 * Returns dashboard statistics scoped to the given territory filter.
 * The caller (DashboardClient) is responsible for passing the correct
 * filter based on user role.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterId   = searchParams.get("filter_id");
  const filterType = searchParams.get("filter_type");

  // Build lahan WHERE filter
  const lWhere = lahanWhere(filterId, filterType);

  try {
    // ─────────────────────────────────────────────────────────────
    // 1.  Resolve which lahan IDs fall in the selected territory
    // ─────────────────────────────────────────────────────────────
    const lahanList = await db.trx_lahan.findMany({
      where: { is_deleted: false, ...lWhere },
      select: {
        id_lahan: true,
        id_petani: true,
        luas_lahan: true,
        latitude: true,
        longitude: true,
        desa: { select: { nama_desa: true } },
      },
    });

    const lahanIds    = lahanList.map((l) => l.id_lahan);
    const petaniIdSet = new Set(lahanList.map((l) => l.id_petani.toString()));

    // ─────────────────────────────────────────────────────────────
    // 2.  KPI — Total Petani
    // ─────────────────────────────────────────────────────────────
    const totalPetani = petaniIdSet.size;

    // ─────────────────────────────────────────────────────────────
    // 3.  KPI — Luas Lahan (Ha)
    // ─────────────────────────────────────────────────────────────
    const luasTotal = lahanList.reduce(
      (sum, l) => sum + (parseFloat(l.luas_lahan?.toString() ?? "0") || 0),
      0
    );

    // ─────────────────────────────────────────────────────────────
    // 4.  Produksi — only for lahan in scope
    // ─────────────────────────────────────────────────────────────
    const produksiList = await db.trx_produksi.findMany({
      where: {
        is_deleted: false,
        id_lahan: { in: lahanIds },
      },
      select: {
        id_lahan: true,
        produksi: true,
        nilai_produksi: true,
        komoditas: { select: { id_komoditas: true, nama_komoditas: true } },
        lahan: {
          select: {
            latitude: true,
            longitude: true,
            desa: { select: { nama_desa: true } },
          },
        },
      },
    });

    // ─────────────────────────────────────────────────────────────
    // 5.  KPI — Total Produksi (Ton) & Nilai Produksi
    // ─────────────────────────────────────────────────────────────
    let totalProduksiTon = 0;
    let totalNilaiProduksi = 0;
    produksiList.forEach((p) => {
      totalProduksiTon   += parseFloat(p.produksi?.toString() ?? "0") || 0;
      totalNilaiProduksi += parseFloat(p.nilai_produksi?.toString() ?? "0") || 0;
    });

    // ─────────────────────────────────────────────────────────────
    // 6.  KPI — Total Bantuan
    // ─────────────────────────────────────────────────────────────
    // Bantuan linked to petani in scope (via id_petani)
    const petaniIds = [...petaniIdSet].map((id) => BigInt(id));
    const bantuanAgg = await db.trx_bantuan.aggregate({
      where: {
        is_deleted: false,
        id_petani: { in: petaniIds },
      },
      _sum: { nilai_bantuan: true },
    });
    const totalBantuan =
      parseFloat(bantuanAgg._sum.nilai_bantuan?.toString() ?? "0") || 0;

    // ─────────────────────────────────────────────────────────────
    // 7.  Produksi per Komoditas (Bar Chart)
    // ─────────────────────────────────────────────────────────────
    const komoditasMap = new Map<string, { nama: string; total: number }>();
    produksiList.forEach((p) => {
      const key  = p.komoditas.id_komoditas.toString();
      const nama = p.komoditas.nama_komoditas;
      const ton  = parseFloat(p.produksi?.toString() ?? "0") || 0;
      if (!komoditasMap.has(key)) komoditasMap.set(key, { nama, total: 0 });
      komoditasMap.get(key)!.total += ton;
    });

    const produksiKomoditas = [...komoditasMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map((k) => ({ name: k.nama, value: Math.round(k.total * 100) / 100 }));

    // ─────────────────────────────────────────────────────────────
    // 8.  Komoditas Unggulan Pie (% dari total produksi)
    // ─────────────────────────────────────────────────────────────
    const PIE_COLORS = ["#2E7D32","#F59E0B","#EF4444","#8B5CF6","#3B82F6","#10B981","#F97316","#9CA3AF"];
    const topKomoditas = [...komoditasMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const topTotal = topKomoditas.reduce((s, k) => s + k.total, 0) || 1;
    let assigned = 0;
    const komoditasUnggulan = topKomoditas.map((k, i) => {
      const pct = i < topKomoditas.length - 1
        ? Math.round((k.total / totalProduksiTon) * 100)
        : Math.max(0, 100 - assigned);
      assigned += pct;
      return { name: k.nama, value: pct, color: PIE_COLORS[i] ?? "#9CA3AF" };
    });

    // ─────────────────────────────────────────────────────────────
    // 9.  Map Markers — dari trx_produksi → trx_lahan.lat/lng
    // ─────────────────────────────────────────────────────────────
    const markersRaw: { lat: number; lng: number; nama: string; komoditas: string }[] = [];
    const seenLahan = new Set<string>();

    produksiList.forEach((p) => {
      const lat = parseFloat(p.lahan.latitude?.toString() ?? "");
      const lng = parseFloat(p.lahan.longitude?.toString() ?? "");
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const lahanKey = `${p.id_lahan}`;
        if (!seenLahan.has(lahanKey)) {
          seenLahan.add(lahanKey);
          markersRaw.push({
            lat,
            lng,
            nama: p.lahan.desa?.nama_desa ?? "—",
            komoditas: p.komoditas.nama_komoditas,
          });
        }
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 10. Bantuan Terbaru
    // ─────────────────────────────────────────────────────────────
    const bantuanTerbaru = await db.trx_bantuan.findMany({
      where: {
        is_deleted: false,
        id_petani: { in: petaniIds },
      },
      orderBy: { created_at: "desc" },
      take: 5,
      select: {
        nama_bantuan: true,
        nilai_bantuan: true,
        status_distribusi: true,
        created_at: true,
        jenis_bantuan_rel: { select: { nama_bantuan: true } },
      },
    });

    const bantuanFormatted = bantuanTerbaru.map((b) => ({
      title: b.jenis_bantuan_rel?.nama_bantuan ?? b.nama_bantuan,
      desc: b.status_distribusi,
      amount: b.nilai_bantuan
        ? `Rp ${Math.round(parseFloat(b.nilai_bantuan.toString())).toLocaleString("id-ID")}`
        : "—",
    }));

    // ─────────────────────────────────────────────────────────────
    // 11. Ringkasan Hari Ini (count of records created today)
    // ─────────────────────────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [petaniHariIni, produksiHariIni, bantuanHariIni] = await Promise.all([
      db.mst_petani.count({
        where: {
          is_deleted: false,
          created_at: { gte: todayStart },
          ...(petaniIds.length > 0 ? { id_petani: { in: petaniIds } } : {}),
        },
      }),
      db.trx_produksi.count({
        where: {
          is_deleted: false,
          created_at: { gte: todayStart },
          id_lahan: { in: lahanIds },
        },
      }),
      db.trx_bantuan.count({
        where: {
          is_deleted: false,
          created_at: { gte: todayStart },
          id_petani: { in: petaniIds },
        },
      }),
    ]);

    // ─────────────────────────────────────────────────────────────
    // Build response
    // ─────────────────────────────────────────────────────────────
    const response = {
      kpi: {
        totalPetani,
        luasLahan: Math.round(luasTotal * 100) / 100,
        totalProduksiTon: Math.round(totalProduksiTon * 100) / 100,
        nilaiProduksi: Math.round(totalNilaiProduksi),
        totalBantuan: Math.round(totalBantuan),
      },
      produksiKomoditas,
      komoditasUnggulan,
      mapMarkers: markersRaw,
      bantuanTerbaru: bantuanFormatted,
      ringkasanHariIni: {
        pendataanPetani: petaniHariIni,
        inputProduksi: produksiHariIni,
        verifikasiBantuan: bantuanHariIni,
      },
    };

    return NextResponse.json(serialize(response));
  } catch (err: any) {
    console.error("[dashboard-api]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
