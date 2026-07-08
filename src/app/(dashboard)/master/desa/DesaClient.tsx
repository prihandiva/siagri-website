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
import { createDesa, updateDesa, deleteDesa } from './actions';

export default function DesaClient({ 
  initialData, 
  kecamatanOptions 
}: { 
  initialData: any[],
  kecamatanOptions: any[] 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
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
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const kecOpts = kecamatanOptions.map(k => ({ 
    label: `${k.nama_kecamatan} (${k.kabupaten?.nama_kabupaten})`, 
    value: k.id_kecamatan 
  }));

  const statusOpts = [
    { label: 'Desa', value: 'DESA' },
    { label: 'Kelurahan', value: 'KELURAHAN' }
  ];

  const klasifikasiOpts = [
    { label: 'Sangat Tertinggal', value: 'SANGAT_TERTINGGAL' },
    { label: 'Tertinggal', value: 'TERTINGGAL' },
    { label: 'Berkembang', value: 'BERKEMBANG' },
    { label: 'Maju', value: 'MAJU' },
    { label: 'Mandiri', value: 'MANDIRI' },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kecamatan?.nama_kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_kecamatan: item.id_kecamatan,
        kode_desa: item.kode_desa,
        nama_desa: item.nama_desa,
        status_desa: item.status_desa,
        klasifikasi: item.klasifikasi || '',
        kepala_desa: item.kepala_desa || '',
        luas_wilayah: item.luas_wilayah || '',
        jumlah_penduduk: item.jumlah_penduduk || '',
        jumlah_kk: item.jumlah_kk || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_kecamatan: kecOpts.length > 0 ? kecOpts[0].value : '', 
        kode_desa: '', 
        nama_desa: '', 
        status_desa: 'DESA',
        klasifikasi: '',
        kepala_desa: '',
        luas_wilayah: '',
        jumlah_penduduk: '',
        jumlah_kk: '',
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
      res = await updateDesa(selectedItem.id_desa, formData);
    } else {
      res = await createDesa(formData);
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
    const res = await deleteDesa(selectedItem.id_desa);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_desa', header: 'Kode' },
    { key: 'nama_desa', header: 'Nama Desa/Kelurahan', render: (item: any) => (
      <div>
        <div className="font-medium">{item.nama_desa}</div>
        <div className="text-xs text-gray-500">{item.status_desa}</div>
      </div>
    )},
    { key: 'kecamatan', header: 'Kecamatan', render: (item: any) => (
      <div>
        <div className="font-medium">{item.kecamatan?.nama_kecamatan}</div>
        <div className="text-xs text-gray-500">{item.kecamatan?.kabupaten?.nama_kabupaten}</div>
      </div>
    )},
    { key: 'kepala_desa', header: 'Kepala Desa', render: (item: any) => item.kepala_desa || '-' },
    { key: 'klasifikasi', header: 'Klasifikasi', render: (item: any) => item.klasifikasi ? <Badge variant="info">{item.klasifikasi.replace('_', ' ')}</Badge> : '-' },
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
        title="Master Desa / Kelurahan"
        description="Kelola data desa dan kelurahan."
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
        title={selectedItem ? "Edit Desa/Kelurahan" : "Tambah Desa/Kelurahan"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="desa-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <Select 
            label="Kecamatan" 
            options={kecOpts}
            value={formData.id_kecamatan}
            onChange={e => setFormData({...formData, id_kecamatan: e.target.value})}
            required
            placeholder="Pilih Kecamatan"
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Kode Desa" 
              value={formData.kode_desa} 
              onChange={e => setFormData({...formData, kode_desa: e.target.value})}
              required
              maxLength={10}
              placeholder="Contoh: 3507262001"
            />
            <Input 
              label="Nama Desa/Kelurahan" 
              value={formData.nama_desa} 
              onChange={e => setFormData({...formData, nama_desa: e.target.value})}
              required
              placeholder="Contoh: Desa Makmur"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Select 
              label="Status Desa" 
              options={statusOpts}
              value={formData.status_desa}
              onChange={e => setFormData({...formData, status_desa: e.target.value})}
              required
            />
            <Select 
              label="Klasifikasi" 
              options={klasifikasiOpts}
              value={formData.klasifikasi}
              onChange={e => setFormData({...formData, klasifikasi: e.target.value})}
              placeholder="Pilih Klasifikasi"
            />
          </div>

          <Input 
            label="Nama Kepala Desa / Lurah" 
            value={formData.kepala_desa} 
            onChange={e => setFormData({...formData, kepala_desa: e.target.value})}
            placeholder="Nama Lengkap Kades"
          />
          
          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Luas Wilayah (Km²)" 
              type="number"
              step="0.01"
              value={formData.luas_wilayah} 
              onChange={e => setFormData({...formData, luas_wilayah: e.target.value})}
            />
            <Input 
              label="Jumlah Penduduk" 
              type="number"
              value={formData.jumlah_penduduk} 
              onChange={e => setFormData({...formData, jumlah_penduduk: e.target.value})}
            />
            <Input 
              label="Jumlah KK" 
              type="number"
              value={formData.jumlah_kk} 
              onChange={e => setFormData({...formData, jumlah_kk: e.target.value})}
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_desa"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_desa" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Desa"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama_desa}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
