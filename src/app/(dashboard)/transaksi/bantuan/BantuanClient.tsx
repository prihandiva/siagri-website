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
import { createBantuan, updateBantuan, deleteBantuan } from './actions';

export default function BantuanClient({ 
  initialData, 
  options 
}: { 
  initialData: any[],
  options: { petani: any[], poktan: any[] } 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    id_poktan: '',
    id_petani: '',
    nama_bantuan: '',
    jenis_bantuan: 'PUPUK',
    sumber_dana: '',
    nilai_bantuan: '',
    volume: '',
    satuan: '',
    tanggal_pengajuan: '',
    tanggal_distribusi: '',
    status_distribusi: 'DIAJUKAN',
    catatan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const poktanOpts = [
    { label: '-- Tidak Ada --', value: '' },
    ...options.poktan.map(p => ({ label: p.nama_poktan, value: p.id_poktan }))
  ];

  const petaniOpts = [
    { label: '-- Tidak Ada --', value: '' },
    ...options.petani.map(p => ({ label: p.nama_lengkap, value: p.id_petani }))
  ];

  const jenisOpts = [
    { label: 'Pupuk', value: 'PUPUK' },
    { label: 'Benih', value: 'BENIH' },
    { label: 'Alsintan', value: 'ALSINTAN' },
    { label: 'Modal', value: 'MODAL' },
    { label: 'Infrastruktur', value: 'INFRASTRUKTUR' },
    { label: 'Lainnya', value: 'LAINNYA' },
  ];

  const statusOpts = [
    { label: 'Diajukan', value: 'DIAJUKAN' },
    { label: 'Disetujui', value: 'DISETUJUI' },
    { label: 'Didistribusikan', value: 'DIDISTRIBUSIKAN' },
    { label: 'Ditolak', value: 'DITOLAK' },
  ];

  const sumberOpts = [
    { label: '-- Pilih Sumber --', value: '' },
    { label: 'APBN', value: 'APBN' },
    { label: 'APBD Provinsi', value: 'APBD_PROV' },
    { label: 'APBD Kabupaten', value: 'APBD_KAB' },
    { label: 'Swasta / CSR', value: 'SWASTA' },
  ];

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.nama_bantuan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.jenis_bantuan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.petani?.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_poktan: item.id_poktan?.toString() || '',
        id_petani: item.id_petani?.toString() || '',
        nama_bantuan: item.nama_bantuan || '',
        jenis_bantuan: item.jenis_bantuan || 'PUPUK',
        sumber_dana: item.sumber_dana || '',
        nilai_bantuan: item.nilai_bantuan?.toString() || '',
        volume: item.volume?.toString() || '',
        satuan: item.satuan || '',
        tanggal_pengajuan: item.tanggal_pengajuan ? new Date(item.tanggal_pengajuan).toISOString().split('T')[0] : '',
        tanggal_distribusi: item.tanggal_distribusi ? new Date(item.tanggal_distribusi).toISOString().split('T')[0] : '',
        status_distribusi: item.status_distribusi || 'DIAJUKAN',
        catatan: item.catatan || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_poktan: '',
        id_petani: '',
        nama_bantuan: '',
        jenis_bantuan: 'PUPUK',
        sumber_dana: '',
        nilai_bantuan: '',
        volume: '',
        satuan: '',
        tanggal_pengajuan: new Date().toISOString().split('T')[0],
        tanggal_distribusi: '',
        status_distribusi: 'DIAJUKAN',
        catatan: '',
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
      res = await updateBantuan(selectedItem.id_bantuan, formData);
    } else {
      res = await createBantuan(formData);
    }

    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data bantuan diperbarui!' : 'Bantuan berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteBantuan(selectedItem.id_bantuan);
    setLoading(false);
    if (res?.success) {
      toast.success('Data bantuan berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  const getStatusVariant = (status: string) => {
    const map: any = { DIAJUKAN: 'warning', DISETUJUI: 'info', DIDISTRIBUSIKAN: 'success', DITOLAK: 'danger' };
    return map[status] || 'gray';
  };

  const columns = [
    { key: 'nama_bantuan', header: 'Program Bantuan', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.nama_bantuan}</div>
        <div className="text-xs text-gray-500">{item.jenis_bantuan} · {item.sumber_dana || '-'}</div>
      </div>
    )},
    { key: 'penerima', header: 'Penerima', render: (item: any) => (
      <div>
        {item.petani ? (
          <div>
            <div className="font-medium">{item.petani.nama_lengkap}</div>
            <div className="text-xs text-gray-500">{item.petani.desa?.nama_desa || 'Petani'}</div>
          </div>
        ) : item.id_poktan ? (
          <div className="text-sm text-gray-500">Poktan ID: {item.id_poktan}</div>
        ) : (
          <span className="text-xs text-gray-400 italic">-</span>
        )}
      </div>
    )},
    { key: 'volume', header: 'Volume', render: (item: any) => (
      <div>
        <div className="font-medium">{item.volume || '-'} {item.satuan || ''}</div>
        {item.nilai_bantuan && <div className="text-xs text-gray-500">Rp {Number(item.nilai_bantuan).toLocaleString('id-ID')}</div>}
      </div>
    )},
    { key: 'tanggal_distribusi', header: 'Distribusi', render: (item: any) => 
      item.tanggal_distribusi ? new Date(item.tanggal_distribusi).toLocaleDateString('id-ID') : '-'
    },
    { key: 'status_distribusi', header: 'Status', render: (item: any) => (
      <Badge variant={getStatusVariant(item.status_distribusi)}>{item.status_distribusi?.replace('_', ' ')}</Badge>
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
        title="Data Bantuan Pertanian"
        description="Kelola penyaluran bantuan kepada petani atau kelompok tani."
        data={filteredData}
        columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Data Bantuan" : "Tambah Data Bantuan"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="bantuan-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nama Program Bantuan" 
              value={formData.nama_bantuan} 
              onChange={e => setFormData({...formData, nama_bantuan: e.target.value})}
              required
              placeholder="Contoh: Bantuan Pupuk Subsidi"
            />
            <Select 
              label="Jenis Bantuan" 
              options={jenisOpts}
              value={formData.jenis_bantuan}
              onChange={e => setFormData({...formData, jenis_bantuan: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Sumber Dana" 
              options={sumberOpts}
              value={formData.sumber_dana}
              onChange={e => setFormData({...formData, sumber_dana: e.target.value})}
            />
            <Input 
              label="Nilai Bantuan (Rp)" 
              type="number"
              value={formData.nilai_bantuan} 
              onChange={e => setFormData({...formData, nilai_bantuan: e.target.value})}
              placeholder="Contoh: 5000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Volume" 
              type="number" step="0.01"
              value={formData.volume} 
              onChange={e => setFormData({...formData, volume: e.target.value})}
              placeholder="Contoh: 50"
            />
            <Input 
              label="Satuan" 
              value={formData.satuan} 
              onChange={e => setFormData({...formData, satuan: e.target.value})}
              placeholder="Contoh: Kg, Liter, Unit"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Tanggal Pengajuan" 
              type="date"
              value={formData.tanggal_pengajuan} 
              onChange={e => setFormData({...formData, tanggal_pengajuan: e.target.value})}
            />
            <Input 
              label="Tanggal Distribusi" 
              type="date"
              value={formData.tanggal_distribusi} 
              onChange={e => setFormData({...formData, tanggal_distribusi: e.target.value})}
            />
          </div>

          <Select 
            label="Status Distribusi" 
            options={statusOpts}
            value={formData.status_distribusi}
            onChange={e => setFormData({...formData, status_distribusi: e.target.value})}
            required
          />

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Penerima Bantuan (pilih salah satu)</p>
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Poktan Penerima" 
                options={poktanOpts}
                value={formData.id_poktan}
                onChange={e => setFormData({...formData, id_poktan: e.target.value, id_petani: ''})}
                disabled={!!formData.id_petani}
              />
              <Select 
                label="Petani Penerima" 
                options={petaniOpts}
                value={formData.id_petani}
                onChange={e => setFormData({...formData, id_petani: e.target.value, id_poktan: ''})}
                disabled={!!formData.id_poktan}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Catatan (opsional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
              rows={2}
              value={formData.catatan}
              onChange={e => setFormData({...formData, catatan: e.target.value})}
              placeholder="Keterangan tambahan..."
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Data Bantuan"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus data bantuan <strong>{selectedItem?.nama_bantuan}</strong>?
        </p>
      </Modal>
    </div>
  );
}
