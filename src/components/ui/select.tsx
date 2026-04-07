import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  className,
}: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-[#9090A8] mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-colors appearance-none cursor-pointer',
          className
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
