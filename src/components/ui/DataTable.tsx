import React from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Download, Upload } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  onAdd?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  title,
  description,
  onAdd,
  onImport,
  onExport,
  searchPlaceholder = 'Cari data...',
  searchTerm,
  onSearchChange,
  isLoading
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col w-full overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            {title && <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-3">
            {onImport && (
              <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />} onClick={onImport}>
                Import
              </Button>
            )}
            {onExport && (
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={onExport}>
                Export
              </Button>
            )}
            {onAdd && (
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={onAdd}>
                Tambah
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="w-full max-w-sm">
            {onSearchChange && (
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            )}
          </div>
          {/* Slot for additional filters can go here */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wider">
              <th className="px-6 py-4 w-12 text-center">No</th>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-100/80">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-[#1B5E20] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-500">{rowIdx + 1}</td>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Dumb Component for now, can be wired later) */}
      {!isLoading && data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-sm text-gray-600">
          <div>Menampilkan <span className="font-semibold text-gray-900">{data.length}</span> data</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
