import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  onClick?: () => void;
}

const borderColorMap: Record<string, string> = {
  blue: 'border-l-blue-400',
  green: 'border-l-emerald-400',
  red: 'border-l-red-400',
  yellow: 'border-l-amber-400',
  purple: 'border-l-purple-400',
};

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
};

const glowMap: Record<string, string> = {
  blue: 'group-hover:shadow-[0_8px_24px_rgba(96,165,250,0.18)]',
  green: 'group-hover:shadow-[0_8px_24px_rgba(52,211,153,0.18)]',
  red: 'group-hover:shadow-[0_8px_24px_rgba(248,113,113,0.18)]',
  yellow: 'group-hover:shadow-[0_8px_24px_rgba(251,191,36,0.18)]',
  purple: 'group-hover:shadow-[0_8px_24px_rgba(192,132,252,0.18)]',
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  onClick,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/90 border border-slate-200 rounded-xl p-5 group shadow-md
        border-l-4 ${borderColorMap[color]} ${glowMap[color]}
        ${onClick ? 'cursor-pointer transition-all duration-300 transform hover:-translate-y-1' : 'transition-all duration-300'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500">{title}</p>
          <p className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm font-medium text-slate-400 mt-2">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div
            className={`p-3 rounded-xl flex-shrink-0 border border-slate-100 ${iconBgMap[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
