'use client';

import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function LaporanProduksiClient({ 
  initialData, 
  options,
  fetchDataAction
}: { 
  initialData: any[],
  options: { desa: any[], komoditas: any[] },
  fetchDataAction: (filters: any) => Promise<any[]>
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    id_desa: '',
    id_komoditas: '',
    tahun: currentYear.toString()
  });

  const desaOpts = [{ label: 'Semua Desa', value: '' }, ...options.desa.map(d => ({ label: d.nama_desa, value: d.id_desa }))];
  const komoditasOpts = [{ label: 'Semua Komoditas', value: '' }, ...options.komoditas.map(k => ({ label: k.nama_komoditas, value: k.id_komoditas }))];
  const tahunOpts = [
    { label: 'Semua Tahun', value: '' },
    { label: currentYear.toString(), value: currentYear.toString() },
    { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
    { label: (currentYear - 2).toString(), value: (currentYear - 2).toString() },
  ];

  const handleFilter = async () => {
    setLoading(true);
    const result = await fetchDataAction(filters);
    setData(result);
    setLoading(false);
  };

  const handleExportExcel = () => {
    // Siapkan data untuk excel
    const excelData = data.map((item, index) => ({
      'No': index + 1,
      'Tanggal Tanam': item.tanggal_tanam ? new Date(item.tanggal_tanam).toLocaleDateString('id-ID') : '-',
      'Tanggal Panen': item.tanggal_panen ? new Date(item.tanggal_panen).toLocaleDateString('id-ID') : '-',
      'Komoditas': item.komoditas?.nama_komoditas,
      'Subsektor': item.komoditas?.subsektor_rel?.nama_subsektor || '-',
      'Nama Petani': item.lahan?.petani?.nama_lengkap,
      'NIK': item.lahan?.petani?.nik,
      'Lokasi Lahan': `${item.lahan?.desa?.nama_desa} (Kec. ${item.lahan?.desa?.kecamatan?.nama_kecamatan})`,
      'Luas Tanam (Ha)': item.luas_tanam,
      'Luas Panen (Ha)': item.luas_panen || 0,
      'Produksi': item.jumlah_produksi || 0,
      'Satuan': item.komoditas?.satuan,
      'Produktivitas': item.produktivitas || 0,
      'Status': item.status_produksi
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan_Produksi");
    
    // Generate file dan trigger download
    XLSX.writeFile(workbook, `Laporan_Produksi_SIAGRI_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Produksi</h1>
          <p className="text-gray-500 text-sm mt-1">Laporan rekapitulasi tanam dan panen komoditas.</p>
        </div>
        <Button onClick={handleExportExcel} variant="secondary" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div className="w-48">
          <Select 
            label="Filter Desa" 
            options={desaOpts}
            value={filters.id_desa}
            onChange={e => setFilters({...filters, id_desa: e.target.value})}
          />
        </div>
        <div className="w-48">
          <Select 
            label="Filter Komoditas" 
            options={komoditasOpts}
            value={filters.id_komoditas}
            onChange={e => setFilters({...filters, id_komoditas: e.target.value})}
          />
        </div>
        <div className="w-32">
          <Select 
            label="Tahun Tanam" 
            options={tahunOpts}
            value={filters.tahun}
            onChange={e => setFilters({...filters, tahun: e.target.value})}
          />
        </div>
        <Button onClick={handleFilter} isLoading={loading}>Terapkan Filter</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Tanam/Panen</th>
                <th className="px-4 py-3 font-medium">Komoditas</th>
                <th className="px-4 py-3 font-medium">Petani</th>
                <th className="px-4 py-3 font-medium text-right">Luas Lahan (Ha)</th>
                <th className="px-4 py-3 font-medium text-right">Produksi</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((item: any) => (
                  <tr key={item.id_produksi} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div>Tanam: {item.tanggal_tanam ? new Date(item.tanggal_tanam).toLocaleDateString('id-ID') : '-'}</div>
                      <div className="text-gray-500">Panen: {item.tanggal_panen ? new Date(item.tanggal_panen).toLocaleDateString('id-ID') : '-'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1B5E20]">
                      {item.komoditas?.nama_komoditas}
                    </td>
                    <td className="px-4 py-3">
                      <div>{item.lahan?.petani?.nama_lengkap}</div>
                      <div className="text-xs text-gray-500">{item.lahan?.desa?.nama_desa}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>Tanam: {item.luas_tanam}</div>
                      <div className="text-xs text-gray-500">Panen: {item.luas_panen || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.jumlah_produksi ? (
                        <>
                          <div className="font-medium">{item.jumlah_produksi} {item.komoditas?.satuan}</div>
                          <div className="text-xs text-gray-500">{(item.produktivitas || 0).toFixed(2)}/Ha</div>
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status_produksi.includes('VERIFIED') ? 'success' : 'gray'}>
                        {item.status_produksi}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data produksi untuk filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
