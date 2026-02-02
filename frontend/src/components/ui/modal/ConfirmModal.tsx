'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Modal } from './Modal';
import { ModalHeader, ModalTitle, ModalDescription } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning';
  isLoading?: boolean;
}

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>

      <ModalBody>
        <p className="text-sm text-muted-foreground">{message}</p>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md',
            'border border-input bg-background hover:bg-accent',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            variantClasses[variant]
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            confirmLabel
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
