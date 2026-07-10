'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Edit2, Trash2, MapPin, Users } from 'lucide-react';
import { createRt, updateRt, deleteRt } from './actions';

type RtItem = {
  id_rt: string;
  id_rw: string;
  kode_rt: string;
  nama_rt: string;
  ketua_rt: string | null;
  no_hp: string | null;
  jumlah_kk: number | null;
  jumlah_jiwa: number | null;
  status_aktif: boolean;
  rw: {
    nama_rw: string;
    dusun: {
      nama_dusun: string;
      desa: {
        nama_desa: string;
        kecamatan: { nama_kecamatan: string };
      };
    };
  };
};

const emptyForm = {
  id_rw: '',
  kode_rt: '',
  nama_rt: '',
  ketua_rt: '',
  no_hp: '',
  jumlah_kk: '',
  jumlah_jiwa: '',
  status_aktif: true,
};

export default function RtClient({
  initialData,
  rwList,
}: {
  initialData: RtItem[];
  rwList: any[];
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RtItem | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredData = useMemo(() =>
    data.filter((item) =>
      item.nama_rt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_rt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rw.nama_rw.toLowerCase().includes(searchTerm.toLowerCase())
    ), [data, searchTerm]);

  const handleOpenForm = (item?: RtItem) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_rw: item.id_rw,
        kode_rt: item.kode_rt,
        nama_rt: item.nama_rt,
        ketua_rt: item.ketua_rt || '',
        no_hp: item.no_hp || '',
        jumlah_kk: item.jumlah_kk?.toString() || '',
        jumlah_jiwa: item.jumlah_jiwa?.toString() || '',
        status_aktif: item.status_aktif,
      });
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
    const payload = {
      id_rw: formData.id_rw,
      kode_rt: formData.kode_rt,
      nama_rt: formData.nama_rt,
      ketua_rt: formData.ketua_rt || undefined,
      no_hp: formData.no_hp || undefined,
      jumlah_kk: formData.jumlah_kk ? parseInt(formData.jumlah_kk) : undefined,
      jumlah_jiwa: formData.jumlah_jiwa ? parseInt(formData.jumlah_jiwa) : undefined,
      status_aktif: formData.status_aktif,
    };
    const res = selectedItem
      ? await updateRt(selectedItem.id_rt, payload)
      : await createRt(payload);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data RT berhasil diperbarui!' : 'Data RT berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setLoading(true);
    const res = await deleteRt(selectedItem.id_rt);
    setLoading(false);
    if (res?.success) {
      toast.success('Data RT berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  const rwOptions = rwList.map((r) => ({
    value: r.id_rw,
    label: `${r.nama_rw} — ${r.dusun.nama_dusun} / ${r.dusun.desa.nama_desa}`,
  }));

  const columns = [
    { key: 'kode_rt', header: 'Kode RT' },
    { key: 'nama_rt', header: 'Nama RT' },
    {
      key: 'rw',
      header: 'RW / Dusun / Desa',
      render: (item: RtItem) => (
        <div>
          <div className="font-medium text-gray-800">{item.rw.nama_rw}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={10} />
            {item.rw.dusun.nama_dusun}, {item.rw.dusun.desa.nama_desa}
          </div>
        </div>
      ),
    },
    { key: 'ketua_rt', header: 'Ketua RT', render: (item: RtItem) => item.ketua_rt || '-' },
    {
      key: 'stats',
      header: 'KK / Jiwa',
      render: (item: RtItem) => (
        <div className="text-xs text-center">
          {item.jumlah_kk != null ? (
            <div className="flex items-center gap-1 text-gray-700">
              <Users size={12} />
              <span>{item.jumlah_kk} KK</span>
              {item.jumlah_jiwa && <span className="text-gray-400">/ {item.jumlah_jiwa} jiwa</span>}
            </div>
          ) : '-'}
        </div>
      ),
    },
    {
      key: 'status_aktif',
      header: 'Status',
      render: (item: RtItem) => (
        <Badge variant={item.status_aktif ? 'success' : 'danger'}>
          {item.status_aktif ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item: RtItem) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenForm(item)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Master RT (Rukun Tetangga)"
        description="Kelola data Rukun Tetangga berdasarkan RW."
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Data RT' : 'Tambah Data RT'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <Select
            label="RW"
            value={formData.id_rw}
            onChange={(e) => setFormData({ ...formData, id_rw: e.target.value })}
            required
            options={[{ value: '', label: '-- Pilih RW --' }, ...rwOptions]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode RT" value={formData.kode_rt} onChange={(e) => setFormData({ ...formData, kode_rt: e.target.value })} required placeholder="001" maxLength={10} />
            <Input label="Nama RT" value={formData.nama_rt} onChange={(e) => setFormData({ ...formData, nama_rt: e.target.value })} required placeholder="RT 001" />
          </div>
          <Input label="Ketua RT" value={formData.ketua_rt} onChange={(e) => setFormData({ ...formData, ketua_rt: e.target.value })} placeholder="Nama ketua RT (opsional)" />
          <Input label="No. HP Ketua" value={formData.no_hp} onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })} placeholder="08xxxxxxxxxx" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Jumlah KK" type="number" value={formData.jumlah_kk} onChange={(e) => setFormData({ ...formData, jumlah_kk: e.target.value })} placeholder="0" />
            <Input label="Jumlah Jiwa" type="number" value={formData.jumlah_jiwa} onChange={(e) => setFormData({ ...formData, jumlah_jiwa: e.target.value })} placeholder="0" />
          </div>
          {selectedItem && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rt_status" checked={formData.status_aktif} onChange={(e) => setFormData({ ...formData, status_aktif: e.target.checked })} className="rounded border-gray-300 text-green-700 focus:ring-green-700" />
              <label htmlFor="rt_status" className="text-sm font-medium text-gray-700">Status Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Data RT"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama_rt}</strong>?
        </p>
      </Modal>
    </div>
  );
}
