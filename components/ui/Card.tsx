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
        'rounded-[2rem] p-6 transition-all duration-300',
        glass ? 'bg-[#0b1221]/80 backdrop-blur-2xl border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]' : 'bg-[#060a14] border border-white/10',
        hover && 'hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:bg-[#0b1221]',
        glow && 'shadow-[0_0_20px_rgba(59,130,246,0.15)] border-blue-500/30',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children as React.ReactNode}
    </motion.div>
  );
}
