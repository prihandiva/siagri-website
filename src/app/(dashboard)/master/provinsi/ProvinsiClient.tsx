'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { createProvinsi, updateProvinsi, deleteProvinsi } from './actions';

export default function ProvinsiClient({ initialData }: { initialData: any[] }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({ kode_provinsi: '', nama_provinsi: '', singkatan: '', status_aktif: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_provinsi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        kode_provinsi: item.kode_provinsi,
        nama_provinsi: item.nama_provinsi,
        singkatan: item.singkatan || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ kode_provinsi: '', nama_provinsi: '', singkatan: '', status_aktif: true });
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
      res = await updateProvinsi(selectedItem.id_provinsi, formData);
    } else {
      res = await createProvinsi(formData);
    }

    setLoading(false);
    if (res?.success) {
      setIsFormOpen(false);
      // Next.js will automatically refresh server component via revalidatePath
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteProvinsi(selectedItem.id_provinsi);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_provinsi', header: 'Kode' },
    { key: 'nama_provinsi', header: 'Nama Provinsi' },
    { key: 'singkatan', header: 'Singkatan', render: (item: any) => item.singkatan || '-' },
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
        title="Master Provinsi"
        description="Kelola data provinsi di Indonesia."
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
        title={selectedItem ? "Edit Provinsi" : "Tambah Provinsi"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="provinsi-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <Input 
            label="Kode Provinsi" 
            value={formData.kode_provinsi} 
            onChange={e => setFormData({...formData, kode_provinsi: e.target.value})}
            required
            maxLength={2}
            placeholder="Contoh: 35"
          />
          <Input 
            label="Nama Provinsi" 
            value={formData.nama_provinsi} 
            onChange={e => setFormData({...formData, nama_provinsi: e.target.value})}
            required
            placeholder="Contoh: Jawa Timur"
          />
          <Input 
            label="Singkatan (Opsional)" 
            value={formData.singkatan} 
            onChange={e => setFormData({...formData, singkatan: e.target.value})}
            placeholder="Contoh: Jatim"
          />
          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Provinsi"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus provinsi <strong>{selectedItem?.nama_provinsi}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
