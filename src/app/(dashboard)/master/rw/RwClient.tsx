'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { createRw, updateRw, deleteRw } from './actions';

type RwItem = {
  id_rw: string;
  id_dusun: string;
  kode_rw: string;
  nama_rw: string;
  ketua_rw: string | null;
  no_hp: string | null;
  jumlah_rt: number | null;
  status_aktif: boolean;
  dusun: {
    nama_dusun: string;
    desa: {
      nama_desa: string;
      kecamatan: {
        nama_kecamatan: string;
        kabupaten: { nama_kabupaten: string };
      };
    };
  };
};

const emptyForm = {
  id_dusun: '',
  kode_rw: '',
  nama_rw: '',
  ketua_rw: '',
  no_hp: '',
  jumlah_rt: '',
  status_aktif: true,
};

export default function RwClient({
  initialData,
  dusunList,
}: {
  initialData: RwItem[];
  dusunList: any[];
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RwItem | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredData = useMemo(() =>
    data.filter((item) =>
      item.nama_rw.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_rw.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dusun.nama_dusun.toLowerCase().includes(searchTerm.toLowerCase())
    ), [data, searchTerm]);

  const handleOpenForm = (item?: RwItem) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_dusun: item.id_dusun,
        kode_rw: item.kode_rw,
        nama_rw: item.nama_rw,
        ketua_rw: item.ketua_rw || '',
        no_hp: item.no_hp || '',
        jumlah_rt: item.jumlah_rt?.toString() || '',
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
      ...formData,
      jumlah_rt: formData.jumlah_rt ? parseInt(formData.jumlah_rt) : undefined,
    };
    const res = selectedItem
      ? await updateRw(selectedItem.id_rw, { ...payload, status_aktif: formData.status_aktif })
      : await createRw(payload);
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data RW berhasil diperbarui!' : 'Data RW berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setLoading(true);
    const res = await deleteRw(selectedItem.id_rw);
    setLoading(false);
    if (res?.success) {
      toast.success('Data RW berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  const dusunOptions = dusunList.map((d) => ({
    value: d.id_dusun,
    label: `${d.nama_dusun} — ${d.desa.nama_desa}`,
  }));

  const columns = [
    { key: 'kode_rw', header: 'Kode RW' },
    { key: 'nama_rw', header: 'Nama RW' },
    {
      key: 'dusun',
      header: 'Dusun / Desa',
      render: (item: RwItem) => (
        <div>
          <div className="font-medium text-gray-800">{item.dusun.nama_dusun}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={10} />
            {item.dusun.desa.nama_desa}, {item.dusun.desa.kecamatan.nama_kecamatan}
          </div>
        </div>
      ),
    },
    { key: 'ketua_rw',  header: 'Ketua RW',  render: (item: RwItem) => item.ketua_rw  || '-' },
    { key: 'jumlah_rt', header: 'Jml RT',    render: (item: RwItem) => item.jumlah_rt != null ? `${item.jumlah_rt} RT` : '-' },
    {
      key: 'status_aktif',
      header: 'Status',
      render: (item: RwItem) => (
        <Badge variant={item.status_aktif ? 'success' : 'danger'}>
          {item.status_aktif ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item: RwItem) => (
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
        title="Master RW (Rukun Warga)"
        description="Kelola data Rukun Warga berdasarkan Dusun."
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
        title={selectedItem ? 'Edit Data RW' : 'Tambah Data RW'}
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
            label="Dusun"
            value={formData.id_dusun}
            onChange={(e) => setFormData({ ...formData, id_dusun: e.target.value })}
            required
            options={[{ value: '', label: '-- Pilih Dusun --' }, ...dusunOptions]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode RW" value={formData.kode_rw} onChange={(e) => setFormData({ ...formData, kode_rw: e.target.value })} required placeholder="001" maxLength={10} />
            <Input label="Nama RW" value={formData.nama_rw} onChange={(e) => setFormData({ ...formData, nama_rw: e.target.value })} required placeholder="RW 001" />
          </div>
          <Input label="Ketua RW" value={formData.ketua_rw} onChange={(e) => setFormData({ ...formData, ketua_rw: e.target.value })} placeholder="Nama ketua RW (opsional)" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="No. HP Ketua" value={formData.no_hp} onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })} placeholder="08xxxxxxxxxx" />
            <Input label="Jumlah RT" type="number" value={formData.jumlah_rt} onChange={(e) => setFormData({ ...formData, jumlah_rt: e.target.value })} placeholder="0" />
          </div>
          {selectedItem && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rw_status" checked={formData.status_aktif} onChange={(e) => setFormData({ ...formData, status_aktif: e.target.checked })} className="rounded border-gray-300 text-green-700 focus:ring-green-700" />
              <label htmlFor="rw_status" className="text-sm font-medium text-gray-700">Status Aktif</label>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Data RW"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{selectedItem?.nama_rw}</strong>?
          Pastikan tidak ada data RT yang terkait.
        </p>
      </Modal>
    </div>
  );
}
