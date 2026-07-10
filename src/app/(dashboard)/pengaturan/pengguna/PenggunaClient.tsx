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
import { createPengguna, updatePengguna, deletePengguna } from './actions';

export default function PenggunaClient({ 
  initialData, 
  options 
}: { 
  initialData: any[],
  options: { roles: any[], desa: any[] } 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({ 
    id_role: '',
    id_desa: '',
    username: '', 
    password: '', 
    nama_lengkap: '',
    email: '',
    no_hp: '',
    status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleOpts = options.roles.map(r => ({ label: r.nama_role, value: r.id_role }));
  const desaOptsWithEmpty = [{ label: '-- Semua Wilayah (SuperAdmin/Kecamatan) --', value: '' }, 
    ...options.desa.map(d => ({ label: d.nama_desa, value: d.id_desa }))];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role?.nama_role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handlers
  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_role: item.id_role,
        id_desa: item.id_desa || '',
        username: item.username,
        password: '', // blank password on edit means no change
        nama_lengkap: item.nama_lengkap,
        email: item.email || '',
        no_hp: item.no_hp || '',
        status_aktif: item.status !== 'NONAKTIF',
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_role: roleOpts.length > 0 ? roleOpts[0].value : '',
        id_desa: '',
        username: '', 
        password: '', 
        nama_lengkap: '',
        email: '',
        no_hp: '',
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
    if (!selectedItem && !formData.password) {
      setError('Password wajib diisi untuk pengguna baru.');
      return;
    }

    setLoading(true);
    setError('');
    
    let res;
    if (selectedItem) {
      res = await updatePengguna(selectedItem.id_user, formData);
    } else {
      res = await createPengguna(formData);
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
    const res = await deletePengguna(selectedItem.id_user);
    setLoading(false);
    if (res?.success) {
      setIsDeleteOpen(false);
    } else {
      toast(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'user_info', header: 'Pengguna', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.nama_lengkap}</div>
        <div className="text-xs text-gray-500 font-mono">@{item.username}</div>
      </div>
    )},
    { key: 'role', header: 'Hak Akses', render: (item: any) => (
      <Badge variant={item.role?.nama_role === 'SuperAdmin' ? 'warning' : 'info'}>
        {item.role?.nama_role}
      </Badge>
    )},
    { key: 'wilayah', header: 'Wilayah Akses', render: (item: any) => item.desa ? item.desa.nama_desa : <span className="italic text-gray-400">Semua Wilayah</span> },
    { key: 'kontak', header: 'Kontak', render: (item: any) => (
      <div>
        <div className="text-sm">{item.email || '-'}</div>
        <div className="text-xs text-gray-500">{item.no_hp || '-'}</div>
      </div>
    )},
    { 
      key: 'status', 
      header: 'Status',
      render: (item: any) => (
        <Badge variant={item.status !== 'NONAKTIF' ? 'success' : 'danger'}>
          {item.status !== 'NONAKTIF' ? 'Aktif' : 'Nonaktif'}
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
        title="Manajemen Pengguna"
        description="Kelola akun pengguna, hak akses, dan wilayah kerja."
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
        title={selectedItem ? "Edit Pengguna" : "Tambah Pengguna Baru"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="pengguna-form" onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <Select 
              label="Hak Akses (Role)" 
              options={roleOpts}
              value={formData.id_role}
              onChange={e => setFormData({...formData, id_role: e.target.value})}
              required
            />
            <Select 
              label="Wilayah Akses (Batasi per Desa?)" 
              options={desaOptsWithEmpty}
              value={formData.id_desa}
              onChange={e => setFormData({...formData, id_desa: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Username" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})}
              required
              disabled={!!selectedItem}
            />
            <Input 
              label="Password" 
              type="password"
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              required={!selectedItem}
              placeholder={selectedItem ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
            />
          </div>

          <Input 
            label="Nama Lengkap" 
            value={formData.nama_lengkap} 
            onChange={e => setFormData({...formData, nama_lengkap: e.target.value})}
            required
          />
          
          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Email" 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="No. HP" 
              value={formData.no_hp} 
              onChange={e => setFormData({...formData, no_hp: e.target.value})}
            />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_pengguna"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_pengguna" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Pengguna"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus pengguna <strong>{selectedItem?.nama_lengkap}</strong>?
        </p>
      </Modal>
    </div>
  );
}
