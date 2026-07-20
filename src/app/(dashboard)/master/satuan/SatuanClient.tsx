'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Eye, Hash, Ruler, FileText, Upload, X, FileSpreadsheet } from 'lucide-react';
import { createSatuan, updateSatuan, deleteSatuan } from './actions';

export default function SatuanClient({ initialData }: { initialData: any[] }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({ kode_satuan: '', nama_satuan: '', simbol: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [importFile, setImportFile]       = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredData = useMemo(() =>
    data.filter(item =>
      item.nama_satuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_satuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simbol.toLowerCase().includes(searchTerm.toLowerCase())
    ), [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({ kode_satuan: item.kode_satuan, nama_satuan: item.nama_satuan, simbol: item.simbol });
    } else {
      setSelectedItem(null);
      setFormData({ kode_satuan: '', nama_satuan: '', simbol: '' });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = selectedItem
      ? await updateSatuan(selectedItem.id_satuan, formData)
      : await createSatuan(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Satuan berhasil diperbarui!' : 'Satuan berhasil ditambahkan!');
      setIsFormOpen(false);
    } else setError(res?.error || 'Terjadi kesalahan.');
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteSatuan(selectedItem.id_satuan);
    setLoading(false);
    if (res?.success) { toast.success('Satuan berhasil dihapus!'); setIsDeleteOpen(false); }
    else toast.error(res?.error || 'Gagal menghapus.');
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(27, 94, 32); doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('DATA MASTER SATUAN — SIAGRI', 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} satuan`, 14, 21);
    let y = 40;
    const cols = [14, 32, 62, 120, 160];
    const heads = ['No', 'Kode', 'Nama Satuan', 'Simbol', 'Jml Komoditas'];
    doc.setFillColor(235, 245, 235); doc.rect(14, y - 6, pageW - 28, 10, 'F');
    doc.setTextColor(27, 94, 32); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    heads.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6; doc.setDrawColor(200, 230, 200); doc.line(14, y - 1, pageW - 14, y - 1);
    doc.setFont('helvetica', 'normal');
    filteredData.forEach((item, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255, idx % 2 === 0 ? 250 : 255);
      doc.rect(14, y - 5, pageW - 28, 9, 'F'); doc.setTextColor(60, 60, 60);
      [String(idx + 1), item.kode_satuan, item.nama_satuan, item.simbol, String(item._count?.komoditas || 0)].forEach((v, i) => doc.text(v, cols[i], y));
      y += 9;
    });
    doc.save(`Data-Satuan-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF berhasil diunduh!');
  };

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_satuan', 'nama_satuan', 'simbol'],
      ['ST014', 'Gram', 'g'],
    ]);
    ws['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Satuan');
    XLSX.writeFile(wb, 'Template-Import-Satuan.xlsx');
    toast.success('Template berhasil diunduh!');
  };

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
        if (!row.kode_satuan || !row.nama_satuan || !row.simbol) { errorCount++; continue; }
        const res = await createSatuan({ kode_satuan: String(row.kode_satuan).trim(), nama_satuan: String(row.nama_satuan).trim(), simbol: String(row.simbol).trim() });
        if (res?.success) successCount++; else errorCount++;
      }
      if (successCount > 0 && errorCount === 0) toast.success(`Import berhasil: ${successCount} data.`);
      else if (successCount > 0) toast.success(`Import: ${successCount} berhasil, ${errorCount} gagal.`);
      else toast.error(`Semua gagal (${errorCount}).`);
      setIsImportOpen(false); setImportFile(null);
    } catch { toast.error('Gagal membaca file.'); }
    setImportLoading(false);
  };

  const columns = [
    { key: 'kode_satuan', header: 'Kode', render: (item: any) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{item.kode_satuan}</span> },
    { key: 'nama_satuan', header: 'Nama Satuan', render: (item: any) => <span className="font-medium">{item.nama_satuan}</span> },
    { key: 'simbol', header: 'Simbol',
      render: (item: any) => <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{item.simbol}</span>
    },
    { key: 'jumlah_komoditas', header: 'Jml Komoditas',
      render: (item: any) => <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">{item._count?.komoditas || 0} komoditas</span>
    },
    { key: 'aksi', header: 'Aksi',
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} title="Detail" className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleOpenForm(item)} title="Edit" className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} title="Hapus" className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable title="Master Satuan" description={`Kelola ${data.length} satuan pengukuran komoditas.`}
        data={filteredData} columns={columns} onAdd={() => handleOpenForm()}
        onImport={() => setIsImportOpen(true)} onExport={handleExportPDF}
        searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Form */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Satuan' : 'Tambah Satuan'}
        footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}
        size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
          <Input label="Kode Satuan" value={formData.kode_satuan}
            onChange={e => setFormData({ ...formData, kode_satuan: e.target.value })}
            required maxLength={10} placeholder="Contoh: ST014" />
          <Input label="Nama Satuan" value={formData.nama_satuan}
            onChange={e => setFormData({ ...formData, nama_satuan: e.target.value })}
            required placeholder="Contoh: Kilogram" />
          <Input label="Simbol" value={formData.simbol}
            onChange={e => setFormData({ ...formData, simbol: e.target.value })}
            required maxLength={10} placeholder="Contoh: kg" />
        </form>
      </Modal>

      {/* Detail */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Satuan"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>} size="sm">
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-700 to-green-500 rounded-xl text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Ruler className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-0.5">Satuan</p>
                <h4 className="text-xl font-bold">{selectedItem.nama_satuan}</h4>
                <p className="text-green-200 text-sm mt-0.5">Simbol: <strong>{selectedItem.simbol}</strong></p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Hash className="w-4 h-4 text-gray-400" />, label: 'Kode', val: selectedItem.kode_satuan },
                { icon: <FileText className="w-4 h-4 text-gray-400" />, label: 'Jumlah Komoditas', val: `${selectedItem._count?.komoditas || 0} komoditas` },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">{r.icon}<p className="text-xs text-gray-400">{r.label}</p></div>
                  <div className="font-semibold text-gray-800 text-sm">{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Import */}
      <Modal isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Satuan via Excel" size="md"
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
                <p className="text-blue-700 text-xs mt-1 mb-3">Kolom wajib: <strong>kode_satuan</strong>, <strong>nama_satuan</strong>, <strong>simbol</strong>.</p>
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
        </div>
      </Modal>

      {/* Delete */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Satuan"
        footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}
        size="sm">
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-500" /></div>
          <p className="text-gray-700 text-sm">Hapus satuan <strong>{selectedItem?.nama_satuan} ({selectedItem?.simbol})</strong>?</p>
          <p className="text-gray-400 text-xs mt-1">Tidak dapat dihapus jika masih digunakan oleh komoditas.</p>
        </div>
      </Modal>
    </div>
  );
}
