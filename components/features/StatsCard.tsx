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
  blue: 'border-l-primary-500',
  green: 'border-l-green-500',
  red: 'border-l-red-500',
  yellow: 'border-l-yellow-500',
  purple: 'border-l-purple-500',
};

const iconBgMap: Record<string, string> = {
  blue: 'bg-primary-50 text-primary-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600',
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
        bg-white rounded-xl shadow-sm border border-slate-200 p-6
        border-l-4 ${borderColorMap[color]}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div
            className={`p-3 rounded-full flex-shrink-0 ${iconBgMap[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
