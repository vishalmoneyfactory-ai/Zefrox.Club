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
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        glass
          ? 'bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_rgba(99,102,241,0.08),0_1px_4px_rgba(0,0,0,0.04)]'
          : 'bg-white border border-slate-200 shadow-sm',
        hover && 'hover:border-indigo-300/60 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] cursor-pointer',
        glow && 'shadow-[0_0_24px_rgba(99,102,241,0.15)] border-indigo-300/40',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children as React.ReactNode}
    </motion.div>
  );
}
