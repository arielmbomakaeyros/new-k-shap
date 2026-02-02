'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, value, onChange, ...props }, ref) => {
    return (
      <div
        className={cn('grid gap-2', className)}
        ref={ref}
        {...props}
        role="radiogroup"
        onChange={(e) => {
          if (onChange) {
            onChange((e.target as HTMLInputElement).value);
          }
        }}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                checked: (child.props as any).value === value,
              })
            : child
        )}
      </div>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };

export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className, ...props }, ref) => {
  return (
    <input
      type="radio"
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroupItem };