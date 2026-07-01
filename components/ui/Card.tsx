'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  glow?: boolean;
}

export default function Card({
  children,
  className = '',
  onClick,
  hover = false,
  glass = true,
  glow = false,
  ...props
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -5, scale: 1.01 } : undefined}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        glass ? 'glass-card' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
        hover && 'hover:border-primary-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
        glow && 'shadow-[0_0_15px_rgba(59,130,246,0.1)] border-blue-500/20 dark:shadow-[0_0_15px_rgba(34,211,238,0.1)] dark:border-aurora-cyan/20',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children as React.ReactNode}
    </motion.div>
  );
}
