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
  Edit2, Trash2, Eye, Hash, Sprout, FileText,
  Upload, X, FileSpreadsheet, Ruler
} from 'lucide-react';
import { createKomoditas, updateKomoditas, deleteKomoditas } from './actions';

export default function KomoditasClient({
  initialData,
  options
}: {
  initialData: any[];
  options?: { subsektor: any[]; satuan: any[] };
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    kode_komoditas: '', nama_komoditas: '',
    id_subsektor: '', id_satuan: '', deskripsi: '', status_aktif: true,
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [importFile, setImportFile]       = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subsektorList = options?.subsektor ?? [];
  const subsektorOpts = subsektorList.map((s: any) => ({
    label: `${s.nama_subsektor} (${s.kode_subsektor})`,
    value: s.id_subsektor?.toString(),
  }));

  const satuanList = options?.satuan ?? [];
  const satuanOpts = [
    { label: '-- Pilih Satuan (Opsional) --', value: '' },
    ...satuanList.map((s: any) => ({
      label: `${s.nama_satuan} (${s.simbol})`,
      value: s.id_satuan?.toString(),
    })),
  ];

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      item.nama_komoditas.toLowerCase().includes(term) ||
      item.kode_komoditas.toLowerCase().includes(term) ||
      (item.subsektor_rel?.nama_subsektor || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        kode_komoditas: item.kode_komoditas,
        nama_komoditas: item.nama_komoditas,
        id_subsektor:   item.id_subsektor?.toString() || '',
        id_satuan:      item.id_satuan?.toString() || '',
        deskripsi:      item.deskripsi || '',
        status_aktif:   item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        kode_komoditas: '', nama_komoditas: '',
        id_subsektor: subsektorOpts[0]?.value || '', id_satuan: '',
        deskripsi: '', status_aktif: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_subsektor) { setError('Pilih subsektor terlebih dahulu.'); return; }
    setLoading(true); setError('');
    const res = selectedItem
      ? await updateKomoditas(selectedItem.id_komoditas, formData)
      : await createKomoditas(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Komoditas berhasil diperbarui!' : 'Komoditas berhasil ditambahkan!');
      setIsFormOpen(false);
    } else setError(res?.error || 'Terjadi kesalahan.');
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteKomoditas(selectedItem.id_komoditas);
    setLoading(false);
    if (res?.success) { toast.success('Komoditas berhasil dihapus!'); setIsDeleteOpen(false); }
    else toast.error(res?.error || 'Gagal menghapus data.');
  };

  // ── Export PDF ──────────────────────────────────────────
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(27, 94, 32); doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('DATA MASTER KOMODITAS — SIAGRI', 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} komoditas`, 14, 21);
    let y = 40;
    const cols = [14, 32, 60, 130, 185, 230];
    const heads = ['No', 'Kode', 'Nama Komoditas', 'Subsektor', 'Satuan', 'Status'];
    doc.setFillColor(235, 245, 235); doc.rect(14, y - 6, pageW - 28, 10, 'F');
    doc.setTextColor(27, 94, 32); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    heads.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6; doc.setDrawColor(200, 230, 200); doc.line(14, y - 1, pageW - 14, y - 1);
    doc.setFont('helvetica', 'normal');
    filteredData.forEach((item, idx) => {
      if (y > 185) { doc.addPage(); y = 20; }
      doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255, idx % 2 === 0 ? 250 : 255);
      doc.rect(14, y - 5, pageW - 28, 9, 'F'); doc.setTextColor(60, 60, 60);
      const row = [
        String(idx + 1), item.kode_komoditas, item.nama_komoditas,
        item.subsektor_rel?.nama_subsektor || '-',
        item.satuan_rel ? `${item.satuan_rel.nama_satuan} (${item.satuan_rel.simbol})` : '-',
        item.status_aktif ? 'Aktif' : 'Nonaktif',
      ];
      row.forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 9;
    });
    doc.save(`Data-Komoditas-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF berhasil diunduh!');
  };

  // ── Download Template ───────────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_komoditas', 'nama_komoditas', 'kode_subsektor', 'kode_satuan', 'deskripsi'],
      ['TP004', 'Singkong', 'TP', 'ST002', 'Ubi kayu varietas unggul'],
    ]);
    ws['!cols'] = [{ wch: 14 }, { wch: 25 }, { wch: 14 }, { wch: 12 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Komoditas');
    XLSX.writeFile(wb, 'Template-Import-Komoditas.xlsx');
    toast.success('Template berhasil diunduh!');
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
        if (!row.kode_komoditas || !row.nama_komoditas || !row.kode_subsektor) { errorCount++; continue; }
        const sub = subsektorList.find((s: any) => s.kode_subsektor === String(row.kode_subsektor).trim());
        if (!sub) { errorCount++; continue; }
        const sat = satuanList.find((s: any) => s.kode_satuan === String(row.kode_satuan || '').trim());
        const res = await createKomoditas({
          kode_komoditas: String(row.kode_komoditas).trim(),
          nama_komoditas: String(row.nama_komoditas).trim(),
          id_subsektor:   sub.id_subsektor,
          id_satuan:      sat ? sat.id_satuan : undefined,
          deskripsi:      row.deskripsi ? String(row.deskripsi).trim() : undefined,
        });
        if (res?.success) successCount++; else errorCount++;
      }
      if (successCount > 0 && errorCount === 0) toast.success(`Import berhasil: ${successCount} data.`);
      else if (successCount > 0) toast.success(`Import: ${successCount} berhasil, ${errorCount} gagal.`);
      else toast.error(`Semua gagal (${errorCount}). Cek kode_subsektor & kode_komoditas unik.`);
      setIsImportOpen(false); setImportFile(null);
    } catch { toast.error('Gagal membaca file.'); }
    setImportLoading(false);
  };

  const columns = [
    { key: 'kode_komoditas', header: 'Kode' },
    { key: 'nama_komoditas', header: 'Nama Komoditas',
      render: (item: any) => <div className="font-medium text-[#1B5E20]">{item.nama_komoditas}</div>
    },
    { key: 'subsektor', header: 'Subsektor',
      render: (item: any) => item.subsektor_rel
        ? <div><div className="font-medium">{item.subsektor_rel.nama_subsektor}</div><div className="text-xs text-gray-400">{item.subsektor_rel.kode_subsektor}</div></div>
        : <span className="text-gray-400">-</span>
    },
    { key: 'satuan', header: 'Satuan',
      render: (item: any) => item.satuan_rel
        ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{item.satuan_rel.nama_satuan} ({item.satuan_rel.simbol})</span>
        : <span className="text-gray-400 text-xs">-</span>
    },
    { key: 'status_aktif', header: 'Status',
      render: (item: any) => <Badge variant={item.status_aktif ? 'success' : 'danger'}>{item.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge>
    },
    { key: 'aksi', header: 'Aksi',
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} title="Detail"
            className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleOpenForm(item)} title="Edit"
            className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} title="Hapus"
            className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable title="Master Komoditas" description={`Kelola data ${data.length} komoditas pertanian, peternakan, perikanan.`}
        data={filteredData} columns={columns} onAdd={() => handleOpenForm()}
        onImport={() => setIsImportOpen(true)} onExport={handleExportPDF}
        searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Form */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Komoditas' : 'Tambah Komoditas'}
        footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
          <SearchableSelect label="Subsektor" options={subsektorOpts} value={formData.id_subsektor}
            onChange={v => setFormData({ ...formData, id_subsektor: v.toString() })}
            placeholder="Ketik untuk mencari subsektor..." required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Komoditas" value={formData.kode_komoditas}
              onChange={e => setFormData({ ...formData, kode_komoditas: e.target.value })}
              required maxLength={10} placeholder="Contoh: TP001" />
            <Input label="Nama Komoditas" value={formData.nama_komoditas}
              onChange={e => setFormData({ ...formData, nama_komoditas: e.target.value })}
              required placeholder="Contoh: Padi" />
          </div>
          <SearchableSelect label="Satuan (Opsional)" options={satuanOpts.slice(1)} value={formData.id_satuan}
            onChange={v => setFormData({ ...formData, id_satuan: v.toString() })}
            placeholder="Ketik untuk mencari satuan..." />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi (Opsional)</label>
            <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent resize-none"
              placeholder="Deskripsi singkat komoditas..." value={formData.deskripsi}
              onChange={e => setFormData({ ...formData, deskripsi: e.target.value })} />
          </div>
          {selectedItem && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="status_aktif_kom" checked={formData.status_aktif}
                onChange={e => setFormData({ ...formData, status_aktif: e.target.checked })}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]" />
              <label htmlFor="status_aktif_kom" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Detail */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Komoditas"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>} size="sm">
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-700 to-green-500 rounded-xl text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-0.5">Komoditas</p>
                <h4 className="text-xl font-bold">{selectedItem.nama_komoditas}</h4>
                <p className="text-green-200 text-sm mt-0.5">{selectedItem.subsektor_rel?.nama_subsektor || '-'}</p>
              </div>
              <Badge variant={selectedItem.status_aktif ? 'success' : 'danger'}>{selectedItem.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Hash className="w-4 h-4 text-gray-400" />, label: 'Kode', val: selectedItem.kode_komoditas },
                { icon: <Sprout className="w-4 h-4 text-gray-400" />, label: 'Subsektor', val: selectedItem.subsektor_rel?.nama_subsektor || '-' },
                { icon: <Ruler className="w-4 h-4 text-gray-400" />, label: 'Satuan', val: selectedItem.satuan_rel ? `${selectedItem.satuan_rel.nama_satuan} (${selectedItem.satuan_rel.simbol})` : '-' },
                { icon: <FileText className="w-4 h-4 text-gray-400" />, label: 'Deskripsi', val: selectedItem.deskripsi || '-' },
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
        title="Import Komoditas via Excel" size="md"
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
                <p className="text-blue-700 text-xs mt-1 mb-3">Wajib: <strong>kode_komoditas</strong>, <strong>nama_komoditas</strong>, <strong>kode_subsektor</strong>. Opsional: kode_satuan, deskripsi.</p>
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
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            ⚠️ Kode duplikat akan dilewati. Pastikan <strong>kode_subsektor</strong> sesuai (contoh: TP, HT, PB, PK, PT).
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Komoditas"
        footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}
        size="sm">
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-500" /></div>
          <p className="text-gray-700 text-sm">Hapus komoditas <strong>{selectedItem?.nama_komoditas}</strong>?</p>
          <p className="text-gray-400 text-xs mt-1">Data yang dihapus tidak dapat dikembalikan.</p>
        </div>
      </Modal>
    </div>
  );
}
