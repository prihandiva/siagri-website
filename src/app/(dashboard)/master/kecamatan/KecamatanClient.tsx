'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Edit2, Trash2, Eye, FileText, Landmark, MapPin, Hash, Upload, X, FileSpreadsheet
} from 'lucide-react';
import { createKecamatan, updateKecamatan, deleteKecamatan } from './actions';

export default function KecamatanClient({
  initialData,
  kabupatenOptions
}: {
  initialData: any[];
  kabupatenOptions: any[];
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    id_kabupaten: '',
    kode_kecamatan: '',
    nama_kecamatan: '',
    status_aktif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kabOpts = kabupatenOptions.map(k => ({ label: k.nama_kabupaten, value: k.id_kabupaten.toString() }));

  // Filtered data
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      item.nama_kecamatan.toLowerCase().includes(term) ||
      item.kode_kecamatan.toLowerCase().includes(term) ||
      (item.kabupaten?.nama_kabupaten || '').toLowerCase().includes(term) ||
      (item.kabupaten?.provinsi?.nama_provinsi || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_kabupaten: item.id_kabupaten?.toString() || '',
        kode_kecamatan: item.kode_kecamatan,
        nama_kecamatan: item.nama_kecamatan,
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        id_kabupaten: kabOpts.length > 0 ? kabOpts[0].value : '',
        kode_kecamatan: '',
        nama_kecamatan: '',
        status_aktif: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleOpenDetail = (item: any) => { setSelectedItem(item); setIsDetailOpen(true); };
  const handleOpenDelete = (item: any) => { setSelectedItem(item); setIsDeleteOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_kabupaten) { setError('Pilih kabupaten/kota terlebih dahulu.'); return; }
    setLoading(true); setError('');
    const res = selectedItem
      ? await updateKecamatan(selectedItem.id_kecamatan, formData)
      : await createKecamatan(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Kecamatan berhasil diperbarui!' : 'Kecamatan berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteKecamatan(selectedItem.id_kecamatan);
    setLoading(false);
    if (res?.success) { toast.success('Kecamatan berhasil dihapus!'); setIsDeleteOpen(false); }
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
    doc.text('DATA MASTER KECAMATAN — SIAGRI', 14, 13);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} kecamatan`, 14, 22);

    let y = 40;
    const cols = [14, 34, 82, 152, 212, 237];
    const headers = ['No', 'Kode', 'Nama Kecamatan', 'Kabupaten/Kota', 'Jml Desa', 'Status'];
    doc.setFillColor(235, 245, 235);
    doc.rect(14, y - 6, pageW - 28, 10, 'F');
    doc.setTextColor(27, 94, 32); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => doc.text(h, cols[i], y));
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
        `${idx + 1}`, item.kode_kecamatan, item.nama_kecamatan,
        item.kabupaten?.nama_kabupaten || '-',
        item._count?.desa?.toString() || '0',
        item.status_aktif ? 'Aktif' : 'Nonaktif',
      ];
      row.forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 9;
    });

    doc.save(`Data-Kecamatan-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('File PDF berhasil diunduh!');
  };

  // ── Download Template ───────────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_kecamatan', 'nama_kecamatan', 'kode_kabupaten'],
      ['KEC350703', 'Kecamatan Kalipuro', 'KAB3507'],
    ]);
    ws['!cols'] = [{ wch: 16 }, { wch: 35 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Kecamatan');
    XLSX.writeFile(wb, 'Template-Import-Kecamatan.xlsx');
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
        if (!row.kode_kecamatan || !row.nama_kecamatan || !row.kode_kabupaten) { errorCount++; continue; }
        const kab = kabupatenOptions.find(k => k.kode_kabupaten === String(row.kode_kabupaten).trim());
        if (!kab) { errorCount++; continue; }
        const res = await createKecamatan({
          id_kabupaten: kab.id_kabupaten,
          kode_kecamatan: String(row.kode_kecamatan).trim(),
          nama_kecamatan: String(row.nama_kecamatan).trim(),
        });
        if (res?.success) successCount++; else errorCount++;
      }
      
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Import berhasil: ${successCount} data ditambahkan.`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`Import selesai: ${successCount} berhasil, ${errorCount} gagal.`);
      } else if (successCount === 0 && errorCount > 0) {
        toast.error(`Semua gagal. Pastikan kode_kabupaten sudah benar & kode_kecamatan unik. Total error: ${errorCount}`);
      } else {
        toast.error('File Excel kosong atau format tidak sesuai.');
      }
      
      setIsImportOpen(false); setImportFile(null);
    } catch {
      toast.error('Gagal membaca file Excel. Pastikan format sesuai template.');
    }
    setImportLoading(false);
  };

  const columns = [
    { key: 'kode_kecamatan', header: 'Kode' },
    { key: 'nama_kecamatan', header: 'Nama Kecamatan' },
    {
      key: 'kabupaten', header: 'Kabupaten/Kota',
      render: (item: any) => (
        <div>
          <div className="font-medium">{item.kabupaten?.nama_kabupaten || '-'}</div>
          <div className="text-xs text-gray-400 mt-0.5">{item.kabupaten?.provinsi?.nama_provinsi || ''}</div>
        </div>
      )
    },
    { key: 'jumlah_desa', header: 'Jml Desa', render: (item: any) => item._count?.desa || '0' },
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
        title="Master Kecamatan"
        description={`Kelola data ${data.length} kecamatan dari seluruh kabupaten.`}
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
        title={selectedItem ? 'Edit Kecamatan' : 'Tambah Kecamatan'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

          <SearchableSelect
            label="Kabupaten / Kota"
            options={kabOpts}
            value={formData.id_kabupaten}
            onChange={value => setFormData({ ...formData, id_kabupaten: value.toString() })}
            placeholder="Ketik untuk mencari kabupaten..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Kecamatan" value={formData.kode_kecamatan}
              onChange={e => setFormData({ ...formData, kode_kecamatan: e.target.value })}
              required maxLength={9} placeholder="Contoh: KEC350726" />
            <Input label="Nama Kecamatan" value={formData.nama_kecamatan}
              onChange={e => setFormData({ ...formData, nama_kecamatan: e.target.value })}
              required placeholder="Contoh: Kecamatan Tegalsari" />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="status_aktif_kec"
                checked={formData.status_aktif}
                onChange={e => setFormData({ ...formData, status_aktif: e.target.checked })}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]" />
              <label htmlFor="status_aktif_kec" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)}
        title="Detail Kecamatan"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}
        size="sm"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-700 to-green-500 rounded-xl text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Landmark className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">Kecamatan</p>
                <h4 className="text-xl font-bold leading-tight">{selectedItem.nama_kecamatan}</h4>
                <p className="text-green-200 text-sm mt-0.5">{selectedItem.kabupaten?.nama_kabupaten}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Hash className="w-4 h-4 text-gray-400" />, label: 'Kode Kecamatan', val: selectedItem.kode_kecamatan },
                { icon: <MapPin className="w-4 h-4 text-gray-400" />, label: 'Provinsi', val: selectedItem.kabupaten?.provinsi?.nama_provinsi || '-' },
                { icon: <Landmark className="w-4 h-4 text-gray-400" />, label: 'Jumlah Desa (Aktual)', val: selectedItem._count?.desa ? `${selectedItem._count.desa} desa` : '0 desa' },
                {
                  icon: <FileText className="w-4 h-4 text-gray-400" />, label: 'Status',
                  val: (
                    <Badge variant={selectedItem.status_aktif ? 'success' : 'danger'}>
                      {selectedItem.status_aktif ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  )
                },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">{r.icon}<p className="text-xs text-gray-400 font-medium">{r.label}</p></div>
                  <div className="font-semibold text-gray-800 text-sm">{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Import Excel Modal ── */}
      <Modal isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Data Kecamatan via Excel" size="md"
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
                  Kolom <strong>kode_kecamatan</strong>, <strong>nama_kecamatan</strong>, dan <strong>kode_kabupaten</strong> wajib diisi. Kode kabupaten harus sama persis dengan data di sistem (contoh: KAB3507).
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
                  <p className="text-xs text-gray-400 mt-1">Hanya file .xlsx / .xls yang didukung</p>
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
            ⚠️ Data yang memiliki kode duplikat akan dilewati. Pastikan kode_kabupaten sama persis dengan data sistem.
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}
        title="Hapus Kecamatan"
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
            <strong className="text-gray-900">{selectedItem?.nama_kecamatan}</strong>?
          </p>
          <p className="text-gray-400 text-xs mt-1">Data yang dihapus tidak dapat dikembalikan.</p>
        </div>
      </Modal>
    </div>
  );
}
