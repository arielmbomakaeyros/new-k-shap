'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  htmlFor,
  children,
  className,
  required,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error ? 'text-destructive' : 'text-foreground'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
};