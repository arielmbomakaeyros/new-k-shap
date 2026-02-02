'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetBody({ children, className }: SheetBodyProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 flex-1 overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  );
}
