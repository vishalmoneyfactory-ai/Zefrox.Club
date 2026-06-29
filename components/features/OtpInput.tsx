'use client';

import React, { useEffect, useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export default function OtpInput({
  length = 6,
  onComplete,
  disabled = false,
}: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);

    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all filled
    if (digit && newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (values[index] === '' && index > 0) {
        // Move to previous input and clear it
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData.length === 0) return;

    const newValues = [...values];
    for (let i = 0; i < pastedData.length; i++) {
      newValues[i] = pastedData[i];
    }
    setValues(newValues);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newValues.findIndex((v) => v === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
      onComplete(newValues.join(''));
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`
            w-12 h-14 text-center text-2xl font-bold
            border-2 rounded-lg outline-none transition-all duration-200
            ${
              disabled
                ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                : 'border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-slate-900'
            }
          `}
        />
      ))}
    </div>
  );
}
