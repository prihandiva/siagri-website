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
import { Edit2, Trash2, GitMerge, UsersRound, MapPin, Building } from 'lucide-react';
import { createPoktan, updatePoktan, deletePoktan, gabungkanPoktanKeGapoktan, keluarkanPoktanDariGapoktan } from './actions';

export default function PoktanClient({ initialData, options }: { initialData: any[], options: { desa: any[], gapoktan: any[] } }) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isGapoktanOpen, setIsGapoktanOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedGapoktanId, setSelectedGapoktanId] = useState('');
  
  const [formData, setFormData] = useState({ 
    id_desa: '', id_gapoktan: '', kode_poktan: '', nama_poktan: '', 
    id_ketua: '', ketua_poktan: '', kelas_kemampuan: '', tahun_berdiri: '', status_aktif: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dynamicGapoktanOpts = useMemo(() => {
    const base = options.gapoktan ?? [];
    const filtered = formData.id_desa ? base.filter((g: any) => String(g.id_desa) === String(formData.id_desa)) : base;
    return [{ label: '-- Tidak Tergabung Gapoktan --', value: '' }, ...filtered.map((g: any) => ({ label: g.nama_gapoktan, value: String(g.id_gapoktan) }))];
  }, [options.gapoktan, formData.id_desa]);

  const allGapoktanOpts = useMemo(() => {
    const base = options.gapoktan ?? [];
    const desa = selectedItem?.id_desa;
    const filtered = desa ? base.filter((g: any) => String(g.id_desa) === String(desa)) : base;
    return [{ label: '-- Pilih Gapoktan --', value: '' }, ...filtered.map((g: any) => ({ label: g.nama_gapoktan, value: String(g.id_gapoktan) }))];
  }, [options.gapoktan, selectedItem]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item: any) => 
      item.nama_poktan.toLowerCase().includes(term) ||
      item.kode_poktan.toLowerCase().includes(term) ||
      (item.desa?.nama_desa || '').toLowerCase().includes(term) ||
      (item.gapoktan?.nama_gapoktan || '').toLowerCase().includes(term) ||
      (item.ketua_poktan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa?.toString() || '',
        id_gapoktan: item.id_gapoktan?.toString() || '',
        kode_poktan: item.kode_poktan || '',
        nama_poktan: item.nama_poktan || '',
        id_ketua: item.id_ketua || '',
        ketua_poktan: item.ketua_poktan || '',
        kelas_kemampuan: item.kelas_kemampuan || '',
        tahun_berdiri: item.tahun_berdiri || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({ id_desa: '', id_gapoktan: '', kode_poktan: '', nama_poktan: '', id_ketua: '', ketua_poktan: '', kelas_kemampuan: '', tahun_berdiri: '', status_aktif: true });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = selectedItem ? await updatePoktan(selectedItem.id_poktan, formData) : await createPoktan(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Poktan diperbarui!' : 'Poktan ditambahkan!');
      setIsFormOpen(false); window.location.reload();
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePoktan(selectedItem.id_poktan);
    setLoading(false);
    if (res?.success) {
      toast.success('Poktan dihapus!'); setIsDeleteOpen(false); window.location.reload();
    } else {
      toast.error(res?.error || 'Gagal menghapus.');
    }
  };

  const handleGabungGapoktan = async () => {
    if (!selectedGapoktanId) { toast.error('Pilih Gapoktan terlebih dahulu.'); return; }
    setLoading(true);
    const res = await gabungkanPoktanKeGapoktan(selectedItem.id_poktan, selectedGapoktanId);
    setLoading(false);
    if (res?.success) {
      toast.success('Poktan berhasil digabungkan!'); setIsGapoktanOpen(false); window.location.reload();
    } else { toast.error(res?.error || 'Gagal.'); }
  };

  const handleKeluarGapoktan = async () => {
    setLoading(true);
    const res = await keluarkanPoktanDariGapoktan(selectedItem.id_poktan);
    setLoading(false);
    if (res?.success) {
      toast.success('Poktan dikeluarkan dari Gapoktan!'); setIsGapoktanOpen(false); window.location.reload();
    } else { toast.error(res?.error || 'Gagal.'); }
  };

  const columns = [
    { key: 'poktan', header: 'Poktan', render: (item: any) => (
      <div>
        <div className="font-bold text-green-800 flex items-center gap-1.5"><UsersRound size={14}/> {item.nama_poktan}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">Kode: {item.kode_poktan}</div>
        {item.gapoktan ? (
          <div className="text-xs text-purple-600 mt-1 flex items-center gap-1"><Building size={10}/> Gabung: {item.gapoktan.nama_gapoktan}</div>
        ) : (
          <div className="text-xs text-gray-400 mt-1 italic flex items-center gap-1"><Building size={10}/> Mandiri / Belum Gabung</div>
        )}
      </div>
    )},
    { key: 'wilayah', header: 'Wilayah', render: (item: any) => (
      <div>
        <div className="font-medium flex items-center gap-1"><MapPin size={12} className="text-green-600"/>{item.desa?.nama_desa}</div>
        <div className="text-xs text-gray-500">Kec. {item.desa?.kecamatan?.nama_kecamatan}</div>
      </div>
    )},
    { key: 'ketua_poktan', header: 'Ketua', render: (item: any) => item.ketua_poktan ? <span className="font-medium text-gray-800">{item.ketua_poktan}</span> : <span className="text-gray-400">-</span> },
    { key: 'kelas_kemampuan', header: 'Kelas', render: (item: any) => item.kelas_kemampuan ? <Badge variant="info">{item.kelas_kemampuan}</Badge> : '-' },
    { key: 'status_aktif', header: 'Status', render: (item: any) => <Badge variant={item.status_aktif ? 'success' : 'danger'}>{item.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'aksi', header: 'Aksi', render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setSelectedItem(item); setSelectedGapoktanId(item.id_gapoktan?.toString() || ''); setIsGapoktanOpen(true); }}
            className="text-purple-600 hover:text-purple-900 p-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" title="Gabungkan ke Gapoktan">
            <GitMerge size={14}/>
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
      <DataTable title="Master Kelompok Tani" description="Kelola data Kelompok Tani (Poktan)." data={filteredData} columns={columns} onAdd={() => handleOpenForm()} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Kelompok Tani" : "Tambah Kelompok Tani"} size="lg" footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <div className="col-span-2">
            <WilayahSelector initialValues={{ id_desa: formData.id_desa }} onDesaChange={val => setFormData({...formData, id_desa: val, id_gapoktan: ''})} />
          </div>
          <Select label="Tergabung dalam Gapoktan" options={dynamicGapoktanOpts} value={formData.id_gapoktan} onChange={e => setFormData({...formData, id_gapoktan: e.target.value})} disabled={!formData.id_desa} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Poktan *" value={formData.kode_poktan} onChange={e => setFormData({...formData, kode_poktan: e.target.value})} required placeholder="POK-XXX" />
            <Input label="Nama Poktan *" value={formData.nama_poktan} onChange={e => setFormData({...formData, nama_poktan: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nama Ketua" value={formData.ketua_poktan} onChange={e => setFormData({...formData, ketua_poktan: e.target.value})} placeholder="Masukkan Nama Ketua" />
            <Select label="Kelas Kemampuan" options={[{label:'-- Pilih Kelas --',value:''},{label:'Pemula',value:'Pemula'},{label:'Lanjut',value:'Lanjut'},{label:'Madya',value:'Madya'},{label:'Utama',value:'Utama'}]} value={formData.kelas_kemampuan} onChange={e => setFormData({...formData, kelas_kemampuan: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tahun Berdiri" type="number" value={formData.tahun_berdiri} onChange={e => setFormData({...formData, tahun_berdiri: e.target.value})} placeholder="Contoh: 2020" />
            {selectedItem && (
              <div className="flex items-center gap-2 mt-7">
                <input type="checkbox" id="status_aktif" checked={formData.status_aktif} onChange={e => setFormData({...formData, status_aktif: e.target.checked})} className="rounded text-green-600" />
                <label htmlFor="status_aktif" className="text-sm">Status Aktif</label>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Gabung Gapoktan Modal */}
      <Modal isOpen={isGapoktanOpen} onClose={() => setIsGapoktanOpen(false)} title={`Gabungkan ke Gapoktan — ${selectedItem?.nama_poktan}`} size="sm" footer={
        <div className="flex w-full gap-2">
          {selectedItem?.gapoktan && <Button variant="danger" onClick={handleKeluarGapoktan} isLoading={loading} className="mr-auto">Keluarkan</Button>}
          <Button variant="ghost" onClick={() => setIsGapoktanOpen(false)}>Batal</Button>
          <Button onClick={handleGabungGapoktan} isLoading={loading}>Gabungkan</Button>
        </div>
      }>
        <div className="space-y-4">
          {selectedItem?.gapoktan && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
              <p className="text-purple-700">Tergabung di: <strong>{selectedItem.gapoktan.nama_gapoktan}</strong></p>
            </div>
          )}
          <Select label="Pilih Gapoktan" options={allGapoktanOpts} value={selectedGapoktanId} onChange={e => setSelectedGapoktanId(e.target.value)} />
          <p className="text-xs text-gray-500">Poktan akan digabungkan ke Gapoktan. Keanggotaan sebelumnya otomatis terganti jika ada.</p>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Poktan" footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}>
        <p className="text-gray-600">Yakin hapus <strong>{selectedItem?.nama_poktan}</strong>?</p>
      </Modal>
    </div>
  );
}
