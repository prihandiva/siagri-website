import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const serialize = (obj: any) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

/**
 * GET /api/dashboard/wilayah-options
 *
 * Returns the list of territory options for the Topbar dropdown,
 * scoped to the logged-in user's role:
 *
 *  R001 (Super Admin)       → all provinsi
 *  R002 (Admin Provinsi)    → kabupaten in their provinsi
 *  R003 (Admin Kabupaten)   → kecamatan in their kabupaten
 *  R004 (Admin Kecamatan)   → desa in their kecamatan
 *  R005 (Admin Desa)        → just their own desa (disabled dropdown)
 *  Others                   → empty (no dropdown shown)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const role: string = user.role ?? "";

  try {
    let options: { id: string; label: string }[] = [];
    let dropdownType: string = "";

    switch (role) {
      // ── Super Admin: pilih provinsi ──
      case "R001": {
        dropdownType = "provinsi";
        const list = await db.mst_provinsi.findMany({
          where: { is_deleted: false, status_aktif: true },
          orderBy: { nama_provinsi: "asc" },
          select: { id_provinsi: true, nama_provinsi: true },
        });
        options = list.map((r) => ({
          id: r.id_provinsi.toString(),
          label: r.nama_provinsi,
        }));
        break;
      }

      // ── Admin Provinsi: pilih kabupaten dalam provinsinya ──
      case "R002": {
        dropdownType = "kabupaten";
        if (!user.idProvinsi) break;
        const list = await db.mst_kabupaten.findMany({
          where: {
            is_deleted: false,
            status_aktif: true,
            id_provinsi: BigInt(user.idProvinsi),
          },
          orderBy: { nama_kabupaten: "asc" },
          select: { id_kabupaten: true, nama_kabupaten: true },
        });
        options = list.map((r) => ({
          id: r.id_kabupaten.toString(),
          label: r.nama_kabupaten,
        }));
        break;
      }

      // ── Admin Kabupaten: pilih kecamatan dalam kabupatennya ──
      case "R003": {
        dropdownType = "kecamatan";
        if (!user.idKabupaten) break;
        const list = await db.mst_kecamatan.findMany({
          where: {
            is_deleted: false,
            status_aktif: true,
            id_kabupaten: BigInt(user.idKabupaten),
          },
          orderBy: { nama_kecamatan: "asc" },
          select: { id_kecamatan: true, nama_kecamatan: true },
        });
        options = list.map((r) => ({
          id: r.id_kecamatan.toString(),
          label: r.nama_kecamatan,
        }));
        break;
      }

      // ── Admin Kecamatan: pilih desa dalam kecamatannya ──
      case "R004": {
        dropdownType = "desa";
        if (!user.idKecamatan) break;
        const list = await db.mst_desa.findMany({
          where: {
            is_deleted: false,
            status_aktif: true,
            id_kecamatan: BigInt(user.idKecamatan),
          },
          orderBy: { nama_desa: "asc" },
          select: { id_desa: true, nama_desa: true },
        });
        options = list.map((r) => ({
          id: r.id_desa.toString(),
          label: r.nama_desa,
        }));
        break;
      }

      // ── Admin Desa: hanya desanya sendiri (disabled) ──
      case "R005": {
        dropdownType = "desa";
        if (!user.idDesa) break;
        const desa = await db.mst_desa.findUnique({
          where: { id_desa: BigInt(user.idDesa) },
          select: { id_desa: true, nama_desa: true },
        });
        if (desa) {
          options = [{ id: desa.id_desa.toString(), label: desa.nama_desa }];
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json(serialize({ dropdownType, options, role }));
  } catch (err: any) {
    console.error("[wilayah-options]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
