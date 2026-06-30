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
  blue: 'border-l-blue-400 border-t-white/5 border-r-white/5 border-b-white/5',
  green: 'border-l-green-400 border-t-white/5 border-r-white/5 border-b-white/5',
  red: 'border-l-red-400 border-t-white/5 border-r-white/5 border-b-white/5',
  yellow: 'border-l-yellow-400 border-t-white/5 border-r-white/5 border-b-white/5',
  purple: 'border-l-purple-400 border-t-white/5 border-r-white/5 border-b-white/5',
};

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400',
  green: 'bg-green-500/10 text-green-400',
  red: 'bg-red-500/10 text-red-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  purple: 'bg-purple-500/10 text-purple-400',
};

const glowMap: Record<string, string> = {
  blue: 'group-hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]',
  green: 'group-hover:shadow-[0_0_20px_rgba(74,222,128,0.15)]',
  red: 'group-hover:shadow-[0_0_20px_rgba(248,113,113,0.15)]',
  yellow: 'group-hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]',
  purple: 'group-hover:shadow-[0_0_20px_rgba(192,132,252,0.15)]',
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
        bg-slate-900/60 backdrop-blur-md rounded-xl p-6 group
        border-l-4 ${borderColorMap[color]} ${glowMap[color]}
        ${onClick ? 'cursor-pointer transition-all duration-300 transform hover:-translate-y-1' : 'transition-all duration-300'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400">{title}</p>
          <p className="text-3xl font-black text-white mt-2 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div
            className={`p-3 rounded-xl flex-shrink-0 border border-white/5 ${iconBgMap[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
