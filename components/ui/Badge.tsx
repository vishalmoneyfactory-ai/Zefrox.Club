import React from 'react';

interface BadgeProps {
  variant: 'pending' | 'approved' | 'rejected' | 'proof-uploaded';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-inner',
  approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-inner',
  'proof-uploaded': 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        text-xs font-bold px-3 py-1 tracking-wide uppercase
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
