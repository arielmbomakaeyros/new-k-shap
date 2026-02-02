'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 overflow-y-auto',
        'max-h-[60vh]',
        className
      )}
    >
      {children}
    </div>
  );
}
