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
import { createKomoditas, updateKomoditas, deleteKomoditas } from './actions';

export default function KomoditasClient({ 
  initialData, 
}: { 
  initialData: any[]
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({ 
    kode_komoditas: '', 
    nama_komoditas: '', 
    subsektor: 'TP',
    satuan: '',
    deskripsi: '',
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subsektorOpts = [
    { label: 'Tanaman Pangan (TP)', value: 'TP' },
    { label: 'Hortikultura (HT)', value: 'HT' },
    { label: 'Perkebunan (PB)', value: 'PB' },
    { label: 'Peternakan (PT)', value: 'PT' },
    { label: 'Perikanan (PK)', value: 'PK' },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_komoditas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subsektor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        kode_komoditas: item.kode_komoditas,
        nama_komoditas: item.nama_komoditas,
        subsektor: item.subsektor,
        satuan: item.satuan || '',
        deskripsi: item.deskripsi || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        kode_komoditas: '', 
        nama_komoditas: '', 
        subsektor: 'TP',
        satuan: '',
        deskripsi: '',
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
      res = await updateKomoditas(selectedItem.id_komoditas, formData);
    } else {
      res = await createKomoditas(formData);
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
    const res = await deleteKomoditas(selectedItem.id_komoditas);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_komoditas', header: 'Kode' },
    { key: 'nama_komoditas', header: 'Nama Komoditas', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.nama_komoditas}</div>
      </div>
    )},
    { key: 'subsektor', header: 'Subsektor', render: (item: any) => {
      const sub = subsektorOpts.find(s => s.value === item.subsektor);
      return sub ? sub.label : item.subsektor;
    }},
    { key: 'satuan', header: 'Satuan', render: (item: any) => item.satuan || '-' },
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
        title="Master Komoditas"
        description="Kelola data komoditas pertanian, peternakan, perikanan."
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
        title={selectedItem ? "Edit Komoditas" : "Tambah Komoditas"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="komoditas-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <Select 
              label="Subsektor" 
              options={subsektorOpts}
              value={formData.subsektor}
              onChange={e => setFormData({...formData, subsektor: e.target.value})}
              required
            />
            <Input 
              label="Kode Komoditas" 
              value={formData.kode_komoditas} 
              onChange={e => setFormData({...formData, kode_komoditas: e.target.value})}
              required
              maxLength={10}
              placeholder="Contoh: TP001"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Nama Komoditas" 
              value={formData.nama_komoditas} 
              onChange={e => setFormData({...formData, nama_komoditas: e.target.value})}
              required
              placeholder="Contoh: Padi"
            />
            <Input 
              label="Satuan" 
              value={formData.satuan} 
              onChange={e => setFormData({...formData, satuan: e.target.value})}
              placeholder="Contoh: Ton, Kg, Ekor"
            />
          </div>

          <Input 
            label="Deskripsi (Opsional)" 
            value={formData.deskripsi} 
            onChange={e => setFormData({...formData, deskripsi: e.target.value})}
          />

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_komoditas"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_komoditas" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Komoditas"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus komoditas <strong>{selectedItem?.nama_komoditas}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
