'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';

interface MapPickerProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  onChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export function MapPicker({ latitude, longitude, onChange, readOnly = false }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [latInput, setLatInput] = useState(latitude ? String(latitude) : '');
  const [lngInput, setLngInput] = useState(longitude ? String(longitude) : '');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const defaultLat = latitude ? parseFloat(String(latitude)) : -2.548926;
  const defaultLng = longitude ? parseFloat(String(longitude)) : 118.0148634;

  // Dynamically load Leaflet CSS + JS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.L) { setLeafletLoaded(true); return; }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);

    return () => {
      // cleanup not strictly needed
    };
  }, []);

  // Init map after leaflet loaded
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    if (mapInstanceRef.current) return; // already init

    const L = window.L;

    // Fix default icon
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, { zoomControl: true }).setView([defaultLat, defaultLng], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom green icon for lahan
    const greenIcon = L.divIcon({
      html: `<div style="width:28px;height:28px;background:#1B5E20;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      className: ''
    });

    const marker = L.marker([defaultLat, defaultLng], {
      draggable: !readOnly,
      icon: greenIcon,
    }).addTo(map);
    markerRef.current = marker;

    if (!readOnly) {
      marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        const lat = parseFloat(pos.lat.toFixed(8));
        const lng = parseFloat(pos.lng.toFixed(8));
        setLatInput(String(lat));
        setLngInput(String(lng));
        onChange(lat, lng);
      });

      map.on('click', (e: any) => {
        const lat = parseFloat(e.latlng.lat.toFixed(8));
        const lng = parseFloat(e.latlng.lng.toFixed(8));
        marker.setLatLng([lat, lng]);
        setLatInput(String(lat));
        setLngInput(String(lng));
        onChange(lat, lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded]);

  // Sync external lat/lng changes to marker
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const lat = latitude ? parseFloat(String(latitude)) : null;
    const lng = longitude ? parseFloat(String(longitude)) : null;
    if (lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 14);
      setLatInput(String(lat));
      setLngInput(String(lng));
    }
  }, [latitude, longitude]);

  const handleManualInput = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) return;
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 15);
    }
    onChange(lat, lng);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(8));
      const lng = parseFloat(pos.coords.longitude.toFixed(8));
      if (markerRef.current && mapInstanceRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 15);
      }
      setLatInput(String(lat));
      setLngInput(String(lng));
      onChange(lat, lng);
    });
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        setLatInput(String(lat));
        setLngInput(String(lng));
        onChange(lat, lng);
      } else {
        alert("Lokasi tidak ditemukan");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mencari lokasi");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchLocation();
              }
            }}
            placeholder="Cari nama daerah / lokasi..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
          />
          <button
            type="button"
            onClick={handleSearchLocation}
            disabled={isSearching}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Search size={16} />
            {isSearching ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{ height: '280px', width: '100%', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', zIndex: 0, position: 'relative' }}
      >
        {!leafletLoaded && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f9fafb', color: '#6b7280', fontSize: '14px' }}>
            <MapPin size={18} style={{ marginRight: 8 }} /> Memuat peta...
          </div>
        )}
      </div>

      {!readOnly && (
        <>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin size={12} className="text-green-700" />
            Klik pada peta atau geser marker untuk menentukan titik lahan
          </p>
          {/* Manual Coordinate Input */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 block mb-1">Latitude</label>
              <input
                type="number"
                step="0.00000001"
                value={latInput}
                onChange={e => setLatInput(e.target.value)}
                placeholder="-6.12345678"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 block mb-1">Longitude</label>
              <input
                type="number"
                step="0.00000001"
                value={lngInput}
                onChange={e => setLngInput(e.target.value)}
                placeholder="106.87654321"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
              />
            </div>
            <button
              type="button"
              onClick={handleManualInput}
              className="px-3 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors whitespace-nowrap"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={handleLocateMe}
              title="Gunakan lokasi saat ini"
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Navigation size={14} />
            </button>
          </div>
        </>
      )}

      {readOnly && latitude && longitude && (
        <div className="flex gap-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div><span className="font-medium">Latitude:</span> {latitude}</div>
          <div><span className="font-medium">Longitude:</span> {longitude}</div>
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-blue-600 hover:underline text-xs"
          >
            Buka di Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
}
