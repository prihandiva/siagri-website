'use client';

import toast from 'react-hot-toast';
import React, { useState, useMemo, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPicker } from '@/components/ui/MapPicker';
import {
  Edit2, Trash2, CheckCircle, Eye, MapPin, Camera, Calendar,
  Leaf, TrendingUp, DollarSign, Upload, X, Clock, ChevronRight
} from 'lucide-react';
import {
  createProduksi, updateProduksi, deleteProduksi, verifyProduksi,
  uploadFotoProduksi, deleteFotoProduksi
} from './actions';

type Foto = {
  id_foto: string;
  foto_path: string;
  keterangan?: string | null;
  tanggal_foto: string;
  periode?: string | null;
};

export default function ProduksiClient({
  initialData,
  options
}: {
  initialData: any[];
  options: { lahan: any[]; komoditas: any[]; satuan: any[] };
}) {
  const [data] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'data' | 'koordinat' | 'foto'>('data');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    id_lahan: '', id_komoditas: '', musim_tanam: '',
    tanggal_tanam: '', tanggal_panen: '',
    luas_tanam: '', luas_panen: '',
    produksi: '', id_satuan_produksi: '',
    harga_jual: '', id_satuan_harga: '',
    keterangan: '', status_verifikasi: 'DRAFT',
    latitude: '', longitude: '',
  });

  const [fotoList, setFotoList] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [fotoMeta, setFotoMeta] = useState<{ keterangan: string; periode: string; tanggal: string }[]>([]);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyCatatan, setVerifyCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lahanList = options?.lahan ?? [];
  const komoditasList = options?.komoditas ?? [];
  const satuanList = options?.satuan ?? [];

  const satuanOpts = satuanList.map((s: any) => ({ label: `${s.nama_satuan} (${s.simbol})`, value: s.id_satuan }));
  const lahanOpts = lahanList.map((l: any) => ({
    label: `${l.kode_lahan}${l.nama_lahan ? ' — ' + l.nama_lahan : ''}${l.petani?.nama_lengkap ? ' (' + l.petani.nama_lengkap + ')' : ''}`,
    value: l.id_lahan
  }));
  const komoditasOpts = komoditasList.map((k: any) => ({
    label: `${k.nama_komoditas}${k.satuan_rel?.simbol ? ' (' + k.satuan_rel.simbol + ')' : ''}`,
    value: k.id_komoditas
  }));
  const musimOpts = [
    { label: '-- Pilih Musim --', value: '' },
    { label: 'Musim Hujan (MH)', value: 'MH' },
    { label: 'Musim Kemarau 1 (MK1)', value: 'MK1' },
    { label: 'Musim Kemarau 2 (MK2)', value: 'MK2' },
    { label: 'Sepanjang Tahun', value: 'SEPANJANG_TAHUN' },
  ];
  const statusOpts = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Verified', value: 'VERIFIED' },
    { label: 'Validated', value: 'VALIDATED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  const selectedLahan = lahanList.find((l: any) => String(l.id_lahan) === String(formData.id_lahan));

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item: any) =>
      (item.komoditas?.nama_komoditas || '').toLowerCase().includes(term) ||
      (item.petani?.nama_lengkap || '').toLowerCase().includes(term) ||
      (item.lahan?.kode_lahan || '').toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleOpenForm = (item?: any) => {
    setError(''); setActiveTab('data');
    setFotoList([]); setFotoPreviews([]); setFotoMeta([]);
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
        id_satuan_produksi: item.id_satuan_produksi?.toString() || '',
        harga_jual: item.harga_jual?.toString() || '',
        id_satuan_harga: item.id_satuan_harga?.toString() || '',
        keterangan: item.keterangan || '',
        status_verifikasi: item.status_verifikasi || 'DRAFT',
        latitude: item.lahan?.latitude?.toString() || '',
        longitude: item.lahan?.longitude?.toString() || '',
      });
    } else {
      setSelectedItem(null);
      const fl = lahanList[0];
      setFormData({
        id_lahan: fl ? String(fl.id_lahan) : '',
        id_komoditas: komoditasList[0] ? String(komoditasList[0].id_komoditas) : '',
        musim_tanam: '', tanggal_tanam: '', tanggal_panen: '',
        luas_tanam: '', luas_panen: '', produksi: '',
        id_satuan_produksi: satuanList[0] ? String(satuanList[0].id_satuan) : '',
        harga_jual: '',
        id_satuan_harga: satuanList[0] ? String(satuanList[0].id_satuan) : '',
        keterangan: '', status_verifikasi: 'DRAFT',
        latitude: fl?.latitude?.toString() || '',
        longitude: fl?.longitude?.toString() || '',
      });
    }
    setIsFormOpen(true);
  };

  const handleLahanChange = (id: string) => {
    const lahan = lahanList.find((l: any) => String(l.id_lahan) === id);
    setFormData(prev => ({ ...prev, id_lahan: id, latitude: lahan?.latitude?.toString() || '', longitude: lahan?.longitude?.toString() || '' }));
  };

  const handleMapChange = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
  }, []);

  const handleAddFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFotoList(prev => [...prev, ...files]);
    setFotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setFotoMeta(prev => [...prev, ...files.map(() => ({ keterangan: '', periode: '', tanggal: new Date().toISOString().split('T')[0] }))]);
    e.target.value = '';
  };

  const handleRemoveFoto = (idx: number) => {
    URL.revokeObjectURL(fotoPreviews[idx]);
    setFotoList(prev => prev.filter((_, i) => i !== idx));
    setFotoPreviews(prev => prev.filter((_, i) => i !== idx));
    setFotoMeta(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadAllFotos = async (id_produksi: string) => {
    for (let i = 0; i < fotoList.length; i++) {
      const fd = new FormData();
      fd.append('file', fotoList[i]);
      const res = await fetch('/api/upload/produksi-foto', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success && json.path) {
        await uploadFotoProduksi({
          id_produksi,
          foto_path: json.path,
          keterangan: fotoMeta[i]?.keterangan || undefined,
          tanggal_foto: fotoMeta[i]?.tanggal || new Date().toISOString().split('T')[0],
          periode: fotoMeta[i]?.periode || undefined,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    let res: any;
    if (selectedItem) {
      res = await updateProduksi(selectedItem.id_produksi, formData);
      if (res?.success && fotoList.length > 0) { setUploadingFoto(true); await uploadAllFotos(selectedItem.id_produksi); setUploadingFoto(false); }
    } else {
      res = await createProduksi(formData);
      if (res?.success && res.id_produksi && fotoList.length > 0) { setUploadingFoto(true); await uploadAllFotos(res.id_produksi); setUploadingFoto(false); }
    }
    setLoading(false);
    if (res?.success) {
      toast.success(selectedItem ? 'Data produksi diperbarui!' : 'Produksi berhasil ditambahkan!');
      setIsFormOpen(false);
      window.location.reload();
    } else { setError(res?.error || 'Terjadi kesalahan.'); }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteProduksi(selectedItem.id_produksi);
    setLoading(false);
    if (res?.success) { toast.success('Data produksi berhasil dihapus!'); setIsDeleteOpen(false); window.location.reload(); }
    else toast.error(res?.error || 'Gagal menghapus data.');
  };

  const handleVerify = async () => {
    setLoading(true);
    const res = await verifyProduksi(selectedItem.id_produksi, verifyStatus, verifyCatatan);
    setLoading(false);
    if (res?.success) { toast.success('Status verifikasi diperbarui!'); setIsVerifyOpen(false); window.location.reload(); }
    else toast.error(res?.error || 'Gagal memverifikasi data.');
  };

  const getStatusVariant = (s: string) => ({ DRAFT: 'gray', SUBMITTED: 'warning', VERIFIED: 'info', VALIDATED: 'success', REJECTED: 'danger' }[s] || 'gray') as any;
  const fmt = (n: any) => n ? Number(n).toLocaleString('id-ID') : '-';
  const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

  const TABS = [
    { key: 'data', label: 'Data Produksi', icon: <Leaf size={14} /> },
    { key: 'koordinat', label: 'Titik Lahan', icon: <MapPin size={14} /> },
    { key: 'foto', label: 'Foto Berkala', icon: <Camera size={14} /> },
  ] as const;

  const columns = [
    { key: 'tanam', header: 'Musim / Periode', render: (item: any) => (
      <div>
        <div className="font-semibold text-gray-900">{item.musim_tanam || '-'} <span className="text-gray-500 font-normal">{item.tahun ? '(' + item.tahun + ')' : ''}</span></div>
        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          <Calendar size={10} />
          {item.tanggal_tanam ? new Date(item.tanggal_tanam).toLocaleDateString('id-ID') : 'Belum tanam'}
          {item.tanggal_panen ? ' → ' + new Date(item.tanggal_panen).toLocaleDateString('id-ID') : ''}
        </div>
      </div>
    )},
    { key: 'komoditas', header: 'Komoditas', render: (item: any) => (
      <div>
        <div className="font-semibold text-green-800 flex items-center gap-1"><Leaf size={12} />{item.komoditas?.nama_komoditas || '-'}</div>
        <div className="text-xs text-gray-400">{item.komoditas?.subsektor_rel?.nama_subsektor || ''}</div>
      </div>
    )},
    { key: 'petani', header: 'Petani / Lahan', render: (item: any) => (
      <div>
        <div className="font-medium text-gray-900">{item.petani?.nama_lengkap || item.lahan?.petani?.nama_lengkap || '-'}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{item.lahan?.kode_lahan || '-'}{item.lahan?.nama_lahan ? ' · ' + item.lahan.nama_lahan : ''}</div>
      </div>
    )},
    { key: 'produksi', header: 'Produksi', render: (item: any) => (
      <div>
        {item.produksi ? (
          <>
            <div className="font-semibold text-blue-700 flex items-center gap-1"><TrendingUp size={12} />{fmt(item.produksi)} {item.satuan_produksi?.simbol || item.komoditas?.satuan_rel?.simbol || ''}</div>
            {item.produktivitas && <div className="text-xs text-gray-500">{Number(item.produktivitas).toFixed(2)} /Ha</div>}
          </>
        ) : <span className="text-gray-400 text-xs italic">Belum Panen</span>}
      </div>
    )},
    { key: 'foto', header: 'Foto', render: (item: any) => (
      <div className="flex items-center gap-1"><Camera size={13} className="text-gray-400" /><span className="text-sm text-gray-600">{item.foto_berkala?.length || 0}</span></div>
    )},
    { key: 'status', header: 'Status', render: (item: any) => (
      <Badge variant={getStatusVariant(item.status_verifikasi)}>{item.status_verifikasi || 'DRAFT'}</Badge>
    )},
    { key: 'aksi', header: 'Aksi', render: (item: any) => (
      <div className="flex items-center gap-1.5">
        <button onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }} className="text-gray-600 hover:text-gray-900 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" title="Detail"><Eye size={14} /></button>
        <button onClick={() => { setSelectedItem(item); setVerifyStatus('VERIFIED'); setVerifyCatatan(item.catatan_verifikasi || ''); setIsVerifyOpen(true); }} className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Verifikasi"><CheckCircle size={14} /></button>
        <button onClick={() => handleOpenForm(item)} className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit"><Edit2 size={14} /></button>
        <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Data Transaksi Produksi"
        description="Kelola dan verifikasi data tanam, panen, dan foto berkala komoditas."
        data={filteredData} columns={columns}
        onAdd={() => handleOpenForm()}
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
      />

      {/* FORM MODAL */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Data Produksi' : 'Tambah Data Produksi'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={loading || uploadingFoto}>{uploadingFoto ? 'Mengupload Foto...' : 'Simpan'}</Button></>}
      >
        <div className="flex border-b border-gray-200 mb-5">
          {TABS.map(tab => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Lahan <span className="text-red-500">*</span></label>
                  <select value={formData.id_lahan} onChange={e => handleLahanChange(e.target.value)} required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700">
                    <option value="">Pilih Lahan</option>
                    {lahanOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Komoditas <span className="text-red-500">*</span></label>
                  <select value={formData.id_komoditas} onChange={e => setFormData({ ...formData, id_komoditas: e.target.value })} required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700">
                    <option value="">Pilih Komoditas</option>
                    {komoditasOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <Select label="Musim Tanam" options={musimOpts} value={formData.musim_tanam} onChange={e => setFormData({ ...formData, musim_tanam: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Tanggal Tanam *" type="date" value={formData.tanggal_tanam} onChange={e => setFormData({ ...formData, tanggal_tanam: e.target.value })} required />
                <Input label="Tanggal Panen (opsional)" type="date" value={formData.tanggal_panen} onChange={e => setFormData({ ...formData, tanggal_panen: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Luas Tanam (Ha)" type="number" step="0.01" value={formData.luas_tanam} onChange={e => setFormData({ ...formData, luas_tanam: e.target.value })} />
                <Input label="Luas Panen (Ha)" type="number" step="0.01" value={formData.luas_panen} onChange={e => setFormData({ ...formData, luas_panen: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><TrendingUp size={13} />Jumlah Produksi</label>
                  <div className="flex gap-2">
                    <Input type="number" step="0.01" value={formData.produksi} onChange={e => setFormData({ ...formData, produksi: e.target.value })} placeholder="0.00" />
                    <select value={formData.id_satuan_produksi} onChange={e => setFormData({ ...formData, id_satuan_produksi: e.target.value })}
                      className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:outline-none focus:border-green-700">
                      <option value="">Satuan</option>{satuanOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><DollarSign size={13} />Harga Jual (Rp)</label>
                  <div className="flex gap-2">
                    <Input type="number" value={formData.harga_jual} onChange={e => setFormData({ ...formData, harga_jual: e.target.value })} placeholder="0" />
                    <select value={formData.id_satuan_harga} onChange={e => setFormData({ ...formData, id_satuan_harga: e.target.value })}
                      className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:outline-none focus:border-green-700">
                      <option value="">Satuan</option>{satuanOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {formData.produksi && formData.luas_panen && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-800">
                  <strong>Produktivitas estimasi:</strong> {(parseFloat(formData.produksi) / parseFloat(formData.luas_panen)).toFixed(2)} {satuanList.find((s: any) => String(s.id_satuan) === formData.id_satuan_produksi)?.simbol || ''}/Ha
                  {formData.harga_jual && <span className="ml-4">· <strong>Nilai:</strong> Rp {(parseFloat(formData.produksi) * parseFloat(formData.harga_jual)).toLocaleString('id-ID')}</span>}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Keterangan</label>
                <textarea className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                  rows={2} value={formData.keterangan} onChange={e => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Catatan tambahan..." />
              </div>
              <div className="pt-2 flex justify-end">
                <button type="button" onClick={() => setActiveTab('koordinat')} className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium">
                  Lanjut: Titik Lahan <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'koordinat' && (
            <div className="space-y-4">
              {selectedLahan && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
                  <strong>Lahan:</strong> {selectedLahan.kode_lahan}{selectedLahan.nama_lahan ? ' · ' + selectedLahan.nama_lahan : ''}
                  {selectedLahan.luas_lahan && <span className="ml-2">· Luas {selectedLahan.luas_lahan} Ha</span>}
                </div>
              )}
              <p className="text-sm text-gray-600">Tentukan titik koordinat lahan. Klik peta atau geser pin untuk memindahkan lokasi. Koordinat tersimpan di data lahan.</p>
              <MapPicker latitude={formData.latitude || null} longitude={formData.longitude || null} onChange={handleMapChange} />
              <div className="pt-2 flex justify-between">
                <button type="button" onClick={() => setActiveTab('data')} className="text-sm text-gray-500 hover:text-gray-700">← Kembali</button>
                <button type="button" onClick={() => setActiveTab('foto')} className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium">Lanjut: Foto Berkala <ChevronRight size={14} /></button>
              </div>
            </div>
          )}

          {activeTab === 'foto' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                <strong>Foto Berkala:</strong> Upload foto kondisi lahan dan komoditas setiap 3 bulan. Isi periode (contoh: Jan–Mar 2024) agar mudah dipantau.
              </div>
              {selectedItem?.foto_berkala?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Foto Tersimpan ({selectedItem.foto_berkala.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedItem.foto_berkala.map((f: Foto) => (
                      <div key={f.id_foto} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={f.foto_path} alt="foto" className="w-full h-24 object-cover" onError={e => { (e.target as HTMLImageElement).src = '/globe.svg'; }} />
                        <div className="p-1.5">
                          <p className="text-xs font-medium text-gray-700 truncate">{f.periode || fmtDate(f.tanggal_foto)}</p>
                          <p className="text-[10px] text-gray-400 truncate">{f.keterangan || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer transition-colors text-sm text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50">
                <Upload size={16} /><span>Tambah Foto Baru (JPEG/PNG/WebP, maks 5MB)</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddFoto} />
              </label>
              {fotoList.length > 0 && (
                <div className="space-y-3">
                  {fotoList.map((file, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <img src={fotoPreviews[idx]} alt="preview" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-0.5">Periode</label>
                            <input type="text" placeholder="Jan–Mar 2024" value={fotoMeta[idx]?.periode || ''}
                              onChange={e => { const m = [...fotoMeta]; m[idx] = { ...m[idx], periode: e.target.value }; setFotoMeta(m); }}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-green-700" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-0.5">Tanggal Foto</label>
                            <input type="date" value={fotoMeta[idx]?.tanggal || ''}
                              onChange={e => { const m = [...fotoMeta]; m[idx] = { ...m[idx], tanggal: e.target.value }; setFotoMeta(m); }}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-green-700" />
                          </div>
                        </div>
                        <input type="text" placeholder="Keterangan foto (opsional)" value={fotoMeta[idx]?.keterangan || ''}
                          onChange={e => { const m = [...fotoMeta]; m[idx] = { ...m[idx], keterangan: e.target.value }; setFotoMeta(m); }}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-green-700" />
                      </div>
                      <button type="button" onClick={() => handleRemoveFoto(idx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <button type="button" onClick={() => setActiveTab('koordinat')} className="text-sm text-gray-500 hover:text-gray-700">← Kembali</button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* VERIFY MODAL */}
      <Modal isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} title="Verifikasi Data Produksi"
        footer={<><Button variant="ghost" onClick={() => setIsVerifyOpen(false)}>Batal</Button><Button onClick={handleVerify} isLoading={loading}>Simpan Verifikasi</Button></>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Memverifikasi produksi <strong>{selectedItem?.komoditas?.nama_komoditas}</strong> dari <strong>{selectedItem?.petani?.nama_lengkap}</strong>.</p>
          <Select label="Status Verifikasi" options={statusOpts} value={verifyStatus} onChange={e => setVerifyStatus(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Catatan (wajib jika ditolak)</label>
            <textarea className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-green-700"
              rows={3} value={verifyCatatan} onChange={e => setVerifyCatatan(e.target.value)} placeholder="Alasan penolakan atau catatan verifikator" />
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Data Produksi"
        footer={<><Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button><Button variant="danger" onClick={handleDelete} isLoading={loading}>Hapus</Button></>}>
        <p className="text-gray-600">Apakah Anda yakin ingin menghapus data produksi <strong>{selectedItem?.komoditas?.nama_komoditas}</strong>? Data tidak benar-benar dihapus dari sistem.</p>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Produksi" size="lg"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>}>
        {selectedItem && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1 flex items-center gap-1"><Leaf size={11} />Komoditas</p>
                <p className="font-bold text-green-900 text-lg">{selectedItem.komoditas?.nama_komoditas || '-'}</p>
                <p className="text-xs text-green-600">{selectedItem.komoditas?.subsektor_rel?.nama_subsektor || ''}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Petani</p>
                <p className="font-bold text-blue-900">{selectedItem.petani?.nama_lengkap || '-'}</p>
                <p className="text-xs text-blue-600">NIK: {selectedItem.petani?.nik || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { label: 'Musim / Tahun', val: `${selectedItem.musim_tanam || '-'} ${selectedItem.tahun}` },
                { label: 'Tanggal Tanam', val: fmtDate(selectedItem.tanggal_tanam) },
                { label: 'Tanggal Panen', val: fmtDate(selectedItem.tanggal_panen) },
                { label: 'Luas Tanam / Panen', val: `${selectedItem.luas_tanam || '-'} Ha / ${selectedItem.luas_panen || '-'} Ha` },
              ].map(r => (
                <div key={r.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{r.label}</p>
                  <p className="font-semibold">{r.val}</p>
                </div>
              ))}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><TrendingUp size={10} />Produksi</p>
                <p className="font-bold text-emerald-800">{fmt(selectedItem.produksi)} {selectedItem.satuan_produksi?.simbol || ''}</p>
                {selectedItem.produktivitas && <p className="text-xs text-emerald-600">{Number(selectedItem.produktivitas).toFixed(2)}/Ha</p>}
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-600 mb-1 flex items-center gap-1"><DollarSign size={10} />Nilai Produksi</p>
                <p className="font-bold text-amber-800">Rp {fmt(selectedItem.nilai_produksi)}</p>
                {selectedItem.harga_jual && <p className="text-xs text-amber-600">@ Rp {fmt(selectedItem.harga_jual)}/{selectedItem.satuan_harga?.simbol || ''}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusVariant(selectedItem.status_verifikasi)}>{selectedItem.status_verifikasi}</Badge>
              {selectedItem.keterangan && <p className="text-sm text-gray-600 italic">{selectedItem.keterangan}</p>}
            </div>

            {/* Peta */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-green-700" />Titik Lokasi Lahan</h3>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Lahan: <strong>{selectedItem.lahan?.kode_lahan}</strong>{selectedItem.lahan?.nama_lahan ? ' · ' + selectedItem.lahan.nama_lahan : ''}</p>
                {selectedItem.lahan?.latitude && selectedItem.lahan?.longitude ? (
                  <MapPicker latitude={selectedItem.lahan.latitude} longitude={selectedItem.lahan.longitude} onChange={() => {}} readOnly />
                ) : (
                  <div className="text-sm text-gray-500 italic p-4 text-center bg-white rounded-lg border border-gray-200">
                    Koordinat belum diatur. Edit data produksi untuk menambahkan titik lahan.
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Foto */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera size={16} className="text-blue-600" />Timeline Foto Berkala
                <span className="text-xs text-gray-400 font-normal ml-1">({selectedItem.foto_berkala?.length || 0} foto)</span>
              </h3>
              {selectedItem.foto_berkala?.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-blue-300 rounded-full" />
                  <div className="space-y-4">
                    {selectedItem.foto_berkala.map((foto: Foto, idx: number) => (
                      <div key={foto.id_foto} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                          <Clock size={14} className="text-green-600" />
                        </div>
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="flex">
                            <img src={foto.foto_path} alt={`foto ${idx + 1}`} className="w-32 h-28 object-cover flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).src = '/globe.svg'; }} />
                            <div className="p-3 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{foto.periode || 'Foto ' + (idx + 1)}</span>
                                <span className="text-xs text-gray-400 flex items-center gap-0.5"><Calendar size={10} />{fmtDate(foto.tanggal_foto)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{foto.keterangan || <span className="italic text-gray-400">Tidak ada keterangan</span>}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic bg-gray-50 p-6 rounded-xl text-center border border-dashed border-gray-300">
                  <Camera size={24} className="mx-auto mb-2 text-gray-300" />
                  Belum ada foto perkembangan lahan.<br />
                  <span className="text-xs">Tambahkan foto saat mengedit data produksi.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
