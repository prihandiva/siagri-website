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
import { Edit2, Trash2, UsersRound, MapPin, Building2, Eye, Users, Upload, X, FileSpreadsheet } from 'lucide-react';
import { createGapoktan, updateGapoktan, deleteGapoktan } from './actions';

export default function GapoktanClient({ initialData, options }: { initialData: any[], options: { desa: any[], petani: any[] } }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    id_desa: '', kode_gapoktan: '', nama_gapoktan: '', id_ketua: '', ketua_gapoktan: '', tahun_berdiri: '', status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item: any) => 
      item.nama_gapoktan.toLowerCase().includes(term) ||
      (item.kode_gapoktan || '').toLowerCase().includes(term) ||
      (item.desa?.nama_desa || '').toLowerCase().includes(term) ||
      (item.ketua_gapoktan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa?.toString() || '',
        kode_gapoktan: item.kode_gapoktan || '',
        nama_gapoktan: item.nama_gapoktan || '',
        id_ketua: item.id_ketua || '',
        ketua_gapoktan: item.ketua_gapoktan || '',
        tahun_berdiri: item.tanggal_berdiri ? new Date(item.tanggal_berdiri).getFullYear().toString() : '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ id_desa: '', kode_gapoktan: '', nama_gapoktan: '', id_ketua: '', ketua_gapoktan: '', tahun_berdiri: '', status_aktif: true });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = selectedItem ? await updateGapoktan(selectedItem.id_gapoktan, formData) : await createGapoktan(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Gapoktan diperbarui!' : 'Gapoktan ditambahkan!');
      setIsFormOpen(false); window.location.reload();
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteGapoktan(selectedItem.id_gapoktan);
    setLoading(false);
    if (res?.success) {
      toast.success('Gapoktan dihapus!'); setIsDeleteOpen(false); window.location.reload();
    } else {
      toast.error(res?.error || 'Gagal menghapus.');
    }
  };

  // ── Export PDF ────────────────────────────────────────
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(27, 94, 32); doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('DATA MASTER GAPOKTAN — SIAGRI', 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} gapoktan`, 14, 21);
    let y = 42;
    const cols = [14, 25, 60, 140, 195, 245];
    const heads = ['No', 'Kode', 'Nama Gapoktan', 'Wilayah (Desa/Kec)', 'Ketua', 'Jml Poktan'];
    doc.setFillColor(235, 245, 235); doc.rect(14, y - 6, pageW - 28, 10, 'F');
    doc.setTextColor(27, 94, 32); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    heads.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6; doc.setDrawColor(200, 230, 200); doc.line(14, y - 1, pageW - 14, y - 1);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
    filteredData.forEach((item, idx) => {
      if (y > 190) { doc.addPage(); y = 20; }
      doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255, idx % 2 === 0 ? 250 : 255);
      doc.rect(14, y - 5, pageW - 28, 8, 'F');
      const row = [
        String(idx + 1), item.kode_gapoktan || '-', item.nama_gapoktan,
        `${item.desa?.nama_desa || '-'} / ${item.desa?.kecamatan?.nama_kecamatan || '-'}`,
        item.ketua_gapoktan || '-',
        `${item.list_poktan?.length || 0} poktan`
      ];
      row.forEach((v, i) => doc.text(String(v).substring(0, 40), cols[i], y));
      y += 8;
    });
    doc.save(`Data-Gapoktan-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF berhasil diunduh!');
  };

  // ── Download Template ──────────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_gapoktan', 'nama_gapoktan', 'kode_desa', 'ketua_gapoktan', 'tahun_berdiri'],
      ['GPK001', 'Gapoktan Sumber Makmur', 'DES3507012001', 'Budi Santoso', '2015'],
    ]);
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 16 }, { wch: 25 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Gapoktan');
    XLSX.writeFile(wb, 'Template-Import-Gapoktan.xlsx');
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
        if (!row.kode_gapoktan || !row.nama_gapoktan || !row.kode_desa) { errorCount++; continue; }
        const desaMatch = options.desa.find((d: any) => d.kode_desa === String(row.kode_desa).trim());
        if (!desaMatch) { errorCount++; continue; }
        const res = await createGapoktan({
          id_desa: desaMatch.id_desa,
          kode_gapoktan: String(row.kode_gapoktan).trim(),
          nama_gapoktan: String(row.nama_gapoktan).trim(),
          ketua_gapoktan: row.ketua_gapoktan ? String(row.ketua_gapoktan).trim() : '',
          tahun_berdiri: row.tahun_berdiri ? String(row.tahun_berdiri).trim() : '',
        });
        if (res?.success) successCount++; else errorCount++;
      }
      if (successCount > 0 && errorCount === 0) toast.success(`Import berhasil: ${successCount} gapoktan.`);
      else if (successCount > 0) toast.success(`Import: ${successCount} berhasil, ${errorCount} gagal.`);
      else toast.error(`Semua gagal (${errorCount}). Cek kode_desa & format file.`);
      setIsImportOpen(false); setImportFile(null); window.location.reload();
    } catch { toast.error('Gagal membaca file Excel.'); }
    setImportLoading(false);
  };

  const columns = [
    { key: 'gapoktan', header: 'Gapoktan', render: (item: any) => (
      <div>
        <div className="font-bold text-green-800 flex items-center gap-1.5"><Building2 size={14}/> {item.nama_gapoktan}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">Kode: {item.kode_gapoktan}</div>
      </div>
    )},
    { key: 'wilayah', header: 'Wilayah', render: (item: any) => (
      <div>
        <div className="font-medium flex items-center gap-1"><MapPin size={12} className="text-green-600"/>{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">Kec. {item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'ketua_gapoktan', header: 'Ketua', render: (item: any) => item.ketua_gapoktan ? <span className="font-medium text-gray-800">{item.ketua_gapoktan}</span> : <span className="text-gray-400">-</span> },
    { key: 'anggota', header: 'Poktan Anggota', render: (item: any) => (
      <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 w-fit"><Users size={11}/>{item.list_poktan?.length || 0} poktan</span>
    )},
    { key: 'status_aktif', header: 'Status', render: (item: any) => <Badge variant={item.status_aktif ? 'success' : 'danger'}>{item.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'aksi', header: 'Aksi', render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} className="text-indigo-600 hover:text-indigo-900 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" title="Detail">
            <Eye size={14}/>
          </button>
          <button onClick={() => handleOpenForm(item)} className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
            <Edit2 size={14}/>
          </button>
          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
            <Trash2 size={14}/>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable 
        title="Master Gabungan Kelompok Tani" 
        description={`Kelola data ${data.length} Gapoktan yang menaungi kelompok tani di setiap desa.`}
        data={filteredData} 
        columns={columns} 
        onAdd={() => handleOpenForm()} 
        onImport={() => setIsImportOpen(true)}
        onExport={handleExportPDF}
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Gapoktan" : "Tambah Gapoktan"} size="lg" footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <div className="col-span-2">
            <WilayahSelector 
              initialValues={{ id_desa: formData.id_desa }} 
              onDesaChange={val => setFormData({...formData, id_desa: val})} 
              isEdit={!!selectedItem}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Gapoktan *" value={formData.kode_gapoktan} onChange={e => setFormData({...formData, kode_gapoktan: e.target.value})} required placeholder="GAP-XXX" />
            <Input label="Nama Gapoktan *" value={formData.nama_gapoktan} onChange={e => setFormData({...formData, nama_gapoktan: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input list="petani-list" label="Nama Ketua" value={formData.ketua_gapoktan} 
                onChange={e => {
                  const val = e.target.value;
                  const match = options.petani?.find((p: any) => p.nama_lengkap === val);
                  setFormData({...formData, ketua_gapoktan: val, id_ketua: match ? String(match.id_petani) : ''});
                }} 
                placeholder="Ketik nama / pilih dari list" 
              />
              <datalist id="petani-list">
                {options.petani?.filter((p: any) => !formData.id_desa || String(p.id_desa) === String(formData.id_desa)).map((p: any) => (
                  <option key={p.id_petani} value={p.nama_lengkap}>{p.nik}</option>
                ))}
              </datalist>
            </div>
            <Input label="Tahun Berdiri" type="number" value={formData.tahun_berdiri} onChange={e => setFormData({...formData, tahun_berdiri: e.target.value})} placeholder="Contoh: 2020" />
          </div>
          {selectedItem && (
            <div className="flex items-center gap-2 mt-7">
              <input type="checkbox" id="status_aktif_g" checked={formData.status_aktif} onChange={e => setFormData({...formData, status_aktif: e.target.checked})} className="rounded text-green-600" />
              <label htmlFor="status_aktif_g" className="text-sm">Status Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Gapoktan" size="lg" footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1"><Building2 size={11}/>Identitas Gapoktan</p>
                <p className="font-bold text-green-900 text-lg">{selectedItem.nama_gapoktan}</p>
                <p className="text-xs text-green-700 font-mono mt-0.5">Kode: {selectedItem.kode_gapoktan}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1"><MapPin size={11}/>Wilayah & Ketua</p>
                <p className="font-bold text-blue-900">{selectedItem.desa?.nama_desa || '-'}</p>
                <p className="text-sm text-blue-700 mt-1 flex justify-between items-center">
                  <span>Ketua:</span>
                  <span className="font-semibold bg-white px-2 py-0.5 rounded text-blue-900">{selectedItem.ketua_gapoktan || '-'}</span>
                </p>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><UsersRound size={16}/> Daftar Poktan Anggota</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Nama Poktan</th>
                    <th className="py-3 px-4">Ketua</th>
                    <th className="py-3 px-4 text-center">Jml Anggota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {selectedItem.list_poktan?.length > 0 ? (
                    selectedItem.list_poktan.map((p: any) => (
                      <tr key={p.id_poktan} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{p.nama_poktan}</div>
                          <div className="text-xs text-gray-400 font-mono">{p.kode_poktan}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{p.ketua_poktan || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary">{p.jumlah_anggota || 0}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-400 italic bg-gray-50/50">Belum ada poktan yang tergabung dalam gapoktan ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Import Modal ──────────────────────────────────── */}
      <Modal isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Gapoktan via Excel" size="md"
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
                <p className="text-blue-700 text-xs mt-1 mb-3">Wajib: <strong>kode_gapoktan, nama_gapoktan, kode_desa</strong>. Kode desa contoh: DES3507012001.</p>
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

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Gapoktan" footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}>
        <p className="text-gray-600">Yakin hapus <strong>{selectedItem?.nama_gapoktan}</strong>?</p>
      </Modal>
    </div>
  );
}
