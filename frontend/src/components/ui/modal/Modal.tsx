'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useFocusTrap, useBodyScrollLock } from './useFocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] max-h-[90vh]',
};

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
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

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
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

      {/* Modal Content */}
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-background rounded-lg shadow-xl',
          'animate-in zoom-in-95 duration-200',
          sizeClasses[size],
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
              'transition-opacity'
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
  return createPortal(modalContent, document.body);
}
