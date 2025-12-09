'use client';

import { ReactNode } from 'react';

interface MicroInteractionsProps {
  children: ReactNode;
  type?: 'hover' | 'click' | 'pulse' | 'glow';
  className?: string;
}

export default function MicroInteractions({ 
  children, 
  type = 'hover',
  className = '' 
}: MicroInteractionsProps) {
  const baseClasses = 'transition-all duration-300';
  
  const typeClasses = {
    hover: 'hover:scale-105 hover:shadow-lg',
    click: 'active:scale-95',
    pulse: 'animate-pulse-slow',
    glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      {children}
    </div>
  );
}

