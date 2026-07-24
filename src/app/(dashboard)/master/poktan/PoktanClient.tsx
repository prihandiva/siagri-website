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
import { Edit2, Trash2, GitMerge, UsersRound, MapPin, Building, Upload, X, FileSpreadsheet, Eye } from 'lucide-react';
import { createPoktan, updatePoktan, deletePoktan, gabungkanPoktanKeGapoktan, keluarkanPoktanDariGapoktan } from './actions';

export default function PoktanClient({ initialData, options }: { initialData: any[], options: { desa: any[], gapoktan: any[], petani: any[], kelas: any[] } }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isGapoktanOpen, setIsGapoktanOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedGapoktanId, setSelectedGapoktanId] = useState('');
  
  const [formData, setFormData] = useState({ 
    id_desa: '', id_gapoktan: '', kode_poktan: '', nama_poktan: '', 
    id_ketua: '', ketua_poktan: '', kelas_kemampuan: '', tahun_berdiri: '', status_aktif: true 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dynamicGapoktanOpts = useMemo(() => {
    const base = options.gapoktan ?? [];
    const filtered = formData.id_desa ? base.filter((g: any) => String(g.id_desa) === String(formData.id_desa)) : base;
    return [{ label: '-- Tidak Tergabung Gapoktan --', value: '' }, ...filtered.map((g: any) => ({ label: g.nama_gapoktan, value: String(g.id_gapoktan) }))];
  }, [options.gapoktan, formData.id_desa]);

  // Dropdown Gabung ke Gapoktan, DIBATASI BERDASARKAN DESA POKTAN SAAT INI
  const allGapoktanOpts = useMemo(() => {
    const base = options.gapoktan ?? [];
    const desa = selectedItem?.id_desa;
    const filtered = desa ? base.filter((g: any) => String(g.id_desa) === String(desa)) : base;
    return [{ label: '-- Pilih Gapoktan di Desa Ini --', value: '' }, ...filtered.map((g: any) => ({ label: g.nama_gapoktan, value: String(g.id_gapoktan) }))];
  }, [options.gapoktan, selectedItem]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item: any) => 
      item.nama_poktan.toLowerCase().includes(term) ||
      (item.kode_poktan || '').toLowerCase().includes(term) ||
      (item.desa?.nama_desa || '').toLowerCase().includes(term) ||
      (item.gapoktan?.nama_gapoktan || '').toLowerCase().includes(term) ||
      (item.ketua_poktan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa?.toString() || '',
        id_gapoktan: item.id_gapoktan?.toString() || '',
        kode_poktan: item.kode_poktan || '',
        nama_poktan: item.nama_poktan || '',
        id_ketua: item.id_ketua || '',
        ketua_poktan: item.ketua_poktan || '',
        kelas_kemampuan: item.id_kelas?.toString() || '',
        tahun_berdiri: item.tanggal_berdiri ? new Date(item.tanggal_berdiri).getFullYear().toString() : '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ id_desa: '', id_gapoktan: '', kode_poktan: '', nama_poktan: '', id_ketua: '', ketua_poktan: '', kelas_kemampuan: '', tahun_berdiri: '', status_aktif: true });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = selectedItem ? await updatePoktan(selectedItem.id_poktan, formData) : await createPoktan(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Poktan diperbarui!' : 'Poktan ditambahkan!');
      setIsFormOpen(false); window.location.reload();
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePoktan(selectedItem.id_poktan);
    setLoading(false);
    if (res?.success) {
      toast.success('Poktan dihapus!'); setIsDeleteOpen(false); window.location.reload();
    } else {
      toast.error(res?.error || 'Gagal menghapus.');
    }
  };

  const handleGabungGapoktan = async () => {
    if (!selectedGapoktanId) { toast.error('Pilih Gapoktan terlebih dahulu.'); return; }
    setLoading(true);
    const res = await gabungkanPoktanKeGapoktan(selectedItem.id_poktan, selectedGapoktanId);
    setLoading(false);
    if (res?.success) {
      toast.success('Poktan berhasil digabungkan!'); setIsGapoktanOpen(false); window.location.reload();
    } else { toast.error(res?.error || 'Gagal.'); }
  };

  const handleKeluarGapoktan = async () => {
    setLoading(true);
    const res = await keluarkanPoktanDariGapoktan(selectedItem.id_poktan);
    setLoading(false);
    if (res?.success) {
      toast.success('Poktan dikeluarkan dari Gapoktan!'); setIsGapoktanOpen(false); window.location.reload();
    } else { toast.error(res?.error || 'Gagal.'); }
  };

  // ── Export PDF ────────────────────────────────────────
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(27, 94, 32); doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('DATA MASTER POKTAN — SIAGRI', 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} poktan`, 14, 21);
    let y = 42;
    const cols = [14, 25, 55, 105, 150, 190, 245];
    const heads = ['No', 'Kode', 'Nama Poktan', 'Tergabung Gapoktan', 'Wilayah (Desa)', 'Ketua', 'Jml Anggota'];
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
        String(idx + 1), item.kode_poktan || '-', item.nama_poktan,
        item.gapoktan?.nama_gapoktan || '(Mandiri)',
        item.desa?.nama_desa || '-',
        item.ketua_poktan || '-',
        `${item.jumlah_anggota || 0} org`
      ];
      row.forEach((v, i) => doc.text(String(v).substring(0, 35), cols[i], y));
      y += 8;
    });
    doc.save(`Data-Poktan-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF berhasil diunduh!');
  };

  // ── Download Template ──────────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_poktan', 'nama_poktan', 'kode_desa', 'kode_gapoktan', 'ketua_poktan', 'kelas_kemampuan', 'tahun_berdiri'],
      ['PKT001', 'Poktan Sumber Rejeki', 'DES3507012001', 'GPK001', 'Sujono', 'Pemula', '2016'],
      ['PKT002', 'Poktan Makmur Tani', 'DES3507012001', '', 'Budi', 'Lanjut', '2018'],
    ]);
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Poktan');
    XLSX.writeFile(wb, 'Template-Import-Poktan.xlsx');
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
        if (!row.kode_poktan || !row.nama_poktan || !row.kode_desa) { errorCount++; continue; }
        const desaMatch = options.desa.find((d: any) => d.kode_desa === String(row.kode_desa).trim());
        if (!desaMatch) { errorCount++; continue; }
        
        let gapoktanId = null;
        if (row.kode_gapoktan) {
          const gapoktanMatch = options.gapoktan.find((g: any) => g.kode_gapoktan === String(row.kode_gapoktan).trim());
          if (gapoktanMatch) gapoktanId = gapoktanMatch.id_gapoktan;
        }

        const res = await createPoktan({
          id_desa: desaMatch.id_desa,
          id_gapoktan: gapoktanId,
          kode_poktan: String(row.kode_poktan).trim(),
          nama_poktan: String(row.nama_poktan).trim(),
          ketua_poktan: row.ketua_poktan ? String(row.ketua_poktan).trim() : '',
          kelas_kemampuan: row.kelas_kemampuan ? String(row.kelas_kemampuan).trim() : '',
          tahun_berdiri: row.tahun_berdiri ? String(row.tahun_berdiri).trim() : '',
        });
        if (res?.success) successCount++; else errorCount++;
      }
      if (successCount > 0 && errorCount === 0) toast.success(`Import berhasil: ${successCount} poktan.`);
      else if (successCount > 0) toast.success(`Import: ${successCount} berhasil, ${errorCount} gagal.`);
      else toast.error(`Semua gagal (${errorCount}). Cek kode_desa & format file.`);
      setIsImportOpen(false); setImportFile(null); window.location.reload();
    } catch { toast.error('Gagal membaca file Excel.'); }
    setImportLoading(false);
  };

  const columns = [
    { key: 'poktan', header: 'Poktan', render: (item: any) => (
      <div>
        <div className="font-bold text-green-800 flex items-center gap-1.5"><UsersRound size={14}/> {item.nama_poktan}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">Kode: {item.kode_poktan}</div>
        {item.gapoktan ? (
          <div className="text-xs text-purple-600 mt-1 flex items-center gap-1"><Building size={10}/> Gabung: {item.gapoktan.nama_gapoktan}</div>
        ) : (
          <div className="text-xs text-gray-400 mt-1 italic flex items-center gap-1"><Building size={10}/> Mandiri / Belum Gabung</div>
        )}
      </div>
    )},
    { key: 'wilayah', header: 'Wilayah', render: (item: any) => (
      <div>
        <div className="font-medium flex items-center gap-1"><MapPin size={12} className="text-green-600"/>{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">Kec. {item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'ketua_poktan', header: 'Ketua', render: (item: any) => item.ketua_poktan ? <span className="font-medium text-gray-800">{item.ketua_poktan}</span> : <span className="text-gray-400">-</span> },
    { key: 'kelas_kemampuan', header: 'Kelas', render: (item: any) => item.kelas_kemampuan ? <Badge variant="info">{item.kelas_kemampuan}</Badge> : '-' },
    { key: 'status_aktif', header: 'Status', render: (item: any) => <Badge variant={item.status_aktif ? 'success' : 'danger'}>{item.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'aksi', header: 'Aksi', render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} className="text-gray-600 hover:text-gray-900 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" title="Detail">
            <Eye size={14}/>
          </button>
          <button onClick={() => { setSelectedItem(item); setSelectedGapoktanId(item.id_gapoktan?.toString() || ''); setIsGapoktanOpen(true); }}
            className="text-purple-600 hover:text-purple-900 p-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" title="Gabungkan ke Gapoktan">
            <GitMerge size={14}/>
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
        title="Master Kelompok Tani" 
        description={`Kelola data ${data.length} Kelompok Tani (Poktan) yang ada.`}
        data={filteredData} 
        columns={columns} 
        onAdd={() => handleOpenForm()} 
        onImport={() => setIsImportOpen(true)}
        onExport={handleExportPDF}
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Kelompok Tani" : "Tambah Kelompok Tani"} size="lg" footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <div className="col-span-2">
            <WilayahSelector 
              initialValues={{ id_desa: formData.id_desa }} 
              onDesaChange={val => setFormData({...formData, id_desa: val, id_gapoktan: ''})} 
              isEdit={!!selectedItem}
            />
          </div>
          <Select label="Tergabung dalam Gapoktan" options={dynamicGapoktanOpts} value={formData.id_gapoktan} onChange={e => setFormData({...formData, id_gapoktan: e.target.value})} disabled={!formData.id_desa} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Poktan *" value={formData.kode_poktan} onChange={e => setFormData({...formData, kode_poktan: e.target.value})} required placeholder="POK-XXX" />
            <Input label="Nama Poktan *" value={formData.nama_poktan} onChange={e => setFormData({...formData, nama_poktan: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input list="petani-list" label="Nama Ketua" value={formData.ketua_poktan} 
                onChange={e => {
                  const val = e.target.value;
                  const match = options.petani?.find((p: any) => p.nama_lengkap === val);
                  setFormData({...formData, ketua_poktan: val, id_ketua: match ? String(match.id_petani) : ''});
                }} 
                placeholder="Ketik nama / pilih dari list" 
              />
              <datalist id="petani-list">
                {options.petani?.filter((p: any) => !formData.id_desa || String(p.id_desa) === String(formData.id_desa)).map((p: any) => (
                  <option key={p.id_petani} value={p.nama_lengkap}>{p.nik}</option>
                ))}
              </datalist>
            </div>
            <Select label="Kelas Kemampuan" options={[{label:'-- Pilih Kelas --',value:''}, ...(options.kelas?.map((k: any) => ({ label: k.nama_kelas, value: String(k.id_kelas) })) || [])]} value={formData.kelas_kemampuan} onChange={e => setFormData({...formData, kelas_kemampuan: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tahun Berdiri" type="number" value={formData.tahun_berdiri} onChange={e => setFormData({...formData, tahun_berdiri: e.target.value})} placeholder="Contoh: 2020" />
            {selectedItem && (
              <div className="flex items-center gap-2 mt-7">
                <input type="checkbox" id="status_aktif_p" checked={formData.status_aktif} onChange={e => setFormData({...formData, status_aktif: e.target.checked})} className="rounded text-green-600" />
                <label htmlFor="status_aktif_p" className="text-sm">Status Aktif</label>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Kelompok Tani" size="lg" footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1"><UsersRound size={11}/>Identitas Poktan</p>
                <p className="font-bold text-green-900 text-lg">{selectedItem.nama_poktan}</p>
                <p className="text-xs text-green-700 font-mono mt-0.5 mb-2">Kode: {selectedItem.kode_poktan}</p>
                {selectedItem.gapoktan ? (
                  <Badge variant="purple"><Building size={10} className="mr-1 inline-block"/> Gapoktan: {selectedItem.gapoktan.nama_gapoktan}</Badge>
                ) : (
                  <Badge variant="secondary">Mandiri (Belum Gabung Gapoktan)</Badge>
                )}
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1"><MapPin size={11}/>Wilayah & Pengurus</p>
                <p className="font-bold text-blue-900">{selectedItem.desa?.nama_desa || '-'}</p>
                <p className="text-sm text-blue-700 mt-2 flex justify-between items-center">
                  <span>Ketua:</span>
                  <span className="font-semibold bg-white px-2 py-0.5 rounded text-blue-900">{selectedItem.ketua_poktan || '-'}</span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 font-medium mb-1 flex items-center gap-1">Kelas Kemampuan</p>
                    <p className="font-bold text-orange-900">{selectedItem.kelas_kemampuan || 'Belum Diatur'}</p>
                  </div>
                  {selectedItem.kelas_kemampuan && <Badge variant="warning">{selectedItem.kelas_kemampuan}</Badge>}
               </div>
               <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-600 font-medium mb-1 flex items-center gap-1">Jumlah Anggota</p>
                    <p className="font-bold text-indigo-900">{selectedItem.jumlah_anggota || 0} Petani</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Gabung Gapoktan Modal */}
      <Modal isOpen={isGapoktanOpen} onClose={() => setIsGapoktanOpen(false)} title={`Gabungkan ke Gapoktan`} size="sm" footer={
        <div className="flex w-full gap-2">
          {selectedItem?.gapoktan && <Button variant="danger" onClick={handleKeluarGapoktan} isLoading={loading} className="mr-auto">Keluarkan</Button>}
          <Button variant="ghost" onClick={() => setIsGapoktanOpen(false)}>Batal</Button>
          <Button onClick={handleGabungGapoktan} isLoading={loading}>Gabungkan</Button>
        </div>
      }>
        <div className="space-y-4">
          <p className="font-semibold text-gray-800">{selectedItem?.nama_poktan}</p>
          {selectedItem?.gapoktan && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
              <p className="text-purple-700">Saat ini: <strong>{selectedItem.gapoktan.nama_gapoktan}</strong></p>
            </div>
          )}
          <Select label="Pilih Gapoktan (Berdasarkan Desa)" options={allGapoktanOpts} value={selectedGapoktanId} onChange={e => setSelectedGapoktanId(e.target.value)} />
          <p className="text-xs text-gray-500">Opsi Gapoktan di atas hanya menampilkan Gapoktan yang terdaftar di Desa <strong>{selectedItem?.desa?.nama_desa}</strong>.</p>
        </div>
      </Modal>

      {/* ── Import Modal ──────────────────────────────────── */}
      <Modal isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Poktan via Excel" size="md"
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
                <p className="text-blue-700 text-xs mt-1 mb-3">Wajib: <strong>kode_poktan, nama_poktan, kode_desa</strong>.</p>
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
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Poktan" footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}>
        <p className="text-gray-600">Yakin hapus <strong>{selectedItem?.nama_poktan}</strong>?</p>
      </Modal>
    </div>
  );
}
