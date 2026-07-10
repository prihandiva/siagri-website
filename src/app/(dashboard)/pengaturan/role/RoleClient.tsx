'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Shield, Users } from 'lucide-react';
import { createRole, updateRole, deleteRole } from './actions';

type RoleItem = {
  id_role: string;
  nama_role: string;
  kode_role: string;
  deskripsi: string | null;
  _count: { users: number };
};

const emptyForm = { nama_role: '', kode_role: '', deskripsi: '' };

// Role color mapping
const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  superadmin:     { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' },
  adminprovinsi:  { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  adminkabupaten: { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  adminkecamatan: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  admindesa:      { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  petugasdesa:    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  penyuluh:       { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  ketua_poktan:   { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
  petani:         { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
};

const getRoleStyle = (kode: string) =>
  roleColors[kode.toLowerCase().replace(/\s+/g, '')] ||
  { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };

export default function RoleClient({ initialData }: { initialData: RoleItem[] }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RoleItem | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredData = useMemo(() =>
    data.filter((item) =>
      item.nama_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_role.toLowerCase().includes(searchTerm.toLowerCase())
    ), [data, searchTerm]);

  const handleOpenForm = (item?: RoleItem) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({ nama_role: item.nama_role, kode_role: item.kode_role, deskripsi: item.deskripsi || '' });
    } else {
      setSelectedItem(null);
      setFormData({ ...emptyForm });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = selectedItem
      ? await updateRole(selectedItem.id_role, formData)
      : await createRole(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Role berhasil diperbarui!' : 'Role berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setLoading(true);
    const res = await deleteRole(selectedItem.id_role);
    setLoading(false);
    if (res?.success) {
      toast.success('Role berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus role.');
    }
  };

  const columns = [
    {
      key: 'kode_role',
      header: 'Kode Role',
      render: (item: RoleItem) => {
        const style = getRoleStyle(item.kode_role);
        return (
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.2rem 0.625rem', borderRadius: '6px',
              fontSize: '0.75rem', fontWeight: 600,
              background: style.bg, color: style.text,
              border: `1px solid ${style.border}`,
            }}
          >
            <Shield size={11} />
            {item.kode_role}
          </span>
        );
      },
    },
    { key: 'nama_role', header: 'Nama Role' },
    { key: 'deskripsi', header: 'Deskripsi', render: (item: RoleItem) => item.deskripsi || '-' },
    {
      key: 'users',
      header: 'Pengguna',
      render: (item: RoleItem) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <Users size={14} className="text-gray-400" />
          <span className="font-semibold">{item._count.users}</span>
          <span className="text-gray-400">akun</span>
        </div>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item: RoleItem) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenForm(item)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded">
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }}
            className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded"
            disabled={item._count.users > 0}
            title={item._count.users > 0 ? 'Role masih dipakai pengguna' : 'Hapus role'}
          >
            <Trash2 className={`w-4 h-4 ${item._count.users > 0 ? 'opacity-30' : ''}`} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Manajemen Role"
        description="Kelola role dan hak akses pengguna sistem SIAGRI."
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Role' : 'Tambah Role'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <Input
            label="Kode Role"
            value={formData.kode_role}
            onChange={(e) => setFormData({ ...formData, kode_role: e.target.value })}
            required placeholder="contoh: admindesa"
            helperText="Huruf kecil, tanpa spasi. Digunakan sebagai identifier sistem."
          />
          <Input
            label="Nama Role"
            value={formData.nama_role}
            onChange={(e) => setFormData({ ...formData, nama_role: e.target.value })}
            required placeholder="contoh: Admin Desa"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
              placeholder="Deskripsi singkat tentang role ini..."
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus role <strong>{selectedItem?.nama_role}</strong>?
          Role yang masih digunakan pengguna tidak dapat dihapus.
        </p>
      </Modal>
    </div>
  );
}
