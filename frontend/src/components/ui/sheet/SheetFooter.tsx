'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetFooter({ children, className }: SheetFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-border flex-shrink-0',
        'flex items-center justify-end gap-2',
        className
      )}
    >
      {children}
    </div>
  );
}
