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
import { Edit2, Trash2, Eye, GitMerge, Users, MapPin, Phone, User } from 'lucide-react';
import { createPetani, updatePetani, deletePetani, gabungkanPetaniKePoktan, keluarkanPetaniDariPoktan } from './actions';

export default function PetaniClient({
  initialData,
  options
}: {
  initialData: any[];
  options: { desa: any[]; poktan: any[]; pendidikan: any[]; pekerjaan: any[] };
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPoktanOpen, setIsPoktanOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedPoktanId, setSelectedPoktanId] = useState('');

  const [formData, setFormData] = useState({
    id_desa: '',
    nik: '',
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    no_hp: '',
    id_pendidikan: '',
    status_perkawinan: '',
    id_pekerjaan: '',
    pengalaman_tani_tahun: '',
    status_aktif: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const jkOpts = [
    { label: '-- Pilih Jenis Kelamin --', value: '' },
    { label: 'Laki-laki', value: 'L' },
    { label: 'Perempuan', value: 'P' }
  ];

  const nikRegex = /^[0-9]{16}$/;

  // Poktan options filtered by desa petani yang dipilih
  const poktanOpts = useMemo(() => {
    const base = options.poktan ?? [];
    const filtered = formData.id_desa
      ? base.filter((p: any) => String(p.id_desa) === String(formData.id_desa))
      : base;
    return [{ label: '-- Tidak bergabung Poktan --', value: '' }, ...filtered.map((p: any) => ({ label: p.nama_poktan, value: String(p.id_poktan) }))];
  }, [options.poktan, formData.id_desa]);

  // Poktan opts for "Gabung Poktan" modal
  const allPoktanOpts = useMemo(() => {
    const base = options.poktan ?? [];
    const desa = selectedItem?.id_desa;
    const filtered = desa ? base.filter((p: any) => String(p.id_desa) === String(desa)) : base;
    return [{ label: '-- Pilih Poktan --', value: '' }, ...filtered.map((p: any) => ({ label: p.nama_poktan, value: String(p.id_poktan) }))];
  }, [options.poktan, selectedItem]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item: any) =>
      item.nama_lengkap.toLowerCase().includes(term) ||
      item.nik.includes(searchTerm) ||
      (item.desa?.nama_desa || '').toLowerCase().includes(term) ||
      (item.keanggotaan_poktan?.[0]?.poktan?.nama_poktan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_desa: item.id_desa?.toString() || '',
        nik: item.nik,
        nama_lengkap: item.nama_lengkap,
        tempat_lahir: item.tempat_lahir || '',
        tanggal_lahir: item.tanggal_lahir ? new Date(item.tanggal_lahir).toISOString().split('T')[0] : '',
        jenis_kelamin: item.jenis_kelamin || '',
        alamat: item.alamat || '',
        no_hp: item.no_hp || '',
        id_pendidikan: item.id_pendidikan?.toString() || '',
        status_perkawinan: item.status_perkawinan || '',
        id_pekerjaan: item.id_pekerjaan?.toString() || '',
        pengalaman_tani_tahun: item.pengalaman_tani_tahun || '',
        status_aktif: item.status_aktif,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        id_desa: '', nik: '', nama_lengkap: '', tempat_lahir: '', tanggal_lahir: '',
        jenis_kelamin: '', alamat: '', no_hp: '', id_pendidikan: '',
        status_perkawinan: '', id_pekerjaan: '',
        pengalaman_tani_tahun: '', status_aktif: true
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikRegex.test(formData.nik)) {
      setError('NIK harus terdiri dari 16 digit angka.');
      return;
    }
    if (!formData.id_desa) {
      setError('Pilih wilayah desa terlebih dahulu.');
      return;
    }
    setLoading(true); setError('');
    const res = selectedItem
      ? await updatePetani(selectedItem.id_petani, formData)
      : await createPetani(formData);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data petani diperbarui!' : 'Petani berhasil ditambahkan!');
      setIsFormOpen(false); window.location.reload();
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePetani(selectedItem.id_petani);
    setLoading(false);
    if (res?.success) {
      toast.success('Petani berhasil dihapus!');
      setIsDeleteOpen(false); window.location.reload();
    } else {
      toast.error(res?.error || 'Gagal menghapus.');
    }
  };

  const handleGabungPoktan = async () => {
    if (!selectedPoktanId) { toast.error('Pilih poktan terlebih dahulu.'); return; }
    setLoading(true);
    const res = await gabungkanPetaniKePoktan(selectedItem.id_petani, selectedPoktanId);
    setLoading(false);
    if (res?.success) {
      toast.success('Petani berhasil digabungkan ke Poktan!');
      setIsPoktanOpen(false); window.location.reload();
    } else {
      toast.error(res?.error || 'Gagal menggabungkan.');
    }
  };

  const handleKeluarPoktan = async () => {
    setLoading(true);
    const res = await keluarkanPetaniDariPoktan(selectedItem.id_petani);
    setLoading(false);
    if (res?.success) {
      toast.success('Petani berhasil dikeluarkan dari Poktan!');
      setIsPoktanOpen(false); window.location.reload();
    } else {
      toast.error(res?.error || 'Gagal.');
    }
  };

  const getPoktan = (item: any) => item?.keanggotaan_poktan?.[0]?.poktan;

  const columns = [
    { key: 'nik_nama', header: 'NIK & Nama Petani', render: (item: any) => (
      <div>
        <div className="font-semibold text-green-900">{item.nama_lengkap}</div>
        <div className="text-xs text-gray-500 font-mono">{item.nik}</div>
        {item.no_hp && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone size={9}/>{item.no_hp}</div>}
      </div>
    )},
    { key: 'wilayah', header: 'Wilayah', render: (item: any) => (
      <div>
        <div className="font-medium flex items-center gap-1"><MapPin size={11} className="text-green-600"/>{item.desa?.nama_desa || '-'}</div>
        <div className="text-xs text-gray-400">Kec. {item.desa?.kecamatan?.nama_kecamatan || '-'}</div>
        <div className="text-xs text-gray-400">{item.desa?.kecamatan?.kabupaten?.nama_kabupaten || ''}</div>
      </div>
    )},
    { key: 'poktan', header: 'Poktan', render: (item: any) => {
      const poktan = getPoktan(item);
      return poktan
        ? <Badge variant="info">{poktan.nama_poktan}</Badge>
        : <span className="text-xs text-gray-400 italic">Mandiri</span>;
    }},
    { key: 'lahan', header: 'Lahan', render: (item: any) => (
      <span className="font-medium text-blue-700">{item.lahan?.length || 0} lahan</span>
    )},
    { key: 'status_aktif', header: 'Status', render: (item: any) => (
      <Badge variant={item.status_aktif ? 'success' : 'danger'}>{item.status_aktif ? 'Aktif' : 'Nonaktif'}</Badge>
    )},
    { key: 'aksi', header: 'Aksi', render: (item: any) => (
      <div className="flex items-center gap-1.5">
        <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }}
          className="text-gray-600 hover:text-gray-900 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" title="Detail">
          <Eye size={14}/>
        </button>
        <button onClick={() => { setSelectedItem(item); setSelectedPoktanId(getPoktan(item)?.id_poktan?.toString() || ''); setIsPoktanOpen(true); }}
          className="text-purple-600 hover:text-purple-900 p-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" title="Gabungkan ke Poktan">
          <GitMerge size={14}/>
        </button>
        <button onClick={() => handleOpenForm(item)}
          className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
          <Edit2 size={14}/>
        </button>
        <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }}
          className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
          <Trash2 size={14}/>
        </button>
      </div>
    )},
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Master Petani"
        description="Kelola data registrasi petani, wilayah, dan keanggotaan poktan."
        data={filteredData} columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Data Petani' : 'Tambah Petani Baru'} size="xl"
        footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading}>Simpan</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}

          <WilayahSelector
            initialValues={{ id_desa: formData.id_desa }}
            onDesaChange={val => setFormData(prev => ({ ...prev, id_desa: val }))}
            label="Wilayah Domisili Petani"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="NIK (16 digit) *" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })} required maxLength={16} placeholder="16 digit NIK" />
            <Input label="Nama Lengkap *" value={formData.nama_lengkap} onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })} required placeholder="Sesuai KTP" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Tempat Lahir" value={formData.tempat_lahir} onChange={e => setFormData({ ...formData, tempat_lahir: e.target.value })} placeholder="Kota lahir" />
            <Input label="Tanggal Lahir" type="date" value={formData.tanggal_lahir} onChange={e => setFormData({ ...formData, tanggal_lahir: e.target.value })} />
            <Select label="Jenis Kelamin" options={jkOpts} value={formData.jenis_kelamin} onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value })} />
          </div>

          <Input label="Alamat Lengkap" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} placeholder="Jl. / Gang / RT-RW..." />

          <div className="grid grid-cols-3 gap-4">
            <Input label="No. HP" value={formData.no_hp} onChange={e => setFormData({ ...formData, no_hp: e.target.value })} placeholder="08..." />
            <Select label="Pendidikan Terakhir" options={[{label:'-- Pilih Pendidikan --', value:''}, ...(options.pendidikan || []).map(p => ({label: p.nama_pendidikan, value: p.id_pendidikan.toString()}))]} value={formData.id_pendidikan} onChange={e => setFormData({ ...formData, id_pendidikan: e.target.value })} />
            <Select label="Pekerjaan Utama" options={[{label:'-- Pilih Pekerjaan --', value:''}, ...(options.pekerjaan || []).map(p => ({label: p.nama_pekerjaan, value: p.id_pekerjaan.toString()}))]} value={formData.id_pekerjaan} onChange={e => setFormData({ ...formData, id_pekerjaan: e.target.value })} />
            <Input label="Pengalaman Bertani (tahun)" type="number" value={formData.pengalaman_tani_tahun} onChange={e => setFormData({ ...formData, pengalaman_tani_tahun: e.target.value })} placeholder="Contoh: 10" />
          </div>

          {selectedItem && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="status_aktif_p" checked={formData.status_aktif} onChange={e => setFormData({ ...formData, status_aktif: e.target.checked })} className="rounded border-gray-300 text-green-700" />
              <label htmlFor="status_aktif_p" className="text-sm font-medium text-gray-700">Status Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Gabung Poktan Modal */}
      <Modal isOpen={isPoktanOpen} onClose={() => setIsPoktanOpen(false)}
        title={`Gabungkan ke Poktan — ${selectedItem?.nama_lengkap}`} size="sm"
        footer={
          <div className="flex w-full gap-2">
            {getPoktan(selectedItem) && (
              <Button variant="danger" onClick={handleKeluarPoktan} isLoading={loading} className="mr-auto">Keluarkan dari Poktan</Button>
            )}
            <Button variant="ghost" onClick={() => setIsPoktanOpen(false)}>Batal</Button>
            <Button onClick={handleGabungPoktan} isLoading={loading}>Gabungkan</Button>
          </div>
        }>
        <div className="space-y-4">
          {getPoktan(selectedItem) && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
              <p className="text-purple-700">Saat ini tergabung di: <strong>{getPoktan(selectedItem)?.nama_poktan}</strong></p>
            </div>
          )}
          <Select
            label="Pilih Kelompok Tani (Poktan)"
            options={allPoktanOpts}
            value={selectedPoktanId}
            onChange={e => setSelectedPoktanId(e.target.value)}
          />
          <p className="text-xs text-gray-500">Petani akan dimasukkan ke anggota poktan terpilih. Keanggotaan poktan lama akan digantikan.</p>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)}
        title="Detail Petani" footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1"><User size={11}/>Identitas</p>
                <p className="font-bold text-green-900">{selectedItem.nama_lengkap}</p>
                <p className="text-xs text-green-700 font-mono mt-0.5">NIK: {selectedItem.nik}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1"><MapPin size={11}/>Wilayah</p>
                <p className="font-bold text-blue-900">{selectedItem.desa?.nama_desa || '-'}</p>
                <p className="text-xs text-blue-600">Kec. {selectedItem.desa?.kecamatan?.nama_kecamatan || '-'}</p>
                <p className="text-xs text-blue-500">{selectedItem.desa?.kecamatan?.kabupaten?.nama_kabupaten || ''}</p>
                <p className="text-xs text-blue-400">{selectedItem.desa?.kecamatan?.kabupaten?.provinsi?.nama_provinsi || ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { label: 'Tempat, Tgl Lahir', val: `${selectedItem.tempat_lahir || '-'}, ${selectedItem.tanggal_lahir ? new Date(selectedItem.tanggal_lahir).toLocaleDateString('id-ID') : '-'}` },
                { label: 'Jenis Kelamin', val: selectedItem.jenis_kelamin || '-' },
                { label: 'No. HP', val: selectedItem.no_hp || '-' },
                { label: 'Pendidikan', val: selectedItem.pendidikan?.nama_pendidikan || '-' },
                { label: 'Pekerjaan', val: selectedItem.pekerjaan?.nama_pekerjaan || '-' },
                { label: 'Pengalaman', val: selectedItem.pengalaman_tani_tahun ? `${selectedItem.pengalaman_tani_tahun} tahun` : '-' },
              ].map(r => (
                <div key={r.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">{r.label}</p>
                  <p className="font-medium text-gray-800">{r.val}</p>
                </div>
              ))}
            </div>
            {selectedItem.alamat && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                <p className="text-xs text-gray-400 mb-0.5">Alamat</p>
                <p className="text-gray-700">{selectedItem.alamat}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium mb-1 flex items-center gap-1"><Users size={11}/>Keanggotaan Poktan</p>
                {getPoktan(selectedItem) ? (
                  <p className="font-bold text-purple-900">{getPoktan(selectedItem).nama_poktan}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Belum bergabung poktan</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium mb-1">Lahan Terdaftar</p>
                <p className="font-bold text-amber-900">{selectedItem.lahan?.length || 0} lahan</p>
                <p className="text-xs text-amber-600">{selectedItem.lahan?.reduce((a: number, l: any) => a + parseFloat(l.luas_lahan || 0), 0).toFixed(2)} Ha total</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Petani"
        footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}>
        <p className="text-gray-600">Hapus data petani <strong>{selectedItem?.nama_lengkap}</strong>? Data terhapus permanen (soft delete).</p>
      </Modal>
    </div>
  );
}
