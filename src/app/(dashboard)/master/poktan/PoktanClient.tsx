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
import { createPoktan, updatePoktan, deletePoktan } from './actions';

export default function PoktanClient({ 
  initialData, 
  options 
}: { 
  initialData: any[],
  options: { desa: any[], gapoktan: any[] } 
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
    id_gapoktan: '',
    kode_poktan: '', 
    nama_poktan: '', 
    ketua_poktan: '',
    kelas_kemampuan: '',
    tahun_berdiri: '',
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const desaOpts = options.desa.map(d => ({ 
    label: `${d.nama_desa} (${d.kecamatan?.nama_kecamatan})`, 
    value: d.id_desa 
  }));

  // Dependent gapoktan options based on selected desa
  const gapoktanOpts = options.gapoktan
    .filter(g => formData.id_desa ? g.id_desa === formData.id_desa : true)
    .map(g => ({ label: g.nama_gapoktan, value: g.id_gapoktan }));
    
  // Add an empty option for gapoktan since it's optional
  const gapoktanOptsWithEmpty = [{ label: '-- Tidak tergabung Gapoktan --', value: '' }, ...gapoktanOpts];

  const kelasOpts = [
    { label: 'Pemula', value: 'Pemula' },
    { label: 'Lanjut', value: 'Lanjut' },
    { label: 'Madya', value: 'Madya' },
    { label: 'Utama', value: 'Utama' },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_poktan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_poktan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desa?.nama_desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.gapoktan?.nama_gapoktan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ketua_poktan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa,
        id_gapoktan: item.id_gapoktan || '',
        kode_poktan: item.kode_poktan,
        nama_poktan: item.nama_poktan,
        ketua_poktan: item.ketua_poktan || '',
        kelas_kemampuan: item.kelas_kemampuan || '',
        tahun_berdiri: item.tahun_berdiri || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_desa: desaOpts.length > 0 ? desaOpts[0].value : '',
        id_gapoktan: '',
        kode_poktan: '', 
        nama_poktan: '', 
        ketua_poktan: '',
        kelas_kemampuan: '',
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
      res = await updatePoktan(selectedItem.id_poktan, formData);
    } else {
      res = await createPoktan(formData);
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
    const res = await deletePoktan(selectedItem.id_poktan);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'kode_poktan', header: 'Kode Register' },
    { key: 'nama_poktan', header: 'Nama Poktan', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.nama_poktan}</div>
        {item.gapoktan ? (
          <div className="text-xs text-gray-500">Gabung: {item.gapoktan.nama_gapoktan}</div>
        ) : (
          <div className="text-xs text-gray-400 italic">Berdiri Sendiri</div>
        )}
      </div>
    )},
    { key: 'desa', header: 'Wilayah Desa', render: (item: any) => (
      <div>
        <div className="font-medium">{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">Kec. {item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'ketua_poktan', header: 'Ketua', render: (item: any) => item.ketua_poktan || '-' },
    { key: 'kelas_kemampuan', header: 'Kelas', render: (item: any) => item.kelas_kemampuan ? <Badge variant="info">{item.kelas_kemampuan}</Badge> : '-' },
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
        title="Master Kelompok Tani"
        description="Kelola data Kelompok Tani (Poktan)."
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
        title={selectedItem ? "Edit Kelompok Tani" : "Tambah Kelompok Tani"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="poktan-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <Select 
              label="Wilayah Desa" 
              options={desaOpts}
              value={formData.id_desa}
              onChange={e => setFormData({...formData, id_desa: e.target.value, id_gapoktan: ''})} // Reset gapoktan if desa changes
              required
              placeholder="Pilih Desa"
            />
            <Select 
              label="Tergabung dalam Gapoktan" 
              options={gapoktanOptsWithEmpty}
              value={formData.id_gapoktan}
              onChange={e => setFormData({...formData, id_gapoktan: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Nomor Register Poktan" 
              value={formData.kode_poktan} 
              onChange={e => setFormData({...formData, kode_poktan: e.target.value})}
              required
              placeholder="Contoh: POK-3507262001-01"
            />
            <Input 
              label="Nama Poktan" 
              value={formData.nama_poktan} 
              onChange={e => setFormData({...formData, nama_poktan: e.target.value})}
              required
              placeholder="Contoh: Poktan Sumber Rejeki"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Nama Ketua Poktan" 
              value={formData.ketua_poktan} 
              onChange={e => setFormData({...formData, ketua_poktan: e.target.value})}
              placeholder="Nama lengkap ketua"
            />
            <Select 
              label="Kelas Kemampuan" 
              options={kelasOpts}
              value={formData.kelas_kemampuan}
              onChange={e => setFormData({...formData, kelas_kemampuan: e.target.value})}
              placeholder="Pilih Kelas"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Tahun Berdiri" 
              type="number"
              value={formData.tahun_berdiri} 
              onChange={e => setFormData({...formData, tahun_berdiri: e.target.value})}
              placeholder="Contoh: 2012"
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_poktan"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_poktan" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Poktan"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus Poktan <strong>{selectedItem?.nama_poktan}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
