const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database SIAGRI...\n");

  // ─── ROLES ───────────────────────────────────────
  console.log("📋 Membuat Role...");
  const roles = [
    { kode_role: "R001", nama_role: "Super Admin",          deskripsi: "Nasional" },
    { kode_role: "R002", nama_role: "Admin Provinsi",       deskripsi: "Provinsi" },
    { kode_role: "R003", nama_role: "Admin Kabupaten",      deskripsi: "Kabupaten" },
    { kode_role: "R004", nama_role: "Admin Kecamatan",      deskripsi: "Kecamatan" },
    { kode_role: "R005", nama_role: "Admin Desa",           deskripsi: "Desa" },
    { kode_role: "R006", nama_role: "Penyuluh Pertanian",   deskripsi: "Wilayah Binaan" },
    { kode_role: "R007", nama_role: "Ketua Gapoktan",       deskripsi: "Desa" },
    { kode_role: "R008", nama_role: "Ketua Poktan",         deskripsi: "Kelompok" },
    { kode_role: "R009", nama_role: "Petani",               deskripsi: "Individu" },
    { kode_role: "R010", nama_role: "Pimpinan (Read Only)", deskripsi: "Semua Level" },
    { kode_role: "R011", nama_role: "Auditor",              deskripsi: "Semua Level" },
  ];

  for (const role of roles) {
    await prisma.sys_role.upsert({
      where: { kode_role: role.kode_role },
      update: {},
      create: role,
    });
  }
  console.log(`   ✅ ${roles.length} role berhasil dibuat`);

  // ─── PROVINSI ─────────────────────────────────────
  console.log("\n🗺️  Membuat Wilayah (contoh Jawa Timur)...");
  const provinsi = await prisma.mst_provinsi.upsert({
    where: { kode_provinsi: "35" },
    update: {},
    create: {
      kode_provinsi: "35",
      nama_provinsi: "Jawa Timur",
    },
  });

  const kabupaten = await prisma.mst_kabupaten.upsert({
    where: { kode_kabupaten: "3507" },
    update: {},
    create: {
      id_provinsi: provinsi.id_provinsi,
      kode_kabupaten: "3507",
      nama_kabupaten: "Kabupaten Banyuwangi",
    },
  });

  const kecamatan = await prisma.mst_kecamatan.upsert({
    where: { kode_kecamatan: "350726" },
    update: {},
    create: {
      id_kabupaten: kabupaten.id_kabupaten,
      kode_kecamatan: "350726",
      nama_kecamatan: "Kecamatan Tegalsari",
    },
  });

  const desa = await prisma.mst_desa.upsert({
    where: { kode_desa: "3507262001" },
    update: {},
    create: {
      id_kecamatan: kecamatan.id_kecamatan,
      kode_desa: "3507262001",
      nama_desa: "Desa Makmur",
      luas_wilayah: 125.5,
    },
  });
  console.log(`   ✅ Wilayah: ${provinsi.nama_provinsi} > ${kabupaten.nama_kabupaten} > ${kecamatan.nama_kecamatan} > ${desa.nama_desa}`);

  // ─── KOMODITAS ─────────────────────────────────────
  console.log("\n🌾 Membuat Komoditas...");
  const komoditasList = [
    { kode_komoditas: "TP001", nama_komoditas: "Padi",          subsektor: "TP", satuan: "Ton" },
    { kode_komoditas: "TP002", nama_komoditas: "Jagung",         subsektor: "TP", satuan: "Ton" },
    { kode_komoditas: "TP003", nama_komoditas: "Kedelai",        subsektor: "TP", satuan: "Ton" },
    { kode_komoditas: "TP004", nama_komoditas: "Ubi Kayu",       subsektor: "TP", satuan: "Ton" },
    { kode_komoditas: "TP005", nama_komoditas: "Ubi Jalar",      subsektor: "TP", satuan: "Ton" },
    { kode_komoditas: "HT001", nama_komoditas: "Cabai Besar",    subsektor: "HT", satuan: "Kg" },
    { kode_komoditas: "HT002", nama_komoditas: "Cabai Rawit",    subsektor: "HT", satuan: "Kg" },
    { kode_komoditas: "HT003", nama_komoditas: "Bawang Merah",   subsektor: "HT", satuan: "Kg" },
    { kode_komoditas: "HT004", nama_komoditas: "Bawang Putih",   subsektor: "HT", satuan: "Kg" },
    { kode_komoditas: "HT005", nama_komoditas: "Tomat",          subsektor: "HT", satuan: "Kg" },
    { kode_komoditas: "PB001", nama_komoditas: "Kopi Robusta",   subsektor: "PB", satuan: "Ton" },
    { kode_komoditas: "PB002", nama_komoditas: "Kakao",          subsektor: "PB", satuan: "Ton" },
    { kode_komoditas: "PB003", nama_komoditas: "Kelapa",         subsektor: "PB", satuan: "Ton" },
    { kode_komoditas: "PK001", nama_komoditas: "Ikan Lele",      subsektor: "PK", satuan: "Kg" },
    { kode_komoditas: "PK002", nama_komoditas: "Ikan Nila",      subsektor: "PK", satuan: "Kg" },
    { kode_komoditas: "PT001", nama_komoditas: "Sapi Potong",    subsektor: "PT", satuan: "Ekor" },
    { kode_komoditas: "PT002", nama_komoditas: "Kambing",        subsektor: "PT", satuan: "Ekor" },
    { kode_komoditas: "PT003", nama_komoditas: "Ayam Broiler",   subsektor: "PT", satuan: "Ekor" },
  ];

  for (const k of komoditasList) {
    await prisma.mst_komoditas.upsert({
      where: { kode_komoditas: k.kode_komoditas },
      update: {},
      create: k,
    });
  }
  console.log(`   ✅ ${komoditasList.length} komoditas berhasil dibuat`);

  // ─── SUPER ADMIN USER ─────────────────────────────
  console.log("\n👤 Membuat Super Admin...");
  const superAdminRole = await prisma.sys_role.findUnique({ where: { kode_role: "R001" } });
  const hashedPassword = await bcrypt.hash("siagri2024", 12);

  await prisma.sys_user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      id_role: superAdminRole.id_role,
      username: "superadmin",
      email: "admin@siagri.id",
      password: hashedPassword,
      nama_lengkap: "Super Administrator",
      no_hp: "08123456789",
      status: "AKTIF",
    },
  });

  // Admin Desa
  const adminDesaRole = await prisma.sys_role.findUnique({ where: { kode_role: "R005" } });
  await prisma.sys_user.upsert({
    where: { username: "admindesa" },
    update: {},
    create: {
      id_role: adminDesaRole.id_role,
      id_desa: desa.id_desa,
      username: "admindesa",
      email: "desa@siagri.id",
      password: hashedPassword,
      nama_lengkap: "Admin Desa Makmur",
      status: "AKTIF",
    },
  });

  console.log("   ✅ User berhasil dibuat:");
  console.log("   📌 Username: superadmin  | Password: siagri2024 | Role: Super Admin");
  console.log("   📌 Username: admindesa   | Password: siagri2024 | Role: Admin Desa");

  console.log("\n✨ Seeding selesai!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
