'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';

interface WilayahSelectorProps {
  onDesaChange?: (id: string) => void;
  onDusunChange?: (id: string) => void;
  onRwChange?: (id: string) => void;
  onRtChange?: (id: string) => void;
  initialValues?: {
    id_desa?: string;
    id_dusun?: string;
    id_rw?: string;
    id_rt?: string;
  };
  showDusun?: boolean;
  showRw?: boolean;
  showRt?: boolean;
}

export function WilayahSelector({ 
  onDesaChange, 
  onDusunChange,
  onRwChange,
  onRtChange,
  initialValues,
  showDusun = true,
  showRw = true,
  showRt = true
}: WilayahSelectorProps) {
  const [provinsiId, setProvinsiId] = useState('');
  const [kabupatenId, setKabupatenId] = useState('');
  const [kecamatanId, setKecamatanId] = useState('');
  const [desaId, setDesaId] = useState(initialValues?.id_desa || '');
  const [dusunId, setDusunId] = useState(initialValues?.id_dusun || '');
  const [rwId, setRwId] = useState(initialValues?.id_rw || '');
  const [rtId, setRtId] = useState(initialValues?.id_rt || '');

  const [provinsiOpts, setProvinsiOpts] = useState([]);
  const [kabupatenOpts, setKabupatenOpts] = useState([]);
  const [kecamatanOpts, setKecamatanOpts] = useState([]);
  const [desaOpts, setDesaOpts] = useState([]);
  const [dusunOpts, setDusunOpts] = useState([]);
  const [rwOpts, setRwOpts] = useState([]);
  const [rtOpts, setRtOpts] = useState([]);

  // Init Provinsi
  useEffect(() => {
    fetch('/api/wilayah?type=provinsi').then(res => res.json()).then(data => {
      setProvinsiOpts(data.map((d: any) => ({ label: d.nama_provinsi, value: d.id_provinsi.toString() })));
    });
  }, []);

  // Effect Cascade
  useEffect(() => {
    if (provinsiId) {
      fetch(`/api/wilayah?type=kabupaten&id_provinsi=${provinsiId}`).then(res => res.json()).then(data => {
        setKabupatenOpts(data.map((d: any) => ({ label: d.nama_kabupaten, value: d.id_kabupaten.toString() })));
      });
    } else {
      setKabupatenOpts([]); setKabupatenId('');
    }
  }, [provinsiId]);

  useEffect(() => {
    if (kabupatenId) {
      fetch(`/api/wilayah?type=kecamatan&id_kabupaten=${kabupatenId}`).then(res => res.json()).then(data => {
        setKecamatanOpts(data.map((d: any) => ({ label: d.nama_kecamatan, value: d.id_kecamatan.toString() })));
      });
    } else {
      setKecamatanOpts([]); setKecamatanId('');
    }
  }, [kabupatenId]);

  useEffect(() => {
    if (kecamatanId) {
      fetch(`/api/wilayah?type=desa&id_kecamatan=${kecamatanId}`).then(res => res.json()).then(data => {
        setDesaOpts(data.map((d: any) => ({ label: d.nama_desa, value: d.id_desa.toString() })));
      });
    } else {
      setDesaOpts([]); setDesaId('');
    }
  }, [kecamatanId]);

  useEffect(() => {
    if (desaId) {
      fetch(`/api/wilayah?type=dusun&id_desa=${desaId}`).then(res => res.json()).then(data => {
        setDusunOpts(data.map((d: any) => ({ label: d.nama_dusun, value: d.id_dusun.toString() })));
      });
      if(onDesaChange) onDesaChange(desaId);
    } else {
      setDusunOpts([]); setDusunId('');
      if(onDesaChange) onDesaChange('');
    }
  }, [desaId, onDesaChange]);

  useEffect(() => {
    if (dusunId) {
      fetch(`/api/wilayah?type=rw&id_dusun=${dusunId}`).then(res => res.json()).then(data => {
        setRwOpts(data.map((d: any) => ({ label: d.nama_rw, value: d.id_rw.toString() })));
      });
      if(onDusunChange) onDusunChange(dusunId);
    } else {
      setRwOpts([]); setRwId('');
      if(onDusunChange) onDusunChange('');
    }
  }, [dusunId, onDusunChange]);

  useEffect(() => {
    if (rwId) {
      fetch(`/api/wilayah?type=rt&id_rw=${rwId}`).then(res => res.json()).then(data => {
        setRtOpts(data.map((d: any) => ({ label: d.nama_rt, value: d.id_rt.toString() })));
      });
      if(onRwChange) onRwChange(rwId);
    } else {
      setRtOpts([]); setRtId('');
      if(onRwChange) onRwChange('');
    }
  }, [rwId, onRwChange]);

  useEffect(() => {
    if (onRtChange) onRtChange(rtId);
  }, [rtId, onRtChange]);


  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 border-b pb-2">Filter Wilayah Lahan</h3>
      <div className="grid grid-cols-2 gap-4">
        <Select 
          label="Provinsi" 
          options={[{label: '-- Pilih Provinsi --', value: ''}, ...provinsiOpts]} 
          value={provinsiId} 
          onChange={(e) => setProvinsiId(e.target.value)} 
        />
        <Select 
          label="Kabupaten" 
          options={[{label: '-- Pilih Kabupaten --', value: ''}, ...kabupatenOpts]} 
          value={kabupatenId} 
          onChange={(e) => setKabupatenId(e.target.value)} 
          disabled={!provinsiId}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select 
          label="Kecamatan" 
          options={[{label: '-- Pilih Kecamatan --', value: ''}, ...kecamatanOpts]} 
          value={kecamatanId} 
          onChange={(e) => setKecamatanId(e.target.value)} 
          disabled={!kabupatenId}
        />
        <Select 
          label="Desa" 
          options={[{label: '-- Pilih Desa --', value: ''}, ...desaOpts]} 
          value={desaId} 
          onChange={(e) => setDesaId(e.target.value)} 
          disabled={!kecamatanId}
        />
      </div>
      {(showDusun || showRw || showRt) && (
        <div className="grid grid-cols-3 gap-4">
          {showDusun && (
            <Select 
              label="Dusun" 
              options={[{label: '-- Pilih Dusun --', value: ''}, ...dusunOpts]} 
              value={dusunId} 
              onChange={(e) => setDusunId(e.target.value)} 
              disabled={!desaId}
            />
          )}
          {showRw && (
            <Select 
              label="RW" 
              options={[{label: '-- Pilih RW --', value: ''}, ...rwOpts]} 
              value={rwId} 
              onChange={(e) => setRwId(e.target.value)} 
              disabled={!dusunId}
            />
          )}
          {showRt && (
            <Select 
              label="RT" 
              options={[{label: '-- Pilih RT --', value: ''}, ...rtOpts]} 
              value={rtId} 
              onChange={(e) => setRtId(e.target.value)} 
              disabled={!rwId}
            />
          )}
        </div>
      )}
    </div>
  );
}
