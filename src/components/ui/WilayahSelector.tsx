'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';

interface WilayahSelectorProps {
  onDesaChange?: (id: string) => void;
  initialValues?: {
    id_desa?: string;
  };
  label?: string;
  isEdit?: boolean;
}

export function WilayahSelector({
  onDesaChange,
  initialValues,
  label = 'Wilayah',
  isEdit = false,
}: WilayahSelectorProps) {
  const [provinsiId, setProvinsiId] = useState('');
  const [kabupatenId, setKabupatenId] = useState('');
  const [kecamatanId, setKecamatanId] = useState('');
  const [desaId, setDesaId] = useState(initialValues?.id_desa || '');

  const [provinsiOpts, setProvinsiOpts] = useState<{ label: string; value: string }[]>([]);
  const [kabupatenOpts, setKabupatenOpts] = useState<{ label: string; value: string }[]>([]);
  const [kecamatanOpts, setKecamatanOpts] = useState<{ label: string; value: string }[]>([]);
  const [desaOpts, setDesaOpts] = useState<{ label: string; value: string }[]>([]);

  const [isInitializing, setIsInitializing] = useState(!!initialValues?.id_desa);

  // Fetch Hierarchy if initialValues.id_desa is provided
  useEffect(() => {
    if (initialValues?.id_desa) {
      setIsInitializing(true);
      fetch(`/api/wilayah?type=hierarchy&id_desa=${initialValues.id_desa}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setProvinsiId(data.id_provinsi?.toString() || '');
            setKabupatenId(data.id_kabupaten?.toString() || '');
            setKecamatanId(data.id_kecamatan?.toString() || '');
            setDesaId(data.id_desa?.toString() || '');
          }
          setIsInitializing(false);
        })
        .catch(() => setIsInitializing(false));
    }
  }, [initialValues?.id_desa]);

  // Init Provinsi
  useEffect(() => {
    fetch('/api/wilayah?type=provinsi')
      .then(res => res.json())
      .then(data => {
        setProvinsiOpts(data.map((d: any) => ({ label: d.nama_provinsi, value: d.id_provinsi.toString() })));
      });
  }, []);

  useEffect(() => {
    if (provinsiId) {
      fetch(`/api/wilayah?type=kabupaten&id_provinsi=${provinsiId}`)
        .then(res => res.json())
        .then(data => {
          setKabupatenOpts(data.map((d: any) => ({ label: d.nama_kabupaten, value: d.id_kabupaten.toString() })));
        });
    } else if (!isInitializing) {
      setKabupatenOpts([]); setKabupatenId('');
    }
  }, [provinsiId, isInitializing]);

  useEffect(() => {
    if (kabupatenId) {
      fetch(`/api/wilayah?type=kecamatan&id_kabupaten=${kabupatenId}`)
        .then(res => res.json())
        .then(data => {
          setKecamatanOpts(data.map((d: any) => ({ label: d.nama_kecamatan, value: d.id_kecamatan.toString() })));
        });
    } else if (!isInitializing) {
      setKecamatanOpts([]); setKecamatanId('');
    }
  }, [kabupatenId, isInitializing]);

  useEffect(() => {
    if (kecamatanId) {
      fetch(`/api/wilayah?type=desa&id_kecamatan=${kecamatanId}`)
        .then(res => res.json())
        .then(data => {
          setDesaOpts(data.map((d: any) => ({ label: d.nama_desa, value: d.id_desa.toString() })));
        });
    } else if (!isInitializing) {
      setDesaOpts([]); setDesaId('');
    }
  }, [kecamatanId, isInitializing]);

  useEffect(() => {
    if (onDesaChange && !isInitializing) onDesaChange(desaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desaId, isInitializing]);

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 border-b pb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Provinsi"
          options={[{ label: '-- Pilih Provinsi --', value: '' }, ...provinsiOpts]}
          value={provinsiId}
          onChange={e => {
            setProvinsiId(e.target.value);
            if (!isEdit) { setKabupatenId(''); setKecamatanId(''); setDesaId(''); }
          }}
          disabled={isEdit}
        />
        <Select
          label="Kabupaten / Kota"
          options={[{ label: '-- Pilih Kabupaten --', value: '' }, ...kabupatenOpts]}
          value={kabupatenId}
          onChange={e => {
            setKabupatenId(e.target.value);
            if (!isEdit) { setKecamatanId(''); setDesaId(''); }
          }}
          disabled={!provinsiId || isEdit}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Kecamatan"
          options={[{ label: '-- Pilih Kecamatan --', value: '' }, ...kecamatanOpts]}
          value={kecamatanId}
          onChange={e => {
            setKecamatanId(e.target.value);
            if (!isEdit) { setDesaId(''); }
          }}
          disabled={!kabupatenId || isEdit}
        />
        <Select
          label="Desa / Kelurahan"
          options={[{ label: '-- Pilih Desa --', value: '' }, ...desaOpts]}
          value={desaId}
          onChange={e => setDesaId(e.target.value)}
          disabled={!kecamatanId || isEdit}
        />
      </div>
    </div>
  );
}
