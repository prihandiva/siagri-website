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

  // ─── PROVINSI (38 Provinsi Indonesia) ────────────────
  console.log("\n🗺️  Membuat Wilayah (38 Provinsi Indonesia)...");
  const daftarProvinsi = [
    { kode_provinsi: "PRV01", nama_provinsi: "Nangroe Aceh Darussalam", singkatan: "NAD" },
    { kode_provinsi: "PRV02", nama_provinsi: "Sumatera Utara",          singkatan: "SUMUT" },
    { kode_provinsi: "PRV03", nama_provinsi: "Sumatera Barat",          singkatan: "SUMBAR" },
    { kode_provinsi: "PRV04", nama_provinsi: "Riau",                    singkatan: "RIAU" },
    { kode_provinsi: "PRV05", nama_provinsi: "Jambi",                   singkatan: "JAMBI" },
    { kode_provinsi: "PRV06", nama_provinsi: "Sumatera Selatan",        singkatan: "SUMSEL" },
    { kode_provinsi: "PRV07", nama_provinsi: "Bengkulu",                singkatan: "BENGKULU" },
    { kode_provinsi: "PRV08", nama_provinsi: "Lampung",                 singkatan: "LAMPUNG" },
    { kode_provinsi: "PRV09", nama_provinsi: "Kepulauan Bangka Belitung", singkatan: "BABEL" },
    { kode_provinsi: "PRV10", nama_provinsi: "Kepulauan Riau",          singkatan: "KEPRI" },
    { kode_provinsi: "PRV11", nama_provinsi: "DKI Jakarta",             singkatan: "DKI" },
    { kode_provinsi: "PRV12", nama_provinsi: "Jawa Barat",              singkatan: "JABAR" },
    { kode_provinsi: "PRV13", nama_provinsi: "Jawa Tengah",             singkatan: "JATENG" },
    { kode_provinsi: "PRV14", nama_provinsi: "DI Yogyakarta",           singkatan: "DIY" },
    { kode_provinsi: "PRV15", nama_provinsi: "Jawa Timur",              singkatan: "JATIM" },
    { kode_provinsi: "PRV16", nama_provinsi: "Banten",                  singkatan: "BANTEN" },
    { kode_provinsi: "PRV17", nama_provinsi: "Bali",                    singkatan: "BALI" },
    { kode_provinsi: "PRV18", nama_provinsi: "Nusa Tenggara Barat",     singkatan: "NTB" },
    { kode_provinsi: "PRV19", nama_provinsi: "Nusa Tenggara Timur",     singkatan: "NTT" },
    { kode_provinsi: "PRV20", nama_provinsi: "Kalimantan Barat",        singkatan: "KALBAR" },
    { kode_provinsi: "PRV21", nama_provinsi: "Kalimantan Tengah",       singkatan: "KALTENG" },
    { kode_provinsi: "PRV22", nama_provinsi: "Kalimantan Selatan",      singkatan: "KALSEL" },
    { kode_provinsi: "PRV23", nama_provinsi: "Kalimantan Timur",        singkatan: "KALTIM" },
    { kode_provinsi: "PRV24", nama_provinsi: "Kalimantan Utara",        singkatan: "KALTARA" },
    { kode_provinsi: "PRV25", nama_provinsi: "Sulawesi Utara",          singkatan: "SULUT" },
    { kode_provinsi: "PRV26", nama_provinsi: "Sulawesi Tengah",         singkatan: "SULTENG" },
    { kode_provinsi: "PRV27", nama_provinsi: "Sulawesi Selatan",        singkatan: "SULSEL" },
    { kode_provinsi: "PRV28", nama_provinsi: "Sulawesi Tenggara",       singkatan: "SULTRA" },
    { kode_provinsi: "PRV29", nama_provinsi: "Gorontalo",               singkatan: "GORONTALO" },
    { kode_provinsi: "PRV30", nama_provinsi: "Sulawesi Barat",          singkatan: "SULBAR" },
    { kode_provinsi: "PRV31", nama_provinsi: "Maluku",                  singkatan: "MALUKU" },
    { kode_provinsi: "PRV32", nama_provinsi: "Maluku Utara",            singkatan: "MALUT" },
    { kode_provinsi: "PRV33", nama_provinsi: "Papua",                   singkatan: "PAPUA" },
    { kode_provinsi: "PRV34", nama_provinsi: "Papua Barat",             singkatan: "PABAR" },
    { kode_provinsi: "PRV35", nama_provinsi: "Papua Selatan",           singkatan: "PASEL" },
    { kode_provinsi: "PRV36", nama_provinsi: "Papua Tengah",            singkatan: "PATENG" },
    { kode_provinsi: "PRV37", nama_provinsi: "Papua Pegunungan",        singkatan: "PAPEG" },
    { kode_provinsi: "PRV38", nama_provinsi: "Papua Barat Daya",        singkatan: "PABARDAYA" },
  ];

  for (const p of daftarProvinsi) {
    await prisma.mst_provinsi.upsert({
      where: { kode_provinsi: p.kode_provinsi },
      update: {},
      create: { kode_provinsi: p.kode_provinsi, nama_provinsi: p.nama_provinsi, singkatan: p.singkatan, status_aktif: true },
    });
  }
  console.log(`   ✅ ${daftarProvinsi.length} provinsi berhasil dibuat`);

  // Ambil Jawa Timur sebagai referensi untuk contoh kabupaten/kecamatan/desa
  const provinsi = await prisma.mst_provinsi.findUnique({ where: { kode_provinsi: "PRV15" } });

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
  console.log(`   ✅ Contoh wilayah: ${provinsi.nama_provinsi} > ${kabupaten.nama_kabupaten} > ${kecamatan.nama_kecamatan} > ${desa.nama_desa}`);


  // ─── MASTER SUBSEKTOR ──────────────────────────
  console.log("\n🌿 Membuat Subsektor...");
  const subsektorList = [
    { kode_subsektor: "TP", nama_subsektor: "Tanaman Pangan" },
    { kode_subsektor: "HT", nama_subsektor: "Hortikultura" },
    { kode_subsektor: "PB", nama_subsektor: "Perkebunan" },
    { kode_subsektor: "PK", nama_subsektor: "Perikanan" },
    { kode_subsektor: "PT", nama_subsektor: "Peternakan" },
  ];
  
  const subsektorMap = {};
  for (const s of subsektorList) {
    const created = await prisma.mst_subsektor.upsert({
      where: { kode_subsektor: s.kode_subsektor },
      update: {},
      create: s,
    });
    subsektorMap[s.kode_subsektor] = created.id_subsektor;
  }
  console.log(`   ✅ ${subsektorList.length} subsektor berhasil dibuat`);

  // ─── MASTER SATUAN ─────────────────────────────
  console.log("\n⚖️  Membuat Satuan...");
  const satuanList = [
    { kode_satuan: "ST001", nama_satuan: "Kilogram", simbol: "kg" },
    { kode_satuan: "ST002", nama_satuan: "Ton", simbol: "ton" },
    { kode_satuan: "ST003", nama_satuan: "Gram", simbol: "g" },
    { kode_satuan: "ST004", nama_satuan: "Ekor", simbol: "ekor" },
    { kode_satuan: "ST005", nama_satuan: "Liter", simbol: "L" },
    { kode_satuan: "ST006", nama_satuan: "Hektare", simbol: "ha" },
    { kode_satuan: "ST007", nama_satuan: "Meter Persegi", simbol: "m²" },
    { kode_satuan: "ST008", nama_satuan: "Meter Kubik", simbol: "m³" },
    { kode_satuan: "ST009", nama_satuan: "Pohon", simbol: "pohon" },
    { kode_satuan: "ST010", nama_satuan: "Batang", simbol: "batang" },
    { kode_satuan: "ST011", nama_satuan: "Ikat", simbol: "ikat" },
    { kode_satuan: "ST012", nama_satuan: "Karung", simbol: "karung" },
    { kode_satuan: "ST013", nama_satuan: "Kuintal", simbol: "kuintal" },
  ];
  
  const satuanMap = {};
  for (const st of satuanList) {
    const created = await prisma.mst_satuan.upsert({
      where: { kode_satuan: st.kode_satuan },
      update: {},
      create: st,
    });
    satuanMap[st.kode_satuan] = created.id_satuan;
  }
  console.log(`   ✅ ${satuanList.length} satuan berhasil dibuat`);

  // ─── MASTER STATUS LAHAN ─────────────────────────
  console.log("\n📜 Membuat Status Lahan...");
  const statusLahanList = [
    { kode_status: "SL01", nama_status: "Milik" },
    { kode_status: "SL02", nama_status: "Sewa" },
    { kode_status: "SL03", nama_status: "Bagi Hasil" },
    { kode_status: "SL04", nama_status: "Tanah Kas Desa" },
    { kode_status: "SL05", nama_status: "Hak Guna Usaha (HGU)" },
    { kode_status: "SL06", nama_status: "Hak Pakai" },
    { kode_status: "SL07", nama_status: "Lainnya" },
  ];

  for (const sl of statusLahanList) {
    await prisma.mst_status_lahan.upsert({
      where: { kode_status: sl.kode_status },
      update: {},
      create: sl,
    });
  }
  console.log(`   ✅ ${statusLahanList.length} status lahan berhasil dibuat`);

  // ─── MASTER JENIS BANTUAN ────────────────────────
  console.log("\n🎁 Membuat Jenis Bantuan...");
  const jenisBantuanList = [
    { kode_bantuan: "BN01", nama_bantuan: "Benih" },
    { kode_bantuan: "BN02", nama_bantuan: "Pupuk" },
    { kode_bantuan: "BN03", nama_bantuan: "Pestisida" },
    { kode_bantuan: "BN04", nama_bantuan: "Alat Mesin Pertanian (Alsintan)" },
    { kode_bantuan: "BN05", nama_bantuan: "Sarana Irigasi" },
  ];

  for (const bn of jenisBantuanList) {
    await prisma.mst_jenis_bantuan.upsert({
      where: { kode_bantuan: bn.kode_bantuan },
      update: {},
      create: bn,
    });
  }
  console.log(`   ✅ ${jenisBantuanList.length} jenis bantuan berhasil dibuat`);

  // ─── KOMODITAS ─────────────────────────────────────
  console.log("\n🌾 Membuat Komoditas...");
  const komoditasList = [
    { kode_komoditas: "TP001", nama_komoditas: "Padi",          id_subsektor: subsektorMap["TP"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "TP002", nama_komoditas: "Jagung",         id_subsektor: subsektorMap["TP"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "TP003", nama_komoditas: "Kedelai",        id_subsektor: subsektorMap["TP"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "TP004", nama_komoditas: "Ubi Kayu",       id_subsektor: subsektorMap["TP"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "TP005", nama_komoditas: "Ubi Jalar",      id_subsektor: subsektorMap["TP"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "HT001", nama_komoditas: "Cabai Besar",    id_subsektor: subsektorMap["HT"], id_satuan: satuanMap["ST001"] },
    { kode_komoditas: "HT002", nama_komoditas: "Cabai Rawit",    id_subsektor: subsektorMap["HT"], id_satuan: satuanMap["ST001"] },
    { kode_komoditas: "HT003", nama_komoditas: "Bawang Merah",   id_subsektor: subsektorMap["HT"], id_satuan: satuanMap["ST001"] },
    { kode_komoditas: "HT004", nama_komoditas: "Bawang Putih",   id_subsektor: subsektorMap["HT"], id_satuan: satuanMap["ST001"] },
    { kode_komoditas: "HT005", nama_komoditas: "Tomat",          id_subsektor: subsektorMap["HT"], id_satuan: satuanMap["ST001"] },
    { kode_komoditas: "PB001", nama_komoditas: "Kopi Robusta",   id_subsektor: subsektorMap["PB"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "PB002", nama_komoditas: "Kakao",          id_subsektor: subsektorMap["PB"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "PB003", nama_komoditas: "Kelapa",         id_subsektor: subsektorMap["PB"], id_satuan: satuanMap["ST002"] },
    { kode_komoditas: "PK001", nama_komoditas: "Ikan Lele",      id_subsektor: subsektorMap["PK"], id_satuan: satuanMap["ST001"] },
    { kode_komoditas: "PK002", nama_komoditas: "Ikan Nila",      id_subsektor: subsektorMap["PK"], id_satuan: satuanMap["ST001"] },
    { kode_komoditas: "PT001", nama_komoditas: "Sapi Potong",    id_subsektor: subsektorMap["PT"], id_satuan: satuanMap["ST004"] },
    { kode_komoditas: "PT002", nama_komoditas: "Kambing",        id_subsektor: subsektorMap["PT"], id_satuan: satuanMap["ST004"] },
    { kode_komoditas: "PT003", nama_komoditas: "Ayam Broiler",   id_subsektor: subsektorMap["PT"], id_satuan: satuanMap["ST004"] },
  ];

  for (const k of komoditasList) {
    await prisma.mst_komoditas.upsert({
      where: { kode_komoditas: k.kode_komoditas },
      update: {},
      create: k,
    });
  }
  console.log(`   ✅ ${komoditasList.length} komoditas berhasil dibuat`);

  // ─── USER ACCOUNTS ─────────────────────────────
  console.log("\n👤 Membuat Akun Pengguna...");
  const hashedPassword = await bcrypt.hash("password", 12);

  const users = [
    { username: "superadmin", email: "superadmin@siagri.id", name: "Super Administrator", roleCode: "R001", scope: {} },
    { username: "adminnasional", email: "nasional@siagri.id", name: "Admin Nasional", roleCode: "R001", scope: {} }, // Assuming Nasional also uses R001 or there's a specific role for it. I'll use R001 for now.
    { username: "adminprovinsi", email: "provinsi@siagri.id", name: "Admin Provinsi", roleCode: "R002", scope: { id_provinsi: provinsi.id_provinsi } },
    { username: "adminkabupaten", email: "kabupaten@siagri.id", name: "Admin Kabupaten", roleCode: "R003", scope: { id_provinsi: provinsi.id_provinsi, id_kabupaten: kabupaten.id_kabupaten } },
    { username: "adminkecamatan", email: "kecamatan@siagri.id", name: "Admin Kecamatan", roleCode: "R004", scope: { id_provinsi: provinsi.id_provinsi, id_kabupaten: kabupaten.id_kabupaten, id_kecamatan: kecamatan.id_kecamatan } },
    { username: "admindesa", email: "desa@siagri.id", name: "Admin Desa", roleCode: "R005", scope: { id_provinsi: provinsi.id_provinsi, id_kabupaten: kabupaten.id_kabupaten, id_kecamatan: kecamatan.id_kecamatan, id_desa: desa.id_desa } },
    { username: "petani", email: "petani@siagri.id", name: "Petani Contoh", roleCode: "R009", scope: { id_provinsi: provinsi.id_provinsi, id_kabupaten: kabupaten.id_kabupaten, id_kecamatan: kecamatan.id_kecamatan, id_desa: desa.id_desa } },
  ];

  for (const u of users) {
    const role = await prisma.sys_role.findUnique({ where: { kode_role: u.roleCode } });
    if (role) {
      await prisma.sys_user.upsert({
        where: { username: u.username },
        update: {},
        create: {
          id_role: role.id_role,
          username: u.username,
          email: u.email,
          password: hashedPassword,
          nama_lengkap: u.name,
          status: "AKTIF",
          ...u.scope
        },
      });
      console.log(`   📌 Username: ${u.username.padEnd(15)} | Password: password | Role: ${role.nama_role}`);
    }
  }

  // ─── MASTER PENDIDIKAN & PEKERJAAN ────────────────
  console.log("\n🎓 Membuat Pendidikan & Pekerjaan...");
  const pendidikanSeed = [
    { kode: "PD01", nama_pendidikan: "Tidak Sekolah", urutan: 1 },
    { kode: "PD02", nama_pendidikan: "SD", urutan: 2 },
    { kode: "PD03", nama_pendidikan: "SMP", urutan: 3 },
    { kode: "PD04", nama_pendidikan: "SMA/SMK", urutan: 4 },
    { kode: "PD05", nama_pendidikan: "Diploma", urutan: 5 },
    { kode: "PD06", nama_pendidikan: "Sarjana", urutan: 6 },
    { kode: "PD07", nama_pendidikan: "Pascasarjana", urutan: 7 },
  ];
  for (const pd of pendidikanSeed) {
    await prisma.mst_pendidikan.upsert({
      where: { kode: pd.kode },
      update: {},
      create: pd,
    });
  }

  const pekerjaanSeed = [
    { nama_pekerjaan: "Petani / Pekebun", kategori: "Pertanian" },
    { nama_pekerjaan: "Buruh Tani", kategori: "Pertanian" },
    { nama_pekerjaan: "PNS / TNI / Polri", kategori: "Formal" },
    { nama_pekerjaan: "Pegawai Swasta", kategori: "Formal" },
    { nama_pekerjaan: "Wiraswasta / Pedagang", kategori: "Wiraswasta" },
    { nama_pekerjaan: "Lainnya", kategori: "Lainnya" }
  ];
  // Since mst_pekerjaan doesn't have a unique code, we just check if it's empty or find by name.
  for (const pk of pekerjaanSeed) {
    const exists = await prisma.mst_pekerjaan.findFirst({ where: { nama_pekerjaan: pk.nama_pekerjaan } });
    if (!exists) {
      await prisma.mst_pekerjaan.create({ data: pk });
    }
  }
  console.log(`   ✅ ${pendidikanSeed.length} pendidikan dan ${pekerjaanSeed.length} pekerjaan berhasil dibuat`);

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
