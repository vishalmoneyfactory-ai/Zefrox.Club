'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-slate-300 ml-1 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3 bg-[#111827]/60 rounded-xl border text-sm text-white
            transition-all duration-200
            placeholder:text-slate-500
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/50'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-400 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
