'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useFocusTrap, useBodyScrollLock } from '../modal/useFocusTrap';

export type SheetPosition = 'left' | 'right' | 'top' | 'bottom';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: SheetPosition;
  className?: string;
  overlayClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const positionClasses: Record<SheetPosition, string> = {
  left: 'inset-y-0 left-0',
  right: 'inset-y-0 right-0',
  top: 'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
};

const animationClasses: Record<SheetPosition, { enter: string; leave: string }> = {
  left: {
    enter: 'animate-in slide-in-from-left duration-300',
    leave: 'animate-out slide-out-to-left duration-200',
  },
  right: {
    enter: 'animate-in slide-in-from-right duration-300',
    leave: 'animate-out slide-out-to-right duration-200',
  },
  top: {
    enter: 'animate-in slide-in-from-top duration-300',
    leave: 'animate-out slide-out-to-top duration-200',
  },
  bottom: {
    enter: 'animate-in slide-in-from-bottom duration-300',
    leave: 'animate-out slide-out-to-bottom duration-200',
  },
};

const sizeClasses: Record<SheetPosition, Record<string, string>> = {
  left: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[480px]',
    full: 'w-screen',
  },
  right: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[480px]',
    full: 'w-screen',
  },
  top: {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-80',
    full: 'h-screen',
  },
  bottom: {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-80',
    full: 'h-screen',
  },
};

export function Sheet({
  isOpen,
  onClose,
  children,
  position = 'right',
  className,
  overlayClassName,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: SheetProps) {
  const focusTrapRef = useFocusTrap(isOpen);
  useBodyScrollLock(isOpen);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sheetContent = (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'animate-in fade-in duration-200',
        overlayClassName
      )}
      onClick={handleOverlayClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed bg-background shadow-xl flex flex-col',
          positionClasses[position],
          animationClasses[position].enter,
          sizeClasses[position][size],
          className
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'absolute right-4 top-4 p-1 rounded-sm opacity-70',
              'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring',
              'transition-opacity z-10'
            )}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  // Render in portal
  if (typeof window === 'undefined') return null;
  return createPortal(sheetContent, document.body);
}
