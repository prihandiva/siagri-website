'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WilayahSelector } from '@/components/ui/WilayahSelector';
import { Edit2, Trash2, UsersRound, MapPin, Building2, Eye, Users } from 'lucide-react';
import { createGapoktan, updateGapoktan, deleteGapoktan } from './actions';

export default function GapoktanClient({ initialData, options }: { initialData: any[], options: { desa: any[] } }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    id_desa: '', kode_gapoktan: '', nama_gapoktan: '', id_ketua: '', ketua_gapoktan: '', tahun_berdiri: '', status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item: any) => 
      item.nama_gapoktan.toLowerCase().includes(term) ||
      item.kode_gapoktan.toLowerCase().includes(term) ||
      (item.desa?.nama_desa || '').toLowerCase().includes(term) ||
      (item.ketua_gapoktan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa?.toString() || '',
        kode_gapoktan: item.kode_gapoktan || '',
        nama_gapoktan: item.nama_gapoktan || '',
        id_ketua: item.id_ketua || '',
        ketua_gapoktan: item.ketua_gapoktan || '',
        tahun_berdiri: item.tahun_berdiri || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ id_desa: '', kode_gapoktan: '', nama_gapoktan: '', id_ketua: '', ketua_gapoktan: '', tahun_berdiri: '', status_aktif: true });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = selectedItem ? await updateGapoktan(selectedItem.id_gapoktan, formData) : await createGapoktan(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Gapoktan diperbarui!' : 'Gapoktan ditambahkan!');
      setIsFormOpen(false); window.location.reload();
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteGapoktan(selectedItem.id_gapoktan);
    setLoading(false);
    if (res?.success) {
      toast.success('Gapoktan dihapus!'); setIsDeleteOpen(false); window.location.reload();
    } else {
      toast.error(res?.error || 'Gagal menghapus.');
    }
  };

  const columns = [
    { key: 'gapoktan', header: 'Gapoktan', render: (item: any) => (
      <div>
        <div className="font-bold text-green-800 flex items-center gap-1.5"><Building2 size={14}/> {item.nama_gapoktan}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">Kode: {item.kode_gapoktan}</div>
      </div>
    )},
    { key: 'wilayah', header: 'Wilayah', render: (item: any) => (
      <div>
        <div className="font-medium flex items-center gap-1"><MapPin size={12} className="text-green-600"/>{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">Kec. {item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'ketua_gapoktan', header: 'Ketua', render: (item: any) => item.ketua_gapoktan ? <span className="font-medium text-gray-800">{item.ketua_gapoktan}</span> : <span className="text-gray-400">-</span> },
    { key: 'anggota', header: 'Poktan Anggota', render: (item: any) => (
      <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 w-fit"><Users size={11}/>{item.list_poktan?.length || 0} poktan</span>
    )},
    { key: 'status_aktif', header: 'Status', render: (item: any) => <Badge variant={item.status_aktif ? 'success' : 'danger'}>{item.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'aksi', header: 'Aksi', render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} className="text-gray-600 hover:text-gray-900 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" title="Detail">
            <Eye size={14}/>
          </button>
          <button onClick={() => handleOpenForm(item)} className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
            <Edit2 size={14}/>
          </button>
          <button onClick={() => handleOpenDelete(item)} className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
            <Trash2 size={14}/>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable title="Master Gabungan Kelompok Tani" description="Kelola data Gapoktan." data={filteredData} columns={columns} onAdd={() => handleOpenForm()} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Gapoktan" : "Tambah Gapoktan"} size="lg" footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <WilayahSelector initialValues={{ id_desa: formData.id_desa }} onDesaChange={val => setFormData({...formData, id_desa: val})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Gapoktan *" value={formData.kode_gapoktan} onChange={e => setFormData({...formData, kode_gapoktan: e.target.value})} required placeholder="GAP-XXX" />
            <Input label="Nama Gapoktan *" value={formData.nama_gapoktan} onChange={e => setFormData({...formData, nama_gapoktan: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nama Ketua" value={formData.ketua_gapoktan} onChange={e => setFormData({...formData, ketua_gapoktan: e.target.value})} placeholder="Masukkan Nama Ketua" />
            <Input label="Tahun Berdiri" type="number" value={formData.tahun_berdiri} onChange={e => setFormData({...formData, tahun_berdiri: e.target.value})} placeholder="Contoh: 2020" />
          </div>
          {selectedItem && (
            <div className="flex items-center gap-2 mt-7">
              <input type="checkbox" id="status_aktif_g" checked={formData.status_aktif} onChange={e => setFormData({...formData, status_aktif: e.target.checked})} className="rounded text-green-600" />
              <label htmlFor="status_aktif_g" className="text-sm">Status Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Gapoktan" size="lg" footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1"><Building2 size={11}/>Identitas</p>
                <p className="font-bold text-green-900">{selectedItem.nama_gapoktan}</p>
                <p className="text-xs text-green-700 font-mono mt-0.5">Kode: {selectedItem.kode_gapoktan}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1"><MapPin size={11}/>Wilayah & Ketua</p>
                <p className="font-bold text-blue-900">{selectedItem.desa?.nama_desa || '-'}</p>
                <p className="text-xs text-blue-600 mt-1">Ketua: <strong>{selectedItem.ketua_gapoktan || '-'}</strong></p>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><UsersRound size={16}/> Daftar Poktan Anggota</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4">Nama Poktan</th>
                    <th className="py-2.5 px-4">Ketua</th>
                    <th className="py-2.5 px-4 text-center">Jml Anggota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {selectedItem.list_poktan?.length > 0 ? (
                    selectedItem.list_poktan.map((p: any) => (
                      <tr key={p.id_poktan} className="hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <div className="font-medium text-gray-800">{p.nama_poktan}</div>
                          <div className="text-xs text-gray-400 font-mono">{p.kode_poktan}</div>
                        </td>
                        <td className="py-2 px-4 text-gray-600">{p.ketua_poktan || '-'}</td>
                        <td className="py-2 px-4 text-center">
                          <Badge variant="secondary">{p.anggota?._count || 0}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-400 italic">Belum ada poktan yang tergabung</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Gapoktan" footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}>
        <p className="text-gray-600">Yakin hapus <strong>{selectedItem?.nama_gapoktan}</strong>?</p>
      </Modal>
    </div>
  );
}
