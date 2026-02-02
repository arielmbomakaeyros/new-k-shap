'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-border',
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

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalTitle({ children, className }: ModalTitleProps) {
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

export interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground mt-1.5', className)}>
      {children}
    </p>
  );
}
