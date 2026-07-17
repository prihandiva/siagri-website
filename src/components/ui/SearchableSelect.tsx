import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SearchableSelectProps {
  label?: string;
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  error,
  required,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-2 relative" ref={wrapperRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`
          flex items-center justify-between w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 
          cursor-pointer transition-all duration-200 shadow-sm
          ${error ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-[#1B5E20] border-transparent' : ''}
        `}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm('');
        }}
      >
        <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1B5E20] focus:bg-white transition-colors"
              placeholder="Ketik untuk mencari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-500 text-center">Data tidak ditemukan</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`
                    px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between
                    ${opt.value === value ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}
                  `}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                  {opt.value === value && <Check className="w-4 h-4 text-green-600" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
