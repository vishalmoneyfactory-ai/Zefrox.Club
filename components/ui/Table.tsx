'use client';

import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export default function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 ${className}`}>
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white [&>tr:nth-child(even)]:bg-slate-50/50">
          {children}
        </tbody>
      </table>
    </div>
  );
}
