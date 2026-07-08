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
import { createKecamatan, updateKecamatan, deleteKecamatan } from './actions';

export default function KecamatanClient({ 
  initialData, 
  kabupatenOptions 
}: { 
  initialData: any[],
  kabupatenOptions: any[] 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({ 
    id_kabupaten: '', 
    kode_kecamatan: '', 
    nama_kecamatan: '', 
    ibukota: '', 
    luas_wilayah: '',
    jumlah_desa: '',
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const kabOpts = kabupatenOptions.map(k => ({ 
    label: `${k.nama_kabupaten}`, 
    value: k.id_kabupaten 
  }));

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kabupaten?.nama_kabupaten.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_kabupaten: item.id_kabupaten,
        kode_kecamatan: item.kode_kecamatan,
        nama_kecamatan: item.nama_kecamatan,
        ibukota: item.ibukota || '',
        luas_wilayah: item.luas_wilayah || '',
        jumlah_desa: item.jumlah_desa || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_kabupaten: kabOpts.length > 0 ? kabOpts[0].value : '', 
        kode_kecamatan: '', 
        nama_kecamatan: '', 
        ibukota: '',
        luas_wilayah: '',
        jumlah_desa: '',
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
      res = await updateKecamatan(selectedItem.id_kecamatan, formData);
    } else {
      res = await createKecamatan(formData);
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
    const res = await deleteKecamatan(selectedItem.id_kecamatan);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_kecamatan', header: 'Kode' },
    { key: 'nama_kecamatan', header: 'Nama Kecamatan' },
    { key: 'kabupaten', header: 'Kabupaten/Kota', render: (item: any) => (
      <div>
        <div className="font-medium">{item.kabupaten?.nama_kabupaten}</div>
        <div className="text-xs text-gray-500">{item.kabupaten?.provinsi?.nama_provinsi}</div>
      </div>
    )},
    { key: 'jumlah_desa', header: 'Jml Desa', render: (item: any) => item.jumlah_desa || '-' },
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
        title="Master Kecamatan"
        description="Kelola data kecamatan dari seluruh kabupaten."
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
        title={selectedItem ? "Edit Kecamatan" : "Tambah Kecamatan"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="kecamatan-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <Select 
            label="Kabupaten / Kota" 
            options={kabOpts}
            value={formData.id_kabupaten}
            onChange={e => setFormData({...formData, id_kabupaten: e.target.value})}
            required
            placeholder="Pilih Kabupaten/Kota"
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Kode Kecamatan" 
              value={formData.kode_kecamatan} 
              onChange={e => setFormData({...formData, kode_kecamatan: e.target.value})}
              required
              maxLength={7}
              placeholder="Contoh: 350726"
            />
            <Input 
              label="Nama Kecamatan" 
              value={formData.nama_kecamatan} 
              onChange={e => setFormData({...formData, nama_kecamatan: e.target.value})}
              required
              placeholder="Contoh: Tegalsari"
            />
          </div>

          <Input 
            label="Ibu Kota Kecamatan (Opsional)" 
            value={formData.ibukota} 
            onChange={e => setFormData({...formData, ibukota: e.target.value})}
            placeholder="Contoh: Tegalsari"
          />
          
          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Jumlah Desa" 
              type="number"
              value={formData.jumlah_desa} 
              onChange={e => setFormData({...formData, jumlah_desa: e.target.value})}
              placeholder="Contoh: 12"
            />
            <Input 
              label="Luas Wilayah (Km²)" 
              type="number"
              step="0.01"
              value={formData.luas_wilayah} 
              onChange={e => setFormData({...formData, luas_wilayah: e.target.value})}
              placeholder="Contoh: 154.2"
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_kec"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_kec" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Kecamatan"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama_kecamatan}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
