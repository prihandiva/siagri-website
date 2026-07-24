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
    where: { kode_kabupaten: "KAB3507" },
    update: {},
    create: {
      id_provinsi: provinsi.id_provinsi,
      kode_kabupaten: "KAB3507",
      nama_kabupaten: "Kabupaten Banyuwangi",
      jenis: "KABUPATEN",
      ibukota: "Banyuwangi",
    },
  });

  const kecamatan = await prisma.mst_kecamatan.upsert({
    where: { kode_kecamatan: "KEC350726" },
    update: {},
    create: {
      id_kabupaten: kabupaten.id_kabupaten,
      kode_kecamatan: "KEC350726",
      nama_kecamatan: "Kecamatan Tegalsari",
    },
  });

  const desa = await prisma.mst_desa.upsert({
    where: { kode_desa: "DES3507262001" },
    update: {},
    create: {
      id_kecamatan: kecamatan.id_kecamatan,
      kode_desa: "DES3507262001",
      nama_desa: "Desa Makmur",
      status_desa: "DESA",
    },
  });
  console.log(`   ✅ Contoh wilayah: ${provinsi.nama_provinsi} > ${kabupaten.nama_kabupaten} > ${kecamatan.nama_kecamatan} > ${desa.nama_desa}`);

  // ─── KABUPATEN LENGKAP ────────────────────────────────
  console.log("\n🏙️  Membuat Kabupaten/Kota...");
  const daftarKabupaten = [
    // Jawa Timur
    { nama_provinsi: "Jawa Timur", kode_kabupaten: "KAB3501", nama_kabupaten: "Kabupaten Pacitan",     jenis: "KABUPATEN", ibukota: "Pacitan" },
    { nama_provinsi: "Jawa Timur", kode_kabupaten: "KAB3502", nama_kabupaten: "Kabupaten Ponorogo",    jenis: "KABUPATEN", ibukota: "Ponorogo" },
    // Jawa Tengah
    { nama_provinsi: "Jawa Tengah", kode_kabupaten: "KAB3301", nama_kabupaten: "Kabupaten Cilacap",   jenis: "KABUPATEN", ibukota: "Cilacap" },
    // Jawa Barat
    { nama_provinsi: "Jawa Barat", kode_kabupaten: "KAB3201", nama_kabupaten: "Kabupaten Bogor",      jenis: "KABUPATEN", ibukota: "Cibinong" },
    { nama_provinsi: "Jawa Barat", kode_kabupaten: "KAB3202", nama_kabupaten: "Kabupaten Sukabumi",   jenis: "KABUPATEN", ibukota: "Palabuhanratu" },
  ];

  for (const k of daftarKabupaten) {
    const prov = await prisma.mst_provinsi.findFirst({ where: { nama_provinsi: k.nama_provinsi } });
    if (!prov) { console.warn(`⚠️  Provinsi "${k.nama_provinsi}" tidak ditemukan. Skip ${k.nama_kabupaten}.`); continue; }
    await prisma.mst_kabupaten.upsert({
      where: { kode_kabupaten: k.kode_kabupaten },
      update: {},
      create: { id_provinsi: prov.id_provinsi, kode_kabupaten: k.kode_kabupaten, nama_kabupaten: k.nama_kabupaten, jenis: k.jenis, ibukota: k.ibukota, status_aktif: true },
    });
  }
  console.log(`   ✅ ${daftarKabupaten.length + 1} kabupaten/kota berhasil dibuat`);

  // ─── KECAMATAN LENGKAP ────────────────────────────────
  console.log("\n🏘️  Membuat Kecamatan...");
  const daftarKecamatan = [
    // Kab. Banyuwangi (KAB3507) - Jawa Timur
    { kode_kabupaten: "KAB3507", kode_kecamatan: "KEC350701", nama_kecamatan: "Kecamatan Banyuwangi" },
    { kode_kabupaten: "KAB3507", kode_kecamatan: "KEC350726", nama_kecamatan: "Kecamatan Tegalsari" },

    // Kab. Pacitan (KAB3501) - Jawa Timur
    { kode_kabupaten: "KAB3501", kode_kecamatan: "KEC350101", nama_kecamatan: "Kecamatan Donorojo" },
    { kode_kabupaten: "KAB3501", kode_kecamatan: "KEC350102", nama_kecamatan: "Kecamatan Pringkuku" },

    // Kab. Ponorogo (KAB3502) - Jawa Timur
    { kode_kabupaten: "KAB3502", kode_kecamatan: "KEC350201", nama_kecamatan: "Kecamatan Ngrayun" },
    { kode_kabupaten: "KAB3502", kode_kecamatan: "KEC350202", nama_kecamatan: "Kecamatan Slahung" },

    // Kab. Cilacap (KAB3301) - Jawa Tengah
    { kode_kabupaten: "KAB3301", kode_kecamatan: "KEC330101", nama_kecamatan: "Kecamatan Dayeuhluhur" },
    { kode_kabupaten: "KAB3301", kode_kecamatan: "KEC330102", nama_kecamatan: "Kecamatan Wanareja" },

    // Kab. Bogor (KAB3201) - Jawa Barat
    { kode_kabupaten: "KAB3201", kode_kecamatan: "KEC320101", nama_kecamatan: "Kecamatan Cibinong" },
    { kode_kabupaten: "KAB3201", kode_kecamatan: "KEC320102", nama_kecamatan: "Kecamatan Gunung Putri" },

    // Kab. Sukabumi (KAB3202) - Jawa Barat
    { kode_kabupaten: "KAB3202", kode_kecamatan: "KEC320201", nama_kecamatan: "Kecamatan Palabuhanratu" },
    { kode_kabupaten: "KAB3202", kode_kecamatan: "KEC320202", nama_kecamatan: "Kecamatan Cisolok" },
  ];

  for (const kec of daftarKecamatan) {
    const kabupaten = await prisma.mst_kabupaten.findFirst({
      where: { kode_kabupaten: kec.kode_kabupaten },
    });

    if (!kabupaten) {
      console.warn(`⚠️  Kabupaten "${kec.kode_kabupaten}" tidak ditemukan. Skip ${kec.nama_kecamatan}.`);
      continue;
    }

    await prisma.mst_kecamatan.upsert({
      where: { kode_kecamatan: kec.kode_kecamatan },
      update: {},
      create: {
        id_kabupaten: kabupaten.id_kabupaten,
        kode_kecamatan: kec.kode_kecamatan,
        nama_kecamatan: kec.nama_kecamatan,
        status_aktif: true,
      },
    });
  }
  console.log(`   ✅ ${daftarKecamatan.length} kecamatan berhasil dibuat`);

  // ─── DESA LENGKAP ─────────────────────────────────────
  console.log("\n🏡  Membuat Desa/Kelurahan...");
  const daftarDesa = [
    // Kec. Banyuwangi (KEC350701)
    { kode_kecamatan: "KEC350701", kode_desa: "DES3507012001", nama_desa: "Desa Kertosari",    status_desa: "DESA" },
    { kode_kecamatan: "KEC350701", kode_desa: "DES3507012002", nama_desa: "Desa Karangrejo",   status_desa: "DESA" },
    // Kec. Tegalsari (KEC350726)
    { kode_kecamatan: "KEC350726", kode_desa: "DES3507262004", nama_desa: "Desa Tegalsari",    status_desa: "DESA" },
    { kode_kecamatan: "KEC350726", kode_desa: "DES3507262005", nama_desa: "Desa Karangdoro",   status_desa: "DESA" },
    // Kec. Donorojo (KEC350101)
    { kode_kecamatan: "KEC350101", kode_desa: "DES3501012001", nama_desa: "Desa Donorojo",     status_desa: "DESA" },
    { kode_kecamatan: "KEC350101", kode_desa: "DES3501012002", nama_desa: "Desa Sendang",      status_desa: "DESA" },
    // Kec. Pringkuku (KEC350102)
    { kode_kecamatan: "KEC350102", kode_desa: "DES3501022001", nama_desa: "Desa Pringkuku",    status_desa: "DESA" },
    { kode_kecamatan: "KEC350102", kode_desa: "DES3501022002", nama_desa: "Desa Watukarung",   status_desa: "DESA" },
    // Kec. Ngrayun (KEC350201)
    { kode_kecamatan: "KEC350201", kode_desa: "DES3502012001", nama_desa: "Desa Ngrayun",      status_desa: "DESA" },
    { kode_kecamatan: "KEC350201", kode_desa: "DES3502012002", nama_desa: "Desa Temon",        status_desa: "DESA" },
    // Kec. Slahung (KEC350202)
    { kode_kecamatan: "KEC350202", kode_desa: "DES3502022001", nama_desa: "Desa Slahung",      status_desa: "DESA" },
    { kode_kecamatan: "KEC350202", kode_desa: "DES3502022002", nama_desa: "Desa Jaguk",        status_desa: "DESA" },
    // Kec. Dayeuhluhur (KEC330101)
    { kode_kecamatan: "KEC330101", kode_desa: "DES3301012001", nama_desa: "Desa Dayeuhluhur",  status_desa: "DESA" },
    { kode_kecamatan: "KEC330101", kode_desa: "DES3301012002", nama_desa: "Desa Bingkeng",     status_desa: "DESA" },
    // Kec. Wanareja (KEC330102)
    { kode_kecamatan: "KEC330102", kode_desa: "DES3301022001", nama_desa: "Desa Wanareja",     status_desa: "DESA" },
    { kode_kecamatan: "KEC330102", kode_desa: "DES3301022002", nama_desa: "Desa Madusari",     status_desa: "DESA" },
    // Kec. Cibinong (KEC320101)
    { kode_kecamatan: "KEC320101", kode_desa: "DES3201012001", nama_desa: "Desa Pakansari",    status_desa: "DESA" },
    { kode_kecamatan: "KEC320101", kode_desa: "DES3201012002", nama_desa: "Desa Ciriung",      status_desa: "DESA" },
    // Kec. Gunung Putri (KEC320102)
    { kode_kecamatan: "KEC320102", kode_desa: "DES3201022001", nama_desa: "Desa Wanaherang",   status_desa: "DESA" },
    { kode_kecamatan: "KEC320102", kode_desa: "DES3201022002", nama_desa: "Desa Tlajung Udik", status_desa: "DESA" },
    // Kec. Palabuhanratu (KEC320201)
    { kode_kecamatan: "KEC320201", kode_desa: "DES3202012001", nama_desa: "Desa Palabuhanratu",status_desa: "DESA" },
    { kode_kecamatan: "KEC320201", kode_desa: "DES3202012002", nama_desa: "Desa Citepus",      status_desa: "DESA" },
    // Kec. Cisolok (KEC320202)
    { kode_kecamatan: "KEC320202", kode_desa: "DES3202022001", nama_desa: "Desa Cisolok",      status_desa: "DESA" },
    { kode_kecamatan: "KEC320202", kode_desa: "DES3202022002", nama_desa: "Desa Karangpapak",  status_desa: "DESA" },
  ];

  for (const d of daftarDesa) {
    const kec = await prisma.mst_kecamatan.findFirst({ where: { kode_kecamatan: d.kode_kecamatan } });
    if (!kec) { console.warn(`⚠️  Kecamatan "${d.kode_kecamatan}" tidak ditemukan. Skip ${d.nama_desa}.`); continue; }
    await prisma.mst_desa.upsert({
      where: { kode_desa: d.kode_desa },
      update: {},
      create: { id_kecamatan: kec.id_kecamatan, kode_desa: d.kode_desa, nama_desa: d.nama_desa, status_desa: d.status_desa, status_aktif: true },
    });
  }
  console.log(`   ✅ ${daftarDesa.length} desa/kelurahan berhasil dibuat`);

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
      update: { id_subsektor: k.id_subsektor, id_satuan: k.id_satuan },
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

  // ─── PETANI + AKUN LOGIN ───────────────────────────
  console.log("\n👨‍🌾  Membuat Petani & Akun Login...");
  const ROLE_PETANI = await prisma.sys_role.findFirst({ where: { kode_role: "R009" } });
  const hashedPetaniPw = await bcrypt.hash("Petani@123", 10);

  const daftarPetani = [
    // Kab. Banyuwangi
    { kode_desa: "DES3507012001", nik: "3507011405780001", nama_lengkap: "Suparjo",       jenis_kelamin: "L", tempat_lahir: "Banyuwangi", tanggal_lahir: "1978-05-14", status_perkawinan: "KAWIN",       jumlah_tanggungan: 3, pengalaman_tani_tahun: 20, status_petani: "PEMILIK",   kode_pendidikan: "PD04", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3507012002", nik: "3507016309820002", nama_lengkap: "Siti Aminah",   jenis_kelamin: "P", tempat_lahir: "Banyuwangi", tanggal_lahir: "1982-09-23", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 15, status_petani: "PENGGARAP", kode_pendidikan: "PD03", nama_pekerjaan: "Buruh Tani" },
    { kode_desa: "DES3507262004", nik: "3507261002750001", nama_lengkap: "Bambang Wijaya",jenis_kelamin: "L", tempat_lahir: "Banyuwangi", tanggal_lahir: "1975-02-10", status_perkawinan: "KAWIN",       jumlah_tanggungan: 4, pengalaman_tani_tahun: 25, status_petani: "PEMILIK",   kode_pendidikan: "PD02", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3507262005", nik: "3507264511800002", nama_lengkap: "Sri Wahyuni",   jenis_kelamin: "P", tempat_lahir: "Banyuwangi", tanggal_lahir: "1980-11-05", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 12, status_petani: "PEMILIK",   kode_pendidikan: "PD04", nama_pekerjaan: "Petani / Pekebun" },
    // Kab. Pacitan
    { kode_desa: "DES3501012001", nik: "3501011807760001", nama_lengkap: "Slamet Riyadi", jenis_kelamin: "L", tempat_lahir: "Pacitan",    tanggal_lahir: "1976-07-18", status_perkawinan: "KAWIN",       jumlah_tanggungan: 3, pengalaman_tani_tahun: 22, status_petani: "PEMILIK",   kode_pendidikan: "PD03", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3501012002", nik: "3501017003850002", nama_lengkap: "Tutik Handayani",jenis_kelamin:"P", tempat_lahir: "Pacitan",    tanggal_lahir: "1985-03-30", status_perkawinan: "KAWIN",       jumlah_tanggungan: 1, pengalaman_tani_tahun: 10, status_petani: "PENGGARAP", kode_pendidikan: "PD04", nama_pekerjaan: "Buruh Tani" },
    { kode_desa: "DES3501022001", nik: "3501022208790001", nama_lengkap: "Wahyu Setiawan",jenis_kelamin: "L", tempat_lahir: "Pacitan",    tanggal_lahir: "1979-08-22", status_perkawinan: "BELUM KAWIN", jumlah_tanggungan: 0, pengalaman_tani_tahun:  8, status_petani: "PENGGARAP", kode_pendidikan: "PD04", nama_pekerjaan: "Buruh Tani" },
    { kode_desa: "DES3501022002", nik: "3501025412830002", nama_lengkap: "Endang Lestari",jenis_kelamin: "P", tempat_lahir: "Pacitan",    tanggal_lahir: "1983-12-14", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 14, status_petani: "PEMILIK",   kode_pendidikan: "PD05", nama_pekerjaan: "Wiraswasta / Pedagang" },
    // Kab. Ponorogo
    { kode_desa: "DES3502012001", nik: "3502010501740001", nama_lengkap: "Agus Santoso",  jenis_kelamin: "L", tempat_lahir: "Ponorogo",   tanggal_lahir: "1974-01-05", status_perkawinan: "KAWIN",       jumlah_tanggungan: 4, pengalaman_tani_tahun: 28, status_petani: "PEMILIK",   kode_pendidikan: "PD02", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3502012002", nik: "3502015906810002", nama_lengkap: "Ratna Sari",    jenis_kelamin: "P", tempat_lahir: "Ponorogo",   tanggal_lahir: "1981-06-19", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 13, status_petani: "PENGGARAP", kode_pendidikan: "PD04", nama_pekerjaan: "Buruh Tani" },
    { kode_desa: "DES3502022001", nik: "3502022710770001", nama_lengkap: "Hariyanto",     jenis_kelamin: "L", tempat_lahir: "Ponorogo",   tanggal_lahir: "1977-10-27", status_perkawinan: "KAWIN",       jumlah_tanggungan: 3, pengalaman_tani_tahun: 19, status_petani: "PEMILIK",   kode_pendidikan: "PD03", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3502022002", nik: "3502025104860002", nama_lengkap: "Yuni Astuti",   jenis_kelamin: "P", tempat_lahir: "Ponorogo",   tanggal_lahir: "1986-04-11", status_perkawinan: "BELUM KAWIN", jumlah_tanggungan: 0, pengalaman_tani_tahun:  6, status_petani: "PENGGARAP", kode_pendidikan: "PD06", nama_pekerjaan: "Pegawai Swasta" },
    // Kab. Cilacap
    { kode_desa: "DES3301012001", nik: "3301010309720001", nama_lengkap: "Waluyo",        jenis_kelamin: "L", tempat_lahir: "Cilacap",    tanggal_lahir: "1972-09-03", status_perkawinan: "KAWIN",       jumlah_tanggungan: 5, pengalaman_tani_tahun: 30, status_petani: "PEMILIK",   kode_pendidikan: "PD01", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3301012002", nik: "3301016502840002", nama_lengkap: "Sumiyati",      jenis_kelamin: "P", tempat_lahir: "Cilacap",    tanggal_lahir: "1984-02-25", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 11, status_petani: "PENGGARAP", kode_pendidikan: "PD03", nama_pekerjaan: "Buruh Tani" },
    { kode_desa: "DES3301022001", nik: "3301021605780001", nama_lengkap: "Kusnadi",       jenis_kelamin: "L", tempat_lahir: "Cilacap",    tanggal_lahir: "1978-05-16", status_perkawinan: "KAWIN",       jumlah_tanggungan: 3, pengalaman_tani_tahun: 20, status_petani: "PEMILIK",   kode_pendidikan: "PD04", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3301022002", nik: "3301024808820002", nama_lengkap: "Rohyati",       jenis_kelamin: "P", tempat_lahir: "Cilacap",    tanggal_lahir: "1982-08-08", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 14, status_petani: "PENGGARAP", kode_pendidikan: "PD02", nama_pekerjaan: "Buruh Tani" },
    // Kab. Bogor
    { kode_desa: "DES3201012001", nik: "3201011211750001", nama_lengkap: "Asep Saepudin", jenis_kelamin: "L", tempat_lahir: "Bogor",      tanggal_lahir: "1975-11-12", status_perkawinan: "KAWIN",       jumlah_tanggungan: 3, pengalaman_tani_tahun: 23, status_petani: "PEMILIK",   kode_pendidikan: "PD04", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3201012002", nik: "3201016901870002", nama_lengkap: "Euis Komalasari",jenis_kelamin:"P", tempat_lahir: "Bogor",      tanggal_lahir: "1987-01-29", status_perkawinan: "KAWIN",       jumlah_tanggungan: 1, pengalaman_tani_tahun:  9, status_petani: "PENGGARAP", kode_pendidikan: "PD05", nama_pekerjaan: "Wiraswasta / Pedagang" },
    { kode_desa: "DES3201022001", nik: "3201020706800001", nama_lengkap: "Dedi Supriadi", jenis_kelamin: "L", tempat_lahir: "Bogor",      tanggal_lahir: "1980-06-07", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 16, status_petani: "PEMILIK",   kode_pendidikan: "PD03", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3201022002", nik: "3201026103890002", nama_lengkap: "Nia Kurniasih", jenis_kelamin: "P", tempat_lahir: "Bogor",      tanggal_lahir: "1989-03-21", status_perkawinan: "BELUM KAWIN", jumlah_tanggungan: 0, pengalaman_tani_tahun:  5, status_petani: "PENGGARAP", kode_pendidikan: "PD06", nama_pekerjaan: "Pegawai Swasta" },
    // Kab. Sukabumi
    { kode_desa: "DES3202012001", nik: "3202011509730001", nama_lengkap: "Ujang Hidayat", jenis_kelamin: "L", tempat_lahir: "Sukabumi",   tanggal_lahir: "1973-09-15", status_perkawinan: "KAWIN",       jumlah_tanggungan: 4, pengalaman_tani_tahun: 27, status_petani: "PEMILIK",   kode_pendidikan: "PD02", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3202012002", nik: "3202014412850002", nama_lengkap: "Yeni Marlina",  jenis_kelamin: "P", tempat_lahir: "Sukabumi",   tanggal_lahir: "1985-12-04", status_perkawinan: "KAWIN",       jumlah_tanggungan: 2, pengalaman_tani_tahun: 12, status_petani: "PENGGARAP", kode_pendidikan: "PD04", nama_pekerjaan: "Buruh Tani" },
    { kode_desa: "DES3202022001", nik: "3202022807760001", nama_lengkap: "Enjang Sutarya",jenis_kelamin: "L", tempat_lahir: "Sukabumi",   tanggal_lahir: "1976-07-28", status_perkawinan: "KAWIN",       jumlah_tanggungan: 3, pengalaman_tani_tahun: 21, status_petani: "PEMILIK",   kode_pendidikan: "PD03", nama_pekerjaan: "Petani / Pekebun" },
    { kode_desa: "DES3202022002", nik: "3202025710880002", nama_lengkap: "Tati Suryati",  jenis_kelamin: "P", tempat_lahir: "Sukabumi",   tanggal_lahir: "1988-10-17", status_perkawinan: "BELUM KAWIN", jumlah_tanggungan: 0, pengalaman_tani_tahun:  7, status_petani: "PENGGARAP", kode_pendidikan: "PD05", nama_pekerjaan: "Lainnya" },
  ];

  let petaniCount = 0;
  for (const p of daftarPetani) {
    const desaPetani = await prisma.mst_desa.findFirst({ where: { kode_desa: p.kode_desa } });
    if (!desaPetani) { console.warn(`  ⚠️  Desa ${p.kode_desa} tidak ditemukan. Skip ${p.nama_lengkap}.`); continue; }

    const pendidikan = await prisma.mst_pendidikan.findFirst({ where: { kode: p.kode_pendidikan } });
    const pekerjaan  = await prisma.mst_pekerjaan.findFirst({ where: { nama_pekerjaan: p.nama_pekerjaan } });

    await prisma.mst_petani.upsert({
      where: { nik: p.nik },
      update: {},
      create: {
        id_desa: desaPetani.id_desa,
        id_pendidikan: pendidikan?.id_pendidikan ?? null,
        id_pekerjaan:  pekerjaan?.id_pekerjaan  ?? null,
        nik: p.nik, nama_lengkap: p.nama_lengkap,
        tempat_lahir: p.tempat_lahir, tanggal_lahir: new Date(p.tanggal_lahir),
        jenis_kelamin: p.jenis_kelamin, alamat: "Dusun Krajan", rt: "001", rw: "002",
        status_perkawinan: p.status_perkawinan,
        jumlah_tanggungan: p.jumlah_tanggungan,
        pengalaman_tani_tahun: p.pengalaman_tani_tahun,
        status_petani: p.status_petani,
        status_aktif: true,
      },
    });

    if (ROLE_PETANI) {
      await prisma.sys_user.upsert({
        where: { username: p.nik },
        update: {},
        create: {
          role:     { connect: { id_role: ROLE_PETANI.id_role } },
          desa:     { connect: { id_desa: desaPetani.id_desa } },
          nama_lengkap: p.nama_lengkap,
          nik: p.nik,
          username: p.nik,
          email: `${p.nik}@petani.siagri.id`,
          password: hashedPetaniPw,
          status: "AKTIF",
        },
      });
    }
    petaniCount++;
  }
  console.log(`   ✅ ${petaniCount} petani + akun login berhasil dibuat (username = NIK, password = Petani@123)`);

  // ─── KELAS POKTAN ──────────────────────────────────────
  console.log("\n🏫  Membuat Kelas Poktan...");
  const daftarKelas = [
    { kode: "KLS01", nama_kelas: "Pemula", skor_minimum: 0, skor_maksimum: 250, deskripsi: "Kelas pemula" },
    { kode: "KLS02", nama_kelas: "Lanjut", skor_minimum: 251, skor_maksimum: 500, deskripsi: "Kelas lanjut" },
    { kode: "KLS03", nama_kelas: "Madya", skor_minimum: 501, skor_maksimum: 750, deskripsi: "Kelas madya" },
    { kode: "KLS04", nama_kelas: "Utama", skor_minimum: 751, skor_maksimum: 1000, deskripsi: "Kelas utama" }
  ];
  const kelasPoktanIds = [];
  for (const k of daftarKelas) {
    const kls = await prisma.mst_kelas_poktan.upsert({
      where: { kode: k.kode },
      update: {},
      create: k
    });
    kelasPoktanIds.push(kls.id_kelas);
  }
  console.log(`   ✅ ${kelasPoktanIds.length} kelas poktan berhasil dibuat`);

  // ─── GAPOKTAN & POKTAN ───────────────────────────────
  console.log("\n🤝  Membuat Gapoktan & Poktan...");
  const dataPerDesa = [
    { kode_desa: "DES3507012001", nama_desa: "Kertosari", punya_gapoktan: true, poktan: ["Poktan Sumber Makmur", "Poktan Tani Jaya"], nik_petani: "3507011405780001" },
    { kode_desa: "DES3507012002", nama_desa: "Karangrejo", punya_gapoktan: false, poktan: ["Poktan Sido Mulyo", "Poktan Karya Tani"], nik_petani: "3507016309820002" },
    { kode_desa: "DES3507262004", nama_desa: "Tegalsari", punya_gapoktan: true, poktan: ["Poktan Subur Jaya", "Poktan Mekar Sari"], nik_petani: "3507261002750001" },
    { kode_desa: "DES3507262005", nama_desa: "Karangdoro", punya_gapoktan: false, poktan: ["Poktan Rukun Tani", "Poktan Berkah Tani"], nik_petani: "3507264511800002" },
    { kode_desa: "DES3501012001", nama_desa: "Donorojo", punya_gapoktan: true, poktan: ["Poktan Sumber Rejeki", "Poktan Tani Makmur"], nik_petani: "3501011807760001" },
    { kode_desa: "DES3501012002", nama_desa: "Sendang", punya_gapoktan: false, poktan: ["Poktan Sido Rukun", "Poktan Karya Mandiri"], nik_petani: "3501017003850002" },
    { kode_desa: "DES3501022001", nama_desa: "Pringkuku", punya_gapoktan: true, poktan: ["Poktan Subur Makmur", "Poktan Mekar Tani"], nik_petani: "3501022208790001" },
    { kode_desa: "DES3501022002", nama_desa: "Watukarung", punya_gapoktan: false, poktan: ["Poktan Rukun Makmur", "Poktan Berkah Jaya"], nik_petani: "3501025412830002" },
    { kode_desa: "DES3502012001", nama_desa: "Ngrayun", punya_gapoktan: true, poktan: ["Poktan Sumber Tani", "Poktan Jaya Makmur"], nik_petani: "3502010501740001" },
    { kode_desa: "DES3502012002", nama_desa: "Temon", punya_gapoktan: false, poktan: ["Poktan Sido Makmur", "Poktan Karya Jaya"], nik_petani: "3502015906810002" },
    { kode_desa: "DES3502022001", nama_desa: "Slahung", punya_gapoktan: true, poktan: ["Poktan Subur Tani", "Poktan Mekar Jaya"], nik_petani: "3502022710770001" },
    { kode_desa: "DES3502022002", nama_desa: "Jaguk", punya_gapoktan: false, poktan: ["Poktan Rukun Jaya", "Poktan Berkah Makmur"], nik_petani: "3502025104860002" },
    { kode_desa: "DES3301012001", nama_desa: "Dayeuhluhur", punya_gapoktan: true, poktan: ["Poktan Sumber Jaya", "Poktan Tani Mandiri"], nik_petani: "3301010309720001" },
    { kode_desa: "DES3301012002", nama_desa: "Bingkeng", punya_gapoktan: false, poktan: ["Poktan Sido Jaya", "Poktan Karya Rejeki"], nik_petani: "3301016502840002" },
    { kode_desa: "DES3301022001", nama_desa: "Wanareja", punya_gapoktan: true, poktan: ["Poktan Subur Rejeki", "Poktan Mekar Makmur"], nik_petani: "3301021605780001" },
    { kode_desa: "DES3301022002", nama_desa: "Madusari", punya_gapoktan: false, poktan: ["Poktan Rukun Sentosa", "Poktan Berkah Sejahtera"], nik_petani: "3301024808820002" },
    { kode_desa: "DES3201012001", nama_desa: "Pakansari", punya_gapoktan: true, poktan: ["Poktan Sumber Sejahtera", "Poktan Tani Sejahtera"], nik_petani: "3201011211750001" },
    { kode_desa: "DES3201012002", nama_desa: "Ciriung", punya_gapoktan: false, poktan: ["Poktan Sido Sejahtera", "Poktan Karya Sentosa"], nik_petani: "3201016901870002" },
    { kode_desa: "DES3201022001", nama_desa: "Wanaherang", punya_gapoktan: true, poktan: ["Poktan Subur Sentosa", "Poktan Mekar Sentosa"], nik_petani: "3201020706800001" },
    { kode_desa: "DES3201022002", nama_desa: "Tlajung Udik", punya_gapoktan: false, poktan: ["Poktan Rukun Sejahtera", "Poktan Berkah Sentosa"], nik_petani: "3201026103890002" },
    { kode_desa: "DES3202012001", nama_desa: "Palabuhanratu", punya_gapoktan: true, poktan: ["Poktan Sumber Bahari", "Poktan Tani Bahari"], nik_petani: "3202011509730001" },
    { kode_desa: "DES3202012002", nama_desa: "Citepus", punya_gapoktan: false, poktan: ["Poktan Sido Bahari", "Poktan Karya Bahari"], nik_petani: "3202014412850002" },
    { kode_desa: "DES3202022001", nama_desa: "Cisolok", punya_gapoktan: true, poktan: ["Poktan Subur Nelayan", "Poktan Mekar Nelayan"], nik_petani: "3202022807760001" },
    { kode_desa: "DES3202022002", nama_desa: "Karangpapak", punya_gapoktan: false, poktan: ["Poktan Rukun Nelayan", "Poktan Berkah Nelayan"], nik_petani: "3202025710880002" },
  ];

  let gapoktanSeq = 0;
  let poktanSeq = 0;

  for (const d of dataPerDesa) {
    const desa = await prisma.mst_desa.findFirst({ where: { kode_desa: d.kode_desa } });
    if (!desa) { console.warn(`⚠️  Desa "${d.kode_desa}" tidak ditemukan. Skip.`); continue; }

    let gapoktanId = null;
    if (d.punya_gapoktan) {
      gapoktanSeq++;
      const kodeGapoktan = `GPK${String(gapoktanSeq).padStart(3, "0")}`;
      const gapoktan = await prisma.mst_gapoktan.upsert({
        where: { kode_gapoktan: kodeGapoktan },
        update: {
          nomor_registrasi: `REG-${kodeGapoktan}`,
          tanggal_berdiri: new Date('2015-01-01'),
          ketua: `Bapak Ketua Gapoktan ${d.nama_desa}`,
          sekretaris: `Sekretaris Gapoktan ${d.nama_desa}`,
          bendahara: `Bendahara Gapoktan ${d.nama_desa}`,
          alamat: `Jalan Raya Pertanian Desa ${d.nama_desa}`,
          nomor_hp: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
          email: `gapoktan.${d.nama_desa.toLowerCase().replace(/\\s/g, '')}@siagri.id`,
        },
        create: {
          id_desa: desa.id_desa,
          kode_gapoktan: kodeGapoktan,
          nama_gapoktan: `Gapoktan ${d.nama_desa} Bersatu`,
          nomor_registrasi: `REG-${kodeGapoktan}`,
          tanggal_berdiri: new Date('2015-01-01'),
          ketua: `Bapak Ketua Gapoktan ${d.nama_desa}`,
          sekretaris: `Sekretaris Gapoktan ${d.nama_desa}`,
          bendahara: `Bendahara Gapoktan ${d.nama_desa}`,
          alamat: `Jalan Raya Pertanian Desa ${d.nama_desa}`,
          nomor_hp: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
          email: `gapoktan.${d.nama_desa.toLowerCase().replace(/\\s/g, '')}@siagri.id`,
          status_aktif: true,
        },
      });
      gapoktanId = gapoktan.id_gapoktan;
    }

    const poktanIds = [];
    for (let i = 0; i < d.poktan.length; i++) {
      poktanSeq++;
      const kodePoktan = `PKT${String(poktanSeq).padStart(3, "0")}`;
      const poktan = await prisma.mst_poktan.upsert({
        where: { kode_poktan: kodePoktan },
        update: {
          nomor_registrasi: `REG-${kodePoktan}`,
          tanggal_berdiri: new Date('2016-06-15'),
          alamat: `Dusun Utama, Desa ${d.nama_desa}`,
          luas_total_lahan: Math.floor(10 + Math.random() * 40) + 0.5,
          latitude: -8.0 + (Math.random() * 0.5),
          longitude: 114.0 + (Math.random() * 0.5),
          id_kelas: kelasPoktanIds.length ? kelasPoktanIds[Math.floor(Math.random() * kelasPoktanIds.length)] : null,
        },
        create: {
          id_gapoktan: gapoktanId,
          id_desa: desa.id_desa,
          id_kelas: kelasPoktanIds.length ? kelasPoktanIds[Math.floor(Math.random() * kelasPoktanIds.length)] : null,
          kode_poktan: kodePoktan,
          nama_poktan: d.poktan[i],
          nomor_registrasi: `REG-${kodePoktan}`,
          tanggal_berdiri: new Date('2016-06-15'),
          alamat: `Dusun Utama, Desa ${d.nama_desa}`,
          luas_total_lahan: Math.floor(10 + Math.random() * 40) + 0.5,
          latitude: -8.0 + (Math.random() * 0.5),
          longitude: 114.0 + (Math.random() * 0.5),
          status_poktan: "AKTIF",
          jumlah_anggota: 0,
          status_aktif: true,
        },
      });
      poktanIds.push(poktan.id_poktan);

      // Create Ketua for each Poktan
      const existingKetua = await prisma.mst_pengurus_poktan.findFirst({
        where: { id_poktan: poktan.id_poktan, jabatan: 'Ketua' }
      });
      if (!existingKetua) {
        await prisma.mst_pengurus_poktan.create({
          data: {
            id_poktan: poktan.id_poktan,
            nama: `Ketua ${d.poktan[i]}`,
            jabatan: 'Ketua',
            aktif: true
          }
        });
      }
    }

    const petani = await prisma.mst_petani.findFirst({ where: { nik: d.nik_petani } });
    if (petani && poktanIds.length > 0) {
      const poktanUtamaId = poktanIds[0];
      await prisma.mst_petani.update({
        where: { id_petani: petani.id_petani },
        data: { id_poktan: poktanUtamaId },
      });
      
      const existingAnggota = await prisma.mst_anggota_poktan.findFirst({
        where: { id_poktan: poktanUtamaId, id_petani: petani.id_petani }
      });
      
      if (!existingAnggota) {
        await prisma.mst_anggota_poktan.create({
          data: {
            id_poktan: poktanUtamaId,
            id_petani: petani.id_petani,
            status: "AKTIF"
          }
        });
      }

      await prisma.mst_poktan.update({
        where: { id_poktan: poktanUtamaId },
        data: { jumlah_anggota: { increment: 1 } },
      });
    }
  }

  console.log(`   ✅ Selesai membuat ${gapoktanSeq} gapoktan dan ${poktanSeq} poktan, petani tersambung ke poktan.`);

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
