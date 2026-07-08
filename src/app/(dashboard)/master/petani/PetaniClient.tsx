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
import { createPetani, updatePetani, deletePetani } from './actions';

export default function PetaniClient({ 
  initialData, 
  options 
}: { 
  initialData: any[],
  options: { desa: any[], poktan: any[] } 
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
    id_poktan: '',
    nik: '', 
    nama_lengkap: '', 
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    rt: '',
    rw: '',
    no_hp: '',
    pendidikan_terakhir: '',
    status_perkawinan: '',
    nama_ibu_kandung: '',
    pekerjaan_utama: 'Petani / Pekebun',
    pengalaman_tani_tahun: '',
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const desaOpts = options.desa.map(d => ({ 
    label: `${d.nama_desa} (${d.kecamatan?.nama_kecamatan})`, 
    value: d.id_desa 
  }));

  // Dependent poktan options based on selected desa
  const poktanOpts = options.poktan
    .filter(p => formData.id_desa ? p.id_desa === formData.id_desa : true)
    .map(p => ({ label: p.nama_poktan, value: p.id_poktan }));
    
  const poktanOptsWithEmpty = [{ label: '-- Tidak tergabung Poktan --', value: '' }, ...poktanOpts];

  const jkOpts = [
    { label: 'Laki-laki', value: 'Laki-laki' },
    { label: 'Perempuan', value: 'Perempuan' }
  ];

  const nikRegex = /^[0-9]{16}$/;

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nik.includes(searchTerm) ||
      item.desa?.nama_desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.poktan?.nama_poktan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa,
        id_poktan: item.id_poktan || '',
        nik: item.nik,
        nama_lengkap: item.nama_lengkap,
        tempat_lahir: item.tempat_lahir || '',
        tanggal_lahir: item.tanggal_lahir ? new Date(item.tanggal_lahir).toISOString().split('T')[0] : '',
        jenis_kelamin: item.jenis_kelamin || '',
        alamat: item.alamat || '',
        rt: item.rt || '',
        rw: item.rw || '',
        no_hp: item.no_hp || '',
        pendidikan_terakhir: item.pendidikan_terakhir || '',
        status_perkawinan: item.status_perkawinan || '',
        nama_ibu_kandung: item.nama_ibu_kandung || '',
        pekerjaan_utama: item.pekerjaan_utama || 'Petani / Pekebun',
        pengalaman_tani_tahun: item.pengalaman_tani_tahun || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_desa: desaOpts.length > 0 ? desaOpts[0].value : '',
        id_poktan: '',
        nik: '', 
        nama_lengkap: '', 
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        rt: '',
        rw: '',
        no_hp: '',
        pendidikan_terakhir: '',
        status_perkawinan: '',
        nama_ibu_kandung: '',
        pekerjaan_utama: 'Petani / Pekebun',
        pengalaman_tani_tahun: '',
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
    if (!nikRegex.test(formData.nik)) {
      setError('NIK harus terdiri dari 16 digit angka.');
      return;
    }

    setLoading(true);
    setError('');
    
    let res;
    if (selectedItem) {
      res = await updatePetani(selectedItem.id_petani, formData);
    } else {
      res = await createPetani(formData);
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
    const res = await deletePetani(selectedItem.id_petani);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'nik_nama', header: 'NIK & Nama Petani', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.nama_lengkap}</div>
        <div className="text-xs text-gray-500 font-mono">{item.nik}</div>
      </div>
    )},
    { key: 'desa', header: 'Wilayah Desa', render: (item: any) => (
      <div>
        <div className="font-medium">{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">Kec. {item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'poktan', header: 'Poktan', render: (item: any) => item.poktan?.nama_poktan || '-' },
    { key: 'no_hp', header: 'No. HP', render: (item: any) => item.no_hp || '-' },
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
        title="Master Petani"
        description="Kelola data registrasi petani di seluruh wilayah."
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
        title={selectedItem ? "Edit Petani" : "Tambah Petani"}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="petani-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <Select 
              label="Wilayah Desa" 
              options={desaOpts}
              value={formData.id_desa}
              onChange={e => setFormData({...formData, id_desa: e.target.value, id_poktan: ''})}
              required
              placeholder="Pilih Desa"
            />
            <Select 
              label="Tergabung dalam Poktan" 
              options={poktanOptsWithEmpty}
              value={formData.id_poktan}
              onChange={e => setFormData({...formData, id_poktan: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="NIK" 
              value={formData.nik} 
              onChange={e => setFormData({...formData, nik: e.target.value})}
              required
              maxLength={16}
              placeholder="16 Digit NIK"
            />
            <Input 
              label="Nama Lengkap" 
              value={formData.nama_lengkap} 
              onChange={e => setFormData({...formData, nama_lengkap: e.target.value})}
              required
              placeholder="Nama sesuai KTP"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Tempat Lahir" 
              value={formData.tempat_lahir} 
              onChange={e => setFormData({...formData, tempat_lahir: e.target.value})}
              placeholder="Tempat Lahir"
            />
            <Input 
              label="Tanggal Lahir" 
              type="date"
              value={formData.tanggal_lahir} 
              onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})}
            />
            <Select 
              label="Jenis Kelamin" 
              options={jkOpts}
              value={formData.jenis_kelamin}
              onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})}
              placeholder="Pilih Jenis Kelamin"
            />
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <Input 
                label="Alamat Lengkap" 
                value={formData.alamat} 
                onChange={e => setFormData({...formData, alamat: e.target.value})}
                placeholder="Alamat domisili"
              />
            </div>
            <div className="col-span-2">
              <Input 
                label="RT" 
                value={formData.rt} 
                onChange={e => setFormData({...formData, rt: e.target.value})}
                maxLength={3}
                placeholder="001"
              />
            </div>
            <div className="col-span-2">
              <Input 
                label="RW" 
                value={formData.rw} 
                onChange={e => setFormData({...formData, rw: e.target.value})}
                maxLength={3}
                placeholder="002"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="No. HP" 
              value={formData.no_hp} 
              onChange={e => setFormData({...formData, no_hp: e.target.value})}
              placeholder="08..."
            />
            <Input 
              label="Pendidikan Terakhir" 
              value={formData.pendidikan_terakhir} 
              onChange={e => setFormData({...formData, pendidikan_terakhir: e.target.value})}
              placeholder="SD/SMP/SMA/S1"
            />
            <Input 
              label="Pekerjaan Utama" 
              value={formData.pekerjaan_utama} 
              onChange={e => setFormData({...formData, pekerjaan_utama: e.target.value})}
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_petani"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_petani" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Petani"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus data petani <strong>{selectedItem?.nama_lengkap}</strong>?
          Data yang dihapus (soft delete) tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
