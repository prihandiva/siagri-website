'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Trash2, Upload, X } from 'lucide-react';
import { MapPicker } from '@/components/ui/MapPicker';
import { createLahan, updateLahan, deleteLahan } from './actions';
import { WilayahSelector } from '@/components/ui/WilayahSelector';

export default function LahanClient({ 
  initialData, 
  options,
  userRole,
  userNik
}: { 
  initialData: any[],
  options: { petani: any[], desa: any[], status_lahan: any[] },
  userRole?: string,
  userNik?: string
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    id_petani: '',
    id_desa: '',
    kode_lahan: '', 
    nama_lahan: '',
    luas_lahan: '',
    id_status_lahan: '',
    jenis_irigasi: '',
    jenis_tanah: '',
    sumber_air: '',
    ketinggian: '',
    latitude: '',
    longitude: '',
    keterangan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [dynamicPetaniOpts, setDynamicPetaniOpts] = useState<{label: string, value: string}[]>([]);

  React.useEffect(() => {
    if (userRole === 'R009' && options.petani?.length > 0) {
      setDynamicPetaniOpts([{
        label: `${options.petani[0].nama_lengkap} - ${options.petani[0].nik}`,
        value: options.petani[0].id_petani.toString()
      }]);
      setFormData(prev => ({ ...prev, id_petani: options.petani[0].id_petani.toString() }));
    } else if (formData.id_desa) {
      fetch(`/api/petani?id_desa=${formData.id_desa}`)
        .then(res => res.json())
        .then(data => {
          setDynamicPetaniOpts(data.map((p: any) => ({
            label: `${p.nama_lengkap}${p.nik ? ` - ${p.nik}` : ''}`,
            value: p.id_petani.toString()
          })));
        });
    } else {
      setDynamicPetaniOpts([]);
    }
  }, [formData.id_desa, userRole, options.petani]);

  // Petani options cascade dari pemilihan Desa (dynamicPetaniOpts)
  // Dusun options sudah tidak diperlukan karena diambil alih oleh WilayahSelector

  const statusList = options?.status_lahan ?? [];
  const statusLahanOpts = [
    { label: '-- Pilih Status Lahan --', value: '' },
    ...statusList.map((s: any) => ({
      label: s.nama_status,
      value: s.id_status?.toString()
    }))
  ];

  const irigasiOpts = [
    { label: '-- Pilih Irigasi --', value: '' },
    { label: 'Irigasi Teknis', value: 'IRIGASI_TEKNIS' },
    { label: 'Setengah Teknis', value: 'SETENGAH_TEKNIS' },
    { label: 'Sederhana', value: 'SEDERHANA' },
    { label: 'Tadah Hujan', value: 'TADAH_HUJAN' },
  ];

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.kode_lahan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.petani?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nama_lahan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_petani: item.id_petani?.toString() || '',
        id_desa: item.id_desa?.toString() || '',
        kode_lahan: item.kode_lahan || '',
        nama_lahan: item.nama_lahan || '',
        luas_lahan: item.luas_lahan?.toString() || '',
        id_status_lahan: item.id_status_lahan?.toString() || '',
        jenis_irigasi: item.jenis_irigasi || '',
        jenis_tanah: item.jenis_tanah || '',
        sumber_air: item.sumber_air || '',
        ketinggian: item.ketinggian?.toString() || '',
        latitude: item.latitude?.toString() || '',
        longitude: item.longitude?.toString() || '',
        keterangan: item.keterangan || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_petani: '',
        id_desa: '',
        kode_lahan: '', 
        nama_lahan: '',
        luas_lahan: '',
        id_status_lahan: '',
        jenis_irigasi: '',
        jenis_tanah: '',
        sumber_air: '',
        ketinggian: '',
        latitude: '',
        longitude: '',
        keterangan: '',
      });
    }
    setIsFormOpen(true);
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
      res = await updateLahan(selectedItem.id_lahan, formData);
    } else {
      res = await createLahan(formData);
    }

    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data lahan diperbarui!' : 'Lahan berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  // ── Export PDF ────────────────────────────────────────
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(27, 94, 32); doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('DATA LAHAN PETANI — SIAGRI', 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Total: ${filteredData.length} lahan`, 14, 21);
    let y = 42;
    const cols = [14, 40, 85, 140, 185, 220, 255];
    const heads = ['Kode Lahan', 'Nama Lahan', 'Petani Pemilik', 'Desa', 'Luas (Ha)', 'Status Lahan', 'Irigasi'];
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
        item.kode_lahan || '-', 
        item.nama_lahan || '-', 
        item.petani?.nama_lengkap || '-',
        item.petani?.desa?.nama_desa || '-',
        parseFloat(item.luas_lahan || 0).toFixed(2),
        item.status_lahan_rel?.nama_status || '-',
        item.jenis_irigasi || '-'
      ];
      row.forEach((v, i) => doc.text(String(v).substring(0, 25), cols[i], y));
      y += 8;
    });
    doc.save(`Data-Lahan-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF berhasil diunduh!');
  };

  // ── Download Template ──────────────────────────────────
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([
      ['kode_lahan', 'nama_lahan', 'nik_petani', 'kode_desa', 'luas_lahan', 'id_status_lahan', 'jenis_irigasi', 'jenis_tanah', 'sumber_air', 'ketinggian'],
      ['LHN-001', 'Sawah Blok A', '3507011405780001', 'DES3507012001', '1.50', '1', 'IRIGASI_TEKNIS', 'Latosol', 'Sumur Bor', '250'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Lahan');
    XLSX.writeFile(wb, 'Template-Import-Lahan.xlsx');
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
        if (!row.kode_lahan || !row.nik_petani || !row.kode_desa) { errorCount++; continue; }
        const desaMatch = options.desa?.find((d: any) => d.kode_desa === String(row.kode_desa).trim());
        const petaniMatch = options.petani?.find((p: any) => p.nik === String(row.nik_petani).trim());
        if (!desaMatch || !petaniMatch) { errorCount++; continue; }
        
        const res = await createLahan({
          id_petani: petaniMatch.id_petani,
          id_desa: desaMatch.id_desa,
          kode_lahan: String(row.kode_lahan).trim(),
          nama_lahan: row.nama_lahan ? String(row.nama_lahan).trim() : '',
          luas_lahan: row.luas_lahan ? parseFloat(row.luas_lahan) : 0,
          id_status_lahan: row.id_status_lahan || null,
          jenis_irigasi: row.jenis_irigasi || '',
          jenis_tanah: row.jenis_tanah || '',
          sumber_air: row.sumber_air || '',
          ketinggian: row.ketinggian || '',
        });
        if (res?.success) successCount++; else errorCount++;
      }
      if (successCount > 0 && errorCount === 0) toast.success(`Import berhasil: ${successCount} lahan.`);
      else if (successCount > 0) toast.success(`Import: ${successCount} berhasil, ${errorCount} gagal.`);
      else toast.error(`Semua gagal (${errorCount}). Cek kode_lahan, nik_petani, kode_desa.`);
      
      if (successCount > 0) { setIsImportOpen(false); window.location.reload(); }
    } catch (e) {
      toast.error('Gagal membaca file Excel.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteLahan(selectedItem.id_lahan);
    setLoading(false);
    if (res?.success) {
      toast.success('Lahan berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_lahan', header: 'Kode Lahan', render: (item: any) => (
      <div>
        <div className="font-mono font-medium text-[#1B5E20]">{item.kode_lahan}</div>
        {item.nama_lahan && <div className="text-xs text-gray-500">{item.nama_lahan}</div>}
      </div>
    )},
    { key: 'petani', header: 'Pemilik/Penggarap', render: (item: any) => (
      <div>
        <div className="font-medium">{item.petani?.nama_lengkap}</div>
        <div className="text-xs text-gray-500">{item.petani?.desa?.nama_desa}</div>
      </div>
    )},
    { key: 'luas_lahan', header: 'Luas (Ha)', render: (item: any) => (
      <span className="font-medium">{parseFloat(item.luas_lahan || 0).toFixed(2)} Ha</span>
    )},
    { key: 'status_lahan', header: 'Status Lahan', render: (item: any) => (
      <Badge variant="info">{item.status_lahan_rel?.nama_status || '-'}</Badge>
    )},
    { key: 'jenis_irigasi', header: 'Irigasi', render: (item: any) => item.jenis_irigasi?.replace('_', ' ') || '-' },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenForm(item)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleOpenDelete(item)} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Data Lahan"
        description="Kelola data lahan milik/garapan petani."
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        onImport={userRole !== 'R009' ? () => setIsImportOpen(true) : undefined}
        onExport={handleExportPDF}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Data Lahan" : "Tambah Lahan"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="lahan-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <WilayahSelector 
            initialValues={{ id_desa: formData.id_desa }}
            onDesaChange={val => setFormData(prev => ({...prev, id_desa: val, id_petani: ''}))}
            label="Wilayah Lahan"
          />
          
          <Select 
            label="Petani Pemilik / Penggarap" 
            options={dynamicPetaniOpts.length > 0 ? [{label: '-- Pilih Petani --', value: ''}, ...dynamicPetaniOpts] : [{label: '-- Pilih Desa Terlebih Dahulu --', value: ''}]}
            value={formData.id_petani}
            onChange={e => setFormData({...formData, id_petani: e.target.value})}
            required
            placeholder="Pilih Petani"
            disabled={!formData.id_desa || dynamicPetaniOpts.length === 0}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Kode Lahan" 
              value={formData.kode_lahan} 
              onChange={e => setFormData({...formData, kode_lahan: e.target.value})}
              required
              placeholder="Contoh: LHN-001"
            />
            <Input 
              label="Nama/Blok Lahan (opsional)" 
              value={formData.nama_lahan} 
              onChange={e => setFormData({...formData, nama_lahan: e.target.value})}
              placeholder="Contoh: Blok A - Sawah Utama"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Luas Lahan (Hektare)" 
              type="number"
              step="0.01"
              value={formData.luas_lahan} 
              onChange={e => setFormData({...formData, luas_lahan: e.target.value})}
              required
              placeholder="Contoh: 1.50"
            />
            <Select 
              label="Status Lahan" 
              options={statusLahanOpts}
              value={formData.id_status_lahan}
              onChange={e => setFormData({...formData, id_status_lahan: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Jenis Irigasi" 
              options={irigasiOpts}
              value={formData.jenis_irigasi}
              onChange={e => setFormData({...formData, jenis_irigasi: e.target.value})}
            />
            <Input 
              label="Jenis Tanah (opsional)" 
              value={formData.jenis_tanah} 
              onChange={e => setFormData({...formData, jenis_tanah: e.target.value})}
              placeholder="Contoh: Latosol, Aluvial"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Sumber Air (opsional)" 
              value={formData.sumber_air} 
              onChange={e => setFormData({...formData, sumber_air: e.target.value})}
              placeholder="Contoh: Sumur Bor, Mata Air"
            />
            <Input 
              label="Ketinggian MDPL (opsional)" 
              type="number"
              value={formData.ketinggian} 
              onChange={e => setFormData({...formData, ketinggian: e.target.value})}
              placeholder="Contoh: 300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Koordinat Lahan (opsional)</label>
            <MapPicker 
              latitude={formData.latitude || null} 
              longitude={formData.longitude || null} 
              onChange={(lat, lng) => setFormData({...formData, latitude: lat.toString(), longitude: lng.toString()})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Keterangan (opsional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
              rows={2}
              value={formData.keterangan}
              onChange={e => setFormData({...formData, keterangan: e.target.value})}
              placeholder="Catatan tambahan..."
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Lahan"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus data lahan <strong>{selectedItem?.kode_lahan}</strong>?
        </p>
      </Modal>

      {/* ── Import Modal ───────────────────────────────────── */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Import Data Lahan" size="md"
        footer={<><Button variant="ghost" onClick={() => setIsImportOpen(false)}>Batal</Button><Button onClick={handleImportSubmit} isLoading={importLoading}>Proses Import</Button></>}>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-1">Langkah Import:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Unduh template Excel yang disediakan.</li>
              <li>Isi data lahan (Pastikan nik_petani dan kode_desa valid).</li>
              <li>Upload kembali file yang sudah diisi.</li>
            </ol>
          </div>
          <button onClick={handleDownloadTemplate} className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">Unduh Template Excel</button>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Excel</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">{importFile ? importFile.name : <><span className="font-semibold">Klik untuk upload</span> atau drag and drop</>}</p>
                  <p className="text-xs text-gray-500">XLSX atau XLS</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            {importFile && (
              <div className="flex items-center justify-between mt-2 p-2 bg-green-50 text-green-700 rounded text-sm">
                <span className="truncate">{importFile.name}</span>
                <button onClick={() => setImportFile(null)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
