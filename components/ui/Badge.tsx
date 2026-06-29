import React from 'react';

interface BadgeProps {
  variant: 'pending' | 'approved' | 'rejected' | 'proof-uploaded';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  'proof-uploaded': 'bg-blue-100 text-blue-800',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        text-xs font-semibold px-2.5 py-0.5
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
