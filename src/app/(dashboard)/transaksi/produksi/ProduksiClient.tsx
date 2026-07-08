'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';
import { createProduksi, updateProduksi, deleteProduksi, verifyProduksi } from './actions';

export default function ProduksiClient({ 
  initialData, 
  options 
}: { 
  initialData: any[],
  options: { lahan: any[], komoditas: any[], petani: any[] } 
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Sesuai field schema trx_produksi
  const [formData, setFormData] = useState({ 
    id_lahan: '',
    id_komoditas: '',
    musim_tanam: '',
    tanggal_tanam: '', 
    tanggal_panen: '', 
    luas_tanam: '',
    luas_panen: '',
    produksi: '',       // field di schema: produksi (bukan jumlah_produksi)
    harga_jual: '',
    keterangan: '',
    status_verifikasi: 'DRAFT',
  });
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyCatatan, setVerifyCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Guard agar tidak crash jika options undefined
  const lahanList = options?.lahan ?? [];
  const komoditasList = options?.komoditas ?? [];

  const lahanOpts = lahanList.map((l: any) => ({ 
    label: `${l.kode_lahan}${l.nama_lahan ? ` — ${l.nama_lahan}` : ''}${l.petani?.nama_lengkap ? ` (${l.petani.nama_lengkap})` : ''}`, 
    value: l.id_lahan 
  }));

  const komoditasOpts = komoditasList.map((k: any) => ({
    label: `${k.nama_komoditas}${k.satuan ? ` (${k.satuan})` : ''}`,
    value: k.id_komoditas
  }));

  const musimOpts = [
    { label: '-- Pilih Musim --', value: '' },
    { label: 'Musim Hujan (MH)', value: 'MH' },
    { label: 'Musim Kemarau 1 (MK1)', value: 'MK1' },
    { label: 'Musim Kemarau 2 (MK2)', value: 'MK2' },
    { label: 'Sepanjang Tahun', value: 'SEPANJANG_TAHUN' },
  ];

  const statusVerifikasiOpts = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Verified', value: 'VERIFIED' },
    { label: 'Validated', value: 'VALIDATED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      (item.komoditas?.nama_komoditas || '').toLowerCase().includes(term) ||
      (item.petani?.nama_lengkap || '').toLowerCase().includes(term) ||
      (item.lahan?.kode_lahan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError('');
    if (item) {
      setSelectedItem(item);
      setFormData({
        id_lahan: item.id_lahan?.toString() || '',
        id_komoditas: item.id_komoditas?.toString() || '',
        musim_tanam: item.musim_tanam || '',
        tanggal_tanam: item.tanggal_tanam ? new Date(item.tanggal_tanam).toISOString().split('T')[0] : '',
        tanggal_panen: item.tanggal_panen ? new Date(item.tanggal_panen).toISOString().split('T')[0] : '',
        luas_tanam: item.luas_tanam?.toString() || '',
        luas_panen: item.luas_panen?.toString() || '',
        produksi: item.produksi?.toString() || '',
        harga_jual: item.harga_jual?.toString() || '',
        keterangan: item.keterangan || '',
        status_verifikasi: item.status_verifikasi || 'DRAFT',
      });
    } else {
      setSelectedItem(null);
      setFormData({ 
        id_lahan: lahanOpts.length > 0 ? lahanOpts[0].value.toString() : '',
        id_komoditas: komoditasOpts.length > 0 ? komoditasOpts[0].value.toString() : '',
        musim_tanam: '',
        tanggal_tanam: '', 
        tanggal_panen: '', 
        luas_tanam: '',
        luas_panen: '',
        produksi: '',
        harga_jual: '',
        keterangan: '',
        status_verifikasi: 'DRAFT',
      });
    }
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleOpenVerify = (item: any) => {
    setSelectedItem(item);
    setVerifyStatus('VERIFIED');
    setVerifyCatatan(item.catatan_verifikasi || '');
    setIsVerifyOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let res;
    if (selectedItem) {
      res = await updateProduksi(selectedItem.id_produksi, formData);
    } else {
      res = await createProduksi(formData);
    }

    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data produksi diperbarui!' : 'Produksi berhasil ditambahkan!');
      setIsFormOpen(false);
    } else {
      setError(res?.error || 'Terjadi kesalahan.');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteProduksi(selectedItem.id_produksi);
    setLoading(false);
    if (res?.success) {
      toast.success('Data produksi berhasil dihapus!');
      setIsDeleteOpen(false);
    } else {
      toast.error(res?.error || 'Gagal menghapus data.');
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    const res = await verifyProduksi(selectedItem.id_produksi, verifyStatus, verifyCatatan);
    setLoading(false);
    if (res?.success) {
      toast.success('Status verifikasi berhasil diperbarui!');
      setIsVerifyOpen(false);
    } else {
      toast.error(res?.error || 'Gagal memverifikasi data.');
    }
  };

  const getStatusVariant = (status: string) => {
    const map: any = { DRAFT: 'gray', SUBMITTED: 'warning', VERIFIED: 'info', VALIDATED: 'success', REJECTED: 'danger' };
    return map[status] || 'gray';
  };

  const columns = [
    { key: 'tanam', header: 'Musim / Tanam', render: (item: any) => (
      <div>
        <div className="font-medium">{item.musim_tanam || '-'} {item.tahun ? `(${item.tahun})` : ''}</div>
        <div className="text-xs text-gray-500">
          {item.tanggal_tanam ? new Date(item.tanggal_tanam).toLocaleDateString('id-ID') : 'Tanam: -'}
          {item.tanggal_panen ? ` → ${new Date(item.tanggal_panen).toLocaleDateString('id-ID')}` : ''}
        </div>
      </div>
    )},
    { key: 'komoditas', header: 'Komoditas', render: (item: any) => (
      <div>
        <div className="font-medium text-[#1B5E20]">{item.komoditas?.nama_komoditas || '-'}</div>
        <div className="text-xs text-gray-500">{item.komoditas?.subsektor || ''}</div>
      </div>
    )},
    { key: 'petani', header: 'Petani / Lahan', render: (item: any) => (
      <div>
        <div className="font-medium">{item.petani?.nama_lengkap || item.lahan?.petani?.nama_lengkap || '-'}</div>
        <div className="text-xs text-gray-500">{item.lahan?.kode_lahan || '-'}</div>
      </div>
    )},
    { key: 'produksi', header: 'Produksi', render: (item: any) => (
      <div>
        {item.produksi ? (
          <>
            <div className="font-medium text-blue-700">{Number(item.produksi).toFixed(2)} {item.komoditas?.satuan || ''}</div>
            {item.produktivitas && <div className="text-xs text-gray-500">{Number(item.produktivitas).toFixed(2)} /Ha</div>}
          </>
        ) : <span className="text-gray-400 text-xs italic">Belum Panen</span>}
      </div>
    )},
    { key: 'status', header: 'Status', render: (item: any) => (
      <Badge variant={getStatusVariant(item.status_verifikasi)}>{item.status_verifikasi || 'DRAFT'}</Badge>
    )},
    {
      key: 'aksi', header: 'Aksi',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenVerify(item)} className="text-green-600 hover:text-green-800 p-1 bg-green-50 rounded" title="Verifikasi">
            <CheckCircle className="w-4 h-4" />
          </button>
          <button onClick={() => handleOpenForm(item)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleOpenDelete(item)} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded" title="Hapus">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Data Transaksi Produksi"
        description="Kelola dan verifikasi data tanam dan panen komoditas."
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
        title={selectedItem ? "Edit Data Produksi" : "Tambah Data Produksi"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </>
        }
      >
        <form id="produksi-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Lahan" 
              options={lahanOpts}
              value={formData.id_lahan}
              onChange={e => setFormData({...formData, id_lahan: e.target.value})}
              required
              placeholder="Pilih Lahan"
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

          <Select 
            label="Musim Tanam" 
            options={musimOpts}
            value={formData.musim_tanam}
            onChange={e => setFormData({...formData, musim_tanam: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Tanggal Tanam" 
              type="date"
              value={formData.tanggal_tanam} 
              onChange={e => setFormData({...formData, tanggal_tanam: e.target.value})}
              required
            />
            <Input 
              label="Tanggal Panen (opsional)" 
              type="date"
              value={formData.tanggal_panen} 
              onChange={e => setFormData({...formData, tanggal_panen: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Luas Tanam (Ha)" 
              type="number" step="0.01"
              value={formData.luas_tanam} 
              onChange={e => setFormData({...formData, luas_tanam: e.target.value})}
            />
            <Input 
              label="Luas Panen (Ha)" 
              type="number" step="0.01"
              value={formData.luas_panen} 
              onChange={e => setFormData({...formData, luas_panen: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Jumlah Produksi (Hasil Panen)" 
              type="number" step="0.01"
              value={formData.produksi} 
              onChange={e => setFormData({...formData, produksi: e.target.value})}
              placeholder="Dalam satuan komoditas"
            />
            <Input 
              label="Harga Jual per Satuan (Rp)" 
              type="number"
              value={formData.harga_jual} 
              onChange={e => setFormData({...formData, harga_jual: e.target.value})}
              placeholder="Contoh: 8000"
            />
          </div>

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

      {/* Verify Modal */}
      <Modal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        title="Verifikasi Data Produksi"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsVerifyOpen(false)}>Batal</Button>
            <Button onClick={handleVerify} isLoading={loading}>Simpan Verifikasi</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Memverifikasi produksi <strong>{selectedItem?.komoditas?.nama_komoditas}</strong> dari{' '}
            <strong>{selectedItem?.petani?.nama_lengkap || selectedItem?.lahan?.petani?.nama_lengkap}</strong>.
          </p>
          <Select 
            label="Status Verifikasi" 
            options={statusVerifikasiOpts}
            value={verifyStatus}
            onChange={e => setVerifyStatus(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Catatan (wajib jika ditolak)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
              rows={3}
              value={verifyCatatan}
              onChange={e => setVerifyCatatan(e.target.value)}
              placeholder="Alasan penolakan atau catatan verifikator"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Data Produksi"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus data produksi <strong>{selectedItem?.komoditas?.nama_komoditas}</strong>?
        </p>
      </Modal>
    </div>
  );
}
