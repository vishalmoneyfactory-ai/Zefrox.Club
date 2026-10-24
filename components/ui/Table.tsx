'use client';

import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export default function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-[1.5rem] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] bg-[#0b1221]/80 backdrop-blur-2xl ${className}`}>
      <table className="w-full text-sm text-left">
        <thead className="bg-[#111827]/80 border-b border-white/5">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="text-left text-xs uppercase text-slate-400 font-semibold px-6 py-4 tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-transparent [&>tr:nth-child(even)]:bg-[#111827]/40 text-slate-300">
          {children}
        </tbody>
      </table>
    </div>
  );
}
