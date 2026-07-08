'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2 } from 'lucide-react';
import { createPemasaran, updatePemasaran, deletePemasaran } from './actions';

export default function PemasaranClient({ 
  initialData, 
  options 
}: { 
  initialData: any[],
  options: { petani: any[], komoditas: any[] } 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    id_petani: '',
    id_komoditas: '',
    tujuan_pasar: '',
    nama_pembeli: '',
    volume: '',
    satuan: '',
    harga_jual: '',
    tanggal: '',
    keterangan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Guard: pastikan options tidak undefined
  const petaniList = options?.petani ?? [];
  const komoditasList = options?.komoditas ?? [];

  const petaniOpts = petaniList.map((p: any) => ({ 
    label: `${p.nama_lengkap}${p.desa ? ` — ${p.desa.nama_desa}` : ''}`, 
    value: p.id_petani 
  }));

  const komoditasOpts = komoditasList.map((k: any) => ({ 
    label: `${k.nama_komoditas}${k.satuan ? ` (${k.satuan})` : ''}`, 
    value: k.id_komoditas 
  }));

  const tujuanOpts = [
    { label: '-- Pilih Tujuan --', value: '' },
    { label: 'Pasar Desa', value: 'Pasar Desa' },
    { label: 'Pasar Kecamatan', value: 'Pasar Kecamatan' },
    { label: 'Pasar Induk', value: 'Pasar Induk' },
    { label: 'Ekspor', value: 'Ekspor' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      (item.nama_pembeli || '').toLowerCase().includes(term) ||
      (item.petani?.nama_lengkap || '').toLowerCase().includes(term) ||
      (item.komoditas?.nama_komoditas || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_petani: item.id_petani?.toString() || '',
        id_komoditas: item.id_komoditas?.toString() || '',
        tujuan_pasar: item.tujuan_pasar || '',
        nama_pembeli: item.nama_pembeli || '',
        volume: item.volume?.toString() || '',
        satuan: item.satuan || '',
        harga_jual: item.harga_jual?.toString() || '',
        tanggal: item.tanggal ? new Date(item.tanggal).toISOString().split('T')[0] : '',
        keterangan: item.keterangan || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_petani: petaniOpts.length > 0 ? petaniOpts[0].value.toString() : '',
        id_komoditas: komoditasOpts.length > 0 ? komoditasOpts[0].value.toString() : '',
        tujuan_pasar: '',
        nama_pembeli: '',
        volume: '',
        satuan: '',
        harga_jual: '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
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
      res = await updatePemasaran(selectedItem.id_pemasaran, formData);
    } else {
      res = await createPemasaran(formData);
    }

    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data pemasaran diperbarui!' : 'Pemasaran berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePemasaran(selectedItem.id_pemasaran);
    setLoading(false);
    if (res?.success) {
      toast.success('Data pemasaran berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  const formatRp = (val: any) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  const columns = [
    { key: 'tanggal', header: 'Tanggal', render: (item: any) => 
      item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'
    },
    { key: 'petani', header: 'Petani', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.petani?.nama_lengkap || '-'}</div>
        <div className="text-xs text-gray-500">{item.petani?.desa?.nama_desa || ''}</div>
      </div>
    )},
    { key: 'komoditas', header: 'Komoditas', render: (item: any) => (
      <div>
        <div className="font-medium">{item.komoditas?.nama_komoditas || '-'}</div>
        <div className="text-xs text-gray-500">{item.volume || ''} {item.satuan || item.komoditas?.satuan || ''}</div>
      </div>
    )},
    { key: 'pembeli', header: 'Pembeli / Tujuan', render: (item: any) => (
      <div>
        <div className="font-medium">{item.nama_pembeli || '-'}</div>
        <div className="text-xs text-gray-500">{item.tujuan_pasar || '-'}</div>
      </div>
    )},
    { key: 'nilai', header: 'Nilai Transaksi', render: (item: any) => (
      <div>
        <div className="font-semibold text-green-700">{formatRp(item.nilai_total)}</div>
        <div className="text-xs text-gray-500">{formatRp(item.harga_jual)}/satuan</div>
      </div>
    )},
    {
      key: 'aksi', header: 'Aksi',
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
        title="Data Pemasaran"
        description="Kelola data transaksi penjualan komoditas pertanian."
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Pemasaran" : "Tambah Pemasaran"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="pemasaran-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Petani Penjual" 
              options={petaniOpts}
              value={formData.id_petani}
              onChange={e => setFormData({...formData, id_petani: e.target.value})}
              required
              placeholder="Pilih Petani"
            />
            <Select 
              label="Komoditas" 
              options={komoditasOpts}
              value={formData.id_komoditas}
              onChange={e => setFormData({...formData, id_komoditas: e.target.value})}
              required
              placeholder="Pilih Komoditas"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nama Pembeli" 
              value={formData.nama_pembeli} 
              onChange={e => setFormData({...formData, nama_pembeli: e.target.value})}
              placeholder="Contoh: Tengkulak / CV Maju Jaya"
            />
            <Select 
              label="Tujuan Pasar" 
              options={tujuanOpts}
              value={formData.tujuan_pasar}
              onChange={e => setFormData({...formData, tujuan_pasar: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Volume" 
              type="number" step="0.01"
              value={formData.volume} 
              onChange={e => setFormData({...formData, volume: e.target.value})}
              required
              placeholder="Contoh: 500"
            />
            <Input 
              label="Satuan" 
              value={formData.satuan} 
              onChange={e => setFormData({...formData, satuan: e.target.value})}
              placeholder="Contoh: Kg"
            />
            <Input 
              label="Harga Jual (Rp/satuan)" 
              type="number"
              value={formData.harga_jual} 
              onChange={e => setFormData({...formData, harga_jual: e.target.value})}
              required
              placeholder="Contoh: 8000"
            />
          </div>

          <Input 
            label="Tanggal Transaksi" 
            type="date"
            value={formData.tanggal} 
            onChange={e => setFormData({...formData, tanggal: e.target.value})}
          />

          {formData.volume && formData.harga_jual && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">Total Nilai Transaksi:</div>
              <div className="text-xl font-bold text-green-900">
                {formatRp(parseFloat(formData.volume || '0') * parseFloat(formData.harga_jual || '0'))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Keterangan (opsional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
              rows={2}
              value={formData.keterangan}
              onChange={e => setFormData({...formData, keterangan: e.target.value})}
              placeholder="Catatan tambahan..."
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Data Pemasaran"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus data pemasaran ke <strong>{selectedItem?.nama_pembeli}</strong>?
        </p>
      </Modal>
    </div>
  );
}
