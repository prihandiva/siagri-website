'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Edit2, Trash2, Eye, FileText, Globe, Map, Hash, Download, Upload, X, FileSpreadsheet
} from 'lucide-react';
import { createProvinsi, updateProvinsi, deleteProvinsi } from './actions';

export default function ProvinsiClient({ initialData }: { initialData: any[] }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({ kode_provinsi: '', nama_provinsi: '', singkatan: '', status_aktif: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.nama_provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.singkatan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        kode_provinsi: item.kode_provinsi,
        nama_provinsi: item.nama_provinsi,
        singkatan: item.singkatan || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ kode_provinsi: '', nama_provinsi: '', singkatan: '', status_aktif: true });
    }
    setIsFormOpen(true);
  };

  const handleOpenDetail = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let res;
    if (selectedItem) {
      res = await updateProvinsi(selectedItem.id_provinsi, formData);
    } else {
      res = await createProvinsi(formData);
    }

    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Provinsi berhasil diperbarui!' : 'Provinsi berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteProvinsi(selectedItem.id_provinsi);
    setLoading(false);
    if (res?.success) {
      toast.success('Provinsi berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  // ── Export PDF ──────────────────────────────────────────
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // Title
    doc.setFillColor(27, 94, 32);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA MASTER PROVINSI — SIAGRI', 14, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} provinsi`, 14, 22);

    // Table header
    let y = 40;
    const cols = [14, 36, 80, 152, 172];
    const headers = ['No', 'Kode', 'Nama Provinsi', 'Singkatan', 'Status'];
    doc.setFillColor(235, 245, 235);
    doc.rect(14, y - 6, pageW - 28, 10, 'F');
    doc.setTextColor(27, 94, 32);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6;
    doc.setDrawColor(200, 230, 200);
    doc.line(14, y - 1, pageW - 14, y - 1);

    // Table rows
    doc.setFont('helvetica', 'normal');
    filteredData.forEach((item, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255, idx % 2 === 0 ? 250 : 255);
      doc.rect(14, y - 5, pageW - 28, 9, 'F');
      doc.setTextColor(60, 60, 60);
      const row = [`${idx + 1}`, item.kode_provinsi, item.nama_provinsi, item.singkatan || '-', item.status_aktif ? 'Aktif' : 'Nonaktif'];
      row.forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 9;
    });

    doc.save(`Data-Provinsi-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('File PDF berhasil diunduh!');
  };

  // ── Download Excel Template ─────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_provinsi', 'nama_provinsi', 'singkatan'],
      ['PRV39', 'Contoh Provinsi Baru', 'CPB'],
    ]);
    ws['!cols'] = [{ wch: 18 }, { wch: 35 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Provinsi');
    XLSX.writeFile(wb, 'Template-Import-Provinsi.xlsx');
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
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);

      let successCount = 0, errorCount = 0;
      for (const row of rows) {
        if (!row.kode_provinsi || !row.nama_provinsi) { errorCount++; continue; }
        const res = await createProvinsi({
          kode_provinsi: String(row.kode_provinsi).trim(),
          nama_provinsi: String(row.nama_provinsi).trim(),
          singkatan: row.singkatan ? String(row.singkatan).trim() : undefined,
        });
        if (res?.success) successCount++; else errorCount++;
      }

      toast.success(`Import selesai: ${successCount} berhasil, ${errorCount} gagal.`);
      setIsImportOpen(false);
      setImportFile(null);
    } catch (err) {
      toast.error('Gagal membaca file Excel. Pastikan format sesuai template.');
    }
    setImportLoading(false);
  };

  const columns = [
    { key: 'kode_provinsi', header: 'Kode' },
    { key: 'nama_provinsi', header: 'Nama Provinsi' },
    { key: 'singkatan', header: 'Singkatan', render: (item: any) => item.singkatan || '-' },
    {
      key: 'status_aktif',
      header: 'Status',
      render: (item: any) => (
        <Badge variant={item.status_aktif ? 'success' : 'danger'}>
          {item.status_aktif ? 'Aktif' : 'Nonaktif'}
        </Badge>
      )
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenDetail(item)}
            title="Lihat Detail"
            className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenForm(item)}
            title="Edit"
            className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(item)}
            title="Hapus"
            className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Master Provinsi"
        description={`Kelola data ${data.length} provinsi di Indonesia.`}
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        onImport={() => setIsImportOpen(true)}
        onExport={handleExportPDF}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* ── Form Modal (Tambah / Edit) ── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Provinsi' : 'Tambah Provinsi'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="provinsi-form" onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
          <Input
            label="Kode Provinsi"
            value={formData.kode_provinsi}
            onChange={e => setFormData({ ...formData, kode_provinsi: e.target.value })}
            required
            maxLength={5}
            placeholder="Contoh: PRV39"
          />
          <Input
            label="Nama Provinsi"
            value={formData.nama_provinsi}
            onChange={e => setFormData({ ...formData, nama_provinsi: e.target.value })}
            required
            placeholder="Contoh: Jawa Timur"
          />
          <Input
            label="Singkatan (Opsional)"
            value={formData.singkatan}
            onChange={e => setFormData({ ...formData, singkatan: e.target.value })}
            placeholder="Contoh: JATIM"
            maxLength={10}
          />
          {selectedItem && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="status_aktif"
                checked={formData.status_aktif}
                onChange={e => setFormData({ ...formData, status_aktif: e.target.checked })}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Provinsi"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}
        size="sm"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-700 to-green-500 rounded-xl text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">Nama Provinsi</p>
                <h4 className="text-xl font-bold leading-tight">{selectedItem.nama_provinsi}</h4>
                {selectedItem.singkatan && <p className="text-green-200 text-sm mt-0.5">{selectedItem.singkatan}</p>}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Hash className="w-4 h-4 text-gray-400" />, label: 'Kode Provinsi', val: selectedItem.kode_provinsi },
                { icon: <Map className="w-4 h-4 text-gray-400" />, label: 'Singkatan', val: selectedItem.singkatan || '-' },
                {
                  icon: <FileText className="w-4 h-4 text-gray-400" />,
                  label: 'Status',
                  val: (
                    <Badge variant={selectedItem.status_aktif ? 'success' : 'danger'}>
                      {selectedItem.status_aktif ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  )
                },
                { icon: <FileText className="w-4 h-4 text-gray-400" />, label: 'ID Internal', val: selectedItem.id_provinsi },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    {r.icon}
                    <p className="text-xs text-gray-400 font-medium">{r.label}</p>
                  </div>
                  <div className="font-semibold text-gray-800 text-sm">{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Import Excel Modal ── */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Data Provinsi via Excel"
        size="md"
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
          {/* Step 1 – Download Template */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">1</div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 text-sm">Download Template Excel</p>
                <p className="text-blue-700 text-xs mt-1 mb-3">
                  Pastikan data diisi sesuai format template. Kolom <strong>kode_provinsi</strong> dan <strong>nama_provinsi</strong> wajib diisi.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  leftIcon={<FileSpreadsheet className="w-4 h-4 text-green-600" />}
                >
                  Download Template (.xlsx)
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 – Upload File */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">2</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm mb-2">Upload File Excel yang Sudah Diisi</p>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {importFile ? (
                      <span className="font-semibold text-green-700">{importFile.name}</span>
                    ) : (
                      <>Klik untuk memilih file, atau <span className="text-green-600 font-medium">seret ke sini</span></>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Hanya file .xlsx / .xls yang didukung</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={e => setImportFile(e.target.files?.[0] || null)}
                />
                {importFile && (
                  <button
                    className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1"
                    onClick={() => { setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  >
                    <X className="w-3 h-3" /> Hapus file
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            ⚠️ Data yang memiliki kode duplikat atau nama yang sama akan dilewati (tidak diimport ulang).
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Provinsi"
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
            Apakah Anda yakin ingin menghapus provinsi{' '}
            <strong className="text-gray-900">{selectedItem?.nama_provinsi}</strong>?
          </p>
          <p className="text-gray-400 text-xs mt-1">Data yang dihapus tidak dapat dikembalikan.</p>
        </div>
      </Modal>
    </div>
  );
}
