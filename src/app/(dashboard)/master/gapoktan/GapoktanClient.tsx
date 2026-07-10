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
import { createGapoktan, updateGapoktan, deleteGapoktan } from './actions';

export default function GapoktanClient({ 
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
    kode_gapoktan: '', 
    nama_gapoktan: '', 
    ketua_gapoktan: '',
    no_sk: '',
    tahun_berdiri: '',
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
      item.nama_gapoktan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_gapoktan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desa?.nama_desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ketua_gapoktan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa,
        kode_gapoktan: item.kode_gapoktan,
        nama_gapoktan: item.nama_gapoktan,
        ketua_gapoktan: item.ketua || '',
        no_sk: item.nomor_registrasi || '',
        tahun_berdiri: item.tanggal_berdiri ? new Date(item.tanggal_berdiri).getFullYear().toString() : '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_desa: desaOpts.length > 0 ? desaOpts[0].value : '', 
        kode_gapoktan: '', 
        nama_gapoktan: '', 
        ketua_gapoktan: '',
        no_sk: '',
        tahun_berdiri: '',
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
      res = await updateGapoktan(selectedItem.id_gapoktan, formData);
    } else {
      res = await createGapoktan(formData);
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
    const res = await deleteGapoktan(selectedItem.id_gapoktan);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_gapoktan', header: 'Kode Register' },
    { key: 'nama_gapoktan', header: 'Nama Gapoktan', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.nama_gapoktan}</div>
        <div className="text-xs text-gray-500">Berdiri: {item.tanggal_berdiri ? new Date(item.tanggal_berdiri).getFullYear() : '-'}</div>
      </div>
    )},
    { key: 'desa', header: 'Wilayah Desa', render: (item: any) => (
      <div>
        <div className="font-medium">{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">Kec. {item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'ketua_gapoktan', header: 'Ketua', render: (item: any) => item.ketua || '-' },
    { key: 'no_sk', header: 'No. SK', render: (item: any) => item.nomor_registrasi || '-' },
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
        title="Master Gapoktan"
        description="Kelola data Gabungan Kelompok Tani (Gapoktan) tingkat desa."
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
        title={selectedItem ? "Edit Gapoktan" : "Tambah Gapoktan"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="gapoktan-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <Select 
            label="Wilayah Desa" 
            options={desaOpts}
            value={formData.id_desa}
            onChange={e => setFormData({...formData, id_desa: e.target.value})}
            required
            placeholder="Pilih Desa"
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Nomor Register Gapoktan" 
              value={formData.kode_gapoktan} 
              onChange={e => setFormData({...formData, kode_gapoktan: e.target.value})}
              required
              placeholder="Contoh: GAP-3507262001"
            />
            <Input 
              label="Nama Gapoktan" 
              value={formData.nama_gapoktan} 
              onChange={e => setFormData({...formData, nama_gapoktan: e.target.value})}
              required
              placeholder="Contoh: Gapoktan Tani Makmur"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Nama Ketua Gapoktan" 
              value={formData.ketua_gapoktan} 
              onChange={e => setFormData({...formData, ketua_gapoktan: e.target.value})}
              placeholder="Nama lengkap ketua"
            />
            <Input 
              label="Tahun Berdiri" 
              type="number"
              value={formData.tahun_berdiri} 
              onChange={e => setFormData({...formData, tahun_berdiri: e.target.value})}
              placeholder="Contoh: 2010"
            />
          </div>

          <Input 
            label="No SK Pengukuhan" 
            value={formData.no_sk} 
            onChange={e => setFormData({...formData, no_sk: e.target.value})}
            placeholder="No. SK Kepala Desa/Camat"
          />

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_gapoktan"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_gapoktan" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Gapoktan"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus Gapoktan <strong>{selectedItem?.nama_gapoktan}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
