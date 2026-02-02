'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-border',
        'flex items-center justify-end gap-2',
        className
      )}
    >
      {children}
    </div>
  );
}
