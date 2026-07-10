'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { createLahan, updateLahan, deleteLahan } from './actions';
import { WilayahSelector } from '@/components/ui/WilayahSelector';

export default function LahanClient({ 
  initialData, 
  options 
}: { 
  initialData: any[],
  options: { petani: any[], dusun: any[] } 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    id_petani: '',
    id_desa: '',
    id_dusun: '',
    id_rw: '',
    id_rt: '',
    kode_lahan: '', 
    nama_lahan: '',
    luas_lahan: '',
    status_lahan: 'MILIK',
    jenis_irigasi: '',
    jenis_tanah: '',
    keterangan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [dynamicPetaniOpts, setDynamicPetaniOpts] = useState<{label: string, value: string}[]>([]);

  React.useEffect(() => {
    if (formData.id_desa) {
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
  }, [formData.id_desa]);

  // Petani options cascade dari pemilihan Desa (dynamicPetaniOpts)
  // Dusun options sudah tidak diperlukan karena diambil alih oleh WilayahSelector

  const statusLahanOpts = [
    { label: 'Milik Sendiri', value: 'MILIK' },
    { label: 'Sewa', value: 'SEWA' },
    { label: 'Bagi Hasil', value: 'BAGI_HASIL' },
    { label: 'Perhutanan Sosial', value: 'PERHUTANAN_SOSIAL' },
    { label: 'Lainnya', value: 'LAINNYA' },
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
        id_dusun: item.id_dusun?.toString() || '',
        id_rw: item.id_rw?.toString() || '',
        id_rt: item.id_rt?.toString() || '',
        kode_lahan: item.kode_lahan || '',
        nama_lahan: item.nama_lahan || '',
        luas_lahan: item.luas_lahan?.toString() || '',
        status_lahan: item.status_lahan || 'MILIK',
        jenis_irigasi: item.jenis_irigasi || '',
        jenis_tanah: item.jenis_tanah || '',
        keterangan: item.keterangan || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_petani: '',
        id_desa: '',
        id_dusun: '',
        id_rw: '',
        id_rt: '',
        kode_lahan: '', 
        nama_lahan: '',
        luas_lahan: '',
        status_lahan: 'MILIK',
        jenis_irigasi: '',
        jenis_tanah: '',
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
      <Badge variant="info">{item.status_lahan?.replace('_', ' ')}</Badge>
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
            initialValues={{
              id_desa: formData.id_desa,
              id_dusun: formData.id_dusun,
              id_rw: formData.id_rw,
              id_rt: formData.id_rt
            }}
            onDesaChange={(val) => setFormData(prev => ({...prev, id_desa: val, id_petani: ''}))}
            onDusunChange={(val) => setFormData(prev => ({...prev, id_dusun: val}))}
            onRwChange={(val) => setFormData(prev => ({...prev, id_rw: val}))}
            onRtChange={(val) => setFormData(prev => ({...prev, id_rt: val}))}
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
              value={formData.status_lahan}
              onChange={e => setFormData({...formData, status_lahan: e.target.value})}
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
    </div>
  );
}
