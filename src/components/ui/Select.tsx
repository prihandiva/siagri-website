import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 shadow-sm
            ${error ? 'border-red-300 focus:ring-red-500' : 'focus:ring-[#1B5E20] hover:border-gray-400'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
