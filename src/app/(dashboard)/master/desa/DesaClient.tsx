'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Edit2, Trash2, Eye, FileText, Home, MapPin, Hash,
  Upload, X, FileSpreadsheet, Users, Map
} from 'lucide-react';
import { createDesa, updateDesa, deleteDesa } from './actions';

const KLASIFIKASI_MAP: Record<string, { label: string; color: string }> = {
  SANGAT_TERTINGGAL: { label: 'Sangat Tertinggal', color: 'bg-red-100 text-red-700' },
  TERTINGGAL:        { label: 'Tertinggal',         color: 'bg-orange-100 text-orange-700' },
  BERKEMBANG:        { label: 'Berkembang',          color: 'bg-yellow-100 text-yellow-700' },
  MAJU:              { label: 'Maju',                color: 'bg-blue-100 text-blue-700' },
  MANDIRI:           { label: 'Mandiri',             color: 'bg-green-100 text-green-700' },
};

export default function DesaClient({
  initialData,
  kecamatanOptions
}: {
  initialData: any[];
  kecamatanOptions: any[];
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    id_kecamatan: '',
    kode_desa: '',
    nama_desa: '',
    status_desa: 'DESA',
    klasifikasi: '',
    kepala_desa: '',
    luas_wilayah: '',
    jumlah_penduduk: '',
    jumlah_kk: '',
    alamat_kantor: '',
    status_aktif: true,
  });
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [importFile, setImportFile]     = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown opts
  const kecOpts = kecamatanOptions.map(k => ({
    label: `${k.nama_kecamatan} (${k.kabupaten?.nama_kabupaten || ''})`,
    value: k.id_kecamatan.toString(),
  }));
  const statusOpts = [
    { label: 'Desa',       value: 'DESA' },
    { label: 'Kelurahan',  value: 'KELURAHAN' },
  ];
  const klasifikasiOpts = [
    { label: '-- Pilih Klasifikasi --',  value: '' },
    { label: 'Sangat Tertinggal', value: 'SANGAT_TERTINGGAL' },
    { label: 'Tertinggal',        value: 'TERTINGGAL' },
    { label: 'Berkembang',        value: 'BERKEMBANG' },
    { label: 'Maju',              value: 'MAJU' },
    { label: 'Mandiri',           value: 'MANDIRI' },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      item.nama_desa.toLowerCase().includes(term) ||
      item.kode_desa.toLowerCase().includes(term) ||
      (item.kecamatan?.nama_kecamatan || '').toLowerCase().includes(term) ||
      (item.kecamatan?.kabupaten?.nama_kabupaten || '').toLowerCase().includes(term) ||
      (item.kepala_desa || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // ── Handlers ───────────────────────────────────────────
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_kecamatan:    item.id_kecamatan?.toString() || '',
        kode_desa:       item.kode_desa,
        nama_desa:       item.nama_desa,
        status_desa:     item.status_desa,
        klasifikasi:     item.klasifikasi || '',
        kepala_desa:     item.kepala_desa || '',
        luas_wilayah:    item.luas_wilayah?.toString() || '',
        jumlah_penduduk: item.jumlah_penduduk?.toString() || '',
        jumlah_kk:       item.jumlah_kk?.toString() || '',
        alamat_kantor:   item.alamat_kantor || '',
        status_aktif:    item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        id_kecamatan:    kecOpts.length > 0 ? kecOpts[0].value : '',
        kode_desa: '', nama_desa: '', status_desa: 'DESA', klasifikasi: '',
        kepala_desa: '', luas_wilayah: '', jumlah_penduduk: '', jumlah_kk: '',
        alamat_kantor: '', status_aktif: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleOpenDetail = (item: any) => { setSelectedItem(item); setIsDetailOpen(true); };
  const handleOpenDelete = (item: any) => { setSelectedItem(item); setIsDeleteOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_kecamatan) { setError('Pilih kecamatan terlebih dahulu.'); return; }
    setLoading(true); setError('');
    const res = selectedItem
      ? await updateDesa(selectedItem.id_desa, formData)
      : await createDesa(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Desa berhasil diperbarui!' : 'Desa berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteDesa(selectedItem.id_desa);
    setLoading(false);
    if (res?.success) { toast.success('Desa berhasil dihapus!'); setIsDeleteOpen(false); }
    else toast.error(res?.error || 'Gagal menghapus data.');
  };

  // ── Export PDF ──────────────────────────────────────────
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(27, 94, 32);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('DATA MASTER DESA / KELURAHAN — SIAGRI', 14, 13);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(
      `Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} desa/kelurahan`,
      14, 22
    );

    let y = 40;
    const cols  = [14, 32, 82, 140, 185, 215, 245];
    const heads = ['No', 'Kode', 'Nama Desa/Kelurahan', 'Kecamatan', 'Status', 'Klasifikasi', 'Akt.'];

    doc.setFillColor(235, 245, 235);
    doc.rect(14, y - 6, pageW - 28, 10, 'F');
    doc.setTextColor(27, 94, 32); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    heads.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6;
    doc.setDrawColor(200, 230, 200);
    doc.line(14, y - 1, pageW - 14, y - 1);

    doc.setFont('helvetica', 'normal');
    filteredData.forEach((item, idx) => {
      if (y > 185) { doc.addPage(); y = 20; }
      doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255, idx % 2 === 0 ? 250 : 255);
      doc.rect(14, y - 5, pageW - 28, 9, 'F');
      doc.setTextColor(60, 60, 60);
      const row = [
        `${idx + 1}`,
        item.kode_desa,
        item.nama_desa,
        item.kecamatan?.nama_kecamatan || '-',
        item.status_desa,
        KLASIFIKASI_MAP[item.klasifikasi]?.label || '-',
        item.status_aktif ? 'Aktif' : 'Non',
      ];
      row.forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 9;
    });

    doc.save(`Data-Desa-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('File PDF berhasil diunduh!');
  };

  // ── Download Template ───────────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_desa',       'nama_desa',    'kode_kecamatan', 'status_desa', 'klasifikasi', 'kepala_desa',   'luas_wilayah', 'jumlah_penduduk', 'jumlah_kk'],
      ['DES3507012003', 'Desa Lateng',  'KEC350701',       'DESA',        'BERKEMBANG',  'Budi Santoso',  '12.5',         '3200',             '890'],
    ]);
    ws['!cols'] = [
      { wch: 16 }, { wch: 30 }, { wch: 14 }, { wch: 12 },
      { wch: 18 }, { wch: 25 }, { wch: 14 }, { wch: 16 }, { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Desa');
    XLSX.writeFile(wb, 'Template-Import-Desa.xlsx');
    toast.success('Template Excel berhasil diunduh!');
  };

  // ── Import Excel ────────────────────────────────────────
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
        if (!row.kode_desa || !row.nama_desa || !row.kode_kecamatan) { errorCount++; continue; }
        const kec = kecamatanOptions.find(k => k.kode_kecamatan === String(row.kode_kecamatan).trim());
        if (!kec) { errorCount++; continue; }
        const res = await createDesa({
          id_kecamatan:    kec.id_kecamatan,
          kode_desa:       String(row.kode_desa).trim(),
          nama_desa:       String(row.nama_desa).trim(),
          status_desa:     row.status_desa ? String(row.status_desa).trim() : 'DESA',
          klasifikasi:     row.klasifikasi   ? String(row.klasifikasi).trim() : undefined,
          kepala_desa:     row.kepala_desa   ? String(row.kepala_desa).trim() : undefined,
          luas_wilayah:    row.luas_wilayah  ? String(row.luas_wilayah)       : undefined,
          jumlah_penduduk: row.jumlah_penduduk ? String(row.jumlah_penduduk)  : undefined,
          jumlah_kk:       row.jumlah_kk     ? String(row.jumlah_kk)          : undefined,
        });
        if (res?.success) successCount++; else errorCount++;
      }

      if (successCount > 0 && errorCount === 0)
        toast.success(`Import berhasil: ${successCount} data ditambahkan.`);
      else if (successCount > 0)
        toast.success(`Import selesai: ${successCount} berhasil, ${errorCount} gagal.`);
      else
        toast.error(`Semua gagal (${errorCount}). Cek kode_kecamatan & kode_desa unik.`);

      setIsImportOpen(false); setImportFile(null);
    } catch {
      toast.error('Gagal membaca file. Pastikan format sesuai template.');
    }
    setImportLoading(false);
  };

  // ── Columns ─────────────────────────────────────────────
  const columns = [
    { key: 'kode_desa', header: 'Kode' },
    {
      key: 'nama_desa', header: 'Nama Desa/Kelurahan',
      render: (item: any) => (
        <div>
          <div className="font-medium">{item.nama_desa}</div>
          <div className="text-xs text-gray-400 mt-0.5">{item.status_desa}</div>
        </div>
      )
    },
    {
      key: 'kecamatan', header: 'Kecamatan',
      render: (item: any) => (
        <div>
          <div className="font-medium">{item.kecamatan?.nama_kecamatan || '-'}</div>
          <div className="text-xs text-gray-400 mt-0.5">{item.kecamatan?.kabupaten?.nama_kabupaten || ''}</div>
        </div>
      )
    },
    { key: 'kepala_desa', header: 'Kepala Desa', render: (item: any) => item.kepala_desa || '-' },
    {
      key: 'status_aktif', header: 'Status',
      render: (item: any) => (
        <Badge variant={item.status_aktif ? 'success' : 'danger'}>
          {item.status_aktif ? 'Aktif' : 'Nonaktif'}
        </Badge>
      )
    },
    {
      key: 'aksi', header: 'Aksi',
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => handleOpenDetail(item)} title="Lihat Detail"
            className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleOpenForm(item)} title="Edit"
            className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleOpenDelete(item)} title="Hapus"
            className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Master Desa / Kelurahan"
        description={`Kelola data ${data.length} desa dan kelurahan di seluruh kecamatan.`}
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        onImport={() => setIsImportOpen(true)}
        onExport={handleExportPDF}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* ── Form Modal ── */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Desa/Kelurahan' : 'Tambah Desa/Kelurahan'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

          {/* Kecamatan — searchable */}
          <SearchableSelect
            label="Kecamatan"
            options={kecOpts}
            value={formData.id_kecamatan}
            onChange={v => setFormData({ ...formData, id_kecamatan: v.toString() })}
            placeholder="Ketik untuk mencari kecamatan..."
            required
          />

          {/* Kode + Nama */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Desa" value={formData.kode_desa}
              onChange={e => setFormData({ ...formData, kode_desa: e.target.value })}
              required maxLength={14} placeholder="Contoh: DES3507262004" />
            <Input label="Nama Desa/Kelurahan" value={formData.nama_desa}
              onChange={e => setFormData({ ...formData, nama_desa: e.target.value })}
              required placeholder="Contoh: Desa Tegalsari" />
          </div>

          {/* Status + Klasifikasi */}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" options={statusOpts} value={formData.status_desa}
              onChange={e => setFormData({ ...formData, status_desa: e.target.value })} required />
            <Select label="Klasifikasi (Opsional)" options={klasifikasiOpts} value={formData.klasifikasi}
              onChange={e => setFormData({ ...formData, klasifikasi: e.target.value })} />
          </div>

          {/* Kepala Desa */}
          <Input label="Nama Kepala Desa / Lurah (Opsional)" value={formData.kepala_desa}
            onChange={e => setFormData({ ...formData, kepala_desa: e.target.value })}
            placeholder="Contoh: Budi Santoso" />

          {/* Statistik */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="Luas Wilayah (Km²)" type="number" step="0.01" value={formData.luas_wilayah}
              onChange={e => setFormData({ ...formData, luas_wilayah: e.target.value })}
              placeholder="Contoh: 12.5" />
            <Input label="Jumlah Penduduk" type="number" value={formData.jumlah_penduduk}
              onChange={e => setFormData({ ...formData, jumlah_penduduk: e.target.value })}
              placeholder="Contoh: 3200" />
            <Input label="Jumlah KK" type="number" value={formData.jumlah_kk}
              onChange={e => setFormData({ ...formData, jumlah_kk: e.target.value })}
              placeholder="Contoh: 890" />
          </div>

          {/* Alamat Kantor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Alamat Kantor (Opsional)</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent resize-none"
              placeholder="Contoh: Jl. Merdeka No. 1, Desa Tegalsari"
              value={formData.alamat_kantor}
              onChange={e => setFormData({ ...formData, alamat_kantor: e.target.value })}
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="status_aktif_desa"
                checked={formData.status_aktif}
                onChange={e => setFormData({ ...formData, status_aktif: e.target.checked })}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]" />
              <label htmlFor="status_aktif_desa" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)}
        title="Detail Desa / Kelurahan"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Header card */}
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-700 to-green-500 rounded-xl text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">
                  {selectedItem.status_desa === 'KELURAHAN' ? 'Kelurahan' : 'Desa'}
                </p>
                <h4 className="text-xl font-bold leading-tight">{selectedItem.nama_desa}</h4>
                <p className="text-green-200 text-sm mt-0.5">
                  {selectedItem.kecamatan?.nama_kecamatan} &nbsp;·&nbsp; {selectedItem.kecamatan?.kabupaten?.nama_kabupaten}
                </p>
              </div>
              {selectedItem.klasifikasi && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${KLASIFIKASI_MAP[selectedItem.klasifikasi]?.color || 'bg-white/20 text-white'}`}>
                  {KLASIFIKASI_MAP[selectedItem.klasifikasi]?.label}
                </span>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Hash className="w-4 h-4 text-gray-400" />,   label: 'Kode Desa',      val: selectedItem.kode_desa },
                { icon: <MapPin className="w-4 h-4 text-gray-400" />, label: 'Provinsi',        val: selectedItem.kecamatan?.kabupaten?.provinsi?.nama_provinsi || '-' },
                { icon: <Users className="w-4 h-4 text-gray-400" />,  label: 'Kepala Desa',     val: selectedItem.kepala_desa || '-' },
                { icon: <FileText className="w-4 h-4 text-gray-400" />, label: 'Status',
                  val: <Badge variant={selectedItem.status_aktif ? 'success' : 'danger'}>{selectedItem.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">{r.icon}<p className="text-xs text-gray-400 font-medium">{r.label}</p></div>
                  <div className="font-semibold text-gray-800 text-sm">{r.val}</div>
                </div>
              ))}
            </div>

            {/* Statistik row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Luas Wilayah', val: selectedItem.luas_wilayah ? `${selectedItem.luas_wilayah} Km²` : '-' },
                { label: 'Penduduk',     val: selectedItem.jumlah_penduduk ? selectedItem.jumlah_penduduk.toLocaleString('id-ID') + ' jiwa' : '-' },
                { label: 'Jumlah KK',   val: selectedItem.jumlah_kk ? selectedItem.jumlah_kk.toLocaleString('id-ID') + ' KK' : '-' },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-green-50 border border-green-100 text-center">
                  <p className="text-xs text-green-600 font-medium mb-1">{s.label}</p>
                  <p className="font-bold text-green-800 text-sm">{s.val}</p>
                </div>
              ))}
            </div>

            {/* Alamat */}
            {selectedItem.alamat_kantor && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                <Map className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Alamat Kantor</p>
                  <p className="text-sm text-gray-700">{selectedItem.alamat_kantor}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Import Excel Modal ── */}
      <Modal isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Data Desa via Excel" size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" onClick={() => { setIsImportOpen(false); setImportFile(null); }}>Batal</Button>
            <Button onClick={handleImportSubmit} isLoading={importLoading} leftIcon={<Upload className="w-4 h-4" />}>
              Mulai Import
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">1</div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 text-sm">Download Template Excel</p>
                <p className="text-blue-700 text-xs mt-1 mb-3">
                  Kolom wajib: <strong>kode_desa</strong>, <strong>nama_desa</strong>, <strong>kode_kecamatan</strong>.<br />
                  Opsional: status_desa, klasifikasi, kepala_desa, luas_wilayah, jumlah_penduduk, jumlah_kk.
                </p>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}
                  leftIcon={<FileSpreadsheet className="w-4 h-4 text-green-600" />}>
                  Download Template (.xlsx)
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">2</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm mb-2">Upload File Excel yang Sudah Diisi</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {importFile
                      ? <span className="font-semibold text-green-700">{importFile.name}</span>
                      : <>Klik untuk memilih file, atau <span className="text-green-600 font-medium">seret ke sini</span></>
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Hanya .xlsx / .xls</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden"
                  onChange={e => setImportFile(e.target.files?.[0] || null)} />
                {importFile && (
                  <button className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1"
                    onClick={() => { setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                    <X className="w-3 h-3" /> Hapus file
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            ⚠️ Data duplikat akan dilewati. Pastikan <strong>kode_kecamatan</strong> sama persis dengan sistem (contoh: KEC350726).
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}
        title="Hapus Desa/Kelurahan"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
        size="sm"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-700 text-sm">
            Apakah Anda yakin ingin menghapus{' '}
            <strong className="text-gray-900">{selectedItem?.nama_desa}</strong>?
          </p>
          <p className="text-gray-400 text-xs mt-1">Data yang dihapus tidak dapat dikembalikan.</p>
        </div>
      </Modal>
    </div>
  );
}
