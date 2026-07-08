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
import { createKabupaten, updateKabupaten, deleteKabupaten } from './actions';

export default function KabupatenClient({ 
  initialData, 
  provinsiOptions 
}: { 
  initialData: any[],
  provinsiOptions: any[] 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({ 
    id_provinsi: '', 
    kode_kabupaten: '', 
    nama_kabupaten: '', 
    jenis: 'KABUPATEN', 
    ibukota: '', 
    luas_wilayah: '', 
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const provOpts = provinsiOptions.map(p => ({ label: p.nama_provinsi, value: p.id_provinsi }));
  const jenisOpts = [
    { label: 'Kabupaten', value: 'KABUPATEN' },
    { label: 'Kota', value: 'KOTA' }
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provinsi?.nama_provinsi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_provinsi: item.id_provinsi,
        kode_kabupaten: item.kode_kabupaten,
        nama_kabupaten: item.nama_kabupaten,
        jenis: item.jenis,
        ibukota: item.ibukota || '',
        luas_wilayah: item.luas_wilayah || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_provinsi: provOpts.length > 0 ? provOpts[0].value : '', 
        kode_kabupaten: '', 
        nama_kabupaten: '', 
        jenis: 'KABUPATEN',
        ibukota: '',
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
      res = await updateKabupaten(selectedItem.id_kabupaten, formData);
    } else {
      res = await createKabupaten(formData);
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
    const res = await deleteKabupaten(selectedItem.id_kabupaten);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_kabupaten', header: 'Kode' },
    { key: 'nama_kabupaten', header: 'Nama Kabupaten/Kota', render: (item: any) => (
      <div>
        <div className="font-medium">{item.nama_kabupaten}</div>
        <div className="text-xs text-gray-500">{item.jenis}</div>
      </div>
    )},
    { key: 'provinsi', header: 'Provinsi', render: (item: any) => item.provinsi?.nama_provinsi },
    { key: 'ibukota', header: 'Ibu Kota', render: (item: any) => item.ibukota || '-' },
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
        title="Master Kabupaten / Kota"
        description="Kelola data kabupaten dan kota di seluruh provinsi."
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
        title={selectedItem ? "Edit Kabupaten/Kota" : "Tambah Kabupaten/Kota"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="kabupaten-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <Select 
            label="Provinsi" 
            options={provOpts}
            value={formData.id_provinsi}
            onChange={e => setFormData({...formData, id_provinsi: e.target.value})}
            required
            placeholder="Pilih Provinsi"
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Kode Kabupaten" 
              value={formData.kode_kabupaten} 
              onChange={e => setFormData({...formData, kode_kabupaten: e.target.value})}
              required
              maxLength={4}
              placeholder="Contoh: 3507"
            />
            <Select 
              label="Jenis" 
              options={jenisOpts}
              value={formData.jenis}
              onChange={e => setFormData({...formData, jenis: e.target.value})}
              required
            />
          </div>

          <Input 
            label="Nama Kabupaten/Kota" 
            value={formData.nama_kabupaten} 
            onChange={e => setFormData({...formData, nama_kabupaten: e.target.value})}
            required
            placeholder="Contoh: Kabupaten Banyuwangi"
          />
          
          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Ibu Kota (Opsional)" 
              value={formData.ibukota} 
              onChange={e => setFormData({...formData, ibukota: e.target.value})}
              placeholder="Contoh: Banyuwangi"
            />
            <Input 
              label="Luas Wilayah (Km²)" 
              type="number"
              step="0.01"
              value={formData.luas_wilayah} 
              onChange={e => setFormData({...formData, luas_wilayah: e.target.value})}
              placeholder="Contoh: 5782.4"
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_kab"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_kab" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Kabupaten/Kota"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama_kabupaten}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
