import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || React.useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs text-[#9090A8] mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 bg-[#0A0A0F] border rounded-lg text-[#F8F8FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-colors',
          error ? 'border-[#EF4444]' : 'border-[#2A2A3E] hover:border-[#7C3AED]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-[#9090A8]">{helperText}</p>}
    </div>
  );
}
