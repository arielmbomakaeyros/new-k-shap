'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-border flex-shrink-0',
        className
      )}
    >
      {typeof children === 'string' ? (
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {children}
        </h2>
      ) : (
        children
      )}
    </div>
  );
}

export interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
    >
      {children}
    </h2>
  );
}

export interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetDescription({ children, className }: SheetDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground mt-1.5', className)}>
      {children}
    </p>
  );
}
