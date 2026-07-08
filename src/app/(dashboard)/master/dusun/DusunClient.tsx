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
import { createDusun, updateDusun, deleteDusun } from './actions';

export default function DusunClient({ 
  initialData, 
  desaOptions 
}: { 
  initialData: any[],
  desaOptions: any[] 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({ 
    id_desa: '', 
    kode_dusun: '', 
    nama_dusun: '', 
    kepala_dusun: '',
    jumlah_rt: '',
    jumlah_rw: '',
    jumlah_penduduk: '',
    luas_wilayah: '',
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const desaOpts = desaOptions.map(d => ({ 
    label: `${d.nama_desa} (${d.kecamatan?.nama_kecamatan})`, 
    value: d.id_desa 
  }));

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_dusun.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kode_dusun || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desa?.nama_desa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa,
        kode_dusun: item.kode_dusun || '',
        nama_dusun: item.nama_dusun,
        kepala_dusun: item.kepala_dusun || '',
        jumlah_rt: item.jumlah_rt || '',
        jumlah_rw: item.jumlah_rw || '',
        jumlah_penduduk: item.jumlah_penduduk || '',
        luas_wilayah: item.luas_wilayah || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_desa: desaOpts.length > 0 ? desaOpts[0].value : '', 
        kode_dusun: '', 
        nama_dusun: '', 
        kepala_dusun: '',
        jumlah_rt: '',
        jumlah_rw: '',
        jumlah_penduduk: '',
        luas_wilayah: '',
        status_aktif: true 
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
      res = await updateDusun(selectedItem.id_dusun, formData);
    } else {
      res = await createDusun(formData);
    }

    setLoading(false);
    if (res?.success) {
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteDusun(selectedItem.id_dusun);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'nama_dusun', header: 'Nama Dusun', render: (item: any) => (
      <div>
        <div className="font-medium">{item.nama_dusun}</div>
        <div className="text-xs text-gray-500">{item.kode_dusun || '-'}</div>
      </div>
    )},
    { key: 'desa', header: 'Desa', render: (item: any) => (
      <div>
        <div className="font-medium">{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">{item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'kepala_dusun', header: 'Kepala Dusun', render: (item: any) => item.kepala_dusun || '-' },
    { key: 'rt_rw', header: 'RT/RW', render: (item: any) => `${item.jumlah_rt || 0} / ${item.jumlah_rw || 0}` },
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
        title="Master Dusun"
        description="Kelola data dusun."
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Dusun" : "Tambah Dusun"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="dusun-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <Select 
            label="Desa / Kelurahan" 
            options={desaOpts}
            value={formData.id_desa}
            onChange={e => setFormData({...formData, id_desa: e.target.value})}
            required
            placeholder="Pilih Desa/Kelurahan"
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Kode Dusun (Opsional)" 
              value={formData.kode_dusun} 
              onChange={e => setFormData({...formData, kode_dusun: e.target.value})}
              placeholder="Kode internal"
            />
            <Input 
              label="Nama Dusun" 
              value={formData.nama_dusun} 
              onChange={e => setFormData({...formData, nama_dusun: e.target.value})}
              required
              placeholder="Contoh: Dusun Krajan"
            />
          </div>

          <Input 
            label="Nama Kepala Dusun (Opsional)" 
            value={formData.kepala_dusun} 
            onChange={e => setFormData({...formData, kepala_dusun: e.target.value})}
            placeholder="Nama Lengkap Kasun"
          />
          
          <div className="grid grid-cols-4 gap-4">
            <Input 
              label="Jumlah RT" 
              type="number"
              value={formData.jumlah_rt} 
              onChange={e => setFormData({...formData, jumlah_rt: e.target.value})}
            />
            <Input 
              label="Jumlah RW" 
              type="number"
              value={formData.jumlah_rw} 
              onChange={e => setFormData({...formData, jumlah_rw: e.target.value})}
            />
            <Input 
              label="Jml Penduduk" 
              type="number"
              value={formData.jumlah_penduduk} 
              onChange={e => setFormData({...formData, jumlah_penduduk: e.target.value})}
            />
            <Input 
              label="Luas (Ha)" 
              type="number"
              step="0.01"
              value={formData.luas_wilayah} 
              onChange={e => setFormData({...formData, luas_wilayah: e.target.value})}
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_dusun"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_dusun" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Dusun"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama_dusun}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
