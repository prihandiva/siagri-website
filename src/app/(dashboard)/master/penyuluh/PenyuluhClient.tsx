'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Trash2 } from 'lucide-react';
import { createPenyuluh, updatePenyuluh, deletePenyuluh } from './actions';

export default function PenyuluhClient({ 
  initialData, 
  kecamatanOptions 
}: { 
  initialData: any[],
  kecamatanOptions: any[] 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    nip: '', 
    nama: '', 
    no_hp: '',
    instansi: '',
    jabatan: '',
    email: '',
    id_kecamatan: '',
    status_aktif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nip || '').includes(searchTerm)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        nip: item.nip || '',
        nama: item.nama || '',
        no_hp: item.no_hp || '',
        instansi: item.instansi || '',
        jabatan: item.jabatan || '',
        email: item.email || '',
        id_kecamatan: item.id_kecamatan?.toString() || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        nip: '', 
        nama: '', 
        no_hp: '',
        instansi: '',
        jabatan: '',
        email: '',
        id_kecamatan: '',
        status_aktif: true,
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
      res = await updatePenyuluh(selectedItem.id_penyuluh, formData);
    } else {
      res = await createPenyuluh(formData);
    }

    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data penyuluh diperbarui!' : 'Penyuluh berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePenyuluh(selectedItem.id_penyuluh);
    setLoading(false);
    if (res?.success) {
      toast.success('Penyuluh berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  const columns = [
    { key: 'nip_nama', header: 'Penyuluh', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.nama}</div>
        <div className="text-xs text-gray-500 font-mono">NIP. {item.nip || '-'}</div>
      </div>
    )},
    { key: 'kontak', header: 'Kontak', render: (item: any) => (
      <div>
        <div className="text-sm">{item.no_hp || '-'}</div>
        <div className="text-xs text-gray-500">{item.email || '-'}</div>
      </div>
    )},
    { key: 'instansi', header: 'Instansi / Jabatan', render: (item: any) => (
      <div>
        <div className="font-medium">{item.instansi || '-'}</div>
        <div className="text-xs text-gray-500">{item.jabatan || '-'}</div>
      </div>
    )},
    { key: 'binaan', header: 'Wilayah Binaan (Poktan)', render: (item: any) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {item.poktan_binaan?.length > 0 ? (
          item.poktan_binaan.slice(0, 3).map((w: any) => (
            <span key={w.id_relasi} className="inline-block bg-green-50 text-green-700 border border-green-200 text-[10px] px-1.5 py-0.5 rounded">
              {w.poktan?.nama_poktan}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">Belum ada</span>
        )}
      </div>
    )},
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
        title="Master Penyuluh (PPL)"
        description="Kelola data Petugas Penyuluh Lapangan (PPL)."
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Penyuluh" : "Tambah Penyuluh"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="penyuluh-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="NIP" 
              value={formData.nip} 
              onChange={e => setFormData({...formData, nip: e.target.value})}
              placeholder="Contoh: 198001012010011001"
            />
            <Input 
              label="Nama Lengkap" 
              value={formData.nama} 
              onChange={e => setFormData({...formData, nama: e.target.value})}
              required
              placeholder="Beserta gelar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="No. HP" 
              value={formData.no_hp} 
              onChange={e => setFormData({...formData, no_hp: e.target.value})}
              placeholder="08..."
            />
            <Input 
              label="Email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="penyuluh@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Instansi" 
              value={formData.instansi} 
              onChange={e => setFormData({...formData, instansi: e.target.value})}
              placeholder="Contoh: BPP Kec. Glenmore"
            />
            <Input 
              label="Jabatan" 
              value={formData.jabatan} 
              onChange={e => setFormData({...formData, jabatan: e.target.value})}
              placeholder="Contoh: Penyuluh Pertanian Muda"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Kecamatan Wilayah Kerja</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              value={formData.id_kecamatan}
              onChange={e => setFormData({...formData, id_kecamatan: e.target.value})}
            >
              <option value="">-- Pilih Kecamatan --</option>
              {kecamatanOptions.map((kec: any) => (
                <option key={kec.id_kecamatan} value={kec.id_kecamatan}>
                  {kec.nama_kecamatan}
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="status_aktif_penyuluh"
                checked={formData.status_aktif}
                onChange={e => setFormData({...formData, status_aktif: e.target.checked})}
                className="rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
              />
              <label htmlFor="status_aktif_penyuluh" className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Penyuluh"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama}</strong>?
          Data yang dihapus tidak dapat dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
