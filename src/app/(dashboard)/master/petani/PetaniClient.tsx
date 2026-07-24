'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WilayahSelector } from '@/components/ui/WilayahSelector';
import {
  Edit2, Trash2, Eye, GitMerge, Users, MapPin, Phone, User,
  Upload, X, FileSpreadsheet, KeyRound, Sprout, GraduationCap,
  Briefcase, Calendar, Heart, Shield
} from 'lucide-react';
import { createPetani, updatePetani, deletePetani, gabungkanPetaniKePoktan, keluarkanPetaniDariPoktan } from './actions';

const STATUS_PETANI_COLOR: Record<string, string> = {
  PEMILIK:   'bg-green-100 text-green-800',
  PENGGARAP: 'bg-blue-100 text-blue-800',
  PENYEWA:   'bg-amber-100 text-amber-800',
  BURUH_TANI:'bg-gray-100 text-gray-700',
  LAINNYA:   'bg-purple-100 text-purple-700',
};

export default function PetaniClient({
  initialData,
  options
}: {
  initialData: any[];
  options: { desa: any[]; poktan: any[]; pendidikan: any[]; pekerjaan: any[] };
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPoktanOpen, setIsPoktanOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedPoktanId, setSelectedPoktanId] = useState('');

  const [formData, setFormData] = useState({
    id_desa: '', nik: '', nama_lengkap: '', tempat_lahir: '', tanggal_lahir: '',
    jenis_kelamin: '', alamat: '', no_hp: '', id_pendidikan: '',
    status_perkawinan: '', id_pekerjaan: '', pengalaman_tani_tahun: '',
    status_petani: 'PEMILIK', status_aktif: true,
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [importFile, setImportFile]       = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jkOpts = [
    { label: '-- Pilih Jenis Kelamin --', value: '' },
    { label: 'Laki-laki', value: 'L' },
    { label: 'Perempuan', value: 'P' },
  ];

  const statusPetaniOpts = [
    { label: 'Pemilik',    value: 'PEMILIK' },
    { label: 'Penggarap',  value: 'PENGGARAP' },
    { label: 'Penyewa',    value: 'PENYEWA' },
    { label: 'Buruh Tani', value: 'BURUH_TANI' },
    { label: 'Lainnya',    value: 'LAINNYA' },
  ];

  const statusKawinOpts = [
    { label: '-- Pilih Status --',  value: '' },
    { label: 'Belum Kawin', value: 'BELUM KAWIN' },
    { label: 'Kawin',       value: 'KAWIN' },
    { label: 'Cerai',       value: 'CERAI' },
  ];

  const nikRegex = /^[0-9]{16}$/;

  const allPoktanOpts = useMemo(() => {
    const base = options.poktan ?? [];
    const desa = selectedItem?.id_desa;
    const filtered = desa ? base.filter((p: any) => String(p.id_desa) === String(desa)) : base;
    return [{ label: '-- Pilih Poktan --', value: '' }, ...filtered.map((p: any) => ({ label: p.nama_poktan, value: String(p.id_poktan) }))];
  }, [options.poktan, selectedItem]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item: any) =>
      item.nama_lengkap.toLowerCase().includes(term) ||
      (item.nik || '').includes(searchTerm) ||
      (item.desa?.nama_desa || '').toLowerCase().includes(term) ||
      (item.keanggotaan_poktan?.[0]?.poktan?.nama_poktan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const getPoktan = (item: any) => item?.keanggotaan_poktan?.[0]?.poktan;

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa?.toString() || '',
        nik: item.nik || '', nama_lengkap: item.nama_lengkap,
        tempat_lahir: item.tempat_lahir || '',
        tanggal_lahir: item.tanggal_lahir ? new Date(item.tanggal_lahir).toISOString().split('T')[0] : '',
        jenis_kelamin: item.jenis_kelamin || '', alamat: item.alamat || '', no_hp: item.no_hp || '',
        id_pendidikan: item.id_pendidikan?.toString() || '',
        status_perkawinan: item.status_perkawinan || '',
        id_pekerjaan: item.id_pekerjaan?.toString() || '',
        pengalaman_tani_tahun: item.pengalaman_tani_tahun || '',
        status_petani: item.status_petani || 'PEMILIK',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        id_desa: '', nik: '', nama_lengkap: '', tempat_lahir: '', tanggal_lahir: '',
        jenis_kelamin: '', alamat: '', no_hp: '', id_pendidikan: '',
        status_perkawinan: '', id_pekerjaan: '', pengalaman_tani_tahun: '',
        status_petani: 'PEMILIK', status_aktif: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikRegex.test(formData.nik)) { setError('NIK harus terdiri dari 16 digit angka.'); return; }
    if (!formData.id_desa) { setError('Pilih wilayah desa terlebih dahulu.'); return; }
    setLoading(true); setError('');
    const res = selectedItem
      ? await updatePetani(selectedItem.id_petani, formData)
      : await createPetani(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data petani diperbarui!' : 'Petani berhasil ditambahkan!');
      setIsFormOpen(false); window.location.reload();
    } else setError(res?.error || 'Terjadi kesalahan.');
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePetani(selectedItem.id_petani);
    setLoading(false);
    if (res?.success) { toast.success('Petani berhasil dihapus!'); setIsDeleteOpen(false); window.location.reload(); }
    else toast.error(res?.error || 'Gagal menghapus.');
  };

  const handleGabungPoktan = async () => {
    if (!selectedPoktanId) { toast.error('Pilih poktan terlebih dahulu.'); return; }
    setLoading(true);
    const res = await gabungkanPetaniKePoktan(selectedItem.id_petani, selectedPoktanId);
    setLoading(false);
    if (res?.success) { toast.success('Petani berhasil digabungkan!'); setIsPoktanOpen(false); window.location.reload(); }
    else toast.error(res?.error || 'Gagal menggabungkan.');
  };

  const handleKeluarPoktan = async () => {
    setLoading(true);
    const res = await keluarkanPetaniDariPoktan(selectedItem.id_petani);
    setLoading(false);
    if (res?.success) { toast.success('Petani keluar dari Poktan!'); setIsPoktanOpen(false); window.location.reload(); }
    else toast.error(res?.error || 'Gagal.');
  };

  // ── Export PDF ────────────────────────────────────────
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(27, 94, 32); doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('DATA MASTER PETANI — SIAGRI', 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} petani`, 14, 21);
    let y = 42;
    const cols = [14, 22, 60, 105, 145, 185, 215, 245];
    const heads = ['No', 'NIK', 'Nama Lengkap', 'Desa / Kecamatan', 'Pendidikan', 'Status Petani', 'Pengalaman', 'Status'];
    doc.setFillColor(235, 245, 235); doc.rect(14, y - 6, pageW - 28, 10, 'F');
    doc.setTextColor(27, 94, 32); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    heads.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6; doc.setDrawColor(200, 230, 200); doc.line(14, y - 1, pageW - 14, y - 1);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
    filteredData.forEach((item, idx) => {
      if (y > 190) { doc.addPage(); y = 20; }
      doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255, idx % 2 === 0 ? 250 : 255);
      doc.rect(14, y - 5, pageW - 28, 8, 'F');
      const row = [
        String(idx + 1), item.nik || '-', item.nama_lengkap,
        `${item.desa?.nama_desa || '-'} / ${item.desa?.kecamatan?.nama_kecamatan || '-'}`,
        item.pendidikan?.nama_pendidikan || '-',
        item.status_petani || '-',
        item.pengalaman_tani_tahun ? `${item.pengalaman_tani_tahun} thn` : '-',
        item.status_aktif ? 'Aktif' : 'Nonaktif',
      ];
      row.forEach((v, i) => doc.text(String(v).substring(0, 22), cols[i], y));
      y += 8;
    });
    doc.save(`Data-Petani-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF berhasil diunduh!');
  };

  // ── Download Template ──────────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['nik', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'kode_desa', 'alamat', 'no_hp', 'status_perkawinan', 'status_petani', 'pengalaman_tani_tahun'],
      ['3507011405780001', 'Suparjo', 'L', 'Banyuwangi', '1978-05-14', 'DES3507012001', 'Dusun Krajan RT001/RW002', '08123456789', 'KAWIN', 'PEMILIK', '20'],
    ]);
    ws['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 5 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 8 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Petani');
    XLSX.writeFile(wb, 'Template-Import-Petani.xlsx');
    toast.success('Template berhasil diunduh!');
  };

  // ── Import Excel ───────────────────────────────────────
  const handleImportSubmit = async () => {
    if (!importFile) { toast.error('Pilih file Excel terlebih dahulu.'); return; }
    setImportLoading(true);
    try {
      const XLSX = await import('xlsx');
      const buffer = await importFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      let successCount = 0, errorCount = 0;
      for (const row of rows) {
        if (!row.nik || !row.nama_lengkap || !row.kode_desa || !row.jenis_kelamin) { errorCount++; continue; }
        const desaMatch = options.desa.find((d: any) => d.kode_desa === String(row.kode_desa).trim());
        if (!desaMatch) { errorCount++; continue; }
        const res = await createPetani({
          id_desa:              desaMatch.id_desa,
          nik:                  String(row.nik).trim(),
          nama_lengkap:         String(row.nama_lengkap).trim(),
          jenis_kelamin:        String(row.jenis_kelamin || 'L').trim(),
          tempat_lahir:         row.tempat_lahir ? String(row.tempat_lahir).trim() : '',
          tanggal_lahir:        row.tanggal_lahir ? String(row.tanggal_lahir).trim() : '',
          alamat:               row.alamat ? String(row.alamat).trim() : '',
          no_hp:                row.no_hp ? String(row.no_hp).trim() : '',
          status_perkawinan:    row.status_perkawinan ? String(row.status_perkawinan).trim() : '',
          status_petani:        row.status_petani ? String(row.status_petani).trim() : 'PEMILIK',
          pengalaman_tani_tahun: row.pengalaman_tani_tahun ? String(row.pengalaman_tani_tahun) : '',
        });
        if (res?.success) successCount++; else errorCount++;
      }
      if (successCount > 0 && errorCount === 0) toast.success(`Import berhasil: ${successCount} petani.`);
      else if (successCount > 0) toast.success(`Import: ${successCount} berhasil, ${errorCount} gagal.`);
      else toast.error(`Semua gagal (${errorCount}). Cek NIK, kode_desa, jenis_kelamin.`);
      setIsImportOpen(false); setImportFile(null);
    } catch { toast.error('Gagal membaca file Excel.'); }
    setImportLoading(false);
  };

  const columns = [
    { key: 'nik_nama', header: 'NIK & Nama Petani',
      render: (item: any) => (
        <div>
          <div className="font-semibold text-green-900">{item.nama_lengkap}</div>
          <div className="text-xs text-gray-500 font-mono">{item.nik}</div>
          {item.no_hp && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone size={9}/>{item.no_hp}</div>}
        </div>
      )
    },
    { key: 'wilayah', header: 'Wilayah',
      render: (item: any) => (
        <div>
          <div className="font-medium flex items-center gap-1"><MapPin size={11} className="text-green-600"/>{item.desa?.nama_desa || '-'}</div>
          <div className="text-xs text-gray-400">Kec. {item.desa?.kecamatan?.nama_kecamatan || '-'}</div>
          <div className="text-xs text-gray-400">{item.desa?.kecamatan?.kabupaten?.nama_kabupaten || ''}</div>
        </div>
      )
    },
    { key: 'status_petani', header: 'Status Petani',
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_PETANI_COLOR[item.status_petani] || 'bg-gray-100 text-gray-600'}`}>
          {item.status_petani?.replace('_', ' ') || '-'}
        </span>
      )
    },
    { key: 'poktan', header: 'Poktan',
      render: (item: any) => {
        const poktan = getPoktan(item);
        return poktan
          ? <Badge variant="info">{poktan.nama_poktan}</Badge>
          : <span className="text-xs text-gray-400 italic">Mandiri</span>;
      }
    },
    { key: 'lahan', header: 'Lahan',
      render: (item: any) => <span className="font-medium text-blue-700">{item.lahan?.length || 0} lahan</span>
    },
    { key: 'status_aktif', header: 'Status',
      render: (item: any) => <Badge variant={item.status_aktif ? 'success' : 'danger'}>{item.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge>
    },
    { key: 'aksi', header: 'Aksi',
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }}
            className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" title="Detail">
            <Eye size={14}/>
          </button>
          <button onClick={() => { setSelectedItem(item); setSelectedPoktanId(getPoktan(item)?.id_poktan?.toString() || ''); setIsPoktanOpen(true); }}
            className="text-purple-600 hover:text-purple-900 p-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" title="Gabungkan ke Poktan">
            <GitMerge size={14}/>
          </button>
          <button onClick={() => handleOpenForm(item)}
            className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
            <Edit2 size={14}/>
          </button>
          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }}
            className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
            <Trash2 size={14}/>
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Master Petani"
        description={`Kelola data ${data.length} petani terdaftar beserta wilayah dan keanggotaan poktan.`}
        data={filteredData} columns={columns}
        onAdd={() => handleOpenForm()}
        onImport={() => setIsImportOpen(true)}
        onExport={handleExportPDF}
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
      />

      {/* ── Form Tambah/Edit ─────────────────────────────── */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Data Petani' : 'Tambah Petani Baru'} size="xl"
        footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}

          <WilayahSelector
            initialValues={{ id_desa: formData.id_desa }}
            onDesaChange={val => setFormData(prev => ({ ...prev, id_desa: val }))}
            label="Wilayah Domisili Petani"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="NIK (16 digit) *" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })} required maxLength={16} placeholder="16 digit NIK sesuai KTP" />
            <Input label="Nama Lengkap *" value={formData.nama_lengkap} onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })} required placeholder="Sesuai KTP" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Tempat Lahir" value={formData.tempat_lahir} onChange={e => setFormData({ ...formData, tempat_lahir: e.target.value })} placeholder="Kota lahir" />
            <Input label="Tanggal Lahir" type="date" value={formData.tanggal_lahir} onChange={e => setFormData({ ...formData, tanggal_lahir: e.target.value })} />
            <Select label="Jenis Kelamin" options={jkOpts} value={formData.jenis_kelamin} onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value })} />
          </div>

          <Input label="Alamat Lengkap" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} placeholder="Jl. / Dusun / RT-RW..." />

          <div className="grid grid-cols-2 gap-4">
            <Input label="No. HP" value={formData.no_hp} onChange={e => setFormData({ ...formData, no_hp: e.target.value })} placeholder="08..." />
            <Select label="Status Perkawinan" options={statusKawinOpts} value={formData.status_perkawinan} onChange={e => setFormData({ ...formData, status_perkawinan: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select label="Pendidikan Terakhir"
              options={[{ label: '-- Pilih Pendidikan --', value: '' }, ...(options.pendidikan || []).map(p => ({ label: p.nama_pendidikan, value: p.id_pendidikan.toString() }))]}
              value={formData.id_pendidikan} onChange={e => setFormData({ ...formData, id_pendidikan: e.target.value })} />
            <Select label="Pekerjaan Utama"
              options={[{ label: '-- Pilih Pekerjaan --', value: '' }, ...(options.pekerjaan || []).map(p => ({ label: p.nama_pekerjaan, value: p.id_pekerjaan.toString() }))]}
              value={formData.id_pekerjaan} onChange={e => setFormData({ ...formData, id_pekerjaan: e.target.value })} />
            <Input label="Pengalaman Bertani (thn)" type="number" value={formData.pengalaman_tani_tahun}
              onChange={e => setFormData({ ...formData, pengalaman_tani_tahun: e.target.value })} placeholder="Contoh: 10" />
          </div>

          <Select label="Status Petani" options={statusPetaniOpts} value={formData.status_petani} onChange={e => setFormData({ ...formData, status_petani: e.target.value })} />

          {selectedItem && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="status_aktif_p" checked={formData.status_aktif} onChange={e => setFormData({ ...formData, status_aktif: e.target.checked })} className="rounded border-gray-300 text-green-700" />
              <label htmlFor="status_aktif_p" className="text-sm font-medium text-gray-700">Status Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Detail Modal ──────────────────────────────────── */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)}
        title="Detail Petani" size="lg"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}>
        {selectedItem && (
          <div className="space-y-4">
            {/* Header card */}
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-700 to-green-500 rounded-xl text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs uppercase tracking-wider mb-0.5">{selectedItem.jenis_kelamin === 'L' ? 'Petani Laki-laki' : 'Petani Perempuan'}</p>
                <h4 className="text-xl font-bold">{selectedItem.nama_lengkap}</h4>
                <p className="text-green-200 text-sm font-mono mt-0.5">NIK: {selectedItem.nik || '-'}</p>
              </div>
              <div className="text-right">
                <Badge variant={selectedItem.status_aktif ? 'success' : 'danger'}>{selectedItem.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-semibold text-center ${STATUS_PETANI_COLOR[selectedItem.status_petani] || 'bg-white/20 text-white'}`}>
                  {selectedItem.status_petani?.replace('_', ' ') || '-'}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-1"><MapPin className="w-4 h-4 text-blue-400"/><p className="text-xs text-blue-400">Wilayah</p></div>
                <div className="font-semibold text-blue-900">{selectedItem.desa?.nama_desa || '-'}</div>
                <div className="text-xs text-blue-600">Kec. {selectedItem.desa?.kecamatan?.nama_kecamatan || '-'}</div>
                <div className="text-xs text-blue-500">{selectedItem.desa?.kecamatan?.kabupaten?.nama_kabupaten || ''}</div>
                <div className="text-xs text-blue-400">{selectedItem.desa?.kecamatan?.kabupaten?.provinsi?.nama_provinsi || ''}</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-1.5 mb-1"><Users className="w-4 h-4 text-purple-400"/><p className="text-xs text-purple-400">Keanggotaan Poktan</p></div>
                {getPoktan(selectedItem)
                  ? <div className="font-semibold text-purple-900">{getPoktan(selectedItem).nama_poktan}</div>
                  : <div className="text-sm text-gray-400 italic">Belum bergabung poktan</div>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Calendar className="w-4 h-4 text-gray-400"/>, label: 'Tempat, Tgl Lahir', val: `${selectedItem.tempat_lahir || '-'}, ${selectedItem.tanggal_lahir ? new Date(selectedItem.tanggal_lahir).toLocaleDateString('id-ID') : '-'}` },
                { icon: <Heart className="w-4 h-4 text-gray-400"/>, label: 'Status Perkawinan', val: selectedItem.status_perkawinan || '-' },
                { icon: <Phone className="w-4 h-4 text-gray-400"/>, label: 'No. HP', val: selectedItem.no_hp || '-' },
                { icon: <GraduationCap className="w-4 h-4 text-gray-400"/>, label: 'Pendidikan', val: selectedItem.pendidikan?.nama_pendidikan || '-' },
                { icon: <Briefcase className="w-4 h-4 text-gray-400"/>, label: 'Pekerjaan', val: selectedItem.pekerjaan?.nama_pekerjaan || '-' },
                { icon: <Sprout className="w-4 h-4 text-gray-400"/>, label: 'Pengalaman Bertani', val: selectedItem.pengalaman_tani_tahun ? `${selectedItem.pengalaman_tani_tahun} tahun` : '-' },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">{r.icon}<p className="text-xs text-gray-400">{r.label}</p></div>
                  <div className="font-semibold text-gray-800 text-sm">{r.val}</div>
                </div>
              ))}
            </div>

            {selectedItem.alamat && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1"><MapPin className="w-4 h-4 text-gray-400"/><p className="text-xs text-gray-400">Alamat</p></div>
                <p className="text-gray-700 text-sm">{selectedItem.alamat}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <p className="text-xs text-amber-600 font-medium mb-1">Lahan Terdaftar</p>
                <p className="text-2xl font-bold text-amber-800">{selectedItem.lahan?.length || 0}</p>
                <p className="text-xs text-amber-600">{selectedItem.lahan?.reduce((a: number, l: any) => a + parseFloat(l.luas_lahan || 0), 0).toFixed(2)} Ha total</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><KeyRound className="w-3.5 h-3.5 text-green-600"/><p className="text-xs text-green-600 font-medium">Akun Login</p></div>
                <p className="text-xs font-mono font-bold text-green-800 break-all">{selectedItem.nik || '-'}</p>
                <p className="text-xs text-green-500 mt-0.5">Login via NIK · Petani@123</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Gabung Poktan Modal ───────────────────────────── */}
      <Modal isOpen={isPoktanOpen} onClose={() => setIsPoktanOpen(false)}
        title={`Gabungkan ke Poktan — ${selectedItem?.nama_lengkap}`} size="sm"
        footer={
          <div className="flex w-full gap-2">
            {getPoktan(selectedItem) && (
              <Button variant="danger" onClick={handleKeluarPoktan} isLoading={loading} className="mr-auto">Keluarkan dari Poktan</Button>
            )}
            <Button variant="ghost" onClick={() => setIsPoktanOpen(false)}>Batal</Button>
            <Button onClick={handleGabungPoktan} isLoading={loading}>Gabungkan</Button>
          </div>
        }>
        <div className="space-y-4">
          {getPoktan(selectedItem) && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
              <p className="text-purple-700">Saat ini tergabung di: <strong>{getPoktan(selectedItem)?.nama_poktan}</strong></p>
            </div>
          )}
          <Select label="Pilih Kelompok Tani (Poktan)" options={allPoktanOpts} value={selectedPoktanId} onChange={e => setSelectedPoktanId(e.target.value)} />
          <p className="text-xs text-gray-500">Keanggotaan poktan lama akan digantikan secara otomatis.</p>
        </div>
      </Modal>

      {/* ── Import Modal ──────────────────────────────────── */}
      <Modal isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Petani via Excel" size="md"
        footer={
          <div className="flex w-full justify-between">
            <Button variant="ghost" onClick={() => { setIsImportOpen(false); setImportFile(null); }}>Batal</Button>
            <Button onClick={handleImportSubmit} isLoading={importLoading} leftIcon={<Upload className="w-4 h-4" />}>Mulai Import</Button>
          </div>
        }>
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">1</div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 text-sm">Download Template Excel</p>
                <p className="text-blue-700 text-xs mt-1 mb-3">Wajib: <strong>nik, nama_lengkap, jenis_kelamin, kode_desa</strong>. Kode desa contoh: DES3507012001.</p>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} leftIcon={<FileSpreadsheet className="w-4 h-4 text-green-600" />}>Download Template (.xlsx)</Button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">2</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm mb-2">Upload File Excel</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{importFile ? <span className="font-semibold text-green-700">{importFile.name}</span> : <>Klik untuk pilih file</>}</p>
                  <p className="text-xs text-gray-400 mt-1">Hanya .xlsx / .xls</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => setImportFile(e.target.files?.[0] || null)} />
                {importFile && <button className="mt-2 text-xs text-red-500 flex items-center gap-1" onClick={() => { setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}><X className="w-3 h-3" /> Hapus file</button>}
              </div>
            </div>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            <Shield className="w-3.5 h-3.5 inline mr-1" />
            Petani yang berhasil diimport akan <strong>otomatis mendapat akun login</strong> dengan username = NIK dan password = <strong>Petani@123</strong>.
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ──────────────────────────────────── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Petani"
        footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}
        size="sm">
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-500" /></div>
          <p className="text-gray-700 text-sm">Hapus data petani <strong>{selectedItem?.nama_lengkap}</strong>?</p>
          <p className="text-gray-400 text-xs mt-1">Data terhapus (soft delete) dan akun login tidak dapat diakses.</p>
        </div>
      </Modal>
    </div>
  );
}
